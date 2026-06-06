Feature: DS-3 — Program name validation and duplicate prevention

  As an admin user, I want the system to prevent invalid or duplicate program names
  so that data integrity is maintained.

  # Happy paths

  Scenario: Program is created when name contains allowed special characters
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Informatique & IA - Niveau 2"
    And I fill in Description with "Evening track for working professionals."
    And I click Create
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  Scenario: Program is created when Program Name length is exactly 100 characters
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 100-character valid name
    And I click Create
    Then the modal closes
    And the program list shows the 100-character name

  Scenario: Program is created when Description length is exactly 500 characters
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Desc500 Program"
    And I fill in Description with a 500-character value
    And I click Create
    Then the modal closes
    And the program is listed with the saved 500-character description

  Scenario: Program Name supports accented characters without corruption
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Économie Avancée"
    And I click Create
    Then the modal closes
    And the program list shows "Économie Avancée"

  # Negative

  Scenario: Whitespace-only Program Name blocks submission
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "   "
    Then the Create button is disabled

  Scenario: Duplicate Program Name is rejected with a server error
    Given I am logged in as admin
    And a program "Dup Check" already exists
    When I open the New Program form
    And I fill in Program Name with "Dup Check"
    And I click Create
    Then an error indicates the name already exists
    And the modal remains open
    And exactly one program named "Dup Check" appears in the list

  Scenario: Case-variant duplicate Program Name is rejected on create
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    When I open the New Program form
    And I fill in Program Name with "WEB DEVELOPMENT 2026"
    And I click Create
    Then an error indicates the name already exists
    And the modal remains open

  Scenario: Program Name exceeding 100 characters is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 101-character value
    Then the Create button is disabled or the submission is blocked with an error

  Scenario: Description exceeding 500 characters is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Desc501 Program"
    And I fill in Description with a 501-character value
    Then the Create button is disabled or the submission is blocked with an error

  Scenario: Program must not appear in list when server rejects creation
    Given I am logged in as admin
    And a program "Dup Phantom" already exists
    When I attempt to create another program named "Dup Phantom"
    And the server rejects the duplicate
    Then exactly one program named "Dup Phantom" appears in the list

  # Edge cases

  Scenario: Leading/trailing spaces are trimmed and still enforce duplicate prevention
    Given I am logged in as admin
    And a program "Trim Dup" already exists
    When I open the New Program form
    And I fill in Program Name with "  Trim Dup  "
    And I click Create
    Then an error indicates the name already exists
    And the modal remains open

  Scenario: Program Name containing quotes/brackets is displayed safely
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "AI \"Foundations\" (Level 1)"
    And I click Create
    Then the modal closes
    And the program list shows "AI \"Foundations\" (Level 1)"

# Ambiguities and gaps in DS-3 acceptance criteria:
#
# - Duplicate check scope: ACs say "same name" but Confluence requires uniqueness
#   per organization — case-insensitive matching is implied but not explicit.
# - Error UX: AC says "error indicating the name already exists" but does not
#   specify inline field error vs toast vs alert role.
# - Max length enforcement: Field Definitions say max 100/500; Jira ACs do not
#   mention length limits — covered via Confluence.
# - Edit-time duplicate rejection is covered under DS-2 / pw-ds2U, not DS-3 ACs.
# - Archived program names: whether an active program may reuse an archived name
#   is not specified.
