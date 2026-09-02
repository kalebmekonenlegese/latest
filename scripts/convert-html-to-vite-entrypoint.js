const fs = require('fs');
const path = require('path');
const glob = require('glob');

const htmlFiles = glob.sync('*.html', { cwd: process.cwd() });
const legacyBlockRegex = /<script src="assets\/config\/app-config\.js"><\/script>[\s\S]*?<script src="assets\/js\/app\.js"><\/script>\s*/g;
const legacyAppRegex = /<script src="assets\/js\/app\.js"><\/script>\s*/g;

const changed = [];

for (const file of htmlFiles) {
  const filePath = path.join(process.cwd(), file);
  let text = fs.readFileSync(filePath, 'utf8');

  if (legacyBlockRegex.test(text)) {
    text = text.replace(legacyBlockRegex, '<script type="module" src="/src/main.js"></script>\n');
    changed.push(file);
  } else if (legacyAppRegex.test(text)) {
    text = text.replace(legacyAppRegex, '<script type="module" src="/src/main.js"></script>\n');
    changed.push(file);
  }

  fs.writeFileSync(filePath, text, 'utf8');
}

console.log('updated HTML files:', changed.length);
console.log(changed.join('\n'));
