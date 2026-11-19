# Reproducibility and validation protocol / Protocolo de reprodutibilidade e validação

## Scope / Escopo

This document distinguishes **automated repository checks** from **independent numerical equivalence testing** of R/Shiny V2.41 and JavaScript web V3.0. Passing the current checks does **not**, on its own, establish full implementation equivalence.

Este documento distingue as **verificações automatizadas do repositório** dos **testes independentes de equivalência numérica** entre R/Shiny V2.41 e JavaScript web V3.0. A aprovação dos testes atuais, isoladamente, **não comprova equivalência integral**.

## Fixed manuscript baseline / Referência fixa do manuscrito

| Indicator / Indicador | Expected / Esperado |
|---|---:|
| Production value / Valor da produção | US$ 230.1 million |
| Economic value of pollination (EVP) | US$ 175.8 million |
| Export value / Valor das exportações | US$ 196.8 million |
| Export pollination value (EPV) | US$ 165.3 million |
| Production economic dependence ratio (PEDR) | 76.4% (rounded) |
| Export economic dependence ratio (EPDR) | 84.0% (rounded) |

Baseline crops: melon, watermelon, mango, papaya / melão, melancia, manga, mamão. The scientific source and exact crop-specific DR values must be recorded for every test.

## Automated checks / Verificações automatizadas

From repository root / Na raiz do repositório:

```bash
node tools/check_site.mjs
```

From `shiny-app/` / Na pasta `shiny-app/`:

```bash
Rscript run_tests.R
```

Inspect the corresponding **Website check** and **R tests** workflows in GitHub Actions. Record workflow run URL, branch, commit SHA, timestamp and outcome. Do not describe a test as passed without its execution result.

Consultar os workflows correspondentes no GitHub Actions. Registrar URL da execução, ramificação, SHA do commit, data/hora e resultado. Não declarar um teste aprovado sem evidência de execução.

## Cross-implementation comparison / Comparação entre implementações

Run identical inputs in both applications, preserving the exact numeric values before rounding. Compare:

1. Original 4M manuscript baseline, crop-level EVP and EPV, totals, PEDR and EPDR.
2. Pollination-service reductions of 0%, 10%, 25%, 50% and 100%, including production and export exposure.
3. Alternative scientific DR selections, documenting source, crop, selected coefficient, and whether the baseline is restored correctly.
4. Boundary inputs (DR = 0 and 1), missing values, invalid values and import-validation messages.
5. CSV import/export and whether imported demonstration data are kept separate from the frozen manuscript dataset.

Execute entradas idênticas nas duas aplicações e compare valores numéricos antes do arredondamento. Para cada caso, registre versão, fonte de DR, dados de entrada, valores de saída, diferença absoluta, diferença relativa e resultado. Defina a tolerância numérica **antes** da comparação e justifique-a; não confunda diferenças de arredondamento de exibição com divergências computacionais.

| Test case / Caso | R/Shiny output | JavaScript output | Absolute difference | Pass/fail | Evidence / Evidência |
|---|---|---|---|---|---|
| Baseline EVP | pending | pending | pending | pending | |
| Baseline EPV | pending | pending | pending | pending | |
| Baseline PEDR | pending | pending | pending | pending | |
| Baseline EPDR | pending | pending | pending | pending | |
| Scenario 10% | pending | pending | pending | pending | |
| Scenario 25% | pending | pending | pending | pending | |
| Scenario 50% | pending | pending | pending | pending | |
| DR source switch | pending | pending | pending | pending | |
| Restore manuscript scenario | pending | pending | pending | pending | |

**Status:** The matrix above is a validation plan, not a record of completed automated equivalence tests. / A matriz acima é um plano de validação, não um registro de testes automatizados de equivalência já concluídos.

## Automated evidence package / Pacote automático de evidências

The `R tests` workflow now generates a downloadable GitHub Actions artifact named `reproducibility-evidence-<run_id>`. When the run succeeds, it contains:

- `cross_implementation_results.csv`: 64 scenario-by-metric comparisons, including the R value, JavaScript value, absolute difference, numeric tolerance and pass/fail.
- `sha256_manifest.txt`: SHA-256 hashes for the R and JavaScript calculation source, both copies of the fixed 4M input dataset, the Node test harness and the cross-implementation test.
- `ci_metadata.txt`: commit SHA, branch and workflow run ID.

O workflow `R tests` agora gera um artefato para download com 64 comparações numéricas, hashes SHA-256 e identificação do commit. O artefato só comprova a execução correspondente; deve ser baixado e arquivado antes de expirar no GitHub Actions (retenção configurada em 90 dias).

**Important / Importante:** The earlier pending matrix remains a checklist for broader UI and source-selection behavior; the CSV produced by the new automated test documents the eight calculation scenarios specifically. Do not mark import/export and interface restoration as automated numerical tests without separate evidence.

## Interpretation / Interpretação

EVP and EPV estimate economic dependence under the selected DR assumptions. Exposure scenarios apply hypothetical proportional reductions to those values. They do not directly estimate observed economic losses, pollinator decline, or measured ecological risk.

EVP e EPV estimam dependência econômica sob as hipóteses de DR selecionadas. Os cenários aplicam reduções proporcionais hipotéticas a esses valores. Eles não estimam diretamente perdas econômicas observadas, declínio de polinizadores ou risco ecológico mensurado.

## Release checklist / Checklist de publicação

- [ ] Website check passed for the release commit / Aprovado no commit de publicação
- [ ] R tests passed for the release commit / Aprovado no commit de publicação
- [ ] Cross-implementation comparison completed and archived / Comparação concluída e arquivada
- [ ] Manuscript data and code version identified / Dados e versão identificados
- [ ] Citation and software license reviewed before official public release / Citação e licença revisadas antes da publicação oficial
