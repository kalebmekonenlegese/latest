import pathlib
import re
from hashlib import md5

root = pathlib.Path('.')
htmls = sorted(root.glob('*.html'))

NAV_CHECKS = [
    'topbar', 'primary-navigation', 'offering-bar', 'footer-bottom',
    'footer-links', 'language-list', 'main-header', 'site-footer'
]

broken_links = []
page_reports = []
internal_targets = set()

for path in htmls:
    text = path.read_text(encoding='utf-8')
    report = {'page': path.name, 'href_count': 0, 'internal_links': [], 'has_active': False}
    for pat in NAV_CHECKS:
        report[pat] = bool(re.search(re.escape(pat), text, re.IGNORECASE))
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', text)
    report['href_count'] = len(hrefs)
    for href in hrefs:
        if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
            continue
        if href.startswith('#'):
            continue
        if href.startswith('/'): 
            href = href.lstrip('/')
        href = href.split('#', 1)[0]
        href = href.split('?', 1)[0]
        if not href:
            continue
        if href.startswith('assets/') or href.startswith('data:'):
            continue
        internal_targets.add(href)
        report['internal_links'].append(href)
        target = root / href
        if not target.exists():
            broken_links.append((path.name, href))
    report['has_active'] = 'class="active"' in text or "class='active'" in text
    page_reports.append(report)

all_pages = [p.name for p in htmls]
orphan_pages = [p for p in all_pages if p not in internal_targets and p != 'index.html']

headers = {}
footers = {}
for path in htmls:
    lines = path.read_text(encoding='utf-8').splitlines()
    header = '\n'.join(lines[:60])
    footer = '\n'.join(lines[-60:])
    headers[path.name] = md5(header.encode('utf-8')).hexdigest()
    footers[path.name] = md5(footer.encode('utf-8')).hexdigest()

print(f'TOTAL_PAGES: {len(htmls)}')
print('PAGE_SUMMARY')
for report in page_reports:
    print(f"{report['page']} hrefs={report['href_count']} active={report['has_active']} navs=" + ",".join([k for k in NAV_CHECKS if report[k]]))
print(f'HEADER_VARIANTS: {len(set(headers.values()))}')
print(f'FOOTER_VARIANTS: {len(set(footers.values()))}')
print('BROKEN_LINKS_COUNT:', len(broken_links))
for page, target in broken_links:
    print('BROKEN', page, '->', target)
print('ORPHAN_PAGES:', orphan_pages)
print('ALL_INTERNAL_TARGETS_COUNT:', len(sorted(internal_targets)))
