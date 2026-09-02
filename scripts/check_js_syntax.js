const fs = require('fs');
const path = require('path');
const vm = require('vm');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        return;
      }
      results = results.concat(walk(full));
    } else if (entry.isFile() && full.endsWith('.js')) {
      results.push(full);
    }
  });
  return results;
}

function checkJsFiles() {
  const root = process.cwd();
  const assetsDir = path.join(root, 'assets');
  const scriptsDir = path.join(root, 'scripts');
  const candidates = [];
  if (fs.existsSync(assetsDir)) {
    candidates.push(...walk(assetsDir));
  }
  if (fs.existsSync(scriptsDir)) {
    candidates.push(...walk(scriptsDir));
  }
  // also include top-level JS if any
  fs.readdirSync(root).forEach(f => {
    if (f.endsWith('.js')) {
      candidates.push(path.join(root,f));
    }
  });

  let ok = 0, fail = 0;
  console.log('Checking', candidates.length, 'JS files for syntax ...');
  candidates.forEach(file => {
    try {
      const src = fs.readFileSync(file, 'utf8');
      // try compile without executing
      new vm.Script(src, { filename: file });
      console.log('OK ', path.relative(root, file));
      ok++;
    } catch (err) {
      console.error('ERR', path.relative(root, file));
      console.error(err && err.stack ? err.stack.split('\n').slice(0,3).join('\n') : err);
      fail++;
    }
  });
  console.log('\nJS Syntax Summary: ' + ok + ' OK, ' + fail + ' errors');
  return { ok, fail };
}

function checkHtmlIncludes() {
  const root = process.cwd();
  const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
  const required = [
    'assets/config/app-config.js',
    'assets/utils/validators.js',
    'assets/js/app.js'
  ];
  let missing = 0;
  console.log('\nChecking HTML pages for shared script includes...');
  files.forEach(f => {
    const text = fs.readFileSync(path.join(root,f),'utf8');
    const hasAll = required.every(r => text.indexOf(r) !== -1);
    if (hasAll) {
      console.log('OK ', f);
    } else {
      console.warn('MISSING INCLUDES:', f);
      required.forEach(r => {
        if (text.indexOf(r) === -1) {
          console.warn('  - missing', r);
        }
      });
      missing++;
    }
  });
  console.log('\nHTML Include Summary: ' + (files.length - missing) + ' OK, ' + missing + ' pages missing includes');
  return { total: files.length, missing };
}

function main() {
  const js = checkJsFiles();
  const html = checkHtmlIncludes();
  const ok = js.fail === 0 && html.missing === 0;
  process.exitCode = ok ? 0 : 2;
}

main();
