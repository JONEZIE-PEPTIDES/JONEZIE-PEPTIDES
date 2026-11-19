const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const data = fs.readFileSync(path.join(root, 'standards/merch-data.js'), 'utf8');

function redirect(page, query = '', override = {}) {
  const calls = [];
  const timers = [];
  const location = new URL(`https://www.jonezielabs.com/${page}${query}`);
  location.replace = (url) => calls.push(url);
  const context = vm.createContext({
    window: { location, setTimeout: (callback, delay) => timers.push({ callback, delay }) },
    document: { documentElement: { classList: { add() {} } } },
    URL,
    URLSearchParams
  });
  vm.runInContext(data, context);
  Object.assign(context.window.JONEZIE_STANDARDS_MERCH.redirect, override);
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const script = scripts.find((code) => code.includes('const standardsRedirect ='));
  assert.ok(script, `${page} must contain the redirect handler`);
  vm.runInContext(script, context);
  return { calls, timers };
}

for (const page of ['standards/index.html', 'standards/checkout.html']) {
  assert.deepEqual(redirect(page).calls, ['https://www.jonezielabs.com/']);
  const tracked = redirect(page, '?utm_source=chatgpt&utm_medium=paid&utm_campaign=order_requests&oppref=offline-test&olref=offline-view&ttclid=offline-tiktok&gclid=offline-google&email=private&rev=old');
  assert.equal(tracked.calls.length, 1);
  const destination = new URL(tracked.calls[0]);
  assert.equal(destination.origin, 'https://www.jonezielabs.com');
  assert.equal(destination.pathname, '/');
  for (const [key, value] of Object.entries({ utm_source: 'chatgpt', utm_medium: 'paid', utm_campaign: 'order_requests', oppref: 'offline-test', olref: 'offline-view', ttclid: 'offline-tiktok', gclid: 'offline-google' })) {
    assert.equal(destination.searchParams.get(key), value);
  }
  assert.equal(destination.searchParams.has('email'), false);
  assert.equal(destination.searchParams.has('rev'), false);
  const targetQuery = new URL(redirect(page, '?utm_source=incoming', { target: 'https://www.jonezielabs.com/?utm_source=configured#featured' }).calls[0]);
  assert.equal(targetQuery.searchParams.get('utm_source'), 'configured');
  assert.equal(targetQuery.hash, '#featured');
  assert.equal(redirect(page, '?oppref=offline-test', { enabled: false }).calls.length, 0);
  const delayed = redirect(page, '?utm_campaign=delayed', { delayMs: 100 });
  assert.equal(delayed.calls.length, 0);
  assert.equal(delayed.timers[0].delay, 100);
  delayed.timers[0].callback();
  assert.equal(new URL(delayed.calls[0]).searchParams.get('utm_campaign'), 'delayed');
}

console.log('Standards homepage redirects preserve ad attribution, configured query values, and the off/delay controls.');
