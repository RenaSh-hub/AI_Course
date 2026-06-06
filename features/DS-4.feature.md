Feature: DS-4 — Delete program with confirmation

  As an admin user, I want to delete a program I no longer need, with a
  confirmation step to prevent accidental deletion.

  # Happy paths

  Scenario: Admin sees native confirm dialog with program name
    Given I am logged in as admin
    And a program "Del Confirm" exists
    When I click the delete icon for "Del Confirm"
    Then I see a browser confirmation dialog
    And the dialog message contains "Del Confirm"
    And the dialog warns that semesters and courses will be removed

  Scenario: Confirming delete removes program from the list
    Given I am logged in as admin
    And a program "Del OK" exists
    When I click the delete icon for "Del OK"
    And I confirm deletion
    Then "Del OK" is removed from the program list immediately

  Scenario: Cancel leaves program in the list
    Given I am logged in as admin
    And a program "Del Cancel" exists
    When I click the delete icon for "Del Cancel"
    And I dismiss the confirmation dialog
    Then "Del Cancel" still appears in the program list

  Scenario: Deleting one program does not remove others
    Given I am logged in as admin
    And programs "Del Target" and "Del Keep" exist
    When I confirm deletion of "Del Target"
    Then "Del Target" is not in the list
    And "Del Keep" is still in the list

  Scenario: List updates after delete without full page reload
    Given I am logged in as admin
    And a program "Del NoReload" exists
    When I confirm deletion of "Del NoReload"
    Then the Programs page heading remains visible
    And "Del NoReload" is not in the list

  # Negative

  Scenario: Editor has no usable delete control on program rows
    Given I am logged in as editor
    And a program "Del Editor UI" exists
    When I navigate to the Programs page
    Then I see "Del Editor UI" in the list
    And there is no delete button for "Del Editor UI"

  Scenario: Editor delete API is rejected
    Given I am logged in as editor
    And a program "Del Editor API" exists with a known UUID
    When I send DELETE /api/programs/{uuid} as editor
    Then the response status is 401, 403, or 405
    And the program still appears in the list

  Scenario: Viewer has no delete control
    Given I am logged in as viewer
    And a program "Del Viewer UI" exists
    When I navigate to the Programs page
    Then I see "Del Viewer UI" in the list
    And there is no delete button for "Del Viewer UI"

  Scenario: Viewer delete API is rejected
    Given I am logged in as viewer
    And a program "Del Viewer API" exists with a known UUID
    When I send DELETE /api/programs/{uuid} as viewer
    Then the response status is 401, 403, or 405
    And the program still appears in the list

  Scenario: Cancel does not trigger delete API
    Given I am logged in as admin
    And a program "Del NoAPI" exists
    When I click the delete icon for "Del NoAPI"
    And I dismiss the confirmation dialog
    Then no DELETE request was sent
    And "Del NoAPI" still appears in the list

  Scenario: Failed delete does not remove row
    Given I am logged in as admin
    And a program "Del Fail" exists
    When I confirm deletion but the server returns 500
    Then "Del Fail" still appears in the program list

  Scenario: Row not removed before confirmed success
    Given I am logged in as admin
    And a program "Del Slow" exists
    When I confirm deletion and the API is slow to respond
    Then the row remains visible until the delete succeeds

  # Edge cases

  Scenario: Confirm text includes special-character program name
    Given I am logged in as admin
    And a program "Test <Beta> & \"Quote\"" exists
    When I confirm deletion
    Then the program is removed from the list

  Scenario: Long Program Name (100 chars) appears in delete dialog
    Given I am logged in as admin
    And a program with a 100-character name exists
    When I confirm deletion
    Then the confirmation dialog contained the full program name

  Scenario: Delete last program shows empty state
    Given I am logged in as admin
    And no programs exist in the system
    When I navigate to the Programs page
    Then I see the empty state message
    And I see a "Create Program" button

  Scenario: Session expired on delete keeps program in list
    Given I am logged in as admin
    And a program "Del Expired" exists
    When I confirm deletion but the session is expired
    Then "Del Expired" still appears in the program list

  Scenario: Delete removes exactly one program by row identity
    Given I am logged in as admin
    And programs "Del RowA", "Del RowB", and "Del RowC" exist
    When I confirm deletion of "Del RowB"
    Then "Del RowA" and "Del RowC" remain visible
    And "Del RowB" is not visible

# Ambiguities and gaps in DS-4 acceptance criteria:
#
# - Role coverage: Jira ACs specify admin only; Confluence grants delete to admin
#   only — editor/viewer negative tests come from Confluence Overview.
# - Error UX on failed delete: Confluence says "error displayed" but ACs do not
#   specify toast vs inline message.
# - Empty state after deleting last program: implied by DS-5 overlap; requires
#   zero-program environment setup.
# - Double-click / rapid confirm on delete: not in DS-4 ACs; idempotency covered
#   in extended test suite.
# - Whether archived programs affect delete confirmation text is unspecified.
