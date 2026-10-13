(() => {
  // Set this to the Website ID from the Jonezie Labs Crisp workspace after signup.
  const websiteId = '';
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(websiteId)) return;
  if (document.getElementById('jonezie-crisp-chat')) return;

  window.$crisp = window.$crisp || [];
  window.CRISP_WEBSITE_ID = websiteId;

  const script = document.createElement('script');
  script.id = 'jonezie-crisp-chat';
  script.src = 'https://client.crisp.chat/l.js';
  script.async = true;
  document.head.appendChild(script);
})();
