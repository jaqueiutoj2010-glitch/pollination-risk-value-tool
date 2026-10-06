# Scientific and functional audit — V2.26.2

Date: 2026-09-15

## Scope
Static audit of the V2.26.1 codebase and curated CSV databases, followed by regression-test maintenance. No economic coefficient, evidence record, exposure threshold, or management decision rule was changed.

## Confirmed
- 4M baseline data and manuscript-oriented calculations remain unchanged.
- Missing evidence is represented as NA rather than silently converted to DR=0.
- Evidence divergence is preserved and alternative DRs require explicit selection.
- Economic exposure is separated from ecological risk/probability language.
- 10%, 25%, and 50% remain standardized pollination-service stress tests, not climate forecasts.
- Management priority and evidence strength remain separate dimensions.
- Unknown ecological context remains explicitly unknown in the interface/rules.
- Recommendation cards preserve rationale, supported outcome, caveat, source count, DOI, and article access.
- About/Institutional module distinguishes UFRN institutional support from CAPES/CNPq research funding.

## Literature spot-check
DOIs and bibliographic identities for the seven management-evidence records were spot-checked against publisher/PubMed/indexed records where available. Kennedy 2013, Dainese 2019, Tonietto & Larkin 2018, Albrecht 2020, Biddinger & Rajotte 2015, Egan et al. 2020, and Hipólito et al. 2026 matched the database identifiers. The 2026 Biological Conservation paper discussed during development was also verified but is not yet inserted into the current management database.

## Issue found and corrected
Two regression tests still searched for labels removed by later UI refinements ("Ver evidências e DOIs" and "Open source"). This could cause a false CI failure even though the current interface was functioning. Tests now target the current labels ("Ver evidências científicas" and "Open-source").

## New regression coverage
- `test_scientific_guardrails.R`
- `test_doi_traceability.R`
- expanded bilingual/institutional metadata checks

## Remaining validation
This package has undergone static audit in the assistant environment. It still requires execution in R/GitHub Actions before being designated a CI-validated stable release.
