import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { submitCreateAndTrack, waitForCreatedProgramId } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

test.describe("PW-DS1U — Create Program", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test.describe("Positive flows", () => {
    test("TC-001 — Navigate to program creation form with required fields", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);

      await expect(page).toHaveURL(/\/programs/);
      await expect(programs.newProgramButton).toBeVisible();

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();

      await expect(modal.heading).toBeVisible();
      await expect(modal.programNameInput).toBeVisible();
      await expect(modal.descriptionInput).toBeVisible();
      await expect(modal.createButton).toBeVisible();
    });

    test("TC-002 — Program is created successfully with valid inputs", async ({
      page,
    }) => {
      const programName = `PW1U Web Development ${Date.now()}`;
      const description = "Full-stack web development program";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);
      trackProgram(await submitCreateAndTrack(page, modal));

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toBeVisible();
    });

    test("TC-003 — Validation prevents empty program name", async ({ page }) => {
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();

      await expect(modal.programNameInput).toHaveValue("");
      await expect(modal.createButton).toBeDisabled();
    });

    test("TC-004 — Create a program with an empty description", async ({ page }) => {
      const programName = `PW1U Cloud Engineering ${Date.now()}`;
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      trackProgram(await submitCreateAndTrack(page, modal));

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toBeVisible();
    });
  });

  test.describe("Negative flows", () => {
    test("TC-005 — Program is not created when Create button is disabled", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();

      await expect(modal.programNameInput).toHaveValue("");
      await expect(modal.createButton).toBeDisabled();

      const beforeCount = await programs.allRows().count();
      await modal.createButton.click({ force: true });

      await expect(modal.dialog).toBeVisible();
      await expect(programs.allRows()).toHaveCount(beforeCount);
    });

    test("TC-006 — Program is not created without submitting the form", async ({
      page,
    }) => {
      const programName = `PW1U NoSubmit ${Date.now()}`;
      const description = "Full-stack web development program";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);

      await expect(modal.dialog).toBeVisible();
      await expect(programs.programRow(programName)).toHaveCount(0);
    });

    test("TC-007 — Closing the modal without saving does not create a program", async ({
      page,
    }) => {
      const programName = `PW1U Cancel ${Date.now()}`;
      const description = "Machine learning fundamentals";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);
      await modal.cancelButton.click();

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toHaveCount(0);
    });

    test("TC-007b — Close X without saving does not create a program", async ({ page }) => {
      const programName = `PW1U CloseX ${Date.now()}`;
      const description = "Machine learning fundamentals";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);
      await modal.close();

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toHaveCount(0);
    });
  });

  test.describe("Edge cases", () => {
    test("TC-008 — Program name with leading and trailing whitespace is handled on submit", async ({
      page,
    }) => {
      const trimmedName = `PW1U Trim ${Date.now()}`;
      const paddedName = `  ${trimmedName}  `;
      const description = "Full-stack web development program";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(paddedName);
      await modal.descriptionInput.fill(description);
      trackProgram(await submitCreateAndTrack(page, modal));

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(trimmedName)).toBeVisible();
      await expect(programs.programRow(paddedName.trim())).toHaveCount(1);
    });

    test("TC-020 — Optional AI Generation Config is available on create form", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.showAiConfigButton).toBeVisible();

      await modal.expandAiConfigIfCollapsed();
      await expect(modal.totalProgramHoursInput).toBeVisible();
      await modal.cancelButton.click();
    });

    // BUG: double-click submits twice — no idempotency guard (DS-17, SS-26)
    test.fail("TC-011 — Rapid double-click on Create creates only one program", async ({
      page,
    }) => {
      const programName = `PW1U Mobile ${Date.now()}`;
      const description = "iOS and Android development";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);
      const firstCreated = waitForCreatedProgramId(page);
      const secondCreated = waitForCreatedProgramId(page);
      await modal.createButton.dblclick();
      const createdIds = await Promise.allSettled([firstCreated, secondCreated]);
      for (const result of createdIds) {
        if (result.status === "fulfilled") {
          trackProgram(result.value);
        }
      }

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toHaveCount(1);
    });

    test("TC-012 — Program list updates immediately after successful creation", async ({
      page,
    }) => {
      const programName = `PW1U Cybersecurity ${Date.now()}`;
      const description = "Network and application security";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);
      trackProgram(await submitCreateAndTrack(page, modal));

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toBeVisible({ timeout: 5_000 });
      await expect(page).toHaveURL(/\/programs/);
    });

    test("TC-021 — Modal dismisses promptly after successful Create", async ({ page }) => {
      const programName = `PW1U ModalTiming ${Date.now()}`;
      const description = "Modal dismiss timing check";
      const programs = new ProgramsPage(page);

      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(programName);
      await modal.descriptionInput.fill(description);

      const started = Date.now();
      trackProgram(await submitCreateAndTrack(page, modal));
      await expect(modal.dialog).not.toBeVisible({ timeout: 5_000 });
      const elapsed = Date.now() - started;

      expect(elapsed).toBeLessThan(5_000);
      await expect(programs.programRow(programName)).toBeVisible();
    });
  });
});
