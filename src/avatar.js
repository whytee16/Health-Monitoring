/* ===== 09 Аватар: 3D-карта целей и 3D-тело со слоями (three.js, WebXR, стереоочки) ===== */
Object.assign(U,{
nav_avatar:['Аватар 3D','Avatar 3D'],
h_av:['Виртуальный мир экипажа','Crew virtual world'],h_av_side:['Цели на карте','Goals on the map'],h_av_body:['Слои тела','Body layers'],
av_map:['Карта целей','Goal map'],av_body:['Тело 3D','Body 3D'],av_vr:['Войти в VR','Enter VR'],av_stereo:['Очки (стерео)','Viewer (stereo)'],av_full:['Во весь экран','Fullscreen'],
av_nogl:['Браузер не поддерживает WebGL, 3D-режим недоступен.','This browser does not support WebGL, the 3D mode is unavailable.'],
av_help_map:['Клик или тап по земле: идти. Клик по маяку: проложить путь. WASD или стрелки: шаг. Тяните мышью, чтобы повернуть камеру, колесо: приближение.','Click or tap the ground to walk. Click a beacon to head there. WASD or arrows to step. Drag to turn the camera, wheel to zoom.'],
av_help_body:['Тяните, чтобы вращать, колесо или щипок: приближение. Клик по органу: подробности. Слои включаются кнопками справа.','Drag to rotate, wheel or pinch to zoom. Click an organ for details. Toggle layers with the buttons on the right.'],
av_lvl:['Уровень','Level'],av_xp:['опыт','XP'],av_state:['Состояние аватара','Avatar condition'],av_slow:['Скорость снижена: недосып','Slower: sleep debt'],av_fast:['Скорость в норме','Normal speed'],
av_next:['Следующая цель','Next goal'],av_m:['м','m'],av_alldone:['Все цели сола выполнены. Отличная работа!','All goals of this sol are done. Great work!'],
av_do:['Выполнить','Complete'],av_done:['выполнено','done'],av_go:['Идти','Go'],av_urgent:['важно сегодня','priority today'],av_routine:['по распорядку','routine'],
av_ok:['Цель выполнена: {0}. +{1} опыта, +5 энергии','Goal complete: {0}. +{1} XP, +5 energy'],av_log:['Аватар: {0}','Avatar: {0}'],
av_route:['Пунктир показывает рекомендованный маршрут: сначала цели, где показатели вышли из коридора.','The dashed line is the suggested route: goals with out-of-range readings come first.'],
l_skin:['Кожа','Skin'],l_vess:['Сосуды','Vessels'],av_op:['Прозрачность кожи','Skin opacity'],av_cut:['Разрез спереди','Front cut-away'],
av_rot:['Вращение','Spin'],av_reset:['Сброс вида','Reset view'],av_front:['Спереди','Front'],av_side:['Сбоку','Side'],av_back:['Сзади','Back'],
av_heat:['Цвет по состоянию','Colour by condition'],av_open:['Открыть в модуле «Тело»','Open in the Body module'],av_pick:['Выберите орган на модели','Pick an organ on the model'],
anat_note:['Нажмите на орган, кость, мышцу или сосуд: подсветится структура и откроется её тема. «Глубина» снимает слои по очереди: кожа, мышцы, сосуды и нервы, скелет, органы. Оранжевым и красным светится то, что требует внимания.','Click an organ, bone, muscle or vessel to highlight it and open its topic. Depth peels the layers one by one: skin, muscles, vessels and nerves, skeleton, organs. Orange and red glow marks what needs attention.'],
at_head:['Голова','Head'],at_chest:['Грудь','Chest'],at_legs:['Ноги','Legs'],at_hide:['Скрыть','Hide'],at_iso:['Только это','Isolate'],at_all:['Показать всё','Show all'],at_depth:['Глубина','Depth'],
av_vr_body:['VR и очки работают в режиме «Карта целей». 3D-атлас тела открыт в обычном режиме.','VR and the viewer work in Goal map mode. The body atlas runs in the normal view.'],
av_vr_na:['WebXR недоступен в этом браузере. Попробуйте режим «Очки (стерео)» на телефоне.','WebXR is not available in this browser. Try the stereo viewer mode on a phone.']
});
const AVG=[
  {id:'med',ic:'✚',m:['pulse','bp','spo2','temp'],n:['Медотсек','Med bay'],a:['Утренний осмотр: пульс, давление, кислород, температура','Morning check: pulse, pressure, oxygen, temperature'],act:'measure',xp:15},
  {id:'lab',ic:'⚗',m:['glu'],n:['Лаборатория','Lab'],a:['Глюкоза натощак до завтрака','Fasting glucose before breakfast'],act:'measure',xp:10},
  {id:'gym',ic:'⚡',m:['ex'],n:['Тренажёрный модуль','Gym module'],a:['Тренировка 20 минут: беговая дорожка и силовой тренажёр','20-minute workout: treadmill and resistance device'],act:'ex',xp:20},
  {id:'water',ic:'💧',m:['water'],n:['Водный узел','Water station'],a:['Выпить 0,5 л воды','Drink 0.5 L of water'],act:'water',xp:10},
  {id:'shield',ic:'☢',m:['rad'],n:['Радиационное укрытие','Storm shelter'],a:['Снять показания дозиметра, при вспышке переждать в укрытии','Read the dosimeter; during a flare wait it out in the shelter'],act:'rad',xp:15},
  {id:'bed',ic:'☾',m:['sleep'],n:['Спальная каюта','Sleep quarters'],a:['Лечь вовремя: экран выключен, 8 часов сна','Go to bed on time: screen off, 8 hours of sleep'],act:'sleep',xp:15},
  {id:'green',ic:'❀',m:['mood'],n:['Оранжерея','Greenhouse'],a:['Дневник из пяти вопросов и дыхательная пауза','Five-question diary and a breathing break'],act:'mind',xp:15},
  {id:'comms',ic:'📡',m:['mood'],n:['Антенна связи','Comms antenna'],a:['Послушать послание от близких','Listen to a message from home'],act:'earth',xp:10}
];
const AVC=['#3ad6a6','#ffb224','#ff5f4c'];
const AV={ok:false,mode:'map',run:false,stereo:false,keys:{},sel:'heart',heat:false,spin:true,
  layers:{skin:true,mus:false,skel:true,org:true,vess:true},op:.28,cut:0};
