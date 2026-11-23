#!/usr/bin/env python3
"""Build crawlable COA pages from verified current records and preserved older reports."""
from __future__ import annotations

import json
from datetime import date
from html import escape as e
from pathlib import Path

import quickjs

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.jonezielabs.com'
REV = '20261123coa1'


def load_records():
    ctx = quickjs.Context()
    ctx.eval('var window = {};')
    ctx.eval((ROOT / 'coa-data.js').read_text(encoding='utf-8'))
    current = json.loads(ctx.eval('JSON.stringify(window.JONEZIE_COA_RECORDS)'))
    archive = json.loads((ROOT / 'coa-archive.json').read_text(encoding='utf-8'))
    return current, archive


def href(record):
    return 'coa/' + record['id'].lower() + '.html'


def pretty(value):
    return date.fromisoformat(value).strftime('%b %d, %Y').replace(' 0', ' ')


def scope(record):
    strengths = ', '.join(record['coveredStrengths'])
    return (f"The laboratory tested a {record['sampleStrength']} sample. Jonezie identifies lot "
            f"{record['lot']} as supplying these listed strengths: {strengths}. "
            f"The {record['contentMg']}mg content result belongs to the tested sample; "
            "it is not a separate measured result for every strength. Match the lot to your vial.")


def product_summary(slug):
    current, archive = load_records()
    records = [r for r in current if r['slug'] == slug]
    older = [r for r in archive if r['slug'] == slug]
    if not records and not older:
        return ''
    entries = []
    for r in records:
        entries.append(f'''<article class="batch-coa-record"><p class="batch-coa-eyebrow">{e(r['laboratory'])} · {e(r['id'])}</p>
<h3>{e(r['compound'])} certificate of analysis</h3>
<p>Lot {e(r['lot'])} · Analyzed {pretty(r['analyzed'])}</p>
<dl class="batch-coa-metadata"><div><dt>Chromatographic purity · {e(r['method'])}</dt><dd>{e(r['purityPercent'])}%</dd></div>
<div><dt>Content of tested {e(r['sampleStrength'])} vial</dt><dd>{e(r['contentMg'])}mg</dd></div></dl>
<p class="batch-coa-sample-note">{e(scope(r))}</p>
<p><a href="{href(r)}">Read the full batch record</a> · <a href="{e(r['reportUrl'])}">Original laboratory COA</a></p></article>''')
    if older:
        entries.append('<div class="batch-coa-archive-links"><h3>Previous reports</h3><p>Earlier testing records are retained with their original sample and batch information.</p>' + ''.join(
            f'<p><a href="{href(r)}">{e(r["compound"])} · {pretty(r["analyzed"])} · Batch {e(r["lot"])}</a></p>' for r in older) + '</div>')
    return '<section id="batch-records" class="section-shell batch-coa" ' + ('data-coa-static ' if records else 'data-coa-archive-static ') + 'aria-label="Certificates of analysis"><div class="batch-coa-heading"><h2>Lab results &amp; COAs</h2></div>' + ''.join(entries) + '<p><a href="lab-results.html">Explore the COA library</a></p></section>'


def layout(title, description, path, body, schema):
    canonical = ORIGIN + '/' + path
    # The root base URL keeps shared assets usable from /coa/. Anchor links
    # must still name their own page, otherwise they navigate to the homepage.
    body = body.replace('href="#', f'href="{path}#')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><base href="/">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(description, quote=True)}">
