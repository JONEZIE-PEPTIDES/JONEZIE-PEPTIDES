(() => {
  const DEFAULT_PROMO = {
    code: 'PEPPERS',
    rate: 0.10,
    freeShipping: false,
    message: 'Use code PEPPERS for 10% off'
  };

  const MEMORIAL_DAY_PROMO = {
    code: 'MD25',
    rate: 0.25,
    freeShipping: false,
    message: 'Memorial Day sale: use code MD25 for 25% off',
    startsAt: '2026-05-22T00:00:00-04:00',
    endsAt: '2026-05-26T00:00:00-04:00'
  };

  function isPromoActive(promo, now = Date.now()) {
    if (!promo?.startsAt || !promo?.endsAt) return true;
    const startsAt = Date.parse(promo.startsAt);
    const endsAt = Date.parse(promo.endsAt);
    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) return false;
    return now >= startsAt && now < endsAt;
  }

  function getActivePromo(now = Date.now()) {
    return isPromoActive(MEMORIAL_DAY_PROMO, now) ? MEMORIAL_DAY_PROMO : DEFAULT_PROMO;
  }

  function getPromoByCode(code, now = Date.now()) {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) return null;
    if (normalized === MEMORIAL_DAY_PROMO.code) {
      return isPromoActive(MEMORIAL_DAY_PROMO, now) ? MEMORIAL_DAY_PROMO : null;
    }
    if (normalized === DEFAULT_PROMO.code) return DEFAULT_PROMO;
    return null;
  }

  function renderPromoCopy() {
    const activePromo = getActivePromo();
    document.querySelectorAll('.promo-track span').forEach((span) => {
      if (span.textContent.includes('Use code') || span.textContent.includes('Memorial Day sale')) {
        span.textContent = activePromo.message;
      }
    });

    const checkoutPromoCopy = document.querySelector('[data-active-promo-copy]');
    if (checkoutPromoCopy) {
      checkoutPromoCopy.innerHTML = `Active code: <strong>${activePromo.code}</strong> (${Math.round(activePromo.rate * 100)}% off)`;
    }
  }

  window.JONEZIE_PROMO = {
    DEFAULT_PROMO,
    MEMORIAL_DAY_PROMO,
    getActivePromo,
    getPromoByCode,
    isPromoActive
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderPromoCopy, { once: true });
  } else {
    renderPromoCopy();
  }
})();
