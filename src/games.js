/* ===== Mission Games: игровой центр. Опыт, уровни, награды. Без штрафов: пропуски ничего не отнимают ===== */
Object.assign(U,{
h_today:['Сегодня: главное','Today at a glance'],nav_games:['Mission Games','Mission Games'],nav_earth:['Family Connection','Family Connection'],
gm_title:['Mission Games','Mission Games'],gm_sub:['Короткие игры, которые поддерживают тело и настроение. Пропустили день? Ничего не сгорает: опыт и растения остаются с вами.','Short games that support body and mood. Missed a day? Nothing is lost: your XP and plants stay with you.'],
gm_lvl:['Уровень','Level'],gm_xp:['XP','XP'],gm_next:['до уровня {0}: {1} XP','{1} XP to level {0}'],gm_ach:['Достижения','Achievements'],gm_play:['Играть','Play'],gm_stage:['Игровой модуль','Game module'],
gm_lvlup:['Новый уровень: {0}! Отличная работа.','Level up: {0}! Great work.'],gm_got:['Награда: {0}','Award: {0}'],gm_plus:['+{0} XP: {1}','+{0} XP: {1}'],gm_none:['Пока без наград. Первая уже близко.','No awards yet. The first one is close.'],
g_breath:['Cosmic Breathing','Cosmic Breathing'],g_garden:['Space Garden','Space Garden'],g_memory:['Memory Universe','Memory Universe'],g_earthmem:['Earth Memories','Earth Memories'],g_crew:['Crew Mission','Crew Mission'],
gd_breath:['Звезда расширяется и сжимается в ритме дыхания','A star expands and contracts with your breath'],gd_garden:['Растения растут от полезных привычек','Plants grow from healthy habits'],
gd_memory:['Запомните последовательность планет','Remember the sequence of planets'],gd_earthmem:['Тёплые места Земли и семейные фото','Warm places on Earth and family photos'],gd_crew:['Ежедневные задания экипажа','Daily crew tasks'],
br_dur:['Длительность','Duration'],br_cycles:['5 циклов','5 cycles'],br_min:['{0} мин','{0} min'],br_left:['осталось {0}','{0} left'],
gp_sleep:['Сон','Sleep'],gp_breath:['Дыхание','Breathing'],gp_water:['Вода','Water'],gp_crew:['Миссия','Mission'],gp_note:['Каждое растение растёт от своей привычки и никогда не вянет.','Each plant grows from its own habit and never wilts.'],
mm_pairs:['Пары','Pairs'],mm_seq:['Последовательность','Sequence'],mm_lvl:['Сложность','Difficulty'],mm_start:['Начать','Start'],mm_watch:['Смотрите на планеты…','Watch the planets…'],
mm_your:['Ваша очередь: {0} из {1}','Your turn: {0} of {1}'],mm_round:['Раунд {0} из 3','Round {0} of 3'],mm_again:['Почти! Посмотрим ещё раз, спокойно.','Almost! Let us watch it again, calmly.'],mm_win:['Последовательность пройдена!','Sequence complete!'],mm_best:['Лучший уровень: {0}','Best level: {0}'],
em_note:['Выберите место и выполните маленькое тёплое задание. Фото семьи появляются здесь автоматически.','Pick a place and do a small warm task. Family photos appear here automatically.'],
em_done:['Вспомнил','Remembered'],em_today:['сегодня уже','done today'],em_nophoto:['Добавьте семейные фото в Family Connection, и они появятся на этих местах.','Add family photos in Family Connection and they will appear in these places.'],
cm_note:['Отмечайте, что получилось сегодня. Не получилось — тоже нормально: завтра будет новый список.','Tick what worked today. If something did not, that is fine: tomorrow brings a new list.'],
cm_all:['Все задания сола выполнены! +20 XP','All tasks of the sol done! +20 XP'],cm_map:['Открыть карту целей','Open the goal map'],cm_best:['Лучшая серия: {0}','Best streak: {0}'],
mind_games:['Игры для разгрузки переехали в Mission Games: дыхание, сад, память, Земля и задания экипажа.','Relief games moved to Mission Games: breathing, garden, memory, Earth and crew tasks.'],mind_go:['Открыть Mission Games','Open Mission Games']});
const CM=[['move','🤸',['Зарядка 10 минут','10-minute workout']],['sleep','🌙',['Лечь вовремя','Go to bed on time']],['measure','❤',['Утренние измерения','Morning measurements']],
  ['rest','☕',['Отдых без экрана 15 минут','15 minutes of screen-free rest']],['talk','💬',['Поговорить с экипажем или семьёй','Talk to the crew or family']]];
