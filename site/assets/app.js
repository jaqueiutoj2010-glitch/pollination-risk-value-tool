/* Pollination Risk and Value Tool — versão web 3.0 (estática), reproduz a V2.41
   Toda a lógica de cálculo e as salvaguardas científicas foram portadas de app.R. */
(function(){
"use strict";
const {esc, cropIcon, donut, hbars, grouped, heroField, C} = window.Charts;
const DATA = "data/";

/* ======================= estado ======================= */
const S = {
  lang: ["pt","en","es"].includes(localStorage_get("prvt_lang")) ? localStorage_get("prvt_lang") : "pt",
  tab: "painel",
  d: [], source: "article",
  reduction: 25,
  articleCrop: null, evidenceCrop: null, dashCrop: "",
  imp: null, // {name, data, errors, warnings, ok}
  mg: {Q01:"Unknown",Q02:"Unknown",Q03:"Unknown",Q04:"Unknown",Q05:"Unknown",Q06:"Unknown"},
  cat: {q:"", fonte:"Todas", tipo:"Todos", related:false, mode:"sintese", uid:null, study:null},
  tables: {}, open: {},
  catLoaded: false, catError: null
};
let D = {}; // dados carregados

function localStorage_get(k){try{return window.localStorage.getItem(k);}catch(e){return null;}}
function localStorage_set(k,v){try{window.localStorage.setItem(k,v);}catch(e){}}

const T = () => window.TR[S.lang];
const A = () => window.ARTICLE[S.lang];
// Localized copy; English is retained only where a reviewed Spanish string is unavailable.
const ES_INLINE = {"Scientific reference changed":"Referencia científica modificada","User-completed table applied to the analysis.":"Tabla del usuario aplicada al análisis.","The current dataset structure differs from the manuscript scenario.":"La estructura de los datos actuales difiere del escenario del manuscrito.","The selected scientific reference differs from the manuscript record, but coefficients and economic results remain unchanged.":"La referencia seleccionada difiere de la del manuscrito, pero los coeficientes y resultados económicos no cambian.","User dataset active — results calculated from imported data.":"Datos del usuario activos: resultados calculados a partir de los datos importados.","Scientific catalog":"Catálogo científico","Management":"Recomendaciones","Games":"Juegos","About":"Acerca de","Glossary":"Glosario","Skip to content":"Saltar al contenido","Close":"Cerrar","Scientific pollination catalog":"Catálogo científico de polinización","Evidence-based management recommendations":"Recomendaciones de manejo basadas en evidencias","Economic exposure scales urgency; user-reported context and scientific evidence determine action priority.":"La exposición económica determina la urgencia; el contexto declarado y las evidencias científicas determinan la prioridad.","Hive Games":"Juegos de la colmena","About the platform":"Acerca de la plataforma","Scientific, institutional and transparency information":"Información científica, institucional y de transparencia","Keep in mind: ":"Atención: ","How to use this page":"Cómo utilizar esta página","More about this page":"Más información sobre esta página","How it works":"Cómo funciona","Version 3.0 · web version":"Versión 3.0 · versión web","What is the simulated reduction?":"¿Qué es la reducción simulada?","Drag to simulate a loss in pollinator service.":"Deslice para simular una reducción del servicio de polinización.","No matching records":"No se encontraron registros","Filter this table":"Filtrar esta tabla","Previous":"Anterior","Next":"Siguiente","Show":"Mostrar","Hide":"Ocultar","What is ":"¿Qué es ","What is this?":"¿Qué es esto?","crops":"cultivos","in the imported dataset":"en los datos importados","in the 4M system":"en el sistema 4M","Go to ":"Ir a ","Where the numbers come from":"Origen de los datos","Value":"Valor","reduction":"reducción","For: policymakers, growers and exporters, development agencies and researchers.":"Dirigido a responsables de políticas, productores, exportadores, agencias de desarrollo e investigadores.","See the full method":"Ver el método completo","How the tool works":"Cómo funciona la herramienta","Click a crop to see its own figures.":"Seleccione un cultivo para ver sus datos.","All crops":"Todos los cultivos","Whole system":"Sistema completo","What each tab contains":"Contenido de cada sección","A summary of each section of the site.":"Resumen de cada sección de la plataforma.","Evidence states":"Estados de las evidencias","Registered sources agree.":"Las fuentes registradas coinciden.","Registered sources report different DR values.":"Las fuentes registradas presentan coeficientes DR diferentes.","Download the template":"Descargar la plantilla","Try it with a sample table":"Probar con una tabla de ejemplo","Indices derived by the tool":"Indicadores calculados por la herramienta","Excel reader not loaded yet; try again in a few seconds":"El lector de Excel aún no está disponible; inténtelo de nuevo en unos segundos","sheet 'Dados_dos_cultivos' not found":"No se encontró la hoja 'Dados_dos_cultivos'","Category: see record":"Categoría: consultar registro","REVIEW: same study in multiple datasets":"REVISAR: el mismo estudio aparece en varios archivos","The catalog could not be loaded":"No se pudo cargar el catálogo","Complementary exploratory module. Search common names, scientific names or UID. The expanded catalog is provided for exploration and provenance tracking and is NOT automatically incorporated into economic calculations from the frozen 4M dataset.":"Módulo exploratorio complementario. Busque nombres comunes, científicos o UID. El catálogo ampliado permite consultar la procedencia de los datos y NO se incorpora automáticamente a los cálculos del sistema 4M.","Four games where the platform's data become the rules: the market without bees, Jandi's flight, the value of pollination and the evidence detective.":"Cuatro juegos educativos basados en datos de la plataforma: el mercado sin abejas, el vuelo de Jandi, el valor de la polinización y el detective de evidencias.","The tool estimates how much crop value depends on pollinators and how much would be exposed if that service declined.":"La herramienta estima qué proporción del valor agrícola depende de los polinizadores y cuánto quedaría expuesto si disminuyera ese servicio.","Hypothetical 10%, 25% and 50% declines show the exposure. They are stress tests, not forecasts.":"Las reducciones hipotéticas del 10 %, 25 % y 50 % muestran la exposición económica. Son pruebas de sensibilidad, no pronósticos.","Click a numeric value to edit it. DR is limited to the 0–1 range.":"Seleccione un valor numérico para editarlo. El DR debe estar entre 0 y 1.","Click to choose, or drag the file (.xlsx or .csv) here.":"Haga clic para seleccionar o arrastre aquí el archivo (.xlsx o .csv).","Four crops with fictitious economic values (do not cite), just to see how importing works.":"Cuatro cultivos con valores económicos ficticios (no citar), únicamente para demostrar la importación.","DR is the share of production that depends on pollinators (0 to 1).":"El DR es la proporción de la producción que depende de polinizadores (entre 0 y 1).","The DR in use comes from a single registered source lineage.":"El DR utilizado procede de una sola línea de evidencia registrada.","The DR in use does not match a registered source for this crop.":"El DR utilizado no coincide con una fuente registrada para este cultivo."};
Object.assign(ES_INLINE, {"Trail":"Recorrido","Games":"Juegos","A trail of four games":"Un recorrido de cuatro juegos","several days":"varios días","Scientific basis of the games":"Fundamento científico de los juegos","New · Hive Games":"Nuevo · Juegos de la colmena","Learn by playing with Jandi":"Aprenda jugando con Jandi","See all games":"Ver todos los juegos","Sound on":"Activar sonido","Sound off":"Desactivar sonido","Market Without Bees":"Mercado sin abejas","Your basket":"Su cesta","Add to basket: ":"Añadir a la cesta: ","Pollination dependence":"Dependencia de la polinización","dependence unknown":"dependencia desconocida","of production depends on pollinators":"de la producción depende de los polinizadores","Source: ":"Fuente: ","Opening the market…":"Abriendo el mercado…","Mode":"Modo","Market":"Mercado","Breakfast":"Desayuno","Challenge":"Desafío","Free":"Libre","Crisis-proof":"Resistente a la crisis","Chaos market":"Mercado en crisis","Swipe for more →":"Deslice para ver más →","Your basket is empty":"Su cesta está vacía","Your plate is empty":"Su plato está vacío","What if the bees disappeared?":"¿Qué pasaría si desaparecieran las abejas?","Loss of pollination service":"Reducción del servicio de polinización","Make a story image":"Crear imagen de la historia","Build another basket":"Crear otra cesta","With bees":"Con abejas","Basket before and after, without bees":"Cesta antes y después, sin abejas","Table 1":"Tabla 1","Close":"Cerrar","How Much Is a Bee Worth?":"¿Cuánto vale una abeja?","essential":"esencial","great":"alta","modest":"moderada","little":"baja","no increase":"sin aumento","Queen":"Reina","Worker":"Obrera","Decrease":"Disminuir","Increase":"Aumentar","Your guess in millions of dollars":"Su estimación en millones de dólares","Your guess (US$ millions)":"Su estimación (millones de US$)","Production value":"Valor de producción","Part that depends on bees":"Parte que depende de las abejas","of production":"de la producción","pts":"puntos","Article data unavailable.":"Los datos del artículo no están disponibles.","Open the curtains":"Abrir el telón","Good evening, audience!":"¡Buenas noches, público!","Production":"Producción","Export volume":"Volumen exportado","Export value":"Valor exportado","How many millions depend on pollinators?":"¿Cuántos millones dependen de los polinizadores?","Final answer!":"¡Respuesta definitiva!","You guessed":"Su estimación","Real value":"Valor real","Spot on!":"¡Exacto!","Close.":"Cerca.","Next crop":"Siguiente cultivo","Bonus round":"Ronda extra","Double or stop?":"¿Duplicar o parar?","Crop":"Cultivo","Scientific name":"Nombre científico","Source":"Fuente","Origin":"Origen","Original publication":"Publicación original","Name validated?":"¿Nombre validado?","Yes, checked":"Sí, comprobado","Reference checked?":"¿Referencia verificada?","Yes, verified":"Sí, verificada","Social media post":"Publicación en redes sociales","Spreadsheet with no author":"Hoja de cálculo sin autor","Unknown":"Desconocido","There is no reference to check":"No hay referencia para verificar","Taxonomic status":"Estado taxonómico","Table 1 transcription checked":"Transcripción de la Tabla 1 verificada","Status":"Estado","Original, verified":"Original, verificado","Derived":"Derivado","Lineage":"Procedencia","Not reported":"No informado","Golden pollen! shield":"¡Polen dorado! Escudo","Water! +25":"¡Agua! +25","cleared":"superado","pesticide":"plaguicida","crop duster":"avión fumigador","Energy (nectar)":"Energía (néctar)","The flower":"La flor","Score ":"Puntuación ","hot wind":"viento cálido","points":"puntos","best":"récord","new best!":"¡nuevo récord!","stars":"estrellas","The bee's flight":"El vuelo de la abeja","Jandi carried the pollen to the flower!":"¡Jandi llevó el polen hasta la flor!","flowers pollinated":"flores polinizadas","bees rescued":"abejas rescatadas","scenario ":"escenario ","No native bees rescued this time.":"Esta vez no se rescataron abejas nativas.","Summary of the bee's flight journey":"Resumen del vuelo de la abeja","Final stage":"Etapa final","Fly":"Volar","Start the level":"Iniciar nivel","Paused":"En pausa","Resume":"Continuar","Restart the level":"Reiniciar nivel","Try again":"Intentar de nuevo","Game over":"Fin del juego","Restart the journey":"Reiniciar recorrido","Make a journey image":"Crear imagen del recorrido","Level complete!":"¡Nivel completado!","Fly to the flower":"Volar hasta la flor","Next level":"Siguiente nivel","Goal reached":"Objetivo alcanzado","You found the flower!":"¡Encontró la flor!","Next: How Much Is a Bee Worth?":"Siguiente: ¿Cuánto vale una abeja?","Play again":"Jugar de nuevo"});
Object.assign(ES_INLINE, {"A trail of four games":"Un recorrido de cuatro juegos","Four games in which the platform's content becomes the rules of play. Your guide is Jandi, a jandaíra: a native stingless bee from the Brazilian semiarid.":"Cuatro juegos en los que los contenidos de la plataforma se convierten en reglas. Su guía es Jandi, una abeja jandaíra nativa sin aguijón del semiárido brasileño.","Colour is living pollination; what is lost turns to dust grey. The games use the platform's data, but their scoring and difficulty rules are for teaching, not estimates.":"El color representa la polinización activa; las pérdidas se vuelven grises. Los juegos utilizan datos de la plataforma, pero sus puntuaciones y niveles de dificultad son didácticos, no estimaciones reales.","Market: DRs from the verified evidence base and, for other foods, from Table 1 of Giannini et al. (2015) as transcribed in the catalog. Bee Worth: manuscript data (4M system, Abrafrutas 2024). Detective: statuses recorded in the evidence base, catalog v30 and source registry. Bee's flight: heat, drought, pesticide and habitat-loss mechanisms described qualitatively from the syntheses below.":"Mercado: coeficientes DR de la base de evidencias verificada y, para otros alimentos, de la Tabla 1 de Giannini et al. (2015) transcrita en el catálogo. Valor de la abeja: datos del manuscrito (sistema 4M, Abrafrutas 2024). Detective: estados de la base de evidencias, catálogo v30 y registro de fuentes. Vuelo: mecanismos de calor, sequía, plaguicidas y pérdida de hábitat descritos cualitativamente.","Four short games built on this platform's data: watch your market basket wither without bees, fly through the loss scenarios, guess what pollination is worth and inspect the evidence.":"Cuatro juegos basados en datos de la plataforma: observe una cesta sin abejas, explore escenarios de reducción, estime el valor de la polinización e investigue las evidencias.","Coefficient verified in the platform's evidence base.":"Coeficiente verificado en la base de evidencias de la plataforma.","Unknown dependence: the catalog records that there is no coefficient for this food yet.":"Dependencia desconocida: el catálogo aún no contiene un coeficiente para este alimento.","Value transcribed from Table 1; the catalog still flags a pending taxonomic review.":"Valor transcrito de la Tabla 1; el catálogo indica que la revisión taxonómica está pendiente.","Crisis-proof challenge: build a basket of at least 6 different foods that loses under 20% without bees.":"Desafío de resistencia: prepare una cesta con al menos seis alimentos diferentes cuya pérdida sea inferior al 20 % sin abejas.","Pick what you usually buy at the market. Drag it to the basket or tap the food.":"Elija los alimentos que suele comprar. Arrástrelos a la cesta o tóquelos.","Build your breakfast. Drag it to the plate or tap the food.":"Prepare su desayuno. Arrastre los alimentos al plato o tóquelos.","Not enough foods: the challenge needs at least 6 different ones.":"No hay suficientes alimentos: el desafío requiere al menos seis diferentes.","The challenge needs at least 5 foods.":"El desafío requiere al menos cinco alimentos.","10%, 25% and 50% are the platform's scenarios; 100% is the extreme case with no pollinators. Tap a food to see its card.":"El 10 %, 25 % y 50 % son escenarios de la plataforma; el 100 % representa el caso extremo sin polinizadores. Toque un alimento para consultar su ficha.","Each food weighs the same in the basket percentage. Dependence shows how much production would drop without animal pollination; it is not how much vanishes from your plate today.":"Cada alimento tiene el mismo peso en el porcentaje de la cesta. La dependencia representa una reducción potencial de producción sin polinización animal, no la cantidad que desaparece hoy de su plato.","Tap a comb to fill up to it. Then fine-tune with the bar, the buttons or by typing the value.":"Toque una celda del panal para completar el valor. Después ajuste con la barra, los botones o escribiendo una cifra.","Full comb: 2 points":"Panal completo: 2 puntos","Half comb: 1 point":"Medio panal: 1 punto","Way off: 0 points":"Muy lejos: 0 puntos","Four crops from the 4M system take the stage. For each one, you see the production figures and guess how many million dollars depend on pollinators.":"Cuatro cultivos del sistema 4M suben al escenario. Consulte sus cifras de producción y estime cuántos millones de dólares dependen de los polinizadores.","Scoring: within 10% of the real value, a full comb; within 25%, half a comb; further away, no points.":"Puntuación: dentro del 10 % del valor de referencia, panal completo; dentro del 25 %, medio panal; fuera de ese intervalo, cero puntos.","First round: take a shot in the dark!":"Primera ronda: ¡haga su estimación!","Surprise: in the article's data, mango gains no production from pollinators (DR 0). Not every fruit depends on bees.":"Sorpresa: en los datos del artículo, el mango no presenta aumento de producción atribuible a polinizadores (DR 0). No todas las frutas tienen la misma dependencia.","Look at the size of the golden slice: that's the crop's dependence.":"Observe el tamaño de la sección dorada: representa la dependencia del cultivo.","The bee lost all three lives. The journey restarts at the 10% scenario.":"La abeja perdió sus tres vidas. El recorrido vuelve al escenario del 10 %.","The pollen reached the melon flower. To form a well-developed fruit, the melon flower depends on bee visits.":"El polen llegó a la flor de melón. Para producir un fruto bien desarrollado, la flor depende de las visitas de abejas.","Carry the pollen to the flower. Each level uses one of the platform's reduction scenarios (10%, 25% and 50%) as its difficulty: the bigger the loss, the fewer flowers and the more threats along the way.":"Lleve el polen hasta la flor. Cada nivel utiliza un escenario de reducción de la plataforma (10 %, 25 % o 50 %) como dificultad: cuanto mayor es la reducción, menos flores y más amenazas aparecen."});
const L = (pt,en) => S.lang==="pt" ? pt : S.lang==="es" ? (ES_INLINE[en] ?? en) : en;
const locale = () => ({pt:"pt-BR",en:"en-US",es:"es-ES"})[S.lang] || "pt-BR";
const isNum = x => typeof x==="number" && isFinite(x);
const r1 = x => Math.round((x+Number.EPSILON)*10)/10;
const fmt1 = x => isNum(x) ? r1(x).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1}) : "—";
const fmt2 = x => isNum(x) ? x.toLocaleString(locale(),{minimumFractionDigits:2,maximumFractionDigits:2}) : "—";
const money = x => "US$ " + fmt1(x) + " M";
const pct = x => fmt1(100*x) + "%";
const nz = s => s!=null && String(s).trim()!=="" && String(s)!=="NA";
const str = s => s==null ? "" : String(s);
const toNum = v => { if(typeof v==="number") return isFinite(v)?v:NaN; const s=str(v).trim(); if(s===""||s==="NA") return NaN; const n=Number(s); return isFinite(n)?n:NaN; };
const yesFlag = x => ["yes","true","1","sim"].includes(str(x).trim().toLowerCase());
const cropName = row => S.lang==="pt" ? (row.Crop_PT || row.Crop) : row.Crop;

