import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ensureNoPrograms, hasApiCleanupConfig } from "../support/ensure-empty-programs";
import { ProgramsPage } from "../pages/programs.page";

test.describe("DS-4 — Delete program with confirmation", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test("TC-001 — Delete program with confirmation removes program from list", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = `Test Program ${Date.now()}`;
    await createProgram(page, name);

    page.once("dialog", (dialog) => {
      expect(dialog.type()).toBe("confirm");
      dialog.accept();
    });
    await programs.deleteButtonFor(name).click();

    await expect(programs.programRow(name)).not.toBeVisible();
  });

  test("TC-002 — Cancel program deletion keeps program in list", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Keep Program ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    page.once("dialog", (d) => d.dismiss());
    await programs.deleteButtonFor(name).click();

    await expect(programs.programRow(name)).toBeVisible();
  });

  test("TC-003 — List updates immediately after confirmed deletion without refresh", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = `Refresh Check ${Date.now()}`;
    await createProgram(page, name);

    await programs.deleteProgram(name);

    await expect(programs.programRow(name)).not.toBeVisible();
  });

  test("TC-004 — Dismissed confirmation does not delete program", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Dismiss Check ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    page.once("dialog", (d) => d.dismiss());
    await programs.deleteButtonFor(name).click();

    await expect(programs.programRow(name)).toBeVisible();
  });

  test("TC-005 — Deleting one program leaves other programs in list", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const alpha = `Alpha Program ${Date.now()}`;
    const beta = `Beta Program ${Date.now()}`;
    await createProgram(page, alpha);
    trackProgram(await createProgram(page, beta));

    await programs.deleteProgram(alpha);

    await expect(programs.programRow(alpha)).not.toBeVisible();
    await expect(programs.programRow(beta)).toBeVisible();
  });

  test("TC-006 — No confirmation dialog without clicking delete", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `No Accidental Delete ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    page.on("dialog", () => {
      throw new Error("Confirmation dialog appeared without clicking delete");
    });

    await expect(programs.programRow(name)).toBeVisible();
    await expect(programs.deleteButtonFor(name)).toBeVisible();
  });

  test("TC-007 — Confirmation dialog references the program being deleted", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = `Named Target ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    page.once("dialog", (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain(name);
      dialog.dismiss();
    });
    await programs.deleteButtonFor(name).click();

    await expect(programs.programRow(name)).toBeVisible();
  });

  test("TC-008 — Double-clicking delete shows only one confirmation dialog", async ({
    page,
  }) => {
    test.fail(true, "Known app bug — double-click delete shows two confirmation dialogs.");

    const programs = new ProgramsPage(page);
    const name = `Double Delete ${Date.now()}`;
    trackProgram(await createProgram(page, name));

    let dialogCount = 0;
    page.on("dialog", (d) => {
      dialogCount += 1;
      d.dismiss();
    });

    await programs.deleteButtonFor(name).dblclick();
    await expect.poll(() => dialogCount).toBe(1);
    await expect(programs.programRow(name)).toBeVisible();
  });

  test("TC-009 — Program with description can be deleted successfully", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Described Program ${Date.now()}`;
    const description = "Evening cohort track";
    await createProgram(page, name, description);

    await expect(programs.descriptionInRow(name, description)).toBeVisible();
    await programs.deleteProgram(name);

    await expect(programs.programRow(name)).not.toBeVisible();
  });

  test("TC-010 — Deleting the last program transitions to empty state", async ({ page }) => {
    test.skip(!(await hasApiCleanupConfig()), "Set DIDAXIS_API_TOKEN and DIDAXIS_URL in .env");

    await ensureNoPrograms();
    const programs = new ProgramsPage(page);
    await programs.goto();

    const name = `Last One ${Date.now()}`;
    await createProgram(page, name);

    await programs.deleteProgram(name);

    await expect(programs.programRow(name)).not.toBeVisible();
    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramEmptyButton).toBeVisible();
  });
});
