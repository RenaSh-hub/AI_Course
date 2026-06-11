import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly path = '/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly subtitle: Locator;
  readonly invalidCredentialsError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.subtitle = page.getByText('Sign in to your account');
    this.invalidCredentialsError = page.getByText('Invalid email or password');
  }

  async goto() {
    await this.page.goto(this.path);
  }

  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitSignIn() {
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillCredentials(email, password);
    await this.submitSignIn();
    await this.page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 30_000,
    });
  }
}
