const CART_KEY = 'jonezie_cart';
const cartRoot = document.querySelector('[data-checkout-cart]');
const summaryItems = document.querySelector('[data-summary-items]');
const summaryTotal = document.querySelector('[data-summary-total]');
const form = document.querySelector('[data-checkout-form]');
const clearCartButton = document.querySelector('[data-clear-cart]');
const PRODUCT_FALLBACK_IMAGE = 'product-placeholder.svg';

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
    if (summaryTotal) summaryTotal.textContent = '$0.00';
    return;
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  if (summaryItems) summaryItems.textContent = String(itemCount);
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
  const notes = formData.get('customerNotes') || '';
  const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const lines = [
    `New Jonezie order request`,
    ``,
    `Customer: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    ``,
    `Order items:`
  ];

  cart.forEach((item) => {
    lines.push(`- ${item.name} | ${item.mgOption} | ${item.packLabel} | Qty ${item.quantity} | ${item.unitPriceDisplay} each | ${formatMoney(item.unitPrice * item.quantity)} total`);
  });

  lines.push('');
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

renderCart();
