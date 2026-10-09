const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const input = { value: 'mrgogo', addEventListener() {} };
const window = { location: { href: 'http://127.0.0.1/checkout.html' } };
const context = vm.createContext({
  window,
  document: {
    querySelector: (selector) => selector === '[data-promo-code]' ? input : null,
    querySelectorAll: () => [],
    getElementById: () => ({}),
    head: { appendChild() {} }
  },
  navigator: { language: 'en-US', userAgent: 'test' },
  Date,
  console
});

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

load('catalog-sheet-sync.js');
load('catalog-admin-config.js');
load('catalog-admin.js');
load('checkout.js');

const enabledAt = Date.parse(vm.runInContext('PROMO_CODES.MRGOGO.enabledAt', context));
context.Date = class extends Date { static now() { return enabledAt + 1; } };
const promo = vm.runInContext('getPromoDetails()', context);
assert.equal(promo.code, 'MRGOGO');
assert.equal(promo.isValid, true);
assert.equal(promo.freeShipping, false);

const cases = [
  ['retatrutide', '10mg', 62.59, 37.55],
  ['tirzepatide', '15mg', 43.73, 26.24],
  ['semaglutide', '10mg', 33.64, 20.18],
  ['tesamorelin', '10mg', 67.99, 40.79],
  ['mots-c', '10mg', 37.50, 22.50],
  ['ghk-cu', '50mg', 25.77, 15.46],
  ['bpc-5mg-plus-tb-5mg', '10mg', 65.91, 39.55],
  ['ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg', '80mg', 97.99, 58.79],
  ['kpv', '10mg', 37.50, 22.50],
  ['hcg', '5000iu', 50.46, 30.28]
];
const approvedSales = [37.55, 26.24, 20.18, 40.79, 22.50, 15.46, 39.55, 58.79, 22.50, 30.28];

function item(slug, strength, packKey = 'singleVialPrice', quantity = 1) {
  const product = window.JONEZIE_CATALOG.products.find((entry) => entry.slug === slug);
  const option = product?.options.find((entry) => entry.mgOption === strength);
  assert.ok(option, `${slug} ${strength} exists`);
  return {
    slug,
    mgOption: strength,
    packKey,
    packLabel: packKey === 'singleVialPrice' ? 'Single Vial' : '8-Vial Kit',
    unitPrice: Number(option[packKey].replace(/[$,]/g, '')),
    quantity
  };
}

const discount = (cart, details = promo) => {
  context.testCart = cart;
  context.testPromo = details;
  return vm.runInContext('getPromoDiscount(testCart, testPromo)', context);
};

for (const [slug, strength, regular, sale] of cases) {
  const cartItem = item(slug, strength);
  assert.equal(cartItem.unitPrice, regular, `${slug} catalog price`);
  assert.equal(Number((regular - discount([cartItem])).toFixed(2)), sale, `${slug} sale price`);
}
const priceConflicts = cases.flatMap(([slug, strength, , sale], index) => (
  sale === approvedSales[index] ? [] : [`${slug} ${strength}: calculated $${sale.toFixed(2)}, approved $${approvedSales[index].toFixed(2)}`]
));
assert.deepEqual(priceConflicts, [], 'all approved sale prices must match before production activation');

const eligible = item('retatrutide', '10mg');
const otherStrength = item('retatrutide', '15mg');
const otherPack = item('retatrutide', '10mg', 'eightVialPrice');
const excluded = item('b12-10000mcg-10ml', '10,000mcg / 10ml');
const bacWater = item('bac-water', '10ml');
const otherBundle = item('bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg', '70mg');
assert.equal(discount([otherStrength]), 0);
assert.equal(discount([otherPack]), 0);
assert.equal(discount([excluded]), 0);
assert.equal(discount([bacWater]), 0);
assert.equal(discount([otherBundle]), 0);
assert.equal(discount([eligible, otherStrength, otherPack, excluded]), 25.04);
assert.equal(discount([item('retatrutide', '10mg', 'singleVialPrice', 2)]), 50.08);
assert.equal(discount([{ ...eligible, unitPrice: 1 }]), 0, 'stale or tampered cart price is excluded');

context.orderArgs = {
  cart: [eligible, excluded], firstName: 'Test', lastName: 'Order', email: 'test@example.com',
  phone: '5555551212', streetAddress: '1 Test Ave', city: 'Detroit', state: 'MI', zipCode: '48201',
  notes: '', promo, shippingOption: { id: 'ground-advantage', label: 'USPS Ground Advantage', window: '2-5 business days' },
  shippingCost: 8, subtotal: eligible.unitPrice + excluded.unitPrice,
  discountAmount: discount([eligible, excluded]), total: eligible.unitPrice + excluded.unitPrice - discount([eligible, excluded]) + 8
};
const order = vm.runInContext('buildOrderRequestPayload(orderArgs)', context);
assert.equal(order.promoCode, 'MRGOGO');
assert.equal(order.totals.discount, 25.04);
assert.equal(order.totals.shipping, 8);
context.orderArgs.cart = [excluded];
context.orderArgs.discountAmount = 0;
const excludedOrder = vm.runInContext('buildOrderRequestPayload(orderArgs)', context);
assert.equal(excludedOrder.promoCode, '', 'ineligible order does not carry MRGOGO');

input.value = 'FaLl25';
const fall25 = vm.runInContext('getPromoDetails()', context);
assert.equal(fall25.code, 'FALL25');
assert.equal(discount([eligible, excluded], fall25), (eligible.unitPrice + excluded.unitPrice) * 0.25);

const activeAt = (time) => {
  context.Date = class extends Date { static now() { return time; } };
  return vm.runInContext('isPromoCurrentlyActive(PROMO_CODES.MRGOGO)', context);
};
assert.equal(activeAt(enabledAt - 1), false);
assert.equal(activeAt(enabledAt), true);
assert.equal(activeAt(enabledAt + 24 * 60 * 60 * 1000 - 1), true);
assert.equal(activeAt(enabledAt + 24 * 60 * 60 * 1000), false);

console.log('MRGOGO: 10 eligible variants, exclusions, mixed cart, case handling, and 24-hour window passed.');
