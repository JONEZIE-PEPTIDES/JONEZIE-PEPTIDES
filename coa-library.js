(() => {
  const form = document.querySelector('[data-coa-search]');
  if (!form) return;
  const cards = [...document.querySelectorAll('[data-record]')];
  const search = form.elements.q;
  const collection = form.elements.collection;
  const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  function filter() {
    const query = normalize(search.value.trim());
    let count = 0;
    cards.forEach(card => {
      const matches = normalize(card.dataset.search).includes(query) && (collection.value === 'all' || card.dataset.kind === collection.value);
      card.hidden = !matches;
      if (matches) count++;
    });
    document.querySelectorAll('[data-collection]').forEach(section => {
      section.hidden = ![...section.querySelectorAll('[data-record]')].some(card => !card.hidden);
    });
    document.querySelector('[data-result-count]').textContent = `${count} ${count === 1 ? 'report' : 'reports'}`;
    document.querySelector('[data-no-results]').hidden = count !== 0;
  }
  const params = new URLSearchParams(location.search);
  search.value = params.get('product') || params.get('q') || '';
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('reset', () => { search.value = ''; collection.value = 'all'; filter(); });
  filter();
})();
