import type { Locator, Page } from '@playwright/test';

export class NewSemesterModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly semesterNameInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly cancelButton: Locator;
  readonly createSemesterButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Semester' });
    this.heading = this.dialog.getByRole('heading', { name: 'New Semester' });
    this.semesterNameInput = this.dialog.getByRole('textbox', { name: 'Semester Name' });
    this.startDateInput = this.dialog.getByRole('textbox', { name: 'Start Date' });
    this.endDateInput = this.dialog.getByRole('textbox', { name: 'End Date' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.createSemesterButton = this.dialog.getByRole('button', { name: 'Create Semester' });
  }

  async fill(name: string, startDate: string, endDate: string) {
    await this.semesterNameInput.fill(name);
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
  }

  async submit() {
    await this.createSemesterButton.click();
  }
}
