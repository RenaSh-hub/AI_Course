import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram, submitCreateAndTrack } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

test.describe("DS-3 — Program name validation and duplicate prevention", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test.describe("Positive flows", () => {
    test(
      "TC-001 — Program is created when name contains allowed special characters",
      { tag: "@smoke" },
      async ({ page }) => {
        const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
        const desc = "Evening track for working professionals.";
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name, desc));

        await expect(programs.programRow(name)).toBeVisible();
      },
    );

    test(
      "TC-002 — Program is created when Program Name length is exactly 100 characters",
      { tag: "@sanity" },
      async ({ page }) => {
        const prefix = `Len100-${Date.now()}-`;
        const name100 = prefix + "X".repeat(100 - prefix.length);
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name100));

        await expect(programs.programRow(name100)).toBeVisible();
      },
    );

    test(
      "TC-003 — Program is created when Description length is exactly 500 characters",
      { tag: "@sanity" },
      async ({ page }) => {
        const name = `Desc500 Program ${Date.now()}`;
        const desc500 = "D".repeat(500);
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name, desc500));

        await expect(programs.programRow(name)).toBeVisible();
        await expect(programs.descriptionInRow(name, desc500)).toBeVisible();
      },
    );

    test(
      "TC-010 — Program Name supports accented characters without corruption",
      { tag: "@sanity" },
      async ({ page }) => {
        const name = `Économie Avancée ${Date.now()}`;
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name));

        await expect(programs.programText(name)).toBeVisible();
      },
    );
  });

  test.describe("Negative flows", () => {
    test(
      "TC-004 — Whitespace-only Program Name blocks submission",
      { tag: "@regression" },
      async ({ page }) => {
        const programs = new ProgramsPage(page);
        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.programNameInput.fill("   ");

        await expect(modal.createButton).toBeDisabled();
      },
    );

    // BUG: app allows duplicate names — no server-side uniqueness check
    test(
      "TC-005 — Duplicate Program Name is rejected with a server error",
      { tag: "@regression" },
      async ({ page }) => {
        test.fail(
          true,
          "Known app bug — duplicate program names are allowed on create (no server uniqueness).",
        );

        const name = `Dup Check ${Date.now()}`;
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name));

        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.fill(name, "Duplicate attempt");
        // Known bug creates a second program — track for cleanup when it does
        trackProgram(await submitCreateAndTrack(page, modal));

        await expect(modal.dialog).toBeVisible();
        await expect(modal.duplicateNameError()).toBeVisible();
        await expect(programs.programRow(name)).toHaveCount(1);
      },
    );

    // BUG: case-insensitive uniqueness not enforced on create
    test(
      "TC-012 — Case-variant duplicate Program Name is rejected on create",
      { tag: "@regression" },
      async ({ page }) => {
        test.fail(
          true,
          "Known app bug — case-variant duplicate program names are allowed on create.",
        );

        const name = `Web Development ${Date.now()}`;
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name));

        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.fill(name.toUpperCase(), "Case variant attempt");
        trackProgram(await submitCreateAndTrack(page, modal));

        await expect(modal.dialog).toBeVisible();
        await expect(modal.duplicateNameError()).toBeVisible();
      },
    );

    test(
      "TC-006 — Program Name exceeding 100 characters is rejected",
      { tag: "@regression" },
      async ({ page }) => {
        const prefix = `Over100-${Date.now()}-`;
        const name101 = prefix + "X".repeat(101 - prefix.length);
        const programs = new ProgramsPage(page);

        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.fill(name101);

        if (await modal.createButton.isEnabled()) {
          await modal.submit();
          await expect(modal.dialog).toBeVisible();
        } else {
          await expect(modal.createButton).toBeDisabled();
        }
      },
    );

    test(
      "TC-007 — Description exceeding 500 characters is rejected",
      { tag: "@regression" },
      async ({ page }) => {
        const name = `Desc501 Program ${Date.now()}`;
        const desc501 = "D".repeat(501);
        const programs = new ProgramsPage(page);

        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.fill(name, desc501);

        if (await modal.createButton.isEnabled()) {
          await modal.submit();
          await expect(modal.dialog).toBeVisible();
        } else {
          await expect(modal.createButton).toBeDisabled();
        }
      },
    );

    // BUG: depends on duplicate rejection which the app does not enforce
    test(
      "TC-008 — Program must not appear in list when server rejects creation",
      { tag: "@regression" },
      async ({ page }) => {
        test.fail(
          true,
          "Known app bug — duplicate program names are allowed on create (phantom second row).",
        );

        const name = `Dup Phantom ${Date.now()}`;
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name));

        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.fill(name, "Should fail");
        trackProgram(await submitCreateAndTrack(page, modal));

        await expect(programs.programRow(name)).toHaveCount(1);
      },
    );
  });

  test.describe("Edge cases", () => {
    // BUG: depends on duplicate rejection which the app does not enforce
    test(
      "TC-009 — Leading/trailing spaces are trimmed and still enforce duplicate prevention",
      { tag: "@regression" },
      async ({ page }) => {
        test.fail(
          true,
          "Known app bug — trimmed duplicate program names are allowed on create.",
        );

        const name = `Trim Dup ${Date.now()}`;
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name));

        await programs.openNewProgram();
        const modal = programs.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await modal.programNameInput.fill(`  ${name}  `);
        trackProgram(await submitCreateAndTrack(page, modal));

        await expect(modal.dialog).toBeVisible();
        await expect(modal.duplicateNameError()).toBeVisible();
      },
    );

    test(
      "TC-011 — Program Name containing quotes/brackets is displayed safely",
      { tag: "@sanity" },
      async ({ page }) => {
        const name = `AI "Foundations" (Level 1) ${Date.now()}`;
        const programs = new ProgramsPage(page);

        trackProgram(await createProgram(page, name));

        await expect(programs.programText(name)).toBeVisible();
      },
    );
  });
});
