import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { AUTH_FILE, EMPTY_STORAGE_STATE } from "./support/auth.constants";

dotenv.config();
dotenv.config({
  path: path.join(__dirname, ".cursor/automation.env"),
  override: false,
});

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./support/global-setup.ts",
  globalTeardown: "./support/global-teardown.ts",
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  reporter: [
    ["./support/program-cleanup-reporter.ts"],
    ["list"],
    ...(isCI ? [["github"] as const] : []),
    ["html", { open: "never" }],
  ],
  timeout: 60_000,
  use: {
    baseURL: process.env.DIDAXIS_URL,
    headless: true,
    trace: isCI ? "retain-on-failure" : "on",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "empty-state",
      testMatch:
        /ds7-empty-state\.spec\.ts|ds4-delete-program\.spec\.ts|ds5-program-list\.spec\.ts/,
      grep:
        /TC-010 — Deleting the last program transitions to empty state|Empty state shows message and Create Program button|Empty state Create Program button opens New Program modal|Deleting the last program shows empty state|TC-005 — Empty state when no programs exist|TC-006 — Empty state Create Program button opens New Program modal/,
      fullyParallel: false,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium",
      testIgnore: /login\.specs\.ts|ds7-empty-state\.spec\.ts/,
      grepInvert:
        /TC-010 — Deleting the last program transitions to empty state|Empty state shows message and Create Program button|Empty state Create Program button opens New Program modal|Deleting the last program shows empty state|TC-005 — Empty state when no programs exist|TC-006 — Empty state Create Program button opens New Program modal/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-login",
      testMatch: /login\.specs\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: EMPTY_STORAGE_STATE,
      },
    },
  ],
});
