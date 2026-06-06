import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram, submitCreateAndTrack } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

test.beforeEach(async ({ page }) => {
  await new ProgramsPage(page).goto();
});

async function assertSubmitBlockedOrError(
  submit: () => Promise<void>,
  dialog: import("@playwright/test").Locator,
  submitButton: import("@playwright/test").Locator,
) {
  if (await submitButton.isEnabled()) {
    await submit();
    await expect(dialog).toBeVisible();
  } else {
    await expect(submitButton).toBeDisabled();
  }
}

// --- Positive flows ---

test("TC-001 — Create with AI config values persists on edit reopen", async ({ page }) => {
  const name = `AI Create ${Date.now()}`;
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  const createModal = programs.newProgramModal;
  await createModal.fill(name, "Program with full AI config");
  await createModal.aiConfig.fill({
    totalProgramHours: "120",
    defaultSessionHours: "2",
    defaultExamHours: "1.5",
    targetAudience: "Career switchers",
    focusAreas: "React; Node",
  });
  trackProgram(await submitCreateAndTrack(page, createModal));
  await expect(createModal.dialog).not.toBeVisible();

  await programs.openEditFor(name);
  const editModal = programs.editProgramModal;
  await editModal.expandAiConfigIfCollapsed();
  await expect(editModal.totalProgramHoursInput).toHaveValue("120");
  await expect(editModal.defaultSessionHoursInput).toHaveValue("2");
  await expect(editModal.defaultExamHoursInput).toHaveValue("1.5");
  await expect(editModal.targetAudienceInput).toHaveValue("Career switchers");
  await expect(editModal.focusAreasInput).toHaveValue("React; Node");
});

test("TC-002 — Edit saves updated Default Session and Exam Hours", async ({ page }) => {
  const name = `AI Hours ${Date.now()}`;
  trackProgram(await createProgram(page, name, "Hours update test"));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  const modal = programs.editProgramModal;
  await modal.aiConfig.fill({
    totalProgramHours: "100",
    defaultSessionHours: "4",
    defaultExamHours: "3",
  });
  await modal.saveButton.click();
  await expect(modal.dialog).not.toBeVisible();

  await programs.openEditFor(name);
  const reopened = programs.editProgramModal;
  await reopened.expandAiConfigIfCollapsed();
  await expect(reopened.defaultSessionHoursInput).toHaveValue("4");
  await expect(reopened.defaultExamHoursInput).toHaveValue("3");
});

test("TC-003 — All AI config fields are visible when section is expanded on create", async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.expandAiConfigIfCollapsed();

  await expect(modal.totalProgramHoursInput).toBeVisible();
  await expect(modal.defaultSessionHoursInput).toBeVisible();
  await expect(modal.defaultExamHoursInput).toBeVisible();
  await expect(modal.targetAudienceInput).toBeVisible();
  await expect(modal.focusAreasInput).toBeVisible();
  await modal.cancelButton.click();
});

// --- Negative flows ---

test("TC-004 — Total Program Hours below 1 is rejected or blocked on create", async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.fill(`AI LowTotal ${Date.now()}`);
  await modal.aiConfig.fill({ totalProgramHours: "0" });

  await assertSubmitBlockedOrError(
    () => modal.submit(),
    modal.dialog,
    modal.createButton,
  );
});

test("TC-005 — Default Session Hours below 0.5 is rejected or blocked on edit", async ({
  page,
}) => {
  const name = `AI SessLow ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  const modal = programs.editProgramModal;
  await modal.aiConfig.fill({ defaultSessionHours: "0.25" });

  await assertSubmitBlockedOrError(
    () => modal.saveButton.click(),
    modal.dialog,
    modal.saveButton,
  );
});

test("TC-006 — Default Session Hours above 12 is rejected or blocked on edit", async ({
  page,
}) => {
  const name = `AI SessHigh ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  const modal = programs.editProgramModal;
  await modal.aiConfig.fill({ defaultSessionHours: "12.5" });

  await assertSubmitBlockedOrError(
    () => modal.saveButton.click(),
    modal.dialog,
    modal.saveButton,
  );
});

test("TC-007 — Default Exam Hours above 12 is rejected or blocked on edit", async ({
  page,
}) => {
  const name = `AI ExamHigh ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  const modal = programs.editProgramModal;
  await modal.aiConfig.fill({ defaultExamHours: "13" });

  await assertSubmitBlockedOrError(
    () => modal.saveButton.click(),
    modal.dialog,
    modal.saveButton,
  );
});

// --- Edge cases ---

test("TC-008 — Default Session Hours at 0.5 boundary is accepted on edit", async ({
  page,
}) => {
  const name = `AI SessMin ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  let modal = programs.editProgramModal;
  await modal.aiConfig.fill({ defaultSessionHours: "0.5" });
  await modal.saveButton.click();
  await expect(modal.dialog).not.toBeVisible();

  await programs.openEditFor(name);
  modal = programs.editProgramModal;
  await modal.expandAiConfigIfCollapsed();
  await expect(modal.defaultSessionHoursInput).toHaveValue("0.5");
});

test("TC-009 — Default Session Hours at 12 boundary is accepted on edit", async ({ page }) => {
  const name = `AI SessMax ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  let modal = programs.editProgramModal;
  await modal.aiConfig.fill({ defaultSessionHours: "12" });
  await modal.saveButton.click();
  await expect(modal.dialog).not.toBeVisible();

  await programs.openEditFor(name);
  modal = programs.editProgramModal;
  await modal.expandAiConfigIfCollapsed();
  await expect(modal.defaultSessionHoursInput).toHaveValue("12");
});

test("TC-010 — Collapse and expand on create retains unsaved AI config edits", async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.fill(`AI Toggle ${Date.now()}`);
  await modal.aiConfig.expandIfCollapsed();
  await modal.targetAudienceInput.fill("Working professionals");
  await modal.aiConfig.collapse();
  await modal.aiConfig.expandIfCollapsed();
  await expect(modal.targetAudienceInput).toHaveValue("Working professionals");
  await modal.cancelButton.click();
});

test("TC-011 — Special characters in Target Audience and Focus Areas persist", async ({
  page,
}) => {
  const name = `AI Special ${Date.now()}`;
  const audience = 'Adults & teens "2026"';
  const focus = "A & B <tag> \"quotes\"";
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  const createModal = programs.newProgramModal;
  await createModal.fill(name);
  await createModal.aiConfig.fill({
    totalProgramHours: "80",
    targetAudience: audience,
    focusAreas: focus,
  });
  trackProgram(await submitCreateAndTrack(page, createModal));

  await programs.openEditFor(name);
  const editModal = programs.editProgramModal;
  await editModal.expandAiConfigIfCollapsed();
  await expect(editModal.targetAudienceInput).toHaveValue(audience);
  await expect(editModal.focusAreasInput).toHaveValue(focus);
});

test("TC-012 — Sync/Async Ratio slider is adjustable when present", async ({ page }) => {
  const name = `AI Slider ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.openEditFor(name);
  const modal = programs.editProgramModal;
  await modal.expandAiConfigIfCollapsed();
  const slider = modal.aiConfig.syncAsyncRatioSlider;
  test.skip(!(await slider.isVisible()), "Sync/Async Ratio slider not available");

  await modal.aiConfig.setSyncAsyncRatio("30");
  await modal.saveButton.click();
  await expect(modal.dialog).not.toBeVisible();

  await programs.openEditFor(name);
  const reopened = programs.editProgramModal;
  await reopened.expandAiConfigIfCollapsed();
  await expect(reopened.aiConfig.syncAsyncRatioSlider).toHaveValue("30");
});
