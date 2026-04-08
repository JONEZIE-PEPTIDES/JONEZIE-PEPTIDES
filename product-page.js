const CART_KEY = 'jonezie_cart';
const catalogData = window.JONEZIE_CATALOG || null;
const imageMap = window.JONEZIE_IMAGE_MAP || {};
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSlugFromPath() {
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('slug');
  if (querySlug) return querySlug;
  const path = window.location.pathname.replace(/\\/g, '/');
  const parts = path.split('/');
  const file = parts[parts.length - 1] || '';
  return file.replace(/\.html$/i, '');
}

function parsePrice(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const numeric = Number.parseFloat(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return 'Pending';
  return `$${value.toFixed(2)}`;
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
}

function getProductImageForOption(product, option) {
  const mapped = imageMap.products?.[product.slug];
  if (!mapped) return product.image || PRODUCT_FALLBACK_IMAGE;
  if (option?.mgOption && mapped.options?.[option.mgOption]) return mapped.options[option.mgOption];
  return mapped.default || product.image || PRODUCT_FALLBACK_IMAGE;
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
  const product = (catalogData.products || []).find((item) => item.slug === slug);
  if (!product) return;

  let selectedOption = product.options[0] || null;
  let selectedPackKey = selectedOption && selectedOption.singleVialPrice ? 'singleVialPrice' : 'eightVialPrice';
  if (selectedOption && !selectedOption[selectedPackKey]) {
    selectedPackKey = selectedOption.eightVialPrice ? 'eightVialPrice' : 'tenVialPrice';
  }

  const titleNode = document.querySelector('[data-product-title]');
  const eyebrowNode = document.querySelector('[data-product-category]');
  const highlightsGrid = document.querySelector('[data-product-highlights]');
  const faqList = document.querySelector('[data-product-faq]');
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
  const optionsGrid = document.querySelector('[data-product-options]');

  document.title = `${product.name} | Jonezie Peptides`;
  if (titleNode) titleNode.textContent = product.name;
  if (eyebrowNode) eyebrowNode.textContent = product.category;

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
      return `
        <button type="button" class="spec-card spec-card-button${isActive ? ' is-selected' : ''}" data-option-code="${escapeHtml(option.code)}">
          <p class="eyebrow">${escapeHtml(option.code)}</p>
          <h3>${escapeHtml(option.mgOption)}</h3>
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
    const total = Number.isFinite(unitPrice) ? unitPrice * quantity : null;

    if (selectedTitle) selectedTitle.textContent = `${product.name} ${selectedOption.mgOption}`;
    if (selectedSubtitle) selectedSubtitle.textContent = `${packLabel} selected for ${selectedOption.code}.`;
    if (selectedPrice) selectedPrice.textContent = unitPrice !== null ? formatMoney(unitPrice) : 'Pending';
    if (selectedTotal) selectedTotal.textContent = total !== null ? formatMoney(total) : 'Pending';

    const disabled = unitPrice === null;
    if (addToCartButton) addToCartButton.disabled = disabled;
    if (buyNowButton) buyNowButton.disabled = disabled;
  }

  function getSelectedCartItem() {
    if (!selectedOption) return null;
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
      image: getProductImageForOption(product, selectedOption)
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
    addToCartButton.textContent = 'Added To Cart';
    window.setTimeout(() => {
      addToCartButton.textContent = 'Add To Cart';
    }, 1400);
  });

  buyNowButton?.addEventListener('click', () => {
    const item = getSelectedCartItem();
    if (!item) return;
    setCart([item]);
    window.location.href = 'checkout.html';
  });

  if (highlightsGrid) {
    const optionText = product.options.map((option) => option.mgOption).join(', ');
    highlightsGrid.innerHTML = `
      <article>
        <p class="eyebrow">Positioning</p>
        <h2>How this product should feel on Jonezie</h2>
        <p>${escapeHtml(product.description)} The goal is to present it with cleaner visuals, easier pricing, and a more premium buy flow than the average catalog-first peptide site.</p>
      </article>
      <article>
        <p class="eyebrow">Selection</p>
        <h2>How the page is built to move</h2>
        <p>Choose the MG option first, lock in the pack size, and move forward fast. The whole point is to make the page feel more current, less cluttered, and easier to act on.</p>
      </article>
      <article>
        <p class="eyebrow">Available now</p>
        <h2>Strength options currently loaded</h2>
        <p>${escapeHtml(optionText)}</p>
      </article>
      <article>
        <p class="eyebrow">Pricing</p>
        <h2>Current pack structure</h2>
        <p>Pricing is shown in a cleaner tiered format so buyers can compare single-vial, 8-vial, and 10-vial options without hunting through scattered text.</p>
      </article>`;
  }

  if (faqList) {
    faqList.innerHTML = `
      <details open>
        <summary>How does ordering work from this page?</summary>
        <p>Select the MG option, choose the pack format in the order panel, add it to cart, and move straight into checkout. The page is built to keep that process simple and obvious.</p>
      </details>
      <details>
        <summary>What pricing is shown here?</summary>
        <p>This page is designed to show the loaded pricing structure for each available MG option so buyers can compare formats without switching pages or asking for basic details first.</p>
      </details>
      <details>
        <summary>Can this page hold more credibility content later?</summary>
        <p>Yes. We can keep layering in stronger product copy, image galleries, batch or documentation sections, ordering notes, and other trust-building elements without changing the overall layout.</p>
      </details>`;
  }

  ensureSelectedPack();
  renderOptionCards();
  renderPackPicker();
  renderSelectionSummary();
}

renderProductPage();
