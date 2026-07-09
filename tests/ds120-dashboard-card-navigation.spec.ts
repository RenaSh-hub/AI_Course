import { test, expect } from '../fixtures/cleanup.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import type { DashboardCardName } from '../pages/dashboard.page';

const NAVIGATION_CARDS: Array<{
  tc: string;
  name: DashboardCardName;
  heading: string;
  path: RegExp;
}> = [
  { tc: 'TC-002', name: 'Programs', heading: 'Programs', path: /\/programs/ },
  { tc: 'TC-003', name: 'Calendar', heading: 'Calendar', path: /\/calendar/ },
  { tc: 'TC-004', name: 'Validation', heading: 'Validation', path: /\/validation/ },
  { tc: 'TC-005', name: 'AI Assist', heading: 'AI Assist', path: /\/cli/ },
];

test.describe('DS-120 — Dashboard card navigation regression', () => {
  test.beforeEach(async ({ page }) => {
    await new DashboardPage(page).goto();
  });

  test('TC-001 — Dashboard displays Programs, Calendar, Validation, and AI Assist cards', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.programsCard).toBeVisible();
    await expect(dashboard.calendarCard).toBeVisible();
    await expect(dashboard.validationCard).toBeVisible();
    await expect(dashboard.aiAssistCard).toBeVisible();
  });

  for (const { tc, name, heading, path } of NAVIGATION_CARDS) {
    test(`${tc} — ${name} dashboard card navigates to ${heading} page`, async ({ page }) => {
      const dashboard = new DashboardPage(page);

      await expect(page).toHaveURL(/\/(?:$|\?)/);
      await dashboard.dashboardCard(name).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    });
  }
});
