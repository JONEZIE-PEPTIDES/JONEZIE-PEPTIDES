const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const code = read('new-labels.js');
const window = {};
vm.runInNewContext(read('new-label-products.js'), { window });
const approved = window.JONEZIE_NEW_LABELS;
assert.equal(new Set(approved.map(item => item.slug)).size, approved.length);
assert(!approved.some(item => item.image.endsWith('/tirzepatide.webp')));
const totalBytes = approved.reduce((n, item) => n + fs.statSync(path.join(root, item.thumbnail)).size, 0);
assert(totalBytes < 400000);

class Element {
  constructor() {
    this.children = []; this.events = {}; this.dataset = {}; this.attrs = {};
    this.properties = {};
    this.style = { setProperty: (key, value) => { this.properties[key] = value; } };
  }
  append(child) { this.children.push(child); }
  replaceChildren() { this.children = []; }
  addEventListener(name, fn) { this.events[name] = fn; }
  setAttribute(key, value) { this.attrs[key] = value; }
}

function setup({ mobile = false, reduced = false } = {}) {
  const section = new Element();
  section.offsetHeight = mobile ? 580 : 440;
  const rain = new Element();
  section.querySelector = key => ({ '.label-reveal-rain': rain })[key];
  const media = [Object.assign(new Element(), { matches: mobile }), Object.assign(new Element(), { matches: reduced })];
  const observers = [];
  const document = new Element();
  document.hidden = false;
  document.querySelector = () => section;
  document.createElement = () => new Element();
  vm.runInNewContext(code, {
    window,
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
  return { section, rain, media, document, observers };
}

const desktop = setup();
assert.equal(desktop.rain.children.length, 18);
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
assert.equal(seen.size, approved.length, 'Every approved label must cycle');
desktop.media[1].matches = true;
desktop.media[1].events.change();
assert.equal(desktop.section.dataset.running, 'false');
desktop.media[1].matches = false;
desktop.media[1].events.change();
assert.equal(desktop.section.dataset.running, 'true');
const phone = setup({ mobile: true, reduced: true });
assert.equal(phone.rain.children.length, 8);
assert.equal(phone.section.dataset.running, 'false');

function checkContinuousRain({ section, rain }, mobile) {
  const lanes = new Map();
  const cards = rain.children.map(card => {
    const value = key => parseFloat(card.properties[key]);
    const duration = value('--card-duration');
    const phase = -value('--card-delay') / duration;
    const lane = card.properties['--card-x'];
    const result = { duration, phase, size: value('--card-size'), lane };
    if (!lanes.has(lane)) lanes.set(lane, []);
    lanes.get(lane).push(result);
    return result;
  });
  for (const laneCards of lanes.values()) {
    assert.equal(new Set(laneCards.map(card => card.duration)).size, 1, 'Cards in one lane must share a speed');
    const phases = laneCards.map(card => card.phase).sort((a, b) => a - b);
    phases.forEach((phase, index) => {
      const next = index + 1 < phases.length ? phases[index + 1] : phases[0] + 1;
      assert(Math.abs(next - phase - 1 / phases.length) < 1e-9, 'Cards in one lane must remain evenly staggered');
    });
  }
  const height = section.offsetHeight;
  assert.equal(section.properties['--reveal-travel'], `${height + 24}px`);
  assert(read('new-labels.css').includes('translate3d(-50%, calc(-100% - 24px), 0)'));
  // Include the mobile copy mask, not just cards hidden behind the text.
  const zones = mobile ? [[0, height * 0.18], [height * 0.84, height]] : [[0, height]];
  let minimum = cards.length;
  for (let step = 0; step <= 29700; step += 1) {
    const seconds = step / 10; // Complete repeating period of the 27/30/33-second loops.
    const positions = new Map();
    const count = cards.filter(({ duration, phase, size, lane }) => {
      const progress = (phase + seconds / duration) % 1;
      const top = -size - 24 + progress * (height + size + 48);
      if (!positions.has(lane)) positions.set(lane, []);
      positions.get(lane).push({ top, bottom: top + size });
      return zones.some(([start, end]) => Math.min(top + size, end) - Math.max(top, start) >= 16);
    }).length;
    for (const lanePositions of positions.values()) {
      lanePositions.sort((a, b) => a.top - b.top);
      for (let index = 1; index < lanePositions.length; index += 1) {
        assert(
          lanePositions[index - 1].bottom <= lanePositions[index].top,
          `Cards in one lane overlap after ${seconds.toFixed(1)} seconds`,
        );
      }
    }
    minimum = Math.min(minimum, count);
  }
  assert(minimum >= (mobile ? 2 : 10), `Rain must stay visible throughout all loops (minimum ${minimum})`);
}
checkContinuousRain(desktop, false);
checkContinuousRain(phone, true);

const html = read('index.html');
assert(html.indexOf('trust-section-home section-shell') < html.indexOf('id="new-labels"'));
assert(html.indexOf('id="new-labels"') < html.indexOf('id="featured"'));
assert(html.indexOf('id="featured"') < html.indexOf('data-shipping-countdown'));
assert.match(html, /class="label-reveal-link" href="catalog.html">Explore the new look<\/a>/);
assert.match(html, /class="label-reveal-rain" aria-hidden="true" inert/);
assert.match(read('new-labels.css'), /prefers-reduced-motion: reduce/);
assert(!html.includes('label-reveal-toggle'), 'No animation toggle in the announcement');
assert(!read('new-labels.css').includes('reveal-cypress'), 'Use the native blue-black palette');
console.log(`PASS: ${approved.length} current assets (${totalBytes} bytes), continuous staggered desktop/mobile loops, full cycle, lazy initialization, offscreen and tab pause, reduced motion, mobile count, placement and catalog navigation.`);
