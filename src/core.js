'use strict';
/* ===== ядро: состояние, отклонения, вид наружу, звук, графики ===== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const f=(v,d=0)=>{const s=Number(v).toFixed(d);return LANG==='ru'||LANG==='kk'||LANG==='fr'||LANG==='de'||LANG==='es'?s.replace('.',','):s};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2600)}

const KEY='ic_state_v3';
function seedHist(dest){
  const D=DEST[dest],r=rng(1470+dest.length*7),rn=x=>(r()*2-1)*x,a=[],ex=exTarget(D.g);
  for(let i=29;i>=0;i--){
    const sol=147-i;
    const v={pulse:Math.round(62+rn(4)),sys:Math.round(118+rn(5)),dia:Math.round(76+rn(4)),spo2:98-Math.round(r()),
      temp:+(36.6+rn(.2)).toFixed(1),glu:Math.round(95+rn(7)),sleep:+(7.5+rn(.55)).toFixed(1),water:+(2.2+rn(.25)).toFixed(1),
      ex:Math.round(ex*(1+rn(.1))/5)*5,rad:+(D.rad*(1+rn(.14))).toFixed(2)};
    const d={well:4,home:2,tired:2,sleepq:4,social:4};
    if(r()<.3)d.well=3; if(r()<.25)d.home=3; if(r()<.3)d.tired=3; if(r()<.2)d.social=3;
    let ev=null;
    if(sol===131){v.rad=+(D.rad*3.4).toFixed(2);ev='flare';d.well=3}
    if(sol===132)v.rad=+(D.rad*1.7).toFixed(2);
    if(sol===139){v.sleep=5.6;v.pulse+=6;d.tired=4;d.sleepq=2;ev='nosleep'}
    if(sol===140){v.sleep=5.9;v.pulse+=5;d.tired=4;d.sleepq=2;d.well=3}
    if(sol===143){d.home=4;ev='bday'}
    a.push({sol,v,d,ev});
  }
  return a;
}
function fresh(dest){dest=dest||'mars';
  return {dest,lang:LANG,hist:seedHist(dest),energy:20,log:[],rout:{},flags:{},done:{},queue:[],gBreath:1,gWater:1,
    mem:[{sol:141,moves:11,sec:38},{sol:144,moves:10,sec:34}],short:false,
    people:[{id:'p1',name:['Мама','Mum'],skin:'#e8bb9c',hair:'#6b4a3a'},{id:'p2',name:['Сестра Айя','Sister Aya'],skin:'#e2b193',hair:'#2f2327'}],
    caps:JSON.parse(JSON.stringify(SEEDCAPS)),dates:[{t:['День рождения сестры','Sister’s birthday'],sol:150},{t:['Годовщина свадьбы родителей','Parents’ wedding anniversary'],sol:158}],replies:[],
    plan:{sleep:7.5,ex:60,eva:6,shield:30,contact:3,sols:500}};
}
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.hist||!S.hist.length||!DEST[S.dest])S=fresh('mars');else LANG=S.lang||LANG;
function save(){S.lang=LANG;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const today=()=>S.hist[S.hist.length-1];
const solNow=()=>today().sol;
const D=()=>DEST[S.dest];
function logAct(s){S.log.push({sol:solNow(),t:s})}

/* медиа: IndexedDB, запасной вариант в памяти */
const MEDIA={};let DB=null;
function dbOpen(){return new Promise(res=>{try{const r=indexedDB.open('inner-climate',1);r.onupgradeneeded=()=>r.result.createObjectStore('m');r.onsuccess=()=>{DB=r.result;res()};r.onerror=()=>res()}catch(e){res()}})}
function mediaPut(k,blob){MEDIA[k]=URL.createObjectURL(blob);try{if(DB)DB.transaction('m','readwrite').objectStore('m').put(blob,k)}catch(e){}}
function mediaLoad(){return new Promise(res=>{if(!DB)return res();try{const rq=DB.transaction('m').objectStore('m').openCursor();rq.onsuccess=()=>{const c=rq.result;if(c){MEDIA[c.key]=URL.createObjectURL(c.value);c.continue()}else res()};rq.onerror=()=>res()}catch(e){res()}})}
function mediaClear(){for(const k in MEDIA)delete MEDIA[k];try{if(DB)DB.transaction('m','readwrite').objectStore('m').clear()}catch(e){}}

