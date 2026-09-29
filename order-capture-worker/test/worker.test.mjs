import assert from 'node:assert/strict';
import test from 'node:test';

import worker, { handleRequest } from '../src/worker.mjs';

class MockD1 {
  constructor() {
    this.records = new Map();
  }

  prepare(sql) {
    return new MockStatement(this, sql);
  }
}

class MockStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql.replace(/\s+/g, ' ').trim();
    this.args = [];
  }

  bind(...args) {
    this.args = args;
    return this;
  }

  async run() {
    if (this.sql.startsWith('INSERT OR IGNORE')) {
      const [
        orderId, capturedAt, requestedAt, customerName, customerEmail,
        customerPhone, shippingAddress, totalCents, itemCount, payloadJson,
        sourceOrigin
      ] = this.args;
      if (this.db.records.has(orderId)) return { meta: { changes: 0 } };
      this.db.records.set(orderId, {
        order_id: orderId,
        captured_at: capturedAt,
        requested_at: requestedAt,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        total_cents: totalCents,
        item_count: itemCount,
        payload_json: payloadJson,
        source_origin: sourceOrigin,
        merchant_notification_status: 'pending',
        customer_notification_status: 'pending',
        merchant_notification_attempts: 0,
        customer_notification_attempts: 0,
        merchant_notification_error: '',
        customer_notification_error: ''
      });
      return { meta: { changes: 1 } };
    }

    if (this.sql.startsWith('UPDATE order_requests')) {
      const [status, error, orderId] = this.args;
      const record = this.db.records.get(orderId);
      if (!record) return { meta: { changes: 0 } };
      const merchant = this.sql.includes('merchant_notification_status = ?');
      const prefix = merchant ? 'merchant' : 'customer';
      record[`${prefix}_notification_status`] = status;
      record[`${prefix}_notification_attempts`] += 1;
      record[`${prefix}_notification_error`] = error;
      return { meta: { changes: 1 } };
    }

    throw new Error(`Unhandled run SQL: ${this.sql}`);
  }

  async first() {
    if (this.sql.includes('WHERE order_id = ?')) {
      const record = this.db.records.get(this.args[0]);
      if (!record) return null;
      return {
        payload_json: record.payload_json,
        merchant_notification_status: record.merchant_notification_status,
        customer_notification_status: record.customer_notification_status
      };
    }
    throw new Error(`Unhandled first SQL: ${this.sql}`);
  }

  async all() {
    const records = [...this.db.records.values()];
    if (this.sql.includes('ORDER BY captured_at DESC')) {
      const limit = this.args[0] || 50;
      return { results: records.slice().reverse().slice(0, limit) };
    }
    if (this.sql.includes('merchant_notification_attempts < ?')) {
      return {
        results: records.filter((record) => (
          record.merchant_notification_attempts < this.args[0]
            && ['pending', 'failed', 'configuration_required'].includes(record.merchant_notification_status)
        ) || (
          record.customer_notification_attempts < this.args[1]
            && ['pending', 'failed', 'configuration_required'].includes(record.customer_notification_status)
        ))
      };
    }
    throw new Error(`Unhandled all SQL: ${this.sql}`);
  }
}

function context() {
  const tasks = [];
  return {
    waitUntil(task) {
      tasks.push(task);
    },
    async flush() {
      await Promise.all(tasks);
    }
  };
}

function environment(overrides = {}) {
  return {
    ENVIRONMENT: 'staging',
    ALLOWED_ORIGINS: 'https://staging.jonezielabs.com,http://127.0.0.1:8012',
    ADMIN_EMAILS: 'orders@jonezielabs.com,jonezielabs@gmail.com',
    NOTIFICATION_FROM: 'Jonezie Labs Staging <orders@updates.jonezielabs.com>',
    REPLY_TO_EMAIL: 'orders@jonezielabs.com',
    SEND_CUSTOMER_CONFIRMATION: 'true',
    RESEND_API_KEY: 'test-key',
    ADMIN_API_TOKEN: 'admin-test-token',
    ORDERS: new MockD1(),
    ...overrides
  };
}

function orderPayload(overrides = {}) {
  return {
    orderId: 'JL-20260929190000-TEST',
    requestedAt: '2026-09-29T19:00:00.000Z',
    invoiceFlow: 'Review and confirm order, then email a secure invoice link.',
    paymentNotice: 'Payment is required before shipment.',
    researchUseNotice: 'Laboratory research only.',
    customer: {
      firstName: 'Preview',
      lastName: 'Customer',
      name: 'Preview Customer',
      email: 'preview@example.com',
      phone: '(555) 555-0100',
      phoneDigits: '5555550100',
      shippingStreetAddress: '1 Research Way',
      shippingCity: 'Detroit',
      shippingState: 'MI',
      shippingZip: '48201',
      shippingAddress: '1 Research Way, Detroit, MI 48201'
    },
    promoCode: '',
    notes: 'Test request',
    shippingMethod: {
      id: 'usps-ground',
      label: 'USPS Ground Advantage',
      window: '2-5 business days',
      cost: 8,
      costDisplay: '$8.00'
    },
    totals: {
      itemCount: 1,
      subtotal: 23,
      subtotalDisplay: '$23.00',
      discount: 0,
      discountDisplay: '$0.00',
      shipping: 8,
      shippingDisplay: '$8.00',
      estimatedTotal: 31,
      estimatedTotalDisplay: '$31.00'
    },
    items: [{
      slug: '5-amino-1mq',
      name: '5-Amino-1MQ',
      mgOption: '5mg',
      packLabel: 'Single Vial',
      quantity: 1,
      unitPrice: 23,
      unitPriceDisplay: '$23.00',
      lineTotal: 23,
      lineTotalDisplay: '$23.00'
    }],
    includedWithOrder: ['Free vial cap cover'],
    ...overrides
  };
}

