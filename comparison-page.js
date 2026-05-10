(() => {
  const catalog = window.JONEZIE_CATALOG || null;
  const content = window.JONEZIE_PRODUCT_CONTENT || null;
  const library = window.JONEZIE_SITE_LIBRARY || null;
  if (!catalog || !library) return;

  const IMAGE_ASSET_VERSION = '20260505b';
  const FALLBACK_IMAGE = 'product-placeholder.svg';
  const SITE_ORIGIN = library.getSiteOrigin();

  library.initShellMenus();

  const allProducts = library.getCatalogProducts(catalog);
  const comparisonProducts = allProducts.filter((product) => library.isComparisonEligible(product));
  const productMap = library.getProductMap(catalog);
  const params = new URLSearchParams(window.location.search);
  const initialLeft = productMap.get(params.get('left') || '');
  const initialRight = productMap.get(params.get('right') || '');
  const hasRequestedPair = Boolean(params.get('left') && params.get('right'));
  const hasValidPair = initialLeft && initialRight && library.areProductsComparable(initialLeft, initialRight);

  const titleNode = document.querySelector('[data-comparison-title]');
  const descriptionNode = document.querySelector('[data-comparison-description]');
  const selectorNode = document.querySelector('[data-comparison-selector]');
  const summaryNode = document.querySelector('[data-comparison-summary]');
  const tableNode = document.querySelector('[data-comparison-table]');
  const linksNode = document.querySelector('[data-comparison-links]');
  const faqNode = document.querySelector('[data-comparison-faq]');
  const hubNode = document.querySelector('[data-comparison-hub]');

  renderSelector(initialLeft, initialRight);
  renderHub(initialLeft, initialRight);

  if (!hasValidPair) {
    renderEmptyState(hasRequestedPair);
    updateMeta(null, null);
    return;
  }

  renderPair(initialLeft, initialRight);

  function renderEmptyState(hasRequestedPair) {
    if (summaryNode) {
      summaryNode.innerHTML = `
        <div class="section-heading compact">
          <p class="eyebrow">${hasRequestedPair ? 'Choose A Better Match' : 'Start A Comparison'}</p>
          <h2>${hasRequestedPair ? 'Choose two compounds from the same research lane.' : 'Start with two compounds that belong in the same lane.'}</h2>
          <p>${hasRequestedPair
            ? 'The strongest side-by-side reads happen when class, product form, and handling context already overlap.'
            : 'Open a cleaner comparison by starting with compounds that share a closer research lane, structure profile, or product context.'}</p>
        </div>
        <div class="comparison-overview-grid">
          <article class="comparison-overview-card">
            <strong>Class and structure</strong>
            <p>Start with compounds that live in the same lane so class notes and structure differences stay meaningful.</p>
          </article>
          <article class="comparison-overview-card">
            <strong>Product context</strong>
            <p>Compare current strengths, form, and related compounds once the broader research lane is already aligned.</p>
          </article>
          <article class="comparison-overview-card">
            <strong>Storage and handling</strong>
            <p>Keep cold-chain and preparation notes close, especially when two compounds could both fit the same reference set.</p>
          </article>
        </div>`;
    }

    if (tableNode) {
      tableNode.innerHTML = `
        <article class="comparison-table-card">
          <div class="section-heading compact">
            <p class="eyebrow">How To Use This Page</p>
            <h2>Choose the lane first, then compare the product details.</h2>
            <p>Once the research lane is clear, move into class notes, listed strengths, storage, handling, and nearby compounds.</p>
          </div>
        </article>`;
    }

    if (linksNode) {
      linksNode.innerHTML = `
        <div class="resource-strip">
          <article class="resource-strip-card">
            <p class="eyebrow">Research Guides</p>
            <h2>Start with the right guide.</h2>
            <p>Use the guide library to narrow the lane before opening a direct product-versus-product read.</p>
            <a class="button secondary" href="research-guides.html">View Research Guides</a>
          </article>
          <article class="resource-strip-card">
            <p class="eyebrow">Research Tools</p>
            <h2>Keep storage and preparation notes close.</h2>
            <div class="mini-link-grid">
              <a class="mini-link-card" href="research-tools.html">
                <strong>Research Tools</strong>
                <span>Open concentration, storage, and preparation references inside the same brand flow.</span>
              </a>
              <a class="mini-link-card" href="index.html#full-catalog">
                <strong>Full Products</strong>
                <span>Return to the live catalog for product cards, current pricing, and the active listing view.</span>
              </a>
            </div>
          </article>
        </div>`;
    }

    if (faqNode) {
      faqNode.innerHTML = `
        <div class="faq-shell">
          <div class="section-heading compact">
            <p class="eyebrow">Comparison FAQ</p>
            <h2>What these pages are built to answer.</h2>
          </div>
          <div class="faq-list">
            ${renderFaqDetails([
              {
                question: 'What belongs in a direct comparison?',
                answer: 'The cleanest comparisons start with compounds that already share a research lane, product class, or a close product context.'
              },
              {
                question: 'What should I review first on a comparison page?',
                answer: 'Start with compound class, form, and structure notes, then move into listed strengths, storage, and handling context.'
              },
              {
                question: 'What does this page avoid on purpose?',
                answer: 'Comparison content is limited to laboratory, analytical, and catalog reference. It does not provide human-use instructions, dosing, or outcome claims.'
              }
            ])}
          </div>
        </div>`;
    }
  }

  function renderPair(leftProduct, rightProduct) {
    const leftContent = getProductContent(leftProduct);
    const rightContent = getProductContent(rightProduct);
    const leftProfile = library.getProductInfoProfile(leftProduct, leftContent, catalog);
    const rightProfile = library.getProductInfoProfile(rightProduct, rightContent, catalog);
    const relatedProducts = uniqueProducts([
      ...leftProfile.relatedCompounds,
      ...rightProfile.relatedCompounds,
      ...leftProfile.comparisonCandidates,
      ...rightProfile.comparisonCandidates
    ], [leftProduct.slug, rightProduct.slug]).slice(0, 6);
    const relatedComparisons = library.getComparisonPairs(catalog, 72)
      .filter((pair) => {
        const slugs = [pair.left?.slug, pair.right?.slug];
        if (slugs.includes(leftProduct.slug) || slugs.includes(rightProduct.slug)) return false;
        return library.areProductsComparable(leftProduct, pair.left) || library.areProductsComparable(rightProduct, pair.right);
      })
      .slice(0, 6);
    const combinedTools = uniqueTools([...leftProfile.relatedTools, ...rightProfile.relatedTools]).slice(0, 4);

    if (titleNode) titleNode.textContent = `${leftProduct.name} vs ${rightProduct.name}`;
    if (descriptionNode) {
      descriptionNode.textContent = `A neutral side-by-side reference for ${leftProduct.name} and ${rightProduct.name}, covering class notes, structure, storage, and handling context.`;
    }

    if (summaryNode) {
      summaryNode.innerHTML = `
        <div class="section-heading compact">
          <p class="eyebrow">Quick Take</p>
          <h2>${escapeHtml(getComparisonHeadline(leftProduct, rightProduct))}</h2>
          <p>${escapeHtml(getComparisonSummary(leftProduct, rightProduct))}</p>
        </div>
        <div class="comparison-overview-grid">
          <article class="comparison-overview-card">
            <strong>Class and structure</strong>
            <p>${escapeHtml(buildClassDistinction(leftProfile, rightProfile))}</p>
          </article>
          <article class="comparison-overview-card">
            <strong>Research context</strong>
            <p>${escapeHtml(buildContextDistinction(leftProfile, rightProfile))}</p>
          </article>
          <article class="comparison-overview-card">
            <strong>Storage and handling</strong>
            <p>${escapeHtml(buildHandlingDistinction(leftProfile, rightProfile))}</p>
          </article>
        </div>
        <div class="comparison-card-grid">
          ${renderProductSummaryCard(leftProduct, leftProfile)}
          ${renderProductSummaryCard(rightProduct, rightProfile)}
        </div>
        <article class="comparison-table-card comparison-context-card">
          <div class="section-heading compact">
            <p class="eyebrow">Research Context</p>
            <h2>What stands apart in the catalog read.</h2>
            <p>Use the notes below to keep class, form, and related-product context visible before moving deeper into pricing and option depth.</p>
          </div>
          <div class="comparison-context-grid">
            ${renderContextColumn(leftProduct, leftProfile)}
            ${renderContextColumn(rightProduct, rightProfile)}
          </div>
        </article>`;
    }

    if (tableNode) {
      tableNode.innerHTML = `
        <article class="comparison-table-card">
          <div class="section-heading compact">
            <p class="eyebrow">Comparison Table</p>
            <h2>${escapeHtml(leftProduct.name)} vs ${escapeHtml(rightProduct.name)}</h2>
            <p>Use this table for a neutral read on product class, structure, form, storage, handling, and nearby references.</p>
          </div>
          <div class="comparison-table-wrap">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>${escapeHtml(leftProduct.name)}</th>
                  <th>${escapeHtml(rightProduct.name)}</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRow('Compound class', leftProfile.compoundClass, rightProfile.compoundClass)}
                ${renderTableRow('Research category', leftProfile.researchCategory, rightProfile.researchCategory)}
                ${renderTableRow('Form', leftProfile.form, rightProfile.form)}
                ${renderTableRow('Structure note', leftProfile.structureNote, rightProfile.structureNote)}
                ${renderTableRow('Current strengths', formatStrengthList(leftProfile.strengths), formatStrengthList(rightProfile.strengths))}
                ${renderTableRow('Starting single-vial price', library.formatMoney(library.getStartingPrice(leftProduct)), library.formatMoney(library.getStartingPrice(rightProduct)))}
                ${renderTableRow('Typical research context', leftProfile.researchContext, rightProfile.researchContext)}
                ${renderTableRow('Storage considerations', leftProfile.storageNote, rightProfile.storageNote)}
                ${renderTableRow('Handling notes', leftProfile.handlingNote, rightProfile.handlingNote)}
                ${renderTableRow('Related guide', renderAnchor(library.getGuideUrlForProduct(leftProduct), leftProfile.guide?.title || 'Research Guide'), renderAnchor(library.getGuideUrlForProduct(rightProduct), rightProfile.guide?.title || 'Research Guide'), true)}
                ${renderTableRow('Related tools', renderToolLinks(leftProfile.relatedTools.slice(0, 3)), renderToolLinks(rightProfile.relatedTools.slice(0, 3)), true)}
                ${renderTableRow('Related compounds', renderProductLinks(leftProfile.relatedCompounds.slice(0, 3)), renderProductLinks(rightProfile.relatedCompounds.slice(0, 3)), true)}
              </tbody>
            </table>
          </div>
        </article>`;
    }

    if (linksNode) {
      linksNode.innerHTML = `
        <div class="resource-strip">
          <article class="resource-strip-card">
            <p class="eyebrow">Related Products</p>
            <h2>Stay inside the same reference lane.</h2>
            <div class="mini-link-grid">
              ${relatedProducts.map((product) => renderMiniLinkCard(product)).join('')}
            </div>
          </article>
          <article class="resource-strip-card">
            <p class="eyebrow">Related Pages</p>
            <h2>Keep the next reads close.</h2>
            <div class="mini-link-grid">
              ${renderTextLinkCard('Research Tools', 'Open concentration, storage, and preparation notes for the same lineup.', 'research-tools.html')}
              ${renderTextLinkCard(leftProfile.guide?.title || 'Research Guide', leftProfile.guide?.summary || 'Open the related research guide.', library.getGuideUrlForProduct(leftProduct))}
              ${leftProfile.guide?.key !== rightProfile.guide?.key
                ? renderTextLinkCard(rightProfile.guide?.title || 'Research Guide', rightProfile.guide?.summary || 'Open the related research guide.', library.getGuideUrlForProduct(rightProduct))
                : ''}
              ${renderTextLinkCard('RUO Quick Reference', library.RESOURCE_DOWNLOAD.description, library.RESOURCE_DOWNLOAD.pageHref)}
            </div>
          </article>
        </div>
        <div class="comparison-table-card comparison-context-card">
          <div class="section-heading compact">
            <p class="eyebrow">Related Tools</p>
            <h2>Reference tools that fit this comparison.</h2>
            <div class="mini-link-grid">
              ${combinedTools.map((tool) => renderTextLinkCard(tool.title, tool.description, tool.href)).join('')}
            </div>
          </div>
        </div>
        <div class="section-heading compact comparison-secondary-heading">
          <p class="eyebrow">More Comparisons</p>
          <h2>Open nearby side-by-side reads.</h2>
        </div>
        <div class="resource-grid">
          ${relatedComparisons.map((pair) => renderComparisonLinkCard(pair.left, pair.right)).join('')}
        </div>`;
    }

    if (faqNode) {
      faqNode.innerHTML = `
        <div class="faq-shell">
          <div class="section-heading compact">
            <p class="eyebrow">Comparison FAQ</p>
            <h2>Reference questions that come up first.</h2>
          </div>
          <div class="faq-list">
            ${renderFaqDetails(library.getComparisonFaqs(leftProduct, rightProduct))}
          </div>
        </div>`;
    }

    updateMeta(leftProduct, rightProduct);
  }

  function renderSelector(selectedLeft, selectedRight) {
    if (!selectorNode) return;

    const optionsMarkup = buildOptionsMarkup(comparisonProducts);

    selectorNode.innerHTML = `
      <p class="eyebrow">Choose Compounds</p>
      <h2>Select two compounds from the same research lane.</h2>
      <form class="comparison-select-form" data-comparison-select-form>
        <label>
          <span>First compound</span>
          <select name="leftSlug" required>
            <option value="">Select a compound</option>
            ${optionsMarkup}
          </select>
        </label>
        <label>
          <span>Second compound</span>
          <select name="rightSlug" required>
            <option value="">Select a compound</option>
            ${optionsMarkup}
          </select>
        </label>
        <button class="button primary comparison-select-submit" type="submit">Compare Compounds</button>
      </form>
      <div class="comparison-selector-note">
        <strong>Keep the read tight</strong>
        <p>Start with one compound and the second list narrows to the closest lane match.</p>
        <small data-comparison-selector-feedback>Choose two compounds that share a closer research lane, class, or product context.</small>
      </div>`;

    const form = selectorNode.querySelector('[data-comparison-select-form]');
    const leftSelect = form?.querySelector('select[name="leftSlug"]');
    const rightSelect = form?.querySelector('select[name="rightSlug"]');
    const feedbackNode = selectorNode.querySelector('[data-comparison-selector-feedback]');

    if (leftSelect && selectedLeft && library.isComparisonEligible(selectedLeft)) leftSelect.value = selectedLeft.slug;
    if (rightSelect && selectedRight && library.isComparisonEligible(selectedRight)) rightSelect.value = selectedRight.slug;

    syncSelectorOptions();
    library.enhanceCustomSelects(selectorNode);

    leftSelect?.addEventListener('change', () => syncSelectorOptions('left'));
    rightSelect?.addEventListener('change', () => syncSelectorOptions('right'));

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const leftSlug = leftSelect?.value;
      const rightSlug = rightSelect?.value;
      if (!leftSlug || !rightSlug || leftSlug === rightSlug) {
        if (feedbackNode) feedbackNode.textContent = 'Select two different compounds from the same research lane.';
        return;
      }
      window.location.href = library.getComparisonUrl(leftSlug, rightSlug);
    });

    function syncSelectorOptions(changedSide = '') {
      const currentLeft = productMap.get(leftSelect?.value || '');
      const currentRight = productMap.get(rightSelect?.value || '');

      const leftPool = comparisonProducts.filter((product) => {
        if (currentRight && !library.areProductsComparable(product, currentRight)) return false;
        if (currentRight?.slug && product.slug === currentRight.slug) return false;
        return true;
      });

      const rightPool = comparisonProducts.filter((product) => {
        if (currentLeft && !library.areProductsComparable(currentLeft, product)) return false;
        if (currentLeft?.slug && product.slug === currentLeft.slug) return false;
        return true;
      });

      const nextLeftValue = leftPool.some((product) => product.slug === leftSelect?.value) ? leftSelect?.value || '' : '';
      const nextRightValue = rightPool.some((product) => product.slug === rightSelect?.value) ? rightSelect?.value || '' : '';

      if (leftSelect) {
        leftSelect.innerHTML = `<option value="">Select a compound</option>${buildOptionsMarkup(leftPool)}`;
        leftSelect.value = nextLeftValue;
      }

      if (rightSelect) {
        rightSelect.innerHTML = `<option value="">Select a compound</option>${buildOptionsMarkup(rightPool)}`;
        rightSelect.value = nextRightValue;
      }

      library.enhanceCustomSelects(form);

      if (!feedbackNode) return;
      const anchorProduct = currentLeft || currentRight;
      if (!anchorProduct) {
        feedbackNode.textContent = 'Choose two compounds that share a closer research lane, class, or product context.';
        return;
      }

      const availableCount = changedSide === 'right' ? leftPool.length : rightPool.length;
      feedbackNode.textContent = `Showing ${library.getComparisonThemeLabel(anchorProduct).toLowerCase()} only. ${availableCount} closely matched option${availableCount === 1 ? '' : 's'} available from here.`;
    }
  }

  function renderHub(selectedLeft, selectedRight) {
    if (!hubNode) return;
    const pairCards = library.getComparisonPairs(catalog, 12)
      .map((pair) => renderComparisonLinkCard(pair.left, pair.right))
      .join('');

    hubNode.innerHTML = `
      <div class="section-heading compact">
        <p class="eyebrow">Comparison Library</p>
        <h2>${selectedLeft && selectedRight ? 'More side-by-side reads in the same lane' : 'Browse comparisons with a real overlap'}</h2>
        <p>Each comparison is narrowed to compounds that already share a stronger lane match, product context, or structure relationship.</p>
      </div>
      <div class="resource-grid">${pairCards}</div>`;
  }

  function renderProductSummaryCard(product, profile) {
    return `
      <article class="comparison-product-card">
        <div class="comparison-product-media">
          <img src="${escapeHtml(getImageSrc(product.image))}" alt="${escapeHtml(product.name)} product image" loading="eager" decoding="async" />
        </div>
        <div class="comparison-product-copy">
          <p class="eyebrow">${escapeHtml(profile.researchCategory)}</p>
          <h2>${escapeHtml(product.name)}</h2>
          <p>${escapeHtml(profile.researchContext)}</p>
          <div class="comparison-metric-row">
            <div class="comparison-metric">
              <span>Class</span>
              <strong>${escapeHtml(profile.compoundClass)}</strong>
            </div>
            <div class="comparison-metric">
              <span>Form</span>
              <strong>${escapeHtml(profile.form)}</strong>
            </div>
            <div class="comparison-metric">
              <span>From</span>
              <strong>${escapeHtml(library.formatMoney(library.getStartingPrice(product)))}</strong>
            </div>
          </div>
          <div class="comparison-product-facts">
            <div>
              <span>Structure note</span>
              <strong>${escapeHtml(profile.structureNote)}</strong>
            </div>
            <div>
              <span>Handling</span>
              <strong>${escapeHtml(profile.handlingNote)}</strong>
            </div>
          </div>
          <div class="option-chips">
            ${profile.strengths.map((strength) => `<span>${escapeHtml(strength)}</span>`).join('')}
          </div>
          <div class="comparison-actions-inline">
            <a class="button secondary comparison-inline-link" href="${library.getProductUrl(product.slug)}">View Product Page</a>
            <a class="button secondary comparison-inline-link" href="${library.getGuideUrlForProduct(product)}">View Research Guide</a>
          </div>
        </div>
      </article>`;
  }

  function renderContextColumn(product, profile) {
    return `
      <article class="comparison-context-column">
        <p class="eyebrow">${escapeHtml(product.name)}</p>
        <h3>${escapeHtml(profile.compoundClass)}</h3>
        <ul class="research-list">
          <li>${escapeHtml(profile.researchContext)}</li>
          <li>${escapeHtml(profile.storageNote)}</li>
          <li>${escapeHtml(profile.comparisonSummary)}</li>
        </ul>
      </article>`;
  }

  function renderComparisonLinkCard(leftProduct, rightProduct) {
    if (!leftProduct || !rightProduct) return '';
    const href = library.getComparisonUrl(leftProduct.slug, rightProduct.slug);
    return `
      <a class="resource-card" href="${href}">
        <p class="eyebrow">Comparison</p>
        <h3>${escapeHtml(leftProduct.name)} vs ${escapeHtml(rightProduct.name)}</h3>
        <p>${escapeHtml(getComparisonSummary(leftProduct, rightProduct))}</p>
        <div class="comparison-card-meta">
          <span>${escapeHtml(library.getComparisonThemeLabel(leftProduct))}</span>
          <span>${escapeHtml(`${library.getOptionStrengthList(leftProduct).length} vs ${library.getOptionStrengthList(rightProduct).length} listed strengths`)}</span>
        </div>
        <span class="catalog-link">View comparison</span>
      </a>`;
  }

  function renderMiniLinkCard(product) {
    const profile = library.getProductInfoProfile(product, getProductContent(product), catalog);
    return `
      <a class="mini-link-card" href="${library.getProductUrl(product.slug)}">
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(profile.researchContext)}</span>
      </a>`;
  }

  function renderTextLinkCard(title, description, href) {
    return `
      <a class="mini-link-card" href="${href}">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(description)}</span>
      </a>`;
  }

  function renderFaqDetails(items) {
    return items.map((item, index) => `
      <details${index === 0 ? ' open' : ''}>
        <summary>
          <span class="faq-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="faq-question-copy">
            <strong>${escapeHtml(item.question)}</strong>
            <small>Comparison support</small>
          </span>
          <span class="faq-toggle" aria-hidden="true"></span>
        </summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>`).join('');
  }

  function renderTableRow(label, leftValue, rightValue, allowHtml = false) {
    return `
      <tr>
        <th>${escapeHtml(label)}</th>
        <td>${allowHtml ? leftValue : escapeHtml(leftValue)}</td>
        <td>${allowHtml ? rightValue : escapeHtml(rightValue)}</td>
      </tr>`;
  }

  function renderAnchor(href, text) {
    return `<a href="${href}">${escapeHtml(text)}</a>`;
  }

  function renderProductLinks(products) {
    if (!products.length) return 'None linked';
    return products.map((product) => renderAnchor(library.getProductUrl(product.slug), product.name)).join('<br />');
  }

  function renderToolLinks(tools) {
    if (!tools.length) return 'None linked';
    return tools.map((tool) => renderAnchor(tool.href, tool.title)).join('<br />');
  }

  function getImageSrc(path) {
    const sanitized = String(path || '').replace('../', '').trim();
    if (!sanitized) return `${FALLBACK_IMAGE}?v=${IMAGE_ASSET_VERSION}`;
    if (sanitized.includes('?')) return sanitized;
    return `${sanitized}?v=${IMAGE_ASSET_VERSION}`;
  }

  function getProductContent(product) {
    return content?.products?.[product.slug] || null;
  }

  function buildOptionsMarkup(products) {
    return products
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((product) => `<option value="${escapeHtml(product.slug)}">${escapeHtml(product.name)}</option>`)
      .join('');
  }

  function getComparisonHeadline(leftProduct, rightProduct) {
    return `${leftProduct.name} and ${rightProduct.name}, read side by side inside the same research lane.`;
  }

  function getComparisonSummary(leftProduct, rightProduct) {
    return `${library.getComparisonThemeLabel(leftProduct)} with product class, form, storage, and handling details kept in one cleaner read.`;
  }

  function buildClassDistinction(leftProfile, rightProfile) {
    if (leftProfile.compoundClass === rightProfile.compoundClass) {
      return `Both products sit inside the ${leftProfile.compoundClass.toLowerCase()} lane, so the distinction comes from form, listed strengths, and structure notes.`;
    }
    return `${leftProfile.compoundClass} is being weighed against ${rightProfile.compoundClass.toLowerCase()} for a closer like-for-like catalog read.`;
  }

  function buildContextDistinction(leftProfile, rightProfile) {
    return `${leftProfile.name} is usually referenced through ${trimSentence(leftProfile.researchContext)} ${rightProfile.name} is usually referenced through ${trimSentence(rightProfile.researchContext)}.`;
  }

  function buildHandlingDistinction(leftProfile, rightProfile) {
    if (leftProfile.storageNote === rightProfile.storageNote) {
      return 'Both products follow a similar cold-chain and storage rhythm, so the practical difference is usually the listed form and option range.';
    }
    return `${leftProfile.name}: ${trimSentence(leftProfile.storageNote)} ${rightProfile.name}: ${trimSentence(rightProfile.storageNote)}.`;
  }

  function formatStrengthList(strengths) {
    return strengths.length ? strengths.join(', ') : 'Pending';
  }

  function trimSentence(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function uniqueProducts(products, excludeSlugs) {
    const seen = new Set(excludeSlugs || []);
    return products.filter((product) => {
      if (!product?.slug || seen.has(product.slug)) return false;
      seen.add(product.slug);
      return true;
    });
  }

  function uniqueTools(tools) {
    const seen = new Set();
    return tools.filter((tool) => {
      if (!tool?.key || seen.has(tool.key)) return false;
      seen.add(tool.key);
      return true;
    });
  }

  function updateMeta(leftProduct, rightProduct) {
    const metaDescription = !leftProduct || !rightProduct
      ? 'Compare Jonezie Labs compounds by class, form, research context, storage, and handling notes inside cleaner side-by-side reads.'
      : `Compare ${leftProduct.name} vs ${rightProduct.name} on Jonezie Labs by compound class, form, research context, storage, and handling notes.`;
    const canonicalUrl = !leftProduct || !rightProduct
      ? `${SITE_ORIGIN}/comparison.html`
      : `${SITE_ORIGIN}/${library.getComparisonUrl(leftProduct.slug, rightProduct.slug)}`;

    document.title = !leftProduct || !rightProduct
      ? 'Research Comparisons | Jonezie Labs'
      : `${leftProduct.name} vs ${rightProduct.name} | Research Comparison | Jonezie Labs`;

    upsertMeta('meta[name="description"]', { name: 'description', content: metaDescription });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: document.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metaDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: document.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metaDescription });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    const faqItems = leftProduct && rightProduct ? library.getComparisonFaqs(leftProduct, rightProduct) : [];
    const graph = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: document.title,
        url: canonicalUrl,
        description: metaDescription
      }
    ];

    if (leftProduct && rightProduct) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      });
    }

    setStructuredData('script[data-comparison-schema]', {
      '@context': 'https://schema.org',
      '@graph': graph
    });
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

  function setStructuredData(selector, data) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('script');
      node.type = 'application/ld+json';
      node.setAttribute('data-comparison-schema', '');
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(data);
  }

  function escapeHtml(value) {
    return library.escapeHtml(value);
  }
})();
