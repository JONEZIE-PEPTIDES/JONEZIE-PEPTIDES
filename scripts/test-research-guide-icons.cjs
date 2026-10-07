const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pageUrl = 'http://127.0.0.1:8020/research-guides.html';

async function inspectPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => localStorage.setItem('jonezie_age_gate_ack_v2', 'true'));
  const page = await context.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const visibleIcon = (element) => {
      const rect = element.getBoundingClientRect();
      const use = element.querySelector('use');
      return {
        width: rect.width,
        height: rect.height,
        symbol: use?.getAttribute('href') || '',
        display: getComputedStyle(element).display,
        cssWidth: getComputedStyle(element).width,
        parentDisplay: getComputedStyle(element.parentElement).display,
        parentWidth: element.parentElement.getBoundingClientRect().width
      };
    };
    return {
      viewportWidth: window.innerWidth,
      panelDisplay: getComputedStyle(document.querySelector('.comparison-hero-panel')).display,
      statIcons: [...document.querySelectorAll('.guide-stat-card .eyebrow svg')].map(visibleIcon),
      detailIcons: [...document.querySelectorAll('.guide-detail-icon svg')].map(visibleIcon),
      supportIcons: [...document.querySelectorAll('.hero-support-icon svg')].map(visibleIcon),
      articlePills: [...document.querySelectorAll('.guide-article-card .eyebrow')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
      resourcePills: [...document.querySelectorAll('.resource-strip-card .eyebrow')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  assert.equal(result.statIcons.length, 3);
  assert.equal(result.detailIcons.length, 7);
  assert.equal(result.supportIcons.length, 1);
  assert.ok(result.articlePills.length > 0);
  assert.equal(result.resourcePills.length, 2);
  const visibleIcons = result.panelDisplay === 'none'
    ? [...result.detailIcons, ...result.supportIcons]
    : [...result.statIcons, ...result.detailIcons, ...result.supportIcons];
  for (const icon of visibleIcons) {
    assert.ok(icon.width >= 18 && icon.height >= 18, `icon ${icon.symbol} must render at a visible size: ${JSON.stringify(icon)}`);
    assert.match(icon.symbol, /^#guide-icon-/);
  }
  for (const pill of [...result.articlePills, ...result.resourcePills]) {
    assert.ok(pill.height <= 40, `guide label must remain a compact pill: ${JSON.stringify(pill)}`);
  }
  assert.equal(result.horizontalOverflow, false);
  const label = viewport.width >= 1000 ? 'desktop' : 'mobile';
  await page.locator('.guides-hero').screenshot({
    path: `C:\\Users\\zackl\\AppData\\Local\\Temp\\jonezie-guide-icons-${label}-hero.png`
  });
  await page.locator('.guide-detail').first().screenshot({
    path: `C:\\Users\\zackl\\AppData\\Local\\Temp\\jonezie-guide-icons-${label}-detail.png`
  });
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  try {
    await inspectPage(browser, { width: 1440, height: 1000 });
    await inspectPage(browser, { width: 390, height: 844 });
    console.log('Research Guide icon checks passed at desktop and mobile widths.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
