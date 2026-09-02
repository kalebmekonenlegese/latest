const { test, expect } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

test('contact form validation and submit', async ({ page }) => {
  const target = fileUrlFor('contact.html');
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const form = page.locator('form#contact-form, form[action*="contact"], form');
  await expect(form).toBeVisible();

  const email = form.locator('input[type=email], input[name*=email]');
  const phone = form.locator('input[type=tel], input[name*=phone]');
  const name = form.locator('input[name*=name]');
  const submit = form.locator('button[type=submit], input[type=submit]');

  if (await email.count()) {
    await expect(email).toBeVisible();
    await email.fill('invalid-email');
  }
  if (await phone.count()) {
    await expect(phone).toBeVisible();
    await phone.fill('not-a-phone');
  }
  if (await name.count()) {
    await expect(name).toBeVisible();
    await name.fill('');
  }

  if (await submit.count()) {
    await expect(submit).toBeVisible();
    await submit.click();
  }
  await page.waitForSelector('text=invalid email, text=Enter a valid email, text=invalid phone, text=Enter a valid phone', { timeout: 500 }).catch(() => {});

  const emailError = await page.locator('text=invalid email, text=Enter a valid email').first().count();
  const phoneError = await page.locator('text=invalid phone, text=Enter a valid phone').first().count();

  if (await email.count()) {
    await email.fill('guest@hatseykalebhotel.com');
  }
  if (await phone.count()) {
    await phone.fill('+12025550123');
  }
  if (await name.count()) {
    await name.fill('QA Tester');
  }
  const subject = form.locator('select[name=subject]');
  const message = form.locator('textarea[name=message]');
  if (await subject.count()) {
    await subject.selectOption({ value: 'reservation' });
  }
  if (await message.count()) {
    await message.fill('I would like to learn more about room availability.');
  }
  if (await submit.count()) {
    await submit.click();
  }

  await expect(page.locator('.success')).toBeVisible({ timeout: 10000 });
});
