/* Voo da abelha — fases de ação dentro da aba Jogo.
   A abelha atravessa os cenários padronizados da plataforma (10%, 25% e 50%) como níveis de
   dificuldade crescente, enfrentando calor, seca, galhos secos, agrotóxicos e desmatamento,
   até chegar à flor do melão. Densidade de flores e de ameaças por nível são regras do jogo. */
(function(){
"use strict";
let X = null;
const B = {};
const L = (pt,en) => X.L(pt,en);
const esc = s => X.esc(s);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
function rng(seed){ let a = seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ---------------- níveis ---------------- */
const LEVELS = [
  {red:10, speed:145, secs:32, flower:.68, heat:1.3, branch:.5, gap:.46, amp:0, spray:0, bare:0,
   sky:["#FFE7B8","#F8C77F"], hill:"#D9A35F", ground:"#B98546",
   t_pt:"Onda de calor", t_en:"Heatwave",
   d_pt:"Acima da temperatura que toleram, as abelhas voam e coletam menos. Fuja das zonas de calor: o ar quente sobe do chão e o sol castiga no alto. Dentro delas a energia cai muito mais rápido. Colete flores amarelas para repor o néctar.",
   d_en:"Above the temperature they tolerate, bees fly and forage less. Avoid the heat zones: hot air rises from the ground and the sun bakes the sky. Inside them energy drops much faster. Collect yellow flowers to refill nectar.",
   tip_pt:"O próximo nível é o cenário de 25%: menos flores e galhos secos fechando o caminho.",
   tip_en:"The next level is the 25% scenario: fewer flowers and dry branches blocking the way."},
  {red:25, speed:165, secs:34, flower:.6, heat:.7, branch:1, gap:.36, amp:.08, spray:0, bare:0,
   sky:["#F3E6CB","#DCC197"], hill:"#B79A6B", ground:"#9C7A4C",
   t_pt:"Seca na Caatinga", t_en:"Drought in the Caatinga",
   d_pt:"Com a seca, a vegetação nativa floresce menos e há menos néctar pelo caminho. Galhos secos com espinhos balançam e fecham a passagem: voe pelos espaços abertos. Cada batida custa muita energia.",
   d_en:"In a drought, native vegetation flowers less and there is less nectar along the way. Swaying thorny branches block the path: fly through the openings. Every hit costs a lot of energy.",
   tip_pt:"O último desafio é o cenário de 50%: nuvens de agrotóxico e trechos desmatados, sem flores.",
   tip_en:"The last challenge is the 50% scenario: pesticide clouds and cleared stretches with no flowers."},
  {red:50, speed:180, secs:36, flower:.52, heat:.6, branch:1, gap:.35, amp:.09, spray:1, bare:1,
   sky:["#E3E7DC","#BFC8B8"], hill:"#9AA58F", ground:"#7E715A",
   t_pt:"Agrotóxicos e desmatamento", t_en:"Pesticides and clearing",
   d_pt:"Nuvens de pulverização são o maior perigo: desvie delas. Nos trechos desmatados não há flores. E fique atenta ao aviso do avião agrícola: ele passa soltando gotas de agrotóxico.",
   d_en:"Spray clouds are the biggest danger: steer around them. Cleared stretches have no flowers. And watch for the crop-duster warning: it flies over dropping pesticide.",
   tip_pt:"Falta pouco, mas o vento quente vai atrapalhar: siga até a flor do melão.",
   tip_en:"Almost there, but hot wind will get in the way: fly on to the melon flower."},
  {red:null, speed:140, secs:12, flower:.45, heat:1, branch:0, spray:1, bare:0, wind:1, final:true,
   sky:["#DCEFF5","#C9E6C8"], hill:"#8CB98F", ground:"#5E8F5E",
   t_pt:"A flor", t_en:"The flower",
   d_pt:"Rajadas de vento quente empurram a abelha para cima e para baixo, e ainda há nuvens de agrotóxico perto da lavoura. Chegue até a grande flor do melão com energia.",
   d_en:"Hot wind gusts push the bee up and down, and there are still pesticide clouds near the field. Reach the big melon flower with energy left.",
   tip_pt:"", tip_en:""}
];
const NLV = LEVELS.length;

/* ---------------- estado ---------------- */
let R = null;            // partida
let C = null, ctx = null, W = 600, H = 340, DPR = 1, raf = 0;
const keys = {};
let ptr = null;          // {x, fy} alvo do toque/mouse

const SFX = () => (window.Colmeia ? window.Colmeia.Sfx : null);
function sfx(n,a){ const S = SFX(); if(S && S[n]) S[n](a); }
const LIVES = 3;
/* Abelhas nativas sem ferrão que a Jandi pode resgatar: cada uma voa atrás dela, aumenta o alcance
   para pegar flores e multiplica os pontos. Uma batida faz a última amiga se perder. */
const FRIENDS = [
  {id:"jatai", pt:"Jataí", en:"Jataí", sci:"Tetragonisca angustula", body:"#E3B341", band:"#B07A12", head:"#3B2618", sc:.62},
  {id:"mandacaia", pt:"Mandaçaia", en:"Mandaçaia", sci:"Melipona quadrifasciata", body:"#3B2B22", band:"#E9C46A", head:"#241812", sc:.82},
  {id:"urucu", pt:"Uruçu", en:"Uruçu", sci:"Melipona scutellaris", body:"#B5642A", band:"#6B3A1E", head:"#2E1C12", sc:.86},
  {id:"mocabranca", pt:"Moça-branca", en:"Moça-branca", sci:"Frieseomelitta sp.", body:"#EFE3C6", band:"#B8A27A", head:"#3B2618", sc:.66},
  {id:"tubiba", pt:"Tubiba", en:"Tubiba", sci:"Scaptotrigona sp.", body:"#2A2018", band:"#6E5A44", head:"#140E0A", sc:.7}
];
const JANDI = {body:"#B8692A", band:"#F0C14A", head:"#3B2618", sc:1};
function hiGet(){ try{ return +(localStorage.getItem("cm-voo-hi")||0) || 0; }catch(_){ return 0; } }
function hiSet(v){ try{ localStorage.setItem("cm-voo-hi", String(Math.round(v))); }catch(_){} }
function newRun(){ return {lv:0, status:"brief", total:0, best:{}, deaths:0, lives:LIVES, carry:100, score:0, hi:hiGet(), stars:{}, swarm:[], rescued:[], fruits:0, trail:[]}; }
function startLevel(i){
  const Lv = LEVELS[i], r = rng((Date.now() ^ (i*7919))>>>0);
  const len = Lv.speed*Lv.secs*1.15; // a velocidade cresce ao longo do nível
  const o = {flowers:[], branches:[], heat:[], spray:[], bare:[]};
  if(Lv.bare) for(let x=900; x<len-300; x+=1300+r()*400) o.bare.push({x0:x, x1:x+320+r()*100});
  const inBare = x => o.bare.some(b=>x>b.x0-20 && x<b.x1+20);
  const endPad = Lv.final ? 420 : 150;
  if(Lv.heat){ const step = Lv.heat>=1.3 ? 300 : Lv.heat>=1 ? 400 : 620; for(let x=380; x<len-endPad; x+=step+r()*260) { const up = r()<.5; o.heat.push({x, w:120+r()*90, up, edge: up ? .38+r()*.14 : .48+r()*.14}); } }
  if(Lv.branch){ const step = Lv.branch>=1 ? 300 : 620; for(let x=520; x<len-endPad; x+=step+r()*150) o.branches.push({x, w:26, gc0:.3+r()*.4, gc:.5, gap:Lv.gap, amp:Lv.amp*(.6+r()*.8), w2:1.2+r()*1.2, ph:r()*6.28}); }
  if(Lv.spray){ const step = Lv.spray>=1 ? 400 : 520; for(let x=650; x<len-endPad; x+=step+r()*300) o.spray.push({x, fy:.2+r()*.6, rr:.10+r()*.05, vy:(r()<.5?-1:1)*(.12+r()*.16), ph:r()*6}); }
  o.branches.forEach(b=>b.gc=b.gc0);
  o.gold = []; o.water = []; o.planes = []; o.drops = []; o.friends = []; o.fruit = [];
  if(!Lv.final){ const pool = FRIENDS.filter(f=>!(R.rescued||[]).includes(f.id)); for(let k=0;k<2 && pool.length;k++){ const sp = pool.splice(Math.floor(r()*pool.length),1)[0]; o.friends.push({x: len*(.25+.45*k) + r()*300, fy:.22+r()*.5, sp:sp.id, got:false}); } }
  for(let x=900; x<len-200; x+=1500+r()*700) o.gold.push({x, fy:.2+r()*.55, got:false});
  if(i>=1) for(let x=1400; x<len-200; x+=1700+r()*600) o.water.push({x, fy:.25+r()*.5, got:false});
  if(i>=2) for(let x=1100; x<len-500; x+=1500+r()*700) o.planes.push({x, on:false, warn:0, px:0, drop:0, done:false});
  for(let x=220; x<len-40; x+=95+r()*70){
    if(inBare(x) || r()>Lv.flower) continue;
    let fy = .14+r()*.66;
    const br = o.branches.find(b=>Math.abs(b.x+b.w/2-x)<70);
    if(br) fy = br.gc + (r()-.5)*br.gap*.5;
    const sp = o.spray.find(s=>Math.abs(s.x-x)<80); if(sp && Math.abs(sp.fy-fy)<.2) continue;
    o.flowers.push({x, fy, got:false, ph:r()*6});
  }
  const nFlowers = o.flowers.length;
  if(R.levelStartScore==null || R.lv!==i) R.levelStartScore = R.score||0;
  R.score = R.levelStartScore;
  if(!R.swarm) R.swarm = []; if(!R.rescued) R.rescued = []; R.trail = [];
  R.swarmAtStart = R.swarm.slice(); R.rescuedAtStart = R.rescued.slice();
  Object.assign(R, {nFlowers, combo:0, comboT:-9, dash:0, dashCd:0, shield:0, shake:0, texts:[], lastSfx:{},
    lv:i, status:"brief", e:R.carry==null?100:R.carry, wind:0, windT:1.5, bx:Math.min(110, W*.22), by:.5, dist:0, len, o, inv:0, got:0, t:0,
    cause:null, last:null, lastT:-9, parts:[], goal: Lv.final ? {x:len, fy:.52} : null, winT:0});
}

/* ---------------- lógica ---------------- */
function update(dt){
  if(!R || R.status!=="play") { if(R && R.status==="win") R.winT += dt; tickParts(dt); return; }
  const Lv = LEVELS[R.lv], o = R.o;
  R.t += dt;
  const spd = Lv.speed*(1+.3*clamp(R.dist/R.len,0,1));
  if(Lv.final){ R.dist = Math.min(R.dist + spd*dt, R.len - W*(W<520?.6:.72)); }
  else R.dist += spd*dt;
  for(const b of o.branches) if(b.amp) b.gc = clamp(b.gc0 + b.amp*Math.sin(R.t*b.w2+b.ph), .22, .78);
  if(Lv.wind){ R.windT -= dt; if(R.windT<=0){ R.wind = (Math.random()<.5?-1:1)*(.38+Math.random()*.26); R.windT = 1.1+Math.random()*1.2; } R.wind *= Math.pow(.35,dt); R.by += R.wind*dt; }

  // arrancada, escudo, efeitos
  R.dash = Math.max(0, R.dash-dt); R.dashCd = Math.max(0, R.dashCd-dt); R.shield = Math.max(0, R.shield-dt); R.shake = Math.max(0, R.shake-dt);
  if(keys.dash){ keys.dash = false; tryDash(); }
  R.score += spd*dt*.05;
  // avião agrícola: atravessa o alto da tela soltando gotas
  for(const pl of o.planes){
    if(pl.done) continue;
    if(!pl.on && R.dist > pl.x - W*.2){ pl.on = true; pl.warn = 1.1; pl.px = W + 60; sfx("zap"); }
    if(pl.on){ if(pl.warn>0){ pl.warn -= dt; } else { pl.px -= 330*dt; pl.drop -= dt; if(pl.drop<=0 && pl.px>-20 && pl.px<W){ pl.drop = .09; o.drops.push({x:pl.px + R.dist, fy:.12, vy:.0}); } if(pl.px < -120) pl.done = true; } }
  }
  for(const d of o.drops){ d.vy += .9*dt; d.fy += d.vy*dt; }
  o.drops = o.drops.filter(d=>d.fy<.92);

  // movimento
  const sp = 260, spy = sp/H;
  let kx = (keys.right?1:0)-(keys.left?1:0), ky = (keys.down?1:0)-(keys.up?1:0);
  if(R.dash>0) R.bx += 380*dt;
  if(kx||ky){ R.bx += kx*sp*dt; R.by += ky*spy*dt; }
  else if(ptr){ R.bx += (ptr.x-R.bx)*Math.min(1,7*dt); R.by += (ptr.fy-R.by)*Math.min(1,7*dt); }
  const maxX = Lv.final ? W-30 : W*(R.dash>0?.72:.58);
  if(R.bx > W*.58 && !Lv.final && R.dash<=0) R.bx -= 160*dt;
  R.bx = clamp(R.bx, 26, maxX); R.by = clamp(R.by, .06, .86);
  const wx = R.dist + R.bx, by = R.by*H;

  // energia
  R.e -= (Lv.final?2.2:3.4)*dt;
  R.inv = Math.max(0, R.inv-dt);
  const safe = R.dash>0 || R.shield>0;
  if(!safe) for(const h of o.heat) if(wx>h.x && wx<h.x+h.w && (h.up ? R.by<h.edge : R.by>h.edge)){ R.e -= 18*dt; R.last = "heat"; R.lastT = R.t; }
  for(const s of o.spray){
    s.fy += s.vy*dt; if(s.fy<.15||s.fy>.78) s.vy*=-1;
    const dx = wx-s.x, dy = by-s.fy*H, rr = s.rr*H + 8;
    if(!safe && dx*dx+dy*dy < rr*rr){ R.e -= 22*dt; R.last = "spray"; R.lastT = R.t; R.combo = 0; once("murchar", 1.2); }
  }
  for(const d of o.drops){ if(!safe && R.inv<=0 && Math.abs(wx-d.x)<14 && Math.abs(by-d.fy*H)<16){ R.e -= 10; R.inv = .5; R.shake = .2; R.last = "spray"; R.lastT = R.t; R.combo = 0; loseFriend(); d.fy = 2; burst(R.bx, by, "#8CA078", 8); once("murchar", .6); } }
  for(const b of o.branches){
    if(wx+11>b.x && wx-11<b.x+b.w){
      const top = (b.gc-b.gap/2)*H, bot = (b.gc+b.gap/2)*H;
      if((by-10<top || by+10>bot) && R.inv<=0 && !safe){
        R.e -= 20; R.inv = .9; R.last = "branch"; R.lastT = R.t; R.shake = .3; R.combo = 0; sfx("tum"); loseFriend();
        R.by = clamp(b.gc + (R.by<b.gc?-.05:.05), .06, .86);
        burst(R.bx, by, "#8A5A2B", 8);
      }
    }
  }
  for(const f of o.flowers){
    if(f.got) continue;
    const reach = 24 + 9*R.swarm.length;
    if(Math.abs(wx-f.x)<reach && Math.abs(by-f.fy*H)<reach){ f.got = true; R.e = Math.min(100, R.e+9); R.got++; R.fruits++; o.fruit.push({x:f.x, t:R.t}); burst(f.x-R.dist, f.fy*H, "#F2B705", 10);
      R.combo = (R.t-R.comboT<1.6) ? Math.min(5, R.combo+1) : 1; R.comboT = R.t;
      const pts = Math.round(10*R.combo*(R.shield>0?2:1)*(1+.25*R.swarm.length)); R.score += pts; R.texts.push({x:R.bx, y:by-18, s:"+"+pts+(R.combo>1?"  ×"+R.combo:""), life:.9}); once("plim", .12); }
  }
  for(const fr of o.friends){ if(!fr.got && Math.abs(wx-fr.x)<30 && Math.abs(by-fr.fy*H)<30){ fr.got = true; R.swarm.push(fr.sp); if(!R.rescued.includes(fr.sp)) R.rescued.push(fr.sp); const sp = FRIENDS.find(f=>f.id===fr.sp);
      R.score += 100; R.texts.push({x:R.bx, y:by-24, s:L(`${sp.pt} resgatada!`,`${sp.en} rescued!`), life:1.6}); burst(R.bx, by, "#FFF1CC", 20); sfx("applause"); } }
  R.trail.unshift({x:R.bx, y:R.by}); if(R.trail.length>60) R.trail.length = 60;
  for(const gd of o.gold){ if(!gd.got && Math.abs(wx-gd.x)<26 && Math.abs(by-gd.fy*H)<26){ gd.got = true; R.shield = 4.5; R.score += 50; R.texts.push({x:R.bx, y:by-20, s:L("Pólen dourado! escudo","Golden pollen! shield"), life:1.3}); burst(R.bx, by, "#FFD66B", 24); sfx("plim"); } }
  for(const w of o.water){ if(!w.got && Math.abs(wx-w.x)<24 && Math.abs(by-w.fy*H)<24){ w.got = true; R.e = Math.min(100, R.e+25); R.score += 20; R.texts.push({x:R.bx, y:by-20, s:L("Água! +25","Water! +25"), life:1.1}); burst(R.bx, by, "#7FB8E0", 16); sfx("zap"); } }
  R.texts.forEach(t=>{ t.y -= 30*dt; t.life -= dt; }); R.texts = R.texts.filter(t=>t.life>0);
  if(R.e<=0){ R.e = 0; R.cause = (R.last && R.t-R.lastT<1.5) ? R.last : "hunger"; R.deaths++; R.lives--; R.swarm = (R.swarmAtStart||[]).slice(); R.rescued = (R.rescuedAtStart||[]).slice(); R.status = R.lives>0 ? "dead" : "over"; sfx("murchar"); if(R.status==="over") saveHi(); chrome(); return; }

  if(Lv.final){
    const gx = R.goal.x - R.dist, gy = R.goal.fy*H;
    if(Math.hypot(R.bx-gx, by-gy) < 46){ R.status = "win"; R.total += R.got; R.score += 500 + R.lives*200 + Math.round(R.e)*5; saveHi(); sfx("applause"); burst(gx, gy, "#F2B705", 40); R.winAt = performance.now(); chrome(); setTimeout(chrome, 2300); }
  } else if(R.dist >= R.len){
    R.status = "clear"; R.total += R.got; R.score += Math.round(R.e)*5; R.levelStartScore = null;
    const ratio = R.nFlowers ? R.got/R.nFlowers : 1; R.stars[R.lv] = Math.max(R.stars[R.lv]||0, ratio>=.6?3:ratio>=.35?2:1); sfx("plim"); saveHi(); R.carry = Math.round(clamp(R.e+25, 50, 100)); R.best[R.lv] = Math.max(R.best[R.lv]||0, R.got); chrome();
  }
  tickParts(dt);
}
function once(n, gap){ const t = performance.now()/1000; if((R.lastSfx[n]||0) + gap > t) return; R.lastSfx[n] = t; sfx(n); }
function loseFriend(){ if(!R.swarm.length) return; const id = R.swarm.pop(), sp = FRIENDS.find(f=>f.id===id); R.texts.push({x:R.bx, y:R.by*H+30, s:L(`A ${sp.pt.toLowerCase()} se perdeu!`,`The ${sp.en.toLowerCase()} got lost!`), life:1.4}); }
function tryDash(){ if(!R || R.status!=="play" || R.dashCd>0) return; R.dash = .35; R.dashCd = 2.2; R.e -= 4; sfx("zap"); burst(R.bx-14, R.by*H, "#FFF1CC", 10); }
function saveHi(){ if(R.score > R.hi){ R.hi = Math.round(R.score); R.newHi = true; hiSet(R.hi); } }
function burst(x,y,col,n){ for(let i=0;i<n;i++){ const a=Math.random()*6.28, v=40+Math.random()*90; R.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.6+Math.random()*.4,col}); } }
function tickParts(dt){ if(!R||!R.parts) return; R.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;p.life-=dt;}); R.parts = R.parts.filter(p=>p.life>0); }

