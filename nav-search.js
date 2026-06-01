(() => {
  const NAV_CATEGORY_LINKS = [
    ['index.html#full-catalog', 'Full Products'],
    ['index.html#featured', 'Popular Products'],
    ['why-jonezie.html', 'Why Jonezie'],
    ['research-tools.html', 'Research Tools'],
    ['research-guides.html', 'Research Guides'],
    ['comparison.html', 'Comparisons'],
    ['michigan-peptides.html', 'Michigan'],
    ['index.html#merch', 'Merch'],
    ['index.html#faq', 'FAQ'],
    ['index.html#process', 'Ordering']
  ];

  installStickyHeaderRule();
  syncSiteNavigation();
  syncWhyJonezieHomepage();

  const catalog = window.JONEZIE_CATALOG || null;
  const library = window.JONEZIE_SITE_LIBRARY || null;
  const forms = document.querySelectorAll('[data-nav-search-form]');
  if (!forms.length) return;

  const products = [];
  const seen = new Set();
  [...(catalog?.featured || []), ...(catalog?.products || [])].forEach((product) => {
    if (!product?.slug || seen.has(product.slug)) return;
    seen.add(product.slug);
    products.push({ name: product.name, slug: product.slug });
  });

  products.sort((a, b) => a.name.localeCompare(b.name));

  forms.forEach((form) => {
    const input = form.querySelector('[data-nav-search-input]');
    if (!input) return;

    const listId = input.getAttribute('list');
    const list = listId ? document.getElementById(listId) : null;
    if (list) {
      list.innerHTML = products.map((product) => `<option value="${escapeHtml(product.name)}"></option>`).join('');
    }

    input.addEventListener('input', () => input.setCustomValidity(''));
    input.addEventListener('change', () => {
      navigateToProduct(input);
    });
    input.addEventListener('search', () => {
      navigateToProduct(input, { reportMissing: true });
    });
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      navigateToProduct(input, { reportMissing: true });
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      navigateToProduct(input, { reportMissing: true });
    });
  });

  function navigateToProduct(input, { reportMissing = false } = {}) {
    const query = input.value.trim().toLowerCase();
    if (!query || !products.length) return false;

    const exactMatch = products.find((product) => {
      return product.name.toLowerCase() === query || product.slug.toLowerCase() === query;
    });
    const partialMatch = products.find((product) => {
      return product.name.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query);
    });
    const match = exactMatch || partialMatch;

    if (match) {
      window.location.href = library?.getProductUrl ? library.getProductUrl(match.slug) : `products/${encodeURIComponent(match.slug)}.html`;
      return true;
    }

    if (reportMissing) {
      input.setCustomValidity('No matching product found.');
      input.reportValidity();
    }

    return false;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function syncSiteNavigation() {
    const isHome = /(^|\/)(index\.html)?$/.test(window.location.pathname);
    const normalizeHref = (href) => {
      if (!isHome) return href;
      return href.replace(/^index\.html(?=#)/, '');
    };

    document.querySelectorAll('.brand-menu-panel').forEach((panel) => {
      panel.innerHTML = NAV_CATEGORY_LINKS
        .map(([href, label]) => `<a href="${normalizeHref(href)}">${label}</a>`)
        .join('');
    });

    document.querySelectorAll('.site-nav').forEach((nav) => {
      const productPill = nav.querySelector('.nav-products-pill');
      nav.querySelectorAll('.site-nav-mobile-link').forEach((link) => link.remove());
      const mobileMarkup = NAV_CATEGORY_LINKS
        .map(([href, label]) => `<a href="${normalizeHref(href)}" class="site-nav-mobile-link">${label}</a>`)
        .join('');
      if (productPill) {
        productPill.insertAdjacentHTML('beforebegin', mobileMarkup);
        productPill.href = normalizeHref('index.html#full-catalog');
      }
    });
  }

  function installStickyHeaderRule() {
    if (document.getElementById('jonezie-sticky-header-rule')) return;
    const style = document.createElement('style');
    style.id = 'jonezie-sticky-header-rule';
    style.textContent = `
      .site-header,
      .site-header-home,
      .site-header-home.site-header-home-sticky,
      .product-header {
        position: sticky !important;
        top: 14px !important;
        z-index: 90 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function syncWhyJonezieHomepage() {
    const mission = document.getElementById('mission');
    if (mission) mission.remove();

    const resourceGrid = document.querySelector('#research-resources .resource-grid');
    if (!resourceGrid || resourceGrid.querySelector('[href="why-jonezie.html"]')) return;

    resourceGrid.insertAdjacentHTML('afterbegin', `
      <a class="resource-card resource-card-featured" href="why-jonezie.html">
        <p class="eyebrow">Why Jonezie</p>
        <h3>A cleaner way to shop peptides.</h3>
        <p>See how Jonezie keeps the catalog clear, pricing straightforward, checkout simple, and support easy to reach.</p>
        <span class="catalog-link">Open Why Jonezie</span>
      </a>
    `);
  }
})();
