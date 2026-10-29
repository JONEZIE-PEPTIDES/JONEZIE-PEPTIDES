#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path

import quickjs


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "products"
TEMPLATE_PATH = ROOT / "product.html"
CATALOG_SYNC_PATH = ROOT / "catalog-sheet-sync.js"
CATALOG_ADMIN_CONFIG_PATH = ROOT / "catalog-admin-config.js"
CATALOG_ADMIN_PATH = ROOT / "catalog-admin.js"
PRODUCT_CONTENT_PATH = ROOT / "product-content.js"
SITE_LIBRARY_PATH = ROOT / "site-library.js"
FALLBACK_IMAGE = "product-placeholder.svg"
CATEGORY_DISPLAY_LABELS = {
    "Metabolic": "Metabolic Research",
    "Cognitive": "Cognitive Research",
    "Recovery": "Tissue & Repair Research",
    "Growth": "Growth-Axis Research",
    "Cellular": "Cellular Research",
    "Aesthetics": "Dermal & Pigmentation Research",
    "Specialty": "Specialty Research",
    "Support": "Laboratory Support",
}


def get_category_display_label(category: str | None) -> str:
    key = (category or "").strip()
    return CATEGORY_DISPLAY_LABELS.get(key, key or "Research")


def get_display_name(product: dict) -> str:
    if product.get("slug") == "bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg":
        return "GLOW"
    return product.get("name") or "Research product"


def main() -> None:
    ctx = build_context()
    template = TEMPLATE_PATH.read_text()
    catalog = load_json(ctx, "window.JONEZIE_CATALOG")
    products = dedupe_products(catalog)
    expected_files = {f"{product['slug']}.html" for product in products}

    OUTPUT_DIR.mkdir(exist_ok=True)
    for existing in OUTPUT_DIR.glob("*.html"):
        if existing.name not in expected_files:
            existing.unlink()
    for product in products:
        slug = product["slug"]
        product_content = load_json(ctx, f"window.JONEZIE_PRODUCT_CONTENT.products[{json.dumps(slug)}] || null")
        profile = load_json(
            ctx,
            "window.JONEZIE_SITE_LIBRARY.getProductInfoProfile("
            f"window.JONEZIE_SITE_LIBRARY.getProductBySlug(window.JONEZIE_CATALOG, {json.dumps(slug)}), "
            f"window.JONEZIE_PRODUCT_CONTENT.products[{json.dumps(slug)}] || null, "
            "window.JONEZIE_CATALOG)"
        )
        faqs = load_json(
            ctx,
            "window.JONEZIE_SITE_LIBRARY.getProductFaqs("
            f"window.JONEZIE_SITE_LIBRARY.getProductBySlug(window.JONEZIE_CATALOG, {json.dumps(slug)}), "
            f"window.JONEZIE_PRODUCT_CONTENT.products[{json.dumps(slug)}] || null)"
        )
        title = load_str(
            ctx,
            "window.JONEZIE_SITE_LIBRARY.getProductPageTitle("
            f"window.JONEZIE_SITE_LIBRARY.getProductBySlug(window.JONEZIE_CATALOG, {json.dumps(slug)}))"
        )
        meta_description = load_str(
            ctx,
            "window.JONEZIE_SITE_LIBRARY.getProductMetaDescription("
            f"window.JONEZIE_SITE_LIBRARY.getProductBySlug(window.JONEZIE_CATALOG, {json.dumps(slug)}), "
            f"window.JONEZIE_PRODUCT_CONTENT.products[{json.dumps(slug)}] || null)"
        )
        canonical = load_str(ctx, f"window.JONEZIE_SITE_LIBRARY.getProductCanonicalUrl({json.dumps(slug)})")
        html = render_product_page(
            template=template,
            product=product,
            product_content=product_content or {},
            profile=profile or {},
            faqs=faqs or [],
            title=title,
            meta_description=meta_description,
            canonical=canonical,
        )
        (OUTPUT_DIR / f"{slug}.html").write_text(html)