/* ======================= carregamento ======================= */
function parseCSV(text){
  const res = Papa.parse(text.replace(/^﻿/,""), {header:true, skipEmptyLines:"greedy", transformHeader:h=>h.replace(/^﻿/,"").trim()});
  return res.data;
}
async function getCSV(name){
  const r = await fetch(DATA+name, {cache:"no-cache"});
  if(!r.ok) throw new Error(name+" ("+r.status+")");
  return parseCSV(await r.text());
}
const ARTICLE_NUM = ["Production","Production_Value","Export_Volume","Export_Value","Pollination_Dependence"];
function cloneArticle(){ return D.article.map(r=>Object.assign({},r)); }

async function loadCore(){
  const names = ["article_4M.csv","crop_evidence_database.csv","management_evidence_database.csv","management_decision_rules.csv","management_priority_matrix.csv","management_actions.csv"];
  const [article, evidence, mEv, mRules, mPrio, mAct] = await Promise.all(names.map(getCSV));
  article.forEach(r=>ARTICLE_NUM.forEach(k=>r[k]=toNum(r[k])));
  evidence.forEach(r=>{ r.DR = toNum(r.DR); ["Evidence_ID","DOI","Source_ID","Source_database","Original_or_derived","Evidence_lineage","Validation_status","Selectable_for_calculation"].forEach(k=>{ if(!(k in r)) r[k]=null; }); });
  mRules.forEach(r=>r.Context_score=toNum(r.Context_score));
  D = {article, evidence, evidenceHasType: evidence.length && ("Evidence_type" in evidence[0]), mEv, mRules, mPrio, mAct};
  S.d = cloneArticle();
  S.articleCrop = S.d[0] && S.d[0].Crop;
  S.evidenceCrop = S.articleCrop;
}

async function loadCatalog(){
  if(S.catLoaded || S.catLoading) return;
  S.catLoading = true;
  try{
    const [cat, nomes, meta] = await Promise.all(["catalogo_evidencias_v30.csv","catalogo_nomes_comuns.csv","siopa_metadados_fontes.csv"].map(getCSV));
    const cols = ["UID","Fonte","Nome literal","Tipo","Valor literal","Estado bibliográfico","Estado taxonômico","Elegível cálculo automático"];
    const problems = [];
    if(!cat.length || !cols.every(c=>c in cat[0])) problems.push("colunas obrigatórias ausentes no catálogo");
    const uids = cat.map(r=>r.UID);
    if(uids.some(u=>!nz(u))) problems.push("UID ausente");
    if(new Set(uids).size!==uids.length) problems.push("UIDs duplicados");
    if(cat.some(r=>r["Elegível cálculo automático"]==="SIM")) problems.push("registro marcado como elegível para cálculo automático");
    if(nomes.length!==cat.length || nomes.some((r,i)=>r.UID!==cat[i].UID)) problems.push("catalogo_nomes_comuns.csv não corresponde ao catálogo");
    if(problems.length) throw new Error(problems.join("; "));
    cat.forEach((r,i)=>{ r["Nome comum (PT)"]=nomes[i]["Nome comum (PT)"]; r["Common name (EN)"]=nomes[i]["Common name (EN)"]; });
    // índices de busca pré-calculados
    cat.forEach(r=>{
      r._pt = norm(r["Nome comum (PT)"]); r._en = norm(r["Common name (EN)"]);
      r._lit = norm(r["Nome literal"]); r._uid = norm(r.UID);
      r._alias = norm(alias(r["Nome literal"]));
      const sci = str(r["Nome literal"]).trim(); const m = sci.match(/^[A-Z][a-z]+\s+[a-z]+/);
      r._bin = m ? m[0] : sci;
    });
    D.cat = cat; D.meta = meta; S.catLoaded = true;
  }catch(e){ S.catError = e.message; }
  S.catLoading = false;
  if(S.tab==="catalogo" || S.tab==="jogo") renderMain();
}

/* ======================= cálculo (calc_metrics) ======================= */
function calc(d, reduction){
  reduction = reduction||0;
  const sum = f => d.reduce((a,r)=>a+(isNum(f(r))?f(r):0),0);
  const pv = sum(r=>r.Production_Value), xv = sum(r=>r.Export_Value);
  const evp = sum(r=>r.Production_Value*r.Pollination_Dependence), epv = sum(r=>r.Export_Value*r.Pollination_Dependence);
  return {pv,xv,evp,epv, pedr: pv>0?evp/pv:0, epdr: xv>0?epv/xv:0, pl: evp*reduction, xl: epv*reduction};
}

/* ======================= evidência (selectable_evidence etc.) ======================= */
function selectable(q){
  return q.filter(r => isNum(r.DR) && yesFlag(r.Selectable_for_calculation) &&
    (!D.evidenceHasType || str(r.Evidence_type).trim().toLowerCase()==="quantitative"));
}
const isDerived = r => /derived/.test(str(r.Original_or_derived).toLowerCase());
function independentLineages(q){
  const x = q.filter(r=>!isDerived(r));
  return [...new Set(x.map(r=>r.Evidence_lineage).filter(nz))];
}
function evidenceState(q, currentDR, userOnly){
  const quant = selectable(q);
  if(userOnly || !quant.length) return "user";
  if(!(isNum(currentDR) && quant.some(r=>Math.abs(r.DR-currentDR)<1e-9))) return "user";
  if(independentLineages(quant).length<=1) return "registered";
  const vals = new Set(quant.filter(r=>!isDerived(r)).map(r=>r.DR).filter(isNum).map(v=>Math.round(v*1e10)/1e10));
  return vals.size>1 ? "divergent" : "convergent";
}
const evFor = crop => D.evidence.filter(r=>r.Crop===crop);

/* ======================= estado de modificação ======================= */
function modState(){
  if(S.source!=="article") return "imported";
  const a = D.article, d = S.d;
  if(d.length!==a.length || d.some((r,i)=>r.Crop!==a[i].Crop)) return "structure";
  if(d.some((r,i)=>!(Math.abs(r.Pollination_Dependence-a[i].Pollination_Dependence)<=1e-9))) return "coefficient";
  if(d.some((r,i)=>str(r.Evidence_Reference)!==str(a[i].Evidence_Reference))) return "reference";
  return "original";
}
const modified = () => modState()!=="original";
function modTitle(){ return modState()==="reference" ? L("Referência científica alterada","Scientific reference changed") : T().modified; }
function modDetail(){
  const s = modState();
  if(s==="imported") return L("Tabela preenchida pelo usuário aplicada à análise.","User-completed table applied to the analysis.");
  if(s==="structure") return L("A estrutura da base atual difere do cenário do manuscrito.","The current dataset structure differs from the manuscript scenario.");
  if(s==="reference") return L("A referência científica selecionada difere da registrada no manuscrito, mas os coeficientes e os resultados econômicos permanecem inalterados.","The selected scientific reference differs from the manuscript record, but coefficients and economic results remain unchanged.");
  if(s!=="coefficient") return "";
  return S.d.map((r,i)=>[r,i]).filter(([r,i])=>Math.abs(r.Pollination_Dependence-D.article[i].Pollination_Dependence)>1e-9)
    .map(([r,i])=>`${cropName(r)}: DR ${D.article[i].Pollination_Dependence.toFixed(2)} → ${r.Pollination_Dependence.toFixed(2)}`).join("; ");
}
function warningBlock(){
  if(S.source==="import"){
    return `<div class="notice ok changed"><div><strong>${esc(T().analysis_mode_user)}</strong><br>${esc(L("Base do usuário ativa — resultados calculados a partir dos dados importados.","User dataset active — results calculated from imported data."))}</div><button class="btn" data-act="restore">${esc(T().restore)}</button></div>`;
  }
  if(!modified()) return "";
  return `<div class="notice warn changed"><div><strong>${esc(modTitle())}</strong><br>${esc(modDetail())}</div><button class="btn" data-act="restore">${esc(T().restore)}</button></div>`;
}
function restore(){ S.d = cloneArticle(); S.source="article"; S.dashCrop=""; S.articleCrop=S.d[0].Crop; S.evidenceCrop=S.d[0].Crop; render(); }

/* ======================= navegação ======================= */
const TABS = [
  ["artigo",   ()=>T().article],
  ["modelo",   ()=>T().template],
  ["painel",   ()=>T().dashboard],
  ["cenarios", ()=>T().scenarios],
  ["evidencias",()=>T().evidence],
  ["catalogo", ()=>L("Catálogo científico","Scientific catalog")],
  ["recomendacoes",()=>L("Recomendações","Management")],
  ["jogo",     ()=>L("Jogos","Games")],
  ["metodo",   ()=>T().method],
  ["sobre",    ()=>L("Sobre","About")]
];
function readHash(){ const h = location.hash.replace("#",""); S.tab = TABS.some(t=>t[0]===h) ? h : "painel"; }

function renderNav(){
  document.getElementById("mainnav").innerHTML = TABS.map(([k,f])=>`<a href="#${k}"${S.tab===k?' aria-current="page"':""}>${esc(f())}</a>`).join("") + `<a href="#" class="nav-gloss" data-gloss="1">${esc(L("Glossário","Glossary"))}</a>`;
  document.querySelectorAll(".lang-btn").forEach(b=>b.setAttribute("aria-pressed", b.dataset.lang===S.lang?"true":"false"));
  document.documentElement.lang = locale();
  document.querySelector(".skip").textContent = L("Pular para o conteúdo","Skip to content");
  document.getElementById("menuToggle").textContent = L("Menu","Menu");
  document.getElementById("glossBtn").textContent = L("Glossário","Glossary");
  document.getElementById("glossTitle").textContent = L("Glossário","Glossary");
  document.getElementById("glossClose").textContent = L("Fechar","Close");
  renderGloss();
}

/* ======================= cabeçalhos ======================= */
function renderHero(){
  const el = document.getElementById("hero");
  if(S.tab!=="painel"){
    const heads = {
      artigo:[T().article, T().article_intro],
      modelo:[T().template_title, T().template_intro],
      cenarios:[T().scenarios, T().scenarios_note],
      evidencias:[T().sourcecompare, T().evidence_help],
      catalogo:[L("Catálogo científico de polinização","Scientific pollination catalog"), L("Módulo exploratório complementar. Busque pelo nome popular, nome científico ou UID. O catálogo ampliado é disponibilizado para consulta e rastreabilidade e NÃO é incorporado automaticamente aos cálculos econômicos do conjunto 4M congelado.","Complementary exploratory module. Search common names, scientific names or UID. The expanded catalog is provided for exploration and provenance tracking and is NOT automatically incorporated into economic calculations from the frozen 4M dataset.")],
      recomendacoes:[L("Recomendações de manejo baseadas em evidências","Evidence-based management recommendations"), L("A exposição econômica define a urgência; o contexto informado e a literatura definem a prioridade das ações.","Economic exposure scales urgency; user-reported context and scientific evidence determine action priority.")],
      jogo:[L("Jogos da Colmeia","Hive Games"), L("Quatro jogos em que os dados da plataforma viram regra: a feira sem abelhas, o voo da Jandi, o valor da polinização e o detetive de evidências.","Four games where the platform's data become the rules: the market without bees, Jandi's flight, the value of pollination and the evidence detective.")],
      metodo:[T().method_title, T().method_note],
      sobre:[L("Sobre a plataforma","About the platform"), L("Informação científica, institucional e de transparência","Scientific, institutional and transparency information")]
    }[S.tab];
    const H = window.HELP[S.lang][S.tab];
    const steps = H.steps.length ? `<ol class="guide-steps">${H.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>` : "";
    const care = A().careful[S.tab];
    const careHtml = care ? `<p class="careful"><b>${esc(L("Atenção: ","Keep in mind: "))}</b>${esc(care)}</p>` : "";
    const inner = `<div class="guide-grid"><div><p class="guide-note">${esc(heads[1])}</p>${careHtml}</div>${steps?`<div>${steps}</div>`:""}</div>`;
    const title = steps ? L("Como usar esta página","How to use this page") : L("Mais sobre esta página","More about this page");
    el.innerHTML = `<div class="pagehead"><div class="wrap"><h1>${esc(heads[0])}</h1><p class="what">${esc(H.what)}</p>${fold("ph-"+S.tab, `<span class="fold-title">${esc(title)}</span>`, "", inner, "inline")}</div></div>`;
    return;
  }
  el.innerHTML = `<section class="hero"><div class="wrap hero-grid">
    <div>
      <h1>${esc(T().title)}</h1>
      <p class="hero-lead">${esc(S.source==="import" ? T().user_subtitle : T().subtitle)}.</p>
      <div class="hero-actions"><a class="btn primary" href="#howTitle" data-act="goto-how">${esc(L("Como funciona","How it works"))}</a><span class="hero-status">${esc(L("Versão 3.0 · versão web","Version 3.0 · web version"))}</span></div>
    </div>
    <div class="stress" aria-live="polite">
      <p class="stress-q">${esc(T().reduction)} <button type="button" class="info dark" data-term="reducao" aria-label="${esc(L("O que é a redução simulada?","What is the simulated reduction?"))}">?</button></p>
      <p class="stress-hint">${esc(L("Arraste para simular uma perda no serviço dos polinizadores.","Drag to simulate a loss in pollinator service."))}</p>
      <div class="stress-pct" id="stressPct">${S.reduction}%</div>
      <input type="range" min="0" max="100" step="1" value="${S.reduction}" data-act="reduction" aria-label="${esc(T().reduction)}">
      <div class="stress-out">
        <div><div class="k">${esc(T().prodloss)}</div><div class="v prod" id="stressProd"></div></div>
        <div><div class="k">${esc(T().exploss)}</div><div class="v exp" id="stressExp"></div></div>
      </div>
      <p class="stress-note">${esc(T().scenarios_note)}</p>
    </div>
  </div>${heroField()}</section>`;
  updateStress();
}
function updateStress(){
  const m = calc(S.d, S.reduction/100);
  const p = document.getElementById("stressPct"); if(!p) return;
  p.textContent = S.reduction+"%";
  document.getElementById("stressProd").textContent = money(m.pl);
  document.getElementById("stressExp").textContent = money(m.xl);
}

