const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ window: {}, document: { querySelector: () => null } });
for (const file of ['catalog-data.js', 'catalog-sheet-sync.js', 'catalog-admin-config.js', 'catalog-admin.js', 'new-label-products.js', 'catalog-image-overrides.js', 'product-content.js']) {
  vm.runInContext(read(file), context);
}
const catalog = context.window.JONEZIE_CATALOG;
assert.equal(catalog.products.filter(p => p.slug === 'ahk-cu').length, 1);
const product = catalog.products.find(p => p.slug === 'ahk-cu');
assert.equal(product.name, 'AHK-CU');
assert.equal(product.options.length, 1);
const option = product.options[0];
assert.equal(option.code, 'AC100MG');
assert.equal(option.mgOption, '100mg');
assert.equal(option.inventoryStatus, 'in_stock');
assert.deepEqual(
  [option.singleVialPrice, option.eightVialPrice, option.tenVialPrice],
  ['$30.00', '$209.53', '$248.35']
);
assert.deepEqual(
  [product.startingPriceSingle, product.startingPrice8, product.startingPrice10],
  [option.singleVialPrice, option.eightVialPrice, option.tenVialPrice]
);
const price = value => Number(value.replace(/[^0-9.]/g, ''));
// Use the standard kit ratios while preserving the approved $30 retail price.
assert.equal(price(option.eightVialPrice), Math.round(30 * 160.64 / 23 * 100) / 100);
assert.equal(price(option.tenVialPrice), Math.round(30 * 190.4 / 23 * 100) / 100);
assert.equal(catalog.featured.filter(p => p.slug === 'ahk-cu').length, 1);
assert(product.hasUpdatedLabel);
const artwork = context.window.JONEZIE_NEW_LABELS.find(p => p.slug === 'ahk-cu');
assert.equal(product.image, artwork.image);
assert(fs.existsSync(path.join(root, artwork.image)));
assert(fs.existsSync(path.join(root, artwork.thumbnail)));
assert.match(context.window.JONEZIE_PRODUCT_CONTENT.products['ahk-cu'].shortDescription, /100 mg in a 3 mL vial/);

const page = read('products/ahk-cu.html');
assert.match(page, /data-product-slug="ahk-cu"/);
assert(page.includes(`data-product-hero-image src="${artwork.image}"`));
assert(page.includes('https://www.jonezielabs.com/products/ahk-cu.html'));
assert(page.includes('"price": "30.00"'));
assert(page.includes('$209.53') && page.includes('$248.35'));
assert.equal((page.match(/data-option-code=/g) || []).length, 1);
assert(read('sitemap.xml').includes('https://www.jonezielabs.com/products/ahk-cu.html'));
const codes = catalog.products.flatMap(p => p.options.map(o => o.code));
assert.equal(new Set(codes).size, codes.length, 'Option codes remain unique for checkout');
console.log('PASS: AHK-CU 100mg only, $30 single, standard kit pricing, unique SKU, approved artwork, homepage feature, static product page and sitemap.');
