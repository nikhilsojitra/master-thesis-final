const { test, expect } = require('@playwright/test');

test('a new visitor can register, land signed in, and log out', async ({ page }) => {
  const uniqueEmail = `e2e-${Date.now()}@example.com`;

  await page.goto('/register');

  await page.getByLabel('Full Name').fill('E2E Test User');
  await page.getByLabel('Email address').fill(uniqueEmail);
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByLabel('Confirm Password').fill('password123');

  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('E2E Test User')).toBeVisible();

  await page.getByText('E2E Test User').click();
  await page.getByRole('button', { name: /logout/i }).click();

  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});