function avState(){if(!S.av)S.av={xp:0,done:{}};return S.av}
const avDone=id=>!!avState().done[solNow()+':'+id];
const goalLv=g=>Math.max(0,...g.m.map(c=>lvCard(c)));

function avInit(){
  const T=THREE,box=$('#avCv');
  let R;try{R=new T.WebGLRenderer({antialias:true});}catch(e){box.innerHTML=`<p class="note">${t('av_nogl')}</p>`;return false}
  R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
  R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.localClippingEnabled=true;R.xr.enabled=true;
  box.prepend(R.domElement);AV.R=R;AV.stereoFx=new T.StereoEffect(R);AV.clock=new T.Clock();AV.ray=new T.Raycaster();
  mapBuild();bodyBuild();
  // события указателя
  const cv=R.domElement;let down=null;
  cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:AV.map.yaw,pitch:AV.map.pitch,moved:false}});
  cv.addEventListener('pointermove',e=>{
    if(down&&AV.mode==='map'&&(e.buttons&1)){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>6)down.moved=true;
      if(down.moved){AV.map.yaw=down.yaw-dx*.006;AV.map.pitch=clamp(down.pitch+dy*.004,.08,1.35)}}
    if(down&&Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>6)down.moved=true;
    });
  cv.addEventListener('pointerup',e=>{if(down&&!down.moved)avClick(ndc(e));down=null});
  cv.addEventListener('pointerleave',()=>{$('#avTip').style.display='none'});
  cv.addEventListener('wheel',e=>{if(AV.mode!=='map')return;e.preventDefault();AV.map.dist=clamp(AV.map.dist*(e.deltaY>0?1.1:.9),4,60)},{passive:false});
  addEventListener('keydown',e=>{if(curTab!=='avatar'||AV.mode!=='map'||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
    const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){AV.keys[k]=1;e.preventDefault()}});
  addEventListener('keyup',e=>{delete AV.keys[e.key.toLowerCase()]});
  addEventListener('blur',()=>{AV.keys={}});
  new ResizeObserver(avResize).observe(box);avResize();
  // WebXR: контроллеры и кнопка
  AV.ctrls=[0,1].map(i=>{const c=R.xr.getController(i);c.addEventListener('select',()=>avXRSelect(c));
    const g=new T.BufferGeometry().setFromPoints([new T.Vector3(0,0,0),new T.Vector3(0,0,-1)]);const l=new T.Line(g,new T.LineBasicMaterial({color:0x69a8ff}));l.scale.z=8;c.add(l);return c});
  R.xr.addEventListener('sessionstart',()=>{AV.xr=true;avRigXR()});
  R.xr.addEventListener('sessionend',()=>{AV.xr=false;[AV.map,AV.body].forEach(s=>{s.rig.position.set(0,0,0);s.rig.rotation.set(0,0,0)});avResize()});
  if(navigator.xr){const vb=T.VRButton.createButton(R);vb.id='avVRNative';vb.style.display='none';const hb=document.createElement('div');hb.style.display='none';hb.appendChild(vb);document.body.appendChild(hb);AV.vrBtn=vb}
  AV.ok=true;return true;
}
function ndc(e){const r=AV.R.domElement.getBoundingClientRect();let x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  if(AV.stereo){x=(x%.5)*2}return new THREE.Vector2(x*2-1,-(y*2-1))}
function avResize(){if(!AV.R||AV.xr)return;const box=$('#avCv'),w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;
  AV.R.setSize(w,h);AV.stereoFx.setSize(w,h);[AV.map.cam].forEach(c=>{c.aspect=(AV.stereo?w/2:w)/h;c.updateProjectionMatrix()})}

