---

name: jira-bug-reporter

description: >-

  Creates structured Jira Bug tickets from failing Playwright tests, QA findings,

  or test automation output. Use when the user asks to file, log, raise, or create

  a bug in Jira, report a test failure, or turn a failing test case (TC-XXX) into

  a ticket for Didaxis Studio (DS project). Produces repro steps, expected vs actual,

  environment details, spec and trace references, labels, and a Relates link to the

  parent story via Atlassian MCP.

---



# Jira Bug Reporter



Create a Jira Bug from a test failure or QA finding.



## When to use



- Playwright test failed and the user wants it logged in Jira

- User says: "file a bug", "log TC-011", "create defect for DS-2"

- Manual QA found a defect while validating a DS story



## When NOT to use



- Test plan from story acceptance criteria → use `jira-ticket-analyzer`

- Duplicate search or triage only → use Atlassian `triage-issue`



## Defaults



| Field | Default |

|---|---|

| cloudId | `legionqaschool.atlassian.net` |

| projectKey | `DS` |

| issueTypeName | `Bug` |

| priority | High (user-visible failure) or Medium (minor) |

| labels | `Rena`, `qa-automation`, `playwright`, + feature slug |

| link type | `Relates` |



## Steps



1. Gather failure context (test name, TC-ID, spec file, error, trace, parent story key)



2. Search Jira for duplicates (optional — or defer to triage-issue). Only search if the user specifically asks. If a duplicate exists, report the issue key and ask whether to comment instead of creating.



3. Draft the bug (show summary and body to the user for approval unless they said "create now" or "file the bug"). Create via `createJiraIssue` — pass the markdown body as `description` with `contentFormat: "markdown"`, plus project DS, type Bug, priority, and labels (see Defaults).



4. Bug title format:



   `[Rena] <Feature>: <symptom> (Playwright TC-XXX)`



   Title should include: my name (Rena), TC-ID, feature/module, trigger/action, and the actual problem.



5. Bug body should include:

   - preconditions

   - steps to reproduce

   - expected results

   - actual results

   - environment

   - test reference

   - any additional info, such as traces



6. Use real, specific values from the test run — never placeholders.



7. Link to parent story with `createIssueLink` (Relates). Use the new issue key returned from step 3.



8. Return the new issue key and Jira URL. Save a local backup to `bug/<parent-story>-<TC-ID>.bug.md` (e.g. `bug/DS-2-TC-011.bug.md`).



## Output



- **Primary:** Jira issue key and URL

- **Local backup:** `bug/<parent-story>-<TC-ID>.bug.md`



## Example



**User prompt:** File a Jira bug for failing TC-011 on DS-2.



**Parent story:** DS-2 — Edit existing program details



### Summary (Jira title)



```

[Rena] Edit Program: duplicate name rejected on Save but no visible error (Playwright TC-011)

```



### Description (Jira body)



```markdown

## Summary

Playwright **TC-011** in `tests/ds2N-edit-program.spec.ts` fails: saving **Edit Program**

with a duplicate active program name keeps the modal open (save correctly rejected), but

**no user-visible error** appears within the assertion window.



## Preconditions

- Admin user signed in

- Two active programs exist with different names (A and B)



## Steps to reproduce

1. Sign in as **Admin** at https://test.didaxis.studio

2. Go to **Programs**

3. Create program **A** and program **B** with different names

4. Click **✏️ Edit** on program **A**

5. Change **Program Name** to match program **B**

6. Click **Save**



## Expected result

- Save is rejected (modal stays open)

- User sees accessible feedback: `role="alert"`, toast, or inline text matching

  duplicate / already exists / must be unique / name taken



## Actual result

- Modal remains open (save blocked)

- No alert, toast, or inline duplicate error visible within 8s



## Environment

- App: https://test.didaxis.studio

- Browser: Chromium (Playwright)

- Spec: `tests/ds2N-edit-program.spec.ts`

- Test: `TC-011 — Duplicate active Program Name blocked on Save`



## Test reference

- Assertion: duplicate feedback must be visible (`duplicateHint.first()`)

- Trace: `test-results/ds2N-edit-program-TC-011-.../trace.zip`



## Related story

DS-2 — Edit existing program details

```



### MCP — createJiraIssue



Pass the markdown body from **Description (Jira body)** above as `description`.



```json

{

  "cloudId": "legionqaschool.atlassian.net",

  "projectKey": "DS",

  "issueTypeName": "Bug",

  "summary": "[Rena] Edit Program: duplicate name rejected on Save but no visible error (Playwright TC-011)",

  "description": "<markdown body from Description section above>",

  "contentFormat": "markdown",

  "additional_fields": {

    "priority": { "name": "High" },

    "labels": ["Rena", "qa-automation", "playwright", "duplicate-name", "edit-program"]

  }

}

```



### MCP — createIssueLink



Use the issue key returned from `createJiraIssue` (e.g. DS-11) as `outwardIssue`.



```json

{

  "cloudId": "legionqaschool.atlassian.net",

  "inwardIssue": "DS-2",

  "outwardIssue": "<new-issue-key>",

  "type": "Relates",

  "comment": "Bug raised from failing Playwright TC-011 while validating DS-2."

}

```



### Agent response



```

Created DS-11: [Rena] Edit Program: duplicate name rejected on Save but no visible error (Playwright TC-011)

Linked: DS-11 Relates DS-2

https://legionqaschool.atlassian.net/browse/DS-11

Saved: bug/DS-2-TC-011.bug.md

```



### Local backup



Save to `bug/DS-2-TC-011.bug.md` with the same description plus metadata (Jira key, parent story, spec path).

