(() => {
  const catalog = window.JONEZIE_CATALOG || null;
  const library = window.JONEZIE_SITE_LIBRARY || null;
  if (!catalog || !library) return;

  library.initShellMenus();

  const allProducts = library.getCatalogProducts(catalog).slice().sort((left, right) => left.name.localeCompare(right.name));
  const statsNode = document.querySelector('[data-tools-hero-stats]');
  const storageForm = document.querySelector('[data-storage-form]');
  const storageSelect = document.querySelector('[data-storage-product-select]');
  const storageResult = document.querySelector('[data-storage-result]');
  const mixingForm = document.querySelector('[data-mixing-form]');
  const mixingSelect = document.querySelector('[data-mixing-product-select]');
  const mixingResult = document.querySelector('[data-mixing-result]');
  const reconstitutionForm = document.querySelector('[data-reconstitution-form]');
  const reconstitutionResult = document.querySelector('[data-reconstitution-result]');
  const resourceLinksNode = document.querySelector('[data-tools-resource-links]');
  const copyButtons = {
    reconstitution: document.querySelector('[data-tool-copy="reconstitution"]'),
    storage: document.querySelector('[data-tool-copy="storage"]'),
    mixing: document.querySelector('[data-tool-copy="mixing"]')
  };
  const lastOutputs = {
    reconstitution: '',
    storage: '',
    mixing: ''
  };

  renderStats();
  seedProductSelectors();
  bindToolUtilities();
  bindReconstitutionCalculator();
  bindStorageTool();
  bindMixingTool();
  renderResourceLinks();
  updateMeta();

  function renderStats() {
    if (!statsNode) return;
    statsNode.innerHTML = `
      <article class="guide-stat-card">
        <p class="eyebrow">Calculator</p>
        <strong>Fast concentration reference</strong>
        <span>Turn listed vial strength and dilution volume into a clean mg-per-mL read without breaking flow.</span>
      </article>
      <article class="guide-stat-card">
        <p class="eyebrow">Storage</p>
        <strong>Compound-specific notes</strong>
        <span>Open product-level storage and handling context tied to the active Jonezie catalog.</span>
      </article>
      <article class="guide-stat-card">
        <p class="eyebrow">RUO</p>
        <strong>Research-reference only</strong>
        <span>Every result stays inside laboratory preparation, storage, and comparison language.</span>
      </article>`;
  }

  function seedProductSelectors() {
    const optionsMarkup = allProducts
      .map((product) => `<option value="${escapeHtml(product.slug)}">${escapeHtml(product.name)}</option>`)
      .join('');
    const placeholder = '<option value="">Select a compound</option>';
    if (storageSelect) storageSelect.innerHTML = `${placeholder}${optionsMarkup}`;
    if (mixingSelect) mixingSelect.innerHTML = `${placeholder}${optionsMarkup}`;
    library.enhanceCustomSelects(document);
    resetStorageProfile();
    resetMixingProfile();
    setCopyState('storage', false);
    setCopyState('mixing', false);
  }

  function bindToolUtilities() {
    document.querySelectorAll('[data-tool-copy]').forEach((button) => {
      const key = button.getAttribute('data-tool-copy');
      if (!key) return;
      button.addEventListener('click', async () => {
        if (!lastOutputs[key]) return;
        const defaultLabel = key === 'reconstitution' ? 'Copy Result' : 'Copy Notes';
        await copyText(lastOutputs[key]);
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = defaultLabel;
        }, 1200);
      });
    });

    reconstitutionForm?.addEventListener('reset', () => {
      window.setTimeout(() => {
        lastOutputs.reconstitution = '';
        setCopyState('reconstitution', false);
        renderEmptyToolResult(
          reconstitutionResult,
          'Enter the listed strength and dilution volume to calculate concentration.',
          'This panel is for laboratory research reference only and does not provide dosing guidance.'
        );
      }, 0);
    });

    storageForm?.addEventListener('reset', () => {
      window.setTimeout(() => {
        if (storageSelect) storageSelect.value = '';
        library.enhanceCustomSelects(document);
        resetStorageProfile();
      }, 0);
    });

    mixingForm?.addEventListener('reset', () => {
      window.setTimeout(() => {
        if (mixingSelect) mixingSelect.value = '';
        library.enhanceCustomSelects(document);
        resetMixingProfile();
      }, 0);
    });
  }

  function bindReconstitutionCalculator() {
    reconstitutionForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(reconstitutionForm);
      const vialSize = Number.parseFloat(formData.get('vialSize'));
      const compoundAmount = Number.parseFloat(formData.get('compoundAmount'));
      const dilutionVolume = Number.parseFloat(formData.get('dilutionVolume'));

      if (!Number.isFinite(compoundAmount) || !Number.isFinite(dilutionVolume) || dilutionVolume <= 0) {
        if (reconstitutionResult) {
          reconstitutionResult.innerHTML = `
            <div class="tool-result-heading">
              <span class="tool-result-label">Check the entries</span>
              <strong>Enter valid compound and dilution values.</strong>
            </div>
            <p>Use the listed compound amount and the total dilution volume you want to reference.</p>
            <p class="tool-result-support">${escapeHtml(library.RUO_COPY.short)}</p>`;
        }
        lastOutputs.reconstitution = '';
        setCopyState('reconstitution', false);
        return;
      }

      const concentration = compoundAmount / dilutionVolume;
      const perTenthMl = concentration * 0.1;
      const perQuarterMl = concentration * 0.25;
      const warnings = [];
      if (Number.isFinite(vialSize) && vialSize > 0 && dilutionVolume > vialSize) {
        warnings.push('The entered dilution volume is larger than the vial size entered. Double-check the label before handling.');
      }

      if (reconstitutionResult) {
        reconstitutionResult.innerHTML = `
          <div class="tool-result-heading">
            <span class="tool-result-label">Concentration</span>
            <strong class="tool-result-value">${escapeHtml(concentration.toFixed(2))} mg/mL</strong>
          </div>
          <div class="tool-result-meta">
            <div class="tool-result-chip">
              <span>0.10mL</span>
              <strong>${escapeHtml(perTenthMl.toFixed(2))} mg</strong>
            </div>
            <div class="tool-result-chip">
              <span>0.25mL</span>
              <strong>${escapeHtml(perQuarterMl.toFixed(2))} mg</strong>
            </div>
          </div>
          <p>${warnings[0] || 'Keep this read next to the vial label, storage note, and handling log when reviewing the product.'}</p>
          <p class="tool-result-support">${escapeHtml(library.RUO_COPY.short)}</p>`;
      }

      lastOutputs.reconstitution = [
        `Concentration: ${concentration.toFixed(2)} mg/mL`,
        `0.10mL: ${perTenthMl.toFixed(2)} mg`,
        `0.25mL: ${perQuarterMl.toFixed(2)} mg`,
        warnings.join(' '),
        library.RUO_COPY.short
      ].filter(Boolean).join('\n');
      setCopyState('reconstitution', true);
    });
  }

  function bindStorageTool() {
    storageSelect?.addEventListener('change', () => {
      if (!storageSelect.value) {
        resetStorageProfile();
        return;
      }
      renderStorageProfile(storageSelect.value);
    });
  }

  function bindMixingTool() {
    mixingSelect?.addEventListener('change', () => {
      if (!mixingSelect.value) {
        resetMixingProfile();
        return;
      }
      renderMixingProfile(mixingSelect.value);
    });
  }

  function resetStorageProfile() {
    renderEmptyToolResult(
      storageResult,
      'Select a compound to view storage and handling notes.',
      'Use this panel for laboratory handling reference only.'
    );
    lastOutputs.storage = '';
    setCopyState('storage', false);
  }

  function resetMixingProfile() {
    renderEmptyToolResult(
      mixingResult,
      'Select a compound to view preparation and handling notes.',
      'Use this panel for laboratory handling reference only.'
    );
    lastOutputs.mixing = '';
    setCopyState('mixing', false);
  }

  function renderStorageProfile(slug) {
    const product = library.getProductBySlug(catalog, slug);
    if (!product || !storageResult) return;
    const profile = library.getProductInfoProfile(product, null, catalog);
    storageResult.innerHTML = `
      <div class="tool-result-heading">
        <span class="tool-result-label">Storage guide</span>
        <strong>${escapeHtml(product.name)}</strong>
      </div>
      <div class="tool-result-meta">
        <div class="tool-result-chip">
          <span>Class</span>
          <strong>${escapeHtml(profile.compoundClass)}</strong>
        </div>
        <div class="tool-result-chip">
          <span>Form</span>
          <strong>${escapeHtml(profile.form)}</strong>
        </div>
      </div>
      <p>${escapeHtml(profile.storageNote)}</p>
      <ul class="research-list">
        ${profile.storageProfile.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
      </ul>
      <div class="resource-links-inline">
        <a class="button secondary comparison-inline-link" href="${library.getProductUrl(product.slug)}">View Product Page</a>
        <a class="button secondary comparison-inline-link" href="${library.getGuideUrlForProduct(product)}">View Research Guide</a>
      </div>
      <p class="tool-result-support">${escapeHtml(library.RUO_COPY.short)}</p>`;
    lastOutputs.storage = [
      `${product.name} storage notes`,
      profile.storageNote,
      ...profile.storageProfile.bullets,
      library.RUO_COPY.short
    ].join('\n');
    setCopyState('storage', true);
  }

  function renderMixingProfile(slug) {
    const product = library.getProductBySlug(catalog, slug);
    if (!product || !mixingResult) return;
    const profile = library.getProductInfoProfile(product, null, catalog);
    const comparisonCandidate = profile.comparisonCandidates[0] || null;
    mixingResult.innerHTML = `
      <div class="tool-result-heading">
        <span class="tool-result-label">Preparation guide</span>
        <strong>${escapeHtml(product.name)}</strong>
      </div>
      <div class="tool-result-meta">
        <div class="tool-result-chip">
          <span>Category</span>
          <strong>${escapeHtml(profile.researchCategory)}</strong>
        </div>
        <div class="tool-result-chip">
          <span>Guide</span>
          <strong>${escapeHtml(profile.guide?.title || 'Research Guide')}</strong>
        </div>
      </div>
      <p>${escapeHtml(profile.handlingNote)}</p>
      <ol class="tool-step-list">
        ${profile.mixingProfile.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
      <div class="resource-links-inline">
        <a class="button secondary comparison-inline-link" href="${comparisonCandidate ? library.getComparisonUrl(product.slug, comparisonCandidate.slug) : 'comparison.html'}">View Related Comparison</a>
        <a class="button secondary comparison-inline-link" href="${library.RESOURCE_DOWNLOAD.pageHref}">Open Quick Reference</a>
      </div>
      <p class="tool-result-support">${escapeHtml(library.RUO_COPY.short)}</p>`;
    lastOutputs.mixing = [
      `${product.name} preparation notes`,
      profile.handlingNote,
      ...profile.mixingProfile.steps,
      library.RUO_COPY.short
    ].join('\n');
    setCopyState('mixing', true);
  }

  function renderResourceLinks() {
    if (!resourceLinksNode) return;
    const comparisons = library.getComparisonPairs(catalog, 4);
    resourceLinksNode.innerHTML = `
      <div class="resource-strip">
        <article class="resource-strip-card">
          <p class="eyebrow">Next Pages</p>
          <h2>Keep the supporting references close.</h2>
          <div class="mini-link-grid">
            <a class="mini-link-card" href="research-guides.html">
              <strong>Research Guides</strong>
              <span>Read product lanes, storage context, and nearby compounds before narrowing into a direct comparison.</span>
            </a>
            <a class="mini-link-card" href="comparison.html">
              <strong>Comparison Guides</strong>
              <span>Open side-by-side product reads for class, structure notes, handling context, and related options.</span>
            </a>
            <a class="mini-link-card" href="index.html#full-catalog">
              <strong>Full Products</strong>
              <span>Return to the live catalog for product cards, current pricing, and the active image lineup.</span>
            </a>
            <a class="mini-link-card" href="index.html#faq">
              <strong>FAQ</strong>
              <span>Review ordering, research-use, and site-reference answers without leaving the main Jonezie flow.</span>
            </a>
          </div>
        </article>
        <article class="resource-strip-card">
          <p class="eyebrow">Popular Reads</p>
          <h2>Start with compound pairs that already share a lane.</h2>
          <div class="mini-link-grid">
            ${comparisons.map((pair) => `
              <a class="mini-link-card" href="${library.getComparisonUrl(pair.left.slug, pair.right.slug)}">
                <strong>${escapeHtml(pair.left.name)} vs ${escapeHtml(pair.right.name)}</strong>
                <span>Compare structure notes, storage context, option depth, and related compounds.</span>
              </a>`).join('')}
          </div>
        </article>
      </div>`;
  }

  function updateMeta() {
    const canonicalUrl = `${library.getSiteOrigin()}/research-tools.html`;
    const metaDescription = 'Research tools for concentration reference, storage notes, mixing guidance, and compound comparison at Jonezie Labs.';
    document.title = 'Research Tools | Jonezie Labs';
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
          '@type': 'SoftwareApplication',
          name: 'Jonezie Labs Concentration Calculator',
          applicationCategory: 'Calculator',
          operatingSystem: 'All',
          url: `${canonicalUrl}#reconstitution-calculator`
        }
      ]
    });
  }

  function renderEmptyToolResult(node, title, description) {
    if (!node) return;
    node.innerHTML = `
      <div class="tool-result-heading">
        <span class="tool-result-label">Ready</span>
        <strong>${escapeHtml(title)}</strong>
      </div>
      <p>${escapeHtml(description)}</p>`;
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
    let node = document.head.querySelector('script[data-tools-schema]');
    if (!node) {
      node = document.createElement('script');
      node.type = 'application/ld+json';
      node.setAttribute('data-tools-schema', '');
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(data);
  }

  function escapeHtml(value) {
    return library.escapeHtml(value);
  }

  function setCopyState(key, enabled) {
    const button = copyButtons[key];
    if (!button) return;
    button.disabled = !enabled;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'absolute';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
})();
