const CART_KEY = 'jonezie_cart';
const catalogData = window.JONEZIE_CATALOG || null;
const contentData = window.JONEZIE_PRODUCT_CONTENT || null;
const siteLibrary = window.JONEZIE_SITE_LIBRARY || null;
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const COA_ASSET_VERSION = '20260415b';
const PRODUCT_ASSET_VERSION = '20260427a';
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';
const SITE_ORIGIN = siteLibrary?.getSiteOrigin() || 'https://www.jonezielabs.com';
const COA_IMAGE_BY_SLUG = {
  'bpc-157': 'coa-bpc-157.png',
  'cjc-1295-with-dac': 'coa-cjc-1295.png',
  'cjc-1295-without-dac': 'coa-cjc-1295.png',
  'cjc-1295-without-dac-plus-ipamorelin': 'coa-cjc-1295.png',
  'cagrilintide': 'coa-cagrilintide.png',
  'cagrilintide-2-5mg-plus-semaglutide-2-5mg': 'coa-cagrilintide.png',
  'cagrilintide-5mg-plus-semaglutide-5mg': 'coa-cagrilintide.png',
  'ghk-cu': 'coa-ghk-cu.png',
  'ghk-cu-35mg-plus-tb-500-10mg-plus-bpc-157-5mg': 'coa-glow.png',
  'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg': 'coa-glow.png',
  'ghk-cu-50mg-plus-kpv-10mg-plus-bpc-157-10mg': 'coa-klow.png',
  'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg': 'coa-klow.png',
  hcg: 'coa-hcg.png',
  ipamorelin: 'coa-ipamorelin.png',
  'mots-c': 'coa-mots-c.png',
  nad: 'coa-nad.png',
  'igf-1lr3': 'coa-igf-1lr3.png',
  kpv: 'coa-kpv.png',
  retatrutide: 'coa-retatrutide.png',
  selank: 'coa-selank.png',
  semaglutide: 'coa-semaglutide.png',
  tb500: 'coa-tb500.png',
  tesamorelin: 'coa-tesamorelin.png',
  tirzepatide: 'coa-tirzepatide.png',
  vip: 'coa-vip.png'
};

if (menuToggle && siteNav && !menuToggle.dataset.menuBound) {
  menuToggle.dataset.menuBound = 'true';
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initBrandMenus() {
  const menus = document.querySelectorAll('[data-brand-menu]');
  if (!menus.length) return;

  const closeMenu = (menu) => {
    const trigger = menu.querySelector('.brand-menu-trigger');
    const panel = menu.querySelector('.brand-menu-panel');
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  };

  menus.forEach((menu) => {
    const trigger = menu.querySelector('.brand-menu-trigger');
    const panel = menu.querySelector('.brand-menu-panel');
    if (!trigger || !panel || trigger.dataset.menuBound) return;
    trigger.dataset.menuBound = 'true';

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      menus.forEach((candidate) => closeMenu(candidate));
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });

    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu(menu));
    });
  });

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (!menu.contains(event.target)) closeMenu(menu);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menus.forEach((menu) => closeMenu(menu));
  });
}

initBrandMenus();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getProductContent(product) {
  return contentData?.products?.[product.slug] || null;
}

function getProductImageSrc(path) {
  const sanitized = String(path || '').replace('../', '').trim();
  const fallback = `${PRODUCT_FALLBACK_IMAGE}?v=${PRODUCT_ASSET_VERSION}`;
  if (!sanitized) return fallback;
  if (sanitized.includes('?')) return sanitized;
  return `${sanitized}?v=${PRODUCT_ASSET_VERSION}`;
}

function getAbsoluteSiteUrl(path) {
  const normalized = String(path || '').replace(/^\.\//, '');
  return new URL(normalized, `${SITE_ORIGIN}/`).toString();
}

function upsertMeta(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  return node;
}

function upsertLink(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('link');
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  return node;
}

function setStructuredData(selector, data) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('script');
    node.type = 'application/ld+json';
    if (selector.startsWith('script[')) {
      const nameMatch = selector.match(/data-([a-z0-9-]+)/i);
      if (nameMatch) node.setAttribute(`data-${nameMatch[1]}`, '');
    }
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
}

