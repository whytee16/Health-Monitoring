/* ===== «Орбита»: центр здоровья экипажа. Персонал, чекапы и допуск, психика, питание, тренировки, 3D-тело, рейтинг ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const fx=(v,d=0)=>Number(v).toFixed(d).replace('.',',');
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2600)}
const COL=['#3ad6a6','#ffb224','#ff5f4c'],ST=['Норма','Внимание','Опасно'];
const tag=(l,s)=>`<span class="st st${l}"><i></i>${s||ST[l]}</span>`;

/* ---------- даты (с демо-сдвигом) ---------- */
const DAY=864e5,iso=d=>new Date(d).toISOString().slice(0,10),dt=s=>new Date(s+'T00:00:00Z').getTime();
const REAL=dt(new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10));
const today=()=>iso(REAL+(C.off||0)*DAY),addD=(s,n)=>iso(dt(s)+n*DAY),wd=s=>((new Date(dt(s)).getUTCDay()+6)%7)+1;
const dd=(a,b)=>Math.round((dt(b)-dt(a))/DAY);
const WD=['','пн','вт','ср','чт','пт','сб','вс'],MON=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const hd=s=>{const d=new Date(dt(s));return d.getUTCDate()+' '+MON[d.getUTCMonth()]};

/* ---------- обязательные чекапы ---------- */
const CHK=[
  {id:'cbc',ic:'🩸',n:'Общий анализ крови',when:'каждую пятницу, натощак',wd:[5],src:'cbc',pts:15},
  {id:'vit',ic:'❤',n:'Показатели с приборов',when:'каждое утро: давление, пульс, SpO₂, вес',daily:1,src:'vit',pts:2},
  {id:'well',ic:'✎',n:'Самочувствие, психика и карта боли',when:'понедельник и четверг',wd:[1,4],src:'well',pts:10},
  {id:'psy',ic:'☯',n:'Беседа с психологом',when:'каждую среду, 30 минут',wd:[3],src:'psy',pts:10},
  {id:'bio',ic:'⚗',n:'Биохимия и коагулограмма',when:'раз в 2 недели: D-димер, кальций, витамин D, ферритин',every:14,src:'bio',pts:15},
  {id:'dexa',ic:'🦴',n:'Денситометрия костей',when:'раз в месяц',every:30,src:'dexa',pts:20}
];
const prevDue=(c,s)=>{for(let i=0;i<8;i++){const x=addD(s,-i);if(c.wd.includes(wd(x)))return x}return s};
function chk(p,c){const T=today(),recs=p[c.src].map(r=>r.date).filter(d=>d<=T).sort(),last=recs[recs.length-1]||null,has=(a,b)=>recs.some(d=>d>=a&&d<b);
  if(c.daily){if(last===T)return{s:0,last,next:addD(T,1)};if(last===addD(T,-1))return{s:1,last,next:T,txt:'сдать сегодня'};return{s:2,last,next:T,due:addD(T,-1),txt:'просрочено'}}
  if(c.every){const nx=last?addD(last,c.every):T;if(nx>T)return{s:0,last,next:nx};if(nx===T)return{s:1,last,next:T,txt:'сдать сегодня'};return{s:2,last,next:nx,due:nx,txt:'просрочено на '+dd(nx,T)+' дн.'}}
  const d1=prevDue(c,T),d0=prevDue(c,addD(d1,-1)),nxt=prevDue(c,addD(d1,8))>T?prevDue(c,addD(d1,8)):null;let n=addD(T,1);while(!c.wd.includes(wd(n)))n=addD(n,1);
  if(has(d1,addD(T,1)))return{s:0,last,next:n};
  if(d1===T){if(!has(d0,d1))return{s:2,last,next:T,due:d0,txt:'пропущено '+hd(d0)};return{s:1,last,next:T,txt:'сдать сегодня'}}
  return{s:2,last,next:d1,due:d1,txt:'пропущено '+hd(d1)}}

/* ---------- модели (иллюстративные) ---------- */
const REF={hb:{n:'Гемоглобин',u:'г/л',M:[130,170],F:[120,150]},rbc:{n:'Эритроциты',u:'×10¹²/л',M:[4.3,5.7],F:[3.8,5.1],d:1},wbc:{n:'Лейкоциты',u:'×10⁹/л',M:[4,9],F:[4,9],d:1},
  plt:{n:'Тромбоциты',u:'×10⁹/л',M:[150,400],F:[150,400]},hct:{n:'Гематокрит',u:'%',M:[40,50],F:[36,46]},esr:{n:'СОЭ',u:'мм/ч',M:[2,15],F:[2,20]}};
const BREF={ddim:{n:'D-димер',u:'мг/л',r:[0,.5],d:2},ca:{n:'Кальций',u:'ммоль/л',r:[2.15,2.55],d:2},vitd:{n:'Витамин D',u:'нг/мл',r:[30,100]},fer:{n:'Ферритин',u:'мкг/л',r:[30,300]},glu:{n:'Глюкоза',u:'ммоль/л',r:[3.9,5.6],d:1}};
const BONE={spine:['Поясничный отдел',1.05],hip:['Шейка бедра и таз',.95],femur:['Бедренная кость',.86],radius:['Лучевая кость',.68]};
const MUS=Object.keys(ANAT_PARTS.mus);
const last=a=>a[a.length-1];
const range=(p,k)=>REF[k][p.sex];
function lvRef(v,[a,b],soft=.06){const w=(b-a)*soft;return v<a-w*3||v>b+w*3?2:v<a||v>b?1:0}
const tLv=t=>t<-2.5?2:t<-1?1:0,sLv=s=>s<80?2:s<90?1:0;
function psyIdx(w){if(!w)return 60;const pos=[w.mood,w.motiv,w.team,w.sleepq].map(v=>(v-1)/9),neg=[w.stress,w.anx,w.home,w.burn].map(v=>(10-v)/9);return Math.round(avg([...pos,...neg])*100)}
const psyLv=i=>i<45?2:i<62?1:0;
function bp(p){const v=last(p.vit);return v?(v.sys>=140||v.dia>=90?2:v.sys>=130||v.dia>=85?1:0):0}
function thromb(p){const b=last(p.bio)||{},c=last(p.cbc)||{},w=last(p.well),f=[];
  const add=(k,v,n)=>{if(k)f.push([n,v])};
  add(b.ddim>.5,14,'D-димер выше 0,5 мг/л');add(c.hct>(p.sex==='M'?49:45),6,'Высокий гематокрит, кровь гуще');add(c.plt>380,5,'Тромбоциты у верхней границы');
  const tr=p.train.filter(x=>x.date>addD(today(),-7)).length;add(tr<3,7,'Мало движения за неделю ('+tr+' тренировок)');
  add(w&&w.pain.some(x=>['calves','vein_leg','shin'].includes(x.pt)),10,'Жалоба на боль в голени');add(p.age>40,3,'Возраст старше 40');
  return{risk:Math.round(2+f.reduce((s,x)=>s+x[1],0)),f}}
const thLv=r=>r>=25?2:r>=12?1:0;

function status(p){const L={},T=today(),w=last(p.well),pi=psyIdx(w),d=last(p.dexa),c=last(p.cbc)||{},b=last(p.bio)||{},th=thromb(p),bpl=bp(p),spo=(last(p.vit)||{}).spo2||98;
  const bone={spine:d?tLv(d.t.spine):0,pelvis:d?tLv(d.t.hip):0,femur:d?tLv(d.t.femur):0,arm:d?tLv(d.t.radius):0,hand:d?tLv(d.t.radius):0};
  const tAvg=d?avg(Object.values(d.t)):0;['skull','ribs','shoulder','shin','foot'].forEach(k=>bone[k]=tLv(tAvg+.3));
  const mus={};MUS.forEach(k=>mus[k]=sLv(p.str[k]));
  const vess={aorta:bpl,art_leg:bpl,art_arm:bpl,vein_leg:thLv(th.risk),vena:thLv(th.risk*.6),vein_arm:thLv(th.risk*.4)};
  const org={brain:psyLv(pi),eyes:0,heart:Math.max(bpl,((last(p.vit)||{}).pulse||60)>95?1:0),lungs:spo<92?2:spo<95?1:0,liver:b.glu>6.5?1:0,stomach:0,gut:0,kidney:c.hct>(p.sex==='M'?50:46)?1:0,bladder:0};
  if(w)w.pain.forEach(x=>{const l=x.lv>=7?2:x.lv>=4?1:0;for(const S of [bone,mus,vess,org])if(x.pt in S)S[x.pt]=Math.max(S[x.pt],l)});
  return{pi,th,bone,mus,vess,org,bpl,tAvg}}
function admit(p){const st=status(p),r=[],o=[],T=today();
  CHK.forEach(c=>{const s=chk(p,c);if(s.s===2)r.push(`Просрочен обязательный чекап: ${c.n} (${s.txt})`);else if(s.s===1)o.push(`${c.n}: ${s.txt}`)});
  const c=last(p.cbc);if(c&&(c.hb<110||c.plt<100))r.push('Критичное значение в анализе крови: нужен осмотр врача');
  if(st.pi<45)r.push(`Психологическое состояние: индекс ${st.pi}/100. Недопуск до беседы с психологом`);else if(st.pi<62)o.push(`Психологический индекс снижен (${st.pi}/100): поговорить с психологом на этой неделе`);
  if(st.th.risk>=25)r.push(`Высокий риск тромбоза (${st.th.risk} %): недопуск к выходам и длинным сменам до осмотра`);else if(st.th.risk>=12)o.push(`Риск тромбоза повышен (${st.th.risk} %): больше воды и движения`);
  const w=last(p.well);if(w&&w.pain.some(x=>x.lv>=8))r.push('Сильная боль по карте самочувствия: осмотр врача экипажа');
  if(st.bpl===2)o.push('Давление выше 140/90');if(st.tAvg<-2.5)r.push('Плотность костей ниже порога: недопуск к ударным нагрузкам');else if(Object.values(st.bone).some(l=>l>0))o.push('Остеопения по денситометрии: осевые нагрузки, кальций и витамин D');
  if(Object.values(st.mus).some(l=>l===2))o.push('Сила мышц ниже 80 % от исходной: усиленная программа тренировок');
  return{lv:r.length?2:o.length?1:0,r,o,st}}
const ADM=['Допущен','Условный допуск','Недопуск'];