def build_context() -> quickjs.Context:
    ctx = quickjs.Context()
    ctx.eval(
        """
        var window = {};
        window.location = { hostname: '127.0.0.1', href: 'http://127.0.0.1:4173/' };
        window.JONEZIE_LEAD_CAPTURE_CONFIG = { endpoint: '' };
        var document = {
          referrer: '',
          querySelector: function(){ return null; },
          querySelectorAll: function(){ return []; },
          addEventListener: function(){},
          head: { querySelector: function(){ return null; }, appendChild: function(){} },
          body: { dataset: {} }
        };
        var navigator = { language: 'en-US', userAgent: 'QuickJS' };
        var fetch = function(){ return Promise.resolve({}); };
        """
    )
    for path in (CATALOG_SYNC_PATH, CATALOG_ADMIN_CONFIG_PATH, CATALOG_ADMIN_PATH, PRODUCT_CONTENT_PATH, SITE_LIBRARY_PATH):
        ctx.eval(path.read_text())
    return ctx


def load_json(ctx: quickjs.Context, expression: str):
    payload = ctx.eval(f"JSON.stringify({expression})")
    return json.loads(payload) if payload else None


def load_str(ctx: quickjs.Context, expression: str) -> str:
    value = ctx.eval(expression)
    return str(value or "")


def dedupe_products(catalog: dict) -> list[dict]:
    seen = set()
    products = []
    for product in [*(catalog.get("featured") or []), *(catalog.get("products") or [])]:
        slug = product.get("slug")
        if not slug or slug in seen:
            continue
        seen.add(slug)
        products.append(product)
    return products


