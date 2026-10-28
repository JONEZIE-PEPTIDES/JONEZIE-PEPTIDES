const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const context = vm.createContext({ window: {}, document: { querySelector: () => null } });
for (const file of ['catalog-data.js', 'catalog-sheet-sync.js', 'catalog-admin-config.js', 'catalog-admin.js', 'new-label-products.js']) {
  vm.runInContext(read(file), context);
}
const catalog = context.window.JONEZIE_CATALOG;
const before = JSON.parse(JSON.stringify(catalog.products));
vm.runInContext(read('catalog-image-overrides.js'), context);
const labels = Array.from(context.window.JONEZIE_NEW_LABELS);
const featured = Array.from(catalog.featured);
assert.equal(labels.length, 35);
assert.deepEqual(featured.map(p => p.slug), labels.map(p => p.slug));
assert(featured.every(p => p.hasUpdatedLabel));
const order = featured.map(p => p.slug);
assert(Math.abs(order.indexOf('tesamorelin') - order.indexOf('mots-c')) - 1 >= 4);
assert(order.includes('b12-10000mcg-10ml'));
assert(order.includes('semaglutide'));
assert(order.includes('bpc-5mg-plus-tb-5mg'));
for (const item of labels) {
  assert(fs.existsSync(path.join(root, item.image)), item.image);
  assert(fs.existsSync(path.join(root, item.thumbnail)), item.thumbnail);
  assert.equal(catalog.products.find(p => p.slug === item.slug).image, item.image);
}
const stripPresentation = product => {
  const { image, hasUpdatedLabel, name, searchAliases, ...data } = product;
  return data;
};
assert.deepEqual(JSON.parse(JSON.stringify(catalog.products)).map(stripPresentation), before.map(stripPresentation), 'Inventory, options and prices stay unchanged');

// A future approved entry should feature automatically without another list edit.
context.window.JONEZIE_NEW_LABELS.push({ slug: 'oxytocin-acetate', image: 'test-hero.webp', thumbnail: 'test-thumb.webp' });
vm.runInContext(read('catalog-image-overrides.js'), context);
assert.equal(catalog.featured.length, labels.length + 1);
assert.equal(catalog.featured.at(-1).slug, 'oxytocin-acetate');
assert.equal(catalog.featured.at(-1).image, 'test-hero.webp');

const home = read('index.html'), full = read('catalog.html');
const styles = read('styles.css');
for (const selector of ['product-card', 'catalog-card']) {
  const imageRule = styles.match(new RegExp(`\\.${selector} img \\{([^}]+)\\}`))[1];
  assert.match(imageRule, /height: auto;/, 'Old-label images keep their original natural sizing');
  assert.match(imageRule, /object-fit: contain;/);
}
assert.match(styles, /\.product-card-media \{\s*--product-frame-height: 270px;/);
assert.match(styles, /\.product-card-media \{ --product-frame-height: 240px; \}/);
assert(!home.includes('.product-card img'), 'Homepage must not override shared compact image sizing');
assert.equal(read('script.js').split('data-updated-label="${Boolean(product.hasUpdatedLabel)}"').length - 1, 2);
assert.equal(read('script.js').split("product.hasUpdatedLabel ? '<div class=\"product-card-media\">'").length - 1, 2);
assert.match(styles, /width: min\(100%, var\(--product-frame-height\)\);\s*height: auto;\s*aspect-ratio: 1;/);
assert(styles.includes('transparent, #000 20%, #000 80%, transparent'), 'The complete vial stays in the opaque center');
assert(fs.statSync(path.join(root, 'assets/products/card-studio-background.webp')).size < 30000);
assert(!home.includes('data-catalog-grid'));
assert(home.includes('data-featured-grid'));
assert.match(home, /class="featured-catalog-action">\s*<a[^>]*href="catalog.html">View full catalog<\/a>/);
assert(full.includes('data-catalog-grid'));
assert(!full.includes('data-featured-grid'));
assert(!full.includes('new-labels.js'));
assert(full.includes('https://www.jonezielabs.com/catalog.html'));
assert(read('nav-search.js').includes("['catalog.html', 'Full Products']"));
assert(read('site-footer.js').includes('${ROOT}catalog.html'));
const legacy = home.match(/<script>\s*(function redirectLegacyCatalog[\s\S]*?)<\/script>/)[1];
let redirected;
vm.runInNewContext(legacy, { location: { hash: '#full-catalog', replace: url => { redirected = url; } }, window: { addEventListener() {} } });
assert.equal(redirected, 'catalog.html');
for (const file of cp.execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' }).trim().split('\n').concat('catalog.html')) {
  const html = read(file), override = html.indexOf('<script src="catalog-image-overrides.js');
  if (override < 0) continue;
  const manifest = html.indexOf('<script src="new-label-products.js');
  assert(manifest >= 0 && manifest < override, file + ' must load approved labels first');
}
console.log('PASS: 35 approved features, four-product MOTS/Tesa gap, automatic future inclusion, unchanged catalog pricing/options, separate catalog, legacy redirect and shared script ordering.');
