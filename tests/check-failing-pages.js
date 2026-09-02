const { chromium } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

const EXTERNAL_DOMAINS = ['cdn.lordicon.com', 'images.unsplash.com', 'fonts.googleapis.com', 'cdn.jsdelivr.net'];

function isExternalResourceError(text) {
  return EXTERNAL_DOMAINS.some(domain => text.includes(domain))
         || text.includes('Failed to load resource')
         || (text.includes('Unexpected token') && text.includes('is not valid JSON'));
}

async function checkSpecificPages() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pages = ['hotel.html', 'index.html', 'standard-room.html'];

  for (const p of pages) {
    console.log(`\n📄 ${p}:`);
    const errors = [];

    page.on('pageerror', e => {
      if (!isExternalResourceError(e.message)) {
        errors.push(e.message);
      }
    });
    page.on('console', msg => {
      if (msg.type() === 'error' && !isExternalResourceError(msg.text())) {
        errors.push(`[Console] ${msg.text()}`);
      }
    });

    try {
      const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(response && response.ok()).toBeTruthy();
      if (errors.length === 0) {
        console.log('  ✅ No errors (external CDN failures excluded)');
      } else {
        console.log(`  ⚠️ ERRORS (${errors.length}):`);
        errors.forEach(e => console.log(`    - ${e}`));
      }
    } catch (err) {
      console.log(`  ❌ Failed to load: ${err.message}`);
    }
  }

  await browser.close();
}

checkSpecificPages().catch(console.error);
