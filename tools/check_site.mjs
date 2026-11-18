#!/usr/bin/env node
// Verificação do site estático (pasta site/) antes de publicar no Cloudflare.
// Static website check (site/ folder) before publishing to Cloudflare.
// Uso / usage:  node tools/check_site.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE = join(ROOT, "site");
const errors = [], notes = [];
const fail = m => errors.push(m), ok = m => notes.push(m);
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const sha = p => createHash("sha256").update(readFileSync(p)).digest("hex");

if (!existsSync(SITE)) { console.error("site/ não encontrada / site/ not found"); process.exit(1); }
const files = walk(SITE);

// 1. Arquivos obrigatórios / required files
const required = ["index.html", "404.html", "_headers", "assets/app.js", "assets/style.css", "assets/vendor/papaparse.min.js", "assets/vendor/xlsx.full.min.js",
  "assets/fonts/game-fonts.css", "data/article_4M.csv", "data/crop_evidence_database.csv", "data/catalogo_evidencias_v30.csv", "data/catalogo_nomes_comuns.csv",
  "data/siopa_metadados_fontes.csv", "data/modelo_dados_cultivos.csv", "data/modelo_dados_cultivos.xlsx", "data/DEMONSTRACAO_QUATRO_CULTURAS_NAO_CITAR.csv",
  "data/exposure_priority_bands.csv", "data/management_actions.csv", "data/management_decision_rules.csv", "data/management_evidence_database.csv", "data/management_priority_matrix.csv"];
for (const r of required) existsSync(join(SITE, r)) ? null : fail(`Falta / missing: site/${r}`);
ok(`${required.length} arquivos obrigatórios conferidos / required files checked`);

// 2. Sintaxe dos scripts / script syntax
const scripts = files.filter(f => f.endsWith(".js") && !f.includes("/vendor/"));
for (const s of scripts) { try { execFileSync(process.execPath, ["--check", s], { stdio: "pipe" }); } catch (e) { fail(`Erro de sintaxe / syntax error: ${relative(ROOT, s)}\n${e.stderr}`); } }
ok(`${scripts.length} scripts com sintaxe válida / scripts parse`);

// 3. Tudo o que o index.html carrega existe e é local / everything index.html loads exists and is local
const html = readFileSync(join(SITE, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]);
for (const r of refs) {
  if (/^https?:/.test(r)) fail(`Recurso externo no index.html / external resource: ${r}`);
  else if (!existsSync(join(SITE, r))) fail(`index.html aponta para arquivo inexistente / missing file: ${r}`);
}
ok(`${refs.length} referências do index.html conferidas / index.html references checked`);

// 4. Dados do site iguais aos dados da versão R (shiny-app/data) / site data equals the R release data
const rootData = join(ROOT, "shiny-app", "data");
if (existsSync(rootData)) {
  let same = 0;
  for (const f of readdirSync(join(SITE, "data"))) {
    const twin = join(rootData, f);
    if (!existsSync(twin)) continue;
    sha(twin) === sha(join(SITE, "data", f)) ? same++ : fail(`site/data/${f} difere de shiny-app/data/${f} / differs from the R release data`);
  }
  ok(`${same} arquivos de dados idênticos aos da versão R / data files identical to the R release`);
} else fail("shiny-app/data não encontrada / shiny-app/data not found");

// 5. Números do manuscrito (sistema 4M, Tabela 1) / manuscript benchmarks (4M system)
const rows = readFileSync(join(SITE, "data/article_4M.csv"), "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
const head = rows[0].split(","), col = n => head.indexOf(n);
const data = rows.slice(1).map(l => l.split(","));
const sum = (c, f = r => +r[col(c)]) => data.reduce((a, r) => a + f(r), 0);
const pv = sum("Production_Value"), ev = sum("Production_Value", r => +r[col("Production_Value")] * +r[col("Pollination_Dependence")]);
const ex = sum("Export_Value"), ep = sum("Export_Value", r => +r[col("Export_Value")] * +r[col("Pollination_Dependence")]);
const near = (a, b) => Math.abs(a - b) < 0.15;
near(pv, 230.1) && near(ev, 175.8) && near(ex, 196.8) && near(ep, 165.3)
  ? ok(`Sistema 4M confere / 4M benchmarks match: produção ${pv.toFixed(1)}, EVP ${ev.toFixed(1)}, exportações ${ex.toFixed(1)}, EPV ${ep.toFixed(1)} (US$ M)`)
  : fail(`Sistema 4M não confere / 4M benchmarks differ: ${pv.toFixed(1)} ${ev.toFixed(1)} ${ex.toFixed(1)} ${ep.toFixed(1)}`);

// 6. Limite do Cloudflare: 25 MiB por arquivo / Cloudflare limit: 25 MiB per file
for (const f of files) if (statSync(f).size > 25 * 1024 * 1024) fail(`Arquivo grande demais para o Cloudflare / file too large: ${relative(ROOT, f)}`);
ok(`${files.length} arquivos, ${(files.reduce((a, f) => a + statSync(f).size, 0) / 1048576).toFixed(1)} MB no total / files in total`);

notes.forEach(n => console.log("✓ " + n));
if (errors.length) { errors.forEach(e => console.error("✗ " + e)); console.error(`\n${errors.length} problema(s) / problem(s) found`); process.exit(1); }
console.log("\nSITE PRONTO PARA PUBLICAR / SITE READY TO PUBLISH");
