const MAX_BODY_BYTES = 200_000;
const MAX_NOTIFICATION_ATTEMPTS = 5;
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TURNSTILE_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function cleanText(value, maxLength = 500) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function requestOrigin(request) {
  return cleanText(request.headers.get('Origin'), 300);
}

function allowedOrigin(request, env) {
  const origin = requestOrigin(request);
  if (!origin) return '';
  return splitList(env.ALLOWED_ORIGINS).includes(origin) ? origin : null;
}

function responseHeaders(request, env) {
  const origin = allowedOrigin(request, env);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers.Vary = 'Origin';
  }

  return headers;
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request, env)
  });
}

function normalizeItem(item = {}) {
  const quantity = Math.max(1, Math.min(100, Number.parseInt(item.quantity || 1, 10) || 1));
  const unitPrice = Math.max(0, finiteNumber(item.unitPrice));

  return {
    slug: cleanText(item.slug, 120),
    name: cleanText(item.name, 160),
    code: cleanText(item.code, 80),
    mgOption: cleanText(item.mgOption, 80),
    packLabel: cleanText(item.packLabel, 120),
    quantity,
    inventoryStatus: cleanText(item.inventoryStatus, 80),
    backorderNote: cleanText(item.backorderNote, 500),
    unitPrice,
    unitPriceDisplay: cleanText(item.unitPriceDisplay, 40),
    lineTotal: Math.max(0, finiteNumber(item.lineTotal, unitPrice * quantity)),
    lineTotalDisplay: cleanText(item.lineTotalDisplay, 40)
  };
}

