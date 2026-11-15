/* ===== «Ковчег»: интерактивная карта поверхности. Шесть поселений, здания по решениям, дороги по мере единства ===== */
Object.assign(U,{cm_stage0:['Начало миссии','Mission start'],cm_stage1:['Развитие','Development'],cm_stage2:['Единство','Unity'],cm_stage3:['Новая цивилизация','New civilisation'],
  cm_sd0:['Шесть изолированных поселений, мало инфраструктуры.','Six isolated settlements, little infrastructure.'],cm_sd1:['Появляются фермы, медицинские центры и жилые здания.','Farms, medical centres and housing appear.'],
  cm_sd2:['Поселения соединяются дорогами и общей инфраструктурой.','Settlements are linked by roads and shared infrastructure.'],cm_sd3:['Шесть сообществ формируют единый город.','Six communities form one city.'],
  cm_pop:['Население','Population'],cm_born:['рождены здесь','born here'],cm_mixed:['в смешанных семьях','in mixed families'],cm_bld:['Здания','Buildings'],cm_nobld:['Пока только посадочный модуль и жилые блоки. Решения во вкладке ниже строят новое.','Only the lander and housing blocks so far. Decisions below build more.'],
  cm_roads:['Дороги','Roads'],cm_road_n:['соединено с {0} поселениями','linked to {0} settlements'],cm_road_0:['изолировано','isolated'],cm_hint:['Клик по поселению: состояние. Колесо: масштаб, перетаскивание: сдвиг, двойной клик: сброс.','Click a settlement for its state. Wheel to zoom, drag to pan, double-click to reset.'],
  cm_health:['Здоровье','Health'],cm_morale:['Дух','Morale'],cm_city:['Общий город','Shared city'],cm_cityd:['Школа, совет и праздники общин собраны здесь.','School, council and shared festivals live here.'],cm_close:['Закрыть','Close']});
const CMAP={W:1280,H:640,v:{z:1,x:0,y:0},sel:null,hover:null,bg:null,bgKey:'',drag:null};
const CPOS=[[355,165],[645,110],[935,175],[970,455],[640,540],[315,440]],CCEN=[645,325];
const UPI={shelter:'☢',gym:'⚙',lifesup:'♻',farm:'🌱',automed:'✚',garden:'❀',private:'⌂',memorial:'✧',peers:'☯',school:'✎',crews:'⚒',council:'⚖',fest:'✦'};
const CMOFF=[[4,3],[-3,-4],[2,5],[-5,-2],[3,-3],[-1,4]];
function cmStage(){const nb=Object.keys(CG.upg||{}).length;return CG.unity>=60?3:CG.unity>=40?2:nb>=2?1:0}
function cmRoads(){const u=CG.unity,R=[];for(let i=0;i<6;i++)R.push({a:CPOS[i],b:CPOS[(i+1)%6],p:clamp((u-36-i*2.5)/7,0,1),i,j:(i+1)%6});
  for(let i=0;i<6;i++)R.push({a:CPOS[i],b:CCEN,p:clamp((u-54-i*1.6)/6,0,1),i,j:-1});return R}
function cmLinks(i){return cmRoads().filter(r=>r.p>=1&&(r.i===i||r.j===i)).length}
function cmLocal(i){const k=1-CG.unity/100,o=CMOFF[i];return{h:clamp(CG.health+o[0]*k*2,0,100),m:clamp(CG.morale+o[1]*k*2,0,100)}}
/* фон: рельеф мира, кратеры, сетка */
function cmBg(){const d=DEST[CG.dest],key=CG.dest;if(CMAP.bgKey===key)return CMAP.bg;CMAP.bgKey=key;
  const W=CMAP.W,H=CMAP.H,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),im=x.createImageData(W,H),q=im.data,r=rng(key.length*31+7),P=[...Array(512)].map(()=>r());
  const N=(a,b)=>{const i=Math.floor(a),j=Math.floor(b),fa=a-i,fb=b-j,h=(u,v)=>P[((u&31)*16+(v&15))&511],s=z=>z*z*(3-2*z);return h(i,j)*(1-s(fa))*(1-s(fb))+h(i+1,j)*s(fa)*(1-s(fb))+h(i,j+1)*(1-s(fa))*s(fb)+h(i+1,j+1)*s(fa)*s(fb)};
  const fb=(u,v)=>{let n=0,a=1,f=1;for(let o=0;o<5;o++){n+=a*N(u*f,v*f);a*=.5;f*=2}return n/1.94};
  const g=d.sky.gnd||[[120,124,132],[70,74,84]],A=g[0],B=g[1];
  const cr=[...Array(46)].map(()=>[r()*W,r()*H,6+r()*r()*60]);
  for(let y=0;y<H;y++)for(let X=0;X<W;X++){const u=X/170,v=y/170,h=fb(u,v),hx=fb(u+.012,v)-h,hy=fb(u,v+.012)-h;let sh=.6+(-hx-hy)*30;
    for(const k of cr){const dd=Math.hypot(X-k[0],y-k[1])/k[2];if(dd<1.15){if(dd<1)sh*=.78+.3*dd+(X-k[0]+y-k[1]>0?-.08:.12)*(1-dd);else sh*=1.12}}
    const t=clamp(h*1.3-.15,0,1),o=(y*W+X)*4;q[o]=(B[0]+(A[0]-B[0])*t)*sh*.62;q[o+1]=(B[1]+(A[1]-B[1])*t)*sh*.62;q[o+2]=(B[2]+(A[2]-B[2])*t)*sh*.62;q[o+3]=255}
  x.putImageData(im,0,0);
  x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=1;for(let i=0;i<=W;i+=25){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let i=0;i<=H;i+=25){x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke()}
  x.strokeStyle='rgba(255,255,255,.1)';for(let i=0;i<=W;i+=125){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let i=0;i<=H;i+=125){x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke()}
  const vg=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=vg;x.fillRect(0,0,W,H);
  CMAP.bg=c;return c}
