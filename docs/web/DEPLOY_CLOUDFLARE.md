# Publicar o site no Cloudflare · Deploy the website to Cloudflare

**Versão web 3.0** do Pollination Risk and Value Tool: um site estático (HTML, CSS e JavaScript) que reproduz a V2.41 no navegador, sem servidor e sem R.

O Cloudflare publica **somente a pasta `site/`**. Isso é definido no arquivo `wrangler.jsonc`, na raiz do repositório. A versão R/Shiny (`shiny-app/`) e a documentação (`docs/`) continuam no repositório, mas não são enviadas ao Cloudflare e não aparecem no site.

*English version below.*

---

## Português

### 1. Conectar o repositório ao Cloudflare (Workers)

1. No painel do Cloudflare, entre em **Workers & Pages** e clique em **Create**.
2. Escolha **Import a repository** (importar um repositório) e conecte a conta do GitHub, se ainda não estiver conectada.
3. Selecione o repositório **pollination-risk-value-tool**.
4. Na configuração:
   - **Project name:** `pollination-risk-and-value-tool` (o mesmo nome que está em `wrangler.jsonc`);
   - **Build command:** deixe vazio;
   - **Deploy command:** `npx wrangler deploy` (é o padrão);
   - **Root directory:** deixe a raiz (`/`). Não coloque `site` aqui: o arquivo `wrangler.jsonc` precisa ser encontrado na raiz.
5. Clique em **Deploy**.

Em cerca de um minuto, o site fica disponível num endereço do tipo `pollination-risk-and-value-tool.<conta>.workers.dev`.

Para usar um domínio próprio, abra o Worker e vá em **Settings → Domains & Routes → Add → Custom domain**.

A cada novo *commit* na branch principal, o Cloudflare publica o site de novo automaticamente.

### 2. Conferir

- No log da publicação deve aparecer uma linha parecida com `Read … files from the assets directory …/site`. Isso confirma que só a pasta `site/` foi enviada.
- Abra o site e confira as abas, a troca PT/EN e os jogos.
- Um endereço inexistente mostra a página "Página não encontrada".

### Se preferir o Cloudflare Pages

O caminho recomendado hoje pelo Cloudflare para sites estáticos é o descrito acima (Workers). Se a conta usar **Pages**:

- crie o projeto em **Workers & Pages → Create → Pages → Connect to Git**;
- **Framework preset:** None;
- **Build command:** deixe vazio;
- **Build output directory:** `site`.

Se o Pages reclamar do arquivo `wrangler.jsonc`, use o caminho por Workers.

### Problemas comuns

| Mensagem | O que fazer |
|---|---|
| `The name in your Wrangler configuration file … must match the name of your Worker` | Deixe o nome do Worker no painel igual ao campo `name` de `wrangler.jsonc`, ou altere esse campo. |
| `Missing entry-point` | O **Root directory** não está na raiz do repositório. Volte para `/`. |
| O site abre, mas sem dados | A pasta `site/data/` não foi enviada ao GitHub. Confira se ela está no repositório. |

### Ver localmente e verificar

```bash
npx wrangler dev                     # da raiz do repositório; mesmos cabeçalhos do Cloudflare
cd site && python3 -m http.server    # alternativa sem Node
node tools/check_site.mjs            # verificação antes de publicar
```

A verificação termina com `SITE PRONTO PARA PUBLICAR`. Ela confere os arquivos obrigatórios, a sintaxe dos scripts, se o `index.html` carrega apenas arquivos locais, se `site/data/` é idêntica a `shiny-app/data/`, os totais do 4M e o limite de 25 MiB por arquivo do Cloudflare.

---

## English

### 1. Connect the repository to Cloudflare (Workers)

1. In the Cloudflare dashboard open **Workers & Pages → Create → Import a repository** and connect GitHub.
2. Select **pollination-risk-value-tool**.
3. Settings: **Project name** `pollination-risk-and-value-tool` (same as `name` in `wrangler.jsonc`); **Build command** empty; **Deploy command** `npx wrangler deploy` (default); **Root directory** `/` (do not set it to `site`).
4. Click **Deploy**. The site goes live at `pollination-risk-and-value-tool.<account>.workers.dev`. Add a custom domain in **Settings → Domains & Routes**.

Every commit to the main branch redeploys automatically. The build log should read `Read … files from the assets directory …/site`.

**Cloudflare Pages alternative:** Framework preset *None*, empty build command, **Build output directory** `site`.

### Local preview and check

```bash
npx wrangler dev                     # from the repository root; same headers as Cloudflare
cd site && python3 -m http.server    # alternative without Node
node tools/check_site.mjs            # pre-publication check
```

The check ends with `SITE READY TO PUBLISH`. It confirms required files, script syntax, that `index.html` loads only local files, that `site/data/` matches `shiny-app/data/`, the 4M benchmarks (production US$ 230.1 M, EVP 175.8, exports 196.8, EPV 165.3) and Cloudflare's 25 MiB per-file limit.
