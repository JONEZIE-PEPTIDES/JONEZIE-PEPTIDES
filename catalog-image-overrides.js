(() => {
  const catalog = window.JONEZIE_CATALOG;
  if (!catalog) return;

  const IMAGE_OVERRIDES_BY_SLUG = {
    somatropin: 'somatropin-official.png',
    'mt-2': 'mt-2-10mg-official.png',
    'pt-141': 'pt-141-official.png',
    'oxytocin-acetate': 'oxytocin-acetate-official.png',
    epithalon: 'epithalon-official.png',
    'bpc-157': 'bpc-157-10mg-official.png',
    'bpc-5mg-plus-tb-5mg': 'wolverine-official.png',
    'bpc-10mg-plus-tb-10mg': 'wolverine-official.png',
    semax: 'semax-official.png',
    'ss-31': 'ss-31-official.png',
    'cjc-1295-without-dac': 'cjc-1295-without-dac-official.png',
    hcg: 'hcg-official.png',
    aod: 'aod-official.png',
    tesamorelin: 'tesamorelin-official.png',
    'ghk-cu': 'ghk-cu-100mg-official.png',
    'mots-c': 'mots-c-official.png',
    'kisspeptin-10': 'kisspeptin-10-official.png',
    dermorphin: 'dermorphin-official.png',
    glutathione: 'glutathione-official.png',
    cagrilintide: 'cagrilintide-official.png',
    'cagrilintide-2-5mg-plus-semaglutide-2-5mg': 'cagrilintide-semaglutide-official.png',
    'cagrilintide-5mg-plus-semaglutide-5mg': 'cagrilintide-semaglutide-official.png',
    hmg: 'hmg-official.png',
    cerebrolysin: 'cerebrolysin-official.png',
    'ara-290': 'ara-290-official.png',
    'snap-8': 'snap-8-official.png',
    pnc27: 'pnc27-official.png',
    tb500: 'tb500-official.png',
    'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg': 'klow-official.png',
    'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg': 'glow-official.png',
    nad: 'nad-official.png',
    survodutide: 'survodutide-official.png',
    semaglutide: 'semaglutide-20mg-official.png',
    'tirzepatide': 'tirzepatide-15mg-official.png',
    retatrutide: 'reta-20mg-official.png',
    'mt-1': 'mt-1-10mg-official.png',
    mt1: 'mt-1-10mg-official.png',
    'melanotan-1': 'mt-1-10mg-official.png'
  };

  function applyOverrides(list) {
    if (!Array.isArray(list)) return;
    list.forEach((product) => {
      const override = IMAGE_OVERRIDES_BY_SLUG[product?.slug];
      if (override) product.image = override;
    });
  }

  applyOverrides(catalog.featured);
  applyOverrides(catalog.products);
})();
