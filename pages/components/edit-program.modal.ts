import type { Locator, Page } from '@playwright/test';
import { AiGenerationConfigSection } from './ai-generation-config.section.js';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly aiConfig: AiGenerationConfigSection;
  readonly showAiConfigButton: Locator;
  readonly hideAiConfigButton: Locator;
  readonly totalProgramHoursInput: Locator;
  readonly defaultSessionHoursInput: Locator;
  readonly defaultExamHoursInput: Locator;
  readonly targetAudienceInput: Locator;
  readonly focusAreasInput: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'Edit Program' });
    this.programNameInput = this.dialog.getByRole('textbox', { name: 'Program Name' });
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.aiConfig = new AiGenerationConfigSection(page, this.dialog);
    this.showAiConfigButton = this.aiConfig.showButton;
    this.hideAiConfigButton = this.aiConfig.hideButton;
    this.totalProgramHoursInput = this.aiConfig.totalProgramHoursInput;
    this.defaultSessionHoursInput = this.aiConfig.defaultSessionHoursInput;
    this.defaultExamHoursInput = this.aiConfig.defaultExamHoursInput;
    this.targetAudienceInput = this.aiConfig.targetAudienceInput;
    this.focusAreasInput = this.aiConfig.focusAreasInput;
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
    await this.aiConfig.expandIfCollapsed();
  }

  duplicateNameError() {
    return this.dialog
      .getByRole('alert')
      .or(this.page.getByRole('alert'))
      .or(
        this.dialog.getByText(/duplicate|already\s+exists|must\s+be\s+unique|name.*taken/i),
      );
  }

  async dismissByClickOutside() {
    const box = await this.dialog.boundingBox();
    if (box) {
      await this.page.mouse.click(Math.max(5, box.x - 10), box.y + box.height / 2);
      return;
    }
    await this.page.mouse.click(5, 5);
  }
}
