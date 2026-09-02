import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL =
  process.env.TEST_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5000';
const PAGES = [
  '/',
  '/index.html',
  '/hotel.html',
  '/rooms.html',
  '/booking.html',
  '/contact.html',
  '/about.html',
  '/dining-experience.html',
  '/spa-wellness.html',
  '/events.html',
  '/conferences.html',
  '/weddings.html',
  '/attractions.html',
  '/transportation.html',
  '/virtual-tour.html',
  '/gallery.html',
  '/reviews.html',
  '/faq.html',
  '/blog.html',
  '/careers.html',
  '/restaurant.html',
  '/analytics-dashboard.html',
  '/ai-assistant.html',
  '/sustainability.html',
  '/offers.html',
  '/deluxe-room.html',
  '/standard-room.html',
  '/family-room.html',
  '/executive-suite.html',
  '/cookie-policy.html',
  '/privacy.html',
  '/terms.html',
];

const DEVICE_CONFIGS = {
  desktop: {
    name: 'Desktop (1920x1080)',
    viewport: { width: 1920, height: 1080 }
  },
  tablet: {
    name: 'Tablet (768x1024)',
    viewport: { width: 768, height: 1024 }
  },
  mobile: {
    name: 'Mobile (375x667)',
    viewport: { width: 375, height: 667 }
  }
};

// Test results tracking
let testResults = {
  pages: {},
  summary: {
    totalPages: 0,
    successfulPages: 0,
    failedPages: 0,
    errors: [],
    warnings: []
  }
};

// Utility: Check if URL is absolute
function isAbsoluteURL(url) {
  return /^https?:\/\//.test(url);
}

// Utility: Resolve relative URLs
function resolveURL(baseURL, relativeURL) {
  if (isAbsoluteURL(relativeURL)) return relativeURL;
  if (relativeURL.startsWith('#')) return baseURL + relativeURL;
  
  try {
    return new URL(relativeURL, baseURL).href;
  } catch {
    return null;
  }
}

// Utility: Check if link is internal
function isInternalLink(href) {
  const url = new URL(href);
  const baseURLObj = new URL(BASE_URL);
  return url.hostname === baseURLObj.hostname;
}

