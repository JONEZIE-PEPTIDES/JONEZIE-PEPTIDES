(() => {
  const catalog = window.JONEZIE_CATALOG || null;
  const content = window.JONEZIE_PRODUCT_CONTENT || null;
  const library = window.JONEZIE_SITE_LIBRARY || null;
  if (!catalog || !library) return;

  library.initShellMenus();

  const statsNode = document.querySelector('[data-guide-stats]');
  const guideIndexNode = document.querySelector('[data-guide-index]');
  const guideSectionsNode = document.querySelector('[data-guide-sections]');
  const resourceLinksNode = document.querySelector('[data-guide-resource-links]');

  renderStats();
  renderGuideIndex();
  renderGuideSections();
  renderResourceLinks();
  updateMeta();

  function renderStats() {
    if (!statsNode) return;
    statsNode.innerHTML = `
      <article class="guide-stat-card">
        <p class="eyebrow">Guides</p>
        <strong>Lane-first product reading</strong>
        <span>Use category-led guides to keep related compounds, products, and comparisons in the same reference flow.</span>
      </article>
      <article class="guide-stat-card">
        <p class="eyebrow">Handling</p>
        <strong>Storage and prep context</strong>
        <span>Each guide keeps storage, handling, and comparison notes close to the compounds in that lane.</span>
      </article>
      <article class="guide-stat-card">
        <p class="eyebrow">RUO</p>
        <strong>Research-reference only</strong>
        <span>All guide copy stays inside laboratory, analytical, and catalog-reference language.</span>
      </article>`;
  }

  function renderGuideIndex() {
    if (!guideIndexNode) return;
    guideIndexNode.innerHTML = library.GUIDE_LIBRARY.map((guide) => `
      <a class="resource-card" href="#guide-${guide.key}">
        <p class="eyebrow">Guide</p>
        <h3>${escapeHtml(guide.title)}</h3>
        <p>${escapeHtml(guide.summary)}</p>
        <span class="catalog-link">View guide</span>
      </a>`).join('');
  }

  function renderGuideSections() {
    if (!guideSectionsNode) return;
    guideSectionsNode.innerHTML = library.GUIDE_LIBRARY.map((guide) => {
      const products = library.getGuideProductList(guide.key, catalog, 6);
      const comparisonCards = library.getComparisonPairs(catalog, 48)
        .filter((pair) => guide.categories.includes(pair.left?.category) || guide.categories.includes(pair.right?.category))
        .slice(0, 4);
      const practicalNotes = buildGuidePracticalNotes(guide, products);
      const relatedTools = buildGuideTools(products);

      return `
        <section id="guide-${guide.key}" class="guide-article">
          <div class="section-heading compact">
            <p class="eyebrow">${escapeHtml(guide.categories.join(' / '))}</p>
            <h2>${escapeHtml(guide.title)}</h2>
            <p>${escapeHtml(guide.intro)}</p>
          </div>
          <div class="guide-article-grid">
            <article class="guide-article-card">
              <p class="eyebrow">Key Concepts</p>
              <h3>What defines this lane</h3>
              <ul class="research-list">
                ${guide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
              </ul>
            </article>
            <article class="guide-article-card">
              <p class="eyebrow">Practical Notes</p>
              <h3>Storage, handling, and review notes</h3>
              <ul class="research-list">
                ${practicalNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}
              </ul>
              <p class="guide-ruo-note">${escapeHtml(library.RUO_COPY.full)}</p>
            </article>
            <article class="guide-article-card">
              <p class="eyebrow">Related Products</p>
              <h3>Start with current listings</h3>
              <div class="mini-link-grid">
                ${products.map((product) => renderProductMiniCard(product)).join('')}
              </div>
            </article>
            <article class="guide-article-card">
              <p class="eyebrow">Related Comparisons</p>
              <h3>Open direct side-by-side reads</h3>
              <div class="mini-link-grid">
                ${comparisonCards.map((pair) => renderComparisonMiniCard(pair.left, pair.right)).join('')}
              </div>
            </article>
            <article class="guide-article-card">
              <p class="eyebrow">Related Tools</p>
              <h3>Reference pages to keep open</h3>
              <div class="mini-link-grid">
                ${relatedTools.map((tool) => renderToolMiniCard(tool)).join('')}
              </div>
            </article>
            <article class="guide-article-card">
              <p class="eyebrow">FAQ</p>
              <h3>Common guide questions</h3>
              <div class="guide-faq-list">
                ${guide.faq.map((item) => `
                  <div class="guide-faq-item">
                    <strong>${escapeHtml(item.question)}</strong>
                    <p>${escapeHtml(item.answer)}</p>
                  </div>`).join('')}
              </div>
            </article>
          </div>
        </section>`;
    }).join('');
  }

  function renderResourceLinks() {
    if (!resourceLinksNode) return;
    resourceLinksNode.innerHTML = `
      <div class="resource-strip">
        <article class="resource-strip-card">
          <p class="eyebrow">Comparisons</p>
          <h2>When the lane is clear, open the side-by-side read.</h2>
          <p>Move from the guide into direct compound comparisons for structure notes, product context, storage, and related listings.</p>
          <div class="resource-links-inline">
            <a class="button secondary" href="comparison.html">View Comparisons</a>
            <a class="button secondary" href="research-tools.html">Use Research Tools</a>
          </div>
        </article>
        <article class="resource-strip-card">
          <p class="eyebrow">Catalog</p>
          <h2>Keep the rest of the reference flow close.</h2>
          <div class="mini-link-grid">
            <a class="mini-link-card" href="index.html#full-catalog">
              <strong>Full Products</strong>
              <span>Return to the live product listing for current pricing, card presentation, and the active catalog view.</span>
            </a>
            <a class="mini-link-card" href="${library.RESOURCE_DOWNLOAD.pageHref}">
              <strong>${escapeHtml(library.RESOURCE_DOWNLOAD.title)}</strong>
              <span>${escapeHtml(library.RESOURCE_DOWNLOAD.description)}</span>
            </a>
            <a class="mini-link-card" href="index.html#faq">
              <strong>FAQ</strong>
              <span>Review ordering, research-use, and catalog-reference answers without leaving the main site shell.</span>
            </a>
          </div>
        </article>
      </div>`;
  }

  function buildGuidePracticalNotes(guide, products) {
    const leadProduct = products[0] || null;
    const leadProfile = leadProduct ? library.getProductInfoProfile(leadProduct, getProductContent(leadProduct), catalog) : null;
    const forms = Array.from(new Set(products.map((product) => library.getProductForm(product)).filter(Boolean))).slice(0, 3);
    const notes = [];

    if (forms.length) {
      notes.push(`Most listings in this lane are cataloged as ${forms.join(', ').toLowerCase()}.`);
    }
    if (leadProfile?.storageNote) {
      notes.push(leadProfile.storageNote);
    }
    if (leadProfile?.handlingNote) {
      notes.push(leadProfile.handlingNote);
    }
    notes.push(`Use direct comparisons after you confirm product class, listed strengths, and the broader research context for ${guide.title.replace(/\s+Research Guide$/i, '').toLowerCase()}.`);

    return notes.slice(0, 4);
  }

  function buildGuideTools(products) {
    const seen = new Set();
    const collected = [];

    products.forEach((product) => {
      library.getRelatedToolSet(product).forEach((tool) => {
        if (!tool?.key || seen.has(tool.key)) return;
        seen.add(tool.key);
        collected.push(tool);
      });
    });

    if (!collected.length) {
      return library.TOOL_LIBRARY.slice(0, 4);
    }

    return collected.slice(0, 4);
  }

  function renderProductMiniCard(product) {
    const profile = library.getProductInfoProfile(product, getProductContent(product), catalog);
    return `
      <a class="mini-link-card" href="${library.getProductUrl(product.slug)}">
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(profile.researchContext)}</span>
      </a>`;
  }

  function renderComparisonMiniCard(leftProduct, rightProduct) {
    return `
      <a class="mini-link-card" href="${library.getComparisonUrl(leftProduct.slug, rightProduct.slug)}">
        <strong>${escapeHtml(leftProduct.name)} vs ${escapeHtml(rightProduct.name)}</strong>
        <span>Open the direct comparison for class notes, storage context, current strengths, and nearby compounds.</span>
      </a>`;
  }

  function renderToolMiniCard(tool) {
    return `
      <a class="mini-link-card" href="${escapeHtml(tool.href)}">
        <strong>${escapeHtml(tool.title)}</strong>
        <span>${escapeHtml(tool.description)}</span>
      </a>`;
  }

  function updateMeta() {
    const canonicalUrl = `${library.getSiteOrigin()}/research-guides.html`;
    const metaDescription = 'Crawlable Jonezie Labs research guides covering reconstitution, storage and handling, COA basics, product labels, comparison flow, cold chain, and lyophilized vial reference notes.';
    document.title = 'Research Guides & Handling References | Jonezie Labs';
    upsertMeta('meta[name="description"]', { name: 'description', content: metaDescription });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: document.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metaDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: document.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metaDescription });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    setStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: document.title,
          url: canonicalUrl,
          description: metaDescription
        },
        {
          '@type': 'ItemList',
          itemListElement: library.GUIDE_LIBRARY.map((guide, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: guide.title,
            url: `${canonicalUrl}#guide-${guide.key}`
          }))
        }
      ]
    });
  }

  function getProductContent(product) {
    return content?.products?.[product.slug] || null;
  }

  function upsertMeta(selector, attributes) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      document.head.appendChild(node);
    }
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function upsertLink(selector, attributes) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('link');
      document.head.appendChild(node);
    }
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function setStructuredData(data) {
    let node = document.head.querySelector('script[data-guides-schema]');
    if (!node) {
      node = document.createElement('script');
      node.type = 'application/ld+json';
      node.setAttribute('data-guides-schema', '');
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(data);
  }

  function escapeHtml(value) {
    return library.escapeHtml(value);
  }
})();
