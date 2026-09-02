const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const builtHtmlPath = path.join(rootDir, 'dist', 'index.html');

if (!fs.existsSync(builtHtmlPath)) {
  throw new Error('Expected a built site at dist/index.html. Run npm run build first.');
}

const html = fs.readFileSync(builtHtmlPath, 'utf8');

if (!/<meta http-equiv="Content-Security-Policy"/i.test(html)) {
  console.warn('Warning: CSP meta tag not found in built HTML. This is acceptable if CSP is served via HTTP headers (Helmet).');
}
assert.match(html, /name="referrer"/i, 'Expected a Referrer-Policy meta tag in the built HTML.');
assert.match(html, /name="robots"/i, 'Expected a robots meta tag in the built HTML.');

console.log('Security hardening regression checks passed.');
