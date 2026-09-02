const { test, expect } = require('@playwright/test');
const { listHtmlPages, fileUrlFor } = require('./utils');

const viewports = [
  { name: 'mobile-320', width: 320, height: 568 },
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'mobile-425', width: 425, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

const pages = listHtmlPages();

test.setTimeout(120000);

for (const p of pages) {
  for (const vp of viewports) {
    test(`${p} responsive ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(response && response.ok()).toBeTruthy();
      // no horizontal scrollbar
      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > (window.innerWidth + 2));
      expect(hasHorizontalOverflow).toBeFalsy();
      try {
        await page.screenshot({ path: `tests/screenshots/${p}-${vp.name}.png`, fullPage: true, timeout: 30000 });
      } catch (error) {
        const message = String(error && error.message ? error.message : error);
        if (!message.includes('waiting for fonts to load')) {
          throw error;
        }
      }
    });
  }
}
