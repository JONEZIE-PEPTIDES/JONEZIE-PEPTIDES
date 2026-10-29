#!/usr/bin/env python3
"""Remove retired preparation-tool links from static site pages."""

from html import escape
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
RETIRED = ("research-tools.html", "jonezie-labs-ruo-quick-reference.html")
PRODUCT_CANONICAL = re.compile(rb'<link rel="canonical" href="https://www\.jonezielabs\.com/products/([a-z0-9-]+)\.html"')
ANCHOR = re.compile(
    rb"[ \t]*<a\b(?=[^>]*\bhref=\"(?:\.\./)?(?:research-tools\.html|jonezie-labs-ruo-quick-reference\.html)(?:#[^\"]*)?\")[^>]*>.*?</a>[ \t]*",
    re.IGNORECASE | re.DOTALL,
)
SHOP_ASSET = re.compile(
    rb"(styles\.css|script\.js|product-page\.js|site-library\.js|site-footer\.js|nav-search\.js|lead-capture\.js|research-guides\.js|comparison-page\.js)\?v=[A-Za-z0-9_-]+"
)


def main() -> None:
    for path in ROOT.rglob("*.html"):
        if path.name in RETIRED or ".git" in path.parts:
            continue
        original = path.read_bytes()
        updated = ANCHOR.sub(b"", original)
        if path.parent in (ROOT, ROOT / "products"):
            updated = SHOP_ASSET.sub(lambda match: match.group(1) + b"?v=20261029shop1", updated)
        if updated != original:
            path.write_bytes(updated)

    for name in RETIRED:
        write_redirect(ROOT / name, "catalog.html")

    # Old root-level product URLs still contain long, outdated preparation copy.
    # Forward them to the current product pages already used as their canonicals.
    for path in ROOT.glob("*.html"):
        match = PRODUCT_CANONICAL.search(path.read_bytes())
        if match and path.stem == match.group(1).decode("ascii"):
            write_redirect(path, f"products/{path.name}")


def write_redirect(path: Path, destination: str) -> None:
    target = escape(destination, quote=True)
    markup = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url={target}">
  <title>Continue to Jonezie Labs</title>
  <link rel="canonical" href="https://www.jonezielabs.com/{target}">
</head>
<body>
  <p>This page has moved. <a href="{target}">Continue to Jonezie Labs</a>.</p>
</body>
</html>
"""
    path.write_bytes(markup.encode("utf-8"))


if __name__ == "__main__":
    main()
