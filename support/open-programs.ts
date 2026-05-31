import type { Page } from '@playwright/test';

export async function openProgramsPage(page: Page): Promise<void> {
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
}
