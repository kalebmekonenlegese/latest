import pathlib
import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

root = pathlib.Path(__file__).resolve().parent.parent
html_files = sorted(root.glob('*.html'))

IMG_TAG_RE = re.compile(r'<img([^>]*?)>', re.IGNORECASE)
ATTR_RE = re.compile(r'([^\s"\'=<>`]+)(?:\s*=\s*"([^"]*)")?')

# Standard responsive widths for images
RESPONSIVE_WIDTHS = [320, 480, 640, 900, 1200, 1600]


def parse_attrs(text):
    attrs = {}
    for match in ATTR_RE.finditer(text):
        name = match.group(1)
        value = match.group(2)
        if value is None:
            value = ''
        attrs[name] = value
    return attrs


def build_src(url, fmt=None, width=None, quality=None):
    parsed = urlsplit(url)
    params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    params['auto'] = 'format'
    if fmt:
        params['fm'] = fmt
    else:
        params.pop('fm', None)
    if width is not None:
        params['w'] = str(width)
    if quality is not None:
        params['q'] = str(quality)
    query = urlencode(params, doseq=True)
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, query, parsed.fragment))


def image_sizes(width):
    if width is None:
        return '100vw'
    try:
        width_val = int(width)
    except ValueError:
        return '100vw'
    if width_val <= 120:
        return f'{width_val}px'
    if width_val <= 480:
        return f'(max-width: 640px) 100vw, {width_val}px'
    if width_val <= 900:
        return f'(max-width: 900px) 100vw, {width_val}px'
    return '100vw'


def make_srcset(url, fmt, max_width):
    widths = [w for w in RESPONSIVE_WIDTHS if w <= max_width]
    if not widths:
        widths = [max_width]
    return ', '.join(f'{build_src(url, fmt=fmt, width=w, quality=80)} {w}w' for w in widths)


def replace_img_tag(match):
    attrs_text = match.group(1)
    attrs = parse_attrs(attrs_text)
    src = attrs.get('src', '')
    if 'images.unsplash.com' not in src:
        return match.group(0)
    width = attrs.get('width')
    height = attrs.get('height')
    loading = attrs.get('loading', 'lazy')
    if loading == '':
        loading = 'lazy'
    decoding = attrs.get('decoding', 'async')
    fetchpriority = attrs.get('fetchpriority')
    alt = attrs.get('alt', '')
    cls = attrs.get('class', '')
    extra_attrs = []
    for key, value in attrs.items():
        if key in {'src', 'width', 'height', 'alt', 'loading', 'decoding', 'fetchpriority'}:
            continue
        if value == '':
            extra_attrs.append(key)
        else:
            extra_attrs.append(f'{key}="{value}"')
    try:
        int_width = int(width) if width else 1600
    except ValueError:
        int_width = 1600
    sizes = image_sizes(width)
    avif_srcset = make_srcset(src, 'avif', int_width)
    webp_srcset = make_srcset(src, 'webp', int_width)
    fallback_src = build_src(src, fmt=None, width=int_width, quality=80)
    classes = cls.split() if cls else []
    if 'image-skeleton' not in classes:
        classes.append('image-skeleton')
    img_class_attr = ' '.join(c for c in classes if c)
    img_attrs = [f'src="{fallback_src}"']
    if img_class_attr:
        img_attrs.append(f'class="{img_class_attr}"')
    if alt:
        img_attrs.append(f'alt="{alt}"')
    if width:
        img_attrs.append(f'width="{width}"')
    if height:
        img_attrs.append(f'height="{height}"')
    if loading:
        img_attrs.append(f'loading="{loading}"')
    if decoding:
        img_attrs.append(f'decoding="{decoding}"')
    if fetchpriority:
        img_attrs.append(f'fetchpriority="{fetchpriority}"')
    if extra_attrs:
        img_attrs.extend(extra_attrs)
    img_attr_text = ' '.join(img_attrs)
    picture = (
        f'<picture>\n'
        f'  <source type="image/avif" srcset="{avif_srcset}" sizes="{sizes}">\n'
        f'  <source type="image/webp" srcset="{webp_srcset}" sizes="{sizes}">\n'
        f'  <img {img_attr_text}>\n'
        f'</picture>'
    )
    return picture


def add_preload_links(html):
    if 'fetchpriority="high"' not in html and 'fetchpriority=high' not in html:
        return html
    hero_img_match = re.search(r'<img[^>]*fetchpriority="high"[^>]*src="([^"]+)"', html)
    if not hero_img_match:
        hero_img_match = re.search(r'<img[^>]*fetchpriority=high[^>]*src="([^"]+)"', html)
    if not hero_img_match:
        return html
    hero_src = hero_img_match.group(1)
    preload_href = build_src(hero_src, fmt='webp', width=1600, quality=80)
    imagesrcset = make_srcset(hero_src, 'webp', 1600)
    preload_tag = f'<link rel="preload" as="image" href="{preload_href}" imagesrcset="{imagesrcset}" imagesizes="100vw">'
    if preload_tag in html:
        return html
    insert_after = re.search(r'(<link rel="preconnect" href="https://images\.unsplash\.com"[^>]*>)', html)
    if insert_after:
        position = insert_after.end(1)
        html = html[:position] + '\n  ' + preload_tag + html[position:]
        return html
    insert_after = re.search(r'(<script src="https://cdn\.lordicon\.com/lordicon\.js"[^>]*></script>)', html)
    if insert_after:
        position = insert_after.end(1)
        html = html[:position] + '\n  ' + preload_tag + html[position:]
        return html
    head_close = html.find('</head>')
    if head_close != -1:
        html = html[:head_close] + '  ' + preload_tag + '\n' + html[head_close:]
    return html


def upgrade_page(path):
    html = path.read_text(encoding='utf-8')
    original = html
    html = html.replace('assets/css/styles.css', 'assets/css/styles.min.css')
    html = html.replace('assets/js/app.js', 'assets/js/app.min.js')
    html = add_preload_links(html)
    def replace_img_tag_wrapper(match):
        pos = match.start()
        picture_open = html.rfind('<picture', 0, pos)
        picture_close = html.rfind('</picture', 0, pos)
        if picture_open != -1 and picture_open > picture_close:
            return match.group(0)
        return replace_img_tag(match)
    html = IMG_TAG_RE.sub(replace_img_tag_wrapper, html)
    if html != original:
        path.write_text(html, encoding='utf-8')
        print(f'Updated {path.name}')


if __name__ == '__main__':
    for html_file in html_files:
        upgrade_page(html_file)
