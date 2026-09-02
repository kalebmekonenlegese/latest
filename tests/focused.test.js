const { test, expect } = require('@playwright/test');
const { fileUrlFor, listHtmlPages, isIgnorableBrowserConsoleError } = require('./utils');

const pages = listHtmlPages();
const INTERNAL_DASHBOARD = 'analytics-dashboard.html';

async function safeGoto(page, url) {
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('GOTO:', url, 'STATUS:', response?.status(), 'OK:', response?.ok());

  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
}

test.describe('QA Focused Tests', () => {
  test('All pages load without console errors', async ({ page }) => {page.on('requestfailed', request => {
  console.log(
    '\nREQUEST FAILED:',
    request.method(),
    request.url(),
    '\nERROR:',
    request.failure()?.errorText
  );
});
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('\nBROWSER ERROR:', msg.text());
  }
});
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

    for (const p of pages) {
      await safeGoto(page, fileUrlFor(p));
    }

    expect(errors).toEqual([]);
  });

  test('Navigation and header present on all pages', async ({ page }) => {
    for (const p of pages) {
      await safeGoto(page, fileUrlFor(p));
      if (p === INTERNAL_DASHBOARD) {
        continue;
      }
      await expect(page.locator('header, .site-header')).toHaveCount(1);
      await expect(page.locator('footer, .site-footer')).toHaveCount(1);
    }
  });

  test('Responsive layout check - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const hasOverflow = [];
    for (const p of pages.slice(0, 5)) {
      await safeGoto(page, fileUrlFor(p));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) {
        hasOverflow.push(p);
      }
    }
    expect(hasOverflow.length).toBe(0);
  });

  test('Responsive layout check - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const hasOverflow = [];
    for (const p of pages.slice(0, 5)) {
      await safeGoto(page, fileUrlFor(p));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) {
        hasOverflow.push(p);
      }
    }
    expect(hasOverflow.length).toBe(0);
  });

  test('Accessibility - pages have proper headings', async ({ page }) => {
    const missing = [];
    for (const p of pages.slice(0, 5)) {
      await safeGoto(page, fileUrlFor(p));
      const h1Count = await page.locator('h1').count();
      if (h1Count === 0) {
        missing.push(p);
      }
    }
    expect(missing.length).toBe(0);
  });

  test('Performance - pages load in reasonable time', async ({ page }) => {
    const samplePages = pages.slice(0, 5);
    if (samplePages.length > 0) {
      await safeGoto(page, fileUrlFor(samplePages[0]));
    }

    const slowPages = [];
    for (const p of samplePages) {
      const start = Date.now();
      await safeGoto(page, fileUrlFor(p));
      const time = Date.now() - start;
      if (time > 5000) {
        slowPages.push({ page: p, time });
      }
    }
    expect(slowPages.length).toBe(0);
  });
});
