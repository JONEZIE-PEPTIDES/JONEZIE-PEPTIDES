(() => {
  'use strict';
  const section = document.querySelector('[data-label-reveal]');
  if (!section) return;

  // Approved collection only. The superseded Tirzepatide photo is deliberately excluded.
  const approved = [
    'tirzepatide-20261027', 'bac-water', 'ghk-cu', 'ss-31', 'bpc-157', 'nad',
    'cagrilintide', 'snap-8', 'mots-c', 'cerebrolysin', 'kpv', 'hcg',
    'ara-290', 'mt-1', 'mt-2', 'selank', 'semax', 'retatrutide',
    'tesamorelin', 'pt-141', 'ipamorelin', 'epithalon', 'thymosin-alpha-1',
    'kisspeptin-10', '5-amino-1mq', 'glutathione', 'igf-1lr3',
    'cjc-1295-without-dac', 'tb500', 'cagrilintide-5mg-plus-semaglutide-5mg',
    'bpc-157-10mg-plus-ghk-cu-50mg-plus-tb500-10mg',
    'ghk-cu-50mg-plus-tb-500-10mg-plus-bpc-157-10mg-plus-kpv-10mg'
  ];
  const rain = section.querySelector('.label-reveal-rain');
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cursor = 0;
  let visible = false;
  let initialized = false;

  function nextImage(img) {
    img.src = `assets/products/label-reveal/${approved[cursor % approved.length]}.webp`;
    cursor += 1;
  }

  function syncMotion() {
    section.dataset.running = String(visible && !reduced.matches && !document.hidden);
  }

  function buildCards() {
    if (!initialized) return;
    rain.replaceChildren();
    const lanes = mobile.matches ? [12, 36, 64, 88] : [4, 13, 24, 76, 87, 96];
    const rows = mobile.matches ? 2 : 3;
    lanes.forEach((x, lane) => {
      for (let row = 0; row < rows; row += 1) {
        const card = document.createElement('div');
        const distant = lane % 3 === 2;
        const duration = 25 + ((lane * 3 + row * 2) % 10);
        const phase = mobile.matches ? (row === 0 ? 0.2 : 0.79) + lane * 0.017 : 0.19 + row * 0.29 + (lane % 2) * 0.05;
        card.className = `label-reveal-card${distant ? ' is-distant' : ''}`;
        const properties = {
          '--card-x': `${x}%`,
          '--card-size': `${mobile.matches ? 76 + lane % 2 * 12 : distant ? 72 : 102 + row % 2 * 16}px`,
          '--card-duration': `${duration}s`, '--card-delay': `${-phase * duration}s`,
          '--card-tilt': `${(lane % 2 ? 1 : -1) * (5 + row * 2)}deg`,
          '--card-end-tilt': `${(lane % 2 ? -1 : 1) * 4}deg`,
          '--card-drift': `${lane % 2 ? -14 : 14}px`, '--card-opacity': distant ? '0.68' : '1'
        };
        Object.entries(properties).forEach(([key, value]) => card.style.setProperty(key, value));
        const img = document.createElement('img');
        img.alt = '';
        img.width = 320;
        img.height = 320;
        img.decoding = 'async';
        img.fetchPriority = 'low';
        nextImage(img);
        card.append(img);
        // Each swap happens above the clipped edge, never across a visible label.
        card.addEventListener('animationiteration', () => nextImage(img));
        rain.append(card);
      }
    });
  }

  const sizeObserver = new ResizeObserver(() => {
    section.style.setProperty('--reveal-travel', `${section.offsetHeight + 180}px`);
  });
  sizeObserver.observe(section);
  const preloadObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    initialized = true;
    buildCards();
    syncMotion();
    preloadObserver.disconnect();
  }, { rootMargin: '240px' });
  preloadObserver.observe(section);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotion();
  }).observe(section);
  mobile.addEventListener('change', buildCards);
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
})();
