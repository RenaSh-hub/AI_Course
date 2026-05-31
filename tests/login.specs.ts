import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('shows Email, Password, and Sign In', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('redirects to app after valid credentials', async ({ page }) => {
    const email = process.env.DIDAXIS_EMAIL;
    const password = process.env.DIDAXIS_PASSWORD;

    if (!email || !password) {
      throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
    }

    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 30_000,
    });
  });
});
