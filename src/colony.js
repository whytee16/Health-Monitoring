/* ===== «Ковчег»: стратегия о колонии последних выживших ===== */
const GROUPS=[{n:['Евразия','Eurasia'],c:[105,168,255]},{n:['Восточная Азия','East Asia'],c:[255,138,92]},{n:['Южная Азия','South Asia'],c:[255,209,102]},
  {n:['Африка','Africa'],c:[58,214,166]},{n:['Европа','Europe'],c:[192,140,255]},{n:['Америки','Americas'],c:[255,107,154]}];
const BR={med:['Медицина и среда','Medicine and habitat'],psy:['Психика','Mind'],soc:['Общество','Society']};
const UPG=[
  {id:'shelter',br:'med',cost:4,fx:{rad:.45},n:['Радиационное убежище','Radiation storm shelter'],d:['Толстые стены для вспышек. Радиация давит на здоровье почти вдвое слабее.','Thick walls for solar events. Radiation pressure on health nearly halves.']},
  {id:'gym',br:'med',cost:4,fx:{grav:.5},n:['Центрифуга и тренажёры','Centrifuge and exercise hall'],d:['Нагрузка для костей и мышц в чужой тяжести.','Loading for bone and muscle in alien gravity.']},
  {id:'lifesup',br:'med',cost:4,fx:{env:.5},n:['Резервное жизнеобеспечение','Redundant life support'],d:['Запасные фильтры, воздух и вода. Замкнутая среда перестаёт быть ловушкой.','Spare filters, air and water. The closed habitat stops being a trap.']},
  {id:'farm',br:'med',cost:4,fx:{food:1.1},n:['Гидропонные фермы','Hydroponic farms'],d:['Еда растёт на месте. Запасы перестают таять.','Food grows on site. Supplies stop shrinking.']},
  {id:'automed',br:'med',cost:6,fx:{med:1,rad:.15,grav:.15,env:.15,dist:.6},n:['Автономная медицина','Autonomous medicine'],d:['Диагностика и лечение без Земли: спросить больше некого.','Diagnosis and care without Earth: there is no one left to ask.']},
  {id:'garden',br:'psy',cost:3,fx:{psy:.5,food:.5},n:['Оранжерея','Greenhouse garden'],d:['Зелень, запах земли и немного свежей еды.','Greenery, the smell of soil, and some fresh food.']},
  {id:'private',br:'psy',cost:3,fx:{psy:.6},n:['Личные каюты','Private quarters'],d:['Место, где можно закрыть дверь. Теснота давит меньше.','A place with a door to close. Confinement weighs less.']},
  {id:'memorial',br:'psy',cost:4,fx:{grief:1.2,psy:.3},n:['Архив Земли и День памяти','Earth archive and Remembrance Day'],d:['Горе по утраченной планете проживают вместе, а не поодиночке.','Grief for the lost planet is lived through together, not alone.']},
  {id:'peers',br:'psy',cost:5,fx:{psy:.8,grief:.5},n:['Психологи и группы поддержки','Counsellors and peer groups'],d:['Каждого спрашивают, как он. Тревожную динамику замечают рано.','Everyone is asked how they are. Worrying trends are caught early.']},
  {id:'school',br:'soc',cost:4,fx:{uni:.34},n:['Общая школа и общий язык','Shared school and common language'],d:['Дети всех общин учатся вместе, родные языки сохраняются.','Children of all communities learn together; home languages are kept.']},
  {id:'crews',br:'soc',cost:3,fx:{uni:.24,food:.3},n:['Смешанные бригады','Mixed work crews'],d:['Люди из разных общин работают плечом к плечу.','People from different communities work side by side.']},
  {id:'council',br:'soc',cost:4,fx:{uni:.28,pts:.2},n:['Совет общин','Council of communities'],d:['Решения принимают представители всех. Споры не копятся.','Representatives of all decide. Disputes do not pile up.']},
  {id:'fest',br:'soc',cost:3,fx:{uni:.2,psy:.4},n:['Календарь общих праздников','Shared festival calendar'],d:['Праздники каждой общины становятся праздниками колонии.','Each community’s festivals become the colony’s festivals.']}
];
const CEV=[
  {t:['Солнечная буря','Solar storm'],d:['Датчики фиксируют резкий рост потока частиц.','Sensors register a sharp rise in particle flux.'],o:[[['Всех в убежище, работы остановить','Everyone to shelter, halt work'],{supply:-6,morale:-2}],[['Продолжить работы посменно','Keep working in shifts'],{health:-10,supply:2}]]},
  {t:['Вспышка инфекции','Infection outbreak'],d:['В жилом модуле несколько человек с температурой.','Several people in one habitat module are running a fever.'],o:[[['Карантин модуля','Quarantine the module'],{morale:-5,supply:-3}],[['Не изолировать, работать дальше','No isolation, keep working'],{health:-12}]]},
  {t:['Спор из-за воды','Dispute over water'],d:['Две общины обвиняют друг друга в перерасходе.','Two communities accuse each other of overuse.'],o:[[['Собрать представителей всех общин','Convene representatives of all communities'],{unity:8,pts:-1}],[['Ввести жёсткие нормы сверху','Impose strict rationing from above'],{unity:-8,supply:5,morale:-4}]]},
  {t:['Годовщина гибели Земли','Anniversary of the loss of Earth'],d:['Люди молчат в столовой. Многие не вышли на смену.','People are silent in the mess hall. Many did not report for shift.'],o:[[['День памяти: общий обряд, работы остановлены','Remembrance Day: a shared rite, work stops'],{grief:-15,morale:6,supply:-4,unity:4}],[['Обычный рабочий день','An ordinary working day'],{grief:6,morale:-6,supply:2}]]},
  {t:['Первый ребёнок колонии','The colony’s first child'],d:['Родители из разных общин. Вся колония ждёт новостей.','The parents come from different communities. The whole colony awaits news.'],o:[[['Общий праздник всех общин','A celebration for all communities'],{morale:10,unity:6,supply:-3}],[['Тихо отметить в семье','Mark it quietly in the family'],{morale:4}]]},
  {t:['Спор о языке школы','Dispute over the school language'],d:['На каком языке учить детей?','In which language should the children be taught?'],o:[[['Общий язык и уроки родных языков','A common language plus home-language lessons'],{unity:10,pts:-1}],[['Каждая община учит по-своему','Each community teaches its own way'],{unity:-10,morale:2}]]},
  {t:['Болезнь растений','Crop blight'],d:['В теплице пятна на листьях, заражение расползается.','Leaf spots in the greenhouse; the infection is spreading.'],o:[[['Уничтожить заражённый урожай','Destroy the infected crop'],{supply:-12}],[['Рискнуть и сохранить','Take the risk and keep it'],{supply:-4,health:-7}]]},
  {t:['Найден архив голосов','A voice archive is found'],d:['В грузе обнаружены записи с Земли: письма, песни, голоса.','Recordings from Earth are found in the cargo: letters, songs, voices.'],o:[[['Открыть всем сразу','Open it to everyone at once'],{grief:6,morale:8,unity:5}],[['Открывать постепенно, вместе с психологами','Open it gradually, with counsellors'],{grief:-8,morale:4}]]},
  {t:['Успех смешанной бригады','A mixed crew succeeds'],d:['Люди из трёх общин починили реактор раньше срока.','People from three communities repaired the reactor ahead of schedule.'],o:[[['Сделать такие бригады нормой','Make such crews the norm'],{unity:8,supply:4}],[['Наградить и оставить как есть','Reward them and change nothing'],{morale:3}]]},
  {t:['Волна апатии','A wave of apathy'],d:['Люди перестают приходить на тренировки.','People stop showing up for exercise.'],o:[[['Общие тренировки по расписанию','Scheduled group exercise'],{health:6,morale:-2}],[['Дать неделю отдыха','Give a week of rest'],{morale:4,health:-6}]]},
  {t:['Отказ жизнеобеспечения в секторе','Life-support failure in a sector'],d:['Сектор одной общины остался без воздуха на несколько дней.','One community’s sector is without air for several days.'],o:[[['Расселить людей к соседям из других общин','House them with neighbours from other communities'],{unity:6,morale:-3}],[['Чинить в авральном режиме','Repair in emergency mode'],{health:-5,supply:-5}]]}
];
const CG={on:false,paused:false,speed:1,acc:0,last:0};
const cgTot=()=>CG.pop.reduce((a,b)=>a+b,0)+CG.born;
function cgFx(){const m={rad:0,grav:0,env:0,med:0,psy:0,grief:0,uni:0,food:0,pts:0,dist:0};UPG.forEach(u=>{if(CG.upg[u.id])for(const k in u.fx)m[k]+=u.fx[k]});['rad','grav','env','dist'].forEach(k=>m[k]=Math.min(.85,m[k]));return m}
function cgLog(s,cls){CG.log.unshift({sol:CG.sol,s,cls});if(CG.log.length>40)CG.log.pop()}
function colStart(){
  const id=$('#colDest').value,d=DEST[id];
  Object.assign(CG,{on:true,paused:false,speed:1,acc:0,last:0,dest:id,sol:0,pop:GROUPS.map(()=>40),born:0,mixed:0,health:74,morale:42,unity:28,supply:70,grief:85,pts:6,upg:{},log:[],ev:null,cool:2,used:[],ended:false,pulse:0,
    haz:{rad:clamp(d.rad/2.2,.1,1),grav:clamp(Math.abs(1-d.g),0,1)*.8,env:d.kind==='surface'?(id==='europa'||id==='titan'?.85:.6):.85}});
  cgLog(tx(['Корабль-ковчег вышел на орбиту. 240 человек из шести общин начинают высадку.','The ark ship is in orbit. 240 people from six communities begin landing.']));
  $('#colIntro').style.display='none';$('#colGame').style.display='';rColony();requestAnimationFrame(colFrame)}
