const CART_KEY = 'jonezie_cart';
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const cartRoot = document.querySelector('[data-checkout-cart]');
const summaryItems = document.querySelector('[data-summary-items]');
const summarySubtotal = document.querySelector('[data-summary-subtotal]');
const summaryDiscount = document.querySelector('[data-summary-discount]');
const summaryShipping = document.querySelector('[data-summary-shipping]');
const summaryTotal = document.querySelector('[data-summary-total]');
const form = document.querySelector('[data-checkout-form]');
const clearCartButton = document.querySelector('[data-clear-cart]');
const promoCodeInput = document.querySelector('[data-promo-code]');
const shippingMethodInput = document.querySelector('[data-shipping-method]');
const shippingHelp = document.querySelector('[data-shipping-help]');
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';
const PROMO_CODES = {
  PEPPERS: 0.10,
  MILKO: 0.60
};
const SHIPPING_OPTIONS = [
  {
    id: 'ground-advantage',
    label: 'USPS Ground Advantage',
    window: '2-5 business days',
    price: 6.98,
    note: 'Everyday shipping'
  },
  {
    id: 'priority-mail',
    label: 'USPS Priority Mail',
    window: '1-3 business days',
    price: 8.25,
    note: 'Packages with tracking'
  },
  {
    id: 'ups-2nd-day-air',
    label: 'UPS 2nd Day Air',
    window: '2 business days',
    price: 15.00,
    note: 'Faster delivery option'
  },
  {
    id: 'backorder-fulfillment',
    label: 'Backorder Fulfillment',
    window: '10-15 business days',
    price: 29.00,
    note: 'For backorder items only',
    backorderOnly: true
  }
];

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

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getInventoryLabel(status) {
  const value = String(status || 'in_stock').toLowerCase();
  if (value === 'backorder') return 'Backorder';
  if (value === 'sold_out') return 'Sold Out';
  return 'In Stock';
}

function getPromoDetails() {
  const rawCode = String(promoCodeInput?.value || '').trim().toUpperCase();
  const rate = PROMO_CODES[rawCode] || 0;
  return {
    code: rawCode,
    rate,
    isValid: rate > 0
  };
}

function getAvailableShippingOptions(cart) {
  const hasBackorder = cart.some((item) => String(item.inventoryStatus || '').toLowerCase() === 'backorder');
  return SHIPPING_OPTIONS.filter((option) => !option.backorderOnly || hasBackorder);
}

function getSelectedShipping(cart) {
  const availableOptions = getAvailableShippingOptions(cart);
  if (!availableOptions.length) return null;

  const allBackorder = cart.length > 0 && cart.every((item) => String(item.inventoryStatus || '').toLowerCase() === 'backorder');
  const preferredId = shippingMethodInput?.value;
  const matched = availableOptions.find((option) => option.id === preferredId);
  if (matched) return matched;

  const defaultOption = allBackorder
    ? availableOptions.find((option) => option.backorderOnly) || availableOptions[0]
    : availableOptions[0];

  if (shippingMethodInput) shippingMethodInput.value = defaultOption.id;
  return defaultOption;
}

function renderShippingOptions(cart) {
  if (!shippingMethodInput) return null;
  const availableOptions = getAvailableShippingOptions(cart);
  const previousValue = shippingMethodInput.value;

  shippingMethodInput.innerHTML = availableOptions.map((option) => `
    <option value="${option.id}">
      ${option.label} - ${option.window} - ${formatMoney(option.price)}
    </option>`).join('');

  if (!availableOptions.length) {
    shippingMethodInput.disabled = true;
    if (shippingHelp) shippingHelp.textContent = 'Add products to your cart to choose a shipping option.';
    return null;
  }

  shippingMethodInput.disabled = false;
  if (previousValue && availableOptions.some((option) => option.id === previousValue)) {
    shippingMethodInput.value = previousValue;
  }
  const selected = getSelectedShipping(cart);
  if (shippingHelp && selected) {
    shippingHelp.textContent = `${selected.note}. ${selected.window} delivery window.`;
  }
  return selected;
}

