Feature: Font selector with search

  The font selector dropdown provides a searchable list of available fonts
  for the current platform, allowing users to quickly find and select a font
  by typing part of its name.

  Scenario: Opening the font selector shows a search input
    Given a text layer is selected in the inspector
    When the user clicks the font selector button
    Then a dropdown appears with a search input at the top
    And the search input is focused
    And all available fonts for the current platform are listed below

  Scenario: U8g2 projects expose bundled Logisoso fonts
    Given a text layer is selected in the inspector for the u8g2 platform
    When the user clicks the font selector button
    Then the available fonts include "logisoso16"
    And the available fonts include "logisoso20"
    And the available fonts include "logisoso24"
    And the available fonts include "logisoso32"

  Scenario: Filtering fonts by search query
    Given the font selector dropdown is open
    When the user types "helv" in the search input
    Then only fonts whose name contains "helv" are shown
    And the match is case-insensitive

  Scenario: No matching fonts
    Given the font selector dropdown is open
    When the user types a query that matches no font names
    Then a "No fonts found" message is shown

  Scenario: Selecting a font from filtered results
    Given the font selector dropdown is open
    And the user has typed a search query
    When the user clicks a font in the filtered list
    Then that font is applied to the selected layer
    And the dropdown closes
    And the search query is cleared

  Scenario: Closing the dropdown clears the search
    Given the font selector dropdown is open
    And the user has typed a search query
    When the dropdown is closed by clicking outside or pressing Escape
    Then the search query is cleared

  Scenario: Escape key closes the dropdown
    Given the font selector dropdown is open
    And the search input is focused
    When the user presses the Escape key
    Then the dropdown closes
    And the search query is cleared