const EM=[{id:'home',ic:'🏡',c:['#E5B96B','#8B5E3C'],n:['Родной дом','Home'],q:[['Вспомните запах кухни дома. Что там готовили?','Recall the smell of the kitchen at home. What was cooking?'],['Кто первым встретит вас дома?','Who will greet you first at home?']]},
  {id:'sea',ic:'🌊',c:['#39BDEB','#0B3D91'],n:['Море','The sea'],q:[['Представьте шум волн. С кем вы были у моря?','Imagine the sound of waves. Who were you with at the sea?'],['Вспомните самую тёплую воду в жизни.','Recall the warmest water of your life.']]},
  {id:'mount',ic:'🏔',c:['#8B83F6','#2B3A67'],n:['Горы','Mountains'],q:[['Вспомните прохладный горный воздух. Сделайте медленный вдох.','Recall the cool mountain air. Take a slow breath.'],['Куда вы пойдёте в поход после миссии?','Where will you hike after the mission?']]},
  {id:'park',ic:'🌳',c:['#47C9A2','#1E5B4A'],n:['Парк у дома','Park nearby'],q:[['Какое дерево вы помните лучше всего?','Which tree do you remember best?'],['Напишите, кому вы позвоните первым после посадки.','Write who you will call first after landing.']]},
  {id:'city',ic:'🌃',c:['#FF8A65','#3A1F5C'],n:['Огни города','City lights'],q:[['Вспомните любимую улицу вечером.','Recall your favourite street in the evening.'],['Какое кафе вы посетите первым?','Which café will you visit first?']]}];
function gS(){if(S.xp==null)S.xp=0;S.ach=S.ach||{};S.crewT=S.crewT||{};S.emem=S.emem||{};S.seqBest=S.seqBest||0;S.xpLog=S.xpLog||[];return S}
const gLvl=x=>({l:Math.floor(x/200)+1,pr:x%200});
const ACH=[['first','🌟',['Первый шаг','First step'],()=>S.xp>=10],['breath','🌬',['Мастер дыхания','Breath master'],()=>S.gBreath>=5],['garden','🌸',['Цветущий сад','Blooming garden'],()=>gardenScore().total>=10],
  ['memory','🪐',['Память вселенной','Universe memory'],()=>S.seqBest>=3],['crew','🚀',['День экипажа','Crew day'],()=>Object.values(S.crewT).some(d=>CM.every(([k])=>d[k]))],
  ['earth','🌍',['Тёплые воспоминания','Warm memories'],()=>Object.keys(S.emem).length>=3],['family','💛',['Связь с домом','Link to home'],()=>S.people.some(p=>MEDIA['photo:'+p.id])],['xp1000','🏆',['1000 XP','1000 XP'],()=>S.xp>=1000]];
function addXP(n,why){gS();const before=gLvl(S.xp).l;S.xp+=n;S.xpLog.push({sol:solNow(),n,why});if(S.xpLog.length>40)S.xpLog.shift();
  if(typeof SFX!=='undefined')SFX.success();toast(t('gm_plus',n,why));const after=gLvl(S.xp).l;if(after>before)setTimeout(()=>toast(t('gm_lvlup',after)),900);
  ACH.forEach(([id,ic,n2,ok])=>{if(!S.ach[id]&&ok()){S.ach[id]=solNow();setTimeout(()=>toast(t('gm_got',ic+' '+tx(n2))),1700)}});save()}
