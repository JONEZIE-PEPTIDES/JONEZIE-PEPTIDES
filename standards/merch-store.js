(() => {
  const config = window.JONEZIE_STANDARDS_MERCH || {};
  const products = Array.isArray(config.products) ? config.products : [config.product].filter(Boolean);
  const cartKey = config.cartKey || 'jonezie_standards_merch_cart';
  const orderKey = config.orderKey || 'jonezie_standards_merch_last_order';
  const shippingOptions = config.shippingOptions || [];

  const money = (value) => Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const by = (selector, scope = document) => scope.querySelector(selector);
  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(cartKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
  }

  function cartQuantity(cart = readCart()) {
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  function updateCartCount() {
    const count = cartQuantity();
    all('[data-merch-cart-count]').forEach((node) => {
      node.textContent = String(count);
    });
  }

  function clampQuantity(input) {
    const parsed = Number.parseInt(input?.value || '1', 10);
    const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    if (input) input.value = String(quantity);
    return quantity;
  }

  function createOrderId() {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `JLS-${stamp}-${suffix}`;
  }

  function findProduct(slug) {
    return products.find((item) => item.slug === slug) || products[0] || {};
  }

  function addProductToCart(product, quantity, option) {
    const cart = readCart();
    const existing = cart.find((item) => item.slug === product.slug && item.option === option);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        option,
        quantity,
        unitPrice: product.price,
        image: product.image,
        productType: product.productType || 'Standards Store'
      });
    }
    writeCart(cart);
  }

  function initProductPage() {
    const forms = all('[data-merch-add-form]');
    if (!forms.length) return;

    forms.forEach((form) => {
      const product = findProduct(form.getAttribute('data-product-slug'));
      const qtyInput = by('[data-merch-quantity]', form);
      const optionInput = by('[data-merch-option]', form);
      const feedback = by('[data-merch-feedback]', form);
      const priceNode = by('[data-product-price]', form.closest('[data-merch-product]') || document);
      if (priceNode) priceNode.textContent = money(product.price);

      by('[data-qty-minus]', form)?.addEventListener('click', () => {
        const current = clampQuantity(qtyInput);
        qtyInput.value = String(Math.max(1, current - 1));
      });

      by('[data-qty-plus]', form)?.addEventListener('click', () => {
        const current = clampQuantity(qtyInput);
        qtyInput.value = String(current + 1);
      });

      qtyInput?.addEventListener('blur', () => clampQuantity(qtyInput));

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const quantity = clampQuantity(qtyInput);
        const option = optionInput?.value || product.option || 'Standard';
        addProductToCart(product, quantity, option);
        if (feedback) feedback.textContent = `${product.name} (${option}) added to cart.`;
      });
    });

    const lightbox = by('[data-merch-lightbox]');
    const imageOpen = by('[data-merch-image-open]');
    const closeButtons = all('[data-merch-image-close]');
    imageOpen?.addEventListener('click', () => {
      if (!lightbox) return;
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
    });
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (!lightbox) return;
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !lightbox || lightbox.hidden) return;
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
    });
  }

  function getSelectedShipping() {
    const select = by('[data-merch-shipping]');
    const selectedId = select?.value || shippingOptions[0]?.id || '';
    return shippingOptions.find((option) => option.id === selectedId) || shippingOptions[0] || null;
  }

  function calculateTotals(cart = readCart(), shipping = getSelectedShipping()) {
    const items = cartQuantity(cart);
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity)), 0);
    const shippingCost = cart.length && shipping ? Number(shipping.price || 0) : 0;
    return {
      items,
      subtotal,
      shipping: shippingCost,
      total: subtotal + shippingCost
    };
  }

  function renderSummary() {
    const cart = readCart();
    const shipping = getSelectedShipping();
    const totals = calculateTotals(cart, shipping);
    const map = {
      '[data-summary-items]': String(totals.items),
      '[data-summary-subtotal]': money(totals.subtotal),
      '[data-summary-shipping]': money(totals.shipping),
      '[data-summary-total]': money(totals.total),
      '[data-summary-tax]': config.tax?.label || 'Calculated on invoice'
    };
    Object.entries(map).forEach(([selector, value]) => {
      const node = by(selector);
      if (node) node.textContent = value;
    });
  }

  function renderCheckoutItems() {
    const root = by('[data-merch-checkout-items]');
    if (!root) return;
    const cart = readCart();

    if (!cart.length) {
      root.innerHTML = `
        <div class="empty-cart-card">
          <h2>Your Standards cart is empty.</h2>
          <p>Add an item from the Standards store before submitting an order request.</p>
          <a class="store-button primary" href="index.html#merchandise">Shop Standards Store</a>
        </div>`;
      return;
    }

    root.innerHTML = cart.map((item, index) => `
      <article class="checkout-item">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h2>${item.name}</h2>
          <p>${item.option} | ${item.productType}</p>
          <span>${money(item.unitPrice)} each</span>
          <span>Qty ${item.quantity}</span>
          <strong>${money(item.unitPrice * item.quantity)}</strong>
        </div>
        <button type="button" data-remove-merch="${index}">Remove</button>
      </article>
    `).join('');

    all('[data-remove-merch]', root).forEach((button) => {
      button.addEventListener('click', () => {
        const next = readCart();
        next.splice(Number(button.getAttribute('data-remove-merch')), 1);
        writeCart(next);
        renderCheckoutItems();
        renderSummary();
      });
    });
  }

  function renderShippingOptions() {
    const select = by('[data-merch-shipping]');
    if (!select) return;
    select.innerHTML = shippingOptions.map((option) => `
      <option value="${option.id}">${option.label} - ${option.window} - ${money(option.price)}</option>
    `).join('');
    select.addEventListener('change', renderSummary);
  }

  function buildOrderPayload(formData) {
    const cart = readCart();
    const shipping = getSelectedShipping();
    const totals = calculateTotals(cart, shipping);
    return {
      orderId: createOrderId(),
      requestedAt: new Date().toISOString(),
      channel: 'standards-merchandise',
      paymentFlow: config.payment?.label || 'Secure invoice after order review',
      taxBehavior: config.tax?.label || 'Calculated on invoice',
      customer: {
        firstName: String(formData.get('firstName') || '').trim(),
        lastName: String(formData.get('lastName') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        street: String(formData.get('street') || '').trim(),
        city: String(formData.get('city') || '').trim(),
        state: String(formData.get('state') || '').trim().toUpperCase(),
        zip: String(formData.get('zip') || '').trim()
      },
      notes: String(formData.get('notes') || '').trim(),
      shippingMethod: shipping,
      totals,
      items: cart.map((item) => ({
        sku: item.sku,
        name: item.name,
        option: item.option,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity
      })),
      pageUrl: location.href
    };
  }

  function renderSuccess(payload) {
    const success = by('[data-merch-checkout-success]');
    if (!success) return;
    success.hidden = false;
    success.innerHTML = `
      <h2>Merchandise order request staged.</h2>
      <p>This staging checkout captured the request locally and did not send a live payment or production order.</p>
      <div class="order-reference">
        <span>Order ID</span>
        <strong>${payload.orderId}</strong>
      </div>
      <ul>
        ${payload.items.map((item) => `<li>${item.name} | ${item.option} | Qty ${item.quantity} | ${money(item.lineTotal)}</li>`).join('')}
      </ul>
      <p>Shipping: ${payload.shippingMethod?.label || 'Not selected'} | ${payload.shippingMethod?.window || ''} | ${money(payload.totals.shipping)}</p>
      <p>Estimated due before tax: ${money(payload.totals.total)}. Tax is ${payload.taxBehavior.toLowerCase()}.</p>
      <p>Payment flow: ${payload.paymentFlow}.</p>
    `;
    success.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initCheckoutPage() {
    const form = by('[data-merch-checkout-form]');
    if (!form) return;

    renderShippingOptions();
    renderCheckoutItems();
    renderSummary();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const feedback = by('[data-merch-checkout-feedback]');
      const cart = readCart();
      if (!cart.length) {
        if (feedback) feedback.textContent = 'Add merchandise before submitting checkout.';
        return;
      }
      if (!form.reportValidity()) return;

      const payload = buildOrderPayload(new FormData(form));
      localStorage.setItem(orderKey, JSON.stringify(payload));
      writeCart([]);
      renderCheckoutItems();
      renderSummary();
      form.hidden = true;
      if (feedback) feedback.textContent = '';
      renderSuccess(payload);
    });
  }

  updateCartCount();
  initProductPage();
  initCheckoutPage();
})();
