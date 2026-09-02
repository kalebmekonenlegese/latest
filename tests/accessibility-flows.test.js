const { test, expect } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

const pages = [
  'index.html',
  'contact.html',
  'booking.html',
  'reviews.html'
];

test.describe('Accessibility and device flow checks', () => {
  test('Critical page structure and labels are present', async ({ page }) => {
    await page.goto(fileUrlFor('contact.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page.locator('main, [role=main]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /skip to main content/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/subject/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
    await expect(page.locator('#contact-form')).toHaveAttribute('novalidate', '');
    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('required', '');

    await page.goto(fileUrlFor('booking.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.getByLabel(/check-in date/i)).toBeVisible();
    await expect(page.getByLabel(/check-out date/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /search availability/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /reserve stay/i })).toHaveCount(1);
    await expect(page.locator('button', { hasText: /book another stay/i })).toHaveCount(1);

    await page.goto(fileUrlFor('reviews.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/guest reviews/i);
    const avatars = await page.locator('article img[alt]').all();
    expect(avatars.length).toBeGreaterThan(0);
    for (const avatar of avatars) {
      await expect(avatar).toHaveAttribute('alt', /\S+/);
    }
  });

  test('Keyboard navigation reaches skip link and booking form fields', async ({ page }) => {
    await page.goto(fileUrlFor('booking.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.keyboard.press('Tab');
    await expect(page.locator('a.skip-link:focus')).toHaveCount(1);

    let reachedFormField = false;
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab');
      const activeInForm = await page.evaluate(() => {
        const active = document.activeElement;
        return !!active && !!active.closest('#hotel-booking-form');
      });
      if (activeInForm) {
        reachedFormField = true;
        break;
      }
    }

    expect(reachedFormField).toBe(true);
  });

  test('Responsive flow checks on critical pages', async ({ page }) => {
    for (const p of pages) {
      await page.setViewportSize({ width: 375, height: 812 });
      const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(response && response.ok()).toBeTruthy();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBeFalsy();

      const hasAccessibleHeading = await page.locator('h1').count();
      expect(hasAccessibleHeading).toBeGreaterThan(0);
    }
  });
});
