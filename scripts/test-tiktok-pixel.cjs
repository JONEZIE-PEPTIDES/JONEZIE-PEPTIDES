const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const pixelCode = fs.readFileSync(path.join(root, 'tiktok-pixel.js'), 'utf8');

function load(url) {
  const location = new URL(url);
  const scripts = [];
  const parentNode = { appendChild(script) { scripts.push(script); } };
  const context = vm.createContext({
    window: { location },
    document: {
      createElement() { return {}; },
      getElementsByTagName() { return [{ parentNode }]; },
      head: parentNode
    },
    URLSearchParams,
    Date,
    Set
  });
  vm.runInContext(pixelCode, context, { filename: 'tiktok-pixel.js' });
  return { window: context.window, scripts };
}

const entry = load('https://www.jonezielabs.com/research-entry.html');
assert.equal(entry.window.JONEZIE_TIKTOK_PIXEL.enabled, true);
assert.equal(entry.scripts.length, 1);
assert.match(entry.scripts[0].src, /sdkid=DBMCCORC77U1OI24UGKG/);
assert.deepEqual(Array.from(entry.window.ttq[0]), ['page']);

const product = load('https://www.jonezielabs.com/products/retatrutide.html?ad=fall40');
assert.equal(product.window.JONEZIE_TIKTOK_PIXEL.enabled, true);
assert.equal(product.scripts.length, 1);

const checkout = load('https://www.jonezielabs.com/checkout.html?ad=fall40');
checkout.window.JONEZIE_TIKTOK_PIXEL.trackOrderRequest('JL-TEST-1');
checkout.window.JONEZIE_TIKTOK_PIXEL.trackOrderRequest('JL-TEST-1');
assert.deepEqual(Array.from(checkout.window.ttq[1]), ['track', 'Lead']);
assert.equal(checkout.window.ttq.length, 2, 'One order request produces one lead');

for (const url of [
  'https://www.jonezielabs.com/checkout.html',
  'https://www.jonezielabs.com/products/retatrutide.html',
  'https://jonezie-peptides.github.io/jonezie-labs-staging/research-entry.html',
  'http://127.0.0.1:8035/research-store.html'
]) {
  const visit = load(url);
  assert.equal(visit.window.JONEZIE_TIKTOK_PIXEL.enabled, false, url);
  assert.equal(visit.scripts.length, 0, url);
  visit.window.JONEZIE_TIKTOK_PIXEL.trackOrderRequest('JL-TEST-2');
  assert.equal(visit.window.ttq, undefined, url);
}

for (const file of [
  'research-entry.html', 'research-store.html', 'product.html', 'checkout.html',
  ...fs.readdirSync(path.join(root, 'products')).filter((file) => file.endsWith('.html')).map((file) => `products/${file}`)
]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(html, /<script src="tiktok-pixel\.js\?v=20261105a"><\/script>/, file);
}

console.log('TikTok pixel context, lead deduplication, and page coverage verified.');