/* ---------- очки, уровни, значки ---------- */
function points(p){const T=today();let s=0;CHK.forEach(c=>{s+=p[c.src].filter(r=>r.date<=T).length*c.pts;if(chk(p,c).s===2)s-=40});
  s+=p.train.filter(x=>x.date<=T).length*5+(p.breath||0)*3;return Math.max(0,s)}
const level=pt=>({l:Math.floor(pt/250)+1,pr:pt%250});
function discipline(p){const T=today();let ok=0,n=0;CHK.filter(c=>!c.daily).forEach(c=>{for(let k=0;k<28;k++){const d=addD(T,-k-1);if(c.wd&&c.wd.includes(wd(d))){n++;if(p[c.src].some(r=>r.date>=d&&r.date<=addD(d,1)))ok++}}});return n?Math.round(ok/n*100):100}
function rpg(p){const st=status(p),v=last(p.vit)||{};return[['Психика',st.pi,'#b99cff'],['Сила',Math.round(avg(MUS.map(k=>p.str[k]))),'#ff8a65'],
  ['Кости',Math.round(clamp(80+st.tAvg*20,0,100)),'#e9e3d3'],['Выносливость',Math.round(clamp(100-Math.abs((v.pulse||62)-60)*1.5-(st.bpl*12),0,100)),'#69a8ff'],['Дисциплина',discipline(p),'#3ad6a6']]}
function badges(p){const st=status(p),r=rpg(p);return[['☯ Спокойный разум',st.pi>=75],['🦴 Крепкие кости',st.tAvg>-.5],['⚡ Сила в норме',MUS.every(k=>p.str[k]>=90)],['📅 Железная дисциплина',discipline(p)>=95],
  ['🌬 Мастер дыхания',(p.breath||0)>=5],['🏃 10 тренировок',p.train.length>=10],['💧 Без тромбов',st.th.risk<8]]}

/* ---------- данные экипажа (демо) ---------- */
const PEOPLE=[
  ['ayd','Айдана Сарсенова','Командир экипажа','F',34,168,60,'#0b3d91',{}],
  ['tim','Тимур Ахметов','Бортинженер','M',31,181,79,'#c2410c',{skipCbc:1}],
  ['ele','Елена Воронцова','Врач экипажа','F',38,164,57,'#0f766e',{bone:-1.7}],
  ['dan','Даниил Ким','Пилот','M',29,176,72,'#7c3aed',{psy:'crisis'}],
  ['mar','Мария Лопес','Биолог','F',33,170,63,'#be185d',{thromb:1}],
  ['arm','Арман Нурланов','Специалист по связи','M',27,184,77,'#1d4ed8',{weakLegs:1,back:1}],
  ['yuk','Юки Танака','Геолог','F',30,160,52,'#15803d',{star:1}],
  ['ser','Сергей Беляев','Инженер жизнеобеспечения','M',42,178,88,'#a16207',{bp:1,home:1}]];
function seed(){const T=today(),out=[];
  PEOPLE.forEach(([id,name,role,sex,age,h,w,col,o],pi)=>{const r=rng(pi*97+5),g=(m,s)=>m+(r()*2-1)*s,p={id,name,role,sex,age,h,w,col,cbc:[],vit:[],well:[],psy:[],bio:[],dexa:[],train:[],breath:o.star?9:Math.floor(r()*4),str:{}};
    const M=sex==='M';
    for(let k=70;k>=0;k--){const d=addD(T,-k),x=wd(d);if(d>T)continue;
      if(x===5&&!(o.skipCbc&&k<12&&k>0)&&k>0)p.cbc.push({date:d,hb:Math.round(g(M?146:131,6)),rbc:+g(M?4.9:4.4,.25).toFixed(1),wbc:+g(6.3,1.1).toFixed(1),plt:Math.round(o.thromb?g(395,10):g(245,40)),hct:Math.round(o.thromb?g(46.5,.6):g(M?44:40,1.5)),esr:Math.round(g(8,3))});
      if(k>0||!o.skipCbc)p.vit.push({date:d,sys:Math.round(o.bp?g(142,5):g(118,6)),dia:Math.round(o.bp?g(91,3):g(76,4)),pulse:Math.round(o.psy?g(84,5):g(62,5)),spo2:Math.round(g(97.5,1)),wt:+(w+g(0,.4)-k*.004).toFixed(1)});
      if(x===1||x===4){const wk=k/7,cr=o.psy==='crisis'?clamp(1-wk/5,0,1):0;
        const s={date:d,mood:Math.round(clamp(g(o.star?8.5:7,1)-cr*4.5,1,10)),stress:Math.round(clamp(g(o.star?2.5:4,1)+cr*5,1,10)),anx:Math.round(clamp(g(3.5,1)+cr*4.5,1,10)),sleepq:Math.round(clamp(g(7,1)-cr*4,1,10)),
          motiv:Math.round(clamp(g(7.5,1)-cr*3.5,1,10)),team:Math.round(clamp(g(8,1)-cr*3,1,10)),home:Math.round(clamp(g(o.home?7.5:4,1),1,10)),burn:Math.round(clamp(g(3,1)+cr*5,1,10)),energy:Math.round(clamp(g(7,1)-cr*3,1,10)),sleep:+clamp(g(7.3,.6)-cr*2.2,3,9).toFixed(1),pain:[],note:''};
        if(o.back&&k<20)s.pain.push({pt:'spine',lv:k<6?6:4},{pt:'back',lv:5});if(o.thromb&&k<5)s.pain.push({pt:'calves',lv:4});if(o.weakLegs&&k<10)s.pain.push({pt:'quads',lv:3});
        p.well.push(s)}
      if(x===3&&k>0)p.psy.push({date:d,note:''});
      if(x!==7&&r()<(o.weakLegs?.25:o.star?.85:.6))p.train.push({date:d,pt:MUS[Math.floor(r()*MUS.length)]})}
    for(let k=70;k>0;k-=14)p.bio.push({date:addD(T,-k+3),ddim:+(o.thromb?g(.78,.06):g(.28,.08)).toFixed(2),ca:+g(2.36,.08).toFixed(2),vitd:Math.round(o.bone?g(22,3):g(38,6)),fer:Math.round(g(M?140:70,25)),glu:+g(5,.35).toFixed(1)});
    for(let m=6;m>=0;m--){const base=o.bone||0,t={};Object.keys(BONE).forEach((k,i)=>{t[k]=+(g(.3,.1)+(m===6?0:-(6-m)*(o.bone?.12:.05))+(k==='spine'?base:k==='hip'&&o.weakLegs?-.9:base*.5)-i*.05).toFixed(2)});p.dexa.push({date:addD(T,-m*30-4),t})}
    MUS.forEach(k=>p.str[k]=Math.round(clamp(g(o.star?97:93,4)-(o.weakLegs&&['quads','hams','calves','glutes'].includes(k)?16:0)-(o.psy?4:0),60,105)));
    p.strHist=[...Array(6)].map((_,i)=>({date:addD(T,-(5-i)*14),v:Math.round(avg(MUS.map(k=>p.str[k]))+(5-i)*(o.weakLegs?1.6:.4))}));
    out.push(p)});
  return out}
const KEY='orbita_crew_v1';let C;
function load(){try{C=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!C||!C.crew){C={off:0,me:'ayd'};C.crew=seed()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(C))}catch(e){}}
const P=id=>C.crew.find(p=>p.id===id);
const ini=n=>n.split(' ').map(s=>s[0]).join('').slice(0,2);
const ava=p=>`<span class="ava" style="background:${p.col}">${esc(ini(p.name))}</span>`;

/* ---------- графики ---------- */
function chart(cv,series,o={}){const d=devicePixelRatio||1,W=cv.clientWidth,Hh=cv.clientHeight;if(!W)return;cv.width=W*d;cv.height=Hh*d;const x=cv.getContext('2d');x.scale(d,d);
  const all=series.flatMap(s=>s.pts),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);if(!all.length)return;
  let lo=o.lo??Math.min(...ys),hi=o.hi??Math.max(...ys);if(hi===lo){hi+=1;lo-=1}const pad=(hi-lo)*.08;lo-=pad;hi+=pad;
  const x0=Math.min(...xs),x1=Math.max(...xs)||x0+1,L=38,R=8,Tp=10,B=22,X=v=>L+(v-x0)/(x1-x0||1)*(W-L-R),Y=v=>Tp+(hi-v)/(hi-lo)*(Hh-Tp-B);
  (o.bands||[]).forEach(([a,b,c])=>{x.fillStyle=c;x.fillRect(L,Y(Math.min(b,hi)),W-L-R,Y(Math.max(a,lo))-Y(Math.min(b,hi)))});
  x.strokeStyle='#1f2d45';x.fillStyle='#8b9cb3';x.font='11px sans-serif';x.lineWidth=1;
  for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,y=Y(v);x.beginPath();x.moveTo(L,y);x.lineTo(W-R,y);x.stroke();x.fillText(fx(v,o.d??0),2,y+4)}
  const ds=[...new Set(xs)].sort((a,b)=>a-b),step=Math.max(1,Math.ceil(ds.length/7));ds.forEach((v,i)=>{if(i%step===0)x.fillText(hd(iso(v)),Math.min(X(v)-14,W-46),Hh-5)});
  series.forEach(s=>{x.strokeStyle=s.c;x.lineWidth=2;x.beginPath();s.pts.forEach((p,i)=>i?x.lineTo(X(p[0]),Y(p[1])):x.moveTo(X(p[0]),Y(p[1])));x.stroke();
    x.fillStyle=s.c;s.pts.forEach(p=>{x.beginPath();x.arc(X(p[0]),Y(p[1]),2.6,0,7);x.fill()})})}
const legend=s=>`<div class="row sm">${s.map(([n,c])=>`<span><i style="display:inline-block;width:10px;height:3px;background:${c};vertical-align:middle"></i> ${n}</span>`).join('')}</div>`;
function gauge(v,c,lbl){const a=Math.PI*1.5*v/100,r=60,cx=75,cy=75,p=(t)=>[cx+r*Math.cos(t),cy+r*Math.sin(t)],s0=Math.PI*.75,[x0,y0]=p(s0),[x1,y1]=p(s0+a),[xe,ye]=p(s0+Math.PI*1.5);
  return`<svg viewBox="0 0 150 150"><path d="M${x0} ${y0} A${r} ${r} 0 1 1 ${xe} ${ye}" fill="none" stroke="#18253b" stroke-width="12" stroke-linecap="round"/>
  <path d="M${x0} ${y0} A${r} ${r} 0 ${a>Math.PI?1:0} 1 ${x1} ${y1}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
  <text x="75" y="80" text-anchor="middle" fill="#e9eff7" font-size="34" font-weight="800" font-family="monospace">${v}</text><text x="75" y="104" text-anchor="middle" fill="#8b9cb3" font-size="11">${lbl}</text></svg>`}
