window.JONEZIE_ADMIN_CONFIG = {
  // Remove by slug (example: ['tesamorelin'])
  removeProductSlugs: [],

  // Add full product objects here in the same shape as catalog-data.js.
  // Optional: include featured: true to also inject into featured cards.
  addProducts: [
    {
      name: 'MT-1 (Melanotan 1)',
      sourceName: 'MT-1 AKA Melanotan 1',
      slug: 'mt-1',
      category: 'Aesthetics',
      description: 'MT-1, also known as Melanotan 1, is a melanocortin-pathway peptide used in pigmentation and UV-response research.',
      startingPriceSingle: '$25.00',
      startingPrice8: '$162.00',
      startingPrice10: '$200.00',
      image: 'mt-1-10mg-official.png',
      options: [
        {
          code: 'MT5',
          specification: '5mg*10vials',
          mgOption: '5mg',
          singleVialPrice: '$25.00',
          eightVialPrice: '$162.00',
          tenVialPrice: '$200.00'
        }
      ]
    }
  ],

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