/* ---------- мир целей ---------- */
function mapBuild(){
  const T=THREE,sc=new T.Scene(),cam=new T.PerspectiveCamera(50,1,.1,700),rig=new T.Group();rig.add(cam);sc.add(rig);
  const hemi=new T.HemisphereLight(0xffe2c8,0x5a2e22,1.1);sc.add(hemi);
  AV.map={sc,cam,rig,hemi,yaw:.9,pitch:.6,dist:22,pos:new T.Vector3(0,0,8),dir:0,target:null,walk:0,st:{},route:null,key:''};
  const sun=new T.DirectionalLight(0xffd9b0,2.7);sun.position.set(40,26,-22);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:160});sc.add(sun);AV.map.sun=sun;
  AV.map.world=new T.Group();sc.add(AV.map.world);
  AV.map.hero=hero();sc.add(AV.map.hero);
  const rl=new T.Line(new T.BufferGeometry(),new T.LineDashedMaterial({color:0x69a8ff,dashSize:.6,gapSize:.4,transparent:true,opacity:.9}));sc.add(rl);AV.map.routeLine=rl;
  const mk=new T.Mesh(new T.RingGeometry(.35,.5,32),new T.MeshBasicMaterial({color:0x69a8ff,transparent:true,opacity:.8,side:T.DoubleSide}));mk.rotation.x=-Math.PI/2;mk.visible=false;sc.add(mk);AV.map.marker=mk;
}
const stPos=j=>{const a=j/AVG.length*Math.PI*2+.35,r=j%2?22:15;return{x:Math.cos(a)*r,z:Math.sin(a)*r}};
function label(txt,color){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  x.fillStyle='rgba(7,11,18,.78)';x.strokeStyle=color;x.lineWidth=5;x.beginPath();x.roundRect(6,10,500,108,14);x.fill();x.stroke();
  x.fillStyle='#e9eff7';x.font='bold 46px Helvetica,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,66,480);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(4,1,1);s.renderOrder=5;return s}
function hero(){
  const T=THREE,G=new T.Group(),W=new T.MeshStandardMaterial({color:0xeef1f6,roughness:.55}),Gy=new T.MeshStandardMaterial({color:0x8d98aa,roughness:.6});
  const add=(p,geo,mat,x,y,z)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
  add(G,new T.RoundedBoxGeometry(.5,.56,.32,3,.1),W,0,1.15,0);add(G,new T.RoundedBoxGeometry(.4,.46,.18,3,.06),Gy,0,1.18,-.24);
  add(G,new T.SphereGeometry(.21,32,16),W,0,1.6,0);const vis=add(G,new T.SphereGeometry(.17,32,16),new T.MeshStandardMaterial({color:0xd4a640,metalness:1,roughness:.15}),0,1.6,.07);vis.scale.set(1,.72,.62);
  const patch=add(G,new T.CircleGeometry(.07,24),new T.MeshStandardMaterial({color:0x3ad6a6,emissive:0x3ad6a6,emissiveIntensity:1.2}),.12,1.3,.165);
  const limb=(x,y,len,r)=>{const p=new T.Group();p.position.set(x,y,0);G.add(p);add(p,new T.CapsuleGeometry(r,len,6,12),W,0,-len/2-r*.4,0);return p};
  const aL=limb(-.31,1.36,.42,.075),aR=limb(.31,1.36,.42,.075),lL=limb(-.12,.88,.55,.09),lR=limb(.12,.88,.55,.09);
  [lL,lR].forEach(l=>add(l,new T.RoundedBoxGeometry(.2,.14,.32,2,.05),Gy,0,-.8,.05));[aL,aR].forEach(a=>add(a,new T.SphereGeometry(.08),Gy,0,-.6,0));
  const aura=new T.Mesh(new T.RingGeometry(.55,.75,40),new T.MeshBasicMaterial({color:0x3ad6a6,transparent:true,opacity:.7,side:T.DoubleSide}));aura.rotation.x=-Math.PI/2;aura.position.y=.05;G.add(aura);
  G.userData={aL,aR,lL,lR,patch,aura};return G}
function mapGoals(){const m=AV.map,p=m.pos;
  return AVG.map((g,j)=>{const s=stPos(j);return{g,lv:goalLv(g),done:avDone(g.id),x:s.x,z:s.z,dist:Math.hypot(s.x-p.x,s.z-p.z)}})}
function mapRoute(){const m=AV.map,left=mapGoals().filter(o=>!o.done),out=[];let cx=m.pos.x,cz=m.pos.z;
  while(left.length){left.sort((a,b)=>(b.lv-a.lv)||(Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz)));const o=left.shift();out.push(o);cx=o.x;cz=o.z}return out}
