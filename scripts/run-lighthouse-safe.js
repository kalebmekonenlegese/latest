#!/usr/bin/env node

/**
 * Safe Lighthouse runner for Windows environments.
 * Avoids temp-directory permission issues by using the Lighthouse API directly
 * and managing Chrome lifecycle carefully.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const pages = ['index.html', 'booking.html', 'rooms.html', 'contact.html', 'hotel.html'];
const outputDir = 'lighthouse-results';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const desktopConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
    },
  },
};

async function runLighthouse(url, outputPath) {
  let chrome;
  try {
    // Launch Chrome with explicit temp directory handling
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-setuid-sandbox',
        '--disable-default-apps',
        '--disable-preconnect',
      ],
    });

    const options = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
    };

    console.log(`Running Lighthouse on ${url}...`);
    const runnerResult = await lighthouse(url, options, desktopConfig);

    if (!runnerResult) {
      throw new Error(`No result from lighthouse for ${url}`);
    }

    // Write the results to disk
    fs.writeFileSync(outputPath, runnerResult.lhr ? JSON.stringify(runnerResult.lhr, null, 2) : runnerResult);
    console.log(`✓ Saved to ${outputPath}`);

    // Extract and display key metrics
    const report = runnerResult.lhr || JSON.parse(runnerResult);
    const perf = report.categories?.performance?.score ?? 'N/A';
    const a11y = report.categories?.accessibility?.score ?? 'N/A';
    const seo = report.categories?.seo?.score ?? 'N/A';
    const bp = report.categories?.['best-practices']?.score ?? 'N/A';
    const tbt = report.audits?.['total-blocking-time']?.numericValue ?? 'N/A';
    const lcp = report.audits?.['largest-contentful-paint']?.numericValue ?? 'N/A';

    console.log(
      `  Performance: ${(perf * 100).toFixed(0)} | A11y: ${(a11y * 100).toFixed(0)} | SEO: ${(seo * 100).toFixed(0)} | BP: ${(bp * 100).toFixed(0)}`
    );
    console.log(
      `  LCP: ${(lcp / 1000).toFixed(2)}s | TBT: ${tbt === 'N/A' ? 'N/A' : (tbt / 1000).toFixed(2) + 's'}`
    );

    return report;
  } catch (err) {
    console.error(`✗ Lighthouse failed for ${url}:`, err.message);
    throw err;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

async function main() {
  console.log('Running Lighthouse audits on production pages...\n');

  const results = {};

  for (const page of pages) {
    const url = `${baseUrl}/${page}`;
    const outputFile = path.join(outputDir, `lighthouse-${page.replace('.html', '')}.json`);

    try {
      results[page] = await runLighthouse(url, outputFile);
    } catch (err) {
      console.error(`Failed to audit ${page}: ${err.message}`);
      process.exit(1);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('LIGHTHOUSE AUDIT SUMMARY');
  console.log('='.repeat(60));

  for (const [page, report] of Object.entries(results)) {
    const perf = report.categories?.performance?.score ?? 0;
    const a11y = report.categories?.accessibility?.score ?? 0;
    const seo = report.categories?.seo?.score ?? 0;

    console.log(
      `${page.padEnd(20)} | Perf: ${(perf * 100).toFixed(0).padStart(3)}% | A11y: ${(a11y * 100).toFixed(0).padStart(3)}% | SEO: ${(seo * 100).toFixed(0).padStart(3)}%`
    );
  }

  console.log('='.repeat(60));
  console.log(`All results saved to ${outputDir}/`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
