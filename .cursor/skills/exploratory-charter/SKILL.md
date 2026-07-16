---
name: exploratory-charter
description: >-
  Turns a feature plus a risk into a fixed exploratory-testing charter and an
  empty findings template. Use when the user asks for a charter, session charter,
  exploratory charter, ET charter, or "feature + risk → charter". The human owns
  the mission and judgment; this skill only enforces the format. Do NOT use for
  ticket→Gherkin (jira-ticket-analyzer) or coverage-gap discovery
  (explore-and-generate).
---

# Exploratory Charter

Produce a **charter** and a **findings template** from a feature and a risk.
**The thinking is human; this skill just keeps the format.**

## Inputs

Ask only if missing:

1. **Feature** — what area/flow is in scope
2. **Risk** — what could go wrong / why this session exists

Optional (leave blank in the template if unknown): time box, build/env, tester.

## Guardrails

- Do **not** invent deep risks, oracles, or conclusions. Slot the user's words into the templates; use short placeholders (`_…_`) for anything they did not supply.
- Do **not** write Playwright specs, crawl the app, or file bugs here.
- One charter + one findings sheet per run. Keep both short enough to use in a real session.

## Procedure

1. Confirm feature + risk.
2. Emit the **Charter** block (fill known fields; leave the rest blank).
3. Emit the **Findings** template (empty rows ready for the human).
4. Stop. Do not execute the session unless the user asks separately.

## Charter template

```markdown
# Charter: <short title from feature>

| Field | Value |
|-------|--------|
| Feature | <feature> |
| Risk focus | <risk> |
| Mission | Explore <feature> with attention to <risk>. Find information that matters; do not "pass/fail" the feature. |
| Time box | <e.g. 45–60 min / _TBD_> |
| Build / env | <DIDAXIS_URL or build id / _TBD_> |
| Tester | <name / _TBD_> |
| Out of scope | <explicit boundaries / _TBD_> |
| Notes / setup | <accounts, data, flags / _TBD_> |

## Charter (one paragraph)

Explore **<feature>** to learn how it behaves when **<risk>** is in play.
Prefer questions over checklists. Stop when the time box ends or the risk
is understood well enough to decide next steps (bug, automation, or park).
```

## Findings template

```markdown
# Findings — <same title>

| # | Finding | Evidence (steps / URL / screenshot) | Severity (H/M/L / ?) | Follow-up (bug / automate / park) |
|---|---------|--------------------------------------|----------------------|-----------------------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## Session log (optional)

- Started:
- Ended:
- Coverage notes (areas touched):
- Open questions:
```

## Example

**User:** feature = Programs create modal; risk = validation messages don't clear after fix.

**Charter (filled):**

```markdown
# Charter: Programs create — sticky validation

| Field | Value |
|-------|--------|
| Feature | Programs create modal |
| Risk focus | Validation messages don't clear after the user fixes the field |
| Mission | Explore Programs create modal with attention to sticky validation. Find information that matters; do not "pass/fail" the feature. |
| Time box | 45 min |
| Build / env | _TBD_ |
| Tester | _TBD_ |
| Out of scope | Delete / semester flows |
| Notes / setup | Logged-in admin via storageState |

## Charter (one paragraph)

Explore **Programs create modal** to learn how it behaves when **validation
messages don't clear after the user fixes the field** is in play.
Prefer questions over checklists. Stop when the time box ends or the risk
is understood well enough to decide next steps (bug, automation, or park).
```

Then emit the empty findings table with the same title.
