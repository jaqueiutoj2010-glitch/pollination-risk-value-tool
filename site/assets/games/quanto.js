/* Quanto Vale uma Abelha? — programa de auditório.
   Usa só os dados do manuscrito (sistema 4M, Abrafrutas 2024), os mesmos do cenário congelado da
   plataforma: valor dependente da polinização = valor da produção × DR. */
(function(){
"use strict";
let X = null; const CM = () => window.Colmeia;
const L = (pt,en) => X.L(pt,en), esc = s => X.esc(s);
const ORDER = ["Melon","Papaya","Watermelon","Mango"];
const CLASS = dr => dr>=.9?L("essencial","essential"):dr>=.5?L("grande","great"):dr>=.2?L("modesta","modest"):dr>0?L("pouca","little"):L("sem aumento","no increase");
let Q = null;
function st(){ if(!Q) Q = {i:0, phase:"intro", guess:0, scores:[], streak:0, bonus:null, name:""}; return Q; }
function rows(){ const a = X.getD().article || []; return ORDER.map(c=>a.find(r=>r.Crop===c)).filter(Boolean); }
const nm = r => X.S.lang==="pt" ? (r.Crop_PT||r.Crop) : r.Crop;
const f1 = v => CM().num(v,1);
const money = v => "US$ "+f1(v)+" M";
function grade(g, real, range){ const e = Math.abs(g-real)/Math.max(real, range*.1); return e<=.10 ? 2 : e<=.25 ? 1 : 0; }
const total = () => st().scores.reduce((a,b)=>a+b,0);
function finalScore(){ const q = st(); let t = total(); if(q.bonus && q.bonus.res!=null){ t = q.bonus.res===2 ? t*2 : q.bonus.res===0 ? Math.floor(t/2) : t; } return t; }
function level(t){ return t>=8 ? L("Jandaíra Lendária","Legendary Jandaíra") : t>=5 ? L("Rainha","Queen") : L("Operária","Worker"); }

/* ---------- peças do palco ---------- */
function flaps(text, id){ return `<span class="qv-flaps" id="${id||""}" aria-label="${esc(text)}">${[...text].map(ch=>`<span class="qv-flap${/[0-9]/.test(ch)?"":" s"}">${esc(ch)}</span>`).join("")}</span>`; }
function animateFlaps(el, finalText, ms){
  if(!el) return; const cells = [...el.querySelectorAll(".qv-flap")]; const fin = [...finalText];
  // ajusta o número de células
  el.innerHTML = fin.map(ch=>`<span class="qv-flap${/[0-9]/.test(ch)?"":" s"}">${/[0-9]/.test(ch)?"0":esc(ch)}</span>`).join("");
  const cs = [...el.querySelectorAll(".qv-flap")]; const t0 = performance.now(); let last = 0;
  const tick = now => { const k = (now-t0)/ms; cs.forEach((c,i)=>{ if(!/[0-9]/.test(fin[i])) return; const settle = .35+.6*i/cs.length; if(k>=settle){ c.textContent = fin[i]; c.classList.remove("spin"); } else { c.textContent = Math.floor(Math.random()*10); c.classList.add("spin"); } });
    if(now-last>70){ CM().Sfx.flip(); last = now; } if(k<1) requestAnimationFrame(tick); else cs.forEach((c,i)=>{ c.textContent = fin[i]; c.classList.remove("spin"); }); };
  requestAnimationFrame(tick);
}
function cart(r){ return `<div class="qv-cart"><div class="qv-crop">${X.cropIcon(r.Crop)}</div><svg viewBox="0 0 160 40" aria-hidden="true"><rect x="10" y="4" width="140" height="18" rx="4" fill="#8A5A3C"/><rect x="10" y="4" width="140" height="5" rx="2" fill="#A8744E"/><circle cx="35" cy="30" r="8" fill="#2E2418"/><circle cx="125" cy="30" r="8" fill="#2E2418"/><circle cx="35" cy="30" r="3" fill="#B8B2A7"/><circle cx="125" cy="30" r="3" fill="#B8B2A7"/></svg></div>`; }
function audience(cheer){ return `<div class="qv-aud${cheer?" cheer":""}" aria-hidden="true">${Array.from({length:11},(_,i)=>`<span style="--i:${i}">${CM().jandi(cheer?"cheer":"fly")}</span>`).join("")}</div>`; }
function stage(inner, opts){
  opts = opts||{};
  return `<div class="qv-stage">
    <div class="qv-curtain l"></div><div class="qv-curtain r"></div>
    <div class="qv-lights" aria-hidden="true">${Array.from({length:13},(_,i)=>`<i style="--i:${i}"></i>`).join("")}</div>
    <div class="qv-plaque">${esc(L("Abrafrutas · 2024 · sistema 4M, semiárido","Abrafrutas · 2024 · 4M system, semiarid"))}</div>
    <div class="qv-host">${CM().jandi(opts.pose||"host")}${opts.say?`<div class="qv-say">${esc(opts.say)}</div>`:""}</div>
    <div class="qv-inner">${inner}</div>
    ${audience(opts.cheer)}
  </div>`;
}
function honeyRange(id, max, val){
  const k = max>0 ? val/max : 0, n = 10;
  const hex = i => { const fill = clamp01(k*n - i); return `<button type="button" class="qv-hx" data-hx="${i}" aria-label="${esc(L(`Encher até ${(i+1)*10}%`,`Fill to ${(i+1)*10}%`))}"><svg viewBox="0 0 52 60" aria-hidden="true"><defs><clipPath id="hx${id}${i}"><path d="M26 2 50 16v28L26 58 2 44V16Z"/></clipPath></defs><path d="M26 2 50 16v28L26 58 2 44V16Z" fill="#FFF6E5" stroke="#8A5A3C" stroke-width="2.5"/><g clip-path="url(#hx${id}${i})"><rect x="0" y="${60-60*fill}" width="52" height="60" fill="#F2A93B"/></g></svg></button>`; };
  const v1 = String(val.toFixed(1)).replace(".", X.S.lang==="pt"?",":".");
  return `<div class="qv-honey" id="${id}Wrap">
    <p class="qv-howto">${esc(L("Toque num favo para encher até ele. Depois ajuste na barra, nos botões ou digitando o valor.","Tap a comb to fill up to it. Then fine-tune with the bar, the buttons or by typing the value."))}</p>
    <div class="qv-hexes">${Array.from({length:n},(_,i)=>hex(i)).join("")}</div>
    <div class="qv-fine">
      <button type="button" class="qv-step" data-step="-1" aria-label="${esc(L("Diminuir","Decrease"))}">−</button>
      <input type="range" id="${id}" class="qv-slider" min="0" max="${max.toFixed(1)}" step="0.1" value="${val.toFixed(1)}" aria-label="${esc(L("Seu chute em milhões de dólares","Your guess in millions of dollars"))}">
      <button type="button" class="qv-step" data-step="1" aria-label="${esc(L("Aumentar","Increase"))}">+</button>
    </div>
    <div class="qv-scale"><span>US$ 0</span><span>${esc(money(max))}</span></div>
    <label class="qv-guessval" for="${id}Num"><span>${esc(L("Seu chute (milhões de US$)","Your guess (US$ millions)"))}</span>
      <span class="qv-num">US$ <input id="${id}Num" type="text" inputmode="decimal" value="${v1}" autocomplete="off"> M</span></label>
  </div>`;
}
const clamp01 = v => Math.max(0,Math.min(1,v));
function bindHoney(id, max, onChange){
  const inp = document.getElementById(id), wrap = document.getElementById(id+"Wrap"), num = document.getElementById(id+"Num"); if(!inp || !wrap) return;
  const step = Math.max(.1, Math.round(max/50*10)/10);
  const set = (v, from) => {
    v = Math.round(Math.max(0, Math.min(max, v))*10)/10; onChange(v);
    if(from!=="range") inp.value = v;
    if(from!=="num" && num) num.value = v.toFixed(1).replace(".", X.S.lang==="pt"?",":".");
    const k = max>0 ? v/max : 0;
    wrap.querySelectorAll(".qv-hx").forEach((b,i)=>{ const fill = clamp01(k*10-i); b.querySelector("rect").setAttribute("y", 60-60*fill); });
  };
  inp.addEventListener("input", ()=>set(+inp.value, "range"));
  wrap.querySelectorAll(".qv-hx").forEach(b=>b.addEventListener("click", ()=>{ const i = +b.dataset.hx, target = max*(i+1)/10, cur = +inp.value; set(Math.abs(cur-target)<1e-6 ? max*i/10 : target); CM().Sfx.flip(); }));
  wrap.querySelectorAll(".qv-step").forEach(b=>b.addEventListener("click", ()=>set(+inp.value + step*(+b.dataset.step))));
  if(num){ num.addEventListener("input", ()=>{ const v = parseFloat(num.value.replace(/\./g, X.S.lang==="pt"?"":".").replace(",", ".")); if(!isNaN(v)) set(v, "num"); });
    num.addEventListener("blur", ()=>set(+inp.value)); }
}
function pile(prod, part, dr){
  const H = 180, h = H*clamp01(dr);
  return `<div class="qv-pile"><svg viewBox="0 0 120 ${H+20}" aria-hidden="true">
      ${Array.from({length:12},(_,i)=>`<rect x="20" y="${10+i*H/12}" width="80" height="${H/12-2}" rx="3" fill="#7FAF6E" stroke="#4C8C4A" stroke-width="1.5"/>`).join("")}
      <rect class="qv-gold" x="14" y="${10+H-h}" width="92" height="${h}" rx="4" fill="#F2A93B" fill-opacity=".85" stroke="#C7841F" stroke-width="2.5"/>
    </svg>
    <div class="qv-pile-l"><span>${esc(L("Valor da produção","Production value"))}</span><b>${money(prod)}</b><span class="gold">${esc(L("Parte que depende das abelhas","Part that depends on bees"))}</span><b class="gold">${money(part)}</b><em>${esc(Math.round(dr*100)+"% "+L("da produção","of production"))}</em></div></div>`;
}
function badge(sc){ return sc===2 ? `<span class="qv-badge full">${hexIcon(1)} ${esc(L("Favo cheio: 2 pontos","Full comb: 2 points"))}</span>` : sc===1 ? `<span class="qv-badge half">${hexIcon(.5)} ${esc(L("Meio favo: 1 ponto","Half comb: 1 point"))}</span>` : `<span class="qv-badge none">${hexIcon(0)} ${esc(L("Passou longe: 0 pontos","Way off: 0 points"))}</span>`; }
function hexIcon(k){ return `<svg viewBox="0 0 52 60" aria-hidden="true"><path d="M26 2 50 16v28L26 58 2 44V16Z" fill="#FFF6E5" stroke="#8A5A3C" stroke-width="3"/><path d="M26 2 50 16v28L26 58 2 44V16Z" fill="#F2A93B" style="clip-path:inset(${(1-k)*100}% 0 0 0)"/></svg>`; }
function scoreRow(){ const q = st(); return `<div class="qv-score">${rows().map((r,i)=>`<span title="${esc(nm(r))}">${q.scores[i]==null?`<svg viewBox="0 0 52 60" aria-hidden="true"><path d="M26 2 50 16v28L26 58 2 44V16Z" fill="none" stroke="#B8B2A7" stroke-width="3" stroke-dasharray="4 4"/></svg>`:hexIcon(q.scores[i]/2)}</span>`).join("")}<b>${total()} ${esc(L("pts","pts"))}</b></div>`; }

/* ---------- telas ---------- */
function body(){
  const q = st(), R = rows();
  if(!R.length) return `<p>${esc(L("Dados do artigo indisponíveis.","Article data unavailable."))}</p>`;
  if(q.phase==="intro") return stage(`<div class="qv-card">
      <h3 class="cm-title">${esc(L("Quanto Vale uma Abelha?","How Much Is a Bee Worth?"))}</h3>
      <p>${esc(L("Quatro culturas do sistema 4M sobem ao palco. Para cada uma, você vê os números da produção e chuta quantos milhões de dólares dependem dos polinizadores.","Four crops from the 4M system take the stage. For each one, you see the production figures and guess how many million dollars depend on pollinators."))}</p>
      <p class="cm-small">${esc(L("Pontos: dentro de 10% do valor real, favo cheio; dentro de 25%, meio favo; mais longe, nenhum ponto.","Scoring: within 10% of the real value, a full comb; within 25%, half a comb; further away, no points."))}</p>
      <button type="button" class="cm-big" data-act="g-qv-start">${esc(L("Abrir as cortinas","Open the curtains"))}</button></div>`, {say:L("Boa noite, auditório!","Good evening, audience!")});
  if(q.phase==="guess"||q.phase==="reveal"){
    const r = R[q.i], real = r.Production_Value*r.Pollination_Dependence, max = r.Production_Value;
    const hint = q.i>0 ? L(`Dica: a dependência desta cultura é ${CLASS(r.Pollination_Dependence)}.`,`Hint: this crop's dependence is ${CLASS(r.Pollination_Dependence)}.`) : L("Primeira rodada: chute no escuro!","First round: take a shot in the dark!");
    const clues = `<div class="qv-board">
        <div><span>${esc(L("Produção","Production"))}</span>${flaps(f1(r.Production)+(X.S.lang==="pt"?" mil t":" kt"))}</div>
        <div><span>${esc(L("Valor da produção","Production value"))}</span>${flaps(money(r.Production_Value))}</div>
        <div><span>${esc(L("Volume exportado","Export volume"))}</span>${flaps(f1(r.Export_Volume)+(X.S.lang==="pt"?" mil t":" kt"))}</div>
        <div><span>${esc(L("Valor das exportações","Export value"))}</span>${flaps(money(r.Export_Value))}</div>
      </div>`;
    if(q.phase==="guess") return stage(`<div class="qv-round"><span class="qv-n">${esc(L(`Rodada ${q.i+1} de ${R.length}`,`Round ${q.i+1} of ${R.length}`))}</span>${scoreRow()}</div>
      <div class="qv-show">${cart(r)}<div><h3 class="qv-name">${esc(nm(r))} <i>${esc(r.Scientific_name)}</i></h3>${clues}</div></div>
      <p class="qv-ask">${esc(L("Quantos milhões dependem dos polinizadores?","How many millions depend on pollinators?"))}</p>
      ${honeyRange("qvIn", max, q.guess)}
      <button type="button" class="cm-big" data-act="g-qv-lock">${esc(L("Valendo!","Final answer!"))}</button>`, {say:hint, pose: q.i>0?"tip":"host"});
    const sc = q.scores[q.i];
    return stage(`<div class="qv-round"><span class="qv-n">${esc(L(`Rodada ${q.i+1} de ${R.length}`,`Round ${q.i+1} of ${R.length}`))}</span>${scoreRow()}</div>
      <div class="qv-reveal"><div class="qv-big"><span>${esc(L("Você chutou","You guessed"))} <b>${money(q.guess)}</b></span><span>${esc(L("Valor real","Real value"))}</span>${flaps(money(real),"qvReal")}</div>
      ${pile(r.Production_Value, real, r.Pollination_Dependence)}</div>
      <div class="qv-result" id="qvRes" hidden>${badge(sc)}<p>${esc(sc===2?L("Na mosca!","Spot on!"):sc===1?L("Chegou perto.","Close.") : real===0?L("Surpresa: na base do artigo, a manga não ganha produção com polinizadores (DR 0). Nem toda fruta depende de abelhas.","Surprise: in the article's data, mango gains no production from pollinators (DR 0). Not every fruit depends on bees."):L("Repare no tamanho da fatia dourada: é a dependência da cultura.","Look at the size of the golden slice: that's the crop's dependence."))}</p>
      <button type="button" class="cm-big" data-act="g-qv-next">${esc(q.i+1<R.length?L("Próxima cultura","Next crop"):L("Rodada bônus","Bonus round"))}</button></div>`, {pose: sc===2?"cheer":sc===0?"cross":"host", cheer:q.streak>=3 && sc===2});
  }
  if(q.phase==="bonusAsk"){ const b = q.bonus, r = R.find(x=>x.Crop===b.crop);
    return stage(`<div class="qv-card"><span class="qv-n">${esc(L("Rodada bônus","Bonus round"))} · ${total()} ${esc(L("pts","pts"))}</span>
      <h3 class="cm-title">${esc(L("Dobrar ou parar?","Double or stop?"))}</h3>
      <p>${esc(L(`E se os polinizadores caíssem ${b.scen}%? Quanto do valor ${r.Crop==="Melon"?"do melão":"da melancia"} ficaria em risco?`,`What if pollinators fell by ${b.scen}%? How much of the ${nm(r).toLowerCase()} value would be at risk?`))}</p>
      <p class="cm-small">${esc(L("Favo cheio dobra seus pontos. Meio favo mantém. Passar longe custa metade.","A full comb doubles your points. Half a comb keeps them. Being way off costs half."))}</p>
      <div class="cm-row"><button type="button" class="cm-big" data-act="g-qv-double">${esc(L("Dobrar","Double"))}</button><button type="button" class="cm-btn ghost" data-act="g-qv-stop">${esc(L("Parar e levar o certificado","Stop and take the certificate"))}</button></div></div>`, {say:L(`Cenário de ${b.scen}% da plataforma. Valendo o dobro!`,`The platform's ${b.scen}% scenario. Double or nothing!`)});
  }
  if(q.phase==="bonus"||q.phase==="bonusReveal"){ const b = q.bonus, r = R.find(x=>x.Crop===b.crop), evp = r.Production_Value*r.Pollination_Dependence, real = evp*b.scen/100;
    if(q.phase==="bonus") return stage(`<div class="qv-card"><span class="qv-n">${esc(L("Rodada bônus","Bonus round"))}</span>
      <div class="qv-show">${cart(r)}<div><h3 class="qv-name">${esc(nm(r))}</h3><p>${esc(L(`Parte que depende das abelhas: ${money(evp)}. Queda dos polinizadores: ${b.scen}%.`,`Part that depends on bees: ${money(evp)}. Pollinator decline: ${b.scen}%.`))}</p></div></div>
      <p class="qv-ask">${esc(L("Quantos milhões ficam em risco?","How many millions are at risk?"))}</p>
      ${honeyRange("qvIn", evp, b.guess||0)}
      <button type="button" class="cm-big" data-act="g-qv-block">${esc(L("Valendo o dobro!","Double or nothing!"))}</button></div>`, {say:L("Pense no cenário, não no total.","Think about the scenario, not the total."), pose:"tip"});
    return stage(`<div class="qv-card"><span class="qv-n">${esc(L("Rodada bônus","Bonus round"))}</span>
      <div class="qv-big"><span>${esc(L("Você chutou","You guessed"))} <b>${money(b.guess)}</b></span><span>${esc(L("Em risco","At risk"))}</span>${flaps(money(real),"qvReal")}</div>
      <div class="qv-result" id="qvRes" hidden>${badge(b.res)}<p>${esc(L(`O valor em risco depende do cenário: ${money(evp)} × ${b.scen}% = ${money(real)}. Em outro cenário, o número seria outro.`,`The value at risk depends on the scenario: ${money(evp)} × ${b.scen}% = ${money(real)}. In another scenario, the number would differ.`))}</p>
      <button type="button" class="cm-big" data-act="g-qv-end">${esc(L("Ver o certificado","See the certificate"))}</button></div></div>`, {pose: b.res===2?"cheer":b.res===0?"cross":"host", cheer:b.res===2});
  }
  // fim
  const t = finalScore();
  return stage(`<div class="qv-card qv-cert">
      <div class="qv-frame"><span class="qv-n">${esc(L("Certificado","Certificate"))}</span>
      <h3 class="cm-title">${esc(L("Especialista em Valor da Polinização","Pollination Value Specialist"))}</h3>
      <p class="qv-level">${esc(L("nível","level"))} <b>${esc(level(t))}</b></p>
      <p>${esc(L(`${t} ${t===1?"ponto":"pontos"}. Você já sabe a conta: valor da produção vezes a dependência, e depois o cenário.`,`${t} points. You know the math now: production value times dependence, then the scenario.`))}</p>
      <label class="qv-namel" for="qvName">${esc(L("Seu nome no certificado","Your name on the certificate"))}<input id="qvName" type="text" maxlength="40" value="${esc(q.name)}" autocomplete="name"></label></div>
      <div class="cm-row"><button type="button" class="cm-big" data-act="g-qv-cert">${esc(L("Gerar certificado","Make the certificate"))}</button><button type="button" class="cm-btn ghost" data-act="g-qv-again">${esc(L("Jogar de novo","Play again"))}</button><a class="cm-btn ghost" href="#cenarios">${esc(L("Usar a calculadora de verdade","Use the real calculator"))}</a></div></div>`, {pose:"cheer", cheer:true, say:L("Que noite!","What a night!")});
}

async function certificate(){
  const q = st(), t = finalScore(), W = 1600, H = 1130, c = document.createElement("canvas"); c.width=W; c.height=H; const g = c.getContext("2d");
  CM().paper(g, W, H, "#FFF8EA");
  const gold = g.createLinearGradient(0,0,W,H); gold.addColorStop(0,"#C99A2E"); gold.addColorStop(.5,"#FFE08A"); gold.addColorStop(1,"#B5822A");
  g.strokeStyle = gold; g.lineWidth = 34; g.strokeRect(40,40,W-80,H-80); g.lineWidth = 4; g.strokeStyle = "#8A5A3C"; g.strokeRect(80,80,W-160,H-160);
  for(let i=0;i<4;i++){ const x = i%2?W-120:120, y = i<2?120:H-120; g.fillStyle="#F2A93B"; g.beginPath(); for(let k=0;k<6;k++){ const a=Math.PI/3*k+Math.PI/6; g.lineTo(x+30*Math.cos(a), y+30*Math.sin(a)); } g.fill(); }
  g.textAlign="center"; g.fillStyle="#8A5A3C"; g.font="600 40px Fredoka, system-ui, sans-serif"; g.fillText(L("Certificado","Certificate").toUpperCase(), W/2, 220);
  g.fillStyle="#2E2418"; g.font="700 78px Fredoka, system-ui, sans-serif"; g.fillText(L("Especialista em Valor da Polinização","Pollination Value Specialist"), W/2, 330);
  g.font="500 40px Inter, system-ui, sans-serif"; g.fillText(L("concedido a","awarded to"), W/2, 420);
  g.font="700 88px Caveat, 'Fredoka', cursive"; g.fillStyle="#8A5A3C"; g.fillText(q.name||L("Visitante da Colmeia","Hive Visitor"), W/2, 530);
  g.fillStyle="#2E2418"; g.font="600 54px Fredoka, system-ui, sans-serif"; g.fillText(L("nível ","level ")+level(t), W/2, 650);
  g.font="400 34px Inter, system-ui, sans-serif"; CM().wrapText(g, L(`${t} ${t===1?"ponto":"pontos"} no programa Quanto Vale uma Abelha? com dados do sistema 4M (Abrafrutas, 2024).`,`${t} ${t===1?"point":"points"} on How Much Is a Bee Worth? with 4M system data (Abrafrutas, 2024).`), W/2, 740, W-400, 46);
  g.font="500 30px Inter, system-ui, sans-serif"; g.fillStyle="#8A5A3C"; g.fillText("Pollination Risk and Value Tool · "+new Date().toLocaleDateString(X.S.lang==="pt"?"pt-BR":"en-US"), W/2, H-150);
  const jd = await CM().svgToImage(CM().jandi("host")); if(jd) g.drawImage(jd, W-360, H-420, 220, 220);
  CM().share(c, {text:L(`Sou Especialista em Valor da Polinização, nível ${level(t)}! Quanto vale uma abelha para você?`,`I'm a Pollination Value Specialist, level ${level(t)}! How much is a bee worth to you?`), file:"certificado-polinizacao.png", alt:L("Certificado","Certificate")});
}

function rerender(){ const r = document.getElementById("qvRoot"); if(!r) return; r.innerHTML = body(); mountScreen(); }
function mountScreen(){
  const q = st(), R = rows();
  if(q.phase==="guess"){ const r = R[q.i]; bindHoney("qvIn", r.Production_Value, v=>q.guess=v);
    document.querySelectorAll(".qv-board .qv-flaps").forEach((el,i)=>{ const txt = el.getAttribute("aria-label"); setTimeout(()=>animateFlaps(el, txt, 700), i*180); }); }
  if(q.phase==="bonus"){ const b = q.bonus, r = R.find(x=>x.Crop===b.crop); bindHoney("qvIn", r.Production_Value*r.Pollination_Dependence, v=>b.guess=v); }
  if(q.phase==="reveal"||q.phase==="bonusReveal"){
    const el = document.getElementById("qvReal"); const txt = el.getAttribute("aria-label");
    el.querySelectorAll(".qv-flap").forEach(c=>{ if(/[0-9]/.test(c.textContent)) c.textContent = "0"; });
    CM().Sfx.drum(1.6); setTimeout(()=>animateFlaps(el, txt, 1500), 300);
    const sc = q.phase==="reveal" ? q.scores[q.i] : q.bonus.res;
    setTimeout(()=>{ const r = document.getElementById("qvRes"); if(r) r.hidden = false; const gd = document.querySelector(".qv-gold"); if(gd) gd.classList.add("on");
      if(sc===2) CM().Sfx.plim(); else if(sc===0) CM().Sfx.murchar(); if(document.querySelector(".qv-aud.cheer")) CM().Sfx.applause(); }, 2000);
  }
  const nameIn = document.getElementById("qvName"); if(nameIn) nameIn.addEventListener("input", ()=>q.name = nameIn.value);
}

const API = {};
API.html = () => `<section class="section cm"><div class="cm-head"><h2 class="cm-title">${esc(L("Quanto Vale uma Abelha?","How Much Is a Bee Worth?"))}</h2><button type="button" class="cm-sound" data-act="g-cm-sound" aria-pressed="${CM().Sfx.on}">${esc(CM().Sfx.on?L("Som ligado","Sound on"):L("Som desligado","Sound off"))}</button></div><div id="qvRoot">${body()}</div></section>`;
API.mount = () => mountScreen();
API.act = function(a){
  const q = st(), R = rows();
  if(a==="g-qv-start"){ q.phase = "guess"; q.i = 0; q.guess = 0; q.scores = []; q.streak = 0; q.bonus = null; }
  else if(a==="g-qv-lock"){ const r = R[q.i]; const sc = grade(q.guess, r.Production_Value*r.Pollination_Dependence, r.Production_Value); q.scores[q.i] = sc; q.streak = sc===2 ? q.streak+1 : 0; q.phase = "reveal"; }
  else if(a==="g-qv-next"){ if(q.i+1<R.length){ q.i++; q.guess = 0; q.phase = "guess"; } else { const sc = [10,25,50][Math.floor(Math.random()*3)]; q.bonus = {crop: Math.random()<.5?"Melon":"Watermelon", scen:sc, guess:0, res:null}; q.phase = "bonusAsk"; } }
  else if(a==="g-qv-double"){ q.phase = "bonus"; }
  else if(a==="g-qv-stop"){ q.phase = "end"; }
  else if(a==="g-qv-block"){ const b = q.bonus, r = R.find(x=>x.Crop===b.crop), evp = r.Production_Value*r.Pollination_Dependence; b.res = grade(b.guess, evp*b.scen/100, evp); q.phase = "bonusReveal"; }
  else if(a==="g-qv-end"){ q.phase = "end"; }
  else if(a==="g-qv-cert"){ certificate(); return true; }
  else if(a==="g-qv-again"){ Q = null; st().phase = "guess"; }
  else return false;
  rerender(); const r = document.getElementById("qvRoot"); if(r) r.scrollIntoView({block:"nearest"});
  return true;
};
API.init = ctx => { X = ctx; };
API._test = {st, rows, grade, finalScore};
window.GameQuanto = API;
})();
