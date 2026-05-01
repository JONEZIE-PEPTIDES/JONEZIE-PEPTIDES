(() => {
  const catalog = window.JONEZIE_CATALOG;
  if (!catalog) return;
  const FEATURED_WITH_NEW_ART = [
    'retatrutide',
    'mots-c',
    'tesamorelin',
    'semax',
    'mt-1',
    'tb500',
    'glutathione',
    'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg',
    'ghk-cu',
    'selank',
    'bpc-157',
    'nad'
  ];

  const IMAGE_OVERRIDES_BY_SLUG = {
    somatropin: 'somatropin-official.png',
    'mt-2': 'mt-2-10mg-official.png',
    'pt-141': 'pt-141-official.png',
    'oxytocin-acetate': 'oxytocin-acetate-official.png',
    epithalon: 'epithalon-official.png',
    'bpc-157': 'bpc-157-new-new-hero-product-image.webp',
    'bpc-5mg-plus-tb-5mg': 'wolverine-official.png',
    'bpc-10mg-plus-tb-10mg': 'wolverine-official.png',
    semax: 'semax-new-new-hero-product-image.webp',
    'ss-31': 'ss-31-official.png',
    'cjc-1295-without-dac': 'cjc-1295-without-dac-official.png',
    hcg: 'hcg-official.png',
    aod: 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/AOD_5MG_3ML_Vial_Jonezie_Labs_.webp?v=20260501a',
    tesamorelin: 'tesa-new-new-hero-product-image.png',
    'bac-water': 'bac-water-official.png',
    'ghk-cu': 'ghk-cu-new-new-hero-product-image.webp',
    'mots-c': 'mots-c-new-new-hero-product-image.png',
    'cjc-1295-with-dac': 'cjc-1295-with-dac-official.png',
    'kisspeptin-10': 'kisspeptin-10-official.png',
    dermorphin: 'dermorphin-official.png',
    dsip: 'dsip-official.png',
    glutathione: 'glutathione-new-new-hero-product-image.webp',
    cagrilintide: 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/Cagrilintide_10MG_3ML_Vial.webp?v=20260501a',
    'cagrilintide-2-5mg-plus-semaglutide-2-5mg': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/CAG_SEMA_5MG_3ML_Vial.webp?v=20260501a',
    'cagrilintide-5mg-plus-semaglutide-5mg': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/CAG_SEMA_10MG_3ML_Vial.webp?v=20260501a',
    hmg: 'hmg-official.png',
    cerebrolysin: 'cerebrolysin-official.png',
    'ara-290': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/ARA-290_10MG_3ML_Vial.webp?v=20260501a',
    'snap-8': 'snap-8-official.png',
    pnc27: 'pnc27-official.png',
    tb500: 'tb500-new-new-hero-product-image.webp',
    'ghrp-6-acetate': 'ghrp-6-acetate-official.png',
    'cjc-1295-without-dac-plus-ipamorelin': 'cjc-1295-without-dac-official.png',
    'ghk-cu-35mg-plus-tb-500-10mg-plus-bpc-157-5mg': 'glow-official.png',
    'ghk-cu-50mg-plus-kpv-10mg-plus-bpc-157-10mg': 'klow-official.png',
    'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg': 'klow-official.png',
    'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg': 'glow-new-new-hero-product-image.webp',
    nad: 'nad-new-new-hero-product-image.webp',
    survodutide: 'survodutide-official.png',
    semaglutide: 'semaglutide-20mg-official.png',
    'tirzepatide': 'tirzepatide-15mg-official.png',
    retatrutide: 'reta-new-new-hero-product-image.webp',
    'mt-1': 'mt-1-new-new-hero-product-image.webp',
    mt1: 'mt-1-new-new-hero-product-image.webp',
    'melanotan-1': 'mt-1-new-new-hero-product-image.webp',
    'slu-pp-322': 'slu-pp-322-official.png',
    'lemon-bottle': 'lemon-bottle-official.png',
    'igf-1lr3': 'igf-1lr3-official.png',
    ipamorelin: 'ipamorelin-official.png',
    pinealon: 'pinealon-official.png',
    selank: 'selank-new-new-hero-product-image.webp',
    vip: 'vip-official.png',
    mazdutide: 'mazdutide-official.png',
    'thymosin-alpha-1': 'thymosin-alpha-1-official.png',
    lc216: 'lc216-official.png'
  };

  function applyOverrides(list) {
    if (!Array.isArray(list)) return;
    list.forEach((product) => {
      const override = IMAGE_OVERRIDES_BY_SLUG[product?.slug];
      if (override) product.image = override;
    });
  }

  const featuredLookup = new Map(
    [...(catalog.featured || []), ...(catalog.products || [])]
      .filter((product) => product?.slug)
      .map((product) => [product.slug, product])
  );

  catalog.featured = FEATURED_WITH_NEW_ART
    .map((slug) => featuredLookup.get(slug))
    .filter(Boolean);

  applyOverrides(catalog.featured);
  applyOverrides(catalog.products);
})();