function rGames(){gS();ACH.forEach(([id,,,ok])=>{if(!S.ach[id]&&ok())S.ach[id]=solNow()});const L=gLvl(S.xp);
  $('#gmHead').innerHTML=`<div class="gmTop"><div>${FX.ring(L.pr/200,'#E5B96B',L.l,t('gm_lvl'))}</div><div class="gmTxt"><span class="lbl">${t('gm_stage')}</span><h2>${t('gm_title')}</h2><p class="mu">${t('gm_sub')}</p>
    <div class="gmXP"><b class="mono">${S.xp}</b> XP <span class="mu sm">· ${t('gm_next',L.l+1,200-L.pr)}</span></div></div>
    <div class="gmAch"><span class="lbl">${t('gm_ach')}</span><div class="achs">${ACH.map(([id,ic,n])=>`<span class="ach ${S.ach[id]?'on':''}" data-tip="${esc(tx(n))}">${ic}</span>`).join('')}</div></div></div>`;
  const G=[['breath','#8B83F6',`${S.gBreath} ×`],['garden','#47C9A2',gardenScore().total+' 🌱'],['memory','#39BDEB',t('mm_best',S.seqBest||0)],['earthmem','#E5B96B',Object.keys(S.emem).length+' / '+EM.length],['crew','#FF8A65',crewDone()+' / '+CM.length]];
  $('#gmGrid').innerHTML=G.map(([g,c,st])=>`<button class="gcard ${curGame===g?'sel':''}" data-g="${g}" style="--gc:${c}"><span class="gprev gp-${g}" aria-hidden="true"><i></i><i></i><i></i></span><b>${t('g_'+g)}</b><small>${t('gd_'+g)}</small><em class="mono">${st}</em></button>`).join('');
  FX.ringsGo($('#gmHead'));
  if(curGame==='garden')drawGarden();if(curGame==='memory'){if(Mem.mode==='seq')rSeq();else{if(!Mem.cards.length)memNew();rMem()}}if(curGame==='earthmem')rEarthMem();if(curGame==='crew')rCrew();
  if(typeof spSuggest==='function')spSuggest(curGame==='breath'?'med':curGame==='earthmem'?'earth':curGame==='memory'?'focus':null)}
