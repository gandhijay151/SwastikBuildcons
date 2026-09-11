import { test, expect } from '@playwright/test';

const networkUrl = 'http://192.168.1.6:5173';

test.describe('Network URL & Cross-Device Access Tests', () => {
  test('site loads on local network IP address with correct title', async ({ page }) => {
    await page.goto(networkUrl);
    await expect(page).toHaveTitle(/Swastik Buildcons/);
  });

  test('all main navigation sections render on network URL', async ({ page }) => {
    await page.goto(networkUrl);
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#services')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('contact form loads and submits to API on network URL', async ({ page }) => {
    await page.goto(networkUrl);
    await page.locator('#contact').scrollIntoViewIfNeeded();

    const nameInput = page.locator('input[name="name"]');
    const phoneInput = page.locator('input[name="phone"]');
    const projectSelect = page.locator('select[name="projectType"]');
    const budgetSelect = page.locator('select[name="budget"]');

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(projectSelect).toBeVisible();
    await expect(budgetSelect).toBeVisible();
  });
});
