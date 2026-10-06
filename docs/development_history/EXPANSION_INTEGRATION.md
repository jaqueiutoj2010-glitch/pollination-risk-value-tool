# Expansion integration | V2.26.2 baseline preserved

The existing `data/crop_evidence_database.csv` already contains the seven evidence records for Coffee, Apple, Tomato and Passion fruit. No coefficients, evidence flags, app logic, 4M values, or management rules were modified.

New files: `data/expanded_crop_registry.csv` (human-readable registry) and `tests/test_expanded_crop_registry.R` (regression checks). The reviewed workbook is supplied separately; it is not an agricultural-input template. To calculate additional crops, enter real production and export data in the application template (`data/modelo_dados_cultivos.xlsx`) or download the template in the app. The application requires an explicit DR in the imported table and never automatically replaces it with a registered alternative.

Run `Rscript run_tests.R` from this folder with the required R packages installed. This package has been checked for archive integrity and CSV content, but R tests have not been executed in the current environment.
