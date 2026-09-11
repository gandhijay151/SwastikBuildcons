import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // iPhone 13 Mini / standard mobile width

test.describe('Mobile Responsiveness Tests', () => {
  test('no horizontal scrollbar on mobile screens', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflowElements = await page.evaluate(() => {
      const elements = [];
      const windowWidth = window.innerWidth;
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > windowWidth + 1) { // 1px tolerance for rounding
          elements.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            right: rect.right,
            width: rect.width
          });
        }
      });
      return {
        hasScroll: document.documentElement.scrollWidth > windowWidth,
        scrollWidth: document.documentElement.scrollWidth,
        windowWidth,
        overflowElements: elements.slice(0, 10)
      };
    });

    expect(overflowElements.hasScroll).toBe(false);
  });

  test('mobile navbar toggle works and closes on link click', async ({ page }) => {
    await page.goto('/');
    const toggleBtn = page.locator('button[aria-label="Toggle menu"]');
    await expect(toggleBtn).toBeVisible();

    // Click toggle to open menu
    await toggleBtn.click();
    
    // Target the mobile menu container and its link
    const mobileMenu = page.locator('header nav').last();
    const mobileNavLink = mobileMenu.locator('a[href="#services"]');
    await expect(mobileNavLink).toBeVisible();

    // Click link inside mobile menu
    await mobileNavLink.click();
    
    // Verify mobile menu container is closed
    await expect(mobileNavLink).not.toBeVisible();
  });
});
