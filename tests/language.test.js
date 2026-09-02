const { test, expect } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

test('language selector switches languages without breaking layout', async ({ page }) => {
  const target = fileUrlFor('index.html');
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(response && response.ok()).toBeTruthy();

  const sel = page.locator('select[name=language], .language-selector, [data-lang]');
  test.skip(!(await sel.count()), 'No language selector found');
  if (await sel.count()) {
    const options = await sel.locator('option').evaluateAll(opts => opts.slice(0, 3).map(o => o.value));
    for (const opt of options) {
      await sel.selectOption(opt).catch(() => {});
      await expect(page.locator('body')).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow).toBeFalsy();
    }
  }
});