/* ---------------- desenho ---------------- */
/* Flor do melão: corola amarela de cinco lobos unidos na base, com nervuras.
   fem=true desenha a flor hermafrodita, com o ovário ínfero (verde e peludo) atrás da corola. */
function drawFlower(x,y,s,t,fem){
  const c = ctx; c.save(); c.translate(x,y); c.rotate(Math.sin(t)*.15); c.scale(s,s);
  if(fem){ // ovário ínfero: o futuro melão
    const og = c.createRadialGradient(-2,9,1,0,12,9); og.addColorStop(0,"#c9e08a"); og.addColorStop(1,"#5f8f35");
    c.fillStyle = og; c.strokeStyle = "#3f6a25"; c.lineWidth = .6; c.beginPath(); c.ellipse(0,12,4.6,3.8,0,0,6.283); c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = .35; for(let k=0;k<14;k++){ const a = k/14*6.283; c.beginPath(); c.moveTo(Math.cos(a)*4.6, 12+Math.sin(a)*3.8); c.lineTo(Math.cos(a)*5.5, 12+Math.sin(a)*4.6); c.stroke(); }
  }
  const pg = c.createRadialGradient(-2,-3,1,0,0,13); pg.addColorStop(0,"#FFF3B0"); pg.addColorStop(.45,"#FFD84A"); pg.addColorStop(1,"#E9A912");
  c.fillStyle = pg; c.strokeStyle = "#C98C0A"; c.lineWidth = .7;
  c.beginPath();
  for(let q=0;q<=80;q++){ const th = q/80*6.283 - Math.PI/2, lobe = Math.pow(.5+.5*Math.cos(5*th + Math.PI/2*5), .8), rr = 8.6 + 4*lobe; const px = Math.cos(th)*rr, py = Math.sin(th)*rr; q ? c.lineTo(px,py) : c.moveTo(px,py); }
  c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "rgba(201,140,10,.55)"; c.lineWidth = .5;
  for(let k=0;k<5;k++){ const am = -Math.PI/2 + k*1.2566; c.beginPath(); c.moveTo(Math.cos(am)*3, Math.sin(am)*3); c.lineTo(Math.cos(am)*10.5, Math.sin(am)*10.5); c.stroke();
    c.beginPath(); c.moveTo(Math.cos(am)*6, Math.sin(am)*6); c.lineTo(Math.cos(am-.25)*9.5, Math.sin(am-.25)*9.5); c.moveTo(Math.cos(am)*6, Math.sin(am)*6); c.lineTo(Math.cos(am+.25)*9.5, Math.sin(am+.25)*9.5); c.stroke(); }
  const cg = c.createRadialGradient(-.8,-.8,.3,0,0,3.6); cg.addColorStop(0,"#FFE9A0"); cg.addColorStop(1,"#C9781A");
  c.fillStyle = cg; c.beginPath(); c.arc(0,0,3.4,0,6.283); c.fill();
  c.fillStyle = "rgba(255,240,180,.85)"; for(let k=0;k<5;k++){ const a = k*1.2566; c.beginPath(); c.arc(Math.cos(a)*1.6, Math.sin(a)*1.6, .55, 0, 6.283); c.fill(); }
  c.restore();
}
/* Abelha nativa sem ferrão de perfil, voltada para a direita (mesmo desenho da Jandi do site). */
function drawBee(x,y,t,blink,pal){
  if(blink && Math.floor(t*14)%2) return;
  pal = pal || JANDI;
  const c = ctx; c.save(); c.translate(x,y); if(pal.sc!==1) c.scale(pal.sc, pal.sc);
  const flap = Math.sin(t*38)*.35;
  // asas translúcidas, com venação reduzida
  c.save(); c.translate(2,-7); c.rotate(-.45+flap);
  c.fillStyle = "rgba(240,247,252,.72)"; c.strokeStyle = "rgba(140,160,175,.9)"; c.lineWidth = .8;
  c.beginPath(); c.ellipse(-11,-1,15,5.2,0,0,6.283); c.fill(); c.stroke();
  c.strokeStyle = "rgba(138,106,74,.75)"; c.lineWidth = .6; c.beginPath(); c.moveTo(-2,0); c.quadraticCurveTo(-10,-2,-19,-1); c.moveTo(-3,1.5); c.quadraticCurveTo(-11,1,-17,2); c.stroke();
  c.restore();
  c.save(); c.translate(1,-6); c.rotate(-.15+flap*.6); c.fillStyle = "rgba(230,240,246,.6)"; c.strokeStyle = "rgba(140,160,175,.8)"; c.lineWidth = .7; c.beginPath(); c.ellipse(-8,1,10,3.6,0,0,6.283); c.fill(); c.stroke(); c.restore();
  // pernas
  c.strokeStyle = "#3a2617"; c.lineCap = "round";
  c.lineWidth = 1.7; c.beginPath(); c.moveTo(8,5); c.quadraticCurveTo(11,10,10,14); c.moveTo(4,6); c.quadraticCurveTo(4,11,2,15); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(-1,6); c.lineTo(-6,10); c.stroke();
  c.fillStyle = "#3a2617"; c.beginPath(); c.ellipse(-9,12,4.5,2.6,.5,0,6.283); c.fill(); // tíbia larga (corbícula)
  c.lineWidth = 1.2; c.beginPath(); c.moveTo(-12,14); c.lineTo(-14,18); c.stroke();
  // abdome com faixas
  const ag = c.createRadialGradient(-17,-3,1,-14,1,14); ag.addColorStop(0, lighten(pal.body)); ag.addColorStop(.6, pal.body); ag.addColorStop(1, darken(pal.body));
  c.save(); c.translate(-14,2); c.rotate(.18);
  c.fillStyle = ag; c.strokeStyle = darken(pal.body,.55); c.lineWidth = .9; c.beginPath(); c.ellipse(0,0,13,9,0,0,6.283); c.fill(); c.stroke();
  c.save(); c.beginPath(); c.ellipse(0,0,13,9,0,0,6.283); c.clip(); c.strokeStyle = pal.band; c.lineWidth = 2.4;
  [-6,-1,4].forEach(sx=>{ c.beginPath(); c.moveTo(sx+2,-10); c.quadraticCurveTo(sx-2.5,0,sx+1,10); c.stroke(); }); c.restore();
  c.restore();
  // pecíolo e tórax com pelos
  c.fillStyle = "#3a2617"; c.beginPath(); c.ellipse(-2,0,2.4,3,0,0,6.283); c.fill();
  const tg = c.createRadialGradient(2,-4,.5,4,-1,9); tg.addColorStop(0,"#8a5d3c"); tg.addColorStop(.6,"#5a3a24"); tg.addColorStop(1,"#2e1d12");
  c.fillStyle = tg; c.beginPath(); c.arc(4,-1,7.6,0,6.283); c.fill();
  c.strokeStyle = "rgba(201,161,115,.8)"; c.lineWidth = .6;
  for(let k=0;k<11;k++){ const a = -2.9 + k*.26; c.beginPath(); c.moveTo(4+Math.cos(a)*7.4, -1+Math.sin(a)*7.4); c.lineTo(4+Math.cos(a)*9.2, -1+Math.sin(a)*9.2); c.stroke(); }
  // cabeça, olho composto, antena geniculada
  const hg = c.createRadialGradient(13,-4,.5,15,-1,8); hg.addColorStop(0,"#7a5236"); hg.addColorStop(.55,"#4a2f1d"); hg.addColorStop(1,"#26170d");
  c.fillStyle = pal.head==="#140E0A"||pal.head==="#241812" ? pal.head : hg; c.beginPath(); c.ellipse(15,-1,5.6,6.6,0,0,6.283); c.fill();
  const eg = c.createRadialGradient(15,-4,.3,15.5,-2,4.5); eg.addColorStop(0,"#6b5a50"); eg.addColorStop(1,"#140e0b");
  c.fillStyle = eg; c.beginPath(); c.ellipse(15.5,-2,2.6,4.2,.12,0,6.283); c.fill();
  c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(16.4,-4,.8,1.3,.12,0,6.283); c.fill();
  c.strokeStyle = "#2a1a0e"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(16,-7); c.lineTo(18,-12); c.quadraticCurveTo(22,-14,25,-12); c.stroke();
  c.restore();
}
function lighten(h, k){ k = k==null?.35:k; const n = parseInt(h.slice(1),16), r=n>>16, g=n>>8&255, b=n&255; return `rgb(${Math.round(r+(255-r)*k)},${Math.round(g+(255-g)*k)},${Math.round(b+(255-b)*k)})`; }
function darken(h, k){ k = k==null?.35:k; const n = parseInt(h.slice(1),16), r=n>>16, g=n>>8&255, b=n&255; return `rgb(${Math.round(r*(1-k))},${Math.round(g*(1-k))},${Math.round(b*(1-k))})`; }
function drawHeart(x,y,on){
  ctx.save(); ctx.translate(x,y); ctx.scale(.8,.8);
  ctx.fillStyle = on ? "#D9622B" : "rgba(27,42,34,.18)";
  ctx.beginPath(); ctx.moveTo(0,6); ctx.bezierCurveTo(-12,-2,-7,-12,0,-5); ctx.bezierCurveTo(7,-12,12,-2,0,6); ctx.fill(); ctx.restore();
}
function drawCactus(x,g,h,col){
  ctx.fillStyle = col; ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x-4,g-h,8,h,4) : ctx.rect(x-4,g-h,8,h);
  ctx.roundRect ? ctx.roundRect(x-13,g-h*.62,6,h*.32,3) : ctx.rect(x-13,g-h*.62,6,h*.32);
  ctx.roundRect ? ctx.roundRect(x+7,g-h*.75,6,h*.38,3) : ctx.rect(x+7,g-h*.75,6,h*.38);
  ctx.fill(); ctx.fillRect(x-10,g-h*.34,8,4); ctx.fillRect(x+3,g-h*.42,7,4);
}
function draw(){
  if(!ctx) return;
  const Lv = LEVELS[R.lv], o = R.o, t = performance.now()/1000, d = R.dist, g = H*.9;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(R.shake>0){ const m = 7*R.shake/.3; ctx.translate((Math.random()-.5)*m, (Math.random()-.5)*m); }
  const sky = ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,Lv.sky[0]); sky.addColorStop(1,Lv.sky[1]);
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
  if(!Lv.final){ // sol
    const sr = 26 + (Lv.heat?10:0) + Math.sin(t*2)*2;
    ctx.fillStyle = "rgba(255,190,60,.35)"; ctx.beginPath(); ctx.arc(W-60,46,sr+14,0,6.283); ctx.fill();
    ctx.fillStyle = "#FFB627"; ctx.beginPath(); ctx.arc(W-60,46,sr,0,6.283); ctx.fill();
  }
  // morros distantes
  ctx.fillStyle = Lv.hill; ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(0,g);
  for(let x=0;x<=W+10;x+=10){ const wxp=(x+d*.25)/140; ctx.lineTo(x, g-30-Math.sin(wxp)*18-Math.sin(wxp*.37)*22); }
  ctx.lineTo(W,g); ctx.fill(); ctx.globalAlpha = 1;
  // faixas de calor
  for(const h of o.heat){ const x=h.x-d; if(x>W||x+h.w<0) continue;
    const gr = ctx.createLinearGradient(x,0,x+h.w,0); gr.addColorStop(0,"rgba(232,93,30,0)"); gr.addColorStop(.5,"rgba(232,93,30,.32)"); gr.addColorStop(1,"rgba(232,93,30,0)");
    const y0 = h.up ? 0 : h.edge*H, y1 = h.up ? h.edge*H : g;
    ctx.fillStyle = gr; ctx.fillRect(x,y0,h.w,y1-y0);
    ctx.fillStyle = "rgba(200,70,20,.55)"; ctx.fillRect(x+6, h.up?y1-3:y0, h.w-12, 3);
    ctx.strokeStyle = "rgba(200,70,20,.45)"; ctx.lineWidth = 2;
    for(let k=0;k<3;k++){ ctx.beginPath(); const cx = x+h.w*(.25+k*.25); for(let y=y0+6;y<y1;y+=8) ctx.lineTo(cx+Math.sin(y/14+t*5+k)*4, y); ctx.stroke(); }
  }
  // chão
  ctx.fillStyle = Lv.ground; ctx.fillRect(0,g,W,H-g);
  for(let k=-1;k<W/90+2;k++){ const wxk = Math.floor(d*.6/90)+k, x = wxk*90 - d*.6;
    const h = 22+((wxk*37)%5)*6; drawCactus(x+30, g, h, Lv.final?"#3F7A4A":"#55704A"); }
  // trechos desmatados
  for(const b of o.bare){ const x0=b.x0-d, x1=b.x1-d; if(x1<0||x0>W) continue;
    ctx.fillStyle = "rgba(120,90,60,.35)"; ctx.fillRect(x0,g-6,x1-x0,H-g+6);
    for(let x=x0+20;x<x1-10;x+=46){ ctx.fillStyle="#6B4A2A"; ctx.fillRect(x,g-12,14,12); ctx.fillStyle="#C9A26B"; ctx.beginPath(); ctx.ellipse(x+7,g-12,7,3,0,0,6.283); ctx.fill(); }
    ctx.fillStyle = "rgba(27,42,34,.7)"; ctx.font = "700 11px system-ui,sans-serif"; ctx.textAlign="center";
    ctx.fillText(L("desmatado","cleared"), (x0+x1)/2, g+16);
  }
  // frutos formados pelas flores que a Jandi polinizou
  for(const fr of o.fruit){ const x = fr.x-d; if(x<-30||x>W+30) continue; const k = Math.min(1,(R.t-fr.t)/1.2);
    ctx.strokeStyle = "#4C8C4A"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x-14,g-2); ctx.quadraticCurveTo(x,g-8,x+14,g-2); ctx.stroke();
    ctx.fillStyle = "#E7C23A"; ctx.strokeStyle = "#CFA524"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, g-4-6*k, 3+8*k, 2+6*k, 0, 0, 6.283); ctx.fill(); ctx.stroke(); }
  // flores
  for(const f of o.flowers){ if(f.got) continue; const x=f.x-d; if(x<-20||x>W+20) continue; drawFlower(x, f.fy*H, .9, t*2+f.ph); }
  // galhos secos
  for(const b of o.branches){ const x=b.x-d; if(x>W+40||x+b.w<-40) continue;
    const top=(b.gc-b.gap/2)*H, bot=(b.gc+b.gap/2)*H;
    [[0,top],[bot,g]].forEach(([y0,y1])=>{
      ctx.fillStyle = "#7A5230"; ctx.fillRect(x, y0, b.w, y1-y0);
      ctx.fillStyle = "#5E3E22"; ctx.fillRect(x+b.w*.6, y0, b.w*.4, y1-y0);
      ctx.strokeStyle = "#5E3E22"; ctx.lineWidth = 2.5;
      for(let y=y0+12;y<y1-6;y+=18){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-9,y-5); ctx.moveTo(x+b.w,y+6); ctx.lineTo(x+b.w+9,y+1); ctx.stroke(); }
    });
  }
  // nuvens de agrotóxico
  for(const s of o.spray){ const x=s.x-d; if(x<-80||x>W+80) continue; const y=s.fy*H, r=s.rr*H;
    ctx.fillStyle = "rgba(140,160,120,.55)";
    for(let k=0;k<5;k++){ ctx.beginPath(); ctx.arc(x+Math.cos(k*1.3+t+s.ph)*r*.45, y+Math.sin(k*1.7+t+s.ph)*r*.35, r*.62, 0, 6.283); ctx.fill(); }
    ctx.fillStyle = "rgba(90,110,70,.75)"; for(let k=0;k<7;k++){ ctx.beginPath(); ctx.arc(x+Math.cos(k*.9+t*2)*r*.7, y+r*.4+((t*30+k*9)%(r*.8)), 2,0,6.283); ctx.fill(); }
    ctx.fillStyle = "#3B4A2C"; ctx.font = "800 11px system-ui,sans-serif"; ctx.textAlign="center"; ctx.fillText(L("agrotóxico","pesticide"), x, y+3);
  }
  // flor final
  if(R.goal){ const gx=R.goal.x-d, gy=R.goal.fy*H;
    if(gx<W+120){
      ctx.strokeStyle="#3F7A4A"; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(gx,gy+20); ctx.quadraticCurveTo(gx-20,g-30,gx-6,g); ctx.stroke();
      ctx.fillStyle="#4E8F57"; ctx.beginPath(); ctx.ellipse(gx-30,gy+60,26,14,-.5,0,6.283); ctx.ellipse(gx+24,gy+80,24,12,.5,0,6.283); ctx.fill();
      const pulse = 1+Math.sin(t*3)*.05 + (R.status==="win"?Math.min(.6,R.winT*.4):0);
      ctx.fillStyle="rgba(255,214,80,.35)"; ctx.beginPath(); ctx.arc(gx,gy,52*pulse,0,6.283); ctx.fill();
      drawFlower(gx, gy, 3.6*pulse, Math.sin(t)*.3, true);
      if(R.status==="win" && R.winT>.6){ // fruto se formando
        const k = Math.min(1,(R.winT-.6)/1.2);
        ctx.globalAlpha = k; ctx.fillStyle="#E7C23A"; ctx.strokeStyle="#CFA524"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.ellipse(gx+(W<520?-80:70), g-18*k-6, 26*k+4, 19*k+3, 0, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
  }
  // pólen dourado e gotas d'água
  for(const gd of o.gold){ if(gd.got) continue; const x = gd.x-d; if(x<-30||x>W+30) continue; const y = gd.fy*H;
    ctx.fillStyle = "rgba(255,214,107,.45)"; ctx.beginPath(); ctx.arc(x,y,20+Math.sin(t*5)*3,0,6.283); ctx.fill();
    ctx.save(); ctx.translate(x,y); ctx.rotate(t*2); ctx.fillStyle="#F2A93B"; ctx.strokeStyle="#C7841F"; ctx.lineWidth=1.5; for(let k=0;k<6;k++){ ctx.save(); ctx.rotate(k*1.047); ctx.beginPath(); ctx.ellipse(0,-9,5,8,0,0,6.283); ctx.fill(); ctx.stroke(); ctx.restore(); } ctx.fillStyle="#FFF6E5"; ctx.beginPath(); ctx.arc(0,0,4,0,6.283); ctx.fill(); ctx.restore(); }
  for(const w of o.water){ if(w.got) continue; const x = w.x-d; if(x<-30||x>W+30) continue; const y = w.fy*H + Math.sin(t*3+w.x)*4;
    ctx.fillStyle = "#7FB8E0"; ctx.strokeStyle = "#3E7FAE"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x,y-14); ctx.bezierCurveTo(x+11,y-2,x+9,y+10,x,y+10); ctx.bezierCurveTo(x-9,y+10,x-11,y-2,x,y-14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(x-3,y+2,2.5,0,6.283); ctx.fill(); }
  // avião agrícola e gotas de agrotóxico
  for(const dr of o.drops){ const x = dr.x-d; if(x<-10||x>W+10) continue; const y = dr.fy*H; ctx.fillStyle = "#6E8B4E"; ctx.beginPath(); ctx.moveTo(x,y-7); ctx.quadraticCurveTo(x+5,y,x,y+5); ctx.quadraticCurveTo(x-5,y,x,y-7); ctx.fill(); }
  for(const pl of o.planes){ if(!pl.on||pl.done) continue;
    if(pl.warn>0){ ctx.fillStyle = Math.floor(t*8)%2?"#B3261E":"#E5483B"; ctx.font = "900 20px system-ui,sans-serif"; ctx.textAlign="center"; ctx.fillText("! "+L("avião agrícola","crop duster")+" !", W/2, 100); continue; }
    const x = pl.px, y = H*.1; ctx.save(); ctx.translate(x,y);
    ctx.fillStyle = "#D9D3C4"; ctx.strokeStyle="#5E574B"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(0,0,34,8,0,0,6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#B3261E"; ctx.fillRect(-6,-22,12,44); ctx.fillStyle="#5E574B"; ctx.fillRect(26,-9,4,18); ctx.fillRect(-36,-10,6,10);
    ctx.fillStyle = "rgba(140,160,120,.45)"; ctx.beginPath(); ctx.ellipse(40,10,24,8,0,0,6.283); ctx.fill(); ctx.restore(); }
  // abelha
  if(R.dash>0){ ctx.fillStyle = "rgba(255,241,204,.6)"; for(let k=1;k<5;k++){ ctx.beginPath(); ctx.ellipse(R.bx-k*14, R.by*H, 14-k*2, 8-k, 0, 0, 6.283); ctx.fill(); } }
  if(R.shield>0){ ctx.strokeStyle = `rgba(242,169,59,${.4+.3*Math.sin(t*12)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(R.bx+3, R.by*H, 28, 0, 6.283); ctx.stroke(); }
  for(const fr of o.friends){ if(fr.got) continue; const x = fr.x-d; if(x<-40||x>W+40) continue; const y = fr.fy*H + Math.sin(t*2+fr.x)*6, sp = FRIENDS.find(f=>f.id===fr.sp);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x,y,24,0,6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.arc(x-9,y-10,4,0,6.283); ctx.fill();
    drawBee(x-2, y+2, t, false, sp); ctx.fillStyle = "#2E2418"; ctx.font = "800 11px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText(L(sp.pt,sp.en), x, y-30); }
  R.swarm.forEach((id,k)=>{ const p = R.trail[Math.min(R.trail.length-1, 9*(k+1))]; if(!p) return; const sp = FRIENDS.find(f=>f.id===id); drawBee(p.x-6, p.y*H + Math.sin(t*6+k)*4, t+k, false, sp); });
  if(R.swarm.length){ ctx.strokeStyle = "rgba(242,169,59,.35)"; ctx.setLineDash([3,5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(R.bx, R.by*H, 24+9*R.swarm.length, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
  drawBee(R.bx, R.by*H, t, R.inv>0);
  R.texts.forEach(tx=>{ ctx.globalAlpha = Math.min(1, tx.life*2); ctx.fillStyle = "#2E2418"; ctx.font = "800 14px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText(tx.s, tx.x, tx.y); }); ctx.globalAlpha = 1;
  // partículas
  R.parts.forEach(p=>{ ctx.globalAlpha = Math.max(0,p.life); ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,2.6,0,6.283); ctx.fill(); }); ctx.globalAlpha = 1;
  // HUD
  const bw = Math.min(180, W*.38);
  ctx.fillStyle = "rgba(255,255,255,.82)"; ctx.fillRect(10,10,bw+20,40);
  ctx.fillStyle = "#1B2A22"; ctx.font = "700 11px system-ui,sans-serif"; ctx.textAlign="left";
  ctx.fillText(L("Energia (néctar)","Energy (nectar)"), 20, 24);
  ctx.fillStyle = "#E2E7DF"; ctx.fillRect(20,30,bw,10);
  ctx.fillStyle = R.e>50?"#2E6A4C":R.e>25?"#E0A800":"#A63A24"; ctx.fillRect(20,30,bw*R.e/100,10);
  ctx.textAlign="right"; ctx.fillStyle="#1B2A22"; ctx.font="800 12px system-ui,sans-serif";
  const lab = Lv.final ? L("A flor","The flower") : L(`Nível ${R.lv+1} · cenário ${Lv.red}%`,`Level ${R.lv+1} · ${Lv.red}% scenario`);
  ctx.fillText(lab, W-12, Lv.final?24:H-10 - 0);
  if(!Lv.final){
    const pw = W*.4, px = W-12-pw, py = H-28;
    ctx.fillStyle="rgba(255,255,255,.7)"; ctx.fillRect(px,py,pw,6); ctx.fillStyle="#1B2A22"; ctx.fillRect(px,py,pw*clamp(R.dist/R.len,0,1),6);
  }
  ctx.textAlign="left"; ctx.fillStyle="#1B2A22"; ctx.font="700 12px system-ui,sans-serif";
  drawFlower(bw+50, 30, .7, 0); ctx.fillText("× "+R.got, bw+62, 34);
  for(let k=0;k<LIVES;k++) drawHeart(bw+100+k*20, 30, k<R.lives);
  ctx.fillStyle = "rgba(255,246,229,.88)"; ctx.fillRect(10,54,bw+20,22); ctx.fillStyle = "#2E2418"; ctx.font = "800 12px system-ui,sans-serif"; ctx.textAlign = "left";
  ctx.fillText(L("Pontos ","Score ")+Math.round(R.score).toLocaleString(X.S.lang==="pt"?"pt-BR":"en-US")+(R.combo>1&&R.t-R.comboT<1.6?"  ×"+R.combo:""), 20, 70);
  // recarga da arrancada
  const cdk = 1 - R.dashCd/2.2; ctx.strokeStyle = cdk>=1?"#4C8C4A":"#B8B2A7"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bw+16, 65, 7, -Math.PI/2, -Math.PI/2+6.283*cdk); ctx.stroke();
  if(Math.abs(R.wind)>.04){ // rajadas de vento
    ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 2;
    for(let k=0;k<7;k++){ const x = (k*137 + t*420)%(W+80)-40, y = H*(.15+((k*.37)%1)*.65); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+30, y+R.wind*70); ctx.stroke(); }
    ctx.fillStyle="#1B2A22"; ctx.font="800 12px system-ui,sans-serif"; ctx.textAlign="center";
    ctx.fillText((R.wind<0?"↑ ":"↓ ")+L("vento quente","hot wind"), W/2, 22);
  }
}

/* ---------------- interface em HTML ---------------- */
function stake(red){ const m = X.calc(X.S.d, red/100); return L(`Neste cenário, a plataforma calcula ${X.money(m.pl)} de exposição no valor da produção e ${X.money(m.xl)} nas exportações.`,`In this scenario, the platform calculates ${X.money(m.pl)} of production-value exposure and ${X.money(m.xl)} of export exposure.`); }
const CAUSE = {
  heat:  ["O calor esgotou a abelha.","The heat wore the bee out.","Em dias muito quentes, as abelhas reduzem o voo justamente nas horas de mais calor. Atravesse as faixas laranja sem parar.","On very hot days, bees cut flying during the hottest hours. Cross the orange bands without lingering."],
  branch:["Os galhos secos tiraram energia demais.","The dry branches cost too much energy.","Na seca, a vegetação perde folhas e flores. Mire nos espaços abertos entre os galhos.","In a drought, vegetation loses leaves and flowers. Aim for the openings between branches."],
  spray: ["A nuvem de agrotóxico foi fatal.","The pesticide cloud was fatal.","Por isso o Manejo Integrado de Pragas e Polinizadores evita pulverizar durante a floração. Contorne as nuvens por cima ou por baixo.","That is why Integrated Pest and Pollinator Management avoids spraying during bloom. Go around the clouds, above or below."],
  hunger:["Faltou néctar.","The bee ran out of nectar.","Com menos flores, a abelha precisa voar mais para se alimentar. Pegue as flores que aparecem antes dos trechos sem nenhuma.","With fewer flowers, the bee must fly further to feed. Grab the flowers that come before the stretches with none."]
};
function melonDR(){ const m = (X.S.d||[]).find(r=>r.Crop==="Melon"); return m && X.isNum(m.Pollination_Dependence) ? m.Pollination_Dependence : null; }

const ptsLine = () => `<p class="bee-pts"><b>${Math.round(R.score).toLocaleString(X.S.lang==="pt"?"pt-BR":"en-US")}</b> ${esc(L("pontos","points"))} · ${esc(L("recorde","best"))} ${Math.round(Math.max(R.hi,R.score)).toLocaleString(X.S.lang==="pt"?"pt-BR":"en-US")}${R.newHi?` <span class="bee-new">${esc(L("novo recorde!","new best!"))}</span>`:""}</p>`;
const starsLine = n => `<p class="bee-stars" aria-label="${n} ${esc(L("estrelas","stars"))}">${[1,2,3].map(i=>`<span class="${i<=n?"on":""}">★</span>`).join("")}</p>`;
async function storyImage(){
  const CMx = window.Colmeia; if(!CMx) return;
  const SW = 1080, SH = 1920, cv = document.createElement("canvas"); cv.width = SW; cv.height = SH; const g = cv.getContext("2d");
  const saved = ctx; ctx = g;
  CMx.paper(g, SW, SH);
  const win = R.status==="win";
  // céu e paisagem
  const sky = g.createLinearGradient(0,0,0,900); sky.addColorStop(0, win?"#DCEFF5":"#FFE7B8"); sky.addColorStop(1, win?"#C9E6C8":"#F8C77F");
  g.fillStyle = sky; g.beginPath(); g.roundRect ? g.roundRect(60,60,SW-120,860,48) : g.rect(60,60,SW-120,860); g.fill();
  g.save(); g.beginPath(); g.roundRect ? g.roundRect(60,60,SW-120,860,48) : g.rect(60,60,SW-120,860); g.clip();
  g.fillStyle = "#FFB627"; g.beginPath(); g.arc(SW-210,200,70,0,6.283); g.fill();
  g.fillStyle = win?"#8CB98F":"#D9A35F"; g.beginPath(); g.moveTo(60,920); for(let x=60;x<=SW-60;x+=20) g.lineTo(x, 760-Math.sin(x/120)*40-Math.sin(x/47)*16); g.lineTo(SW-60,920); g.fill();
  g.fillStyle = win?"#5E8F5E":"#B98546"; g.fillRect(60,840,SW-120,80);
  g.strokeStyle = "#3F7A4A"; g.lineWidth = 14; g.beginPath(); g.moveTo(560,560); g.quadraticCurveTo(520,720,560,860); g.stroke();
  g.fillStyle = "#4E8F57"; g.beginPath(); g.ellipse(470,720,70,34,-.5,0,6.283); g.ellipse(650,770,64,30,.5,0,6.283); g.fill();
  g.fillStyle = "rgba(255,214,80,.35)"; g.beginPath(); g.arc(560,470,190,0,6.283); g.fill();
  drawFlower(560, 470, 13, 0, true);
  if(win){ const mg = g.createRadialGradient(800,770,10,830,800,100); mg.addColorStop(0,"#FFF1A8"); mg.addColorStop(.45,"#F2CC3D"); mg.addColorStop(1,"#B98614"); g.fillStyle=mg; g.strokeStyle="#A97A12"; g.lineWidth=4; g.beginPath(); g.ellipse(830,800,92,66,0,0,6.283); g.fill(); g.stroke(); g.strokeStyle="rgba(201,150,28,.8)"; g.lineWidth=3; [-30,0,30].forEach(dy=>{ g.beginPath(); g.moveTo(745,800+dy*.8); g.quadraticCurveTo(830,786+dy,915,800+dy*.8); g.stroke(); }); g.strokeStyle="rgba(255,255,255,.5)"; g.lineWidth=8; g.lineCap="round"; g.beginPath(); g.moveTo(775,765); g.quadraticCurveTo(800,748,830,746); g.stroke(); g.strokeStyle="#5B7A2E"; g.lineWidth=7; g.beginPath(); g.moveTo(830,736); g.quadraticCurveTo(836,716,852,708); g.stroke(); }
  g.save(); g.translate(560, 430); g.scale(4.2,4.2); drawBee(0,0,.3,false); g.restore();
  (R.rescued||[]).forEach((id,k)=>{ const sp = FRIENDS.find(f=>f.id===id), a = -2.4 + k*.75; g.save(); g.translate(560+Math.cos(a)*330, 470+Math.sin(a)*250); g.scale(2.6,2.6); drawBee(0,0,k,false,sp); g.restore(); });
  g.restore();
  // título
  g.fillStyle = "#2E2418"; g.textAlign = "center";
  g.font = "700 96px Fredoka, 'Baloo 2', system-ui, sans-serif"; g.fillText(L("Voo da abelha","The bee's flight"), SW/2, 1030);
  g.font = "600 44px Fredoka, system-ui, sans-serif"; g.fillStyle = "#8A5A3C";
  g.fillText(win ? L("A Jandi levou o pólen até a flor!","Jandi carried the pollen to the flower!") : L(`A Jandi chegou ao nível ${R.lv+1}`,`Jandi reached level ${R.lv+1}`), SW/2, 1100);
  // números
  const fmtN = v => Math.round(v).toLocaleString(X.S.lang==="pt"?"pt-BR":"en-US");
  const tiles = [[L("pontos","points"), fmtN(R.score)], [L("recorde","best"), fmtN(Math.max(R.hi,R.score))], [L("flores polinizadas","flowers pollinated"), fmtN(R.fruits||0)], [L("abelhas resgatadas","bees rescued"), fmtN((R.rescued||[]).length)+"/"+FRIENDS.length]];
  tiles.forEach(([lab,val],i)=>{ const x = 110 + (i%2)*440, y = 1150 + Math.floor(i/2)*190; g.fillStyle = i===0?"#F2A93B":"#FFF0CC"; g.beginPath(); g.roundRect ? g.roundRect(x,y,420,165,30) : g.rect(x,y,420,165); g.fill();
    g.fillStyle = "#2E2418"; g.font = "800 72px Inter, system-ui, sans-serif"; g.fillText(val, x+210, y+92); g.font = "600 32px Inter, system-ui, sans-serif"; g.fillText(lab, x+210, y+140); });
  // estrelas por cenário
  g.font = "600 34px Inter, system-ui, sans-serif"; g.fillStyle = "#2E2418";
  [10,25,50].forEach((sc,i)=>{ const x = 230 + i*310, st = R.stars[i]||0; g.fillStyle = "#2E2418"; g.font = "600 34px Inter, system-ui, sans-serif"; g.fillText(L("cenário ","scenario ")+sc+"%", x, 1590);
    g.font = "700 54px system-ui, sans-serif"; for(let k=0;k<3;k++){ g.fillStyle = k<st ? "#F2A93B" : "#D9D3C4"; g.fillText("★", x+(k-1)*56, 1655); } });
  // amigas
  const fr = (R.rescued||[]).map(id=>{ const sp = FRIENDS.find(f=>f.id===id); return L(sp.pt,sp.en); });
  g.font = "600 32px Inter, system-ui, sans-serif"; g.fillStyle = "#8A5A3C";
  CMx.wrapText(g, fr.length ? L(`Abelhas nativas resgatadas: ${fr.join(", ")}`,`Native bees rescued: ${fr.join(", ")}`) : L("Nenhuma abelha nativa resgatada desta vez.","No native bees rescued this time."), SW/2, 1730, SW-200, 42);
  g.font = "500 30px Inter, system-ui, sans-serif"; g.fillText("Pollination Risk and Value Tool", SW/2, 1840); g.font = "400 26px Inter, system-ui, sans-serif"; g.fillText(CMx.siteUrl().replace(/^https?:\/\//,"").slice(0,60), SW/2, 1880);
  ctx = saved;
  const txt = win ? L(`Levei o pólen até a flor do melão com ${fmtN(R.score)} pontos${fr.length?` e ${fr.length} abelha${fr.length>1?"s":""} nativa${fr.length>1?"s":""} resgatada${fr.length>1?"s":""}`:""}. Consegue me superar?`,`I carried the pollen to the melon flower with ${fmtN(R.score)} points${fr.length?` and ${fr.length} native bee${fr.length>1?"s":""} rescued`:""}. Can you beat me?`)
                  : L(`Fiz ${fmtN(R.score)} pontos no Voo da abelha. Consegue chegar até a flor?`,`I scored ${fmtN(R.score)} points in The bee's flight. Can you reach the flower?`);
  CMx.share(cv, {text:txt, file:"voo-da-abelha.png", alt:L("Resumo da jornada no Voo da abelha","Summary of the bee's flight journey")});
}
function overlay(){
  const Lv = LEVELS[R.lv], st = R.status;
  const eyebrow = Lv.final ? L("Fase final","Final stage") : L(`Nível ${R.lv+1} de 3 · cenário de ${Lv.red}%`,`Level ${R.lv+1} of 3 · ${Lv.red}% scenario`);
  if(st==="play") return "";
  if(st==="brief") return `<div class="bee-card"><div class="g-event-kind">${esc(eyebrow)}</div><h3>${esc(L(Lv.t_pt,Lv.t_en))}</h3><p>${esc(L(Lv.d_pt,Lv.d_en))}</p>${Lv.red?`<p class="bee-stake">${esc(stake(Lv.red))}</p>`:""}<div class="g-actions"><button class="btn primary" data-act="g-bee-go">${esc(R.lv===0&&!R.deaths?L("Voar","Fly"):L("Começar o nível","Start the level"))}</button></div></div>`;
  if(st==="pause") return `<div class="bee-card"><div class="g-event-kind">${esc(eyebrow)}</div><h3>${esc(L("Pausado","Paused"))}</h3><div class="g-actions"><button class="btn primary" data-act="g-bee-resume">${esc(L("Continuar","Resume"))}</button><button class="btn" data-act="g-bee-retry">${esc(L("Recomeçar o nível","Restart the level"))}</button></div></div>`;
  if(st==="dead"){ const c = CAUSE[R.cause]||CAUSE.hunger; return `<div class="bee-card bad"><div class="g-event-kind">${esc(eyebrow)}</div><h3>${esc(L(c[0],c[1]))}</h3><p>${esc(L(c[2],c[3]))}</p><p class="bee-stake">${esc(L(`Vidas restantes: ${R.lives} de ${LIVES}. O nível recomeça do início.`,`Lives left: ${R.lives} of ${LIVES}. The level starts over.`))}</p><div class="g-actions"><button class="btn primary" data-act="g-bee-retry">${esc(L("Tentar de novo","Try again"))}</button></div></div>`; }
  if(st==="over"){ const c = CAUSE[R.cause]||CAUSE.hunger; return `<div class="bee-card bad"><div class="g-event-kind">${esc(eyebrow)}</div><h3>${esc(L("Fim de jogo","Game over"))}</h3><p>${esc(L(c[2],c[3]))}</p><p>${esc(L("A abelha perdeu as três vidas. A jornada recomeça no cenário de 10%.","The bee lost all three lives. The journey restarts at the 10% scenario."))}</p>${ptsLine()}<div class="g-actions"><button class="btn primary" data-act="g-bee-restart">${esc(L("Recomeçar a jornada","Restart the journey"))}</button><button class="btn" data-act="g-bee-story">${esc(L("Gerar imagem da jornada","Make a journey image"))}</button></div></div>`; }
  if(st==="clear") return `<div class="bee-card ok"><div class="g-event-kind">${esc(eyebrow)}</div><h3>${esc(L("Nível concluído!","Level complete!"))}</h3>${starsLine(R.stars[R.lv]||1)}${ptsLine()}<p>${esc(L(`Você coletou ${R.got} flores e chegou com ${Math.round(R.e)}% de energia. Você começa o próximo nível com ${R.carry}%.`,`You collected ${R.got} flowers and arrived with ${Math.round(R.e)}% energy. You start the next level with ${R.carry}%.`))}</p><p>${esc(L(Lv.tip_pt,Lv.tip_en))}</p><div class="g-actions"><button class="btn primary" data-act="g-bee-next">${esc(R.lv+1===NLV-1?L("Ir até a flor","Fly to the flower"):L("Próximo nível","Next level"))}</button></div></div>`;
  if(st==="win"){ const dr = melonDR();
    return `<div class="bee-card win"><div class="g-event-kind">${esc(L("Objetivo alcançado","Goal reached"))}</div><h3>${esc(L("Você encontrou a flor!","You found the flower!"))}</h3>
      <p>${esc(L("O pólen chegou à flor do melão. Para formar um fruto bem desenvolvido, a flor do melão depende das visitas das abelhas.","The pollen reached the melon flower. To form a well-developed fruit, the melon flower depends on bee visits."))}${dr!=null?" "+esc(L(`Na plataforma, o DR do melão em uso é ${X.fmt2(dr)}: cerca de ${Math.round(dr*100)}% da produção depende dessa visita.`,`In the platform, the melon DR in use is ${X.fmt2(dr)}: about ${Math.round(dr*100)}% of production depends on this visit.`)):""}</p>
      ${ptsLine()}<p class="bee-stake">${esc(L(`Flores coletadas na jornada: ${R.total}. Vidas restantes: ${R.lives}.`,`Flowers collected on the journey: ${R.total}. Lives left: ${R.lives}.`))}</p>
      <div class="g-actions"><button class="btn primary" data-act="g-stage" data-v="quanto">${esc(L("Agora: Quanto Vale uma Abelha?","Next: How Much Is a Bee Worth?"))}</button><button class="btn" data-act="g-bee-story">${esc(L("Gerar imagem da jornada","Make a journey image"))}</button><button class="btn" data-act="g-bee-restart">${esc(L("Jogar de novo","Play again"))}</button></div></div>`; }
  return "";
}
function levelChips(){
  return LEVELS.map((Lv,i)=>{ const state = i<R.lv || (i===R.lv && (R.status==="clear"||R.status==="win")) ? "done" : i===R.lv ? "now" : "";
    return `<li class="${state}"><span>${esc(Lv.final?L("A flor","The flower"):Lv.red+"%")}</span><b>${esc(L(Lv.t_pt,Lv.t_en))}</b></li>`; }).join("");
}
function chrome(){
  const ov = document.getElementById("beeOv"); if(ov){ ov.innerHTML = overlay(); ov.hidden = R.status==="play" || (R.status==="win" && performance.now()-(R.winAt||0)<2200); const b = ov.querySelector("button"); if(b) b.focus({preventScroll:true}); }
  const ch = document.getElementById("beeLevels"); if(ch) ch.innerHTML = levelChips();
  const pb = document.getElementById("beePause"); if(pb) pb.hidden = R.status!=="play";
  const db = document.getElementById("beeDash"); if(db) db.hidden = R.status!=="play";
}

B.html = function(){
  if(!R){ R = newRun(); startLevel(0); }
  if(R.status==="play") R.status = "pause";
  return `<section class="section">
    <h2 class="h">${esc(L("Voo da abelha","The bee's flight"))}</h2>
    <p class="sub">${esc(L("Leve o pólen até a flor. Cada nível usa um cenário de redução da plataforma (10%, 25% e 50%) como dificuldade: quanto maior a perda, menos flores e mais ameaças pelo caminho.","Carry the pollen to the flower. Each level uses one of the platform's reduction scenarios (10%, 25% and 50%) as its difficulty: the bigger the loss, the fewer flowers and the more threats along the way."))}</p>
    <ol class="bee-levels" id="beeLevels">${levelChips()}</ol>
    <div class="bee-wrap" id="beeWrap">
      <canvas id="beeCanvas" tabindex="0" aria-label="${esc(L("Área do jogo: use as setas ou toque e arraste para guiar a abelha","Game area: use the arrow keys or touch and drag to steer the bee"))}"></canvas>
      <button type="button" class="bee-dash" id="beeDash" data-act="g-bee-dash" hidden>${esc(L("Arrancada","Dash"))}</button>
      <button type="button" class="bee-pause" id="beePause" data-act="g-bee-pause" hidden>${esc(L("Pausar","Pause"))}</button>
      <div class="bee-ov" id="beeOv"${R.status==="play"?" hidden":""}>${overlay()}</div>
    </div>
    <p class="g-note">${esc(L("Controles: setas ou W A S D; Espaço faz a arrancada (atravessa ameaças por um instante). No celular, toque e arraste; toque duas vezes ou use o botão para a arrancada. P pausa. 3 vidas para a jornada inteira. Flores em sequência multiplicam os pontos; o pólen dourado dá escudo e a gota d'água repõe energia. Resgate as abelhas nativas presas em bolhas: elas voam com você, pegam flores de mais longe e multiplicam os pontos, mas se perdem a cada batida. Cada flor visitada vira um fruto no chão. Zonas laranja = calor; galhos marrons = seca; nuvens verde-acinzentadas = agrotóxico; trechos com tocos = desmatamento.","Controls: arrow keys or W A S D; Space dashes (passes through threats for a moment). On a phone, touch and drag; double-tap or use the button to dash. P pauses. 3 lives for the whole journey. Flowers in a row multiply points; golden pollen gives a shield and water drops refill energy. Rescue the native bees trapped in bubbles: they fly with you, reach flowers from further away and multiply points, but get lost with every hit. Each flower visited becomes a fruit on the ground. Orange zones = heat; brown branches = drought; grey-green clouds = pesticide; stretches with stumps = clearing."))}</p>
  </section>`;
};

/* ---------------- montagem e laço ---------------- */
const KEYMAP = {ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
function onKey(e){
  if(!C || !C.isConnected) return;
  const k = KEYMAP[e.code];
  if((e.code==="Space"||e.code==="ShiftLeft"||e.code==="ShiftRight") && R.status==="play"){ e.preventDefault(); if(e.type==="keydown" && !e.repeat) tryDash(); return; }
  if(e.type==="keydown" && (e.code==="KeyP"||e.code==="Escape") && R.status==="play" && !e.target.closest("input,textarea")){ R.status="pause"; chrome(); return; }
  if(!k) return;
  if(R.status==="play"){ keys[k] = e.type==="keydown"; e.preventDefault(); }
}
function ptrPos(e){ const r = C.getBoundingClientRect(), off = e.pointerType==="mouse" ? 0 : 46; return {x:e.clientX-r.left, fy:(e.clientY-r.top-off)/H}; } // no toque, a abelha fica acima do dedo
function size(){
  const wrap = document.getElementById("beeWrap"); if(!wrap||!C) return;
  W = Math.max(280, wrap.clientWidth); H = Math.round(clamp(W*.5, 300, 420));
  DPR = Math.min(2, window.devicePixelRatio||1);
  C.width = Math.round(W*DPR); C.height = Math.round(H*DPR); C.style.height = H+"px";
  if(R && R.bx>W*.58 && !LEVELS[R.lv].final) R.bx = W*.4;
}
function onResize(){ size(); }
function onVis(){ if(document.hidden && R && R.status==="play"){ R.status="pause"; chrome(); } }
function unmount(){
  window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey);
  window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis);
  cancelAnimationFrame(raf); C = null; ctx = null;
}
B.mount = function(){
  const c = document.getElementById("beeCanvas"); if(!c || c === C) return;
  if(C) unmount();
  C = c; ctx = c.getContext("2d"); size();
  window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
  window.addEventListener("resize", onResize); document.addEventListener("visibilitychange", onVis);
  let lastTap = 0;
  c.addEventListener("pointerdown", e=>{ if(R.status!=="play") return; const now = performance.now(); if(e.pointerType!=="mouse" && now-lastTap<280) tryDash(); lastTap = now; if(e.pointerType==="mouse" && e.button===0 && e.detail===2) tryDash(); ptr = ptrPos(e); try{ c.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); });
  c.addEventListener("pointermove", e=>{ if(R.status!=="play") return; if(e.pointerType==="mouse" || ptr) ptr = ptrPos(e); });
  c.addEventListener("pointerup", e=>{ if(e.pointerType!=="mouse") ptr = null; });
  c.addEventListener("pointerleave", e=>{ if(e.pointerType==="mouse") ptr = null; });
  let last = performance.now();
  const frame = now => {
    if(!C || !C.isConnected){ unmount(); return; }
    const dt = Math.min(.05, (now-last)/1000); last = now;
    update(dt); draw();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
};

B.act = function(a){
  if(!R) return false;
  if(a==="g-bee-go" || a==="g-bee-resume"){ R.status = "play"; ptr = null; Object.keys(keys).forEach(k=>keys[k]=false); }
  else if(a==="g-bee-story"){ storyImage(); return true; }
  else if(a==="g-bee-dash"){ tryDash(); return true; }
  else if(a==="g-bee-pause"){ if(R.status==="play") R.status = "pause"; }
  else if(a==="g-bee-retry"){ startLevel(R.lv); R.status = "play"; }
  else if(a==="g-bee-next"){ startLevel(Math.min(NLV-1, R.lv+1)); }
  else if(a==="g-bee-restart"){ R = newRun(); startLevel(0); }
  else return false;
  chrome(); if(C && R.status==="play") C.focus({preventScroll:true});
  return true;
};
B.init = function(ctx_){ X = ctx_; };
B._test = {LEVELS, get R(){ return R; }, startLevel, update, set R(v){ R=v; }};
window.BeeGame = B;
})();
