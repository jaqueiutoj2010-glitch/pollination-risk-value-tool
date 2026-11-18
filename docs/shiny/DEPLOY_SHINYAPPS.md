# Deploying the review release to shinyapps.io

This file describes a simple route for providing reviewers with browser access to the R/Shiny version while preserving the frozen review release. The application lives in the repository's `shiny-app/` folder.

For the static website version (no R server needed), see [`../web/DEPLOY_CLOUDFLARE.md`](../web/DEPLOY_CLOUDFLARE.md).

## 1. Keep the review snapshot unchanged

The V2.41 review release is preserved in the Git tag `v2.41-review`. Do not move or replace that tag during peer review.

## 2. Install deployment tooling locally

In R:

```r
install.packages("rsconnect")
```

Create/sign in to a shinyapps.io account and configure the account from the shinyapps.io dashboard instructions. **Never commit tokens or secrets to GitHub.**

## 3. Deploy from the application folder

Open `shiny-app/PollinationRiskTool.Rproj`, then run:

```r
rsconnect::deployApp(
  appDir = ".",
  appName = "pollination-risk-value-review",
  appTitle = "Pollination Risk and Value Tool"
)
```

`appDir = "."` is the `shiny-app/` folder, which RStudio sets as the working directory. `rsconnect` detects the packages used by the app and uploads only that folder.

## 4. Verify the public copy

Before sharing the URL, verify at minimum:

- the four 4M crops and manuscript benchmarks;
- language switching;
- Scientific Catalogue search by common and scientific names;
- individual provenance panels;
- scenario labels (10%, 25%, 50% as stress tests);
- download/export controls;
- About/Version displays the review-release status.

Run the local checks as well, from `shiny-app/`:

```r
source("run_tests.R")
```

## 5. Record the review URL

After deployment, add the live URL to the manuscript/reviewer note and, if desired, to the repository README. Keep the tagged review snapshot immutable.

## After acceptance

Create a new final release rather than silently changing V2.41. The final release can include the accepted article citation, DOI/archive information, completed catalogue refinements, and the chosen software license.
