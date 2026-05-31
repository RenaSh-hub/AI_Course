import type { Locator, Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;
  readonly createButton: Locator;
  readonly closeButton: Locator;
  readonly showAiConfigButton: Locator;
  readonly hideAiConfigButton: Locator;
  readonly totalProgramHoursInput: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'New Program' });
    this.programNameInput = this.dialog.getByRole('textbox', { name: 'Program Name' });
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
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
  }

  async fill(name: string, description = '') {
    await this.programNameInput.fill(name);
    if (description) {
      await this.descriptionInput.fill(description);
    }
  }

  async submit() {
    await this.createButton.click();
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
    return this.dialog.getByText(/already exists|duplicate/i);
  }
}
