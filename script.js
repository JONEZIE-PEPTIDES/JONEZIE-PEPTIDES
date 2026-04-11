const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const catalogData = window.JONEZIE_CATALOG || null;
const contentData = window.JONEZIE_PRODUCT_CONTENT || null;
const CART_KEY = 'jonezie_cart';
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';
const IMAGE_ASSET_VERSION = '20260409e';

if (menuToggle && siteNav) {
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
    if (!trigger || !panel) return;

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

function getAccent(category) {
  if (['Metabolic', 'Cellular', 'Growth'].includes(category)) return 'accent-cyan';
  if (['Aesthetics', 'Performance'].includes(category)) return 'accent-pink';
  return 'accent-cyan';
}

function getProductUrl(slug) {
  return `product.html?slug=${encodeURIComponent(slug)}`;
}

function withFallbackImage(path) {
  return escapeHtml((path || '').replace('../', ''));
}

function getImageSrc(path) {
  const sanitized = withFallbackImage(path).trim();
  const fallback = `${PRODUCT_FALLBACK_IMAGE}?v=${IMAGE_ASSET_VERSION}`;
  if (!sanitized) return fallback;
  if (sanitized.includes('?')) return sanitized;
  return `${sanitized}?v=${IMAGE_ASSET_VERSION}`;
}

function renderStrengthChips(options) {
  const limit = 4;
  const strengthList = (options || [])
    .map((option) => escapeHtml(option.mgOption))
    .filter(Boolean);

  const visible = strengthList.slice(0, limit).map((strength) => `<span>${strength}</span>`);
  if (strengthList.length > limit) {
    visible.push(`<span class="more-chip">+${strengthList.length - limit}</span>`);
  }

  return visible.join('');
}

function getProductContent(product) {
  return contentData?.products?.[product.slug] || null;
}

function renderFeatured() {
  const grid = document.querySelector('[data-featured-grid]');
  if (!grid || !catalogData) return;

  const featured = (catalogData.featured || []).slice(0, 6);
  grid.innerHTML = featured.map((product) => {
    const productContent = getProductContent(product);
    const description = productContent?.shortDescription || product.description;
    const strengthChips = renderStrengthChips(product.options);
    const imageSrc = getImageSrc(product.image);
    const fallbackImageSrc = `${PRODUCT_FALLBACK_IMAGE}?v=${IMAGE_ASSET_VERSION}`;
    return `
      <a class="product-card card-link-shell ${getAccent(product.category)}" href="${getProductUrl(product.slug)}" aria-label="Open ${escapeHtml(product.name)} product page">
        <img src="${imageSrc}" alt="${escapeHtml(product.name)} product visual" onerror="this.onerror=null;this.src='${fallbackImageSrc}'" />
        <div class="product-copy">
          <div class="product-top">
            <div class="product-badge">${escapeHtml(product.category)}</div>
            <span class="catalog-price-rule">view pricing</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <span class="catalog-link">Open product page</span>
          <p>${escapeHtml(description)}</p>
          <div class="option-chips">${strengthChips}</div>
        </div>
      </a>`;
  }).join('');
}

function renderCatalog() {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid || !catalogData) return;

  const products = [...(catalogData.products || [])].sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = products.map((product) => {
    const productContent = getProductContent(product);
    const description = productContent?.shortDescription || product.description;
    const strengthChips = renderStrengthChips(product.options);
    const imageSrc = getImageSrc(product.image);
    const fallbackImageSrc = `${PRODUCT_FALLBACK_IMAGE}?v=${IMAGE_ASSET_VERSION}`;
    return `
      <a class="catalog-card card-link-shell" href="${getProductUrl(product.slug)}" aria-label="Open ${escapeHtml(product.name)} product page">
        <img src="${imageSrc}" alt="${escapeHtml(product.name)} product visual" onerror="this.onerror=null;this.src='${fallbackImageSrc}'" />
        <div class="catalog-top">
          <span class="catalog-tag">${escapeHtml(product.category)}</span>
          <span class="catalog-price-rule">view pricing</span>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <span class="catalog-link">Open product page</span>
        <p>${escapeHtml(description)}</p>
        <div class="option-chips">${strengthChips}</div>
      </a>`;
  }).join('');
}

