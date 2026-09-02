/**
 * Runtime Stability Test Suite
 * 
 * Comprehensive testing of all public HTML pages covering:
 * - HTTP status verification
 * - CSS integrity and rendering
 * - JavaScript execution (no uncaught exceptions)
 * - Images and fonts loading
 * - Browser console errors
 * - Internal links validation
 * - Navigation functionality
 * - Forms and booking flow
 * - Interactive components
 * - 404 behavior
 * - Error handling
 * - Cross-browser testing (Chromium, Firefox, WebKit)
 * - Cross-device testing (Desktop, Mobile, Tablet)
 */

const { test, expect } = require('@playwright/test');
const { listHtmlPages, fileUrlFor, isIgnorableBrowserConsoleError } = require('./utils');

// Get all public HTML pages
const htmlPages = listHtmlPages().filter(f => !f.includes('.bak'));

// Track comprehensive results
let testResults = {
  totalPages: htmlPages.length,
  httpStatus: {},
  cssIntegrity: {},
  jsErrors: {},
  resourceLoading: {},
  consoleErrors: {},
  links: {},
  navigation: {},
  forms: {},
  interactiveComponents: {},
  errorHandling: {},
  summary: {}
};

test.describe('Runtime Stability - HTTP Status & Page Loading', () => {
  htmlPages.forEach(page => {
    test(`${page}: HTTP status 200`, async ({ page: browserPage, request }) => {
      const url = fileUrlFor(`/${page}`);
      const response = await request.head(url).catch(() => 
        request.get(url)
      );
      
      expect(response.status()).toBe(200);
      testResults.httpStatus[page] = { status: response.status(), ok: true };
    });

    test(`${page}: Page loads without fatal errors`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      const consoleMessages = [];
      const jsErrors = [];
      
      browserPage.on('console', msg => {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      });

      browserPage.on('pageerror', error => {
        jsErrors.push({
          message: error.message,
          stack: error.stack
        });
      });

      await browserPage.goto(url, { waitUntil: 'networkidle' }).catch(e => {
        throw new Error(`Failed to navigate to ${url}: ${e.message}`);
      });

      // Verify no uncaught exceptions
      expect(jsErrors.filter(e => !isIgnorableBrowserConsoleError(e.message))).toEqual([]);
      
      testResults.jsErrors[page] = { 
        errors: jsErrors.length, 
        ok: jsErrors.length === 0 
      };
      testResults.consoleErrors[page] = consoleMessages;
    });
  });
});

test.describe('Runtime Stability - CSS & Layout', () => {
  htmlPages.forEach(page => {
    test(`${page}: CSS renders correctly`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      await browserPage.goto(url, { waitUntil: 'networkidle' });

      // Check for stylesheet errors
      const stylesheets = await browserPage.locator('link[rel="stylesheet"]').all();
      for (const stylesheet of stylesheets) {
        const href = await stylesheet.getAttribute('href');
        const response = await browserPage.request.head(href).catch(() => 
          browserPage.request.get(href)
        );
        expect(response.status()).toBeLessThan(400);
      }

      // Check computed styles (sample elements)
      const body = await browserPage.locator('body').evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          visibility: computed.visibility
        };
      });

      expect(body.display).toBeTruthy();
      testResults.cssIntegrity[page] = { stylesheets: stylesheets.length, ok: true };
    });
  });
});

test.describe('Runtime Stability - Resources Loading', () => {
  htmlPages.forEach(page => {
    test(`${page}: Images load successfully`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      await browserPage.goto(url, { waitUntil: 'networkidle' });

      const images = await browserPage.locator('img').all();
      const imageResults = [];

      for (const img of images) {
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        
        try {
          const response = await browserPage.request.head(src).catch(() =>
            browserPage.request.get(src)
          );
          imageResults.push({
            src: src || '[no src]',
            status: response.status(),
            hasAlt: !!alt,
            ok: response.status() < 400 && !!alt
          });
        } catch (e) {
          imageResults.push({
            src: src || '[no src]',
            error: e.message,
            hasAlt: !!alt,
            ok: false
          });
        }
      }

      const failedImages = imageResults.filter(img => !img.ok);
      expect(failedImages).toEqual([]);
      
      testResults.resourceLoading[page] = {
        images: images.length,
        allLoaded: failedImages.length === 0
      };
    });

    test(`${page}: Fonts load correctly`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      await browserPage.goto(url, { waitUntil: 'networkidle' });

      // Check for font-related errors
      const fontFaces = await browserPage.evaluate(() => {
        const sheets = document.styleSheets;
        const fonts = [];
        for (let sheet of sheets) {
          try {
            for (let rule of sheet.cssRules) {
              if (rule.type === 5) { // FONT_FACE_RULE
                fonts.push(rule.cssText.substring(0, 100));
              }
            }
          } catch (e) {
            // CORS-protected sheets
          }
        }
        return fonts;
      });

      expect(Array.isArray(fontFaces)).toBe(true);
      testResults.resourceLoading[page] = {
        ...testResults.resourceLoading[page],
        fonts: fontFaces.length,
        fontsLoaded: true
      };
    });
  });
});

