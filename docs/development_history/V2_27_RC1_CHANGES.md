# V2.27 RC1 — clearer scientific-reference warning

When a selected evidence record changes but the crop DR remains identical to the manuscript, the interface now displays **Referência científica alterada** / **Scientific reference changed**, explicitly noting that economic outputs do not change. A change in DR continues to display the modified-base warning and its DR delta. Imported data keep their own mode banner. No economic formulas, crop coefficients, evidence records, or original 4M data have been changed.

Run `source("run_tests.R")` and then `source("OPEN_APP.R")` in RStudio. Manual validation: apply MAN-002 (DR 0.00), confirm reference-only warning and unchanged results; apply MAN-001 (DR 0.65), confirm coefficient-change warning and increased EVP/EPV; restore manuscript scenario.