/* преобразования вида */
function cmFit(cv){const w=cv.clientWidth,h=cv.clientHeight,s=Math.min(w/CMAP.W,h/CMAP.H)*CMAP.v.z;return{s,ox:(w-CMAP.W*s)/2+CMAP.v.x,oy:(h-CMAP.H*s)/2+CMAP.v.y,w,h}}
const cmTo=(F,p)=>[F.ox+p[0]*F.s,F.oy+p[1]*F.s];
function cmPick(cv,e){const r=cv.getBoundingClientRect(),F=cmFit(cv),mx=(e.clientX-r.left-F.ox)/F.s,my=(e.clientY-r.top-F.oy)/F.s;
  const i=CPOS.findIndex(p=>Math.hypot(p[0]-mx,p[1]-my)<46);if(i>=0)return i;if(CG.unity>=60&&Math.hypot(CCEN[0]-mx,CCEN[1]-my)<50)return'city';return null}
/* отрисовка кадра */
function cmDraw(c,ts){const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;const dpr=Math.min(devicePixelRatio||1,2);if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
  const x=c.getContext('2d'),F=cmFit(c),s=F.s,t=ts/1000;x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle='#050608';x.fillRect(0,0,w,h);
  x.save();x.translate(F.ox,F.oy);x.scale(s,s);x.drawImage(cmBg(),0,0);
  const tot=cgTot(),bn=Object.keys(CG.upg).filter(k=>UPG.find(u=>u.id===k).br!=='soc'),roads=cmRoads(),ue=clamp((CG.unity-60)/40,0,1);
  // территории
  GROUPS.forEach((g,i)=>{const p=CPOS[i],pop=CG.pop[i]+CG.born/6,R=34+pop*.55,col=g.c;x.beginPath();for(let k=0;k<=48;k++){const a=k/48*6.283,rr=R*(1+.12*Math.sin(a*3+i)+.07*Math.sin(a*7+i*2));x.lineTo(p[0]+Math.cos(a)*rr,p[1]+Math.sin(a)*rr)}
    x.fillStyle=`rgba(${col},.07)`;x.fill();x.strokeStyle=`rgba(${col},${CMAP.sel===i?.95:.55})`;x.lineWidth=(CMAP.sel===i?2.4:1.3)/Math.sqrt(s);x.stroke()});
  // дороги
  roads.forEach(r=>{if(r.p<=0)return;const ax=r.a[0],ay=r.a[1],bx=ax+(r.b[0]-ax)*r.p,by=ay+(r.b[1]-ay)*r.p;
    x.strokeStyle='rgba(255,214,150,.18)';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke();
    x.strokeStyle='rgba(255,226,170,.9)';x.lineWidth=2.2;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke();
    if(r.p<1){x.fillStyle='#FFE2AA';x.beginPath();x.arc(bx,by,3.5+Math.sin(t*6),0,7);x.fill()}
    else for(let k=0;k<2;k++){const q=((t*.12+k*.5+r.i*.17)%1),px=ax+(r.b[0]-ax)*q,py=ay+(r.b[1]-ay)*q;x.fillStyle='#fff';x.beginPath();x.arc(px,py,2.4,0,7);x.fill()}});
  // общий город в центре
  if(ue>0){const[cx,cy]=CCEN,R=20+ue*70;for(let k=3;k>=1;k--){x.strokeStyle=`rgba(183,228,166,${.18*k*ue})`;x.lineWidth=2;x.beginPath();x.arc(cx,cy,R*k/3,0,7);x.stroke()}
    for(let k=0;k<Math.round(ue*36);k++){const a=k*2.4,rr=12+Math.sqrt(k)*9;x.fillStyle='rgba(235,238,242,.9)';x.fillRect(cx+Math.cos(a)*rr-2.5,cy+Math.sin(a)*rr-2.5,5,5)}
    const gl=x.createRadialGradient(cx,cy,0,cx,cy,30);gl.addColorStop(0,'rgba(183,228,166,.9)');gl.addColorStop(1,'rgba(183,228,166,0)');x.fillStyle=gl;x.beginPath();x.arc(cx,cy,30,0,7);x.fill();
    x.fillStyle='#F4F5F2';x.beginPath();x.arc(cx,cy,9,0,7);x.fill();
    Object.keys(CG.upg).filter(k=>UPG.find(u=>u.id===k).br==='soc').forEach((k,j)=>cmBadge(x,cx+Math.cos(j*1.57+.8)*40,cy+Math.sin(j*1.57+.8)*40,UPI[k],'183,228,166',s))}
  // поселения: поля ферм, дома, здания решений, ядро
  GROUPS.forEach((g,i)=>{const[px,py]=CPOS[i],pop=CG.pop[i],r=rng(i*97+3),col=g.c;
    if(CG.upg.farm||CG.upg.garden){x.fillStyle='rgba(95,191,106,.55)';for(let k=0;k<(CG.upg.farm?6:3);k++){const a=-1.2+k*.42+i,rr=30;x.save();x.translate(px+Math.cos(a)*rr,py+Math.sin(a)*rr);x.rotate(a);for(let l=0;l<3;l++)x.fillRect(-6,-5+l*4,12,2.6);x.restore()}}
    const nh=Math.min(16,Math.round(pop/5));for(let k=0;k<nh;k++){const a=k*2.4+i,rr=13+Math.sqrt(k)*5.2;x.fillStyle='rgba(220,224,230,.92)';x.fillRect(px+Math.cos(a)*rr-2.2,py+Math.sin(a)*rr-2.2,4.4,4.4);
      if(Math.sin(t*1.3+k+i)>.4){x.fillStyle='rgba(255,210,140,.9)';x.fillRect(px+Math.cos(a)*rr-.8,py+Math.sin(a)*rr-.8,1.6,1.6)}}
    bn.forEach((k,j)=>{const a=j/Math.max(bn.length,1)*6.283+i*.7,rr=24;cmBadge(x,px+Math.cos(a)*rr,py+Math.sin(a)*rr,UPI[k],col,s)});
    const gl=x.createRadialGradient(px,py,0,px,py,22);gl.addColorStop(0,`rgba(${col},.55)`);gl.addColorStop(1,`rgba(${col},0)`);x.fillStyle=gl;x.beginPath();x.arc(px,py,22,0,7);x.fill();
    x.fillStyle='#F4F5F2';x.beginPath();x.arc(px,py,7.5,0,7);x.fill();x.strokeStyle=`rgb(${col})`;x.lineWidth=2.2;x.beginPath();x.arc(px,py,10.5,0,7);x.stroke();
    if(CMAP.sel===i||CMAP.hover===i){x.strokeStyle='rgba(255,255,255,.85)';x.setLineDash([4,4]);x.lineWidth=1.2;x.beginPath();x.arc(px,py,16+Math.sin(t*3)*1.5,0,7);x.stroke();x.setLineDash([])}
    x.font=`600 ${Math.max(9,12/Math.sqrt(s))}px Manrope,system-ui,sans-serif`;x.textAlign='center';x.fillStyle='rgba(244,245,242,.92)';x.fillText(tx(g.n),px,py-34);
    x.fillStyle='rgba(141,147,155,.95)';x.font=`${Math.max(8,10/Math.sqrt(s))}px Manrope,system-ui,sans-serif`;x.fillText(Math.round(pop),px,py+28)});
  if(CG.pulse>0){const p=CG.evAt!=null?CPOS[CG.evAt]:CCEN;x.strokeStyle=`rgba(255,107,90,${CG.pulse})`;x.lineWidth=2;x.beginPath();x.arc(p[0],p[1],90*(1-CG.pulse)+12,0,7);x.stroke()}
  x.restore()}
