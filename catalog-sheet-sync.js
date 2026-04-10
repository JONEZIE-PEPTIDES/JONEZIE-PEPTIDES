(() => {
  const PRODUCT_ROWS = [
    ['Somatropin', '10iu', 34.5, 230.4, 252],
    ['Somatropin', '12iu', 40.25, 268.8, 294],
    ['Somatropin', '15iu', 46, 38.4, 336],
    ['Somatropin', '24iu', 69, 460.8, 504],
    ['Somatropin', '36iu', 97.75, 652.8, 714],
    ['MT-1', '5mg', 25.875, 172.8, 189],
    ['MT-2 (Melanotan 2 Acetate)', '10mg', 25.875, 172.8, 189],
    ['PT-141', '10mg', 28.75, 192, 210],
    ['Selank', '5mg', 23, 153.6, 168],
    ['Selank', '10mg', 31.625, 211.2, 231],
    ['Oxytocin Acetate', '2mg', 17.25, 115.2, 126],
    ['Epithalon', '10mg', 25.875, 172.8, 189],
    ['Epithalon', '50mg', 63.25, 422.4, 462],
    ['BPC157', '5mg', 23, 153.6, 168],
    ['BPC157', '10mg', 37.375, 249.6, 273],
    ['WOLVERINE (BPC 5mg + TB 5mg)', '10mg', 46, 307.2, 336],
    ['WOLVERINE (BPC 10mg + TB 10mg)', '20mg', 77.625, 518.4, 567],
    ['Semax', '5mg', 23, 153.6, 168],
    ['Semax', '10mg', 25.875, 172.8, 189],
    ['Semaglutide', '5mg', 23, 153.6, 168],
    ['Semaglutide', '10mg', 28.75, 192, 210],
    ['Semaglutide', '15mg', 34.5, 230.4, 252],
    ['Semaglutide', '20mg', 43.125, 288, 315],
    ['Semaglutide', '30mg', 54.625, 364.8, 399],
    ['SS-31', '10mg', 40.25, 268.8, 294],
    ['SS-31', '50mg', 166.75, 1113.6, 1218],
    ['Tirzepatide', '5mg', 23, 153.6, 168],
    ['Tirzepatide', '10mg', 28.75, 192, 210],
    ['Tirzepatide', '15mg', 37.375, 249.6, 273],
    ['Tirzepatide', '20mg', 46, 307.2, 336],
    ['Tirzepatide', '30mg', 54.625, 364.8, 399],
    ['Tirzepatide', '40mg', 69, 460.8, 504],
    ['Tirzepatide', '50mg', 83.375, 556.8, 609],
    ['CJC-1295 Without DAC', '5mg', 37.375, 249.6, 273],
    ['CJC-1295 Without DAC', '10mg', 63.25, 422.4, 462],
    ['HCG', '5000iu', 43.125, 288, 315],
    ['HCG', '10000iu/10vials', 77.625, 518.4, 567],
    ['AOD', '5mg', 51.75, 345.6, 378],
    ['Tesamorelin', '5mg', 46, 307.2, 336],
    ['Tesamorelin', '10mg', 83.375, 556.8, 609],
    ['Tesamorelin', '15mg', 115, 768, 840],
    ['GHK-CU', '50mg', 17.25, 115.2, 126],
    ['GHK-CU', '100mg', 23, 153.6, 168],
    ['KissPeptin-10', '5mg', 28.75, 192, 210],
    ['KissPeptin-10', '10mg', 46, 307.2, 336],
    ['MOTS-c', '10mg', 31.625, 211.2, 231],
    ['MOTS-c', '40mg', 86.25, 576, 630],
    ['Retatrutide', '10mg', 48.875, 326.4, 357],
    ['Retatrutide', '15mg', 66.125, 441.6, 483],
    ['Retatrutide', '20mg', 83.375, 556.8, 609],
    ['Retatrutide', '30mg', 115, 768, 840],
    ['Retatrutide', '36mg', 135.125, 902.4, 987],
    ['Retatrutide', '40mg', 143.75, 960, 1050],
    ['Retatrutide', '50mg', 172.5, 1152, 1260],
    ['Dermorphin', '5mg', 28.75, 192, 210],
    ['Glutathione', '600mg', 23, 153.6, 168],
    ['Glutathione', '1200mg', 31.625, 211.2, 231],
    ['Glutathione', '1500mg', 34.5, 230.4, 252],
    ['BAC Water', '10ml/10vials', 8.625, 57.6, 63],
    ['Cagrilintide2.5mg+Semaglutide2.5mg', '5mg', 46, 307.2, 336],
    ['Cagrilintide5mg+Semaglutide5mg', '10mg', 77.625, 518.4, 567],
    ['HMG', '75iu', 34.5, 230.4, 252],
    ['cerebrolysin', '60mg', 14.375, 96, 105],
    ['Cagrilintide', '5mg', 63.25, 422.4, 462],
    ['Cagrilintide', '10mg', 92, 614.4, 672],
    ['Ara-290', '10mg', 31.625, 211.2, 231],
    ['SNAP-8', '10mg', 23, 153.6, 168],
    ['Pinealon', '5mg', 23, 153.6, 168],
    ['Pinealon', '10mg', 31.625, 211.2, 231],
    ['Pinealon', '20mg', 46, 307.2, 336],
    ['PNC27', '5mg', 46, 307.2, 336],
    ['PNC27', '10mg', 74.75, 499.2, 546],
    ['KLOW (GHK-CU50+TB10+BC10+KPV10)', '80mg', 109.25, 729.6, 798],
    ['TB500', '10mg', 63.25, 422.4, 462],
    ['TB500', '5mg', 34.5, 230.4, 252],
    ['Ipamorelin', '5mg', 23, 153.6, 168],
    ['Ipamorelin', '10mg', 37.375, 249.6, 273],
    ['NAD', '100mg', 23, 153.6, 168],
    ['NAD', '500mg', 34.5, 230.4, 252],
    ['NAD', '1000mg', 69, 460.8, 504],
    ['GLOW STACK (BPC 157 10mg+GHK-CU 50mg+TB500 10mg)', '70mg', 86.25, 576, 630],
    ['Survodutide', '10mg', 135.125, 902.4, 987],
    ['SLU-PP-322', '5mg', 57.5, 384, 420],
    ['Lemon Bottle', '10mg', 34.5, 230.4, 252],
    ['IGF-1LR3', '0.1mg', 20.125, 134.4, 147],
    ['IGF-1LR3', '1mg', 97.75, 652.8, 714],
    ['VIP', '5mg', 40.25, 268.8, 294],
    ['VIP', '10mg', 69, 460.8, 504],
    ['GHRP-6 Acetate', '5mg', 14.375, 96, 105],
    ['GHRP-6 Acetate', '10mg', 24.15, 161.28, 176.4],
    ['Mazdutide', '10mg', 92, 614.4, 672],
    ['Thymalin', '10mg', 28.75, 192, 210],
    ['DSIP', '5mg', 23, 153.6, 168],
    ['DSIP', '15mg', 46, 307.2, 336],
    ['Thymosin Alpha-1', '5mg', 43.125, 288, 315],
    ['Thymosin Alpha-1', '10mg', 77.625, 518.4, 567],
    ['LC216', '10mg', 31.625, 211.2, 231]
  ];

  const FEATURED_SLUGS = ['bpc-157', 'ghk-cu', 'mots-c', 'retatrutide', 'semaglutide', 'tirzepatide'];

  const NAME_OVERRIDES = {
    bpc157: 'BPC-157',
    'mt-1': 'MT-1 (Melanotan 1)',
    'wolverine (bpc 5mg + tb 5mg)': 'Wolverine (BPC 5mg + TB 5mg)',
    'wolverine (bpc 10mg + tb 10mg)': 'Wolverine (BPC 10mg + TB 10mg)',
    'cagrilintide2.5mg+semaglutide2.5mg': 'Cagrilintide 2.5mg + Semaglutide 2.5mg',
    'cagrilintide5mg+semaglutide5mg': 'Cagrilintide 5mg + Semaglutide 5mg',
    'kisspeptin-10': 'Kisspeptin-10',
    cerebrolysin: 'Cerebrolysin',
    'glow stack (bpc 157 10mg+ghk-cu 50mg+tb500 10mg)': 'GLOW Stack (BPC 157 10mg + GHK-CU 50mg + TB500 10mg)'
  };

  const SLUG_OVERRIDES = {
    bpc157: 'bpc-157',
    'mt-1': 'mt-1',
    'mt-2 (melanotan 2 acetate)': 'mt-2',
    'wolverine (bpc 5mg + tb 5mg)': 'bpc-5mg-plus-tb-5mg',
    'wolverine (bpc 10mg + tb 10mg)': 'bpc-10mg-plus-tb-10mg',
    'cagrilintide2.5mg+semaglutide2.5mg': 'cagrilintide-2-5mg-plus-semaglutide-2-5mg',
    'cagrilintide5mg+semaglutide5mg': 'cagrilintide-5mg-plus-semaglutide-5mg',
    'klow (ghk-cu50+tb10+bc10+kpv10)': 'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg',
    'glow stack (bpc 157 10mg+ghk-cu 50mg+tb500 10mg)': 'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg',
    'cjc-1295 without dac': 'cjc-1295-without-dac',
    'ghrp-6 acetate': 'ghrp-6-acetate',
    'kisspeptin-10': 'kisspeptin-10',
    'mots-c': 'mots-c',
    'ss-31': 'ss-31',
    'igf-1lr3': 'igf-1lr3'
  };

  const CATEGORY_OVERRIDES = {
    somatropin: 'Growth',
    'mt-1': 'Aesthetics',
    'mt-2 (melanotan 2 acetate)': 'Aesthetics',
    'pt-141': 'Performance',
    selank: 'Cognitive',
    'oxytocin acetate': 'Cognitive',
    epithalon: 'Cellular',
    bpc157: 'Recovery',
    'wolverine (bpc 5mg + tb 5mg)': 'Recovery',
    'wolverine (bpc 10mg + tb 10mg)': 'Recovery',
    semax: 'Cognitive',
    semaglutide: 'Metabolic',
    'ss-31': 'Cellular',
    tirzepatide: 'Metabolic',
    'cjc-1295 without dac': 'Growth',
    hcg: 'Growth',
    aod: 'Metabolic',
    tesamorelin: 'Growth',
    'ghk-cu': 'Aesthetics',
    'kisspeptin-10': 'Performance',
    'mots-c': 'Cellular',
    retatrutide: 'Metabolic',
    dermorphin: 'Performance',
    glutathione: 'Support',
    'bac water': 'Support',
    'cagrilintide2.5mg+semaglutide2.5mg': 'Metabolic',
    'cagrilintide5mg+semaglutide5mg': 'Metabolic',
    hmg: 'Growth',
    cerebrolysin: 'Cognitive',
    cagrilintide: 'Metabolic',
    'ara-290': 'Recovery',
    'snap-8': 'Aesthetics',
    pinealon: 'Cognitive',
    pnc27: 'Cellular',
    'klow (ghk-cu50+tb10+bc10+kpv10)': 'Aesthetics',
    tb500: 'Recovery',
    ipamorelin: 'Growth',
    nad: 'Cellular',
    'glow stack (bpc 157 10mg+ghk-cu 50mg+tb500 10mg)': 'Aesthetics',
    survodutide: 'Metabolic',
    'slu-pp-322': 'Metabolic',
    'lemon bottle': 'Aesthetics',
    'igf-1lr3': 'Growth',
    vip: 'Cognitive',
    'ghrp-6 acetate': 'Growth',
    mazdutide: 'Metabolic',
    thymalin: 'Cellular',
    dsip: 'Cognitive',
    'thymosin alpha-1': 'Recovery',
    lc216: 'Performance'
  };

  const IMAGE_OVERRIDES_BY_SLUG = {
    'bpc-157': 'bpc-157-10mg-official.png',
    'ghk-cu': 'ghk-cu-100mg-official.png',
    semaglutide: 'semaglutide-20mg-official.png',
    tirzepatide: 'tirzepatide-15mg-official.png',
    retatrutide: 'retatrutide-gradient-vial.png',
    'mt-1': 'mt-1-10mg-official.png'
  };

  const DESCRIPTION_BY_CATEGORY = {
    Metabolic: 'A metabolic research compound in the active Jonezie lineup, commonly tracked for appetite, energy-balance, and glucose-signaling pathways.',
    Recovery: 'A recovery-focused research peptide used for tissue-repair, inflammatory-signaling, and resilience-pathway studies.',
    Aesthetics: 'An aesthetics-focused research product used in skin, pigmentation, collagen, or cosmetic-pathway workflows.',
    Growth: 'A growth-axis research compound used in endocrine, recovery, and body-composition signaling studies.',
    Cognitive: 'A cognitive and neuro-support research compound used in focus, stress-response, and restoration-pathway studies.',
    Cellular: 'A cellular-function research compound used in mitochondrial, longevity, or whole-cell signaling studies.',
    Performance: 'A performance research compound used in high-output, drive, and function-focused pathway studies.',
    Support: 'A support product used in laboratory handling, preparation, and workflow support.'
  };

  function toKey(value) {
    return String(value || '').trim().toLowerCase();
  }

  function formatMoney(value) {
    const number = Number(value || 0);
    return `$${number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  function inferCategory(rawName) {
    const name = String(rawName || '').toLowerCase();
    if (name.includes('semaglutide') || name.includes('tirzepatide') || name.includes('retatrutide') || name.includes('cagrilintide') || name.includes('survodutide') || name.includes('mazdutide') || name.includes('aod') || name.includes('slu-pp')) return 'Metabolic';
    if (name.includes('ghk') || name.includes('snap') || name.includes('lemon bottle') || name.includes('mt-1') || name.includes('mt-2')) return 'Aesthetics';
    if (name.includes('tb500') || name.includes('bpc') || name.includes('tesamorelin') || name.includes('thymosin alpha')) return 'Recovery';
    if (name.includes('ghrp') || name.includes('hcg') || name.includes('hmg') || name.includes('ipamorelin') || name.includes('somatropin') || name.includes('igf') || name.includes('cjc')) return 'Growth';
    if (name.includes('semax') || name.includes('selank') || name.includes('dsip') || name.includes('pinealon') || name.includes('vip') || name.includes('cerebrolysin') || name.includes('oxytocin')) return 'Cognitive';
    if (name.includes('nad') || name.includes('ss-31') || name.includes('mots') || name.includes('epithalon') || name.includes('thymalin') || name.includes('pnc')) return 'Cellular';
    return 'Support';
  }

  function parseStrengthOrder(value) {
    const match = String(value || '').toLowerCase().match(/(\d+(\.\d+)?)/);
    return match ? Number.parseFloat(match[1]) : 999999;
  }

  function getDisplayStrength(strength) {
    const cleaned = String(strength || '')
      .replace(/\/\s*\d+\s*vials?/gi, '')
      .trim();
    return cleaned || String(strength || '').trim();
  }

  function getOptionCode(slug, displayStrength, usedCodes) {
    const slugParts = String(slug || '').split('-').filter(Boolean);
    const prefix = (slugParts.length > 1
      ? slugParts.map((part) => part[0]).join('').slice(0, 3)
      : String(slug || '').slice(0, 3)).toUpperCase();

    const normalizedStrength = String(displayStrength || '').toUpperCase().replace(/\s+/g, '');
    const strengthMatch = normalizedStrength.match(/(\d+(?:\.\d+)?)([A-Z]+)/);
    let strengthToken = normalizedStrength.replace(/[^A-Z0-9]/g, '').slice(0, 8);

    if (strengthMatch) {
      const numeric = Number.parseFloat(strengthMatch[1]);
      const unit = strengthMatch[2];
      let numberToken = strengthMatch[1].replace('.', 'P');
      if (unit === 'IU' && Number.isFinite(numeric) && numeric >= 1000 && Number.isInteger(numeric / 1000)) {
        numberToken = `${numeric / 1000}K`;
      }
      strengthToken = `${numberToken}${unit}`.slice(0, 8);
    }

    let code = `${prefix}${strengthToken}`;
    if (!code) code = `OPT${usedCodes.size + 1}`;
    let index = 2;
    while (usedCodes.has(code)) {
      code = `${prefix}${strengthToken}`.slice(0, 8) + index;
      index += 1;
    }
    usedCodes.add(code);
    return code;
  }

  const byProduct = new Map();
  const usedCodes = new Set();

  PRODUCT_ROWS.forEach(([rawName, strength, single, eightPack, tenPack]) => {
    const nameKey = toKey(rawName);
    const displayName = NAME_OVERRIDES[nameKey] || rawName;
    const slug = SLUG_OVERRIDES[nameKey] || slugify(displayName);
    const category = CATEGORY_OVERRIDES[nameKey] || inferCategory(rawName);
    const displayStrength = getDisplayStrength(strength);
    const specification = String(strength).includes('vials') ? String(strength) : `${strength}*10vials`;
    const image = IMAGE_OVERRIDES_BY_SLUG[slug] || 'product-placeholder.svg';

    if (!byProduct.has(slug)) {
      byProduct.set(slug, {
        name: displayName,
        sourceName: rawName,
        slug,
        category,
        description: `${displayName} is an active ${category.toLowerCase()} listing at Jonezie. ${DESCRIPTION_BY_CATEGORY[category] || DESCRIPTION_BY_CATEGORY.Support}`,
        startingPriceSingle: '$0.00',
        startingPrice8: '$0.00',
        startingPrice10: '$0.00',
        image,
        options: []
      });
    }

    const product = byProduct.get(slug);
    const optionCode = getOptionCode(slug, displayStrength, usedCodes);
    product.options.push({
      code: optionCode,
      specification,
      mgOption: displayStrength,
      singleVialPrice: formatMoney(single),
      eightVialPrice: formatMoney(eightPack),
      tenVialPrice: formatMoney(tenPack)
    });
  });

  const products = Array.from(byProduct.values()).map((product) => {
    const sortedOptions = [...product.options].sort((a, b) => {
      const diff = parseStrengthOrder(a.mgOption) - parseStrengthOrder(b.mgOption);
      if (diff !== 0) return diff;
      return String(a.mgOption).localeCompare(String(b.mgOption));
    });
    const first = sortedOptions[0] || { singleVialPrice: '$0.00', eightVialPrice: '$0.00', tenVialPrice: '$0.00' };
    return {
      ...product,
      options: sortedOptions,
      startingPriceSingle: first.singleVialPrice,
      startingPrice8: first.eightVialPrice,
      startingPrice10: first.tenVialPrice
    };
  });

  const featured = FEATURED_SLUGS
    .map((slug) => products.find((product) => product.slug === slug))
    .filter(Boolean);

  const timestamp = new Date();
  const generatedAt = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;

  window.JONEZIE_CATALOG = {
    generatedAt,
    totalProducts: products.length,
    totalConfigurations: products.reduce((sum, product) => sum + product.options.length, 0),
    featured,
    products
  };
})();