/* отклонение от личной нормы */
const base=k=>k==='rad'?D().rad:k==='ex'?exTarget(D().g):M[k].b;
function thr(k){const m=M[k],b=base(k);return m.rel?[b*m.w[0],b*m.w[1]]:m.w}
function dev(k,v){const m=M[k],b=base(k);let d=v-b;if(m.dir===-1&&d>0)d=0;if(m.dir===1&&d<0)d=0;const[w1,w2]=thr(k),a=Math.abs(d);return{d:v-b,lv:a>w2?2:a>w1?1:0,r:a/w2}}
function moodScore(d){return d?(d.well+(6-d.home)+(6-d.tired))/3:4}
function lvCard(c,h){h=h||today();
  if(c==='bp')return Math.max(dev('sys',h.v.sys).lv,dev('dia',h.v.dia).lv);
  if(c==='mood'){const i=S.hist.indexOf(h);if(moodScore(h.d)>=3.3)return 0;let n=0;for(let j=i;j>=0&&moodScore(S.hist[j].d)<2.7;j--)n++;return n>=5?2:1}
  return dev(c,h.v[c]).lv}
function sevCard(c,h){h=h||today();
  if(c==='bp')return clamp(Math.max(dev('sys',h.v.sys).r,dev('dia',h.v.dia).r),0,1);
  if(c==='mood')return clamp((3.8-moodScore(h.d))/2.2,0,1);
  return clamp(dev(c,h.v[c]).r,0,1)}
function streak(c,min){let n=0;for(let i=S.hist.length-1;i>=0&&lvCard(c,S.hist[i])>=min;i--)n++;return n}
function valTxt(c,h){h=h||today();return c==='bp'?h.v.sys+'/'+h.v.dia:c==='mood'?f(moodScore(h.d),1):f(h.v[c],M[c].d)}
function normTxt(c){return c==='bp'?base('sys')+'/'+base('dia'):c==='mood'?'≥ 3,3':f(base(c),M[c].d)}
const mName=c=>t(c==='mood'?'m_mood':M[c].k), mUnit=c=>c==='mood'?'/5':tx(M[c].u);
const lvTag=l=>`<span class="st st${l}"><i></i>${t('st'+l)}</span>`;
function trend(c,n){const k=c==='bp'?'sys':c,a=S.hist.slice(-n).map(h=>h.v[k]);if(a.length<2)return 0;const av=x=>x.reduce((s,v)=>s+v,0)/x.length;return av(a.slice(Math.floor(a.length/2)))-av(a.slice(0,Math.ceil(a.length/2)))}
function trendTxt(c,n){const tv=trend(c,n),k=c==='bp'?'sys':c,w=thr(k)[0]*.35;return t(Math.abs(tv)<w?'tr_flat':tv>0?'tr_up':'tr_down')}
const evName=e=>e?(EV[e]?tx(EV[e]):e.split(',').map(x=>EV[x]?tx(EV[x]):x).join(', ')):'';
const worst=()=>Math.max(...CARDS.map(c=>lvCard(c)),lvCard('mood'));

/* ===== вид наружу: погода состояния ===== */
const Wx={fog:0,wind:0,dust:0,aur:0,cloud:0},Tx={fog:0,wind:0,dust:0,aur:0,cloud:0};
function wxTargets(){Tx.fog=sevCard('sleep');Tx.wind=sevCard('pulse');Tx.dust=sevCard('ex');Tx.aur=sevCard('rad');Tx.cloud=sevCard('mood')}
function wxText(){
  const P=['sleep','rad','pulse','ex','mood'];
  const on=P.map(c=>({c,l:lvCard(c)})).filter(x=>x.l>0).sort((a,b)=>b.l-a.l);
  const others=CARDS.filter(c=>!P.includes(c)&&lvCard(c)>0);let head,sub;
  const line=c=>mName(c)+': '+valTxt(c)+' '+mUnit(c)+' ('+t('base_short')+' '+normTxt(c)+')';
  if(!on.length){head=t(others.length?'wx_clear_baro':'wx_clear');sub=others.length?others.map(line).join('. ')+'.':t('wx_all_ok')}
  else{const w=on.slice(0,2).map(x=>t('wxh_'+x.c+x.l));head=w.join(' '+t('and')+' ');head=head[0].toUpperCase()+head.slice(1);
    sub=on.slice(0,3).map(x=>x.c==='mood'?t('wx_mood_low'):t(WX[x.c])+' → '+line(x.c)).join('. ')+'.'}
  $('#wxHead').textContent=head;$('#wxSub').textContent=sub;$('#hudT').textContent='EXT VIEW / '+tx(D().n)}
