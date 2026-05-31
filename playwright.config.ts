import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { AUTH_FILE, EMPTY_STORAGE_STATE } from "./support/auth.constants";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./support/global-setup.ts",
  globalTeardown: "./support/global-teardown.ts",
  fullyParallel: true,
  retries: 0,
  reporter: [
    ["./support/program-cleanup-reporter.ts"],
    ["html", { open: "never" }],
  ],
  timeout: 60_000,
  use: {
    baseURL: process.env.DIDAXIS_URL,
    headless: true,
    trace: "on",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      testIgnore: /login\.specs\.ts/,
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