function mapRouteDraw(){const m=AV.map,r=mapRoute(),pts=[];let px=m.pos.x,pz=m.pos.z;
  r.forEach(o=>{for(let i=0;i<=24;i++){const k=i/24,x=px+(o.x-px)*k,z=pz+(o.z-pz)*k;pts.push(new THREE.Vector3(x,H(x,z)+.25,z))}px=o.x;pz=o.z});
  m.routeLine.geometry.dispose();m.routeLine.geometry=new THREE.BufferGeometry().setFromPoints(pts.length?pts:[new THREE.Vector3()]);m.routeLine.computeLineDistances();m.route=r}
function mapTick(dt,tm){
  const T=THREE,m=AV.map,h=m.hero,u=h.userData,slow=lvCard('sleep')>0,sp=(slow?3.2:4.4)*dt;col3Tick(dt,tm);
  // ввод
  let vx=0,vz=0;const K=AV.keys;if(K.w||K.arrowup)vz-=1;if(K.s||K.arrowdown)vz+=1;if(K.a||K.arrowleft)vx-=1;if(K.d||K.arrowright)vx+=1;
  let moving=false;
  if(vx||vz){m.target=null;m.marker.visible=false;const s=Math.sin(m.yaw),c=Math.cos(m.yaw),dx=vx*c+vz*s,dz=-vx*s+vz*c,l=Math.hypot(dx,dz);m.pos.x+=dx/l*sp;m.pos.z+=dz/l*sp;m.dir=Math.atan2(dx,dz);moving=true}
  else if(m.target){const dx=m.target.x-m.pos.x,dz=m.target.z-m.pos.z,l=Math.hypot(dx,dz);if(l<.15){m.target=null;m.marker.visible=false}else{const st=Math.min(sp,l);m.pos.x+=dx/l*st;m.pos.z+=dz/l*st;m.dir=Math.atan2(dx,dz);moving=true}}
  const r=Math.hypot(m.pos.x,m.pos.z);if(r>33){m.pos.x*=33/r;m.pos.z*=33/r}
  if(r<6.9){const k=6.9/Math.max(r,.01);m.pos.x*=k;m.pos.z*=k}
  h.position.set(m.pos.x,H(m.pos.x,m.pos.z),m.pos.z);
  let dd=m.dir-h.rotation.y;dd=Math.atan2(Math.sin(dd),Math.cos(dd));h.rotation.y+=dd*Math.min(1,dt*10);
  m.walk=moving?m.walk+dt*(slow?7:9):m.walk*.85;const sw=moving?Math.sin(m.walk)*.6:0;
  u.lL.rotation.x=sw;u.lR.rotation.x=-sw;u.aL.rotation.x=-sw*.8;u.aR.rotation.x=sw*.8;
  const wc=new T.Color(AVC[worst()]);u.patch.material.color.copy(wc);u.patch.material.emissive.copy(wc);u.aura.material.color.copy(wc);u.aura.scale.setScalar(1+.08*Math.sin(tm*3));
  // станции
  for(const o of mapGoals()){const st=m.st[o.g.id];if(!st)continue;const U2=st.userData,c=new T.Color(o.done?'#5d6b80':AVC[o.lv]);
    U2.beam.material.color.copy(c);U2.beam.visible=!o.done;U2.halo.material.color.copy(c);U2.halo.rotation.x=Math.PI/2;U2.halo.rotation.z=tm*1.5;U2.halo.position.y=(U2.hy||3.6)+Math.sin(tm*2+o.x)*.15;
    U2.halo.visible=!o.done;U2.ck.visible=o.done;U2.ck.rotation.y=tm;U2.halo.scale.setScalar(o.lv?1+.15*Math.sin(tm*5):1)}
  // маршрут раз в 0,3 с
  if(!m.rt||tm-m.rt>.3){m.rt=tm;mapRouteDraw();mapCard();if(!m.lt||tm-m.lt>.5){m.lt=tm;avDistUpd()}}
  // камера
  const cam=m.cam,tgt=h.position.clone().add(new T.Vector3(0,1.2,0));
  if(AV.xr){m.rig.position.set(h.position.x-Math.sin(m.yaw)*5,h.position.y,h.position.z-Math.cos(m.yaw)*5)}
  else{const cp=new T.Vector3(tgt.x+Math.sin(m.yaw)*Math.cos(m.pitch)*m.dist,tgt.y+Math.sin(m.pitch)*m.dist,tgt.z+Math.cos(m.yaw)*Math.cos(m.pitch)*m.dist);
    cp.y=Math.max(cp.y,H(cp.x,cp.z)+.6);cam.position.lerp(cp,Math.min(1,dt*6));cam.lookAt(tgt)}
  m.sun.position.set(h.position.x+40,26,h.position.z-22);m.sun.target.position.copy(h.position);m.sun.target.updateMatrixWorld();
  miniMap();
}
function mapClick(hit){const m=AV.map;if(!hit)return;let o=hit.object,gid=null;while(o){if(o.userData&&o.userData.goal){gid=o.userData.goal;break}o=o.parent}
  if(gid)return mapGoTo(gid);
  if(hit.object===m.ground){m.target={x:hit.point.x,z:hit.point.z};m.marker.position.set(hit.point.x,hit.point.y+.06,hit.point.z);m.marker.visible=true}}