<link rel="canonical" href="{canonical}"><meta property="og:type" content="website">
<meta property="og:title" content="{e(title, quote=True)}"><meta property="og:description" content="{e(description, quote=True)}"><meta property="og:url" content="{canonical}">
<link rel="icon" href="favicon.ico"><link rel="stylesheet" href="coa-library.css?v={REV}">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False).replace('<', chr(92)+'u003c')}</script>
</head><body>
<a class="skip" href="{path}#main">Skip to results</a>
<header class="lab-nav"><a href="index.html" aria-label="Jonezie Labs home"><img src="jonezie-wordmark-black.webp" alt="Jonezie Labs" width="260" height="86"></a><nav aria-label="Main navigation"><a href="catalog.html">Products</a><a href="lab-results.html" aria-current="{'page' if path == 'lab-results.html' else 'false'}">Lab results</a><a href="checkout.html">Cart</a></nav></header>
<main id="main" class="lab-main">{body}</main>
<footer class="lab-footer"><img src="jonezie-wordmark-white.webp" width="240" height="80" alt="Jonezie Labs"><div><a href="catalog.html">Browse products</a><a href="lab-results.html">Lab Results &amp; COAs</a><a href="mailto:customerservice@jonezielabs.com">Ask about a report</a><a href="terms.html">Policies</a></div><p>For laboratory research use only. Not for human or veterinary use.</p><p>© 2026 Jonezie Labs LLC</p></footer>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ERM41ES983"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-ERM41ES983');</script>
<script src="analytics-events.js?v=20261107b"></script>
<script src="coa-library.js?v={REV}" defer></script></body></html>
'''


def record_card(r, previous=False):
    badge = 'Previous report' if previous else 'Published batch record'
    lab = 'Janoshik' if previous else r['laboratory']
    search = ' '.join(str(r.get(k, '')) for k in ('slug', 'compound', 'id', 'lot', 'sampleStrength', 'task', 'analyzed')) + ' ' + lab
    search += ' ' + ' '.join(r.get('coveredStrengths', []))
    metric = (f'<strong>{e(r["purityPercent"])}<span>%</span></strong><span>HPLC peak-area purity · tested {e(r["sampleStrength"])} sample</span>' if not previous else
              f'<strong class="archive-date">{pretty(r["analyzed"])}</strong><span>Original report image preserved</span>')
    return f'''<article class="lab-card" data-record data-kind="{'previous' if previous else 'batch'}" data-search="{e(search, quote=True)}"><div class="card-top"><span class="tag {'previous' if previous else ''}">{badge}</span><span>{e(lab)}</span></div>
<h3><a href="{href(r)}">{e(r['compound'])}</a></h3><p class="sample">{'Reported sample' if previous else 'Tested sample'} · {e(r['sampleStrength'])}</p>
<div class="card-metric">{metric}</div><dl><div><dt>Batch / lot</dt><dd>{e(r['lot'])}</dd></div><div><dt>{'Task' if previous else 'Certificate'}</dt><dd>{e(r.get('task', r['id']))}</dd></div>{'' if previous else '<div><dt>Analyzed</dt><dd>'+pretty(r['analyzed'])+'</dd></div>'}</dl>
<a class="card-link" href="{href(r)}">{'View previous report' if previous else 'Explore batch record'}</a></article>'''


def write_hub(current, archive):
    title = 'Lab Results & COAs | Jonezie Labs'
    description = 'Find Jonezie Labs certificates of analysis by product, lot or report number. Read KMD Analytical batch results and browse previous Janoshik reports.'
    body = f'''<section class="lab-hero"><p class="eyebrow">Jonezie Labs · Testing library</p><h1>Every report.<br><em>A clearer picture.</em></h1><p>Explore the results behind the label. Find your product, match the lot, and read the original laboratory report.</p><div class="hero-stats"><span><strong>{len(current)}</strong> batch records</span><span><strong>{len(archive)}</strong> previous reports</span><a href="#reading-results">How to read a COA</a></div></section>
