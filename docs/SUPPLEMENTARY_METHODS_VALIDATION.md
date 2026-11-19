# Supplementary Methods — computational implementation and validation

**Project:** Pollination Risk and Value Tool  
**Manuscript:** *Valuing Pollination Ecosystem Services in Tropical Drylands: A Reproducible Decision-Support Framework*  
**Editorial context:** substantially revised new submission to *Ecosystem Services*; previous manuscript ECOSER-D-26-01259.

## S1. Computational implementations

The framework has two implementations: R/Shiny V2.41 (`shiny-app/`) and browser-based JavaScript V3.0 (`site/`). Both use the fixed four-crop (4M) analytical dataset for melon, watermelon, mango and papaya. Users may explore alternative dependence coefficients or import separate data without changing the frozen manuscript baseline.

## S2. Economic indicators

For crop `i`, let `PV_i` denote production value, `XV_i` export value, and `DR_i` the selected pollination-dependence ratio, bounded between 0 and 1.

- Economic value of pollination in production: `EVP = sum_i(PV_i * DR_i)`.
- Economic value of pollination in exports: `EPV = sum_i(XV_i * DR_i)`.
- Production economic dependence ratio: `PEDR = EVP / sum_i(PV_i)`.
- Export economic dependence ratio: `EPDR = EPV / sum_i(XV_i)`.
- Hypothetical proportional exposure under service reduction `r`: `ProductionExposure = EVP * r`, `ExportExposure = EPV * r`.

These are accounting-based dependency and hypothetical exposure estimates. They are not observed losses, forecasts, pollinator population estimates, or measured ecological risk.

## S3. Frozen reference dataset and expected outputs

| Indicator | Reference result |
|---|---:|
| Total production value | US$ 230.1 million |
| EVP | US$ 175.775 million (displayed as US$ 175.8 million) |
| Total export value | US$ 196.8 million |
| EPV | US$ 165.3 million |
| PEDR | 76.4% (rounded) |
| EPDR | 84.0% (rounded) |

The fixed reference uses crop-level DRs of 0.95 (melon), 0.95 (watermelon), 0.00 (mango) and 0.05 (papaya). Source selection and alternative DRs must be documented separately from the frozen baseline.

## S4. Automated numerical validation

The `R tests` GitHub Actions workflow invokes the production R function and the production JavaScript function on identical inputs. Eight scenarios are tested: 0%, 10%, 25%, 50% and 100% hypothetical reductions; an alternative DR vector; and all-zero and all-one DR boundaries. Each scenario compares eight indicators (`pv`, `xv`, `evp`, `epv`, `pedr`, `epdr`, `pl`, `xl`), yielding 64 comparisons. The predetermined absolute tolerance is `1e-9`.

**Validated workflow evidence:** GitHub Actions run [44561662788](https://github.com/jaqueiutoj2010-glitch/pollination-risk-value-tool/actions/runs/44561662788), commit `715736fe7dc12840623b7fd47ff0cb223abbc9ff`, branch `integracao-r-shiny-javascript`. The archived run artifact is `reproducibility-evidence-44561662788.zip`. The recorded audit of that artifact reported 64/64 passing comparisons and a maximum absolute difference of approximately `2.84e-14`. The two copies of the 4M dataset were reported to have the same SHA-256 digest: `7a03706ea46c9a9a8553e28c1b90efda75ac58cef14790a9c4565e2940b32859`. These reported results should be rechecked against the archived artifact when preparing the final submission.

The workflow result demonstrates numerical agreement **for the tested cases**, not exhaustive equivalence of user interfaces or independent validation of ecological assumptions.

## S5. Reproduction

1. Obtain the repository at the identified release commit.
2. Run `node tools/check_site.mjs` from the repository root.
3. Run `Rscript run_tests.R` from `shiny-app/` (R and Node.js required for cross-implementation tests).
4. Download the workflow artifact and retain `cross_implementation_results.csv`, `sha256_manifest.txt`, and `ci_metadata.txt` with the submission records.
5. Open the R/Shiny application by setting the working directory to `shiny-app/` and running `shiny::runApp(".")`. Access the JavaScript version through the web interface or a local web server.
6. Record any user-selected scientific source and modified dependence coefficients when reproducing scenarios.

## S6. Limitations and future research

The current framework does not directly incorporate pollinator abundance, habitat quality, landscape connectivity, climate trajectories, or population trends. Future research may add validated ecological and socioeconomic indicators. Any extensions will require transparent provenance, documented equations and renewed reproducibility testing.

## S7. Release status

The software license is being finalized and must be established before the official public release. The current branch and workflow evidence document a review-stage implementation, **not a finalized immutable software release**. A final release commit, archived source snapshot, exact data hashes and any DOI must be added before submission where applicable.
