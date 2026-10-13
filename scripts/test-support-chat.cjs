const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'support-chat.js'), 'utf8');
const testId = 'e93e073a-1f69-4cbc-8934-f9e1611e65bb';

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

const disabled = run(source);
assert.equal(disabled.appended.length, 0);
assert.equal(disabled.window.CRISP_WEBSITE_ID, undefined);

const enabled = run(source.replace("const websiteId = '';", `const websiteId = '${testId}';`));
assert.equal(enabled.window.CRISP_WEBSITE_ID, testId);
assert.equal(enabled.appended.length, 1);
assert.equal(enabled.appended[0].src, 'https://client.crisp.chat/l.js');
assert.equal(enabled.appended[0].async, true);
vm.runInContext(source.replace("const websiteId = '';", `const websiteId = '${testId}';`), enabled.context);
assert.equal(enabled.appended.length, 1);

for (const file of ['standards/index.html', 'standards/checkout.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(html, /<script src="\.\.\/support-chat\.js\?v=20261013staging1" async><\/script>/);
}

console.log('Support chat staging loader checks passed.');
