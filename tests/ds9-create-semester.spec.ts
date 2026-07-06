import { test, expect, trackProgram } from '../fixtures/cleanup.fixture';
import { createProgram } from '../support/create-program';
import { ProgramsPage } from '../pages/programs.page';

test.describe('DS-9 — Create semester for selected program', () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test('TC-001 — Select program and create semester via New Semester modal', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const programName = `Semester Program ${Date.now()}`;
    const semesterName = 'Fall 2026';
    const startDate = '2026-09-01';
    const endDate = '2026-12-15';

    trackProgram(await createProgram(page, programName, 'Program for semester creation'));

    await expect(programs.selectProgramHint).toBeVisible();

    await programs.selectProgram(programName);

    await expect(programs.semesterPanelHeading(programName)).toBeVisible();
    await expect(programs.semestersConfigLabel).toBeVisible();
    await expect(programs.noSemestersMessage).toBeVisible();
    await expect(programs.newSemesterButton).toBeVisible();

    await programs.openNewSemester();

    const modal = programs.newSemesterModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.semesterNameInput).toBeVisible();
    await expect(modal.startDateInput).toBeVisible();
    await expect(modal.endDateInput).toBeVisible();
    await expect(modal.createSemesterButton).toBeDisabled();

    await modal.fill(semesterName, startDate, endDate);
    await expect(modal.createSemesterButton).toBeEnabled();
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.noSemestersMessage).not.toBeVisible();
    await expect(programs.semesterName(semesterName)).toBeVisible();
    await expect(programs.semesterDateRange(startDate, endDate)).toBeVisible();
  });
});
