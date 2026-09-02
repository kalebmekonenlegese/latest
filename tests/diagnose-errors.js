const { chromium } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

const EXTERNAL_DOMAINS = ['cdn.lordicon.com', 'images.unsplash.com', 'fonts.googleapis.com', 'cdn.jsdelivr.net'];

function isExternalResourceError(text) {
  return EXTERNAL_DOMAINS.some(domain => text.includes(domain))
         || text.includes('Failed to load resource')
         || (text.includes('Unexpected token') && text.includes('is not valid JSON'));
}

async function diagnoseErrors() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const pages = ['ai-assistant.html', 'attractions.html', 'blog.html', 'booking.html'];

  for (const p of pages) {
    console.log(`\n📄 ${p}:`);
    const errors = [];
    const warnings = [];

    page.on('pageerror', e => {
      if (!isExternalResourceError(e.message)) {
        errors.push(e.message);
      }
    });
    page.on('console', msg => {
      if (msg.type() === 'error' && !isExternalResourceError(msg.text())) {
        errors.push(`[Console] ${msg.text()}`);
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    try {
      const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (!response || !response.ok()) {
        console.log(`  ✗ HTTP error loading ${p}: ${response ? response.status() : 'no response'}`);
      }

      if (errors.length > 0) {
        console.log('  ⚠️  ERRORS:');
        errors.forEach(e => console.log(`    - ${e}`));
      } else {
        console.log('  ✅ No errors (external CDN failures excluded)');
      }
    } catch (err) {
      console.log(`  ✗ Failed to load: ${err.message}`);
    }
  }

  await browser.close();
}

diagnoseErrors().catch(console.error);
