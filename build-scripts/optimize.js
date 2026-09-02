#!/usr/bin/env node
/**
 * Build Optimization Script
 * Enhances production build with compression and verification
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

const root = process.cwd();
const dist = path.join(root, 'dist');
const assetsDir = path.join(dist, 'assets');

// Console colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get file size in human readable format
 */
function getFileSize(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Recursively get all files from directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Compress file and return compression ratio
 */
async function compressFile(filePath, method = 'gzip') {
  try {
    const data = fs.readFileSync(filePath);
    let compressed;

    if (method === 'gzip') {
      compressed = await gzip(data, { level: 9 });
    } else if (method === 'brotli') {
      compressed = await brotli(data, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      });
    }

    const ratio = ((1 - compressed.length / data.length) * 100).toFixed(2);
    return { original: data.length, compressed: compressed.length, ratio };
  } catch (error) {
    log(`Error compressing ${filePath}: ${error.message}`, 'yellow');
    return null;
  }
}

/**
 * Analyze build output
 */
async function analyzeBuild() {
  if (!fs.existsSync(dist)) {
    log(`\n⚠️  Build directory not found: ${dist}`, 'yellow');
    log('Run `npm run build` first', 'cyan');
    return;
  }

  log('\n📊 Build Optimization Analysis', 'blue');
  log('═'.repeat(50), 'blue');

  const files = getAllFiles(dist);
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  let imageSize = 0;
  let fontSize = 0;
  let otherSize = 0;

  // Categorize files
  const filesByType = {
    js: [],
    css: [],
    images: [],
    fonts: [],
    other: []
  };

  files.forEach((file) => {
    const stats = fs.statSync(file);
    const size = stats.size;
    totalSize += size;

    const ext = path.extname(file).toLowerCase();

    if (ext === '.js') {
      jsSize += size;
      filesByType.js.push({ file, size });
    } else if (ext === '.css') {
      cssSize += size;
      filesByType.css.push({ file, size });
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
      imageSize += size;
      filesByType.images.push({ file, size });
    } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
      fontSize += size;
      filesByType.fonts.push({ file, size });
    } else {
      otherSize += size;
      filesByType.other.push({ file, size });
    }
  });

  // Display file size breakdown
  log('\n📦 Asset Breakdown:', 'cyan');
  log(`   JavaScript:  ${getFileSize(jsSize)} (${((jsSize / totalSize) * 100).toFixed(1)}%)`);
  log(`   CSS:         ${getFileSize(cssSize)} (${((cssSize / totalSize) * 100).toFixed(1)}%)`);
  log(`   Images:      ${getFileSize(imageSize)} (${((imageSize / totalSize) * 100).toFixed(1)}%)`);
  log(`   Fonts:       ${getFileSize(fontSize)} (${((fontSize / totalSize) * 100).toFixed(1)}%)`);
  log(`   Other:       ${getFileSize(otherSize)} (${((otherSize / totalSize) * 100).toFixed(1)}%)`);
  log('   ────────────────────────');
  log(`   TOTAL:       ${getFileSize(totalSize)}`, 'green');

  // Analyze largest files
  log('\n📈 Top 10 Largest Files:', 'cyan');
  const allSorted = [...files].map((file) => ({
    file,
    size: fs.statSync(file).size
  })).sort((a, b) => b.size - a.size).slice(0, 10);

  allSorted.forEach((item, i) => {
    const relativePath = path.relative(dist, item.file);
    log(`   ${i + 1}. ${relativePath}: ${getFileSize(item.size)}`);
  });

  // Check for CSS duplication
  log('\n🔍 Checking for optimization opportunities:', 'cyan');

  // CSS files
  if (filesByType.css.length > 0) {
    log(`   ✓ CSS files: ${filesByType.css.length} file(s)`);
    const cssStats = await compressFile(filesByType.css[0].file, 'gzip');
    if (cssStats) {
      log(`     Gzip compression: ${getFileSize(cssStats.original)} → ${getFileSize(cssStats.compressed)} (${cssStats.ratio}% reduction)`);
    }
  }

  // JS files
  if (filesByType.js.length > 0) {
    log(`   ✓ JavaScript files: ${filesByType.js.length} file(s)`);
    const largestJs = filesByType.js.sort((a, b) => b.size - a.size)[0];
    const jsStats = await compressFile(largestJs.file, 'gzip');
    if (jsStats) {
      log(`     Largest JS (gzip): ${getFileSize(jsStats.original)} → ${getFileSize(jsStats.compressed)} (${jsStats.ratio}% reduction)`);
    }
  }

  // Image optimization recommendations
  if (filesByType.images.length > 0) {
    log(`   ✓ Images: ${filesByType.images.length} file(s)`);
    log(`     Total size: ${getFileSize(imageSize)}`);
    const largeImages = filesByType.images.filter((img) => img.size > 500000);
    if (largeImages.length > 0) {
      log(`     ⚠️  ${largeImages.length} image(s) > 500KB - consider optimization`, 'yellow');
      largeImages.slice(0, 3).forEach((img) => {
        log(`         ${path.relative(dist, img.file)}: ${getFileSize(img.size)}`);
      });
    }
  }

  // Performance metrics
  log('\n⚡ Performance Recommendations:', 'cyan');
  if (jsSize > 500000) {
    log('   ⚠️  Total JS > 500KB - consider code splitting', 'yellow');
  } else {
    log('   ✓ JavaScript size is good', 'green');
  }

  if (imageSize > 2000000) {
    log('   ⚠️  Total images > 2MB - consider image optimization (AVIF/WebP)', 'yellow');
  } else {
    log('   ✓ Image size is acceptable', 'green');
  }

  if (totalSize > 5000000) {
    log('   ⚠️  Total build > 5MB - consider aggressive optimization', 'yellow');
  } else {
    log('   ✓ Overall build size is good', 'green');
  }

  log('\n✅ Build Analysis Complete', 'green');
  log('═'.repeat(50), 'blue');
  log('Next: Use `npm run preview` to test production build locally', 'cyan');
}

// Run analysis
analyzeBuild().catch((error) => {
  log(`Error: ${error.message}`, 'yellow');
  process.exit(1);
});
