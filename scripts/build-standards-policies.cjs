const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const target = path.join(root, 'standards', 'policies');
const pages = [
  ['terms.html', 'Terms of Service'],
  ['privacy.html', 'Privacy Policy'],
  ['research-use.html', 'Research Use'],
  ['shipping-policy.html', 'Shipping'],
  ['returns-refunds.html', 'Returns & Refunds']
];
fs.mkdirSync(target, { recursive: true });

for (const [file, title] of pages) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const article = source.match(/<article class="legal-article">([\s\S]*?)<\/article>/)?.[1];
  if (!article) throw new Error(`Could not find legal text in ${file}`);
  const nav = pages.map(([href, label]) => `<a href="${href}"${href === file ? ' aria-current="page"' : ''}>${label}</a>`).join('\n        ');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>${title} | Jonezie Labs Standards</title>
  <link rel="icon" type="image/png" href="../../favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../policies.css?v=20261109fall40" />
</head>
<body>
  <header class="policy-header">
    <a href="../index.html" aria-label="Jonezie Labs Standards Store"><img src="../../jonezie-labs-logo.webp?v=20261029" alt="Jonezie Labs" width="2172" height="724" /></a>
    <nav aria-label="Standards navigation"><a href="../index.html#merchandise">Store</a><a href="../checkout.html">Checkout</a></nav>
  </header>
  <main class="policy-layout">
    <nav class="policy-index" aria-label="Policies"><strong>Policies</strong>${nav}</nav>
    <article class="legal-article">${article}</article>
  </main>
  <footer class="policy-footer"><a href="../index.html#merchandise">Standards Store</a><a href="../checkout.html">Checkout</a><span>Jonezie Labs LLC</span></footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(target, file), html);
}
console.log(`Updated ${pages.length} Standards policy pages from current policy text.`);
