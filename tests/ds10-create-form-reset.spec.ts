import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";

test.describe("DS-10 — New Program form reset after dismiss", () => {
  test.beforeEach(async ({ page }) => {
    await new ProgramsPage(page).goto();
  });

  test("TC-022 — Reopened New Program modal is empty after Cancel", async ({ page }) => {
    test.fail(true, "Known app bug — cancelled draft persists when New Program modal reopens.");

    const programs = new ProgramsPage(page);
    const draftName = "Draft Program Alpha";
    const draftDescription = "Draft description to discard";

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.fill(draftName, draftDescription);
    await modal.cancel();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openNewProgram();
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toHaveValue("");
    await expect(modal.descriptionInput).toHaveValue("");
    await expect(modal.createButton).toBeDisabled();
  });

  test("TC-023 — Close X dismiss clears draft the same as Cancel", async ({ page }) => {
    test.fail(true, "Known app bug — cancelled draft persists when New Program modal reopens.");

    const programs = new ProgramsPage(page);
    const draftName = "Draft Program Beta";

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await modal.programNameInput.fill(draftName);
    await modal.close();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openNewProgram();
    await expect(modal.programNameInput).toHaveValue("");
    await expect(modal.programNameInput).not.toHaveValue(draftName);
    await expect(modal.createButton).toBeDisabled();
  });
});
