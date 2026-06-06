import type { Locator, Page } from '@playwright/test';

export type AiConfigValues = {
  totalProgramHours?: string;
  defaultSessionHours?: string;
  defaultExamHours?: string;
  targetAudience?: string;
  focusAreas?: string;
};

export class AiGenerationConfigSection {
  readonly showButton: Locator;
  readonly hideButton: Locator;
  readonly totalProgramHoursInput: Locator;
  readonly defaultSessionHoursInput: Locator;
  readonly defaultExamHoursInput: Locator;
  readonly targetAudienceInput: Locator;
  readonly focusAreasInput: Locator;
  readonly syncAsyncRatioSlider: Locator;

  constructor(
    private readonly page: Page,
    private readonly dialog: Locator,
  ) {
    this.showButton = dialog.getByRole('button', { name: /Show AI Generation Config/ });
    this.hideButton = dialog.getByRole('button', { name: /Hide AI Generation Config/ });
    this.totalProgramHoursInput = dialog.getByRole('textbox', {
      name: 'Total Program Hours',
    });
    this.defaultSessionHoursInput = dialog.getByRole('textbox', {
      name: 'Default Session Hours',
    });
    this.defaultExamHoursInput = dialog.getByRole('textbox', {
      name: 'Default Exam Hours',
    });
    this.targetAudienceInput = dialog.getByRole('textbox', { name: 'Target Audience' });
    this.focusAreasInput = dialog.getByRole('textbox', { name: 'Focus Areas' });
    this.syncAsyncRatioSlider = dialog.getByRole('slider', { name: /Sync/i });
  }

  async expandIfCollapsed() {
    if (await this.showButton.isVisible()) {
      await this.showButton.click();
    }
  }

  async collapse() {
    if (await this.hideButton.isVisible()) {
      await this.hideButton.click();
    }
  }

  async fill(values: AiConfigValues) {
    await this.expandIfCollapsed();
    if (values.totalProgramHours !== undefined) {
      await this.totalProgramHoursInput.fill(values.totalProgramHours);
    }
    if (values.defaultSessionHours !== undefined) {
      await this.defaultSessionHoursInput.fill(values.defaultSessionHours);
    }
    if (values.defaultExamHours !== undefined) {
      await this.defaultExamHoursInput.fill(values.defaultExamHours);
    }
    if (values.targetAudience !== undefined) {
      await this.targetAudienceInput.fill(values.targetAudience);
    }
    if (values.focusAreas !== undefined) {
      await this.focusAreasInput.fill(values.focusAreas);
    }
  }

  async setSyncAsyncRatio(value: string) {
    await this.expandIfCollapsed();
    if (!(await this.syncAsyncRatioSlider.isVisible())) {
      return;
    }
    await this.syncAsyncRatioSlider.fill(value);
  }
}