function mapGoTo(id){const m=AV.map,j=AVG.findIndex(g=>g.id===id),p=stPos(j),l=Math.hypot(p.x,p.z),k=(l-2.6)/l;
  m.target={x:p.x*k,z:p.z*k};m.marker.position.set(m.target.x,H(m.target.x,m.target.z)+.06,m.target.z);m.marker.visible=true}
function nearGoal(){return mapGoals().filter(o=>o.dist<3.6).sort((a,b)=>a.dist-b.dist)[0]}
function mapCard(){const el=$('#avCard'),n=nearGoal(),r=AV.map.route||[];let key,html;
  if(n){key='n'+n.g.id+n.done+n.lv+LANG;
    html=`<div class="row" style="justify-content:space-between"><b>${n.g.ic} ${esc(tx(n.g.n))}</b>${lvTag(n.lv)}</div><p class="sm" style="margin:.3rem 0 .5rem">${esc(tx(n.g.a))}</p>
    <div class="sm mu">${n.g.m.map(c=>`${mName(c)}: <b class="mono">${valTxt(c)}</b> ${mUnit(c)}`).join(' · ')}</div>
    <div class="row" style="margin-top:.5rem">${n.done?`<span class="st st0"><i></i>${t('av_done')}</span>`:`<button class="pri" data-avdo="${n.g.id}">${t('av_do')} · +${avXP(n)} ${t('av_xp')}</button>`}</div>`}
  else if(r.length){const o=r[0];key='r'+o.g.id+Math.round(o.dist)+LANG;html=`<span class="lbl">${t('av_next')}</span> <b>${o.g.ic} ${esc(tx(o.g.n))}</b> <span class="mono">${f(o.dist,0)} ${t('av_m')}</span> <button class="chip" data-avgo="${o.g.id}">${t('av_go')}</button>`}
  else{key='done'+LANG;html=`<b style="color:var(--ok)">${t('av_alldone')}</b>`}
  if(el.dataset.key!==key){el.dataset.key=key;el.innerHTML=html}}
const avXP=o=>o.g.xp+(o.lv?10*o.lv:0);
function avDo(id){const o=mapGoals().find(x=>x.g.id===id);if(!o||o.done)return;const st=avState(),h=today();
  st.done[solNow()+':'+id]=1;const xp=avXP(o);st.xp+=xp;S.energy+=5;logAct(t('av_log',tx(o.g.n)));
  if(o.g.act==='water')h.v.water=+(h.v.water+.5).toFixed(1);
  if(o.g.act==='ex')h.v.ex=Math.round(h.v.ex+20);
  toast(t('av_ok',tx(o.g.n),xp));
  if(o.g.act==='measure'||o.g.act==='mind'||o.g.act==='earth'){AV.pending=o.g.act}
  $('#avCard').dataset.key='';renderAll();
  if(AV.pending){const a=AV.pending;AV.pending=null;setTimeout(()=>{if(a==='measure'){setTab('body');$('#mForm').scrollIntoView({block:'center'})}else setTab(a)},900)}}
