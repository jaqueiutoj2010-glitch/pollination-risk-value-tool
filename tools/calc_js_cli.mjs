// Run the actual JavaScript calc() function from the web app in a Node sandbox.
// Does not reimplement the equations: extracts the production function from app.js.
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const src = readFileSync(new URL("../site/assets/app.js", import.meta.url), "utf8");
const start = src.indexOf("function calc(d, reduction){");
const end = src.indexOf("/* ======================= evidência", start);
if (start < 0 || end < 0) throw new Error("calc() source boundaries not found");
const code = src.slice(start, end);
const calc = runInNewContext(code + "\ncalc", {isNum: x => typeof x === "number" && Number.isFinite(x)});
const [csvPath, reductionArg, drArg] = process.argv.slice(2);
if (!csvPath || reductionArg === undefined) throw new Error("Usage: node tools/calc_js_cli.mjs path.csv reduction [DR-list]");
const lines = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
const headers = lines.shift().split(",");
const data = lines.map(line => {
  const cells = line.split(",");
  const obj = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  for (const k of ["Production_Value", "Export_Value", "Pollination_Dependence"]) obj[k] = Number(obj[k]);
  return obj;
});
if (drArg !== undefined) {
  const values = drArg.split(",").map(Number);
  if (values.length !== data.length || values.some(x => !Number.isFinite(x) || x < 0 || x > 1)) throw new Error("Invalid DR override");
  data.forEach((r,i) => r.Pollination_Dependence = values[i]);
}
const result = calc(data, Number(reductionArg));
const keys = ["pv","xv","evp","epv","pedr","epdr","pl","xl"];
process.stdout.write(keys.map(k => result[k].toPrecision(17)).join("\t") + "\n");
