from pathlib import Path
root = Path('.').resolve()
html_files = list(root.glob('*.html'))
block = '  <script src="assets/config/app-config.js"></script>\n  <script src="assets/utils/validators.js"></script>\n  <script src="assets/services/hotel-api.js"></script>\n  <script src="assets/js/app.js"></script>\n'
for p in html_files:
    text = p.read_text(encoding='utf8')
    # remove any existing lines that include our shared scripts
    lines = [line for line in text.splitlines() if 'assets/config/app-config.js' not in line and 'assets/utils/validators.js' not in line and 'assets/services/hotel-api.js' not in line and 'assets/js/app.js' not in line]
    new_text = '\n'.join(lines)
    # insert block before closing </body>
    if '</body>' in new_text:
        new_text = new_text.replace('</body>', block + '</body>')
    else:
        new_text = new_text + '\n' + block
    if new_text != text:
        p.write_text(new_text, encoding='utf8')
        print(f'Cleaned {p.name}')
print('Cleanup done')