const cv=$('#sky'),cx=cv.getContext('2d');
const PT=[...Array(120)].map((_,i)=>{const r=rng(i+9);return{x:r(),y:r(),s:.4+r(),k:r()}});
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k), rgb=(a,al=1)=>`rgba(${a[0]|0},${a[1]|0},${a[2]|0},${al})`;
let lastDraw=0;
function disc(c,x,y,r,col,shade){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill();if(shade){const g=c.createRadialGradient(x-r*.4,y-r*.4,r*.2,x,y,r*1.05);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}}
function drawSky(ts){
  requestAnimationFrame(drawSky);
  if(reduce&&ts-lastDraw<900)return;lastDraw=ts;
  const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  for(const k in Wx)Wx[k]+=(Tx[k]-Wx[k])*(reduce?1:.035);
  const c=cx,tt=ts/1000,K=D().sky;c.setTransform(dpr,0,0,dpr,0,0);
  const top=mix(K.top,[30,30,40],Wx.cloud*.5),hor=mix(K.hor,[110,104,112],Wx.cloud*.6);
  let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,rgb(top));g.addColorStop(1,rgb(hor));c.fillStyle=g;c.fillRect(0,0,w,h);
  if(K.star>0)for(let i=0;i<80;i++){const p=PT[i];c.fillStyle=`rgba(255,246,236,${K.star*(.35+.65*Math.abs(Math.sin(tt*.6+i)))*(1-p.y*.7)})`;c.fillRect(p.x*w,p.y*h*.7,1.4,1.4)}
  // спутники неба
  if(K.extra==='earth'){disc(c,w*.2,h*.26,Math.min(w,h)*.06,'#3f7fd0',1);c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.ellipse(w*.2-4,h*.26-3,Math.min(w,h)*.035,3,-.4,0,7);c.fill()}
  if(K.extra==='earthdot'){c.fillStyle='#9fd0ee';c.beginPath();c.arc(w*.16,h*.3,2.4,0,7);c.fill();c.fillStyle='rgba(159,208,238,.22)';c.beginPath();c.arc(w*.16,h*.3,7,0,7);c.fill()}
  if(K.extra==='jupiter'){const r=Math.min(w,h)*.2,x=w*.24,y=h*.3;disc(c,x,y,r,'#c9a47a');c.save();c.beginPath();c.arc(x,y,r,0,7);c.clip();['#b98658','#e0c39c','#a8734a','#d7b88e','#b98658'].forEach((col,i)=>{c.fillStyle=col;c.fillRect(x-r,y-r+r*.2+i*r*.36,r*2,r*.16)});c.fillStyle='#b0553c';c.beginPath();c.ellipse(x+r*.3,y+r*.3,r*.16,r*.09,0,0,7);c.fill();c.restore();disc(c,x,y,r,'rgba(0,0,0,0)',1)}
  if(K.extra==='sisters'){disc(c,w*.18,h*.22,Math.min(w,h)*.07,'#b77a6a',1);disc(c,w*.34,h*.14,Math.min(w,h)*.035,'#8fa3b8',1);disc(c,w*.48,h*.24,Math.min(w,h)*.022,'#c9b08a',1)}
  if(K.extra==='galaxy'){c.save();c.translate(w*.3,h*.26);c.rotate(-.5);for(let i=0;i<260;i++){const a=i*.21,rr=4+i*.42,p=PT[i%120];c.fillStyle=`rgba(${200+p.x*55|0},${200+p.y*40|0},255,${.5*(1-i/280)})`;c.fillRect(Math.cos(a)*rr*1.25+(p.k-.5)*8,Math.sin(a)*rr*.42+(p.s-.9)*5,1.6,1.6)}g=c.createRadialGradient(0,0,0,0,0,26);g.addColorStop(0,'rgba(255,244,220,.9)');g.addColorStop(1,'rgba(255,244,220,0)');c.fillStyle=g;c.fillRect(-26,-26,52,52);c.restore()}
  // сияние (радиация)
  if(Wx.aur>.04){const col=mix([110,230,180],[255,84,110],clamp(Wx.aur*1.2,0,1));
    for(let b=0;b<3;b++){let al=.1+.34*Wx.aur;if(Wx.aur>.55&&!reduce)al*=.65+.35*Math.sin(tt*8+b*2);
      c.beginPath();const y0=h*(.1+.09*b);
      for(let x=0;x<=w+12;x+=12){const y=y0+Math.sin(x*.011+tt*(.35+b*.2)+b*1.7)*h*.045*(1+Wx.aur);x?c.lineTo(x,y):c.moveTo(x,y)}
      c.lineTo(w,y0+h*.2);c.lineTo(0,y0+h*.2);c.closePath();
      g=c.createLinearGradient(0,y0-h*.05,0,y0+h*.2);g.addColorStop(0,rgb(col,al));g.addColorStop(1,rgb(col,0));c.fillStyle=g;c.fill()}}
  // светило
  const sx=w*.76,sy=h*.34,sr=Math.max(5,Math.min(w,h)*.055*K.sun[0]),dim=1-Wx.cloud*.55,gl=K.glow||K.sun[1];
  g=c.createRadialGradient(sx,sy,0,sx,sy,sr*5.5);g.addColorStop(0,rgb(gl,.55*dim));g.addColorStop(1,rgb(gl,0));c.fillStyle=g;c.fillRect(sx-sr*6,sy-sr*6,sr*12,sr*12);
  c.fillStyle=rgb(K.sun[1],.55+.45*dim);c.beginPath();c.arc(sx,sy,sr,0,7);c.fill();
  // облака (настроение)
  const nc=Math.round(Math.max(0,Wx.cloud-.15)*10);
  for(let i=0;i<nc;i++){const p=PT[80+i],x=sx+(p.x-.55)*w*.55+Math.sin(tt*.05+i)*18,y=sy+(p.y-.4)*h*.28,s=Math.max(sr,14)*(1.6+p.s);
    c.fillStyle=`rgba(70,72,86,${.3+.5*Wx.cloud})`;for(let j=-1;j<=1;j++){c.beginPath();c.ellipse(x+j*s*.7,y+Math.abs(j)*s*.12,s,s*.42,0,0,7);c.fill()}}
  // поверхность
  if(K.scene==='ground'){
    c.fillStyle=rgb(mix(K.gnd[0],[100,100,106],Wx.cloud*.4));c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=10)c.lineTo(x,h*.8-Math.sin(x*.006+1)*h*.05-Math.sin(x*.019)*h*.018);c.lineTo(w,h);c.fill();
    c.fillStyle=rgb(mix(K.gnd[1],[60,60,66],Wx.cloud*.4));c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=10)c.lineTo(x,h*.9-Math.sin(x*.009+4)*h*.03-Math.sin(x*.03)*h*.01);c.lineTo(w,h);c.fill();
    // купол базы
    const bx=w*.42,by=h*.905;c.fillStyle='rgba(233,239,247,.9)';c.beginPath();c.arc(bx,by,9,Math.PI,0);c.fill();c.fillRect(bx+12,by-5,16,5);c.fillStyle='#ffd27a';c.fillRect(bx-3,by-4,3,2);
    if(K.haze){g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,rgb(K.hor,0));g.addColorStop(1,rgb(K.hor,K.haze));c.fillStyle=g;c.fillRect(0,0,w,h)}
  }else if(K.scene==='limb'){
    const R=Math.max(w,h)*1.5,ey=h*.86+R;g=c.createRadialGradient(w*.5,ey,R*.96,w*.5,ey,R*1.03);
    g.addColorStop(0,'#2f6f9e');g.addColorStop(.6,'#7fc0e6');g.addColorStop(1,'rgba(127,192,230,0)');c.fillStyle=g;c.beginPath();c.arc(w*.5,ey,R*1.03,0,7);c.fill();
    c.fillStyle='#1d4f7a';c.beginPath();c.arc(w*.5,ey,R*.975,0,7);c.fill();
    c.fillStyle='rgba(255,255,255,.22)';for(let i=0;i<7;i++){const p=PT[90+i];c.beginPath();c.ellipse(((p.x+tt*.004)%1)*w,h*(.9+p.y*.1),60*p.s,7,0,0,7);c.fill()}
  }
  // ветер (пульс)
  const nw=Math.round(Wx.wind*38);c.lineWidth=1;c.strokeStyle='rgba(255,240,224,.22)';
  for(let i=0;i<nw;i++){const p=PT[i],x=((p.x+tt*(.05+Wx.wind*.45)*p.s)%1)*(w+140)-70,y=p.y*h*.78,L=24+70*Wx.wind*p.s;c.beginPath();c.moveTo(x,y);c.lineTo(x+L,y-3);c.stroke()}
  // позёмка (тренировка)
  const nd=Math.round(Wx.dust*70),dc=K.gnd?mix(K.gnd[0],[255,255,255],.35):[200,200,210];
  for(let i=0;i<nd;i++){const p=PT[119-i],x=((p.x+tt*(.03+Wx.dust*.22)*p.s)%1)*(w+40)-20,y=h*(K.scene==='ground'?.8+p.k*.19:.55+p.k*.44)+Math.sin(tt*2+i)*4;
    c.fillStyle=rgb(dc,.25+.45*Wx.dust);c.beginPath();c.ellipse(x,y,7*p.s+10*Wx.dust,1.6,0,0,7);c.fill()}
  // туман (сон)
  if(Wx.fog>.03){g=c.createLinearGradient(0,h,0,h*(1-.95*Wx.fog));g.addColorStop(0,`rgba(214,220,228,${.86*Wx.fog})`);g.addColorStop(1,'rgba(214,220,228,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
    for(let i=0;i<5;i++){const p=PT[40+i];c.fillStyle=`rgba(226,232,240,${.16*Wx.fog})`;c.beginPath();c.ellipse(((p.x+tt*.008*p.s)%1)*(w+300)-150,h*(1-p.y*.6*Wx.fog),190,34,0,0,7);c.fill()}}
  g=c.createLinearGradient(0,h*.5,0,h);g.addColorStop(0,'rgba(5,7,12,0)');g.addColorStop(1,'rgba(5,7,12,.62)');c.fillStyle=g;c.fillRect(0,0,w,h);
  // сетка прицела
  c.strokeStyle='rgba(233,239,247,.12)';c.lineWidth=1;c.beginPath();for(let i=1;i<4;i++){c.moveTo(w*i/4,0);c.lineTo(w*i/4,6);c.moveTo(w*i/4,h);c.lineTo(w*i/4,h-6)}c.stroke();
}

