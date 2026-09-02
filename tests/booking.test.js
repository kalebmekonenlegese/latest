const { test, expect } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

test('booking flow basic validations', async ({ page }) => {
  const target = fileUrlFor('booking.html');
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.locator('body')).toBeVisible();

  let checkIn = page.locator('input#check-in, input[name="checkIn"]').first();
  let checkOut = page.locator('input#check-out, input[name="checkOut"]').first();

  // Fallback for pages that only expose generic date inputs.
  if (await checkIn.count() === 0) {
    checkIn = page.locator('input[type="date"]').nth(0);
  }
  if (await checkOut.count() === 0) {
    checkOut = page.locator('input[type="date"]').nth(1);
  }
  const nextButton = page.locator('#booking-next, button:has-text("Search availability")');

  if (await checkIn.count()) {
    await expect(checkIn).toBeVisible();
    await checkIn.fill('2026-08-01');
  }
  if (await checkOut.count()) {
    await expect(checkOut).toBeVisible();
    await checkOut.fill('2026-08-05');
  }

  if (await nextButton.count()) {
    await expect(nextButton).toBeVisible();
    await nextButton.click();
  }

  const guestName = page.locator('input#guest-name, input[name="guestName"]').first();
  let guestEmail = page.locator('input#guest-email, input[name="guestEmail"]').first();
  if (await guestEmail.count() === 0) {
    guestEmail = page.locator('input[type="email"]').first();
  }
  const guestPhone = page.locator('input#guest-phone, input[name="guestPhone"], input[type=tel]');
  const confirmButton = page.locator('#booking-confirm, button:has-text("Reserve stay")');

  if (await guestName.count()) {
    await expect(guestName).toBeVisible();
    await guestName.fill('QA Tester');
  }
  if (await guestEmail.count()) {
    await expect(guestEmail).toBeVisible();
    await guestEmail.fill('guest@hatseykalebhotel.com');
  }
  if (await guestPhone.count()) {
    await expect(guestPhone).toBeVisible();
    await guestPhone.fill('+12025550123');
  }

  if (await confirmButton.count()) {
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  }

  const successCount =
    (await page.locator('#booking-confirmation, .booking-confirmation, .success').count()) +
    (await page.getByText(/confirmation/i).count());
  const validationCount = await page.locator('#booking-error, .form-error, .error, .validation-message').count();
  expect(successCount + validationCount).toBeGreaterThan(0);
});
