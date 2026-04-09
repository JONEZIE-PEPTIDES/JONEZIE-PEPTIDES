const CART_KEY = 'jonezie_cart';
const catalogData = window.JONEZIE_CATALOG || null;
const contentData = window.JONEZIE_PRODUCT_CONTENT || null;
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

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

function getProductContent(product) {
  return contentData?.products?.[product.slug] || null;
}

function getProductHeaderSummary(product) {
  const productContent = getProductContent(product);
  if (productContent?.researchSummary) return productContent.researchSummary;
  if (productContent?.shortDescription) return productContent.shortDescription;
  const categoryFallbacks = {
    Metabolic: 'Research interest usually centers on appetite, metabolic signaling, and body-composition support.',
    Recovery: 'Research interest usually centers on tissue repair, recovery support, and movement-focused healing response.',
    Aesthetics: 'Research interest usually centers on skin support, cosmetic pathways, and appearance-focused recovery.',
    Growth: 'Research interest usually centers on growth-hormone signaling, recovery, and body-composition support.',
    Cognitive: 'Research interest usually centers on focus, neuro-support, and restoration pathways.',
    Performance: 'Research interest usually centers on drive, performance support, and high-output function.',
    Support: 'Used as a support item within the broader peptide workflow.'
  };

  return categoryFallbacks[product.category] || product.description;
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
  const optionsGrid = document.querySelector('[data-product-options]');
  const highlightsGrid = document.querySelector('[data-product-highlights]');
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
  const productContent = getProductContent(product);
  const shortDescription = productContent?.shortDescription || product.description;
  const researchSummary = getProductHeaderSummary(product);
  const researchFindings = productContent?.researchFindings || [];
  const siteDisclaimer = contentData?.disclaimerLong || 'Products listed on this site are offered strictly for research use only and are not for human consumption.';
  if (meta) meta.setAttribute('content', getProductHeaderSummary(product));
  if (titleNode) titleNode.textContent = product.name;
  if (eyebrowNode) eyebrowNode.textContent = product.category;
  if (descriptionNode) descriptionNode.textContent = researchSummary;
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
    const findingsMarkup = researchFindings.length
      ? `<ul class="research-list">${researchFindings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join('')}</ul>`
      : `<p>${escapeHtml(researchSummary)}</p>`;
    highlightsGrid.innerHTML = `
      <article>
        <p class="eyebrow">Overview</p>
        <h2>What this compound is researched for</h2>
        <p>${escapeHtml(shortDescription)}</p>
      </article>
      <article>
        <p class="eyebrow">Research</p>
        <h2>What published research has examined</h2>
        ${findingsMarkup}
      </article>
      <article>
        <p class="eyebrow">Available</p>
        <h2>MG options loaded</h2>
        <p>${escapeHtml(optionText)}</p>
      </article>
      <article>
        <p class="eyebrow">Notice</p>
        <h2>Research-use disclaimer</h2>
        <p>${escapeHtml(siteDisclaimer)}</p>
      </article>`;
  }

  ensureSelectedPack();
  renderOptionCards();
  renderPackPicker();
  renderSelectionSummary();
}

renderProductPage();