/* ===== звук ===== */
let AC=null,master=null,analyser=null,sndOn=false,pad=null;
function acGet(){if(!AC){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;AC=new A();master=AC.createGain();master.gain.value=.55;analyser=AC.createAnalyser();analyser.fftSize=512;master.connect(analyser);analyser.connect(AC.destination)}
  if(AC.state==='suspended')AC.resume();return AC}
function thump(tm,fq,gn){const o=AC.createOscillator(),a=AC.createGain();o.type='sine';o.frequency.setValueAtTime(fq,tm);o.frequency.exponentialRampToValueAtTime(fq*.5,tm+.14);
  a.gain.setValueAtTime(.0001,tm);a.gain.exponentialRampToValueAtTime(gn,tm+.012);a.gain.exponentialRampToValueAtTime(.0001,tm+.2);o.connect(a);a.connect(master);o.start(tm);o.stop(tm+.22)}
function beatLoop(){if(!sndOn)return;const tm=AC.currentTime+.02;thump(tm,78,.6);thump(tm+.17,60,.35);beatLoop.h=setTimeout(beatLoop,60000/clamp(today().v.pulse,35,200))}
let noiseBuf=null;
function click(){if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.03,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}
  const s=AC.createBufferSource(),hp=AC.createBiquadFilter(),a=AC.createGain();s.buffer=noiseBuf;hp.type='highpass';hp.frequency.value=1800;a.gain.value=.5;s.connect(hp);hp.connect(a);a.connect(master);s.start()}
