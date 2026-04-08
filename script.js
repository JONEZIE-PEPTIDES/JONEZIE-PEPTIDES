const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const catalogData = window.JONEZIE_CATALOG || null;
const imageMap = window.JONEZIE_IMAGE_MAP || {};
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';

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
  return escapeHtml((path || PRODUCT_FALLBACK_IMAGE).replace('../', ''));
}

function getProductImage(product) {
  return imageMap.products?.[product.slug]?.default || product.image || PRODUCT_FALLBACK_IMAGE;
}

function priceSummary(product) {
  return `Single ${product.startingPriceSingle || 'Pending'} | 8-pack ${product.startingPrice8 || 'Pending'} | 10-pack ${product.startingPrice10 || 'Pending'}`;
}

function renderOptionChips(product) {
  return (product.options || [])
    .map((option) => `<span>${escapeHtml(option.mgOption)}</span>`)
    .join('');
}

function bindCardLinks() {
  document.querySelectorAll('[data-card-link]').forEach((card) => {
    const href = card.getAttribute('data-card-link');
    if (!href) return;

    card.addEventListener('click', () => {
      window.location.href = href;
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = href;
      }
    });
  });
}

function renderFeatured() {
  const grid = document.querySelector('[data-featured-grid]');
  if (!grid || !catalogData) return;

  const featured = (catalogData.featured || []).slice(0, 6);
  grid.innerHTML = featured.map((product) => {
    const optionCount = product.options.length;
    const productUrl = getProductUrl(product.slug);
    return `
      <article class="product-card ${getAccent(product.category)} clickable-card" data-card-link="${productUrl}" tabindex="0" role="link" aria-label="Open ${escapeHtml(product.name)} product page">
        <img src="${withFallbackImage(getProductImage(product))}" alt="${escapeHtml(product.name)} product visual" onerror="this.onerror=null;this.src='${PRODUCT_FALLBACK_IMAGE}'" />
        <div class="product-copy">
          <div class="product-badge">${escapeHtml(product.category)}</div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <div class="option-chips">${renderOptionChips(product)}</div>
          <div class="catalog-meta compact-meta">
            <span>${optionCount} MG option${optionCount === 1 ? '' : 's'}</span>
            <span>${escapeHtml(priceSummary(product))}</span>
          </div>
          <span class="catalog-link">View product</span>
        </div>
      </article>`;
  }).join('');

  bindCardLinks();
}

function renderCatalog() {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid || !catalogData) return;

  const products = [...(catalogData.products || [])].sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = products.map((product) => {
    const optionCount = product.options.length;
    const productUrl = getProductUrl(product.slug);
    return `
      <article class="catalog-card clickable-card" data-card-link="${productUrl}" tabindex="0" role="link" aria-label="Open ${escapeHtml(product.name)} product page">
        <img class="catalog-thumb" src="${withFallbackImage(getProductImage(product))}" alt="${escapeHtml(product.name)} product visual" onerror="this.onerror=null;this.src='${PRODUCT_FALLBACK_IMAGE}'" />
        <div class="catalog-top">
          <span class="catalog-tag">${escapeHtml(product.category)}</span>
          <span class="catalog-price-rule">full pricing live</span>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="option-chips">${renderOptionChips(product)}</div>
        <div class="catalog-meta">
          <span>${optionCount} strength option${optionCount === 1 ? '' : 's'}</span>
          <span>${escapeHtml(priceSummary(product))}</span>
        </div>
        <span class="catalog-link">View product</span>
      </article>`;
  }).join('');

  bindCardLinks();
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
