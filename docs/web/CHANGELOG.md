# Changelog — Web version

## 3.0.1 — Food illustrations (2026-11-18)

- Market Without Bees: the 25 fruits, vegetables, roots and seeds are redrawn one by one in `site/assets/games/alimentos.js`, closer to each species' real morphology (calyx and stalk position, ribs and lobes, cut halves showing flesh and seeds, banana hand, tapering roots, kidney-shaped beans, wedge-shaped Brazil nuts). Surface textures are clipped to the outline.
- 4M watermelon icon: rind stripes no longer cross the outline.
- Processed foods (drinks, bread, sweets) keep their previous icons.
- Tapioca redrawn as a folded, granular cassava-starch crepe on a plate, showing cheese, shredded chicken and parsley; avocado stalk now leaves the tip of the neck.
- Version labels: header, About page and footer now read "Version 3.0 · web version" (reproducing V2.41), with a 3.0 web citation.

## Repository reorganization (2026-11-18)

- The repository is now organized in three areas: `site/` (web version), `shiny-app/` (R/Shiny V2.41) and `docs/` (documentation).
- The R/Shiny files moved together into `shiny-app/`: `app.R`, `data/`, `tests/`, `OPEN_APP.R`, `run_tests.R`, `PollinationRiskTool.Rproj`, `VERSION` and `START_HERE.txt`. Their content is unchanged and their relative paths still work, because the tests and the app run from that folder.
- Documentation moved to `docs/web/` (this file, the web guide, `DEPLOY_CLOUDFLARE.md`) and `docs/shiny/` (`DEPLOY_SHINYAPPS.md`, `REVIEWER_NOTE.md`, `PUBLICATION_CHECKLIST.md`). `docs/development_history/` stays where it was.
- The main `README.md` was rewritten (PT/EN) to present both versions.
- `tools/check_site.mjs` and the *Website check* workflow now compare `site/data/` with `shiny-app/data/`. The *R tests* workflow runs inside `shiny-app/`.
- `.gitignore` also ignores `.wrangler/` and `node_modules/`.
- The release submitted for peer review is preserved in the `v2.41-review` tag with its original layout.

## 3.0.0 — Static website for Cloudflare (2026-11-18)

### Platform
- Rebuilt the V2.41 R/Shiny application as a static website (`site/`) that runs entirely in the browser, with no server and no R installation.
- Kept the frozen 4M dataset, the economic calculations, the evidence architecture, the management decision rules and the scientific safeguards of V2.41. `site/data/` holds byte-identical copies of the R release data (now `shiny-app/data/`).
- Bilingual interface (PT/EN), glossary, "how to use" help on every tab, responsive layout for phones.
- Data template download (.xlsx and .csv) and upload with validation, processed only in the visitor's browser.
- Scientific Catalogue with search, filters, species overview and CSV export.

### Educational games (new)
- "Jogos da Colmeia" tab with a shared visual identity and the mascot Jandi (*Melipona subnitida*), plus a call on the Dashboard.
- Feira Sem Abelhas (Market Without Bees), Voo da abelha (The bee's flight), Quanto Vale uma Abelha? (How Much Is a Bee Worth?) and Detetive de Evidências (Evidence Detective).
- Shareable images (story format and certificate) generated in the browser.

### Publishing
- `wrangler.jsonc` publishes only `site/` as a Cloudflare Workers static-assets site.
- `site/_headers` adds security headers (Content-Security-Policy, nosniff, referrer and permissions policies) and caching for fonts and data.
- Fonts and libraries are self-hosted; the site makes no requests to other domains.
- `tools/check_site.mjs` and the `Website check` GitHub workflow verify required files, script syntax, data identity with the R release, the 4M benchmarks and Cloudflare's file-size limit.

### Not changed
- No V2.41 file was modified in this release: `app.R`, `tests/`, `data/`, documentation and the R test workflow were untouched. (The later repository reorganization moved them; see above.)
