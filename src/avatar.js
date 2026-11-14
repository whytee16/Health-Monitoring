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
      if(down.moved){AV.map.yaw=down.yaw-dx*.006;AV.map.pitch=clamp(down.pitch+dy*.004,.12,1.25)}}
    if(down&&Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>6)down.moved=true;
    });
  cv.addEventListener('pointerup',e=>{if(down&&!down.moved)avClick(ndc(e));down=null});
  cv.addEventListener('pointerleave',()=>{$('#avTip').style.display='none'});
  cv.addEventListener('wheel',e=>{if(AV.mode!=='map')return;e.preventDefault();AV.map.dist=clamp(AV.map.dist*(e.deltaY>0?1.1:.9),4,28)},{passive:false});
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
function H(x,z){const r=Math.hypot(x,z),k=AV.map.flat?0:1;
  const n=Math.sin(x*.15)*Math.cos(z*.13)*.6+Math.sin(x*.37+z*.21)*.25+Math.sin(z*.5-x*.3)*.1;
  const s=(a,b,v)=>{const q=clamp((v-a)/(b-a),0,1);return q*q*(3-2*q)};
  return k*(n*(.22+s(26,60,r)*6)+s(32,72,r)*5)}
function mapBuild(){
  const T=THREE,sc=new T.Scene(),cam=new T.PerspectiveCamera(55,1,.1,600),rig=new T.Group();rig.add(cam);sc.add(rig);
  AV.map={sc,cam,rig,yaw:.6,pitch:.55,dist:11,pos:new T.Vector3(0,0,4),dir:0,target:null,walk:0,st:{},route:null,key:''};
  sc.add(new T.HemisphereLight(0xcfe2ff,0x3a2a22,.9));
  const sun=new T.DirectionalLight(0xffffff,2.2);sun.position.set(30,45,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:140});sc.add(sun);AV.map.sun=sun;
  AV.map.world=new T.Group();sc.add(AV.map.world);
  AV.map.hero=hero();sc.add(AV.map.hero);
  const rl=new T.Line(new T.BufferGeometry(),new T.LineDashedMaterial({color:0x69a8ff,dashSize:.6,gapSize:.4,transparent:true,opacity:.9}));sc.add(rl);AV.map.routeLine=rl;
  const mk=new T.Mesh(new T.RingGeometry(.35,.5,32),new T.MeshBasicMaterial({color:0x69a8ff,transparent:true,opacity:.8,side:T.DoubleSide}));mk.rotation.x=-Math.PI/2;mk.visible=false;sc.add(mk);AV.map.marker=mk;
}
function mapWorld(){
  const T=THREE,m=AV.map,d=D(),sk=d.sky,key=S.dest+LANG;if(m.key===key)return;m.key=key;
  m.world.traverse(o=>{if(o.geometry)o.geometry.dispose()});m.world.clear();m.flat=d.kind!=='surface';
  const c3=a=>new T.Color(a[0]/255,a[1]/255,a[2]/255);
  // небо: градиентная сфера и звёзды
  const sg=new T.SphereGeometry(400,32,16),top=c3(sk.top),hor=c3(sk.hor),col=[];
  for(let i=0;i<sg.attributes.position.count;i++){const y=sg.attributes.position.getY(i)/400,c=hor.clone().lerp(top,clamp(y*1.6,0,1));col.push(c.r,c.g,c.b)}
  sg.setAttribute('color',new T.Float32BufferAttribute(col,3));m.world.add(new T.Mesh(sg,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,depthWrite:false})));
  if(sk.star>0){const r=rng(7),p=[];for(let i=0;i<1400;i++){const u=r()*2-1,a=r()*6.283,q=Math.sqrt(1-u*u);if(u<.05)continue;p.push(q*Math.cos(a)*380,u*380,q*Math.sin(a)*380)}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));m.world.add(new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,transparent:true,opacity:sk.star})))}
  if(d.kind!=='surface'){const pl=new T.Mesh(new T.SphereGeometry(140,48,32),new T.MeshStandardMaterial({color:S.dest==='iss'?0x2f6fc0:0x24304f,roughness:.8,emissive:S.dest==='iss'?0x0a2350:0x000000}));
    pl.position.set(-60,-170,-220);m.world.add(pl)}
  // грунт или палуба станции
  const gnd=sk.gnd||[[120,124,132],[70,74,84]],ga=c3(gnd[0]),gb=c3(gnd[1]);
  const tg=new T.PlaneGeometry(170,170,150,150);tg.rotateX(-Math.PI/2);const ps=tg.attributes.position,tc=[];
  for(let i=0;i<ps.count;i++){const x=ps.getX(i),z=ps.getZ(i);ps.setY(i,H(x,z));
    let k=.5+.5*Math.sin(x*.9+Math.cos(z*.7)*2)*Math.cos(z*.6);if(m.flat){k=(Math.abs(x%4)<.08||Math.abs(z%4)<.08)?.0:.75;if(Math.hypot(x,z)>34)k=.35}
    const c=gb.clone().lerp(ga,k);tc.push(c.r,c.g,c.b)}
  tg.setAttribute('color',new T.Float32BufferAttribute(tc,3));tg.computeVertexNormals();
  const ground=new T.Mesh(tg,new T.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:m.flat?.3:0}));ground.receiveShadow=true;ground.name='ground';m.world.add(ground);m.ground=ground;
  if(m.flat){const rim=new T.Mesh(new T.TorusGeometry(34,.25,8,96),new T.MeshStandardMaterial({color:0x69a8ff,emissive:0x1d4f9a}));rim.rotation.x=Math.PI/2;rim.position.y=.2;m.world.add(rim)}
  else{const r=rng(3),rg=new T.DodecahedronGeometry(1,0),rm=new T.MeshStandardMaterial({color:gb,roughness:1});
    for(let i=0;i<90;i++){const a=r()*6.283,dd=8+r()*48,x=Math.cos(a)*dd,z=Math.sin(a)*dd;if(AVG.some((g,j)=>Math.hypot(x-stPos(j).x,z-stPos(j).z)<4))continue;
      const s=.2+r()*r()*1.6,o=new T.Mesh(rg,rm);o.scale.set(s,s*.7,s*(.8+r()*.4));o.rotation.set(r()*3,r()*3,0);o.position.set(x,H(x,z)+s*.25,z);o.castShadow=true;m.world.add(o)}}
  // база в центре
  const dome=new T.Mesh(new T.SphereGeometry(3.2,32,16,0,6.283,0,Math.PI/2),new T.MeshStandardMaterial({color:0xdfe6ef,roughness:.4,metalness:.2}));dome.position.y=H(0,0);dome.castShadow=true;m.world.add(dome);
  const ring=new T.Mesh(new T.TorusGeometry(3.25,.12,8,48),new T.MeshStandardMaterial({color:0x0b3d91,emissive:0x0b3d91}));ring.rotation.x=Math.PI/2;ring.position.y=H(0,0)+.1;m.world.add(ring);
  // дороги и станции
  AVG.forEach((g,j)=>{const p=stPos(j);m.world.add(road(0,0,p.x,p.z));const st=station(g);st.position.set(p.x,H(p.x,p.z),p.z);st.lookAt(0,st.position.y,0);m.world.add(st);m.st[g.id]=st});
  m.hero.position.copy(m.pos).setY(H(m.pos.x,m.pos.z));
}
const stPos=j=>{const a=j/AVG.length*Math.PI*2+.35,r=j%2?22:15;return{x:Math.cos(a)*r,z:Math.sin(a)*r}};
function road(x1,z1,x2,z2){const T=THREE,n=40,w=.9,p=[],ix=[],dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz),nx=-dz/L*w,nz=dx/L*w;
  for(let i=0;i<=n;i++){const k=i/n,x=x1+dx*k,z=z1+dz*k;p.push(x+nx,H(x+nx,z+nz)+.04,z+nz,x-nx,H(x-nx,z-nz)+.04,z-nz);if(i<n){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
  const o=new T.Mesh(g,new T.MeshStandardMaterial({color:0x9fb3cc,transparent:true,opacity:.28,roughness:1,side:T.DoubleSide}));o.receiveShadow=true;return o}
function label(txt,color){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  x.fillStyle='rgba(7,11,18,.78)';x.strokeStyle=color;x.lineWidth=5;x.beginPath();x.roundRect(6,10,500,108,14);x.fill();x.stroke();
  x.fillStyle='#e9eff7';x.font='bold 46px Helvetica,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,66,480);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(4,1,1);s.renderOrder=5;return s}
function station(g){
  const T=THREE,G=new T.Group(),W=new T.MeshStandardMaterial({color:0xe3e8ef,roughness:.5,metalness:.2}),Dk=new T.MeshStandardMaterial({color:0x2a3446,roughness:.6,metalness:.4});
  const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;o.receiveShadow=true;G.add(o);return o};
  add(new T.CylinderGeometry(2,2.1,.15,40),Dk,0,.07,0);
  const RB=(w,h,d)=>new T.RoundedBoxGeometry(w,h,d,3,.08);
  switch(g.id){
    case'med':add(RB(2.4,1.6,1.8),W,0,.95,0);const rc=new T.MeshStandardMaterial({color:0xfc3d21,emissive:0x661000});add(RB(.9,.25,.12),rc,0,1.1,.92);add(RB(.25,.9,.12),rc,0,1.1,.92);break;
    case'lab':add(new T.SphereGeometry(1.3,32,16,0,6.283,0,Math.PI/2),W,0,.15,0);add(new T.CylinderGeometry(.04,.04,1.6),Dk,.6,1.6,0);add(new T.SphereGeometry(.12),new T.MeshStandardMaterial({color:0x3ad6a6,emissive:0x3ad6a6}),.6,2.45,0);break;
    case'gym':add(RB(2.6,.3,1),Dk,0,.3,0);add(RB(2.2,.06,.8),new T.MeshStandardMaterial({color:0x111111}),0,.48,0);[-.45,.45].forEach(z=>add(new T.CylinderGeometry(.05,.05,1.2),W,-1,1,z));add(RB(.12,.1,1),W,-1,1.6,0);break;
    case'water':add(new T.CylinderGeometry(.9,.9,2.2,32),new T.MeshPhysicalMaterial({color:0x69a8ff,transparent:true,opacity:.55,roughness:.1,metalness:.1}),0,1.25,0);add(new T.TorusGeometry(.92,.07,8,32),W,0,2.35,0,Math.PI/2);add(new T.TorusGeometry(.92,.07,8,32),W,0,.2,0,Math.PI/2);break;
    case'shield':add(new T.SphereGeometry(1.7,32,16,0,6.283,0,Math.PI/2),new T.MeshStandardMaterial({color:0x56606e,roughness:.9}),0,.15,0);add(new T.TorusGeometry(1.72,.1,8,48),new T.MeshStandardMaterial({color:0xffb224,emissive:0x553300}),0,.25,0,Math.PI/2);break;
    case'bed':add(new T.CapsuleGeometry(.75,1.8,8,24),W,0,.9,0,0,0,Math.PI/2);add(new T.CircleGeometry(.3,24),new T.MeshStandardMaterial({color:0xb99cff,emissive:0x3a2a77}),0,1.1,.74);break;
    case'green':add(new T.SphereGeometry(1.5,32,16,0,6.283,0,Math.PI/2),new T.MeshPhysicalMaterial({color:0xcff7e8,transparent:true,opacity:.3,roughness:.05}),0,.15,0);
      const lf=new T.MeshStandardMaterial({color:0x3ad6a6,roughness:.7});[[-.5,.4,.2],[.4,.35,-.3],[.1,.5,.5],[-.2,.3,-.6],[.6,.3,.4]].forEach(p=>add(new T.IcosahedronGeometry(.32,1),lf,p[0],p[1],p[2]));break;
    case'comms':add(new T.CylinderGeometry(.1,.14,2.6),Dk,0,1.3,0);const dish=add(new T.SphereGeometry(1.1,32,12,0,6.283,0,1.0),new T.MeshStandardMaterial({color:0xe3e8ef,side:T.DoubleSide,metalness:.3}),0,2.9,0,Math.PI*.8);dish.scale.y=.5;break;
  }
  const beam=new T.Mesh(new T.CylinderGeometry(.12,.12,9,12,1,true),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false}));beam.position.y=4.5;G.add(beam);
  const halo=new T.Mesh(new T.TorusGeometry(.55,.06,8,32),new T.MeshBasicMaterial({color:0xffffff}));halo.position.y=3.6;G.add(halo);
  const ck=new T.Mesh(new T.OctahedronGeometry(.32),new T.MeshStandardMaterial({color:0x3ad6a6,emissive:0x1a6b53}));ck.position.y=3.6;G.add(ck);
  const lb=label(g.ic+'  '+tx(g.n),'#69a8ff');lb.position.y=4.7;G.add(lb);
  G.userData={goal:g.id,beam,halo,ck,lb};G.traverse(o=>{o.userData.goal=g.id});return G}
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
  const T=THREE,m=AV.map,h=m.hero,u=h.userData,slow=lvCard('sleep')>0,sp=(slow?3.2:4.4)*dt;
  // ввод
  let vx=0,vz=0;const K=AV.keys;if(K.w||K.arrowup)vz-=1;if(K.s||K.arrowdown)vz+=1;if(K.a||K.arrowleft)vx-=1;if(K.d||K.arrowright)vx+=1;
  let moving=false;
  if(vx||vz){m.target=null;m.marker.visible=false;const s=Math.sin(m.yaw),c=Math.cos(m.yaw),dx=vx*c+vz*s,dz=-vx*s+vz*c,l=Math.hypot(dx,dz);m.pos.x+=dx/l*sp;m.pos.z+=dz/l*sp;m.dir=Math.atan2(dx,dz);moving=true}
  else if(m.target){const dx=m.target.x-m.pos.x,dz=m.target.z-m.pos.z,l=Math.hypot(dx,dz);if(l<.15){m.target=null;m.marker.visible=false}else{const st=Math.min(sp,l);m.pos.x+=dx/l*st;m.pos.z+=dz/l*st;m.dir=Math.atan2(dx,dz);moving=true}}
  const r=Math.hypot(m.pos.x,m.pos.z);if(r>33){m.pos.x*=33/r;m.pos.z*=33/r}
  if(r<3.6){const k=3.6/Math.max(r,.01);m.pos.x*=k;m.pos.z*=k}
  h.position.set(m.pos.x,H(m.pos.x,m.pos.z),m.pos.z);
  let dd=m.dir-h.rotation.y;dd=Math.atan2(Math.sin(dd),Math.cos(dd));h.rotation.y+=dd*Math.min(1,dt*10);
  m.walk=moving?m.walk+dt*(slow?7:9):m.walk*.85;const sw=moving?Math.sin(m.walk)*.6:0;
  u.lL.rotation.x=sw;u.lR.rotation.x=-sw;u.aL.rotation.x=-sw*.8;u.aR.rotation.x=sw*.8;
  const wc=new T.Color(AVC[worst()]);u.patch.material.color.copy(wc);u.patch.material.emissive.copy(wc);u.aura.material.color.copy(wc);u.aura.scale.setScalar(1+.08*Math.sin(tm*3));
  // станции
  for(const o of mapGoals()){const st=m.st[o.g.id];if(!st)continue;const U2=st.userData,c=new T.Color(o.done?'#5d6b80':AVC[o.lv]);
    U2.beam.material.color.copy(c);U2.beam.visible=!o.done;U2.halo.material.color.copy(c);U2.halo.rotation.x=Math.PI/2;U2.halo.rotation.z=tm*1.5;U2.halo.position.y=3.6+Math.sin(tm*2+o.x)*.15;
    U2.halo.visible=!o.done;U2.ck.visible=o.done;U2.ck.rotation.y=tm;U2.halo.scale.setScalar(o.lv?1+.15*Math.sin(tm*5):1)}
  // маршрут раз в 0,3 с
  if(!m.rt||tm-m.rt>.3){m.rt=tm;mapRouteDraw();mapCard();if(!m.lt||tm-m.lt>.5){m.lt=tm;avDistUpd()}}
  // камера
  const cam=m.cam,tgt=h.position.clone().add(new T.Vector3(0,1.2,0));
  if(AV.xr){m.rig.position.set(h.position.x-Math.sin(m.yaw)*5,h.position.y,h.position.z-Math.cos(m.yaw)*5)}
  else{const cp=new T.Vector3(tgt.x+Math.sin(m.yaw)*Math.cos(m.pitch)*m.dist,tgt.y+Math.sin(m.pitch)*m.dist,tgt.z+Math.cos(m.yaw)*Math.cos(m.pitch)*m.dist);
    cp.y=Math.max(cp.y,H(cp.x,cp.z)+.6);cam.position.lerp(cp,Math.min(1,dt*6));cam.lookAt(tgt)}
  m.sun.position.set(h.position.x+30,45,h.position.z+20);m.sun.target.position.copy(h.position);m.sun.target.updateMatrixWorld();
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
