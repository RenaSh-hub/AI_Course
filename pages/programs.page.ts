import type { Locator, Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation.js';
import { EditProgramModal } from './components/edit-program.modal.js';
import { NewProgramModal } from './components/new-program.modal.js';
import { NewSemesterModal } from './components/new-semester.modal.js';

export class ProgramsPage {
  readonly path = '/programs';

  readonly heading: Locator;
  readonly newProgramButton: Locator;
  readonly programColumnHeader: Locator;
  readonly programNameFilter: Locator;
  readonly emptyStateMessage: Locator;
  readonly createProgramEmptyButton: Locator;
  readonly selectProgramHint: Locator;
  readonly manageCoursesButton: Locator;
  readonly newSemesterButton: Locator;
  readonly noSemestersMessage: Locator;
  readonly semestersConfigLabel: Locator;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;
  readonly newSemesterModal: NewSemesterModal;
  readonly nav: AppNavigation;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Programs' });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.programNameFilter = page.getByRole('textbox', { name: /program name/i });
    this.emptyStateMessage = page.getByText(
      'No programs yet. Create your first program to get started.',
    );
    this.createProgramEmptyButton = page.getByRole('button', { name: 'Create Program' });
    this.selectProgramHint = page.getByText('Select a program to manage semesters');
    this.manageCoursesButton = page.getByRole('button', {
      name: 'Manage Courses',
      exact: true,
    });
    this.newSemesterButton = page.getByRole('button', { name: '+ Semester' });
    this.noSemestersMessage = page.getByText('No semesters yet');
    this.semestersConfigLabel = page.getByText('Semesters & scheduling config');
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.newSemesterModal = new NewSemesterModal(page);
    this.nav = new AppNavigation(page);
  }

  async goto() {
    await this.page.goto(this.path);
    await this.page.waitForLoadState('networkidle');
  }

  async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  programRow(name: string) {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  programText(name: string) {
    return this.page.getByText(name, { exact: true });
  }

  descriptionInRow(programName: string, description: string) {
    return this.programRow(programName).getByText(description);
  }

  allRows() {
    return this.page.getByRole('row');
  }

  dataRowsExcludingFilterHeader() {
    return this.page.getByRole('row').filter({ hasNotText: /program name/i });
  }

  editButtonFor(programName: string) {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  deleteButtonFor(programName: string) {
    return this.page.getByRole('button', { name: `Delete ${programName}` });
  }

  semesterPanelHeading(programName: string) {
    return this.page.getByRole('heading', { level: 4, name: programName });
  }

  async openNewProgram() {
    await this.newProgramButton.click();
  }

  async openEditFor(programName: string) {
    await this.editButtonFor(programName).click();
  }

  async selectProgram(name: string) {
    await this.programText(name).click();
  }

  semesterName(name: string) {
    return this.page.getByText(name, { exact: true });
  }

  semesterDateRange(startDate: string, endDate: string) {
    return this.page.getByText(`${startDate} — ${endDate}`);
  }

  async openNewSemester() {
    await this.newSemesterButton.click();
  }

  async deleteProgram(name: string) {
    this.page.once('dialog', (d) => d.accept());
    await this.deleteButtonFor(name).click();
  }

  async filterByName(query: string) {
    if (!(await this.programNameFilter.isVisible())) {
      throw new Error('Program Name filter is not available on this page');
    }
    await this.programNameFilter.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async clearFilter() {
    await this.filterByName('');
  }

  async goToCourseBuilder() {
    await this.manageCoursesButton.click();
    await this.page.waitForURL((url) => !url.pathname.endsWith('/programs'), {
      timeout: 10_000,
    });
  }
}
