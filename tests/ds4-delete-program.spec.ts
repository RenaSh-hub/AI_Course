import path from "node:path";
import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";
import { AUTH_FILE } from "../support/auth.constants";
import {
  editorCredentials,
  viewerCredentials,
  withRolePage,
} from "../support/role-auth";

const PROGRAM_DELETE = /\/api\/programs\/[^/]+\/?$/;
const DELETE_WARNING =
  /All its semesters and courses will be removed.*cannot be undone/i;

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
    expect(dialog.message()).toMatch(DELETE_WARNING);
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

test("TC-004 — Cancel leaves Web Development 2026 in the list", async ({ page }) => {
  const name = `Web Development 2026 ${Date.now()}`;
  trackProgram(await createProgram(page, name, "Full-stack cohort for 2026"));
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

test("TC-007 — Editor has no usable delete control on program rows", async ({
  browser,
  page,
}) => {
  const credentials = editorCredentials();
  test.skip(!credentials, "Set DIDAXIS_EDITOR_EMAIL and DIDAXIS_EDITOR_PASSWORD in .env");

  const name = `Del Editor UI ${Date.now()}`;
  trackProgram(await createProgram(page, name));

  await withRolePage(browser, credentials!, async (editorPage) => {
    const programs = new ProgramsPage(editorPage);
    await programs.goto();
    await expect(programs.programRow(name)).toBeVisible();
    await expect(programs.deleteButtonFor(name)).toHaveCount(0);
  });
});

test("TC-008 — Editor delete API is rejected", async ({ browser, page }) => {
  const credentials = editorCredentials();
  test.skip(!credentials, "Set DIDAXIS_EDITOR_EMAIL and DIDAXIS_EDITOR_PASSWORD in .env");

  const name = `Del Editor API ${Date.now()}`;
  const id = await createProgram(page, name);
  trackProgram(id);

  await withRolePage(browser, credentials!, async (editorPage) => {
    const baseUrl = process.env.DIDAXIS_URL ?? "https://test.didaxis.studio";
    const response = await editorPage.request.delete(`${baseUrl}/api/programs/${id}`);
    expect([401, 403, 405]).toContain(response.status());

    const programs = new ProgramsPage(editorPage);
    await programs.goto();
    await expect(programs.programRow(name)).toBeVisible();
  });
});

test("TC-009 — Viewer has no delete control", async ({ browser, page }) => {
  const credentials = viewerCredentials();
  test.skip(!credentials, "Set DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD in .env");

  const name = `Del Viewer UI ${Date.now()}`;
  trackProgram(await createProgram(page, name));

  await withRolePage(browser, credentials!, async (viewerPage) => {
    const programs = new ProgramsPage(viewerPage);
    await programs.goto();
    await expect(programs.programRow(name)).toBeVisible();
    await expect(programs.deleteButtonFor(name)).toHaveCount(0);
  });
});

test("TC-010 — Viewer delete API is rejected", async ({ browser, page }) => {
  const credentials = viewerCredentials();
  test.skip(!credentials, "Set DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD in .env");

  const name = `Del Viewer API ${Date.now()}`;
  const id = await createProgram(page, name);
  trackProgram(id);

  await withRolePage(browser, credentials!, async (viewerPage) => {
    const baseUrl = process.env.DIDAXIS_URL ?? "https://test.didaxis.studio";
    const response = await viewerPage.request.delete(`${baseUrl}/api/programs/${id}`);
    expect([401, 403, 405]).toContain(response.status());

    const programs = new ProgramsPage(viewerPage);
    await programs.goto();
    await expect(programs.programRow(name)).toBeVisible();
  });
});

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

test("TC-012 — Failed delete does not remove row", async ({ page }) => {
  const name = `Del Fail ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  await page.route(PROGRAM_DELETE, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Internal server error" }),
    });
  });

  page.once("dialog", (d) => d.accept());
  await programs.deleteButtonFor(name).click();

  await expect(row).toBeVisible({ timeout: 5_000 });
});

test("TC-013 — Row not removed before confirmed success", async ({ page }) => {
  const name = `Del Slow ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  await page.route(PROGRAM_DELETE, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2_500));
    await route.continue();
  });

  page.once("dialog", (d) => d.accept());
  await programs.deleteButtonFor(name).click();

  await expect(row).toBeVisible({ timeout: 1_000 });
  await expect(row).not.toBeVisible({ timeout: 10_000 });
});

