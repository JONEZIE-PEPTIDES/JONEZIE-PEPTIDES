window.JONEZIE_ADMIN_CONFIG = {
  // Remove by slug (example: ['tesamorelin'])
  removeProductSlugs: [],

  // Add full product objects here in the same shape as catalog-data.js.
  // Optional: include featured: true to also inject into featured cards.
  addProducts: [],

  // Inventory by MG option code (example: RT20, CU100).
  // Allowed status values: in_stock, backorder, sold_out
  // internalLeadDays is intentionally not shown in the storefront UI.
  optionInventory: {
    // RT20: { status: 'backorder', internalLeadDays: '20-23' },
    // CU100: { status: 'in_stock', internalLeadDays: '5-10' }
  },

  defaults: {
    inStockLeadDays: '5-10',
    backorderLeadDays: '20-23'
  }
};
