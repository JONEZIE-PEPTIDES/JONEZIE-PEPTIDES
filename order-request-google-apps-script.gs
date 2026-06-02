const ADMIN_EMAIL = 'orders@jonezielabs.com';
const FROM_NAME = 'Jonezie Labs';
const REPLY_TO_EMAIL = 'orders@jonezielabs.com';

function doGet() {
  return ContentService
    .createTextOutput('Jonezie Labs order request endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(event) {
  try {
    const payload = JSON.parse((event.postData && event.postData.contents) || '{}');
    const customerEmail = getValue(payload, ['customer', 'email']);
    const orderId = payload.orderId || 'Order request';
    const customerName = getValue(payload, ['customer', 'name']) || 'Customer';

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Jonezie order request - ${customerName} - ${orderId}`,
      body: buildAdminEmail(payload),
      name: FROM_NAME,
      replyTo: customerEmail || REPLY_TO_EMAIL
    });

    if (customerEmail) {
      MailApp.sendEmail({
        to: customerEmail,
        cc: ADMIN_EMAIL,
        subject: `Jonezie Labs order request received - ${orderId}`,
        body: buildCustomerEmail(payload),
        name: FROM_NAME,
        replyTo: REPLY_TO_EMAIL
      });
    }

    return jsonResponse({
      ok: true,
      orderId
    });
  } catch (error) {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: 'Jonezie order request endpoint error',
      body: error && error.stack ? error.stack : String(error),
      name: FROM_NAME,
      replyTo: REPLY_TO_EMAIL
    });

    return jsonResponse({
      ok: false
    });
  }
}

function buildAdminEmail(payload) {
  const customer = payload.customer || {};
  const totals = payload.totals || {};
  const shippingMethod = payload.shippingMethod || null;
  const items = Array.isArray(payload.items) ? payload.items : [];
  const included = Array.isArray(payload.includedWithOrder) ? payload.includedWithOrder : [];
  const lines = [
    'New Jonezie order request',
    '',
    `Order ID: ${payload.orderId || 'Not provided'}`,
    `Submitted At: ${payload.requestedAt || new Date().toISOString()}`,
    '',
    `Customer: ${customer.name || 'Not provided'}`,
    `Email: ${customer.email || 'Not provided'}`,
    `Phone: ${customer.phone || 'Not provided'}`,
    '',
    'Shipping',
    `Street Address: ${customer.shippingStreetAddress || 'Not provided'}`,
    `City: ${customer.shippingCity || 'Not provided'}`,
    `State: ${customer.shippingState || 'Not provided'}`,
    `ZIP Code: ${customer.shippingZip || 'Not provided'}`,
    `Shipping Address: ${customer.shippingAddress || 'Not provided'}`,
    `Shipping Method: ${formatShippingMethod(shippingMethod)}`,
    '',
    `Promo Code: ${payload.promoCode || 'None'}`,
    '',
    'Order items:'
  ];

  if (items.length) {
    items.forEach((item) => {
      lines.push(`- ${item.name || 'Product'} | ${item.mgOption || 'Option'} | ${item.packLabel || 'Pack'} | ${item.inventoryStatus || 'Status pending'} | Qty ${item.quantity || 1} | ${item.unitPriceDisplay || ''} each | ${item.lineTotalDisplay || ''} total`);
    });
  } else {
    lines.push('- No items received');
  }

  lines.push('');
  lines.push(`Subtotal: ${totals.subtotalDisplay || '$0.00'}`);
  lines.push(`Discount: ${payload.promoCode ? `${totals.discountDisplay || '$0.00'} (${payload.promoCode})` : '$0.00'}`);
  lines.push(`Shipping: ${shippingMethod ? `${totals.shippingDisplay || '$0.00'} (${shippingMethod.label || 'Shipping'})` : '$0.00'}`);
  lines.push(`Estimated Total: ${totals.estimatedTotalDisplay || '$0.00'}`);
  lines.push('');
  lines.push(`Included with order: ${included.length ? included.join(' + ') : 'None listed'}`);
  lines.push('');
  lines.push(`Notes: ${payload.notes || 'None'}`);
  lines.push('');
  lines.push('Invoice note: Review the order, then email a secure Stripe invoice. Payment must be completed before shipment.');

  return lines.join('\n');
}

function buildCustomerEmail(payload) {
  const customer = payload.customer || {};
  const totals = payload.totals || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const included = Array.isArray(payload.includedWithOrder) ? payload.includedWithOrder : [];
  const firstName = customer.firstName || customer.name || 'there';
  const lines = [
    `Hi ${firstName},`,
    '',
    'We received your Jonezie Labs order request and will review it shortly. If everything looks good, a secure Stripe invoice will be emailed for payment.',
    '',
    `Order ID: ${payload.orderId || 'Not provided'}`,
    `Estimated Total: ${totals.estimatedTotalDisplay || '$0.00'}`,
    `Shipping Method: ${formatShippingMethod(payload.shippingMethod)}`,
    '',
    'Order items:'
  ];

  if (items.length) {
    items.forEach((item) => {
      lines.push(`- ${item.name || 'Product'} | ${item.mgOption || 'Option'} | ${item.packLabel || 'Pack'} | Qty ${item.quantity || 1} | ${item.lineTotalDisplay || ''}`);
    });
  } else {
    lines.push('- No items received');
  }

  lines.push('');
  lines.push(`Included with order: ${included.length ? included.join(' + ') : 'None listed'}`);
  lines.push('');
  lines.push('This is an order request confirmation, not a payment receipt. Your order is not confirmed for shipment until the invoice is paid.');
  lines.push('');
  lines.push('Jonezie Labs');

  return lines.join('\n');
}

function formatShippingMethod(shippingMethod) {
  if (!shippingMethod) return 'Not selected';
  return [
    shippingMethod.label || '',
    shippingMethod.window || '',
    shippingMethod.costDisplay || ''
  ].filter(Boolean).join(' | ') || 'Not selected';
}

function getValue(source, path) {
  return path.reduce((value, key) => value && value[key], source) || '';
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
