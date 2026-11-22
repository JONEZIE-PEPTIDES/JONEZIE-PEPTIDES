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

test('tirzepatide keeps its 15mg sample and unchanged source PDF separate from GLP-3(RT)', () => {
  const report = api.recordsFor('tirzepatide', '15mg')[0];
  assert.equal(report.id, 'JL-20261116-VRYT-01');
  assert.equal(report.lot, 'JLTZ2634');
  assert.equal(report.sampleStrength, '15mg');
  assert.equal(report.labelClaimMg, '15');
  assert.equal(report.contentMg, '14.89');
  assert.equal(report.purityPercent, '99.99');
  assert.equal(report.percentOfClaim, '99.3');
  assert.equal(report.retentionMinutes, '8.350');
  assert.equal(report.analyzed, '2026-11-20');
  assert.equal(report.issued, '2026-11-22');
  assert.equal(report.reportUrl, 'https://kmdanalytical.com/coa/JL-20261116-VRYT-01');
  for (const strength of ['10mg', '15mg', '20mg', '30mg']) {
    assert.equal(api.recordsFor('tirzepatide', strength)[0], report);
    assert.equal(api.recordsFor('tirzepatide', strength)[0].sampleStrength, '15mg');
  }
  const pdf = fs.readFileSync(path.join(__dirname, '..', report.pdfUrl));
  assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'), report.pdfSha256);
  assert.notEqual(api.recordsFor('retatrutide', '15mg')[0].id, report.id);
  assert.equal(api.recordsFor('tirzepatide', '50mg').length, 0);
});

test('the four additional certificates preserve their own assays, lots, tested strengths, and source PDFs', () => {
  const expected = [
    ['nad', 'RXSX', 'JLND53442', '500', ['100mg', '500mg', '1000mg'], '99.97', '511.80', '102.4', '1.519', 'cf106bcdc6f54afaaadd11ff10cdbf8bf3ba7e10b143565d409c9c9739882c88'],
    ['tesamorelin', 'S4FG', 'JLTSA1477', '10', ['5mg', '10mg', '15mg'], '99.98', '9.93', '99.3', '9.202', '67a23a325cc2d827231f0b44e323fdf6a7d73a28c91f6c8b5eca7c6902f1049e'],
    ['bpc-157', 'EQTM', 'JLBPC6246', '10', ['5mg', '10mg'], '99.99', '11.03', '110.3', '6.520', 'f14a204d551acd116c16f3f84a609a4e9f91d4ad51d18aebeaa6161cf944afff'],
    ['mots-c', 'P87A', 'JLMOT4001', '10', ['10mg', '40mg'], '99.98', '13.04', '130.4', '8.776', '2d7f68a1ae337daa8a20c8edf23b5fd16a754f2577fe8b904fc506f4d8cdc756']
  ];
  for (const [slug, code, lot, claim, strengths, purity, content, percent, retention, sha] of expected) {
    const id = `JL-20261116-${code}-01`;
    const report = api.recordsFor(slug, `${claim}mg`)[0];
    assert.equal(report.id, id);
    assert.equal(report.lot, lot);
    assert.equal(report.laboratoryBatch, `JL-20261116-${code}`);
    assert.equal(report.sampleStrength, `${claim}mg`);
    assert.equal(report.labelClaimMg, claim);
    assert.equal(report.purityPercent, purity);
    assert.equal(report.contentMg, content);
    assert.equal(report.percentOfClaim, percent);
    assert.equal(report.retentionMinutes, retention);
    assert.equal(report.received, '2026-11-16');
    assert.equal(report.analyzed, '2026-11-19');
    assert.equal(report.issued, '2026-11-22');
    assert.equal(report.reportUrl, `https://kmdanalytical.com/coa/${id}`);
    assert.equal(report.pdfUrl, `assets/coa/KMD-COA-${id}.pdf`);
    assert.equal(report.results[2].result, `${content}mg · ${percent}% of claim`);
    for (const strength of strengths) assert.equal(api.recordsFor(slug, strength)[0], report);
    const pdf = fs.readFileSync(path.join(__dirname, '..', report.pdfUrl));
    assert.equal(report.pdfSha256, sha);
    assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'), sha);
    assert.equal(api.recordsFor(slug, '2000mg').length, 0);
  }
  for (const slug of ['bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg', 'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg']) {
    assert.equal(api.recordsFor(slug, '10mg').length, 0);
  }
});

test('the owner’s shared-lot workflow covers each product’s currently listed strengths', () => {
  const catalogContext = { window: {}, document: { querySelector: () => null } };
  vm.createContext(catalogContext);
  for (const file of ['catalog-data.js', 'catalog-sheet-sync.js', 'catalog-admin-config.js', 'catalog-admin.js', 'new-label-products.js', 'catalog-image-overrides.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), catalogContext);
  }
  const products = catalogContext.window.JONEZIE_CATALOG.products;
  const slugs = new Set(context.window.JONEZIE_COA_RECORDS.map(record => record.slug));
  for (const slug of slugs) {
    const product = products.find(product => product.slug === slug);
    assert(product, slug);
    for (const option of product.options) assert(api.recordsFor(slug, option.mgOption).length, `${slug} ${option.mgOption}`);
  }
});
