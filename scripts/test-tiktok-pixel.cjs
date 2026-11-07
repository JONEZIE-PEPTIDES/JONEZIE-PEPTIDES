const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const pixelCode = fs.readFileSync(path.join(root, 'tiktok-pixel.js'), 'utf8');
const analyticsCode = fs.readFileSync(path.join(root, 'analytics-events.js'), 'utf8');

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
product.window.oaiq = () => {};
vm.runInNewContext(analyticsCode, { window: product.window });
product.window.JONEZIE_ANALYTICS.viewItem({ slug: 'retatrutide', name: 'Retatrutide' });
product.window.JONEZIE_ANALYTICS.addToCart({ slug: 'retatrutide', name: 'Retatrutide', quantity: 1 });
assert.equal(product.window.ttq[1][0], 'track');
assert.equal(product.window.ttq[1][1], 'ViewContent');
assert.equal(product.window.ttq[1][2].content_id, 'retatrutide');
assert.equal(product.window.ttq[1][2].contents[0].content_id, 'retatrutide');
assert.equal(product.window.ttq[2][0], 'track');
assert.equal(product.window.ttq[2][1], 'AddToCart');
assert.equal(product.window.ttq[2][2].content_id, 'retatrutide');

const checkout = load('https://www.jonezielabs.com/checkout.html?ad=fall40');
checkout.window.JONEZIE_TIKTOK_PIXEL.trackCheckoutStart();
checkout.window.JONEZIE_TIKTOK_PIXEL.trackCheckoutStart();
checkout.window.JONEZIE_TIKTOK_PIXEL.trackOrderRequest('JL-TEST-1');
checkout.window.JONEZIE_TIKTOK_PIXEL.trackOrderRequest('JL-TEST-1');
assert.deepEqual(Array.from(checkout.window.ttq[1]), ['track', 'InitiateCheckout']);
assert.deepEqual(Array.from(checkout.window.ttq[2]), ['track', 'Lead']);
assert.equal(checkout.window.ttq.length, 3, 'One checkout and order request produce one event each');
assert.equal(checkout.window.ttq.some((entry) => entry[1] === 'Purchase'), false);

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
  assert.match(html, /<script src="tiktok-pixel\.js\?v=20261107b"><\/script>/, file);
}

console.log('TikTok ad-path context, actual funnel events, lead deduplication, and page coverage verified.');
