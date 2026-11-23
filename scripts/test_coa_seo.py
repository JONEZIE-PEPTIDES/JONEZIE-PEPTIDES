"""Verify source documents, static crawlability, and report-to-product scope."""
import json
import subprocess
import unittest
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urlsplit
from xml.etree import ElementTree

from generate_coa_pages import ROOT, ORIGIN, load_records, href


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class CoaSeoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.current, cls.archive = load_records()

    def test_each_report_is_crawlable_unique_and_in_the_sitemap(self):
        sitemap = ElementTree.parse(ROOT / 'sitemap.xml')
        urls = {n.text for n in sitemap.findall('.//{*}loc')}
        titles = set()
        for r in self.current + self.archive:
            with self.subTest(report=r['id']):
                text = (ROOT / href(r)).read_text(encoding='utf-8')
                doc = Document(text)
                canonicals = [a['href'] for t,a in doc.tags if t == 'link' and a.get('rel') == 'canonical']
                self.assertEqual(canonicals, [ORIGIN + '/' + href(r)])
                self.assertIn(canonicals[0], urls)
                self.assertEqual(sum(t == 'h1' for t,_ in doc.tags), 1)
                self.assertIn(unescape(r['lot']), unescape(text))
                self.assertIn(r['sampleStrength'], unescape(text))
                title = text.split('<title>',1)[1].split('</title>',1)[0]
                self.assertNotIn(title,titles)
                titles.add(title)
                json.loads(text.split('<script type="application/ld+json">',1)[1].split('</script>',1)[0])
        self.assertIn(ORIGIN+'/lab-results.html', urls)

    def test_current_assays_are_present_without_javascript(self):
        for r in self.current:
            with self.subTest(report=r['id']):
                record = unescape((ROOT / href(r)).read_text(encoding='utf-8'))
                product = unescape((ROOT / 'products' / (r['slug']+'.html')).read_text(encoding='utf-8'))
                for value in [r['lot'],r['id'],r['purityPercent']+'%',r['contentMg']+'mg',r['reportUrl']]:
                    self.assertIn(value, record)
                    self.assertIn(value, product)
                for row in r['results']:
                    self.assertIn(row['result'], record)
                self.assertIn('not a separate measured result for every strength', record)
                self.assertIn('data-coa-static', product)

    def test_every_older_image_is_unchanged_and_still_linked(self):
        self.assertEqual({r['image'] for r in self.archive}, {p.name for p in ROOT.glob('coa-*.png')})
        for r in self.archive:
            with self.subTest(report=r['id']):
                image = ROOT / r['image']
                original = subprocess.check_output(['git','show','HEAD:'+r['image']],cwd=ROOT)
                self.assertEqual(image.read_bytes(),original)
                html = (ROOT / href(r)).read_text(encoding='utf-8')
                self.assertIn('Previous report',html)
                self.assertIn('src="'+r['image']+'"',html)
                self.assertIn('does not establish results for newer lots',html)
                self.assertNotIn('coveredStrengths',r)

    def test_local_links_and_assets_resolve_and_anchors_do_not_go_home(self):
        pages = [ROOT / 'lab-results.html'] + list((ROOT / 'coa').glob('*.html'))
        for page in pages:
            text = page.read_text(encoding='utf-8')
            for tag,attrs in Document(text).tags:
                value = attrs.get('href') if tag in ('a','link') else attrs.get('src')
                if not value or value == '/':
                    continue
                url = urlsplit(value)
                if url.scheme or url.netloc:
                    continue
                self.assertFalse(value.startswith('#'), (page.name,value))
                target = ROOT / url.path.lstrip('/')
                self.assertTrue(target.exists(),(page.name,value))

    def test_different_forms_and_blends_do_not_borrow_single_compound_reports(self):
        cjc = next(r for r in self.archive if r['image']=='coa-cjc-1295.png')
        self.assertEqual(cjc['compound'],'CJC-1295 DAC')
        self.assertEqual(cjc['slug'],'')
        for file in ['site-library.js','product-page.js']:
            text = (ROOT / file).read_text(encoding='utf-8')
            for wrong in ["'cjc-1295-without-dac': 'coa-cjc", "'cagrilintide-5mg-plus-semaglutide-5mg': 'coa-cagrilintide"]:
                self.assertNotIn(wrong,text)


if __name__ == '__main__':
    unittest.main()
