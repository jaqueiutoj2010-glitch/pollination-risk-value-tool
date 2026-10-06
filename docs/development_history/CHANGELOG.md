## 2.26.2 — Scientific and functional audit candidate
- Updated stale regression tests to current evidence-button and open-source wording.
- Added scientific guardrail regression test.
- Added DOI-format traceability test.
- Updated displayed version metadata to 2.26.2.
- No changes to economic calculations, DR values, evidence records, exposure matrix, or management decision rules.

# Changelog

## 2.26.1 — Scientific metadata refinement
- Completed language-specific developer attribution in About/ Sobre.
- Added Jaqueiuto S. Jorge ORCID metadata and persistent ORCID link.
- Refined software nature wording for a more formal scientific description.
- Refined initial-application wording to “fruit production systems”.
- Preserved all economic, evidence-provenance, exposure, and management logic from v2.26.
- License and formal software citation remain intentionally pending until public release/Zenodo deposition.

## V2.22 — scientific evidence architecture

- Preserves the calculation engine and 4M benchmarks already validated by GitHub Actions.
- Uses one scientific source per evidence record.
- Removes the combined Passion fruit reference; a second Brazil-specific record will only be added after exact provenance is verified.
- Adds Source_ID, Original_or_derived, and explicit lineage identifiers.
- Derived databases can share the lineage of an original source and therefore do not inflate the count of independent evidence.
- Distinguishes Registered evidence, Convergent evidence, Divergent evidence, and Evidence not validated.
- Treats an imported DR that does not match registered coefficients as unvalidated while preserving the user's value.
- Only selectable quantitative evidence can change calculations.
- Stores Evidence_ID, DOI, Source_ID, and scope when a registered coefficient is selected.
- Adds automated tests for scientific evidence semantics.

## V2.24 — Evidence-Based Management Foundation
- Added provenance-aware management evidence database.
- Added six ecological-context questions.
- Added exposure × context management-priority matrix.
- Added bilingual Management Recommendations tab.
- Preserved economic valuation and crop-dependence calculations from V2.23.
- Added scientific guardrails: exposure is not risk; unknown remains unknown; evidence strength is separate from management priority; pollinator response is not automatically yield or economic return.

## V2.24.1 — Management input persistence bugfix (2026-09-15)
- Fixed ecological-context selectors resetting to `Unknown` after each reactive update.
- Split management controls from reactive recommendation results so changing an answer no longer recreates the controls.
- Added Portuguese display labels while preserving stable English internal codes used by decision rules.
- Added regression test `test_management_input_persistence.R`.
- Economic calculations and DR evidence logic unchanged.

## V2.25 — Transparent Management Recommendation Cards (2026-09-15)
- Expanded each management card with a bilingual explanation of why the action was prioritized.
- Separates management priority from scientific evidence strength in the interface.
- Adds a concise statement of what the literature supports and an action-specific scientific caveat.
- Translates evidence-strength labels in Portuguese while preserving internal codes.
- Expands traceability details to show reference, evidence type, geographic scope, DOI, source link, and caveats.
- Preserves the V2.24.1 input-persistence fix and all economic/DR calculations.

## V2.25.1 — Evidence interaction bugfix
- Replaced the non-obvious HTML details/summary control with an explicit clickable evidence button.
- Added in-card expand/collapse panels for scientific evidence and DOI information.
- Added `aria-expanded` state for clearer interaction semantics.
- Reworded evidence count to `N fontes científicas` / `N scientific sources`.
- Added a diagnostic summary above prioritized actions (exposure, reported management pressures, and number of high/very-high priority actions).
- Preserved management input persistence and all V2.25 economic/evidence logic.
- Added `tests/test_management_evidence_toggle.R`.

## v2.26 — Scientific & Institutional Information (2026-09-15)
- Added bilingual About/Sobre tab with scientific purpose, scope, interpretation safeguards, institutional development, research funding, software metadata, and citation roadmap.
- Added UFRN as institutional development/support and CAPES/CNPq as research funding agencies.
- Uses textual institutional identification during the 2026 electoral communication restriction period; official marks are intentionally not embedded in this release pending compliance with current institutional rules.
- Completed Portuguese localization of management evidence type, scope, caveats, and source-access labels.
- Preserved economic calculations, pollinator-dependence evidence architecture, provenance logic, management decision rules, and evidence-toggle behavior.