<section class="library" aria-labelledby="library-title"><div class="library-heading"><div><p class="eyebrow">Find your report</p><h2 id="library-title">The testing library</h2></div><p>Original documents. Traceable results.</p></div>
<form class="lab-filters" role="search" data-coa-search><label>Product, lot or report number<input type="search" name="q" autocomplete="off" placeholder="Search the testing library"></label><label>Report collection<select name="collection"><option value="all">All reports</option><option value="batch">Published batch records</option><option value="previous">Previous reports</option></select></label><button type="reset">Clear filters</button></form>
<p class="result-count" role="status" aria-live="polite" data-result-count>{len(current) + len(archive)} reports</p><p class="no-results" data-no-results hidden>No matching reports. Try a product name or a shorter lot number.</p>
<section data-collection="batch" aria-labelledby="batch-title"><div class="collection-title"><h2 id="batch-title">Published batch records</h2><p>Results for the submitted sample. Listed strength coverage is identified by Jonezie.</p></div><div class="lab-grid">{''.join(record_card(r) for r in sorted(current, key=lambda r:r['compound'].lower()))}</div></section>
<section id="previous-reports" data-collection="previous" aria-labelledby="previous-title"><div class="collection-title"><h2 id="previous-title">Previous reports</h2><p>Our earlier testing documents, preserved with their original dates and sample details. These reports do not establish the results of a newer lot.</p></div><div class="lab-grid">{''.join(record_card(r, True) for r in sorted(archive, key=lambda r:r['compound'].lower()))}</div></section></section>
<section id="reading-results" class="reading"><p class="eyebrow">A little context goes a long way</p><h2>Read the result.<br><em>Know what it measures.</em></h2><div class="reading-grid"><article><h3>Match the lot first</h3><p>A certificate describes a submitted sample and its identified batch. Check your vial’s lot and the report’s sample strength before comparing results.</p></article><article><h3>Purity and content differ</h3><p>Chromatographic purity is a peak-area percentage. Content reports the measured quantity in the tested vial. A high purity percentage does not mean that every strength was tested separately.</p></article><article><h3>Read the original</h3><p>Each record links to its source. The original document contains the laboratory’s methods, specifications and scope. These KMD certificates do not report sterility or endotoxin testing.</p></article></div></section>'''
    schema = {'@context':'https://schema.org', '@type':'CollectionPage', 'name':title, 'description':description, 'url':ORIGIN+'/lab-results.html', 'mainEntity':{'@type':'ItemList','numberOfItems':len(current)+len(archive),'itemListElement':[{'@type':'ListItem','position':i+1,'name':r['compound']+' COA · '+r['id'],'url':ORIGIN+'/'+href(r)} for i,r in enumerate(current+archive)]}}
    (ROOT/'lab-results.html').write_text(layout(title, description, 'lab-results.html', body, schema), encoding='utf-8', newline='\n')


def write_record(r, previous=False):
    lab = 'Janoshik' if previous else r['laboratory']
    title = f"{r['compound']} COA · {r['lot']} | Jonezie Labs"
    description = f"{'Previous ' if previous else ''}{lab} certificate for {r['compound']}, batch {r['lot']}. Reported sample: {r['sampleStrength']}. Analyzed {pretty(r['analyzed'])}. Read the original report."
    label = 'Previous report' if previous else 'Published batch record'
    facts = [('Laboratory',lab), ('Batch / lot',r['lot']), ('Reported sample' if previous else 'Tested sample',r['sampleStrength']), ('Analysis date',pretty(r['analyzed']))]
    if previous:
        facts.append(('Laboratory task', '#'+r['task']))
        details = f'''<div class="scope-note"><strong>Earlier testing record</strong><p>This report describes its original sample and batch. It does not establish results for newer lots or other strengths. {e(r.get('note', ''))}</p></div>
