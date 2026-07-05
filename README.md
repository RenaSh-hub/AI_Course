# AI Course — QA Automation & Agent Skills

Monorepo for Didaxis Studio Playwright automation and Cursor agent skills.

## Structure

- `tests/` — Playwright specs
- `support/` — helpers, global setup/teardown, and cleanup tooling
- `fixtures/` — shared test fixtures (e.g. program cleanup)
- `.agents/skills/` — Cursor skills (Jira, API cleanup, program deleter)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials (never commit .env)
npx playwright test
```

## Secrets

All credentials live in `.env` at the repo root (gitignored). Use `.env.example` as a template.

## Cursor Automations

Scheduled and webhook-driven agents for DS Jira → Playwright coverage are documented in
[`.github/prompts/cursor-automations/README.md`](.github/prompts/cursor-automations/README.md).
