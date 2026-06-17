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
    const programs = new ProgramsPage(page);

    for (let attempt = 0; attempt < 5; attempt++) {
      await ensureNoPrograms();
      await programs.goto();
      try {
        await expect(programs.emptyStateMessage).toBeVisible({ timeout: 5_000 });
        return programs;
      } catch {
        // Parallel chromium tests may recreate programs; retry cleanup.
      }
    }

    await ensureNoPrograms();
    await programs.goto();
    await expect(programs.emptyStateMessage).toBeVisible({ timeout: 15_000 });
    return programs;
  }

  test("TC-001 — Display program list with key details", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `List Program ${Date.now()}`;
    const description = "Overview cohort for display check";
    trackProgram(await createProgram(page, name, description));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, description)).toBeVisible();
  });

  test("TC-002 — Program list shows name and description for a single program", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const name = `Web Development ${Date.now()}`;
    const description = "Full-stack cohort for 2026";
    trackProgram(await createProgram(page, name, description));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, description)).toBeVisible();
  });

  test("TC-003 — Program list shows multiple programs with distinct names and descriptions", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const dataScience = `Data Science ${Date.now()}`;
    const dataScienceDesc = "ML fundamentals track";
    const uxDesign = `UX Design ${Date.now()}`;
    const uxDesignDesc = "Human-centered design bootcamp";

    trackProgram(await createProgram(page, dataScience, dataScienceDesc));
    trackProgram(await createProgram(page, uxDesign, uxDesignDesc));

    await expect(programs.programText(dataScience)).toBeVisible();
    await expect(programs.descriptionInRow(dataScience, dataScienceDesc)).toBeVisible();
    await expect(programs.programText(uxDesign)).toBeVisible();
    await expect(programs.descriptionInRow(uxDesign, uxDesignDesc)).toBeVisible();
  });

  test("TC-004 — Programs page heading and table structure are visible", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `Structure Check ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    await expect(programs.heading).toBeVisible();
    await expect(programs.programColumnHeader).toBeVisible();
  });

  test.describe.serial("empty state isolation", () => {
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
    trackProgram(await createProgram(page, name));

    await expect(programs.programText(name)).toBeVisible();
  });

  test("TC-009 — Program name with special characters displays correctly in list", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
    const description = 'A & B <tag> "quotes"';
    trackProgram(await createProgram(page, name, description));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, description)).toBeVisible();
  });

  test("TC-010 — Long description up to 500 characters displays in list row", async ({
    page,
  }) => {
    const programs = await gotoPrograms(page);
    const name = `Long Desc Program ${Date.now()}`;
    const description = "L".repeat(500);
    trackProgram(await createProgram(page, name, description));

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, description)).toBeVisible();
  });

  test("TC-011 — Program list persists after page reload", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `Persist Check ${Date.now()}`;
    const description = "Survives reload";
    trackProgram(await createProgram(page, name, description));

    await programs.reload();

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.descriptionInRow(name, description)).toBeVisible();
  });

  test("TC-012 — New Program button is available when programs exist", async ({ page }) => {
    const programs = await gotoPrograms(page);
    const name = `Button Check ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    await expect(programs.newProgramButton).toBeVisible();
  });
});
