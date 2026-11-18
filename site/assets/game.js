/* Aba Jogos — trilha de jogos didáticos com a identidade visual "Colmeia".
   Feira Sem Abelhas → Voo da abelha → Quanto Vale uma Abelha? → Detetive de Evidências.
   Cada jogo vive em assets/games/*.js (e assets/bee.js) e usa os dados da própria plataforma. */
(function(){
"use strict";
let X = null;
const G = {};
const L = (pt,en) => X.L(pt,en), esc = s => X.esc(s);
const CM = () => window.Colmeia;
const MODS = () => ({feira:window.GameFeira, voo:window.BeeGame, quanto:window.GameQuanto, detetive:window.GameDetetive});
const PREFIX = {"g-fe-":"feira", "g-bee-":"voo", "g-qv-":"quanto", "g-dt-":"detetive"};
let stage = "intro", prev = null;
try{ const s = sessionStorage.getItem("cm-stage"); if(s) stage = s; }catch(_){}

const TRAIL = [
  {k:"feira", pose:"fly", t_pt:"Feira Sem Abelhas", t_en:"Market Without Bees", r_pt:"Porta de entrada", r_en:"The way in", min:"~2 min",
   d_pt:"Monte sua cesta, aperte o botão e veja o que sobraria sem polinizadores.", d_en:"Fill your basket, press the button and see what would be left without pollinators."},
  {k:"voo", pose:"cheer", t_pt:"Voo da abelha", t_en:"The bee's flight", r_pt:"Desafio de ação", r_en:"Action challenge", min:"~6 min",
   d_pt:"Guie a Jandi pelos cenários de 10%, 25% e 50% de perda até encontrar a flor.", d_en:"Guide Jandi through the 10%, 25% and 50% loss scenarios until she finds the flower."},
  {k:"quanto", pose:"host", t_pt:"Quanto Vale uma Abelha?", t_en:"How Much Is a Bee Worth?", r_pt:"A lógica da calculadora", r_en:"The calculator's logic", min:"~5 min",
   d_pt:"Um programa de auditório em que você chuta quantos milhões dependem dos polinizadores.", d_en:"A game show where you guess how many millions depend on pollinators."},
  {k:"detetive", pose:"detective", t_pt:"Detetive de Evidências", t_en:"Evidence Detective", r_pt:"Para ir fundo", r_en:"To go deeper", min:"",
   d_pt:"Fiscalize as fichas que querem entrar na calculadora e carimbe cada uma.", d_en:"Inspect the records that want to get into the calculator and stamp each one."}
];

function nav(){
  const items = [["intro",L("Trilha","Trail")]].concat(TRAIL.map((t,i)=>[t.k, `${i+1} · ${L(t.t_pt,t.t_en)}`]));
  return `<div class="g-stages cm-nav" role="tablist" aria-label="${esc(L("Jogos","Games"))}">${items.map(([k,t])=>`<button type="button" role="tab" data-act="g-stage" data-v="${k}" aria-selected="${stage===k}">${esc(t)}</button>`).join("")}</div>`;
}
function intro(){
  return `<section class="section cm cm-intro">
    <div class="cm-hero">${CM().jandi("cheer","bob")}<div>
      <h2 class="cm-title">${esc(L("Uma trilha em quatro jogos","A trail of four games"))}</h2>
      <p class="cm-lead">${esc(L("Quatro jogos em que o conteúdo da plataforma vira a própria regra do jogo. Quem guia é a Jandi, uma jandaíra: abelha nativa sem ferrão do semiárido.","Four games in which the platform's content becomes the rules of play. Your guide is Jandi, a jandaíra: a native stingless bee from the Brazilian semiarid."))}</p>
    </div></div>
    <ol class="cm-trail">${TRAIL.map((t,i)=>`<li><button type="button" data-act="g-stage" data-v="${t.k}">
      ${CM().jandi(t.pose)}<span class="cm-step">${i+1}</span><b>${esc(L(t.t_pt,t.t_en))}</b><em>${esc(L(t.r_pt,t.r_en))}${t.k==="detetive"?" · "+esc(L("vários dias","several days")):" · "+t.min}</em><span>${esc(L(t.d_pt,t.d_en))}</span></button></li>`).join("")}</ol>
    <p class="cm-small">${esc(L("Na cor está a polinização viva; o que se perde vira cinza-poeira. Os jogos usam os dados da plataforma, mas suas regras de pontuação e dificuldade são didáticas, não estimativas.","Colour is living pollination; what is lost turns to dust grey. The games use the platform's data, but their scoring and difficulty rules are for teaching, not estimates."))}</p>
  </section>`;
}
function refs(){
  const R = [
    ["Giannini, T. C. et al. (2015). Crop pollinators in Brazil: a review of reported interactions. Journal of Economic Entomology, 108(3), 849–857.","https://doi.org/10.1093/jee/tov093"],
    ["Klein, A.-M. et al. (2007). Importance of pollinators in changing landscapes for world crops. Proceedings of the Royal Society B, 274, 303–313.","https://doi.org/10.1098/rspb.2006.3721"],
    ["Giannini, T. C. et al. (2017). Projected climate change threatens pollinators and crop production in Brazil. PLoS ONE, 12(8), e0182274.","https://doi.org/10.1371/journal.pone.0182274"],
    ["Settele, J., Bishop, J. & Potts, S. G. (2016). Climate change impacts on pollination. Nature Plants, 2, 16092.","https://doi.org/10.1038/nplants.2016.92"],
    ["Potts, S. G. et al. (2016). Safeguarding pollinators and their values to human well-being. Nature, 540, 220–229.","https://doi.org/10.1038/nature20588"],
    ["IPBES (2016). The assessment report on pollinators, pollination and food production. Bonn: IPBES Secretariat.","https://doi.org/10.5281/zenodo.3402856"]
  ];
  return `<section class="section">${X.fold("g-refs", `<span class="fold-title">${esc(L("Base científica dos jogos","Scientific basis of the games"))}</span>`, "", `<p class="sub">${esc(L("Feira: DRs da base de evidências verificada e, para os demais alimentos, da Tabela 1 de Giannini et al. (2015) como transcrita no catálogo. Quanto Vale: dados do manuscrito (sistema 4M, Abrafrutas 2024). Detetive: estados registrados na base de evidências, no catálogo v30 e no registro de fontes. Voo da abelha: mecanismos de calor, seca, agrotóxicos e perda de habitat descritos qualitativamente a partir das sínteses abaixo.","Market: DRs from the verified evidence base and, for other foods, from Table 1 of Giannini et al. (2015) as transcribed in the catalog. Bee Worth: manuscript data (4M system, Abrafrutas 2024). Detective: statuses recorded in the evidence base, catalog v30 and source registry. Bee's flight: heat, drought, pesticide and habitat-loss mechanisms described qualitatively from the syntheses below."))}</p><ul class="refs">${R.map(r=>`<li>${esc(r[0])} <a href="${esc(r[1])}" target="_blank" rel="noopener">${esc(r[1].replace("https://doi.org/","doi:"))}</a></li>`).join("")}</ul>`)}</section>`;
}

G.page = function(){
  if(!TRAIL.some(t=>t.k===stage) && stage!=="intro") stage = "intro";
  const m = MODS()[stage];
  if(prev && prev!==stage){ const pm = MODS()[prev]; if(pm && pm.leave) pm.leave(); }
  prev = stage;
  if(m && m.mount) setTimeout(m.mount, 0);
  return `<div class="cm-wrap">${nav()}${stage==="intro"?intro():m?m.html():intro()}</div>${refs()}`;
};

G.banner = function(){
  return `<section class="section"><div class="cm-wrap"><div class="cm cm-banner">
    <div class="cm-banner-txt">${CM().jandi("cheer","bob")}<div>
      <span class="cm-banner-eyebrow">${esc(L("Novo · Jogos da Colmeia","New · Hive Games"))}</span>
      <h2 class="cm-title">${esc(L("Aprenda jogando com a Jandi","Learn by playing with Jandi"))}</h2>
      <p>${esc(L("Quatro jogos curtos que usam os dados desta plataforma: veja sua feira murchar sem abelhas, voe pelos cenários de perda, adivinhe quanto vale a polinização e fiscalize as evidências.","Four short games built on this platform's data: watch your market basket wither without bees, fly through the loss scenarios, guess what pollination is worth and inspect the evidence."))}</p>
      <button type="button" class="cm-big" data-act="g-open" data-v="intro">${esc(L("Ver todos os jogos","See all games"))}</button></div></div>
    <ul class="cm-banner-games">${TRAIL.map(t=>`<li><button type="button" data-act="g-open" data-v="${t.k}">${CM().jandi(t.pose)}<b>${esc(L(t.t_pt,t.t_en))}</b><span>${esc(t.k==="detetive"?L("vários dias","several days"):t.min)}</span></button></li>`).join("")}</ul>
  </div></div></section>`;
};

G.act = function(a, b){
  if(a==="g-open"){ stage = b.dataset.v; try{ sessionStorage.setItem("cm-stage", stage); }catch(_){} if(location.hash==="#jogo") X.renderMain(); else location.hash = "#jogo"; window.scrollTo(0,0); return true; }
  if(a==="g-stage"){ stage = b.dataset.v; try{ sessionStorage.setItem("cm-stage", stage); }catch(_){} X.renderMain(); const m = document.getElementById("main"); if(m) m.scrollIntoView({block:"start"}); return true; }
  if(a==="g-cm-sound"){ const on = CM().Sfx.toggle(); document.querySelectorAll(".cm-sound").forEach(el=>{ el.setAttribute("aria-pressed", on); el.textContent = on?L("Som ligado","Sound on"):L("Som desligado","Sound off"); });
    if(on){ const m = MODS()[stage]; if(m && m.mount && stage!=="voo") m.mount(); } return true; }
  for(const p in PREFIX){ if(a.indexOf(p)===0){ const m = MODS()[PREFIX[p]]; return m ? m.act(a, b) : false; } }
  return false;
};

G.init = function(ctx){
  X = ctx; CM().setLang(()=>X.S.lang);
  Object.values(MODS()).forEach(m=>{ if(m && m.init) m.init(ctx); });
  window.addEventListener("hashchange", ()=>{ const sh = document.getElementById("cmShare"); if(sh) sh.hidden = true; if(location.hash!=="#jogo"){ CM().Sfx.buzz(false); CM().Sfx.rain(false); } });
};
window.Game = G;
})();
