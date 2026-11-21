const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const context = vm.createContext({ window: {}, document: { querySelector: () => null }, formatMoney: amount => '$' + amount.toFixed(2) });
for (const name of ['catalog-data.js', 'catalog-sheet-sync.js', 'catalog-admin-config.js', 'catalog-admin.js', 'new-label-products.js', 'catalog-image-overrides.js']) vm.runInContext(read(name), context);
const expected = [
  ['RET10MG', '10mg', 62.59, 54.59, 381.28, 451.91, 'in_stock'],
  ['RET15MG', '15mg', 77.37, 69.37, 484.50, 574.26, 'backorder'],
  ['RET20MG', '20mg', 107, 99, 691.45, 819.55, 'in_stock'],
  ['RET30MG', '30mg', 134.55, 126.55, 883.87, 1047.61, 'in_stock']
];
const money = value => Number(String(value).replace(/[^\d.]/g, ''));
for (const products of [context.window.JONEZIE_CATALOG.products, context.window.JONEZIE_CATALOG.featured]) {
  const product = products.find(item => item.slug === 'retatrutide');
  assert.equal(product.options.length, 4);
  expected.forEach(([code, strength, previous, single, eight, ten, inventory], index) => {
    const option = product.options[index];
    assert.equal(option.code, code);
    assert.equal(option.mgOption, strength);
    assert.equal(option.inventoryStatus, inventory);
    assert.equal(Math.round(previous * 100) - Math.round(single * 100), 800);
    assert.equal(money(option.singleVialPrice), single);
    assert.equal(money(option.eightVialPrice), eight);
    assert.equal(money(option.tenVialPrice), ten);
    assert.equal(eight, Math.round(single * (160.64 / 23) * 100) / 100);
    assert.equal(ten, Math.round(single * (190.4 / 23) * 100) / 100);
  });
  assert.equal(money(product.startingPriceSingle), 54.59);
}
// Previously saved carts must be repriced from the current catalog, for every pack.
const checkout = read('checkout.js');
vm.runInContext(checkout.slice(checkout.indexOf('function getCartDisplayName('), checkout.indexOf('const ORDER_REQUEST_CONFIG =')), context);
for (const [code, strength, previous, single, eight, ten, inventory] of expected) {
  for (const [packKey, price] of [['singleVialPrice', single], ['eightVialPrice', eight], ['tenVialPrice', ten]]) {
    const item = context.getCurrentCatalogCartItem({ slug: 'retatrutide', code, mgOption: strength, packKey, unitPrice: previous, quantity: 3 });
    assert.equal(item.unitPrice, price);
    assert.equal(item.quantity, 3);
    assert.equal(item.inventoryStatus, inventory);
  }
}
const page = read('products/retatrutide.html');
assert(page.includes('"price": "54.59"'));
assert(page.includes('$381.28') && page.includes('$451.91'));
const revision = read('product.html').match(/catalog-sheet-sync\.js\?v=([^"\s]+)/)[1];
const entries = [...fs.readdirSync(root).filter(file => file.endsWith('.html')), ...fs.readdirSync(path.join(root, 'products')).filter(file => file.endsWith('.html')).map(file => 'products/' + file)];
for (const entry of entries) {
  const match = read(entry).match(/catalog-sheet-sync\.js\?v=([^"\s]+)/);
  if (match) assert.equal(match[1], revision, `Fresh pricing script on ${entry}`);
}
console.log('PASS: all four GLP-3(RT) strengths reduced by $8, bundle ratios preserved, saved carts repriced, featured/static pricing and cache revisions consistent.');