const barRow=(n,v,max,c,txt)=>`<div class="bar"><span>${n}</span><span class="tr"><i style="width:${clamp(v/max*100,2,100)}%;background:${c}"></i></span><span class="mono sm">${txt??v}</span></div>`;

/* ---------- 3D-просмотрщик ---------- */
const VW={sys:'all',colors:null,pick:null,pain:[],pulse:62};
function vwInit(){if(VW.R)return true;if(!window.THREE)return false;const T=THREE;let R;try{R=new T.WebGLRenderer({antialias:true,alpha:true})}catch(e){return false}
  R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;VW.R=R;
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(34,1,.05,50);cam.position.set(0,1.0,3.4);VW.sc=sc;VW.cam=cam;
  const oc=new T.OrbitControls(cam,R.domElement);oc.target.set(0,.92,0);oc.enableDamping=true;oc.minDistance=.5;oc.maxDistance=6;oc.autoRotate=!matchMedia('(prefers-reduced-motion: reduce)').matches;oc.autoRotateSpeed=1.2;oc.update();VW.oc=oc;
  sc.add(new T.HemisphereLight(0xdfe9ff,0x202838,1.15));const k=new T.DirectionalLight(0xffffff,2);k.position.set(2,3,3);sc.add(k);const rl=new T.DirectionalLight(0x69a8ff,1.3);rl.position.set(-3,2,-3);sc.add(rl);
  [.66,.5,.34].forEach((r,i)=>{const o=new T.Mesh(new T.TorusGeometry(r,.006,6,80),new T.MeshBasicMaterial({color:i?0x22304a:0x69a8ff}));o.rotation.x=Math.PI/2;sc.add(o)});
  const pf=new T.Mesh(new T.CylinderGeometry(.68,.72,.05,64),new T.MeshStandardMaterial({color:0x0c1320,metalness:.6,roughness:.4}));pf.position.y=-.03;sc.add(pf);
  VW.L={};['skin','mus','skel','org','vess'].forEach(n=>{const g=new T.Group();g.name=n;sc.add(g);VW.L[n]=g});
  const a=anatBuild(T,null,VW.L);Object.assign(VW,a);
  VW.mk=new T.Group();sc.add(VW.mk);VW.ray=new T.Raycaster();VW.clock=new T.Clock();
  VW.tip=document.createElement('div');VW.tip.className='tip';
  let down=null;const cv=R.domElement;
  cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
  cv.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const h=vwHit(e);if(h&&VW.pick)VW.pick(h.object.userData,h)}down=null});
  cv.addEventListener('pointermove',e=>{if(e.buttons)return;const h=vwHit(e),t=VW.tip;cv.style.cursor=h?'pointer':'grab';if(!h){t.style.display='none';return}
    const u=h.object.userData,r=cv.getBoundingClientRect(),lv=VW.colors&&VW.colors[u.pt];t.style.display='block';t.style.left=(e.clientX-r.left+14)+'px';t.style.top=(e.clientY-r.top+10)+'px';
    t.innerHTML=`${esc(ANAT_PARTS[u.sys][u.pt])} ${lv!=null?tag(lv):''}`});
  cv.addEventListener('pointerleave',()=>{VW.tip.style.display='none'});
  new ResizeObserver(vwResize).observe(cv);return true}
function vwHit(e){const r=VW.R.domElement.getBoundingClientRect();VW.ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),VW.cam);
  return VW.ray.intersectObjects(VW.parts.filter(p=>p.parent.visible),false)[0]}
function vwResize(){const c=VW.R.domElement,p=c.parentElement;if(!p)return;const w=p.clientWidth,h=p.clientHeight;if(!w||!h)return;VW.R.setSize(w,h,false);VW.cam.aspect=w/h;VW.cam.updateProjectionMatrix()}
function vwMount(el){if(!vwInit()){el.innerHTML='<p class="note b">Браузер не поддерживает WebGL: 3D-модель недоступна.</p>';return false}
  el.prepend(VW.R.domElement);el.appendChild(VW.tip);vwResize();VW.R.setAnimationLoop(vwLoop);return true}
function vwStop(){if(VW.R){VW.R.setAnimationLoop(null);VW.R.domElement.remove()}}
function vwSet(o){Object.assign(VW,o);const s=VW.sys;for(const k in VW.L)VW.L[k].visible=s==='all'||k===s||k==='skin';
  VW.skinMat.opacity=s==='all'?.22:s==='pain'?.35:.08;if(s==='pain'){VW.L.mus.visible=true;VW.L.skel.visible=true}
  VW.mk.clear();VW.pain.forEach(x=>{const m=VW.parts.find(q=>q.userData.pt===x.pt);if(!m)return;const v=new THREE.Vector3();m.getWorldPosition(v);
    const s=new THREE.Mesh(new THREE.SphereGeometry(.025+x.lv*.004,16,12),new THREE.MeshBasicMaterial({color:COL[x.lv>=7?2:x.lv>=4?1:0],transparent:true,opacity:.85,depthTest:false}));s.renderOrder=9;s.position.copy(v);VW.mk.add(s)})}
function vwLoop(){const t=VW.clock.getElapsedTime(),ph=(t*VW.pulse/60)%1,beat=1+.09*Math.pow(Math.max(0,Math.sin(ph*Math.PI*2)),6);
  VW.heart.scale.copy(VW.heart.userData.s0).multiplyScalar(beat);const br=1+.05*Math.sin(t*1.5);VW.lungs.forEach(l=>{l.scale.y=l.userData.s0.y*br;l.scale.z=l.userData.s0.z*br});
  for(const p of VW.parts){const u=p.userData,m=p.material,lv=VW.colors?VW.colors[u.pt]:undefined,sel=VW.selPt===u.pt;
    if(lv){m.color.copy(u.base).lerp(new THREE.Color(COL[lv]),.85)}else m.color.copy(u.base);
    m.emissive.set(sel?'#69a8ff':lv!=null?COL[lv]:'#000');m.emissiveIntensity=sel?.45+.2*Math.sin(t*6):lv===2?.35+.3*Math.sin(t*5):lv===1?.15:lv===0?.06:0}
  VW.mk.children.forEach((s,i)=>s.scale.setScalar(1+.25*Math.sin(t*4+i)));
  VW.oc.update();VW.R.render(VW.sc,VW.cam)}

/* ---------- ракета на главной ---------- */
const HR={};
function heroInit(cv){if(HR.R){HR.R.setAnimationLoop(heroLoop);return}if(!window.THREE)return;const T=THREE;let R;try{R=new T.WebGLRenderer({canvas:cv,antialias:true})}catch(e){return}
  R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;HR.R=R;const sc=new T.Scene();sc.background=new T.Color(0x04060c);HR.sc=sc;
  const cam=new T.PerspectiveCamera(45,1,.1,2000);cam.position.set(0,1.5,13);HR.cam=cam;
  sc.add(new T.HemisphereLight(0xbfd6ff,0x1a1020,.8));const sun=new T.DirectionalLight(0xfff2e0,2.6);sun.position.set(8,6,6);sc.add(sun);const rim=new T.DirectionalLight(0x69a8ff,1.6);rim.position.set(-6,3,-6);sc.add(rim);
  const r=rng(11),sp=[];for(let i=0;i<3000;i++){const u=r()*2-1,a=r()*6.283,q=Math.sqrt(1-u*u),d=300+r()*500;sp.push(q*Math.cos(a)*d,u*d,q*Math.sin(a)*d)}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sc.add(new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:1.3,sizeAttenuation:false})));
  const pl=new T.Mesh(new T.SphereGeometry(40,64,48),new T.MeshStandardMaterial({color:0x2f6fc0,roughness:.85,emissive:0x07152e}));pl.position.set(-18,-46,-30);sc.add(pl);HR.pl=pl;
  const atm=new T.Mesh(new T.SphereGeometry(41.5,64,48),new T.MeshBasicMaterial({color:0x69a8ff,transparent:true,opacity:.12,side:T.BackSide,blending:T.AdditiveBlending}));atm.position.copy(pl.position);sc.add(atm);
  const moon=new T.Mesh(new T.SphereGeometry(2.2,32,24),new T.MeshStandardMaterial({color:0xb8b9c2,roughness:1}));moon.position.set(16,9,-40);sc.add(moon);
  const rk=new T.Group(),W=new T.MeshStandardMaterial({color:0xf1f4f8,roughness:.35,metalness:.25}),Rd=new T.MeshStandardMaterial({color:0xfc3d21,roughness:.4}),Dk=new T.MeshStandardMaterial({color:0x2a3446,metalness:.7,roughness:.3});
  const prof=[[0,-2.4],[.55,-2.4],[.75,-2],[.8,-1],[.8,1.2],[.72,1.9],[.5,2.6],[0,2.6]].map(p=>new T.Vector2(p[0],p[1]));rk.add(new T.Mesh(new T.LatheGeometry(prof,64),W));
  const nose=new T.Mesh(new T.LatheGeometry([[.505,2.58],[.38,2.9],[.2,3.2],[0,3.35]].map(p=>new T.Vector2(p[0],p[1])),64),new T.MeshStandardMaterial({color:0xfc3d21,roughness:.4,side:T.DoubleSide}));rk.add(nose);
  const band=new T.Mesh(new T.CylinderGeometry(.81,.81,.18,64),Rd);band.position.y=-1.4;rk.add(band);
  [1.1,.3].forEach((y,i)=>{const w=new T.Mesh(new T.CircleGeometry(i?.16:.24,32),new T.MeshStandardMaterial({color:0x0b3d91,emissive:0x69a8ff,emissiveIntensity:.6,metalness:.8,roughness:.1}));w.position.set(0,y,.805);rk.add(w);
    const fr=new T.Mesh(new T.TorusGeometry(i?.16:.24,.03,8,32),Dk);fr.position.copy(w.position);rk.add(fr)});
  const fs=new T.Shape();fs.moveTo(0,0);fs.lineTo(.9,-.8);fs.lineTo(.9,-1.5);fs.lineTo(0,-.9);fs.closePath();const fg=new T.ExtrudeGeometry(fs,{depth:.06,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2});
  for(let i=0;i<4;i++){const f=new T.Mesh(fg,Rd),g=new T.Group();f.position.set(.7,-1.1,-.03);g.add(f);g.rotation.y=i*Math.PI/2+Math.PI/4;rk.add(g)}
  const bell=new T.Mesh(new T.CylinderGeometry(.35,.55,.5,32,1,true),Dk);bell.position.y=-2.6;rk.add(bell);
  const fl=new T.Mesh(new T.ConeGeometry(.5,2.6,32,1,true),new T.MeshBasicMaterial({color:0xffb224,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));fl.rotation.x=Math.PI;fl.position.y=-4.1;rk.add(fl);HR.fl=fl;
  const fl2=new T.Mesh(new T.ConeGeometry(.28,1.6,24,1,true),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));fl2.rotation.x=Math.PI;fl2.position.y=-3.6;rk.add(fl2);HR.fl2=fl2;
  const N=400,pp=new Float32Array(N*3);HR.pv=[...Array(N)].map(()=>({x:0,y:-3,z:0,vx:0,vy:0,vz:0,l:Math.random()}));const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pp,3));
  HR.pts=new T.Points(pg,new T.PointsMaterial({color:0xffc76b,size:.12,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));rk.add(HR.pts);
  rk.rotation.z=-.35;rk.position.set(3.2,0,0);sc.add(rk);HR.rk=rk;HR.clock=new T.Clock();
  new ResizeObserver(()=>{const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();rk.position.x=w<700?0:3.2}).observe(cv);
  R.setAnimationLoop(heroLoop)}
