Feature: DS-5 — Program list filtering and display

  As an admin user, I want to see all programs in a clear list so that I can
  quickly find and manage them.

  # Happy paths

  Scenario: Display program list with key details
    Given I am logged in as admin
    And programs exist in the system
    When I navigate to the Programs page
    Then I see a list showing each program's name and description

  Scenario: Program list shows name and description for a single program
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack cohort for 2026"
    When I navigate to the Programs page
    Then I see "Web Development 2026" in the program list
    And I see "Full-stack cohort for 2026" in the same row as "Web Development 2026"

  Scenario: Program list shows multiple programs with distinct names and descriptions
    Given I am logged in as admin
    And a program "Data Science 2026" exists with Description "ML fundamentals track"
    And a program "UX Design 2026" exists with Description "Human-centered design bootcamp"
    When I navigate to the Programs page
    Then I see "Data Science 2026" in the program list
    And I see "ML fundamentals track" in the same row as "Data Science 2026"
    And I see "UX Design 2026" in the program list
    And I see "Human-centered design bootcamp" in the same row as "UX Design 2026"

  Scenario: Programs page heading and table structure are visible
    Given I am logged in as admin
    And at least one program exists
    When I navigate to the Programs page
    Then I see the "Programs" page heading
    And I see a "Program" column header in the list

  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  Scenario: Empty state Create Program button opens New Program modal
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    And I click the Create Program button in the empty state
    Then I see the New Program modal

  # Negative

  Scenario: Empty state is not shown when programs exist
    Given I am logged in as admin
    And a program "Visible Program" exists
    When I navigate to the Programs page
    Then I do not see the empty-state message
    And I see "Visible Program" in the program list

  Scenario: Program without description still appears in list
    Given I am logged in as admin
    And a program "No Desc Program" exists with an empty Description
    When I navigate to the Programs page
    Then I see "No Desc Program" in the program list

  # Edge cases

  Scenario: Program name with special characters displays correctly in list
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists with Description "A & B <tag> \"quotes\""
    When I navigate to the Programs page
    Then I see "Informatique & IA - Niveau 2" in the program list
    And I see "A & B <tag> \"quotes\"" in the same row

  Scenario: Long description up to 500 characters displays in list row
    Given I am logged in as admin
    And a program "Long Desc Program" exists with a 500-character Description
    When I navigate to the Programs page
    Then I see "Long Desc Program" in the program list
    And the row for "Long Desc Program" shows the saved description text

  Scenario: Program list persists after page reload
    Given I am logged in as admin
    And a program "Persist Check" exists with Description "Survives reload"
    When I navigate to the Programs page
    And I reload the Programs page
    Then I see "Persist Check" in the program list
    And I see "Survives reload" in the same row

  Scenario: New Program button is available when programs exist
    Given I am logged in as admin
    And at least one program exists
    When I navigate to the Programs page
    Then I see the "+ New Program" button

# Ambiguities and gaps in DS-5 acceptance criteria:
#
# - Filtering: Ticket title mentions "filtering" but ACs only cover display and
#   empty state. Whether Program Name filter is in scope for DS-5 is unclear.
# - Sort order: Default sort (alphabetical, created date) is not specified.
# - Pagination: Behavior when many programs exist is not defined.
# - Archived programs: Whether archived programs appear in the list is unspecified.
# - Description truncation: Whether long descriptions are truncated in the table
#   with a tooltip is not specified.
# - Role coverage: ACs specify admin; Viewer/Editor list visibility is in DS-6.
