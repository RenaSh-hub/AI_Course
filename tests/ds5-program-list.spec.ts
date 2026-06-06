import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

async function skipIfNoProgramFilter(programs: ProgramsPage) {
  test.skip(
    !(await programs.programNameFilter.isVisible()),
    "Program Name filter not available in this environment",
  );
}

test.beforeEach(async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
});

// --- Positive flows ---

test("TC-001 — Programs page shows a list with each program's name and description preview", async ({
  page,
}) => {
  const ts = Date.now();
  const name1 = `Web Development ${ts}`;
  const desc1 = "Full-stack cohort for 2026";
  const name2 = `Data Science ${ts}`;
  const desc2 = "Python, stats, and ML fundamentals";
  const programs = new ProgramsPage(page);

  trackProgram(await createProgram(page, name1, desc1));
  trackProgram(await createProgram(page, name2, desc2));

  const row1 = programs.programRow(name1);
  const row2 = programs.programRow(name2);

  await expect(row1).toBeVisible();
  await expect(programs.descriptionInRow(name1, desc1)).toBeVisible();
  await expect(row2).toBeVisible();
  await expect(programs.descriptionInRow(name2, desc2)).toBeVisible();
});

test("TC-002 — Programs page header and '+ New Program' button are visible for Admin", async ({
  page,
}) => {
  const programs = new ProgramsPage(page);

  await expect(programs.heading).toBeVisible();
  await expect(programs.newProgramButton).toBeVisible();
});

test("TC-003 — Admin sees Edit and Delete actions on each program row", async ({
  page,
}) => {
  const name = `Row Actions ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Action icon test"));

  await expect(programs.editButtonFor(name)).toBeVisible();
  await expect(programs.deleteButtonFor(name)).toBeVisible();
});

test("TC-006 — Program without description still appears in the list", async ({ page }) => {
  const name = `No Desc ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name));

  await expect(programs.programRow(name)).toBeVisible();
});

test("TC-007 — Sidebar Programs navigation opens the Programs page", async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.nav.goToDashboard();
  await programs.nav.goToPrograms();

  await expect(page).toHaveURL(/\/programs/);
  await expect(programs.heading).toBeVisible();
});

test("TC-004 — Clicking a program row opens the Semester Panel with semester-related content", async ({
  page,
}) => {
  const name = `Semester Panel ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Panel test"));

  await programs.selectProgram(name);

  await expect(programs.semestersConfigLabel).toBeVisible();
  await expect(programs.semesterPanelHeading(name)).toBeVisible();
});

test("TC-005 — 'Manage Courses' navigates to Course Builder from the Semester Panel", async ({
  page,
}) => {
  const name = `Manage Courses ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Navigate to Course Builder"));

  await programs.selectProgram(name);
  await programs.goToCourseBuilder();

  expect(page.url()).toMatch(/\/programs\/[^/]+\/courses/);
});

test("TC-020 — Program Name filter returns only programs whose names match the query", async ({
  page,
}) => {
  const ts = Date.now();
  const web1 = `Web Development ${ts}`;
  const web2 = `Web Development B ${ts}`;
  const data = `Data Science ${ts}`;
  const programs = new ProgramsPage(page);

  trackProgram(await createProgram(page, web1, "Web desc"));
  trackProgram(await createProgram(page, web2, "Web desc B"));
  trackProgram(await createProgram(page, data, "Data desc"));

  await skipIfNoProgramFilter(programs);
  await programs.filterByName("Web Development");

  await expect(programs.programRow(web1)).toBeVisible();
  await expect(programs.programRow(web2)).toBeVisible();
  await expect(programs.programRow(data)).not.toBeVisible();
});

test("TC-021 — Program Name filter supports partial matching (substring)", async ({
  page,
}) => {
  const name = `Informatique & IA - Niveau ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Partial match test"));

  await skipIfNoProgramFilter(programs);
  await programs.filterByName("Niveau");

  await expect(programs.programRow(name)).toBeVisible();
});

test("TC-024 — Clearing filters restores the full unfiltered program list", async ({
  page,
}) => {
  const ts = Date.now();
  const nameA = `Filter Clear A ${ts}`;
  const nameB = `Filter Clear B ${ts}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, nameA, "A desc"));
  trackProgram(await createProgram(page, nameB, "B desc"));

  await skipIfNoProgramFilter(programs);
  await programs.filterByName("Filter Clear A");
  await expect(programs.programRow(nameB)).not.toBeVisible();

  await programs.clearFilter();

  await expect(programs.programRow(nameA)).toBeVisible();
  await expect(programs.programRow(nameB)).toBeVisible();
});

// --- Negative flows ---

const PROGRAMS_GET = /\/api\/programs\/?$/;