function colTick(){
  const m=cgFx(),h=CG.haz;let tot=cgTot();CG.sol+=10;
  CG.health=clamp(CG.health+1.2+m.med-1.6*h.rad*(1-m.rad)-1.3*h.grav*(1-m.grav)-1.1*h.env*(1-m.env)-(CG.supply<25?2.5:0)+(50-CG.health)*.02,0,100);
  CG.grief=clamp(CG.grief-.5-m.grief,0,100);
  CG.morale=clamp(CG.morale+.4+m.psy-2.2*CG.grief/100-.9*(1-CG.unity/100)+(CG.health-60)*.02-(CG.supply<25?1.5:0)+(55-CG.morale)*.02,0,100);
  CG.unity=clamp(CG.unity+m.uni-.35+(CG.morale-50)*.006,0,100);
  CG.supply=clamp(CG.supply+.2+m.food-tot/260,0,100);
  const dr=Math.max(0,(42-CG.health)/42)*.03+(CG.supply<10?.02:0)+(CG.morale<12?.008:0);
  if(dr>0){CG.pop=CG.pop.map(p=>p*(1-dr));CG.born*=1-dr;CG.mixed*=1-dr;if(dr>.012&&CG.sol%50===0)cgLog(tx(['Колония теряет людей. Здоровье или запасы на критическом уровне.','The colony is losing people. Health or supplies are critical.']),'doc')}
  if(CG.health>55&&CG.morale>45&&CG.supply>35){const b=tot*.012*(CG.morale/100+.5);CG.born+=b;CG.mixed+=b*CG.unity/100}
  CG.pts+=.5+m.pts+(CG.morale>65?.25:0);
  tot=cgTot();
  if(CG.unity>=60&&!CG.used.includes('u60')){CG.used.push('u60');cgLog(tx(['Общины перемешались: на карте уже не шесть посёлков, а один город.','The communities have blended: the map now shows one city instead of six villages.']),'ok')}
  if(tot<70||CG.morale<=3){colEnd(false);return}
  if(CG.sol>=1500){colEnd(true);return}
  if(--CG.cool<=0&&Math.random()<.3){const pool=CEV.map((e,i)=>i).filter(i=>!CG.used.slice(-6).includes(i));const i=pool[Math.floor(Math.random()*pool.length)];CG.used.push(i);CG.cool=4;CG.ev=CEV[i];CG.pulse=1;colModal()}
}
function colModal(){const e=CG.ev;$('#modalBox').innerHTML=`<div class="lbl">${t('sol')} ${CG.sol}</div><h2 style="margin:.3rem 0">${tx(e.t)}</h2><p>${tx(e.d)}</p>`+e.o.map((o,i)=>`<button data-opt="${i}"><b>${tx(o[0])}</b><span class="sm mu" style="display:block">${fxTxt(o[1])}</span></button>`).join('');$('#modal').classList.add('on');$('#modalBox button').focus()}
const FXN={health:['здоровье','health'],morale:['дух','morale'],unity:['единство','unity'],supply:['запасы','supplies'],grief:['горе','grief'],pts:['очки решений','decision points']};
const fxTxt=fx=>Object.keys(fx).map(k=>tx(FXN[k])+' '+(fx[k]>0?'+':'−')+Math.abs(fx[k])).join(', ');
function colChoose(i){const e=CG.ev;if(!e)return;const o=e.o[i];for(const k in o[1])CG[k]=k==='pts'?Math.max(0,CG[k]+o[1][k]):clamp(CG[k]+o[1][k],0,100);cgLog(tx(e.t)+': '+tx(o[0]).toLowerCase());CG.ev=null;$('#modal').classList.remove('on');rColony()}
function colBuy(id){const u=UPG.find(x=>x.id===id);if(!u||CG.upg[id]||CG.pts<u.cost||CG.ended)return;CG.pts-=u.cost;CG.upg[id]=1;cgLog(tx(['Построено','Built'])+': '+tx(u.n),'ok');rColony()}
function colSpeed(n){CG.speed=n;CG.paused=false;rColony()}
function colEnd(win){
  CG.ended=true;CG.paused=true;const tot=Math.round(cgTot()),good=win&&tot>=200&&CG.morale>=40;
  const title=good?['Колония устояла','The colony endures']:win?['Выжили, но хрупко','Survived, but fragile']:['Колония не выжила','The colony did not survive'];
  const lesson=CG.unity>=60?['Шесть общин стали одним народом. Единство подняло дух сильнее любого отдельного решения.','Six communities became one people. Unity lifted morale more than any single decision.']
    :['Общины так и остались порознь. Разобщённость тянула дух вниз сильнее радиации.','The communities stayed apart. Division dragged morale down harder than radiation did.'];
  $('#modalBox').innerHTML=`<div class="lbl">${t('sol')} ${CG.sol}</div><h2 style="margin:.3rem 0">${tx(title)}</h2>
    <p>${tx(['Население','Population'])}: <b class="mono">${tot}</b>. ${tx(['Рождены в колонии','Born in the colony'])}: <b class="mono">${Math.round(CG.born)}</b>, ${tx(['из них в смешанных семьях','of them in mixed families'])}: <b class="mono">${Math.round(CG.mixed)}</b>.<br>${tx(FXN.health)} ${Math.round(CG.health)}, ${tx(FXN.morale)} ${Math.round(CG.morale)}, ${tx(FXN.unity)} ${Math.round(CG.unity)}, ${tx(FXN.grief)} ${Math.round(CG.grief)}.</p>
    <p>${tx(lesson)}</p><p class="sm mu">${tx(['Те же пять опасностей, что и в модуле здоровья: радиация, изоляция, удалённость, тяжесть, замкнутая среда. Только в масштабе целого народа.','The same five hazards as in the health modules: radiation, isolation, distance, gravity, closed environment. Only at the scale of a whole people.'])}</p>
    <button class="pri" id="colAgain">${tx(['Новая попытка','Try again'])}</button>`;
  $('#modal').classList.add('on');$('#colAgain').onclick=colQuit;rColony()}
