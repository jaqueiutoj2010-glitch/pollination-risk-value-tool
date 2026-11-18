# Pollination Risk and Value Tool

**Version 2.41 · Public Review Release**

Bilingual R/Shiny decision-support tool for exploring the economic value, crop dependence, and exposure of agricultural production and exports to pollination ecosystem services.

## Status during peer review

This release is intended to accompany a manuscript during peer review.

- The **4M analytical dataset is frozen** for reproducibility and reproduces the manuscript workflow.
- The **Scientific Catalogue is complementary** and is provided for evidence exploration and provenance tracking.
- Catalogue records are **not automatically used in the economic calculations**.
- The 10%, 25%, and 50% scenarios are standardized pollination-service stress tests, **not climate forecasts or probabilities**.
- Scientific catalogue refinements may be incorporated after manuscript acceptance without altering this archived review release.

## What is included

The application contains the article dataset and economic panels, scenarios, scientific evidence, management recommendations, methods, and a scientific catalogue with source-level traceability.

The catalogue bundled with this release contains **2,054 evidence records with 2,054 unique UIDs**: 127 Giannini records, 39 Klein records, and 1,888 Siopa experimental records. Different evidence types are kept distinct and are not automatically averaged or converted into a single crop-dependence coefficient.

## Run locally

Requirements: a current R installation and RStudio are recommended.

1. Download or clone this repository.
2. Open `PollinationRiskTool.Rproj` in RStudio.
3. Open `OPEN_APP.R` and click **Source**, or run:

```r
source("OPEN_APP.R")
```

The launcher checks for `shiny`, `DT`, and `readxl` and offers installation through CRAN when needed.

## Automated checks

Run:

```r
source("run_tests.R")
```

The repository also includes GitHub Actions checks for data integrity, scientific guardrails, evidence semantics, and reproduction of the core 4M benchmarks.

## Scientific safeguards

Evidence provenance is retained through unique identifiers, references, geographic scope, evidence type, validation state, and calculation eligibility. Derived databases should not be counted as independent evidence when they reproduce an underlying publication. Experimental observations are not treated automatically as general crop-dependence coefficients.

## Citation during review

Until a DOI-backed public software release is deposited, cite the software by its title and version:

> Jorge, J. S. and collaborators. (2026). *Pollination Risk and Value Tool* (Version 2.41, Public Review Release). R/Shiny software.

A DOI-backed citation can replace this provisional citation after the final public release is archived.

## Repository

Project repository: https://github.com/jaqueiutoj2010-glitch/Pollination-Risk-and-Value-Tool

## Deployment

For a browser-accessible review copy, see `DEPLOY_SHINYAPPS.md`. Do not commit account tokens, secrets, or deployment credentials to the repository.

## Funding and institutional context

The application interface documents the associated institutional and funding context, including UFRN, CAPES, and CNPq. The software should be interpreted together with the methodological safeguards presented in the application and manuscript.

## License

A software license has **not been assigned in this review package**. Choose and add the intended license before treating the repository as an openly licensed software release.
