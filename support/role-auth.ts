import type { Browser, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';

export type RoleCredentials = {
  email: string;
  password: string;
};

export function editorCredentials(): RoleCredentials | null {
  const email = process.env.DIDAXIS_EDITOR_EMAIL;
  const password = process.env.DIDAXIS_EDITOR_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export function viewerCredentials(): RoleCredentials | null {
  const email = process.env.DIDAXIS_VIEWER_EMAIL;
  const password = process.env.DIDAXIS_VIEWER_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export async function loginAs(
  page: Page,
  credentials: RoleCredentials,
): Promise<void> {
  await new LoginPage(page).login(credentials.email, credentials.password);
}

export async function withRolePage(
  browser: Browser,
  credentials: RoleCredentials,
  fn: (page: Page) => Promise<void>,
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await loginAs(page, credentials);
    await fn(page);
  } finally {
    await context.close();
  }
}
