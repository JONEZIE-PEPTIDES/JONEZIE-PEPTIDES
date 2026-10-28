const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('index.html');
const css = read('styles.css');
const sceneScript = read('featured-promo.js');
const promo = home.slice(home.indexOf('<div class="featured-promo">'), home.indexOf('<div class="featured-grid"'));

assert(promo.includes('25% <span>OFF</span>'));
assert(promo.includes('Sitewide'));
assert(promo.includes('FALL25'));
assert(promo.includes('Buy 3+ units'));
assert(promo.includes('Get a free Jonezie case'));
assert(promo.includes('For research use only.'));
assert(promo.includes('width="960" height="640" loading="lazy" decoding="async"'));
assert(!promo.includes('<video'), 'The regenerated composition replaces the portrait video, not its original file');
assert(!promo.includes('<button'), 'Do not add purchase or promotional buttons');
assert(home.includes('src="featured-promo.js?'));
assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.featured-promo-row::before, \.featured-case-art \{ animation: none; \}/);
assert.match(css, /animation: featured-case-reveal 4\.5s ease-in-out both;/);
assert.match(css, /animation-play-state: var\(--promo-play-state\);/);
assert(fs.statSync(path.join(root, 'assets/promos/featured-case-scene-v1-480.webp')).size < 35000);
assert(fs.statSync(path.join(root, 'assets/promos/featured-case-scene-v1-960.webp')).size < 100000);

const scene = { dataset: {} };
let observeCallback, visibilityCallback, observed;
class Observer {
  constructor(callback) { observeCallback = callback; }
  observe(element) { observed = element; }
}
const document = {
  hidden: false,
  querySelector: () => scene,
  addEventListener: (event, callback) => { assert.equal(event, 'visibilitychange'); visibilityCallback = callback; }
};
vm.runInNewContext(sceneScript, { document, window: { IntersectionObserver: Observer }, IntersectionObserver: Observer });
assert.equal(observed, scene);
observeCallback([{ isIntersecting: true }]);
assert.equal(scene.dataset.active, 'true');
observeCallback([{ isIntersecting: false }]);
assert.equal(scene.dataset.active, 'false');
observeCallback([{ isIntersecting: true }]);
document.hidden = true;
visibilityCallback();
assert.equal(scene.dataset.active, 'false');
document.hidden = false;
visibilityCallback();
assert.equal(scene.dataset.active, 'true');
vm.runInNewContext(sceneScript, { document, window: {} });
vm.runInNewContext(sceneScript, { document: { querySelector: () => null }, window: {} });

// Run the existing countdown unchanged across the Eastern shipping cutoff.
const countdownScript = home.match(/<script>\s*(\(\(\) => \{\s*const countdown =[\s\S]*?)<\/script>/)[1];
function runClock(iso) {
  let now = Date.parse(iso), tick;
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } }
  const nodes = Object.fromEntries(['hours', 'minutes', 'seconds', 'message'].map(key => [`[data-countdown-${key}]`, { textContent: '' }]));
  vm.runInNewContext(countdownScript, {
    Date: Clock,
    Intl,
    document: { querySelector: () => ({ querySelector: selector => nodes[selector] }) },
    window: { setInterval: (callback, ms) => { assert.equal(ms, 1000); tick = callback; } }
  });
  const values = () => ['hours', 'minutes', 'seconds', 'message'].map(key => nodes[`[data-countdown-${key}]`].textContent);
  const initial = values();
  now += 1000;
  tick();
  return { initial, after: values() };
}
assert.deepEqual(runClock('2026-10-28T21:00:00Z'), { initial: ['05', '00', '00', 'Ships Today'], after: ['04', '59', '59', 'Ships Today'] });
assert.deepEqual(runClock('2026-10-29T02:00:00Z'), { initial: ['24', '00', '00', 'Next Shipment Window'], after: ['23', '59', '59', 'Next Shipment Window'] });
console.log('PASS: live offer copy, responsive artwork budgets, finite/reduced motion, viewport/visibility pause, countdown ticking and Eastern cutoff unchanged.');
