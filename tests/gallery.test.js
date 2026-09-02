const { test, expect } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

test('gallery lightbox and navigation', async ({ page }) => {
  const target = fileUrlFor('gallery.html');
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(response && response.ok()).toBeTruthy();

  const firstImg = page.locator('a[data-lightbox], .gallery img, .gallery a');
  test.skip(!(await firstImg.count()), 'No gallery items found');
  await firstImg.first().click();

  const lightbox = page.locator('.lightbox, .lg-backdrop, .fslightbox');
  await expect(lightbox.first()).toBeVisible({ timeout: 5000 });

  const next = page.locator('.lightbox .next, .lg-next, .fslightbox-next, button[aria-label*=Next]');
  const prev = page.locator('.lightbox .prev, .lg-prev, .fslightbox-prev, button[aria-label*=Previous]');
  if (await next.count()) {
    await next.first().click();
    await expect(lightbox.first()).toBeVisible({ timeout: 5000 });
  }
  if (await prev.count()) {
    await prev.first().click();
    await expect(lightbox.first()).toBeVisible({ timeout: 5000 });
  }

  const close = page.locator('.lightbox .close, .lg-close, button[aria-label*=Close]');
  if (await close.count()) {
    await close.first().click();
  }
});
