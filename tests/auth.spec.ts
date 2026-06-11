import { test, expect } from '@playwright/test';
import { EMPTY_STORAGE_STATE } from '../support/auth.constants';
import { LoginPage } from '../pages/login.page.js';
import { DashboardPage } from '../pages/dashboard.page.js';
import { ProgramsPage } from '../pages/programs.page.js';

function adminCredentials(): { email: string; password: string } {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }
  return { email, password };
}

test.describe('Auth — authenticated session', () => {
  test('TC-001 — Dashboard accessible via saved storageState', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.nav.signOutButton).toBeVisible();
  });

  test('TC-002 — Programs accessible via saved storageState', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(programs.heading).toBeVisible();
    await expect(programs.nav.signOutButton).toBeVisible();
  });

  test('TC-003 — Session persists after page reload', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible();

    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.nav.signOutButton).toBeVisible();
  });

  test('TC-004 — Sign out clears session and blocks protected routes', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible();

    await dashboard.nav.signOut();

    const login = new LoginPage(page);
    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
    await expect(login.subtitle).toBeVisible();

    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
  });
});

test.describe('Auth — unauthenticated access', () => {
  test.use({ storageState: EMPTY_STORAGE_STATE });

  test('TC-005 — Visiting dashboard redirects to login', async ({ page }) => {
    await page.goto('/');

    const login = new LoginPage(page);
    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
    await expect(login.subtitle).toBeVisible();
  });

  test('TC-006 — Visiting programs redirects to login', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();

    const login = new LoginPage(page);
    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
    await expect(login.subtitle).toBeVisible();
  });

  test('TC-007 — Valid login lands on dashboard', async ({ page }) => {
    const { email, password } = adminCredentials();
    const login = new LoginPage(page);
    await login.login(email, password);

    const dashboard = new DashboardPage(page);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.welcomeText).toBeVisible();
    await expect(dashboard.nav.signOutButton).toBeVisible();
  });

  test('TC-008 — Email without password stays on login', async ({ page }) => {
    const { email } = adminCredentials();
    const login = new LoginPage(page);
    await login.goto();
    await login.fillCredentials(email, '');
    await login.submitSignIn();

    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
    await expect(login.invalidCredentialsError).toHaveCount(0);
  });

  test('TC-009 — Password without email stays on login', async ({ page }) => {
    const { password } = adminCredentials();
    const login = new LoginPage(page);
    await login.goto();
    await login.fillCredentials('', password);
    await login.submitSignIn();

    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
    await expect(login.invalidCredentialsError).toHaveCount(0);
  });

  test('TC-010 — Invalid credentials show error message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillCredentials('invalid@example.com', 'wrong-password');
    await login.submitSignIn();

    await expect(page).toHaveURL(/\/login/);
    await expect(login.signInButton).toBeVisible();
    await expect(login.invalidCredentialsError).toBeVisible();
  });
});
