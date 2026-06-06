# DS-104 — [Rena] Create Program: random assertion fails intermittently in pipeline harness test (Playwright TC-FLAKY)

**Jira:** [DS-104](https://legionqaschool.atlassian.net/browse/DS-104)
**Parent story:** DS-1 — Create new academic program
**Spec:** `tests/pw-ds1U-create-program.spec.ts`
**Priority:** Medium

---

## Summary

Playwright **TC-FLAKY** in `tests/pw-ds1U-create-program.spec.ts` fails on CI: an intentional pipeline-verification harness test uses `expect(Math.random()).toBeGreaterThan(0.99)`, which fails on ~99% of runs and broke the **Playwright Tests** workflow on `main`.

## Preconditions

- GitHub Actions workflow **Playwright Tests** runs on push to `main`
- Spec `tests/pw-ds1U-create-program.spec.ts` includes the `Testing harness` describe block (added in commit `d4af6e8`)

## Steps to reproduce

1. Push commit `d4af6e8` (`test(ds1): add intentional flaky test for pipeline verification`) to `main`
2. Wait for GitHub Actions run **Playwright Tests** to complete
3. Alternatively, run locally:
   ```bash
   npx playwright test tests/pw-ds1U-create-program.spec.ts -g "TC-FLAKY"
   ```
4. Re-run several times to observe intermittent failure

## Expected result

- Harness test is used only for pipeline/flake-detection validation and should be removed before merging to a stable branch, **or** marked `test.fail()` / excluded from CI so it does not block the suite

## Actual result

- Test fails when `Math.random()` returns a value ≤ 0.99
- CI run **27052982508** reported **2 failed** (initial + retry #1):
  - Run 1: `Received: 0.3755778900661422`
  - Retry #1: `Received: 0.5511219867860864`
- Workflow exited with code 1; overall: 96 passed, 2 failed, 8 skipped (3.3m)

## Error output

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0.99
Received:   0.3755778900661422

  251 |       expect(Math.random()).toBeGreaterThan(0.99);
      at tests/pw-ds1U-create-program.spec.ts:251:29
```

## Environment

- App: https://test.didaxis.studio (suite also runs other specs; TC-FLAKY has no UI interaction)
- Browser: Chromium (Playwright headless, GitHub Actions)
- Spec: `tests/pw-ds1U-create-program.spec.ts`
- Test: `TC-FLAKY — Intentional flaky failure for pipeline verification`
- CI run: https://github.com/RenaSh-hub/AI_Course/actions/runs/27052982508
- Commit: `d4af6e8` — `test(ds1): add intentional flaky test for pipeline verification`
- Trace: `test-results/pw-ds1U-create-program-PW--a1a35-e-for-pipeline-verification-chromium/`

## Recommended fix

Remove the `Testing harness` block from `tests/pw-ds1U-create-program.spec.ts` once pipeline verification is complete, or gate it behind an env flag so it does not run in CI.

## Links

- **Relates:** DS-1
