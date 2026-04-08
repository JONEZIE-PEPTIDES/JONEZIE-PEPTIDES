const CART_KEY = 'jonezie_cart';
const catalogData = window.JONEZIE_CATALOG || null;
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
  const descriptionNode = document.querySelector('[data-product-description]');
  const heroImage = document.querySelector('[data-product-image]');
  const currentPriceNode = document.querySelector('[data-product-starting-price]');
  const currentPriceBlurb = document.querySelector('[data-product-price-blurb]');
  const optionsGrid = document.querySelector('[data-product-options]');
  const highlightsGrid = document.querySelector('[data-product-highlights]');
  const faqList = document.querySelector('[data-product-faq]');
  const checkoutLink = document.querySelector('[data-product-checkout]');
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

  document.title = `${product.name} | Jonezie Peptides`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', `${product.name} product page for the Jonezie Peptides storefront.`);
  if (titleNode) titleNode.textContent = product.name;
  if (eyebrowNode) eyebrowNode.textContent = product.category;
  if (descriptionNode) descriptionNode.textContent = product.description;
  if (heroImage) {
    heroImage.src = (product.image || '').replace('../', '');
    heroImage.alt = `${product.name} product visual`;
    heroImage.onerror = () => {
      heroImage.onerror = null;
      heroImage.src = PRODUCT_FALLBACK_IMAGE;
    };
  }
  if (currentPriceNode) {
    currentPriceNode.textContent = `Single from ${product.startingPriceSingle || 'Pending'} | 8-pack from ${product.startingPrice8 || 'Pending'} | 10-pack from ${product.startingPrice10 || 'Pending'}`;
  }
  if (currentPriceBlurb) {
    currentPriceBlurb.textContent = 'Select an MG option below, choose your pack size, and move straight into checkout from this page.';
  }
  if (checkoutLink) checkoutLink.href = 'checkout.html';

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
      image: product.image
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
        <h2>How Jonezie frames this product</h2>
        <p>${escapeHtml(product.description)}</p>
      </article>
      <article>
        <p class="eyebrow">Selection</p>
        <h2>How ordering works</h2>
        <p>Choose the MG option first, pick your preferred pack size, and move straight into checkout from the product page.</p>
      </article>
      <article>
        <p class="eyebrow">Available now</p>
        <h2>MG options loaded</h2>
        <p>${escapeHtml(optionText)}</p>
      </article>
      <article>
        <p class="eyebrow">Pricing</p>
        <h2>Current pack structure</h2>
        <p>Official pricing is now loaded for single-vial, 8-vial, and 10-vial configurations across the catalog.</p>
      </article>`;
  }

  if (faqList) {
    faqList.innerHTML = `
      <details open>
        <summary>How do I order from this page?</summary>
        <p>Select the MG option, choose the pack size in the purchase panel, add it to cart, and move into checkout.</p>
      </details>
      <details>
        <summary>Which pricing is live on this page now?</summary>
        <p>This page shows your official single-vial, 8-pack, and 10-pack pricing for each available MG option.</p>
      </details>
      <details>
        <summary>Can the product page hold more content later?</summary>
        <p>Yes. We can still add stronger product copy, image galleries, lab-document sections, and ordering notes without changing the core layout.</p>
      </details>`;
  }

  ensureSelectedPack();
  renderOptionCards();
  renderPackPicker();
  renderSelectionSummary();
}

renderProductPage();
