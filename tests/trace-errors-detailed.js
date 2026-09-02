const { chromium } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

async function traceErrorsWithDetails() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];

  page.on('pageerror', error => {
    errors.push({ type: 'pageerror', message: error.message, stack: error.stack });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', message: msg.text() });
    }
  });

  try {
    const response = await page.goto(fileUrlFor('hotel.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(response && response.ok()).toBeTruthy();
  } catch (err) {
    console.error('Failed to load:', err.message);
  }

  console.log('\n=== ERRORS ON hotel.html ===');
  console.log(JSON.stringify(errors, null, 2));

  await browser.close();
}

traceErrorsWithDetails().catch(console.error);
