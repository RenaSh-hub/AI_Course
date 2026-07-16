# Agent instructions

Guidance for Cursor Cloud Agents and scheduled automations working in this repo.

Behavioral governance (audit-then-edit, confidence gate, never invent paths/enums/env/messages) lives in [`.cursor/rules/constitution.mdc`](.cursor/rules/constitution.mdc) → **Agent governance**.

## Cursor Cloud

### Environment

Cloud setup is defined in `.cursor/environment.json`:

```bash
npm ci && npx playwright install --with-deps chromium
export CI=true   # via start — sets CI in the Cloud Agent shell
```

The install step runs automatically when the Cloud Agent starts. Do not skip it or assume browsers are preinstalled.

**CI-parity** (retries, GitHub reporter, `retain-on-failure` traces) is enabled three ways — use any one; they stack safely:

1. **Committed config** — `.cursor/automation.env` sets `CI=true`; `playwright.config.ts` loads it (after `.env`, without override).
2. **Shell env** — `environment.json` `start` exports `CI=true` for the Cloud Agent session.
3. **Explicit command** — `npm run test:ci` (canonical name for automation runs; CI comes from `automation.env`).

To run locally *without* CI parity, set `CI=` (empty) in your `.env` before `automation.env` is applied, or unset `CI` in the shell.

### Secrets

Configure these in the Cloud Agent **Secrets** tab (mirror GitHub Actions `dev1`):

- `DIDAXIS_URL`
- `DIDAXIS_EMAIL`
- `DIDAXIS_PASSWORD`
- `DIDAXIS_API_TOKEN`

Do not commit credentials. `.env` is gitignored and is not available in cloud runs unless secrets are mapped.

You do **not** need a separate `CI` secret — it is set by `.cursor/automation.env` and `environment.json`.

### Test commands

Run the full suite (CI-parity automatic via `automation.env`):

```bash
npx playwright test
```

Or explicitly:

```bash
npm run test:ci
```

Run one spec (preferred while developing a ticket):

```bash
npm run test:ci -- tests/ds{N}-{slug}.spec.ts --project=chromium
```

Run only the auth setup project (when debugging login/storageState):

```bash
npx playwright test --project=setup
```

Auth is handled by the `setup` project and `support/global-setup.ts`; specs depend on `playwright/.auth/user.json`. Follow `.cursor/rules/playwright-conventions.mdc` for locators, POMs, and cleanup.

### Backlog automation

When running as the scheduled backlog outer runner (GitHub Actions `test-generation.yml` or Cursor Cloud Automation), follow `.cursor/rules/qa-orchestrator.mdc` (Backlog mode + Automation carve-out):

- **GHA outer runner:** `.github/workflows/test-generation.yml` — daily 19:15 EDT + manual dispatch
- Query Jira: `project = DS AND status = "In Progress" AND labels != tests-generated`
- Budget: up to **5 tickets** per run
- Per ticket: analyze → write spec/POM → `npm run test:ci` → triage on red
- Output: one **DRAFT** PR per ticket, link the Jira ticket, add `tests-generated` on the **Jira ticket**
- **Never** merge, close, transition a ticket, or mark a PR ready for review

If the Jira queue is empty, exit without making changes.

### Suite reliability eval (mandatory)

Before treating a backlog or ticket run as done, apply `.cursor/skills/eval-report` and refresh [`docs/eval-report.md`](docs/eval-report.md) (see qa-orchestrator → **Mandatory: suite reliability eval**). Measure from CI/PR/session evidence only — Cursor has no built-in telemetry for flake, heal, generation-gate, or ask-vs-guess.