function miniMap(){const c=$('#avMini'),x=c.getContext('2d'),W=c.width,s=W/72,m=AV.map,cx=W/2;x.clearRect(0,0,W,W);
  x.fillStyle='rgba(7,11,18,.78)';x.beginPath();x.arc(cx,cx,cx-2,0,7);x.fill();x.strokeStyle='#34486b';x.lineWidth=2;x.stroke();
  x.save();x.translate(cx,cx);x.strokeStyle='rgba(159,179,204,.35)';x.lineWidth=3;AVG.forEach((g,j)=>{const p=stPos(j);x.beginPath();x.moveTo(0,0);x.lineTo(p.x*s,p.z*s);x.stroke()});
  x.setLineDash([4,3]);x.strokeStyle='#69a8ff';x.lineWidth=1.6;x.beginPath();x.moveTo(m.pos.x*s,m.pos.z*s);(m.route||[]).forEach(o=>x.lineTo(o.x*s,o.z*s));x.stroke();x.setLineDash([]);
  x.fillStyle='#dfe6ef';x.beginPath();x.arc(0,0,3.2*s,0,7);x.fill();
  mapGoals().forEach(o=>{x.fillStyle=o.done?'#5d6b80':AVC[o.lv];x.beginPath();x.arc(o.x*s,o.z*s,6,0,7);x.fill();x.fillStyle='#070b12';x.font='bold 8px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(o.done?'✓':'',o.x*s,o.z*s+.5)});
  x.translate(m.pos.x*s,m.pos.z*s);x.rotate(-AV.map.hero.rotation.y+Math.PI);x.fillStyle='#fff';x.beginPath();x.moveTo(0,-7);x.lineTo(5,5);x.lineTo(0,2);x.lineTo(-5,5);x.closePath();x.fill();x.restore()}

/* ---------- тело 3D ---------- */
function bodyBuild(){AV.body={rig:new THREE.Group()}}
function bodyApply(){if(AV.mode!=='body'||!ATLAS.R)return;const L=AV.layers;ATLAS.setVis({skin:L.skin?Math.max(.02,AV.op):0,mus:L.mus?1:0,skel:L.skel?1:0,org:L.org?1:0,vess:L.vess?1:0,nerv:L.vess?1:0});
  ATLAS.setCut(AV.cut);ATLAS.heat=AV.heat;ATLAS.spin=AV.spin&&!reduce;ATLAS.selTp=AV.sel;ATLAS.lang=LANG}
function bodyEnter(){const box=$('#avCv');AV.R.domElement.style.display='none';if(!ATLAS.mount(box))return;ATLAS.colorFn=u=>u.tp?topicLv(u.tp):null;ATLAS.pulse=clamp(today().v.pulse,35,200);
  ATLAS.onPick=u=>{if(u&&u.tp)bodySel(u.tp)};ATLAS.tipFn=u=>`<b>${esc(ATLAS.name(u))}</b>`+(u.tp?`<br>${esc(tx(TOPIC[u.tp].n))} ${lvTag(topicLv(u.tp))}`:'');bodyApply();ATLAS.load('M').then(bodyApply)}
function bodyLeave(){if(ATLAS.R&&ATLAS.R.domElement.parentElement===$('#avCv'))ATLAS.unmount();if(AV.R)AV.R.domElement.style.display=''}
function bodySel(tp){if(!tp)return;AV.sel=tp;ATLAS.selTp=tp;rAvSide()}
function bodyView(v){ATLAS.frame(v);AV.spin=false;bodyApply();rAvSide()}

/* ---------- общий цикл, VR ---------- */
function avClick(v){if(AV.mode==='map'){const m=AV.map;AV.ray.setFromCamera(v,m.cam);mapClick(AV.ray.intersectObjects(m.sc.children.filter(o=>o!==m.routeLine&&o!==m.marker),true).find(h=>h.object.type!=='Points'&&h.object.type!=='Sprite'&&(h.object===m.ground||h.object.userData.goal)))}
}
function avXRSelect(c){const T=THREE,mt=new T.Matrix4().extractRotation(c.matrixWorld);AV.ray.ray.origin.setFromMatrixPosition(c.matrixWorld);AV.ray.ray.direction.set(0,0,-1).applyMatrix4(mt);
  if(AV.mode==='map'){const m=AV.map;mapClick(AV.ray.intersectObjects(m.sc.children,true).find(h=>h.object===m.ground||h.object.userData.goal))}}
function avRigXR(){const s=AV.mode==='map'?AV.map:AV.body;[AV.map,AV.body].forEach(x=>AV.ctrls.forEach(c=>x.rig.remove(c)));AV.ctrls.forEach(c=>s.rig.add(c));
  if(AV.mode==='body'){s.rig.position.set(0,-.25,1.3);s.rig.rotation.set(0,0,0);s.cam.position.set(0,0,0)}else{s.rig.rotation.set(0,AV.map.yaw+Math.PI,0);s.cam.position.set(0,0,0)}}
function avLoop(){if(!AV.run)return;const dt=Math.min(.05,AV.clock.getDelta()),tm=AV.clock.elapsedTime;
  if(AV.mode!=='map')return;mapTick(dt,tm);const s=AV.map;
  if(AV.stereo&&!AV.xr)AV.stereoFx.render(s.sc,s.cam);else AV.R.render(s.sc,s.cam)}
function avStart(){if(AV.run)return;AV.run=true;AV.clock.getDelta();AV.R.setAnimationLoop(avLoop)}
function avStop(){if(AV.ok)bodyLeave();if(!AV.ok||!AV.run)return;if(AV.xr)return;AV.run=false;AV.R.setAnimationLoop(null);AV.keys={}}
function avMode(md){if(md==='body'&&(AV.xr||AV.stereo)){toast(t('av_vr_body'));return}AV.mode=md;if(md!=='body')bodyLeave();$('#avMini').style.display=md==='map'?'':'none';$('#avCard').style.display=md==='map'?'':'none';$('#avTip').style.display='none';
  AV.R.domElement.style.cursor=md==='map'?'crosshair':'grab';AV.R.shadowMap.enabled=md==='map';if(AV.xr)avRigXR();rAvatar()}
function avStereo(on){AV.stereo=on;const box=$('#avCv');if(on&&box.requestFullscreen&&!document.fullscreenElement){box.requestFullscreen().then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}
  if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});setTimeout(avResize,60);rAvatar()}
