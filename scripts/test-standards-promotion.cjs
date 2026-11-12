const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const data = fs.readFileSync(path.join(root, 'standards/merch-data.js'), 'utf8');
const store = fs.readFileSync(path.join(root, 'standards/merch-store.js'), 'utf8');
const storage = new Map();
const context = vm.createContext({
  window: {},
  document: { querySelector: () => null, querySelectorAll: () => [] },
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  },
  location: { search: '?ad=standards25', href: 'https://www.jonezielabs.com/standards/checkout.html?ad=standards25' },
  navigator: { language: 'en-US', userAgent: 'Standards test' },
  URLSearchParams,
  Intl,
  Date,
  Math,
  Number,
  String,
  JSON
});
vm.runInContext(data, context);
vm.runInContext(store.replace('  renderPromotion();', '  window.__test = { calculateTotals, buildOrderPayload, giftQualified };\n  renderPromotion();'), context);

const { calculateTotals, buildOrderPayload, giftQualified } = context.window.__test;
const key = context.window.JONEZIE_STANDARDS_MERCH.cartKey;
const spatula = context.window.JONEZIE_STANDARDS_MERCH.products.find((item) => item.slug.includes('spatula'));
const caseProduct = context.window.JONEZIE_STANDARDS_MERCH.products.find((item) => item.slug === 'research-vial-kit-case');
const putCart = (product, quantity) => storage.set(key, JSON.stringify([{ ...product, quantity }]));

putCart(spatula, 2);
let totals = calculateTotals();
assert.equal(giftQualified(), false);
assert.equal(totals.total, 45.5);

putCart(spatula, 3);
totals = calculateTotals();
assert.equal(giftQualified(), true);
assert.equal(totals.items, 3);
assert.equal(totals.subtotal, 75);
assert.equal(totals.discount, 18.75);
assert.equal(totals.total, 64.25);
const fields = { firstName: 'Test', lastName: 'Customer', email: 'test@example.com', phone: '5555555555', street: '1 Test St', city: 'Test', state: 'MI', zip: '48000' };
const payload = buildOrderPayload({ get: (key) => fields[key] || '' });
assert.equal(payload.promoCode, 'STANDARDS25');
assert.equal(payload.items.length, 1);
assert.equal(payload.includedWithOrder[0], 'Empty Jonezie Labs research case');
assert.equal(payload.totals.estimatedTotalDisplay, '$64.25');

putCart(caseProduct, 1);
totals = calculateTotals();
assert.equal(giftQualified(), false);
assert.equal(totals.total, 50.89);

console.log('Standards promotion and free-case checkout calculations pass.');
