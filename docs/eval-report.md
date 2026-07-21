# Suite reliability eval

**Window:** last **10** completed non-cancelled `playwright.yml` runs on `RenaSh-hub/AI_Course` (sampled 2026-07-08 → 2026-07-16; cancelled runs excluded).  
**Session:** Backlog outer runner 2026-07-21 — processed DS-3 (local `npm run test:ci -- tests/ds3-name-validation.spec.ts --project=chromium` → **13 passed**).  
**Note:** Cursor has **no built-in telemetry** for these metrics. Numbers below come from CI logs, PR history, and session review — regenerate by re-measuring; do not invent.

| Metric | Value | How measured | What it tells us |
|--------|-------|--------------|------------------|
| Flake rate | **10 / 1 308 ≈ 0.8%** (10 flaky results across 10 runs) | Playwright summary lines in `gh run view --log` (`N flaky`); flaky = passed only on retry. Totals: 1 243 passed + 55 failed + 10 flaky. Run `29467956732` log unavailable — substituted next completed failure `28913835237`. | Retries still mask a small amount of instability; hard fails dominate redness, not flake. |
| Heal success rate | **2 / 2** clean; **masked-regression = 0** | Heal PRs [#9](https://github.com/RenaSh-hub/AI_Course/pull/9), [#10](https://github.com/RenaSh-hub/AI_Course/pull/10): POM-only diffs under `pages/`; no assertion edits in specs. | Self-heal path stays healthy when used; backlog automation correctly did **not** invoke self-heal. |
| Generation-gate pass rate | **0 / 5 (0%)** on first PR check | Generated/coverage PRs [#5](https://github.com/RenaSh-hub/AI_Course/pull/5)–[#8](https://github.com/RenaSh-hub/AI_Course/pull/8), [#11](https://github.com/RenaSh-hub/AI_Course/pull/11): required check `Run Playwright tests` was **FAILURE** on first conclusion. Gate = green first check + conventions + maps-to-AC. | Historical generation PRs still fail the first-CI gate; DS-3 this session was green locally with `test.fail` documenting known duplicate bugs (pending first CI on the new DRAFT PR). |
| Ask-vs-guess | **Ask = 0 · Guess = 0** | This backlog session: queue/AC from Jira REST; locators/error oracle from existing POM (`duplicateNameError`); known duplicate bug from prior commits + pom-conventions demo guardrails — no invented paths/messages. | Ask-first held for this ticket; keep logging per session so the metric stays measurable. |

### Flake detail (supporting)

| Run id | Passed | Failed | Flaky |
|--------|--------|--------|-------|
| 29462776441 | 130 | 5 | 0 |
| 29460849658 | 136 | 5 | 0 |
| 29066219456 | 130 | 5 | 0 |
| 29065727582 | 129 | 5 | 1 |
| 29065597494 | 124 | 8 | 1 |
| 29065535531 | 127 | 4 | 4 |
| 29065534021 | 126 | 6 | 3 |
| 28981810541 | 130 | 5 | 0 |
| 28913844705 | 129 | 6 | 0 |
| 28913835237 | 112 | 6 | 1 |

Persistent hard fails cluster on duplicate-name feedback (`ds2` / `ds3` / DS-131) — product gaps documented with `test.fail` on DS-3 this run, not healed.

### Heal detail (supporting)

| PR | Scope | Assertions touched? | Clean heal? |
|----|--------|---------------------|-------------|
| #9 NewProgramModal heading | `pages/components/new-program.modal.ts` | No | Yes |
| #10 editButtonFor | `pages/programs.page.ts` | No | Yes |

## Top reliability risk

**Mainline and generation PRs stay red on first CI** because duplicate-name uniqueness is not enforced in the app; without `test.fail` (or filed bugs), those scenarios burn the generation gate.

## Next action

1. Human-approve filing Jira bugs for create-time duplicate-name gaps (DS-3 TC-005/008/009/012) — draft details in the DS-3 DRAFT PR; do not heal.  
2. Treat the new DS-3 DRAFT PR’s **first** `Run Playwright tests` conclusion as the generation-gate sample for the next eval.  
3. Keep a one-line Ask vs guess tally in each orchestration session (this run: Ask 0 · Guess 0).

---

## How to re-run this eval

Apply the **`eval-report`** skill (`.cursor/skills/eval-report`), or follow its procedure. Update this file in place; keep the measurement method explicit every time.