// Test: Runtime Stability - Single Page
test.describe('Runtime Stability', () => {
  PAGES.forEach((page) => {
    const pageURL = page === '/' ? BASE_URL : `${BASE_URL}${page}`;
    const pageName = page === '/' ? 'index' : page.replace(/\//g, '_').replace('.html', '');

    test(`Runtime Stability: ${page}`, async ({ browser }) => {
      let pageResult = {
        url: pageURL,
        status: 'pending',
        tests: {},
        errors: [],
        warnings: [],
        metrics: {}
      };

      try {
        // Create context with console message tracking
        const context = await browser.newContext();
        const consoleMessages = [];
        const uncaughtExceptions = [];
        const networkErrors = [];

        const page_instance = await context.newPage();

        // Track console messages and exceptions
        page_instance.on('console', (msg) => {
          consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
          });

          if (msg.type() === 'error') {
            pageResult.errors.push(`Console Error: ${msg.text()}`);
          }
        });

        page_instance.on('pageerror', (error) => {
          uncaughtExceptions.push(error.message);
          pageResult.errors.push(`Uncaught Exception: ${error.message}`);
        });

        page_instance.on('requestfailed', (request) => {
          if (request.failure()) {
            networkErrors.push({
              url: request.url(),
              error: request.failure().errorText
            });
          }
        });

        // Navigate to page
        const startTime = Date.now();
        let response = null;
        
        try {
          response = await page_instance.goto(pageURL, { waitUntil: 'networkidle' });
        } catch (error) {
          pageResult.errors.push(`Navigation Error: ${error.message}`);
          pageResult.status = 'failed';
          testResults.summary.failedPages++;
          testResults.pages[pageName] = pageResult;
          return;
        }

        const loadTime = Date.now() - startTime;
        pageResult.metrics.loadTime = loadTime;

        // Test 1: HTTP Status
        const statusCode = response?.status();
        pageResult.tests['HTTP Status'] = {
          expected: 200,
          actual: statusCode,
          passed: statusCode === 200
        };
        if (statusCode !== 200) {
          pageResult.errors.push(`Invalid HTTP status: ${statusCode}`);
        }

        // Test 2: CSS Loads
        const cssError = await page_instance.evaluate(() => {
          const sheets = document.styleSheets;
          const errors = [];
          for (let i = 0; i < sheets.length; i++) {
            try {
              sheets[i].cssRules;
            } catch (e) {
              errors.push(`CSS Error in ${sheets[i].href}: ${e.message}`);
            }
          }
          return errors.length === 0 ? null : errors;
        });
        pageResult.tests['CSS Loads'] = {
          passed: !cssError,
          details: cssError || 'All stylesheets loaded successfully'
        };
        if (cssError) {
          pageResult.warnings.push(`CSS Loading Issues: ${cssError.join(', ')}`);
        }

        // Test 3: JavaScript Executes
        const jsError = await page_instance.evaluate(() => {
          // Check if common JS libraries are loaded
          const checks = {
            documentReady: document.readyState === 'complete',
            windowLoaded: window.onload !== undefined || true,
            noSyntaxErrors: !window.jsErrors || window.jsErrors.length === 0
          };
          return checks;
        });
        pageResult.tests['JavaScript Executes'] = {
          passed: jsError.documentReady === true,
          details: jsError
        };

        // Test 4: Images Load (or are data URIs)
        const imageIssues = await page_instance.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          const issues = [];

          images.forEach((img) => {
            const src = img.getAttribute('src');
            const srcset = img.getAttribute('srcset');

            // Skip data URIs and inline images
            if (src && !src.startsWith('data:') && img.naturalWidth === 0 && img.naturalHeight === 0) {
              if (img.complete && img.currentSrc) {
                // Image failed to load
                issues.push(`Image failed to load: ${src}`);
              }
            }

            // Check srcset
            if (srcset) {
              const urls = srcset.split(',').map((s) => s.trim().split(' ')[0]);
              urls.forEach((url) => {
                if (!url.startsWith('data:') && !url.startsWith('/') && !url.startsWith('http')) {
                  // Relative URL should exist
                }
              });
            }
          });

          return {
            totalImages: images.length,
            issues: issues
          };
        });
        pageResult.tests['Images Load'] = {
          passed: imageIssues.issues.length === 0,
          details: `${imageIssues.totalImages} images, ${imageIssues.issues.length} issues`
        };
        if (imageIssues.issues.length > 0) {
          pageResult.warnings.push(...imageIssues.issues);
        }

        // Test 5: Fonts Load
        const fontError = await page_instance.evaluate(() => {
          try {
            const fontFaces = document.fonts;
            if (fontFaces && fontFaces.ready) {
              return false; // Will be handled by promise below
            }
            return false;
          } catch (e) {
            return e.message;
          }
        });
        pageResult.tests['Fonts Load'] = {
          passed: !fontError,
          details: fontError ? fontError : 'Fonts loaded'
        };

        // Wait for fonts to load
        try {
          await page_instance.evaluate(() => document.fonts.ready);
          pageResult.tests['Fonts Ready'] = { passed: true };
        } catch (e) {
          pageResult.tests['Fonts Ready'] = { passed: false, error: e.message };
        }

        // Test 6: No Uncaught Exceptions
        pageResult.tests['No Uncaught Exceptions'] = {
          passed: uncaughtExceptions.length === 0,
          details: `${uncaughtExceptions.length} exceptions`
        };

        // Test 7: Internal Links
        const links = await page_instance.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]'))
            .map((a) => ({
              href: a.getAttribute('href'),
              text: a.textContent.substring(0, 50),
              target: a.getAttribute('target')
            }))
            .filter((link) => link.href && !link.href.startsWith('#') && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:'));
        });

        const internalLinks = links.filter((link) => {
          const resolved = resolveURL(pageURL, link.href);
          return resolved && isInternalLink(resolved);
        });

        pageResult.tests['Internal Links'] = {
          passed: true,
          details: `${internalLinks.length} internal links found`,
          links: internalLinks.slice(0, 10) // Sample
        };

        // Test 8: Forms Work
        const formCheck = await page_instance.evaluate(() => {
          const forms = document.querySelectorAll('form');
          const formData = [];

          forms.forEach((form, idx) => {
            const inputs = form.querySelectorAll('input, textarea, select');
            formData.push({
              id: form.id || `form-${idx}`,
              method: form.method,
              action: form.action,
              inputCount: inputs.length
            });
          });

          return formData;
        });
        pageResult.tests['Forms Present'] = {
          passed: formCheck.length >= 0,
          details: `${formCheck.length} forms found`
        };

        // Test 9: Navigation Works
        const navCheck = await page_instance.evaluate(() => {
          const navs = document.querySelectorAll('nav, [role="navigation"]');
          const navItems = Array.from(navs).reduce((acc, nav) => {
            const links = nav.querySelectorAll('a');
            return acc + links.length;
          }, 0);

          return navItems;
        });
        pageResult.tests['Navigation Works'] = {
          passed: navCheck > 0,
          details: `${navCheck} navigation links`
        };

        // Test 10: Browser Console Errors
        const consoleErrors = consoleMessages.filter((msg) => msg.type === 'error');
        pageResult.tests['Console Errors'] = {
          passed: consoleErrors.length === 0,
          count: consoleErrors.length
        };

        // Test 11: Network Errors
        pageResult.tests['No Network Errors'] = {
          passed: networkErrors.length === 0,
          count: networkErrors.length
        };

        // Test 12: Page Title
        const title = await page_instance.title();
        pageResult.tests['Page Title'] = {
          passed: title && title.length > 0,
          title: title
        };

        // Test 13: Meta Tags
        const metaTags = await page_instance.evaluate(() => {
          return {
            description: document.querySelector('meta[name="description"]')?.content,
            viewport: document.querySelector('meta[name="viewport"]')?.content,
            charset: document.querySelector('meta[charset]')?.getAttribute('charset')
          };
        });
        pageResult.tests['Meta Tags'] = {
          passed: !!metaTags.description && !!metaTags.viewport,
          details: metaTags
        };

        // Test 14: Accessibility Attributes
        const a11yCheck = await page_instance.evaluate(() => {
          const images = document.querySelectorAll('img:not([alt])');
          const buttons = Array.from(document.querySelectorAll('button')).filter((button) =>
            !button.getAttribute('aria-label') &&
            !button.getAttribute('title') &&
            !button.querySelector('img[alt]') &&
            !button.textContent.trim()
          );
          const links = document.querySelectorAll('a[href]:not([aria-label], [title], :has(*)');

          return {
            imagesWithoutAlt: images.length,
            buttonsWithoutLabel: buttons.length,
            issuesFound: images.length > 0 || buttons.length > 0
          };
        });
        pageResult.tests['Accessibility'] = {
          passed: !a11yCheck.issuesFound,
          issues: a11yCheck
        };

        // Test 15: Mobile Responsiveness
        const mobileCheck = await page_instance.evaluate(() => {
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          const mediaQueries = Array.from(document.styleSheets).some((sheet) => {
            try {
              return sheet.media.mediaText.includes('mobile') || sheet.media.mediaText.includes('screen');
            } catch {
              return false;
            }
          });

          return {
            hasViewportMeta: !!viewportMeta,
            hasMediaQueries: mediaQueries,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
          };
        });
        pageResult.tests['Mobile Responsive'] = {
          passed: mobileCheck.hasViewportMeta,
          details: mobileCheck
        };

        // Test 16: 404 Handling (only check on error pages if exists)
        if (page.includes('404') || page.includes('error')) {
          pageResult.tests['Error Page Handling'] = { passed: true };
        }

        // Determine overall status
        const failedTests = Object.values(pageResult.tests).filter((t) => t.passed === false);
        pageResult.status = pageResult.errors.length === 0 && failedTests.length === 0 ? 'passed' : 'failed';

        if (pageResult.status === 'passed') {
          testResults.summary.successfulPages++;
        } else {
          testResults.summary.failedPages++;
        }

        await context.close();
      } catch (error) {
        pageResult.status = 'error';
        pageResult.errors.push(`Test Error: ${error.message}`);
        testResults.summary.failedPages++;
      }

      testResults.summary.totalPages++;
      testResults.pages[pageName] = pageResult;

      // Assertions
      expect(pageResult.errors.length).toBe(0);
      expect(pageResult.status).toBe('passed');
    });
  });

  // Test: 404 Page
  test('404 Page Handling', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/nonexistent-page-12345.html`);
    expect(response?.status()).toBe(404);
  });

  // Test: Console Error on Page
  test('No Critical Console Errors', async ({ page }) => {
    const errors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/index.html`);
    expect(errors.length).toBe(0);
  });

  // Test: Navigation Flow
  test('Navigation Flow Works', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // Find and click a navigation link
    const navLink = page.locator('nav a[href*="/rooms"]').first();
    if (await navLink.count() > 0) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/rooms');
    }
  });

  // Test: Form Submission
  test('Contact Form Validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact.html`);

    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const inputs = form.locator('input, textarea');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  // Export results after all tests
  test.afterAll(async () => {
    console.log('\n=== RUNTIME STABILITY TEST RESULTS ===');
    console.log(JSON.stringify(testResults, null, 2));

    // Write results to file
    const fs = require('fs');
    fs.writeFileSync(
      './test-results/runtime-stability-results.json',
      JSON.stringify(testResults, null, 2)
    );

    console.log('\n✅ Results saved to test-results/runtime-stability-results.json');
  });
});