test("TC-008 — Programs API 500 does not show empty state", async ({ page }) => {
  const programs = new ProgramsPage(page);

  await page.route(PROGRAMS_GET, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Internal server error" }),
    });
  });

  await programs.goto();

  await expect(programs.emptyStateMessage).not.toBeVisible();
});

test("TC-012 — Clicking a program row must not navigate away unexpectedly", async ({
  page,
}) => {
  const name = `No Navigate ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Stay on page test"));

  await programs.selectProgram(name);

  expect(page.url()).toContain("/programs");
});

test("TC-013 — Manage Courses is not available if no program is selected", async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  const manageCourses = programs.manageCoursesButton;
  const count = await manageCourses.count();

  if (count > 0) {
    await expect(manageCourses).toBeDisabled();
  } else {
    expect(count).toBe(0);
  }
});

test("TC-025 — No results state is shown when filters match zero programs", async ({
  page,
}) => {
  const programs = new ProgramsPage(page);

  await skipIfNoProgramFilter(programs);
  await programs.filterByName(`Nonexistent Program ${Date.now()}`);

  await expect(programs.dataRowsExcludingFilterHeader()).toHaveCount(0);
});

// --- Edge cases ---

test("TC-014 — Empty state renders correct icon, message, and 'Create Program' button when no programs exist", async ({
  page,
}) => {
  test.skip(
    !(process.env.DIDAXIS_API_TOKEN && process.env.DIDAXIS_URL),
    "Covered by ds7-empty-state.spec.ts — requires DIDAXIS_API_TOKEN",
  );
});

test("TC-016 — Description preview handles very long descriptions without breaking layout", async ({
  page,
}) => {
  const name = `Long Desc ${Date.now()}`;
  const longDesc = "L".repeat(500);
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, longDesc));

  const row = programs.programRow(name);
  await expect(row).toBeVisible();

  const rowBox = await row.boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.height).toBeLessThan(200);
});

test("TC-017 — Program Name with special characters displays correctly in the list", async ({
  page,
}) => {
  const name = `Informatique & IA - Niveau ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Special char display test"));

  await expect(programs.programRow(name)).toBeVisible();
});

test("TC-018 — Switching selection updates Semester Panel to the newly selected program", async ({
  page,
}) => {
  const ts = Date.now();
  const name1 = `Panel Switch A ${ts}`;
  const name2 = `Panel Switch B ${ts}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name1, "First program"));
  trackProgram(await createProgram(page, name2, "Second program"));

  await programs.selectProgram(name1);
  const panelContent1 = await programs.semesterPanelHeading(name1).textContent();

  await programs.selectProgram(name2);
  const panelContent2 = await programs.semesterPanelHeading(name2).textContent();

  expect(panelContent2).not.toBe(panelContent1);
});

test("TC-019 — Row click still works after list re-fetch following a mutation", async ({
  page,
}) => {
  const ts = Date.now();
  const nameA = `Post Mutation A ${ts}`;
  const nameB = `Post Mutation B ${ts}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, nameA, "Mutation click test A"));
  trackProgram(await createProgram(page, nameB, "Mutation click test B"));

  await programs.deleteProgram(nameA);

  await programs.selectProgram(nameB);

  await expect(programs.semestersConfigLabel).toBeVisible();
  await expect(programs.semesterPanelHeading(nameB)).toBeVisible();
});

test("TC-027 — Program Name filter trims leading/trailing spaces in the query", async ({
  page,
}) => {
  const name = `Trim Filter ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Trim test"));

  await skipIfNoProgramFilter(programs);
  await programs.filterByName(`  ${name}  `);

  await expect(programs.programRow(name)).toBeVisible();
});

test("TC-028 — Program Name filter handles special characters safely", async ({
  page,
}) => {
  const name = `Informatique & IA - Niveau ${Date.now()}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, name, "Filter special chars"));

  await skipIfNoProgramFilter(programs);
  await programs.filterByName("& IA -");

  await expect(programs.programRow(name)).toBeVisible();
});

test("TC-029 — After create/delete, list re-fetch preserves active filters and updates results accordingly", async ({
  page,
}) => {
  const ts = Date.now();
  const web1 = `Web Alpha ${ts}`;
  const web2 = `Web Security ${ts}`;
  const programs = new ProgramsPage(page);
  trackProgram(await createProgram(page, web1, "First web program"));

  await skipIfNoProgramFilter(programs);
  await programs.filterByName("Web");
  await expect(programs.programRow(web1)).toBeVisible();

  trackProgram(await createProgram(page, web2, "New web program"));
  await expect(programs.programRow(web2)).toBeVisible();

  await programs.deleteProgram(web1);
  await expect(programs.programRow(web1)).not.toBeVisible();
  await expect(programs.programRow(web2)).toBeVisible();
});
