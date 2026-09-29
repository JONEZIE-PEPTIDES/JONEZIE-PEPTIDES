window.JONEZIE_ORDER_REQUEST_CONFIG = {
  // Keep empty on production until the durable staging service is approved.
  durableEndpoint: '',
  requestTimeoutMs: 12000,
  // Existing Google Apps Script remains the backup submission path.
  endpoint: 'https://script.google.com/macros/s/AKfycbwWz85m0vclkbd7w7lDN9EhbUC71X-KtwXW5Hgy3H5VLl9OOFVU3yiNGVtDhGelhw-f/exec',
  fallbackEmail: 'orders@jonezielabs.com'
};
