import { test, expect, trackProgram } from "../fixtures/cleanup.fixture";
import { createProgram } from "../support/create-program";
import { ProgramsPage } from "../pages/programs.page";

test.describe("PW-DS2U — Edit Program", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test.describe("Positive flows", () => {
    test("TC-001 — Edit modal pre-populates Program Name and Description", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Prepop ${Date.now()}`;
      const desc = "Full-stack cohort for 2026";
      trackProgram(await createProgram(page, name, desc));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.heading).toBeVisible();
      await expect(modal.programNameInput).toHaveValue(name);
      await expect(modal.descriptionInput).toHaveValue(desc);
    });

    test("TC-002 — Pre-population matches data after Programs page reload", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Reload ${Date.now()}`;
      trackProgram(await createProgram(page, name, "No stale data check"));

      await page.reload();
      await page.waitForLoadState("networkidle");

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.programNameInput).toHaveValue(name);
      await expect(modal.descriptionInput).toHaveValue("No stale data check");
    });

    test("TC-002b — Successfully edit a program name (basic)", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U BasicRename ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Full-stack cohort for 2026"));

      const updatedName = `${name} - Updated`;
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(updatedName);
      await modal.saveButton.click();

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(updatedName)).toBeVisible();
    });

    test("TC-003 — Save Program Name only — list updates, Description and AI config preserved", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const originalName = `PW2U NameOnly ${Date.now()}`;
      const description = "Full-stack cohort for 2026";
      trackProgram(await createProgram(page, originalName, description));

      await programs.openEditFor(originalName);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.expandAiConfigIfCollapsed();
      await modal.totalProgramHoursInput.fill("120");
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();

      const updatedName = `${originalName} - Updated`;
      await programs.openEditFor(originalName);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(updatedName);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(updatedName)).toBeVisible();

      await programs.openEditFor(updatedName);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.descriptionInput).toHaveValue(description);
      await modal.expandAiConfigIfCollapsed();
      await expect(modal.totalProgramHoursInput).toHaveValue("120");
    });

    test("TC-004 — Admin saves Description and list updates", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const seedName = `PW2U DescAdmin ${Date.now()}`;
      trackProgram(await createProgram(page, seedName, "Seed description"));

      await programs.openEditFor(seedName);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      const newDesc = `Updated cohort description ${Date.now()}`;
      await modal.descriptionInput.fill(newDesc);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(newDesc)).toBeVisible();
    });

    test("TC-005 — Description-only edit preserves Program Name", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U DescOnly ${Date.now()}`;
      const originalDesc = "Full-stack cohort for 2026";
      trackProgram(await createProgram(page, name, originalDesc));

      await programs.openEditFor(name);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.descriptionInput.fill("Updated cohort description");
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(name)).toBeVisible();

      await programs.openEditFor(name);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.programNameInput).toHaveValue(name);
      await expect(modal.descriptionInput).toHaveValue("Updated cohort description");
    });

    test("TC-006 — Config-only edit preserves Program Name and Description", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U ConfigOnly ${Date.now()}`;
      const desc = "Stable description";
      trackProgram(await createProgram(page, name, desc));

      await programs.openEditFor(name);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.expandAiConfigIfCollapsed();
      await modal.totalProgramHoursInput.fill("140");
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await programs.openEditFor(name);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.programNameInput).toHaveValue(name);
      await expect(modal.descriptionInput).toHaveValue(desc);
      await modal.expandAiConfigIfCollapsed();
      await expect(modal.totalProgramHoursInput).toHaveValue("140");
    });

    test("TC-007 — Clear Description saves", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U ClearDesc ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Full-stack cohort for 2026"));

      await programs.openEditFor(name);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.descriptionInput.fill("");
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(name)).toBeVisible();

      await programs.openEditFor(name);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.descriptionInput).toHaveValue("");
    });

    test("TC-008 — Edit without AI config: Program Name change still succeeds", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U NoConfig ${Date.now()}`;
      trackProgram(await createProgram(page, name, "No optional config"));

      const newName = `${name} v2`;
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(newName);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(newName)).toBeVisible();
    });

    test("TC-009 — Collapse/expand AI Generation Config does not drop unsaved edits", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Toggle ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Config toggle test"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.expandAiConfigIfCollapsed();
      await modal.focusAreasInput.fill("React; Node");

      await modal.hideAiConfigButton.click();
      await modal.showAiConfigButton.click();

      await expect(modal.focusAreasInput).toHaveValue("React; Node");
    });

    test("TC-029 — Name-only save with collapsed config does not wipe Total Hours", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Collapsed ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Has config"));

      await programs.openEditFor(name);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.expandAiConfigIfCollapsed();
      await modal.totalProgramHoursInput.fill("99");
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await programs.openEditFor(name);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(`${name} renamed`);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await programs.openEditFor(`${name} renamed`);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.expandAiConfigIfCollapsed();
      await expect(modal.totalProgramHoursInput).toHaveValue("99");
    });

    test("TC-031 — Admin edits Program Name — modal closes, Description preserved", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const seedName = `PW2U RenameAdmin ${Date.now()}`;
      const cohortDesc = "Full-stack cohort for 2026";
      trackProgram(await createProgram(page, seedName, cohortDesc));

      const updatedName = `Web Dev 2026 – Renamed ${Date.now()}`;
      await programs.openEditFor(seedName);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(updatedName);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(updatedName)).toBeVisible();

      await programs.openEditFor(updatedName);
      const reopened = programs.editProgramModal;
      await expect(reopened.dialog).toBeVisible();
      await expect(reopened.descriptionInput).toHaveValue(cohortDesc);
    });

    test("TC-024 — Program list re-fetches immediately after successful edit", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U ListRefresh ${Date.now()}`;
      trackProgram(await createProgram(page, name, "List refresh test"));

      const renamed = `Web Dev 2026 – Renamed ${Date.now()}`;
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(renamed);
      await modal.saveButton.click();

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(renamed)).toBeVisible({ timeout: 5_000 });
      await expect(page).toHaveURL(/\/programs/);
    });
  });

  test.describe("Negative flows", () => {
    // BUG: duplicate program names on rename are allowed (case-insensitive uniqueness not enforced)
    test("TC-011 — Duplicate active Program Name blocked on Save", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const a = `PW2U DupA ${Date.now()}`;
      const b = `PW2U DupB ${Date.now()}`;
      trackProgram(await createProgram(page, a, "First"));
      trackProgram(await createProgram(page, b, "Second"));

      await programs.openEditFor(a);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(b.toUpperCase());
      await modal.saveButton.click();

      await expect(modal.dialog).toBeVisible();
      await expect(
        modal.duplicateNameError().first(),
        "Duplicate save must surface visible feedback (alert, toast, or inline error text)"
      ).toBeVisible({ timeout: 8_000 });
      await expect(programs.programText(a)).toBeVisible();
    });

    test("TC-012 — Save disabled when Program Name is empty", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U EmptyName ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Test"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill("");

      await expect(modal.saveButton).toBeDisabled();
    });

    test("TC-012b — Program is not updated when Save button is disabled (force click)", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U ForceSave ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Disabled save test"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill("");
      await expect(modal.saveButton).toBeDisabled();

      await modal.saveButton.click({ force: true });

      await expect(modal.dialog).toBeVisible();
      await expect(programs.programText(name)).toBeVisible();
    });

    test("TC-012c — Duplicate name error is not shown while typing", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const a = `PW2U TypeA ${Date.now()}`;
      const b = `PW2U TypeB ${Date.now()}`;
      trackProgram(await createProgram(page, a, "First"));
      trackProgram(await createProgram(page, b, "Second"));

      await programs.openEditFor(a);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(b.toUpperCase());
      await page.waitForTimeout(600);

      await expect(modal.duplicateNameError()).toHaveCount(0);
    });

    test("TC-013 — Whitespace-only Program Name does not save", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Ws ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Whitespace test"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill("   ");

      if (await modal.saveButton.isEnabled()) {
        await modal.saveButton.click();
        await expect(modal.dialog).toBeVisible();
        await expect(modal.programNameInput).toBeVisible();
      } else {
        await expect(modal.saveButton).toBeDisabled();
      }

      await expect(programs.programText(name)).toBeVisible();
    });

    test("TC-014 — Duplicate name surfaces on Save after typing completes", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const a = `PW2U LateA ${Date.now()}`;
      const b = `PW2U LateB ${Date.now()}`;
      trackProgram(await createProgram(page, a, "x"));
      trackProgram(await createProgram(page, b, "y"));

      await programs.openEditFor(a);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.clear();
      await modal.programNameInput.pressSequentially(b, { delay: 40 });

      await modal.saveButton.click();
      await expect(modal.dialog).toBeVisible();
    });

    test("TC-015 — Program is not updated without clicking Save", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U NoSave ${Date.now()}`;
      trackProgram(await createProgram(page, name, "No save test"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(`${name} - Updated`);

      await expect(modal.dialog).toBeVisible();
      await expect(programs.programText(name)).toBeVisible();
      await expect(programs.programRow(`${name} - Updated`)).toHaveCount(0);
    });

    test("TC-019 — Cancel without Save discards Program Name edits", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Cancel ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Original"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill("Should Not Save");
      await modal.cancelButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await programs.openEditFor(name);
      const reopened = programs.editProgramModal;
      await expect(reopened.dialog).toBeVisible();
      await expect(reopened.programNameInput).toHaveValue(name);
    });

    test("TC-019b — Cancel without Save discards Description edits", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U CancelDesc ${Date.now()}`;
      const originalDesc = "Full-stack cohort for 2026";
      trackProgram(await createProgram(page, name, originalDesc));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.descriptionInput.fill("Unsaved change");
      await modal.cancelButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await programs.openEditFor(name);
      const reopened = programs.editProgramModal;
      await expect(reopened.dialog).toBeVisible();
      await expect(reopened.descriptionInput).toHaveValue(originalDesc);
    });

    test("TC-019c — Close X without Save discards edits", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U DiscardX ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Original"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill("Should Not Save");
      await modal.close();
      await expect(modal.dialog).not.toBeVisible();

      await expect(programs.programText(name)).toBeVisible();
      await expect(programs.programRow("Should Not Save")).toHaveCount(0);
    });

    test("TC-019d — Click outside without Save discards edits", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Outside ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Original"));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill("Should Not Save");
      await modal.dismissByClickOutside();
      await expect(modal.dialog).not.toBeVisible();

      await expect(programs.programText(name)).toBeVisible();
      await expect(programs.programRow("Should Not Save")).toHaveCount(0);
    });
  });

  test.describe("Edge cases", () => {
    test("TC-021 — Program Name trimmed on Save", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Trim ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Trim test"));

      const trimmedName = `${name} - Updated`;
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(`  ${trimmedName}  `);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await expect(programs.programText(trimmedName)).toBeVisible();
      await programs.openEditFor(trimmedName);
      const reopened = programs.editProgramModal;
      await expect(reopened.dialog).toBeVisible();
      await expect(reopened.programNameInput).toHaveValue(trimmedName);
    });

    test("TC-022 — Program Name 100 chars OK, 101 blocked or rejected", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const ts = Date.now();
      const baseName = `PW2U L${ts}`;
      trackProgram(await createProgram(page, baseName, "Length test"));

      const prefix = `X${ts}-`;
      const name100 = prefix + "Y".repeat(100 - prefix.length);
      expect(name100.length).toBe(100);

      await programs.openEditFor(baseName);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(name100);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(name100)).toBeVisible();

      await programs.openEditFor(name100);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      const name101 = prefix + "Y".repeat(101 - prefix.length);
      expect(name101.length).toBe(101);
      await modal.programNameInput.fill(name101);

      if (await modal.saveButton.isEnabled()) {
        await modal.saveButton.click();
        await expect(modal.dialog).toBeVisible();
      } else {
        await expect(modal.saveButton).toBeDisabled();
      }

      await expect(programs.programText(baseName)).not.toBeVisible();
      await expect(programs.programRow(name100)).toBeVisible();
    });

    test("TC-023 — Description 500 chars OK, 501 rejected or blocked", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U Dlen ${Date.now()}`;
      trackProgram(await createProgram(page, name, "x"));

      const d500 = "Z".repeat(500);
      const d501 = "Z".repeat(501);

      await programs.openEditFor(name);
      let modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.descriptionInput.fill(d500);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();

      await programs.openEditFor(name);
      modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      const savedDesc = await modal.descriptionInput.inputValue();
      expect(savedDesc.length).toBe(500);

      await modal.descriptionInput.fill(d501);
      if (await modal.saveButton.isEnabled()) {
        await modal.saveButton.click();
        await expect(modal.dialog).toBeVisible();
      } else {
        await expect(modal.saveButton).toBeDisabled();
      }
    });

    test("TC-025 — Special characters persist in name and description on open", async ({
      page,
    }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U <>&"' ${Date.now()}`;
      const desc = 'Desc & <tag> "quotes"';
      trackProgram(await createProgram(page, name, desc));

      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await expect(modal.programNameInput).toHaveValue(name);
      await expect(modal.descriptionInput).toHaveValue(desc);
    });

    test("TC-025b — Special characters accepted on edit save", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U SpecialEdit ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Original description"));

      const specialName = "Informatique & IA - Niveau 2";
      const specialDesc = 'A & B <tag> "quotes"';
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(specialName);
      await modal.descriptionInput.fill(specialDesc);
      await modal.saveButton.click();

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(specialName)).toBeVisible();
    });

    test("TC-026 — Case-only rename succeeds without false duplicate", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `pw2u case ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Case rename test"));

      const upper = name.toUpperCase();
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(upper);
      await modal.saveButton.click();
      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programText(upper)).toBeVisible();
    });

    test("TC-027 — Rapid double-click on Save sends only one update", async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `PW2U DblSave ${Date.now()}`;
      trackProgram(await createProgram(page, name, "Double-click test"));

      const updatedName = `${name} - Updated`;
      await programs.openEditFor(name);
      const modal = programs.editProgramModal;
      await expect(modal.dialog).toBeVisible();
      await modal.programNameInput.fill(updatedName);
      await modal.saveButton.dblclick();

      await expect(modal.dialog).not.toBeVisible();
      await expect(programs.programRow(updatedName)).toHaveCount(1);
    });
  });
});
