# Suite reliability eval

**Window:** last **10** completed `playwright.yml` runs on `RenaSh-hub/AI_Course` (sampled 2026-07-08 → 2026-07-16; cancelled runs excluded).  
**Note:** Cursor has **no built-in telemetry** for these metrics. Numbers below come from CI logs, PR history, and session review — regenerate by re-measuring; do not invent.

| Metric | Value | How measured | What it tells us |
|--------|-------|--------------|------------------|
| Flake rate | **11 / 1 324 ≈ 0.8%** (11 flaky results across 10 runs) | Playwright summary lines in CI logs (`N flaky`); flaky = passed only on retry. Totals: 1 260 passed + 53 failed + 11 flaky. | Retries are masking a small but real instability (empty-state / delete / name-validation), not a green suite. |
| Heal success rate | **2 / 2** clean; **masked-regression = 0** | Heal PRs [#9](https://github.com/RenaSh-hub/AI_Course/pull/9), [#10](https://github.com/RenaSh-hub/AI_Course/pull/10): POM-only diffs, no `expect` changes in specs; triage classified drift. Masked-regression count = assertion weakenings or spec edits in heal PRs (must stay **0**). | Self-heal is doing the right thing when invoked; it is not hiding product bugs via weaker asserts. |
| Generation-gate pass rate | **0 / 5 (0%)** on first PR | Generated/coverage PRs [#5](https://github.com/RenaSh-hub/AI_Course/pull/5)–[#8](https://github.com/RenaSh-hub/AI_Course/pull/8), [#11](https://github.com/RenaSh-hub/AI_Course/pull/11): required check `Run Playwright tests` was **FAILURE** on first status. Gate = green + conventions-conforming + maps-to-AC. | Specs are merging/opening red; generation is not yet a reliable first-PR gate. |
| Ask-vs-guess | **Ask ≈ 0 · Guess ≈ n/a (unlogged)** | Manual review of recent agent sessions — Cursor does not record ask/guess. No structured log of “asked user” vs “invented value” exists yet. | We cannot steer agents toward ask-first until we start logging it; treat inventing AC/values as a process gap. |

### Flake detail (supporting)

Runs with `flaky > 0` in the sample: `29065727582` (1), `29065535531` (4), `29065534021` (3), `28913835237` (1), `28913799214` (2). Persistent hard fails (still red after retry) cluster on duplicate-name feedback (`ds2` TC-011, `ds3` TC-005/008/009/012) — product/assert gaps, not flake.

### Heal detail (supporting)

| PR | Scope | Assertions touched? | Clean heal? |
|----|--------|---------------------|-------------|
| #9 NewProgramModal heading | `pages/components/new-program.modal.ts` | No | Yes |
| #10 editButtonFor | `pages/programs.page.ts` | No | Yes |

## Top reliability risk

**Generated and mainline CI stay red on first run**, dominated by duplicate-name / validation expectations that fail after retry — so flake rate looks low while the suite still cannot gate PRs.

## Next action

1. File or refresh Jira bugs for the recurring duplicate-name failures; keep them out of “heal.”  
2. Do not merge generation PRs until the first CI check is green (enforce generation-gate in the orchestrator Done checklist).  
3. Start a one-line **Ask vs guess** tally in each orchestration session (append to this file or the PR body) so the next eval is measurable.

---

## How to re-run this eval

Apply the **`eval-report`** skill (`.cursor/skills/eval-report`), or follow its procedure. Update this file in place; keep the measurement method explicit every time.
