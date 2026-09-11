import { test, expect } from '@playwright/test';

test.describe('Swastik Buildcons Website', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Swastik Buildcons/);
  });

  test('navbar is visible with logo', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('header img[alt="Swastik Buildcons"]');
    await expect(logo).toBeVisible();
  });

  test('all sections are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#services')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('hero section has CTA buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Get Free Consultation/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Our Services/i })).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#services"]');
    await expect(page.locator('#services')).toBeInViewport();
  });

  test('contact form is present with all fields', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="projectType"]')).toBeVisible();
    await expect(page.locator('select[name="budget"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('contact form validates required fields', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.click('button:has-text("Submit Inquiry")');
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('WhatsApp button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[aria-label="Chat on WhatsApp"]')).toBeVisible();
  });

  test('footer has contact info', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText('+91 8511 00 3888');
    await expect(page.locator('footer')).toContainText('info@swastikbuildcons.com');
  });

  test('page has no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });
});