function getProductHeaderSummary(product) {
  const productContent = getProductContent(product);
  if (siteLibrary?.getProductInfoProfile) {
    const profile = siteLibrary.getProductInfoProfile(product, productContent, catalogData);
    if (profile?.researchContext) return profile.researchContext;
  }
  if (productContent?.researchSummary) return productContent.researchSummary;
  if (productContent?.shortDescription) return productContent.shortDescription;
  const categoryFallbacks = {
    Metabolic: 'Commonly referenced in research involving appetite-signaling, metabolic modeling, and energy-balance pathways.',
    Recovery: 'Commonly referenced in research involving repair-pathway signaling, tissue modeling, and laboratory recovery comparisons.',
    Aesthetics: 'Commonly referenced in research involving cosmetic-pathway, collagen, pigmentation, and appearance-focused product comparison.',
    Growth: 'Commonly referenced in research involving GH-axis signaling, endocrine modeling, and growth-related comparison work.',
    Cognitive: 'Commonly referenced in research involving neuro-support, focus, stress-response, and restoration pathways.',
    Cellular: 'Commonly referenced in research involving mitochondrial signaling, cellular stress, and longevity-focused analytical work.',
    Performance: 'Commonly referenced in research involving high-output signaling and specialty comparison work.',
    Support: 'Referenced as a support item used alongside storage, mixing, and broader laboratory reference work.'
  };

  return categoryFallbacks[product.category] || product.description;
}

function getSlugFromPath() {
  const bodySlug = document.body?.dataset?.productSlug;
  if (bodySlug) return bodySlug;
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('slug');
  if (querySlug) return querySlug;
  const path = window.location.pathname.replace(/\\/g, '/');
  const parts = path.split('/');
  const file = parts[parts.length - 1] || '';
  return file.replace(/\.html$/i, '');
}

function isStaticProductRoute() {
  if (document.body?.dataset?.productSlug) return true;
  return /\/products\/[^/]+\.html$/i.test(window.location.pathname || '');
}

function parsePrice(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const numeric = Number.parseFloat(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
}

function getInventoryStatus(option) {
  const status = String(option?.inventoryStatus || 'in_stock').toLowerCase();
  if (status === 'backorder' || status === 'sold_out' || status === 'in_stock') return status;
  return 'in_stock';
}

function getInventoryLabel(status) {
  const labels = {
    in_stock: 'In Stock',
    backorder: 'Backorder',
    sold_out: 'Sold Out'
  };
  return labels[status] || labels.in_stock;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return 'Pending';
  return `$${value.toFixed(2)}`;
}

function getCoaImageForSlug(slug) {
  return COA_IMAGE_BY_SLUG[String(slug || '')] || null;
}

function getCart() {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function setCart(cart) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('jonezie:cart-updated'));
}

function addItemToCart(item) {
  const cart = getCart();
  const existing = cart.find((entry) => entry.slug === item.slug && entry.code === item.code && entry.packKey === item.packKey);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setCart(cart);
}

