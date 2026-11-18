/* Identidade visual "Colmeia" — compartilhada pelos jogos.
   Regra central: cor = polinização viva; perda = dessaturação para o cinza-poeira.
   Mascote: Jandi, uma jandaíra (Melipona subnitida), abelha nativa sem ferrão do semiárido. */
(function(){
"use strict";
let langFn = ()=>"pt";
const P = {mel:"#F2A93B", polen:"#FFD66B", folha:"#4C8C4A", broto:"#A8D08D", terra:"#8A5A3C", creme:"#FFF6E5", poeira:"#B8B2A7", tinta:"#2E2418"};

/* ---------------- Jandi (estilo ilustrado) ----------------
   Jandaíra (Melipona subnitida) de perfil: tórax com pelos, olho composto, ocelos,
   antena geniculada, asas com venação reduzida, abdome com faixas, tíbia posterior larga
   (corbícula). Desenho original, simplificado, cores aproximadas. Ids únicos por cópia. */
let JN = 0;
const r1 = n => Math.round(n*10)/10;
function zRand(seed){ let a = seed>>>0||1; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
function zSmooth(p, closed=true){ const n=p.length; let d=`M${r1(p[0][0])} ${r1(p[0][1])}`; const m=closed?n:n-1; for(let i=0;i<m;i++){ let p0=p[(i-1+n)%n],p1=p[i],p2=p[(i+1)%n],p3=p[(i+2)%n]; if(!closed&&i===0)p0=p1; if(!closed&&i===n-2)p3=p2; d+=`C${r1(p1[0]+(p2[0]-p0[0])/6)} ${r1(p1[1]+(p2[1]-p0[1])/6)} ${r1(p2[0]-(p3[0]-p1[0])/6)} ${r1(p2[1]-(p3[1]-p1[1])/6)} ${r1(p2[0])} ${r1(p2[1])}`; } return d+(closed?"Z":""); }
function zBlob(cx,cy,rx,ry,n,amp,seed){ const R=zRand(seed*977); return Array.from({length:n},(_,i)=>{ const a=i/n*Math.PI*2, k=1+amp*(R()*2-1); return [cx+rx*k*Math.cos(a), cy+ry*k*Math.sin(a)]; }); }
function zIn([x,y],poly){ let s=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const [xi,yi]=poly[i],[xj,yj]=poly[j]; if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi) s=!s; } return s; }
function zDots(poly,n,c,o){ o=o||{}; const R=zRand((o.seed||3)*131), xs=poly.map(p=>p[0]), ys=poly.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys); let g="",k=0,t=0; while(k<n&&t<n*40){ t++; const p=[x0+R()*(x1-x0), y0+R()*(y1-y0)]; if(!zIn(p,poly)) continue; g+=`<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r1((o.rmin||.9)+R()*((o.rmax||2)-(o.rmin||.9)))}" fill="${c}" opacity="${o.op||.4}"/>`; k++; } return g; }
const zP = (d,f,s,w,x) => `<path d="${d}" fill="${f||"none"}"${s?` stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`:""}${x||""}/>`;
const zE = (cx,cy,rx,ry,f,s,w,rot,x) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${f}"${s?` stroke="${s}" stroke-width="${w}"`:""}${rot?` transform="rotate(${r1(rot)} ${r1(cx)} ${r1(cy)})"`:""}${x||""}/>`;
const ABD = (()=>{ const p=[]; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, lx=104*Math.cos(a)*(1+.05*Math.sin(3*a)), ly=70*Math.sin(a)*(Math.cos(a)>0?.82:1), t=.2; p.push([575+lx*Math.cos(t)-ly*Math.sin(t), 318+lx*Math.sin(t)+ly*Math.cos(t)]); } return p; })();
const THX = zBlob(410,284,72,62,16,.05,5), HEAD = zBlob(300,292,48,56,14,.05,8);
// partes estáticas (texto calculado uma vez; só os ids mudam por cópia)
const STATIC = (()=>{
  const R = zRand(77); let hairs = "";
  for(let i=0;i<46;i++){ const a=-Math.PI*.95+R()*Math.PI*1.1, rr=58+R()*16, x=410+Math.cos(a)*rr, y=284+Math.sin(a)*rr*.86, l=7+R()*7; hairs += zP(`M${r1(x)} ${r1(y)}l${r1(Math.cos(a)*l)} ${r1(Math.sin(a)*l)}`,"none","#c9a173",1.4,' opacity=".75"'); }
  hairs += zDots(THX,40,"#c9a173",{rmin:.8,rmax:1.6,seed:12,op:.5});
  const bands = [0,1,2,3].map(i=>{ const x=540+i*40; return zP(`M${x} 220C${x-20} 270 ${x-20} 340 ${x-6} 410L${x+8} 410C${x-6} 340 ${x-6} 270 ${x+14} 220Z`,"#f0c14a",null,0,' opacity=".85" transform="rotate(11 575 318)"'); }).join("") + zDots(ABD,70,"#5e2f10",{rmin:.8,rmax:1.8,seed:9,op:.35});
  const eyeDots = zDots(zBlob(300,282,20,33,12,0,1),36,"#9a8a80",{rmin:.7,rmax:1.2,seed:3,op:.45});
  return {hairs, bands, eyeDots};
})();
const leg = (pts,w) => zP(zSmooth(pts,false),"none","#3a2617",w) + pts.slice(1,-1).map(p=>zE(p[0],p[1],w*.55,w*.55,"#2a1a0e")).join("");
const LEG2 = [[394,340],[392,392],[380,436],[372,462],[358,470]];
const FRONT = { // primeira perna conforme a pose
  fly:[[356,332],[336,376],[326,418],[308,446],[292,452]],
  sad:[[356,332],[336,376],[326,418],[308,446],[292,452]],
  cheer:[[350,322],[312,262],[286,214],[268,176]],
  tip:[[352,322],[316,290],[276,244],[246,204]],
  cross:[[356,330],[318,356],[276,350],[252,330]],
  host:[[352,330],[318,330],[282,318],[256,300]],
  detective:[[352,324],[318,322],[280,318],[256,306]]
};
function jandi(pose, cls){
  pose = pose || "fly";
  const k = "jd"+(++JN)+"_", u = n => `url(#${k}${n})`;
  const rg = (n,s,fx=.38,fy=.3,r=.75) => `<radialGradient id="${k}${n}" cx=".5" cy=".5" fx="${fx}" fy="${fy}" r="${r}">${s.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join("")}</radialGradient>`;
  const defs = `<defs>${rg("h",[[0,"#7a5236"],[.55,"#4a2f1d"],[1,"#26170d"]],.36)}${rg("t",[[0,"#8a5d3c"],[.55,"#5a3a24"],[1,"#2e1d12"]],.38,.28)}${rg("a",[[0,"#e2a04e"],[.55,"#b8692a"],[1,"#7a3f17"]],.4,.3,.8)}${rg("e",[[0,"#6b5a50"],[.5,"#2f2420"],[1,"#140e0b"]],.35)}
    <linearGradient id="${k}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#e6f0f6" stop-opacity=".6"/><stop offset="1" stop-color="#cfdde8" stop-opacity=".5"/></linearGradient>
    <clipPath id="${k}c"><path d="${zSmooth(ABD)}"/></clipPath></defs>`;
  const wings = `<g class="jw">${zP(zSmooth([[392,214],[470,176],[560,170],[612,186],[604,212],[530,230],[440,236]]),u("w"),"#a8b8c4",1.6)}${zP(zSmooth([[380,226],[440,150],[540,112],[640,104],[690,124],[668,160],[580,196],[470,226]]),u("w"),"#9fb0bd",1.8)}${zP("M388 222C440 186 500 160 560 146M402 218C460 196 520 176 600 160M470 186L486 222M532 162L540 196","none","#8a6a4a",1.6)}</g>`;
  const back = leg(LEG2,8) + leg([[440,330],[480,366],[492,396]],9) + zP(zSmooth([[486,390],[528,398],[560,428],[552,458],[516,458],[492,432]]),"#3a2617","#24160c",1.5) + leg([[548,452],[566,482],[574,500],[566,512]],5.5);
  const body = zP(zSmooth(ABD),u("a"),"#5e2f10",2) + `<g clip-path="url(#${k}c)">${STATIC.bands}</g>` + zP("M672 362l12 8-14 2","#5e2f10","#3a1c08",1.2) + zE(478,300,14,17,"#3a2617")
    + zP(zSmooth(THX),u("t"),"#1f130b",2) + STATIC.hairs;
  const head = zP(zSmooth(HEAD),u("h"),"#140c06",2) + zE(300,282,22,36,u("e"),"#0d0806",1.2,-8) + STATIC.eyeDots + zE(292,266,6,10,"#fff","",0,-8,' opacity=".55"')
    + [[318,240],[328,246],[308,244]].map(p=>zE(p[0],p[1],3.2,3.2,"#f4e2b0","#3a2617",1)).join("")
    + zP(zSmooth([[276,252],[262,218],[252,196]],false),"none","#2a1a0e",6) + zP(zSmooth([[252,196],[222,184],[196,186],[176,198],[166,214]],false),"none","#2a1a0e",4.5) + zE(252,196,5,5,"#3a2617")
    + zP("M262 330c-12 6-16 14-10 20 8-2 14-8 16-16z","#5a3a24","#1f130b",1.2);
  let extra = "", front = leg(FRONT[pose]||FRONT.fly, 8), over = "";
  if(pose==="cross") front += leg([[372,334],[330,346],[286,330],[262,312]],8);
  if(pose==="cheer") front += leg([[368,322],[346,256],[334,206],[332,166]],8) + `<g fill="#F2A93B">${[[236,160],[372,140],[300,120]].map(([x,y])=>`<path d="M${x} ${y-12}l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/>`).join("")}</g>`;
  if(pose==="tip") over = `<g><circle cx="226" cy="160" r="40" fill="#FFF3C4" opacity=".7"/><circle cx="226" cy="160" r="28" fill="#FFD66B" stroke="#8A5A3C" stroke-width="4"/><path d="M215 186h22v12h-22z" fill="#8A5A3C"/><path d="M226 114v-12M184 160h-12M268 160h12M196 130l-8-8M256 130l8-8" stroke="#F2A93B" stroke-width="5" stroke-linecap="round"/><path d="M218 168c4-10 12-10 16 0" stroke="#8A5A3C" stroke-width="3" fill="none"/></g>`;
  if(pose==="host"){ extra = `<path d="M338 344l-30-18v36zM338 344l30-18v36z" fill="#B3261E" stroke="#5E120E" stroke-width="2"/><circle cx="338" cy="344" r="8" fill="#F2A93B" stroke="#5E120E" stroke-width="2"/>`;
    over = `<g transform="rotate(-30 236 280)"><rect x="228" y="282" width="17" height="64" rx="6" fill="#2E2418"/><circle cx="236" cy="268" r="25" fill="#B8BEC4" stroke="#2E2418" stroke-width="4"/><path d="M218 262h36M216 272h40M222 252h28" stroke="#7d848a" stroke-width="2.5"/></g>`; }
  if(pose==="detective"){ extra = `<path d="M240 248c22 6 92 6 122-6l-6-16c-30 10-82 12-112 6z" fill="#2E2418"/><path d="M262 232c0-30 74-40 88-8z" fill="#3A3027"/><path d="M262 230c26 4 56 3 88-6" stroke="#8A5A3C" stroke-width="7"/>`;
    over = `<g><circle cx="236" cy="300" r="26" fill="rgba(200,230,255,.45)" stroke="#2E2418" stroke-width="6"/><path d="M254 318l16 16" stroke="#5B3A24" stroke-width="9" stroke-linecap="round"/></g>`; }
  if(pose==="sad") extra = zP("M276 300c4-4 10-4 14 0","none","#FFF6E5",2.5);
  return `<svg class="jandi jandi--${pose} ${cls||""}" viewBox="150 90 560 440" aria-hidden="true">${defs}${wings}${back}${body}${head}${front}${extra}${over}</svg>`;
}