function geigerLoop(){if(!sndOn)return;const sv=sevCard('rad'),lv=lvCard('rad');let wait=700;if(lv>0){click();const rate=1.5+sv*22;wait=-Math.log(1-Math.random()*.98)/rate*1000}geigerLoop.h=setTimeout(geigerLoop,clamp(wait,25,2500))}
function padStart(){const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;const g=AC.createGain();g.gain.value=0;g.gain.setTargetAtTime(.09,AC.currentTime,1.2);lp.connect(g);g.connect(master);
  const os=[1,1.26,1.5,.5].map(m=>{const o=AC.createOscillator();o.type='triangle';o.frequency.value=196*m;o.connect(lp);o.start();return o});pad={os,g};padUpdate()}
function padUpdate(){if(!pad)return;const major=moodScore(today().d)>=3.3;pad.os[1].frequency.setTargetAtTime(196*(major?1.26:1.189),AC.currentTime,.6)}
function soundSet(on){if(on&&!acGet()){toast(t('no_audio'));return}
  sndOn=on;const b=$('#sndBtn');b.textContent=t(on?'snd_off':'snd_on');b.setAttribute('aria-pressed',on);
  clearTimeout(beatLoop.h);clearTimeout(geigerLoop.h);
  if(on){if(!pad)padStart();else pad.g.gain.setTargetAtTime(.09,AC.currentTime,.5);beatLoop();geigerLoop()}
  else if(pad)pad.g.gain.setTargetAtTime(0,AC.currentTime,.2)}

