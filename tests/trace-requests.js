const { chromium } = require('@playwright/test');
const { fileUrlFor } = require('./utils');

async function traceRequests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Intercept all network requests
  const requests = [];
  page.on('request', req => {
    requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() });
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      console.log(`⚠️  ${res.status()} - ${res.url()}`);
    }
  });

  const page_name = 'ai-assistant.html';
  console.log(`Loading ${page_name}...`);
  const response = await page.goto(fileUrlFor(page_name), { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || !response.ok()) {
    console.log(`  ✗ HTTP error loading ${page_name}: ${response ? response.status() : 'no response'}`);
  }

  console.log('\nNetwork requests that failed (4xx/5xx):');
  const failed = requests.filter(r => r.url.includes('assets/api'));
  failed.forEach(r => console.log(`  ${r.method} ${r.url}`));

  await browser.close();
}

traceRequests().catch(console.error);
