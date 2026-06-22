## Coverage snapshot
- Page: `/programs` — New Program modal (create flow)
- Already covered (`tests/pw-ds1U-create-program.spec.ts`, plus related):
  - Open form via **+ New Program** — required fields visible (TC-001)
  - Happy-path create with name + description (TC-002); name-only / empty description (TC-004)
  - Empty Program Name keeps **Create** disabled (TC-003, TC-005)
  - No create without submit; cancel / close X / click-outside dismiss without list row (TC-006, TC-007, TC-007b, TC-007c)
  - Whitespace trim on submit (TC-008); list refresh after create (TC-012); modal closes after create (TC-021)
  - Double-click Create idempotency (TC-011); AI config section visible (TC-020)
  - Name/description length & special chars (`tests/ds3-name-validation.spec.ts`)
  - AI config fill, validation, collapse/expand unsaved edits (`tests/ds8-ai-config.spec.ts`)
  - Empty-state **Create Program** opens modal only — no end-to-end create (`tests/ds7-empty-state.spec.ts`, `tests/ds5-program-list.spec.ts` TC-006)
- Explored via a11y tree: this session (2026-06-22)

## Selected gap (one flow)
**Flow:** New Program modal form reset after dismiss
**Why this one:** Cancel/close specs assert the program is not saved but none verify the modal reopens clean — live exploration shows cancelled draft text still present and **Create** stays enabled, which risks accidental submission of a discarded draft.

## Gherkin test plan

Feature: Programs — New Program form reset after dismiss (discovered)

  # Positive path
  Scenario: TC-022 — Reopened New Program modal is empty after Cancel
    Given I am logged in as admin
    And I am on the Programs page
    When I click the button "+ New Program"
    And I fill the textbox "Program Name" with "Draft Program Alpha"
    And I fill the textbox "Description" with "Draft description to discard"
    And I click the button "Cancel"
    And I click the button "+ New Program"
    Then the dialog "New Program" is visible
    And the textbox "Program Name" is empty
    And the textbox "Description" is empty
    And the button "Create" is disabled

  # Edge case
  Scenario: TC-023 — Close X dismiss clears draft the same as Cancel
    Given I am logged in as admin
    And I am on the Programs page
    When I click the button "+ New Program"
    And I fill the textbox "Program Name" with "Draft Program Beta"
    And I click the close button in the "New Program" dialog banner
    And I click the button "+ New Program"
    Then the textbox "Program Name" is empty
    And the textbox "Program Name" does not contain "Draft Program Beta"
    And the button "Create" is disabled

## Locator hints (from a11y tree)
- New Program trigger: `button` named `+ New Program`
- Empty-state trigger (separate entry): `button` named `Create Program`
- Modal shell: `dialog` named `New Program`
- Program Name: `textbox` named `Program Name` (placeholder `e.g. Computer Science BSc`)
- Description: `textbox` named `Description` (placeholder `Brief description`)
- AI config toggle: `button` named `▸ Show AI Generation Config` / `▾ Hide AI Generation Config`
- Cancel: `button` named `Cancel`
- Submit: `button` named `Create` (exact — distinct from empty-state `Create Program`)
- Close X: `button` inside dialog `banner` (no accessible name in tree — scope to `New Program` dialog banner)

## For test-writer
- Suggested file: `tests/ds10-create-form-reset.spec.ts` (or add TC-022/TC-023 to `tests/pw-ds1U-create-program.spec.ts`)
- POM updates: none required — reuse `ProgramsPage.newProgramModal` (`programNameInput`, `descriptionInput`, `createButton`, `cancelButton`, `close()`)
- Follow `pom-conventions` and `playwright-conventions.mdc`; import `test` from `fixtures/cleanup.fixture.ts`
- **Note from exploration:** Current app behavior may fail the positive scenario (draft values persist after Cancel). If so, mark with `test.fail` and file a bug — do not work around stale state in the test.
- No program is created in these scenarios; `trackProgram` / API cleanup not required unless a regression test accidentally submits.
