const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const crypto = require('node:crypto');
const context = { window: {}, Intl, Date };
vm.createContext(context);
for (const file of ['coa-data.js', 'coa-panel.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
const api = context.window.JONEZIE_BATCH_COA;

test('owner-confirmed shared lot resolves both GHK-Cu strengths to the original tested sample', () => {
  const fifty = api.recordsFor('ghk-cu', '50mg')[0];
  const hundred = api.recordsFor('ghk-cu', '100 MG')[0];
  assert.equal(fifty, hundred);
  assert.equal(hundred.sampleStrength, '50mg');
  assert.equal(hundred.contentMg, '49.63');
  assert.equal(hundred.purityPercent, '99.99');
  assert.equal(hundred.lot, 'JLGHK3552');
  assert.equal(hundred.reportUrl, 'https://kmdanalytical.com/coa/JL-20261116-EB3D-01');
});

test('a GHK-Cu result cannot be substituted for another compound, blend, or unconfirmed strength', () => {
  for (const [slug, strength] of [['semaglutide', '50mg'], ['bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg', '70mg'], ['ghk-cu', '150mg'], ['ghk-cu', '5mg'], ['ghk-cu', '']]) {
    assert.equal(api.recordsFor(slug, strength).length, 0);
  }
});

test('GLP-3(RT) results retain the exact tested sample values and original PDF', () => {
  const report = api.recordsFor('retatrutide', '10mg')[0];
  assert.equal(report.id, 'JL-20261116-5XEC-01');
  assert.equal(report.lot, 'JLRT1110');
  assert.equal(report.sampleStrength, '10mg');
  assert.equal(report.labelClaimMg, '10');
  assert.equal(report.contentMg, '9.97');
  assert.equal(report.purityPercent, '99.99');
  assert.equal(report.percentOfClaim, '99.7');
  assert.equal(report.retentionMinutes, '8.167');
  assert.equal(report.analyzed, '2026-11-20');
  assert.equal(report.issued, '2026-11-22');
  assert.equal(report.reportUrl, 'https://kmdanalytical.com/coa/JL-20261116-5XEC-01');
  for (const strength of ['10mg', '15mg', '20mg', '30mg']) {
    assert.equal(api.recordsFor('retatrutide', strength)[0], report);
    assert.equal(api.recordsFor('retatrutide', strength)[0].sampleStrength, '10mg');
  }
  const pdf = fs.readFileSync(path.join(__dirname, '..', report.pdfUrl));
  assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'), report.pdfSha256);
  assert.equal(api.recordsFor('ghk-cu', '10mg').length, 0);
  assert.equal(api.recordsFor('retatrutide', '50mg').length, 0);
});
