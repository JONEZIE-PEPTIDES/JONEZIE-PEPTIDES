(() => {
  const CART_KEY = 'jonezie_cart';
  const MAX_BADGE_COUNT = 99;

  function getCartCount() {
    try {
      const cart = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
      return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    } catch {
      return 0;
    }
  }

  function renderCartBadge() {
    const count = getCartCount();
    const displayCount = count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);

    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = displayCount;
      node.hidden = count === 0;
    });

    document.querySelectorAll('[data-cart-link]').forEach((node) => {
      const suffix = count === 1 ? 'item' : 'items';
      const label = count > 0 ? `Open cart with ${count} ${suffix}` : 'Open cart';
      node.setAttribute('aria-label', label);
    });
  }

  window.addEventListener('storage', (event) => {
    if (!event.key || event.key === CART_KEY) renderCartBadge();
  });
  window.addEventListener('focus', renderCartBadge);
  window.addEventListener('pageshow', renderCartBadge);
  window.addEventListener('jonezie:cart-updated', renderCartBadge);

  renderCartBadge();
})();
