#!/usr/bin/env node
/**
 * Build Verification Script
 * Checks that production build is complete and valid
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dist = path.join(root, 'dist');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.warn(`${colors[color]}${message}${colors.reset}`);
}

function isIgnoredAssetReference(ref) {
  if (!ref) {
    return true;
  }
  if (ref.startsWith('#')) {
    return true;
  }
  if (ref.startsWith('data:')) {
    return true;
  }
  if (ref.startsWith('mailto:')) {
    return true;
  }
  if (ref.startsWith('tel:')) {
    return true;
  }
  if (ref.startsWith('javascript:')) {
    return true;
  }
  if (ref.startsWith('blob:')) {
    return true;
  }

  const cleaned = ref.split('?')[0].split('#')[0];
  if (!cleaned) {
    return true;
  }

  return /^[a-z]+:\/\//i.test(ref) || ref.startsWith('//');
}

function extractAssetReferences(htmlContent) {
  const references = new Set();

  function normalizeReference(value) {
    if (typeof value !== 'string') {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    const unquoted = trimmed.replace(/^['"]|['"]$/g, '');
    return unquoted.trim();
  }

  const attrPattern = /(?:src|href|data-src|data-full)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  let match;
  while ((match = attrPattern.exec(htmlContent)) !== null) {
    const value = normalizeReference(match[1] || match[2] || match[3] || '');
    if (value) {
      references.add(value);
    }
  }

  const srcsetPattern = /srcset\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  while ((match = srcsetPattern.exec(htmlContent)) !== null) {
    const srcsetValue = match[1] || match[2] || match[3] || '';
    if (!srcsetValue || srcsetValue.includes('data:')) {
      continue;
    }

    const candidates = srcsetValue.match(/(?:^|,\s*)([^\s,]+)(?:\s+[^,]+)?/g) || [];
    candidates.forEach((candidate) => {
      const url = normalizeReference(
        candidate
          .replace(/^\s*,\s*/, '')
          .trim()
          .split(/\s+/)[0] || ''
      );
      if (url) {
        references.add(url);
      }
    });
  }

  return [...references].filter((ref) => !isIgnoredAssetReference(ref));
}

function resolveDistAssetReference(htmlFilePath, reference) {
  const normalized = reference.split('?')[0].split('#')[0];
  const filePath = path.resolve(path.dirname(htmlFilePath), normalized);

  if (normalized.startsWith('/')) {
    const distRelative = normalized.replace(/^\//, '');
    const rootRelative = path.join(dist, distRelative);
    if (fs.existsSync(rootRelative)) {
      return rootRelative;
    }
    return path.join(dist, distRelative);
  }

  return filePath;
}

/**
 * Check if build exists and has required files
 */
function verifyBuild() {
  log('\n🔍 Build Verification', 'blue');
  log('═'.repeat(50), 'blue');

  let errors = 0;
  let warnings = 0;

  // Check dist directory
  if (!fs.existsSync(dist)) {
    log('✗ Build directory not found', 'red');
    log('  Run `npm run build` first', 'cyan');
    process.exit(1);
  }
  log('✓ Build directory exists', 'green');

  // Check for HTML files
  const files = fs.readdirSync(dist);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));

  if (htmlFiles.length === 0) {
    log('✗ No HTML files found in build', 'red');
    errors++;
  } else {
    log(`✓ Found ${htmlFiles.length} HTML file(s)`, 'green');
  }

  // Check for manifest.json (indicates Vite completed)
  const manifestPath = path.join(dist, '.vite', 'manifest.json');
  if (fs.existsSync(manifestPath) || fs.existsSync(path.join(dist, 'manifest.json'))) {
    log('✓ Manifest file found (Vite build completed)', 'green');
  } else {
    log('⚠ Manifest file not found (Vite may not have completed)', 'yellow');
    warnings++;
  }

  // Check for generated asset directories (Vite may emit css/js/images next to HTML)
  const assetDirs = ['assets', 'css', 'js', 'images']
    .map((dir) => path.join(dist, dir))
    .filter((dir) => fs.existsSync(dir));

  if (assetDirs.length > 0) {
    const assetSummary = assetDirs
      .map((dir) => {
        const files = fs.readdirSync(dir);
        return `${path.basename(dir)}:${files.length}`;
      })
      .join(', ');
    log(`✓ Asset directories present (${assetSummary})`, 'green');

    const jsFiles = assetDirs.flatMap((dir) =>
      fs.readdirSync(dir).filter((file) => file.endsWith('.js'))
    );
    const cssFiles = assetDirs.flatMap((dir) =>
      fs.readdirSync(dir).filter((file) => file.endsWith('.css'))
    );

    if (jsFiles.length === 0) {
      log('✗ No JavaScript files in build output', 'red');
      errors++;
    } else {
      log(`  ✓ ${jsFiles.length} JavaScript file(s)`, 'green');
    }

    if (cssFiles.length === 0) {
      log('✗ No CSS files in build output', 'red');
      errors++;
    } else {
      log(`  ✓ ${cssFiles.length} CSS file(s)`, 'green');
    }
  } else {
    log('✗ No asset directories found in build output', 'red');
    errors++;
  }

  // Verify HTML files are valid and their asset references resolve in dist
  log('\nValidating HTML files...', 'cyan');
  let validHtmlCount = 0;
  htmlFiles.forEach((file) => {
    const filePath = path.join(dist, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const missingAssets = [];
    const references = extractAssetReferences(content);

    references.forEach((reference) => {
      const resolved = resolveDistAssetReference(filePath, reference);
      if (!fs.existsSync(resolved)) {
        missingAssets.push(reference);
      }
    });

    // Basic checks
    if (!/<!doctype html/i.test(content)) {
      log(`  ✗ ${file} missing DOCTYPE`, 'red');
      errors++;
    } else if (content.includes('<script') && !content.includes('</script>')) {
      log(`  ✗ ${file} has unclosed script tags`, 'red');
      errors++;
    } else if (!content.includes('</html>')) {
      log(`  ✗ ${file} missing closing html tag`, 'red');
      errors++;
    } else if (missingAssets.length > 0) {
      log(
        `  ✗ ${file} references missing asset(s): ${missingAssets.slice(0, 5).join(', ')}${
          missingAssets.length > 5 ? ' ...' : ''
        }`,
        'red'
      );
      errors += missingAssets.length > 0 ? 1 : 0;
    } else {
      validHtmlCount++;
    }
  });

  if (validHtmlCount === htmlFiles.length) {
    log(`✓ All ${htmlFiles.length} HTML files are valid`, 'green');
  } else {
    log(`⚠ ${htmlFiles.length - validHtmlCount} HTML file(s) have issues`, 'yellow');
  }

  // Check build size
  log('\nChecking build size...', 'cyan');
  let totalSize = 0;
  function calculateSize(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    });
  }
  calculateSize(dist);
  const sizeMb = (totalSize / 1024 / 1024).toFixed(2);
  log(`✓ Total build size: ${sizeMb} MB`, totalSize > 20 ? 'yellow' : 'green');

  if (totalSize > 20000000) {
    log('  ⚠ Build size > 20MB - may impact loading time', 'yellow');
    warnings++;
  }

  // Summary
  log('\n' + '═'.repeat(50), 'blue');
  if (errors === 0) {
    log(`✅ Build verification passed (${warnings} warning(s))`, 'green');
    log('Build is ready for deployment!', 'green');
    process.exit(0);
  } else {
    log(`❌ Build verification failed (${errors} error(s), ${warnings} warning(s))`, 'red');
    process.exit(1);
  }
}

verifyBuild();
