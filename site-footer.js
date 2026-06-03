(() => {
  const ROOT = location.pathname.includes('/products/') ? '../' : '';
  const FOOTER_STYLE_ID = 'jonezie-site-footer-styles';
  const FOOTER_CSS = `
    .site-footer{width:min(100%,1440px);margin:44px auto 0;padding:0 0 28px;color:rgba(232,243,248,.78)}
    .site-footer-main,.site-footer-legal{border:1px solid rgba(98,219,240,.22);background:radial-gradient(circle at 98% 8%,rgba(255,95,169,.15),transparent 26%),linear-gradient(180deg,rgba(5,16,24,.96),rgba(4,12,19,.98));box-shadow:0 28px 80px rgba(0,0,0,.34)}
    .site-footer-main{display:grid;grid-template-columns:minmax(230px,.95fr) minmax(175px,.62fr) minmax(220px,.72fr) minmax(300px,.9fr);gap:clamp(24px,3.2vw,54px);align-items:start;padding:clamp(30px,4vw,56px);border-radius:24px}
    .site-footer-logo{display:inline-flex;align-items:center;max-width:286px;margin-bottom:24px}.site-footer-logo img{display:block;width:min(100%,286px);height:auto;object-fit:contain}
    .site-footer-brand h2{margin:0;color:#fff;font-family:"Space Grotesk",sans-serif;font-size:clamp(1.72rem,2.25vw,2.55rem);line-height:1.25;letter-spacing:0}.site-footer-brand h2 span{color:#ff5fa9}
    .site-footer-brand p,.site-footer-help p,.site-footer-legal p{margin:18px 0 0;color:rgba(232,243,248,.78);font-size:clamp(.95rem,1vw,1.02rem);line-height:1.55}
    .site-footer-brand p{max-width:330px}.site-footer-socials{display:flex;gap:16px;margin-top:28px}.site-footer-socials a,.site-footer-legal-icon{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.03);color:#62dbf0}.site-footer-socials a{width:54px;height:54px}.site-footer-socials a:nth-child(2),.site-footer-socials a:nth-child(3){color:#ff5fa9}.site-footer svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .site-footer-links{display:grid;gap:0}.site-footer-links h3{margin:0 0 22px;color:#31d8df;font-family:"Space Grotesk",sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase}.site-footer-links h3:after{content:"";display:block;width:40px;height:3px;margin-top:16px;border-radius:999px;background:#31d8df}.site-footer-links-support h3{color:#ff5fa9}.site-footer-links-support h3:after{background:#ff5fa9}
    .site-footer-links a{display:grid;grid-template-columns:minmax(0,1fr) 18px;gap:12px;align-items:center;min-height:54px;border-bottom:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.88);font-size:.97rem;text-decoration:none}.site-footer-links a svg{width:18px;height:18px;color:#31d8df}.site-footer-links-support a svg{color:#ff5fa9}
    .site-footer-help{align-self:stretch;padding:28px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:radial-gradient(circle at 96% 4%,rgba(255,95,169,.22),transparent 34%),linear-gradient(180deg,rgba(15,29,40,.92),rgba(7,17,26,.96))}
    .site-footer-help h3{margin:0;color:#fff;font-family:"Space Grotesk",sans-serif;font-size:clamp(1.35rem,1.8vw,1.85rem);line-height:1.15}.site-footer-contact-button{display:inline-flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:56px;margin-top:24px;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#f23891,#31cfff);color:#fff;font-weight:900;text-decoration:none}.site-footer-contact-button svg{width:24px;height:24px}
    .site-footer-email,.site-footer-supplier a{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.86);font-size:clamp(.76rem,.88vw,.92rem);line-height:1.3;text-decoration:none;overflow-wrap:anywhere}.site-footer-email{margin-top:20px}.site-footer-email svg,.site-footer-supplier a svg{width:20px;height:20px;flex:0 0 20px;color:#31d8df}.site-footer-supplier{display:grid;gap:10px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.1)}.site-footer-supplier>span{color:rgba(232,243,248,.66);font-weight:800}
    .site-footer-legal{display:grid;grid-template-columns:64px minmax(0,1fr) auto minmax(180px,.28fr);gap:24px;align-items:center;margin-top:26px;padding:24px 40px;border-radius:20px}.site-footer-legal p{margin:0}.site-footer-legal-icon{width:54px;height:54px;color:#31d8df}.site-footer-dot{width:7px;height:7px;border-radius:50%;background:#ff5fa9}.site-footer-copyright{text-align:left}
    @media (max-width:1080px){.site-footer-main{grid-template-columns:1fr 1fr}.site-footer-help{grid-column:1 / -1}.site-footer-legal{grid-template-columns:54px 1fr;gap:18px}.site-footer-dot{display:none}.site-footer-copyright{text-align:left}}
    @media (max-width:860px){.site-footer{margin-top:32px}.site-footer-main{grid-template-columns:1fr;padding:26px;border-radius:20px}.site-footer-brand h2{font-size:1.75rem}.site-footer-logo img{width:min(100%,240px)}.site-footer-socials a{width:50px;height:50px}.site-footer-links h3{font-size:1rem}.site-footer-links a{min-height:50px}.site-footer-help{padding:22px}.site-footer-contact-button{min-height:52px}.site-footer-legal{grid-template-columns:1fr;padding:22px}.site-footer-legal-icon{width:48px;height:48px}}
  `;
  const FOOTER_HTML = `
    <div class="site-footer-main">
      <section class="site-footer-brand" aria-label="Jonezie Labs">
        <a class="site-footer-logo" href="${ROOT}index.html" aria-label="Jonezie Labs home">
          <img src="${ROOT}footer-jonezie-labs-logo.webp?v=20260603a" alt="Jonezie Labs" loading="eager" decoding="async" />
        </a>
        <h2>Quality peptides.<br />Clear pricing.<br /><span>Real support.</span></h2>
        <p>Built for researchers who want cleaner ordering, better product navigation, and faster answers.</p>
        <div class="site-footer-socials" aria-label="Jonezie Labs links">
          <a href="${ROOT}research-tools.html" aria-label="Research tools">
            ${icon('beaker')}
          </a>
          <a href="mailto:customerservice@jonezielabs.com?subject=Jonezie%20Labs%20Support" aria-label="Email Jonezie Labs">
            ${icon('mail')}
          </a>
          <a href="https://www.instagram.com/jonezielabs" target="_blank" rel="noopener" aria-label="Jonezie Labs on Instagram">
            ${icon('instagram')}
          </a>
        </div>
      </section>

      <nav class="site-footer-links" aria-label="Footer shop links">
        <h3>Shop</h3>
        <a href="${ROOT}index.html#featured"><span>Ready to Ship</span>${icon('chevron')}</a>
        <a href="${ROOT}product.html"><span>Full Catalog</span>${icon('chevron')}</a>
        <a href="${ROOT}index.html#featured"><span>Popular Picks</span>${icon('chevron')}</a>
        <a href="${ROOT}research-tools.html"><span>Research Tools</span>${icon('chevron')}</a>
        <a href="${ROOT}index.html#faq"><span>FAQ</span>${icon('chevron')}</a>
      </nav>

      <nav class="site-footer-links site-footer-links-support" aria-label="Footer support links">
        <h3>Support</h3>
        <a href="mailto:customerservice@jonezielabs.com?subject=Jonezie%20Labs%20Support"><span>Contact Us</span>${icon('chevron')}</a>
        <a href="mailto:orders@jonezie.com?subject=Order%20Help"><span>Order Help</span>${icon('chevron')}</a>
        <a href="${ROOT}index.html#faq"><span>Shipping & Processing</span>${icon('chevron')}</a>
        <a href="mailto:customerservice@jonezielabs.com?subject=COAs%20and%20Product%20Questions"><span>COAs & Product Questions</span>${icon('chevron')}</a>
        <a href="${ROOT}index.html#supplier-intake"><span>Supplier Intake</span>${icon('chevron')}</a>
      </nav>

      <aside class="site-footer-help" aria-label="Order support">
        <h3>Need help with an order?</h3>
        <p>Questions about products, invoices, shipping, or order status get handled by a real person.</p>
        <a class="site-footer-contact-button" href="mailto:customerservice@jonezielabs.com?subject=Jonezie%20Labs%20Support">
          ${icon('mail')}
          <span>Contact Us</span>
        </a>
        <a class="site-footer-email" href="mailto:customerservice@jonezielabs.com">
          ${icon('mail')}
          <span>customerservice@jonezielabs.com</span>
        </a>
        <div class="site-footer-supplier">
          <span>Supplier inquiries:</span>
          <a href="mailto:procurement@jonezielabs.com?subject=Jonezie%20Labs%20Supplier%20Inquiry">
            ${icon('mail')}
            <span>procurement@jonezielabs.com</span>
          </a>
        </div>
      </aside>
    </div>

    <div class="site-footer-legal">
      <div class="site-footer-legal-icon" aria-hidden="true">${icon('beaker')}</div>
      <p>Research-use only. Not for human or veterinary use.<br />Products and information are not intended to diagnose, treat, cure, or prevent any disease.</p>
      <span aria-hidden="true" class="site-footer-dot"></span>
      <p class="site-footer-copyright">&copy; 2026 Jonezie Labs LLC.<br />All rights reserved.</p>
    </div>
  `;

  function renderFooter() {
    injectFooterStyles();
    const existingFooter = document.querySelector('footer.site-footer, footer.why-page-footer');
    const footer = existingFooter || document.createElement('footer');
    footer.className = 'site-footer';
    footer.setAttribute('aria-label', 'Jonezie Labs footer');
    footer.innerHTML = FOOTER_HTML;

    if (!existingFooter) {
      const shell = document.querySelector('.page-shell, .home-shell') || document.body;
      shell.appendChild(footer);
    }
  }

  function injectFooterStyles() {
    if (document.getElementById(FOOTER_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = FOOTER_STYLE_ID;
    style.textContent = FOOTER_CSS;
    document.head.appendChild(style);
  }

  function icon(name) {
    const icons = {
      beaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v5.5L4.8 18.4A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.8-2.6L14 8.5V3"/><path d="M7.7 16h8.6"/><path d="M9 12.6h6"/></svg>',
      mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M16.8 7.2h.01"/></svg>',
      chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-5 4v-4.2a3.5 3.5 0 0 1-1-2.4z"/><path d="M8.5 8.5h7"/><path d="M8.5 11h4"/></svg>',
      chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'
    };
    return icons[name] || '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter, { once: true });
  } else {
    renderFooter();
  }
})();
