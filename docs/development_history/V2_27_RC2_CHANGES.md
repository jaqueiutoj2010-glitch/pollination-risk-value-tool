# V2.27 RC2 — functional-validation package

- Preserves V2.27 RC1 app and all 4M manuscript data and scientific evidence records unchanged.
- Includes a ready-to-import CSV for coffee, apple, tomato and passion fruit with **fictitious economic data**; scientific DRs reflect the already registered evidence records. Not suitable for scientific reporting.
- Includes a regression test for the demonstration CSV schema and tomato alternatives.
- Launch: open `PollinationRiskTool.Rproj`, then `source("run_tests.R")` and `source("OPEN_APP.R")`.
- In `Modelo de dados`, import `data/DEMONSTRACAO_QUATRO_CULTURAS_NAO_CITAR.csv` and apply it. Test tomato DR 0.05 versus 0.65 in `Evidências`.
- Runtime tests require R and were not executed in the packaging environment.
