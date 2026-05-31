import type { Page } from '@playwright/test';
import { ProgramsPage } from '../pages/programs.page.js';

export async function openProgramsPage(page: Page): Promise<void> {
  const programs = new ProgramsPage(page);
  await programs.goto();
}