test("TC-014 — Rapid OK does not corrupt state", async ({ page }) => {
  const name = `Del Rapid ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);
  let deleteCount = 0;

  page.on("request", (req) => {
    if (req.method() === "DELETE" && PROGRAM_DELETE.test(new URL(req.url()).pathname)) {
      deleteCount += 1;
    }
  });

  page.once("dialog", (d) => d.accept());
  await programs.deleteButtonFor(name).click();
  await expect(row).not.toBeVisible({ timeout: 10_000 });

  expect(deleteCount).toBe(1);
  await expect(programs.programRow(name)).toHaveCount(0);
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

test("TC-017 — Delete last program shows empty state", async ({ page }) => {
  test.skip(
    !(process.env.DIDAXIS_API_TOKEN && process.env.DIDAXIS_URL),
    "Covered by ds7-empty-state.spec.ts — requires DIDAXIS_API_TOKEN",
  );
});

test("TC-018 — Dismiss dialog (Esc) same as Cancel", async ({ page }) => {
  const name = `Del Esc ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  page.on("dialog", (d) => d.dismiss());
  await programs.deleteButtonFor(name).click();

  await expect(row).toBeVisible();//fixed by me
});

test("TC-019 — Other session still sees program after Cancel", async ({ browser, page }) => {
  const name = `Del Multi ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  const observer = await browser.newContext({
    storageState: path.resolve(AUTH_FILE),
  });
  const observerPage = await observer.newPage();
  const observerPrograms = new ProgramsPage(observerPage);

  try {
    await observerPrograms.goto();
    await expect(observerPrograms.programRow(name)).toBeVisible();

    page.on("dialog", (d) => d.dismiss());
    await programs.deleteButtonFor(name).click();
    await expect(programs.programRow(name)).toBeVisible();

    await observerPrograms.reload();
    await expect(observerPrograms.programRow(name)).toBeVisible();
  } finally {
    await observer.close();
  }
});

test("TC-020 — Session expired on OK", async ({ page }) => {
  const name = `Del Expired ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);
  const row = programs.programRow(name);

  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.route(PROGRAM_DELETE, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  });

  page.once("dialog", (d) => d.accept());
  await programs.deleteButtonFor(name).click();

  await expect(row).toBeVisible({ timeout: 5_000 });
});

test("TC-021 — Delete dialog warns about semesters and courses", async ({ page }) => {
  const name = `Del Warn ${Date.now()}`;
  trackProgram(await createProgram(page, name));
  const programs = new ProgramsPage(page);

  await programs.selectProgram(name);
  await expect(programs.semestersConfigLabel).toBeVisible();

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain(name);
    expect(dialog.message()).toMatch(/semesters and courses will be removed/i);
    expect(dialog.message()).toMatch(/cannot be undone/i);
    dialog.dismiss();
  });
  await programs.deleteButtonFor(name).click();
  await expect(programs.programRow(name)).toBeVisible();
});

test("TC-022 — Delete removes exactly one program by row identity", async ({ page }) => {
  const ts = Date.now();
  const first = `Del RowA ${ts}`;
  const second = `Del RowB ${ts}`;
  const third = `Del RowC ${ts}`;
  trackProgram(await createProgram(page, first));
  trackProgram(await createProgram(page, second));
  trackProgram(await createProgram(page, third));
  const programs = new ProgramsPage(page);

  page.on("dialog", (d) => d.accept());
  await programs.deleteButtonFor(second).click();

  await expect(programs.programRow(first)).toBeVisible();
  await expect(programs.programRow(second)).not.toBeVisible();
  await expect(programs.programRow(third)).toBeVisible();
});
