Feature: DS-4 — Delete program with confirmation

  As an admin user, I want to delete a program I no longer need, with a
  confirmation step to prevent accidental deletion.

  # Happy paths

  Scenario: Delete program with confirmation
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Cancel program deletion
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Keep Program" exists
    When I click the delete icon for "Keep Program"
    Then I see a confirmation dialog
    When I click Cancel on the confirmation dialog
    Then "Keep Program" still exists in the program list

  Scenario: Program list updates immediately after confirmed deletion without manual refresh
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Refresh Check" exists
    When I click the delete icon for "Refresh Check"
    And I confirm deletion
    Then "Refresh Check" is removed from the program list without a manual page refresh

  # Negative

  Scenario: Program is not deleted when confirmation is dismissed
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Dismiss Check" exists
    When I click the delete icon for "Dismiss Check"
    And I dismiss the confirmation dialog without confirming
    Then "Dismiss Check" still exists in the program list

  Scenario: Other programs remain when one program is deleted
    Given I am logged in as admin
    And I am on the Programs page
    And programs "Alpha Program" and "Beta Program" exist
    When I click the delete icon for "Alpha Program"
    And I confirm deletion
    Then "Alpha Program" is removed from the program list
    And "Beta Program" still exists in the program list

  Scenario: Delete control is not available without clicking delete first
    Given I am logged in as admin
    And I am on the Programs page
    And a program "No Accidental Delete" exists
    Then "No Accidental Delete" still exists in the program list
    And no confirmation dialog is visible

  # Edge cases

  Scenario: Confirmation dialog references the program being deleted
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Named Target" exists
    When I click the delete icon for "Named Target"
    Then the confirmation dialog message references "Named Target"

  Scenario: Double-clicking delete shows only one confirmation dialog
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Double Delete" exists
    When I double-click the delete icon for "Double Delete"
    Then exactly one confirmation dialog is shown

  Scenario: Program with description can be deleted successfully
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Described Program" exists with Description "Evening cohort track"
    When I click the delete icon for "Described Program"
    And I confirm deletion
    Then "Described Program" is removed from the program list

  Scenario: Deleting the last program transitions to empty state
    Given I am logged in as admin
    And I am on the Programs page
    And only one program "Last One" exists
    When I click the delete icon for "Last One"
    And I confirm deletion
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

# Ambiguities and gaps in DS-4 acceptance criteria:
#
# - Confirmation UX: AC says "confirmation dialog" but does not specify native
#   browser confirm vs custom modal, or exact copy/button labels.
# - Role coverage: ACs specify admin only; Editor/Viewer delete denial is not
#   in DS-4 (covered partially in DS-6).
# - Soft delete vs hard delete: whether deleted programs are archived or
#   permanently removed is unspecified.
# - API failure on delete: error handling and list consistency are not defined.
# - Undo: no requirement for undo or recovery after confirmed deletion.