/* ======================= tabela genérica ======================= */
function table(id, cols, rows, opt){
  opt = opt||{};
  const st = S.tables[id] = S.tables[id] || {page:0, q:""};
  let view = rows;
  if(opt.search && st.q){
    const q = st.q.toLowerCase();
    view = rows.filter(r=>cols.some(c=>str(c.get(r)).toLowerCase().includes(q)));
  }
  const size = opt.pageSize || 1e9;
  const pages = Math.max(1, Math.ceil(view.length/size));
  if(st.page>=pages) st.page = pages-1;
  const slice = view.slice(st.page*size, st.page*size+size);
  const head = cols.map(c=>`<th class="${c.num?"num":""}" scope="col">${esc(c.label)}</th>`).join("");
  const body = slice.length ? slice.map(r=>{
    const sel = opt.selectedKey && opt.key && opt.key(r)===opt.selectedKey;
    const attrs = opt.selectable ? ` class="selectable${sel?" selected":""}" data-row-key="${esc(opt.key(r))}" data-table="${id}" tabindex="0"` : "";
    return `<tr${attrs}>${cols.map(c=>`<td class="${c.num?"num":""}">${c.html?c.html(r):esc(c.get(r))}</td>`).join("")}</tr>`;
  }).join("") : `<tr><td class="empty" colspan="${cols.length}">${esc(opt.empty||L("Nenhum registro encontrado","No matching records"))}</td></tr>`;
  const tools = opt.search ? `<div class="tbl-tools"><input type="search" data-tsearch="${id}" value="${esc(st.q)}" placeholder="${esc(L("Filtrar esta tabela","Filter this table"))}" aria-label="${esc(L("Filtrar esta tabela","Filter this table"))}"></div>` : "";
  const pager = (opt.pageSize && view.length>size) ? `<div class="pager"><span>${esc(L(`Mostrando ${st.page*size+1}–${Math.min(view.length,(st.page+1)*size)} de ${view.length}`,`Showing ${st.page*size+1}–${Math.min(view.length,(st.page+1)*size)} of ${view.length}`))}</span><span class="btns"><button data-tpage="${id}" data-dir="-1"${st.page===0?" disabled":""}>${esc(L("Anterior","Previous"))}</button><button data-tpage="${id}" data-dir="1"${st.page>=pages-1?" disabled":""}>${esc(L("Próxima","Next"))}</button></span></div>` : "";
  return `<div data-tbl="${id}">${tools}<div class="tbl-wrap"><table class="tbl${opt.wide?" wide":""}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${opt.foot||""}</table></div>${pager}</div>`;
}
const TABLE_RERENDER = {}; // id -> função que redesenha o bloco

/* ======================= páginas ======================= */
function cropPicker(selected, act, opts){
  opts = opts||{};
  const many = S.d.length>4 ? " many" : "";
  return `<div class="crops${many}" role="group" aria-label="${esc(T().choose_crop)}">` + S.d.map(r=>
    `<button type="button" class="crop" data-act="${act}" data-crop="${esc(r.Crop)}" aria-pressed="${selected===r.Crop}">${cropIcon(r.Crop)}<span><b>${esc(cropName(r))}</b><span class="sci">${esc(r.Scientific_name)}</span></span></button>`
  ).join("") + `</div>`;
}

/* ---------- Painel ---------- */
function fold(id, titleHtml, hint, inner, cls){
  return `<details class="fold${cls?" "+cls:""}" data-fold="${id}"${S.open[id]?" open":""}><summary><span class="fold-head">${titleHtml}${hint?`<span class="fold-hint">${esc(hint)}</span>`:""}</span><span class="fold-tg" aria-hidden="true"><span class="fold-show">${esc(L("Mostrar","Show"))}</span><span class="fold-hide">${esc(L("Ocultar","Hide"))}</span></span></summary><div class="fold-body">${inner}</div></details>`;
}
function infoBtn(term, label){
  return `<button type="button" class="info" data-term="${term}" aria-label="${esc(L("O que é ","What is ")+label+"?")}" title="${esc(L("O que é isto?","What is this?"))}">?</button>`;
}
function pageDashboard(){
  const m = calc(S.d), t = T(), pt = S.lang==="pt";
  const sel = S.dashCrop;
  let detail = "";
  if(sel){
    const row = S.d.find(r=>r.Crop===sel);
    if(row){
      const k = calc([row]);
      detail = `<div class="panel" style="margin-bottom:22px">
        <div class="ev-head"><div><h2 class="h">${esc(cropName(row))}</h2><div class="sci" style="font-size:17px;color:var(--muted)">${esc(row.Scientific_name)}</div></div>
        <span class="tag neutral">DR ${(row.Pollination_Dependence).toFixed(2)} · ${esc(row.Evidence_Reference)}</span></div>
        <p class="plain">${esc(pt?`Para ${cropName(row)}, de cada US$ 100 produzidos, cerca de US$ ${Math.round(100*k.pedr)} dependem da polinização.`:`For ${cropName(row)}, out of every US$ 100 produced, about US$ ${Math.round(100*k.pedr)} depend on pollination.`)}</p>
        <div class="mt-s">${ledger(k, false)}</div></div>`;
    }
  }
  const badge = S.source==="import" ? `${t.imported_source} · ${S.d.length} ${L("culturas","crops")}` : t.system;
  const where = S.source==="import" ? L("na base importada","in the imported dataset") : L("no sistema 4M","in the 4M system");
  const steps = pt ? [
    ["Escolha os dados","Use a base 4M do artigo, já carregada, ou importe a sua própria tabela.","modelo","Modelo de dados"],
    ["Confira a dependência","Cada cultura tem um DR, que diz quanto da produção depende de polinizadores. Compare as fontes científicas.","evidencias","Evidências"],
    ["Leia os resultados","Veja o valor ligado à polinização, simule perdas e consulte ações de manejo.","cenarios","Cenários"]
  ] : [
    ["Choose the data","Use the article's 4M dataset, already loaded, or import your own table.","modelo","Data template"],
    ["Check dependence","Each crop has a DR, which says how much production depends on pollinators. Compare the scientific sources.","evidencias","Evidence"],
    ["Read the results","See the value linked to pollination, simulate losses and browse management actions.","cenarios","Scenarios"]
  ];
  const map = TABS.filter(([k])=>k!=="painel").map(([k,f])=>`<a class="map-item" href="#${k}"><b>${esc(f())}</b><span>${esc(window.HELP[S.lang][k].what)}</span></a>`).join("");
  const howBody = `    <ol class="how-steps">${steps.map(s=>`<li><b>${esc(s[0])}</b><span>${esc(s[1])}</span><a href="#${s[2]}">${esc(L("Ir para ","Go to ")+s[3])}</a></li>`).join("")}</ol>
    <div class="origin">
      <h3>${esc(L("De onde vêm os números","Where the numbers come from"))}</h3>
      <dl>
        <div><dt>${esc(L("Valor","Value"))}</dt><dd>${esc(L("Produção e exportações de 2024 no Rio Grande do Norte (Abrafrutas). Reais convertidos a US$ 1 = R$ 5,39.","2024 production and exports in Rio Grande do Norte (Abrafrutas). Reais converted at US$ 1 = BRL 5.39."))}</dd></div>
        <div><dt>× DR</dt><dd>${esc(L("Fração da produção que depende de polinizadores, de Giannini et al. (2015): 0,95 para melão e melancia, 0,05 para mamão e 0 para manga.","Share of production that depends on pollinators, from Giannini et al. (2015): 0.95 for melon and watermelon, 0.05 for papaya and 0 for mango."))}</dd></div>
        <div><dt>= EVP / EPV</dt><dd>${esc(L("Valor da produção e das exportações associado à polinização.","Production and export value associated with pollination."))}</dd></div>
        <div><dt>× ${esc(L("redução","reduction"))}</dt><dd>${esc(L("Quedas hipotéticas de 10%, 25% e 50% mostram a exposição. São testes de estresse, não previsões.","Hypothetical 10%, 25% and 50% declines show the exposure. They are stress tests, not forecasts."))}</dd></div>
      </dl>
      <p class="sub" style="font-size:14px;margin:10px 0 0">${esc(L("Para quem: gestores públicos, produtores e exportadores, agências de desenvolvimento e pesquisadores.","For: policymakers, growers and exporters, development agencies and researchers."))} <a href="#metodo">${esc(L("Ver o método completo","See the full method"))}</a></p>
    </div>
`;
  return `${warningBlock()}
  <section class="section how">
    ${fold("how", `<h2 class="h" id="howTitle">${esc(L("Como a ferramenta funciona","How the tool works"))}</h2>`, L("A ferramenta estima quanto do valor das culturas depende dos polinizadores e quanto ficaria exposto se esse serviço diminuísse.","The tool estimates how much crop value depends on pollinators and how much would be exposed if that service declined."), howBody, "big")}
  </section>
  ${window.Game && window.Game.banner ? window.Game.banner() : ""}
  <section class="section">
    <div class="row-actions">
      <div><h2 class="h">${esc(t.results)}</h2><p class="sub" style="margin:0">${esc(t.results_sub)}</p></div>
      <div class="mode">${esc(badge)} — <b>${esc(S.source==="import"?t.analysis_mode_user:t.analysis_mode_article)}</b></div>
    </div>
    <p class="sub mt-s" style="margin-bottom:0">${esc(L("Clique em uma cultura para ver os números só dela.","Click a crop to see its own figures."))}</p>
    <div class="row-actions" style="margin-top:12px"><button class="btn${sel?"":" primary"}" data-act="dash-all" aria-pressed="${!sel}">${esc(L("Todas as culturas","All crops"))}</button></div>
    ${cropPicker(sel, "dash-crop")}
    ${detail}
    ${sel ? `<h3 class="h" style="margin-bottom:12px">${esc(L("Sistema completo","Whole system"))}</h3>` : ""}
    ${ledger(m, S.source==="article" && !modified())}
    ${S.source==="article" && !modified() ? `<p class="footnote"><sup>1</sup> ${esc(t.round_note)}</p>` : ""}
    <p class="plain mt-s">${esc(pt?`Em resumo: ${where}, de cada US$ 100 produzidos, cerca de US$ ${Math.round(100*m.pedr)} dependem da polinização; nas exportações, cerca de US$ ${Math.round(100*m.epdr)} de cada US$ 100.`:`In short: ${where}, out of every US$ 100 produced, about US$ ${Math.round(100*m.pedr)} depend on pollination; for exports, about US$ ${Math.round(100*m.epdr)} of every US$ 100.`)}</p>
  </section>
  <section class="section split">
    <div class="chart"><h3>${esc(t.composition)}</h3><p class="sub">${esc(S.source==="import"?t.user_composition:t.composition_sub)}</p>
      ${donut(m.pedr, pct(m.pedr), t.dependence)}
      <div class="legend"><span><i style="background:${C.leaf}"></i>${esc(t.pollination)} — ${esc(money(m.evp))}</span><span><i style="background:${C.pollen}"></i>${esc(t.other)} — ${esc(money(Math.max(m.pv-m.evp,0)))}</span></div>
      <p class="read">${esc(L("Como ler: o anel inteiro é o valor da produção. A parte verde é a fatia que depende dos polinizadores (PEDR); a amarela depende de outros fatores.","How to read: the full ring is production value. The green part is the share that depends on pollinators (PEDR); the yellow part depends on other factors."))}</p>
    </div>
    <div class="chart"><h3>${esc(t.compare)}</h3><p class="sub">${esc(t.compare_sub)} (US$ M)</p>
      ${hbars([{label:t.prodvalue,value:m.pv,color:C.prod},{label:t.evp,value:m.evp,color:C.leaf}], v=>fmt1(v))}
      <p class="read">${esc(L("Como ler: a barra cinza é o valor total da produção; a verde é a parte desse valor atribuída à polinização (EVP). Quanto mais próximas, maior a dependência.","How to read: the grey bar is total production value; the green bar is the part of that value attributed to pollination (EVP). The closer they are, the higher the dependence."))}</p>
    </div>
  </section>
  <section class="section">
    ${fold("map", `<h2 class="h">${esc(L("O que você encontra em cada aba","What each tab contains"))}</h2>`, L("Um resumo de cada seção do site.","A summary of each section of the site."), `<div class="map">${map}</div>`, "big")}
    <p class="sub mt-s" style="font-size:14px">${esc(L("Dúvida sobre algum termo? Abra o Glossário no topo da página ou clique nos botões ? ao lado dos indicadores.","Unsure about a term? Open the Glossary at the top of the page or click the ? buttons next to the indicators."))}</p>
  </section>`;
}
function ledger(m, showRound){
  const t = T(), pt = S.lang==="pt";
  const e = (x)=>`<div class="e">${esc(x)}</div>`;
  return `<div class="ledger">
    <div><div class="k"><i style="background:${C.prod}"></i>${esc(t.prodvalue)}${infoBtn("prodvalue",t.prodvalue)}</div><div class="v">${esc(money(m.pv))}${showRound?`<sup class="fn">1</sup>`:""}</div>${e(pt?"Quanto vale tudo o que foi produzido.":"What everything produced is worth.")}</div>
    <div><div class="k"><i style="background:${C.leaf}"></i>${esc(t.evp)}${infoBtn("evp","EVP")}</div><div class="v">${esc(money(m.evp))}</div>${e(pt?"Parte desse valor que depende dos polinizadores.":"Part of that value that depends on pollinators.")}<div class="s">PEDR ${esc(pct(m.pedr))}${infoBtn("pedr","PEDR")}</div></div>
    <div><div class="k"><i style="background:#9DC0DE"></i>${esc(t.exportvalue)}${infoBtn("exportvalue",t.exportvalue)}</div><div class="v">${esc(money(m.xv))}</div>${e(pt?"Quanto vale o que foi exportado.":"What the exports are worth.")}</div>
    <div><div class="k"><i style="background:${C.sky}"></i>${esc(t.epv)}${infoBtn("epv","EPV")}</div><div class="v">${esc(money(m.epv))}</div>${e(pt?"Parte das exportações que depende dos polinizadores.":"Part of export value that depends on pollinators.")}<div class="s">EPDR ${esc(pct(m.epdr))}${infoBtn("epdr","EPDR")}</div></div>
  </div>`;
}

