const CART_KEY = 'jonezie_cart';
const cartRoot = document.querySelector('[data-checkout-cart]');
const summaryItems = document.querySelector('[data-summary-items]');
const summarySubtotal = document.querySelector('[data-summary-subtotal]');
const summaryDiscount = document.querySelector('[data-summary-discount]');
const summaryTotal = document.querySelector('[data-summary-total]');
const form = document.querySelector('[data-checkout-form]');
const clearCartButton = document.querySelector('[data-clear-cart]');
const promoCodeInput = document.querySelector('[data-promo-code]');
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';
const PROMO_CODES = {
  PEPDADDY: 0.2
};

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

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
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
    if (summaryTotal) summaryTotal.textContent = '$0.00';
    return;
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const promo = getPromoDetails();
  const discountAmount = promo.isValid ? subtotal * promo.rate : 0;
  const total = subtotal - discountAmount;
  if (summaryItems) summaryItems.textContent = String(itemCount);
  if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
  if (summaryDiscount) summaryDiscount.textContent = promo.isValid ? `- ${formatMoney(discountAmount)}` : '$0.00';
  if (summaryTotal) summaryTotal.textContent = formatMoney(total);

  cartRoot.innerHTML = cart.map((item, index) => `
    <article class="checkout-item-card">
      <img src="${String(item.image || '').replace('../', '')}" alt="${item.name} product image" onerror="this.onerror=null;this.src='${PRODUCT_FALLBACK_IMAGE}'" />
      <div class="checkout-item-copy">
        <h2>${item.name}</h2>
        <p>${item.mgOption} | ${item.packLabel}</p>
        <div class="checkout-item-meta">
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
  const promo = getPromoDetails();
  const notes = formData.get('customerNotes') || '';
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountAmount = promo.isValid ? subtotal * promo.rate : 0;
  const total = subtotal - discountAmount;

  const lines = [
    `New Jonezie order request`,
    ``,
    `Research-use notice: items requested below are for laboratory research only.`,
    ``,
    `Customer: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Promo code: ${promo.isValid ? promo.code : 'None'}`,
    ``,
    `Order items:`
  ];

  cart.forEach((item) => {
    lines.push(`- ${item.name} | ${item.mgOption} | ${item.packLabel} | Qty ${item.quantity} | ${item.unitPriceDisplay} each | ${formatMoney(item.unitPrice * item.quantity)} total`);
  });

  lines.push('');
  lines.push(`Subtotal: ${formatMoney(subtotal)}`);
  lines.push(`Discount: ${promo.isValid ? `- ${formatMoney(discountAmount)} (${promo.code})` : '$0.00'}`);
  lines.push(`Estimated total: ${formatMoney(total)}`);
  lines.push('');
  lines.push(`Notes: ${notes}`);

  const subject = encodeURIComponent(`Jonezie Order Request - ${name || 'Customer'}`);
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:zvl1380@gmail.com?subject=${subject}&body=${body}`;
});

clearCartButton?.addEventListener('click', () => {
  setCart([]);
  renderCart();
});

promoCodeInput?.addEventListener('input', renderCart);

renderCart();
