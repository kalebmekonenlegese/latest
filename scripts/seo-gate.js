#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const robotsPath = path.join(root, 'robots.txt');
const sitemapPath = path.join(root, 'sitemap.xml');
const productionOrigin = 'https://hatseykalebhotel.com';
const ignoredPages = new Set(['analytics-dashboard.html']);

function fail(message) {
  console.error(`❌ SEO gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function readHtml(fileName) {
  return fs.readFileSync(path.join(root, fileName), 'utf8');
}

function getTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function getMetaContent(html, selector) {
  const match = html.match(new RegExp(selector, 'i'));
  return match ? (match[1] || '').trim() : '';
}

if (!fs.existsSync(robotsPath)) fail(`Missing robots.txt: ${robotsPath}`);
if (!fs.existsSync(sitemapPath)) fail(`Missing sitemap.xml: ${sitemapPath}`);

const robots = fs.readFileSync(robotsPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => match[1].trim());

assert(/User-agent\s*:/i.test(robots), 'robots.txt is missing a User-agent directive.');
assert(/Allow:\s*\//i.test(robots), 'robots.txt should allow public content.');
assert(
  /Sitemap:\s*https?:\/\/hatseykalebhotel\.com\/sitemap\.xml/i.test(robots),
  'robots.txt does not reference the production sitemap.'
);
assert(sitemapUrls.length >= 10, 'sitemap.xml has too few production URLs to support discovery.');
assert(
  sitemapUrls.every((url) => /^https:\/\/hatseykalebhotel\.com\//i.test(url)),
  'sitemap.xml contains non-production or invalid URLs.'
);
assert(
  /Disallow:\s*\/api\//i.test(robots) && /Disallow:\s*\/admin\//i.test(robots),
  'robots.txt must disallow private API and admin routes.'
);

const htmlFiles = fs
  .readdirSync(root)
  .filter((file) => file.toLowerCase().endsWith('.html'))
  .sort();

const titles = new Map();
const descriptions = new Map();

for (const fileName of htmlFiles) {
  if (ignoredPages.has(fileName)) {
    const html = readHtml(fileName);
    const title = getTitle(html);
    const canonical = getMetaContent(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
    );
    const robotsMeta =
      /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["'][^>]*>/i.test(html);
    assert(title && title.length >= 12, `Internal page ${fileName} is missing a meaningful title.`);
    assert(
      canonical && canonical.startsWith(productionOrigin),
      `Internal page ${fileName} must use a production canonical URL.`
    );
    assert(robotsMeta, `Internal page ${fileName} is missing a noindex robot directive.`);
    continue;
  }

  const html = readHtml(fileName);
  const title = getTitle(html);
  const description = getMetaContent(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const canonical = getMetaContent(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
  );
  const ogTitle = getMetaContent(
    html,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const ogDescription = getMetaContent(
    html,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const ogUrl = getMetaContent(
    html,
    /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const ogImage = getMetaContent(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const twitterCard = getMetaContent(
    html,
    /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const twitterTitle = getMetaContent(
    html,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const twitterDescription = getMetaContent(
    html,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const twitterImage = getMetaContent(
    html,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const hasLdJson = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
  const hasH1 = /<h1\b[^>]*>/i.test(html);
  const robotsMeta =
    /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["'][^>]*>/i.test(html);

  assert(title && title.length >= 12, `Public page ${fileName} is missing a descriptive title.`);
  assert(
    !/^(home|page|untitled|example|placeholder|test|hotel)$/i.test(title),
    `Public page ${fileName} has a generic or placeholder title: ${title}`
  );
  assert(
    description && description.length >= 50 && description.length <= 160,
    `Public page ${fileName} has an invalid meta description length.`
  );
  assert(
    !/(example|placeholder|dummy|lorem|yourdomain|localhost)/i.test(description),
    `Public page ${fileName} has a placeholder or non-production meta description.`
  );
  assert(
    canonical && canonical.startsWith(productionOrigin + '/'),
    `Public page ${fileName} has a missing or invalid canonical URL.`
  );
  assert(!robotsMeta, `Public page ${fileName} should not be marked as noindex.`);
  assert(ogTitle && ogTitle.length >= 12, `Public page ${fileName} is missing a valid og:title.`);
  assert(
    ogDescription && ogDescription.length >= 50,
    `Public page ${fileName} is missing a valid og:description.`
  );
  assert(
    ogUrl && ogUrl.startsWith(productionOrigin + '/'),
    `Public page ${fileName} has an invalid og:url.`
  );
  assert(
    /<meta[^>]+property=["']og:type["'][^>]+content=["']website["'][^>]*>/i.test(html),
    `Public page ${fileName} is missing an og:type of website.`
  );
  assert(
    ogImage && ogImage.startsWith(productionOrigin + '/'),
    `Public page ${fileName} is missing a production og:image.`
  );
  assert(
    twitterCard && twitterCard.length > 0,
    `Public page ${fileName} is missing a twitter:card.`
  );
  assert(
    twitterTitle && twitterTitle.length >= 12,
    `Public page ${fileName} is missing a twitter:title.`
  );
  assert(
    twitterDescription && twitterDescription.length >= 50,
    `Public page ${fileName} is missing a twitter:description.`
  );
  assert(
    twitterImage && twitterImage.startsWith(productionOrigin + '/'),
    `Public page ${fileName} is missing a production twitter:image.`
  );
  assert(hasLdJson, `Public page ${fileName} is missing JSON-LD structured data.`);
  assert(hasH1, `Public page ${fileName} is missing a primary H1 heading.`);

  if (titles.has(title)) {
    fail(`Duplicate page title detected: "${title}" on both ${titles.get(title)} and ${fileName}.`);
  }
  if (descriptions.has(description)) {
    fail(
      `Duplicate meta description detected: "${description}" on both ${descriptions.get(
        description
      )} and ${fileName}.`
    );
  }

  titles.set(title, fileName);
  descriptions.set(description, fileName);
}

const sitemapSet = new Set(sitemapUrls);
const expectedPublicPages = htmlFiles.filter((fileName) => !ignoredPages.has(fileName));
for (const fileName of expectedPublicPages) {
  const targetUrl = `${productionOrigin}/${fileName === 'index.html' ? '' : fileName}`;
  assert(sitemapSet.has(targetUrl), `sitemap.xml is missing the public page ${targetUrl}.`);
}

console.log(
  `✅ SEO gate passed: ${htmlFiles.length} HTML files reviewed; all public pages have unique titles/descriptions, valid production metadata, robots/sitemap integrity, and noindex-only internal pages.`
);
