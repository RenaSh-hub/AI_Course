import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

/**
 * DS-131 — Fix duplicate name rejection on edit (DS-2-TC-010)
 * Bug under fix: DS-126 — Edit Program accepts duplicate name on save
 * Parent: DS-2 — Edit existing program details
 */
test.describe("DS-131 — Fix duplicate name rejection on edit", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test("TC-001 — Valid rename to unique name still succeeds", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `PW131 Unique ${Date.now()}`;
    trackProgram(await createProgram(page, name, "Regression guard"));

    const renamed = `${name} - Renamed`;
    await programs.openEditFor(name);
    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(renamed);
    await modal.saveButton.click();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.programText(renamed)).toBeVisible();
  });

  // Exact-match duplicate is rejected (modal stays; names retained) but DS-126 still
  // lacks visible duplicate-name feedback — guarded until error UX lands.
  test("TC-002 — Duplicate name on edit rejected with visible error", async ({
    page,
  }) => {
    test.fail(
      true,
      "Known app bug DS-126 — duplicate exact rename is blocked but no visible error feedback.",
    );

    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const a = `PW131 DupA ${suffix}`;
    const b = `PW131 DupB ${suffix}`;
    trackProgram(await createProgram(page, a, "First"));
    trackProgram(await createProgram(page, b, "Second"));

    await programs.openEditFor(a);
    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(b);
    await modal.saveButton.click();

    await expect(modal.dialog).toBeVisible();
    await expect(
      modal.duplicateNameError().first(),
      "Duplicate save must surface visible feedback (alert, toast, or inline error text)",
    ).toBeVisible({ timeout: 8_000 });
  });

  test("TC-003 — Both programs retain original names after rejected edit", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const a = `PW131 KeepA ${suffix}`;
    const b = `PW131 KeepB ${suffix}`;
    trackProgram(await createProgram(page, a, "First"));
    trackProgram(await createProgram(page, b, "Second"));

    await programs.openEditFor(a);
    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(b);
    await modal.saveButton.click();

    await expect(modal.dialog).toBeVisible();
    await expect(programs.programText(a)).toBeVisible();
    await expect(programs.programText(b)).toBeVisible();
  });

  test("TC-004 — Program count unchanged; original not removed from list", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const a = `PW131 CountA ${suffix}`;
    const b = `PW131 CountB ${suffix}`;
    trackProgram(await createProgram(page, a, "First"));
    trackProgram(await createProgram(page, b, "Second"));

    await programs.openEditFor(a);
    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(b);
    await modal.saveButton.click();

    await expect(modal.dialog).toBeVisible();
    await expect(programs.programText(a)).toBeVisible({ timeout: 10_000 });
    await expect(programs.programRow(a)).toHaveCount(1);
    await expect(programs.programRow(b)).toHaveCount(1);
  });

  // Case-insensitive uniqueness on edit still missing (related: DS-129 / DS-127).
  test("TC-005 — Case-insensitive duplicate on edit rejected", async ({ page }) => {
    test.fail(
      true,
      "Known app bug DS-126/DS-127 — case-insensitive uniqueness not enforced on edit/rename.",
    );

    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const a = `PW131 CaseA ${suffix}`;
    const b = `PW131 CaseB ${suffix}`;
    trackProgram(await createProgram(page, a, "First"));
    trackProgram(await createProgram(page, b, "Second"));

    await programs.openEditFor(a);
    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(b.toUpperCase());
    await modal.saveButton.click();

    await expect(modal.dialog).toBeVisible();
    await expect(modal.duplicateNameError().first()).toBeVisible({ timeout: 8_000 });
    await expect(programs.programText(a)).toBeVisible();
  });

  test("TC-006 — Whitespace-wrapped duplicate on edit rejected", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const a = `PW131 TrimA ${suffix}`;
    const b = `PW131 TrimB ${suffix}`;
    trackProgram(await createProgram(page, a, "First"));
    trackProgram(await createProgram(page, b, "Second"));

    await programs.openEditFor(a);
    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(`  ${b}  `);
    await modal.saveButton.click();

    await expect(modal.dialog).toBeVisible();
    await expect(programs.programText(a)).toBeVisible();
  });
});
