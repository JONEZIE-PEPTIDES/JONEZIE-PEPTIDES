const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const checkout = fs.readFileSync(path.join(__dirname, '..', 'checkout.js'), 'utf8');
const start = checkout.indexOf('function buildOrderRequestSubmission(');
const end = checkout.indexOf('async function submitOrderRequest(', start);
assert.ok(start >= 0 && end > start);
const buildSubmission = vm.runInNewContext(checkout.slice(start, end) + '\nbuildOrderRequestSubmission');
const backend = fs.readFileSync(path.join(__dirname, '..', 'google-apps-script', 'order-request', 'Code.gs'), 'utf8');

function submitOrder(fields = {}) {
  const emails = [];
  const context = {
    MailApp: { sendEmail: email => emails.push(email) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: value => ({ value, setMimeType() { return this; } })
    }
  };
  vm.runInNewContext(backend, context);
  const request = {
    orderId: 'JL-TEST-1',
    customer: { name: 'Test Customer', email: 'customer@example.com' },
    totals: { estimatedTotalDisplay: '$120.00' },
    notes: 'Sample delivery instructions.',
    items: [],
    ...fields
  };
  const submission = buildSubmission(request);
  assert.equal(request.notes, 'Sample delivery instructions.');
  const result = context.doPost({ postData: { contents: JSON.stringify(submission) } });
  assert.equal(JSON.parse(result.value).ok, true);
  assert.equal(emails.length, 2);
  return emails;
}

test('the existing order email surfaces the partner code and credit request in the owner notes', () => {
  const [owner, customer] = submitOrder({
    partnerOffer: { code: 'ZLEONARD', refCode: 'example123' },
    creditRequest: { code: 'SAMPLE', amountRequestedDisplay: '$20.00' }
  });
  const orderNotes = owner.body.split('RAW CHECKOUT PAYLOAD')[0];
  assert.match(orderNotes, /Notes: Sample delivery instructions\./);
  assert.match(orderNotes, /Partner discount code: ZLEONARD/);
  assert.match(orderNotes, /RefRef tracking code: example123/);
  assert.match(orderNotes, /Jonezie Cash requested: \$20.00/);
  assert.match(orderNotes, /only after full Square payment/);
  assert.doesNotMatch(customer.body, /example123|SAMPLE/);
});

test('ordinary orders still send both emails with unmodified notes', () => {
  const [owner, customer] = submitOrder();
  assert.match(owner.body, /Notes: Sample delivery instructions\./);
  assert.equal(customer.to, 'customer@example.com');
  assert.equal(customer.cc, 'orders@jonezielabs.com');
  assert.doesNotMatch(owner.body + customer.body, /RefRef tracking code|Jonezie Cash/);
});
