const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'support-chat.js'), 'utf8');
const websiteId = '17a74d8e-fc64-43cc-83e4-ea5b69b5835e';

function run(scriptSource) {
  const elements = new Map();
  const appended = [];
  const document = {
    getElementById: (id) => elements.get(id) || null,
    createElement: (tag) => ({ tag }),
    head: {
      appendChild(element) {
        elements.set(element.id, element);
        appended.push(element);
      }
    }
  };
  const window = {};
  const context = vm.createContext({ document, window });
  vm.runInContext(scriptSource, context);
  return { context, window, appended };
}

const disabled = run(source.replace(websiteId, ''));
assert.equal(disabled.appended.length, 0);
assert.equal(disabled.window.CRISP_WEBSITE_ID, undefined);

const enabled = run(source);
assert.equal(enabled.window.CRISP_WEBSITE_ID, websiteId);
assert.equal(enabled.appended.length, 2);
assert.equal(enabled.appended[0].id, 'jonezie-chat-launcher-style');
assert.match(enabled.appended[0].textContent, /#crisp-chatbox \[data-id="chat_opened"\]/);
assert.match(enabled.appended[0].textContent, /#crisp-chatbox \[data-id="chat_closed"\]/);
assert.match(enabled.appended[0].textContent, /\[class\*="--visitor"\]\[class\*="--text"\]/);
assert.match(enabled.appended[0].textContent, /background: #9ff3d2/);
assert.equal(enabled.appended[1].src, 'https://client.crisp.chat/l.js');
assert.equal(enabled.appended[1].async, true);
vm.runInContext(source, enabled.context);
assert.equal(enabled.appended.length, 2);

for (const file of ['standards/index.html', 'standards/checkout.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(html, /<script src="\.\.\/support-chat\.js\?v=20261013staging2" async><\/script>/);
}

for (const file of [
  'standards/about/index.html',
  'standards/contact/index.html',
  'standards/faq/index.html',
  'standards/standards/index.html'
]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(html, /<script src="\.\.\/\.\.\/support-chat\.js\?v=20261013staging2" async><\/script>/);
}

console.log('Support chat staging loader checks passed.');
