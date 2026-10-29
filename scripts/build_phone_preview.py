#!/usr/bin/env python3
"""Build an isolated GitHub Pages preview from tracked site files."""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/jonezie-labs-staging/"
SKIP_NAMES = {"CNAME", "README.md", ".gitignore"}
SKIP_PREFIXES = (".github/", "scripts/", "preview/", "assets/products/MOTS-C NEW PRODUCT HERO IMAGE")

GUARD = """(() => {
  window.JONEZIE_STAGING_PREVIEW = true;
  document.addEventListener('submit', (event) => {
    if (event.target.matches('[data-nav-search-form]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.alert('This is a staging preview. Order requests and signups are disabled here.');
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.textContent = 'STAGING PREVIEW · Checkout and signups disabled';
    banner.setAttribute('aria-label', 'Staging preview');
    banner.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;max-width:calc(100vw - 24px);padding:9px 13px;border:1px solid #66e0d2;border-radius:12px;background:#071b28;color:#c9fff0;box-shadow:0 8px 26px #0005;font:700 12px/1.3 Arial,sans-serif;pointer-events:none';
    document.body.appendChild(banner);
  });
})();
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    dest = args.destination.resolve()
    if dest.exists() and any(dest.iterdir()):
        raise SystemExit(f"Destination must be empty: {dest}")
    dest.mkdir(parents=True, exist_ok=True)

    tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")
    copied = 0
    for relative in filter(None, tracked):
        normalized = relative.replace("\\", "/")
        if normalized in SKIP_NAMES or normalized.startswith(SKIP_PREFIXES):
            continue
        source = ROOT / relative
        target = dest / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix.lower() == ".html":
            html = source.read_text(encoding="utf-8")
            html = html.replace('<base href="/" />', f'<base href="{PREFIX}" />')
            html = html.replace(
                'https://www.jonezielabs.com/jonezie-labs-logo.webp?v=20261029',
                'https://jonezie-peptides.github.io/jonezie-labs-staging/jonezie-labs-logo.webp?v=20261029',
            )
            html = re.sub(
                r'(?s)\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]+"></script>\s*<script>.*?</script>',
                "", html, count=1,
            )
            html = re.sub(
                r'\s*<script[^>]+src="(?:\.\./)?(?:support-chat|lead-capture)\.js[^"]*"[^>]*></script>',
                "", html,
            )
            html = html.replace(
                "</head>",
                f'  <meta name="robots" content="noindex,nofollow,noarchive" />\n'
                f'  <script src="{PREFIX}preview-guard.js"></script>\n</head>',
                1,
            )
            target.write_text(html, encoding="utf-8")
        elif normalized == "standards/merch-data.js":
            script = source.read_text(encoding="utf-8")
            target.write_text(script.replace("enabled: true,", "enabled: false,", 1), encoding="utf-8")
        else:
            shutil.copy2(source, target)
        copied += 1

    (dest / "preview-guard.js").write_text(GUARD, encoding="utf-8")
    (dest / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
    (dest / ".nojekyll").touch()
    print(f"Copied {copied} site files to {dest}")


if __name__ == "__main__":
    main()
