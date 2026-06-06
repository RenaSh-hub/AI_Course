import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { submitCreateAndTrack } from "../support/create-program";
import { ensureNoPrograms, hasApiCleanupConfig } from "../support/ensure-empty-programs";
import { ProgramsPage } from "../pages/programs.page";

test.describe.serial("DS-7 — Empty state", () => {
  async function resetToEmptyState(page: import("@playwright/test").Page) {
    test.skip(!(await hasApiCleanupConfig()), "Set DIDAXIS_API_TOKEN and DIDAXIS_URL in .env");
    await ensureNoPrograms();
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.emptyStateMessage).toBeVisible({ timeout: 15_000 });
  }

  test("TC-001 — Empty state shows message and Create Program button", async ({ page }) => {
    const programs = new ProgramsPage(page);
    await resetToEmptyState(page);

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramEmptyButton).toBeVisible();
  });

  test("TC-002 — Empty state Create Program button opens New Program modal", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    await resetToEmptyState(page);

    await programs.createProgramEmptyButton.click();
    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.heading).toBeVisible();
    await modal.cancelButton.click();
  });

  test("TC-003 — Deleting the last program shows empty state", async ({ page }) => {
    const programs = new ProgramsPage(page);
    await resetToEmptyState(page);

    const name = `Last Program ${Date.now()}`;
    await programs.createProgramEmptyButton.click();
    const modal = programs.newProgramModal;
    await modal.programNameInput.fill(name);
    trackProgram(await submitCreateAndTrack(page, modal));
    await expect(programs.programRow(name)).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await programs.deleteButtonFor(name).click();

    await expect(programs.programRow(name)).not.toBeVisible();
    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramEmptyButton).toBeVisible();
  });
});
