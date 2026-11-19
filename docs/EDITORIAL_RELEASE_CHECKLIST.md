# Editorial release candidate — Pollination Risk and Value Tool

**Status / Situação:** preparation for a substantially revised new submission to *Ecosystem Services* (previous manuscript ECOSER-D-26-01259). **Not an official public software release.** / Preparação para nova submissão substancialmente revisada. **Não é lançamento público oficial.**

## 1. Software and data identity / Identificação do software e dados

- Web: JavaScript V3.0, `site/`.
- R/Shiny: V2.41, `shiny-app/`.
- Review branch: `integracao-r-shiny-javascript`.
- Frozen 4M input: `shiny-app/data/article_4M.csv` and mirrored `site/data/article_4M.csv`.
- Production value / valor da produção: US$ 230.1 M; EVP: US$ 175.8 M.
- Export value / exportações: US$ 196.8 M; EPV: US$ 165.3 M.
- Official release commit SHA and tag: **pending**. Record only after final validation; do not assume a branch is immutable.
- Dataset and code SHA-256 hashes: **pending**, to be archived with release materials.

## 2. Confirmed CI evidence / Evidências de integração contínua

GitHub Actions screenshot supplied during audit on 2026-11-19 shows green successful runs on the integration branch:

- **R tests #4**, commit prefix `1a76ee0`: cross-implementation comparison introduced.
- **R tests #5**, commit prefix `c0cf6ac`: Node setup and relevant-change triggers.
- **R tests #6**, commit prefix `be03a64`: PR triggers updated.
- **Website check #6**, commit prefix `2808171`: strengthened 4M validation and data checks.

These are workflow-level success indicators. Archive the complete logs, individual numeric deltas and exact run URLs before claiming a full reproducibility dossier. Tests after the final release commit must also pass.

A captura demonstra sucesso dos workflows, mas não substitui o arquivamento dos logs e das diferenças numéricas por cenário. Reexecutar no commit final.

## 3. Scientific boundaries / Limites científicos

The current tool calculates economic dependence and hypothetical proportional exposure, **not** directly observed losses, ecological risk, pollinator abundance, or forecasts. Alternative dependence ratios must be attributed to their scientific sources. Recommendations do not imply quantified effectiveness or return on investment.

A ferramenta estima dependência econômica e exposição proporcional hipotética, **não** perdas observadas, risco ecológico mensurado, abundância de polinizadores ou previsões. DRs alternativos devem manter a identificação da fonte; recomendações não implicam eficácia ou retorno financeiro quantificados.

## 4. Editorial package / Pacote editorial

- [x] Bilingual README and limitations / README bilíngue e limitações
- [x] Cross-implementation test code / Código de teste cruzado
- [x] CI success indicators reviewed / Indicadores de sucesso dos workflows conferidos
- [ ] Archive complete CI logs and scenario-level numeric differences / Arquivar logs e diferenças numéricas
- [ ] Confirm final commit and create immutable release tag / Confirmar commit final e criar tag
- [ ] Record SHA-256 hashes for source code and 4M datasets / Registrar hashes
- [ ] Audit all app text for outdated 'under peer review' wording / Auditar textos desatualizados
- [ ] Confirm complete manuscript-method and software-version alignment / Alinhar manuscrito e versões
- [ ] Finalize software license **before official public release** / Finalizar licença antes do lançamento oficial
- [ ] Prepare DOI-backed archival deposit if applicable / Preparar depósito arquivado com DOI, se aplicável

## 5. Suggested manuscript wording / Texto metodológico sugerido

**English:** “We implemented the analytical framework in R/Shiny (V2.41) and a browser-based JavaScript application (V3.0). Both implementations use the same fixed four-crop dataset and the same equations for pollination-dependent production and export values and their proportional exposure under hypothetical service-reduction scenarios. Automated checks verify the reference dataset and compare eight numerical scenarios across eight output indicators. The application does not directly estimate pollinator decline, observed economic losses, or ecological risk. Source code, input data, version identifiers, and validation records will be provided to reviewers with the revised submission.”

**Português:** “Implementamos o arcabouço analítico em R/Shiny (V2.41) e em uma aplicação JavaScript executada no navegador (V3.0). Ambas utilizam a mesma base fixa de quatro culturas e as mesmas equações para os valores da produção e das exportações dependentes da polinização e sua exposição proporcional em cenários hipotéticos de redução do serviço. Verificações automatizadas conferem os dados de referência e comparam oito cenários numéricos em oito indicadores. A aplicação não estima diretamente o declínio dos polinizadores, perdas econômicas observadas ou risco ecológico. O código-fonte, os dados de entrada, as versões e os registros de validação serão disponibilizados aos revisores na nova submissão.”

**Note / Nota:** Update the future-tense availability statement only after confirming the actual editorial access package.
