/* Ilustrações dos alimentos da Feira Sem Abelhas (frutas, legumes, raízes e sementes).
   Um desenho por espécie, com a morfologia de cada fruto: cálice e pedúnculo no lugar certo,
   cortes que mostram polpa e sementes, texturas sempre recortadas dentro do contorno (clipPath).
   Esquema original, fora de escala. Ids com prefixo único por figura ("al<N>_"). */
(function(){
"use strict";
let N = 0;
const r1 = n => Math.round(n*10)/10;
function shade(h, k){ const n = parseInt(h.slice(1),16), r=n>>16, g=n>>8&255, b=n&255, f = v => Math.round(k>0 ? v+(255-v)*k : v*(1+k)); return "#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join(""); }
function rand(seed){ let a = seed>>>0 || 1; return () => { a = (a+0x6D2B79F5)>>>0; let t = a; t = Math.imul(t^t>>>15, t|1); t ^= t+Math.imul(t^t>>>7, t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
/* contorno suave (Catmull-Rom → Bézier) */
function smooth(p, closed=true){ const n = p.length; let d = `M${r1(p[0][0])} ${r1(p[0][1])}`; const m = closed ? n : n-1;
  for(let i=0;i<m;i++){ let p0=p[(i-1+n)%n], p1=p[i], p2=p[(i+1)%n], p3=p[(i+2)%n]; if(!closed&&i===0) p0=p1; if(!closed&&i===n-2) p3=p2;
    d += `C${r1(p1[0]+(p2[0]-p0[0])/6)} ${r1(p1[1]+(p2[1]-p0[1])/6)} ${r1(p2[0]-(p3[0]-p1[0])/6)} ${r1(p2[1]-(p3[1]-p1[1])/6)} ${r1(p2[0])} ${r1(p2[1])}`; }
  return d + (closed ? "Z" : ""); }
const inside = ([x,y], poly) => { let s=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const [xi,yi]=poly[i],[xj,yj]=poly[j]; if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) s=!s; } return s; };
const bez = (a,b,c,d) => t => { const u=1-t; return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0], u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]; };
/* corpo alongado ao longo de uma curva c(t), com meia-largura w(t): pepino, banana, quiabo, raízes */
function tube(c, w, n=36){ const L=[], R=[], mid=[];
  for(let i=0;i<=n;i++){ const t=i/n, p=c(t), a=c(Math.max(0,t-.01)), b=c(Math.min(1,t+.01)); let dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; dx/=l; dy/=l;
    const ww=w(t); L.push([p[0]-dy*ww, p[1]+dx*ww]); R.push([p[0]+dy*ww, p[1]-dx*ww]); mid.push({p, nx:-dy, ny:dx, w:ww}); }
  return {poly: L.concat(R.reverse()), mid}; }
/* linha paralela ao eixo, deslocada por uma fração k da meia-largura */
const along = (mid, k, t0=0, t1=1) => smooth(mid.filter((_,i)=>{ const t=i/(mid.length-1); return t>=t0 && t<=t1; }).map(m=>[m.p[0]+m.nx*m.w*k, m.p[1]+m.ny*m.w*k]), false);
const blob = (cx,cy,rx,ry,n,amp,seed,mod) => { const R=rand(seed*977); return Array.from({length:n},(_,i)=>{ const a=i/n*Math.PI*2, k=(1+amp*(R()*2-1))*(mod?mod(a):1); return [cx+rx*k*Math.cos(a), cy+ry*k*Math.sin(a)]; }); };
const rot = (pts, cx, cy, deg) => { const a=deg*Math.PI/180, c=Math.cos(a), s=Math.sin(a); return pts.map(([x,y])=>[cx+(x-cx)*c-(y-cy)*s, cy+(x-cx)*s+(y-cy)*c]); };
/* pontos aleatórios dentro de um polígono */
function scatter(poly, n, seed){ const R=rand(seed*131), xs=poly.map(p=>p[0]), ys=poly.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys); const out=[]; let t=0;
  while(out.length<n && t<n*60){ t++; const p=[x0+R()*(x1-x0), y0+R()*(y1-y0)]; if(inside(p,poly)) out.push(p.concat(R())); } return out; }
/* folha lanceolada da base (x,y) até a ponta (tx,ty) */
function leafPath(x,y,tx,ty,wk=.28,bend=0){ const dx=tx-x, dy=ty-y, l=Math.hypot(dx,dy), nx=-dy/l*l*wk, ny=dx/l*l*wk, mx=x+dx*.45+(-dy/l)*bend, my=y+dy*.45+(dx/l)*bend;
  return `M${r1(x)} ${r1(y)}Q${r1(mx+nx)} ${r1(my+ny)} ${r1(tx)} ${r1(ty)}Q${r1(mx-nx)} ${r1(my-ny)} ${r1(x)} ${r1(y)}Z`; }

function kit(){
  const k = "al"+(++N)+"_"; let defs = "", n = 0; const id = () => k+(n++);
  const rg = (c, o={}) => { const i=id(), {fx=.36, fy=.3, r=.8, hi=.42, lo=-.34} = o; defs += `<radialGradient id="${i}" cx=".5" cy=".5" fx="${fx}" fy="${fy}" r="${r}"><stop offset="0" stop-color="${shade(c,hi)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,lo)}"/></radialGradient>`; return `url(#${i})`; };
  const rs = (stops, o={}) => { const i=id(), {fx=.4, fy=.35, r=.75} = o; defs += `<radialGradient id="${i}" cx=".5" cy=".5" fx="${fx}" fy="${fy}" r="${r}">${stops.map(([p,c])=>`<stop offset="${p}" stop-color="${c}"/>`).join("")}</radialGradient>`; return `url(#${i})`; };
  const lg = (stops, x2=1, y2=0) => { const i=id(); defs += `<linearGradient id="${i}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([p,c])=>`<stop offset="${p}" stop-color="${c}"/>`).join("")}</linearGradient>`; return `url(#${i})`; };
  const clip = d => { const i=id(); defs += `<clipPath id="${i}"><path d="${d}"/></clipPath>`; return ` clip-path="url(#${i})"`; };
  const svg = body => `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>${defs}</defs><ellipse cx="50" cy="90" rx="32" ry="4.5" fill="#2E2418" opacity=".13"/>${body}</svg>`;
  return {rg, rs, lg, clip, svg};
}
const P = (d, f="none", s="none", w=0, x="") => `<path d="${d}" fill="${f}"${s!=="none"?` stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`:""}${x}/>`;
const E = (cx,cy,rx,ry,f,s="none",w=0,deg=0,x="") => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${f}"${s!=="none"?` stroke="${s}" stroke-width="${w}"`:""}${deg?` transform="rotate(${r1(deg)} ${r1(cx)} ${r1(cy)})"`:""}${x}/>`;
const G = (x, inner) => `<g${x}>${inner}</g>`;
const gloss = (cx,cy,rx,ry,deg=-30,op=.45) => E(cx,cy,rx,ry,"#fff","none",0,deg,` opacity="${op}"`);

/* fruto cortado ao meio visto de cima, com a parede do fruto por baixo (profundidade) */
function halfCut(K, cx, cy, rx, ry, rings, depth=4){
  let g = E(cx, cy+depth, rx, ry, K.rg(rings[0][0], {fy:.2}), shade(rings[0][0],-.45), 1);
  rings.forEach(([c,k,grad],i) => { g += E(cx, cy, rx*k, ry*k, grad || (i ? K.rs([[0,shade(c,.35)],[1,c]],{fx:.5,fy:.5}) : c), i===0 ? shade(c,-.45) : "none", i===0 ? 1 : 0); });
  return g;
}

const D = {
  maracuja(){ const K=kit();
    const body = rot(blob(42,50,24,29,18,.015,3),42,50,-14), d = smooth(body), cl = K.clip(d);
    let g = P("M33 24C31 17 34 12 39 9", "none", "#6B7A3A", 2.6) + P(leafPath(36,15,24,8,.3), K.rg("#6E9A3E"), "#4C6E2A", .8) + P(leafPath(37,14,46,6,.3), K.rg("#7FA548"), "#4C6E2A", .8);
    g += P(d, K.rg("#E9C232",{fx:.34,fy:.34}), "#A6851A", 1.2);
    g += G(cl, E(30,24,16,10,"#9DBB3E","none",0,-14,' opacity=".45"') + scatter(body,34,5).map(([x,y,r])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.5+r*.7)}" fill="#FFF8D6" opacity=".75"/>`).join(""));
    g += gloss(32,40,6,9,-20,.4);
    g += halfCut(K, 70, 69, 20, 14.5, [["#E2B92A",1],["#FBF2D8",.88],["#F0A51C",.7,K.rs([[0,"#F9C451"],[1,"#E58F13"]],{fx:.5,fy:.5})]]);
    const seeds = [[63,66],[68,63],[74,64],[78,68],[73,72],[66,72],[70,68],[61,70],[77,72]];
    g += seeds.map(([x,y])=>E(x,y,3,2.3,"#F7CF55","none",0,0,' opacity=".85"')+E(x,y+.2,1.6,1.2,"#1E1610")).join("");
    return K.svg(g); },

  tomate(){ const K=kit();
    const d = "M50 35C58 30 78 31 84 48C89 64 76 82 50 83C24 82 11 64 16 48C22 31 42 30 50 35Z", cl = K.clip(d);
    let g = P(d, K.rg("#E5483B",{fx:.34,fy:.32}), "#9E2A20", 1.3);
    g += G(cl, [-30,-16,16,30].map(k=>P(`M50 37Q${50+k*.9} 42 ${50+k*1.25} 60`,"none","#9E2A20",1.6,' opacity=".28"')).join(""));
    g += gloss(34,48,8,5,-25,.5);
    const sep = [-110,-40,25,85,150].map(a=>{ const r=a*Math.PI/180, tx=50+21*Math.cos(r), ty=36+9*Math.sin(r); return P(leafPath(50,36,tx,ty,.2,2), K.rg("#3F8A3C",{hi:.3}), "#2C6A2A", .7); }).join("");
    g += sep + P("M50 36C50 30 52 26 56 23", "none", "#3F7A32", 3.6) + E(56.4,22.6,2,1.4,"#9BC46A","none",0,-35);
    return K.svg(g); },

  maca(){ const K=kit();
    const d = "M50 31C44 23 24 22 19 41C15 60 28 85 43 85C46 85 54 85 57 85C72 85 85 60 81 41C76 22 56 23 50 31Z", cl = K.clip(d);
    let g = P(d, K.rg("#D7362C",{fx:.32,fy:.3}), "#8A1F18", 1.3);
    g += G(cl, E(68,66,14,16,"#F2B13A","none",0,0,' opacity=".28"') + [-22,-12,-4,6,14,24].map((k,i)=>P(`M${50+k*.3} 33Q${50+k*1.3} 55 ${50+k*.55} 84`,"none",i%2?"#9E1E18":"#F07A5A",1.4,' opacity=".3"')).join("")
      + scatter([[20,40],[80,40],[78,70],[50,84],[22,70]],18,4).map(([x,y])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r=".7" fill="#FFD9A8" opacity=".7"/>`).join(""));
    g += E(50,31.5,6,2.4,"#7A1A14","none",0,0,' opacity=".55"') + gloss(32,44,7,10,-15,.45);
    g += P("M50 32C50 25 52 20 55 15", "none", "#6B4A24", 2.8) + P(leafPath(54,20,74,13,.28,-1), K.rg("#4C8C4A"), "#2F6A2E", .8) + P("M54 20Q64 15 74 13", "none", "#2F6A2E", .6);
    return K.svg(g); },

  acerola(){ const K=kit();
    const fr = (cx,cy,r,seed) => { const d = smooth(blob(cx,cy,r,r*.86,16,.02,seed,a=>1-.035*Math.abs(Math.sin(1.5*(a+Math.PI/2))))), cl = K.clip(d);
      return P(d, K.rg("#D9322A",{fx:.34,fy:.3}), "#8A1A16", 1.1) + G(cl, [-.38,.38].map(k=>P(`M${cx+k*r*.4} ${cy-r*.86}Q${cx+k*r*1.15} ${cy} ${cx+k*r*.4} ${cy+r*.86}`,"none","#8A1A16",1.2,' opacity=".3"')).join("")) + gloss(cx-r*.38,cy-r*.38,r*.25,r*.16,-30,.6) + E(cx,cy-r*.8,1.8,.9,"#6E2A16"); };
    let g = P("M52 15C52 24 50 34 50 38M52 15C46 26 40 40 37 52M52 15C58 28 63 42 64 52", "none", "#5B7A2E", 1.8) + P(leafPath(52,16,70,10,.28), K.rg("#4C8C4A"), "#2F6A2E", .7);
    g += fr(50,43,11,2) + fr(37,63,14,5) + fr(64,65,15,8);
    return K.svg(g); },

  abobora(){ const K=kit(), base="#E9822E";
    const lobe = (cx,rx,ry,k) => E(cx,62,rx,ry,K.rg(shade(base,k),{fx:.4,fy:.32,lo:-.38}),shade(base,-.45),1);
    let g = lobe(25,12,22,-.18) + lobe(75,12,22,-.18) + lobe(36,14,25,-.06) + lobe(64,14,25,-.06) + lobe(50,14,26.5,.06);
    g += E(50,38,7,2.6,"#8A4A16","none",0,0,' opacity=".5"');
    g += P("M47 39C46 32 48 26 53 21L58 23C54 27 53 33 54 39Z", K.lg([[0,"#7C8A44"],[1,"#56642A"]]), "#3F4A1E", .9) + E(55.5,22,3,1.6,"#C9C38A","#56642A",.6,25);
    g += P("M48 37C49 31 51 27 54 23", "none", "#A8B06A", .8) + gloss(45,48,3.5,9,-8,.35);
    return K.svg(g); },

  goiaba(){ const K=kit();
    const body = rot(blob(38,46,22,26,18,.02,7,a=>1+.08*Math.sin(a)),38,46,-18), d = smooth(body), cl = K.clip(d);
    let g = P("M31 22C30 16 32 12 36 9", "none", "#6B4A24", 2.4) + P(leafPath(33,14,18,10,.3), K.rg("#5E9A44"), "#3A6E2A", .7);
    g += P(d, K.rg("#B5CC52",{fx:.34,fy:.32}), "#6C8A2A", 1.2);
    g += G(cl, scatter(body,40,9).map(([x,y,r])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.4+r*.7)}" fill="${r>.5?"#E8F2B0":"#7E9A34"}" opacity=".6"/>`).join(""));
    g += [0,72,144,216,288].map(a=>{ const r=a*Math.PI/180; return P(leafPath(46.5,71,46.5+4.5*Math.cos(r),71+3*Math.sin(r),.35),"#5A4426","#3E2E18",.5); }).join("") + E(46.5,71,1.8,1.2,"#3E2E18");
    g += gloss(30,36,5,8,-20,.38);
    g += halfCut(K, 71, 69, 19, 14, [["#B5CC52",1],["#F6A5A0",.9],["#E8637A",.55,K.rs([[0,"#F48A98"],[1,"#D9506A"]],{fx:.5,fy:.5})]]);
    g += scatter(blob(71,69,9.5,7,12,0,1),16,11).map(([x,y])=>E(x,y,1.1,.8,"#FBE7C6","#C9A57A",.3)).join("");
    return K.svg(g); },

  abacate(){ const K=kit();
    const pear = (cx,cy,w,h,deg) => rot([[0,-1],[.32,-.94],[.44,-.62],[.7,-.22],[.94,.18],[.9,.6],[.55,.92],[0,1],[-.55,.92],[-.9,.6],[-.94,.18],[-.7,-.22],[-.44,-.62],[-.32,-.94]].map(([x,y])=>[cx+x*w/2, cy+y*h/2]),cx,cy,deg);
    const whole = pear(68,52,36,62,14), dw = smooth(whole), clw = K.clip(dw);
    let g = P("M75.2 26C75.4 19 76.4 14 78.6 10", "none", "#6B4A24", 2.4);
    g += P(dw, K.rg("#3F6B2A",{fx:.3,fy:.3,hi:.3}), "#22401A", 1.2) + G(clw, scatter(whole,40,3).map(([x,y])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r=".7" fill="#7FA54E" opacity=".55"/>`).join(""));
    const half = pear(40,58,38,58,-10);
    g += P(smooth(half), "#2E5A22", "#1E3A16", 1.2);
    g += P(smooth(half.map(([x,y])=>[40+(x-40)*.9, 58+(y-58)*.92])), K.rs([[0,"#F4F2A8"],[.6,"#D9E68A"],[1,"#8DB548"]],{fx:.55,fy:.62,r:.62}));
    g += E(41.5,66,10.5,11.5,K.rg("#8A5A3C",{fx:.35,fy:.3,hi:.35}),"#5A3820",1) + gloss(38,62,3,2,-30,.45);
    return K.svg(g); },

  pepino(){ const K=kit();
    const T = tube(bez([12,60],[30,40],[60,24],[86,26]), t=>11.5*Math.pow(Math.sin(Math.PI*(.02+.96*t)),.32));
    const d = smooth(T.poly), cl = K.clip(d);
    let g = P(d, K.rg("#3E7A2E",{fx:.4,fy:.2,hi:.3}), "#22471A", 1.2);
    g += G(cl, [-.7,-.35,.05,.45].map(k=>P(along(T.mid,k),"none","#A9D07A",2.2,' opacity=".35"')).join("") + P(along(T.mid,-.55,.05,.95),"none","#fff",2.4,' opacity=".25"')
      + scatter(T.poly,30,6).map(([x,y])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r=".75" fill="#DDEEB8" opacity=".75"/>`).join(""));
    g += P("M86 26L93 22", "none", "#5B6B2A", 3.4) + E(12.6,60,1.8,1.6,"#E8D27A","#A99A4A",.5);
    g += halfCut(K, 68, 70, 14, 11, [["#3E7A2E",1],["#D8EDB0",.9],["#F1F8DC",.55]], 3);
    g += [0,120,240].map(a=>{ const r=a*Math.PI/180; return [.45,.8].map(f=>E(68+7*f*Math.cos(r+.25),70+5.5*f*Math.sin(r+.25),1.2,.7,"#F7F3D6","#B9C98A",.3,a)).join("")+[.45,.8].map(f=>E(68+7*f*Math.cos(r-.25),70+5.5*f*Math.sin(r-.25),1.2,.7,"#F7F3D6","#B9C98A",.3,a)).join(""); }).join("");
    return K.svg(g); },

  berinjela(){ const K=kit();
    const T = tube(bez([74,25],[66,40],[40,52],[26,74]), t=> t>.8 ? (6+14*t)*Math.sqrt(Math.max(0,1-Math.pow((t-.8)/.2,2))) : 6+14*t);
    const d = smooth(T.poly), cl = K.clip(d);
    let g = P(d, K.rg("#4A2160",{fx:.42,fy:.25,hi:.38,lo:-.45}), "#24102E", 1.2);
    g += G(cl, P(along(T.mid,-.5,.25,.9),"none","#fff",3.2,' opacity=".32"') + P(along(T.mid,-.62,.35,.6),"none","#fff",1.4,' opacity=".5"'));
    const sep = [[-38,16],[-14,19],[12,18],[34,15]].map(([a,l])=>{ const b=Math.atan2(40-25,66-74)+a*Math.PI/180; return P(leafPath(75,24,75+l*Math.cos(b),24+l*Math.sin(b),.26,1.5), K.rg("#4F8A3A",{hi:.3}), "#2C5A22", .7); }).join("");
    g += sep + E(75,24,7,4.5,K.rg("#5B9442"),"#2C5A22",.7,-35) + P("M76 22C78 16 82 13 86 11", "none", "#4F7A32", 4.4) + E(86.4,10.8,2.2,1.5,"#B9D08A","none",0,-30);
    return K.svg(g); },

  quiabo(){ const K=kit();
    const pod = (a,b,c,e,seed) => { const T = tube(bez(a,b,c,e), t=> t<.06 ? 6+t*40 : 8.6*Math.pow(1-t,.7)+.3), d = smooth(T.poly), cl = K.clip(d);
      return P(d, K.rg("#6FA545",{fx:.4,fy:.3,hi:.35}), "#3C6A22", 1) + G(cl, [-.62,-.2,.25,.66].map(k=>P(along(T.mid,k,.04,.97),"none","#3C6A22",1.1,' opacity=".45"')).join("") + P(along(T.mid,-.42,.06,.85),"none","#E2F2B8",1.6,' opacity=".55"')
        + scatter(T.poly,22,seed).map(([x,y])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r=".45" fill="#F2FAD8" opacity=".8"/>`).join(""))
        + E(a[0],a[1],6.5,3.6,K.rg("#5E8A34"),"#34561E",.7,Math.atan2(b[1]-a[1],b[0]-a[0])*57.3+90) + P(`M${a[0]} ${a[1]}l${r1((a[0]-b[0])*.25)} ${r1((a[1]-b[1])*.25)}`,"none","#4E6E2A",3); };
    return K.svg(pod([62,20],[70,40],[76,62],[80,84],3) + pod([30,22],[34,44],[46,66],[60,86],7)); },

  morango(){ const K=kit();
    const d = "M50 86C34 77 21 58 22 44C23 31 39 28 50 33C61 28 77 31 78 44C79 58 66 77 50 86Z", cl = K.clip(d);
    const poly = [[22,44],[30,32],[50,33],[70,32],[78,44],[70,64],[50,86],[30,64]];
    let g = P(d, K.rg("#E2333A",{fx:.36,fy:.3}), "#8E1A20", 1.2);
    const pts = []; for(let r=0;r<9;r++) for(let c=0;c<9;c++){ const x=25+c*6.6+(r%2)*3.3, y=38+r*5.4; if(inside([x,y],poly)) pts.push([x,y]); }
    g += G(cl, pts.map(([x,y])=>E(x,y,2,2.6,"#8E1A20","none",0,(x-50)*.6,' opacity=".28"')+E(x,y-.3,.9,1.5,"#F4D66A","#B8962A",.3,(x-50)*.6)).join(""));
    g += gloss(33,46,5,8,-25,.35);
    g += [-170,-140,-108,-72,-40,-10,20,160].map(a=>{ const r=a*Math.PI/180; return P(leafPath(50,33,50+19*Math.cos(r),33+8*Math.sin(r)+2,.22,1), K.rg("#3F8A3C",{hi:.3}), "#2A6028", .6); }).join("");
    g += P("M50 33C50 26 51 21 54 16", "none", "#4C7A32", 2.6);
    return K.svg(g); },

  caju(){ const K=kit();
    const d = "M50 17C58 17 63 21 64 30C65 41 69 52 67 62C65 70 58 73 50 73C42 73 35 70 33 62C31 52 35 41 36 30C37 21 42 17 50 17Z", cl = K.clip(d);
    let g = P("M50 18C50 13 51 9 54 6", "none", "#6B5A2A", 2.4);
    g += P(d, K.rs([[0,"#FFE07A"],[.35,"#F7A43A"],[.75,"#E8502E"],[1,"#B8301E"]],{fx:.36,fy:.25,r:.8}), "#9A2A16", 1.2);
    g += G(cl, [-9,-3,3,9].map(k=>P(`M${50+k*.6} 19Q${50+k*1.5} 45 ${50+k*1.1} 72`,"none","#B8301E",1.1,' opacity=".25"')).join(""));
    g += gloss(42,32,4,9,-6,.4);
    const nut = "M45 71C39 74 38 84 45 88C52 92 64 89 66 82C67 77 63 74 60 77C57 80 53 80 51 76C50 73 48 70 45 71Z";
    g += P(nut, K.rg("#9C8F66",{fx:.35,fy:.3,hi:.3}), "#5E553A", 1.1) + P("M44 80C47 86 56 87 62 83","none","#5E553A",.8,' opacity=".5"') + gloss(45,77,2,3,-15,.4);
    return K.svg(g); },

  coco(){ const K=kit();
    const body = rot(blob(38,48,23,28,18,.02,4,a=>1+.06*Math.sin(a)),38,48,-18), d = smooth(body), cl = K.clip(d);
    let g = P(d, K.rg("#7A4E2E",{fx:.34,fy:.3,hi:.3}), "#3E2614", 1.2);
    const R = rand(17); let fib = "";
    for(let i=0;i<70;i++){ const x=14+R()*50, y=18+R()*60, l=3+R()*5, a=-1.2+R()*.6; fib += P(`M${r1(x)} ${r1(y)}q${r1(l*.5)} ${r1(-l*.2)} ${r1(l*Math.cos(a))} ${r1(l*Math.sin(a))}`,"none",R()>.5?"#4A2E18":"#B07E52",.8,' opacity=".55"'); }
    g += G(cl, fib + [-.45,0,.45].map(k=>P(`M${30+k*10} 21Q${36+k*30} 48 ${46+k*12} 76`,"none","#3E2614",1.4,' opacity=".35"')).join(""));
    g += [[28,25],[34.5,22.5],[33,29.5]].map(([x,y])=>E(x,y,2.2,1.6,"#22140A","none",0,-18)).join("") + gloss(26,40,4,7,-20,.25);
    g += halfCut(K, 71, 70, 19, 13, [["#6E4528",1],["#FBF7EE",.84],["#EDE6D2",.5,K.rs([[0,"#F7F4EC"],[1,"#DCD3BC"]],{fx:.5,fy:.4})]]);
    return K.svg(g); },

  tangerina(){ const K=kit();
    const body = blob(44,58,30,24,28,.012,6), d = smooth(body), cl = K.clip(d);
    let g = P(d, K.rg("#F28C28",{fx:.34,fy:.3}), "#A8541A", 1.2);
    g += G(cl, scatter(body,90,8).map(([x,y,r])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.35+r*.5)}" fill="${r>.6?"#FFD08A":"#B8601C"}" opacity=".45"/>`).join(""));
    g += gloss(32,47,7,4.5,-20,.45) + E(46,35.5,3.2,1.4,"#A8541A","none",0,0,' opacity=".6"');
    g += P("M46 35C47 30 49 27 52 25", "none", "#5B6B2A", 2.2) + P(leafPath(51,26,74,19,.27,-1), K.rg("#2F7A3A",{hi:.35}), "#1E5426", .8) + P("M51 26Q62 21 74 19","none","#1E5426",.6);
    const seg = (cx,cy,deg) => G(` transform="rotate(${deg} ${cx} ${cy})"`, P(`M${cx-10} ${cy}C${cx-9} ${cy-9} ${cx+9} ${cy-9} ${cx+10} ${cy}C${cx+6} ${cy+3} ${cx-6} ${cy+3} ${cx-10} ${cy}Z`, K.rg("#F7A43C",{fx:.5,fy:.3,hi:.35}), "#C9701E", .8) + P(`M${cx-6} ${cy-3}Q${cx} ${cy-6} ${cx+6} ${cy-3}`,"none","#FFF0D2",.8,' opacity=".8"'));
    return K.svg(g); },

  feijao(){ const K=kit(), c="#7A3E25";
    let g = "";
    const bean = (x,y,s,a,k) => G(` transform="translate(${x} ${y}) rotate(${a}) scale(${s})"`, P("M-10 -1C-10 -7 -4 -8 0 -5.5C4 -8 10 -7 10 -1C10 5 5 7.5 0 7.5C-5 7.5 -10 5 -10 -1Z", K.rg(shade(c,k),{fx:.38,fy:.3,hi:.38}), shade(c,-.45), .9) + E(0,-5,1.9,1,"#F4EBDD","#B8A88A",.3) + E(-4,0,2.5,1.4,"#fff","none",0,-20,' opacity=".3"'));
    [[28,78,1.15,-8,0],[50,81,1.15,6,-.05],[72,78,1.15,-4,.05],[39,70,1.1,12,.08],[61,70,1.1,-10,0],[20,68,1,-25,-.08],[80,68,1,20,-.05],[50,61,1.05,0,.1],[31,59,.95,-14,0],[69,59,.95,14,.05],[42,51,.9,-6,.04],[58,51,.9,8,-.03],[50,43,.85,2,.06]].sort((p,q)=>p[1]-q[1]).forEach(([x,y,s,a,k])=>{ g += bean(x,y,s,a,k); });
    return K.svg(g); },

  pimentao(){ const K=kit();
    const d = "M28 41C27 31 39 30 50 34C61 30 73 31 72 41C74 55 74 68 70 78C68 85 62 87 58 82C55 87 45 87 42 82C38 87 32 85 30 78C26 68 26 55 28 41Z", cl = K.clip(d);
    let g = P(d, K.rg("#D9322A",{fx:.36,fy:.3}), "#8A1A16", 1.3);
    g += G(cl, P("M40 34Q36 58 42 84","none","#8A1A16",2.4,' opacity=".35"') + P("M60 34Q64 58 58 84","none","#8A1A16",2.4,' opacity=".35"') + gloss(33,52,3.5,13,-4,.45) + gloss(50,56,2.5,11,0,.3) + gloss(65,54,2.2,10,4,.25));
    g += P("M38 35C42 30 58 30 62 35C58 38 42 38 38 35Z", K.rg("#3F8A3C",{hi:.3}), "#2A6028", .8);
    g += P("M47 34C46 27 48 21 54 17L58 20C54 23 52 28 53 34Z", K.lg([[0,"#4F8A3A"],[1,"#2F6A2A"]]), "#22501E", .8) + E(56,18.4,2.6,1.6,"#B9D08A","#2F6A2A",.5,35);
    return K.svg(g); },

  banana(){ const K=kit();
    const w = t => t<.12 ? 3.2+t/.12*5.3 : t>.9 ? Math.max(2.4, 8.5*Math.sqrt((1-t)/.1)) : 8.5;
    const finger = (a,b,c,e,k) => { const T=tube(bez(a,b,c,e),w), d=smooth(T.poly), cl=K.clip(d), tip=T.mid[T.mid.length-1].p;
      return P(d, K.rg(shade("#F2CF3A",k),{fx:.4,fy:.25,hi:.35,lo:-.3}), "#A8861A", 1.1)
        + G(cl, P(along(T.mid,.4,.1,.96),"none","#B8961E",1.2,' opacity=".55"') + P(along(T.mid,-.3,.1,.96),"none","#B8961E",1,' opacity=".35"') + P(along(T.mid,-.62,.14,.8),"none","#fff",2,' opacity=".35"') + P(along(T.mid,.05,0,.14),"none","#8FB040",6,' opacity=".45"'))
        + E(tip[0],tip[1],2.6,2.2,"#4A3A1E"); };
    let g = finger([79,27],[80,52],[48,64],[26,38],-.12) + finger([79,28],[76,62],[40,74],[17,47],-.05) + finger([79,29],[72,72],[30,84],[12,59],.04);
    g += E(80,27,5,4.4,K.rg("#7A6A2E"),"#4E4218",.8) + P("M82 25C85 21 87 17 89 12","none","#6B5A24",5) + E(89.2,11.6,2.6,1.6,"#C9B87A","none",0,-30);
    return K.svg(g); },

  mandioca(){ const K=kit();
    const root = (a,b,c,e,seed) => { const T=tube(bez(a,b,c,e), t=>9.5*Math.pow(1-t,.5)*(1+.06*Math.sin(t*18))+.4), d=smooth(T.poly), cl=K.clip(d);
      let x = ""; const R=rand(seed); for(let i=4;i<T.mid.length-3;i+=2){ const m=T.mid[i], o=(R()-.5)*.5; x += P(`M${r1(m.p[0]+m.nx*m.w*(o-.5))} ${r1(m.p[1]+m.ny*m.w*(o-.5))}l${r1(m.nx*m.w*.6)} ${r1(m.ny*m.w*.6)}`,"none","#4A2A14",1,' opacity=".45"'); }
      const e0 = T.mid[0], ang = Math.atan2(e0.ny,e0.nx)*57.3, tipP = T.mid[T.mid.length-1].p;
      return P(d, K.rg("#8A5A34",{fx:.4,fy:.3,hi:.3}), "#4A2A14", 1.1) + G(cl, x + P(along(T.mid,-.5,.05,.8),"none","#C9A070",1.6,' opacity=".4"'))
        + P(`M${r1(tipP[0])} ${r1(tipP[1])}q4 1 8 5`,"none","#6B4426",.9)
        + E(e0.p[0],e0.p[1],e0.w,e0.w*.42,"#7A4A2A","#4A2A14",.8,ang) + E(e0.p[0],e0.p[1],e0.w*.86,e0.w*.36,"#EBC9B4","none",0,ang) + E(e0.p[0],e0.p[1],e0.w*.7,e0.w*.29,"#FBF6EA","none",0,ang) + E(e0.p[0],e0.p[1],e0.w*.12,e0.w*.06,"#E2D6B8","none",0,ang); };
    return K.svg(root([24,70],[46,74],[68,68],[90,58],3) + root([14,46],[36,44],[60,36],[84,26],8)); },

  batata(){ const K=kit();
    const tub = (cx,cy,rx,ry,deg,seed,k) => { const pts = rot(blob(cx,cy,rx,ry,12,.07,seed),cx,cy,deg), d=smooth(pts), cl=K.clip(d);
      const eyes = scatter(rot(blob(cx,cy,rx*.8,ry*.75,10,0,1),cx,cy,deg),5,seed+3).map(([x,y,r])=>P(`M${r1(x-2.2)} ${r1(y)}q2.2 -2 4.4 0`,"none","#6B4A26",.9)+E(x,y+.9,1,.6,"#5A3E1E")).join("");
      return P(d, K.rg(shade("#C9A26B",k),{fx:.36,fy:.3,hi:.32}), "#7A5A30", 1.1) + G(cl, eyes + scatter(pts,26,seed+5).map(([x,y])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r=".55" fill="#8A6A3A" opacity=".55"/>`).join("")) + gloss(cx-rx*.35,cy-ry*.35,rx*.2,ry*.14,deg-15,.35); };
    return K.svg(tub(36,60,24,17,-14,4,-.04) + tub(64,70,22,15,10,9,.04)); },

  cebola(){ const K=kit();
    const d = "M50 22C51 28 54 31 58 34C75 41 82 55 80 66C78 80 64 86 50 86C36 86 22 80 20 66C18 55 25 41 42 34C46 31 49 28 50 22Z", cl = K.clip(d);
    let g = P(d, K.rg("#C77B4A",{fx:.36,fy:.34}), "#7A421E", 1.3);
    g += G(cl, [-3,-2,-1,1,2,3].map(k=>P(`M50 26C${50+k*6} 38 ${50+k*11} 64 50 86`,"none",k%2?"#7A421E":"#F0B68A",1,' opacity=".35"')).join("") + gloss(33,56,5,12,-12,.3));
    g += P("M48 23C47 17 49 12 51 8C52 13 53 18 52 23Z", K.lg([[0,"#D9B48A"],[1,"#A8784A"]],0,1), "#7A5230", .8) + P("M51 8C50 5 52 3 54 2","none","#A8784A",.8);
    g += E(50,85.5,5,1.8,"#E8D8B8","#A89878",.6) + [-6,-4,-2,0,2,4,6].map(k=>P(`M${50+k*.6} 86.5q${k*.5} 2.5 ${k*.9} 5`,"none","#A89878",.7)).join("");
    return K.svg(g); },

  cenoura(){ const K=kit();
    const T = tube(bez([62,34],[56,52],[46,72],[36,90]), t=> t<.06 ? 11+t/.06*3 : 14*Math.pow(1-t,.9)+.6), d = smooth(T.poly), cl = K.clip(d);
    const R = rand(5); let rings = ""; for(let i=3;i<T.mid.length-4;i+=2){ const m=T.mid[i], s=R()*1.2-.9, l=.25+R()*.35; rings += P(`M${r1(m.p[0]+m.nx*m.w*s)} ${r1(m.p[1]+m.ny*m.w*s)}l${r1(m.nx*m.w*l)} ${r1(m.ny*m.w*l)}`,"none","#B8561A",.9,' opacity=".45"'); }
    const fr = (x2,y2,c1x,c1y,seed) => { let s = P(`M62 34Q${c1x} ${c1y} ${x2} ${y2}`,"none","#3F8A3C",1.8); const R2=rand(seed);
      for(let i=2;i<=5;i+=1.5){ const t=i/6, u=1-t, x=u*u*62+2*u*t*c1x+t*t*x2, y=u*u*34+2*u*t*c1y+t*t*y2; [-1,1].forEach(sg=>{ s += P(leafPath(x,y,x+sg*(5+R2()*2)-2,y-4-R2()*3,.35),"#4C9A44","#2F6A2E",.4); }); }
      return s; };
    let g = fr(50,8,54,20,1) + fr(76,12,68,20,2) + fr(36,18,48,24,4);
    g += P(d, K.rg("#E9822E",{fx:.42,fy:.2,hi:.35}), "#A8501A", 1.2) + G(cl, rings + E(60,35,9,4,"#8FB040","none",0,-20,' opacity=".45"') + P(along(T.mid,-.5,.06,.7),"none","#fff",2,' opacity=".3"'));
    g += P("M37 89q-2 2-3 3","none","#C9651C",.8);
    return K.svg(g); },

  alface(){ const K=kit(), B=[50,84];
    const leaf = (th,L,W,c,seed) => { const r=th*Math.PI/180, dx=Math.sin(r), dy=-Math.cos(r), cx=B[0]+dx*L*.52, cy=B[1]+dy*L*.52;
      const pts = rot(blob(cx,cy,W,L*.52,30,.02,seed,a=>1+.035*Math.sin(a*9+seed)+.025*Math.sin(a*17+seed*2)),cx,cy,th), d=smooth(pts), cl=K.clip(d), tx=B[0]+dx*L*1.02, ty=B[1]+dy*L*1.02;
      let v = P(`M${B[0]} ${B[1]}L${r1(tx)} ${r1(ty)}`,"none","#F2FAE0",2.6,' opacity=".85"');
      for(let i=1;i<=3;i++){ const f=i/4, x=B[0]+dx*L*f, y=B[1]+dy*L*f; [-1,1].forEach(sg=>{ v += P(`M${r1(x)} ${r1(y)}q${r1(-dy*sg*W*.5+dx*4)} ${r1(dx*sg*W*.5+dy*4)} ${r1(-dy*sg*W*1.1+dx*9)} ${r1(dx*sg*W*1.1+dy*9)}`,"none","#F2FAE0",.8,' opacity=".4"'); }); }
      return P(d, K.rg(c,{fx:.45,fy:.25,hi:.3,lo:-.28}), shade(c,-.42), 1) + G(cl, v); };
    let g = leaf(-62,46,17,"#5E9E3A",1) + leaf(62,46,17,"#5E9E3A",2) + leaf(0,62,20,"#6FAE45",3) + leaf(-34,54,18,"#7DBB4E",4) + leaf(34,54,18,"#7DBB4E",5) + leaf(-14,40,15,"#A3D06A",6) + leaf(14,40,15,"#A3D06A",7) + leaf(0,28,11,"#CBE79A",8);
    return K.svg(g); },

  abacaxi(){ const K=kit();
    const crown = [[-58,22,"#3E7A4A"],[58,22,"#3E7A4A"],[-36,30,"#4E8F5A"],[36,30,"#4E8F5A"],[-16,34,"#5E9E66"],[18,34,"#5E9E66"],[0,38,"#6FAE72"],[-48,16,"#5E9E66"],[46,17,"#5E9E66"]].map(([a,l,c])=>{ const r=(a-90)*Math.PI/180; return P(leafPath(50,40,50+l*Math.cos(r)*.9,40+l*Math.sin(r),.13,a*.04), K.lg([[0,shade(c,-.2)],[1,shade(c,.25)]],0,1), shade(c,-.4), .7); }).join("");
    const body = "M50 38C64 38 72 50 72 64C72 78 64 88 50 88C36 88 28 78 28 64C28 50 36 38 50 38Z", cl = K.clip(body);
    let fl = ""; for(let r=0;r<8;r++) for(let c=0;c<7;c++){ const x=28+c*7.6+(r%2)*3.8, y=40+r*6.6; fl += P(`M${x} ${y-4}L${x+4.2} ${y}L${x} ${y+4}L${x-4.2} ${y}Z`, K.rg("#E3AC3C",{fx:.4,fy:.3,hi:.35,lo:-.25}), "#7A5A1E", .7) + P(`M${x-1.4} ${y+.6}L${x} ${y-2.6}L${x+1.4} ${y+.6}`,"#4E6A2A","none") ; }
    let g = crown + P(body, "#B8862A") + G(cl, fl + E(40,56,6,14,"#fff","none",0,-10,' opacity=".18"') + E(64,72,12,20,"#5A3A10","none",0,0,' opacity=".18"')) + P(body,"none","#7A5A1E",1.1);
    return K.svg(g); },

  uva(){ const K=kit();
    const lobes = a => 1+.2*Math.cos(5*(a+Math.PI/2))-.06*Math.abs(Math.sin(2.5*(a+Math.PI/2)));
    const lf = blob(26,30,18,17,40,.015,2,lobes), dl = smooth(lf);
    let g = P(dl, K.rg("#4C8C4A",{hi:.3}), "#2F6A2E", .9) + G(K.clip(dl), [-70,-35,0,35,70].map(a=>{ const r=(a-90)*Math.PI/180; return P(`M28 40L${r1(28+20*Math.cos(r))} ${r1(40+20*Math.sin(r))}`,"none","#A8D08A",1,' opacity=".7"'); }).join(""));
    g += P("M56 30C57 22 60 16 64 12M58 24C64 22 68 24 70 20C72 16 68 13 66 16","none","#6B5A2A",2.2);
    const rows = [[32,[38,50,62,74]],[43,[32,44,56,68,80]],[54,[38,50,62,74]],[64,[44,56,68]],[74,[50,62]],[83,[56]]];
    rows.forEach(([y,xs],ri)=>xs.forEach((x,i)=>{ const k=((i+ri)%3-1)*.05; g += E(x,y,7,8.2,K.rg(shade("#6E3482",k),{fx:.36,fy:.3,hi:.38,lo:-.4}),"#3A1846",.8) + E(x,y,6,7,"#C9B8E0","none",0,0,' opacity=".12"') + E(x-2.4,y-3,1.6,1.1,"#fff","none",0,-30,' opacity=".55"'); }));
    return K.svg(g); },

  tapioca(){ const K=kit(), R=rand(21);
    /* tapioca: disco de goma de mandioca, granulado, dobrado ao meio sobre o recheio e servido no prato.
       A camada de baixo, aberta, mostra queijo derretido, frango desfiado e salsinha; a de cima forma a meia-lua
       arqueada, com a borda da frente caída no meio. */
    const seg = (a,b,c,d,n) => Array.from({length:n},(_,i)=>bez(a,b,c,d)(i/n));
    const poly = pts => "M"+pts.map(p=>r1(p[0])+" "+r1(p[1])).join("L")+"Z";
    const jit = (pts,a) => pts.map(([x,y])=>[x+(R()-.5)*a, y+(R()-.5)*a]);
    const beads = (pts,r) => pts.map(([x,y])=>`<circle cx="${r1(x+(R()-.5)*.8)}" cy="${r1(y+(R()-.5)*.8)}" r="${r1(r*(.5+R()*.6))}" fill="#FFFFFF"/>`).join("");
    let g = E(50,75,48,13.5,K.rg("#F7F5F0",{fx:.5,fy:.3,hi:.5,lo:-.06}),"#D6D1C6",1) + E(50,75,40,10,"none","#E6E2D8",1);
    /* camada de baixo */
    const lowFront = jit(seg([8,64],[8,80],[30,87],[52,87],22).concat(seg([52,87],[74,87],[95,80],[94,63],22)),.35);
    const low = lowFront.concat(seg([94,63],[80,60],[22,60],[8,64],12));
    g += P(poly(low), K.rg("#FFFFFF",{fx:.5,fy:.75,hi:.6,lo:-.12}), "#C9C2B2", .8) + beads(lowFront,.9);
    /* recheio */
    const fillPts = seg([13,64],[14,77],[32,82.5],[52,82.5],16).concat(seg([52,82.5],[72,82.5],[89,77],[89,63],16),seg([89,63],[76,60.5],[26,60.5],[13,64],10)), fd = poly(fillPts), fcl = K.clip(fd);
    let sh = ""; scatter(fillPts,46,5).forEach(([x,y,r])=>{ const a=(R()-.5)*1.4, l=3+R()*4.5; sh += P(`M${r1(x)} ${r1(y)}q${r1(l*.5*Math.cos(a+.5))} ${r1(l*.5*Math.sin(a+.5))} ${r1(l*Math.cos(a))} ${r1(l*Math.sin(a))}`,"none",r>.5?"#DDA066":"#BF7A42",1.3+r*1.3); });
    const topFront = jit(seg([88,63],[78,69],[62,72],[46,71.5],20).concat(seg([46,71.5],[30,71],[14,68],[6,64],16)),.3);
    g += P(fd, K.rg("#F4D97E",{fx:.5,fy:.45,hi:.3,lo:-.14})) + G(fcl, sh
      + scatter(fillPts,16,9).map(([x,y])=>P(smooth(blob(x,y,1.5,1.2,7,.35,Math.round(x*y))),"#3F8A3C","#2A6A2A",.3)).join("")
      + P(smooth(topFront.map(([x,y])=>[x,y+2.4]),false),"none","#6B4A26",3.4,' opacity=".25"'));
    /* camada de cima */
    const topBack = jit(seg([6,64],[9,52],[27,46],[46,46],26).concat(seg([46,46],[66,46],[86,52],[88,63],26)),.3);
    const top = topBack.concat(topFront), td = poly(top), tcl = K.clip(td);
    g += P(td, K.rg("#FFFFFF",{fx:.4,fy:.22,hi:.6,lo:-.14,r:.72}), "#C9C2B2", .8);
    g += G(tcl, scatter(top,200,7).map(([x,y,r])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.3+r*.5)}" fill="${r>.45?"#FFFFFF":"#DAD5C9"}"/>`).join("")
      + scatter(top,24,13).map(([x,y,r])=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.25+r*.35)}" fill="${r>.6?"#3F8A3C":"#A8854E"}" opacity=".85"/>`).join("")
      + P(smooth(topFront.map(([x,y])=>[x,y-2.4]),false),"none","#E2DDD2",3.2,' opacity=".75"'));
    g += beads(topBack,.85) + beads(topFront,.9);
    return K.svg(g); },

  castanha(){ const K=kit();
    const nut = (x,y,s,a,k) => G(` transform="translate(${x} ${y}) rotate(${a}) scale(${s})"`,
      P("M-17 1C-15 -6 -2 -10 10 -9C16 -8 18 -2 16 4C12 8 -6 7 -17 1Z", K.rg(shade("#8A5A3C",k),{fx:.4,fy:.3,hi:.3}), "#4A2E18", 1)
      + P("M-17 1C-6 -1 8 -1 17 0C16 4 12 8 4 8C-6 7 -12 5 -17 1Z", "#4A2E18", "none", 0, ' opacity=".35"')
      + P("M-12 -2C-4 -6 6 -7 12 -4M-12 5C-2 4 8 2 13 0","none","#4A2E18",.7,' opacity=".45"') + P("M-10 -3C-2 -7 6 -8 11 -6","none","#D9B48A",1,' opacity=".45"'));
    let g = ""; [[34,66,1,-18,0],[64,62,1,14,.06],[46,76,1.05,4,-.04],[72,78,.95,-8,.02],[28,80,.9,10,.04]].forEach(([x,y,s,a,k])=>{ g += nut(x,y,s,a,k); });
    return K.svg(g); }
};

window.Alimentos = { has: k => !!D[k], draw: k => D[k]() };
})();
