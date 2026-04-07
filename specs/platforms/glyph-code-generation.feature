Feature: U8g2 glyph code generation

  Glyph layers generate u8g2.drawGlyph() calls in the output code,
  with the correct font suffix based on the font's encoding range.

  Background:
    Given the platform is U8g2

  Scenario: Generating drawGlyph code for Arduino
    Given a glyph layer with code point 72 using font "open_iconic_all_2x"
    And the code template is Arduino
    When the code is generated
    Then the output contains "u8g2.setFont(u8g2_font_open_iconic_all_2x_tn)"
    And the output contains "u8g2.drawGlyph(" with the code point as hex "0x48"

  Scenario: Generating drawGlyph code for ESP-IDF
    Given a glyph layer with code point 72 using font "open_iconic_all_2x"
    And the code template is ESP-IDF
    When the code is generated
    Then the output contains "u8g2_SetFont(&u8g2, u8g2_font_open_iconic_all_2x_tn)"
    And the output contains "u8g2_DrawGlyph(&u8g2," with the code point as hex "0x48"

  Scenario: Font suffix detection for ASCII-range fonts
    Given a glyph layer using a font whose glyphs are all within code points 32-127
    When the code is generated
    Then the font suffix is "_tr"

  Scenario: Font suffix detection for extended-range fonts
    Given a glyph layer using a font with glyphs up to code point 255
    When the code is generated
    Then the font suffix is "_tn"

  Scenario: Font suffix detection for full-range icon fonts
    Given a glyph layer using a font with glyphs above code point 255
    When the code is generated
    Then the font suffix is "_tf"

  Scenario: Importing drawGlyph from source code
    Given source code containing "u8g2.drawGlyph(10, 20, 0x48)"
    When the source code is imported
    Then a glyph layer is created with code point 72 at position (10, 20)

  Scenario: Code point can be declared as a variable
    Given a glyph layer with code point 72
    When the user enables the variable toggle for the code point
    Then the generated code declares "int codePoint = 0x48"
    And the drawGlyph call uses the variable name
