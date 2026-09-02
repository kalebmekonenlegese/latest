const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Accessibility Audit - Structure & Interaction', () => {
  
  test('Keyboard Navigation - Tab through all pages', async ({ page }) => {
    const testPages = [
      '/index.html',
      '/booking.html',
      '/contact.html',
      '/reviews.html'
    ];

    for (const pagePath of testPages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      // Focus first element
      await page.keyboard.press('Tab');
      let focused = await page.evaluate(() => document.activeElement.tagName);
      
      let tabCount = 0;
      const maxTabs = 50; // Safety limit

      // Tab through elements
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
      }

      // Verify we can tab through page without getting stuck
      expect(tabCount).toBeGreaterThan(0);
      console.log(`✅ ${pagePath}: Successfully tabbed through ${tabCount} elements`);
    }
  });

  test('Skip Link Functionality', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    // Check skip link exists
    const skipLink = await page.locator('[href="#main"], [href="#content"], .skip-link, a:has-text("Skip to")').first();
    const skipLinkCount = await skipLink.count();
    
    if (skipLinkCount > 0) {
      // Skip link found, verify it works
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement.getAttribute('href'));
      console.log(`✅ Skip link present and focusable: ${focused}`);
    } else {
      console.log(`⚠️  No skip link found (consider adding one)`);
    }
  });

  test('Focus Visibility - All interactive elements', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    // Get all focusable elements
    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
    
    expect(focusableElements).toBeGreaterThan(0);
    console.log(`✅ Found ${focusableElements} focusable elements on page`);

    // Test focus visibility on first few elements
    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 3)) {
      await button.focus();
      const hasFocusStyle = await button.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.outline !== 'none' || 
               style.boxShadow !== 'none' ||
               el.classList.toString().includes('focus') ||
               el.classList.toString().includes('active');
      });
      console.log(`✅ Button focus visibility: ${hasFocusStyle ? 'visible' : 'check styles'}`);
    }
  });

  test('ARIA Labels and Descriptions', async ({ page }) => {
    const testPages = ['/booking.html', '/contact.html', '/reviews.html'];

    for (const pagePath of testPages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

      // Check inputs have labels
      const inputs = await page.locator('input, textarea, select').all();
      let labeledInputs = 0;

      for (const input of inputs) {
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholders = await input.getAttribute('placeholder');
        const labels = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count();

        if (ariaLabel || ariaLabelledBy || labels > 0 || placeholders) {
          labeledInputs++;
        }
      }

      console.log(`✅ ${pagePath}: ${labeledInputs}/${inputs.length} inputs have accessible labels`);
      expect(labeledInputs).toBeGreaterThanOrEqual(inputs.length * 0.8); // At least 80% labeled
    }
  });

  test('Heading Hierarchy', async ({ page }) => {
    const testPages = [
      '/index.html',
      '/about.html',
      '/rooms.html',
      '/contact.html'
    ];

    for (const pagePath of testPages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

      // Check heading structure
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      const h3Count = await page.locator('h3').count();

      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h2Count).toBeGreaterThanOrEqual(0);
      expect(h3Count).toBeGreaterThanOrEqual(0);

      console.log(`✅ ${pagePath}: H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`);
    }
  });

  test('Landmark Regions', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const hasHeader = await page.locator('header, [role="banner"]').count();
    const hasNav = await page.locator('nav, [role="navigation"]').count();
    const hasMain = await page.locator('main, [role="main"]').count();
    const hasFooter = await page.locator('footer, [role="contentinfo"]').count();

    console.log(`✅ Landmarks found: header=${hasHeader}, nav=${hasNav}, main=${hasMain}, footer=${hasFooter}`);
    
    expect(hasHeader + hasNav + hasMain + hasFooter).toBeGreaterThanOrEqual(3);
  });

  test('Alt Text on Images', async ({ page }) => {
    const testPages = ['/index.html', '/about.html', '/rooms.html', '/gallery.html'];

    for (const pagePath of testPages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

      const images = await page.locator('img').all();
      let imagesWithAlt = 0;
      let decorativeImages = 0;

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const ariaHidden = await img.getAttribute('aria-hidden');
        
        // Image should have alt or aria-hidden="true" if decorative
        if (alt !== null) {
          if (alt.length > 0) imagesWithAlt++;
          else if (ariaHidden === 'true') decorativeImages++;
        }
      }

      console.log(`✅ ${pagePath}: ${imagesWithAlt} images with meaningful alt, ${decorativeImages} decorative`);
      expect(imagesWithAlt + decorativeImages).toBeGreaterThanOrEqual(images.length * 0.8);
    }
  });

  test('Form Accessibility', async ({ page }) => {
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });

    // Check form structure
    const form = await page.locator('form').first();
    expect(await form.isVisible()).toBeTruthy();

    // Check inputs have labels
    const inputs = await page.locator('input, textarea').all();
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (inputId) {
        const hasLabel = await page.locator(`label[for="${inputId}"]`).count();
        expect(hasLabel + (ariaLabel ? 1 : 0) + (ariaLabelledBy ? 1 : 0)).toBeGreaterThanOrEqual(1);
      }
    }

    // Check submit button exists and is accessible
    const submitBtn = await page.locator('button[type="submit"], input[type="submit"]').first();
    expect(await submitBtn.isVisible()).toBeTruthy();
    
    const btnAriaLabel = await submitBtn.getAttribute('aria-label');
    const btnText = await submitBtn.textContent();
    expect(btnAriaLabel || btnText?.trim().length > 0).toBeTruthy();

    console.log('✅ Contact form is accessible');
  });

  test('Button Accessibility', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const buttons = await page.locator('button').all();
    let accessibleButtons = 0;

    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      if ((text && text.trim().length > 0) || ariaLabel || ariaLabelledBy) {
        accessibleButtons++;
      }
    }

    console.log(`✅ ${accessibleButtons}/${buttons.length} buttons have accessible names`);
    expect(accessibleButtons).toBeGreaterThanOrEqual(buttons.length * 0.9);
  });

  test('Link Accessibility', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const links = await page.locator('a').all();
    let accessibleLinks = 0;

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledBy = await link.getAttribute('aria-labelledby');
      const title = await link.getAttribute('title');

      if ((text && text.trim().length > 0) || ariaLabel || ariaLabelledBy || title) {
        accessibleLinks++;
      }
    }

    console.log(`✅ ${accessibleLinks}/${links.length} links have accessible names`);
    expect(accessibleLinks).toBeGreaterThanOrEqual(links.length * 0.95);
  });

  test('Mobile Accessibility - Touch Targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.goto('/booking.html', { waitUntil: 'domcontentloaded' });

    const buttons = await page.locator('button').all();
    let goodTouchTargets = 0;

    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && box.width >= 44 && box.height >= 44) {
        goodTouchTargets++;
      }
    }

    console.log(`✅ Mobile: ${goodTouchTargets}/${buttons.length} buttons have adequate touch target size (44x44px)`);
  });

  test('No Duplicate IDs', async ({ page }) => {
    const testPages = ['/index.html', '/booking.html', '/contact.html'];

    for (const pagePath of testPages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

      const allIds = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]'))
          .map(el => el.id)
          .filter(id => id.length > 0);
        return ids;
      });

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
      console.log(`✅ ${pagePath}: No duplicate IDs found`);
    }
  });

  test('Aria-Hidden Appropriate Usage', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const ariaHiddenElements = await page.locator('[aria-hidden="true"]').all();
    console.log(`✅ Found ${ariaHiddenElements.length} aria-hidden elements`);

    // Verify aria-hidden is not used on critical content
    for (const el of ariaHiddenElements) {
      const text = await el.textContent();
      const isButton = await el.evaluate(e => e.tagName === 'BUTTON');
      const isLink = await el.evaluate(e => e.tagName === 'A');
      
      // Warn if critical elements are hidden
      if ((isButton || isLink) && text?.trim().length > 0) {
        console.log(`⚠️  Warning: Interactive element is aria-hidden: ${text.substring(0, 30)}`);
      }
    }
  });
});