function postRequest(payload, origin = 'https://staging.jonezielabs.com') {
  return new Request('https://orders-staging.example.workers.dev/api/order-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(payload)
  });
}

function successfulEmailFetch(calls) {
  return async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return new Response(JSON.stringify({ id: `email-${calls.length}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
}

test('stores an order before returning success and queues both notifications', async () => {
  const env = environment();
  const ctx = context();
  const emailCalls = [];
  const response = await handleRequest(postRequest(orderPayload()), env, ctx, successfulEmailFetch(emailCalls));
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.saved, true);
  assert.equal(result.duplicate, false);
  assert.equal(env.ORDERS.records.size, 1);

  await ctx.flush();
  const record = env.ORDERS.records.get(result.orderId);
  assert.equal(record.merchant_notification_status, 'sent');
  assert.equal(record.customer_notification_status, 'sent');
  assert.equal(emailCalls.length, 2);
  assert.match(emailCalls[0].body.subject, /Captured Jonezie order request/);
});

test('treats the order ID as an idempotency key and does not resend sent notifications', async () => {
  const env = environment();
  const emailCalls = [];
  const fetchImpl = successfulEmailFetch(emailCalls);

  const firstCtx = context();
  await handleRequest(postRequest(orderPayload()), env, firstCtx, fetchImpl);
  await firstCtx.flush();

  const retryCtx = context();
  const retryResponse = await handleRequest(postRequest(orderPayload()), env, retryCtx, fetchImpl);
  const retryResult = await retryResponse.json();
  await retryCtx.flush();

  assert.equal(retryResponse.status, 200);
  assert.equal(retryResult.duplicate, true);
  assert.equal(env.ORDERS.records.size, 1);
  assert.equal(emailCalls.length, 2);
});

test('rejects invalid orders without storing customer data', async () => {
  const env = environment();
  const ctx = context();
  const response = await handleRequest(postRequest(orderPayload({ items: [] })), env, ctx, successfulEmailFetch([]));
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.ok, false);
  assert.equal(env.ORDERS.records.size, 0);
});

test('rejects unapproved browser origins', async () => {
  const env = environment();
  const response = await handleRequest(
    postRequest(orderPayload(), 'https://malicious.example'),
    env,
    context(),
    successfulEmailFetch([])
  );

  assert.equal(response.status, 403);
  assert.equal(env.ORDERS.records.size, 0);
});

test('retains the order when merchant notification delivery fails', async () => {
  const env = environment();
  const ctx = context();
  let call = 0;
  const fetchImpl = async () => {
    call += 1;
    if (call === 1) return new Response('provider unavailable', { status: 503 });
    return new Response(JSON.stringify({ id: 'customer-email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const response = await handleRequest(postRequest(orderPayload()), env, ctx, fetchImpl);
  await ctx.flush();
  const record = env.ORDERS.records.get('JL-20260929190000-TEST');

  assert.equal(response.status, 201);
  assert.equal(record.merchant_notification_status, 'failed');
  assert.equal(record.customer_notification_status, 'sent');
  assert.match(record.merchant_notification_error, /503/);
  assert.equal(record.customer_notification_error, '');
});

test('scheduled retry delivers a previously failed merchant notification', async () => {
  const env = environment();
  const captureCtx = context();
  let call = 0;
  const initialFetch = async () => {
    call += 1;
    if (call === 1) return new Response('provider unavailable', { status: 503 });
    return new Response(JSON.stringify({ id: 'customer-email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  await handleRequest(postRequest(orderPayload()), env, captureCtx, initialFetch);
  await captureCtx.flush();
  assert.equal(env.ORDERS.records.get('JL-20260929190000-TEST').merchant_notification_status, 'failed');

  const originalFetch = globalThis.fetch;
  const retryCalls = [];
  globalThis.fetch = successfulEmailFetch(retryCalls);
  try {
    const retryCtx = context();
    worker.scheduled({}, env, retryCtx);
    await retryCtx.flush();
  } finally {
    globalThis.fetch = originalFetch;
  }

  const record = env.ORDERS.records.get('JL-20260929190000-TEST');
  assert.equal(record.merchant_notification_status, 'sent');
  assert.equal(record.customer_notification_status, 'sent');
  assert.equal(retryCalls.length, 1);
});

test('requires Turnstile configuration in production', async () => {
  const env = environment({ ENVIRONMENT: 'production', TURNSTILE_SECRET: '' });
  const response = await handleRequest(postRequest(orderPayload()), env, context(), successfulEmailFetch([]));

  assert.equal(response.status, 503);
  assert.equal(env.ORDERS.records.size, 0);
});

test('protects the admin order feed with a bearer token', async () => {
  const env = environment();
  const captureCtx = context();
  await handleRequest(postRequest(orderPayload()), env, captureCtx, successfulEmailFetch([]));
  await captureCtx.flush();

  const denied = await handleRequest(
    new Request('https://orders-staging.example.workers.dev/api/admin/order-requests'),
    env,
    context(),
    successfulEmailFetch([])
  );
  assert.equal(denied.status, 401);

  const allowed = await handleRequest(
    new Request('https://orders-staging.example.workers.dev/api/admin/order-requests', {
      headers: { Authorization: 'Bearer admin-test-token' }
    }),
    env,
    context(),
    successfulEmailFetch([])
  );
  const result = await allowed.json();
  assert.equal(allowed.status, 200);
  assert.equal(result.orders.length, 1);
  assert.equal(result.orders[0].payload.customer.email, 'preview@example.com');
});
