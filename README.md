# AI Course — Playwright QA for Didaxis Studio

Playwright suite plus Cursor agent skills/rules for Didaxis Studio.

Cloud Agents and scheduled backlog automation: see [AGENTS.md](AGENTS.md). Suite reliability metrics: [docs/eval-report.md](docs/eval-report.md).

## Setup

```bash
npm ci
npx playwright install chromium
cp .env.example .env
# Edit .env — fill Run tests vars (never commit .env)
```

## Environment

Copy [`.env.example`](.env.example) → `.env`. Two sections:

| Section | When you need it |
|---------|------------------|
| **Run tests** | Required to clone and run Playwright (`DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`, `DIDAXIS_API_TOKEN`; optional `DIDAXIS_ALT_*` for permission probes) |
| **Agent / CI** | Not needed for `npx playwright test` alone — `CURSOR_API_KEY` + Atlassian vars for the headless agent in [`.github/workflows/test-generation.yml`](.github/workflows/test-generation.yml); MCP tokens also go in Cursor settings |

Never put real secrets in `.env.example`. `.env` is gitignored.

## Run tests

```bash
# Full suite
npx playwright test

# CI-parity (retries / reporters via .cursor/automation.env)
npm run test:ci

# One spec while developing a ticket
npx playwright test tests/ds{N}-{slug}.spec.ts --project=chromium

# Auth setup only (debug storageState)
npx playwright test --project=setup
```

### CI (`.github/workflows/playwright.yml`)

| Trigger | Suite |
|---------|--------|
| Pull request | `npm run test:smoke` |
| Push | `npm run test:sanity` |
| Manual (`workflow_dispatch`) | Full suite (`npm run test:ci`) |

### Tagged slice

Each test carries exactly one of `@smoke` `@sanity` `@regression` `@api` `@e2e` `@destructive` (never on `describe`). `@destructive` is for shared/global state mutations only and always runs with one worker.

```bash
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:e2e
npm run test:destructive   # --workers=1
```

## Cursor agents & skills

Brief layout under `.cursor/`:

| Path | Role |
|------|------|
| `.cursor/rules/constitution.mdc` | Always-on MUST / SHOULD / WON'T |
| `.cursor/rules/playwright-conventions.mdc` | Locators, waiting, POM, auth, data |
| `.cursor/rules/qa-orchestrator.mdc` | Delegate a ticket or red build end to end |
| `.cursor/skills/` | Specialists: `jira-ticket-analyzer`, `eval-report`, `exploratory-charter`, `pom-conventions`, `api-cleanup`, `ci-failure-triage`, `self-heal`, `jira-bug-reporter`, … |
| `.cursor/agents/` | `test-writer`, `triage`, `bug-reporter` |
| `.cursor/hooks/` | `afterFileEdit` WON'T guard (blocks `waitForTimeout`, XPath, `any`, …) |

Point Cursor at this repo; skills apply when relevant. For Cloud/GHA secrets mirroring, see [AGENTS.md](AGENTS.md).
