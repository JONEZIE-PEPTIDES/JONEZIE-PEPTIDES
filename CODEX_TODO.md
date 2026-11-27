# Codex Autonomous Backlog

Codex should work top-to-bottom. Checked items are complete. Items marked **REVIEW FIRST** require a proposal before customer-facing wording is changed.

## P0 — RUO / customer-facing wording

- [ ] **Retatrutide wording audit — REVIEW FIRST**
  - Review only wording that could imply intended human therapeutic use.
  - Preserve product, scientific information, pricing, options, checkout, layout, SEO structure, images, COAs, and testing information.
  - Reframe human clinical outcomes (weight loss, appetite effects, metabolic benefits, obesity treatment, therapeutic benefits) as neutral scientific/research context centered on investigational status, molecular targets, GLP-1/GIP/glucagon receptor research, receptor signaling, metabolic pathways, pharmacology literature, analytical characterization, and published research.
  - Do not tell readers what the product will do for a person.
  - Do not add dosing, administration, injection, or self-use instructions.
  - Maintain/strengthen clear laboratory/research-only and not-for-human-or-veterinary-use positioning where appropriate.
  - Inspect visible body copy AND meta description, Open Graph/Twitter descriptions, Product JSON-LD description, FAQ schema, image alt text, and dynamically generated descriptions.
  - **Before implementation:** produce a report containing each exact existing sentence proposed for change and its proposed replacement. Do not modify unrelated content. Stop pending approval of the wording report.

- [ ] **Catalog-wide RUO wording audit — REVIEW FIRST**
  - Prerequisite: Retatrutide wording standard approved.
  - Apply the same audit methodology across product pages.
  - Produce a proposed-change report first; do not mass-edit therapeutic/outcome language without approval.

## P1 — Google product understanding / technical SEO

- [ ] **Audit Product structured data across the catalog**
  - Find missing/malformed Product/Offer schema, price/availability/SKU/image/canonical mismatches, duplicate canonicals, and product pages missing from sitemap.
  - Reuse centralized product data where possible.

- [ ] **Fix product variant representation**
  - Current multi-strength products must not misleadingly expose only one offer if visible purchasable variants have different prices.
  - Evaluate ProductGroup/hasVariant vs AggregateOffer based on Google's current supported structured-data behavior and the site's architecture.
  - Do not fabricate identifiers or data.

- [ ] **Audit canonical URLs and legacy duplicates**
  - Preferred product pattern: `https://www.jonezielabs.com/products/[product].html`.
  - Preserve backwards compatibility and avoid broken links.

- [ ] **Improve sitemap generation**
  - Ensure canonical product pages are present.
  - Avoid unnecessary query-string permutations.
  - Use accurate maintainable lastmod values.
  - Consider sitemap index + product/content sitemaps if it materially improves maintenance.

- [ ] **Audit robots.txt and crawlability**
  - Product pages and official product images should be crawlable.
  - Declare sitemap.
  - Do not block resources required to render public product pages.

- [ ] **Audit product images for Google**
  - Absolute HTTPS URLs, resolvable/crawlable, appropriate product image, adequate resolution, schema/image consistency.

## P2 — Merchant Center preparation

- [ ] **Classify Merchant Center eligibility**
  - Separate: (A) apparently eligible/feed-ready, (B) technically ready but policy uncertain, (C) unsuitable for Merchant Center.
  - Do not disguise names or content to bypass policy.
  - Search indexing is separate from Merchant Center eligibility.

- [ ] **Generate Merchant-compatible feed for eligible products only**
  - Do not submit automatically.
  - Map factual fields such as id, title, description, link, image_link, availability, price, brand, condition, plus legitimate available attributes.
  - Keep category C out.

## P3 — Validation / maintenance

- [ ] **Add product SEO validation**
  - Detect missing canonical/Product schema, malformed JSON-LD, missing images, sitemap omissions, duplicate canonicals, SKU mismatches, price/schema mismatches, availability mismatches, and improper relative URLs.

- [ ] **Add CI validation if practical**
  - Run when product-related files change.
  - No paid APIs or external deployment required.

## Definition of done for each technical task
- Minimal scoped changes.
- Existing appearance and checkout behavior preserved.
- Validation performed.
- Backlog updated with concise notes.
- Any unresolved policy or content question explicitly documented instead of guessed.
