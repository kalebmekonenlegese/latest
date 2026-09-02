const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('Homepage WCAG 2.2 accessibility audit', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.addStyleTag({
    content: [
      '*, *::before, *::after { animation: none !important; transition: none !important; }',
      'html.js-enabled body, body.page-transitioning { opacity: 1 !important; }'
    ].join('\n')
  });

  const results = await new AxeBuilder({ page }).analyze();

  console.log('\n=== AXE ACCESSIBILITY RESULTS ===');
  console.log(`Violations: ${results.violations.length}`);

  for (const violation of results.violations) {
    console.log(`\n[${violation.impact?.toUpperCase()}] ${violation.id}`);
    console.log(`Description: ${violation.description}`);
    console.log(`Help: ${violation.help}`);
    console.log(`Affected elements: ${violation.nodes.length}`);

    for (const node of violation.nodes) {
      console.log(`  - ${node.html}`);
    }
  }

  expect(results.violations).toEqual([]);
});
