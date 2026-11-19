const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

async function submit(options = {}) {
  const calls = [];
  const posts = [];
  const storage = new Map();
  let handler;
  const button = { disabled: false };
  const feedback = { textContent: '' };
  const success = { hidden: true, innerHTML: '', scrollIntoView() {} };
  const form = {
    hidden: false,
    reportValidity: () => options.valid !== false,
    querySelector: () => button,
    addEventListener(name, callback) { if (name === 'submit') handler = callback; }
  };
  const location = new URL(options.url || 'https://www.jonezielabs.com/standards/checkout.html');
  const fields = { firstName: 'Test', lastName: 'Researcher', email: 'test@example.invalid', state: 'MI' };
  const context = vm.createContext({
    window: {
      location,
      JONEZIE_ORDER_REQUEST_CONFIG: options.noEndpoint ? {} : { endpoint: 'https://example.invalid/orders' },
      oaiq(...args) {
        if (options.pixelFailure && args[0] === 'measure') throw new Error('Pixel unavailable');
        calls.push(args);
      }
    },
    document: {
      querySelector(selector) {
        return ({ '[data-merch-checkout-form]': form, '[data-merch-checkout-feedback]': feedback,
          '[data-merch-checkout-success]': success })[selector] || null;
      },
      querySelectorAll: () => []
    },
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    location,
    FormData: class { get(key) { return fields[key] || ''; } },
    fetch: async (url, init) => {
      if (options.failedPost) throw new Error('Network unavailable');
      posts.push(JSON.parse(init.body));
      return {};
    }
  });
  vm.runInContext(read('standards/merch-data.js'), context);
  const config = context.window.JONEZIE_STANDARDS_MERCH;
  if (!options.empty) storage.set(config.cartKey, JSON.stringify([{ ...config.products[0], quantity: 1 }]));
  vm.runInContext(read('analytics-events.js'), context);
  vm.runInContext(read('standards/merch-store.js'), context);
  assert.equal(calls.filter((entry) => entry[0] === 'measure').length, 0, 'Loading checkout must not create a lead');
  await handler({ preventDefault() {} });
  return { leads: calls.filter((entry) => entry[0] === 'measure'), posts, storage, config, form, success, feedback };
}

(async () => {
  const live = await submit();
  assert.equal(live.posts.length, 1);
  assert.equal(live.leads.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(live.leads[0])), ['measure', 'lead_created', { type: 'customer_action' }, { opt_out: true }]);
  assert.equal(live.posts[0].customer.email, 'test@example.invalid');
  assert.equal(JSON.stringify(live.leads).includes('test@example.invalid'), false);
  assert.equal(live.form.hidden, true);
  assert.equal(live.success.hidden, false);
  for (const options of [{ failedPost: true }, { noEndpoint: true }, { empty: true }, { valid: false }]) {
    const rejected = await submit(options);
    assert.equal(rejected.leads.length, 0);
    assert.equal(rejected.form.hidden, false);
    assert.equal(rejected.success.hidden, true);
  }
  const preview = await submit({ url: 'https://jonezie-peptides.github.io/jonezie-labs-staging/standards/checkout.html' });
  assert.equal(preview.posts.length, 0);
  assert.equal(preview.leads.length, 0);
  assert.equal(preview.success.hidden, false);
  const failedPixel = await submit({ pixelFailure: true });
  assert.equal(failedPixel.posts.length, 1);
  assert.equal(failedPixel.form.hidden, true);
  assert.equal(failedPixel.success.hidden, false);
  for (const page of ['standards/index.html', 'standards/checkout.html']) {
    assert.match(read(page), /analytics-events\.js\?v=20261119standardsorders1/);
    assert.match(read(page), /merch-store\.js\?v=20261119standardsorders1/);
  }
  console.log('Standards OpenAI order tracking: live success, failed posts, invalid/empty forms, staging previews, and pixel failures pass.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
