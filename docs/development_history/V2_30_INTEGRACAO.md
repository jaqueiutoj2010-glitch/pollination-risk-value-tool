# V2.30 — Catálogo integrado

Integra a aba **Catálogo científico** ao aplicativo 4M V2.27 RC3. A base de 2.054 registros V29 permanece isolada em `data/catalogo_evidencias_v30.csv`.

## Execução
Abra `OPEN_APP.R` no RStudio, ou execute `shiny::runApp()` na pasta do projeto. Requer shiny, DT e readxl, como na versão anterior.

## Garantias e limites
- Os arquivos `data/article_4M.csv` e `data/crop_evidence_database.csv` são cópias byte a byte da RC3.
- A nova aba **não escreve** em `rv$d`, `article_data` ou `evidence_db`; não adiciona evidências selecionáveis aos cálculos.
- Giannini (127), Klein (39) e Siopa (1888) podem ser consultados, filtrados, examinados e exportados.
- A validação bibliográfica/taxonômica integral permanece pendente; esta é uma versão integrada de consulta, não uma certificação científica da base.
- O filtro de detalhes oferece até 1.000 UIDs da seleção atual; a tabela e a exportação abrangem todos os registros filtrados.

## Testes
`Rscript run_tests.R` para os testes herdados. Esta entrega passou em verificações estáticas e de integridade de dados; a execução interativa em R Shiny depende de R instalado no computador.
