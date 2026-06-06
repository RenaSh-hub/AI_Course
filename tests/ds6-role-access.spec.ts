import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";
import {
  editorCredentials,
  viewerCredentials,
  withRolePage,
} from "../support/role-auth";

test.describe("DS-6 — Role-based access", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test.describe("Editor role", () => {
    test("TC-001 — Editor sees + New Program and can create a program", async ({
      browser,
    }) => {
      const credentials = editorCredentials();
      test.skip(!credentials, "Set DIDAXIS_EDITOR_EMAIL and DIDAXIS_EDITOR_PASSWORD in .env");

      await withRolePage(browser, credentials!, async (editorPage) => {
        const programs = new ProgramsPage(editorPage);
        await programs.goto();
        await expect(programs.newProgramButton).toBeVisible();

        const name = `Editor Create ${Date.now()}`;
        trackProgram(await createProgram(editorPage, name, "Created by editor"));
        await expect(programs.programRow(name)).toBeVisible();
      });
    });

    test("TC-002 — Editor can open Edit Program modal", async ({ browser, page }) => {
      const credentials = editorCredentials();
      test.skip(!credentials, "Set DIDAXIS_EDITOR_EMAIL and DIDAXIS_EDITOR_PASSWORD in .env");

      const name = `Editor Edit ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Editor edit target"));

      await withRolePage(browser, credentials!, async (editorPage) => {
        const programs = new ProgramsPage(editorPage);
        await programs.goto();
        await programs.openEditFor(name);
        const modal = programs.editProgramModal;
        await expect(modal.dialog).toBeVisible();
        await expect(modal.programNameInput).toHaveValue(name);
      });
    });

    test("TC-003 — Editor has no delete control on program rows", async ({
      browser,
      page,
    }) => {
      const credentials = editorCredentials();
      test.skip(!credentials, "Set DIDAXIS_EDITOR_EMAIL and DIDAXIS_EDITOR_PASSWORD in .env");

      const name = `Editor NoDel ${Date.now()}`;
      trackProgram(await createProgram(page, name));

      await withRolePage(browser, credentials!, async (editorPage) => {
        const programs = new ProgramsPage(editorPage);
        await programs.goto();
        await expect(programs.programRow(name)).toBeVisible();
        await expect(programs.deleteButtonFor(name)).toHaveCount(0);
      });
    });
  });

  test.describe("Viewer role", () => {
    test("TC-004 — Viewer does not see + New Program", async ({ browser }) => {
      const credentials = viewerCredentials();
      test.skip(!credentials, "Set DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD in .env");

      await withRolePage(browser, credentials!, async (viewerPage) => {
        const programs = new ProgramsPage(viewerPage);
        await programs.goto();
        await expect(programs.newProgramButton).toHaveCount(0);
      });
    });

    test("TC-005 — Viewer can view program list but has no edit or delete controls", async ({
      browser,
      page,
    }) => {
      const credentials = viewerCredentials();
      test.skip(!credentials, "Set DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD in .env");

      const name = `Viewer Read ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Viewer read-only test"));

      await withRolePage(browser, credentials!, async (viewerPage) => {
        const programs = new ProgramsPage(viewerPage);
        await programs.goto();
        await expect(programs.programRow(name)).toBeVisible();
        await expect(programs.editButtonFor(name)).toHaveCount(0);
        await expect(programs.deleteButtonFor(name)).toHaveCount(0);
      });
    });

    test("TC-006 — Viewer create API is rejected", async ({ browser, page }) => {
      const credentials = viewerCredentials();
      test.skip(!credentials, "Set DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD in .env");

      await withRolePage(browser, credentials!, async (viewerPage) => {
        const baseUrl = process.env.DIDAXIS_URL ?? "https://test.didaxis.studio";
        const response = await viewerPage.request.post(`${baseUrl}/api/programs`, {
          data: { name: `Viewer POST ${Date.now()}`, description: "Should fail" },
        });
        expect([401, 403, 405]).toContain(response.status());
      });
    });
  });

  test.describe("Admin role", () => {
    test("TC-007 — Admin sees Edit and Delete actions on each program row", async ({
      page,
    }) => {
      const name = `Admin Actions ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Row action visibility"));
      const programs = new ProgramsPage(page);

      await expect(programs.editButtonFor(name)).toBeVisible();
      await expect(programs.deleteButtonFor(name)).toBeVisible();
    });
  });
});