function avDistUpd(){mapGoals().forEach(o=>{const e=document.querySelector(`#avSide [data-dist="${o.g.id}"]`);if(e)e.textContent=f(o.dist,0)+' '+t('av_m')})}

function rAvSide(){const el=$('#avSide');
  if(AV.mode==='map'){const st=avState(),lvl=Math.floor(st.xp/100)+1,pr=st.xp%100,w=worst(),slow=lvCard('sleep')>0,route=mapRoute(),ord={};route.forEach((o,i)=>ord[o.g.id]=i+1);
    $('#avSideLbl').textContent=t('h_av_side');
    el.innerHTML=`<div class="row" style="justify-content:space-between"><span><span class="lbl">${t('av_lvl')}</span> <b class="mono" style="font-size:1.3rem">${lvl}</b></span><span class="mono sm">${pr}/100 ${t('av_xp')}</span></div>
      <div class="avbar"><i style="width:${pr}%"></i></div>
      <div class="row sm" style="margin:.5rem 0 .2rem"><span class="lbl">${t('av_state')}</span>${lvTag(w)}</div><p class="sm mu" style="margin:0 0 .6rem">${t(slow?'av_slow':'av_fast')}</p>
      <ul class="avgoals">${mapGoals().map(o=>`<li class="${o.done?'dn':''}"><button data-avgo="${o.g.id}"><span class="avn mono">${o.done?'✓':ord[o.g.id]||''}</span><span class="avi" style="color:${o.done?'#5d6b80':AVC[o.lv]}">${o.g.ic}</span>
        <span class="avt"><b>${esc(tx(o.g.n))}</b><span class="sm mu">${o.done?t('av_done'):t(o.lv?'av_urgent':'av_routine')} · <span data-dist="${o.g.id}">${f(o.dist,0)} ${t('av_m')}</span></span></span>${o.done?'':lvTag(o.lv)}</button></li>`).join('')}</ul>
      <p class="sm mu" style="margin:.6rem 0 0">${t('av_route')}</p>`}
  else{$('#avSideLbl').textContent=t('h_av_body');const tp=AV.sel,T2=TOPIC[tp],lv=topicLv(tp);
    el.innerHTML=`<div class="chips" id="avLayers">${[['skin','l_skin'],['mus','l_mus'],['skel','l_skel'],['org','l_org'],['vess','l_vess']].map(([k,i])=>`<button class="chip ${AV.layers[k]?'sel':''}" data-avl="${k}" aria-pressed="${!!AV.layers[k]}">${t(i)}</button>`).join('')}</div>
      <label class="sm" style="display:block;margin-top:.7rem">${t('av_op')} <input type="range" id="avOp" min="0" max="1" step=".02" value="${AV.op}"></label>
      <label class="sm" style="display:block;margin-top:.3rem">${t('av_cut')} <input type="range" id="avCut" min="0" max="1" step=".02" value="${AV.cut}"></label>
      <div class="chips" style="margin-top:.5rem"><button class="chip ${AV.spin?'sel':''}" data-avv="spin">${t('av_rot')}</button><button class="chip ${AV.heat?'sel':''}" data-avv="heat">${t('av_heat')}</button>
        <button class="chip" data-avv="front">${t('av_front')}</button><button class="chip" data-avv="side">${t('av_side')}</button><button class="chip" data-avv="back">${t('av_back')}</button></div>
      <div class="avinfo">${T2?`<div class="row" style="justify-content:space-between"><h3>${esc(tx(T2.n))}</h3>${lvTag(lv)}</div><p class="sm">${esc(tx(T2.t))}</p><p class="sm mu">${esc(tx(T2.s||['','']))}</p>
        ${T2.m.length||T2.mood?`<div class="sm">${[...T2.m,...(T2.mood?['mood']:[])].map(c=>`<div class="row" style="justify-content:space-between;margin:.15rem 0"><span>${mName(c)}</span><span><b class="mono">${valTxt(c)}</b> ${mUnit(c)} ${lvTag(lvCard(c))}</span></div>`).join('')}</div>`:''}
        <button class="ghost" data-avopen="${tp}" style="margin-top:.6rem">${t('av_open')}</button>`:`<p class="sm mu">${t('av_pick')}</p>`}</div>`}}
