const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const storage = new Map();
const context = {
  window: {},
  document: {
    querySelector: () => null,
    querySelectorAll: () => []
  },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  },
  location: { href: 'http://127.0.0.1:8036/standards/checkout.html' },
  console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'standards/merch-data.js'), 'utf8'), context);
const script = fs.readFileSync(path.join(root, 'standards/merch-store.js'), 'utf8');
vm.runInContext(script.replace(/\n\}\)\(\);\s*$/, '\nwindow.__test = { calculateTotals, buildOrderPayload, giftQualified };\n})();'), context);

const config = context.window.JONEZIE_STANDARDS_MERCH;
const hat = config.products.find((product) => product.slug === 'jonezie-labs-signature-hat');
assert.ok(hat);
const cart = [{ ...hat, quantity: 3, unitPrice: hat.price }];
storage.set(config.cartKey, JSON.stringify(cart));
const { calculateTotals, buildOrderPayload, giftQualified } = context.window.__test;
const totals = calculateTotals();
assert.equal(totals.subtotal, 330);
assert.equal(totals.discount, 82.5);
assert.equal(totals.shipping, 8);
assert.equal(totals.total, 255.5);
assert.equal(giftQualified(), true);

const fields = {
  firstName: 'Casey', lastName: 'Researcher', email: 'casey@example.test',
  phone: '555-0100', street: '100 Lab Way', city: 'Detroit', state: 'mi', zip: '48201'
};
const payload = buildOrderPayload({ get: (name) => fields[name] ?? '' });
assert.equal(payload.promoCode, 'STANDARDS25');
assert.equal(payload.customer.name, 'Casey Researcher');
assert.equal(payload.customer.shippingStreetAddress, '100 Lab Way');
assert.equal(payload.totals.estimatedTotalDisplay, '$255.50');
assert.equal(payload.totals.discountDisplay, '$82.50');
assert.equal(payload.items[0].lineTotalDisplay, '$247.50');
assert.equal(payload.includedWithOrder[0], 'Empty Jonezie Labs research case');

storage.set(config.cartKey, JSON.stringify([{ ...hat, quantity: 2, unitPrice: hat.price }]));
assert.equal(giftQualified(), false);
assert.equal(buildOrderPayload({ get: (name) => fields[name] ?? '' }).includedWithOrder.length, 0);
const tester = config.products.find((product) => product.sku === 'JL-STANDARDS-VICKERS-001');
storage.set(config.cartKey, JSON.stringify([{ ...tester, quantity: 1, unitPrice: tester.price }]));
assert.equal(calculateTotals().discount, 12998.44);
assert.equal(calculateTotals().total, 39003.31);
const researchKit = config.products.find((product) => product.slug === 'research-vial-kit-case');
storage.set(config.cartKey, JSON.stringify([{ ...researchKit, quantity: 1 }]));
const kitOrder = buildOrderPayload({ get: (name) => fields[name] ?? '' });
assert.equal(kitOrder.items[0].promotionRate, 0.25);
assert.equal(kitOrder.items[0].unitPriceDisplay, '$42.89');
console.log('Standards promotion, gift threshold, and order email payload: OK');