function renderCart() {
  const cart = getCart();
  if (!cartRoot) return;

  if (!cart.length) {
    cartRoot.innerHTML = `
      <div class="empty-cart-card">
        <h2>Your cart is empty.</h2>
        <p>Go back to the catalog, choose a product option, and add it to cart to begin checkout.</p>
        <a class="button primary" href="index.html#full-catalog">Browse Catalog</a>
      </div>`;
    if (summaryItems) summaryItems.textContent = '0';
    if (summarySubtotal) summarySubtotal.textContent = '$0.00';
    if (summaryDiscount) summaryDiscount.textContent = '$0.00';
    if (summaryShipping) summaryShipping.textContent = '$0.00';
    if (summaryTotal) summaryTotal.textContent = '$0.00';
    renderShippingOptions(cart);
    return;
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const promo = getPromoDetails();
  const shippingOption = renderShippingOptions(cart);
  const shippingCost = shippingOption?.price || 0;
  const discountAmount = promo.isValid ? subtotal * promo.rate : 0;
  const total = subtotal - discountAmount + shippingCost;
  if (summaryItems) summaryItems.textContent = String(itemCount);
  if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
  if (summaryDiscount) summaryDiscount.textContent = promo.isValid ? `- ${formatMoney(discountAmount)}` : '$0.00';
  if (summaryShipping) summaryShipping.textContent = formatMoney(shippingCost);
  if (summaryTotal) summaryTotal.textContent = formatMoney(total);

  cartRoot.innerHTML = cart.map((item, index) => `
    <article class="checkout-item-card">
      <img src="${String(item.image || '').replace('../', '')}" alt="${item.name} product image" onerror="this.onerror=null;this.src='${PRODUCT_FALLBACK_IMAGE}'" />
      <div class="checkout-item-copy">
        <h2>${item.name}</h2>
        <p>${item.mgOption} | ${item.packLabel}</p>
        <div class="checkout-item-meta">
          <span>Availability: ${getInventoryLabel(item.inventoryStatus)}</span>
          <span>Unit price: ${item.unitPriceDisplay}</span>
          <span>Quantity: ${item.quantity}</span>
          <span>Line total: ${formatMoney(item.unitPrice * item.quantity)}</span>
        </div>
      </div>
      <button class="remove-item-button" type="button" data-remove-index="${index}">Remove</button>
    </article>`).join('');

  cartRoot.querySelectorAll('[data-remove-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextCart = getCart();
      nextCart.splice(Number(button.getAttribute('data-remove-index')), 1);
      setCart(nextCart);
      renderCart();
    });
  });
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const cart = getCart();
  if (!cart.length) return;

  const formData = new FormData(form);
  const name = formData.get('customerName') || '';
  const email = formData.get('customerEmail') || '';
  const phone = formData.get('customerPhone') || '';
  const shippingAddress = formData.get('shippingAddress') || '';
  const preferredPaymentService = formData.get('preferredPaymentService') || '';
  const paymentHandle = formData.get('paymentHandle') || '';
  const promo = getPromoDetails();
  const notes = formData.get('customerNotes') || '';
  const shippingOption = getSelectedShipping(cart);
  const shippingCost = shippingOption?.price || 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountAmount = promo.isValid ? subtotal * promo.rate : 0;
  const total = subtotal - discountAmount + shippingCost;

  const lines = [
    `New Jonezie order request`,
    ``,
    `Research-use notice: items requested below are for laboratory research only.`,
    ``,
    `Customer: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Shipping Address: ${shippingAddress || 'Not provided'}`,
    `Shipping Method: ${shippingOption ? `${shippingOption.label} | ${shippingOption.window} | ${formatMoney(shippingCost)}` : 'Not selected'}`,
    `Preferred Payment Service: ${preferredPaymentService || 'Not provided'}`,
    `Payment Service Handle: ${paymentHandle || 'Not provided'}`,
    `Promo code: ${promo.isValid ? promo.code : 'None'}`,
    ``,
    `Order items:`
  ];

  cart.forEach((item) => {
    lines.push(`- ${item.name} | ${item.mgOption} | ${item.packLabel} | ${getInventoryLabel(item.inventoryStatus)} | Qty ${item.quantity} | ${item.unitPriceDisplay} each | ${formatMoney(item.unitPrice * item.quantity)} total`);
  });

  lines.push('');
  lines.push(`Subtotal: ${formatMoney(subtotal)}`);
  lines.push(`Discount: ${promo.isValid ? `- ${formatMoney(discountAmount)} (${promo.code})` : '$0.00'}`);
  lines.push(`Shipping: ${shippingOption ? `${formatMoney(shippingCost)} (${shippingOption.label})` : '$0.00'}`);
  lines.push(`Estimated total: ${formatMoney(total)}`);
  lines.push('');
  lines.push('Included with order: Free vial cap cover + Free Hot Girl Summer sticker');
  lines.push('');
  lines.push(`Notes: ${notes}`);

  const subject = encodeURIComponent(`Jonezie Order Request - ${name || 'Customer'}`);
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:customerservice@jonezielabs.com?subject=${subject}&body=${body}`;
});

clearCartButton?.addEventListener('click', () => {
  setCart([]);
  renderCart();
});

promoCodeInput?.addEventListener('input', renderCart);
shippingMethodInput?.addEventListener('change', renderCart);

renderCart();
