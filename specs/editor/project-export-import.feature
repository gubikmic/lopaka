Feature: Project export and import

  Users can export the current project as a JSON file and import it
  later to restore the full project state including platform, display
  dimensions, and all layers with their properties.

  Scenario: Exporting a project
    Given the user has layers on the canvas
    When the user clicks "Export project" in the code settings panel
    Then a .lopaka.json file is downloaded
    And the file contains the current platform identifier
    And the file contains the display dimensions
    And the file contains all serialized layer states

  Scenario: Importing a project
    Given the user clicks "Import project" in the code settings panel
    And selects a valid .lopaka.json file
    When the file is loaded
    Then the platform switches to the one specified in the file
    And the display dimensions are set from the file
    And all layers from the file are loaded onto the canvas
    And the previous layers are replaced

  Scenario: Importing a project with a different platform
    Given the current platform is U8g2
    And the user imports a project saved with TFT_eSPI platform
    When the import completes
    Then the platform switches to TFT_eSPI
    And the layers are loaded with TFT_eSPI features

  Scenario: Importing an invalid file
    Given the user selects a file that is not a valid Lopaka project
    When the import is attempted
    Then an error warning is shown to the user
    And the current project state is not changed

  Scenario: Exported file includes paint layer image data
    Given a paint layer with image data exists on the canvas
    When the project is exported
    Then the exported file contains the compressed image data
    And importing the file restores the paint layer with its image
