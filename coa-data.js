/* COA workflow, owner confirmed 2026-11-22:
 * Each submitted product lot applies to all currently listed strengths of that product.
 * Populate coveredStrengths from that product's active catalog options for new reports.
 * Keep sampleStrength, contentMg, label claim, and every assay faithful to the tested vial.
 * Never substitute one compound's report for another product or blend.
 */
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
  },
  {
    id: 'JL-20261116-VRYT-01',
    slug: 'tirzepatide',
    compound: 'Tirzepatide',
    lot: 'JLTZ2634',
    laboratoryBatch: 'JL-20261116-VRYT',
    sampleStrength: '15mg',
    coveredStrengths: ['10mg', '15mg', '20mg', '30mg'],
    coverageSource: 'Owner confirmed submitted product lots cover all listed strengths going forward on 2026-11-22.',
    laboratory: 'KMD Analytical',
    method: 'HPLC-DAD',
    received: '2026-11-16',
    analyzed: '2026-11-20',
    issued: '2026-11-22',
    purityPercent: '99.99',
    contentMg: '14.89',
    labelClaimMg: '15',
    percentOfClaim: '99.3',
    retentionMinutes: '8.350',
    identity: 'Conforms · RT + UV against reference',
    overall: 'Conforms to the report’s specification',
    reportUrl: 'https://kmdanalytical.com/coa/JL-20261116-VRYT-01',
    pdfUrl: 'assets/coa/KMD-COA-JL-20261116-VRYT-01.pdf',
    pdfSha256: 'c2781b0cef055007b3a5e5d550274022f707be9c1067b7eaf81c25eae01c632d',
    results: [
      { test: 'Appearance', specification: 'White lyophilized powder', result: 'Clear, colorless', status: 'Conforms' },
      { test: 'Purity · HPLC peak area', specification: '≥ 95.0%', result: '99.99%', status: 'Conforms' },
      { test: 'Content · tested 15mg vial', specification: '≥ 90% of the 15mg label claim', result: '14.89mg · 99.3% of claim', status: 'Conforms' }
    ]
  },
  {
    "id": "JL-20261116-RXSX-01",
    "slug": "nad",
    "compound": "NAD+",
    "lot": "JLND53442",
    "laboratoryBatch": "JL-20261116-RXSX",
    "sampleStrength": "500mg",
    "coveredStrengths": [
      "100mg",
      "500mg",
      "1000mg"
    ],
    "coverageSource": "Owner confirmed submitted product lots cover all listed strengths going forward on 2026-11-22.",
    "laboratory": "KMD Analytical",
    "method": "HPLC-DAD",
    "received": "2026-11-16",
    "analyzed": "2026-11-19",
    "issued": "2026-11-22",
    "purityPercent": "99.97",
    "contentMg": "511.80",
    "labelClaimMg": "500",
    "percentOfClaim": "102.4",
    "retentionMinutes": "1.519",
    "identity": "Conforms · RT + UV against reference",
    "overall": "Conforms to the report’s specification",
    "reportUrl": "https://kmdanalytical.com/coa/JL-20261116-RXSX-01",
    "pdfUrl": "assets/coa/KMD-COA-JL-20261116-RXSX-01.pdf",
    "pdfSha256": "cf106bcdc6f54afaaadd11ff10cdbf8bf3ba7e10b143565d409c9c9739882c88",
    "results": [
      {
        "test": "Appearance",
        "specification": "White lyophilized powder",
        "result": "Clear, colorless",
        "status": "Conforms"
      },
      {
        "test": "Purity · HPLC peak area",
        "specification": "≥ 95.0%",
        "result": "99.97%",
        "status": "Conforms"
      },
      {
        "test": "Content · tested 500mg vial",
        "specification": "≥ 90% of the 500mg label claim",
        "result": "511.80mg · 102.4% of claim",
        "status": "Conforms"
      }
    ]
  },
  {
    "id": "JL-20261116-S4FG-01",
    "slug": "tesamorelin",
    "compound": "Tesamorelin",
    "lot": "JLTSA1477",
    "laboratoryBatch": "JL-20261116-S4FG",
    "sampleStrength": "10mg",
    "coveredStrengths": [
      "5mg",
      "10mg",
      "15mg"
    ],
    "coverageSource": "Owner confirmed submitted product lots cover all listed strengths going forward on 2026-11-22.",
    "laboratory": "KMD Analytical",
    "method": "HPLC-DAD",
    "received": "2026-11-16",
    "analyzed": "2026-11-19",
    "issued": "2026-11-22",
    "purityPercent": "99.98",
    "contentMg": "9.93",
    "labelClaimMg": "10",
    "percentOfClaim": "99.3",
    "retentionMinutes": "9.202",
    "identity": "Conforms · RT + UV against reference",
    "overall": "Conforms to the report’s specification",
    "reportUrl": "https://kmdanalytical.com/coa/JL-20261116-S4FG-01",
    "pdfUrl": "assets/coa/KMD-COA-JL-20261116-S4FG-01.pdf",
    "pdfSha256": "67a23a325cc2d827231f0b44e323fdf6a7d73a28c91f6c8b5eca7c6902f1049e",
    "results": [
      {
        "test": "Appearance",
        "specification": "White lyophilized powder",
        "result": "Clear, colorless",
        "status": "Conforms"
      },
      {
        "test": "Purity · HPLC peak area",
        "specification": "≥ 95.0%",
        "result": "99.98%",
        "status": "Conforms"
      },
      {
        "test": "Content · tested 10mg vial",
        "specification": "≥ 90% of the 10mg label claim",
        "result": "9.93mg · 99.3% of claim",
        "status": "Conforms"
      }
    ]
  },
  {
    "id": "JL-20261116-EQTM-01",
    "slug": "bpc-157",
    "compound": "BPC-157",
    "lot": "JLBPC6246",
    "laboratoryBatch": "JL-20261116-EQTM",
    "sampleStrength": "10mg",
    "coveredStrengths": [
      "5mg",
      "10mg"
    ],
    "coverageSource": "Owner confirmed submitted product lots cover all listed strengths going forward on 2026-11-22.",
    "laboratory": "KMD Analytical",
    "method": "HPLC-DAD",
    "received": "2026-11-16",
    "analyzed": "2026-11-19",
    "issued": "2026-11-22",
    "purityPercent": "99.99",
    "contentMg": "11.03",
    "labelClaimMg": "10",
    "percentOfClaim": "110.3",
    "retentionMinutes": "6.520",
    "identity": "Conforms · RT + UV against reference",
    "overall": "Conforms to the report’s specification",
    "reportUrl": "https://kmdanalytical.com/coa/JL-20261116-EQTM-01",
    "pdfUrl": "assets/coa/KMD-COA-JL-20261116-EQTM-01.pdf",
    "pdfSha256": "f14a204d551acd116c16f3f84a609a4e9f91d4ad51d18aebeaa6161cf944afff",
    "results": [
      {
        "test": "Appearance",
        "specification": "White lyophilized powder",
        "result": "Clear, colorless",
        "status": "Conforms"
      },
      {
        "test": "Purity · HPLC peak area",
        "specification": "≥ 95.0%",
        "result": "99.99%",
        "status": "Conforms"
      },
      {
        "test": "Content · tested 10mg vial",
        "specification": "≥ 90% of the 10mg label claim",
        "result": "11.03mg · 110.3% of claim",
        "status": "Conforms"
      }
    ]
  },
  {
    "id": "JL-20261116-P87A-01",
    "slug": "mots-c",
    "compound": "MOTS-c",
    "lot": "JLMOT4001",
    "laboratoryBatch": "JL-20261116-P87A",
    "sampleStrength": "10mg",
    "coveredStrengths": [
      "10mg",
      "40mg"
    ],
    "coverageSource": "Owner confirmed submitted product lots cover all listed strengths going forward on 2026-11-22.",
    "laboratory": "KMD Analytical",
    "method": "HPLC-DAD",
    "received": "2026-11-16",
    "analyzed": "2026-11-19",
    "issued": "2026-11-22",
    "purityPercent": "99.98",
    "contentMg": "13.04",
    "labelClaimMg": "10",
    "percentOfClaim": "130.4",
    "retentionMinutes": "8.776",
    "identity": "Conforms · RT + UV against reference",
    "overall": "Conforms to the report’s specification",
    "reportUrl": "https://kmdanalytical.com/coa/JL-20261116-P87A-01",
    "pdfUrl": "assets/coa/KMD-COA-JL-20261116-P87A-01.pdf",
    "pdfSha256": "2d7f68a1ae337daa8a20c8edf23b5fd16a754f2577fe8b904fc506f4d8cdc756",
    "results": [
      {
        "test": "Appearance",
        "specification": "White lyophilized powder",
        "result": "Clear, colorless",
        "status": "Conforms"
      },
      {
        "test": "Purity · HPLC peak area",
        "specification": "≥ 95.0%",
        "result": "99.98%",
        "status": "Conforms"
      },
      {
        "test": "Content · tested 10mg vial",
        "specification": "≥ 90% of the 10mg label claim",
        "result": "13.04mg · 130.4% of claim",
        "status": "Conforms"
      }
    ]
  }
];
