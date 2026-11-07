// TikTok tracking is limited to the live Fall ad path. No customer or cart data is sent.
window.JONEZIE_TIKTOK_PIXEL = (() => {
  const PIXEL_ID = 'DBMCCORC77U1OI24UGKG';
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname;
  const isLive = host === 'www.jonezielabs.com' || host === 'jonezielabs.com';
  const isCampaignPage = /\/(research-entry|research-store)\.html$/.test(path);
  const isCampaignCheckoutOrProduct =
    /\/(products\/[^/]+|product|checkout)\.html$/.test(path) &&
    new URLSearchParams(window.location.search).get('ad') === 'fall40';
  const enabled = isLive && (isCampaignPage || isCampaignCheckoutOrProduct);
  const trackedRequests = new Set();
  let checkoutStarted = false;

  if (enabled && !window.ttq) {
    // TikTok's queue bootstrap, using the pixel ID supplied for Jonezie Labs.
    window.TiktokAnalyticsObject = 'ttq';
    const ttq = window.ttq = [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready',
      'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
    ttq.setAndDefer = (instance, method) => {
      instance[method] = function () { instance.push([method].concat(Array.from(arguments))); };
    };
    ttq.methods.forEach((method) => ttq.setAndDefer(ttq, method));
    ttq.instance = (id) => {
      const instance = ttq._i[id] || [];
      ttq.methods.forEach((method) => ttq.setAndDefer(instance, method));
      return instance;
    };
    ttq.load = (id, options) => {
      const url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[id] = [];
      ttq._i[id]._u = url;
      ttq._t = ttq._t || {};
      ttq._t[id] = Date.now();
      ttq._o = ttq._o || {};
      ttq._o[id] = options || {};
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `${url}?sdkid=${encodeURIComponent(id)}&lib=ttq`;
      (document.getElementsByTagName('script')[0]?.parentNode || document.head).appendChild(script);
    };
    ttq.load(PIXEL_ID);
    ttq.page();
  }

  function track(eventName) {
    if (!enabled || typeof window.ttq?.track !== 'function') return false;
    window.ttq.track(eventName);
    return true;
  }

  function trackViewContent() {
    track('ViewContent');
  }

  function trackAddToCart() {
    track('AddToCart');
  }

  function trackCheckoutStart() {
    if (checkoutStarted || !track('InitiateCheckout')) return;
    checkoutStarted = true;
  }

  function trackOrderRequest(orderId) {
    const id = String(orderId || '').trim();
    if (!id || trackedRequests.has(id) || !track('Lead')) return;
    trackedRequests.add(id);
    // The invoice is still unpaid. A Lead represents the request, not a Purchase.
  }

  return { enabled, trackViewContent, trackAddToCart, trackCheckoutStart, trackOrderRequest };
})();