/* ---------- Dados do artigo ---------- */
function pageArticle(){
  const t = T();
  const crop = S.d.some(r=>r.Crop===S.articleCrop) ? S.articleCrop : S.d[0].Crop;
  const q = evFor(crop).filter(r=>isNum(r.DR));
  const opts = q.map((r,i)=>`<option value="${i}">${esc(`${r.Reference} | DR=${r.DR.toFixed(2)} | ${r.Geographic_scope}`)}</option>`).join("");
  const heads = S.lang==="pt" ? ["Cultura","Nome científico","Produção (10³ t)","Valor produção (US$ M)","Exportação (10³ t)","Valor exportação (US$ M)","DR"] : ["Crop","Scientific name","Production (10³ t)","Production value (US$ M)","Exports (10³ t)","Export value (US$ M)","DR"];
  const rows = S.d.map((r,i)=>`<tr><td>${esc(cropName(r))}</td><td class="sci">${esc(r.Scientific_name)}</td>${ARTICLE_NUM.map(k=>`<td class="num" contenteditable="true" data-edit="${i}" data-field="${k}" aria-label="${esc(cropName(r)+" — "+k)}">${esc(isNum(r[k])?String(r[k]):"")}</td>`).join("")}</tr>`).join("");
  return `${warningBlock()}
  <section class="section">
    <div class="tbl-wrap"><table class="tbl"><thead><tr>${heads.map((h,i)=>`<th class="${i>1?"num":""}">${esc(h)}${h==="DR"?infoBtn("dr","DR"):""}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
    <p class="sub mt-s" style="font-size:14px">${esc(L("Clique em um valor numérico para editá-lo. O DR é limitado ao intervalo de 0 a 1.","Click a numeric value to edit it. DR is limited to the 0–1 range."))}</p>
    <div class="notice small">${esc(t.round_note)}</div>
    <p class="read">${esc(L("Fontes: produção e valor da produção do painel anual de produção de frutas da Abrafrutas; exportações da plataforma de dados estatísticos da Abrafrutas (2024). Valores da produção, informados em milhares de reais, foram convertidos a US$ 1 = R$ 5,39. DR: Giannini et al. (2015).","Sources: production and production value from the Abrafrutas annual fruit-production panel; exports from the Abrafrutas statistical data platform (2024). Production values, reported in thousands of reais, were converted at US$ 1 = BRL 5.39. DR: Giannini et al. (2015)."))}</p>
  </section>
  <section class="section">
    <h2 class="h">${esc(L("Estados das evidências","Evidence states"))}</h2>
    <div class="states mt-s">
      <div><b>${esc(t.convergent)}</b>${esc(L("Fontes cadastradas concordam.","Registered sources agree."))}</div>
      <div><b>${esc(t.divergence)}</b>${esc(L("Fontes cadastradas apresentam DRs distintos.","Registered sources report different DR values."))}</div>
      <div><b>${esc(t.user_evidence)}</b>${esc(L("DR fornecido pelo usuário e ainda não confrontado com a biblioteca científica.","DR supplied by the user and not yet checked against the scientific library."))}</div>
    </div>
    <h3 class="h">${esc(t.choose_crop)}</h3>
    ${cropPicker(crop, "article-crop")}
    <div class="choose">
      <div><label class="lbl" for="articleEvidence">${esc(t.choose_evidence)}</label><select id="articleEvidence">${opts}</select></div>
      <button class="btn primary" data-act="apply-article"${q.length?"":" disabled"}>${esc(t.apply)}</button>
    </div>
  </section>`;
}

/* ---------- Modelo de dados + importação ---------- */
function pageTemplate(){
  const t = T(), pt = S.lang==="pt";
  const F = pt ? [
    ["Crop","r","Texto","Nome da cultura em inglês; identificador principal."],["Crop_PT","o","Texto","Nome comum em português."],["Scientific_name","c","Texto","Nome científico da cultura."],["Year","c","AAAA","Ano de referência."],["Location","c","Texto","Localidade ou região produtiva."],["Production_1000_t","r","10³ t","Produção total."],["Production_Value_USD_M","r","US$ M","Valor econômico total da produção."],["Export_Volume_1000_t","o","10³ t","Volume exportado; use 0 quando não houver."],["Export_Value_USD_M","o","US$ M","Valor exportado; use 0 quando não houver."],["Pollination_Dependence","r","0–1","Coeficiente de dependência da polinização."],["Evidence_Reference","c","Texto","Referência utilizada para o coeficiente."],["Notes","o","Texto","Observações adicionais."]
  ] : [
    ["Crop","r","Text","Crop name in English; main identifier."],["Crop_PT","o","Text","Common name in Portuguese."],["Scientific_name","c","Text","Scientific name."],["Year","c","YYYY","Reference year."],["Location","c","Text","Production location or region."],["Production_1000_t","r","10³ t","Total crop production."],["Production_Value_USD_M","r","US$ M","Total economic production value."],["Export_Volume_1000_t","o","10³ t","Export volume; use 0 when not applicable."],["Export_Value_USD_M","o","US$ M","Export value; use 0 when not applicable."],["Pollination_Dependence","r","0–1","Pollination-dependence coefficient."],["Evidence_Reference","c","Text","Source used for the coefficient."],["Notes","o","Text","Additional notes."]
  ];
  const lab = {r:t.required,c:t.recommended,o:t.optional};
  const prev = [
    ["Melon","Melão","Cucumis melo",2024,"Rio Grande do Norte, Brazil",505.2,159.2,171.3,120.1,0.95,"Giannini et al. (2015)","Exemplo do sistema 4M"],
    ["Watermelon","Melancia","Citrullus lanatus",2024,"Rio Grande do Norte, Brazil",142.6,24.2,92.5,53.0,0.95,"Giannini et al. (2015)","Exemplo do sistema 4M"]];
  const prevCols = ["Crop","Crop_PT","Scientific_name","Year","Location","Production_1000_t","Production_Value_USD_M","Export_Volume_1000_t","Export_Value_USD_M","Pollination_Dependence","Evidence_Reference","Notes"];
  return `<section class="section">
    <div class="split">
      <div>
        <h2 class="h">${esc(L("Baixe o modelo","Download the template"))}</h2>
        <p class="sub">${esc(pt?"Excel: planilha completa com aba de dados, guia de preenchimento, unidades e descrição dos índices. CSV: versão simples para preenchimento, integração com outros sistemas e importação na plataforma.":"Excel: complete workbook with a data sheet, filling guide, units, and index descriptions. CSV: simple version for data entry, integration with other systems, and platform import.")}</p>
        <div class="dl">
          <a class="btn primary" href="${DATA}modelo_dados_cultivos.xlsx" download="${pt?"modelo_dados_cultivos.xlsx":"crop_data_template.xlsx"}">${esc(t.template_xlsx)}</a>
          <a class="btn" href="${DATA}modelo_dados_cultivos.csv" download="${pt?"modelo_dados_cultivos.csv":"crop_data_template.csv"}">${esc(t.template_csv)}</a>
        </div>
      </div>
      <div>
        <h2 class="h">${esc(t.upload_title)}</h2>
        <p class="sub">${esc(t.upload_intro)}</p>
        <label class="drop" id="drop">
          <input type="file" id="cropUpload" accept=".xlsx,.csv">
          <b>${esc(t.upload_file)}</b>
          <p>${esc(L("Clique para escolher ou arraste o arquivo (.xlsx ou .csv) até aqui.","Click to choose, or drag the file (.xlsx or .csv) here."))}</p>
          ${S.imp?`<div class="file">${esc(S.imp.name)}</div>`:""}
        </label>
        <div class="demo-row"><button type="button" class="btn ghost" data-act="load-demo">${esc(L("Experimentar com uma tabela de exemplo","Try it with a sample table"))}</button><span>${esc(L("Quatro culturas com valores econômicos fictícios (não citar), só para ver como a importação funciona.","Four crops with fictitious economic values (do not cite), just to see how importing works."))}</span></div>
      </div>
    </div>
    <div id="importArea">${importBlock()}</div>
  </section>
  <section class="section">
    <h2 class="h">${esc(t.template_fields)}</h2>
    <p class="sub">${esc(t.template_fields_note)}</p>
    <div class="fields">${F.map(f=>`<div class="field"><code>${esc(f[0])}</code><span class="req ${f[1]}">${esc(lab[f[1]])}</span><div class="u">${esc(f[2])}</div><p>${esc(f[3])}</p></div>`).join("")}</div>
    <div class="formula"><b>${esc(L("Índices derivados pela ferramenta","Indices derived by the tool"))}</b><br>${esc(pt?"EVP = valor da produção × DR; PEDR = EVP total / valor total da produção; EPV = valor das exportações × DR; EPDR = EPV total / valor total das exportações; perdas dos cenários = EVP ou EPV × redução simulada.":"EVP = production value × DR; PEDR = total EVP / total production value; EPV = export value × DR; EPDR = total EPV / total export value; scenario losses = EVP or EPV × simulated reduction.")}</div>
  </section>
  <section class="section">
    <h2 class="h">${esc(t.template_preview)}</h2>
    ${table("tplPreview", prevCols.map((c,i)=>({label:c,get:r=>r[i],num:typeof prev[0][i]==="number"})), prev, {wide:true})}
  </section>`;
}
function importBlock(){
  const t = T(), I = S.imp;
  if(!I) return "";
  if(I.errors.length) return `<div class="notice bad mt"><strong>${esc(t.invalid_file)}</strong><ul>${I.errors.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></div>`;
  if(!I.ok) return "";
  const pt = S.lang==="pt";
  const cols = [["Crop_PT",pt?"Cultura":"Crop"],["Scientific_name",pt?"Nome científico":"Scientific name"],["Production",pt?"Produção (10³ t)":"Production (10³ t)"],["Production_Value",pt?"Valor produção (US$ M)":"Production value (US$ M)"],["Export_Volume",pt?"Exportação (10³ t)":"Exports (10³ t)"],["Export_Value",pt?"Valor exportação (US$ M)":"Export value (US$ M)"],["Pollination_Dependence","DR"],["Evidence_Reference",pt?"Referência":"Reference"]];
  const warns = [...new Set(I.warnings)];
  return `<div class="notice ok mt"><strong>${esc(t.valid_file)}</strong><br>${esc(L(`${I.data.length} cultura(s) reconhecida(s). Os dados ainda não foram aplicados à análise.`,`${I.data.length} crop(s) recognized. Data have not yet been applied to the analysis.`))}</div>
    <h3 class="h mt">${esc(t.imported_preview)}</h3>
    ${table("impPreview", cols.map(([k,l])=>({label:l,get:r=>r[k],num:["Production","Production_Value","Export_Volume","Export_Value","Pollination_Dependence"].includes(k)})), I.data)}
    ${warns.length ? `<div class="notice warn mt"><strong>${esc(t.evidence_alert)}</strong><ul>${warns.map(w=>`<li>${esc(w)}</li>`).join("")}</ul></div>` : `<div class="notice mt"><strong>${esc(t.evidence_alert)}</strong><br>${esc(t.no_evidence_alert)}</div>`}
    <div class="dl"><button class="btn accent" data-act="apply-import">${esc(t.apply_import)}</button><button class="btn" data-act="clear-import">${esc(t.clear_import)}</button></div>`;
}
async function readUpload(file){
  const t = T(), pt = S.lang==="pt";
  const I = S.imp = {name:file.name, data:null, errors:[], warnings:[], ok:false};
  const ext = (file.name.split(".").pop()||"").toLowerCase();
  let raw;
  try{
    if(ext==="xlsx"){
      if(!window.XLSX) throw new Error(L("leitor de Excel ainda não carregado; tente novamente em alguns segundos","Excel reader not loaded yet; try again in a few seconds"));
      const wb = XLSX.read(await file.arrayBuffer(), {type:"array"});
      const ws = wb.Sheets["Dados_dos_cultivos"];
      if(!ws) throw new Error(L("aba 'Dados_dos_cultivos' não encontrada","sheet 'Dados_dos_cultivos' not found"));
      raw = XLSX.utils.sheet_to_json(ws, {defval:null, raw:true});
    } else if(ext==="csv"){
      raw = parseCSV(await file.text());
    } else throw new Error("Unsupported file type");
  }catch(e){
    I.errors.push((pt?"Não foi possível ler o arquivo: ":"Could not read file: ")+e.message);
    return refreshImport();
  }
  raw = raw.filter(r=>Object.values(r).some(v=>v!=null && String(v).trim()!==""));
  const names = raw.length ? Object.keys(raw[0]) : [];
  const req = ["Crop","Production_1000_t","Production_Value_USD_M","Pollination_Dependence"];
  const miss = req.filter(c=>!names.includes(c));
  if(miss.length){ I.errors.push((pt?"Colunas obrigatórias ausentes: ":"Missing required columns: ")+miss.join(", ")); return refreshImport(); }
  const defs = {Crop_PT:"",Scientific_name:"",Year:null,Location:"",Export_Volume_1000_t:0,Export_Value_USD_M:0,Evidence_Reference:"",Notes:""};
  raw.forEach(r=>{ for(const k in defs) if(!names.includes(k)) r[k]=defs[k]; });
  const numCols = ["Production_1000_t","Production_Value_USD_M","Export_Volume_1000_t","Export_Value_USD_M","Pollination_Dependence"];
  raw.forEach(r=>{
    numCols.forEach(k=>r[k]=toNum(r[k]));
    ["Crop","Crop_PT","Scientific_name","Evidence_Reference"].forEach(k=>r[k]=str(r[k]).trim());
    if(!r.Crop_PT) r.Crop_PT = r.Crop;
    if(!r.Evidence_Reference) r.Evidence_Reference = "User supplied";
  });
  const bad = (k)=>raw.some(r=>!isNum(r[k]) || r[k]<0);
  if(raw.some(r=>!r.Crop)) I.errors.push(pt?"Há linhas sem identificação da cultura (Crop).":"Some rows have no crop identifier (Crop).");
  numCols.slice(0,4).forEach(k=>{ if(bad(k)) I.errors.push(pt?`${k} deve conter apenas valores numéricos ≥ 0.`:`${k} must contain numeric values ≥ 0.`); });
  if(raw.some(r=>!isNum(r.Pollination_Dependence)||r.Pollination_Dependence<0||r.Pollination_Dependence>1)) I.errors.push(pt?"Pollination_Dependence deve variar de 0 a 1.":"Pollination_Dependence must range from 0 to 1.");
  // Avisos de evidência: informar, nunca sobrescrever os coeficientes do usuário.
  raw.forEach(r=>{
    const q = D.evidence.filter(e=>e.Crop===r.Crop && isNum(e.DR));
    if(!q.length) return;
    const nm = pt ? r.Crop_PT : r.Crop;
    const vals = [...new Set(q.map(e=>Math.round(e.DR*1e4)/1e4))].sort((a,b)=>a-b);
    if(vals.length>1) I.warnings.push(`${nm}: ${pt?"há divergência na base de evidências (DR disponíveis: ":"evidence database contains divergent DR values (available: "}${vals.map(v=>v.toFixed(2)).join(", ")}).`);
    if(!q.some(e=>Math.abs(e.DR-r.Pollination_Dependence)<1e-9)) I.warnings.push(`${nm}: DR ${isNum(r.Pollination_Dependence)?r.Pollination_Dependence.toFixed(2):"NA"}${pt?" não coincide com os coeficientes quantitativos cadastrados; o valor importado será mantido até decisão do usuário.":" does not match registered quantitative coefficients; the imported value will be retained until the user decides."}`);
  });
  I.data = raw.map(r=>({Crop:r.Crop, Crop_PT:r.Crop_PT, Scientific_name:r.Scientific_name, Production:r.Production_1000_t, Production_Value:r.Production_Value_USD_M, Export_Volume:r.Export_Volume_1000_t, Export_Value:r.Export_Value_USD_M, Pollination_Dependence:r.Pollination_Dependence, Evidence_Reference:r.Evidence_Reference, Year:r.Year, Location:r.Location, Notes:r.Notes}));
  I.ok = I.errors.length===0;
  refreshImport();
}
function refreshImport(){ if(S.tab==="modelo") renderMain(); }

/* ---------- Cenários ---------- */
function pageScenarios(){
  const t = T(), m = calc(S.d, S.reduction/100), r = S.reduction;
  const reds = [.10,.25,.50], ds = reds.map(x=>calc(S.d,x));
  const pt = S.lang==="pt";
  const tbl = table("scen", [
    {label:pt?"Cenário":"Scenario", get:x=>x.s},
    {label:pt?"Perda produção (US$ M)":"Production loss (US$ M)", get:x=>fmt1(x.m.pl), num:1},
    {label:pt?"EVP remanescente (US$ M)":"Remaining EVP (US$ M)", get:x=>fmt1(x.m.evp-x.m.pl), num:1},
    {label:pt?"Perda exportações (US$ M)":"Export loss (US$ M)", get:x=>fmt1(x.m.xl), num:1},
    {label:pt?"EPV remanescente (US$ M)":"Remaining EPV (US$ M)", get:x=>fmt1(x.m.epv-x.m.xl), num:1}
  ], ds.map((m,i)=>({s:(reds[i]*100)+"%", m})));
  const evpShare = m.evp>0 ? Math.min(1,m.pl/m.evp) : 0, epvShare = m.epv>0 ? Math.min(1,m.xl/m.epv) : 0;
  return `${warningBlock()}
  <section class="section panel">
    <div class="reduction">
      <div class="pct" id="scPct">${r}%</div>
      <div>
        <label class="lbl" for="scRange">${esc(t.reduction)}</label>
        <input id="scRange" type="range" min="0" max="100" step="1" value="${r}" data-act="reduction">
        <div class="ticks"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
        <div class="presets" role="group" aria-label="${esc(t.scencompare)}">${[10,25,50].map(p=>`<button data-act="preset" data-v="${p}" aria-pressed="${r===p}">${p}%</button>`).join("")}</div>
      </div>
    </div>
    <div class="flow" id="scFlow">${flowBlock(m, evpShare, epvShare)}</div>
  </section>
  <section class="section">
    <div class="chart"><h3>${esc(t.scencompare)}</h3><p class="sub">${esc(t.scenarios_note)}</p>
      ${grouped(reds.map((x,i)=>({label:(x*100)+"%",values:[ds[i].pl,ds[i].xl]})), [{color:C.mango},{color:C.sky}], v=>fmt1(v), "US$ M")}
      <div class="legend"><span><i style="background:${C.mango}"></i>${esc(t.production)}</span><span><i style="background:${C.sky}"></i>${esc(t.exports)}</span></div>
      <p class="read">${esc(L("Como ler: cada grupo é um cenário padronizado. As barras mostram a exposição econômica da produção e das exportações, em milhões de US$, para reduções de 10%, 25% e 50%.","How to read: each group is a standardized scenario. Bars show the economic exposure of production and exports, in US$ millions, for 10%, 25% and 50% reductions."))}</p>
    </div>
  </section>
  <section class="section"><h2 class="h">${esc(t.scenario_summary)}</h2><div class="mt-s">${tbl}</div></section>`;
}
function flowBlock(m, a, b){
  const t = T(), r = S.reduction, pt = S.lang==="pt";
  const sentence = pt
    ? `Se o serviço de polinização caísse ${r}%, deixariam de ser gerados cerca de ${money(m.pl)} no valor da produção e ${money(m.xl)} no valor das exportações. A barra colorida mostra essa perda; a parte restante é o valor que continuaria ligado à polinização.`
    : `If the pollination service fell by ${r}%, about ${money(m.pl)} of production value and ${money(m.xl)} of export value would no longer be generated. The coloured bar shows this loss; the rest is the value still linked to pollination.`;
  return `<p class="plain flow-sentence">${esc(sentence)}</p><div class="flow-col"><h3><i style="background:${C.mango}"></i>${esc(t.production)}${infoBtn("exposicao",t.prodloss)}</h3>
      <div class="bar-split"><span style="width:${(100*a).toFixed(2)}%;background:${C.mango}"></span><span style="width:${(100*(1-a)).toFixed(2)}%;background:${C.leaf}"></span></div>
      <div class="flow-nums"><div>${esc(t.prodloss)}<b>${esc(money(m.pl))}</b></div><div style="text-align:right">${esc(t.remain_evp)}<b>${esc(money(Math.max(m.evp-m.pl,0)))}</b><span>EVP: ${esc(money(m.evp))}</span></div></div></div>
    <div class="flow-col"><h3><i style="background:${C.sky}"></i>${esc(t.exports)}</h3>
      <div class="bar-split"><span style="width:${(100*b).toFixed(2)}%;background:${C.sky}"></span><span style="width:${(100*(1-b)).toFixed(2)}%;background:#B9CFE2"></span></div>
      <div class="flow-nums"><div>${esc(t.exploss)}<b>${esc(money(m.xl))}</b></div><div style="text-align:right">${esc(t.remain_epv)}<b>${esc(money(Math.max(m.epv-m.xl,0)))}</b><span>EPV: ${esc(money(m.epv))}</span></div></div></div>`;
}

/* ---------- Evidências ---------- */
function pageEvidence(){
  const t = T(), pt = S.lang==="pt";
  if(!S.d.some(r=>r.Crop===S.evidenceCrop)) S.evidenceCrop = S.d[0].Crop;
  const crop = S.evidenceCrop;
  const cur = S.d.find(r=>r.Crop===crop);
  let q = evFor(crop), userOnly = false, quant, support;
  if(!q.length){
    userOnly = true; quant = []; support = [];
  } else {
    quant = selectable(q);
    support = q.filter(r=>!isNum(r.DR) || !yesFlag(r.Selectable_for_calculation));
  }
  const status = evidenceState(q, cur.Pollination_Dependence, userOnly);
  const base = D.article.find(r=>r.Crop===crop) || cur;
  const badge = {divergent:["warn",t.divergence],user:["warn",t.user_evidence],registered:["",t.registered],convergent:["",t.convergent]}[status];
  const stateText = {
    convergent: L("As fontes independentes cadastradas para esta cultura apontam o mesmo DR.","The registered independent sources for this crop agree on the same DR."),
    divergent: L("As fontes cadastradas apontam DRs diferentes. Os resultados mudam conforme a fonte escolhida, por isso compare-as abaixo.","Registered sources report different DR values. Results change with the source you choose, so compare them below."),
    registered: L("O DR em uso vem de uma única linhagem de fonte cadastrada.","The DR in use comes from a single registered source lineage."),
    user: L("O DR em uso não corresponde a uma fonte cadastrada para esta cultura.","The DR in use does not match a registered source for this crop.")
  }[status];
  const items = quant.map(r=>{
    const applied = isNum(r.DR) && Math.abs(r.DR-cur.Pollination_Dependence)<1e-9 && nz(r.Reference) && str(r.Reference)===str(cur.Evidence_Reference);
    const meta = [`ID: ${nz(r.Evidence_ID)?r.Evidence_ID:"—"}`, nz(r.DOI)?`DOI: ${r.DOI}`:"", nz(r.Source_ID)?`${pt?"Fonte":"Source"}: ${r.Source_ID}`:"", nz(r.Evidence_lineage)?`${pt?"Linhagem":"Lineage"}: ${r.Evidence_lineage}`:""].filter(Boolean).join(" · ");
    return `<div class="ev-item${applied?" applied":""}">
      <div><div class="ref">${esc((nz(r.Evidence_ID)?r.Evidence_ID:"—")+" · "+r.Reference)}</div><div style="font-size:14px;color:var(--ink-2)">${esc(r.Dependence_class+" · "+r.Geographic_scope)}</div></div>
      <div class="drv">${esc(r.DR.toFixed(2))}<small>DR</small></div>
      <div class="meta">${esc(meta)}${applied?` &nbsp;<span class="tag">${esc(t.applied)}</span>`:""}</div>
    </div>`;
  }).join("");
  const opts = quant.map((r,i)=>`<option value="${i}">${esc(`${r.Evidence_ID} | ${r.Reference} | ${r.Dependence_class} | DR=${r.DR.toFixed(2)} | ${r.Geographic_scope}`)}</option>`).join("");
  const userItem = userOnly ? `<div class="ev-item applied"><div><div class="ref">${esc(cur.Evidence_Reference)}</div><div style="font-size:14px;color:var(--ink-2)">${esc(pt?"Coeficiente importado · Fornecida pelo usuário":"Imported coefficient · User supplied")}</div></div><div class="drv">${esc(cur.Pollination_Dependence.toFixed(2))}<small>DR</small></div><div class="meta">${esc(pt?"Evidência informada na planilha importada; ainda não validada pela base bibliográfica da ferramenta.":"Evidence supplied in the imported spreadsheet; not yet validated against the tool literature database.")} &nbsp;<span class="tag">${esc(t.in_use)}</span></div></div>` : "";
  return `${warningBlock()}
  <section class="section">
    <h3 class="h" style="margin-bottom:12px">${esc(t.choose_crop)}</h3>
    ${cropPicker(crop, "ev-crop")}
    <div class="panel">
      <div class="ev-current" style="padding-top:0">
        ${cropIcon(crop)}
        <div style="flex:1"><div class="name">${esc(cropName(base))}</div><div class="sci" style="font-size:17px;color:var(--muted)">${esc(base.Scientific_name)}</div>
          <div class="dr">${esc(t.current)}: <b>${esc(cur.Pollination_Dependence.toFixed(2))}</b></div></div>
        <span class="tag ${badge[0]}">${esc(badge[1])}</span>${infoBtn("estados",badge[1])}
      </div>
      <p class="plain">${esc(stateText)} ${esc(L("O DR é a fração da produção que depende de polinizadores (0 a 1).","DR is the share of production that depends on pollinators (0 to 1)."))}</p>
      ${status==="user" ? `<div class="notice warn"><strong>${esc(t.user_evidence)}</strong><br>${esc(pt?"O DR exibido foi fornecido na planilha do usuário. Ele está sendo utilizado nos cálculos, mas ainda não foi validado ou comparado com evidências bibliográficas cadastradas na ferramenta.":"The displayed DR was supplied in the user's spreadsheet. It is being used in the calculations, but has not yet been validated or compared with bibliographic evidence registered in the tool.")}</div>` : ""}
      ${status==="divergent" ? `<div class="notice alert"><strong>${esc(t.divergence)}</strong><br>${esc(t.divergence_note)}</div>` : ""}
      <h3 class="h">${esc(t.quantitative)}${infoBtn("evidencia",t.quantitative)}</h3>
      <div class="ev-list mt-s">${items}${userItem}</div>
      ${quant.length ? `<div class="choose"><div><label class="lbl" for="evChoice">${esc(t.choose_evidence)}</label><select id="evChoice">${opts}</select></div><button class="btn primary" data-act="apply-evidence">${esc(t.apply)}</button></div><p class="read">${esc(L("Ao aplicar, o novo DR passa a ser usado no Painel, nos Cenários e nas Recomendações. Para desfazer, use Restaurar cenário do manuscrito.","When applied, the new DR is used on the Dashboard, Scenarios and Management pages. To undo, use Restore manuscript scenario."))}</p>`
        : `<div class="notice small"><strong>${esc(pt?"Coeficiente atual preservado":"Current coefficient preserved")}</strong><br>${esc(pt?"A ferramenta não substitui automaticamente o DR informado pelo usuário.":"The tool does not automatically replace the DR supplied by the user.")}</div>`}
      ${support.length ? `<div class="notice small mt"><strong>${esc(t.supporting)}</strong><br>${esc(support[0].Reference+": "+str(support[0].Notes))}<br><em>${esc(t.support_note)}</em></div>` : ""}
    </div>
  </section>`;
}

/* ---------- Catálogo ---------- */
function norm(x){ return str(x).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\x00-\x7F]/g,"").toLowerCase(); }
const ALIAS = {"cucumis melo":"melao melon cantaloupe","citrullus lanatus":"melancia watermelon","mangifera indica":"manga mango","carica papaya":"mamao papaya","glycine max":"soja soybean","coffea arabica":"cafe coffee","coffea canephora":"cafe coffee robusta","lycopersicon esculentum":"tomate tomato solanum lycopersicum","solanum lycopersicum":"tomate tomato lycopersicon esculentum","capsicum annuum":"pimentao pimenta pepper","gossypium hirsutum":"algodao cotton","phaseolus vulgaris":"feijao bean","citrus":"citros citrus","cucurbita":"abobora pumpkin squash","euterpe oleracea":"acai acai berry","myrciaria dubia":"camu camu"};
function alias(name){ const n = norm(name); let a=""; for(const k in ALIAS) if(n.includes(k)) a+=" "+ALIAS[k]; return a; }
const word = (v,q) => (" "+v.replace(/[^a-z0-9]+/gi," ")+" ").includes(" "+q+" ");

function catFiltered(){
  let x = D.cat;
  const q = norm(S.cat.q.trim());
  if(q){
    const exato = x.filter(r=>r._pt===q || r._en===q);
    if(exato.length && !S.cat.related) x = exato;
    else {
      x = x.filter(r=> word(r._pt,q) || word(r._en,q) || r._lit.includes(q) || r._uid.includes(q) || word(r._alias,q));
      const score = r => (r._pt===q||r._en===q) ? 0 : (r._pt.startsWith(q)||r._en.startsWith(q)) ? 1 : 2;
      x = x.map((r,i)=>[r,i]).sort((a,b)=>score(a[0])-score(b[0]) || a[1]-b[1]).map(p=>p[0]);
    }
  }
  if(S.cat.fonte!=="Todas") x = x.filter(r=>r.Fonte===S.cat.fonte);
  if(S.cat.tipo!=="Todos") x = x.filter(r=>r.Tipo===S.cat.tipo);
  return x;
}
function sig3(v){ return Number(v.toPrecision(3)).toLocaleString(locale(),{maximumFractionDigits:10}); }
function catSynthesis(x){
  const groups = new Map();
  x.forEach(r=>{
    const pt = nz(r["Nome comum (PT)"]) ? r["Nome comum (PT)"] : "Sem nome comum";
    const en = nz(r["Common name (EN)"]) ? r["Common name (EN)"] : "Common name unavailable";
    const key = pt+"|||"+en+"|||"+r._bin;
    if(!groups.has(key)) groups.set(key,{pt,en,bin:r._bin,rows:[]});
    groups.get(key).rows.push(r);
  });
  return [...groups.values()].map(g=>{
    const gg = g.rows.filter(r=>r.Fonte==="Giannini"), kk = g.rows.filter(r=>r.Fonte==="Klein"), ss = g.rows.filter(r=>r.Fonte==="Siopa");
    const nums = ss.map(r=>toNum(r["Valor numérico"])).filter(isNum);
    const gi = [...new Set(gg.map(r=>r["Valor literal"]).filter(nz))], kl = [...new Set(kk.map(r=>r["Valor literal"]).filter(nz))];
    return {pt:g.pt, en:g.en, bin:g.bin, gi: gi.length?gi.join("; "):"—", kl: kl.length?kl.join("; "):(kk.length?L("Categoria: consultar registro","Category: see record"):"—"),
      n:ss.length, min: nums.length?Math.min(...nums):null, max: nums.length?Math.max(...nums):null, total:g.rows.length};
  });
}
function siopaSpecies(x){ return new Set(x.filter(r=>r.Fonte==="Siopa").map(r=>r._bin)); }
const STUDY_KEYS = ["dataset","study","species","response","treatment","scale","country"];
function catStudies(x){
  const sp = siopaSpecies(x); if(!sp.size) return [];
  const y = D.meta.filter(r=>sp.has(str(r.species).trim()));
  if(!y.length) return [];
  const map = new Map();
  y.forEach(r=>{ const k = STUDY_KEYS.map(c=>str(r[c])).join("\u0001"); if(!map.has(k)) map.set(k,[]); map.get(k).push(r); });
  let out = [...map.values()].map(rows=>{
    const a = {}; STUDY_KEYS.forEach(c=>a[c]=str(rows[0][c]));
    const v = rows.map(r=>toNum(r.pd_value)).filter(isNum);
    a.source_rows = rows.map(r=>str(r.source_row)).join(", ");
    a.n = rows.length; a.min = v.length?Math.min(...v):null; a.max = v.length?Math.max(...v):null; a.neg = v.filter(z=>z<0).length;
    a.key = norm(a.study)+"::"+norm(a.species);
    return a;
  });
  out.sort((p,q)=>{ for(const c of STUDY_KEYS){ const d = p[c].localeCompare(q[c]); if(d) return d; } return 0; });
  const ds = {}; out.forEach(o=>{ (ds[o.key]=ds[o.key]||new Set()).add(o.dataset); });
  out.forEach(o=>o.overlap = ds[o.key].size>1 ? L("REVISAR: mesmo estudo em múltiplos arquivos","REVIEW: same study in multiple datasets") : "—");
  return out;
}
function studyCols(){
  const pt = S.lang==="pt";
  const lab = pt ? ["Arquivo","Estudo","Espécie","Resposta","Tratamento","Escala","País","Linhas de origem","Nº de linhas","Mínimo","Máximo","Valores negativos","Sobreposição potencial"] : ["Dataset","Study","Species","Outcome","Treatment","Scale","Country","Source rows","Row count","Minimum","Maximum","Negative values","Potential overlap"];
  const keys = [...STUDY_KEYS,"source_rows","n","min","max","neg","overlap"];
  return keys.map((k,i)=>({label:lab[i], get:r=>r[k]==null?"NA":(typeof r[k]==="number"?r[k].toLocaleString(locale(),{maximumFractionDigits:6}):r[k]), num:["n","min","max","neg"].includes(k), html: k==="species"?(r=>`<span class="sci">${esc(r[k])}</span>`):null}));
}

function pageCatalog(){
  const pt = S.lang==="pt";
  if(S.catError) return `<div class="notice bad"><strong>${esc(L("Não foi possível carregar o catálogo","The catalog could not be loaded"))}</strong><br>${esc(S.catError)}</div>`;
  if(!S.catLoaded){ loadCatalog(); return `<div class="loading">${esc(L("Carregando 2.054 registros do catálogo…","Loading the catalog's 2,054 records…"))}</div>`; }
  const all = D.cat;
  const fontes = [...new Set(all.map(r=>r.Fonte))].sort(), tipos = [...new Set(all.map(r=>r.Tipo))].sort();
  const cnt = f => all.filter(r=>r.Fonte===f).length;
  return `<div class="notice ok"><strong>${esc(L("Separação dos módulos. ","Module separation. "))}</strong>${esc(L("Dados do artigo = conjunto analítico congelado e reprodutível. Catálogo científico = evidência complementar para exploração e proveniência.","Article data = frozen, reproducible analytical dataset. Scientific catalog = complementary evidence for exploration and provenance."))}</div>
  <h2 class="h">${esc(A().sources_title)}</h2>
  <div class="srcs mt-s">${A().sources.map(s=>`<div><b>${esc(s[0])}</b><p>${esc(s[1])}</p></div>`).join("")}</div>
  <div class="counts">
    <div><div class="k">${esc(L("Registros","Records"))}</div><div class="v">${all.length.toLocaleString("pt-BR")}</div></div>
    <div><div class="k">Giannini</div><div class="v">${cnt("Giannini").toLocaleString("pt-BR")}</div></div>
    <div><div class="k">Klein</div><div class="v">${cnt("Klein").toLocaleString("pt-BR")}</div></div>
    <div><div class="k">Siopa</div><div class="v">${cnt("Siopa").toLocaleString("pt-BR")}</div></div>
  </div>
  <section class="panel">
    <div class="form-row">
      <div><label class="lbl" for="catQ">${esc(L("Pesquisar cultura, espécie ou UID","Search crop, species or UID"))}</label><input type="search" id="catQ" value="${esc(S.cat.q)}" autocomplete="off" placeholder="${esc(L("ex.: manga, Cucumis melo","e.g. mango, Cucumis melo"))}"></div>
      <div><label class="lbl" for="catFonte">${esc(L("Publicação","Publication"))}</label><select id="catFonte"><option value="Todas">${esc(L("Todas","All"))}</option>${fontes.map(f=>`<option${S.cat.fonte===f?" selected":""}>${esc(f)}</option>`).join("")}</select></div>
      <div><label class="lbl" for="catTipo">${esc(L("Tipo de evidência","Evidence type"))}</label><select id="catTipo"><option value="Todos">${esc(L("Todos","All"))}</option>${tipos.map(f=>`<option${S.cat.tipo===f?" selected":""}>${esc(f)}</option>`).join("")}</select></div>
    </div>
    <div class="row-actions mt-s" style="margin-bottom:0">
      <label class="check"><input type="checkbox" id="catRel"${S.cat.related?" checked":""}>${esc(L("Incluir culturas relacionadas e correspondências parciais","Include related crops and partial matches"))}</label>
      <div class="seg" role="group" aria-label="${esc(L("Visualização","View"))}">
        <button data-act="cat-mode" data-v="sintese" aria-pressed="${S.cat.mode==="sintese"}">${esc(L("Síntese por espécie","Species overview"))}</button>
        <button data-act="cat-mode" data-v="detalhe" aria-pressed="${S.cat.mode==="detalhe"}">${esc(L("Registros individuais","Individual records"))}</button>
      </div>
    </div>
  </section>
  <div id="catResults">${catResults()}</div>
  <p class="sub mt" style="font-size:14px">${esc(L("Klein: categorias e intervalos; Giannini: coeficientes por linha comercial; Siopa: observações experimentais. Nenhuma transferência automática para espécies ou para o cálculo econômico.","Klein: qualitative classes and intervals; Giannini: commodity-level coefficients; Siopa: experimental observations. No automatic transfer to individual species or economic calculations."))}</p>`;
}
function catResults(){
  const pt = S.lang==="pt";
  const x = catFiltered();
  let html = `<div class="row-actions mt"><p class="result-count" style="margin:0">${esc(L("Registros encontrados:","Matching records:"))} <b>${x.length.toLocaleString(locale())}</b></p><button class="btn" data-act="cat-export">${esc(L("Exportar seleção (CSV)","Export selection (CSV)"))}</button></div>`;
  if(S.cat.mode==="sintese"){
    const syn = catSynthesis(x);
    const negs = x.filter(r=>r.Fonte==="Siopa").map(r=>toNum(r["Valor numérico"])).filter(v=>isNum(v)&&v<0).length;
    html += `<p class="sub" style="font-size:14px">${esc(L("Siopa: número de registros e amplitude descritiva (mínimo–máximo) por espécie. NÃO é média, intervalo de confiança ou coeficiente geral de dependência; experimentos podem ter métodos e respostas diferentes. Registros não são necessariamente estudos independentes.","Siopa: record count and descriptive range (minimum–maximum) per species. NOT a mean, confidence interval or general dependence coefficient; methods and outcomes may differ. Records are not necessarily independent studies."))}</p>`;
    if(negs) html += `<div class="notice alert small">${esc(pt?`Atenção: ${negs} valor(es) experimentais negativos nesta seleção. Preservados como publicados; verificar a variável original e o cálculo antes de interpretar.`:`Caution: ${negs} negative experimental value(s) in this selection. Preserved as published; inspect the original outcome and calculation before interpreting.`)}</div>`;
    html += table("catSyn", [
      {label:pt?"Cultura":"Crop", get:r=>pt?r.pt:r.en},
      {label:pt?"Espécie":"Species", get:r=>r.bin, html:r=>`<span class="sci">${esc(r.bin)}</span>`},
      {label:"Giannini", get:r=>r.gi}, {label:"Klein", get:r=>r.kl},
      {label:pt?"Siopa: registros":"Siopa: records", get:r=>r.n, num:1},
      {label:pt?"Siopa: mínimo–máximo":"Siopa: min–max", get:r=>(r.n>0&&isNum(r.min))?`${sig3(r.min)} ${pt?"a":"to"} ${sig3(r.max)}`:"—", num:1},
      {label:pt?"Total de registros":"Total records", get:r=>r.total, num:1}
    ], syn, {pageSize:10, empty:pt?"Nenhuma cultura encontrada":"No matching crops"});

    // Metadados Siopa
    html += `<h2 class="h gap">${esc(L("Metadados dos estudos de Siopa","Siopa study metadata"))}</h2><p class="sub" style="font-size:14px">${esc(L("Linhas dos três conjuntos originais, relacionadas por espécie, NÃO vinculadas automaticamente aos UIDs nem interpretadas como estudos independentes. Siglas SUP, OP, BOTH, BH e AH permanecem como nos arquivos originais até a conferência do dicionário metodológico. Examine a variável de resposta, o tratamento e o estudo antes de comparar valores.","Rows from the three original datasets, matched by species, NOT automatically mapped to catalog UIDs or treated as independent studies. Inspect outcome, treatment and study before comparing values."))}</p>`;
    const sp = siopaSpecies(x);
    if(!x.some(r=>r.Fonte==="Siopa")) html += `<div class="notice small">${esc(L("Nenhum registro Siopa nesta seleção.","No Siopa records in this selection."))}</div>`;
    else {
      const meta = D.meta.filter(r=>sp.has(str(r.species).trim()));
      if(!meta.length) html += `<div class="notice small">${esc(L("Sem correspondência literal nos dados originais; conferir grafia e sinônimos.","No literal match in original data; check spelling and synonyms."))}</div>`;
      else {
        const mk = ["dataset","study","species","response","treatment","scale","country","pd_value","pd_type"];
        const ml = pt ? ["Arquivo","Estudo","Espécie","Resposta","Tratamento","Escala","País","Valor original","Tipo PD"] : ["Dataset","Study","Species","Outcome","Treatment","Scale","Country","Original value","PD type"];
        html += table("catMeta", mk.map((k,i)=>({label:ml[i], get:r=>r[k], num:k==="pd_value", html:k==="species"?(r=>`<span class="sci">${esc(r[k])}</span>`):null})), meta, {pageSize:8, search:true, wide:true});
      }
    }
    // Estudos
    const st = catStudies(x);
    html += `<h2 class="h gap">${esc(L("Comparação por estudo e protocolo","Comparison by study and protocol"))}</h2><p class="sub" style="font-size:14px">${esc(L("Agrupamento por arquivo, estudo, espécie, resposta, tratamento, escala e país. Mínimo e máximo descrevem linhas de origem, não estudos independentes. Nenhuma média ou coeficiente econômico é calculado.","Grouped by dataset, study, species, outcome, treatment, scale and country. Ranges describe source rows, not independent studies. No mean or economic coefficient is calculated."))}</p>`;
    html += table("catStudies", studyCols(), st, {pageSize:8, search:true, wide:true, empty:pt?"Sem grupos de estudos correspondentes":"No matching study groups"});
    const studies = [...new Set(st.map(s=>s.study))].sort();
    if(!studies.includes(S.cat.study)) S.cat.study = studies[0]||null;
    html += `<h2 class="h gap">${esc(L("Examinar um estudo","Inspect one study"))}</h2><p class="sub" style="font-size:14px">${esc(L("Selecione um estudo para reunir seus protocolos e respostas. O marcador de sobreposição apenas indica que o mesmo estudo aparece em mais de um arquivo-fonte e requer conferência; não significa duplicação confirmada.","Select a study to gather its protocols and outcomes. The overlap flag only indicates that the same study appears in more than one source dataset and requires review; it does not prove duplication."))}</p>`;
    if(studies.length){
      html += `<div style="max-width:520px;margin-bottom:12px"><label class="lbl" for="catStudy">${esc(L("Estudo","Study"))}</label><select id="catStudy">${studies.map(s=>`<option${s===S.cat.study?" selected":""}>${esc(s)}</option>`).join("")}</select></div>`;
      html += table("catStudy1", studyCols(), st.filter(s=>s.study===S.cat.study), {pageSize:12, wide:true});
    } else html += `<div class="notice small">${esc(L("Selecione um estudo","Select a study"))}</div>`;
  } else {
    const com = pt ? "Nome comum (PT)" : "Common name (EN)";
    if(!x.some(r=>r.UID===S.cat.uid)) S.cat.uid = x.length ? x[0].UID : null;
    html += table("catRec", [
      {label:pt?"Cultura":"Crop", get:r=>r[com]},
      {label:pt?"Nome científico":"Scientific name", get:r=>r["Nome literal"], html:r=>`<span class="sci">${esc(r["Nome literal"])}</span>`},
      {label:pt?"Fonte":"Source", get:r=>r.Fonte},
      {label:pt?"Evidência":"Evidence", get:r=>r.Tipo},
      {label:pt?"Valor":"Value", get:r=>r["Valor literal"]}
    ], x, {pageSize:15, selectable:true, key:r=>r.UID, selectedKey:S.cat.uid});
    html += `<h2 class="h gap">${esc(L("Proveniência de um registro","Record provenance"))}</h2>`;
    if(x.length){
      const rec = x.find(r=>r.UID===S.cat.uid);
      html += `<p class="sub" style="font-size:14px">${esc(L("Selecione uma linha da tabela ou escolha o UID.","Select a table row or choose the UID."))}</p>
        <div style="max-width:420px;margin-bottom:12px"><label class="lbl" for="catUid">${esc(L("Selecione o registro","Select record"))}</label><select id="catUid">${x.map(r=>`<option${r.UID===S.cat.uid?" selected":""}>${esc(r.UID)}</option>`).join("")}</select></div>
        <div class="kv">${Object.keys(rec).filter(k=>k[0]!=="_").map(k=>`<div class="k">${esc(k)}</div><div>${esc(rec[k])}</div>`).join("")}</div>`;
    } else html += `<div class="notice small">${esc(L("Nenhum registro selecionado. Ajuste os filtros para consultar a proveniência.","No record selected. Adjust filters to view provenance."))}</div>`;
  }
  return html;
}
function refreshCat(){ const el = document.getElementById("catResults"); if(el) el.innerHTML = catResults(); }
function exportCat(){
  const x = catFiltered().map(r=>{ const o={}; Object.keys(r).filter(k=>k[0]!=="_").forEach(k=>o[k]=r[k]); return o; });
  const csv = "﻿"+Papa.unparse(x);
  const d = new Date(), ds = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download = `catalogo_v235_selecao_${ds}.csv`;
  document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},500);
}

/* ---------- Recomendações ---------- */
function exposureId(){ const r=S.reduction; return r<10?"E0":r<25?"E1":r<50?"E2":"E3"; }
function mgResults(){
  const ctx = S.mg, eid = exposureId();
  const out = D.mAct.map(a=>{
    const mid = a.Management_ID;
    const rr = D.mRules.filter(r=>r.Management_ID===mid);
    const hit = rr.filter(r=>str(ctx[r.Context_variable])===str(r.Context_response));
    const scores = hit.map(h=>h.Context_score).filter(isNum);
    const score = hit.length && scores.length ? Math.max(...scores) : 0;
    const pm = D.mPrio.find(p=>toNum(p.Context_score)===score && p.Exposure_ID===eid);
    let best = null; hit.forEach(h=>{ if(isNum(h.Context_score) && (!best || h.Context_score>best.Context_score)) best=h; });
    return {mid, Action:a.Action, Action_PT:a.Action_PT, strength:a.Evidence_strength, score,
      prio: pm?pm.Management_priority:"Maintain", prioPT: pm?pm.Management_priority_PT:"Manter",
      ratPT: best?best.Rationale_PT:"Nenhuma limitação contextual específica foi informada para esta ação.",
      ratEN: best?best.Rationale_EN:"No specific contextual limitation was reported for this action."};
  });
  const ord = p => {const i=["Very high","High","Moderate","Maintain"].indexOf(p); return i<0?99:i;};
  return out.map((r,i)=>[r,i]).sort((a,b)=>ord(a[0].prio)-ord(b[0].prio)||a[1]-b[1]).map(p=>p[0]);
}
const BENEFIT = {
  M01:["Manutenção de habitat e recursos associados à diversidade de polinizadores.","Maintenance of habitat and resources associated with pollinator diversity."],
  M02:["Recuperação de habitat pode beneficiar abundância e riqueza de abelhas silvestres.","Habitat restoration can benefit wild-bee abundance and richness."],
  M03:["Maior heterogeneidade pode sustentar biodiversidade e a provisão de serviços ecossistêmicos.","Greater heterogeneity can support biodiversity and ecosystem-service delivery."],
  M04:["Recursos florais diversos e persistentes podem favorecer polinizadores e o serviço de polinização.","Diverse, persistent floral resources can support pollinators and pollination service."],
  M05:["A conectividade pode ser considerada para reduzir isolamento, mas seus benefícios dependem do contexto da paisagem.","Connectivity can be considered to reduce isolation, but benefits depend on landscape context."],
  M06:["O IPPM integra controle de pragas com medidas para reduzir a exposição e proteger polinizadores.","IPPM integrates pest control with measures to reduce exposure and protect pollinators."]};
const CAVEAT = {
  M01:["Não implica aumento garantido de produtividade ou retorno econômico.","Does not imply guaranteed increases in yield or economic return."],
  M02:["A evidência é mais direta para respostas de abelhas do que para produtividade agrícola.","Evidence is more direct for bee responses than for crop yield."],
  M03:["Os efeitos variam entre paisagens e sistemas agrícolas.","Effects vary among landscapes and farming systems."],
  M04:["A efetividade depende da diversidade floral, idade/perenidade e distância; ganhos de produtividade não são garantidos.","Effectiveness depends on floral diversity, age/permanence and distance; yield gains are not guaranteed."],
  M05:["Não se deve assumir benefício universal de corredores ou da configuração da paisagem.","Universal benefits of corridors or landscape configuration should not be assumed."],
  M06:["O framework orienta decisões de manejo, mas não fornece uma redução quantitativa universal do risco aos polinizadores.","The framework guides management decisions but does not provide a universal quantitative reduction in pollinator risk."]};
const STRENGTH_PT = {"High":"Alta","Moderate-High":"Moderada–alta","Moderate":"Moderada","High / context-dependent":"Alta / dependente do contexto"};
const EVTYPE_PT = {"Global quantitative synthesis":"Síntese quantitativa global","Global synthesis":"Síntese global","Meta-analysis":"Meta-análise","Quantitative synthesis":"Síntese quantitativa","Review / conceptual framework":"Revisão / estrutura conceitual","Review / decision framework":"Revisão / estrutura de decisão","Brazilian review / policy synthesis":"Revisão brasileira / síntese de políticas"};
const SCOPE_PT = {"Global":"Global","Multi-region":"Multirregional","North America; Europe; New Zealand":"América do Norte; Europa; Nova Zelândia","General agricultural systems":"Sistemas agrícolas em geral","Brazil":"Brasil"};
const CAV_PT = {
  "MAN-KEN-001":"Forte suporte para qualidade do habitat e diversificação local; conectividade ou configuração da paisagem, isoladamente, não devem ser interpretadas como garantia de benefício.",
  "MAN-DAI-001":"Síntese ampla sobre polinização e controle biológico; os tamanhos de efeito dependem do contexto e não devem ser convertidos diretamente em retorno econômico.",
  "MAN-TON-001":"A meta-análise avaliou principalmente abundância e riqueza de abelhas silvestres em habitats restaurados, e não diretamente produtividade agrícola ou retorno econômico.",
  "MAN-ALB-001":"Priorizar recursos florais de alta qualidade, e não simplesmente 'plantar flores'. A efetividade varia com diversidade, idade/permanência e distância, e ganhos de produtividade não são garantidos.",
  "MAN-BID-001":"A estrutura apoia a integração do manejo de pragas e polinizadores, mas não fornece uma redução quantitativa universal da exposição ou do risco aos polinizadores.",
  "MAN-EGA-001":"Utilizar como estrutura de manejo; não inferir um tamanho de efeito ecológico ou econômico fixo.",
  "MAN-HIP-001":"Possui forte relevância contextual para o Brasil, mas constitui uma síntese de políticas/revisão, e não uma estimativa quantitativa do efeito de uma intervenção."};
const pick = (map,x) => S.lang==="pt" && x in map ? map[x] : x;

function pageManagement(){
  const pt = S.lang==="pt";
  const ab = pt ? [["Abundant","Abundante"],["Some","Alguma"],["Scarce","Escassa"],["Unknown","Não informado"]] : [["Abundant","Abundant"],["Some","Some"],["Scarce","Scarce"],["Unknown","Unknown"]];
  const yn = pt ? [["Yes","Sim"],["No","Não"],["Unknown","Não informado"]] : [["Yes","Yes"],["No","No"],["Unknown","Unknown"]];
  const hml = pt ? [["High","Alta"],["Moderate","Moderada"],["Low","Baixa"],["Unknown","Não informado"]] : [["High","High"],["Moderate","Moderate"],["Low","Low"],["Unknown","Unknown"]];
  const fr = pt ? [["Frequently","Frequentemente"],["Occasionally","Ocasionalmente"],["No","Não"],["Unknown","Não informado"]] : [["Frequently","Frequently"],["Occasionally","Occasionally"],["No","No"],["Unknown","Unknown"]];
  const Q = [
    ["Q01", pt?"Vegetação natural/seminatural no entorno":"Natural/semi-natural vegetation around the production area", ab],
    ["Q02", pt?"Há áreas degradadas disponíveis para restauração?":"Degraded areas available for restoration?", yn],
    ["Q03", pt?"Recursos florais fora da floração da cultura":"Floral resources outside crop flowering", ab],
    ["Q04", pt?"Diversificação da paisagem agrícola":"Agricultural landscape diversification", hml],
    ["Q05", pt?"Uso de inseticidas durante/próximo à floração":"Insecticide use during/near flowering", fr],
    ["Q06", pt?"Conectividade entre manchas de habitat":"Connectivity among habitat patches", hml]];
  return `<div class="notice warn"><strong>${esc(pt?"Salvaguarda científica: ":"Scientific safeguard: ")}</strong>${esc(pt?"os cenários de 10%, 25% e 50% são testes de estresse do serviço de polinização, não probabilidades de risco ou previsões climáticas. As recomendações não implicam compensação de uma porcentagem específica de perda.":"10%, 25% and 50% are pollination-service stress tests, not risk probabilities or climate forecasts. Recommendations do not imply compensation for a specific percentage loss.")}</div>
  <section class="section">
    <h2 class="h">${esc(pt?"Contexto ecológico da área":"Ecological context")}</h2>
    <div class="ctx mt-s">${Q.map(([id,lab,ch])=>`<div><label class="lbl" for="mg_${id}">${esc(lab)}</label><select id="mg_${id}" data-mg="${id}">${ch.map(([v,l])=>`<option value="${v}"${S.mg[id]===v?" selected":""}>${esc(l)}</option>`).join("")}</select></div>`).join("")}</div>
  </section>
  <div id="mgResults">${mgBlock()}</div>`;
}
function mgBlock(){
  const pt = S.lang==="pt", res = mgResults(), eid = exposureId();
  const expLab = {E0:pt?"Muito baixa/personalizada":"Very low/custom",E1:pt?"Menor":"Lower",E2:pt?"Intermediária":"Intermediate",E3:pt?"Maior":"Higher"}[eid];
  const pressures = res.filter(r=>r.score>0).length, high = res.filter(r=>["Very high","High"].includes(r.prio)).length;
  const cls = {"Very high":"p-vh","High":"p-h","Moderate":"p-m","Maintain":"p-k"};
  const cards = res.map(r=>{
    const ev = []; const seen = new Set();
    D.mEv.forEach(e=>{ if(str(e.Management_ID).includes(r.mid) && nz(e.Reference) && !seen.has(e.Evidence_ID)){ seen.add(e.Evidence_ID); ev.push(e);} });
    const panel = "mgp_"+r.mid;
    const srcs = ev.slice(0,6).map(e=>`<div class="src"><strong>${esc(e.Reference)}</strong>
      <div class="meta">${esc((pt?"Tipo: ":"Type: ")+pick(EVTYPE_PT,e.Evidence_type)+" · "+(pt?"Abrangência: ":"Scope: ")+pick(SCOPE_PT,e.Geographic_scope))}</div>
      ${nz(e.DOI)?`<div class="meta">DOI: ${esc(e.DOI)} · <a href="${esc(e.Source_URL)}" target="_blank" rel="noopener">${esc(pt?"Abrir artigo":"Open article")}</a></div>`:""}
      <div class="cav">${esc(pt && CAV_PT[e.Evidence_ID] ? CAV_PT[e.Evidence_ID] : str(e.Caveats))}</div></div>`).join("");
    return `<article class="rec ${cls[r.prio]||""}">
      <div class="prio"><div class="pl">${esc(pt?"Prioridade de manejo":"Management priority")}</div><div class="pv">${esc(pt?r.prioPT:r.prio)}</div><div class="meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
      <div><h3>${esc(pt?r.Action_PT:r.Action)}</h3><div class="strength">${esc((pt?"Força da evidência: ":"Evidence strength: ")+pick(STRENGTH_PT,r.strength))}</div>
        <dl>
          <div><dt>${esc(pt?"Por que foi recomendado":"Why this was recommended")}</dt><dd>${esc(pt?r.ratPT:r.ratEN)}</dd></div>
          <div><dt>${esc(pt?"O que a literatura sustenta":"What the literature supports")}</dt><dd>${esc(BENEFIT[r.mid]?BENEFIT[r.mid][pt?0:1]:"")}</dd></div>
          <div><dt>${esc(pt?"Importante":"Important")}</dt><dd class="caveat">${esc(CAVEAT[r.mid]?CAVEAT[r.mid][pt?0:1]:"")}</dd></div>
        </dl>
        ${ev.length?`<button type="button" class="btn ev-toggle" data-act="mg-toggle" data-panel="${panel}" aria-expanded="false" aria-controls="${panel}">${esc(pt?`Ver evidências científicas (${ev.length})`:`View scientific evidence (${ev.length})`)}</button><div class="ev-panel" id="${panel}" hidden>${srcs}</div>`:`<div class="strength mt-s">0 ${esc(pt?"fontes científicas":"scientific sources")}</div>`}
      </div></article>`;
  }).join("");
  return `<div class="diag">
      <div>${esc(pt?"Cenário econômico ativo":"Active economic scenario")}<b>${S.reduction}% · ${eid}</b></div>
      <div>${esc(pt?"Exposição":"Exposure")}<b>${esc(expLab)}</b></div>
      <div>${esc(pt?"Pressões de manejo identificadas":"Management pressures identified")}<b>${pressures}</b></div>
      <div>${esc(pt?"Ações com prioridade alta ou muito alta":"Actions with high or very high priority")}<b>${high}</b></div>
    </div>
    <p class="sub" style="font-size:14px">${esc(pt?"O cenário vem da aba Cenários.":"The scenario comes from the Scenarios tab.")} <a href="#cenarios">${esc(pt?"Ajustar a redução simulada":"Adjust the simulated reduction")}</a></p>
    <h2 class="h">${esc(pt?"Ações priorizadas":"Prioritized actions")}</h2>
    <div class="recs mt-s">${cards}</div>
    <div class="notice small mt">${esc(pt?"Força da evidência e prioridade de manejo são dimensões independentes. 'Não informado' permanece desconhecido. As recomendações são opções de adaptação baseadas em evidências, não previsões de recuperação ecológica ou econômica.":"Evidence strength and management priority are independent dimensions. 'Unknown' remains unknown. Recommendations are evidence-based adaptation options, not predictions of ecological or economic recovery.")}</div>`;
}

/* ---------- Método ---------- */
function pageMethod(){
  const pt = S.lang==="pt", t = T();
  const eqs = pt ? [
    ["EVP","Valor da produção × DR","Valor econômico da polinização: parcela do valor da produção atribuível à polinização."],
    ["EPV","Valor das exportações × DR","Valor da polinização nas exportações."],
    ["PEDR","EVP / valor total da produção","Razão de dependência econômica da produção."],
    ["EPDR","EPV / valor total das exportações","Razão de dependência econômica das exportações."],
    [L("Perdas","Losses"),"EVP ou EPV × redução simulada","As perdas dos cenários são proporcionais ao percentual de redução informado."]
  ] : [
    ["EVP","Production value × DR","Economic value of pollination: share of production value attributable to pollination."],
    ["EPV","Export value × DR","Export pollination value."],
    ["PEDR","EVP / total production value","Production economic dependence ratio."],
    ["EPDR","EPV / total export value","Export economic dependence ratio."],
    ["Losses","EVP or EPV × simulated reduction","Scenario losses are proportional to the specified reduction."]
  ];
  const M = A().method;
  return `<section class="section">
    <h2 class="h">${esc(M.framework_title)}</h2>
    <div class="reading prose"><p>${esc(M.framework)}</p></div>
    <div class="eqs">${eqs.map(e=>`<div class="eq"><div class="n">${esc(e[0])}</div><div class="f">${esc(e[1])}</div><div class="d">${esc(e[2])}</div></div>`).join("")}</div>
    <div class="reading prose"><p>${esc(t.method_body)}</p></div>
  </section>
  <section class="section split">
    <div>
      <h2 class="h">${esc(M.data_title)}</h2>
      <ul class="list">${M.data.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <div class="formula" style="margin-top:14px">${esc(M.conv)}</div>
    </div>
    <div>
      <h2 class="h">${esc(M.dr_title)}</h2>
      <div class="tbl-wrap mt-s"><table class="tbl"><thead><tr>${M.dr_head.map((h,i)=>`<th class="${i>1?"num":""}">${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${M.dr_rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i>1?"num":""}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="read">${esc(M.dr_note)}</p>
    </div>
  </section>
  <section class="section">
    <h2 class="h">${esc(M.scen_title)}</h2>
    <div class="reading prose"><p>${esc(M.scen)}</p></div>
    <div class="notice warn">${esc(t.scenarios_note)}</div>
  </section>
  <section class="section">
    <h2 class="h">${esc(M.limits_title)}</h2>
    <ul class="list">${M.limits.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
    <div class="reading prose mt-s"><p>${esc(L("A ferramenta estima a dependência econômica da produção e das exportações em relação à polinização e a exposição econômica em cenários hipotéticos de redução desse serviço. Esses resultados não constituem uma medição direta do risco ecológico, da abundância dos polinizadores ou de perdas efetivamente observadas.","The tool estimates the economic dependence of production and exports on pollination and economic exposure under hypothetical reductions in this service. These results do not directly measure ecological risk, pollinator abundance, or actually observed losses."))}</p></div>
  </section>
  <section class="section">
    <h2 class="h">${esc(L("Perspectivas de desenvolvimento","Future development"))}</h2>
    <div class="reading prose">
      <p>${esc(L("A plataforma foi concebida para evoluir à medida que novas pesquisas e bases de dados confiáveis se tornem disponíveis. Futuras versões poderão incorporar indicadores de abundância e diversidade de polinizadores, qualidade e conectividade dos habitats, mudanças no uso da terra, condições climáticas e tendências populacionais.","The platform is designed to evolve as new research and reliable datasets become available. Future versions may incorporate indicators of pollinator abundance and diversity, habitat quality and connectivity, land-use change, climatic conditions, and population trends."))}</p>
      <p>${esc(L("A integração desses indicadores poderá apoiar avaliações mais abrangentes de vulnerabilidade e risco ecológico. Essas funcionalidades ainda não integram o modelo atual e dependerão de dados adequados, validação científica, documentação dos métodos e testes de reprodutibilidade. A base analítica do manuscrito permanecerá identificada e preservada para permitir a reprodução dos resultados publicados.","Integrating these indicators may support broader assessments of vulnerability and ecological risk. These capabilities are not part of the current model and will require suitable data, scientific validation, documented methods, and reproducibility tests. The manuscript's analytical baseline will remain identified and preserved so that published results can be reproduced."))}</p>
    </div>
  </section>
  <section class="section">
    <h2 class="h">${esc(M.glossary_title)}</h2>
    <dl class="gloss-list mt-s">${window.GLOSS[S.lang].map(g=>`<div><dt>${esc(g.t)}</dt><dd>${esc(g.d)}</dd></div>`).join("")}</dl>
  </section>
  <section class="section">
    <h2 class="h">${esc(M.refs_title)}</h2>
    <ul class="refs">${window.REFS.map(r=>`<li>${esc(r[0])}${r[1]?` <a href="${esc(r[1])}" target="_blank" rel="noopener">${esc(r[1].replace("https://doi.org/","doi:"))}</a>`:""}</li>`).join("")}</ul>
  </section>`;
}

/* ---------- Sobre ---------- */
function pageAbout(){
  const pt = S.lang==="pt";
  return `<section class="section reading prose">
    <p>${esc(pt?"O Pollination Risk and Value Tool é uma plataforma científica de código aberto desenvolvida para apoiar a avaliação transparente, reproduzível e transferível da importância econômica dos serviços de polinização em sistemas agrícolas.":"The Pollination Risk and Value Tool is an open-source scientific platform developed to support transparent, reproducible, and transferable assessment of the economic importance of pollination ecosystem services in agricultural systems.")}</p>
  </section>
  <section class="section article-box">
    <h2 class="h">${esc(A().about_article_title)}</h2>
    <div class="reading prose"><p>${esc(A().about_article)}</p></div>
    <h3 class="h mt">${esc(A().about_findings)}</h3>
    <ul class="list">${A().about_list.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
  </section>
  <div class="notice ok mt"><strong>${esc(pt?"Status desta versão. ":"Release status. ")}</strong>${esc(pt?"Esta é a versão 3.0, a versão web da ferramenta. Ela reproduz a V2.41, versão pública congelada que acompanha um manuscrito em revisão por pares, com os mesmos dados, fórmulas e salvaguardas, e acrescenta os jogos educativos. O conjunto analítico 4M continua congelado para reprodutibilidade. O catálogo científico ampliado é complementar, permanece separado do cálculo econômico e poderá receber refinamentos após a aceitação do artigo.":"This is version 3.0, the web version of the tool. It reproduces V2.41, the frozen public release accompanying a manuscript under peer review, with the same data, formulas and safeguards, and adds the educational games. The 4M analytical dataset remains frozen for reproducibility. The expanded scientific catalog is complementary, remains separate from economic calculations, and may receive refinements after article acceptance.")}</div>
  <section class="section split">
    <div><h2 class="h">${esc(pt?"Finalidade científica":"Scientific purpose")}</h2><div class="reading"><p>${esc(pt?"A plataforma integra dados de produção e exportação agrícola, evidências científicas sobre dependência de polinizadores, indicadores de valor e dependência econômica, cenários padronizados de redução do serviço de polinização e recomendações de manejo baseadas em evidências. Sua arquitetura preserva a rastreabilidade das informações utilizadas, incluindo fonte bibliográfica, abrangência geográfica, linhagem da evidência e limitações associadas.":"The platform integrates agricultural production and export data, scientific evidence on pollinator dependence, indicators of economic value and dependence, standardized pollination-service reduction scenarios, and evidence-based management recommendations. Its architecture preserves traceability of the information used, including bibliographic source, geographic scope, evidence lineage, and associated limitations.")}</p></div></div>
    <div><h2 class="h">${esc(pt?"Escopo e interpretação":"Scope and interpretation")}</h2><div class="reading"><p>${esc(pt?"Quando diferentes estimativas científicas estão disponíveis para uma mesma cultura, a plataforma mantém explicitamente a divergência e não substitui automaticamente o coeficiente selecionado pelo usuário. As recomendações de manejo combinam exposição econômica, contexto ecológico informado e literatura científica, sendo apresentadas como opções de adaptação apoiadas por evidências, e não como previsões de recuperação ecológica ou econômica.":"When different scientific estimates are available for the same crop, the platform explicitly retains the divergence and does not automatically replace the coefficient selected by the user. Management recommendations combine economic exposure, reported ecological context, and scientific literature and are presented as evidence-supported adaptation options rather than predictions of ecological or economic recovery.")}</p></div></div>
  </section>
  <div class="formula"><b>${esc(pt?"Princípio de transparência científica. ":"Scientific transparency principle. ")}</b>${esc(pt?"Dependência de polinizadores, limitação atual da polinização, resposta dos polinizadores, produtividade agrícola e retorno econômico são dimensões distintas. A ferramenta não converte automaticamente evidência de uma dimensão em efeito quantitativo sobre outra.":"Pollinator dependence, current pollination limitation, pollinator responses, crop yield, and economic return are distinct dimensions. The tool does not automatically convert evidence from one dimension into a quantitative effect on another.")}</div>
  <section class="section">
    <h2 class="h">${esc(pt?"Desenvolvimento, financiamento e apoio institucional":"Development, funding and institutional support")}</h2>
    <div class="inst">
      <div><div class="role">${esc(pt?"Desenvolvimento e apoio institucional":"Development and institutional support")}</div><div class="name">UFRN</div><div class="full">${esc(pt?"Universidade Federal do Rio Grande do Norte · Brasil":"Federal University of Rio Grande do Norte · Brazil")}</div></div>
      <div><div class="role">${esc(pt?"Fomento à pesquisa":"Research funding")}</div><div class="name">CAPES</div><div class="full">${esc(pt?"Coordenação de Aperfeiçoamento de Pessoal de Nível Superior · Governo Federal do Brasil":"Coordination for the Improvement of Higher Education Personnel · Brazilian Federal Government")}</div></div>
      <div><div class="role">${esc(pt?"Fomento à pesquisa":"Research funding")}</div><div class="name">CNPq</div><div class="full">${esc(pt?"Conselho Nacional de Desenvolvimento Científico e Tecnológico · Governo Federal do Brasil":"National Council for Scientific and Technological Development · Brazilian Federal Government")}</div></div>
    </div>
    <div class="reading prose"><p>${esc(pt?"A pesquisa associada ao desenvolvimento desta plataforma recebeu apoio do Governo Federal do Brasil, por meio da CAPES e do CNPq, com apoio institucional da Universidade Federal do Rio Grande do Norte (UFRN).":"The research associated with the development of this platform received support from the Brazilian Federal Government through CAPES and CNPq, with institutional support from the Federal University of Rio Grande do Norte (UFRN).")}</p></div>
    <p class="sub" style="font-size:14px">${esc(pt?"As instituições financiadoras e de apoio não determinam a seleção das evidências científicas, os coeficientes aplicados, os resultados produzidos pela plataforma ou sua interpretação. Durante o período de defeso eleitoral de 2026, esta versão utiliza identificação institucional textual; a aplicação de marcas oficiais deve seguir as normas vigentes de cada instituição.":"Funding and supporting institutions do not determine the scientific evidence selected, the coefficients applied, the results generated by the platform, or their interpretation. During Brazil's 2026 electoral communication restriction period, this version uses textual institutional identification; application of official marks must follow each institution's current rules.")}</p>
  </section>
  <section class="section">
    <h2 class="h">${esc(pt?"Informações do software":"Software information")}</h2>
    <div class="kv mt-s">
      <div class="k">${esc(pt?"Versão":"Version")}</div><div>${esc(pt?"3.0 · versão web (reproduz a V2.41 de revisão)":"3.0 · web version (reproduces the V2.41 review release)")}</div>
      <div class="k">Status</div><div>${esc(pt?"Manuscrito em revisão por pares · conjunto 4M congelado":"Manuscript under peer review · frozen 4M dataset")}</div>
      <div class="k">${esc(pt?"Natureza":"Nature")}</div><div>${esc(pt?"Software científico de código aberto para apoio à decisão baseado em evidências":"Open-source scientific software for evidence-based decision support")}</div>
      <div class="k">${esc(pt?"Desenvolvimento":"Development")}</div><div>${esc(pt?"Jaqueiuto S. Jorge e colaboradores":"Jaqueiuto S. Jorge and collaborators")}</div>
      <div class="k">ORCID</div><div><a href="https://orcid.org/0000-0003-4887-3647" target="_blank" rel="noopener">Jaqueiuto S. Jorge · 0000-0003-4887-3647</a></div>
      <div class="k">${esc(pt?"Aplicação inicial":"Initial application")}</div><div>${esc(pt?"Sistemas irrigados de produção de frutas no semiárido brasileiro":"Irrigated fruit production systems in the Brazilian semiarid region")}</div>
      <div class="k">${esc(pt?"Licença":"License")}</div><div>${esc(pt?"A definir antes da publicação pública":"To be defined before public release")}</div>
      <div class="k">${esc(pt?"Citação":"Citation")}</div><div>${esc(pt?"A citação formal e o DOI do software serão disponibilizados após o depósito da versão pública no Zenodo.":"The formal citation and software DOI will be provided after deposition of the public release in Zenodo.")}</div>
    </div>
    <div class="links"><a href="https://github.com/jaqueiutoj2010-glitch/Pollination-Risk-and-Value-Tool" target="_blank" rel="noopener">GitHub</a><a href="https://ufrn.br" target="_blank" rel="noopener">UFRN</a><a href="https://www.gov.br/capes/pt-br" target="_blank" rel="noopener">CAPES</a><a href="https://www.gov.br/cnpq/pt-br" target="_blank" rel="noopener">CNPq</a></div>
  </section>`;
}

/* ======================= glossário ======================= */
function renderGloss(){
  const body = document.getElementById("glossBody"); if(!body) return;
  body.innerHTML = `<p class="gloss-intro">${esc(L("Os termos usados na ferramenta, em linguagem simples.","Terms used in the tool, in plain language."))}</p><dl>` +
    window.GLOSS[S.lang].map(g=>`<div class="gloss-item" id="g-${g.id}"><dt>${esc(g.t)}</dt><dd>${esc(g.d)}</dd></div>`).join("") + `</dl>`;
}
let glossReturn = null;
function openGloss(term){
  const g = document.getElementById("gloss"), sc = document.getElementById("glossScrim");
  glossReturn = document.activeElement;
  g.hidden = false; sc.hidden = false; document.body.classList.add("noscroll");
  document.querySelectorAll(".gloss-item.hit").forEach(x=>x.classList.remove("hit"));
  const item = term && document.getElementById("g-"+term);
  if(item){ item.classList.add("hit"); item.scrollIntoView({block:"center"}); } else document.getElementById("glossBody").scrollTop = 0;
  document.getElementById("glossClose").focus();
}
function closeGloss(){
  document.getElementById("gloss").hidden = true; document.getElementById("glossScrim").hidden = true;
  document.body.classList.remove("noscroll");
  if(glossReturn && glossReturn.focus) glossReturn.focus();
}

/* ======================= render ======================= */
function renderMain(){
  const main = document.getElementById("main");
  const page = {painel:pageDashboard, artigo:pageArticle, modelo:pageTemplate, cenarios:pageScenarios, evidencias:pageEvidence, catalogo:pageCatalog, recomendacoes:pageManagement, jogo:()=>window.Game.page(), metodo:pageMethod, sobre:pageAbout}[S.tab];
  main.innerHTML = `<div class="wrap">${page()}</div>`;
}
function renderFooter(){
  const pt = S.lang==="pt";
  document.getElementById("footer").innerHTML = `<div class="wrap">
    <div><b>Pollination Risk and Value Tool</b><p>${esc(pt?"Versão 3.0 · versão web. Reproduz a V2.41, versão pública para revisão por pares.":"Version 3.0 · web version. Reproduces V2.41, the public peer-review release.")}</p><p>${esc(pt?"Os cenários de 10%, 25% e 50% são testes de estresse padronizados, não previsões climáticas nem probabilidades.":"The 10%, 25% and 50% scenarios are standardized stress tests, not climate forecasts or probabilities.")}</p></div>
    <div><b>${esc(pt?"Como citar durante a revisão":"Citation during review")}</b><p>Jorge, J. S. and collaborators. (2026). <i>Pollination Risk and Value Tool</i> (Version 3.0). Web application.</p></div>
    <div><b>${esc(pt?"Apoio":"Support")}</b><p>UFRN · CAPES · CNPq</p><p><a href="https://github.com/jaqueiutoj2010-glitch/Pollination-Risk-and-Value-Tool" target="_blank" rel="noopener">${esc(pt?"Repositório no GitHub":"GitHub repository")}</a></p></div>
  </div>`;
}
function render(){ renderNav(); renderHero(); renderMain(); renderFooter(); }

function toast(msg){ const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove("show"), 3200); }

/* ======================= eventos ======================= */
function setReduction(v){
  S.reduction = Math.max(0,Math.min(100,Math.round(v)));
  if(S.tab==="painel") updateStress();
  if(S.tab==="cenarios"){
    const m = calc(S.d,S.reduction/100);
    document.getElementById("scPct").textContent = S.reduction+"%";
    document.getElementById("scFlow").innerHTML = flowBlock(m, m.evp>0?Math.min(1,m.pl/m.evp):0, m.epv>0?Math.min(1,m.xl/m.epv):0);
    document.querySelectorAll('[data-act="preset"]').forEach(b=>b.setAttribute("aria-pressed", +b.dataset.v===S.reduction));
    const r = document.getElementById("scRange"); if(r && +r.value!==S.reduction) r.value = S.reduction;
  }
}

document.addEventListener("click", e=>{
  if(e.target.closest("#glossBtn")){ openGloss(); return; }
  if(e.target.closest("[data-gloss]")){ e.preventDefault(); document.getElementById("mainnav").classList.remove("open"); openGloss(); return; }
  if(e.target.closest("#glossClose") || e.target.closest("#glossScrim")){ closeGloss(); return; }
  const ib = e.target.closest(".info[data-term]");
  if(ib){ e.preventDefault(); openGloss(ib.dataset.term); return; }
  const gh = e.target.closest('[data-act="goto-how"]');
  if(gh){ e.preventDefault(); S.open.how = true; const fd = document.querySelector('[data-fold="how"]'); if(fd) fd.open = true; const h = document.getElementById("howTitle"); if(h){ h.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}); } return; }
  const lb = e.target.closest(".lang-btn");
  if(lb){ S.lang = lb.dataset.lang; localStorage_set("prvt_lang", S.lang); render(); return; }
  if(e.target.closest("#menuToggle")){ const n = document.getElementById("mainnav"), o = n.classList.toggle("open"); e.target.setAttribute("aria-expanded",o); return; }
  const pg = e.target.closest("[data-tpage]");
  if(pg){ const st = S.tables[pg.dataset.tpage]; st.page += +pg.dataset.dir; rerenderTables(); return; }
  const tr = e.target.closest("tr.selectable");
  if(tr && tr.dataset.table==="catRec"){ S.cat.uid = tr.dataset.rowKey; refreshCat(); return; }
  const b = e.target.closest("[data-act]");
  if(!b || b.tagName==="INPUT") return;
  const a = b.dataset.act;
  if(a.indexOf("g-")===0){ if(window.Game) window.Game.act(a,b); return; }
  if(a==="restore") restore();
  else if(a==="dash-all"){ S.dashCrop=""; renderMain(); }
  else if(a==="dash-crop"){ S.dashCrop = b.dataset.crop; renderMain(); }
  else if(a==="article-crop"){ S.articleCrop = b.dataset.crop; renderMain(); }
  else if(a==="ev-crop"){ S.evidenceCrop = b.dataset.crop; renderMain(); }
  else if(a==="apply-article"){
    const crop = S.articleCrop, q = evFor(crop).filter(r=>isNum(r.DR)), j = +document.getElementById("articleEvidence").value;
    const row = S.d.find(r=>r.Crop===crop);
    if(q[j] && row){ row.Pollination_Dependence = q[j].DR; row.Evidence_Reference = q[j].Reference; renderMain(); toast(L("Evidência aplicada.","Evidence applied.")); }
  }
  else if(a==="apply-evidence"){
    const crop = S.evidenceCrop, q = selectable(evFor(crop)), j = +document.getElementById("evChoice").value;
    const row = S.d.find(r=>r.Crop===crop);
    if(q[j] && row){ Object.assign(row,{Pollination_Dependence:q[j].DR, Evidence_Reference:q[j].Reference, Evidence_ID:q[j].Evidence_ID, Evidence_DOI:q[j].DOI, Evidence_Source_ID:q[j].Source_ID, Evidence_Scope:q[j].Geographic_scope}); renderMain(); toast(L("Evidência aplicada.","Evidence applied.")); }
  }
  else if(a==="preset") setReduction(+b.dataset.v);
  else if(a==="apply-import"){
    if(!(S.imp && S.imp.ok)) return;
    S.d = S.imp.data.map(r=>Object.assign({},r)); S.source="import"; S.dashCrop=""; S.evidenceCrop=S.d[0].Crop; S.articleCrop=S.d[0].Crop;
    location.hash = "#painel"; render(); toast(T().import_applied);
  }
  else if(a==="clear-import"){ S.imp = null; renderMain(); }
  else if(a==="load-demo"){
    fetch(DATA+"DEMONSTRACAO_QUATRO_CULTURAS_NAO_CITAR.csv").then(r=>{ if(!r.ok) throw new Error(r.status); return r.text(); })
      .then(txt=>readUpload(new File([txt], L("exemplo_demonstracao_nao_citar.csv","sample_demo_do_not_cite.csv"), {type:"text/csv"})))
      .catch(()=>toast(L("Não foi possível carregar a tabela de exemplo.","The sample table could not be loaded.")));
  }
  else if(a==="cat-mode"){ S.cat.mode = b.dataset.v; document.querySelectorAll('[data-act="cat-mode"]').forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===S.cat.mode)); refreshCat(); }
  else if(a==="cat-export") exportCat();
  else if(a==="mg-toggle"){
    const p = document.getElementById(b.dataset.panel), open = !p.hidden; p.hidden = open; b.setAttribute("aria-expanded", !open);
    const n = p.querySelectorAll(".src").length;
    b.textContent = open ? L(`Ver evidências científicas (${n})`,`View scientific evidence (${n})`) : L("Ocultar evidências científicas","Hide scientific evidence");
  }
});
document.addEventListener("keydown", e=>{
  if(e.key==="Escape" && !document.getElementById("gloss").hidden){ closeGloss(); return; }
  const tr = e.target.closest && e.target.closest("tr.selectable");
  if(tr && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); tr.click(); }
  const td = e.target.closest && e.target.closest("[data-edit]");
  if(td && e.key==="Enter"){ e.preventDefault(); td.blur(); }
});
function rerenderTables(){
  if(S.tab==="catalogo") refreshCat();
  else renderMain();
}
let catTimer;
document.addEventListener("input", e=>{
  const el = e.target;
  if(el.dataset.act==="reduction") setReduction(+el.value);
  else if(el.id==="catQ"){ S.cat.q = el.value; clearTimeout(catTimer); catTimer = setTimeout(()=>{ resetCatPages(); refreshCat(); }, 180); }
  else if(el.dataset.tsearch){
    const id = el.dataset.tsearch; S.tables[id].q = el.value; S.tables[id].page = 0;
    clearTimeout(catTimer); catTimer = setTimeout(()=>{
      const pos = el.selectionStart; rerenderTables();
      const n = document.querySelector(`[data-tsearch="${id}"]`); if(n){ n.focus(); try{n.setSelectionRange(pos,pos);}catch(_){} }
    }, 200);
  }
});
function resetCatPages(){ ["catSyn","catMeta","catStudies","catStudy1","catRec"].forEach(k=>{ if(S.tables[k]) S.tables[k].page=0; }); }
document.addEventListener("change", e=>{
  const el = e.target;
  if(el.id==="catFonte"){ S.cat.fonte = el.value; resetCatPages(); refreshCat(); }
  else if(el.id==="catTipo"){ S.cat.tipo = el.value; resetCatPages(); refreshCat(); }
  else if(el.id==="catRel"){ S.cat.related = el.checked; resetCatPages(); refreshCat(); }
  else if(el.id==="catStudy"){ S.cat.study = el.value; if(S.tables.catStudy1) S.tables.catStudy1.page=0; refreshCat(); }
  else if(el.id==="catUid"){
    S.cat.uid = el.value;
    const x = catFiltered(), i = x.findIndex(r=>r.UID===S.cat.uid);
    if(i>=0 && S.tables.catRec) S.tables.catRec.page = Math.floor(i/15);
    refreshCat();
  }
  else if(el.dataset.mg){ S.mg[el.dataset.mg] = el.value; document.getElementById("mgResults").innerHTML = mgBlock(); }
  else if(el.id==="cropUpload" && el.files[0]) readUpload(el.files[0]);
});
document.addEventListener("focusout", e=>{
  const td = e.target.closest && e.target.closest("[data-edit]");
  if(!td) return;
  const i = +td.dataset.edit, k = td.dataset.field;
  const v = toNum(td.textContent.trim().replace(",","."));
  if(!isNum(v)){ td.textContent = isNum(S.d[i][k]) ? String(S.d[i][k]) : ""; return; }
  const nv = k==="Pollination_Dependence" ? Math.max(0,Math.min(1,v)) : v;
  if(nv===S.d[i][k]){ td.textContent = String(nv); return; }
  S.d[i][k] = nv;
  setTimeout(renderMain, 0);
});
// arrastar e soltar arquivo
document.addEventListener("dragover", e=>{ const d = e.target.closest && e.target.closest("#drop"); if(d){ e.preventDefault(); d.classList.add("over"); } });
document.addEventListener("dragleave", e=>{ const d = e.target.closest && e.target.closest("#drop"); if(d) d.classList.remove("over"); });
document.addEventListener("drop", e=>{ const d = e.target.closest && e.target.closest("#drop"); if(d){ e.preventDefault(); d.classList.remove("over"); if(e.dataTransfer.files[0]) readUpload(e.dataTransfer.files[0]); } });

