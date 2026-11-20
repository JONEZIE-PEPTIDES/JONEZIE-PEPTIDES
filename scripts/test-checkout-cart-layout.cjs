const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'checkout.js'), 'utf8');
const previewStart = source.indexOf('function updateCartPreview(');
const previewEnd = source.indexOf('\ncartToggle?.addEventListener', previewStart);
const renderStart = source.indexOf('function renderCart(');
const renderEnd = source.indexOf('\nfunction updateCartPreview(', renderStart);

test('large-cart preview exposes every product on expansion and excludes hidden controls when collapsed', () => {
  const cards = Array.from({ length: 8 }, () => ({ hidden: false }));
  const attributes = {};
  const context = {
    cartPreviewExpanded: false,
    cartRoot: { querySelectorAll: () => cards },
    cartToggle: { hidden: false, setAttribute: (key, value) => { attributes[key] = value; } }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(previewStart, previewEnd), context);
  context.updateCartPreview(8);
  assert.equal(cards.filter(card => !card.hidden).length, 3);
  assert.equal(attributes['aria-expanded'], 'false');
  assert.equal(context.cartToggle.textContent, 'Show all 8 products');
  context.cartPreviewExpanded = true;
  context.updateCartPreview(8);
  assert.equal(cards.filter(card => !card.hidden).length, 8);
  assert.equal(attributes['aria-expanded'], 'true');
  context.updateCartPreview(2);
  assert.equal(context.cartToggle.hidden, true);
});

test('submitted order moves into the visible full-width confirmation host', () => {
  let rendered = 0;
  const cartRoot = { parentElement: {} };
  const completedOrderHost = { appendChild: node => { node.parentElement = completedOrderHost; } };
  const context = {
    cashCard: null, cartRoot, completedOrderHost, submittedOrderSnapshot: { orderId: 'LAYOUT-TEST' },
    renderSubmittedOrderPremium: () => { rendered++; }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(renderStart, renderEnd), context);
  context.renderCart();
  assert.equal(cartRoot.parentElement, completedOrderHost);
  assert.equal(rendered, 1);
  context.renderCart();
  assert.equal(rendered, 2);
});
