import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram, submitCreateAndTrack } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

test.beforeEach(async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
});

// --- Positive flows ---

test("TC-001 — Program is created when name contains allowed special characters", async ({
  page,
}) => {
  const name = `Informatique & IA - Niveau ${Date.now()}`;
  const desc = "Evening track for working professionals.";
  trackProgram(await createProgram(page, name, desc));
});

test("TC-002 — Program is created when Program Name length is exactly 100 characters", async ({
  page,
}) => {
  const prefix = `Len100-${Date.now()}-`;
  const name100 = prefix + "X".repeat(100 - prefix.length);
  trackProgram(await createProgram(page, name100));
});

test("TC-003 — Program is created when Description length is exactly 500 characters", async ({
  page,
}) => {
  const name = `Desc500 ${Date.now()}`;
  const desc500 = "D".repeat(500);
  trackProgram(await createProgram(page, name, desc500));
});

// --- Negative flows ---

test("TC-004 — Whitespace-only Program Name blocks submission", async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.programNameInput.fill("   ");

  await expect(modal.createButton).toBeDisabled();
});

// BUG: app allows duplicate names — no server-side uniqueness check
test.fail("TC-005 — Duplicate Program Name is rejected with a server error", async ({
  page,
}) => {
  const name = `Dup Check ${Date.now()}`;
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  let modal = programs.newProgramModal;
  await modal.fill(name);
  trackProgram(await submitCreateAndTrack(page, modal));
  await expect(modal.dialog).not.toBeVisible();

  await programs.openNewProgram();
  modal = programs.newProgramModal;
  await modal.fill(name, "Duplicate attempt");
  trackProgram(await submitCreateAndTrack(page, modal));

  await expect(modal.dialog).toBeVisible();
  await expect(modal.duplicateNameError()).toBeVisible();
});

test("TC-006 — Program Name exceeding 100 characters is rejected", async ({ page }) => {
  const prefix = `Over100-${Date.now()}-`;
  const name101 = prefix + "X".repeat(101 - prefix.length);
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.fill(name101);

  if (await modal.createButton.isEnabled()) {
    await modal.submit();
    await expect(modal.dialog).toBeVisible();
  } else {
    await expect(modal.createButton).toBeDisabled();
  }
});

test("TC-007 — Description exceeding 500 characters is rejected", async ({ page }) => {
  const name = `Desc501 ${Date.now()}`;
  const desc501 = "D".repeat(501);
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.fill(name, desc501);

  if (await modal.createButton.isEnabled()) {
    await modal.submit();
    await expect(modal.dialog).toBeVisible();
  } else {
    await expect(modal.createButton).toBeDisabled();
  }
});

// BUG: depends on duplicate rejection which the app does not enforce
test.fail("TC-008 — Program must not appear in list when server rejects creation", async ({
  page,
}) => {
  const name = `Dup Phantom ${Date.now()}`;
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  let modal = programs.newProgramModal;
  await modal.fill(name);
  trackProgram(await submitCreateAndTrack(page, modal));
  await expect(modal.dialog).not.toBeVisible();

  await programs.openNewProgram();
  modal = programs.newProgramModal;
  await modal.fill(name, "Should fail");
  trackProgram(await submitCreateAndTrack(page, modal));
  await page.waitForLoadState("networkidle");

  await expect(programs.programRow(name)).toHaveCount(1);
});

// --- Edge cases ---

// BUG: depends on duplicate rejection which the app does not enforce
test.fail("TC-009 — Leading/trailing spaces are trimmed and still enforce duplicate prevention", async ({
  page,
}) => {
  const name = `Trim Dup ${Date.now()}`;
  const programs = new ProgramsPage(page);

  await programs.openNewProgram();
  let modal = programs.newProgramModal;
  await modal.fill(name);
  trackProgram(await submitCreateAndTrack(page, modal));
  await expect(modal.dialog).not.toBeVisible();

  await programs.openNewProgram();
  modal = programs.newProgramModal;
  await modal.programNameInput.fill(`  ${name}  `);
  trackProgram(await submitCreateAndTrack(page, modal));

  await expect(modal.dialog).toBeVisible();
  await expect(modal.duplicateNameError()).toBeVisible();
});

test("TC-010 — Program Name supports accented characters without corruption", async ({
  page,
}) => {
  const name = `Économie Avancée ${Date.now()}`;
  trackProgram(await createProgram(page, name));
});

test("TC-011 — Program Name containing quotes/brackets is displayed safely", async ({
  page,
}) => {
  const name = `AI "Foundations" (Level ${Date.now()})`;
  trackProgram(await createProgram(page, name));
});
