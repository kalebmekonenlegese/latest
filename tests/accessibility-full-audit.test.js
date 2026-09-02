const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

const PAGES_TO_AUDIT = [
  { path: '/index.html', name: 'Homepage' },
  { path: '/about.html', name: 'About' },
  { path: '/rooms.html', name: 'Rooms' },
  { path: '/booking.html', name: 'Booking' },
  { path: '/ai-assistant.html', name: 'AI Assistant' },
  { path: '/contact.html', name: 'Contact' },
  { path: '/reviews.html', name: 'Reviews' }
];

const reportDir = path.join(__dirname, '..', 'reports', 'accessibility-full-audit');

test.describe('Comprehensive WCAG 2.2 Accessibility Audit', () => {
  test.beforeAll(async () => {
    // Create report directory
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  });

  for (const pageInfo of PAGES_TO_AUDIT) {
    test(`Audit: ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      let violationCount = 0;
      let passCount = 0;

      try {
        await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForLoadState('networkidle');

        // Disable animations to get consistent results
        await page.addStyleTag({
          content: [
            '*, *::before, *::after { animation: none !important; transition: none !important; }',
            'html.js-enabled body, body.page-transitioning { opacity: 1 !important; }'
          ].join('\n')
        });

        const results = await new AxeBuilder({ page }).withTags(['wcag2aa', 'wcag2aaa']).analyze();

        violationCount = results.violations.length;
        passCount = results.passes.length;

        console.log(`\n${'='.repeat(70)}`);
        console.log(`📄 PAGE: ${pageInfo.name} (${pageInfo.path})`);
        console.log(`${'='.repeat(70)}`);
        console.log(`✅ Passes: ${passCount}`);
        console.log(`❌ Violations: ${violationCount}`);

        if (results.violations.length > 0) {
          console.log(`\n${'─'.repeat(70)}`);
          console.log('VIOLATIONS FOUND:');
          console.log(`${'─'.repeat(70)}`);

          for (const violation of results.violations) {
            console.log(`\n[${violation.impact?.toUpperCase()}] ${violation.id}`);
            console.log(`Description: ${violation.description}`);
            console.log(`Help Text: ${violation.help}`);
            console.log(`Affected Elements: ${violation.nodes.length}`);

            for (const node of violation.nodes.slice(0, 3)) {
              console.log(`  └─ ${node.html.substring(0, 100)}${node.html.length > 100 ? '...' : ''}`);
            }

            if (violation.nodes.length > 3) {
              console.log(`  ... and ${violation.nodes.length - 3} more`);
            }
          }
        }

        // Save detailed JSON report
        const reportFile = path.join(
          reportDir,
          `axe-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.json`
        );
        fs.writeFileSync(reportFile, JSON.stringify({
          page: pageInfo.name,
          path: pageInfo.path,
          timestamp: new Date().toISOString(),
          violations: results.violations,
          passes: results.passes,
          incomplete: results.incomplete || []
        }, null, 2));

        console.log(`\n📁 Report saved: ${reportFile}`);

        // Critical assertion: no violations should exist
        expect(results.violations).toEqual([]);

      } catch (error) {
        console.error(`❌ Error auditing ${pageInfo.name}: ${error.message}`);
        throw error;
      }
    });
  }

  test('Generate summary report', async () => {
    const files = fs.readdirSync(reportDir).filter(f => f.startsWith('axe-'));
    let totalViolations = 0;
    let totalPasses = 0;
    const summary = {};

    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(reportDir, file), 'utf8'));
      summary[data.page] = {
        violations: data.violations.length,
        passes: data.passes.length,
        critical: data.violations.filter(v => v.impact === 'critical').length,
        serious: data.violations.filter(v => v.impact === 'serious').length,
        moderate: data.violations.filter(v => v.impact === 'moderate').length
      };
      totalViolations += data.violations.length;
      totalPasses += data.passes.length;
    }

    const summaryFile = path.join(reportDir, 'SUMMARY.json');
    fs.writeFileSync(summaryFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalPages: files.length,
      totalViolations,
      totalPasses,
      byPage: summary
    }, null, 2));

    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 ACCESSIBILITY AUDIT SUMMARY');
    console.log(`${'='.repeat(70)}`);
    console.log(`\nPages Audited: ${files.length}`);
    console.log(`Total Violations: ${totalViolations}`);
    console.log(`Total Passes: ${totalPasses}`);
    console.log(`\nBy Page:`);
    console.log(`${'─'.repeat(70)}`);

    for (const [page, stats] of Object.entries(summary)) {
      console.log(`\n${page}`);
      console.log(`  Violations: ${stats.violations} | Passes: ${stats.passes}`);
      if (stats.critical) console.log(`    🔴 Critical: ${stats.critical}`);
      if (stats.serious) console.log(`    🟠 Serious: ${stats.serious}`);
      if (stats.moderate) console.log(`    🟡 Moderate: ${stats.moderate}`);
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📁 Summary saved: ${summaryFile}`);
    console.log(`${'='.repeat(70)}\n`);
  });
});