document.addEventListener("toggle", e=>{ const d = e.target; if(d && d.dataset && d.dataset.fold) S.open[d.dataset.fold] = d.open; }, true);
window.addEventListener("hashchange", ()=>{
  readHash(); document.getElementById("mainnav").classList.remove("open");
  render(); window.scrollTo(0,0);
});

let narrowNow = window.innerWidth<640;
window.addEventListener("resize", ()=>{ const n = window.innerWidth<640; if(n!==narrowNow && D.article){ narrowNow=n; if(["painel","cenarios"].includes(S.tab)) renderMain(); } });

/* ======================= jogo educativo ======================= */
if(window.Game) window.Game.init({S, calc, money, fmt1, fmt2, isNum, L, esc, cropIcon, infoBtn, fold, toast, getD:()=>D, renderMain, loadCatalog});

/* ======================= início ======================= */
readHash();
renderNav();
loadCore().then(render).catch(err=>{
  renderNav(); renderFooter();
  document.getElementById("hero").innerHTML = "";
  document.getElementById("main").innerHTML = `<div class="wrap"><div class="data-missing"><h2 class="h">${esc(L("Os dados não foram encontrados","Data files were not found"))}</h2>
    <p>${esc(L("O site lê os arquivos CSV da pasta","The site reads CSV files from the folder"))} <code>data/</code>. ${esc(L("Copie para ela os arquivos de shiny-app/data/ do repositório e publique novamente.","Copy the files from the repository's shiny-app/data/ into it and publish again."))}</p>
    <p style="color:var(--muted);font-size:14px">${esc(L("Detalhe técnico: ","Technical detail: ")+err.message)}</p>
    <p style="color:var(--muted);font-size:14px">${esc(L("Ao abrir o index.html direto do computador (file://), o navegador bloqueia a leitura dos CSV. Use um servidor local ou o Cloudflare Pages.","Opening index.html directly from disk (file://) blocks CSV reading. Use a local server or Cloudflare Pages."))}</p></div></div>`;
});
})();
