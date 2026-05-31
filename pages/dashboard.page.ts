import type { Locator, Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation.js';

export class DashboardPage {
  readonly path = '/';

  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly connectedBadge: Locator;
  readonly nav: AppNavigation;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.welcomeText = page.getByText('Welcome to Didaxis Studio');
    this.connectedBadge = page.getByText('Connected');
    this.nav = new AppNavigation(page);
  }

  async goto() {
    await this.page.goto(this.path);
  }
}
