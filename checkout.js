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
const CHECKOUT_UPDATE_SESSION_KEY = 'jonezie_checkout_update_seen';
const checkoutSearchParams = new URLSearchParams(window.location.search);
const forceCheckoutUpdatePreview = checkoutSearchParams.get('showCheckoutUpdate') === '1';
const PROMO_CODES = {
  PEPPERS: {
    rate: 0.10,
    freeShipping: false
  },
  LOCAL15: {
    rate: 0.15,
    freeShipping: true
  },
  MILKO: {
    rate: 0.60,
    freeShipping: false
  }
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
initCheckoutUpdateModal();

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

function initCheckoutUpdateModal() {
  if (!form) return;
  if (!forceCheckoutUpdatePreview && hasSeenCheckoutUpdate()) return;

  const modal = injectCheckoutUpdateModal();
  if (!modal) return;

  if (forceCheckoutUpdatePreview) {
    openCheckoutUpdateModal(modal, 'Preview override');
    return;
  }

  const triggerOpen = (event) => {
    if (!isCheckoutDataField(event.target)) return;
    openCheckoutUpdateModal(modal, 'Checkout form started');
    form.removeEventListener('input', triggerOpen, true);
    form.removeEventListener('change', triggerOpen, true);
  };

  form.addEventListener('input', triggerOpen, true);
  form.addEventListener('change', triggerOpen, true);
}

function injectCheckoutUpdateModal() {
  const wrapper = document.createElement('div');
  wrapper.className = 'lead-capture-modal checkout-update-modal';
  wrapper.hidden = true;
  wrapper.innerHTML = `
    <div class="lead-capture-backdrop checkout-update-backdrop" data-checkout-update-close></div>
    <div class="lead-capture-dialog checkout-update-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-update-title">
      <button class="lead-capture-close checkout-update-close" type="button" data-checkout-update-close aria-label="Close checkout update">&times;</button>
      <div class="lead-capture-brand checkout-update-brand">
        <img class="lead-capture-logo checkout-update-logo" src="jonezie-logo-white-text-transparent.webp" alt="Jonezie Labs" />
      </div>
      <h2 id="checkout-update-title">Important Checkout Update</h2>
      <div class="checkout-update-copy">
        <p>Jonezie Labs is currently implementing a new payment processor that will soon support all major credit cards and Apple Pay.</p>
        <p>In the meantime, please continue filling out your checkout information as normal. Once your order is submitted, a member of our team will personally email you shortly after order confirmation to finalize payment using whichever method you feel most comfortable with.</p>
        <p>You will also receive a picture of your shipping label next to your ordered products once your order is packed and ready to ship, along with open communication from our team through delivery.</p>
        <p>Thank you for choosing Jonezie Labs.</p>
        <p class="checkout-update-signoff">xoxo,<br />Lenny</p>
      </div>
      <button class="button primary lead-capture-submit checkout-update-cta" type="button" data-checkout-update-close>Continue Checkout</button>
    </div>`;

  document.body.appendChild(wrapper);

  wrapper.querySelectorAll('[data-checkout-update-close]').forEach((element) => {
    element.addEventListener('click', () => closeCheckoutUpdateModal(wrapper));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !wrapper.hidden) closeCheckoutUpdateModal(wrapper);
  });

  return wrapper;
}

function openCheckoutUpdateModal(modal, trigger) {
  if (!modal || (!forceCheckoutUpdatePreview && hasSeenCheckoutUpdate())) return;
  modal.hidden = false;
  modal.dataset.trigger = trigger;
  markCheckoutUpdateSeen();
  document.body.classList.add('checkout-update-open');
  window.requestAnimationFrame(() => {
    modal.classList.add('is-visible');
  });
}

function closeCheckoutUpdateModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-visible');
  document.body.classList.remove('checkout-update-open');
  window.setTimeout(() => {
    modal.hidden = true;
  }, 220);
}

function hasSeenCheckoutUpdate() {
  try {
    return window.sessionStorage.getItem(CHECKOUT_UPDATE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markCheckoutUpdateSeen() {
  try {
    window.sessionStorage.setItem(CHECKOUT_UPDATE_SESSION_KEY, '1');
  } catch {}
}

function isCheckoutDataField(target) {
  return target instanceof HTMLElement
    && target.matches('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
}

function getInventoryLabel(status) {
  const value = String(status || 'in_stock').toLowerCase();
  if (value === 'backorder') return 'Backorder';
  if (value === 'sold_out') return 'Sold Out';
  return 'In Stock';
}

function getPromoDetails() {
  const rawCode = String(promoCodeInput?.value || '').trim().toUpperCase();
  const promo = PROMO_CODES[rawCode] || null;
  return {
    code: rawCode,
    rate: promo?.rate || 0,
    freeShipping: Boolean(promo?.freeShipping),
    isValid: Boolean(promo)
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

function getEffectiveShippingCost(shippingOption, promo) {
  if (!shippingOption) return 0;
  return promo?.freeShipping ? 0 : (shippingOption.price || 0);
}

function renderShippingOptions(cart, promo = null) {
  if (!shippingMethodInput) return null;
  const availableOptions = getAvailableShippingOptions(cart);
  const previousValue = shippingMethodInput.value;

  shippingMethodInput.innerHTML = availableOptions.map((option) => `
    <option value="${option.id}">
      ${option.label} - ${option.window} - ${promo?.freeShipping ? 'FREE' : formatMoney(option.price)}
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
    shippingHelp.textContent = promo?.freeShipping
      ? `Free shipping applied with ${promo.code}. ${selected.window} delivery window.`
      : `${selected.note}. ${selected.window} delivery window.`;
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
    renderShippingOptions(cart, getPromoDetails());
    return;
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const promo = getPromoDetails();
  const shippingOption = renderShippingOptions(cart, promo);
  const shippingCost = getEffectiveShippingCost(shippingOption, promo);
  const discountAmount = promo.isValid ? subtotal * promo.rate : 0;
  const total = subtotal - discountAmount + shippingCost;
  if (summaryItems) summaryItems.textContent = String(itemCount);
  if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
  if (summaryDiscount) summaryDiscount.textContent = promo.isValid ? `- ${formatMoney(discountAmount)}` : '$0.00';
  if (summaryShipping) summaryShipping.textContent = promo.freeShipping && shippingOption ? 'FREE' : formatMoney(shippingCost);
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
  const shippingCost = getEffectiveShippingCost(shippingOption, promo);
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
    `Shipping Method: ${shippingOption ? `${shippingOption.label} | ${shippingOption.window} | ${promo.freeShipping ? 'FREE' : formatMoney(shippingCost)}` : 'Not selected'}`,
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
  lines.push(`Shipping: ${shippingOption ? `${promo.freeShipping ? 'FREE' : formatMoney(shippingCost)} (${shippingOption.label})` : '$0.00'}`);
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
