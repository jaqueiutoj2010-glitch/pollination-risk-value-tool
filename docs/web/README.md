# Pollination Risk and Value Tool — Web version 3.0

A static website that runs the Pollination Risk and Value Tool entirely in the browser. It reproduces the V2.41 R/Shiny application (same data, same formulas, same scientific guardrails) without a server, and adds four educational games.

The R/Shiny V2.41 application lives in `shiny-app/`. The website lives in `site/` and is published to Cloudflare (see [`DEPLOY_CLOUDFLARE.md`](DEPLOY_CLOUDFLARE.md)).

## Relation to V2.41

- **Same frozen 4M dataset.** `site/data/` holds byte-identical copies of the files in `shiny-app/data/`. `tools/check_site.mjs` fails if they differ.
- **Same calculations.** EVP = production value × DR; EPV = export value × DR; PEDR = EVP / total production value; EPDR = EPV / total export value; exposure = EVP (or EPV) × simulated reduction. The 4M benchmarks are reproduced: production US$ 230.1 M, EVP US$ 175.8 M, exports US$ 196.8 M, EPV US$ 165.3 M.
- **Same safeguards.** The 10%, 25% and 50% scenarios are standardized stress tests, not climate forecasts. The Scientific Catalogue (2,054 records) is reference material and is not used automatically in calculations. Evidence types (Giannini, Klein, Siopa) are never mixed or converted.
- **Version label.** The site identifies itself as "Version 3.0 · web version" and states that it reproduces V2.41. Its suggested citation is *Pollination Risk and Value Tool (Version 3.0). Web application.*; the manuscript remains associated with V2.41.

## What the website contains

| Tab | Content |
|---|---|
| Painel / Dashboard | Key results of the 4M system, per crop or combined, and a call to the games |
| Dados do artigo / Article data | Editable 4M table, evidence switch, restore manuscript scenario |
| Modelo de dados / Data template | Download the template (.xlsx or .csv), upload a filled table, validation, apply to the analysis |
| Cenários / Scenarios | Simulated reduction slider and the 10%, 25% and 50% scenarios |
| Evidências / Evidence | Evidence comparison per crop and its state (convergent, divergent, registered, not validated) |
| Catálogo / Catalogue | Search and filters over the 2,054 records, species overview, CSV export |
| Recomendações / Management | Six ecological-context questions and prioritized actions with sources |
| Método / Method, Sobre / About | Formulas, institutional and funding context, citation |
| Jogos / Games | Four games, described below |

Everything is bilingual (PT/EN) and works on phones and desktops. Uploaded spreadsheets are processed only in the visitor's browser; nothing is sent to a server.

### Educational games ("Hive Games", with the mascot Jandi, a jandaíra bee)

1. **Feira Sem Abelhas / Market Without Bees.** Build a basket, then watch each food shrink in proportion to its dependence coefficient. DRs come from the verified evidence base and, for the other foods, from Giannini et al. (2015) Table 1 as transcribed in the catalogue (flagged as pending taxonomic review on each card).
2. **Voo da abelha / The bee's flight.** An action game across the 10%, 25% and 50% scenarios, ending at the melon flower.
3. **Quanto Vale uma Abelha? / How Much Is a Bee Worth?** A game show built on the manuscript's 4M data that teaches the EVP calculation.
4. **Detetive de Evidências / Evidence Detective.** Stamp evidence records as cleared, under review or blocked. The correct answer is the status recorded in the evidence base, catalogue and source registry.

Scoring, difficulty and the basket percentage are teaching rules, not estimates. The site says so on every game page.

## Folder structure

```
site/                      published by Cloudflare
  index.html               entry page (hash routes: #painel, #cenarios, #jogo …)
  404.html                 page for unknown addresses
  _headers                 security and cache headers applied by Cloudflare
  robots.txt
  assets/
    app.js                 platform logic (tabs, calculations, import, catalogue)
    i18n.js help.js article.js   interface texts, glossary, help
    charts.js              charts and crop illustrations
    game.js bee.js games/  the four games and the shared "Colmeia" identity
    style.css
    fonts/                 self-hosted fonts (SIL OFL 1.1)
    vendor/                PapaParse (MIT), SheetJS 0.18.5 (Apache-2.0)
  data/                    copies of shiny-app/data/
wrangler.jsonc             Cloudflare: publish only ./site
tools/check_site.mjs       pre-publication check
.github/workflows/site-check.yaml   runs the check on GitHub
docs/web/                  this guide, the changelog and DEPLOY_CLOUDFLARE.md
```

The site has no build step and loads nothing from other domains: fonts, libraries and data are all served from `site/`.

## Updating the data

1. Change the file in `shiny-app/data/` (the R release) as usual.
2. Copy the same file to `site/data/`.
3. Run `node tools/check_site.mjs`. It must end with `SITE READY TO PUBLISH`.
4. Commit. Cloudflare republishes automatically.

While the manuscript is under review, the 4M dataset should stay frozen; the check also confirms the four benchmark totals.

## Local preview

```bash
npx wrangler dev                     # from the repository root, same headers as Cloudflare
cd site && python3 -m http.server    # alternative without Node
```

Opening `index.html` directly from the file system does not work, because browsers block reading the CSV files from `file://` addresses.

## Third-party components

See `site/assets/vendor/THIRD_PARTY_LICENSES.txt` and `site/assets/fonts/OFL.txt`. SheetJS 0.18.5 is the last version published on npm; it is used only to read spreadsheets the visitor chooses on their own computer.
