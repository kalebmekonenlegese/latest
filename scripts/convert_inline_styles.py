#!/usr/bin/env python3
from pathlib import Path
import re
import hashlib

root = Path('.')
html_files = sorted(root.glob('*.html'))
css_file = Path('assets/css/styles.css')
marker_start = '/* INLINE STYLE CONVERSIONS START */'
marker_end = '/* INLINE STYLE CONVERSIONS END */'

# Load existing CSS conversions block
existing_block = ''
if css_file.exists():
    css_text = css_file.read_text('utf-8', errors='replace')
    if marker_start in css_text and marker_end in css_text:
        existing_block = css_text.split(marker_start)[1].split(marker_end)[0]
else:
    css_text = ''

style_to_class = {}
if existing_block:
    # parse existing class names to avoid duplicates
    for m in re.finditer(r"\.(inl-[0-9a-f]+)\s*\{([^}]*)\}", existing_block):
        cls = m.group(1)
        decl = m.group(2).strip()
        # store normalized decl
        key = re.sub(r'\s+', ' ', decl.replace('\n',' ').strip())
        style_to_class[key] = cls

new_css_rules = []
report = []

for p in html_files:
    text = p.read_text('utf-8', errors='replace')
    modified = False

    # handle double-quoted and single-quoted style attributes
    def replace_style_attr(m):
        nonlocal modified
        before = m.group(0)
        tag_open = m.group(1)
        style_val = m.group(2).strip()
        # normalize declarations
        decls = [d.strip() for d in style_val.split(';') if d.strip()]
        normalized = '; '.join(decls)
        key = normalized
        # check existing mapping
        cls = style_to_class.get(key)
        if not cls:
            h = hashlib.sha1(normalized.encode('utf-8')).hexdigest()[:8]
            cls = f'inl-{h}'
            style_to_class[key] = cls
            # build CSS declaration block
            css_decl = '  ' + ';
  '.join(decls) + ';\n'
            new_css_rules.append((cls, css_decl))
        # inject class into tag_open
        if 'class=' in tag_open:
            # append to existing class attribute
            def append_class(cm):
                whole = cm.group(0)
                quote = cm.group(1)
                val = cm.group(2)
                newval = (val + ' ' + cls).strip()
                return f'class={quote}{newval}{quote}'
            tag_open_new = re.sub(r'class=("|\')([^\"\']*)(\1)', append_class, tag_open)
        else:
            tag_open_new = tag_open + f' class="{cls}"'
        modified = True
        report.append((p.name, style_val, cls))
        return tag_open_new

    # replace patterns like <tag ... style="..." ...>
    pattern = re.compile(r'(<[a-zA-Z0-9\-]+\b[^>]*?)\sstyle=(?:"([^"]*)"|\'([^\']*)\')', re.I)

    def repl(m):
        # m.group(2) or m.group(3) contains value
        tag = m.group(1)
        style_val = m.group(2) if m.group(2) is not None else m.group(3)
        # use inner function to reuse logic
        return replace_style_attr(re.Match(m.re, m.string, m.pos, m.endpos)) if False else None

    # Because building a Match object manually is complex, perform two passes
    # Double-quoted
    def rep_double(m):
        tag = m.group(1)
        style_val = m.group(2)
        # normalize
        decls = [d.strip() for d in style_val.split(';') if d.strip()]
        normalized = '; '.join(decls)
        key = normalized
        cls = style_to_class.get(key)
        if not cls:
            h = hashlib.sha1(normalized.encode('utf-8')).hexdigest()[:8]
            cls = f'inl-{h}'
            style_to_class[key] = cls
            css_decl = '  ' + ';
  '.join(decls) + ';\n'
            new_css_rules.append((cls, css_decl))
        # inject class
        if re.search(r'\bclass\s*=\s*(["\'])(.*?)\1', tag, re.I):
            tag = re.sub(r'(\bclass\s*=\s*)(["\'])(.*?)\2', lambda mm: f"{mm.group(1)}{mm.group(2)}{mm.group(3)} {cls}{mm.group(2)}", tag)
        else:
            tag = tag + f' class="{cls}"'
        report.append((p.name, style_val, cls))
        return tag

    # single-quoted
    def rep_single(m):
        tag = m.group(1)
        style_val = m.group(2)
        decls = [d.strip() for d in style_val.split(';') if d.strip()]
        normalized = '; '.join(decls)
        key = normalized
        cls = style_to_class.get(key)
        if not cls:
            h = hashlib.sha1(normalized.encode('utf-8')).hexdigest()[:8]
            cls = f'inl-{h}'
            style_to_class[key] = cls
            css_decl = '  ' + ';
  '.join(decls) + ';\n'
            new_css_rules.append((cls, css_decl))
        if re.search(r"\bclass\s*=\s*([\"|'])(.*?)\1", tag, re.I):
            tag = re.sub(r'(\bclass\s*=\s*)([\"\'])(.*?)\2', lambda mm: f"{mm.group(1)}{mm.group(2)}{mm.group(3)} {cls}{mm.group(2)}", tag)
        else:
            tag = tag + f" class='{cls}'"
        report.append((p.name, style_val, cls))
        return tag

    # apply replacements
    text2 = re.sub(r'(<[a-zA-Z0-9\-]+\b[^>]*?)\sstyle=\"([^\"]*)\"', rep_double, text)
    text2 = re.sub(r"(<[a-zA-Z0-9\-]+\b[^>]*?)\sstyle='([^']*)'", rep_single, text2)

    if text2 != text:
        p.write_text(text2, encoding='utf-8')
        print(f'Updated {p.name}')

# Append new CSS rules
if new_css_rules:
    block_lines = [marker_start, '\n']
    for cls, decl in new_css_rules:
        block_lines.append(f'.{cls} {\n{decl}}\n')
    block_lines.append('\n' + marker_end + '\n')
    # append to css_text safely
    if marker_start in css_text and marker_end in css_text:
        before, rest = css_text.split(marker_start, 1)
        _, after = rest.split(marker_end, 1)
        new_css = before + '\n'.join(block_lines) + after
    else:
        new_css = css_text + '\n\n' + '\n'.join(block_lines)
    css_file.write_text(new_css, encoding='utf-8')
    print(f'Appended {len(new_css_rules)} CSS rules to {css_file}')

# Write report file
report_file = Path('scripts/inline_style_report.csv')
with report_file.open('w', encoding='utf-8') as f:
    f.write('file,style,generated_class\n')
    for row in report:
        f.write('"%s","%s","%s"\n' % (row[0], row[1].replace('"','""'), row[2]))

print('Report written to', report_file)