/* ---- Cosmic Breathing: звезда и таймер ---- */
function ringR(v){$('#ringC').setAttribute('r',v);const s=(v/52).toFixed(3),st=$('#bStar');if(st)st.setAttribute('transform',`translate(85 85) scale(${s})`)}
function brTimer(el,per){const tt=$('#bTimer');if(!tt)return;const left=Math.max(0,B.total*per-el);tt.textContent=t('br_left',Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0'))}
/* ---- Space Garden: четыре растения, рост с анимацией ---- */
const GR={h:[0,0,0,0],raf:0};
function gardenParts(){const g=gardenScore(),cm=Object.values(S.crewT||{}).reduce((s,d)=>s+Object.keys(d).length,0);return[[g.sl,7,'gp_sleep','#8B83F6'],[S.gBreath,8,'gp_breath','#39BDEB'],[S.gWater,8,'gp_water','#47C9A2'],[cm,10,'gp_crew','#E5B96B']]}
function drawGarden(){const c=$('#gardenCv');if(!c||!c.clientWidth)return;const P=gardenParts(),tgt=P.map(([v,m])=>clamp(v/m,0,1)),t0=performance.now(),from=GR.h.slice();cancelAnimationFrame(GR.raf);
  const step=now=>{const k=FX.reduce?1:clamp((now-t0)/900,0,1),e=1-Math.pow(1-k,3);GR.h=from.map((f,i)=>f+(tgt[i]-f)*e);paintGarden(c,P);if(k<1)GR.raf=requestAnimationFrame(step)};GR.raf=requestAnimationFrame(step);
  const g=gardenScore(),stage=t(g.total>=13?'gs_fruit':g.total>=10?'gs_bloom':g.total>=5?'gs_leaf':'gs_sprout');
  $('#gInfo').innerHTML=`<b>${stage}.</b> ${t('g_info',g.total,g.sl,S.gBreath,S.gWater)} <span class="mu">${t('gp_note')}</span>`;$('#gWater').disabled=S.energy<5}
function paintGarden(c,P){const w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(c.width!==w*dpr){c.width=w*dpr;c.height=h*dpr}const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
  const bg=x.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#0B1830');bg.addColorStop(1,'#060A14');x.fillStyle=bg;x.fillRect(0,0,w,h);
  x.strokeStyle='rgba(57,189,235,.12)';x.lineWidth=1;for(let i=0;i<5;i++){x.beginPath();x.arc(w/2,h*1.6,h*(1.05+i*.18),Math.PI*1.15,Math.PI*1.85);x.stroke()}
  const tt=performance.now()/1000;P.forEach(([v,m,lab,col],i)=>{const cx=w*(i+.5)/4,by=h-38,H=14+GR.h[i]*(h-110),sway=Math.sin(tt*.8+i)*3;
    const glow=x.createRadialGradient(cx,by-H*.6,0,cx,by-H*.6,70);glow.addColorStop(0,col+'33');glow.addColorStop(1,col+'00');x.fillStyle=glow;x.fillRect(cx-70,by-H*.6-70,140,140);
    x.fillStyle='rgba(120,160,220,.18)';x.beginPath();x.moveTo(cx-30,by);x.lineTo(cx+30,by);x.lineTo(cx+22,by+24);x.lineTo(cx-22,by+24);x.fill();x.fillStyle='#4a3326';x.fillRect(cx-28,by-4,56,6);
    x.strokeStyle=col;x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(cx,by-2);x.quadraticCurveTo(cx+10+sway,by-H*.5,cx+sway,by-H);x.stroke();
    const n=Math.round(GR.h[i]*8);for(let j=0;j<n;j++){const q=(j+1)/(n+1),px=cx+sway*q+5*Math.sin(q*3),py=by-H*q,sd=j%2?1:-1,L=9+7*(1-q);x.fillStyle=col;x.globalAlpha=.85;x.beginPath();x.ellipse(px+sd*L*.8,py-3,L,4.5,sd*-.5,0,7);x.fill();x.globalAlpha=1}
    if(GR.h[i]>.7){x.fillStyle='#fff';for(let k=0;k<5;k++){x.beginPath();x.ellipse(cx+sway+Math.cos(k*1.26)*7,by-H-4+Math.sin(k*1.26)*7,5,3,k*1.26,0,7);x.fill()}x.fillStyle='#E5B96B';x.beginPath();x.arc(cx+sway,by-H-4,3.5,0,7);x.fill()}
    x.fillStyle='#EAF1FB';x.font='600 12px Manrope,system-ui,sans-serif';x.textAlign='center';x.fillText(t(lab),cx,h-8);x.fillStyle='#8EA0BC';x.font='11px Manrope,system-ui,sans-serif';x.fillText(Math.min(v,m)+' / '+m,cx,by+38>h-12?h-22:by+38)})}
/* ---- Memory Universe: последовательность планет ---- */
Mem.mode=Mem.mode||'seq';Mem.lvl=1;const SQ={seq:[],pos:0,round:0,busy:false,on:false};
const PLN=['#39BDEB','#47C9A2','#8B83F6','#E5B96B','#FF8A65','#F06292','#7FDBFF','#B0BEC5'];
function rSeq(){const n=Math.min(4+Mem.lvl,9),box=$('#seqBox');if(!box)return;
  box.innerHTML=`<div class="orbit" style="--n:${n}">${[...Array(n)].map((_,i)=>`<button class="pl" data-pl="${i}" style="--pc:${PLN[i%PLN.length]};--a:${(i/n*360).toFixed(1)}deg" aria-label="${t('g_memory')} ${i+1}"></button>`).join('')}<span class="sun"></span></div>`;
  $('#seqStat').textContent=SQ.on?(SQ.busy?t('mm_watch'):t('mm_your',SQ.pos+1,SQ.seq.length)):t('mm_best',S.seqBest||0)}
function seqStart(){SQ.on=true;SQ.round=1;seqRound()}
function seqRound(){const n=Math.min(4+Mem.lvl,9);SQ.seq=[...Array(1+Mem.lvl+SQ.round)].map(()=>Math.floor(Math.random()*n));SQ.pos=0;seqShow()}
function seqShow(){SQ.busy=true;rSeq();$('#seqRound').textContent=t('mm_round',SQ.round);const d=Math.max(380,820-Mem.lvl*80);
  SQ.seq.forEach((p,i)=>setTimeout(()=>{const b=document.querySelector(`[data-pl="${p}"]`);if(b){b.classList.add('lit');if(typeof SFX!=='undefined')SFX.tone(330+p*70,.3,.03);setTimeout(()=>b.classList.remove('lit'),d*.6)}},400+i*d));
  setTimeout(()=>{SQ.busy=false;rSeq()},400+SQ.seq.length*d)}
function seqTap(i){if(!SQ.on||SQ.busy)return;const b=document.querySelector(`[data-pl="${i}"]`);b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),220);
  if(typeof SFX!=='undefined')SFX.tone(330+i*70,.25,.03);
  if(i!==SQ.seq[SQ.pos]){toast(t('mm_again'));setTimeout(seqShow,700);SQ.pos=0;return}
  SQ.pos++;if(SQ.pos<SQ.seq.length){$('#seqStat').textContent=t('mm_your',SQ.pos+1,SQ.seq.length);return}
  if(SQ.round<3){SQ.round++;setTimeout(seqRound,600);return}
  SQ.on=false;S.seqBest=Math.max(S.seqBest||0,Mem.lvl);S.mem.push({sol:solNow(),moves:SQ.seq.length,sec:0,seq:Mem.lvl});addXP(10*Mem.lvl,t('g_memory'));toast(t('mm_win'));rGames()}