function rAvatar(){
  if(!AV.ok&&!AV.failed){if(!window.THREE||!avInit()){AV.failed=true}}
  $$('#avModes [data-avm]').forEach(b=>b.classList.toggle('sel',b.dataset.avm===AV.mode));$('#avStereo').classList.toggle('sel',AV.stereo);
  $('#avHelp').textContent=t(AV.mode==='map'?'av_help_map':'av_help_body');
  if(AV.failed)return;mapWorld();
  AVG.forEach(g=>{const st=AV.map.st[g.id];if(st){const lb=st.userData.lb;if(lb.userData.k!==LANG){st.remove(lb);const n=label(g.ic+'  '+tx(g.n),'#69a8ff');n.position.y=4.7;n.userData.k=LANG;st.add(n);st.userData.lb=n}}});
  rAvSide();if(AV.mode==='body'){if(AV.run){AV.run=false;AV.R.setAnimationLoop(null)}bodyEnter()}else avStart();setTimeout(avResize,0)}

$('#avModes').addEventListener('click',e=>{const b=e.target.closest('[data-avm]');if(b&&AV.ok)avMode(b.dataset.avm)});
$('#avStereo').onclick=()=>{if(!AV.ok)return;if(AV.mode==='body')return toast(t('av_vr_body'));avStereo(!AV.stereo)};
$('#avFull').onclick=()=>{const b=$('#avCv');if(document.fullscreenElement)document.exitFullscreen();else if(b.requestFullscreen)b.requestFullscreen().catch(()=>{});setTimeout(avResize,80)};
$('#avVR').onclick=()=>{if(AV.mode==='body')return toast(t('av_vr_body'));if(AV.vrBtn&&!/NOT|НЕ/.test(AV.vrBtn.textContent))AV.vrBtn.click();else toast(t('av_vr_na'))};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&AV.stereo){AV.stereo=false;rAvatar()}setTimeout(avResize,80)});
$('#m-avatar').addEventListener('click',e=>{const g=e.target.closest('[data-avgo]'),d=e.target.closest('[data-avdo]'),l=e.target.closest('[data-avl]'),v=e.target.closest('[data-avv]'),o=e.target.closest('[data-avopen]');
  if(g){if(AV.mode!=='map')avMode('map');mapGoTo(g.dataset.avgo)}
  if(d)avDo(d.dataset.avdo);
  if(l){AV.layers[l.dataset.avl]=!AV.layers[l.dataset.avl];bodyApply();rAvSide()}
  if(v){const k=v.dataset.avv;if(k==='spin')AV.spin=!AV.spin;else if(k==='heat')AV.heat=!AV.heat;else return bodyView(k);bodyApply();rAvSide()}
  if(o){const tp=o.dataset.avopen;selTp=tp;layer=layerOf(tp);setTab('body')}});
$('#m-avatar').addEventListener('input',e=>{if(e.target.id==='avOp')AV.op=+e.target.value;if(e.target.id==='avCut')AV.cut=+e.target.value;bodyApply()});
