Feature: Glyph tool

  The glyph tool allows users to place a single font glyph on the canvas,
  selecting it by code point from any available BDF font. This is used with
  U8g2's drawGlyph() API for rendering icons and symbols from icon fonts.

  Background:
    Given the platform is U8g2

  Scenario: Glyph tool is available on U8g2 platform
    When the user views the tools panel
    Then a glyph tool is available

  Scenario: Glyph tool is not available on other platforms
    Given the platform is AdafruitGFX
    When the user views the tools panel
    Then a glyph tool is not available

  Scenario: Creating a glyph layer
    When the user activates the glyph tool
    Then a glyph layer is created on the canvas
    And the glyph layer is centered on the display
    And the glyph layer uses the last selected font

  Scenario: Selecting a glyph by code point
    Given a glyph layer is selected
    When the user changes the code point to 72
    Then the glyph renders the character at code point 72
    And the canvas is redrawn

  Scenario: Selecting a glyph from the picker
    Given a glyph layer is selected
    And the font has glyph data loaded
    Then the inspector shows a visual glyph picker grid
    When the user clicks a glyph in the picker
    Then the glyph layer code point is updated to the selected glyph
    And the canvas is redrawn

  Scenario: Searching glyphs in the picker
    Given a glyph layer is selected
    And the glyph picker is visible
    When the user types a search query in the glyph picker
    Then only glyphs matching the query by name or hex code are shown

  Scenario: Changing the font updates the glyph picker
    Given a glyph layer is selected
    When the user selects a different font
    Then the glyph picker updates to show glyphs from the new font