function cmBadge(x,X,Y,ic,col,s){x.fillStyle='rgba(10,11,14,.85)';x.strokeStyle=`rgba(${col},.85)`;x.lineWidth=1.2;x.beginPath();x.roundRect(X-7,Y-7,14,14,4);x.fill();x.stroke();
  x.fillStyle='#F4F5F2';x.font='9px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ic,X,Y+.5);x.textBaseline='alphabetic'}
/* панели: этапы и карточка поселения */
function rColMap(){if(!CG.on)return;const st=cmStage();
  $('#colStage').innerHTML=[0,1,2,3].map(k=>`<div class="cms ${k===st?'on':k<st?'past':''}"><b>${t('cm_stage'+k)}</b><span>${t('cm_sd'+k)}</span></div>`).join('');
  const el=$('#colInfo'),i=CMAP.sel;if(i==null){el.hidden=true;return}el.hidden=false;
  if(i==='city'){el.innerHTML=`<button class="cmX" aria-label="${t('cm_close')}">✕</button><span class="lbl">${t('cm_stage3')}</span><h3>${t('cm_city')}</h3><p class="sm mu">${t('cm_cityd')}</p>
    <div class="cmB">${Object.keys(CG.upg).filter(k=>UPG.find(u=>u.id===k).br==='soc').map(k=>`<span>${UPI[k]} ${esc(tx(UPG.find(u=>u.id===k).n))}</span>`).join('')}</div>`;return}
  const g=GROUPS[i],L=cmLocal(i),ln=cmLinks(i),bl=Object.keys(CG.upg).filter(k=>UPG.find(u=>u.id===k).br!=='soc');
  el.innerHTML=`<button class="cmX" aria-label="${t('cm_close')}">✕</button><span class="lbl" style="color:rgb(${g.c})">● ${t('cm_stage'+cmStage())}</span><h3>${esc(tx(g.n))}</h3>
    <div class="cmK"><div><b class="mono">${Math.round(CG.pop[i])}</b><span>${t('cm_pop')}</span></div><div><b class="mono">${Math.round(CG.born/6)}</b><span>${t('cm_born')}</span></div><div><b class="mono">${Math.round(CG.mixed/6)}</b><span>${t('cm_mixed')}</span></div></div>
    ${bar(t('cm_health'),L.h)}${bar(t('cm_morale'),L.m)}
    <div class="lbl" style="margin:.6rem 0 .3rem">${t('cm_bld')}</div>${bl.length?`<div class="cmB">${bl.map(k=>`<span>${UPI[k]} ${esc(tx(UPG.find(u=>u.id===k).n))}</span>`).join('')}</div>`:`<p class="sm mu" style="margin:0">${t('cm_nobld')}</p>`}
    <div class="lbl" style="margin:.6rem 0 .2rem">${t('cm_roads')}</div><p class="sm" style="margin:0">${ln?t('cm_road_n',ln):t('cm_road_0')}</p>`}
/* ввод: клик, наведение, масштаб, сдвиг */
(function(){const c=$('#colCv');if(!c)return;
  c.addEventListener('pointerdown',e=>{CMAP.drag={x:e.clientX,y:e.clientY,vx:CMAP.v.x,vy:CMAP.v.y,m:false};c.setPointerCapture(e.pointerId)});
  c.addEventListener('pointermove',e=>{const d=CMAP.drag;if(d){const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>5)d.m=true;if(d.m&&CMAP.v.z>1){CMAP.v.x=d.vx+dx;CMAP.v.y=d.vy+dy}return}
    const p=cmPick(c,e);CMAP.hover=p;c.style.cursor=p!=null?'pointer':CMAP.v.z>1?'grab':'default'});
  c.addEventListener('pointerup',e=>{const d=CMAP.drag;CMAP.drag=null;if(d&&!d.m){CMAP.sel=cmPick(c,e);rColMap()}});
  c.addEventListener('wheel',e=>{e.preventDefault();const z0=CMAP.v.z,z=clamp(z0*(e.deltaY>0?.88:1.14),1,4),r=c.getBoundingClientRect(),mx=e.clientX-r.left-r.width/2,my=e.clientY-r.top-r.height/2;
    CMAP.v.x=(CMAP.v.x-mx)*z/z0+mx;CMAP.v.y=(CMAP.v.y-my)*z/z0+my;if(z===1){CMAP.v.x=CMAP.v.y=0}CMAP.v.z=z},{passive:false});
  c.addEventListener('dblclick',()=>{CMAP.v={z:1,x:0,y:0}});
  $('#colInfo').addEventListener('click',e=>{if(e.target.closest('.cmX')){CMAP.sel=null;rColMap()}})})();
