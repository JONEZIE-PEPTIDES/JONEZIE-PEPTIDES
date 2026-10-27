const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const code = read('new-labels.js');
const approved = [...code.match(/const approved = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const current = [...new Set([...read('catalog-image-overrides.js').matchAll(/assets\/products\/20261022\/([^']+)\.webp/g)].map(m => m[1]))];
assert.deepEqual([...approved].sort(), current.sort());
assert.equal(new Set(approved).size, 32);
assert(!approved.includes('tirzepatide'));
const totalBytes = approved.reduce((n, name) => n + fs.statSync(path.join(root, 'assets/products/label-reveal', `${name}.webp`)).size, 0);
assert(totalBytes < 400000);

class Element {
  constructor() { this.children = []; this.events = {}; this.dataset = {}; this.attrs = {}; this.style = { setProperty() {} }; }
  append(child) { this.children.push(child); }
  replaceChildren() { this.children = []; }
  addEventListener(name, fn) { this.events[name] = fn; }
  setAttribute(key, value) { this.attrs[key] = value; }
}

function setup({ mobile = false, reduced = false } = {}) {
  const section = new Element();
  section.offsetHeight = mobile ? 580 : 440;
  const rain = new Element(), control = new Element(), icon = new Element(), status = new Element();
  section.querySelector = key => ({ '.label-reveal-rain': rain, '.label-reveal-toggle': control, '[data-label-reveal-icon]': icon, '[data-label-reveal-status]': status })[key];
  const media = [Object.assign(new Element(), { matches: mobile }), Object.assign(new Element(), { matches: reduced })];
  const observers = [];
  const document = new Element();
  document.hidden = false;
  document.querySelector = () => section;
  document.createElement = () => new Element();
  vm.runInNewContext(code, {
    document,
    matchMedia: query => media[query.includes('reduced') ? 1 : 0],
    ResizeObserver: class { constructor(fn) { this.fn = fn; } observe() { this.fn(); } },
    IntersectionObserver: class {
      constructor(fn) { this.fn = fn; observers.push(this); }
      observe() {}
      disconnect() {}
    }
  });
  assert.equal(rain.children.length, 0, 'No image requests before proximity observer');
  observers[0].fn([{ isIntersecting: true }]);
  observers[1].fn([{ isIntersecting: true }]);
  return { section, rain, control, status, media, document, observers };
}

const desktop = setup();
assert.equal(desktop.rain.children.length, 18);
assert.equal(desktop.section.dataset.running, 'true');
desktop.control.events.click();
assert.equal(desktop.section.dataset.running, 'false');
assert.equal(desktop.control.attrs['aria-label'], 'Play product animation');
desktop.control.events.click();
assert.equal(desktop.section.dataset.running, 'true');
desktop.observers[1].fn([{ isIntersecting: false }]);
assert.equal(desktop.section.dataset.running, 'false');
desktop.observers[1].fn([{ isIntersecting: true }]);
desktop.document.hidden = true;
desktop.document.events.visibilitychange();
assert.equal(desktop.section.dataset.running, 'false');
desktop.document.hidden = false;
desktop.document.events.visibilitychange();
assert.equal(desktop.section.dataset.running, 'true');

const seen = new Set(desktop.rain.children.map(card => card.children[0].src));
for (let pass = 0; pass < 3; pass += 1) {
  for (const card of desktop.rain.children) {
    card.events.animationiteration();
    seen.add(card.children[0].src);
    assert.equal(card.children[0].alt, '');
  }
}
assert.equal(seen.size, 32, 'Every approved label must cycle');
desktop.media[1].matches = true;
desktop.media[1].events.change();
assert.equal(desktop.section.dataset.running, 'false');
assert.equal(desktop.control.disabled, true);
desktop.media[1].matches = false;
desktop.media[1].events.change();
assert.equal(desktop.section.dataset.running, 'true');
const phone = setup({ mobile: true, reduced: true });
assert.equal(phone.rain.children.length, 8);
assert.equal(phone.section.dataset.running, 'false');
assert.equal(phone.status.textContent, 'Motion reduced');

const html = read('index.html');
assert(html.indexOf('trust-section-home section-shell') < html.indexOf('id="new-labels"'));
assert(html.indexOf('id="new-labels"') < html.indexOf('id="featured"'));
assert(html.indexOf('id="featured"') < html.indexOf('data-shipping-countdown'));
assert.match(html, /class="label-reveal-link" href="#full-catalog"/);
assert.match(html, /class="label-reveal-rain" aria-hidden="true" inert/);
assert.match(read('new-labels.css'), /prefers-reduced-motion: reduce/);
console.log(`PASS: 32 current assets (${totalBytes} bytes), full cycle, lazy initialization, pause/play, offscreen and tab pause, reduced motion, mobile count, placement and catalog anchor.`);
