const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function storefront(url = 'https://www.jonezielabs.com/checkout.html') {
  const spans = Array.from({ length: 8 }, () => ({ textContent: 'Use code FALL25 for 25% off' }));
  const input = { value: 'vixen', addEventListener() {}, closest: () => null };
  const document = {
    readyState: 'complete', baseURI: url, cookie: '',
    body: { classList: { add() {} } }, head: { appendChild() {} },
    createElement: () => ({}), addEventListener() {}, dispatchEvent() {},
    querySelector: selector => selector === '[data-promo-code]' ? input : null,
    querySelectorAll: selector => selector === '.promo-track span' ? spans : [],
    getElementById: () => ({})
  };
  const window = { location: new URL(url) };
  const context = vm.createContext({
    window, document, URL, URLSearchParams, Intl, console,
    requestAnimationFrame: callback => callback(),
    fetch: async () => ({ ok: true, json: async () => ({ codes: [] }) }),
    Date: class extends Date { static now() { return Date.parse('2026-11-22T15:00:00Z'); } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    navigator: { language: 'en-US', userAgent: 'local-test' }
  });
  vm.runInContext(read('promo-banner.js'), context);
  vm.runInContext(read('checkout.js'), context);
  return { context, window, input, spans };
}

test('VIXEN messaging, card price, and checkout all use 40% with a separate gift announcement', () => {
  const { context, window, spans } = storefront();
  assert.equal(window.JONEZIE_PROMO.getActivePromo().code, 'VIXEN');
  assert.equal(window.JONEZIE_PROMO.getPromoByCode('vixen').rate, 0.40);
  assert.equal(spans.filter(span => span.textContent === 'Use code VIXEN for 40% off').length, 4);
  assert.equal(spans.filter(span => span.textContent === 'Free 10 mL BAC Water with every order').length, 4);
  const source = read('script.js');
  context.parsePrice = value => Number(String(value).replace(/[$,]/g, ''));
  context.escapeHtml = value => String(value);
  vm.runInContext(source.slice(source.indexOf('let cardPromoSource;'), source.indexOf('function getFeaturedQuickAdd(')), context);
  const markup = vm.runInContext("renderCardPricing({}, '$100.00')", context);
  assert.match(markup, /\$60\.00 with code VIXEN · 40% off/);
  const promo = vm.runInContext('getPromoDetails()', context);
  assert.equal(promo.code, 'VIXEN');
  assert.equal(promo.rate, 0.40);
  assert.equal(promo.isValid, true);
  for (const packKey of ['singleVialPrice', 'eightVialPrice', 'tenVialPrice']) {
    context.orderCart = [{ slug: 'semaglutide', packKey, unitPrice: 100, quantity: 2 }];
    assert.equal(vm.runInContext('getPromoDiscount(orderCart, getPromoDetails())', context), 80);
  }
});

test('one complimentary BAC Water is included per order and reaches both email templates', () => {
  const { context } = storefront();
  const emails = [];
  const backend = vm.createContext({
    MailApp: { sendEmail: email => emails.push(email) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: value => ({ value, setMimeType() { return this; } }) }
  });
  vm.runInContext(read('google-apps-script/order-request/Code.gs'), backend);
  for (const quantity of [1, 4]) {
    context.orderArgs = {
      cart: [{ name: 'Test product', slug: 'semaglutide', code: 'TEST', mgOption: '5mg', packLabel: 'Single Vial', unitPrice: 100, quantity }],
      firstName: 'Test', lastName: 'Customer', email: 'customer@example.test', phone: '5555550100',
      streetAddress: '1 Test St', city: 'Detroit', state: 'MI', zipCode: '48201', country: 'US', notes: '',
      promo: vm.runInContext('getPromoDetails()', context),
      shippingOption: { id: 'ground-advantage', label: 'USPS Ground Advantage', price: 8, window: '2-5 business days' },
      shippingCost: 8, subtotal: quantity * 100, discountAmount: quantity * 40, total: quantity * 60 + 8
    };
    const payload = vm.runInContext('buildOrderRequestPayload(orderArgs)', context);
    assert.equal(payload.includedWithOrder.filter(item => item === 'Free 10 mL BAC Water').length, 1);
    assert.equal(payload.items.length, 1);
    assert.equal(payload.items[0].unitPrice, 100, 'the gift does not alter paid product prices');
    assert.equal(payload.totals.estimatedTotal, quantity * 60 + 8);
    assert.equal(payload.promoCode, 'VIXEN');
    const response = backend.doPost({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(JSON.parse(response.value).ok, true);
    const sent = emails.splice(0);
    assert.equal(sent.length, 2);
    for (const email of sent) assert.match(email.body, /Free 10 mL BAC Water/);
  }
});

test('the ad store keeps its single automatic 40% discount and cannot stack VIXEN', () => {
  const { context, window, input, spans } = storefront('https://www.jonezielabs.com/checkout.html?ad=fall40');
  assert.equal(window.JONEZIE_PROMO.getActivePromo().auto, true);
  const promo = vm.runInContext('getPromoDetails()', context);
  assert.equal(promo.auto, true);
  assert.equal(promo.rate, 0.40);
  assert.equal(promo.code, 'FALL40-AUTO');
  assert.equal(input.disabled, true);
  assert(spans.some(span => span.textContent === 'Free 10 mL BAC Water with every order'));
});
