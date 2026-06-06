Feature: DS-5 — Program list filtering and display

  As an admin user, I want to see all programs in a clear list so that I can
  quickly find and manage them.

  # Happy paths

  Scenario: Programs page shows a list with each program's name and description preview
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist
    When I navigate to the Programs page
    Then I see "Web Development 2026" with its description preview
    And I see "Data Science 2026" with its description preview

  Scenario: Programs page header and "+ New Program" button are visible for Admin
    Given I am logged in as admin
    When I navigate to the Programs page
    Then I see the "Programs" heading
    And I see the "+ New Program" button

  Scenario: Admin sees Edit and Delete actions on each program row
    Given I am logged in as admin
    And a program "Row Actions" exists
    When I navigate to the Programs page
    Then I see an Edit button for "Row Actions"
    And I see a Delete button for "Row Actions"

  Scenario: Program without description still appears in the list
    Given I am logged in as admin
    And a program "No Desc Program" exists with no description
    When I navigate to the Programs page
    Then I see "No Desc Program" in the program list

  Scenario: Sidebar Programs navigation opens the Programs page
    Given I am logged in as admin
    And I am on the Dashboard
    When I click "Programs" in the sidebar
    Then I am on the Programs page at /programs

  Scenario: Clicking a program row opens the Semester Panel
    Given I am logged in as admin
    And a program "Semester Panel" exists
    When I click the row for "Semester Panel"
    Then I see semester-related content for "Semester Panel"

  Scenario: Manage Courses navigates to Course Builder from the Semester Panel
    Given I am logged in as admin
    And a program "Manage Courses" exists
    When I select "Manage Courses" and click "Manage Courses"
    Then I am navigated to /programs/{id}/courses

  Scenario: Program Name filter returns only matching programs
    Given I am logged in as admin
    And programs "Web Development A" and "Data Science" exist
    When I filter by Program Name "Web Development"
    Then I see "Web Development A"
    And I do not see "Data Science"

  Scenario: Clearing filters restores the full unfiltered program list
    Given I am logged in as admin
    And programs "Filter Clear A" and "Filter Clear B" exist
    When I filter by "Filter Clear A"
    And I clear the filter
    Then I see both "Filter Clear A" and "Filter Clear B"

  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    Then I see "No programs yet. Create your first program to get started."
    And I see a "Create Program" button

  Scenario: Empty state Create Program button opens the New Program modal
    Given I am logged in as admin
    And no programs exist
    When I click "Create Program" on the empty state
    Then I see the "New Program" modal

  # Negative

  Scenario: Clicking a program row must not navigate away unexpectedly
    Given I am logged in as admin
    And a program "No Navigate" exists
    When I click the row for "No Navigate"
    Then the URL still contains "/programs"

  Scenario: Manage Courses is not available if no program is selected
    Given I am logged in as admin
    When I navigate to the Programs page
    And no program row is selected
    Then the Manage Courses button is disabled or not visible

  Scenario: No results state is shown when filters match zero programs
    Given I am logged in as admin
    And the Program Name filter is available
    When I filter by a nonexistent program name
    Then no program data rows are shown

  Scenario: Programs API 500 shows an error state, not the empty state
    Given I am logged in as admin
    When the Programs API returns 500
    Then I do not see the empty state message
    And an error indication is shown

  Scenario: Editor sees "+ New Program" but Viewer does not
    Given programs exist in the system
    When I am logged in as editor and open Programs
    Then I see the "+ New Program" button
    When I am logged in as viewer and open Programs
    Then I do not see the "+ New Program" button

  # Edge cases

  Scenario: Description preview handles very long descriptions without breaking layout
    Given I am logged in as admin
    And a program with a 500-character description exists
    When I navigate to the Programs page
    Then the program row height remains within reasonable bounds

  Scenario: Program Name with special characters displays correctly in the list
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists
    When I navigate to the Programs page
    Then I see "Informatique & IA - Niveau 2" in the list

  Scenario: Switching selection updates Semester Panel to the newly selected program
    Given I am logged in as admin
    And programs "Panel Switch A" and "Panel Switch B" exist
    When I click "Panel Switch A"
    And I click "Panel Switch B"
    Then the semester panel heading shows "Panel Switch B"

  Scenario: Row click still works after list re-fetch following a mutation
    Given I am logged in as admin
    And programs "Post Mutation A" and "Post Mutation B" exist
    When I delete "Post Mutation A"
    And I click the row for "Post Mutation B"
    Then the semester panel shows content for "Post Mutation B"

  Scenario: Program Name filter trims leading/trailing spaces in the query
    Given I am logged in as admin
    And a program "Trim Filter" exists
    When I filter by "  Trim Filter  "
    Then I see "Trim Filter" in the list

  Scenario: After create/delete, list re-fetch preserves active filters
    Given I am logged in as admin
    And I filter by "Web"
    When I create a new program matching "Web"
    And I delete an older program matching "Web"
    Then the filtered list reflects the current matching programs

# Ambiguities and gaps in DS-5 acceptance criteria:
#
# - Jira ACs cover list display and empty state only; filtering, semester panel,
#   Manage Courses, and role-based visibility come from Confluence UI Behavior.
# - Program Name filter availability may vary by environment — tests skip when
#   the filter control is absent.
# - Empty state and zero-program tests require API setup to delete all programs.
# - Error state vs empty state on API failure is specified in Confluence but not
#   in Jira ACs (see DS-35).
# - Viewer read-only: edit/delete icon absence for viewer is covered in role
#   access tests cross-referenced from Confluence Overview.
