# Pollination Risk and Value Tool — R/Shiny V2.41

**Version 2.41 · Public Review Release.** This folder holds the R/Shiny application that accompanies the manuscript under peer review. For the browser version without installation, see [`../site/`](../site/) and [`../docs/web/`](../docs/web/).

## Run locally

1. Open `PollinationRiskTool.Rproj` (in this folder) in RStudio.
2. Open `OPEN_APP.R` and click **Source**.

The launcher checks for `shiny`, `DT` and `readxl` and offers to install them from CRAN. RStudio sets this folder as the working directory, which is what `app.R` and the tests expect.

Without RStudio, start R inside this folder and run `shiny::runApp(".")`.

## Tests

From this folder:

```r
source("run_tests.R")
```

On GitHub the same tests run in the *R tests* workflow.

## Contents

| Path | Purpose |
|---|---|
| `app.R` | The application |
| `data/` | 4M dataset, evidence base, management rules, Scientific Catalogue, data template |
| `tests/` | Automated checks (data integrity, 4M benchmarks, guardrails, evidence semantics) |
| `OPEN_APP.R` | Launcher for RStudio |
| `run_tests.R` | Runs every test in `tests/` |
| `START_HERE.txt` | Short instructions |

`data/` is the source of truth for both versions. The website keeps an identical copy in `../site/data/`; after changing a file here, copy it there and run `node tools/check_site.mjs` from the repository root.

## Review status

The 4M analytical dataset is frozen while the manuscript is under review. The release submitted to reviewers, with its original folder layout, is preserved in the `v2.41-review` tag. Reviewer information and the shinyapps.io guide are in [`../docs/shiny/`](../docs/shiny/).
