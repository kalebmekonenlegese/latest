from pathlib import Path
import re
root = Path('.').resolve()
html_files = list(root.glob('*.html'))
replacement = '\n  <script src="assets/config/app-config.js"></script>\n  <script src="assets/utils/validators.js"></script>\n  <script src="assets/services/hotel-api.js"></script>\n  <script src="assets/js/app.js"></script>'
for p in html_files:
    text = p.read_text(encoding='utf8')
    new_text = text.replace('<script src="assets/js/app.js"></script>', replacement)
    if new_text != text:
        p.write_text(new_text, encoding='utf8')
        print(f'Patched {p.name}')
print('Done')