<section class="original-image"><h2>The original report</h2><p>The complete document retains the reported results, date, batch, task number and verification key.</p><a class="lab-button" href="{e(r['image'])}" target="_blank" rel="noopener">Open full-size report</a><img src="{e(r['image'])}" alt="{e(r['compound'])} Janoshik test report, task {e(r['task'])}, batch {e(r['lot'])}, analyzed {pretty(r['analyzed'])}" width="1024" height="1536" loading="lazy"></section>'''
    else:
        facts += [('Method',r['method']), ('Received',pretty(r['received'])), ('Issued',pretty(r['issued'])), ('Certificate',r['id'])]
        pdf = f'<a class="lab-button secondary" href="{e(r["pdfUrl"])}" download>Download original PDF</a>' if r.get('pdfUrl') else ''
        rows = ''.join(f'<tr><th scope="row">{e(row["test"])}</th><td>{e(row["specification"])}</td><td>{e(row["result"])}</td><td>{e(row["status"])}</td></tr>' for row in r['results'])
        details = f'''<div class="report-metrics"><div><span>Chromatographic purity</span><strong>{e(r['purityPercent'])}%</strong><span>{e(r['method'])} · tested {e(r['sampleStrength'])} sample</span></div><div><span>Content of tested vial</span><strong>{e(r['contentMg'])}<small>mg</small></strong><span>{e(r['sampleStrength'])} label claim · {e(r['percentOfClaim'])}% of claim</span></div></div>
<div class="scope-note"><strong>The sample behind the numbers</strong><p>{e(scope(r))}</p></div>
<section class="assay-section"><h2>What the laboratory reported</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Laboratory test results"><table><thead><tr><th scope="col">Test</th><th scope="col">Specification</th><th scope="col">Result</th><th scope="col">Status</th></tr></thead><tbody>{rows}</tbody></table></div><p>Identity: {e(r['identity'])}. Retention time: {e(r['retentionMinutes'])} minutes. {e(r['overall'])}.</p><p>Purity is chromatographic peak area; it is separate from measured content per vial. This certificate does not report sterility or endotoxin results.</p></section>
<section class="report-source"><p class="eyebrow">From the issuing laboratory</p><h2>The complete certificate</h2><p>Read the original results, chromatogram, sample photograph and laboratory notes at KMD Analytical.</p><div class="report-actions"><a class="lab-button" href="{e(r['reportUrl'])}" target="_blank" rel="noopener noreferrer">View original laboratory COA</a>{pdf}</div></section>'''
    back_product = f'<a href="products/{e(r["slug"])}.html">View {e(r["compound"])} product</a>' if r['slug'] and (ROOT/'products'/f'{r["slug"]}.html').exists() else ''
    body = f'''<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="lab-results.html">Lab results</a><span>/</span><span>{e(r['compound'])}</span></nav>
<section class="report-hero"><span class="tag {'previous' if previous else ''}">{label}</span><h1>{e(r['compound'])}<br><em>Certificate of analysis.</em></h1><p>Batch {e(r['lot'])} · {e(lab)} · {pretty(r['analyzed'])}</p></section>
<article class="report-body"><dl class="report-facts">{''.join('<div><dt>'+e(k)+'</dt><dd>'+e(v)+'</dd></div>' for k,v in facts)}</dl>{details}</article>
<nav class="report-bottom" aria-label="Related records">{back_product}<a href="lab-results.html?product={e(r['slug'])}">More reports for this product</a><a href="lab-results.html">All lab results &amp; COAs</a></nav>'''
    schema = {'@context':'https://schema.org','@graph':[{'@type':'WebPage','name':title,'description':description,'url':ORIGIN+'/'+href(r),'mainEntity':{'@type':'CreativeWork','name':r['compound']+' certificate of analysis','identifier':r['id'],'creator':{'@type':'Organization','name':lab},'dateCreated':r['analyzed'],'about':{'@type':'Thing','name':r['compound']},'isBasedOn':ORIGIN+'/'+r['image'] if previous else r['reportUrl']}},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':'Lab Results & COAs','item':ORIGIN+'/lab-results.html'},{'@type':'ListItem','position':3,'name':r['compound']+' COA','item':ORIGIN+'/'+href(r)}]}]}
    path = ROOT/href(r)
    path.parent.mkdir(exist_ok=True)
    path.write_text(layout(title, description, href(r), body, schema), encoding='utf-8', newline='\n')


def main():
    current, archive = load_records()
    write_hub(current, archive)
    for r in current:
        write_record(r)
    for r in archive:
        write_record(r, True)
    print(f'Built COA library, {len(current)} batch records and {len(archive)} previous reports.')


if __name__ == '__main__':
    main()