/* ===== графики ===== */
function drawChart(cvs,o){
  const dpr=Math.min(devicePixelRatio||1,2),W=cvs.clientWidth,H=cvs.clientHeight;if(!W)return;cvs.width=W*dpr;cvs.height=H*dpr;
  const c=cvs.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  const pl=44,pr=12,pt=34,pb=24,n=o.xs.length;let lo=o.min,hi=o.max;
  if(lo==null){const all=o.series.flatMap(s=>s.vals).concat(o.band||[],o.lines||[]).filter(v=>v!=null&&isFinite(v));lo=Math.min(...all);hi=Math.max(...all);const p=(hi-lo)*.12||1;lo-=p;hi+=p}
  const X=i=>pl+(W-pl-pr)*(n>1?i/(n-1):.5),Y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
  if(o.band){c.fillStyle='rgba(58,214,166,.12)';const y1=Y(Math.min(o.band[1],hi)),y2=Y(Math.max(o.band[0],lo));c.fillRect(pl,y1,W-pl-pr,y2-y1)}
  (o.lines||[]).forEach(v=>{if(v>lo&&v<hi){c.strokeStyle='rgba(255,95,76,.7)';c.setLineDash([5,5]);c.beginPath();c.moveTo(pl,Y(v));c.lineTo(W-pr,Y(v));c.stroke();c.setLineDash([])}});
  c.font='11px Menlo,Consolas,monospace';c.fillStyle='#8b9cb3';c.textAlign='right';
  for(let i=0;i<=3;i++){const v=lo+(hi-lo)*i/3;c.fillText(f(v,o.dec||0),pl-6,Y(v)+4);c.strokeStyle='rgba(255,255,255,.07)';c.beginPath();c.moveTo(pl,Y(v));c.lineTo(W-pr,Y(v));c.stroke()}
  c.textAlign='center';const stepX=Math.max(1,Math.ceil(n/7));for(let i=n-1;i>=0;i-=stepX)c.fillText(o.xs[i],X(i),H-7);
  c.font='11px Helvetica,Arial,sans-serif';
  (o.events||[]).forEach((e,j)=>{c.strokeStyle='rgba(105,168,255,.8)';c.setLineDash([3,4]);c.beginPath();c.moveTo(X(e.i),pt-4);c.lineTo(X(e.i),H-pb);c.stroke();c.setLineDash([]);
    c.fillStyle='#69a8ff';c.textAlign=e.i>n*.7?'right':e.i<n*.2?'left':'center';c.fillText(e.t,X(e.i),pt-8-(j%2)*12)});
  o.series.forEach(s=>{c.strokeStyle=s.color;c.lineWidth=2;c.beginPath();let st=false;s.vals.forEach((v,i)=>{if(v==null)return;st?c.lineTo(X(i),Y(v)):c.moveTo(X(i),Y(v));st=true});c.stroke();
    if(s.dots!==false)s.vals.forEach((v,i)=>{if(v==null)return;const l=s.lv?s.lv[i]:-1;c.fillStyle=l===2?'#ff5f4c':l===1?'#ffb224':s.color;c.beginPath();c.arc(X(i),Y(v),l>0?4.5:2.6,0,7);c.fill()})});
  c.lineWidth=1;
}
function spark(vals,lv){const w=64,h=18,lo=Math.min(...vals),hi=Math.max(...vals),r=hi-lo||1;const pts=vals.map((v,i)=>(i/(vals.length-1)*w).toFixed(1)+','+(h-2-(v-lo)/r*(h-4)).toFixed(1)).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${['#3ad6a6','#ffb224','#ff5f4c'][lv]}" stroke-width="1.5"/></svg>`}
