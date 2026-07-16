---
name: eval-report
description: >-
  Measures and updates the suite reliability report in docs/eval-report.md (flake
  rate, heal success + masked-regression, generation-gate pass rate, ask-vs-guess).
  Use when the user asks to refresh/update the eval report, run the suite eval,
  or when qa-orchestrator requires the mandatory reliability eval before Done.
  Cursor has no telemetry — measure from CI logs, PR history, and session review
  only; never invent numbers.
---

# Eval Report

Refresh [`docs/eval-report.md`](../../../docs/eval-report.md). This skill is the
**how**; the orchestrator/constitution own the **when** (mandatory before Done).

## Guardrails

- **Never invent metrics.** If evidence is missing, write `n/a` / `unlogged` and say what was unavailable.
- Cursor has **no built-in telemetry** for these four numbers — only CI, PRs, and session review.
- **Masked-regression must be reported explicitly and must be 0** on a healthy heal path. If > 0, call it out as a hard failure in Top risk.
- Do not write specs, heal locators, or file bugs here — only measure and update the report.

## Inputs

| Input | Default |
|-------|---------|
| Window N | Last **10** completed `playwright.yml` runs (skip `cancelled`) |
| Repo | Current GitHub remote |

## Procedure

### 1. Flake rate

```bash
gh run list --workflow=playwright.yml --limit 10 --json databaseId,conclusion
# For each non-cancelled id:
gh run view <id> --log
```

From each log, read Playwright’s summary: `X passed`, `Y failed`, `Z flaky`  
(`flaky` = passed only on retry).

**Number:** `sum(Z) / sum(X+Y+Z)` over the window (also report raw `sum(Z)`).

### 2. Heal success rate + masked-regression

```bash
gh pr list --search "self-heal" --state all --limit 20
gh pr diff <n> --name-only
gh pr diff <n>
gh pr view <n> --json body,files,title
```

For each drift heal in the window (or all known heal PRs if the window is thin):

- **Clean heal:** triage said drift; diff is POM-only under `pages/`; assertions in specs unchanged; healed path intended to go green.
- **Masked-regression:** any heal that edits specs / weakens or deletes `expect(` / changes assertion intent → count it.

**Number:** `clean / total` heals; **masked-regression = N** (target **0**).

### 3. Generation-gate pass rate

Identify generated/coverage PRs in the window (titles like `[DRAFT] DS-*`, `test(DS-*`, automation branches under `qa/`).

```bash
gh pr view <n> --json statusCheckRollup,files,title,body
```

**Pass** on first PR only if all of:

1. Required Playwright check is **SUCCESS** on first conclusion (not after silent follow-up commits that redefine “first”),
2. Spec conforms to project conventions (spot-check: tags, POM, no WON'T violations),
3. Scenarios map to AC / feature plan (`features/*.feature.md` or PR body).

**Number:** `passes / total` generation PRs in the window.

### 4. Ask-vs-guess

Cursor does not record this. From **this session** (and any session notes in the PR/task):

- **Ask** — agent stopped and asked the user for a missing value (AC, env, oracle, scope).
- **Guess** — agent invented a value that should have been asked or sourced.

**Number:** `Ask = N · Guess = M` (or `unlogged` if no session evidence). Optionally append a one-line tally to the PR body next time so the next eval can count.

### 5. Write the report

Overwrite/update `docs/eval-report.md` using this shape:

```markdown
# Suite reliability eval

**Window:** last **N** completed `playwright.yml` runs …  
**Note:** Cursor has **no built-in telemetry** …

| Metric | Value | How measured | What it tells us |
|--------|-------|--------------|------------------|
| Flake rate | … | … | … |
| Heal success rate | … / … clean; **masked-regression = 0** | … | … |
| Generation-gate pass rate | … / … | … | … |
| Ask-vs-guess | Ask … · Guess … | … | … |

## Top reliability risk
…

## Next action
…
```

Each metric row: **the number**, **how you measured it** (CI logs / PR history / session review), **one line** on what it tells us.

### 6. Stop

Return a short summary (four numbers + top risk + next action). Do not merge or close work — the orchestrator decides Done.

## Done checklist

- [ ] All four metrics measured or explicitly `n/a`/`unlogged`
- [ ] Masked-regression stated (must call out if ≠ 0)
- [ ] `docs/eval-report.md` updated in place
- [ ] Top risk + next action present
