const DEFAULT_SHEET_NAME = 'Order Requests';
const DEFAULT_ADMIN_EMAIL = 'orders@jonezielabs.com';
const HEADERS = [
  'Requested At',
  'Order ID',
  'Customer First Name',
  'Customer Last Name',
  'Customer Name',
  'Customer Email',
  'Customer Phone',
  'Street Address',
  'City',
  'State',
  'ZIP Code',
  'Shipping Address',
  'Shipping Method',
  'Promo Code',
  'Subtotal',
  'Discount',
  'Shipping',
  'Estimated Total',
  'Notes',
  'Item Count',
  'Items Summary',
  'Page URL',
  'Timezone',
  'Locale',
  'User Agent',
  'Payload JSON'
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'jonezie-order-request' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = getTargetSheet_();
    ensureHeaders_(sheet);

    const itemsSummary = Array.isArray(payload.items)
      ? payload.items.map((item) => `${item.name} | ${item.mgOption} | ${item.packLabel} | Qty ${item.quantity} | ${item.lineTotalDisplay}`).join(' || ')
      : '';

    sheet.appendRow([
      payload.requestedAt || new Date().toISOString(),
      payload.orderId || '',
      getValue_(payload, 'customer.firstName'),
      getValue_(payload, 'customer.lastName'),
      getValue_(payload, 'customer.name'),
      getValue_(payload, 'customer.email'),
      getValue_(payload, 'customer.phone'),
      getValue_(payload, 'customer.shippingStreetAddress'),
      getValue_(payload, 'customer.shippingCity'),
      getValue_(payload, 'customer.shippingState'),
      getValue_(payload, 'customer.shippingZip'),
      getValue_(payload, 'customer.shippingAddress'),
      payload.shippingMethod
        ? `${payload.shippingMethod.label} | ${payload.shippingMethod.window} | ${payload.shippingMethod.costDisplay}`
        : '',
      payload.promoCode || '',
      getValue_(payload, 'totals.subtotalDisplay'),
      getValue_(payload, 'totals.discountDisplay'),
      getValue_(payload, 'totals.shippingDisplay'),
      getValue_(payload, 'totals.estimatedTotalDisplay'),
      payload.notes || '',
      getValue_(payload, 'totals.itemCount'),
      itemsSummary,
      payload.pageUrl || '',
      payload.timezone || '',
      payload.locale || '',
      payload.userAgent || '',
      JSON.stringify(payload)
    ]);

    sendAdminEmail_(payload);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, orderId: payload.orderId || '' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getTargetSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const sheetId = String(properties.getProperty('ORDER_REQUEST_SHEET_ID') || '').trim();
  const sheetName = String(properties.getProperty('ORDER_REQUEST_SHEET_NAME') || DEFAULT_SHEET_NAME).trim();
  const spreadsheet = sheetId ? SpreadsheetApp.openById(sheetId) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
}

function getAdminEmail_() {
  const configured = String(PropertiesService.getScriptProperties().getProperty('ORDER_REQUEST_ADMIN_EMAIL') || '').trim();
  return configured || DEFAULT_ADMIN_EMAIL;
}

function sendAdminEmail_(payload) {
  const adminEmail = getAdminEmail_();
  if (!adminEmail) return;

  const lines = [
    'New Jonezie order request',
    '',
    `Order ID: ${payload.orderId || ''}`,
    `Submitted At: ${payload.requestedAt || ''}`,
    `Invoice Flow: ${payload.invoiceFlow || ''}`,
    `Payment Notice: ${payload.paymentNotice || ''}`,
    '',
    `Research-use notice: ${payload.researchUseNotice || ''}`,
    '',
    `Customer: ${getValue_(payload, 'customer.name') || 'Not provided'}`,
    `First Name: ${getValue_(payload, 'customer.firstName') || 'Not provided'}`,
    `Last Name: ${getValue_(payload, 'customer.lastName') || 'Not provided'}`,
    `Email: ${getValue_(payload, 'customer.email') || 'Not provided'}`,
    `Phone: ${getValue_(payload, 'customer.phone') || 'Not provided'}`,
    `Street Address: ${getValue_(payload, 'customer.shippingStreetAddress') || 'Not provided'}`,
    `City: ${getValue_(payload, 'customer.shippingCity') || 'Not provided'}`,
    `State: ${getValue_(payload, 'customer.shippingState') || 'Not provided'}`,
    `ZIP Code: ${getValue_(payload, 'customer.shippingZip') || 'Not provided'}`,
    `Shipping Address: ${getValue_(payload, 'customer.shippingAddress') || 'Not provided'}`,
    `Shipping Method: ${payload.shippingMethod ? `${payload.shippingMethod.label} | ${payload.shippingMethod.window} | ${payload.shippingMethod.costDisplay}` : 'Not selected'}`,
    `Promo Code: ${payload.promoCode || 'None'}`,
    '',
    'Order items:'
  ];

  (payload.items || []).forEach((item) => {
    lines.push(`- ${item.name} | ${item.mgOption} | ${item.packLabel} | ${item.inventoryStatus} | Qty ${item.quantity} | ${item.unitPriceDisplay} each | ${item.lineTotalDisplay} total`);
  });

  lines.push('');
  lines.push(`Subtotal: ${getValue_(payload, 'totals.subtotalDisplay') || '$0.00'}`);
  lines.push(`Discount: ${payload.promoCode ? `${getValue_(payload, 'totals.discountDisplay')} (${payload.promoCode})` : '$0.00'}`);
  lines.push(`Shipping: ${payload.shippingMethod ? `${getValue_(payload, 'totals.shippingDisplay')} (${payload.shippingMethod.label})` : '$0.00'}`);
  lines.push(`Estimated Total: ${getValue_(payload, 'totals.estimatedTotalDisplay') || '$0.00'}`);
  lines.push('');
  lines.push(`Included with order: ${(payload.includedWithOrder || []).join(' + ')}`);
  lines.push('');
  lines.push(`Notes: ${payload.notes || 'None'}`);

  MailApp.sendEmail({
    to: adminEmail,
    subject: `New Jonezie order request - ${getValue_(payload, 'customer.name') || 'Customer'} - ${payload.orderId || ''}`,
    body: lines.join('\n')
  });
}

function getValue_(payload, path) {
  return String(path.split('.').reduce((value, key) => (value && value[key] !== undefined ? value[key] : ''), payload) || '');
}
