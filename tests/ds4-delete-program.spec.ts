import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

test.beforeEach(async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
});

// --- Positive flows ---

test("TC-001 — Admin sees native confirm dialog with program name", async ({ page }) => {
  const name = `Del Confirm ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  page.once("dialog", (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain(name);
    dialog.dismiss();
  });
  await programs.deleteButtonFor(name).click();
});

test("TC-002 — Confirming delete removes program from the list", async ({ page }) => {
  const name = `Del OK ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  page.on("dialog", (d) => d.accept());
  await programs.deleteButtonFor(name).click();

  await expect(row).not.toBeVisible();
});

test("TC-003 — Cancel leaves program in the list", async ({ page }) => {
  const name = `Del Cancel ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  page.on("dialog", (d) => d.dismiss());
  await programs.deleteButtonFor(name).click();

  await expect(row).toBeVisible();
});

test("TC-005 — Deleting one program does not remove others", async ({ page }) => {
  const ts = Date.now();
  const nameToDelete = `Del Target ${ts}`;
  const nameToKeep = `Del Keep ${ts}`;
  trackProgram(await createProgram(page, nameToDelete));
  trackProgram(await createProgram(page, nameToKeep));
  const programs = new ProgramsPage(page);

  const targetRow = programs.programRow(nameToDelete);
  const keepRow = programs.programRow(nameToKeep);

  page.on("dialog", (d) => d.accept());
  await programs.deleteButtonFor(nameToDelete).click();

  await expect(targetRow).not.toBeVisible();
  await expect(keepRow).toBeVisible();
});

test("TC-006 — List updates after delete without full page reload", async ({ page }) => {
  const name = `Del NoReload ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  page.on("dialog", (d) => d.accept());
  await programs.deleteButtonFor(name).click();

  await expect(row).not.toBeVisible();
  await expect(programs.heading).toBeVisible();
});

// --- Negative flows ---

test("TC-011 — Cancel does not trigger delete API", async ({ page }) => {
  const name = `Del NoAPI ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);
  const deleteRequests: string[] = [];

  page.on("request", (req) => {
    if (req.method() === "DELETE") deleteRequests.push(req.url());
  });

  page.on("dialog", (d) => d.dismiss());
  await programs.deleteButtonFor(name).click();
  await page.waitForTimeout(1000);

  expect(deleteRequests).toHaveLength(0);
  await expect(row).toBeVisible();
});

// --- Edge cases ---

test("TC-015 — Confirm text includes special-character program name", async ({ page }) => {
  const name = `Test <${Date.now()}> & "Beta"`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain(name);
    dialog.accept();
  });
  await programs.deleteButtonFor(name).click();
  await expect(row).not.toBeVisible();
});

test("TC-016 — Long Program Name (100 chars) in delete dialog", async ({ page }) => {
  const prefix = `DelLong-${Date.now()}-`;
  const name100 = prefix + "X".repeat(100 - prefix.length);
  trackProgram(await createProgram(page, name100));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name100);

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain(name100);
    dialog.accept();
  });
  await programs.deleteButtonFor(name100).click();
  await expect(row).not.toBeVisible();
});

test("TC-018 — Dismiss dialog (Esc) same as Cancel", async ({ page }) => {
  const name = `Del Esc ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  page.on("dialog", (d) => d.dismiss());
  await programs.deleteButtonFor(name).click();

  await expect(row).toBeVisible();
});
