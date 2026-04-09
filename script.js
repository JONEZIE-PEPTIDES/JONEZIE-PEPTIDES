const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const catalogData = window.JONEZIE_CATALOG || null;
const contentData = window.JONEZIE_PRODUCT_CONTENT || null;
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

renderCounts();
renderFeatured();
renderCatalog();
