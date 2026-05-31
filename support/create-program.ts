import { expect, type Page } from '@playwright/test';
import { ProgramsPage } from '../pages/programs.page.js';
import type { NewProgramModal } from '../pages/components/new-program.modal.js';

const PROGRAMS_POST = /\/api\/programs\/?$/;

export function waitForCreatedProgramId(page: Page): Promise<string> {
  return page
    .waitForResponse(
      (response) => {
        const request = response.request();
        if (request.method() !== 'POST' || response.status() !== 201) {
          return false;
        }
        try {
          return PROGRAMS_POST.test(new URL(response.url()).pathname);
        } catch {
          return false;
        }
      },
      { timeout: 30_000 },
    )
    .then(async (response) => {
      const body = await response.json();
      const id = body?.data?.id;
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error('POST /api/programs did not return data.id');
      }
      return id;
    });
}

export async function submitCreateAndTrack(
  page: Page,
  modal: NewProgramModal,
): Promise<string> {
  const created = waitForCreatedProgramId(page);
  await modal.submit();
  return created;
}

export async function createProgram(
  page: Page,
  name: string,
  description = '',
): Promise<string> {
  const programs = new ProgramsPage(page);
  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.fill(name, description);
  const id = await submitCreateAndTrack(page, modal);
  await expect(modal.dialog).not.toBeVisible();
  await expect(programs.programRow(name)).toBeVisible();
  return id;
}
