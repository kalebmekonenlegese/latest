const { test, expect } = require('@playwright/test');
const { listHtmlPages, fileUrlFor } = require('./utils');

const pages = listHtmlPages();

for (const p of pages) {
  test(`performance metrics - ${p}`, async ({ page }) => {
    const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(response && response.ok()).toBeTruthy();
    const metrics = await page.evaluate(() => {
      const p = performance.getEntriesByType('paint') || [];
      const nav = performance.getEntriesByType('navigation')[0] || {};
      return { paint: p.map(x => ({ name: x.name, start: x.startTime })), navigation: { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd } };
    });
    // Save metrics for report
    const fs = require('fs');
    fs.writeFileSync(`tests/perf-${p}.json`, JSON.stringify(metrics, null, 2));
    expect(metrics).toBeTruthy();
  });
}
