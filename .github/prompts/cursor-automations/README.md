# Cursor Automations — prompt library

Copy-paste **Agent Instructions** into [Cursor Automations](https://cursor.com/automations),
or import via the `/automate` skill.

## DS In-Progress Playwright Generator

| Field | Value |
| ----- | ----- |
| **Prompt file** | [`ds-in-progress-playwright.prompt.md`](./ds-in-progress-playwright.prompt.md) |
| **Repository** | `RenaSh-hub/AI_Course` |
| **Base branch** | `main` |
| **Budget** | 5 tickets per run |
| **Merge policy** | Never merge |

### Triggers

**1. Scheduled (weekday evenings)**

| Setting | Value |
| ------- | ----- |
| Type | Scheduled / cron |
| Cron | `50 17 * * 1-5` |
| Timezone | `America/New_York` (17:50 US Eastern, Mon–Fri) |

**2. Jira — issue moved to In Progress (webhook)**

Cursor has no native Jira status trigger. Use a **Webhook** trigger on this automation plus a
Jira automation rule:

1. In Cursor Automations → add trigger **Webhook** → save → copy URL and API key.
2. In Jira → **Project settings → Automation** → Create rule:
   - **Trigger:** Work item transitioned → To status **In Progress**
   - **Optional condition:** `project = DS`
   - **Action:** Send web request → POST to the Cursor webhook URL with auth header
3. Payload should include at least `issue.key` (e.g. `DS-10`).

On webhook fire, the agent still enforces the JQL filter and `tests-generated` label check.

**Alternative:** Jira rule **Assign issue to @Cursor** when status → In Progress (requires
[Cursor in Jira](https://www.atlassian.com/blog/company-news/cursor-in-jira) marketplace app).
Use either webhook or @Cursor assignment — not both for the same ticket, to avoid duplicate runs.

### Tools (enable in automation settings)

- Terminal
- MCP: **Atlassian**
- MCP: **GitHub**
- Pull request creation (draft)
- Memories (optional)

### Cloud agent environment

Ensure the automation environment has Didaxis secrets (same as CI `dev1`):

- `DIDAXIS_URL`
- `DIDAXIS_EMAIL`
- `DIDAXIS_PASSWORD`
- `DIDAXIS_API_TOKEN`
- `CI=true` (retries + retain-on-failure traces)

### Setup checklist

1. [Cursor Automations](https://cursor.com/automations) → **New automation**
2. Name: `DS In-Progress Playwright Generator`
3. Add **Scheduled** trigger: `50 17 * * 1-5`, timezone `America/New_York`
4. Add **Webhook** trigger (optional, for In Progress events)
5. Repository: `RenaSh-hub/AI_Course`, branch `main`
6. Tools: Atlassian MCP, GitHub MCP, Terminal, Open PR
7. Paste body of [`ds-in-progress-playwright.prompt.md`](./ds-in-progress-playwright.prompt.md) (below YAML frontmatter) into **Agent instructions**
8. Save and activate
9. Run once manually on a narrow scope (one ticket) before relying on the schedule

### Machine-readable spec

See [`.cursor/automations/ds-in-progress-playwright.yaml`](../../../.cursor/automations/ds-in-progress-playwright.yaml) for the same definition in config-as-code form.
