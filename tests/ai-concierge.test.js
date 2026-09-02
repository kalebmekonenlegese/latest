const { test, expect } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

test('AI concierge basic interactions', async ({ page }) => {
  const target = fileUrlFor('hotel.html');
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(response && response.ok()).toBeTruthy();

  const widget = page.locator('#concierge, .ai-concierge, [data-widget="concierge"]');
  test.skip(!(await widget.count()), 'No concierge widget found');

  const openBtn = page.locator('#concierge button, .ai-concierge button, button[data-open="concierge"]');
  if (await openBtn.count()) {
    await openBtn.first().click();
    const input = page.locator('input[type=text][aria-label*=chat], textarea[aria-label*=chat], input[name=query]');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('Hello');
    await input.press('Enter');
    await expect(input).toBeVisible({ timeout: 500 });
  }

  const sugg = page.locator('.concierge-suggestion, .suggested-question, [data-suggestion]');
  if (await sugg.count()) {
    await sugg.first().click();
  }

  const close = page.locator('#concierge .close, .ai-concierge .close, button[data-close="concierge"]');
  if (await close.count()) {
    await close.first().click();
  }
});