def render_product_page(*, template: str, product: dict, product_content: dict, profile: dict, faqs: list[dict], title: str, meta_description: str, canonical: str) -> str:
    display_name = get_display_name(product)
    hero_summary = f"Available in {', '.join(option.get('mgOption') for option in product.get('options') or [] if option.get('mgOption'))}. Choose a pack format to see current pricing."
    og_image = absolute_url(product.get("image") or FALLBACK_IMAGE)
    image_src = escape(product.get("image") or FALLBACK_IMAGE, quote=True)
    selected_option = (product.get("options") or [{}])[0]
    selected_pack_key = next(
        (key for key in ("singleVialPrice", "eightVialPrice", "tenVialPrice") if selected_option.get(key)),
        "singleVialPrice",
    )
    selected_pack_label = {
        "singleVialPrice": "Single Vial",
        "eightVialPrice": "8-Vial Kit",
        "tenVialPrice": "10-Vial Pack",
    }[selected_pack_key]
    selected_price = selected_option.get(selected_pack_key) or "Pending"
    selected_code = selected_option.get("code") or "Option"
    selected_subtitle = (
        f"{selected_option.get('mgOption') or 'This strength'} is currently on backorder."
        if selected_option.get("inventoryStatus") == "backorder"
        else f"{selected_option.get('mgOption') or 'This strength'} · {selected_pack_label} · In stock"
    )
    strengths = ", ".join(profile.get("strengths") or [option.get("mgOption") for option in product.get("options") or [] if option.get("mgOption")])
    research_findings = product_content.get("researchFindings") or []
    comparison_candidates = profile.get("comparisonCandidates") or []
    related_products = profile.get("relatedCompounds") or []
    related_tools = profile.get("relatedTools") or []
    category_guide = profile.get("guide") or {}
    storage_profile = profile.get("storageProfile") or {"title": "Storage information", "shortSummary": "", "bullets": []}
    mixing_profile = profile.get("mixingProfile") or {"steps": []}

    product_schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "name": display_name,
                "description": meta_description,
                "category": product.get("category"),
                "image": og_image,
                "sku": selected_option.get("code") or product["slug"],
                "brand": {"@type": "Brand", "name": "Jonezie Labs"},
                "url": canonical,
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "USD",
                    "price": normalize_price(selected_price),
                    "availability": "https://schema.org/BackOrder" if selected_option.get("inventoryStatus") == "backorder" else "https://schema.org/InStock",
                    "url": canonical,
                    "seller": {"@type": "Organization", "name": "Jonezie Labs"},
                },
                "additionalProperty": [
                    {"@type": "PropertyValue", "name": "MG Option", "value": option.get("mgOption")}
                    for option in product.get("options") or []
                    if option.get("mgOption")
                ],
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.jonezielabs.com/"},
                    {"@type": "ListItem", "position": 2, "name": display_name, "item": canonical},
                ],
            },
        ],
    }

    html = template

    def replace_wrapped(pattern, value):
        return re.sub(
            pattern,
            lambda match: f"{match.group(1)}{value}{match.group(2)}",
            html,
            count=1,
            flags=re.S,
        )

    html = html.replace("<head>", "<head>\n  <base href=\"/\" />", 1)
    html = re.sub(r"<title>.*?</title>", f"<title>{escape(title)}</title>", html, count=1, flags=re.S)
    html = re.sub(
        r'<meta name="description" content=".*?" />',
        f'<meta name="description" content="{escape(meta_description, quote=True)}" />',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta name="robots" content=".*?" />',
        '<meta name="robots" content="index,follow,max-image-preview:large" />',
        html,
        count=1,
    )
    html = re.sub(
        r'<link rel="canonical" href=".*?" />',
        f'<link rel="canonical" href="{escape(canonical, quote=True)}" />',
        html,
        count=1,
    )
    html = re.sub(r'<meta property="og:title" content=".*?" />', f'<meta property="og:title" content="{escape(title, quote=True)}" />', html, count=1)
    html = re.sub(r'<meta property="og:description" content=".*?" />', f'<meta property="og:description" content="{escape(meta_description, quote=True)}" />', html, count=1)
    html = re.sub(r'<meta property="og:url" content=".*?" />', f'<meta property="og:url" content="{escape(canonical, quote=True)}" />', html, count=1)
    html = re.sub(r'<meta property="og:image" content=".*?" />', f'<meta property="og:image" content="{escape(og_image, quote=True)}" />', html, count=1)
    html = re.sub(r'<meta name="twitter:title" content=".*?" />', f'<meta name="twitter:title" content="{escape(title, quote=True)}" />', html, count=1)
    html = re.sub(r'<meta name="twitter:description" content=".*?" />', f'<meta name="twitter:description" content="{escape(meta_description, quote=True)}" />', html, count=1)
    html = re.sub(r'<meta name="twitter:image" content=".*?" />', f'<meta name="twitter:image" content="{escape(og_image, quote=True)}" />', html, count=1)
    html = re.sub(
        r'<script type="application/ld\+json" data-product-schema>.*?</script>',
        '<script type="application/ld+json" data-product-schema>\n'
        + json.dumps(product_schema, indent=2)
        + "\n  </script>",
        html,
        count=1,
        flags=re.S,
    )
    html = html.replace("<body>", f'<body data-product-slug="{escape(product["slug"], quote=True)}">', 1)
    html = replace_wrapped(r'(<p class="eyebrow" data-product-category>).*?(</p>)', 'Research use only')
    html = replace_wrapped(r'(<h1 data-product-title>).*?(</h1>)', escape(display_name))
    html = replace_wrapped(r'(<p class="product-intro" data-product-description>).*?(</p>)', escape(hero_summary))
    html = re.sub(
        r'<img data-product-hero-image src=".*?" alt=".*?" />',
        f'<img data-product-hero-image src="{image_src}" alt="{escape(display_name, quote=True)} product image" />',
        html,
        count=1,
    )
    html = html.replace(
        '<div class="spec-grid product-summary-grid" data-product-options></div>',
        f'<div class="spec-grid product-summary-grid" data-product-options>{render_option_cards(product, selected_option)}</div>',
        1,
    )
    html = re.sub(
        r'(<p class="product-selection-note" data-selected-subtitle>).*?(</p>)',
        lambda match: (
            f"{match.group(1)}"
            f"{escape(selected_subtitle)}"
            f"{match.group(2)}"
        ),
        html,
        count=1,
        flags=re.S,
    )
    html = html.replace(
        '<div class="pack-picker" data-pack-picker></div>',
        f'<div class="pack-picker" data-pack-picker>{render_pack_picker(selected_option, selected_pack_key)}</div>',
        1,
    )
    html = replace_wrapped(r'(<strong data-selected-price>).*?(</strong>)', escape(selected_price))
    html = replace_wrapped(r'(<strong data-selected-total>).*?(</strong>)', escape(selected_price))
    html = html.replace(
        '<section class="section-shell product-facts" data-product-highlights></section>',
        f'<section class="section-shell product-facts" data-product-highlights>{render_highlights(product, product_content, profile, strengths, research_findings, storage_profile, mixing_profile, category_guide)}</section>',
        1,
    )
    html = html.replace(
        '<section class="section-shell product-related" data-product-resources></section>',
        f'<section class="section-shell product-related" data-product-resources>{render_resources(product, related_products, comparison_candidates, related_tools, category_guide)}</section>',
        1,
    )
    return "\n".join(line.rstrip() for line in html.splitlines()) + "\n"


