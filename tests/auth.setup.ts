import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page.js';
import { LoginPage } from '../pages/login.page.js';
import { AUTH_FILE } from '../support/auth.constants';

setup('authenticate', async ({ page }) => {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;

  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }

  const login = new LoginPage(page);
  await login.login(email, password);
  await expect(new DashboardPage(page).heading).toBeVisible();

  await mkdir(dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
