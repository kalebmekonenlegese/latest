const { chromium } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

async function traceDetailedErrors() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('pageerror', error => {
    console.log('\n🔴 Uncaught Error:');
    console.log(`   ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('\n📛 Console Error:');
      console.log(`   ${msg.text()}`);
      console.log(`   Args: ${msg.args().length > 0 ? 'yes' : 'no'}`);
    }
  });

  console.log('Loading ai-assistant.html...\n');
  const response = await page.goto(fileUrlFor('ai-assistant.html'), { waitUntil: 'domcontentloaded', timeout: 10000 });
  await expect(response && response.ok()).toBeTruthy();

  console.log('\nPage loaded successfully.');
  await browser.close();
}

traceDetailedErrors().catch(console.error);
