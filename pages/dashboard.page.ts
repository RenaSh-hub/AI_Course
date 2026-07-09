import type { Locator, Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation.js';

export type DashboardCardName = 'Programs' | 'Calendar' | 'Validation' | 'AI Assist';

const CARD_ROUTES: Record<DashboardCardName, RegExp> = {
  Programs: /\/programs/,
  Calendar: /\/calendar/,
  Validation: /\/validation/,
  'AI Assist': /\/cli/,
};

export class DashboardPage {
  readonly path = '/';

  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly connectedBadge: Locator;
  readonly nav: AppNavigation;
  readonly programsCard: Locator;
  readonly calendarCard: Locator;
  readonly validationCard: Locator;
  readonly aiAssistCard: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.welcomeText = page.getByText('Welcome to Didaxis Studio');
    this.connectedBadge = page.getByText('Connected');
    this.nav = new AppNavigation(page);
    this.programsCard = this.dashboardCard('Programs');
    this.calendarCard = this.dashboardCard('Calendar');
    this.validationCard = this.dashboardCard('Validation');
    this.aiAssistCard = this.dashboardCard('AI Assist');
  }

  dashboardCard(name: DashboardCardName): Locator {
    return this.page
      .locator('[class*="Paper"]')
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .first();
  }

  expectedRouteFor(card: DashboardCardName): RegExp {
    return CARD_ROUTES[card];
  }

  async goto() {
    await this.page.goto(this.path);
    await this.page.waitForLoadState('networkidle');
  }

  async clickCard(name: DashboardCardName) {
    await this.dashboardCard(name).click();
    await this.page.waitForURL(this.expectedRouteFor(name));
  }
}
