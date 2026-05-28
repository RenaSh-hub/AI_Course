# AI Course — QA Automation & Agent Skills

Monorepo for Didaxis Studio Playwright automation and Cursor agent skills.

## Structure

- `AI_powered_QA_automation/` — Playwright tests, fixtures, and cleanup tooling
- `.agents/skills/` — Cursor skills (Jira, API cleanup, program deleter)

## Setup

```bash
cd AI_powered_QA_automation
npm install
cp .env.example .env
# Edit .env with your credentials (never commit .env)
npx playwright test
```

## Secrets

All credentials live in `AI_powered_QA_automation/.env` (gitignored). Use `.env.example` as a template.
