(() => {
  const config = window.JONEZIE_STANDARDS_MERCH || {};
  const products = Array.isArray(config.products) ? config.products : [config.product].filter(Boolean);
  const cartKey = config.cartKey || 'jonezie_standards_merch_cart';
  const orderKey = config.orderKey || 'jonezie_standards_merch_last_order';
  const shippingOptions = config.shippingOptions || [];
  const promotionRate = config.promotion?.enabled === true
    ? Math.min(1, Math.max(0, Number(config.promotion.rate) || 0))
    : 0;

  const money = (value) => Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const by = (selector, scope = document) => scope.querySelector(selector);
  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const cents = (value) => Math.round(Number(value || 0) * 100);
  const basePrice = (item) => Number(products.find((product) => product.slug === item.slug)?.price ?? item.unitPrice) || 0;
  const productPromotionRate = (item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    const specialRate = Math.min(1, Math.max(0, Number(product?.saleRate) || 0));
    return Math.max(promotionRate, specialRate);
  };
  const salePriceCents = (item) => Math.round(cents(basePrice(item)) * (1 - productPromotionRate(item)));
  const freeCase = products.find((item) => item.slug === config.promotion?.freeCaseSlug);
  const qualifyingSlugs = new Set(config.promotion?.qualifyingSlugs || []);
  const freeCaseThreshold = Number(config.promotion?.freeCaseThreshold) || 0;
  const hasFreeCase = (cart) => Boolean(freeCase && freeCaseThreshold &&
    cart.reduce((sum, item) => sum + (qualifyingSlugs.has(item.slug) ? Number(item.quantity) || 0 : 0), 0) >= freeCaseThreshold);

  function renderPromotion() {
    const specialOffers = products.filter((product) => productPromotionRate(product) > promotionRate);
    if (!promotionRate && !specialOffers.length) return;
    const offers = [
      promotionRate ? `${Math.round(promotionRate * 100)}% off ${specialOffers.length ? 'other Standards Store products' : 'every Standards Store item'}` : '',
      ...specialOffers.map((product) => `${product.promotionLabel || product.name}: ${Math.round(productPromotionRate(product) * 100)}% off`),
      freeCaseThreshold ? `Buy ${freeCaseThreshold} qualifying lab equipment items and receive one research case free` : ''
    ].filter(Boolean).join('. ');
    all('[data-merch-promo-announcement]').forEach((node) => {
      node.hidden = false;
      node.textContent = `${offers}. Sale prices are applied automatically in your cart. Ships same day.`;
    });
    all('[data-merch-promo-message]').forEach((node) => {
      node.hidden = false;
      node.textContent = `${offers}. Regular and sale prices are shown below.`;
    });
    all('[data-merch-promo-checkout]').forEach((node) => {
      node.hidden = false;
      node.textContent = `${offers}. Discounts are applied automatically.`;
    });
  }

  function updateStructuredPrices() {
    all('script[type="application/ld+json"]').forEach((script) => {
      let schema;
      try {
        schema = JSON.parse(script.textContent);
      } catch {
        return;
      }
      if (schema['@type'] !== 'Product' || !schema.offers) return;
      const product = products.find((item) => item.sku === schema.sku);
      if (!product) return;
      schema.offers.price = (salePriceCents(product) / 100).toFixed(2);
      script.textContent = JSON.stringify(schema);
    });
  }

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(cartKey) || '[]');
      return Array.isArray(parsed) ? parsed.map((item) => {
        const product = products.find((entry) => entry.slug === item.slug);
        return product ? { ...item, name: product.name } : item;
      }) : [];
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
  }

  if (new URLSearchParams(location.search).get('ad') === 'standards25') {
    all('a[href="checkout.html"]').forEach((link) => { link.href = 'checkout.html?ad=standards25'; });
    all('a[href="index.html"], a[href="index.html#merchandise"]').forEach((link) => {
      link.href = link.getAttribute('href').replace('index.html', 'index.html?ad=standards25');
    });
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
    window.JONEZIE_TIKTOK_PIXEL?.trackAddToCart({ slug: product.slug, quantity });
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
      if (priceNode) {
        priceNode.textContent = money(salePriceCents(product) / 100);
        if (productPromotionRate(product)) {
          const regularPrice = document.createElement('del');
          regularPrice.className = 'standards-price-regular';
          regularPrice.textContent = money(product.price);
          priceNode.before(regularPrice);
          const saleLabel = document.createElement('small');
          saleLabel.className = 'standards-sale-label';
          saleLabel.textContent = `${Math.round(productPromotionRate(product) * 100)}% off`;
          priceNode.after(saleLabel);
        }
      }

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
    const gift = hasFreeCase(cart);
    const items = cartQuantity(cart) + (gift ? 1 : 0);
    const subtotalCents = cart.reduce((sum, item) => sum + cents(basePrice(item)) * Number(item.quantity), 0);
    const saleSubtotalCents = cart.reduce((sum, item) => sum + salePriceCents(item) * Number(item.quantity), 0);
    const shippingCents = cart.length && shipping ? cents(shipping.price) : 0;
    return {
      items,
      subtotal: subtotalCents / 100,
      discount: (subtotalCents - saleSubtotalCents) / 100,
      shipping: shippingCents / 100,
      total: (saleSubtotalCents + shippingCents) / 100,
      promotionRate,
      gift
    };
  }

  function renderSummary() {
    const cart = readCart();
    const shipping = getSelectedShipping();
    const totals = calculateTotals(cart, shipping);
    const map = {
      '[data-summary-items]': String(totals.items),
      '[data-summary-subtotal]': money(totals.subtotal),
      '[data-summary-discount]': `- ${money(totals.discount)}`,
      '[data-summary-shipping]': money(totals.shipping),
      '[data-summary-total]': money(totals.total),
      '[data-summary-tax]': config.tax?.label || 'Calculated on invoice'
    };
    Object.entries(map).forEach(([selector, value]) => {
      const node = by(selector);
      if (node) node.textContent = value;
    });
    const discountLine = by('[data-summary-discount-line]');
    if (discountLine) {
      discountLine.hidden = !totals.discount;
      const label = by('[data-summary-discount-label]', discountLine);
      if (label) label.textContent = 'Standards Store savings';
    }
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
          ${productPromotionRate(item) ? `<del class="checkout-item-regular">${money(basePrice(item))}</del>` : ''}
          <span>${money(salePriceCents(item) / 100)} each</span>
          <span>Qty ${item.quantity}</span>
          <strong>${money(salePriceCents(item) * Number(item.quantity) / 100)}</strong>
        </div>
        <button type="button" data-remove-merch="${index}">Remove</button>
      </article>
    `).join('') + (hasFreeCase(cart) ? `
      <article class="checkout-item checkout-gift">
        <img src="${freeCase.image}" alt="${freeCase.name}" />
        <div><h2>${freeCase.name}</h2><p>Free with 3 qualifying lab equipment items</p><span>Qty 1</span><strong>FREE</strong></div>
      </article>` : '');

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
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const street = String(formData.get('street') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const state = String(formData.get('state') || '').trim().toUpperCase();
    const zip = String(formData.get('zip') || '').trim();
    const paidItems = cart.map((item) => ({
      sku: item.sku,
      slug: item.slug,
      name: item.name,
      option: item.option,
      mgOption: item.option,
      packLabel: item.productType,
      quantity: item.quantity,
      inventoryStatus: 'Order request',
      regularUnitPrice: basePrice(item),
      promotionRate: productPromotionRate(item),
      unitPrice: salePriceCents(item) / 100,
      unitPriceDisplay: money(salePriceCents(item) / 100),
      lineTotal: salePriceCents(item) * Number(item.quantity) / 100,
      lineTotalDisplay: money(salePriceCents(item) * Number(item.quantity) / 100)
    }));
    if (totals.gift) paidItems.push({
      sku: freeCase.sku,
      slug: freeCase.slug,
      name: freeCase.name,
      option: freeCase.option,
      mgOption: freeCase.option,
      packLabel: 'Free case with 3 qualifying lab equipment items',
      quantity: 1,
      inventoryStatus: 'Included with order',
      regularUnitPrice: freeCase.price,
      promotionRate: 1,
      unitPrice: 0,
      unitPriceDisplay: '$0.00',
      lineTotal: 0,
      lineTotalDisplay: '$0.00'
    });
    return {
      orderId: createOrderId(),
      requestedAt: new Date().toISOString(),
      channel: 'standards-merchandise',
      invoiceFlow: 'Review and confirm order, then email a secure invoice link.',
      paymentNotice: 'All invoices must be paid before an order is shipped.',
      paymentFlow: config.payment?.label || 'Secure invoice after order review',
      taxBehavior: config.tax?.label || 'Calculated on invoice',
      customer: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        shippingStreetAddress: street,
        shippingCity: city,
        shippingState: state,
        shippingZip: zip,
        shippingAddress: `${street}, ${city}, ${state} ${zip}`
      },
      promoCode: 'STANDARDS25',
      notes: String(formData.get('notes') || '').trim(),
      shippingMethod: shipping ? { ...shipping, cost: totals.shipping, costDisplay: money(totals.shipping) } : null,
      totals: {
        ...totals,
        itemCount: totals.items,
        subtotalDisplay: money(totals.subtotal),
        discountDisplay: `- ${money(totals.discount)}`,
        shippingDisplay: money(totals.shipping),
        estimatedTotal: totals.total,
        estimatedTotalDisplay: money(totals.total)
      },
      items: paidItems,
      includedWithOrder: totals.gift ? ['One free research case'] : [],
      pageUrl: location.href,
      timezone: String(Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
      locale: String(navigator.language || ''),
      userAgent: String(navigator.userAgent || '')
    };
  }

  function renderSuccess(payload) {
    const success = by('[data-merch-checkout-success]');
    if (!success) return;
    success.hidden = false;
    success.innerHTML = `
      <h2>Order request received.</h2>
      <p>Thank you. We will review your request and email a secure invoice link. No payment was collected on this page.</p>
      <div class="order-reference">
        <span>Order ID</span>
        <strong>${payload.orderId}</strong>
      </div>
      <ul>
        ${payload.items.map((item) => `<li>${item.name} | ${item.option} | Qty ${item.quantity} | ${money(item.lineTotal)}</li>`).join('')}
      </ul>
      ${payload.totals.discount ? `<p>Standards Store promotion saved ${money(payload.totals.discount)}.</p>` : ''}
      <p>Shipping: ${payload.shippingMethod?.label || 'Not selected'} | ${payload.shippingMethod?.window || ''} | ${money(payload.totals.shipping)}</p>
      <p>Estimated due before tax: ${money(payload.totals.total)}. Tax is ${payload.taxBehavior.toLowerCase()}.</p>
      <p>Payment flow: ${payload.paymentFlow}.</p>
    `;
    success.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initCheckoutPage() {
    const form = by('[data-merch-checkout-form]');
    if (!form) return;
    let submitting = false;

    renderShippingOptions();
    renderCheckoutItems();
    renderSummary();
    if (readCart().length) window.JONEZIE_TIKTOK_PIXEL?.trackCheckoutStart();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting) return;
      const feedback = by('[data-merch-checkout-feedback]');
      const cart = readCart();
      if (!cart.length) {
        if (feedback) feedback.textContent = 'Add merchandise before submitting checkout.';
        return;
      }
      if (!form.reportValidity()) return;

      const payload = buildOrderPayload(new FormData(form));
      const submitButton = by('button[type="submit"]', form);
      const endpoint = String(window.JONEZIE_ORDER_REQUEST_CONFIG?.endpoint || '').trim();
      if (!endpoint) {
        if (feedback) feedback.textContent = 'Order requests are unavailable. Please contact orders@jonezielabs.com.';
        return;
      }
      submitting = true;
      if (submitButton) submitButton.disabled = true;
      if (feedback) feedback.textContent = 'Submitting your order request…';
      try {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-store',
          credentials: 'omit',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        submitting = false;
        if (submitButton) submitButton.disabled = false;
        if (feedback) feedback.textContent = 'We could not send your request. Please try again or email orders@jonezielabs.com.';
        console.error('Standards order request failed.', error);
        return;
      }
      localStorage.setItem(orderKey, JSON.stringify(payload));
      window.JONEZIE_TIKTOK_PIXEL?.trackOrderRequest(payload.orderId);
      writeCart([]);
      renderCheckoutItems();
      renderSummary();
      form.hidden = true;
      if (feedback) feedback.textContent = '';
      renderSuccess(payload);
    });
  }

  renderPromotion();
  updateStructuredPrices();
  updateCartCount();
  initProductPage();
  initCheckoutPage();
})();
