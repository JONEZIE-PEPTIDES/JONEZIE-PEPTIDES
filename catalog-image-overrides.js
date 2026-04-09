(() => {
  const catalog = window.JONEZIE_CATALOG;
  if (!catalog) return;

  const IMAGE_OVERRIDES_BY_SLUG = {
    'ghk-cu': 'ghk-cu-100mg-official.png'
  };

  function applyOverrides(list) {
    if (!Array.isArray(list)) return;
    list.forEach((product) => {
      const override = IMAGE_OVERRIDES_BY_SLUG[product?.slug];
      if (override) product.image = override;
    });
  }

  applyOverrides(catalog.featured);
  applyOverrides(catalog.products);
})();