function colQuit(){CG.on=false;CG.ev=null;$('#modal').classList.remove('on');$('#colGame').style.display='none';$('#colIntro').style.display='';rColony()}
function bar(label,v,inv){const col=inv?(v>60?'var(--doc)':v>30?'var(--warn)':'var(--ok)'):(v<30?'var(--doc)':v<55?'var(--warn)':'var(--ok)');return `<div class="row" style="justify-content:space-between"><span class="sm">${label}</span><b class="mono sm">${Math.round(v)}</b></div><div class="bar"><u style="width:${clamp(v,0,100)}%;background:${col}"></u></div>`}
function rColony(){
  const sel=$('#colDest');if(!sel.options.length||sel.dataset.l!==LANG){const v=sel.value||'mars';sel.dataset.l=LANG;sel.innerHTML=Object.keys(DEST).filter(k=>DEST[k].kind==='surface').map(k=>`<option value="${k}">${tx(DEST[k].n)}</option>`).join('');sel.value=v}
  $('#colPause').textContent=t(CG.paused?'col_resume':'col_pause');
  if(!CG.on)return;
  const m=cgFx(),h=CG.haz,tot=cgTot();
  $('#colHead').textContent=tx(DEST[CG.dest].n);$('#colSol').textContent=t('sol')+' '+CG.sol+' / 1500';$('#colPts').textContent=f(Math.floor(CG.pts*10)/10,1)+' ◆';
  $$('[data-sp]').forEach(b=>b.classList.toggle('sel',+b.dataset.sp===CG.speed&&!CG.paused));
  $('#colLegend').innerHTML=GROUPS.map((g,i)=>`<span class="chip" style="min-height:26px"><i style="width:10px;height:10px;border-radius:50%;background:rgb(${g.c});display:inline-block"></i>${tx(g.n)} <b class="mono">${Math.round(CG.pop[i])}</b></span>`).join('')+`<span class="chip" style="min-height:26px"><i style="width:10px;height:10px;border-radius:50%;background:#fff;display:inline-block"></i>${tx(['Рождены здесь','Born here'])} <b class="mono">${Math.round(CG.born)}</b></span>`;
  $('#colStats').innerHTML=`<div class="g3" style="grid-template-columns:repeat(3,1fr);margin-bottom:.7rem"><div class="kpi"><div class="lbl">${tx(['Население','Population'])}</div><b>${Math.round(tot)}</b></div><div class="kpi"><div class="lbl">${tx(['Рождены здесь','Born here'])}</div><b>${Math.round(CG.born)}</b></div><div class="kpi"><div class="lbl">${tx(['Смешанные семьи','Mixed families'])}</div><b>${CG.born>1?Math.round(CG.mixed/CG.born*100):0}%</b></div></div>`+
    bar(tx(['Здоровье','Health']),CG.health)+bar(tx(['Дух','Morale']),CG.morale)+bar(tx(['Единство общин','Unity of communities']),CG.unity)+bar(tx(['Запасы','Supplies']),CG.supply)+bar(tx(['Горе по Земле','Grief for Earth']),CG.grief,1)+
    `<div class="lbl" style="margin:.5rem 0 .3rem">${tx(['Давление пяти опасностей','Pressure of the five hazards'])}</div>`+
    [[['Радиация','Radiation'],h.rad*(1-m.rad)],[['Тяжесть','Gravity'],h.grav*(1-m.grav)],[['Замкнутая среда','Closed environment'],h.env*(1-m.env)],[['Изоляция','Isolation'],clamp(CG.grief/100*(1-m.psy/2.6),0,1)],[['Удалённость: Земли нет','Distance: no Earth'],1-m.dist]].map(x=>bar(tx(x[0]),x[1]*100,1)).join('');
  $('#colLog').innerHTML=CG.log.map(l=>`<div class="${l.cls==='doc'?'st2':l.cls==='ok'?'st0':''}" style="font-weight:400;letter-spacing:0;text-transform:none"><span class="mono mu">${l.sol}</span> ${esc(l.s)}</div>`).join('');
  $('#colUpg').innerHTML=Object.keys(BR).map(b=>`<div><div class="lbl">${tx(BR[b])}</div>${UPG.filter(u=>u.br===b).map(u=>`<button class="upg ${CG.upg[u.id]?'got':''}" data-upg="${u.id}" ${CG.upg[u.id]||CG.pts<u.cost?'disabled':''}><b><span>${tx(u.n)}</span><span class="mono">${CG.upg[u.id]?'✓':u.cost+' ◆'}</span></b><span>${tx(u.d)}</span></button>`).join('')}</div>`).join('');
}
function colFrame(ts){
  if(!CG.on)return;requestAnimationFrame(colFrame);
  if(CG.last&&!CG.paused&&!CG.ev&&!CG.ended){CG.acc+=(ts-CG.last)*CG.speed;if(CG.acc>1400){CG.acc=0;colTick();if(curTab==='colony')rColony()}}
  CG.last=ts;if(curTab!=='colony')return;
  const c=$('#colCv'),w=c.clientWidth,h=c.clientHeight;if(!w)return;const dpr=Math.min(devicePixelRatio||1,2);if(c.width!==Math.round(w*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
  const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle='#05070c';x.fillRect(0,0,w,h);
  for(let i=0;i<90;i++){const p=PT[i];x.fillStyle=`rgba(255,255,255,${.15+.5*p.k})`;x.fillRect(p.x*w,p.y*h,1.2,1.2)}
  const R=Math.min(w,h)*.43,cx0=w/2,cy0=h/2,d=DEST[CG.dest];
  x.save();x.beginPath();x.arc(cx0,cy0,R,0,7);x.clip();
  x.fillStyle=d.orb;x.fillRect(cx0-R,cy0-R,R*2,R*2);
  for(let i=0;i<26;i++){const p=PT[i+30];x.fillStyle=`rgba(0,0,0,${.05+.1*p.k})`;x.beginPath();x.ellipse(cx0+(p.x-.5)*R*2,cy0+(p.y-.5)*R*2,R*.12*p.s,R*.05*p.s,p.k*3,0,7);x.fill()}
  x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=1;for(let i=1;i<6;i++){x.beginPath();x.ellipse(cx0,cy0,R*i/6,R,0,0,7);x.stroke();x.beginPath();x.ellipse(cx0,cy0,R,R*i/6,0,0,7);x.stroke()}
  let g=x.createRadialGradient(cx0-R*.45,cy0-R*.45,R*.2,cx0,cy0,R*1.05);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.78)');x.fillStyle=g;x.fillRect(cx0-R,cy0-R,R*2,R*2);
  // поселения: шесть посёлков сходятся в один город по мере роста единства
  const sx=cx0-R*.12,sy=cy0+R*.04,u=CG.unity/100,ue=u*u*(3-2*u),tot=cgTot(),N=Math.min(420,Math.round(tot/1.6)),nb=Math.round(N*CG.born/Math.max(1,tot)),sc=R/190;
  let idx=0;const per=GROUPS.map((_,gi)=>Math.round((N-nb)*CG.pop[gi]/Math.max(1,tot-CG.born)));
  const dot=(gi,j,col,ring)=>{const ca=gi/6*6.283+.5,cxg=sx+Math.cos(ca)*R*.42,cyg=sy+Math.sin(ca)*R*.42,a1=j*2.4,r1=Math.sqrt(j+1)*4.4*sc,a2=idx*2.4,r2=Math.sqrt(idx+1)*5*sc;
    const px=(cxg+Math.cos(a1)*r1)*(1-ue)+(sx+Math.cos(a2)*r2)*ue,py=(cyg+Math.sin(a1)*r1)*(1-ue)+(sy+Math.sin(a2)*r2)*ue;
    x.fillStyle=col;x.beginPath();x.arc(px,py,2.3*sc+.6,0,7);x.fill();if(ring){x.strokeStyle='rgba(58,214,166,.9)';x.lineWidth=1;x.beginPath();x.arc(px,py,3.6*sc+.8,0,7);x.stroke()}idx++};
  const mx=Math.max(...per);for(let j=0;j<mx;j++)GROUPS.forEach((gr,gi)=>{if(j<per[gi])dot(gi,j,rgb(mix(gr.c,[233,239,247],ue*.6)))});
  const mixShare=CG.born>1?CG.mixed/CG.born:0;for(let j=0;j<nb;j++)dot(j%6,per[j%6]+Math.floor(j/6),'#ffffff',j/nb<mixShare);
  if(ue<.85){x.strokeStyle=`rgba(233,239,247,${.25*u})`;x.lineWidth=1;GROUPS.forEach((_,gi)=>{const ca=gi/6*6.283+.5;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(ca)*R*.42*(1-ue),sy+Math.sin(ca)*R*.42*(1-ue));x.stroke()})}
  if(CG.pulse>0){x.strokeStyle=`rgba(252,61,33,${CG.pulse})`;x.lineWidth=2;x.beginPath();x.arc(sx,sy,R*.7*(1-CG.pulse)+10,0,7);x.stroke();CG.pulse-=.012}
  x.restore();x.strokeStyle='rgba(105,168,255,.5)';x.lineWidth=1;x.beginPath();x.arc(cx0,cy0,R+6,0,7);x.stroke();
}
$('#colStart').onclick=colStart;$('#colQuit').onclick=colQuit;
$('#colPause').onclick=()=>{CG.paused=!CG.paused;rColony()};

/* ===== запуск ===== */
(async()=>{applyI18n();setGame('breath');setTab('over');requestAnimationFrame(drawSky);await dbOpen();await mediaLoad();renderAll()})();