/* ---------------- sons (Web Audio, sem arquivos) ---------------- */
const Sfx = (function(){
  let on = true; try{ on = localStorage.getItem("cm-sound")!=="off"; }catch(_){}
  let ac = null, buzzNode = null, rainNode = null;
  function ctx(){ if(!on) return null; try{ if(!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); if(ac.state==="suspended") ac.resume(); }catch(_){ return null; } return ac; }
  function noise(a, dur){ const b = a.createBuffer(1, Math.max(1,Math.floor(a.sampleRate*dur)), a.sampleRate), d = b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; const s=a.createBufferSource(); s.buffer=b; return s; }
  function env(a, g, t0, peak, att, dec){ g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(peak,t0+att); g.gain.exponentialRampToValueAtTime(0.0001,t0+att+dec); }
  const api = {
    get on(){ return on; },
    toggle(){ on = !on; try{ localStorage.setItem("cm-sound", on?"on":"off"); }catch(_){} if(!on){ api.buzz(false); api.rain(false); } return on; },
    plim(){ const a=ctx(); if(!a) return; const t=a.currentTime; [1318,1976,2637].forEach((f,i)=>{ const o=a.createOscillator(), g=a.createGain(); o.type="sine"; o.frequency.value=f; env(a,g,t+i*.03,.12/(i+1),.005,.5); o.connect(g).connect(a.destination); o.start(t+i*.03); o.stop(t+.7); }); },
    murchar(){ const a=ctx(); if(!a) return; const t=a.currentTime, n=noise(a,1), f=a.createBiquadFilter(), g=a.createGain(); f.type="bandpass"; f.Q.value=1.2; f.frequency.setValueAtTime(3200,t); f.frequency.exponentialRampToValueAtTime(300,t+.9); env(a,g,t,.22,.05,.85); n.connect(f).connect(g).connect(a.destination); n.start(t); n.stop(t+1); },
    tum(){ const a=ctx(); if(!a) return; const t=a.currentTime, o=a.createOscillator(), g=a.createGain(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(45,t+.18); env(a,g,t,.5,.004,.25); o.connect(g).connect(a.destination); o.start(t); o.stop(t+.3);
      const n=noise(a,.05), g2=a.createGain(), f=a.createBiquadFilter(); f.type="highpass"; f.frequency.value=1500; env(a,g2,t,.15,.002,.04); n.connect(f).connect(g2).connect(a.destination); n.start(t); },
    flip(){ const a=ctx(); if(!a) return; const t=a.currentTime, n=noise(a,.03), g=a.createGain(), f=a.createBiquadFilter(); f.type="highpass"; f.frequency.value=2500; env(a,g,t,.08,.001,.025); n.connect(f).connect(g).connect(a.destination); n.start(t); },
    drum(dur){ const a=ctx(); if(!a) return; const t0=a.currentTime; for(let t=0;t<dur;t+=.045){ const n=noise(a,.04), g=a.createGain(), f=a.createBiquadFilter(); f.type="bandpass"; f.frequency.value=900; env(a,g,t0+t,.05+.12*(t/dur),.002,.035); n.connect(f).connect(g).connect(a.destination); n.start(t0+t); } },
    applause(){ const a=ctx(); if(!a) return; const t0=a.currentTime; for(let i=0;i<70;i++){ const t=Math.random()*1.6, n=noise(a,.03), g=a.createGain(), f=a.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1500+Math.random()*1500; env(a,g,t0+t,.06,.002,.03); n.connect(f).connect(g).connect(a.destination); n.start(t0+t); } },
    zap(){ const a=ctx(); if(!a) return; const t=a.currentTime, o=a.createOscillator(), g=a.createGain(); o.type="triangle"; o.frequency.setValueAtTime(500,t); o.frequency.exponentialRampToValueAtTime(1400,t+.15); env(a,g,t,.08,.005,.15); o.connect(g).connect(a.destination); o.start(t); o.stop(t+.2); },
    buzz(start){
      if(!start){ if(buzzNode){ const a=ac, t=a.currentTime; buzzNode.g.gain.cancelScheduledValues(t); buzzNode.g.gain.setTargetAtTime(0.0001,t,.05); const b=buzzNode; setTimeout(()=>{ try{ b.o1.stop(); b.o2.stop(); b.lfo.stop(); }catch(_){} },400); buzzNode=null; } return; }
      const a=ctx(); if(!a || buzzNode) return; const t=a.currentTime;
      const o1=a.createOscillator(), o2=a.createOscillator(), f=a.createBiquadFilter(), g=a.createGain(), lfo=a.createOscillator(), lg=a.createGain();
      o1.type=o2.type="sawtooth"; o1.frequency.value=190; o2.frequency.value=193.5; f.type="lowpass"; f.frequency.value=520;
      g.gain.setValueAtTime(0.0001,t); g.gain.setTargetAtTime(.022,t,.3); lfo.frequency.value=5.5; lg.gain.value=.008; lfo.connect(lg).connect(g.gain);
      o1.connect(f); o2.connect(f); f.connect(g).connect(a.destination); o1.start(); o2.start(); lfo.start(); buzzNode={o1,o2,lfo,g};
    },
    rain(start){
      if(!start){ if(rainNode){ try{ rainNode.stop(); }catch(_){} rainNode=null; } return; }
      const a=ctx(); if(!a || rainNode) return; const n=noise(a,2), f=a.createBiquadFilter(), g=a.createGain(); n.loop=true; f.type="lowpass"; f.frequency.value=1200; g.gain.value=.03; n.connect(f).connect(g).connect(a.destination); n.start(); rainNode=n;
    }
  };
  return api;
})();

/* ---------------- números ---------------- */
function num(v, d){ return (v==null||isNaN(v)) ? "—" : Number(v).toLocaleString(langFn()==="en"?"en-US":"pt-BR",{minimumFractionDigits:d==null?1:d, maximumFractionDigits:d==null?1:d}); }
function countUp(el, from, to, ms, fmt){ const t0=performance.now(); const step=t=>{ const k=Math.min(1,(t-t0)/ms), e=1-Math.pow(1-k,3); el.textContent = fmt(from+(to-from)*e); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }

/* ---------------- imagem para compartilhar ---------------- */
function paper(ctx, w, h, base){
  ctx.fillStyle = base || P.creme; ctx.fillRect(0,0,w,h);
  for(let i=0;i<w*h/900;i++){ ctx.fillStyle = `rgba(138,90,60,${Math.random()*.05})`; ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
}
function wrapText(ctx, text, x, y, maxW, lh){ const words = String(text).split(" "); let line = ""; for(const w of words){ const t = line ? line+" "+w : w; if(ctx.measureText(t).width>maxW && line){ ctx.fillText(line,x,y); y+=lh; line=w; } else line=t; } if(line) ctx.fillText(line,x,y); return y+lh; }
function svgToImage(svg){ return new Promise(res=>{ const img = new Image(); img.onload=()=>res(img); img.onerror=()=>res(null); img.src = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.replace("<svg ","<svg xmlns=\"http://www.w3.org/2000/svg\" ")); }); }
function siteUrl(){ try{ return location.href.split("#")[0]; }catch(_){ return ""; } }

function share(canvas, opt){
  const url = canvas.toDataURL("image/png");
  const lang = langFn();
  const T = (pt,en)=> lang==="en"?en:pt;
  let box = document.getElementById("cmShare");
  if(!box){ box = document.createElement("div"); box.id="cmShare"; box.className="cm-share"; document.body.appendChild(box); }
  box.innerHTML = `<div class="cm-share-card" role="dialog" aria-modal="true" aria-label="${T("Imagem para compartilhar","Image to share")}">
    <img src="${url}" alt="${(opt.alt||"").replace(/"/g,"&quot;")}">
    <div class="cm-share-side">
      <p>${opt.text||""}</p>
      <div class="cm-row"><button type="button" class="cm-btn" data-cm="share">${T("Compartilhar","Share")}</button>
      <a class="cm-btn ghost" href="${url}" download="${opt.file||"jogo.png"}">${T("Baixar imagem","Download image")}</a>
      <button type="button" class="cm-btn ghost" data-cm="copy">${T("Copiar texto","Copy text")}</button></div>
      <p class="cm-small">${T("Se o botão não funcionar aqui, toque e segure a imagem (ou clique com o botão direito) para salvar.","If the button does nothing here, press and hold the image (or right-click) to save it.")}</p>
      <button type="button" class="cm-btn ghost" data-cm="close">${T("Fechar","Close")}</button>
    </div></div>`;
  box.hidden = false;
  box.onclick = async e=>{
    const b = e.target.closest("[data-cm]"); if(!b){ if(e.target===box) box.hidden = true; return; }
    const k = b.dataset.cm;
    if(k==="close") box.hidden = true;
    if(k==="copy"){ try{ await navigator.clipboard.writeText(opt.text+" "+siteUrl()); b.textContent = T("Copiado","Copied"); }catch(_){ b.textContent = T("Não foi possível copiar","Could not copy"); } }
    if(k==="share"){
      try{ const blob = await (await fetch(url)).blob(); const file = new File([blob], opt.file||"jogo.png", {type:"image/png"});
        if(navigator.canShare && navigator.canShare({files:[file]})) await navigator.share({files:[file], text:opt.text+" "+siteUrl()});
        else if(navigator.share) await navigator.share({text:opt.text, url:siteUrl()});
        else throw 0;
      }catch(_){ b.textContent = T("Use Baixar imagem","Use Download image"); }
    }
  };
}

window.Colmeia = {setLang:f=>{langFn=f;}, P, jandi, Sfx, num, countUp, paper, wrapText, svgToImage, share, siteUrl};
})();
