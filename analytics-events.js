window.JONEZIE_ANALYTICS = (() => {
  const CURRENCY = 'USD';

  function hasGtag() {
    return typeof window.gtag === 'function';
  }

  function toNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function getItemId(item) {
    return String(item?.slug || item?.item_id || item?.code || item?.name || 'unknown').slice(0, 120);
  }

  function buildItem(item = {}) {
    const quantity = Math.max(1, Number.parseInt(item.quantity || 1, 10) || 1);
    const price = toNumber(item.unitPrice ?? item.price);
    return {
      item_id: getItemId(item),
      item_name: String(item.name || item.item_name || 'Unknown item').slice(0, 120),
      item_category: String(item.category || item.item_category || item.packLabel || '').slice(0, 80),
      item_variant: String(item.mgOption || item.variant || item.code || '').slice(0, 100),
      item_list_name: String(item.itemListName || item.listName || '').slice(0, 100),
      quantity,
      price
    };
  }

  function readableCartFields(items = []) {
    const names = items.map((item) => item.item_name).filter(Boolean);
    const ids = items.map((item) => item.item_id).filter(Boolean);
    const variants = items.map((item) => item.item_variant).filter(Boolean);
    const totalQuantity = items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    const first = items[0] || {};

    return {
      product_name: String(first.item_name || '').slice(0, 120),
      product_id: String(first.item_id || '').slice(0, 120),
      product_variant: String(first.item_variant || '').slice(0, 100),
      cart_product_names: names.join(', ').slice(0, 500),
      cart_product_ids: ids.join(', ').slice(0, 500),
      cart_product_variants: variants.join(', ').slice(0, 500),
      cart_unique_items: items.length,
      cart_total_items: totalQuantity
    };
  }

  function buildCartPayload(cart = [], extra = {}) {
    const items = cart.map(buildItem);
    const value = items.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
    return {
      currency: CURRENCY,
      value,
      items,
      ...readableCartFields(items),
      ...extra
    };
  }

  function event(name, params = {}) {
    if (!name || !hasGtag()) return;
    window.gtag('event', name, params);
  }

  function viewItem(item) {
    const payload = buildCartPayload([{ ...item, quantity: 1 }]);
    event('view_item', payload);
  }

  function selectItem(item) {
    event('select_item', buildCartPayload([{ ...item, quantity: 1 }]));
  }

  function addToCart(item) {
    event('add_to_cart', buildCartPayload([item]));
  }

  function removeFromCart(item) {
    event('remove_from_cart', buildCartPayload([item]));
  }

  function beginCheckout(cart, extra = {}) {
    event('begin_checkout', buildCartPayload(cart, extra));
  }

  function addShippingInfo(cart, shippingOption = {}, extra = {}) {
    event('add_shipping_info', buildCartPayload(cart, {
      shipping_tier: String(shippingOption.label || shippingOption.id || '').slice(0, 80),
      shipping_cost: toNumber(shippingOption.price),
      ...extra
    }));
  }

  function applyPromoCode(code, extra = {}) {
    const normalized = String(code || '').trim();
    if (!normalized) return;
    event('apply_promo_code', {
      coupon: normalized.slice(0, 80),
      ...extra
    });
  }

  function search(term, extra = {}) {
    const searchTerm = String(term || '').trim();
    if (!searchTerm) return;
    event('search', {
      search_term: searchTerm.slice(0, 100),
      ...extra
    });
  }

  function generateLead(source, extra = {}) {
    event('generate_lead', {
      method: String(source || 'lead_capture').slice(0, 80),
      ...extra
    });
  }

  function orderRequestSubmit(payload = {}) {
    const cart = Array.isArray(payload.cart) ? payload.cart : (Array.isArray(payload.items) ? payload.items : []);
    event('order_request_submit', buildCartPayload(cart, {
      value: toNumber(payload.total || payload.totals?.estimatedTotal),
      order_id: String(payload.orderId || '').slice(0, 80),
      coupon: String(payload.promoCode || '').slice(0, 80),
      shipping_tier: String(payload.shipping?.label || payload.shippingMethod?.label || '').slice(0, 80),
      shipping_cost: toNumber(payload.shipping?.cost || payload.shippingMethod?.cost),
      discount: toNumber(payload.totals?.discount)
    }));
  }

  return {
    event,
    buildItem,
    buildCartPayload,
    viewItem,
    selectItem,
    addToCart,
    removeFromCart,
    beginCheckout,
    addShippingInfo,
    applyPromoCode,
    search,
    generateLead,
    orderRequestSubmit
  };
})();
