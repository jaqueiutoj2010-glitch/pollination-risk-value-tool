# V2.35: busca exata e metadados experimentais

- Pesquisa por nome popular exato prevalece por padrão; opção para incluir espécies relacionadas e correspondências parciais.
- Corrige alias genérico de Citrus que incluía indevidamente limão em outras culturas.
- Adiciona painel com metadados de estudo, variável de resposta, tratamento, escala, país e valor original dos três CSVs de Siopa, consultados por correspondência literal de espécie. **Não se atribui estudo a UID individual**, pois a ligação não foi verificada.
- Valores negativos de Siopa são preservados e sinalizados; nenhuma média de experimentos heterogêneos ou novo coeficiente econômico.
- 4M e 2.054 evidências permanecem inalterados.
- Instalação: extrair, abrir OPEN_APP.R no RStudio e executar. Requer teste interativo no RStudio.
