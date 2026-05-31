/**
 * One-off benchmark: measures login vs openProgramsPage vs auth setup reuse.
 * Run: npx tsx scripts/benchmark-auth.ts
 */
import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

async function timeMs(label: string, fn: () => Promise<void>): Promise<number> {
  const start = performance.now();
  await fn();
  const ms = performance.now() - start;
  console.log(`${label}: ${(ms / 1000).toFixed(2)}s`);
  return ms;
}

async function loginOnly(page: import('playwright').Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 30_000 });
}

async function fullLogin(page: import('playwright').Page): Promise<void> {
  await loginOnly(page);
  await page.goto(`${BASE_URL}/programs`);
  await page.waitForLoadState('networkidle');
}

async function openProgramsOnly(page: import('playwright').Page): Promise<void> {
  await page.goto(`${BASE_URL}/programs`);
  await page.waitForLoadState('networkidle');
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const samples = 3;

  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Samples per scenario: ${samples}\n`);

  // --- Login only (auth.setup) ---
  const setupTimes: number[] = [];
  for (let i = 0; i < samples; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    setupTimes.push(
      await timeMs(`  login only #${i + 1}`, () => loginOnly(page)),
    );
    await context.close();
  }

  // --- Full login (old beforeEach) ---
  const loginTimes: number[] = [];
  for (let i = 0; i < samples; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    loginTimes.push(
      await timeMs(`  full login #${i + 1}`, () => fullLogin(page)),
    );
    await context.close();
  }

  // --- openProgramsPage with storageState (new beforeEach) ---
  const openTimes: number[] = [];
  for (let i = 0; i < samples; i++) {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();
    openTimes.push(
      await timeMs(`  open /programs #${i + 1}`, () => openProgramsOnly(page)),
    );
    await context.close();
  }

  await browser.close();

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const setupAvg = avg(setupTimes);
  const loginAvg = avg(loginTimes);
  const openAvg = avg(openTimes);
  const loginStepSaved = loginAvg - openAvg;

  const didaxisTests = 95;

  console.log('\n--- Averages ---');
  console.log(`Login only (auth.setup):         ${(setupAvg / 1000).toFixed(2)}s`);
  console.log(`Full login (old beforeEach):     ${(loginAvg / 1000).toFixed(2)}s`);
  console.log(`Open /programs (new beforeEach): ${(openAvg / 1000).toFixed(2)}s`);
  console.log(`Login step avoided per test:     ${(loginStepSaved / 1000).toFixed(2)}s`);

  console.log('\n--- Auth overhead comparison (Didaxis specs) ---');
  for (const n of [11, didaxisTests]) {
    const oldAuth = n * loginAvg;
    const newAuth = setupAvg + n * openAvg;
    const saved = oldAuth - newAuth;
    const pct = (saved / oldAuth) * 100;
    console.log(
      `${n} tests: ${(oldAuth / 1000).toFixed(0)}s → ${(newAuth / 1000).toFixed(0)}s auth overhead (saves ~${(saved / 1000).toFixed(0)}s, ${pct.toFixed(0)}% less)`,
    );
  }

  const workers = 8;
  const oldWallAuth = Math.ceil(didaxisTests / workers) * loginAvg;
  const newWallAuth = setupAvg + Math.ceil(didaxisTests / workers) * openAvg;
  console.log('\n--- Wall-clock auth time @ 8 workers (approx.) ---');
  console.log(
    `${didaxisTests} tests: ~${(oldWallAuth / 1000).toFixed(0)}s → ~${(newWallAuth / 1000).toFixed(0)}s (saves ~${((oldWallAuth - newWallAuth) / 1000).toFixed(0)}s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
