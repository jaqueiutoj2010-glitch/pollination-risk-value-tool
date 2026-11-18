# Pollination Risk and Value Tool

[![Website check](https://github.com/jaqueiutoj2010-glitch/pollination-risk-value-tool/actions/workflows/site-check.yaml/badge.svg)](https://github.com/jaqueiutoj2010-glitch/pollination-risk-value-tool/actions/workflows/site-check.yaml)
[![R tests](https://github.com/jaqueiutoj2010-glitch/pollination-risk-value-tool/actions/workflows/R-tests.yaml/badge.svg)](https://github.com/jaqueiutoj2010-glitch/pollination-risk-value-tool/actions/workflows/R-tests.yaml)

Ferramenta bilíngue de apoio à decisão para estimar o valor econômico, a dependência das culturas e a exposição da produção agrícola e das exportações aos serviços de polinização.

Bilingual decision-support tool for exploring the economic value, crop dependence and exposure of agricultural production and exports to pollination ecosystem services.

**[Português](#português) · [English](#english)**

---

## Português

### Duas versões, um mesmo método

| | Versão web 3.0 | Versão R/Shiny V2.41 |
|---|---|---|
| **Pasta** | [`site/`](site/) | [`shiny-app/`](shiny-app/) |
| **Como usar** | Abrir no navegador, sem instalar nada | RStudio, no próprio computador |
| **Publicação** | Cloudflare, a partir deste repositório | shinyapps.io (opcional) |
| **Conteúdo** | Todas as abas da V2.41 e quatro jogos educativos | Versão pública congelada que acompanha o manuscrito em revisão |
| **Documentação** | [`docs/web/`](docs/web/) | [`shiny-app/README.md`](shiny-app/README.md) e [`docs/shiny/`](docs/shiny/) |

As duas versões usam o mesmo conjunto de dados 4M, as mesmas fórmulas e as mesmas salvaguardas científicas. A pasta `site/data/` é uma cópia idêntica de `shiny-app/data/`, e uma verificação automática confere isso a cada alteração.

### Estrutura do repositório

```
site/                 versão web 3.0 (a única pasta publicada pelo Cloudflare)
shiny-app/            versão R/Shiny V2.41: app.R, data/, tests/, OPEN_APP.R, run_tests.R
docs/
  web/                guia da versão web, histórico de mudanças, publicação no Cloudflare
  shiny/              publicação no shinyapps.io, nota aos revisores, checklist
  development_history/  histórico de desenvolvimento da versão R
tools/check_site.mjs  verificação do site antes de publicar
wrangler.jsonc        configuração do Cloudflare (publica só ./site)
CITATION.cff          como citar
```

### Status durante a revisão por pares

- O **conjunto analítico 4M está congelado** para reprodutibilidade e reproduz os cálculos do manuscrito: valor da produção US$ 230,1 M, EVP US$ 175,8 M, exportações US$ 196,8 M e EPV US$ 165,3 M.
- O **Catálogo científico é complementar**: 2.054 registros com UIDs únicos (127 Giannini, 39 Klein, 1.888 Siopa). Ele serve para consulta e rastreabilidade e **não entra automaticamente nos cálculos econômicos**.
- Os cenários de 10%, 25% e 50% são testes de estresse padronizados do serviço de polinização, **não previsões climáticas nem probabilidades**.
- A versão submetida aos revisores fica preservada na tag `v2.41-review`, com a organização original de pastas.

### Usar a versão web

O site é publicado pelo Cloudflare a cada *commit* na branch principal. A configuração está em [`docs/web/DEPLOY_CLOUDFLARE.md`](docs/web/DEPLOY_CLOUDFLARE.md).

Para ver localmente, a partir da raiz do repositório:

```bash
npx wrangler dev                     # mesmos cabeçalhos do Cloudflare
cd site && python3 -m http.server    # alternativa sem Node
```

### Usar a versão R/Shiny

1. Baixe ou clone o repositório.
2. Abra `shiny-app/PollinationRiskTool.Rproj` no RStudio.
3. Abra `OPEN_APP.R` e clique em **Source**.

O script confere os pacotes `shiny`, `DT` e `readxl` e oferece a instalação pelo CRAN.

### Verificações automáticas

| O que | Comando | No GitHub |
|---|---|---|
| Testes da versão R | `source("run_tests.R")`, dentro de `shiny-app/` | workflow *R tests* |
| Site | `node tools/check_site.mjs`, na raiz | workflow *Website check* |

A verificação do site confere os arquivos obrigatórios, a sintaxe dos scripts, se o site carrega apenas arquivos locais, se `site/data/` é idêntica a `shiny-app/data/`, os quatro totais do 4M e o limite de tamanho do Cloudflare.

### Atualizar os dados

Altere o arquivo em `shiny-app/data/`, copie o mesmo arquivo para `site/data/` e rode `node tools/check_site.mjs`. Enquanto o manuscrito estiver em revisão, o conjunto 4M deve permanecer congelado.

### Salvaguardas científicas

A proveniência das evidências é mantida por identificadores únicos, referência, abrangência geográfica, tipo de evidência, estado de validação e elegibilidade para o cálculo. Bases derivadas não contam como evidência independente quando reproduzem a mesma publicação. Observações experimentais não são tratadas automaticamente como coeficientes gerais de dependência, e tipos diferentes de evidência nunca são somados ou convertidos entre si.

### Como citar durante a revisão

> Jorge, J. S. e colaboradores. (2026). *Pollination Risk and Value Tool* (Version 2.41, Public Review Release). R/Shiny software.

Para a versão web (3.0), que reproduz a V2.41 e acrescenta os jogos:

> Jorge, J. S. e colaboradores. (2026). *Pollination Risk and Value Tool* (Version 3.0). Web application.

O manuscrito em revisão continua associado à V2.41. As duas citações valem até o depósito de uma versão pública com DOI.

### Financiamento e contexto institucional

Desenvolvido com apoio institucional da Universidade Federal do Rio Grande do Norte (UFRN) e financiamento da CAPES e do CNPq. As instituições não determinam a seleção das evidências, os coeficientes aplicados nem a interpretação dos resultados.

### Licença

Uma licença de software **ainda não foi atribuída**. Escolha e adicione a licença pretendida antes de tratar o repositório como software de licença aberta. Os componentes de terceiros usados pelo site têm as próprias licenças, listadas em `site/assets/vendor/THIRD_PARTY_LICENSES.txt` e `site/assets/fonts/OFL.txt`.

Não inclua tokens, senhas ou credenciais de publicação no repositório.

---

## English

### Two versions, one method

| | Web version 3.0 | R/Shiny version V2.41 |
|---|---|---|
| **Folder** | [`site/`](site/) | [`shiny-app/`](shiny-app/) |
| **How to use** | Open in a browser, nothing to install | RStudio, on your own computer |
| **Hosting** | Cloudflare, from this repository | shinyapps.io (optional) |
| **Content** | Every V2.41 tab plus four educational games | Frozen public release accompanying the manuscript under review |
| **Documentation** | [`docs/web/`](docs/web/) | [`shiny-app/README.md`](shiny-app/README.md) and [`docs/shiny/`](docs/shiny/) |

Both versions use the same 4M dataset, the same formulas and the same scientific safeguards. `site/data/` is a byte-identical copy of `shiny-app/data/`, and an automated check confirms this on every change.

### Repository layout

```
site/                 web version 3.0 (the only folder Cloudflare publishes)
shiny-app/            R/Shiny V2.41: app.R, data/, tests/, OPEN_APP.R, run_tests.R
docs/
  web/                web version guide, changelog, Cloudflare deployment
  shiny/              shinyapps.io deployment, reviewer note, checklist
  development_history/  development history of the R version
tools/check_site.mjs  website check before publishing
wrangler.jsonc        Cloudflare configuration (publishes only ./site)
CITATION.cff          how to cite
```

### Status during peer review

- The **4M analytical dataset is frozen** for reproducibility and reproduces the manuscript calculations: production value US$ 230.1 M, EVP US$ 175.8 M, exports US$ 196.8 M and EPV US$ 165.3 M.
- The **Scientific Catalogue is complementary**: 2,054 records with unique UIDs (127 Giannini, 39 Klein, 1,888 Siopa). It supports evidence exploration and provenance tracking and is **not automatically used in the economic calculations**.
- The 10%, 25% and 50% scenarios are standardized pollination-service stress tests, **not climate forecasts or probabilities**.
- The release submitted to reviewers is preserved in the `v2.41-review` tag, with the original folder layout.

### Using the web version

Cloudflare republishes the site on every commit to the main branch. Setup is described in [`docs/web/DEPLOY_CLOUDFLARE.md`](docs/web/DEPLOY_CLOUDFLARE.md).

To preview locally, from the repository root:

```bash
npx wrangler dev                     # same headers as Cloudflare
cd site && python3 -m http.server    # alternative without Node
```

### Using the R/Shiny version

1. Download or clone the repository.
2. Open `shiny-app/PollinationRiskTool.Rproj` in RStudio.
3. Open `OPEN_APP.R` and click **Source**.

The launcher checks for `shiny`, `DT` and `readxl` and offers to install them from CRAN.

### Automated checks

| What | Command | On GitHub |
|---|---|---|
| R version tests | `source("run_tests.R")`, inside `shiny-app/` | *R tests* workflow |
| Website | `node tools/check_site.mjs`, from the root | *Website check* workflow |

The website check confirms required files, script syntax, that the site loads only local files, that `site/data/` matches `shiny-app/data/`, the four 4M totals and Cloudflare's file-size limit.

### Updating the data

Change the file in `shiny-app/data/`, copy the same file to `site/data/` and run `node tools/check_site.mjs`. While the manuscript is under review, the 4M dataset should stay frozen.

### Scientific safeguards

Evidence provenance is retained through unique identifiers, references, geographic scope, evidence type, validation state and calculation eligibility. Derived databases are not counted as independent evidence when they reproduce an underlying publication. Experimental observations are not treated automatically as general crop-dependence coefficients, and different evidence types are never averaged or converted into one another.

### Citation during review

> Jorge, J. S. and collaborators. (2026). *Pollination Risk and Value Tool* (Version 2.41, Public Review Release). R/Shiny software.

For the web version (3.0), which reproduces V2.41 and adds the games:

> Jorge, J. S. and collaborators. (2026). *Pollination Risk and Value Tool* (Version 3.0). Web application.

The manuscript under review remains associated with V2.41. Both citations apply until a DOI-backed public release is archived.

### Funding and institutional context

Developed with institutional support from the Federal University of Rio Grande do Norte (UFRN) and funding from CAPES and CNPq. These institutions do not determine the evidence selected, the coefficients applied or the interpretation of the results.

### License

A software license has **not yet been assigned**. Choose and add the intended license before treating the repository as openly licensed software. Third-party components used by the website keep their own licenses, listed in `site/assets/vendor/THIRD_PARTY_LICENSES.txt` and `site/assets/fonts/OFL.txt`.

Do not commit account tokens, secrets or deployment credentials to the repository.
