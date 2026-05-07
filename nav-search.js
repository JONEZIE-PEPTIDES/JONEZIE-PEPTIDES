(() => {
  const catalog = window.JONEZIE_CATALOG || null;
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
      window.location.href = `product.html?slug=${encodeURIComponent(match.slug)}`;
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
})();