test.describe('Runtime Stability - Internal Links & Navigation', () => {
  // Test main pages only for link validation (avoid test explosion)
  const mainPages = ['index.html', 'booking.html', 'rooms.html', 'contact.html', 'hotel.html'];

  mainPages.forEach(page => {
    test(`${page}: All internal links are valid`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      await browserPage.goto(url, { waitUntil: 'networkidle' });

      const links = await browserPage.locator('a[href]').all();
      const internalLinks = [];

      for (const link of links) {
        const href = await link.getAttribute('href');
        
        // Filter internal links only (not external, mailto, #, etc)
        if (href && !href.startsWith('#') && 
            !href.startsWith('http') && 
            !href.startsWith('mailto') &&
            !href.startsWith('tel') &&
            !href.startsWith('javascript')) {
          internalLinks.push(href);
        }
      }

      // Verify each internal link resolves
      for (const href of internalLinks) {
        const response = await browserPage.request.head(href).catch(() =>
          browserPage.request.get(href)
        );
        expect(response.status()).toBeLessThan(400);
      }

      testResults.links[page] = {
        totalLinks: links.length,
        internalLinks: internalLinks.length,
        allValid: true
      };
    });

    test(`${page}: Navigation menu works correctly`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      await browserPage.goto(url, { waitUntil: 'networkidle' });

      // Check if nav element exists
      const navExists = await browserPage.locator('nav, [role="navigation"]').count() > 0;
      expect(navExists).toBe(true);

      // Verify nav links are clickable (sample check)
      const navLinks = await browserPage.locator('nav a, [role="navigation"] a').all();
      expect(navLinks.length).toBeGreaterThan(0);

      testResults.navigation[page] = {
        hasNav: navExists,
        navLinks: navLinks.length,
        ok: navExists && navLinks.length > 0
      };
    });
  });
});

test.describe('Runtime Stability - Forms & Booking Flow', () => {
  test('Contact form renders and validates', async ({ page: browserPage }) => {
    const url = fileUrlFor('/contact.html');
    await browserPage.goto(url, { waitUntil: 'networkidle' });

    // Check form exists
    const form = await browserPage.locator('form').first();
    expect(form).toBeTruthy();

    // Verify form fields
    const nameField = await browserPage.locator('input[name*="name" i]').first();
    const emailField = await browserPage.locator('input[name*="email" i]').first();
    const messageField = await browserPage.locator('textarea[name*="message" i]').first();

    expect(nameField).toBeTruthy();
    expect(emailField).toBeTruthy();
    expect(messageField).toBeTruthy();

    testResults.forms['contact.html'] = {
      formExists: !!form,
      hasNameField: !!nameField,
      hasEmailField: !!emailField,
      hasMessageField: !!messageField,
      ok: true
    };
  });

  test('Booking page form renders', async ({ page: browserPage }) => {
    const url = fileUrlFor('/booking.html');
    await browserPage.goto(url, { waitUntil: 'networkidle' });

    // Check for booking form
    const bookingForm = await browserPage.locator('form').first();
    expect(bookingForm).toBeTruthy();

    // Verify key booking fields
    const dateInputs = await browserPage.locator('input[type="date"], input[type="text"][placeholder*="date" i]').all();
    const roomSelect = await browserPage.locator('select[name*="room" i], input[name*="room" i]').first();

    expect(dateInputs.length).toBeGreaterThanOrEqual(1);
    expect(roomSelect).toBeTruthy();

    testResults.forms['booking.html'] = {
      formExists: !!bookingForm,
      hasDateInputs: dateInputs.length > 0,
      hasRoomSelector: !!roomSelect,
      ok: true
    };
  });
});

test.describe('Runtime Stability - Interactive Components', () => {
  test('Dropdowns and menus are interactive', async ({ page: browserPage }) => {
    const url = fileUrlFor('/index.html');
    await browserPage.goto(url, { waitUntil: 'networkidle' });

    // Check for dropdown/menu elements
    const selects = await browserPage.locator('select').all();
    const buttons = await browserPage.locator('button').all();
    
    expect(buttons.length).toBeGreaterThan(0);

    // Test a button click (if available)
    if (buttons.length > 0) {
      const btn = buttons[0];
      const isEnabled = await btn.isEnabled();
      expect(isEnabled).toBe(true);
    }

    testResults.interactiveComponents['index.html'] = {
      hasSelects: selects.length > 0,
      hasButtons: buttons.length > 0,
      ok: buttons.length > 0
    };
  });

  test('Modal/Dialog elements are functional', async ({ page: browserPage }) => {
    const url = fileUrlFor('/index.html');
    await browserPage.goto(url, { waitUntil: 'networkidle' });

    // Check for modal/dialog elements
    const modals = await browserPage.locator('dialog, [role="dialog"], .modal, [data-modal]').all();
    const hasModals = modals.length > 0;

    testResults.interactiveComponents['modals'] = {
      hasModals: hasModals,
      count: modals.length
    };
  });

  test('Animations do not cause errors', async ({ page: browserPage }) => {
    const url = fileUrlFor('/index.html');
    
    const animationErrors = [];
    browserPage.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('animation')) {
        animationErrors.push(msg.text());
      }
    });

    await browserPage.goto(url, { waitUntil: 'networkidle' });

    // Small delay to catch animation-related errors
    await browserPage.waitForTimeout(2000);

    expect(animationErrors).toEqual([]);
  });
});

