import type { Page } from "@playwright/test";
import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ensureNoPrograms, hasApiCleanupConfig } from "../support/ensure-empty-programs";
import { ProgramsPage } from "../pages/programs.page";

test.describe("DS-5 — Program list filtering and display", () => {
  async function gotoPrograms(page: Page) {
    const programs = new ProgramsPage(page);
    await programs.goto();
    return programs;
  }

  async function resetToEmptyState(page: Page) {
    test.skip(!(await hasApiCleanupConfig()), "Set DIDAXIS_API_TOKEN and DIDAXIS_URL in .env");
    await ensureNoPrograms();
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.emptyStateMessage).toBeVisible({ timeout: 15_000 });
    return programs;
  }

  test("TC-001 — Display program list with key details", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `List Detail ${Date.now()}`;
    const desc = "Shows name and description in the list.";
    trackProgram(await createProgram(page, name, desc));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, desc)).toBeVisible();
  });

  test("TC-002 — Program list shows name and description for a single program", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const name = `Web Development 2026 ${Date.now()}`;
    const desc = "Full-stack cohort for 2026";
    trackProgram(await createProgram(page, name, desc));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, desc)).toBeVisible();
  });

  test("TC-003 — Program list shows multiple programs with distinct names and descriptions", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const nameA = `Data Science 2026 ${Date.now()}`;
    const descA = "ML fundamentals track";
    const nameB = `UX Design 2026 ${Date.now()}`;
    const descB = "Human-centered design bootcamp";

    trackProgram(await createProgram(page, nameA, descA));
    trackProgram(await createProgram(page, nameB, descB));

    await expect(programs.programText(nameA)).toBeVisible();
    await expect(programs.descriptionInRow(nameA, descA)).toBeVisible();
    await expect(programs.programText(nameB)).toBeVisible();
    await expect(programs.descriptionInRow(nameB, descB)).toBeVisible();
  });

  test("TC-004 — Programs page heading and table structure are visible", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `Structure Check ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    await expect(programs.heading).toBeVisible();
    await expect(programs.programColumnHeader).toBeVisible();
  });

  test("TC-005 — Empty state when no programs exist", async ({ page }) => {
    const programs = await resetToEmptyState(page);

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramEmptyButton).toBeVisible();
  });

  test("TC-006 — Empty state Create Program button opens New Program modal", async ({
    page,
  }) => {
    const programs = await resetToEmptyState(page);

    await programs.createProgramEmptyButton.click();
    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.heading).toBeVisible();
    await modal.cancelButton.click();
  });

  test("TC-007 — Empty state is not shown when programs exist", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `Visible Program ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    await expect(programs.emptyStateMessage).not.toBeVisible();
    await expect(programs.programText(name)).toBeVisible();
  });

  test("TC-008 — Program without description still appears in list", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `No Desc Program ${Date.now()}`;
    trackProgram(await createProgram(page, name, ""));

    await expect(programs.programText(name)).toBeVisible();
  });

  test("TC-009 — Program name with special characters displays correctly in list", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
    const desc = 'A & B <tag> "quotes"';
    trackProgram(await createProgram(page, name, desc));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, desc)).toBeVisible();
  });

  test("TC-010 — Long description up to 500 characters displays in list row", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const name = `Long Desc Program ${Date.now()}`;
    const desc = "L".repeat(500);
    trackProgram(await createProgram(page, name, desc));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, desc)).toBeVisible();
  });

  test("TC-011 — Program list persists after page reload", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `Persist Check ${Date.now()}`;
    const desc = "Survives reload";
    trackProgram(await createProgram(page, name, desc));

    await programs.reload();

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, desc)).toBeVisible();
  });

  test("TC-012 — New Program button is available when programs exist", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `New Btn Check ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    await expect(programs.newProgramButton).toBeVisible();
  });
});