function memMode(m){Mem.mode=m;$$('[data-mm]').forEach(b=>b.classList.toggle('sel',b.dataset.mm===m));$('#memPairs').hidden=m!=='pairs';$('#memSeq').hidden=m!=='seq';if(m==='pairs'){if(!Mem.cards.length)memNew();rMem()}else rSeq()}
/* ---- Earth Memories ---- */
function rEarthMem(){const ph=S.people.filter(p=>MEDIA['photo:'+p.id]),sol=solNow();
  $('#emGrid').innerHTML=EM.map((p,i)=>{const done=S.emem[p.id]===sol,q=tx(p.q[(sol+i)%p.q.length]),who=ph.length?ph[i%ph.length]:null;
    return`<div class="emc ${done?'dn':''}" style="--c1:${p.c[0]};--c2:${p.c[1]}"><div class="emPic">${who?`<img src="${MEDIA['photo:'+who.id]}" alt="">`:`<span>${p.ic}</span>`}</div>
      <div class="emTxt"><b>${p.ic} ${esc(tx(p.n))}</b><p>${esc(q)}</p>${who?`<small>${esc(tx(who.name))}</small>`:''}</div>
      <button class="${done?'ghost':'gold'}" data-em="${p.id}" ${done?'disabled':''}>${done?'✓ '+t('em_today'):t('em_done')+' · +10 XP'}</button></div>`}).join('');
  $('#emHint').innerHTML=ph.length?'':FX.empty('📷',t('g_earthmem'),t('em_nophoto'),`<button data-go="earth">${t('nav_earth')}</button>`)}
/* ---- Crew Mission ---- */
const crewDone=()=>Object.keys((S.crewT||{})[solNow()]||{}).length;
function crewStreak(){let best=0,cur=0;const sols=Object.keys(S.crewT).map(Number).sort((a,b)=>a-b);let prev=null;sols.forEach(s=>{const full=CM.every(([k])=>S.crewT[s][k]);if(full){cur=prev===s-1?cur+1:1;prev=s;best=Math.max(best,cur)}});return best}
function rCrew(){const d=S.crewT[solNow()]||{};
  $('#crewList').innerHTML=CM.map(([k,ic,n])=>`<li class="${d[k]?'dn':''}"><button data-cm="${k}" aria-pressed="${!!d[k]}"><span class="cmI">${d[k]?'✓':ic}</span><span>${esc(tx(n))}</span><em>${d[k]?'+10 XP':''}</em></button></li>`).join('');
  $('#crewMeta').textContent=t('cm_best',crewStreak())}
function crewTap(k){const s=solNow(),d=S.crewT[s]=S.crewT[s]||{};if(d[k])return;d[k]=1;addXP(10,tx(CM.find(x=>x[0]===k)[2]));if(CM.every(([q])=>d[q])){addXP(20,t('g_crew'));toast(t('cm_all'))}rGames()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pl],[data-mm],[data-mlv],[data-em],[data-cm],#seqGo');if(!b||!$('#m-games').contains(b))return;
  if(b.dataset.pl!=null)seqTap(+b.dataset.pl);else if(b.dataset.mm)memMode(b.dataset.mm);else if(b.dataset.mlv){Mem.lvl=+b.dataset.mlv;SQ.on=false;$$('[data-mlv]').forEach(x=>x.classList.toggle('sel',x===b));rSeq()}
  else if(b.id==='seqGo')seqStart();else if(b.dataset.em){S.emem[b.dataset.em]=solNow();addXP(10,t('g_earthmem'));rGames()}else if(b.dataset.cm)crewTap(b.dataset.cm)});
