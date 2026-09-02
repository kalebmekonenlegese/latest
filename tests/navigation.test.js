const { test, expect } = require('@playwright/test');
const { listHtmlPages, fileUrlFor, isIgnorableBrowserConsoleError } = require('./utils');

const pages = listHtmlPages();
const INTERNAL_DASHBOARD = 'analytics-dashboard.html';

function shouldSkipHref(href) {
  if (!href) return true;
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#')) return true;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return true;
  return false;
}

for (const p of pages) {
  test.describe(p, () => {
    test(`${p} loads and has no console errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => {
        const message = e.message || '';
        if (!isIgnorableBrowserConsoleError(message)) {
          errors.push(message);
        }
      });
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const message = msg.text() || '';
          if (!isIgnorableBrowserConsoleError(message)) {
            errors.push(message);
          }
        }
      });

      const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(response && response.ok()).toBeTruthy();
      await expect(page).toHaveTitle(/./);
      // header and footer presence for normal pages only
      if (p !== INTERNAL_DASHBOARD) {
        await expect(page.locator('header, .site-header')).toHaveCount(1);
        await expect(page.locator('footer, .site-footer')).toHaveCount(1);
      }

      // capture screenshot as a best-effort artifact; do not fail functional checks on font-loading stalls
      try {
        await page.screenshot({ path: `tests/screenshots/${p}.png`, fullPage: true, timeout: 30000 });
      } catch (error) {
        const message = String(error && error.message ? error.message : error);
        if (!message.includes('waiting for fonts to load')) {
          throw error;
        }
      }

      // check internal links for 404s by requesting same-origin hrefs only
      const anchors = await page.locator('a[href]').evaluateAll(nodes => nodes.map(a => a.getAttribute('href')));
      const origin = new URL(page.url()).origin;
      for (const href of anchors) {
        if (shouldSkipHref(href)) {
          continue;
        }

        let url;
        try {
          url = new URL(href, page.url());
        } catch {
          continue;
        }

        if (url.origin !== origin) {
          continue;
        }

        const resp = await page.request.get(url.toString(), { timeout: 10000 }).catch(() => null);
        if (!resp || resp.status() >= 400) {
          throw new Error(`Broken link ${href} on page ${p} -> status ${resp ? resp.status() : 'request failed'}`);
        }
      }

      expect(errors).toEqual([]);
    });
  });
}
