/* Gráficos em SVG puro e ícones das culturas */
(function(){
const C = {ink:"#1B2A22",muted:"#5E6B63",line:"#E2E7DF",leaf:"#2E6A4C",pollen:"#F2B705",mango:"#D9622B",sky:"#4E7FA8",prod:"#9DB3A4"};

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

/* Ícones ilustrados das culturas: volume por degradê (luz no alto à esquerda), textura e corte do fruto.
   Ids com prefixo único por cópia, para várias figuras na mesma página. */
let CI = 0;
function cropIcon(crop){
  const k = "ci"+(++CI)+"_", u = n => `url(#${k}${n})`;
  const rg = (n, stops, fx=.36, fy=.3, r=.78) => `<radialGradient id="${k}${n}" cx=".5" cy=".5" fx="${fx}" fy="${fy}" r="${r}">${stops.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join("")}</radialGradient>`;
  const sh = '<ellipse cx="50" cy="90" rx="32" ry="4.5" fill="#2E2418" opacity=".14"/>';
  const wrap = (defs, body) => `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>${defs}</defs>${sh}${body}</svg>`;
  if(crop==="Melon") return wrap(
    rg("r",[[0,"#FFF1A8"],[.45,"#F2CC3D"],[1,"#C9961C"]]) + rg("f",[[0,"#F7FBE4"],[.6,"#E4EFC2"],[1,"#C9DB95"]],.5,.4,.7),
    `<path d="M12 50C12 28 30 18 48 19C68 20 82 32 80 52C78 72 62 82 44 81C26 80 12 70 12 50Z" fill="${u("r")}" stroke="#A97A12" stroke-width="1.6"/>
     <path d="M18 40C30 34 52 33 76 40M15 52C30 46 56 46 79 52M19 64C33 59 55 59 75 64" fill="none" stroke="#D9AE2C" stroke-width="1.6" opacity=".8"/>
     <path d="M24 30c4-4 10-6 16-6" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" fill="none"/>
     <path d="M47 19c-1-6 2-10 6-11" stroke="#5B7A2E" stroke-width="3" fill="none" stroke-linecap="round"/>
     <path d="M52 88L95 76C91 58 74 51 58 59C52 63 49 74 52 88Z" fill="#E9C13A" stroke="#A97A12" stroke-width="1.4"/>
     <path d="M56 84L90 75C86 62 73 57 61 63C56 66 54 75 56 84Z" fill="${u("f")}"/>
     <path d="M63 76C66 70 73 66 81 67C78 72 70 75 63 76Z" fill="#E9DFAF" stroke="#C9B77A" stroke-width=".8"/>
     ${[[67,72],[71,70],[75,69],[69,74]].map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="1.6" ry=".9" fill="#FFF8DC" stroke="#B9A56A" stroke-width=".4"/>`).join("")}`);
  if(crop==="Watermelon") return wrap(
    rg("r",[[0,"#6FB56A"],[.5,"#2F7D45"],[1,"#1C4E2B"]]) + `<clipPath id="${k}c"><ellipse cx="44" cy="50" rx="35" ry="28"/></clipPath>` + rg("f",[[0,"#FF8A8F"],[.6,"#E9505B"],[1,"#C2343F"]],.45,.35,.75),
    `<ellipse cx="44" cy="50" rx="35" ry="28" fill="${u("r")}"/>
     <g clip-path="url(#${k}c)">${[[-22,0],[-10,0],[2,0],[14,0]].map(([dx])=>`<path d="M${44+dx} 20C${40+dx} 34 ${48+dx} 42 ${42+dx} 50C${37+dx} 58 ${46+dx} 66 ${43+dx} 80" fill="none" stroke="#1A4A2A" stroke-width="3.6" opacity=".8"/>`).join("")}</g>
     <ellipse cx="44" cy="50" rx="35" ry="28" fill="none" stroke="#163F23" stroke-width="1.4"/>
     <path d="M22 36c6-6 14-9 22-9" stroke="#fff" stroke-opacity=".3" stroke-width="4" stroke-linecap="round" fill="none"/>
     <path d="M46 88L96 70C92 50 68 44 52 58C47 63 45 75 46 88Z" fill="#2F7D45" stroke="#163F23" stroke-width="1.2"/>
     <path d="M50 85L93 69C89 53 69 49 56 60C51 65 49 75 50 85Z" fill="#F2E8BE"/>
     <path d="M53 82L90 68C86 56 70 52 59 62C55 66 53 74 53 82Z" fill="${u("f")}"/>
     ${[[66,70,-30],[74,66,-20],[70,75,-30],[80,63,-10],[62,77,-40],[77,71,-25]].map(([x,y,a])=>`<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.8" fill="#22382B" transform="rotate(${a} ${x} ${y})"/>`).join("")}`);
  if(crop==="Mango") return wrap(
    rg("r",[[0,"#FFD66B"],[.35,"#F29A2E"],[.75,"#D9542B"],[1,"#8E2A1E"]],.32,.32,.85) + rg("g",[[0,"#B9D86A"],[1,"#4E8A2E"]],.4,.4,.8),
    `<path d="M50 23C76 18 89 41 79 64C70 85 45 91 30 74C17 59 25 36 40 27C43 25 47 24 50 23Z" fill="${u("r")}" stroke="#7A2A16" stroke-width="1.4"/>
     <path d="M60 30C74 31 82 44 81 56C76 45 68 38 58 36Z" fill="${u("g")}" opacity=".55"/>
     <path d="M34 46C40 35 52 31 62 34C52 37 44 44 40 55C37 62 36 69 37 74C28 66 28 55 34 46Z" fill="#FFE08A" opacity=".55"/>
     ${[[40,60],[48,68],[56,58],[62,70],[44,50],[66,52]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r=".9" fill="#FFF3C4" opacity=".7"/>`).join("")}
     <path d="M50 24c0-5 1-8 3-10" fill="none" stroke="#6B4A24" stroke-width="3" stroke-linecap="round"/>
     <path d="M53 15C63 5 81 7 87 18C75 22 62 21 53 15Z" fill="${u("g")}" stroke="#2C6A30" stroke-width="1"/><path d="M55 15c9-2 19 0 28 3M64 14l-3 3M72 14l-2 4" fill="none" stroke="#2C6A30" stroke-width="1"/>`);
  if(crop==="Papaya") return wrap(
    rg("r",[[0,"#D8E68A"],[.5,"#9BBF3E"],[1,"#5E8A22"]]) + rg("f",[[0,"#FFC27A"],[.55,"#F5873A"],[1,"#D9621E"]],.45,.4,.8) + rg("c",[[0,"#FFE3A3"],[1,"#F6A85A"]],.5,.5,.7),
    `<path d="M50 9C71 9 81 32 80 54C79 77 66 91 50 91C34 91 21 77 20 54C19 32 29 9 50 9Z" fill="${u("r")}" stroke="#4E7A1A" stroke-width="1.4"/>
     <path d="M50 14C67 14 75 33 74 54C73 73 63 86 50 86C37 86 27 73 26 54C25 33 33 14 50 14Z" fill="${u("f")}"/>
     <path d="M50 30C58 30 62 42 62 55C62 67 57 76 50 76C43 76 38 67 38 55C38 42 42 30 50 30Z" fill="${u("c")}"/>
     ${[[46,42],[53,44],[47,50],[54,52],[45,58],[52,60],[48,66],[55,66],[50,37],[44,64],[56,58]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#2A2420" stroke="#120f0c" stroke-width=".5"/><circle cx="${p[0]-.8}" cy="${p[1]-.8}" r=".7" fill="#fff" opacity=".5"/>`).join("")}
     <path d="M33 30c2-6 6-10 11-12" stroke="#FFE3B8" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/>`);
  return wrap(rg("g",[[0,"#EAF4EC"],[1,"#BFD8C6"]]), `<path d="M50 8 86 29v42L50 92 14 71V29Z" fill="${u("g")}"/><path d="M50 74V40M50 50C39 46 34 37 35 29C45 30 51 36 52 45M50 52C61 48 67 39 66 31C57 32 51 38 49 46" fill="none" stroke="#2E6A4C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`);
}

/* Faixa ilustrada do topo: ramas de melão em flor e uma abelha visitando as flores */
function heroField(){
  const flower=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><g fill="#FFF6CF" stroke="#E2A400" stroke-width="1">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-11" rx="7.5" ry="11" transform="rotate(${a})"/>`).join("")}</g><circle r="5.5" fill="#E07B1A"/><circle r="2.4" fill="#B5560C"/></g>`;
  const leaf=(x,y,s,r)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C-10-2-24-8-27-20C-21-18-18-24-22-32C-14-30-10-35-11-43C-5-39-1-41 0-47C1-41 5-39 11-43C10-35 14-30 22-32C18-24 21-18 27-20C24-8 10-2 0 0Z" fill="#2E6A4C"/><path d="M0 0V-40M0-12L-17-24M0-12L17-24M0-22L-9-34M0-22L9-34" fill="none" stroke="#5E9A70" stroke-width="1.5" stroke-linecap="round"/></g>`;
  const fruit=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="26" ry="20" fill="#E7C23A" stroke="#CFA524" stroke-width="2"/><path d="M-22-4c8-6 36-8 44 0M-22 6c10-4 36-5 44 2" fill="none" stroke="#CFA524" stroke-width="2"/><ellipse cx="-9" cy="-9" rx="8" ry="3.5" fill="#FFF6CF" opacity=".55"/></g>`;
  const vine = `<path d="M-20 104C120 88 210 112 330 96S560 80 700 98S960 112 1100 92S1300 96 1460 100" fill="none" stroke="#2E6A4C" stroke-width="5" stroke-linecap="round"/>
    <path d="M200 103c8-14 22-18 36-12M640 95c-10-16-28-18-40-8M1010 101c10-14 26-16 38-8" fill="none" stroke="#2E6A4C" stroke-width="2.5" stroke-linecap="round"/>`;
  const leaves = [[60,100,.9,-8],[150,96,.75,14],[290,100,1,-4],[420,92,.8,10],[540,94,.95,-12],[760,98,.85,6],[880,104,1,-6],[1040,96,.8,12],[1180,94,.95,-10],[1330,98,.85,8]].map(l=>leaf(...l)).join("");
  const flowers = [[110,70,.9],[360,64,1.05],[600,72,.85],[830,60,1],[1100,68,.95],[1390,66,.85]].map(f=>flower(...f)).join("");
  const fruits = fruit(236,92,.85)+fruit(966,96,.75);
  const bee = `<g transform="translate(980 34) rotate(-12)">
      <ellipse cx="-4" cy="-13" rx="11" ry="7" fill="#FFFFFF" opacity=".8" transform="rotate(-25 -4 -13)"/>
      <ellipse cx="6" cy="-14" rx="10" ry="6" fill="#FFFFFF" opacity=".65" transform="rotate(20 6 -14)"/>
      <ellipse cx="0" cy="0" rx="17" ry="11" fill="#1B2A22"/>
      <path d="M-8-10.2v20.4M0-11v22M8-10v20" stroke="#F2B705" stroke-width="4.2"/>
      <circle cx="18" cy="-1" r="7.5" fill="#1B2A22"/><circle cx="21" cy="-3" r="1.6" fill="#FFF6CF"/>
      <path d="M22-7c3-6 6-8 9-8M19-8c1-6 3-9 6-10" fill="none" stroke="#1B2A22" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-17 0l-5 1" stroke="#1B2A22" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const path = `<path d="M600 66C660 10 760 0 830 50S930 70 962 40" fill="none" stroke="#1B2A22" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" opacity=".55"/>`;
  const vb = window.innerWidth<640 ? "560 0 460 120" : "0 0 1440 120";
  return `<svg class="hero-field" viewBox="${vb}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${vine}${leaves}${fruits}${flowers}${path}${bee}</svg>`;
}

/* Rosca: parte dependente da polinização vs outros fatores */
function donut(share, centerLabel, centerSub){
  const r=90, cx=110, cy=110, sw=20, circ=2*Math.PI*r;
  const v=Math.max(0,Math.min(1,share||0));
  return `<svg viewBox="0 0 220 220" role="img" aria-label="${esc(centerLabel)} ${esc(centerSub)}" style="max-width:240px;margin:0 auto">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.pollen}" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.leaf}" stroke-width="${sw}"
      stroke-dasharray="${(v*circ).toFixed(2)} ${circ.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="32" font-weight="800" fill="${C.ink}">${esc(centerLabel)}</text>
    <text x="${cx}" y="${cy+26}" text-anchor="middle" font-size="11" fill="${C.muted}">${esc(centerSub)}</text>
  </svg>`;
}

/* Barras horizontais simples: [{label, value, color}] */
function hbars(items, fmt){
  const W=window.innerWidth<640?380:560, rowH=92, top=20, labW=0, H=top+items.length*rowH+24;
  const max=Math.max(1,...items.map(d=>d.value||0))*1.18;
  const x=v=>labW+(W-labW-10)*(v/max);
  let g="";
  items.forEach((d,i)=>{
    const y=top+i*rowH;
    g+=`<text x="0" y="${y+12}" font-size="14" fill="${C.muted}">${esc(d.label)}</text>
        <rect x="0" y="${y+22}" width="${Math.max(2,x(d.value)).toFixed(1)}" height="40" rx="3" fill="${d.color}"/>
        <text x="${(x(d.value)+8).toFixed(1)}" y="${y+48}" font-size="16" font-weight="800" fill="${C.ink}">${esc(fmt(d.value))}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(items.map(d=>d.label+': '+fmt(d.value)).join('; '))}">${g}</svg>`;
}

/* Barras agrupadas: groups=[{label, values:[a,b]}], series=[{name,color}] */
function grouped(groups, series, fmt, unit){
  const narrow=window.innerWidth<640; const W=narrow?400:980, H=narrow?300:340, pl=narrow?40:56, pr=6, pt=22, pb=44;
  const all=groups.flatMap(g=>g.values); const maxV=Math.max(1,...all)*1.15;
  const ticks=niceTicks(maxV);
  const top=ticks[ticks.length-1];
  const y=v=>pt+(H-pt-pb)*(1-v/top);
  const gw=(W-pl-pr)/groups.length, bw=Math.min(54,gw*0.32);
  let s="";
  ticks.forEach(t=>{s+=`<line x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}" stroke="${C.line}"/><text x="${pl-8}" y="${y(t)+4}" text-anchor="end" font-size="11" fill="${C.muted}">${t}</text>`;});
  s+=`<text x="12" y="${pt+(H-pt-pb)/2}" font-size="11" fill="${C.muted}" transform="rotate(-90 12 ${pt+(H-pt-pb)/2})" text-anchor="middle">${esc(unit)}</text>`;
  groups.forEach((g,i)=>{
    const cx=pl+gw*i+gw/2;
    g.values.forEach((v,j)=>{
      const bx=cx+(j-g.values.length/2)*(bw+6)+3;
      s+=`<rect x="${bx}" y="${y(v)}" width="${bw}" height="${(H-pb)-y(v)}" rx="2" fill="${series[j].color}"/>
          <text x="${bx+bw/2}" y="${y(v)-6}" text-anchor="middle" font-size="12" font-weight="800" fill="${C.ink}">${esc(fmt(v))}</text>`;
    });
    s+=`<text x="${cx}" y="${H-14}" text-anchor="middle" font-size="14" font-weight="700" fill="${C.ink}">${esc(g.label)}</text>`;
  });
  return `<svg class="grouped" viewBox="0 0 ${W} ${H}" role="img">${s}</svg>`;
}
function niceTicks(max){
  const raw=max/4, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p;
  const step=(m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p;
  const out=[]; for(let v=0; v<=max+step*0.999; v+=step) out.push(+v.toFixed(6));
  return out;
}

window.Charts={C,esc,cropIcon,donut,hbars,grouped,heroField};
})();
