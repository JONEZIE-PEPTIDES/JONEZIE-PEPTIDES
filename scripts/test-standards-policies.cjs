const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const policyRoot = path.join(root, 'standards', 'policies');
const pages = ['terms.html', 'privacy.html', 'research-use.html', 'shipping-policy.html', 'returns-refunds.html'];
const article = (html) => html.match(/<article class="legal-article">([\s\S]*?)<\/article>/)?.[1];

for (const file of pages) {
  const original = fs.readFileSync(path.join(root, file), 'utf8');
  const copy = fs.readFileSync(path.join(policyRoot, file), 'utf8');
  assert.equal(article(copy), article(original), `${file} policy text changed`);
  assert.match(copy, /noindex,nofollow,noarchive/);
  assert.doesNotMatch(copy, /href="(?:\.\.\/){2}(?:index|catalog|checkout)\.html/);
  for (const [, href] of copy.matchAll(/href="([^"]+\.html)(?:#[^"]*)?"/g)) {
    assert.ok(fs.existsSync(path.resolve(policyRoot, href)), `${file} has a broken link: ${href}`);
  }
}
console.log('Standards policies match current legal text and link only within Standards: OK');
