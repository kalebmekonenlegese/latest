#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'lighthouse-ci.json';
const requiredPages = ['index', 'booking', 'rooms', 'contact', 'hotel'];
// Keep the gate strict enough to catch real regressions, but realistic for a static
// multipage site that includes a few content-heavy pages and a form-driven contact page.
// Current measured production baselines for the required pages are approximately:
// performance 0.77-1.00, accessibility 0.96-1.00, seo 0.92-1.00, best-practices 1.00.
// A 0.75 floor for performance and 0.90 floors for accessibility/SEO preserve
// meaningful quality checks without failing on expected natural variance across pages.
const thresholds = {
  performance: 0.75,
  accessibility: 0.9,
  seo: 0.9,
  'best-practices': 0.95
};

function fail(message) {
  console.error(`❌ Lighthouse gate failed: ${message}`);
  process.exit(1);
}

function getReportFiles(rootPath) {
  if (!fs.existsSync(rootPath)) {
    fail(`Missing Lighthouse report path at ${rootPath}. Run Lighthouse before this gate.`);
  }

  const stats = fs.statSync(rootPath);
  if (stats.isDirectory()) {
    return fs
      .readdirSync(rootPath)
      .filter((name) => name.startsWith('lighthouse-') && name.endsWith('.json'))
      .sort()
      .map((name) => path.join(rootPath, name));
  }

  return [rootPath];
}

function validateReport(report, label) {
  const categories = report.categories || {};

  for (const [key, minScore] of Object.entries(thresholds)) {
    const category = categories[key];
    if (!category) {
      fail(`Missing Lighthouse category: ${key} for ${label}.`);
    }
    const score = Number(category.score || 0);
    if (score < minScore) {
      fail(
        `${label} ${key} score ${score.toFixed(2)} is below required minimum ${minScore.toFixed(
          2
        )}.`
      );
    }
  }
}

const reportFiles = getReportFiles(inputPath);
if (reportFiles.length === 0) {
  fail(`No Lighthouse reports found in ${inputPath}. Run Lighthouse before this gate.`);
}

if (fs.statSync(inputPath).isDirectory()) {
  const foundPages = new Set(
    reportFiles.map((file) => path.basename(file, '.json').replace(/^lighthouse-/, ''))
  );
  const missingPages = requiredPages.filter((page) => !foundPages.has(page));
  if (missingPages.length) {
    fail(`Missing Lighthouse reports for required pages: ${missingPages.join(', ')}`);
  }
}

for (const reportFile of reportFiles) {
  const label = path.basename(reportFile, '.json').replace(/^lighthouse-/, '');
  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  validateReport(report, label);
}

console.log(
  `✅ Lighthouse gate passed: all required category thresholds are satisfied for ${reportFiles.length} report(s).`
);
