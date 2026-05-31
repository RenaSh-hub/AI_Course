import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';

test.describe('Login page', () => {
  test('shows Email, Password, and Sign In', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.signInButton).toBeVisible();
  });

  test('redirects to app after valid credentials', async ({ page }) => {
    const email = process.env.DIDAXIS_EMAIL;
    const password = process.env.DIDAXIS_PASSWORD;

    if (!email || !password) {
      throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
    }

    const login = new LoginPage(page);
    await login.login(email, password);
  });
});
