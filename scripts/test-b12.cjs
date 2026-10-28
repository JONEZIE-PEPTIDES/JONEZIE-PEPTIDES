const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ window: {}, document: { querySelector: () => null } });
for (const file of ['catalog-data.js', 'catalog-sheet-sync.js', 'catalog-admin-config.js', 'catalog-admin.js', 'new-label-products.js', 'catalog-image-overrides.js']) {
  vm.runInContext(read(file), context);
}
const catalog = context.window.JONEZIE_CATALOG;
for (const list of [catalog.products, catalog.featured]) {
  const b12 = list.find(product => product.slug === 'b12-10000mcg-10ml');
  assert.equal(b12.name, 'B12');
  assert.equal(b12.hasUpdatedLabel, true);
  assert.equal(b12.options.length, 2);
  assert.equal(b12.startingPriceSingle, '$17.00');
  assert.equal(b12.startingPrice8, '$136.00');
  assert.equal(b12.startingPrice10, '$170.00');
  const [small, original] = b12.options;
  assert.equal(small.code, 'B113000MCG');
  assert.equal(small.mgOption, '3000 MCG / 3 mL');
  assert.equal(small.inventoryStatus, 'in_stock');
  assert.deepEqual([small.singleVialPrice, small.eightVialPrice, small.tenVialPrice], ['$17.00', '$136.00', '$170.00']);
  assert.equal(original.code, 'B11000MCG', 'Preserve existing cart/order option identifiers');
  assert.equal(original.mgOption, '10,000mcg / 10ml');
  assert.deepEqual([original.singleVialPrice, original.eightVialPrice, original.tenVialPrice], ['$22.00', '$176.00', '$220.00']);
  assert.equal(b12.image, 'assets/products/20261022/b12-3000mcg-3ml.webp');
}
const codes = catalog.products.flatMap(product => Array.from(product.options, option => option.code));
assert.equal(new Set(codes).size, codes.length, 'Every strength must have a unique ordering code');
const page = read('products/b12-10000mcg-10ml.html');
assert(page.includes('<h1 data-product-title>B12</h1>'));
assert(page.includes('data-option-code="B113000MCG"'));
assert(page.includes('data-option-code="B11000MCG"'));
assert(!page.includes('B12_10000MCG_10ML_Red_Water_Vial.webp'));
const artwork = context.window.JONEZIE_NEW_LABELS.find(item => item.slug === 'b12-10000mcg-10ml');
assert(artwork);
assert(fs.existsSync(path.join(root, artwork.image)));
assert(fs.existsSync(path.join(root, artwork.thumbnail)));
console.log('PASS: B12 naming, both sizes, exact kit prices, stable option codes, approved hero and featured/animation inclusion.');