function heroLoop(){const t=HR.clock.getElapsedTime(),dt=Math.min(.05,HR.clock.getDelta()||.016);
  HR.rk.position.y=Math.sin(t*.8)*.25;HR.rk.rotation.y=t*.35;const f=1+.15*Math.sin(t*40)+.1*Math.sin(t*23);HR.fl.scale.set(f,1+.2*Math.sin(t*31),f);HR.fl2.scale.setScalar(f);
  const a=HR.pts.geometry.attributes.position;HR.pv.forEach((p,i)=>{p.l+=dt*1.2;if(p.l>1){p.l=0;p.x=(Math.random()-.5)*.4;p.z=(Math.random()-.5)*.4;p.y=-2.9;p.vx=(Math.random()-.5)*1.2;p.vz=(Math.random()-.5)*1.2;p.vy=-4-Math.random()*3}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;a.setXYZ(i,p.x,p.y,p.z)});a.needsUpdate=true;
  HR.pl.rotation.y=t*.03;HR.cam.position.x=Math.sin(t*.1)*1.2;HR.cam.lookAt(0,0,0);HR.R.render(HR.sc,HR.cam)}
function heroStop(){if(HR.R)HR.R.setAnimationLoop(null)}

/* ---------- рекомендации ---------- */
const EX={quads:[['Приседания с весом','4×8'],['Жим ногами','3×10']],hams:[['Румынская тяга','3×10'],['Сгибания ног','3×12']],calves:[['Подъёмы на носки','4×15'],['Икроножная помпа','20 раз каждые 2 ч']],
  glutes:[['Ягодичный мост','3×12'],['Выпады','3×10']],back:[['Тяга в наклоне','4×8'],['Гиперэкстензия','3×12']],chest:[['Отжимания','3×15'],['Жим лёжа','4×8']],abs:[['Планка','3×45 с'],['Скручивания','3×15']],
  obliq:[['Боковая планка','3×30 с'],['Русские скручивания','3×20']],delts:[['Жим над головой','3×10'],['Махи в стороны','3×12']],biceps:[['Сгибания с гантелями','3×12']],triceps:[['Французский жим','3×12'],['Отжимания на брусьях','3×10']],forearm:[['Кистевой эспандер','3×30'],['Вис на перекладине','3×30 с']]};
const BEX={spine:[['Становая тяга: осевая нагрузка','3×6'],['Приседания с весом','4×6']],pelvis:[['Прыжки на месте: ударная нагрузка','3×20'],['Выпады с весом','3×10']],femur:[['Приседания с весом','4×6'],['Прыжки на месте','3×20']],arm:[['Отжимания','3×12'],['Жим гантелей','3×10']]};
const PAINMAP={spine:['back','spine'],back:['back','spine'],quads:['quads','femur'],hams:['hams'],calves:['calves'],glutes:['glutes','pelvis'],pelvis:['glutes','pelvis'],femur:['quads','femur'],shin:['calves'],chest:['chest'],abs:['abs'],delts:['delts'],biceps:['biceps'],triceps:['triceps'],forearm:['forearm'],arm:['biceps','triceps','arm'],shoulder:['delts']};
function plan(p){const st=status(p),w=last(p.well),pain={};(w?w.pain:[]).forEach(x=>(PAINMAP[x.pt]||[x.pt]).forEach(k=>pain[k]=Math.max(pain[k]||0,x.lv)));const out=[],T=today();
  MUS.map(k=>[k,p.str[k]]).sort((a,b)=>a[1]-b[1]).slice(0,4).forEach(([k,v])=>{if(pain[k]>=5){out.push({k,part:ANAT_PARTS.mus[k],n:'Щадящий режим: мобилизация и растяжка',d:'боль '+pain[k]+'/10, силовые отменены',lv:1,why:'pain'});return}
    if(v<95)(EX[k]||[]).forEach(([n,d])=>out.push({k,part:ANAT_PARTS.mus[k],n,d,lv:sLv(v),why:`сила ${v} % от исходной`}))});
  Object.keys(BEX).forEach(k=>{if(st.bone[k]>0&&!(pain[k]>=5))BEX[k].slice(0,1).forEach(([n,d])=>out.push({k,part:ANAT_PARTS.skel[k],n,d,lv:st.bone[k],why:'плотность кости снижена'}))});
  out.push({k:'cardio',part:'Сердце и сосуды',n:'Кардио: дорожка или велотренажёр',d:'30 мин, пульс 120–140',lv:st.th.risk>=12?1:0,why:st.th.risk>=12?'снизить риск тромбоза':'поддержание формы'});
  if(st.th.risk>=12)out.push({k:'calvesP',part:'Глубокие вены ног',n:'Икроножная помпа',d:'20 раз каждые 2 часа',lv:thLv(st.th.risk),why:'риск тромбоза '+st.th.risk+' %'});
  const seen=new Set();for(let i=out.length-1;i>=0;i--){if(seen.has(out[i].n))out.splice(i,1);else seen.add(out[i].n)}
  out.forEach(o=>o.done=p.train.some(x=>x.date===T&&x.pt===o.k&&x.n===o.n));return out}
function nutrition(p){const v=last(p.vit)||{},wt=v.wt||p.w,c=last(p.cbc)||{},b=last(p.bio)||{},st=status(p),tr=p.train.filter(x=>x.date===today()).length;
  const bmr=10*wt+6.25*p.h-5*p.age+(p.sex==='M'?5:-161);let kcal=bmr*1.55+tr*120;const notes=[];
  const wtr=p.vit.slice(-14);if(wtr.length>5&&wtr[0].wt-last(wtr).wt>.6){kcal+=200;notes.push(['w','Вес снижается: +200 ккал к норме, чтобы не терять мышцы.'])}
  let prot=1.6*wt;if(MUS.some(k=>p.str[k]<90)){prot=1.9*wt;notes.push(['w','Сила мышц ниже исходной: белок поднят до 1,9 г/кг.'])}
  let carbF=1;if(b.glu>5.6){carbF=.88;notes.push(['w','Глюкоза у верхней границы: меньше простых углеводов, углеводы снижены на 12 %.'])}
  const fat=kcal*.28/9,carb=Math.max(0,(kcal-prot*4-fat*9)/4*carbF);kcal=prot*4+fat*9+carb*4;
  if(c.hb<(p.sex==='M'?130:120)||b.fer<30)notes.push(['b','Гемоглобин или ферритин низкие: продукты с железом (говядина, печень, гречка, шпинат) и витамин C к ним.']);
  if(b.vitd<30)notes.push(['w',`Витамин D ${b.vitd} нг/мл: добавка 2000 МЕ в день по назначению врача.`]);
  if(st.tAvg<-1)notes.push(['w','Плотность костей снижена: кальций 1200 мг в день (молочные продукты, сыр, кунжут), белок в каждом приёме пищи.']);
  if(st.th.risk>=12)notes.push(['w','Риск тромбоза повышен: вода не меньше 35 мл/кг, меньше соли.']);
  if(st.pi<62)notes.push(['p','Настроение и стресс: омега-3 (рыба 2–3 раза в неделю), регулярные приёмы пищи, без кофеина после 14:00.']);
  return{kcal:Math.round(kcal),prot:Math.round(prot),fat:Math.round(fat),carb:Math.round(carb),water:+(wt*.035).toFixed(1),notes}}
const PSYF=[['mood','Настроение',1],['stress','Стресс',-1],['anx','Тревога',-1],['sleepq','Качество сна',1],['motiv','Мотивация',1],['team','Отношения в экипаже',1],['home','Тоска по дому',-1],['burn','Выгорание',-1]];
const PSYR={mood:'Запланируйте одно приятное дело на сегодня: музыка, фильм, разговор с другом из экипажа.',stress:'Дыхание 4–7–8 два раза в день и 10-минутный перерыв каждые 2 часа работы.',
  anx:'Упражнение «5–4–3–2–1»: назовите 5 вещей, которые видите, 4 — слышите, 3 — чувствуете кожей. Обсудите тревогу с психологом.',sleepq:'Экран выключить за час до сна, одно время отбоя, тёмная и прохладная каюта.',
  motiv:'Разбейте задачу на маленькие шаги и отмечайте сделанное. Вспомните, зачем вы здесь.',team:'Встреча с психологом и коллегой в нейтральном формате; совместная трапеза экипажа.',
  home:'Видеозвонок или голосовое послание близким; общий календарь важных дат семьи.',burn:'Сократите сверхурочные, один полный выходной на неделе, обсудите нагрузку с командиром.'};