function renderProductPage() {
  if (!catalogData) return;
  const slug = getSlugFromPath();
  const allProducts = [...(catalogData.featured || []), ...(catalogData.products || [])];
  const product = allProducts.find((item, index) => item.slug === slug && allProducts.findIndex((entry) => entry.slug === item.slug) === index);
  if (!product) return;

  const firstAvailableOption = product.options.find((option) => getInventoryStatus(option) !== 'sold_out');
  let selectedOption = firstAvailableOption || product.options[0] || null;
  let selectedPackKey = selectedOption && selectedOption.singleVialPrice ? 'singleVialPrice' : 'eightVialPrice';
  if (selectedOption && !selectedOption[selectedPackKey]) {
    selectedPackKey = selectedOption.eightVialPrice ? 'eightVialPrice' : 'tenVialPrice';
  }

  const titleNode = document.querySelector('[data-product-title]');
  const eyebrowNode = document.querySelector('[data-product-category]');
  const descriptionNode = document.querySelector('[data-product-description]');
  const heroImageNode = document.querySelector('[data-product-hero-image]');
  const optionsGrid = document.querySelector('[data-product-options]');
  const highlightsGrid = document.querySelector('[data-product-highlights]');
  const resourcesNode = document.querySelector('[data-product-resources]');
  const faqNode = document.querySelector('[data-product-faq]');
  const coaButton = document.querySelector('[data-product-coa]');
  const coaLightbox = document.querySelector('[data-coa-lightbox]');
  const coaLightboxImage = document.querySelector('[data-coa-lightbox-img]');
  const coaLightboxCaption = document.querySelector('[data-coa-lightbox-caption]');
  const coaCloseButtons = document.querySelectorAll('[data-coa-lightbox-close]');
  const selectedTitle = document.querySelector('[data-selected-title]');
  const selectedSubtitle = document.querySelector('[data-selected-subtitle]');
  const packPicker = document.querySelector('[data-pack-picker]');
  const qtyMinus = document.querySelector('[data-qty-minus]');
  const qtyPlus = document.querySelector('[data-qty-plus]');
  const qtyInput = document.querySelector('[data-quantity-input]');
  const selectedPrice = document.querySelector('[data-selected-price]');
  const selectedTotal = document.querySelector('[data-selected-total]');
  const addToCartButton = document.querySelector('[data-add-to-cart]');
  const buyNowButton = document.querySelector('[data-buy-now]');

  document.title = siteLibrary?.getProductPageTitle ? siteLibrary.getProductPageTitle(product) : `${product.name} | Jonezie Labs`;
  const meta = document.querySelector('meta[name="description"]');
  const productContent = getProductContent(product);
  const shortDescription = productContent?.shortDescription || product.description;
  const researchSummary = getProductHeaderSummary(product);
  const productProfile = siteLibrary?.getProductInfoProfile(product, productContent, catalogData) || null;
  const researchFindings = productContent?.researchFindings || [];
  const storageProfile = siteLibrary?.getStorageProfile(product) || {
    title: 'Storage information',
    shortSummary: 'Store lyophilized material in a cool, dry, light-protected environment and refrigerate after reconstitution.',
    bullets: []
  };
  const productFaqs = siteLibrary?.getProductFaqs(product, productContent) || [];
  const relatedProducts = siteLibrary?.getRelatedProducts(product, catalogData, 4) || [];
  const comparisonCandidates = siteLibrary?.getComparisonCandidates(product, catalogData, 3) || [];
  const categoryGuide = siteLibrary?.getGuideForProduct(product) || null;
  const relatedTools = productProfile?.relatedTools || siteLibrary?.TOOL_LIBRARY?.slice(0, 4) || [];
  const siteDisclaimer = siteLibrary?.RUO_COPY?.full || contentData?.disclaimerLong || 'All product information is provided for research, laboratory, or analytical reference only. Products are not for human or veterinary use.';
  const canonicalUrl = siteLibrary?.getProductCanonicalUrl ? siteLibrary.getProductCanonicalUrl(product.slug) : `${SITE_ORIGIN}/products/${encodeURIComponent(product.slug)}.html`;
  const ogImageUrl = getAbsoluteSiteUrl(product.image || PRODUCT_FALLBACK_IMAGE);
  const baseMetaDescription = siteLibrary?.getProductMetaDescription
    ? siteLibrary.getProductMetaDescription(product, productContent)
    : `${product.name} from Jonezie Labs. ${(productProfile?.researchContext || shortDescription)} View listed strengths, pricing, storage notes, handling context, and related comparisons for laboratory reference only.`;
  upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
  upsertMeta('meta[name="robots"]', {
    name: 'robots',
    content: `${isStaticProductRoute() ? 'index' : 'noindex'},follow,max-image-preview:large`
  });

  function updateProductSeo() {
    const offerPrice = parsePrice(selectedOption?.[selectedPackKey] || selectedOption?.singleVialPrice || selectedOption?.eightVialPrice || selectedOption?.tenVialPrice);
    const packMap = {
      singleVialPrice: 'Single Vial',
      eightVialPrice: '8-Vial Kit',
      tenVialPrice: '10-Vial Pack'
    };
    const packLabel = packMap[selectedPackKey] || 'Research pricing';
    const metaDescription = `${productProfile?.researchContext || shortDescription} ${selectedOption ? `${selectedOption.mgOption} is currently listed with ${packLabel.toLowerCase()} pricing.` : ''} View ${product.name} product reference details from Jonezie Labs.`.replace(/\s+/g, ' ').trim();
    if (meta) meta.setAttribute('content', metaDescription);
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'product' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Jonezie Labs' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: siteLibrary?.getProductPageTitle ? siteLibrary.getProductPageTitle(product) : `${product.name} | Jonezie Labs` });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metaDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: siteLibrary?.getProductPageTitle ? siteLibrary.getProductPageTitle(product) : `${product.name} | Jonezie Labs` });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metaDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImageUrl });

    const productSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: product.name,
          description: metaDescription,
          category: product.category,
          image: ogImageUrl,
          sku: selectedOption?.code || product.slug,
          brand: {
            '@type': 'Brand',
            name: 'Jonezie Labs'
          },
          url: canonicalUrl,
          offers: offerPrice ? {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: offerPrice.toFixed(2),
            availability: getInventoryStatus(selectedOption) === 'sold_out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            url: canonicalUrl,
            seller: {
              '@type': 'Organization',
              name: 'Jonezie Labs'
            }
          } : undefined,
          additionalProperty: product.options.map((option) => ({
            '@type': 'PropertyValue',
            name: 'MG Option',
            value: option.mgOption
          }))
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${SITE_ORIGIN}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: product.name,
              item: canonicalUrl
            }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: productFaqs.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
      ]
    };
    setStructuredData('script[data-product-schema]', productSchema);
  }

  if (meta) meta.setAttribute('content', baseMetaDescription);
  window.JONEZIE_ANALYTICS?.viewItem({
    slug: product.slug,
    name: product.name,
    category: product.category,
    code: selectedOption?.code,
    mgOption: selectedOption?.mgOption,
    unitPrice: parsePrice(selectedOption?.[selectedPackKey] || product.startingPriceSingle)
  });
  if (titleNode) titleNode.textContent = product.name;
  if (eyebrowNode) eyebrowNode.textContent = product.category;
  if (descriptionNode) descriptionNode.textContent = researchSummary;
  if (heroImageNode) {
    heroImageNode.src = getProductImageSrc(product.image);
    heroImageNode.alt = `${product.name} product image`;
    heroImageNode.loading = 'eager';
    heroImageNode.decoding = 'async';
    heroImageNode.setAttribute('fetchpriority', 'high');
    heroImageNode.onerror = () => {
      heroImageNode.onerror = null;
      heroImageNode.src = `${PRODUCT_FALLBACK_IMAGE}?v=${PRODUCT_ASSET_VERSION}`;
    };
  }

  function closeCoaLightbox() {
    if (!coaLightbox || coaLightbox.hidden) return;
    coaLightbox.hidden = true;
    if (coaLightboxImage) {
      coaLightboxImage.removeAttribute('src');
      coaLightboxImage.removeAttribute('alt');
    }
    if (coaLightboxCaption) coaLightboxCaption.textContent = '';
    document.body.classList.remove('lightbox-open');
  }

  function openCoaLightbox(imagePath) {
    if (!coaLightbox || !coaLightboxImage) return;
    coaLightboxImage.src = `${imagePath}?v=${COA_ASSET_VERSION}`;
    coaLightboxImage.alt = `${product.name} certificate of analysis`;
    if (coaLightboxCaption) coaLightboxCaption.textContent = `${product.name} Certificate of Analysis`;
    coaLightbox.hidden = false;
    document.body.classList.add('lightbox-open');
  }

  const coaImagePath = getCoaImageForSlug(product.slug);
  if (coaButton) {
    if (!coaImagePath || !coaLightbox || !coaLightboxImage) {
      coaButton.textContent = 'CoA Soon';
      coaButton.disabled = true;
    } else {
      coaButton.textContent = 'CoA';
      coaButton.disabled = false;
      coaButton.addEventListener('click', () => openCoaLightbox(coaImagePath));
      coaCloseButtons.forEach((button) => {
        button.addEventListener('click', closeCoaLightbox);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCoaLightbox();
      });
    }
  }

  function getAvailablePacks(option) {
    return [
      { key: 'singleVialPrice', label: 'Single Vial', price: option.singleVialPrice },
      { key: 'eightVialPrice', label: '8-Vial Kit', price: option.eightVialPrice },
      { key: 'tenVialPrice', label: '10-Vial Pack', price: option.tenVialPrice }
    ].filter((pack) => pack.price);
  }

  function ensureSelectedPack() {
    if (!selectedOption) return;
    const available = getAvailablePacks(selectedOption);
    if (!available.find((pack) => pack.key === selectedPackKey)) {
      selectedPackKey = available[0] ? available[0].key : null;
    }
  }

  function renderOptionCards() {
    if (!optionsGrid) return;
    optionsGrid.innerHTML = product.options.map((option) => {
      const isActive = selectedOption && selectedOption.code === option.code;
      const inventoryStatus = getInventoryStatus(option);
      const isSoldOut = inventoryStatus === 'sold_out';
      return `
        <button type="button" class="spec-card spec-card-button${isActive ? ' is-selected' : ''}${isSoldOut ? ' is-sold-out' : ''}" data-option-code="${escapeHtml(option.code)}" ${isSoldOut ? 'disabled aria-disabled="true"' : ''}>
          <p class="eyebrow">${escapeHtml(option.code)}</p>
          <h3>${escapeHtml(option.mgOption)}</h3>
          <p class="inventory-pill inventory-${inventoryStatus}">${getInventoryLabel(inventoryStatus)}</p>
          <div class="spec-price-row"><span>Single</span><strong>${escapeHtml(option.singleVialPrice || 'Pending')}</strong></div>
          <div class="spec-price-row"><span>8-pack</span><strong>${escapeHtml(option.eightVialPrice || 'Pending')}</strong></div>
          <div class="spec-price-row live-row"><span>10-pack</span><strong>${escapeHtml(option.tenVialPrice || 'Pending')}</strong></div>
        </button>`;
    }).join('');

    optionsGrid.querySelectorAll('[data-option-code]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedOption = product.options.find((option) => option.code === button.getAttribute('data-option-code')) || selectedOption;
        ensureSelectedPack();
        renderOptionCards();
        renderPackPicker();
        renderSelectionSummary();
      });
    });
  }

  function renderPackPicker() {
    if (!packPicker || !selectedOption) return;
    const packs = getAvailablePacks(selectedOption);
    packPicker.innerHTML = packs.map((pack) => `
      <button type="button" class="pack-choice${pack.key === selectedPackKey ? ' is-selected' : ''}" data-pack-key="${pack.key}">
        <span>${pack.label}</span>
        <strong>${escapeHtml(pack.price)}</strong>
      </button>`).join('');

    packPicker.querySelectorAll('[data-pack-key]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedPackKey = button.getAttribute('data-pack-key');
        renderPackPicker();
        renderSelectionSummary();
      });
    });
  }

  function renderSelectionSummary() {
    if (!selectedOption) return;
    const quantity = Math.max(1, Number.parseInt(qtyInput.value || '1', 10) || 1);
    qtyInput.value = String(quantity);
    const packMap = {
      singleVialPrice: 'Single Vial',
      eightVialPrice: '8-Vial Kit',
      tenVialPrice: '10-Vial Pack'
    };
    const packLabel = packMap[selectedPackKey] || 'Pack';
    const unitPrice = parsePrice(selectedOption[selectedPackKey]);
    const selectedStatus = getInventoryStatus(selectedOption);
    const isSoldOut = selectedStatus === 'sold_out';
    const total = Number.isFinite(unitPrice) ? unitPrice * quantity : null;

    if (selectedTitle) selectedTitle.textContent = `${product.name} ${selectedOption.mgOption}`;
    if (selectedSubtitle) {
      if (selectedStatus === 'backorder') {
        selectedSubtitle.textContent = `${selectedOption.code} is currently on backorder.`;
      } else if (isSoldOut) {
        selectedSubtitle.textContent = `${selectedOption.code} is currently sold out.`;
      } else {
        selectedSubtitle.textContent = `${packLabel} selected for ${selectedOption.code}.`;
      }
    }
    if (selectedPrice) selectedPrice.textContent = isSoldOut ? 'Sold Out' : (unitPrice !== null ? formatMoney(unitPrice) : 'Pending');
    if (selectedTotal) selectedTotal.textContent = isSoldOut ? 'Sold Out' : (total !== null ? formatMoney(total) : 'Pending');

    const disabled = unitPrice === null || isSoldOut;
    if (addToCartButton) addToCartButton.disabled = disabled;
    if (buyNowButton) buyNowButton.disabled = disabled;
    updateProductSeo();
  }

  function getSelectedCartItem() {
    if (!selectedOption) return null;
    const selectedStatus = getInventoryStatus(selectedOption);
    if (selectedStatus === 'sold_out') return null;
    const unitPrice = parsePrice(selectedOption[selectedPackKey]);
    if (unitPrice === null) return null;
    const packMap = {
      singleVialPrice: 'Single Vial',
      eightVialPrice: '8-Vial Kit',
      tenVialPrice: '10-Vial Pack'
    };
    const quantity = Math.max(1, Number.parseInt(qtyInput.value || '1', 10) || 1);
    return {
      slug: product.slug,
      name: product.name,
      code: selectedOption.code,
      mgOption: selectedOption.mgOption,
      packKey: selectedPackKey,
      packLabel: packMap[selectedPackKey],
      unitPrice,
      unitPriceDisplay: selectedOption[selectedPackKey],
      quantity,
      image: product.image,
      inventoryStatus: selectedStatus
    };
  }

  qtyMinus?.addEventListener('click', () => {
    qtyInput.value = String(Math.max(1, (Number.parseInt(qtyInput.value || '1', 10) || 1) - 1));
    renderSelectionSummary();
  });
  qtyPlus?.addEventListener('click', () => {
    qtyInput.value = String((Number.parseInt(qtyInput.value || '1', 10) || 1) + 1);
    renderSelectionSummary();
  });
  qtyInput?.addEventListener('input', renderSelectionSummary);

  addToCartButton?.addEventListener('click', () => {
    const item = getSelectedCartItem();
    if (!item) return;
    addItemToCart(item);
    window.JONEZIE_ANALYTICS?.addToCart(item);
    addToCartButton.textContent = 'Added To Cart';
    window.setTimeout(() => {
      addToCartButton.textContent = 'Add To Cart';
    }, 1400);
  });

  buyNowButton?.addEventListener('click', () => {
    const item = getSelectedCartItem();
    if (!item) return;
    setCart([item]);
    window.JONEZIE_ANALYTICS?.addToCart(item);
    window.JONEZIE_ANALYTICS?.beginCheckout([item]);
    window.location.href = 'checkout.html';
  });

  if (highlightsGrid) {
    const optionText = product.options.map((option) => option.mgOption).join(', ');
    const handlingSteps = productProfile?.mixingProfile?.steps?.slice(0, 3) || [];
    const findingsMarkup = researchFindings.length
      ? `<ul class="research-list">${researchFindings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join('')}</ul>`
      : '';
    highlightsGrid.innerHTML = `
      <article>
        <p class="eyebrow">Research Summary</p>
        <h2>What this product is commonly referenced for</h2>
        <p>${escapeHtml(productProfile?.researchContext || shortDescription)}</p>
        ${findingsMarkup}
      </article>
      <article>
        <p class="eyebrow">Compound Details</p>
        <h2>Class, category, and form</h2>
        <ul class="research-list">
          <li>${escapeHtml(productProfile?.compoundClass || product.category)}</li>
          <li>${escapeHtml(productProfile?.researchCategory || product.category)}</li>
          <li>${escapeHtml(productProfile?.form || 'Research vial')}</li>
          <li>${escapeHtml(optionText || 'Listed strengths pending')}</li>
        </ul>
      </article>
      <article>
        <p class="eyebrow">Storage Notes</p>
        <h2>${escapeHtml(storageProfile.title)}</h2>
        <p>${escapeHtml(productProfile?.storageNote || storageProfile.shortSummary)}</p>
        <ul class="research-list">
          ${storageProfile.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
        </ul>
      </article>
      <article>
        <p class="eyebrow">Handling Notes</p>
        <h2>Preparation and label review</h2>
        <p>${escapeHtml(productProfile?.handlingNote || 'Confirm the vial label before handling and keep preparation notes documented.')}</p>
        ${handlingSteps.length ? `<ol class="tool-step-list">${handlingSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>` : ''}
      </article>
      <article>
        <p class="eyebrow">Comparison Context</p>
        <h2>How this listing fits into side-by-side review</h2>
        <p>${escapeHtml(productProfile?.structureNote || 'Listed as a research product inside the active Jonezie catalog.')}</p>
        <p>${escapeHtml(productProfile?.comparisonSummary || 'Use the comparison pages to weigh class, form, listed strengths, and nearby compounds.')}</p>
      </article>
      <article>
        <p class="eyebrow">Reference Note</p>
        <h2>${escapeHtml(categoryGuide?.title || 'Related research guide')}</h2>
        <p>${escapeHtml(categoryGuide?.summary || 'Use the guide library to move into related products, comparison pages, and research tools.')}</p>
        <p>${escapeHtml(siteDisclaimer)}</p>
      </article>`;
  }

  if (resourcesNode) {
    resourcesNode.innerHTML = `
      <div class="resource-strip">
        <article class="resource-strip-card">
          <p class="eyebrow">Related Products</p>
          <h2>Keep moving through similar listings.</h2>
          <div class="mini-link-grid">
            ${relatedProducts.map((relatedProduct) => `
              <a class="mini-link-card" href="${siteLibrary.getProductUrl(relatedProduct.slug)}">
                <strong>${escapeHtml(relatedProduct.name)}</strong>
                <span>${escapeHtml(siteLibrary.getProductInfoProfile(relatedProduct, getProductContent(relatedProduct), catalogData).researchContext)}</span>
              </a>`).join('')}
          </div>
        </article>
        <article class="resource-strip-card">
          <p class="eyebrow">Related Pages</p>
          <h2>Open the next reference page without leaving the lane.</h2>
          <div class="mini-link-grid">
            ${comparisonCandidates.map((comparisonProduct) => `
              <a class="mini-link-card" href="${siteLibrary.getComparisonUrl(product.slug, comparisonProduct.slug)}">
                <strong>${escapeHtml(product.name)} vs ${escapeHtml(comparisonProduct.name)}</strong>
                <span>Open the direct comparison for class notes, storage context, listed strengths, and related products.</span>
              </a>`).join('')}
            ${categoryGuide ? `
              <a class="mini-link-card" href="${siteLibrary.getGuideUrl(categoryGuide.key)}">
                <strong>${escapeHtml(categoryGuide.title)}</strong>
                <span>${escapeHtml(categoryGuide.summary)}</span>
              </a>` : ''}
            ${relatedTools.map((tool) => `
              <a class="mini-link-card" href="${escapeHtml(tool.href)}">
                <strong>${escapeHtml(tool.title)}</strong>
                <span>${escapeHtml(tool.description)}</span>
              </a>`).join('')}
            <a class="mini-link-card" href="index.html#faq">
              <strong>FAQ</strong>
              <span>Review the main-site ordering and research-use reference notes.</span>
            </a>
          </div>
        </article>
      </div>`;
  }

  if (faqNode) {
    faqNode.innerHTML = `
      <div class="faq-shell">
        <div class="section-heading compact">
          <p class="eyebrow">Product Reference FAQ</p>
          <h2>Questions tied to this listing.</h2>
        </div>
        <div class="faq-list">
          ${productFaqs.map((item, index) => `
            <details${index === 0 ? ' open' : ''}>
              <summary>
                <span class="faq-index">${String(index + 1).padStart(2, '0')}</span>
                <span class="faq-question-copy">
                  <strong>${escapeHtml(item.question)}</strong>
                  <small>Product support</small>
                </span>
                <span class="faq-toggle" aria-hidden="true"></span>
              </summary>
              <p>${escapeHtml(item.answer)}</p>
            </details>`).join('')}
        </div>
      </div>`;
  }

  ensureSelectedPack();
  renderOptionCards();
  renderPackPicker();
  renderSelectionSummary();
}

renderProductPage();
