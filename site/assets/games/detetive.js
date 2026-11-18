/* Detetive de Evidências — posto de controle dos números que entram na calculadora.
   A resposta certa de cada ficha é o estado registrado nos próprios dados da plataforma:
   base de evidências verificada (LIBERADO), catálogo v30 (portão de uso, estado taxonômico),
   registro de fontes (dados derivados e bases de campo) e a planilha de demonstração (não citar).
   Fichas "sem fonte" do dia 1 são de treino, inventadas para ensinar a primeira regra. */
(function(){
"use strict";
let X = null; const CM = () => window.Colmeia;
const L = (pt,en) => X.L(pt,en), esc = s => X.esc(s);
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const fmtDR = v => v==null||v==="" ? "—" : CM().num(+v,2);

const SYN = {"Lycopersicon esculentum":"Solanum lycopersicum","Pyrus malus":"Malus domestica","Musa sapientum":"Musa × paradisiaca","Amygdalus communis":"Prunus dulcis","Eugenia malaccensis":"Syzygium malaccense","Sesamum orientale":"Sesamum indicum"};
const STAMPS = {L:{pt:"LIBERADO",en:"CLEARED",c:"#4C8C4A"}, A:{pt:"EM ANÁLISE",en:"UNDER REVIEW",c:"#D9902A"}, B:{pt:"BARRADO",en:"BLOCKED",c:"#7D776E"}};

const RULES = [
  {d:1, pt:"Referência conferida, nome científico válido e fonte original: LIBERADO.", en:"Checked reference, valid scientific name and original source: CLEARED."},
  {d:1, pt:"Valor sem referência não entra: BARRADO.", en:"A value without a reference does not get in: BLOCKED."},
  {d:2, pt:"Nome científico ainda não validado (revisão taxonômica pendente): EM ANÁLISE.", en:"Scientific name not yet validated (pending taxonomic review): UNDER REVIEW."},
  {d:3, pt:"Dado derivado precisa apontar a fonte original. Com a ficha-mãe verificada, vale o número da original; sem ela, BARRADO.", en:"Derived data must point to the original source. With a verified parent record, the original's number stands; without it, BLOCKED."},
  {d:3, pt:"Métrica de campo não vira coeficiente de dependência: BARRADO.", en:"A field metric does not become a dependence coefficient: BLOCKED."},
  {d:4, pt:"Dependência desconhecida ou conteúdo ainda não conferido: EM ANÁLISE. Ciência também diz \"ainda não sabemos\".", en:"Unknown dependence or content not yet checked: UNDER REVIEW. Science also says \"we don't know yet\"."},
  {d:4, pt:"Experimento isolado ou categoria qualitativa não é coeficiente: BARRADO.", en:"A single experiment or a qualitative class is not a coefficient: BLOCKED."},
  {d:5, pt:"Dados de demonstração nunca entram, por mais bonitos que sejam os números.", en:"Demonstration data never gets in, however neat the numbers look."}
];
const DAYS = [
  {d:1, mix:["R","R","R","N","N"], t_pt:"Primeiro dia no posto", t_en:"First day at the post"},
  {d:2, mix:["R","T","T","T","N","R"], t_pt:"Nomes trocados", t_en:"Swapped names"},
  {d:3, mix:["R","DOK","DOK","DNL","CP","T"], t_pt:"A ficha-mãe", t_en:"The parent record"},
  {d:4, mix:["R","U","U","BP","K","S","T"], t_pt:"Casos ambíguos", t_en:"Ambiguous cases"},
  {d:5, mix:["R","T","S","N","K"], final:true, t_pt:"O caso final", t_en:"The final case"}
];

/* ---------- fichas a partir dos dados ---------- */
const F = (k, label, v, hid, clue) => ({k, label, v, hid:!!hid, clue});
function cropName(r){ return X.S.lang==="pt" ? (r.Crop_PT||r.Crop) : r.Crop; }
function catName(r){ return (X.S.lang==="pt" ? r["Nome comum (PT)"] : r["Common name (EN)"]) || "—"; }
const lit = r => String(r["Nome literal"]||"").replace(/[,\s]+$/,"");
function makers(){
  const D = X.getD(), ev = (D.evidence||[]).filter(r=>X.isNum(r.DR) && /yes/i.test(r.Selectable_for_calculation||"Yes") && /verified/i.test(r.Validation_status||"Verified"));
  const cat = D.cat || [];
  const gia = cat.filter(r=>r.Fonte==="Giannini" && /pontual/.test(r.Tipo) && !/^V18/.test(r.UID));
  const giaSyn = gia.filter(r=>Object.keys(SYN).some(s=>lit(r).startsWith(s)));
  const unk = cat.filter(r=>/desconhecida/i.test(r.Tipo||""));
  const kle = cat.filter(r=>r.Fonte==="Klein");
  const sio = cat.filter(r=>r.Fonte==="Siopa");
  const klein = ev.filter(r=>/klein/i.test(r.Reference||""));
  const R = () => { const r = rnd(ev); return {stamp:"L", dr:r.DR, ref:r.DR, crop:cropName(r), fields:[F("c",L("Cultura","Crop"),cropName(r)), F("s",L("Nome científico","Scientific name"),r.Scientific_name), F("v","DR",fmtDR(r.DR)), F("f",L("Fonte","Source"),r.Reference+(r.DOI?" · doi:"+r.DOI:"")),
      F("o",L("Origem","Origin"),L("Publicação original","Original publication"),1), F("n",L("Nome validado?","Name validated?"),L("Sim, conferido","Yes, checked"),1), F("r",L("Referência conferida?","Reference checked?"),L("Sim, verificada","Yes, verified"),1)],
      why:L(`${cropName(r)}, ${r.Reference}: fonte original verificada, com DOI e nome conferido. Podia entrar.`,`${cropName(r)}, ${r.Reference}: verified original source, with DOI and checked name. It could get in.`)}; };
  const N = () => { const r = rnd(ev); const src = rnd([L("Postagem em rede social","Social media post"),L("Planilha sem autor","Spreadsheet with no author"),L("\"Todo mundo sabe\"","\"Everybody knows\""),"—"]);
    const dr = rnd([.95,.65,.25,.05].filter(x=>Math.abs(x-r.DR)>.01)); return {stamp:"B", train:true, dr, ref:r.DR, crop:cropName(r), fields:[F("c",L("Cultura","Crop"),cropName(r)), F("s",L("Nome científico","Scientific name"),r.Scientific_name), F("v","DR",fmtDR(dr)), F("f",L("Fonte","Source"),src),
      F("o",L("Origem","Origin"),L("Desconhecida","Unknown"),1), F("r",L("Referência conferida?","Reference checked?"),L("Não há referência para conferir","There is no reference to check"),1,true)],
      why:L(`A ficha de ${cropName(r)} trazia como fonte "${src}". Sem referência, não entra.`,`The ${cropName(r)} record cited "${src}". Without a reference, it doesn't get in.`)}; };
  const T = (pool) => { const r = rnd(pool && pool.length ? pool : gia); const nm = lit(r), syn = Object.keys(SYN).find(s=>nm.startsWith(s));
    return {stamp:"A", dr:+r["Valor numérico"], crop:catName(r), fields:[F("c",L("Cultura","Crop"),catName(r)), F("s",L("Nome científico","Scientific name"),nm), F("v","DR",fmtDR(r["Valor numérico"])), F("f",L("Fonte","Source"),"Giannini et al. (2015), "+L("Tabela 1","Table 1")+" · UID "+r.UID),
      F("t",L("Estado taxonômico","Taxonomic status"),r["Estado taxonômico"]+(syn?" — "+L(`nome antigo; o aceito hoje é ${SYN[syn]}`,`old name; the accepted one today is ${SYN[syn]}`):""),1,true), F("r",L("Referência conferida?","Reference checked?"),L("Transcrição da Tabela 1 conferida","Table 1 transcription checked"),1)],
      why:L(`${nm} (UID ${r.UID}): a referência existe, mas o nome científico ainda está em revisão taxonômica${syn?`, e é um nome antigo (hoje ${SYN[syn]})`:""}. O certo era EM ANÁLISE.`,`${nm} (UID ${r.UID}): the reference exists, but the scientific name is still under taxonomic review${syn?`, and it's an old name (now ${SYN[syn]})`:""}. The right call was UNDER REVIEW.`)}; };
  const DOK = () => { const r = rnd(klein.length?klein:ev); return {stamp:"L", mother:[F("c",L("Cultura","Crop"),cropName(r)), F("v","DR",fmtDR(r.DR)), F("f",L("Fonte","Source"),r.Reference+" · doi:"+r.DOI), F("o",L("Estado","Status"),L("Original, verificada","Original, verified"))],
      fields:[F("c",L("Cultura","Crop"),cropName(r)), F("s",L("Nome científico","Scientific name"),r.Scientific_name), F("v","DR",fmtDR(r.DR)), F("f",L("Fonte","Source"),"EU Pollinator Hub — Pollination_dependency (PLLNT11.PLLNT76.0)"),
      F("o",L("Origem","Origin"),L("Derivada","Derived"),1,true), F("l",L("Linhagem","Lineage"),"KLEIN2007 → "+L("ficha-mãe grampeada atrás","parent record stapled behind"),1,true)],
      why:L(`A ficha de ${cropName(r)} vinha de uma base derivada, mas apontava a original verificada (Klein et al., 2007). Vale o número da original, que não conta como evidência nova. Podia entrar.`,`The ${cropName(r)} record came from a derived database but pointed to the verified original (Klein et al., 2007). The original's number stands and does not count as new evidence. It could get in.`)}; };
  const DNL = () => { const r = rnd(ev), fake = rnd([.95,.65,.25].filter(x=>Math.abs(x-r.DR)>.01)); return {stamp:"B", train:true, dr:fake, ref:r.DR, crop:cropName(r), fields:[F("c",L("Cultura","Crop"),cropName(r)), F("v","DR",fmtDR(fake)), F("f",L("Fonte","Source"),L("Base agregada de dependência de culturas (sem identificador)","Aggregated crop-dependence database (no identifier)")),
      F("o",L("Origem","Origin"),L("Derivada","Derived"),1,true), F("l",L("Linhagem","Lineage"),L("Não informada","Not reported"),1,true)],
      why:L(`A ficha de ${cropName(r)} era derivada e não dizia de qual publicação veio. Sem ficha-mãe, não entra.`,`The ${cropName(r)} record was derived and didn't say which publication it came from. No parent record, no entry.`)}; };
  const CP = () => { const r = rnd(ev); return {stamp:"B", fields:[F("c",L("Cultura","Crop"),cropName(r)), F("v",L("Valor","Value"),L("produtividade com e sem polinizadores em um campo","yield with and without pollinators in one field")), F("f",L("Fonte","Source"),"CropPol · doi:10.5281/zenodo.4311291"),
      F("o",L("Tipo","Type"),L("Métrica de campo","Field metric"),1,true), F("p",L("Regra da fonte","Source rule"),L("Não converter métricas de campo em coeficiente","Do not convert field metrics into a coefficient"),1,true)],
      why:L("CropPol é uma base de dados de campo valiosa, mas a própria regra da plataforma impede converter uma métrica de campo em coeficiente de dependência.","CropPol is a valuable field database, but the platform's own rule forbids turning a field metric into a dependence coefficient.")}; };
  const U = () => { const r = rnd(unk); return {stamp:"A", fields:[F("c",L("Cultura","Crop"),catName(r)), F("s",L("Nome científico","Scientific name"),lit(r)), F("v","DR","—"), F("f",L("Fonte","Source"),"Giannini et al. (2015) · UID "+r.UID),
      F("t",L("Tipo","Type"),r.Tipo,1,true), F("u",L("Uso de DR","DR use"),r["Uso de DR"],1)],
      why:L(`${lit(r)}: a síntese registra que a dependência é desconhecida. Não é zero e não é barrado; é "ainda não sabemos": EM ANÁLISE.`,`${lit(r)}: the synthesis records the dependence as unknown. It isn't zero and it isn't blocked; it's "we don't know yet": UNDER REVIEW.`)}; };
  const BP = () => { const r = rnd(ev); return {stamp:"A", fields:[F("c",L("Cultura","Crop"),cropName(r)), F("v","DR",L("a conferir","to be checked")), F("f",L("Fonte","Source"),"BPBES/REBIPP · doi:10.5281/zenodo.10691993"),
      F("r",L("Conteúdo conferido?","Content checked?"),L("Linha restrita, conteúdo exato ainda não visto","Restricted row, exact content not yet seen"),1,true)],
      why:L("A base BPBES/REBIPP é confiável, mas a regra da plataforma só aceita linhas depois de conferir o conteúdo exato. Até lá: EM ANÁLISE.","The BPBES/REBIPP database is reliable, but the platform's rule only accepts rows after checking their exact content. Until then: UNDER REVIEW.")}; };
  const K = () => { const r = rnd(kle); return {stamp:"B", fields:[F("c",L("Cultura","Crop"),catName(r)), F("s",L("Nome científico","Scientific name"),lit(r)), F("v",L("Valor","Value"),L("classe de dependência","dependence class")), F("f",L("Fonte","Source"),"Klein et al. (2007) · UID "+r.UID),
      F("t",L("Tipo","Type"),r.Tipo,1,true), F("p",L("Portão de uso","Use gate"),r["Portão de uso"],1,true)],
      why:L(`${lit(r)}: o registro é uma categoria qualitativa. O catálogo proíbe convertê-la em coeficiente pontual.`,`${lit(r)}: the record is a qualitative class. The catalog forbids converting it into a point coefficient.`)}; };
  const S = () => { const r = rnd(sio); return {stamp:"B", dr:+r["Valor numérico"], crop:catName(r), fields:[F("c",L("Cultura","Crop"),catName(r)), F("s",L("Nome científico","Scientific name"),lit(r)), F("v",L("Valor","Value"),fmtDR(r["Valor numérico"])), F("f",L("Fonte","Source"),"Siopa et al. · UID "+r.UID),
      F("t",L("Tipo","Type"),r.Tipo,1,true), F("p",L("Portão de uso","Use gate"),r["Portão de uso"],1,true)],
      why:L(`${lit(r)} (${CM().num(+r["Valor numérico"],2)}): é o resultado de um único experimento, não um coeficiente de dependência da cultura.`,`${lit(r)} (${CM().num(+r["Valor numérico"],2)}): it is the result of a single experiment, not a crop dependence coefficient.`)}; };
  return {R, N, T:()=>T(Math.random()<.6?giaSyn:gia), DOK, DNL, CP, U, BP, K, S};
}
let demoRow = null;
function loadDemo(){ if(demoRow) return Promise.resolve(demoRow);
  return fetch("data/DEMONSTRACAO_QUATRO_CULTURAS_NAO_CITAR.csv").then(r=>r.text()).then(t=>{ const d = Papa.parse(t.replace(/^﻿/,""),{header:true,skipEmptyLines:true}).data; demoRow = d[0]; return demoRow; }).catch(()=>null); }
function finalCase(){
  const r = demoRow || {Crop:"Coffee",Crop_PT:"Café",Scientific_name:"Coffea arabica",Year:"2024",Location:"DEMONSTRATION ONLY",Production_1000_t:"100",Production_Value_USD_M:"100",Pollination_Dependence:"0.25",Evidence_Reference:"Klein et al. (2007)",Notes:"FICTITIOUS ECONOMIC DATA - DO NOT CITE"};
  return {stamp:"B", final:true, fine:r.Notes, fields:[F("c",L("Cultura","Crop"),X.S.lang==="pt"?r.Crop_PT:r.Crop), F("s",L("Nome científico","Scientific name"),r.Scientific_name), F("v","DR",fmtDR(r.Pollination_Dependence)), F("f",L("Fonte do DR","DR source"),r.Evidence_Reference),
      F("e",L("Produção / valor","Production / value"),`${r.Production_1000_t} ${X.S.lang==="pt"?"mil t":"kt"} · US$ ${r.Production_Value_USD_M} M (${r.Year})`), F("o",L("Origem da planilha","Spreadsheet origin"),L("Planilha de demonstração da plataforma","The platform's demonstration spreadsheet"),1,true), F("l",L("Local","Location"),r.Location,1,true)],
    why:L("Os números eram redondos demais e a letra miúda dizia: dados econômicos fictícios, não citar. Era a planilha de demonstração.","The numbers were too round and the fine print said: fictitious economic data, do not cite. It was the demonstration spreadsheet.")};
}

/* ---------- por que importa ---------- */
const isN = v => typeof v==="number" && !isNaN(v);
function impact(c, got){
  const M = v => "US$ "+CM().num(100*v,0)+" M";
  if(got===c.stamp) return {L:L("Esse número pode entrar na conta com segurança.","This number can safely go into the calculation."),
    A:L("Ele fica guardado até a conferência terminar, e a conta não usa um número duvidoso.","It waits until the check is done, and the calculation doesn't use a doubtful number."),
    B:L("A conta ficou protegida de um número que não devia entrar.","The calculation is protected from a number that shouldn't get in.")}[got];
  if(c.stamp==="L") return got==="A" ? L("Um número confiável ficou parado na fila de revisão sem precisar, e a conta ficou sem ele.","A reliable number sat in the review queue for no reason, and the calculation went without it.")
    : L("Um número confiável ficou de fora e a calculadora perdeu esse dado.","A reliable number was left out and the calculator lost that data.");
  if(got==="L"){
    if(c.final) return L("O relatório passaria a citar US$ 100 milhões de café que não existem.","The report would cite US$ 100 million of coffee that doesn't exist.");
    if(isN(c.dr) && isN(c.ref) && Math.abs(c.dr-c.ref)>.001) return L(`Para cada US$ 100 M de ${c.crop.toLowerCase()} produzidos, a calculadora diria que ${M(c.dr)} dependem de polinizadores, quando o número verificado dá ${M(c.ref)}.`,`For every US$ 100 M of ${c.crop.toLowerCase()} produced, the calculator would say ${M(c.dr)} depend on pollinators, when the verified number gives ${M(c.ref)}.`);
    if(isN(c.dr)) return L(`Para cada US$ 100 M de produção, a calculadora usaria ${M(c.dr)} sem saber se esse número vale para a cultura.`,`For every US$ 100 M of production, the calculator would use ${M(c.dr)} without knowing if that number holds for the crop.`);
    return L("Algo que não é um coeficiente entraria na conta como se fosse.","Something that isn't a coefficient would enter the calculation as if it were.");
  }
  if(c.stamp==="B") return L("Não entrou na conta, mas ficaria esperando uma revisão que nunca vai liberá-la.","It stayed out of the calculation, but it would wait for a review that will never clear it.");
  return L("Não entrou na conta, mas foi descartada de vez; depois da conferência, talvez pudesse ser usada.","It stayed out of the calculation, but it was thrown away for good; after the check, it might have been usable.");
}
const MISSION = () => L("Sua missão: só deixar entrar na calculadora números com procedência.","Your mission: only let numbers with a known origin into the calculator.");
function whyBox(){
  const m = (X.getD().article||[]).find(r=>r.Crop==="Melon"); if(!m) return "";
  const P = m.Production_Value, dr = m.Pollination_Dependence, ok = P*dr, bad = P*.25, f = v=>"US$ "+CM().num(v,1)+" M";
  return `<div class="dt-why"><h4>${esc(L("Por que isso importa","Why it matters"))}</h4>
    <p>${esc(L(`A calculadora multiplica o valor da produção pelo coeficiente de dependência (DR). O melão vale ${f(P)}. Com o DR verificado (${CM().num(dr,2)}), ${f(ok)} dependem das abelhas. Se um DR errado de 0,25 passasse pelo posto, a conta diria ${f(bad)}: um erro de ${f(ok-bad)}.`,`The calculator multiplies production value by the dependence coefficient (DR). Melon is worth ${f(P)}. With the verified DR (${CM().num(dr,2)}), ${f(ok)} depend on bees. If a wrong DR of 0.25 got past the post, the calculation would say ${f(bad)}: an error of ${f(ok-bad)}.`))}</p>
    <ul class="dt-legend">${Object.entries(STAMPS).map(([k,s])=>`<li><b style="--c:${s.c}">${esc(L(s.pt,s.en))}</b> ${esc({L:L("fonte original e conferida: entra na conta.","original, checked source: it goes into the calculation."),A:L("pode servir, mas falta conferir algo. Ainda não entra.","might be usable, but something still needs checking. Not in yet."),B:L("não pode entrar, como valor sem fonte ou dado de demonstração.","can't get in, like a value with no source or demo data.")}[k])}</li>`).join("")}</ul></div>`;
}

/* ---------- estado ---------- */
let G = null;
function st(){ if(!G){ let max = 1; try{ max = +(localStorage.getItem("cm-det-max")||1) || 1; }catch(_){} G = {phase:"office", day:1, max, cases:[], i:0, res:[], lupa:false, seen:{}}; } return G; }
function startDay(d){
  const g = st(), M = makers(), D = DAYS[d-1]; g.fb = null;
  g.day = d; g.cases = shuffle(D.mix).map(k=>M[k]()); if(D.final) g.cases.push(finalCase());
  g.i = 0; g.res = []; g.lupa = false; g.seen = {}; g.phase = "brief";
}

/* ---------- desenho ---------- */
function desk(inner, cls){ return `<div class="dt-desk ${cls||""}" id="dtDesk"><div class="dt-window" aria-hidden="true"><i></i><i></i><i></i></div><div class="dt-lamp" aria-hidden="true"></div>${inner}</div>`; }
function manual(day){
  return `<aside class="dt-manual" aria-label="${esc(L("Manual do Portão","Gate Manual"))}"><h4>${esc(L("Manual do Portão","Gate Manual"))}</h4><ol>${RULES.filter(r=>r.d<=day).map(r=>`<li class="${r.d===day&&day>1?"new":""}">${esc(L(r.pt,r.en))}</li>`).join("")}</ol></aside>`;
}
function paperCard(c, idx, g){
  const fields = c.fields.map((f,j)=>{ const key = idx+"-"+j, shown = !f.hid || g.seen[key];
    return `<div class="dt-f${f.clue&&shown?" clue":""}"><span>${esc(f.label)}</span>${shown?`<b class="${g.found&&g.found===key?"just":""}">${esc(f.v)}</b>`:`<span class="dt-secret" role="button" tabindex="0" data-act="g-dt-look" data-v="${key}" aria-label="${esc(L("Pista escondida: examine com a lupa","Hidden clue: examine with the magnifier"))}"><span class="dt-secret-txt" aria-hidden="true">${esc(f.v)}</span></span>`}</div>`; }).join("");
  const mother = c.mother ? `<div class="dt-paper dt-mother"><span class="dt-tag">${esc(L("Ficha-mãe","Parent record"))}</span>${c.mother.map(f=>`<div class="dt-f"><span>${esc(f.label)}</span><b>${esc(f.v)}</b></div>`).join("")}</div><svg class="dt-string" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><path d="M5 10C40 50 60 0 95 45" stroke="#B3261E" stroke-width="2" fill="none"/><circle cx="5" cy="10" r="3" fill="#B3261E"/><circle cx="95" cy="45" r="3" fill="#B3261E"/></svg>` : "";
  return `<div class="dt-cards${c.mother?" has-mother":""}">${mother}<article class="dt-paper" id="dtPaper"><span class="dt-clip" aria-hidden="true"></span>
    <header><span>${esc(L("Ficha de evidência","Evidence record"))}</span><b>#${String(g.day).padStart(2,"0")}-${String(idx+1).padStart(2,"0")}</b></header>
    ${fields}${c.fine?`<p class="dt-fine">${esc(c.fine)}</p>`:""}${g.fb?`<div class="dt-imprint still" style="--c:${STAMPS[g.fb.got].c};--r:${g.fb.r}">${esc(L(STAMPS[g.fb.got].pt,STAMPS[g.fb.got].en))}</div>`:""}</article></div>`;
}
const LUPA_SVG = '<svg class="dt-lupa-ico" viewBox="0 0 40 40" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="rgba(200,230,255,.55)" stroke="#8A5A3C" stroke-width="4"/><path d="M24 24l11 11" stroke="#5B3A24" stroke-width="6" stroke-linecap="round"/><path d="M10 12a7 7 0 0 1 6-5" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
function clueCount(c, g){ const keys = c.fields.map((f,j)=>f.hid?g.i+"-"+j:null).filter(Boolean); const n = keys.filter(k=>g.seen[k]).length;
  return `${esc(L("Pistas","Clues"))} <b>${n}/${keys.length}</b>${n===keys.length&&keys.length?" ✓":""}`; }
function feedback(c, g){
  const ok = g.fb.ok, last = g.i+1>=g.cases.length;
  return `<div class="dt-fb ${ok?"ok":"no"}" role="status">${CM().jandi(ok?"cheer":"cross")}<div>
    <h4>${esc(ok?L("Carimbo certo!","Right stamp!"):L(`Não era bem isso. O carimbo certo era ${STAMPS[c.stamp].pt}.`,`Not quite. The right stamp was ${STAMPS[c.stamp].en}.`))}</h4>
    <p>${esc(c.why)}</p>
    <p class="dt-impact"><b>${esc(L("Na calculadora: ","In the calculator: "))}</b>${esc((t=>t.charAt(0).toLowerCase()+t.slice(1))(impact(c, g.fb.got)))}</p>
    <button type="button" class="cm-big" data-act="g-dt-next">${esc(last?L("Ver o jornal do dia","See the day's paper"):L("Próxima ficha","Next record"))}</button></div></div>`;
}
function stamps(){ return `<div class="dt-stamps" role="group" aria-label="${esc(L("Carimbos","Stamps"))}">${Object.entries(STAMPS).map(([k,s])=>`<button type="button" class="dt-stamp" data-act="g-dt-stamp" data-v="${k}" style="--c:${s.c}"><span>${esc(L(s.pt,s.en))}</span></button>`).join("")}</div>`; }
function body(){
  const g = st();
  if(!X.getD().cat){ if(X.loadCatalog) X.loadCatalog(); return desk(`<div class="dt-note">${CM().jandi("detective")}<p>${esc(L("Abrindo os arquivos do catálogo…","Opening the catalog files…"))}</p></div>`); }
  if(g.phase==="office") return desk(`<div class="dt-note big">${CM().jandi("detective")}<div>
      <h3 class="cm-title">${esc(L("Detetive de Evidências","Evidence Detective"))}</h3>
      <p>${esc(L("Você é fiscal no posto de controle de dados científicos. Cada ficha que chega quer entrar na calculadora. Examine com a lupa, confira o Manual do Portão e carimbe: LIBERADO, EM ANÁLISE ou BARRADO.","You are an inspector at the scientific data checkpoint. Every record that arrives wants to get into the calculator. Examine it with the magnifier, check the Gate Manual and stamp it: CLEARED, UNDER REVIEW or BLOCKED."))}</p>
      <p class="dt-mission">${esc(MISSION())}</p>
      ${whyBox()}
      <p class="cm-small">${esc(L("As fichas vêm dos dados reais da plataforma; a resposta certa é o estado registrado em cada base. O manual ganha regras a cada dia. Acerte todos os carimbos para chegar ao dia 5.","Records come from the platform's real data; the right answer is the status recorded in each database. The manual gains rules every day. Get the stamps right to reach day 5."))}</p>
      <div class="dt-days">${DAYS.map(D=>`<button type="button" class="dt-day" data-act="g-dt-day" data-v="${D.d}" ${D.d>g.max?"disabled":""}><b>${esc(L("Dia","Day"))} ${D.d}</b><span>${esc(D.d>g.max?L("trancado","locked"):L(D.t_pt,D.t_en))}</span></button>`).join("")}</div></div></div>`);
  if(g.phase==="brief"){ const D = DAYS[g.day-1], nr = RULES.filter(r=>r.d===g.day);
    return desk(`<div class="dt-note big">${CM().jandi("detective")}<div><span class="dt-eyebrow">${esc(L("Dia","Day"))} ${g.day} · ${esc(L(D.t_pt,D.t_en))}</span>
      <h3 class="cm-title">${esc(g.day===1?L("Bem-vinda ao posto","Welcome to the post"):L("Nova regra no manual","New rule in the manual"))}</h3>
      <ul class="dt-rules">${nr.map(r=>`<li>${esc(L(r.pt,r.en))}</li>`).join("")}</ul>
      ${g.day===1?`<p class="cm-small">${esc(L("Algumas fichas de hoje foram inventadas para o treinamento.","Some of today's records were made up for training."))}</p>`:""}
      ${D.final?`<p class="cm-small">${esc(L("Hoje chega o caso final. Leia tudo, inclusive a letra miúda.","Today the final case arrives. Read everything, including the fine print."))}</p>`:""}
      <p class="dt-mission">${esc(MISSION())}</p>
      <p>${esc(L(`${g.cases.length} fichas na mesa.`,`${g.cases.length} records on the desk.`))}</p>
      <button type="button" class="cm-big" data-act="g-dt-begin">${esc(L("Começar o expediente","Start the shift"))}</button></div></div>`);
  }
  if(g.phase==="case"){ const c = g.cases[g.i];
    return desk(`<div class="dt-top"><span>${esc(L("Dia","Day"))} ${g.day} · ${esc(L(`Ficha ${g.i+1} de ${g.cases.length}`,`Record ${g.i+1} of ${g.cases.length}`))}</span>
        <span class="dt-clues" id="dtClues">${clueCount(c, g)}</span>
        <button type="button" class="dt-lupa${g.lupa?" on":""}" data-act="g-dt-lupa" aria-pressed="${g.lupa}">${LUPA_SVG}${esc(g.lupa?L("Guardar a lupa","Put the magnifier away"):L("Pegar a lupa","Pick up the magnifier"))}</button></div>
      <p class="dt-mission on-desk">${esc(MISSION())}</p>
      <div class="dt-work">${paperCard(c, g.i, g)}${manual(g.day)}</div>${g.fb ? feedback(c, g) : stamps()}`, g.lupa?"lupa":"");
  }
  if(g.phase==="paper") return desk(newspaper(), "news");
  return "";
}
function newspaper(){
  const g = st(), ok = g.res.filter(r=>r.ok).length, n = g.res.length, wrong = g.res.filter(r=>!r.ok), D = DAYS[g.day-1];
  const fin = g.res.find(r=>r.c.final);
  let head, sub, pose = "detective";
  if(fin && fin.got==="L"){ head = L("Fiscal libera planilha de demonstração; relatório cita café inventado","Inspector clears demo spreadsheet; report cites made-up coffee"); sub = L("Demitida! A calculadora usou \"US$ 100 milhões\" fictícios. A letra miúda avisava: não citar.","Fired! The calculator used fictitious \"US$ 100 million\". The fine print warned: do not cite."); pose = "cross"; }
  else if(D.final && fin && ok===n){ head = L("Fiscal impecável salva a credibilidade do relatório","Flawless inspector saves the report's credibility"); sub = L("Promovida a Fiscal-chefe do Portão. A planilha de demonstração ficou de fora.","Promoted to Chief Gate Inspector. The demonstration spreadsheet stayed out."); pose = "cheer"; }
  else if(ok===n){ head = L("Fiscal impecável salva a credibilidade do relatório","Flawless inspector saves the report's credibility"); sub = L(`${n} fichas, nenhum erro. A calculadora agradece.`,`${n} records, no mistakes. The calculator says thanks.`); pose = "cheer"; }
  else if(wrong.some(w=>w.got==="L")){ head = L("Calculadora usa dado sem procedência; prejuízo estimado errado em milhões!","Calculator uses data without provenance; loss estimate off by millions!"); sub = L(`${ok} de ${n} fichas certas. Leia a errata abaixo.`,`${ok} of ${n} records right. Read the errata below.`); pose = "cross"; }
  else { head = L("Posto de controle segura dados bons demais; relatório atrasa","Checkpoint holds back good data; report delayed"); sub = L(`${ok} de ${n} fichas certas. Barrar demais também custa.`,`${ok} of ${n} records right. Blocking too much has a cost too.`); }
  const date = L(`Dia ${g.day}`,`Day ${g.day}`);
  return `<div class="dt-news"><header><span>${esc(date)}</span><h3>${esc(L("A Gazeta da Colmeia","The Hive Gazette"))}</h3><span>${esc(L("Edição do fim do expediente","End-of-shift edition"))}</span></header>
    <div class="dt-news-main"><div><h4>${esc(head)}</h4><p class="dt-sub">${esc(sub)}</p>
      ${wrong.length?`<h5>${esc(L("Errata","Errata"))}</h5><ul>${wrong.map(w=>`<li><b>${esc(L(`Carimbado ${STAMPS[w.got].pt}, era ${STAMPS[w.c.stamp].pt}.`,`Stamped ${STAMPS[w.got].en}, should be ${STAMPS[w.c.stamp].en}.`))}</b> ${esc(w.c.why)}</li>`).join("")}</ul>`
        :`<p>${esc(L("Nenhuma correção nesta edição.","No corrections in this edition."))}</p>`}</div>
      <figure>${CM().jandi(pose)}<figcaption>${esc(L("A fiscal Jandi no posto","Inspector Jandi at the post"))}</figcaption></figure></div>
    <div class="cm-row">${g.day<5 && !(fin&&fin.got==="L") ? `<button type="button" class="cm-big" data-act="g-dt-day" data-v="${g.day+1}">${esc(L("Próximo dia","Next day"))}</button>`:""}
      <button type="button" class="cm-btn ghost" data-act="g-dt-day" data-v="${g.day}">${esc(L("Repetir o dia","Replay the day"))}</button>
      <button type="button" class="cm-btn ghost" data-act="g-dt-office">${esc(L("Voltar ao escritório","Back to the office"))}</button></div></div>`;
}
function rerender(){ const r = document.getElementById("dtRoot"); if(r) r.innerHTML = body(); bindLens(); }
function reveal(key, el){
  const g = st(); if(g.seen[key]) return; g.seen[key] = true; CM().Sfx.zap();
  const f = el.closest(".dt-f"), c = g.cases[g.i], j = +key.split("-")[1], fld = c.fields[j];
  el.outerHTML = `<b class="just">${esc(fld.v)}</b>`; if(fld.clue && f) f.classList.add("clue");
  const p = document.getElementById("dtPaper"); if(p && f){ const pr = p.getBoundingClientRect(), fr = f.getBoundingClientRect();
    const pop = document.createElement("span"); pop.className = "dt-pop"; pop.textContent = fld.clue ? L("Pista importante!","Key clue!") : L("Pista!","Clue!");
    pop.style.left = (fr.right-pr.left-70)+"px"; pop.style.top = (fr.top-pr.top-6)+"px"; p.appendChild(pop); setTimeout(()=>pop.remove(), 1200);
    for(let k=0;k<10;k++){ const sp = document.createElement("i"); sp.className = "dt-spark"; const a = Math.random()*6.28, d = 20+Math.random()*30;
      sp.style.left = (fr.left-pr.left+fr.width*.6)+"px"; sp.style.top = (fr.top-pr.top+fr.height/2)+"px"; sp.style.setProperty("--dx", Math.cos(a)*d+"px"); sp.style.setProperty("--dy", Math.sin(a)*d+"px"); p.appendChild(sp); setTimeout(()=>sp.remove(), 700); } }
  const cc = document.getElementById("dtClues"); if(cc) cc.innerHTML = clueCount(c, g);
  const all = c.fields.every((ff,jj)=>!ff.hid || g.seen[g.i+"-"+jj]); if(all) setTimeout(()=>CM().Sfx.plim(), 250);
}
function bindLens(){
  const g = st(), p = document.getElementById("dtPaper"); if(!p || !g.lupa || g.fb) return;
  const lens = document.createElement("div"); lens.className = "dt-lens"; lens.innerHTML = '<span class="dt-lens-ring"></span>'; lens.hidden = true; p.appendChild(lens);
  let dwell = null, tgt = null;
  const place = (x, y) => {
    const r = p.getBoundingClientRect(); lens.hidden = false; lens.style.left = (x-r.left)+"px"; lens.style.top = (y-r.top)+"px";
    let hit = null; p.querySelectorAll(".dt-secret").forEach(el=>{ const b = el.getBoundingClientRect(); if(x>b.left-24 && x<b.right+24 && y>b.top-24 && y<b.bottom+24) hit = el; });
    p.querySelectorAll(".dt-secret.near").forEach(el=>{ if(el!==hit) el.classList.remove("near"); });
    if(hit!==tgt){ clearTimeout(dwell); lens.classList.remove("charging"); tgt = hit;
      if(hit){ hit.classList.add("near"); void lens.offsetWidth; lens.classList.add("charging"); const key = hit.dataset.v; dwell = setTimeout(()=>{ lens.classList.remove("charging"); lens.classList.add("found"); setTimeout(()=>lens.classList.remove("found"), 400); if(document.body.contains(hit)) reveal(key, hit); tgt = null; }, 450); } }
  };
  const off = e => e.pointerType==="mouse" ? 0 : 70;
  p.addEventListener("pointermove", e=>place(e.clientX, e.clientY-off(e)));
  p.addEventListener("pointerdown", e=>{ if(e.pointerType!=="mouse"){ try{ p.setPointerCapture(e.pointerId); }catch(_){} } place(e.clientX, e.clientY-off(e)); });
  p.addEventListener("pointerleave", ()=>{ lens.hidden = true; clearTimeout(dwell); tgt = null; lens.classList.remove("charging"); });
  p.classList.add("lupa-on");
}

const API = {};
API.html = () => `<section class="section cm"><div class="cm-head"><h2 class="cm-title">${esc(L("Detetive de Evidências","Evidence Detective"))}</h2><button type="button" class="cm-sound" data-act="g-cm-sound" aria-pressed="${CM().Sfx.on}">${esc(CM().Sfx.on?L("Som ligado","Sound on"):L("Som desligado","Sound off"))}</button></div><div id="dtRoot">${body()}</div></section>`;
let keyBound = false;
API.mount = () => { loadDemo(); CM().Sfx.rain(true); bindLens();
  if(!keyBound){ keyBound = true; document.addEventListener("keydown", e=>{ const t = e.target.closest && e.target.closest(".dt-secret"); if(t && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); t.click(); } }); } };
API.leave = () => CM().Sfx.rain(false);
API.act = function(a, b){
  const g = st(), v = b && b.dataset.v;
  if(a==="g-dt-day"){ startDay(+v); }
  else if(a==="g-dt-office"){ g.phase = "office"; }
  else if(a==="g-dt-begin"){ g.phase = "case"; }
  else if(a==="g-dt-lupa"){ g.lupa = !g.lupa; CM().Sfx.flip(); }
  else if(a==="g-dt-look"){ if(!g.lupa){ X.toast && X.toast(L("Pegue a lupa primeiro.","Pick up the magnifier first.")); const lb = document.querySelector(".dt-lupa"); if(lb){ lb.classList.remove("nudge"); void lb.offsetWidth; lb.classList.add("nudge"); } return true; } reveal(v, b); return true; }
  else if(a==="g-dt-stamp"){
    const c = g.cases[g.i]; if(!c || g.busy) return true;
    g.busy = true; const ok = v===c.stamp; g.res.push({c, got:v, ok});
    const p = document.getElementById("dtPaper"), dk = document.getElementById("dtDesk");
    if(p){ const s = document.createElement("div"); s.className = "dt-imprint"; s.style.setProperty("--c", STAMPS[v].c); s.style.setProperty("--r", (-14+Math.random()*10).toFixed(1)+"deg"); s.textContent = L(STAMPS[v].pt, STAMPS[v].en); p.appendChild(s); }
    if(dk){ dk.classList.remove("shake"); void dk.offsetWidth; dk.classList.add("shake"); }
    CM().Sfx.tum();
    setTimeout(()=>{ g.busy = false; g.fb = {got:v, ok, r:p?p.querySelector(".dt-imprint").style.getPropertyValue("--r"):"-8deg"}; if(ok) CM().Sfx.plim(); rerender(); const b = document.querySelector(".dt-fb .cm-big"); if(b){ b.focus({preventScroll:true}); b.scrollIntoView({block:"nearest"}); } }, 650);
    return true;
  }
  else if(a==="g-dt-next"){
    { g.fb = null; g.i++; g.lupa = false;
      if(g.i>=g.cases.length){ g.phase = "paper"; const fin = g.res.find(r=>r.c.final); const pass = !(fin && fin.got==="L");
        if(pass && g.day+1>g.max && g.day<5){ g.max = g.day+1; try{ localStorage.setItem("cm-det-max", g.max); }catch(_){} }
        setTimeout(()=>{ const allOk = g.res.every(r=>r.ok); if(allOk) CM().Sfx.plim(); else CM().Sfx.murchar(); }, 300); }
      rerender(); const r = document.getElementById("dtRoot"); if(r) r.scrollIntoView({block:"nearest"}); }
    return true;
  }
  else return false;
  rerender(); return true;
};
API.init = ctx => { X = ctx; };
API._test = {st, startDay, makers, finalCase};
window.GameDetetive = API;
})();