/* ---------- маршрутизация и экраны ---------- */
let route={v:'home'};
function go(h){location.hash=h}
function parse(){const h=location.hash.replace(/^#\/?/,'').split('/');route=h[0]==='p'&&P(h[1])?{v:'p',id:h[1],tab:h[2]||'over'}:h[0]==='rating'?{v:'rating'}:h[0]==='schedule'?{v:'schedule'}:{v:'home'};render()}
function render(){heroStop();vwStop();$('#simDate').textContent=hd(today())+', '+WD[wd(today())];const V=$('#view');
  if(route.v==='home')V.innerHTML=vHome();else if(route.v==='rating')V.innerHTML=vRating();else if(route.v==='schedule')V.innerHTML=vSched();else V.innerHTML=vProfile(P(route.id),route.tab);
  after();rStaff()}
function after(){if(route.v==='home'){heroInit($('#heroCv'));drawCrewPsy()}if(route.v==='p')afterP(P(route.id),route.tab)}

function vHome(){const ad=C.crew.map(admit),ok=ad.filter(a=>a.lv===0).length,no=ad.filter(a=>a.lv===2).length,pi=Math.round(avg(ad.map(a=>a.st.pi))),od=C.crew.reduce((s,p)=>s+CHK.filter(c=>chk(p,c).s===2).length,0);
  let fri=today();while(wd(fri)!==5)fri=addD(fri,1);const top=[...C.crew].sort((a,b)=>points(b)-points(a)).slice(0,3);
  return`<section class="hero"><canvas id="heroCv"></canvas><div class="txt"><span class="lbl">Миссия «Орбита» · экипаж ${C.crew.length} человек</span><h1>Здоровье экипажа: <em>тело и психика</em> под контролем</h1>
    <p>Обязательные чекапы по графику, допуск к работе, питание и тренировки по анализам, 3D-модель тела каждого сотрудника. Главное здесь — психологическое состояние людей.</p>
    <div class="row"><button class="pri" data-staff>Персонал</button><button onclick="go('#/rating')">Рейтинг</button><button class="ghost" onclick="go('#/schedule')">График чекапов</button></div></div></section>
  <div class="kpis"><div class="card kpi" style="border-color:rgba(185,156,255,.5)"><span class="lbl" style="color:var(--psy)">Психологический климат</span><b style="color:${COL[psyLv(pi)]}">${pi}<small style="font-size:1rem">/100</small></b><span>средний индекс экипажа</span></div>
    <div class="card kpi"><span class="lbl">Допущены к работе</span><b>${ok}/${C.crew.length}</b><span>${no?`недопуск: ${no}`:'недопусков нет'}</span></div>
    <div class="card kpi"><span class="lbl">Просроченные чекапы</span><b style="color:${od?COL[2]:COL[0]}">${od}</b><span>просрочка = недопуск</span></div>
    <div class="card kpi"><span class="lbl">Ближайший ОАК</span><b>${hd(fri)}</b><span>${WD[5]}, общий анализ крови, натощак</span></div></div>
  <div class="g2 w"><div class="card"><h2>Психика экипажа по неделям</h2><p class="sm mu">Индекс из опроса самочувствия (2 раза в неделю): настроение, стресс, тревога, сон, мотивация, отношения, тоска по дому, выгорание.</p><canvas class="chart" id="crewPsy"></canvas><div id="crewPsyLg"></div></div>
    <div class="card"><h2>Кому нужно внимание</h2><div class="plist" style="display:grid;gap:.45rem">${C.crew.map((p,i)=>[p,ad[i]]).filter(([,a])=>a.lv).sort((a,b)=>b[1].lv-a[1].lv).map(([p,a])=>`<button onclick="go('#/p/${p.id}')">${ava(p)}<span class="pinfo"><b>${esc(p.name)}</b><span class="sm mu">${esc((a.r[0]||a.o[0]||'').slice(0,80))}</span></span><span class="badge b${a.lv}">${ADM[a.lv]}</span></button>`).join('')||'<p class="mu">Все в норме.</p>'}</div>
      <h3 style="margin-top:1rem">Лидеры рейтинга</h3><div class="plist" style="display:grid;gap:.4rem;margin-top:.4rem">${top.map((p,i)=>`<button onclick="go('#/p/${p.id}')"><b class="mono" style="width:1.5rem">${['🥇','🥈','🥉'][i]}</b>${ava(p)}<span class="pinfo"><b>${esc(p.name)}</b><span class="sm mu">ур. ${level(points(p)).l} · ${points(p)} очков</span></span></button>`).join('')}</div></div></div>`}
function drawCrewPsy(){const cv=$('#crewPsy');if(!cv)return;const T=today(),wk=[...Array(10)].map((_,i)=>addD(T,-(9-i)*7));
  const pts=wk.map(d=>[dt(d),Math.round(avg(C.crew.map(p=>{const w=p.well.filter(x=>x.date<=d&&x.date>addD(d,-7));return w.length?avg(w.map(psyIdx)):psyIdx(last(p.well.filter(x=>x.date<=d)))})))]);
  const low=wk.map(d=>[dt(d),Math.min(...C.crew.map(p=>psyIdx(last(p.well.filter(x=>x.date<=d)))))]);
  chart(cv,[{c:'#b99cff',pts},{c:'#ff5f4c',pts:low}],{lo:20,hi:100,bands:[[0,45,'rgba(255,95,76,.07)'],[45,62,'rgba(255,178,36,.06)']]});$('#crewPsyLg').innerHTML=legend([['Средний индекс','#b99cff'],['Самый низкий в экипаже','#ff5f4c']])}

function rStaff(){const q=($('#staffQ').value||'').toLowerCase(),f=C.filt||'all';
  $('#staffF').innerHTML=[['all','Все'],['2','Недопуск'],['1','Условный'],['0','Допущены']].map(([k,n])=>`<button class="${f===k?'sel':''}" data-f="${k}">${n}</button>`).join('');
  $('#staffList').innerHTML=C.crew.map(p=>[p,admit(p)]).filter(([p,a])=>(f==='all'||+f===a.lv)&&(p.name+p.role).toLowerCase().includes(q)).map(([p,a])=>
    `<li><button data-p="${p.id}">${ava(p)}<span class="pinfo"><b>${esc(p.name)}</b><span class="sm mu">${esc(p.role)}</span><span class="psy">☯ психика ${a.st.pi}/100 · ур. ${level(points(p)).l}</span></span><span class="badge b${a.lv}">${ADM[a.lv]}</span></button></li>`).join('')}
function drawer(on){$('#drawer').classList.toggle('on',on);$('#shade').classList.toggle('on',on);$('#drawer').setAttribute('aria-hidden',!on);if(on){rStaff();setTimeout(()=>$('#staffQ').focus(),200)}}

const TABS=[['over','Персонаж'],['psy','Психика'],['chk','Чекапы и анализы'],['body','3D-тело'],['well','Самочувствие'],['food','Питание'],['train','Тренировки']];
function vProfile(p,tab){const a=admit(p),pt=points(p),lv=level(pt);
  return`<div class="phead"><div class="row">${ava(p)}<div><h1>${esc(p.name)}</h1><span class="mu">${esc(p.role)} · ${p.age} лет · ${p.h} см · ${p.w} кг</span></div></div>
    <div class="row"><span class="lbl">Уровень</span><span class="lvl">${lv.l}</span><div style="width:150px"><div class="xp"><i style="width:${lv.pr/2.5}%"></i></div><span class="sm mu mono">${pt} очков</span></div></div></div>
  <div class="adm a${a.lv}"><div class="row sp"><h2>${['✅','⚠️','⛔'][a.lv]} ${ADM[a.lv]} к работе</h2><span class="sm mu">на ${hd(today())}</span></div>
    ${a.r.length?`<ul>${a.r.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${a.o.length?`<ul class="sm">${a.o.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${!a.r.length&&!a.o.length?'<p class="sm" style="margin:.3rem 0 0">Все обязательные чекапы пройдены вовремя, показатели в норме.</p>':''}</div>
  <nav class="tabs">${TABS.map(([k,n])=>`<a href="#/p/${p.id}/${k}" class="${k===tab?'on':''} ${k==='psy'?'psyT':''}">${k==='psy'?'☯ ':''}${n}</a>`).join('')}</nav>
  <div id="tab">${({over:tOver,psy:tPsy,chk:tChk,body:tBody,well:tWell,food:tFood,train:tTrain}[tab]||tOver)(p,a)}</div>`}

function tOver(p,a){const st=a.st,w=last(p.well);
  return`<div class="g2 n"><div class="v3d" id="v3d"><div class="ov"><span class="badge b${a.lv}" style="background:rgba(6,10,18,.8)">${ADM[a.lv]}</span></div><div class="leg">${[0,1,2].map(l=>tag(l)).join('')}</div></div>
    <div style="display:grid;gap:1rem;align-content:start"><div class="card"><h3>Характеристики персонажа</h3><div class="rpg">${rpg(p).map(([n,v,c])=>barRow(n,v,100,c)).join('')}</div></div>
      <div class="card" style="border-color:rgba(185,156,255,.5)"><div class="row sp"><h3 style="color:var(--psy)">☯ Психика — главный показатель</h3>${tag(psyLv(st.pi))}</div>
        <div class="gauge">${gauge(st.pi,COL[psyLv(st.pi)],'индекс психики')}<div class="sm">${w?PSYF.slice(0,4).map(([k,n,s])=>`<div>${n}: <b class="mono">${w[k]}/10</b></div>`).join(''):''}<a href="#/p/${p.id}/psy" style="display:inline-block;margin-top:.5rem">Подробно →</a></div></div></div>
      <div class="card"><h3>Значки</h3><div class="bdg">${badges(p).map(([n,on])=>`<span class="${on?'':'off'}">${n}</span>`).join('')}</div></div>
      <div class="card"><h3>Обязательные чекапы</h3><table>${CHK.map(c=>{const s=chk(p,c);return`<tr><td>${c.ic} ${c.n}</td><td>${tag(s.s,s.s===0?'пройден':s.txt)}</td></tr>`}).join('')}</table></div></div></div>`}
function tPsy(p,a){const st=a.st,ws=p.well.slice(-20),w=last(ws),fs=w?PSYF.map(([k,n,s])=>({k,n,v:w[k],bad:s>0?(10-w[k]):(w[k]-1)})).sort((x,y)=>y.bad-x.bad):[];
  const ins=[];if(ws.length>=3){const l3=ws.slice(-3);if(l3[2].stress>l3[1].stress&&l3[1].stress>l3[0].stress)ins.push(['b','Стресс растёт три опроса подряд.']);if(l3.every(x=>x.sleepq<=5))ins.push(['w','Плохой сон три опроса подряд: сон сильнее всего влияет на настроение.'])}
  if(w&&w.home>=7)ins.push(['p','Сильная тоска по дому. Это нормальная реакция на долгую изоляцию, о ней стоит говорить.']);if(st.pi<45)ins.push(['b','Индекс ниже 45: допуск к работе приостановлен до беседы с психологом. Это забота, а не наказание.']);
  const nx=chk(p,CHK[3]);
  return`<div class="g2 w"><div class="card" style="border-color:rgba(185,156,255,.5)"><div class="row sp"><h2 style="color:var(--psy)">Психологическое состояние</h2>${tag(psyLv(st.pi))}</div>
      <div class="gauge">${gauge(st.pi,COL[psyLv(st.pi)],'из 100')}<div class="bars" style="flex:1">${PSYF.map(([k,n,s])=>{const v=w?w[k]:5,good=s>0?v:11-v;return barRow(n,v,10,COL[good>=7?0:good>=5?1:2],v+'/10')}).join('')}</div></div>
      <canvas class="chart" id="psyCh"></canvas>${legend([['Индекс','#b99cff'],['Стресс ×10','#ff5f4c'],['Настроение ×10','#3ad6a6']])}</div>
    <div style="display:grid;gap:1rem;align-content:start"><div class="card"><h3>Выводы системы</h3>${ins.map(([c,s])=>`<div class="note ${c}">${s}</div>`).join('')||'<div class="note">Состояние ровное, тревожных изменений нет.</div>'}
      <h3 style="margin-top:.8rem">Что поможет сейчас</h3>${fs.slice(0,3).filter(x=>x.bad>=3).map(x=>`<div class="note p"><b>${x.n}.</b> ${PSYR[x.k]}</div>`).join('')||'<p class="sm mu">Продолжайте в том же духе: режим, движение, общение.</p>'}</div>
      <div class="card"><h3>Психолог</h3><p class="sm">Беседа ${CHK[3].when}. ${tag(nx.s,nx.s===0?'пройдена':nx.txt)} Следующая: <b>${hd(nx.next)}</b></p>
        <div class="row"><button class="pri" data-act="psyDone">Отметить беседу сегодня</button><button data-act="psyReq">Попросить внеплановую встречу</button></div>
        <p class="sm mu" style="margin-top:.6rem">Если тяжело прямо сейчас, скажите врачу экипажа или командиру. Просить помощи — это нормально.</p></div>
      <div class="card"><h3>Дыхание 4–7–8 · +3 очка</h3><div class="breath" id="br">Начать</div><div class="row" style="justify-content:center"><button data-act="breath" id="brBtn">Минута дыхания</button></div></div></div></div>`}
function tChk(p){const c=last(p.cbc)||{},b=last(p.bio)||{},v=last(p.vit)||{};
  const inp=(id,val,st=1)=>`<input type="number" step="${st}" id="${id}" value="${val??''}">`;
  return`<div class="card"><h2>Обязательные чекапы</h2><p class="sm mu">Пропуск любого чекапа в срок автоматически даёт недопуск к работе, пока результат не внесён.</p>
    <table class="sched"><tr><th>Чекап</th><th>Когда</th><th>Последний</th><th>Следующий</th><th>Статус</th></tr>${CHK.map(k=>{const s=chk(p,k);return`<tr><td>${k.ic} ${k.n}</td><td class="sm mu">${k.when}</td><td class="d">${s.last?hd(s.last):'—'}</td><td class="d">${hd(s.next)}</td><td>${tag(s.s,s.s===0?'пройден':s.txt)}</td></tr>`}).join('')}</table></div>
  <div class="g2" style="margin-top:1rem"><form class="card" data-form="cbc"><h3>🩸 Общий анализ крови</h3><p class="sm mu">Последний: ${c.date?hd(c.date):'—'}. Значения сравниваются с референсом для пола.</p>
      <div class="fg">${Object.keys(REF).map(k=>`<label>${REF[k].n}, ${REF[k].u} <span class="mono">${range(p,k).join('–')}</span>${inp('f_'+k,c[k],REF[k].d?.1:1)}</label>`).join('')}</div>
      <table style="margin-top:.6rem">${Object.keys(REF).map(k=>c[k]!=null?`<tr><td>${REF[k].n}</td><td class="mono">${c[k]} ${REF[k].u}</td><td>${tag(lvRef(c[k],range(p,k)))}</td></tr>`:'').join('')}</table>
      <button class="pri" style="margin-top:.6rem">Внести результат ОАК</button></form>
    <div style="display:grid;gap:1rem;align-content:start"><form class="card" data-form="vit"><h3>❤ Данные с приборов</h3><div class="fg">
      <label>Давление верхнее${inp('f_sys',v.sys)}</label><label>Давление нижнее${inp('f_dia',v.dia)}</label><label>Пульс${inp('f_pulse',v.pulse)}</label><label>SpO₂, %${inp('f_spo2',v.spo2)}</label><label>Вес, кг${inp('f_wt',v.wt,.1)}</label></div>
      <button class="pri" style="margin-top:.6rem">Сохранить за сегодня</button></form>
    <form class="card" data-form="bio"><h3>⚗ Биохимия и коагулограмма</h3><div class="fg">${Object.keys(BREF).map(k=>`<label>${BREF[k].n}, ${BREF[k].u}${inp('f_'+k,b[k],BREF[k].d?.01:1)}</label>`).join('')}</div>
      <table style="margin-top:.6rem">${Object.keys(BREF).map(k=>b[k]!=null?`<tr><td>${BREF[k].n}</td><td class="mono">${b[k]} ${BREF[k].u}</td><td>${tag(lvRef(b[k],BREF[k].r))}</td></tr>`:'').join('')}</table>
      <button class="pri" style="margin-top:.6rem">Внести биохимию</button></form>
    <form class="card" data-form="dexa"><h3>🦴 Денситометрия (T-критерий)</h3><div class="fg">${Object.keys(BONE).map(k=>`<label>${BONE[k][0]}${inp('f_t_'+k,(last(p.dexa)||{t:{}}).t[k],.01)}</label>`).join('')}</div><button class="pri" style="margin-top:.6rem">Внести денситометрию</button></form></div></div>`}
const SYS=[['skel','Кости'],['mus','Мышцы'],['vess','Вены и артерии'],['org','Органы'],['all','Всё тело']];
function tBody(p,a){const s=C.sys||'skel';return`<div class="g2 n"><div class="v3d" id="v3d"><div class="ov">${SYS.map(([k,n])=>`<button class="${s===k?'sel':''}" data-sys="${k}">${n}</button>`).join('')}</div><div class="leg">${[0,1,2].map(l=>tag(l)).join('')}<span class="mu">клик по участку: подробности</span></div></div><div id="sysPanel">${sysPanel(p,a.st,s)}</div></div>`}
function sysPanel(p,st,s){const sel=C.selPt,lv=x=>x;
  if(s==='skel'){const d=last(p.dexa),d0=p.dexa[0];return`<div class="card"><h2>Костная система</h2><p class="sm mu">T-критерий: от −1 и выше норма, от −1 до −2,5 остеопения (оранжевый), ниже −2,5 опасно (красный). В невесомости кости теряют 1–1,5 % плотности в месяц.</p>
      <canvas class="chart" id="boneCh"></canvas>${legend(Object.keys(BONE).map((k,i)=>[BONE[k][0],['#e9e3d3','#ff8a65','#69a8ff','#3ad6a6'][i]]))}
      <table style="margin-top:.6rem"><tr><th>Участок</th><th>T</th><th>МПК, г/см²</th><th>За ${p.dexa.length-1} мес.</th><th></th></tr>${Object.keys(BONE).map(k=>{const t=d.t[k],ch=(t-d0.t[k])*.11/(BONE[k][1]+d0.t[k]*.11)*100;
        return`<tr><td>${BONE[k][0]}</td><td class="mono">${fx(t,2)}</td><td class="mono">${fx(BONE[k][1]+t*.11,3)}</td><td class="mono" style="color:${ch<-4?COL[2]:ch<-2?COL[1]:COL[0]}">${ch>0?'+':''}${fx(ch,1)} %</td><td>${tag(tLv(t))}</td></tr>`}).join('')}</table>
      <div class="note ${st.tAvg<-1?'w':''}">Кальций ${(last(p.bio)||{}).ca??'—'} ммоль/л · витамин D ${(last(p.bio)||{}).vitd??'—'} нг/мл. ${st.tAvg<-1?'Нужны осевые и ударные нагрузки, кальций и витамин D.':'Плотность в пределах нормы, держите силовые 3 раза в неделю.'}</div>${partInfo(p,st,'skel',sel)}</div>`}
  if(s==='mus'){const pl=plan(p).filter(x=>MUS.includes(x.k));return`<div class="card"><h2>Мышечная система</h2><p class="sm mu">Сила групп мышц в процентах от исходной перед миссией: от 90 % норма, 80–90 % внимание, ниже 80 % опасно.</p>
      <div class="bars">${MUS.map(k=>barRow(ANAT_PARTS.mus[k],p.str[k],110,COL[sLv(p.str[k])],p.str[k]+' %')).join('')}</div><canvas class="chart" id="strCh" style="height:150px;margin-top:.6rem"></canvas>
      <h3 style="margin-top:.8rem">Что делать по анализу</h3><ul class="exl">${pl.slice(0,6).map(x=>`<li><span><b>${x.n}</b><br><small>${x.part}: ${x.why}</small></span><span class="mono sm">${x.d}</span></li>`).join('')||'<li>Все группы в норме: поддерживающая программа.</li>'}</ul>${partInfo(p,st,'mus',sel)}</div>`}
  if(s==='vess'){const v=last(p.vit)||{},th=st.th;return`<div class="card"><h2>Вены и артерии</h2><div class="row sp"><span>Давление <b class="mono" style="font-size:1.3rem">${v.sys}/${v.dia}</b> · пульс <b class="mono">${v.pulse}</b></span>${tag(st.bpl)}</div>
      <canvas class="chart" id="bpCh"></canvas>${legend([['Верхнее','#ff5f4c'],['Нижнее','#69a8ff'],['Пульс','#3ad6a6']])}
      <h3 style="margin-top:.8rem">Вероятность образования тромба</h3><div class="row"><b class="mono" style="font-size:2rem;color:${COL[thLv(th.risk)]}">${th.risk} %</b>${tag(thLv(th.risk))}</div>
      <div class="bars" style="margin-top:.4rem">${th.f.map(([n,w])=>barRow(n,w,15,COL[1],'+'+w)).join('')||'<p class="sm mu">Факторов риска нет.</p>'}</div>
      <p class="sm mu">Модель учебная: базовый риск 2 % плюс факторы. В невесомости кровь смещается к голове, а в венах ног и шеи замедляется ток, поэтому важны вода и движение.</p>${partInfo(p,st,'vess',sel)}</div>`}
  if(s==='org'){const v=last(p.vit)||{};return`<div class="card"><h2>Органы</h2><table>${[['brain','психика '+st.pi+'/100'],['heart','пульс '+v.pulse+', давление '+v.sys+'/'+v.dia],['lungs','SpO₂ '+v.spo2+' %'],['liver','глюкоза '+((last(p.bio)||{}).glu??'—')],['kidney','гематокрит '+((last(p.cbc)||{}).hct??'—')+' %'],['eyes','без жалоб']].map(([k,t])=>`<tr><td>${ANAT_PARTS.org[k]}</td><td class="sm mu">${t}</td><td>${tag(st.org[k])}</td></tr>`).join('')}</table>
      <div class="note p">Мозг на модели окрашен по психологическому индексу: психика здесь главный показатель.</div>${partInfo(p,st,'org',sel)}</div>`}
  return`<div class="card"><h2>Всё тело</h2><p class="sm mu">Все системы вместе. Красные и оранжевые участки требуют внимания. Выберите систему кнопками на модели.</p>${partInfo(p,st,null,sel)}</div>`}
function partInfo(p,st,sys,pt){if(!pt)return'';const S=sys||['skel','mus','vess','org'].find(k=>pt in ANAT_PARTS[k]);if(!S||!(pt in ANAT_PARTS[S]))return'';const m={skel:st.bone,mus:st.mus,vess:st.vess,org:st.org}[S],w=last(p.well),pn=w&&w.pain.find(x=>x.pt===pt);
  return`<div class="note" style="margin-top:.8rem"><div class="row sp"><b>${ANAT_PARTS[S][pt]}</b>${tag(m[pt]||0)}</div>${pn?`<span class="sm">Жалоба: боль ${pn.lv}/10 по последнему опросу.</span>`:''}${S==='mus'?`<span class="sm"> Сила ${p.str[pt]} %. ${(EX[pt]||[]).map(x=>x[0]+' '+x[1]).join(', ')}</span>`:''}</div>`}
function tWell(p){const w=last(p.well),T=today(),s=chk(p,CHK[2]),cur=C.draft&&C.draft.id===p.id?C.draft:(C.draft={id:p.id,pain:[]});
  return`<div class="g2 n"><div class="v3d" id="v3d"><div class="ov"><span class="badge b1" style="background:rgba(6,10,18,.8)">Нажмите на место, где болит или есть дискомфорт</span></div><div class="leg">${tag(0,'1–3')}${tag(1,'4–6')}${tag(2,'7–10')}</div></div>
    <form class="card" data-form="well"><div class="row sp"><h2>Самочувствие и психика</h2>${tag(s.s,s.s===0?'сдано':s.txt)}</div><p class="sm mu">Два раза в неделю: ${CHK[2].when}. Последний опрос: ${w?hd(w.date):'—'}. Ответы видят только вы, врач и психолог экипажа.</p>
      <h3 style="color:var(--psy)">☯ Психика</h3><div class="bars">${PSYF.map(([k,n,sg])=>`<label class="bar"><span>${n}</span><input type="range" min="1" max="10" id="w_${k}" value="${w?w[k]:5}"><b class="mono" id="wv_${k}">${w?w[k]:5}</b></label>`).join('')}</div>
      <h3 style="margin-top:.8rem">Тело</h3><div class="fg"><label>Энергия, 1–10<input type="number" min="1" max="10" id="w_energy" value="${w?w.energy:6}"></label><label>Сон, часов<input type="number" step=".5" id="w_sleep" value="${w?w.sleep:7}"></label></div>
      <h3 style="margin-top:.8rem">Где болит</h3><div class="chipz">${[['skull','Голова'],['spine','Шея и позвоночник'],['back','Спина'],['quads','Бёдра'],['calves','Икры'],['shin','Голени'],['delts','Плечи'],['abs','Живот'],['chest','Грудь']].map(([k,n])=>`<button type="button" data-addpain="${k}">+ ${n}</button>`).join('')}</div>
      <ul class="exl" id="painL" style="margin-top:.5rem"></ul>
      <label class="sm" style="display:block;margin-top:.6rem">Что беспокоит (необязательно)<textarea id="w_note"></textarea></label>
      <button class="pri" style="margin-top:.6rem">Отправить опрос · +${CHK[2].pts} очков</button></form></div>`}
function painList(){const d=C.draft;$('#painL').innerHTML=d.pain.map((x,i)=>{const S=['skel','mus','vess','org'].find(k=>x.pt in ANAT_PARTS[k]);return`<li><span>${ANAT_PARTS[S][x.pt]}</span><input type="range" min="1" max="10" value="${x.lv}" data-plv="${i}" style="max-width:150px"><b class="mono">${x.lv}</b><button type="button" data-pdel="${i}">✕</button></li>`}).join('')||'<li class="mu sm">Ничего не болит — отлично.</li>';
  vwSet({sys:'pain',colors:null,pain:d.pain})}
function tFood(p){const n=nutrition(p),k=n.prot*4+n.fat*9+n.carb*4,seg=[[n.prot*4,'#ff8a65','Белки'],[n.fat*9,'#ffb224','Жиры'],[n.carb*4,'#69a8ff','Углеводы']];let a0=0;
  const arcs=seg.map(([v,c])=>{const a1=a0+v/k*Math.PI*2,r=55,p0=[70+r*Math.sin(a0),70-r*Math.cos(a0)],p1=[70+r*Math.sin(a1),70-r*Math.cos(a1)],s=`<path d="M${p0[0]} ${p0[1]} A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${p1[0]} ${p1[1]}" stroke="${c}" stroke-width="22" fill="none"/>`;a0=a1;return s}).join('');
  const meals=[['Завтрак',.25],['Обед',.35],['Перекус',.1],['Ужин',.3]];
  return`<div class="g2"><div class="card"><h2>Норма на ${hd(today())}</h2><p class="sm mu">Расчёт по формуле Миффлина — Сан Жеора с поправкой на нагрузку и последние анализы.</p>
      <div class="macro"><svg viewBox="0 0 140 140">${arcs}<text x="70" y="70" text-anchor="middle" fill="#e9eff7" font-size="22" font-weight="800" font-family="monospace">${n.kcal}</text><text x="70" y="88" text-anchor="middle" fill="#8b9cb3" font-size="11">ккал</text></svg>
      <div class="bars" style="flex:1;min-width:200px">${barRow('Белки',n.prot,n.prot+n.fat+n.carb,'#ff8a65',n.prot+' г')}${barRow('Жиры',n.fat,n.prot+n.fat+n.carb,'#ffb224',n.fat+' г')}${barRow('Углеводы',n.carb,n.prot+n.fat+n.carb,'#69a8ff',n.carb+' г')}${barRow('Вода',n.water,4,'#3ad6a6',fx(n.water,1)+' л')}</div></div>
      <table style="margin-top:.6rem"><tr><th>Приём</th><th>ккал</th><th>Б</th><th>Ж</th><th>У</th></tr>${meals.map(([m,f])=>`<tr><td>${m}</td><td class="mono">${Math.round(n.kcal*f)}</td><td class="mono">${Math.round(n.prot*f)}</td><td class="mono">${Math.round(n.fat*f)}</td><td class="mono">${Math.round(n.carb*f)}</td></tr>`).join('')}</table></div>
    <div class="card"><h2>Поправки по анализам</h2>${n.notes.map(([c,s])=>`<div class="note ${c}">${s}</div>`).join('')||'<div class="note">Анализы в норме: стандартный рацион миссии.</div>'}</div></div>`}
function tTrain(p){const pl=plan(p),dn=pl.filter(x=>x.done).length;
  return`<div class="g2 w"><div class="card"><div class="row sp"><h2>План на сегодня</h2><span class="mono">${dn}/${pl.length}</span></div><p class="sm mu">Составлен по силе мышц, плотности костей, риску тромбоза и карте боли. За каждое упражнение +5 очков.</p>
      <ul class="exl">${pl.map((x,i)=>`<li class="${x.done?'dn':''}"><span>${tag(x.lv,'')} <b>${x.n}</b> <span class="mono sm">${x.d}</span><br><small>${x.part}: ${x.why}</small></span>${x.done?'<span class="st st0"><i></i>сделано</span>':`<button data-tr="${i}">Сделал</button>`}</li>`).join('')}</ul></div>
    <div class="card"><h2>Неделя</h2><table>${['пн','вт','ср','чт','пт','сб','вс'].map((d,i)=>`<tr><td>${d}</td><td class="sm">${['Ноги и ягодицы + прыжки','Спина и пресс','Кардио 30 мин + психолог','Грудь, плечи, руки','Ноги (осевая нагрузка), ОАК натощак до тренировки','Кардио и растяжка','Отдых, прогулка, звонок домой'][i]}</td></tr>`).join('')}</table>
      <canvas class="chart" id="trCh" style="height:150px;margin-top:.6rem"></canvas><p class="sm mu">Тренировок за неделю: ${p.train.filter(x=>x.date>addD(today(),-7)).length}</p></div></div>`}

function afterP(p,tab){const a=admit(p),st=a.st;VW.pulse=(last(p.vit)||{}).pulse||62;VW.selPt=C.selPt;
  const all=Object.assign({},st.bone,st.mus,st.vess,st.org);
  if(tab==='over'||!tab){if(vwMount($('#v3d')))vwSet({sys:'all',colors:all,pain:[],pick:u=>{C.selPt=u.pt;C.sys=u.sys;go(`#/p/${p.id}/body`)}})}
  if(tab==='body'){const s=C.sys||'skel';if(vwMount($('#v3d')))vwSet({sys:s,colors:all,pain:(last(p.well)||{pain:[]}).pain,pick:u=>{C.selPt=VW.selPt=u.pt;if(s!=='all'&&u.sys!==s)return;$('#sysPanel').innerHTML=sysPanel(p,st,s);sysCharts(p,s)}});sysCharts(p,s)}
  if(tab==='well'){if(vwMount($('#v3d'))){painList();VW.pick=u=>{if(!C.draft.pain.some(x=>x.pt===u.pt))C.draft.pain.push({pt:u.pt,lv:4});painList()}}else painList()}
  if(tab==='psy'){const ws=p.well.slice(-20);chart($('#psyCh'),[{c:'#b99cff',pts:ws.map(w=>[dt(w.date),psyIdx(w)])},{c:'#ff5f4c',pts:ws.map(w=>[dt(w.date),w.stress*10])},{c:'#3ad6a6',pts:ws.map(w=>[dt(w.date),w.mood*10])}],{lo:0,hi:100,bands:[[0,45,'rgba(255,95,76,.07)']]})}
  if(tab==='train'){const T=today(),d=[...Array(14)].map((_,i)=>addD(T,-13+i));chart($('#trCh'),[{c:'#3ad6a6',pts:d.map(x=>[dt(x),p.train.filter(t=>t.date===x).length])}],{lo:0,hi:4})}}
function sysCharts(p,s){if(s==='skel'){const c=['#e9e3d3','#ff8a65','#69a8ff','#3ad6a6'];chart($('#boneCh'),Object.keys(BONE).map((k,i)=>({c:c[i],pts:p.dexa.map(d=>[dt(d.date),d.t[k]])})),{d:1,bands:[[-9,-2.5,'rgba(255,95,76,.08)'],[-2.5,-1,'rgba(255,178,36,.07)']]})}
  if(s==='mus')chart($('#strCh'),[{c:'#ff8a65',pts:p.strHist.map(x=>[dt(x.date),x.v])}],{bands:[[0,80,'rgba(255,95,76,.07)']]});
  if(s==='vess'){const v=p.vit.slice(-21);chart($('#bpCh'),[{c:'#ff5f4c',pts:v.map(x=>[dt(x.date),x.sys])},{c:'#69a8ff',pts:v.map(x=>[dt(x.date),x.dia])},{c:'#3ad6a6',pts:v.map(x=>[dt(x.date),x.pulse])}],{bands:[[140,200,'rgba(255,95,76,.07)']]})}}

function vRating(){const L=[...C.crew].map(p=>({p,pt:points(p),a:admit(p)})).sort((x,y)=>y.pt-x.pt);
  return`<div class="phead"><div><h1>Рейтинг экипажа</h1><span class="mu">Очки за чекапы вовремя, опросы самочувствия, беседы с психологом, тренировки и дыхательные практики. Просрочка: −40 очков.</span></div></div>
  <div class="g2 w"><div class="card"><table class="lead"><tr><th>#</th><th>Сотрудник</th><th>Уровень</th><th>Очки</th><th>☯</th><th>Допуск</th></tr>${L.map((x,i)=>`<tr><td>${i+1}</td><td><a href="#/p/${x.p.id}" class="row" style="color:var(--tx);flex-wrap:nowrap">${ava(x.p)}<span><b>${esc(x.p.name)}</b><br><span class="sm mu">${esc(x.p.role)}</span></span></a></td><td class="mono">${level(x.pt).l}</td><td class="mono">${x.pt}</td><td class="psy">${x.a.st.pi}</td><td><span class="badge b${x.a.lv}">${ADM[x.a.lv]}</span></td></tr>`).join('')}</table></div>
    <div class="card"><h2>Как заработать очки</h2><table>${CHK.map(c=>`<tr><td>${c.ic} ${c.n}</td><td class="mono">+${c.pts}</td></tr>`).join('')}<tr><td>💪 Упражнение из плана</td><td class="mono">+5</td></tr><tr><td>🌬 Дыхательная практика</td><td class="mono">+3</td></tr><tr><td>⛔ Просроченный чекап</td><td class="mono" style="color:var(--bad)">−40</td></tr></table>
      <h3 style="margin-top:1rem">Командный зачёт психики</h3><p class="sm mu">Если у всего экипажа индекс психики выше 62 целую неделю, каждый получает значок «Командный дух».</p></div></div>`}
function vSched(){const T=today(),days=[...Array(14)].map((_,i)=>addD(T,i));
  return`<div class="phead"><div><h1>График обязательных чекапов</h1><span class="mu">Две недели вперёд. Пропуск = недопуск к работе до внесения результата.</span></div></div>
  <div class="card" style="overflow:auto"><table class="sched"><tr><th>Чекап</th>${days.map(d=>`<th style="text-align:center">${WD[wd(d)]}<br>${hd(d)}</th>`).join('')}</tr>
  ${CHK.map(c=>`<tr><td>${c.ic} ${c.n}<br><span class="sm mu">${c.when}</span></td>${days.map(d=>{const due=c.daily||(c.wd&&c.wd.includes(wd(d)));
    const ev=c.every?C.crew.filter(p=>chk(p,c).next===d).length:0;return`<td style="text-align:center">${due?'●':ev?`<span class="mono sm">${ev} чел.</span>`:''}</td>`}).join('')}</tr>`).join('')}</table></div>
  <div class="card" style="margin-top:1rem"><h2>Статус по сотрудникам</h2><table><tr><th>Сотрудник</th>${CHK.map(c=>`<th title="${c.n}">${c.ic}</th>`).join('')}<th>Допуск</th></tr>${C.crew.map(p=>`<tr><td><a href="#/p/${p.id}/chk">${esc(p.name)}</a></td>${CHK.map(c=>{const s=chk(p,c);return`<td title="${c.n}: ${s.txt||'пройден'}"><span class="st st${s.s}"><i></i></span></td>`}).join('')}<td><span class="badge b${admit(p).lv}">${ADM[admit(p).lv]}</span></td></tr>`).join('')}</table></div>`}

/* ---------- события ---------- */
document.addEventListener('click',e=>{const t=e.target.closest('button,[data-staff]');if(!t)return;const p=route.v==='p'?P(route.id):null;
  if(t.matches('[data-staff]')||t.id==='staffBtn')return drawer(true);
  if(t.dataset.p){drawer(false);return go('#/p/'+t.dataset.p)}
  if(t.dataset.f){C.filt=t.dataset.f;return rStaff()}
  if(t.dataset.sys){C.sys=t.dataset.sys;C.selPt=null;return render()}
  if(t.dataset.tr!=null&&p){const x=plan(p)[+t.dataset.tr];p.train.push({date:today(),pt:x.k,n:x.n});save();toast('+5 очков: '+x.n);return render()}
  if(t.dataset.addpain){if(!C.draft.pain.some(x=>x.pt===t.dataset.addpain))C.draft.pain.push({pt:t.dataset.addpain,lv:4});return painList()}
  if(t.dataset.pdel!=null){C.draft.pain.splice(+t.dataset.pdel,1);return painList()}
  const act=t.dataset.act;if(!act||!p)return;
  if(act==='psyDone'){if(!p.psy.some(x=>x.date===today()))p.psy.push({date:today(),note:''});save();toast('Беседа с психологом отмечена');render()}
  if(act==='psyReq'){toast('Запрос отправлен психологу экипажа. С вами свяжутся сегодня.')}
  if(act==='breath'){const b=$('#br'),btn=$('#brBtn');btn.disabled=true;let n=0;const ph=[['Вдох · 4',4,1.35],['Задержка · 7',7,1.35],['Выдох · 8',8,1]];
    const step=()=>{if(!document.body.contains(b))return;if(n>=ph.length*3){b.textContent='Готово';b.style.transform='scale(1)';p.breath=(p.breath||0)+1;save();toast('+3 очка за дыхательную практику');btn.disabled=false;return}
      const [txt,s,k]=ph[n%3];b.textContent=txt;b.style.transitionDuration=s+'s';b.style.transform=`scale(${k})`;n++;setTimeout(step,s*1000*(C.fast?.05:1))};step()}});
document.addEventListener('input',e=>{const t=e.target;if(t.id&&t.id.startsWith('w_')&&$('#wv_'+t.id.slice(2)))$('#wv_'+t.id.slice(2)).textContent=t.value;
  if(t.dataset.plv!=null){C.draft.pain[+t.dataset.plv].lv=+t.value;t.nextElementSibling.textContent=t.value;vwSet({pain:C.draft.pain})}
  if(t.id==='staffQ')rStaff()});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();const p=P(route.id),T=today(),num=id=>{const v=parseFloat(($('#'+id)||{}).value);return isNaN(v)?null:v},k=f.dataset.form;
  const put=(arr,rec)=>{const i=arr.findIndex(x=>x.date===T);if(i>=0)arr[i]=rec;else arr.push(rec)};
  if(k==='cbc'){const r={date:T};for(const x in REF){r[x]=num('f_'+x);if(r[x]==null)return toast('Заполните: '+REF[x].n)}put(p.cbc,r)}
  if(k==='vit'){const r={date:T};for(const x of['sys','dia','pulse','spo2','wt']){r[x]=num('f_'+x);if(r[x]==null)return toast('Заполните все поля')}put(p.vit,r)}
  if(k==='bio'){const r={date:T};for(const x in BREF){r[x]=num('f_'+x);if(r[x]==null)return toast('Заполните: '+BREF[x].n)}put(p.bio,r)}
  if(k==='dexa'){const r={date:T,t:{}};for(const x in BONE){r.t[x]=num('f_t_'+x);if(r.t[x]==null)return toast('Заполните все участки')}put(p.dexa,r)}
  if(k==='well'){const r={date:T,pain:C.draft.pain.slice(),note:$('#w_note').value,energy:num('w_energy')||5,sleep:num('w_sleep')||7};PSYF.forEach(([x])=>r[x]=+$('#w_'+x).value);put(p.well,r);C.draft={id:p.id,pain:[]}}
  save();toast('Сохранено. Допуск и рекомендации пересчитаны.');render()});
$('#drawerX').onclick=()=>drawer(false);$('#shade').onclick=()=>drawer(false);addEventListener('keydown',e=>{if(e.key==='Escape')drawer(false)});
$('#simNext').onclick=()=>{C.off=(C.off||0)+1;save();render();toast('Новый день: '+hd(today()))};
$('#simReset').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}C=null;load();save();render();toast('Демо-данные восстановлены')};
addEventListener('hashchange',parse);
load();parse();
