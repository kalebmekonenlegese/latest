const { test, expect } = require('@playwright/test');
const { listHtmlPages, fileUrlFor, isIgnorableBrowserConsoleError } = require('./utils');

const pages = listHtmlPages();

for (const p of pages) {
  test(`${p} should not emit JavaScript errors`, async ({ page }) => {
    const jsErrors = [];

    // Capture uncaught JavaScript errors (not network errors)
    page.on('pageerror', e => {
      const message = e.message || '';
      if (!isIgnorableBrowserConsoleError(message)) {
        jsErrors.push(message);
      }
    });

    // Capture console.error() calls that are NOT ignored
    page.on('console', msg => {
      const message = msg.text() || '';
      if (msg.type() === 'error' && !isIgnorableBrowserConsoleError(message)) {
        jsErrors.push(message);
      }
    });

    const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(response && response.ok()).toBeTruthy();

    expect(jsErrors).toEqual([], 'Page should not emit JavaScript errors. Note: known browser console warnings are ignored.');
  });
}
