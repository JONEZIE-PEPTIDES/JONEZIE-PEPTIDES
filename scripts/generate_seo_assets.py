#!/usr/bin/env python3
from __future__ import annotations

import ast
import itertools
import re
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
CATALOG_SYNC_PATH = ROOT / "catalog-sheet-sync.js"
ROBOTS_PATH = ROOT / "robots.txt"
SITEMAP_PATH = ROOT / "sitemap.xml"
SITE_ORIGIN = "https://www.jonezielabs.com"
COMPARISON_THEME_RULES = [
    {"key": "metabolic-incretin", "category": "Metabolic", "fragments": ("semaglutide", "tirzepatide", "retatrutide", "survodutide", "mazdutide", "cagrilintide")},
    {"key": "metabolic-body-composition", "category": "Metabolic", "fragments": ("aod", "5-amino-1mq", "slu-pp-322")},
    {"key": "recovery-repair", "category": "Recovery", "fragments": ("bpc", "tb", "ara-290", "wolverine", "thymosin-alpha-1")},
    {"key": "aesthetics-skin", "category": "Aesthetics", "fragments": ("ghk-cu", "glow", "klow")},
    {"key": "aesthetics-pigmentation", "category": "Aesthetics", "fragments": ("mt-1", "mt-2")},
    {"key": "aesthetics-cosmetic", "category": "Aesthetics", "fragments": ("snap-8", "lemon-bottle", "b12-blend")},
    {"key": "growth-secretagogue", "category": "Growth", "fragments": ("tesamorelin", "cjc", "ipamorelin", "ghrp-6")},
    {"key": "growth-factor", "category": "Growth", "fragments": ("somatropin", "igf-1lr3")},
    {"key": "growth-fertility", "category": "Growth", "fragments": ("hcg", "hmg", "kisspeptin")},
    {"key": "cognitive-focus", "category": "Cognitive", "fragments": ("semax", "selank", "cerebrolysin")},
    {"key": "cognitive-restoration", "category": "Cognitive", "fragments": ("dsip", "pinealon", "vip", "oxytocin")},
    {"key": "cellular-mito", "category": "Cellular", "fragments": ("mots-c", "nad", "ss-31")},
    {"key": "cellular-longevity", "category": "Cellular", "fragments": ("epithalon", "thymalin")},
    {"key": "cellular-specialty", "category": "Cellular", "fragments": ("pnc27",)},
    {"key": "performance-drive", "category": "Performance", "fragments": ("dermorphin", "pt-141", "lc216")},
]


def main() -> None:
    text = CATALOG_SYNC_PATH.read_text()
    products = build_product_records(text)
    unique_slugs = [product["slug"] for product in products]

    base_urls = [
        f"{SITE_ORIGIN}/",
        f"{SITE_ORIGIN}/comparison.html",
        f"{SITE_ORIGIN}/research-guides.html",
        f"{SITE_ORIGIN}/research-tools.html",
        f"{SITE_ORIGIN}/jonezie-labs-ruo-quick-reference.html"
    ]
    product_urls = [f"{SITE_ORIGIN}/product.html?slug={slug}" for slug in unique_slugs]
    comparison_urls = build_comparison_urls(products)

    lastmod = date.today().isoformat()
    write_robots()
    write_sitemap(base_urls + product_urls + comparison_urls, lastmod)


def parse_product_rows(text: str) -> list[list[object]]:
    match = re.search(r"const PRODUCT_ROWS = \[(.*?)\n  \];", text, re.S)
    if not match:
        raise RuntimeError("Unable to locate PRODUCT_ROWS in catalog-sheet-sync.js")
    return ast.literal_eval("[" + match.group(1) + "]")


def parse_mapping_block(text: str, block_name: str) -> dict[str, str]:
    match = re.search(rf"const {block_name} = \{{(.*?)\n  \}};", text, re.S)
    if not match:
        return {}
    pairs = {}
    for quoted_key, bare_key, value in re.findall(r"\s*(?:'([^']+)'|([A-Za-z0-9_-]+)):\s*'([^']+)'", match.group(1)):
        pairs[quoted_key or bare_key] = value
    return pairs


def build_product_records(text: str) -> list[dict[str, str]]:
    product_rows = parse_product_rows(text)
    slug_overrides = {key.lower(): value for key, value in parse_mapping_block(text, "SLUG_OVERRIDES").items()}
    category_overrides = {key.lower(): value for key, value in parse_mapping_block(text, "CATEGORY_OVERRIDES").items()}

    by_slug: dict[str, dict[str, str]] = {}
    for row in product_rows:
        raw_name = str(row[0]).strip()
        name_key = raw_name.lower()
        slug = slug_overrides.get(name_key, slugify(raw_name))
        category = category_overrides.get(name_key, infer_category(raw_name))
        by_slug.setdefault(slug, {"slug": slug, "category": category})

    return sorted(by_slug.values(), key=lambda product: product["slug"])


def build_comparison_urls(products: list[dict[str, str]]) -> list[str]:
    grouped: dict[str, list[str]] = {}
    for product in products:
        if not is_comparison_eligible(product):
            continue
        theme = get_comparison_theme(product)
        key = theme or product["category"]
        grouped.setdefault(key, []).append(product["slug"])

    urls: list[str] = []
    for slugs in grouped.values():
        for left, right in itertools.combinations(sorted(slugs), 2):
            urls.append(f"{SITE_ORIGIN}/comparison.html?left={left}&right={right}")
    return urls


def is_comparison_eligible(product: dict[str, str]) -> bool:
    slug = product.get("slug", "")
    category = product.get("category", "")
    if slug == "bac-water":
        return False
    if category == "Support":
        return False
    return True


def get_comparison_theme(product: dict[str, str]) -> str | None:
    slug = product.get("slug", "")
    category = product.get("category", "")
    if not slug or not category:
        return None

    for rule in COMPARISON_THEME_RULES:
        if rule["category"] != category:
            continue
        if any(fragment in slug for fragment in rule["fragments"]):
            return str(rule["key"])
    return None


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower())
    slug = re.sub(r"^-+|-+$", "", slug)
    slug = re.sub(r"-{2,}", "-", slug)
    return slug


def infer_category(raw_name: str) -> str:
    name = str(raw_name or "").lower()
    if any(token in name for token in ("semaglutide", "tirzepatide", "retatrutide", "cagrilintide", "survodutide", "mazdutide", "aod", "slu-pp")):
        return "Metabolic"
    if any(token in name for token in ("ghk", "snap", "lemon bottle", "mt-1", "mt-2")):
        return "Aesthetics"
    if any(token in name for token in ("tb500", "bpc", "tesamorelin", "thymosin alpha")):
        return "Recovery"
    if any(token in name for token in ("ghrp", "hcg", "hmg", "ipamorelin", "somatropin", "igf", "cjc")):
        return "Growth"
    if any(token in name for token in ("semax", "selank", "dsip", "pinealon", "vip", "cerebrolysin", "oxytocin")):
        return "Cognitive"
    if any(token in name for token in ("nad", "ss-31", "mots", "epithalon", "thymalin", "pnc")):
        return "Cellular"
    return "Support"


def write_robots() -> None:
    ROBOTS_PATH.write_text(
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {SITE_ORIGIN}/sitemap.xml\n"
    )


def write_sitemap(urls: list[str], lastmod: str) -> None:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        lines.append(f"  <url><loc>{escape(url)}</loc><lastmod>{lastmod}</lastmod></url>")
    lines.append("</urlset>")
    SITEMAP_PATH.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
