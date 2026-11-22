/* Lab findings stay tied to the tested sample; shared-lot coverage is owner supplied. */
window.JONEZIE_COA_RECORDS = [
  {
    id: 'JL-20261116-EB3D-01',
    slug: 'ghk-cu',
    compound: 'GHK-Cu',
    lot: 'JLGHK3552',
    laboratoryBatch: 'JL-20261116-EB3D',
    sampleStrength: '50mg',
    coveredStrengths: ['50mg', '100mg'],
    coverageSource: 'Owner confirmed this lot supplies both GHK-Cu strengths on 2026-11-21.',
    laboratory: 'KMD Analytical',
    method: 'HPLC-DAD',
    received: '2026-11-16',
    analyzed: '2026-11-19',
    issued: '2026-11-20',
    purityPercent: '99.99',
    contentMg: '49.63',
    labelClaimMg: '50',
    percentOfClaim: '99.3',
    retentionMinutes: '0.851',
    identity: 'Conforms · RT + UV against reference',
    overall: 'Conforms to the report’s specification',
    reportUrl: 'https://kmdanalytical.com/coa/JL-20261116-EB3D-01',
    results: [
      { test: 'Appearance', specification: 'Blue lyophilized powder', result: 'Clear, blue', status: 'Conforms' },
      { test: 'Purity · HPLC peak area', specification: '≥ 95.0%', result: '99.99%', status: 'Conforms' },
      { test: 'Content · tested 50mg vial', specification: '≥ 90% of the 50mg label claim', result: '49.63mg · 99.3% of claim', status: 'Conforms' }
    ]
  },
  {
    id: 'JL-20261116-5XEC-01',
    slug: 'retatrutide',
    compound: 'GLP-3(RT)',
    lot: 'JLRT1110',
    laboratoryBatch: 'JL-20261116-5XEC',
    sampleStrength: '10mg',
    coveredStrengths: ['10mg', '15mg', '20mg', '30mg'],
    coverageSource: 'Owner confirmed this lot supplies all four GLP-3(RT) strengths on 2026-11-22.',
    laboratory: 'KMD Analytical',
    method: 'HPLC-DAD',
    received: '2026-11-16',
    analyzed: '2026-11-20',
    issued: '2026-11-22',
    purityPercent: '99.99',
    contentMg: '9.97',
    labelClaimMg: '10',
    percentOfClaim: '99.7',
    retentionMinutes: '8.167',
    identity: 'Conforms · RT + UV against reference',
    overall: 'Conforms to the report’s specification',
    reportUrl: 'https://kmdanalytical.com/coa/JL-20261116-5XEC-01',
    pdfUrl: 'assets/coa/KMD-COA-JL-20261116-5XEC-01.pdf',
    pdfSha256: '9b692b5e12fc4872d0078aa9c479c00efe2e99664ec4a168ccacdd3c0080ea6f',
    results: [
      { test: 'Appearance', specification: 'White lyophilized powder', result: 'Clear, colorless', status: 'Conforms' },
      { test: 'Purity · HPLC peak area', specification: '≥ 95.0%', result: '99.99%', status: 'Conforms' },
      { test: 'Content · tested 10mg vial', specification: '≥ 90% of the 10mg label claim', result: '9.97mg · 99.7% of claim', status: 'Conforms' }
    ]
  }
];
