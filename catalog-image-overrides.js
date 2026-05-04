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
    'mt-2': 'mt-2-new-hero-product-image.webp',
    'pt-141': 'pt-141-new-hero-product-image.webp',
    'oxytocin-acetate': 'oxytocin-acetate-new-hero-product-image.webp',
    epithalon: 'epithalon-new-hero-product-image.webp',
    'bpc-157': 'bpc-157-new-new-hero-product-image.webp',
    'bpc-5mg-plus-tb-5mg': 'wolverine-official.png',
    'bpc-10mg-plus-tb-10mg': 'wolverine-official.png',
    semax: 'semax-new-new-hero-product-image.webp',
    'ss-31': 'ss-31-official.png',
    'cjc-1295-without-dac': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/CJC_1295_10MG_3ML_Vial.webp?v=20260501h',
    hcg: 'hcg-new-hero-product-image.webp',
    aod: 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/AOD_5MG_3ML_Vial_Jonezie_Labs_.webp?v=20260501a',
    tesamorelin: 'tesa-new-new-hero-product-image.png',
    'bac-water': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/BAC_WATER_10ML_Vial.webp?v=20260501h',
    'ghk-cu': 'ghk-cu-new-new-hero-product-image.webp',
    'mots-c': 'mots-c-new-new-hero-product-image.png',
    'cjc-1295-with-dac': 'cjc-1295-with-dac-official.png',
    'kisspeptin-10': 'kisspeptin-new-hero-product-image.webp',
    dermorphin: 'dermorphin-new-hero-product-image.webp',
    dsip: 'dsip-new-hero-product-image.webp',
    glutathione: 'glutathione-new-new-hero-product-image.webp',
    cagrilintide: 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/Cagrilintide_10MG_3ML_Vial.webp?v=20260501a',
    'cagrilintide-2-5mg-plus-semaglutide-2-5mg': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/CAG_SEMA_5MG_3ML_Vial.webp?v=20260501a',
    'cagrilintide-5mg-plus-semaglutide-5mg': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/CAG_SEMA_10MG_3ML_Vial.webp?v=20260501a',
    hmg: 'hmg-new-hero-product-image.webp',
    cerebrolysin: 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/CEREBROLYSIN_60MG_3ML_Vial.webp?v=20260501h',
    'ara-290': 'OFFICAL%20PRODUCT%20IMAGES%20FOR%20JONEZIE%20LABS%20SITE/ARA-290_10MG_3ML_Vial.webp?v=20260501a',
    'snap-8': 'snap-8-official.png',
    pnc27: 'pnc27-new-hero-product-image.webp',
    tb500: 'tb500-new-new-hero-product-image.webp',
    'ghrp-6-acetate': 'ghrp-6-new-hero-product-image.webp',
    'cjc-1295-without-dac-plus-ipamorelin': 'cjc-1295-without-dac-official.png',
    'ghk-cu-35mg-plus-tb-500-10mg-plus-bpc-157-5mg': 'glow-official.png',
    'ghk-cu-50mg-plus-kpv-10mg-plus-bpc-157-10mg': 'klow-official.png',
    'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg': 'klow-new-hero-product-image.webp',
    'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg': 'glow-new-new-hero-product-image.webp',
    nad: 'nad-new-new-hero-product-image.webp',
    survodutide: 'survodutide-official.png',
    semaglutide: 'semaglutide-new-hero-product-image.webp',
    'tirzepatide': 'tirzepatide-15mg-official.png',
    retatrutide: 'reta-new-new-hero-product-image.webp',
    'mt-1': 'mt-1-new-new-hero-product-image.webp',
    mt1: 'mt-1-new-new-hero-product-image.webp',
    'melanotan-1': 'mt-1-new-new-hero-product-image.webp',
    'slu-pp-322': 'slu-pp-322-official.png',
    'lemon-bottle': 'lemon-bottle-new-hero-product-image.webp',
    'igf-1lr3': 'igf-1lr3-new-hero-product-image.webp',
    ipamorelin: 'ipamorelin-new-hero-product-image.webp',
    pinealon: 'pinealon-new-hero-product-image.webp',
    selank: 'selank-new-new-hero-product-image.webp',
    vip: 'vip-official.png',
    mazdutide: 'mazdutide-new-hero-product-image.webp',
    'thymosin-alpha-1': 'thymosin-alpha-1-official.png',
    lc216: 'lc216-new-hero-product-image.webp'
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

  function syncMerchCards() {
    const merchSection = document.querySelector('#merch');
    if (!merchSection) return;

    const removeDescription = (article) => {
      article?.querySelectorAll('.merch-copy > p:not(.eyebrow)').forEach((node) => node.remove());
    };

    const setEyebrow = (article, label) => {
      const eyebrow = article?.querySelector('.merch-copy .eyebrow');
      if (eyebrow) eyebrow.textContent = label;
    };

    const setPrice = (article, price) => {
      const priceNode = [...(article?.querySelectorAll('.merch-meta span') || [])]
        .find((node) => node.textContent.trim().toLowerCase().startsWith('price:'));
      if (priceNode) priceNode.textContent = `Price: $${price}`;
      const purchase = article?.querySelector('[data-merch-purchase]');
      if (purchase) purchase.setAttribute('data-merch-price', price);
    };

    const hotGirlPurchase = merchSection.querySelector('[data-merch-slug="hot-girl-summer-sticker"]');
    const hotGirlArticle = hotGirlPurchase?.closest('.merch-product');
    if (hotGirlArticle) {
      const hotGirlImage = 'assets/Lables%20and%20stickers/hot_girl_summer_jonezie_sticker_black_background.webp?v=20260501b';
      const image = hotGirlArticle.querySelector('.sticker-art img, .merch-card img');
      if (image) {
        image.src = hotGirlImage;
        image.alt = 'Hot Girl Summer sticker';
        image.onerror = () => image.closest('.sticker-art')?.classList.add('is-missing-art');
      }
      setEyebrow(hotGirlArticle, 'Sticker');
      setPrice(hotGirlArticle, '3.00');
      hotGirlPurchase.setAttribute('data-merch-image', hotGirlImage);
      hotGirlPurchase.setAttribute('data-merch-name', 'Hot Girl Summer Sticker');
      removeDescription(hotGirlArticle);
    }

    if (!merchSection.querySelector('[data-merch-slug="summer-stack-bros-sticker"]')) {
      const summerStackCard = document.createElement('article');
      summerStackCard.className = 'merch-product merch-product-sticker';
      summerStackCard.innerHTML = `
        <div class="sticker-art" data-merch-zoom role="button" tabindex="0" aria-label="Open larger image of Summer Stack Bros sticker">
          <img src="assets/Lables%20and%20stickers/beach_volleyball_showdown_with_lively_vials.webp" alt="Summer Stack Bros sticker" onerror="this.closest('.sticker-art').classList.add('is-missing-art')" />
        </div>
        <div class="merch-copy compact-copy">
          <p class="eyebrow">Sticker</p>
          <h3>Summer Stack Bros</h3>
          <div class="merch-meta">
            <span>Price: $3.00</span>
            <span>Sticker format</span>
          </div>
          <div class="merch-purchase" data-merch-purchase data-merch-slug="summer-stack-bros-sticker" data-merch-name="Summer Stack Bros Sticker" data-merch-image="assets/Lables%20and%20stickers/beach_volleyball_showdown_with_lively_vials.webp" data-merch-price="3.00">
            <div class="merch-purchase-row">
              <label>Format</label>
              <select data-merch-size>
                <option value="Standard">Standard</option>
              </select>
            </div>
            <div class="merch-purchase-row">
              <label>Quantity</label>
              <div class="merch-qty-control">
                <button type="button" data-merch-qty-minus aria-label="Decrease quantity">-</button>
                <input data-merch-qty type="number" min="1" value="1" inputmode="numeric" />
                <button type="button" data-merch-qty-plus aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="button primary merch-add-button" type="button" data-merch-add>Add To Cart</button>
            <p class="merch-add-feedback" data-merch-feedback aria-live="polite"></p>
          </div>
        </div>`;
      hotGirlArticle?.after(summerStackCard);
    }

    const hatArticle = merchSection.querySelector('[data-merch-slug="jonezie-labs-signature-hat"]')?.closest('.merch-product');
    setEyebrow(hatArticle, 'Hat');
    removeDescription(hatArticle);

    const shirtArticle = merchSection.querySelector('[data-merch-slug="hot-girl-summer-shirt"]')?.closest('.merch-product');
    setEyebrow(shirtArticle, 'Shirt');
    removeDescription(shirtArticle);
  }

  syncMerchCards();
})();