export function validateOrderPayload(input) {
  const errors = [];
  const payload = input && typeof input === 'object' ? input : {};
  const customer = payload.customer && typeof payload.customer === 'object' ? payload.customer : {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const orderId = cleanText(payload.orderId, 100);
  const email = cleanText(customer.email, 254);

  if (!/^JL-[A-Z0-9-]{8,80}$/i.test(orderId)) errors.push('Invalid order ID.');
  if (!cleanText(customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`, 200)) errors.push('Customer name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid customer email is required.');
  if (!cleanText(customer.phone || customer.phoneDigits, 40)) errors.push('Customer phone is required.');
  if (!cleanText(customer.shippingAddress, 500)) errors.push('Shipping address is required.');
  if (!items.length) errors.push('At least one order item is required.');
  if (items.length > 100) errors.push('Too many order items.');
  if (items.some((item) => !cleanText(item?.name, 160))) errors.push('Every item requires a name.');

  const estimatedTotal = finiteNumber(payload.totals?.estimatedTotal, Number.NaN);
  if (!Number.isFinite(estimatedTotal) || estimatedTotal < 0) errors.push('Valid estimated total is required.');

  return errors;
}

export function normalizeOrderPayload(input, origin = '') {
  const customer = input.customer || {};
  const items = input.items.map(normalizeItem);
  const customerName = cleanText(
    customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(' '),
    200
  );
  const normalized = {
    ...input,
    orderId: cleanText(input.orderId, 100),
    requestedAt: cleanText(input.requestedAt, 60) || new Date().toISOString(),
    invoiceFlow: cleanText(input.invoiceFlow, 500),
    paymentNotice: cleanText(input.paymentNotice, 1000),
    researchUseNotice: cleanText(input.researchUseNotice, 1000),
    customer: {
      firstName: cleanText(customer.firstName, 100),
      lastName: cleanText(customer.lastName, 100),
      name: customerName,
      email: cleanText(customer.email, 254).toLowerCase(),
      phone: cleanText(customer.phone || customer.phoneDigits, 40),
      phoneDigits: cleanText(customer.phoneDigits, 30),
      shippingStreetAddress: cleanText(customer.shippingStreetAddress, 200),
      shippingCity: cleanText(customer.shippingCity, 120),
      shippingState: cleanText(customer.shippingState, 40).toUpperCase(),
      shippingZip: cleanText(customer.shippingZip, 30),
      shippingAddress: cleanText(customer.shippingAddress, 500)
    },
    promoCode: cleanText(input.promoCode, 80),
    notes: cleanText(input.notes, 3000),
    shippingMethod: input.shippingMethod ? {
      id: cleanText(input.shippingMethod.id, 80),
      label: cleanText(input.shippingMethod.label, 160),
      window: cleanText(input.shippingMethod.window, 160),
      note: cleanText(input.shippingMethod.note, 500),
      cost: Math.max(0, finiteNumber(input.shippingMethod.cost)),
      costDisplay: cleanText(input.shippingMethod.costDisplay, 40)
    } : null,
    totals: {
      itemCount: Math.max(1, Number.parseInt(input.totals?.itemCount || 1, 10) || 1),
      subtotal: Math.max(0, finiteNumber(input.totals?.subtotal)),
      subtotalDisplay: cleanText(input.totals?.subtotalDisplay, 40),
      discount: Math.max(0, finiteNumber(input.totals?.discount)),
      discountDisplay: cleanText(input.totals?.discountDisplay, 40),
      shipping: Math.max(0, finiteNumber(input.totals?.shipping)),
      shippingDisplay: cleanText(input.totals?.shippingDisplay, 40),
      estimatedTotal: Math.max(0, finiteNumber(input.totals?.estimatedTotal)),
      estimatedTotalDisplay: cleanText(input.totals?.estimatedTotalDisplay, 40)
    },
    items,
    includedWithOrder: Array.isArray(input.includedWithOrder)
      ? input.includedWithOrder.map((item) => cleanText(item, 160)).filter(Boolean).slice(0, 20)
      : [],
    pageUrl: cleanText(input.pageUrl, 500),
    timezone: cleanText(input.timezone, 100),
    locale: cleanText(input.locale, 40),
    userAgent: cleanText(input.userAgent, 500),
    captureOrigin: cleanText(origin, 300)
  };

  delete normalized.turnstileToken;
  delete normalized.companyWebsite;
  return normalized;
}

async function verifyTurnstile(input, request, env, fetchImpl) {
  const secret = cleanText(env.TURNSTILE_SECRET, 500);
  if (!secret) {
    if (String(env.ENVIRONMENT || '').toLowerCase() === 'production') {
      return { ok: false, configurationError: true };
    }
    return { ok: true, skipped: true };
  }

  const token = cleanText(input.turnstileToken, 2500);
  if (!token) return { ok: false };

  const response = await fetchImpl(TURNSTILE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: cleanText(request.headers.get('CF-Connecting-IP'), 80) || undefined,
      idempotency_key: cleanText(input.orderId, 100)
    })
  });
  if (!response.ok) return { ok: false };
  const result = await response.json();
  return { ok: result.success === true };
}

async function insertOrder(order, origin, env) {
  const capturedAt = new Date().toISOString();
  const totalCents = Math.round(order.totals.estimatedTotal * 100);
  const result = await env.ORDERS.prepare(`
    INSERT OR IGNORE INTO order_requests (
      order_id, captured_at, requested_at, customer_name, customer_email,
      customer_phone, shipping_address, total_cents, item_count, payload_json,
      source_origin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    order.orderId,
    capturedAt,
    order.requestedAt,
    order.customer.name,
    order.customer.email,
    order.customer.phone,
    order.customer.shippingAddress,
    totalCents,
    order.totals.itemCount,
    JSON.stringify(order),
    origin || 'direct'
  ).run();

  return {
    capturedAt,
    duplicate: Number(result?.meta?.changes || 0) === 0
  };
}

function formatShipping(order) {
  const shipping = order.shippingMethod;
  if (!shipping) return 'Not selected';
  return [shipping.label, shipping.window, shipping.costDisplay].filter(Boolean).join(' | ');
}

export function buildMerchantEmail(order) {
  const lines = [
    'Captured Jonezie order request',
    '',
    `Order ID: ${order.orderId}`,
    `Requested At: ${order.requestedAt}`,
    `Customer: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone}`,
    `Shipping Address: ${order.customer.shippingAddress}`,
    `Shipping Method: ${formatShipping(order)}`,
    `Promo Code: ${order.promoCode || 'None'}`,
    '',
    'Items:'
  ];

  order.items.forEach((item) => {
    lines.push(`- ${item.name} | ${item.mgOption || 'Option'} | ${item.packLabel || 'Pack'} | Qty ${item.quantity} | ${item.lineTotalDisplay || item.lineTotal}`);
  });

  lines.push('');
  lines.push(`Subtotal: ${order.totals.subtotalDisplay || order.totals.subtotal}`);
  lines.push(`Discount: ${order.totals.discountDisplay || order.totals.discount}`);
  lines.push(`Shipping: ${order.totals.shippingDisplay || order.totals.shipping}`);
  lines.push(`Estimated Total: ${order.totals.estimatedTotalDisplay || order.totals.estimatedTotal}`);
  lines.push('');
  lines.push(`Notes: ${order.notes || 'None'}`);
  lines.push('');
  lines.push('This request was durably stored before this notification was sent.');
  return lines.join('\n');
}

export function buildCustomerEmail(order) {
  const lines = [
    `Hi ${order.customer.firstName || order.customer.name || 'there'},`,
    '',
    'We received your Jonezie Labs order request and will review it shortly.',
    'Once your order is reviewed and confirmed, we will email a secure invoice link.',
    '',
    `Order ID: ${order.orderId}`,
    `Estimated Total: ${order.totals.estimatedTotalDisplay || order.totals.estimatedTotal}`,
    `Shipping Method: ${formatShipping(order)}`,
    '',
    'Payment must be completed before shipment. Please check your inbox and spam folder for the invoice link.',
    '',
    'Research use only. Not for human or veterinary use.'
  ];
  return lines.join('\n');
}

async function sendEmail(message, env, fetchImpl) {
  const response = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    const detail = cleanText(await response.text(), 500);
    throw new Error(`Email provider returned ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  return response.json();
}

async function updateNotification(orderId, channel, status, error, env) {
  const column = channel === 'merchant'
    ? 'merchant_notification_status'
    : 'customer_notification_status';
  const attemptsColumn = channel === 'merchant'
    ? 'merchant_notification_attempts'
    : 'customer_notification_attempts';
  const errorColumn = channel === 'merchant'
    ? 'merchant_notification_error'
    : 'customer_notification_error';
  await env.ORDERS.prepare(`
    UPDATE order_requests
    SET ${column} = ?,
        ${attemptsColumn} = ${attemptsColumn} + 1,
        ${errorColumn} = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = ?
  `).bind(status, cleanText(error, 1000), orderId).run();
}

async function deliverMerchant(order, currentStatus, env, fetchImpl) {
  if (currentStatus === 'sent') return;
  const recipients = splitList(env.ADMIN_EMAILS);
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_FROM || !recipients.length) {
    await updateNotification(order.orderId, 'merchant', 'configuration_required', 'Missing email configuration.', env);
    return;
  }

  try {
    await sendEmail({
      from: env.NOTIFICATION_FROM,
      to: recipients,
      reply_to: order.customer.email || env.REPLY_TO_EMAIL,
      subject: `Captured Jonezie order request - ${order.customer.name} - ${order.orderId}`,
      text: buildMerchantEmail(order)
    }, env, fetchImpl);
    await updateNotification(order.orderId, 'merchant', 'sent', '', env);
  } catch (error) {
    await updateNotification(order.orderId, 'merchant', 'failed', error?.message || error, env);
  }
}

async function deliverCustomer(order, currentStatus, env, fetchImpl) {
  if (currentStatus === 'sent' || currentStatus === 'disabled') return;
  if (String(env.SEND_CUSTOMER_CONFIRMATION).toLowerCase() === 'false') {
    await updateNotification(order.orderId, 'customer', 'disabled', '', env);
    return;
  }
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_FROM) {
    await updateNotification(order.orderId, 'customer', 'configuration_required', 'Missing email configuration.', env);
    return;
  }

  try {
    await sendEmail({
      from: env.NOTIFICATION_FROM,
      to: [order.customer.email],
      reply_to: env.REPLY_TO_EMAIL,
      subject: `Jonezie Labs order request received - ${order.orderId}`,
      text: buildCustomerEmail(order)
    }, env, fetchImpl);
    await updateNotification(order.orderId, 'customer', 'sent', '', env);
  } catch (error) {
    await updateNotification(order.orderId, 'customer', 'failed', error?.message || error, env);
  }
}

async function deliverNotifications(record, env, fetchImpl = fetch) {
  const order = typeof record.payload_json === 'string'
    ? JSON.parse(record.payload_json)
    : record.order;
  await Promise.all([
    deliverMerchant(order, record.merchant_notification_status, env, fetchImpl),
    deliverCustomer(order, record.customer_notification_status, env, fetchImpl)
  ]);
}

async function captureOrder(request, env, ctx, fetchImpl) {
  const origin = allowedOrigin(request, env);
  if (origin === null) return jsonResponse(request, env, { ok: false, error: 'Origin is not allowed.' }, 403);

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_BYTES) return jsonResponse(request, env, { ok: false, error: 'Request is too large.' }, 413);

  let input;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse(request, env, { ok: false, error: 'Request is too large.' }, 413);
    input = JSON.parse(raw || '{}');
  } catch {
    return jsonResponse(request, env, { ok: false, error: 'Invalid JSON.' }, 400);
  }

  if (cleanText(input.companyWebsite, 200)) {
    return jsonResponse(request, env, { ok: true, saved: false }, 202);
  }

  const errors = validateOrderPayload(input);
  if (errors.length) return jsonResponse(request, env, { ok: false, errors }, 400);

  let turnstile;
  try {
    turnstile = await verifyTurnstile(input, request, env, fetchImpl);
  } catch {
    turnstile = { ok: false };
  }
  if (turnstile.configurationError) {
    return jsonResponse(request, env, { ok: false, error: 'Order protection is not configured.' }, 503);
  }
  if (!turnstile.ok) return jsonResponse(request, env, { ok: false, error: 'Security verification failed.' }, 403);

  const order = normalizeOrderPayload(input, origin || 'direct');
  const saved = await insertOrder(order, origin, env);
  const existing = saved.duplicate
    ? await env.ORDERS.prepare(`
        SELECT payload_json, merchant_notification_status, customer_notification_status
        FROM order_requests
        WHERE order_id = ?
      `).bind(order.orderId).first()
    : null;
  const notificationRecord = existing || {
    order,
    merchant_notification_status: 'pending',
    customer_notification_status: 'pending'
  };
  const notificationTask = deliverNotifications(notificationRecord, env, fetchImpl);
  if (ctx?.waitUntil) ctx.waitUntil(notificationTask);
  else await notificationTask;

  return jsonResponse(request, env, {
    ok: true,
    saved: true,
    duplicate: saved.duplicate,
    orderId: order.orderId,
    capturedAt: saved.capturedAt,
    notificationStatus: 'queued'
  }, saved.duplicate ? 200 : 201);
}

function adminAuthorized(request, env) {
  const token = cleanText(env.ADMIN_API_TOKEN, 1000);
  if (!token) return false;
  return request.headers.get('Authorization') === `Bearer ${token}`;
}

async function listOrders(request, env) {
  if (!env.ADMIN_API_TOKEN) return jsonResponse(request, env, { ok: false, error: 'Admin access is not configured.' }, 503);
  if (!adminAuthorized(request, env)) return jsonResponse(request, env, { ok: false, error: 'Unauthorized.' }, 401);

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number.parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const result = await env.ORDERS.prepare(`
    SELECT order_id, captured_at, requested_at, customer_name, customer_email,
      customer_phone, shipping_address, total_cents, item_count, payload_json,
      merchant_notification_status, customer_notification_status,
      merchant_notification_attempts, customer_notification_attempts,
      merchant_notification_error, customer_notification_error
    FROM order_requests
    ORDER BY captured_at DESC
    LIMIT ?
  `).bind(limit).all();

  const orders = (result.results || []).map((row) => ({
    ...row,
    payload: JSON.parse(row.payload_json),
    payload_json: undefined
  }));
  return jsonResponse(request, env, { ok: true, orders });
}

export async function handleRequest(request, env, ctx, fetchImpl = fetch) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    const origin = allowedOrigin(request, env);
    return new Response(null, { status: origin === null ? 403 : 204, headers: responseHeaders(request, env) });
  }
  if (request.method === 'GET' && url.pathname === '/health') {
    return jsonResponse(request, env, { ok: true, service: 'jonezie-order-capture', environment: env.ENVIRONMENT || 'unknown' });
  }
  if (request.method === 'GET' && url.pathname === '/api/admin/order-requests') {
    return listOrders(request, env);
  }
  if (request.method === 'POST' && url.pathname === '/api/order-requests') {
    return captureOrder(request, env, ctx, fetchImpl);
  }
  return jsonResponse(request, env, { ok: false, error: 'Not found.' }, 404);
}

async function retryNotifications(env, fetchImpl = fetch) {
  const result = await env.ORDERS.prepare(`
    SELECT order_id, payload_json, merchant_notification_status, customer_notification_status
    FROM order_requests
    WHERE (merchant_notification_attempts < ?
        AND merchant_notification_status IN ('pending', 'failed', 'configuration_required'))
      OR (customer_notification_attempts < ?
        AND customer_notification_status IN ('pending', 'failed', 'configuration_required'))
    ORDER BY captured_at ASC
    LIMIT 25
  `).bind(MAX_NOTIFICATION_ATTEMPTS, MAX_NOTIFICATION_ATTEMPTS).all();

  for (const record of result.results || []) {
    await deliverNotifications(record, env, fetchImpl);
  }
}

export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
  scheduled(_event, env, ctx) {
    ctx.waitUntil(retryNotifications(env));
  }
};
