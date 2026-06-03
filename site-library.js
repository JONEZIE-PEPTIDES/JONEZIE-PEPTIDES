window.JONEZIE_SITE_LIBRARY = (() => {
  const SITE_ORIGIN = 'https://www.jonezielabs.com';
  const RESOURCE_DOWNLOAD = {
    pageHref: 'jonezie-labs-ruo-quick-reference.html',
    fileHref: 'jonezie-labs-ruo-quick-reference.txt',
    title: 'RUO Quick Reference',
    description: 'A fast reference covering cold-chain storage, concentration math, and mixing reminders for RUO compounds.'
  };
  const LEAD_CAPTURE = {
    endpoint: String(window.JONEZIE_LEAD_CAPTURE_CONFIG?.endpoint || '').trim()
  };
  const RUO_COPY = {
    short: 'For laboratory research reference only. Not for human or veterinary use.',
    full: 'All product information is provided for research, laboratory, or analytical reference only. Products are not for human or veterinary use.'
  };
  const TOOL_LIBRARY = [
    {
      key: 'reconstitution-calculator',
      title: 'Concentration Calculator',
      href: 'research-tools.html#reconstitution-calculator',
      description: 'Translate vial strength and dilution volume into a clean mg-per-mL reference.'
    },
    {
      key: 'storage-guide',
      title: 'Storage Guide',
      href: 'research-tools.html#storage-guide-tool',
      description: 'Review cold-chain notes and storage reminders for the selected compound.'
    },
    {
      key: 'mixing-guide',
      title: 'Mixing Guide',
      href: 'research-tools.html#mixing-guide-tool',
      description: 'Keep dilution order and vial-handling notes close before comparison work.'
    },
    {
      key: 'ruo-reference',
      title: 'RUO Quick Reference',
      href: 'jonezie-labs-ruo-quick-reference.html',
      description: 'Open the short-form reference for storage, preparation, and RUO handling reminders.'
    }
  ];

  const GUIDE_LIBRARY = [
    {
      key: 'metabolic',
      categories: ['Metabolic'],
      title: 'Metabolic Research Guide',
      summary: 'A cleaner way to compare GLP-1, dual-agonist, and next-wave appetite-signaling compounds in one lane.',
      intro: 'Metabolic products on Jonezie are usually evaluated for appetite signaling, body-composition modeling, glucose handling, and downstream cardiometabolic readouts.',
      bullets: [
        'Compare mature GLP-1 products against dual- and triple-pathway compounds by strength range, category depth, and current demand.',
        'Keep copy anchored to appetite, energy-balance, and glycemic research themes instead of treatment or outcome claims.',
        'Use comparison pages when a researcher is deciding between semaglutide, tirzepatide, retatrutide, cagrilintide blends, or newer niche entries.'
      ],
      faq: [
        {
          question: 'Why open the metabolic guide first?',
          answer: 'It brings semaglutide, tirzepatide, retatrutide, and neighboring compounds into one sharper read before you narrow by price, strength, or lane fit.'
        },
        {
          question: 'How should metabolic compounds be described on Jonezie?',
          answer: 'Stay with research-first language around appetite signaling, energy balance, glycemic endpoints, and body-composition pathways while keeping the RUO notice intact.'
        }
      ]
    },
    {
      key: 'recovery',
      categories: ['Recovery'],
      title: 'Recovery Research Guide',
      summary: 'A recovery-focused guide for tendon, ligament, tissue-repair, and wound-healing research products.',
      intro: 'Recovery products on Jonezie cluster around soft-tissue remodeling, angiogenesis, wound response, and repair-pathway studies.',
      bullets: [
        'Use this guide when comparing BPC-157, TB500, Wolverine blends, Ara-290, and other repair-oriented products.',
        'Keep messaging centered on repair pathways, resilience, tissue signaling, and laboratory handling discipline.',
        'Open storage and mixing guidance alongside recovery products because these compounds are often reviewed in stacks or multi-vial setups.'
      ],
      faq: [
        {
          question: 'Which recovery compounds are commonly compared?',
          answer: 'Researchers usually compare BPC-157, TB500, Wolverine blends, Ara-290, and Thymosin Alpha-1 when looking at repair-pathway coverage across different strengths, blends, and formats.'
        },
        {
          question: 'What is the safest way to present recovery content?',
          answer: 'Frame it around preclinical repair themes, tissue-signaling pathways, and careful lab handling rather than promises.'
        }
      ]
    },
    {
      key: 'aesthetics',
      categories: ['Aesthetics'],
      title: 'Aesthetics Research Guide',
      summary: 'A centralized guide for collagen, skin-remodeling, pigmentation, and appearance-focused research products.',
      intro: 'Aesthetics compounds usually sit at the intersection of collagen signaling, skin support, pigmentation models, and cosmetic-pathway research.',
      bullets: [
        'Use it to connect GHK-CU, Glow, KLOW, MT-1, MT-2, SNAP-8, Lemon Bottle, and similar appearance-focused products.',
        'Keep language focused on collagen, skin support, pigmentation, remodeling, or cosmetic-pathway research.',
        'Surface related comparison pages when the question is GHK-CU versus Glow, singles versus blends, or pigmentation support versus broader cosmetic-pathway coverage.'
      ],
      faq: [
        {
          question: 'What belongs in the aesthetics category on Jonezie?',
          answer: 'Products in this lane usually support skin, collagen, pigmentation, remodeling, or cosmetic-pathway research and pair naturally with clean storage guidance.'
        },
        {
          question: 'Why link aesthetics products to guides and tools?',
          answer: 'These compounds are often reviewed alongside singles and blends, so clear comparisons and handling reads make the lineup easier to navigate.'
        }
      ]
    },
    {
      key: 'growth',
      categories: ['Growth'],
      title: 'Growth-Axis Research Guide',
      summary: 'A guide for GH-axis, secretagogue, endocrine, and body-composition research products.',
      intro: 'Growth compounds on Jonezie are usually compared across GH-axis coverage, endocrine signaling, and body-composition research.',
      bullets: [
        'Use it to compare Somatropin, CJC-1295 variants, Ipamorelin, IGF-1LR3, HCG, HMG, and related growth-axis compounds.',
        'Strength comparison is especially important here because multiple GH-pathway products have multi-tiered option sets.',
        'Related comparison links help researchers move between direct GH products, secretagogues, and paired stacks.'
      ],
      faq: [
        {
          question: 'What makes the growth-axis lane different?',
          answer: 'Growth-axis compounds are easiest to read when you compare secretagogues, direct growth-signaling compounds, and endocrine-support products by strength range and research focus.'
        },
        {
          question: 'What kind of content works best for growth products?',
          answer: 'Concise, research-first summaries around GH signaling, endocrine modeling, and body-composition pathways usually work best while keeping claims measured.'
        }
      ]
    },
    {
      key: 'cognitive',
      categories: ['Cognitive'],
      title: 'Cognitive Research Guide',
      summary: 'A guide for focus, stress-response, neuro-support, and restoration-pathway compounds.',
      intro: 'Cognitive products on Jonezie usually connect through focus, neuroregulation, stress response, or restoration-oriented research themes.',
      bullets: [
        'Use it to cluster Semax, Selank, DSIP, Pinealon, VIP, Cerebrolysin, and Oxytocin Acetate without flattening them into one generic nootropic bucket.',
        'Anchor descriptions to published neuro-support and regulatory-pathway research instead of lifestyle copy.',
        'Comparison pages help users move between classic cognitive peptides and newer restoration products.'
      ],
      faq: [
        {
          question: 'What is the strongest use for the cognitive guide?',
          answer: 'It gives researchers one cleaner lane for focus, neuro-support, sleep-related, and restoration-pathway compounds without flattening them into one bucket.'
        },
        {
          question: 'How should cognitive copy stay compliant?',
          answer: 'Use research-first language about neuroregulation, stress response, or restoration pathways and avoid therapeutic or human-use framing.'
        }
      ]
    },
    {
      key: 'cellular',
      categories: ['Cellular'],
      title: 'Cellular Research Guide',
      summary: 'A guide for mitochondrial, longevity, antioxidant, and whole-cell signaling products.',
      intro: 'Cellular products on Jonezie usually map to mitochondrial signaling, antioxidant support, longevity-related pathways, and broader whole-cell function research.',
      bullets: [
        'Use this guide for MOTS-c, NAD, SS-31, Epithalon, Thymalin, PNC27, and similar cellular-function products.',
        'These products are often weighed across longevity, energy, and repair themes, so direct comparisons matter.',
        'Guide content should stay technically clear and avoid broad anti-aging promises.'
      ],
      faq: [
        {
          question: 'Why open the cellular guide first?',
          answer: 'It brings mitochondrial, longevity, and stress-response compounds into one cleaner read so overlap and differences are easier to spot.'
        },
        {
          question: 'How should cellular compounds be summarized?',
          answer: 'Focus on mitochondrial signaling, cellular stress, antioxidant pathways, and laboratory longevity research without overstating certainty.'
        }
      ]
    },
    {
      key: 'support',
      categories: ['Support', 'Performance'],
      title: 'Support And Performance Guide',
      summary: 'A catch-all guide for support items, specialty products, and high-output research products that do not fit the core category hubs.',
      intro: 'Support and performance items still need clear storage, mixing, and comparison context even when they do not belong to one dominant peptide lane.',
      bullets: [
        'Use it for BAC Water, Dermorphin, PT-141, LC216, and other specialty products that need context but should not distort the core category guides.',
        'This guide is the right place for handling notes, quick math, and adjacent comparisons.',
        'Link specialty products to tools and quick-reference assets so users can keep moving even when the product is niche.'
      ],
      faq: [
        {
          question: 'Why combine support and performance products in one guide?',
          answer: 'It keeps specialty products easy to find without forcing them into the wrong lane.'
        },
        {
          question: 'What matters most for support products?',
          answer: 'Clear storage reads, mixing guidance, and nearby product links usually matter more than long sales copy.'
        }
      ]
    }
  ];

  const STORAGE_PROFILES = {
    Metabolic: {
      title: 'Cold-chain metabolic storage',
      shortSummary: 'Store lyophilized material in a cool, dry, light-protected environment. After reconstitution, refrigerate promptly and minimize repeated warm cycles.',
      bullets: [
        'Protect vials from direct light, humidity, and prolonged room-temperature exposure.',
        'Use clearly labeled reconstitution dates so multi-compound handling stays traceable.',
        'For multi-vial studies, keep handling time short and return refrigerated material quickly.'
      ]
    },
    Recovery: {
      title: 'Repair-lane storage',
      shortSummary: 'Recovery compounds are best handled with the same cold-chain discipline used for other lyophilized research products, with extra attention to labeling and repeat handling.',
      bullets: [
        'Keep unopened material cool, dry, and sealed until needed.',
        'After mixing, refrigerate and avoid repeated temperature swings.',
        'Track open-date and lot-level notes when comparing stacks or multi-part blends.'
      ]
    },
    Aesthetics: {
      title: 'Aesthetics and collagen storage',
      shortSummary: 'Store aesthetics-focused products in a cool, dry, dark environment and keep post-reconstitution handling clean and consistent.',
      bullets: [
        'Light protection matters for clean appearance and handling stability.',
        'Use calibrated volumes and clear labels when comparing singles against stacks.',
        'Refrigerate mixed material and keep session-by-session handling disciplined.'
      ]
    },
    Growth: {
      title: 'Endocrine and growth storage',
      shortSummary: 'Store growth-axis products in a dry, low-light environment before mixing and refrigerate after reconstitution.',
      bullets: [
        'Separate lots and strength tiers clearly when a product has multiple option ranges.',
        'Avoid leaving mixed product at room temperature longer than needed for laboratory handling.',
        'Document storage timing when comparing secretagogues, GH products, and endocrine-support compounds.'
      ]
    },
    Cognitive: {
      title: 'Neuro-support storage',
      shortSummary: 'Keep cognitive products cool, dry, and light-protected before mixing; refrigerate after reconstitution and maintain clear handling notes.',
      bullets: [
        'Label mix dates and keep handling standardized during multi-product comparisons.',
        'Avoid repeated warm-to-cold cycles when working through longer research windows.',
        'Pair storage notes with the quick-reference asset for easier repeat ordering.'
      ]
    },
    Cellular: {
      title: 'Cellular-function storage',
      shortSummary: 'Cellular and longevity-focused products should stay cool, dry, and light-protected pre-mix, with refrigerated storage after reconstitution.',
      bullets: [
        'Use consistent labeling when comparing mitochondrial or longevity-focused compounds across several strengths.',
        'Keep mixed material cold between sessions and avoid unnecessary agitation.',
        'Document open dates for research traceability and quicker replenishment planning.'
      ]
    },
    Support: {
      title: 'Support-item handling',
      shortSummary: 'Support products still need clean storage and handling discipline so lot labels and pairing notes stay clear.',
      bullets: [
        'Keep support materials sealed, labeled, and easy to pair with the right product lot.',
        'Use storage notes to reduce handling mistakes across large order batches.',
        'Link support items back to tools and guides so researchers do not need to guess the next step.'
      ]
    },
    Performance: {
      title: 'Specialty performance storage',
      shortSummary: 'Performance and specialty items should follow the same cool, dry, light-protected storage baseline as the rest of the lineup.',
      bullets: [
        'Keep specialty items well labeled because they are often revisited less often than core catalog products.',
        'After mixing, refrigerate and minimize repeated exposure to ambient conditions.',
        'Pair niche products with clear labels and handling notes so repeat ordering stays simple.'
      ]
    }
  };

  const MIXING_PROFILES = {
    Metabolic: {
      title: 'Metabolic mixing guide',
      steps: [
        'Confirm the vial label, selected strength, and intended dilution volume before opening the vial.',
        'Add diluent slowly along the inside wall of the vial rather than spraying directly onto the lyophilized cake.',
        'Let the vial settle, then gently rotate to dissolve. Avoid shaking aggressively.'
      ]
    },
    Recovery: {
      title: 'Recovery mixing guide',
      steps: [
        'Match the product strength to the correct study label before reconstitution begins.',
        'Use measured diluent and introduce it slowly to keep the product handling gentle and repeatable.',
        'Gently swirl until mixed, then refrigerate and log the reconstitution date.'
      ]
    },
    Aesthetics: {
      title: 'Aesthetics mixing guide',
      steps: [
        'Record the compound and target volume before adding diluent so stack comparisons stay organized.',
        'Add diluent along the vial wall and allow the cake to hydrate gradually.',
        'Roll or swirl gently until dissolved and store refrigerated after mixing.'
      ]
    },
    Growth: {
      title: 'Growth-axis mixing guide',
      steps: [
        'Verify strength tier and product code first because GH-axis products often have several option ranges.',
        'Use a clean measured dilution volume and add it carefully down the vial wall.',
        'Allow the solution to clear with gentle rotation, then refrigerate and log handling details.'
      ]
    },
    Cognitive: {
      title: 'Cognitive mixing guide',
      steps: [
        'Check the compound, reconstitution volume, and lot label before beginning.',
        'Add diluent slowly with low agitation and let the vial rest briefly between motions.',
        'Refrigerate after mixing and keep labeling consistent across compounds in the same lane.'
      ]
    },
    Cellular: {
      title: 'Cellular mixing guide',
      steps: [
        'Confirm compound identity and dilution volume so mitochondrial or longevity comparisons stay traceable.',
        'Introduce diluent gently and avoid forceful shaking during dissolution.',
        'Store refrigerated after mixing and note the reconstitution date for lab records.'
      ]
    },
    Support: {
      title: 'Support-item guide',
      steps: [
        'Match the support item to the correct compound before use.',
        'Keep handling surfaces clean and document how support materials are paired with specific lots.',
        'Use the quick-reference download when building a repeatable reconstitution setup.'
      ]
    },
    Performance: {
      title: 'Specialty mixing guide',
      steps: [
        'Verify the selected product and dilution target before beginning any handling.',
        'Add diluent gradually and keep physical agitation low.',
        'Refrigerate after reconstitution and use clear labels if the product is being reviewed alongside nearby compounds.'
      ]
    }
  };

  const NON_COMPARISON_CATEGORIES = new Set(['Support']);
  const NON_COMPARISON_SLUGS = new Set(['bac-water']);
  const CATEGORY_RESEARCH_CONTEXT = {
    Metabolic: 'Commonly referenced in research involving appetite signaling, metabolic regulation, glycemic modeling, and body-composition pathways.',
    Recovery: 'Commonly referenced in research involving repair pathways, tissue remodeling, resilience signaling, and laboratory recovery models.',
    Aesthetics: 'Commonly referenced in research involving collagen support, pigmentation, skin remodeling, and cosmetic-pathway analysis.',
    Growth: 'Commonly referenced in research involving GH-axis signaling, endocrine modeling, and body-composition studies.',
    Cognitive: 'Commonly referenced in research involving neuro-support, focus regulation, stress-response signaling, and restoration pathways.',
    Cellular: 'Commonly referenced in research involving mitochondrial signaling, cellular stress, longevity-focused analysis, and whole-cell function.',
    Support: 'Commonly referenced as a laboratory support item used alongside storage, mixing, and broader research reference work.',
    Performance: 'Commonly referenced in specialty signaling research where category fit is narrower and handling notes matter more than broad claims.'
  };
  const COMPARISON_THEME_RULES = [
    {
      key: 'metabolic-incretin',
      label: 'Appetite-signaling compounds',
      category: 'Metabolic',
      fragments: ['semaglutide', 'tirzepatide', 'retatrutide', 'survodutide', 'mazdutide', 'cagrilintide']
    },
    {
      key: 'metabolic-body-composition',
      label: 'Body-composition compounds',
      category: 'Metabolic',
      fragments: ['aod', '5-amino-1mq', 'slu-pp-322']
    },
    {
      key: 'recovery-repair',
      label: 'Repair-pathway compounds',
      category: 'Recovery',
      fragments: ['bpc', 'tb', 'ara-290', 'wolverine', 'thymosin-alpha-1']
    },
    {
      key: 'aesthetics-skin',
      label: 'Skin-remodeling compounds',
      category: 'Aesthetics',
      fragments: ['ghk-cu', 'glow', 'klow']
    },
    {
      key: 'aesthetics-pigmentation',
      label: 'Pigmentation compounds',
      category: 'Aesthetics',
      fragments: ['mt-1', 'mt-2']
    },
    {
      key: 'aesthetics-cosmetic',
      label: 'Cosmetic-support compounds',
      category: 'Aesthetics',
      fragments: ['snap-8', 'lemon-bottle', 'b12-blend']
    },
    {
      key: 'growth-secretagogue',
      label: 'GH-axis secretagogues',
      category: 'Growth',
      fragments: ['tesamorelin', 'cjc', 'ipamorelin', 'ghrp-6']
    },
    {
      key: 'growth-factor',
      label: 'Direct growth-signaling compounds',
      category: 'Growth',
      fragments: ['somatropin', 'igf-1lr3']
    },
    {
      key: 'growth-fertility',
      label: 'Fertility-signaling compounds',
      category: 'Growth',
      fragments: ['hcg', 'hmg', 'kisspeptin']
    },
    {
      key: 'cognitive-focus',
      label: 'Focus and neuro-support compounds',
      category: 'Cognitive',
      fragments: ['semax', 'selank', 'cerebrolysin']
    },
    {
      key: 'cognitive-restoration',
      label: 'Restoration-pathway compounds',
      category: 'Cognitive',
      fragments: ['dsip', 'pinealon', 'vip', 'oxytocin']
    },
    {
      key: 'cellular-mito',
      label: 'Mitochondrial and energy compounds',
      category: 'Cellular',
      fragments: ['mots-c', 'nad', 'ss-31']
    },
    {
      key: 'cellular-longevity',
      label: 'Longevity and bioregulator compounds',
      category: 'Cellular',
      fragments: ['epithalon', 'thymalin']
    },
    {
      key: 'cellular-specialty',
      label: 'Specialty cellular compounds',
      category: 'Cellular',
      fragments: ['pnc27']
    },
    {
      key: 'performance-drive',
      label: 'Drive and specialty compounds',
      category: 'Performance',
      fragments: ['dermorphin', 'pt-141', 'lc216']
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  function getSiteOrigin() {
    return SITE_ORIGIN;
  }

  function getAbsoluteUrl(path) {
    return new URL(String(path || '').replace(/^\.\//, ''), `${SITE_ORIGIN}/`).toString();
  }

  function getCatalogProducts(catalog) {
    const products = [];
    const seen = new Set();
    [...(catalog?.featured || []), ...(catalog?.products || [])].forEach((product) => {
      if (!product?.slug || seen.has(product.slug)) return;
      seen.add(product.slug);
      products.push(product);
    });
    return products;
  }

  function getProductMap(catalog) {
    return new Map(getCatalogProducts(catalog).map((product) => [product.slug, product]));
  }

  function getProductBySlug(catalog, slug) {
    return getProductMap(catalog).get(String(slug || '').trim()) || null;
  }

  function getProductUrl(slug) {
    return `products/${encodeURIComponent(slug)}.html`;
  }

  function getProductCanonicalUrl(slug) {
    return `${SITE_ORIGIN}/${getProductUrl(slug)}`;
  }

  function getProductSeoTypeLabel(product) {
    if (!product) return 'Research Product';
    return product.category === 'Support' ? 'Research Support' : 'Research Peptide';
  }

  function getProductPageTitle(product) {
    if (!product?.name) return 'Research Product | Jonezie Labs';
    return `${product.name} ${getProductSeoTypeLabel(product)} | Jonezie Labs`;
  }

  function getSortedPair(leftSlug, rightSlug) {
    return [String(leftSlug || '').trim(), String(rightSlug || '').trim()].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }

  function getComparisonUrl(leftSlug, rightSlug) {
    const pair = getSortedPair(leftSlug, rightSlug);
    if (pair.length !== 2) return 'comparison.html';
    return `comparison.html?left=${encodeURIComponent(pair[0])}&right=${encodeURIComponent(pair[1])}`;
  }

  function getGuideForCategory(category) {
    return GUIDE_LIBRARY.find((guide) => guide.categories.includes(category)) || GUIDE_LIBRARY.find((guide) => guide.key === 'support');
  }

  function getGuideForProduct(product) {
    return getGuideForCategory(product?.category);
  }

  function getGuideUrl(guideKey) {
    return `research-guides.html#guide-${encodeURIComponent(guideKey)}`;
  }

  function getGuideUrlForProduct(product) {
    const guide = getGuideForProduct(product);
    return guide ? getGuideUrl(guide.key) : 'research-guides.html';
  }

  function getToolsUrl(anchor) {
    return anchor ? `research-tools.html#${encodeURIComponent(anchor)}` : 'research-tools.html';
  }

  function isBlendProduct(product) {
    const slug = String(product?.slug || '').toLowerCase();
    const name = String(product?.name || '').toLowerCase();
    return slug.includes('plus') || slug.includes('stack') || name.includes('+') || name.includes('stack');
  }

  function getProductForm(product) {
    if (!product) return 'Research vial';
    if (product.slug === 'bac-water') return 'Support vial';
    if (isBlendProduct(product)) return 'Multi-compound lyophilized vial';
    return 'Lyophilized research vial';
  }

  function getProductCompoundClass(product) {
    if (!product) return 'Research compound';
    const theme = getComparisonTheme(product);
    const blend = isBlendProduct(product);
    const fallback = blend ? `${product.category} research blend` : `${product.category} research compound`;
    if (product.slug === 'bac-water') return 'Laboratory support solution';

    switch (theme?.key) {
      case 'metabolic-incretin':
        return blend ? 'Multi-pathway incretin blend' : 'Incretin-pathway research compound';
      case 'metabolic-body-composition':
        return blend ? 'Body-composition research blend' : 'Body-composition research compound';
      case 'recovery-repair':
        return blend ? 'Repair-pathway peptide blend' : 'Repair-pathway research peptide';
      case 'aesthetics-skin':
        return blend ? 'Skin-remodeling research blend' : 'Skin-remodeling research compound';
      case 'aesthetics-pigmentation':
        return blend ? 'Pigmentation-pathway blend' : 'Pigmentation-pathway research peptide';
      case 'aesthetics-cosmetic':
        return blend ? 'Cosmetic-pathway blend' : 'Cosmetic-pathway research compound';
      case 'growth-secretagogue':
        return blend ? 'GH-axis secretagogue blend' : 'GH-axis secretagogue';
      case 'growth-factor':
        return 'Growth-signaling research compound';
      case 'growth-fertility':
        return 'Endocrine-signaling research compound';
      case 'cognitive-focus':
        return blend ? 'Neuro-support blend' : 'Neuro-support research compound';
      case 'cognitive-restoration':
        return blend ? 'Restoration-pathway blend' : 'Restoration-pathway research compound';
      case 'cellular-mito':
        return blend ? 'Mitochondrial research blend' : 'Mitochondrial-function research compound';
      case 'cellular-longevity':
        return blend ? 'Bioregulator blend' : 'Bioregulator research compound';
      case 'cellular-specialty':
        return 'Specialty cellular research compound';
      case 'performance-drive':
        return blend ? 'Specialty signaling blend' : 'Specialty signaling research compound';
      default:
        return fallback;
    }
  }

  function getProductStructureNote(product) {
    if (!product) return 'Cataloged as a research vial.';
    if (product.slug === 'bac-water') return 'Cataloged as a support solution used alongside storage, mixing, and broader laboratory reference work.';
    if (isBlendProduct(product)) return 'Listed as a multi-compound blend with multiple active entries in one vial.';
    const theme = getComparisonTheme(product);
    if (theme?.label) return `Listed as a single-compound vial inside the ${theme.label.toLowerCase()} lane.`;
    return `Listed as a single-compound vial inside the ${String(product.category || 'research').toLowerCase()} lane.`;
  }

  function getProductResearchContext(product, productContent) {
    if (productContent?.researchSummary) return productContent.researchSummary;
    if (productContent?.shortDescription) return productContent.shortDescription;
    return CATEGORY_RESEARCH_CONTEXT[product?.category] || 'Commonly referenced in laboratory comparison and handling work.';
  }

  function getProductHandlingNote(product) {
    const profile = getMixingProfile(product);
    const steps = Array.isArray(profile?.steps) ? profile.steps.slice(0, 2) : [];
    if (!steps.length) return 'Confirm the vial label before handling and keep mixing gentle and well documented.';
    return steps.join(' ');
  }

  function getProductComparisonSummary(product, productContent) {
    const themeLabel = getComparisonThemeLabel(product);
    const context = getProductResearchContext(product, productContent);
    return `${themeLabel} with handling and pricing details kept close for faster side-by-side review. ${context}`;
  }

  function getProductMetaDescription(product, productContent = null) {
    if (!product?.name) {
      return 'Browse Jonezie Labs research-use-only product pages for current strengths, pricing, storage notes, and related comparisons.';
    }
    const summary = getProductResearchContext(product, productContent);
    return `${product.name} from Jonezie Labs. ${summary} View listed strengths, pricing, storage notes, handling context, and related comparisons for laboratory reference only.`
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getRelatedToolSet(product) {
    if (!product) return TOOL_LIBRARY.slice();
    const tools = [
      TOOL_LIBRARY[0],
      TOOL_LIBRARY[1],
      TOOL_LIBRARY[2],
      TOOL_LIBRARY[3]
    ];
    if (product.category === 'Support') {
      return [TOOL_LIBRARY[1], TOOL_LIBRARY[3], TOOL_LIBRARY[0]];
    }
    return tools;
  }

  function getProductInfoProfile(product, productContent = null, catalog = null) {
    const guide = getGuideForProduct(product);
    const storageProfile = getStorageProfile(product);
    const mixingProfile = getMixingProfile(product);
    const relatedCompounds = catalog ? getRelatedProducts(product, catalog, 4) : [];
    const comparisonCandidates = catalog ? getComparisonCandidates(product, catalog, 3) : [];
    const strengths = getOptionStrengthList(product);
    return {
      name: product?.name || 'Research compound',
      shortDescription: productContent?.shortDescription || product?.description || '',
      researchContext: getProductResearchContext(product, productContent),
      compoundClass: getProductCompoundClass(product),
      researchCategory: product?.category || 'Research',
      form: getProductForm(product),
      storageNote: storageProfile.shortSummary,
      handlingNote: getProductHandlingNote(product),
      structureNote: getProductStructureNote(product),
      comparisonSummary: getProductComparisonSummary(product, productContent),
      strengths,
      guide,
      storageProfile,
      mixingProfile,
      relatedCompounds,
      comparisonCandidates,
      relatedTools: getRelatedToolSet(product),
      ruoDisclaimer: RUO_COPY.full
    };
  }

  function getStorageProfile(product) {
    return STORAGE_PROFILES[product?.category] || STORAGE_PROFILES.Support;
  }

  function getMixingProfile(product) {
    return MIXING_PROFILES[product?.category] || MIXING_PROFILES.Support;
  }

  function getOptionStrengthList(product) {
    return (product?.options || []).map((option) => option.mgOption).filter(Boolean);
  }

  function parsePrice(value) {
    if (value == null || value === '') return null;
    const numeric = Number.parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  }

  function formatMoney(value) {
    if (!Number.isFinite(value)) return 'Pending';
    return `$${value.toFixed(2)}`;
  }

  function getStartingPrice(product) {
    const option = product?.options?.[0];
    return parsePrice(product?.startingPriceSingle || option?.singleVialPrice || option?.eightVialPrice || option?.tenVialPrice);
  }

  function getGuideProductList(guideKey, catalog, limit = 6) {
    const guide = GUIDE_LIBRARY.find((entry) => entry.key === guideKey);
    if (!guide) return [];
    return getCatalogProducts(catalog)
      .filter((product) => guide.categories.includes(product.category))
      .sort((left, right) => {
        const leftPrice = getStartingPrice(left) || Number.POSITIVE_INFINITY;
        const rightPrice = getStartingPrice(right) || Number.POSITIVE_INFINITY;
        return leftPrice - rightPrice || left.name.localeCompare(right.name);
      })
      .slice(0, limit);
  }

  function isComparisonEligible(product) {
    if (!product?.slug) return false;
    if (NON_COMPARISON_SLUGS.has(product.slug)) return false;
    if (NON_COMPARISON_CATEGORIES.has(product.category)) return false;
    return true;
  }

  function getComparisonTheme(product) {
    if (!isComparisonEligible(product)) return null;
    const slug = String(product.slug || '').toLowerCase();
    return COMPARISON_THEME_RULES.find((rule) => (
      rule.category === product.category
      && rule.fragments.some((fragment) => slug.includes(fragment))
    )) || null;
  }

  function getComparisonThemeLabel(product) {
    const theme = getComparisonTheme(product);
    if (theme?.label) return theme.label;
    return `${product?.category || 'Research'} lane compounds`;
  }

  function scoreProductRelationship(sourceProduct, candidate) {
    if (!sourceProduct || !candidate || sourceProduct.slug === candidate.slug) return -1;
    let score = 0;
    if (sourceProduct.category === candidate.category) score += 6;
    const sourceName = String(sourceProduct.name || '').toLowerCase();
    const candidateName = String(candidate.name || '').toLowerCase();
    const sourceWords = sourceName.split(/[^a-z0-9]+/).filter(Boolean);
    const candidateWords = candidateName.split(/[^a-z0-9]+/).filter(Boolean);
    sourceWords.forEach((word) => {
      if (word.length > 2 && candidateWords.includes(word)) score += 2;
    });
    const sourceGuide = getGuideForProduct(sourceProduct);
    const candidateGuide = getGuideForProduct(candidate);
    if (sourceGuide && candidateGuide && sourceGuide.key === candidateGuide.key) score += 2;
    const sourceStrengths = getOptionStrengthList(sourceProduct).length;
    const candidateStrengths = getOptionStrengthList(candidate).length;
    if (Math.abs(sourceStrengths - candidateStrengths) <= 1) score += 1;
    return score;
  }

  function scoreComparisonRelationship(sourceProduct, candidate) {
    if (!isComparisonEligible(sourceProduct) || !isComparisonEligible(candidate)) return -1;
    if (sourceProduct.slug === candidate.slug) return -1;
    if (sourceProduct.category !== candidate.category) return -1;

    const sourceTheme = getComparisonTheme(sourceProduct);
    const candidateTheme = getComparisonTheme(candidate);
    if (sourceTheme && candidateTheme && sourceTheme.key !== candidateTheme.key) return -1;

    let score = 8;
    if (sourceTheme && candidateTheme && sourceTheme.key === candidateTheme.key) score += 4;

    const sourceGuide = getGuideForProduct(sourceProduct);
    const candidateGuide = getGuideForProduct(candidate);
    if (sourceGuide && candidateGuide && sourceGuide.key === candidateGuide.key) score += 2;

    const sourceWords = String(sourceProduct.name || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const candidateWords = String(candidate.name || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const overlappingWords = sourceWords.filter((word) => word.length > 2 && candidateWords.includes(word));
    score += Math.min(overlappingWords.length, 3);

    const sourceStrengths = getOptionStrengthList(sourceProduct).length;
    const candidateStrengths = getOptionStrengthList(candidate).length;
    if (Math.abs(sourceStrengths - candidateStrengths) <= 1) score += 1;

    const sourcePrice = getStartingPrice(sourceProduct);
    const candidatePrice = getStartingPrice(candidate);
    if (Number.isFinite(sourcePrice) && Number.isFinite(candidatePrice)) {
      const ratio = Math.max(sourcePrice, candidatePrice) / Math.max(Math.min(sourcePrice, candidatePrice), 1);
      if (ratio <= 2.5) score += 1;
    }

    return score;
  }

  function areProductsComparable(leftProduct, rightProduct) {
    return scoreComparisonRelationship(leftProduct, rightProduct) >= 10;
  }

  function getRelatedProducts(product, catalog, limit = 4) {
    return getCatalogProducts(catalog)
      .filter((candidate) => candidate.slug !== product?.slug)
      .map((candidate) => ({ product: candidate, score: scoreProductRelationship(product, candidate) }))
      .filter((entry) => entry.score >= 2)
      .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name))
      .slice(0, limit)
      .map((entry) => entry.product);
  }

  function getComparisonCandidates(product, catalog, limit = 3) {
    if (!isComparisonEligible(product)) return [];
    return getCatalogProducts(catalog)
      .filter((candidate) => candidate.slug !== product?.slug)
      .map((candidate) => ({ product: candidate, score: scoreComparisonRelationship(product, candidate) }))
      .filter((entry) => entry.score >= 10)
      .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name))
      .slice(0, limit)
      .map((entry) => entry.product);
  }

  function getComparisonPairs(catalog, limit = 18) {
    const products = getCatalogProducts(catalog).filter(isComparisonEligible);
    const pairs = [];
    const seen = new Set();

    products.forEach((product) => {
      getComparisonCandidates(product, catalog, 3).forEach((candidate) => {
        const pair = getSortedPair(product.slug, candidate.slug);
        const key = pair.join('::');
        if (pair.length !== 2 || seen.has(key)) return;
        seen.add(key);
        pairs.push({
          left: getProductBySlug(catalog, pair[0]),
          right: getProductBySlug(catalog, pair[1])
        });
      });
    });

    return pairs
      .filter((pair) => pair.left && pair.right)
      .sort((left, right) => {
        const leftScore = (getStartingPrice(left.left) || 0) + (getStartingPrice(left.right) || 0);
        const rightScore = (getStartingPrice(right.left) || 0) + (getStartingPrice(right.right) || 0);
        return leftScore - rightScore || left.left.name.localeCompare(right.left.name);
      })
      .slice(0, limit);
  }

  function getProductFaqs(product, productContent) {
    const profile = getProductInfoProfile(product, productContent);
    const strengths = profile.strengths.join(', ') || 'Current options are shown in the product selector.';

    return [
      {
        question: `What is ${product.name} usually researched for?`,
        answer: profile.researchContext
      },
      {
        question: `How should ${product.name} be stored during research handling?`,
        answer: profile.storageNote
      },
      {
        question: `Which ${product.name} strengths are available on Jonezie Labs?`,
        answer: `${product.name} is currently listed with the following options: ${strengths}.`
      },
      {
        question: `Where should I go next after reviewing ${product.name}?`,
        answer: `Use the related comparisons, ${profile.guide?.title.toLowerCase() || 'research guide'}, and research tools to review nearby compounds, storage notes, and handling context without leaving the same lane.`
      }
    ];
  }

  function getComparisonFaqs(leftProduct, rightProduct) {
    const leftProfile = getProductInfoProfile(leftProduct);
    const rightProfile = getProductInfoProfile(rightProduct);
    const comparisonTheme = getComparisonThemeLabel(leftProduct);
    return [
      {
        question: `Why compare ${leftProduct.name} and ${rightProduct.name} on the same page?`,
        answer: `Putting ${leftProduct.name} and ${rightProduct.name} side by side helps researchers compare ${comparisonTheme.toLowerCase()}, current strengths, handling notes, and price entry points in one focused read.`
      },
      {
        question: `Are ${leftProduct.name} and ${rightProduct.name} in the same research lane?`,
        answer: leftProduct.category === rightProduct.category
          ? `Yes. Both products sit in the ${leftProduct.category.toLowerCase()} lane and are grouped here because they speak to closely related research goals.`
          : `They touch adjacent themes, but they do not sit in the same primary lane: ${leftProduct.category} and ${rightProduct.category}.`
      },
      {
        question: `What should I review after this comparison?`,
        answer: `Move from this read into the linked product pages, the ${leftProfile.guide?.title.toLowerCase() || 'matching research guide'}, and the related tools to compare structure notes, storage discipline, and nearby compounds in the same lane.`
      },
      {
        question: `What does this page avoid on purpose?`,
        answer: `${leftProduct.name} and ${rightProduct.name} are presented for laboratory, analytical, and catalog-reference work only. The comparison does not include human-use instructions, dosing guidance, or outcome claims.`
      }
    ];
  }

  function getLeadMagnetMailto(details) {
    const payload = [
      `Lead source: ${details.source || 'Site capture'}`,
      `Trigger: ${details.trigger || 'Manual'}`,
      `Email: ${details.email || ''}`,
      `Phone: ${details.phone || ''}`,
      `Interest: ${details.interest || ''}`,
      `Page: ${details.page || window.location.href}`
    ].join('\n');
    return `mailto:customerservice@jonezielabs.com?subject=${encodeURIComponent('Jonezie Labs lead capture signup')}&body=${encodeURIComponent(payload)}`;
  }

  function getLeadCaptureEndpoint() {
    return LEAD_CAPTURE.endpoint;
  }

  function isLocalPreview() {
    const host = window.location.hostname || '';
    return host === '127.0.0.1' || host === 'localhost';
  }

  async function submitLeadCapture(details) {
    const endpoint = getLeadCaptureEndpoint();
    if (!endpoint) {
      return isLocalPreview()
        ? { ok: true, mode: 'local-preview' }
        : { ok: false, reason: 'missing-endpoint' };
    }

    const payload = {
      capturedAt: new Date().toISOString(),
      email: String(details.email || '').trim(),
      phone: String(details.phone || '').trim(),
      source: String(details.source || 'Site capture').trim(),
      trigger: String(details.trigger || 'Manual').trim(),
      page: String(details.page || window.location.href).trim(),
      referrer: String(document.referrer || '').trim(),
      timezone: String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').trim(),
      locale: String(navigator.language || '').trim(),
      userAgent: String(navigator.userAgent || '').trim()
    };

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        keepalive: true,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      return { ok: true, mode: 'remote' };
    } catch (error) {
      console.error('Lead capture submission failed.', error);
      return { ok: false, reason: 'network-error' };
    }
  }

  function enhanceCustomSelects(root = document) {
    if (!root?.querySelectorAll) return;
    bindCustomSelectEvents();
    root.querySelectorAll('.comparison-select-form select, .tool-form select, .lead-capture-form select').forEach((select) => {
      if (!(select instanceof HTMLSelectElement)) return;
      upsertCustomSelect(select);
    });
  }

  function upsertCustomSelect(select) {
    let shell = select.closest('.custom-select-shell');
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'custom-select-shell';
      select.parentNode?.insertBefore(shell, select);
      shell.appendChild(select);

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.innerHTML = `
        <span class="custom-select-value"></span>
        <span class="custom-select-icon" aria-hidden="true"></span>`;

      const panel = document.createElement('div');
      panel.className = 'custom-select-panel';
      panel.hidden = true;

      const list = document.createElement('div');
      list.className = 'custom-select-list';
      list.setAttribute('role', 'listbox');
      panel.appendChild(list);

      shell.appendChild(trigger);
      shell.appendChild(panel);

      trigger.addEventListener('click', () => {
        if (shell.classList.contains('is-open')) {
          closeCustomSelect(shell);
          return;
        }
        openCustomSelect(shell);
      });

      trigger.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        openCustomSelect(shell);
        focusCustomOption(shell, event.key === 'ArrowUp' ? 'last' : 'selected');
      });

      select.addEventListener('change', () => syncCustomSelectState(select));
    }

    select.classList.add('custom-select-native');
    syncCustomSelectState(select);
  }

  function syncCustomSelectState(select) {
    const shell = select.closest('.custom-select-shell');
    if (!shell) return;

    const trigger = shell.querySelector('.custom-select-trigger');
    const triggerValue = shell.querySelector('.custom-select-value');
    const panel = shell.querySelector('.custom-select-panel');
    const list = shell.querySelector('.custom-select-list');
    if (!trigger || !triggerValue || !panel || !list) return;

    const selectedOption = select.selectedOptions?.[0] || select.options[select.selectedIndex] || null;
    const fallbackOption = Array.from(select.options).find((option) => !option.disabled) || null;
    const currentOption = selectedOption || fallbackOption;
    const isPlaceholder = !select.value;

    triggerValue.textContent = currentOption?.textContent?.trim() || 'Choose an option';
    trigger.classList.toggle('is-placeholder', isPlaceholder);
    trigger.disabled = select.disabled;
    trigger.setAttribute('aria-expanded', shell.classList.contains('is-open') ? 'true' : 'false');

    list.innerHTML = Array.from(select.options).map((option) => {
      const isSelected = option.value === select.value;
      const isDisabled = option.disabled || (option.value === '' && select.required);
      return `
        <button
          type="button"
          class="custom-select-option${isSelected ? ' is-selected' : ''}${isDisabled ? ' is-disabled' : ''}"
          role="option"
          aria-selected="${isSelected ? 'true' : 'false'}"
          data-value="${escapeHtml(option.value)}"
          ${isDisabled ? 'disabled' : ''}
        >${escapeHtml(option.textContent || '')}</button>`;
    }).join('');

    list.querySelectorAll('.custom-select-option').forEach((button) => {
      button.addEventListener('click', () => {
        const nextValue = button.getAttribute('data-value') || '';
        select.value = nextValue;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        closeCustomSelect(shell);
        trigger.focus();
      });

      button.addEventListener('keydown', (event) => {
        const options = getCustomOptions(shell);
        const currentIndex = options.indexOf(button);
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          options[(currentIndex + 1) % options.length]?.focus();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          options[(currentIndex - 1 + options.length) % options.length]?.focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          options[0]?.focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          options[options.length - 1]?.focus();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeCustomSelect(shell);
          trigger.focus();
        }
      });
    });
  }

  function openCustomSelect(shell) {
    document.querySelectorAll('.custom-select-shell.is-open').forEach((node) => {
      if (node !== shell) closeCustomSelect(node);
    });
    const panel = shell.querySelector('.custom-select-panel');
    const trigger = shell.querySelector('.custom-select-trigger');
    if (!panel || !trigger) return;
    shell.classList.add('is-open');
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeCustomSelect(shell) {
    const panel = shell.querySelector('.custom-select-panel');
    const trigger = shell.querySelector('.custom-select-trigger');
    if (!panel || !trigger) return;
    shell.classList.remove('is-open');
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function focusCustomOption(shell, mode = 'selected') {
    const options = getCustomOptions(shell);
    if (!options.length) return;
    if (mode === 'last') {
      options[options.length - 1].focus();
      return;
    }
    const selected = shell.querySelector('.custom-select-option.is-selected:not(:disabled)');
    (selected || options[0]).focus();
  }

  function getCustomOptions(shell) {
    return Array.from(shell.querySelectorAll('.custom-select-option:not(:disabled)'));
  }

  function bindCustomSelectEvents() {
    if (document.body.dataset.customSelectBound === 'true') return;
    document.body.dataset.customSelectBound = 'true';

    document.addEventListener('click', (event) => {
      document.querySelectorAll('.custom-select-shell.is-open').forEach((shell) => {
        if (!shell.contains(event.target)) closeCustomSelect(shell);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.custom-select-shell.is-open').forEach((shell) => closeCustomSelect(shell));
    });
  }

  function initShellMenus() {
    const menuToggle = document.querySelector('.menu-toggle');
    const siteNav = document.querySelector('.site-nav');
    if (menuToggle && siteNav && !menuToggle.dataset.menuBound) {
      menuToggle.dataset.menuBound = 'true';
      menuToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
      });

      siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          siteNav.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    const menus = document.querySelectorAll('[data-brand-menu]');
    if (!menus.length) return;

    const closeMenu = (menu) => {
      const trigger = menu.querySelector('.brand-menu-trigger');
      const panel = menu.querySelector('.brand-menu-panel');
      if (!trigger || !panel) return;
      trigger.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    };

    menus.forEach((menu) => {
      const trigger = menu.querySelector('.brand-menu-trigger');
      const panel = menu.querySelector('.brand-menu-panel');
      if (!trigger || !panel || trigger.dataset.menuBound) return;
      trigger.dataset.menuBound = 'true';

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        menus.forEach((candidate) => closeMenu(candidate));
        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      });

      panel.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMenu(menu));
      });
    });

    document.addEventListener('click', (event) => {
      menus.forEach((menu) => {
        if (!menu.contains(event.target)) closeMenu(menu);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      menus.forEach((menu) => closeMenu(menu));
    });
  }

  return {
    SITE_ORIGIN,
    RESOURCE_DOWNLOAD,
    RUO_COPY,
    TOOL_LIBRARY,
    GUIDE_LIBRARY,
    escapeHtml,
    slugify,
    parsePrice,
    formatMoney,
    getSiteOrigin,
    getAbsoluteUrl,
    getCatalogProducts,
    getProductMap,
    getProductBySlug,
    getProductUrl,
    getProductCanonicalUrl,
    getProductPageTitle,
    getProductMetaDescription,
    getComparisonUrl,
    getGuideForCategory,
    getGuideForProduct,
    getGuideUrl,
    getGuideUrlForProduct,
    getGuideProductList,
    getToolsUrl,
    getStorageProfile,
    getMixingProfile,
    getProductForm,
    getProductCompoundClass,
    getProductStructureNote,
    getProductResearchContext,
    getProductHandlingNote,
    getProductComparisonSummary,
    getRelatedToolSet,
    getProductInfoProfile,
    getOptionStrengthList,
    getStartingPrice,
    getRelatedProducts,
    isComparisonEligible,
    areProductsComparable,
    getComparisonThemeLabel,
    getComparisonCandidates,
    getComparisonPairs,
    getProductFaqs,
    getComparisonFaqs,
    getLeadCaptureEndpoint,
    submitLeadCapture,
    getLeadMagnetMailto,
    enhanceCustomSelects,
    initShellMenus
  };
})();