def render_option_cards(product: dict, selected_option: dict) -> str:
    cards = []
    for option in product.get("options") or []:
        selected = " is-selected" if option.get("code") == selected_option.get("code") else ""
        status = option.get("inventoryStatus") or "in_stock"
        label = {"in_stock": "In Stock", "backorder": "Backorder", "sold_out": "Sold Out"}.get(status, "In Stock")
        cards.append(
            f"""
        <button type="button" class="spec-card spec-card-button{selected}" data-option-code="{escape(option.get('code') or '', quote=True)}">
          <strong>{escape(option.get('mgOption') or 'Pending')}</strong>
          <span class="inventory-pill inventory-{escape(status)}">{escape(label)}</span>
        </button>"""
        )
    return "".join(cards)


def render_pack_picker(option: dict, selected_pack_key: str) -> str:
    labels = {
        "singleVialPrice": "Single Vial",
        "eightVialPrice": "8-Vial Kit",
        "tenVialPrice": "10-Vial Pack",
    }
    markup = []
    for key in ("singleVialPrice", "eightVialPrice", "tenVialPrice"):
        price = option.get(key)
        if not price:
            continue
        selected = " is-selected" if key == selected_pack_key else ""
        markup.append(
            f"""
      <button type="button" class="pack-choice{selected}" data-pack-key="{key}">
        <span>{labels[key]}</span>
        <strong>{escape(price)}</strong>
      </button>"""
        )
    return "".join(markup)


def render_highlights(product: dict, product_content: dict, profile: dict, strengths: str, research_findings: list[str], storage_profile: dict, mixing_profile: dict, category_guide: dict) -> str:
    components = (
        '<div><dt>Components</dt><dd>GHK-Cu 50mg · BPC-157 10mg · TB-500 10mg</dd></div>'
        if product.get('slug') == 'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg' else ''
    )
    return f"""
      <details>
        <summary>Product details <span>Strengths, format, and use notice</span></summary>
        <dl>
          <div><dt>Available strengths</dt><dd>{escape(strengths or 'See options above')}</dd></div>
          <div><dt>Format</dt><dd>{escape(profile.get('form') or 'Research vial')}</dd></div>
          {components}
          <div><dt>Use</dt><dd>Laboratory research only. Not for human or veterinary use.</dd></div>
        </dl>
      </details>"""


def render_resources(product: dict, related_products: list[dict], comparison_candidates: list[dict], related_tools: list[dict], category_guide: dict) -> str:
    if not related_products:
        return ""
    cards = "".join(
        f"""
        <a href="{escape(get_product_href(item.get('slug') or ''), quote=True)}">
          <strong>{escape(get_display_name(item))}</strong>
          <span>View product &rarr;</span>
        </a>"""
        for item in related_products
    )
    return f"""
      <div class="product-related-heading"><p class="eyebrow">More products</p><h2>Explore the catalog</h2></div>
      <div class="product-related-list">{cards}</div>"""


def render_faq(faqs: list[dict]) -> str:
    return """
      <div class="faq-shell">
        <div class="section-heading compact">
          <p class="eyebrow">Product Reference FAQ</p>
          <h2>Questions tied to this listing.</h2>
        </div>
        <div class="faq-list">
          %s
        </div>
      </div>""" % "".join(
        f"""
          <details{' open' if index == 0 else ''}>
            <summary>
              <span class=\"faq-index\">{str(index + 1).zfill(2)}</span>
              <span class=\"faq-question-copy\">
                <strong>{escape(item.get('question') or 'Product question')}</strong>
                <small>Product support</small>
              </span>
              <span class=\"faq-toggle\" aria-hidden=\"true\"></span>
            </summary>
            <p>{escape(item.get('answer') or '')}</p>
          </details>"""
        for index, item in enumerate(faqs)
    )


def get_related_summary(product: dict) -> str:
    summary = product.get("description") or "Open the related product page for current strengths, pricing, and research context."
    return re.sub(r"\s+", " ", summary).strip()


def get_product_href(slug: str) -> str:
    return f"products/{slug}.html"


def get_comparison_href(left_slug: str, right_slug: str) -> str:
    left, right = sorted([left_slug, right_slug])
    return f"comparison.html?left={left}&right={right}"


def get_guide_href(key: str) -> str:
    return f"research-guides.html#guide-{key}"


def absolute_url(path: str) -> str:
    normalized = str(path or FALLBACK_IMAGE).lstrip("./")
    return f"https://www.jonezielabs.com/{normalized}"


def normalize_price(price: str) -> str:
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)", str(price or ""))
    return match.group(1) if match else "0.00"


if __name__ == "__main__":
    main()