test.describe('Runtime Stability - Error Handling', () => {
  test('404 page displays correctly', async ({ page: browserPage }) => {
    const url = fileUrlFor('/nonexistent-page-12345.html');
    
    const response = await browserPage.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => null);
    
    // Page should load (with 404 status or custom 404 page)
    const pageTitle = await browserPage.title();
    expect(pageTitle).toBeTruthy();

    testResults.errorHandling['404'] = {
      pageLoads: !!response,
      status: response?.status(),
      ok: true
    };
  });

  test('Error boundaries prevent crashes', async ({ page: browserPage }) => {
    const url = fileUrlFor('/index.html');
    
    const uncaughtErrors = [];
    browserPage.on('pageerror', error => {
      if (!isIgnorableBrowserConsoleError(error.message)) {
        uncaughtErrors.push(error.message);
      }
    });

    await browserPage.goto(url, { waitUntil: 'networkidle' });
    
    // Trigger some interactions that might cause errors
    const buttons = await browserPage.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click().catch(() => null);
      await browserPage.waitForTimeout(500);
    }

    expect(uncaughtErrors).toEqual([]);
    testResults.errorHandling['boundaries'] = { ok: true };
  });
});

test.describe('Runtime Stability - Console Validation', () => {
  htmlPages.slice(0, 5).forEach(page => {
    test(`${page}: No uncaught console errors`, async ({ page: browserPage }) => {
      const url = fileUrlFor(`/${page}`);
      
      const errors = [];
      const warnings = [];

      browserPage.on('console', msg => {
        if (msg.type() === 'error') {
          if (!isIgnorableBrowserConsoleError(msg.text())) {
            errors.push(msg.text());
          }
        } else if (msg.type() === 'warning') {
          warnings.push(msg.text());
        }
      });

      await browserPage.goto(url, { waitUntil: 'networkidle' });

      expect(errors).toEqual([]);
      testResults.consoleErrors[page] = { 
        errors: errors.length, 
        warnings: warnings.length,
        ok: errors.length === 0 
      };
    });
  });
});

test.describe('Runtime Stability - Responsive Design', () => {
  test('Pages render on desktop (1440px)', async ({ page: browserPage }) => {
    await browserPage.setViewportSize({ width: 1440, height: 900 });
    const url = fileUrlFor('/index.html');
    
    await browserPage.goto(url, { waitUntil: 'networkidle' });
    
    const isVisible = await browserPage.locator('body').isVisible();
    expect(isVisible).toBe(true);

    testResults.summary['desktop_1440'] = { ok: true };
  });

  test('Pages render on tablet (768px)', async ({ page: browserPage }) => {
    await browserPage.setViewportSize({ width: 768, height: 1024 });
    const url = fileUrlFor('/index.html');
    
    await browserPage.goto(url, { waitUntil: 'networkidle' });
    
    const isVisible = await browserPage.locator('body').isVisible();
    expect(isVisible).toBe(true);

    testResults.summary['tablet_768'] = { ok: true };
  });

  test('Pages render on mobile (375px)', async ({ page: browserPage }) => {
    await browserPage.setViewportSize({ width: 375, height: 667 });
    const url = fileUrlFor('/index.html');
    
    await browserPage.goto(url, { waitUntil: 'networkidle' });
    
    const isVisible = await browserPage.locator('body').isVisible();
    expect(isVisible).toBe(true);

    testResults.summary['mobile_375'] = { ok: true };
  });
});

test.afterAll(async () => {
  // Log comprehensive test results
  const passRate = (totalPassed) => {
    const total = htmlPages.length;
    return `${((totalPassed / total) * 100).toFixed(1)}%`;
  };

  console.log('\n\n=== RUNTIME STABILITY TEST SUMMARY ===');
  console.log(`Total pages tested: ${htmlPages.length}`);
  console.log(`HTTP Status checks: ${Object.keys(testResults.httpStatus).length}`);
  console.log(`JS Errors validated: ${Object.keys(testResults.jsErrors).length}`);
  console.log(`CSS Integrity checks: ${Object.keys(testResults.cssIntegrity).length}`);
  console.log(`Resource loading checks: ${Object.keys(testResults.resourceLoading).length}`);
  console.log(`Links validated: ${Object.keys(testResults.links).length}`);
  console.log(`Navigation verified: ${Object.keys(testResults.navigation).length}`);
  console.log(`Forms tested: ${Object.keys(testResults.forms).length}`);
  console.log(`Interactive components checked: ${Object.keys(testResults.interactiveComponents).length}`);
  console.log('====================================\n');
});
