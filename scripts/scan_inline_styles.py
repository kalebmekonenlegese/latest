from pathlib import Path
import re
root = Path('.')
html_files = sorted(root.glob('*.html'))
results = []
for p in html_files:
    text = p.read_text('utf-8', errors='replace')
    style_attrs = len(re.findall(r"\bstyle\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)", text, re.I))
    style_blocks = len(re.findall(r"<style\b[^>]*>", text, re.I))
    inline_scripts = len([m for m in re.finditer(r"(<script\\b[^>]*>)([\\s\\S]*?)</script>", text, re.I) if 'src=' not in m.group(1).lower()])
    results.append((p.name, style_attrs, style_blocks, inline_scripts))
results_sorted = sorted(results, key=lambda x: (x[1]+x[2]+x[3]), reverse=True)
print('file,style_attrs,style_blocks,inline_scripts')
for name, sa, sb, iscr in results_sorted:
    if sa+sb+iscr>0:
        print(f'{name},{sa},{sb},{iscr}')
print('\nSummary: total pages scanned=', len(html_files))
print('Pages with inline style or scripts:', sum(1 for _,sa,sb,iscr in results if sa+sb+iscr>0))