function renderCounts() {
  if (!catalogData) return;
  document.querySelectorAll('[data-total-products]').forEach((node) => {
    node.textContent = String(catalogData.totalProducts || 0);
  });
  document.querySelectorAll('[data-total-configurations]').forEach((node) => {
    node.textContent = String(catalogData.totalConfigurations || 0);
  });
}

function initMerchImageLightbox() {
  const lightbox = document.querySelector('[data-image-lightbox]');
  const triggers = document.querySelectorAll('[data-merch-zoom]');
  if (!lightbox || !triggers.length) return;

  const previewImage = lightbox.querySelector('[data-image-lightbox-img]');
  const caption = lightbox.querySelector('[data-image-lightbox-caption]');
  const closeButtons = lightbox.querySelectorAll('[data-image-lightbox-close]');
  if (!previewImage) return;

  const close = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    previewImage.removeAttribute('src');
    previewImage.removeAttribute('alt');
    if (caption) caption.textContent = '';
    document.body.classList.remove('lightbox-open');
  };

  const openFrom = (trigger) => {
    const image = trigger.querySelector('img');
    if (!image) return;

    previewImage.src = image.currentSrc || image.src;
    previewImage.alt = image.alt || 'Expanded merch image';
    if (caption) caption.textContent = image.alt || '';

    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openFrom(trigger));
    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openFrom(trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
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

function sanitizeCode(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function initMerchPurchases() {
  const cards = document.querySelectorAll('[data-merch-purchase]');
  if (!cards.length) return;

  cards.forEach((card) => {
    const sizeSelect = card.querySelector('[data-merch-size]');
    const qtyInput = card.querySelector('[data-merch-qty]');
    const qtyMinus = card.querySelector('[data-merch-qty-minus]');
    const qtyPlus = card.querySelector('[data-merch-qty-plus]');
    const addButton = card.querySelector('[data-merch-add]');
    const feedback = card.querySelector('[data-merch-feedback]');
    const name = card.getAttribute('data-merch-name') || 'Merch Item';
    const slug = card.getAttribute('data-merch-slug') || sanitizeCode(name).toLowerCase();
    const image = card.getAttribute('data-merch-image') || PRODUCT_FALLBACK_IMAGE;
    const unitPrice = Number.parseFloat(card.getAttribute('data-merch-price') || '0');

    const clampQuantity = () => {
      const parsed = Number.parseInt(qtyInput?.value || '1', 10);
      const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      if (qtyInput) qtyInput.value = String(quantity);
      return quantity;
    };

    qtyMinus?.addEventListener('click', () => {
      const current = clampQuantity();
      if (qtyInput) qtyInput.value = String(Math.max(1, current - 1));
    });

    qtyPlus?.addEventListener('click', () => {
      const current = clampQuantity();
      if (qtyInput) qtyInput.value = String(current + 1);
    });

    qtyInput?.addEventListener('blur', clampQuantity);

    addButton?.addEventListener('click', () => {
      const quantity = clampQuantity();
      const size = sizeSelect?.value || 'Standard';
      const optionCode = sanitizeCode(size) || 'STANDARD';
      const priceDisplay = Number.isFinite(unitPrice) ? `$${unitPrice.toFixed(2)}` : 'Pending';

      addItemToCart({
        slug,
        code: `MERCH_${sanitizeCode(slug)}_${optionCode}`,
        packKey: `merch_${optionCode.toLowerCase()}`,
        packLabel: 'Merch',
        name,
        mgOption: `Size ${size}`,
        image,
        quantity,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        unitPriceDisplay: priceDisplay,
        inventoryStatus: 'in_stock'
      });

      if (feedback) feedback.textContent = `${name} (${size}) added to cart.`;
      if (addButton) {
        const original = addButton.textContent;
        addButton.textContent = 'Added';
        window.setTimeout(() => {
          addButton.textContent = original;
        }, 900);
      }
    });
  });
}

renderCounts();
renderFeatured();
renderCatalog();
initMerchImageLightbox();
initMerchPurchases();
