import type { Locator, Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly showAiConfigButton: Locator;
  readonly hideAiConfigButton: Locator;
  readonly totalProgramHoursInput: Locator;
  readonly focusAreasInput: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'Edit Program' });
    this.programNameInput = this.dialog.getByRole('textbox', { name: 'Program Name' });
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.showAiConfigButton = this.dialog.getByRole('button', {
      name: /Show AI Generation Config/,
    });
    this.hideAiConfigButton = this.dialog.getByRole('button', {
      name: /Hide AI Generation Config/,
    });
    this.totalProgramHoursInput = this.dialog.getByRole('textbox', {
      name: 'Total Program Hours',
    });
    this.focusAreasInput = this.dialog.getByRole('textbox', { name: 'Focus Areas' });
  }

  async fillProgramName(name: string) {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async submit() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  async expandAiConfigIfCollapsed() {
    if (await this.showAiConfigButton.isVisible()) {
      await this.showAiConfigButton.click();
    }
  }

  duplicateNameError() {
    return this.dialog
      .getByRole('alert')
      .or(this.page.getByRole('alert'))
      .or(
        this.dialog.getByText(/duplicate|already\s+exists|must\s+be\s+unique|name.*taken/i),
      );
  }
}
