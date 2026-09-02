import glob
import re
import hashlib
import base64
from pathlib import Path

pattern = re.compile(r'<script(?:\s[^>]*)?>(.*?)</script>', re.DOTALL | re.IGNORECASE)
inline_scripts = {}
for path in glob.glob('**/*.html', recursive=True):
    text = Path(path).read_text(encoding='utf-8', errors='replace')
    for m in pattern.finditer(text):
        tag = m.group(0)
        attrs = tag[:tag.find('>')+1]
        if 'type="application/ld+json"' in attrs or "type='application/ld+json'" in attrs or 'type=application/ld+json' in attrs:
            continue
        if 'src=' in attrs:
            continue
        script = m.group(1).strip()
        if not script:
            continue
        inline_scripts.setdefault(script, {'hash': None, 'files': set()})
        inline_scripts[script]['files'].add(path)

for script, data in inline_scripts.items():
    h = hashlib.sha256(script.encode('utf-8')).digest()
    data['hash'] = f"'sha256-{base64.b64encode(h).decode('ascii')}'"

print('unique inline scripts:', len(inline_scripts))
for i, (script, data) in enumerate(sorted(inline_scripts.items(), key=lambda x: len(x[1]['files']), reverse=True), 1):
    print('--- script', i, '---')
    print('hash:', data['hash'])
    print('files:', sorted(data['files']))
    print('preview:', repr(script[:240]))
    print()
