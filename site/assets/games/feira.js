/* Feira Sem Abelhas — monte uma cesta e veja o que sobraria sem polinizadores.
   Cada alimento encolhe e perde cor na proporção do seu coeficiente de dependência (DR).
   DRs: base de evidências verificada da plataforma quando existe; senão Giannini et al. (2015),
   Tabela 1, como transcrita no catálogo (revisão taxonômica pendente, sinalizada no cartão). */
(function(){
"use strict";
let X = null; const CM = () => window.Colmeia;
/* A feira não tem som: todas as chamadas de efeito sonoro ficam mudas. */
const SND = {buzz(){}, flip(){}, murchar(){}, plim(){}};
const L = (pt,en) => X.L(pt,en), esc = s => X.esc(s);

/* ---------- ícones dos alimentos processados (bebidas, pães, doces) ----------
   Frutas, legumes, raízes e sementes: desenhos por espécie em assets/games/alimentos.js. */
const sh = '<ellipse cx="50" cy="90" rx="30" ry="4.5" fill="#2E2418" opacity=".12"/>';
let FN = 0;
function shade(h, k){ const n = parseInt(h.slice(1),16), r=n>>16, g=n>>8&255, b=n&255, f = v => Math.round(k>0 ? v+(255-v)*k : v*(1+k)); return "#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join(""); }
function food(k, a, b){
  const id = "fd"+(++FN)+"_", defs = [];
  // degradê com luz no alto à esquerda a partir da cor base (ids únicos por ícone)
  const gr = c => { if(!c || c[0]!=="#") return c; const n = id+defs.length; defs.push(`<radialGradient id="${n}" cx=".5" cy=".5" fx=".34" fy=".28" r=".8"><stop offset="0" stop-color="${shade(c,.45)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,-.32)}"/></radialGradient>`); return `url(#${n})`; };
  const S = inner => `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>${defs.join("")}</defs>${sh}${inner}</svg>`;
  switch(k){
    case "cup": return S(`<path d="M24 40h46l-6 38H30z" fill="#FFF6E5" stroke="#8A5A3C" stroke-width="2.5"/><path d="M70 48c12 0 12 18-2 18" stroke="#8A5A3C" stroke-width="4" fill="none"/><ellipse cx="47" cy="41" rx="22" ry="5" fill="${gr(a)}"/><path d="M40 30c-4-6 4-8 0-14M52 30c-4-6 4-8 0-14" stroke="#B8B2A7" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
    case "glass": return S(`<path d="M30 24h40l-5 60H35z" fill="#fff" fill-opacity=".6" stroke="#8A5A3C" stroke-width="2.5"/><path d="M32 40h36l-4 42H36z" fill="${gr(a)}"/><path d="M60 16l-6 34" stroke="${b||"#E9505B"}" stroke-width="3.5" stroke-linecap="round"/>`);
    case "bread": return S(`<path d="M14 66c0-22 72-30 72-6 0 12-72 22-72 6z" fill="${gr("#D9A15A")}"/><path d="M28 56c6-4 10-6 14-6M44 52c6-4 10-5 14-5M60 50c5-3 9-4 13-3" stroke="#B5762C" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    case "dome": return S(`<path d="M18 76c0-30 64-30 64 0z" fill="${gr(a)}"/><path d="M14 76h72" stroke="#8A5A3C" stroke-width="4" stroke-linecap="round"/><g fill="#fff" opacity=".35"><circle cx="40" cy="62" r="2"/><circle cx="55" cy="58" r="2"/><circle cx="62" cy="68" r="2"/><circle cx="46" cy="70" r="2"/></g>`);
    case "bowl": return S(`<ellipse cx="50" cy="52" rx="34" ry="9" fill="${gr(a)}"/><path d="M16 52c2 24 66 24 68 0z" fill="${gr(b||"#C98A4B")}"/>`);
    case "block": return S(`<path d="M22 50l28-12 28 12v22L50 84 22 72z" fill="${gr(a)}"/><path d="M22 50l28 12 28-12M50 62v22" stroke="#7A1F1F" stroke-opacity=".35" stroke-width="2" fill="none"/>`);
    default: return S(`<circle cx="50" cy="56" r="28" fill="${gr(a||"#A8D08D")}"/>`);
  }
}
const ICON4M = {Melon:1, Watermelon:1, Mango:1, Papaya:1};

/* ---------- itens: referência ao dado (ev = base verificada; uid = catálogo) ---------- */
const ITEMS = [
  {id:"melao", pt:"Melão", en:"Melon", ref:{ev:"Melon"}, m:"fc"},
  {id:"melancia", pt:"Melancia", en:"Watermelon", ref:{ev:"Watermelon"}, m:"f"},
  {id:"maracuja", pt:"Maracujá", en:"Passion fruit", ref:{ev:"Passion fruit"}, ic:["maracuja"], m:"f"},
  {id:"suco-maracuja", pt:"Suco de maracujá", en:"Passion fruit juice", ref:{ev:"Passion fruit"}, ic:["glass","#F7D04A","#4C8C4A"], m:"c"},
  {id:"tomate", pt:"Tomate", en:"Tomato", ref:{ev:"Tomato"}, ic:["tomate"], m:"fc"},
  {id:"maca", pt:"Maçã", en:"Apple", ref:{ev:"Apple"}, ic:["maca"], m:"fc"},
  {id:"mamao", pt:"Mamão", en:"Papaya", ref:{ev:"Papaya"}, m:"fc"},
  {id:"manga", pt:"Manga", en:"Mango", ref:{ev:"Mango"}, m:"f"},
  {id:"cafe", pt:"Café", en:"Coffee", ref:{ev:"Coffee"}, ic:["cup","#5B3A24"], m:"c"},
  {id:"acerola", pt:"Acerola", en:"Acerola", ref:{uid:"V14-GIA-00027"}, ic:["acerola"], m:"f"},
  {id:"suco-acerola", pt:"Suco de acerola", en:"Acerola juice", ref:{uid:"V14-GIA-00027"}, ic:["glass","#E9505B","#3F8A3C"], m:"c"},
  {id:"abobora", pt:"Abóbora", en:"Squash", ref:{uid:"V14-GIA-00051"}, ic:["abobora"], m:"f"},
  {id:"chocolate", pt:"Chocolate quente", en:"Hot chocolate", ref:{uid:"V14-GIA-00005"}, ic:["cup","#6B3A1E"], m:"c"},
  {id:"castanha", pt:"Castanha-do-brasil", en:"Brazil nut", ref:{uid:"V14-GIA-00048"}, ic:["castanha"], m:"c"},
  {id:"goiaba", pt:"Goiaba", en:"Guava", ref:{uid:"V14-GIA-00013"}, ic:["goiaba"], m:"f"},
  {id:"goiabada", pt:"Goiabada", en:"Guava paste", ref:{uid:"V14-GIA-00013"}, ic:["block","#B5302F"], m:"c"},
  {id:"abacate", pt:"Abacate", en:"Avocado", ref:{uid:"V14-GIA-00015"}, ic:["abacate"], m:"fc"},
  {id:"pepino", pt:"Pepino", en:"Cucumber", ref:{uid:"V14-GIA-00063"}, ic:["pepino"], m:"f"},
  {id:"morango", pt:"Morango", en:"Strawberry", ref:{uid:"V14-GIA-00078"}, ic:["morango"], m:"fc"},
  {id:"berinjela", pt:"Berinjela", en:"Eggplant", ref:{uid:"V14-GIA-00073"}, ic:["berinjela"], m:"f"},
  {id:"quiabo", pt:"Quiabo", en:"Okra", ref:{uid:"V14-GIA-00075"}, ic:["quiabo"], m:"f"},
  {id:"caju", pt:"Caju", en:"Cashew apple", ref:{uid:"V14-GIA-00021"}, ic:["caju"], m:"f"},
  {id:"coco", pt:"Coco", en:"Coconut", ref:{uid:"V14-GIA-00012"}, ic:["coco"], m:"fc"},
  {id:"tangerina", pt:"Tangerina", en:"Mandarin", ref:{uid:"V14-GIA-00020"}, ic:["tangerina"], m:"fc"},
  {id:"feijao", pt:"Feijão", en:"Beans", ref:{uid:"V14-GIA-00081"}, ic:["feijao"], m:"f"},
  {id:"pimentao", pt:"Pimentão", en:"Bell pepper", ref:{uid:"V14-GIA-00082"}, ic:["pimentao"], m:"f"},
  {id:"banana", pt:"Banana", en:"Banana", ref:{uid:"V14-GIA-00092"}, ic:["banana"], m:"fc"},
  {id:"mandioca", pt:"Mandioca", en:"Cassava", ref:{uid:"V14-GIA-00089"}, ic:["mandioca"], m:"f"},
  {id:"tapioca", pt:"Tapioca", en:"Tapioca crepe", ref:{uid:"V14-GIA-00089"}, ic:["tapioca"], m:"c"},
  {id:"cuscuz", pt:"Cuscuz de milho", en:"Corn couscous", ref:{uid:"V14-GIA-00087"}, ic:["dome","#F2C94C"], m:"c"},
  {id:"pao", pt:"Pão", en:"Bread", ref:{uid:"V14-GIA-00094"}, ic:["bread"], m:"c"},
  {id:"aveia", pt:"Aveia", en:"Oats", ref:{uid:"V14-GIA-00104"}, ic:["bowl","#E8D6A8"], m:"c"},
  {id:"batata", pt:"Batata", en:"Potato", ref:{uid:"V14-GIA-00093"}, ic:["batata"], m:"f"},
  {id:"cebola", pt:"Cebola", en:"Onion", ref:{uid:"V14-GIA-00097"}, ic:["cebola"], m:"f"},
  {id:"cenoura", pt:"Cenoura", en:"Carrot", ref:{uid:"V14-GIA-00119"}, ic:["cenoura"], m:"f"},
  {id:"alface", pt:"Alface", en:"Lettuce", ref:{uid:"V14-GIA-00123"}, ic:["alface"], m:"f"},
  {id:"abacaxi", pt:"Abacaxi", en:"Pineapple", ref:{uid:"V14-GIA-00096"}, ic:["abacaxi"], m:"f"},
  {id:"uva", pt:"Uva", en:"Grapes", ref:{uid:"V14-GIA-00095"}, ic:["uva"], m:"f"},
  {id:"cha", pt:"Chá", en:"Tea", ref:{uid:"V14-GIA-00113"}, ic:["cup","#B5762C"], m:"c"},
  {id:"acai", pt:"Açaí", en:"Açaí", ref:{uid:"V18-GIA-00125"}, ic:["bowl","#4A1F4F","#6B3A1E"], m:"c"}
];
const SCEN = [0,10,25,50,100];
const MAXB = 12;

let F = null;
function st(){ if(!F){ let best=null; try{ best = JSON.parse(localStorage.getItem("cm-feira-best")||"null"); }catch(_){} F = {mode:"f", basket:[], phase:"build", si:4, ch:"livre", card:null, best: best||{caos:null}}; } return F; }

function resolve(it){
  const D = X.getD();
  if(it.ref.ev){
    const rows = (D.evidence||[]).filter(r=>r.Crop===it.ref.ev && X.isNum(r.DR));
    const r = rows.find(r=>/giannini/i.test(r.Reference||"")) || rows[0];
    if(!r) return null;
    return {dr:r.DR, sci:r.Scientific_name, src:r.Reference+(r.DOI?` · doi:${r.DOI}`:""), note:L("Coeficiente verificado na base de evidências da plataforma.","Coefficient verified in the platform's evidence base."), ok:true};
  }
  const c = (D.cat||[]).find(r=>r.UID===it.ref.uid);
  if(!c) return null;
  const v = parseFloat(String(c["Valor numérico"]).replace(",","."));
  const unknown = /desconhecida/i.test(c.Tipo||"");
  return {dr: unknown||isNaN(v) ? null : v, sci:String(c["Nome literal"]).replace(/[,\s]+$/,""), src:`Giannini et al. (2015), ${L("Tabela 1","Table 1")} · UID ${c.UID}`,
    note: unknown ? L("Dependência desconhecida: o catálogo registra que ainda não há coeficiente para este alimento.","Unknown dependence: the catalog records that there is no coefficient for this food yet.")
                  : L("Valor transcrito da Tabela 1; o catálogo ainda marca revisão taxonômica pendente.","Value transcribed from Table 1; the catalog still flags a pending taxonomic review."), ok:false};
}
function iconOf(it){ if(it.ref.ev && ICON4M[it.ref.ev] && !it.ic) return X.cropIcon(it.ref.ev); const ic = it.ic||["default","#A8D08D"], A = window.Alimentos; return A && A.has(ic[0]) ? A.draw(ic[0]) : food(...ic); }
const nm = it => L(it.pt,it.en);
const loss = () => SCEN[st().si]/100;
function keep(ids, lo){ const k = ids.map(id=>resolve(ITEMS.find(i=>i.id===id))).filter(r=>r && r.dr!=null); if(!k.length) return 100; return 100*k.reduce((a,r)=>a+(1-r.dr*lo),0)/k.length; }

/* ---------- desenho ---------- */
function stall(){
  const stripes = Array.from({length:12},(_,i)=>`<path d="M${i*100/12} 0h${100/12}v16c0 4-${100/24} 6-${100/24} 6s-${100/24}-2-${100/24}-6z" fill="${i%2?"#FFF6E5":"#F2A93B"}"/>`).join("");
  return `<svg class="fe-awning" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">${stripes}</svg>`;
}
function crates(){
  const f = st();
  const list = ITEMS.filter(i=>i.m.includes(f.mode));
  return `<div class="fe-crates" role="list">${list.map(it=>{ const inB = f.basket.includes(it.id);
    return `<button type="button" role="listitem" class="fe-crate${inB?" in":""}" data-act="g-fe-add" data-v="${it.id}" data-drag="${it.id}" ${f.phase!=="build"?"disabled":""} aria-label="${esc(L("Colocar na cesta: ","Add to basket: ")+nm(it))}">
      <span class="fe-ico">${iconOf(it)}</span><span class="fe-tag">${esc(nm(it))}</span></button>`; }).join("")}</div>`;
}
function basketItems(){
  const f = st();
  return f.basket.map((id,i)=>{ const it = ITEMS.find(x=>x.id===id), r = resolve(it), dr = r&&r.dr!=null ? r.dr : 0, unk = !r || r.dr==null;
    return `<button type="button" class="fe-item${unk?" unk":""}" data-act="g-fe-item" data-v="${id}" data-dr="${dr}" style="--d:${(i*0.05).toFixed(2)}s" aria-label="${esc(nm(it))}">
      ${iconOf(it)}${unk?'<span class="fe-q">?</span>':""}</button>`; }).join("");
}
function counterHTML(){
  const f = st(), live = f.phase==="gone" && !f.pending, v = keep(f.basket, live?loss():0);
  return `<div class="fe-counter"><span>${esc(L("Sua cesta","Your basket"))}</span><b>100%</b><i>→</i><b class="fe-x" id="feX">${live?Math.round(v):100}%</b></div>`;
}
function chText(){
  const f = st();
  if(f.ch==="crise") return L("Desafio À prova de crise: monte uma cesta com pelo menos 6 alimentos diferentes que perca menos de 20% sem abelhas.","Crisis-proof challenge: build a basket of at least 6 different foods that loses under 20% without bees.");
  if(f.ch==="caos") return L("Desafio Feira do caos: monte, com pelo menos 5 alimentos, a cesta que mais perde sem abelhas."+(f.best.caos!=null?` Recorde: sobram ${Math.round(f.best.caos)}%.`:""),"Chaos market challenge: with at least 5 foods, build the basket that loses the most without bees."+(f.best.caos!=null?` Record: ${Math.round(f.best.caos)}% left.`:""));
  return f.mode==="f" ? L("Escolha o que você costuma comprar na feira. Arraste para a cesta ou toque no alimento.","Pick what you usually buy at the market. Drag it to the basket or tap the food.")
                      : L("Monte o seu café da manhã. Arraste para o prato ou toque no alimento.","Build your breakfast. Drag it to the plate or tap the food.");
}
function verdict(){
  const f = st(); if(f.phase!=="gone" || f.ch==="livre") return "";
  const v = keep(f.basket, 1), n = f.basket.length;
  if(f.ch==="crise"){
    const ok = n>=6 && v>80;
    return `<div class="fe-verdict ${ok?"ok":"no"}">${CM().jandi(ok?"cheer":"cross")}<p>${esc(ok?L(`Conseguiu! Sem abelhas sua cesta ainda teria ${Math.round(v)}%. Alimentos pouco dependentes seguram a variedade.`,`You did it! Without bees your basket would still hold ${Math.round(v)}%. Low-dependence foods keep variety going.`)
      : n<6 ? L("Faltam alimentos: o desafio pede pelo menos 6 diferentes.","Not enough foods: the challenge needs at least 6 different ones.")
      : L(`Sobraram ${Math.round(v)}%. Troque frutas muito dependentes, como melão, maracujá e acerola, por outras que dependem pouco.`,`${Math.round(v)}% left. Swap highly dependent fruits like melon, passion fruit and acerola for low-dependence ones.`))}</p></div>`;
  }
  const ok = n>=5;
  return `<div class="fe-verdict ${ok?"ok":"no"}">${CM().jandi(ok?"tip":"cross")}<p>${esc(!ok?L("O desafio pede pelo menos 5 alimentos.","The challenge needs at least 5 foods."):L(`Sobraram só ${Math.round(v)}% da sua cesta.`+(f.best.caos!=null&&Math.round(f.best.caos)===Math.round(v)?" Novo recorde!":""),`Only ${Math.round(v)}% of your basket is left.`+(f.best.caos!=null&&Math.round(f.best.caos)===Math.round(v)?" New record!":"")))}</p></div>`;
}
function cardHTML(){
  const f = st(); if(!f.card) return "";
  const it = ITEMS.find(i=>i.id===f.card), r = resolve(it) || {};
  const pct = r.dr==null ? null : Math.round(r.dr*100);
  return `<div class="fe-card-wrap" data-act="g-fe-close"><div class="fe-card" role="dialog" aria-modal="true" aria-label="${esc(nm(it))}" data-act="g-fe-noop">
    <div class="fe-card-ico">${iconOf(it)}</div>
    <h4>${esc(nm(it))}</h4><p class="sci">${esc(r.sci||"")}</p>
    <div class="fe-pot" aria-label="${esc(L("Dependência de polinização","Pollination dependence"))}: ${pct==null?"?":pct+"%"}">
      <svg viewBox="0 0 60 70" aria-hidden="true"><defs><clipPath id="potc"><path d="M10 18h40l-4 44H14z"/></clipPath></defs>
      <rect x="6" y="10" width="48" height="9" rx="3" fill="#8A5A3C"/>
      <g clip-path="url(#potc)"><rect x="0" y="${62-44*(pct||0)/100}" width="60" height="70" fill="#F2A93B" class="fe-honey"/></g>
      <path d="M10 18h40l-4 44H14z" fill="none" stroke="#8A5A3C" stroke-width="2.5"/></svg>
      <div><b>${pct==null?"?":pct+"%"}</b><span>${esc(pct==null?L("dependência desconhecida","dependence unknown"):L("da produção depende de polinizadores","of production depends on pollinators"))}</span></div>
    </div>
    <p class="fe-note">${esc(r.note||"")}</p>
    <p class="fe-src">${esc(L("Fonte: ","Source: ")+(r.src||"—"))}</p>
    <button type="button" class="cm-btn ghost" data-act="g-fe-close">${esc(L("Fechar","Close"))}</button>
  </div></div>`;
}
function body(){
  const f = st();
  const hasCat = !!X.getD().cat;
  if(!hasCat){ if(X.loadCatalog) X.loadCatalog(); return `<div class="cm-loading">${CM().jandi("fly","bob")}<p>${esc(L("Abrindo a feira…","Opening the market…"))}</p></div>`; }
  const n = f.basket.length;
  return `<div class="fe-top">
      <div class="cm-seg" role="group" aria-label="${esc(L("Modo","Mode"))}">
        <button type="button" data-act="g-fe-mode" data-v="f" aria-pressed="${f.mode==="f"}">${esc(L("Feira","Market"))}</button>
        <button type="button" data-act="g-fe-mode" data-v="c" aria-pressed="${f.mode==="c"}">${esc(L("Café da manhã","Breakfast"))}</button></div>
      <div class="cm-seg" role="group" aria-label="${esc(L("Desafio","Challenge"))}">
        ${[["livre",L("Livre","Free")],["crise",L("À prova de crise","Crisis-proof")],["caos",L("Feira do caos","Chaos market")]].map(([k,t])=>`<button type="button" data-act="g-fe-ch" data-v="${k}" aria-pressed="${f.ch===k}">${esc(t)}</button>`).join("")}</div>
    </div>
    <p class="fe-hint">${esc(chText())}</p>
    <div class="fe-grid">
      <div class="fe-stall"><span class="fe-swipe" aria-hidden="true">${esc(L("Deslize para ver mais →","Swipe for more →"))}</span>${stall()}<div class="fe-jandi${f.phase==="gone"?" gone":""}">${CM().jandi("fly")}</div>${crates()}</div>
      <div class="fe-side">
        ${counterHTML()}
        <div class="fe-basket ${f.mode==="c"?"plate":""} ${f.phase}" id="feBasket" style="--k:${f.phase==="gone"&&!f.pending?loss():0}">
          <div class="fe-basket-items">${n?basketItems():`<p class="fe-empty">${esc(f.mode==="f"?L("Sua cesta está vazia","Your basket is empty"):L("Seu prato está vazio","Your plate is empty"))}</p>`}</div>
        </div>
        ${f.phase==="build" ? `<button type="button" class="cm-big" data-act="g-fe-go" ${n<3?"disabled":""}>${esc(L("E se as abelhas sumissem?","What if the bees disappeared?"))}</button>
          <p class="fe-small">${esc(n<3?L(`Escolha pelo menos 3 alimentos (${n}/${MAXB}).`,`Pick at least 3 foods (${n}/${MAXB}).`):L(`${n} de ${MAXB} alimentos. Toque num alimento da cesta para tirá-lo.`,`${n} of ${MAXB} foods. Tap a food in the basket to remove it.`))}</p>`
        : `<label class="fe-slider" for="feSl"><span>${esc(L("Perda do serviço de polinização","Loss of pollination service"))}: <b id="feSlv">${SCEN[f.si]}%</b></span>
             <input type="range" id="feSl" min="0" max="4" step="1" value="${f.si}" aria-valuetext="${SCEN[f.si]}%">
             <span class="fe-ticks">${SCEN.map(s=>`<i>${s}%</i>`).join("")}</span></label>
           <p class="fe-small">${esc(L("10%, 25% e 50% são os cenários da plataforma; 100% é o caso extremo, sem nenhum polinizador. Toque num alimento para ver a ficha.","10%, 25% and 50% are the platform's scenarios; 100% is the extreme case with no pollinators. Tap a food to see its card."))}</p>
           ${verdict()}
           <div class="cm-row"><button type="button" class="cm-btn" data-act="g-fe-share">${esc(L("Gerar imagem para story","Make a story image"))}</button><button type="button" class="cm-btn ghost" data-act="g-fe-reset">${esc(L("Montar outra cesta","Build another basket"))}</button></div>`}
      </div>
    </div>
    <p class="fe-foot">${esc(L("Cada alimento vale o mesmo peso na porcentagem da cesta. A dependência indica quanto a produção cairia sem polinização animal; não é a quantidade que some do seu prato hoje.","Each food weighs the same in the basket percentage. Dependence shows how much production would drop without animal pollination; it is not how much vanishes from your plate today."))}</p>
    <div id="feCard">${cardHTML()}</div>`;
}

function rerender(){ const r = document.getElementById("feRoot"); if(r){ const oc = r.querySelector(".fe-crates"), sl = oc ? oc.scrollLeft : 0; r.innerHTML = body(); const nc = r.querySelector(".fe-crates"); if(nc) nc.scrollLeft = sl; bindSlider(); if(st().phase==="gone" && !st().pending) applyLoss(false); } }
function applyLoss(animate){
  const f = st(), lo = loss(), b = document.getElementById("feBasket"); if(!b) return;
  b.style.setProperty("--k", lo);
  b.querySelectorAll(".fe-item").forEach(el=>{ const k = (+el.dataset.dr||0)*lo; el.style.setProperty("--l", k.toFixed(3)); });
  const x = document.getElementById("feX"), v = keep(f.basket, lo);
  if(x){ if(animate) CM().countUp(x, 100, v, 1600, n=>Math.round(n)+"%"); else x.textContent = Math.round(v)+"%"; }
}
function bindSlider(){
  const s = document.getElementById("feSl"); if(!s) return;
  s.addEventListener("input", ()=>{ const f = st(); const prev = f.si; f.si = +s.value; const v = document.getElementById("feSlv"); if(v) v.textContent = SCEN[f.si]+"%"; s.setAttribute("aria-valuetext", SCEN[f.si]+"%"); applyLoss(false); if(f.si>prev) SND.murchar(); else if(f.si<prev) SND.plim(); });
}

/* ---------- imagem para story ---------- */
async function story(){
  const f = st(), W = 1080, H = 1920, c = document.createElement("canvas"); c.width=W; c.height=H; const g = c.getContext("2d");
  CM().paper(g, W, H);
  g.fillStyle = "#F2A93B"; for(let i=0;i<12;i++){ g.fillStyle = i%2?"#FFF6E5":"#F2A93B"; g.fillRect(i*W/12,0,W/12,110); }
  g.fillStyle = "#2E2418"; g.textAlign = "center";
  g.font = "700 84px Fredoka, 'Baloo 2', system-ui, sans-serif"; g.fillText(L("Feira Sem Abelhas","Market Without Bees"), W/2, 240);
  const its = f.basket.map(id=>ITEMS.find(i=>i.id===id));
  const imgs = await Promise.all(its.map(it=>CM().svgToImage(iconOf(it))));
  const drs = its.map(it=>{ const r = resolve(it); return r&&r.dr!=null ? r.dr : 0; });
  const lo = loss() || 1, v = keep(f.basket, lo);
  const row = (y, after) => {
    g.fillStyle = after ? "#EFE9DD" : "#FFF0CC"; g.beginPath(); g.roundRect ? g.roundRect(70,y,W-140,560,40) : g.rect(70,y,W-140,560); g.fill();
    g.fillStyle = "#8A5A3C"; g.font = "600 46px Fredoka, system-ui, sans-serif"; g.fillText(after?L(`Sem abelhas (perda de ${Math.round(lo*100)}%)`,`Without bees (${Math.round(lo*100)}% loss)`):L("Com abelhas","With bees"), W/2, y+70);
    const n = imgs.length, cols = Math.min(6, n), rows = Math.ceil(n/cols), cell = Math.min(150, (W-200)/cols);
    imgs.forEach((im,i)=>{ if(!im) return; const cx = W/2 + ((i%cols) - (cols-1)/2)*cell*1.05, cy = y+150 + Math.floor(i/cols)*cell*1.05 + (rows===1?100:0);
      const k = after ? drs[i]*lo : 0, s = cell*(1-.85*k);
      g.save(); g.globalAlpha = 1-.5*k; if(after && k>0) g.filter = `grayscale(${Math.min(1,k*1.2)})`; g.drawImage(im, cx-s/2, cy+(cell-s)/2, s, s); g.restore(); });
  };
  row(300, false); row(900, true);
  g.fillStyle = "#2E2418"; g.font = "700 64px Fredoka, system-ui, sans-serif";
  CM().wrapText(g, L(`Minha ${f.mode==="f"?"feira":"cesta de café da manhã"} perderia ${Math.round(100-v)}% sem polinizadores. E a sua?`,`My ${f.mode==="f"?"market basket":"breakfast"} would lose ${Math.round(100-v)}% without pollinators. What about yours?`), W/2, 1580, W-180, 78);
  g.font = "500 34px Inter, system-ui, sans-serif"; g.fillStyle = "#8A5A3C"; g.fillText("Pollination Risk and Value Tool", W/2, 1800); g.font = "400 28px Inter, system-ui, sans-serif"; g.fillText(CM().siteUrl().replace(/^https?:\/\//,"").slice(0,60), W/2, 1850);
  const jd = await CM().svgToImage(CM().jandi("cheer")); if(jd) g.drawImage(jd, W-250, 1420, 180, 180);
  CM().share(c, {text:L(`Minha ${f.mode==="f"?"feira":"cesta de café da manhã"} perderia ${Math.round(100-v)}% sem polinizadores. E a sua?`,`My ${f.mode==="f"?"market basket":"breakfast"} would lose ${Math.round(100-v)}% without pollinators. What about yours?`), file:"feira-sem-abelhas.png", alt:L("Cesta antes e depois, sem abelhas","Basket before and after, without bees")});
}

/* ---------- arrastar para a cesta ---------- */
let drag = null;
function onDown(e){
  const el = e.target.closest("[data-drag]"); if(!el || el.disabled || st().phase!=="build") return;
  drag = {id:el.dataset.drag, x:e.clientX, y:e.clientY, el, ghost:null, pid:e.pointerId};
}
function onMove(e){
  if(!drag) return;
  if(!drag.ghost){ const dx = e.clientX-drag.x, dy = e.clientY-drag.y; if(Math.hypot(dx, dy)<8) return;
    if(e.pointerType!=="mouse" && Math.abs(dx) > Math.abs(dy)){ drag = null; return; } // deslizar para o lado rola a barra
    const gh = document.createElement("div"); gh.className="fe-ghost"; gh.innerHTML = drag.el.querySelector(".fe-ico").innerHTML; document.body.appendChild(gh); drag.ghost = gh; drag.el.classList.add("dragging"); }
  drag.ghost.style.left = e.clientX+"px"; drag.ghost.style.top = e.clientY+"px";
  const b = document.getElementById("feBasket"); if(b){ const r = b.getBoundingClientRect(); b.classList.toggle("over", e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom); }
  e.preventDefault();
}
function onUp(e){
  if(!drag) return;
  const d = drag; drag = null;
  if(d.ghost){ d.ghost.remove(); d.el.classList.remove("dragging");
    const b = document.getElementById("feBasket"); if(b){ b.classList.remove("over"); const r = b.getBoundingClientRect(); if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom) add(d.id); }
    suppressClick = true; setTimeout(()=>suppressClick=false, 50);
  }
}
let suppressClick = false, bound = false;
function add(id){ const f = st(); if(f.phase!=="build" || f.basket.includes(id) || f.basket.length>=MAXB) return; f.basket.push(id); SND.flip(); rerender(); const it = document.querySelector(`.fe-item[data-v="${id}"]`); if(it) it.classList.add("drop"); }

const API = {};
API.html = () => `<section class="section cm"><div class="cm-head"><h2 class="cm-title">${esc(L("Feira Sem Abelhas","Market Without Bees"))}</h2></div><div id="feRoot">${body()}</div></section>`;
function soundBtn(){ return `<button type="button" class="cm-sound" data-act="g-cm-sound" aria-pressed="${SND.on}">${esc(SND.on?L("Som ligado","Sound on"):L("Som desligado","Sound off"))}</button>`; }
API.mount = function(){
  bindSlider(); if(st().phase==="gone" && !st().pending) applyLoss(false);
  if(st().phase==="build" && X.getD().cat) SND.buzz(true);
  if(!bound){ bound = true; document.addEventListener("pointerdown", onDown); document.addEventListener("pointermove", onMove, {passive:false}); document.addEventListener("pointerup", onUp); document.addEventListener("pointercancel", ()=>{ if(drag&&drag.ghost) drag.ghost.remove(); drag=null; }); }
};
API.leave = () => SND.buzz(false);
API.act = function(a, b){
  const f = st(), v = b && b.dataset.v;
  if(suppressClick && a==="g-fe-add") return true;
  if(a==="g-fe-add") add(v);
  else if(a==="g-fe-item"){ if(f.phase==="build"){ f.basket = f.basket.filter(x=>x!==v); rerender(); } else { f.card = v; SND.flip(); document.getElementById("feCard").innerHTML = cardHTML(); const btn = document.querySelector(".fe-card .cm-btn"); if(btn) btn.focus(); } }
  else if(a==="g-fe-noop"){ }
  else if(a==="g-fe-close"){ f.card = null; document.getElementById("feCard").innerHTML = ""; }
  else if(a==="g-fe-mode"){ if(f.mode!==v){ f.mode = v; f.basket = []; f.phase = "build"; rerender(); SND.buzz(true); } }
  else if(a==="g-fe-ch"){ f.ch = v; if(f.phase==="gone") f.si = 4; rerender(); }
  else if(a==="g-fe-go"){
    f.phase = "gone"; f.si = 4; f.pending = true; rerender();
    SND.buzz(false);
    setTimeout(()=>{ f.pending = false; SND.murchar(); applyLoss(true); }, 1100);
    if(f.ch==="caos" && f.basket.length>=5){ const v2 = keep(f.basket,1); if(f.best.caos==null || v2<f.best.caos){ f.best.caos = v2; try{ localStorage.setItem("cm-feira-best", JSON.stringify(f.best)); }catch(_){} } setTimeout(rerenderVerdict, 50); }
    if(f.ch==="crise" && f.basket.length>=6 && keep(f.basket,1)>80) setTimeout(()=>SND.plim(), 2600);
  }
  else if(a==="g-fe-reset"){ f.phase = "build"; f.basket = []; f.si = 4; rerender(); SND.buzz(true); }
  else if(a==="g-fe-share"){ story(); }
  else return false;
  return true;
};
function rerenderVerdict(){ const vd = document.querySelector(".fe-verdict"); if(vd) vd.outerHTML = verdict(); }
API.init = ctx => { X = ctx; };
API._test = {ITEMS, resolve, keep, st};
window.GameFeira = API;
})();
