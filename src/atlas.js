/* ===== 3D-атлас анатомии: реальные модели BodyParts3D (open-anatomy-3d, CC BY 4.0) =====
   Модели лежат в models/anatomy-*.js (GLB в base64), подгружаются тегом <script>, поэтому работают и с file://.
   Если модель не загрузилась, атлас собирает упрощённую фигуру из anat3d.js. */
const ATLAS_NAMES=/*NAMES*/{};
const ATLAS_CREDIT='Anatomy: BodyParts3D © DBCLS (CC BY 4.0); HuBMAP HRA (CC BY 4.0); MakeHuman (CC0); open-anatomy-3d (CC BY 4.0)';
const ATLAS_SYS={skin:'skin',skeleton:'skel',muscles:'mus',organs:'org',vessels:'vess',nerves:'nerv'};
const ATLAS_PT={skull:'skull',mandible:'skull',teeth:'skull',spine_cervical:'spine',spine_thoracic:'spine',spine_lumbar:'spine',ribs:'ribs',sternum:'ribs',clavicle:'shoulder',scapula:'shoulder',
  pelvis:'pelvis',femur:'femur',patella:'shin',lower_leg:'shin',humerus:'arm',forearm:'arm',hand:'hand',foot:'foot',
  chest_muscles:'chest',abdominal_muscles:'abs',pelvic_floor:'abs',intercostals:'obliq',diaphragm:'obliq',back_muscles:'back',trapezius:'back',neck_muscles:'back',gluteal:'glutes',
  quadriceps:'quads',adductors:'quads',iliopsoas:'quads',hamstrings:'hams',calf:'calves',shin_muscles:'calves',foot_muscles:'calves',deltoid:'delts',rotator_cuff:'delts',shoulder_muscles:'delts',
  upper_arm_muscles:'biceps triceps',forearm_muscles:'forearm',hand_muscles:'forearm',
  arteries_arm:'art_arm',arteries_leg:'art_leg',veins_leg:'vein_leg',veins_arm:'vein_arm',vena_cava_inferior:'vena',vena_cava_superior:'vena',veins_thorax:'vena',veins_abdomen:'vena',veins_pelvis:'vena',pulmonary_vessels:'vena',
  aorta:'aorta',arteries_abdomen:'aorta',arteries_thorax:'aorta',arteries_head:'aorta',arteries_pelvis:'aorta',carotid:'aorta',coronary_arteries:'aorta',
  brain:'brain',brainstem:'brain',cerebellum:'brain',pituitary:'brain',eye:'eyes',heart:'heart',lung:'lungs',bronchi:'lungs',trachea:'lungs',larynx:'lungs',
  liver:'liver',gallbladder:'liver',pancreas:'liver',spleen:'liver',stomach:'stomach',esophagus:'stomach',small_intestine:'gut',colon:'gut',appendix:'gut',
  kidney:'kidney',adrenal:'kidney',ureter:'kidney',bladder:'bladder',prostate:'bladder',reproductive:'bladder',uterus:'bladder',ovary:'bladder',fallopian_tubes:'bladder',vagina:'bladder'};
const ATLAS_TP={skull:'bone',spine:'spine',ribs:'bone',shoulder:'bone',pelvis:'hip',femur:'hip',shin:'bone',arm:'bone',hand:'bone',foot:'bone',
  chest:'corem',abs:'corem',obliq:'corem',back:'corem',glutes:'legm',quads:'legm',hams:'legm',calves:'legm',delts:'armm',biceps:'armm',triceps:'armm',forearm:'armm',
  aorta:'heart',art_arm:'heart',art_leg:'heart',vein_leg:'heart',vein_arm:'heart',vena:'heart',brain:'brain',eyes:'eyes',heart:'heart',lungs:'lungs',liver:'metab',stomach:'metab',gut:'metab',kidney:'kidney',bladder:'kidney'};
const ATLAS_COL={skin:0xd9a58a,bone:0xe9dfc8,teeth:0xf6f3ea,mus:0xa1342c,diaphragm:0xa84a3c,art:0xc4231f,vein:0x2f54b5,pulmonary_vessels:0x6b4cc0,nerv:0xf0cf4a,
  brain:0xe2a7a3,brainstem:0xd99592,cerebellum:0xd48f8f,pituitary:0xd99592,eye:0xf2f0ec,heart:0x9c2a28,lung:0xe8a0a0,bronchi:0xe8c6b8,trachea:0xe8c6b8,larynx:0xe3bfae,
  liver:0x6b2a22,gallbladder:0x3f7d3a,pancreas:0xe2b07a,spleen:0x6a2f4a,stomach:0xd39079,esophagus:0xc77a6c,small_intestine:0xd69b85,colon:0xc4876f,appendix:0xc4876f,
  kidney:0x7b2e2a,adrenal:0xd9a24a,ureter:0xd6b07a,bladder:0xd8b06a,prostate:0xb9707a,reproductive:0xc9858a,uterus:0xc9737a,ovary:0xe0b2a0,fallopian_tubes:0xd99a9a,vagina:0xc9858a,
  breast:0xf0c8a8,thymus:0xd8b8a0,tongue:0xc46b6b,salivary_glands:0xe0c09a,pharynx:0xd38a80};
const ATLAS_DEPTH={skin:1,mus:2,vess:3,nerv:3,skel:4,org:5};
function atlasData(sex){const k=sex==='F'?'female':'male';return new Promise((res,rej)=>{const A=window.__ANAT;if(A&&A[k])return res(A[k]);
  const s=document.createElement('script');s.src='models/anatomy-'+k+'.js';s.onload=()=>window.__ANAT&&__ANAT[k]?res(__ANAT[k]):rej(new Error('no data'));s.onerror=()=>rej(new Error('load '+s.src));document.head.appendChild(s)})}

class Atlas{
  constructor(){this.ok=false;this.parts=[];this.vis={skin:1,mus:0,skel:1,org:1,vess:0,nerv:0};this.hidden=new Set();this.iso=null;this.sel=null;this.selTp=null;
    this.colorFn=null;this.heat=false;this.pulse=62;this.lang='ru';this.onPick=null;this.tipFn=null;this.markers=[];this.cut=0;this.spin=false;this.sex=null;this.real=false}
  init(){if(this.R)return true;if(!window.THREE)return false;const T=THREE;let R;try{R=new T.WebGLRenderer({antialias:true,alpha:true})}catch(e){return false}
    R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.localClippingEnabled=true;this.R=R;
    const sc=new T.Scene();this.sc=sc;const pm=new T.PMREMGenerator(R);sc.environment=pm.fromScene(new T.RoomEnvironment(),.04).texture;sc.environmentIntensity=.55;
    const cam=new T.PerspectiveCamera(30,1,.02,40);cam.position.set(0,1,3.6);this.cam=cam;
    const oc=new T.OrbitControls(cam,R.domElement);oc.enableDamping=true;oc.dampingFactor=.09;oc.minDistance=.25;oc.maxDistance=7;oc.autoRotateSpeed=1.1;oc.target.set(0,.9,0);oc.update();this.oc=oc;
    sc.add(new T.HemisphereLight(0xeaf2ff,0x2a2230,.55));const k=new T.DirectionalLight(0xfff4ea,2.1);k.position.set(1.5,3,2.5);sc.add(k);
    const f=new T.DirectionalLight(0xcfe0ff,.7);f.position.set(-2,1.5,2);sc.add(f);const rim=new T.DirectionalLight(0x8fb6ff,1.5);rim.position.set(-1,2.5,-3);sc.add(rim);
    const rings=new T.Group();[.5,.38,.26].forEach((r,i)=>{const o=new T.Mesh(new T.TorusGeometry(r,.004,6,96),new T.MeshBasicMaterial({color:i?0x22304a:0x69a8ff,transparent:true,opacity:.8}));o.rotation.x=Math.PI/2;rings.add(o)});sc.add(rings);this.rings=rings;
    this.root=new T.Group();sc.add(this.root);this.mk=new T.Group();sc.add(this.mk);
    this.clip=new T.Plane(new T.Vector3(0,0,-1),9);this.ray=new T.Raycaster();this.clock=new T.Clock();
    this.tip=document.createElement('div');this.tip.className='atlasTip';this.msg=document.createElement('div');this.msg.className='atlasMsg';
    const cv=R.domElement;cv.className='atlasCv';let down=null,lastH=0;
    cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
    cv.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const m=this.pick(e);this.select(m?m.userData.key:null);if(this.onPick)this.onPick(m?m.userData:null)}down=null});
    cv.addEventListener('pointermove',e=>{if(e.buttons||performance.now()-lastH<70)return;lastH=performance.now();const m=this.pick(e);cv.style.cursor=m?'pointer':'grab';this.showTip(m&&m.userData,e)});
    cv.addEventListener('pointerleave',()=>{this.tip.style.display='none'});
    new ResizeObserver(()=>this.resize()).observe(cv);return true}
  name(u){if(!u)return'';const n=ATLAS_NAMES[u.base]||(typeof ANAT_PARTS!=='undefined'&&ANAT_PARTS[u.sys]&&ANAT_PARTS[u.sys][u.pts&&u.pts[0]]?[ANAT_PARTS[u.sys][u.pts[0]],ANAT_PARTS[u.sys][u.pts[0]]]:[u.key,u.key]),ru=this.lang==='ru'||this.lang==='kk';
    return(ru?n[0]:n[1])+(u.side?(ru?(u.side==='l'?' (лев.)':' (прав.)'):(u.side==='l'?' (L)':' (R)')):'')}
  showTip(u,e){const t=this.tip;if(!u){t.style.display='none';return}const r=this.R.domElement.getBoundingClientRect();t.style.display='block';
    t.style.left=Math.min(e.clientX-r.left+14,r.width-180)+'px';t.style.top=(e.clientY-r.top+12)+'px';t.innerHTML=this.tipFn?this.tipFn(u):this.name(u)}
  mount(el){if(!this.init()){el.innerHTML='<p style="padding:1rem">WebGL недоступен / WebGL is unavailable.</p>';return false}
    if(this.R.domElement.parentElement!==el){el.prepend(this.R.domElement);el.appendChild(this.tip);el.appendChild(this.msg)}this.resize();this.start();return true}
  unmount(){this.stop();if(this.R){this.R.domElement.remove();this.tip.remove();this.msg.remove()}}
  resize(){if(!this.R)return;const p=this.R.domElement.parentElement;if(!p)return;const w=p.clientWidth,h=p.clientHeight;if(!w||!h)return;this.R.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
  start(){if(!this.run){this.run=true;this.R.setAnimationLoop(()=>this.tick())}}
  stop(){if(this.run){this.run=false;this.R.setAnimationLoop(null)}}
  async load(sex){sex=sex||'M';if(!this.init())return false;if(this.sex===sex&&this.ok)return true;this.sex=sex;const my=this.loadId=(this.loadId||0)+1;
    this.msg.textContent=this.lang==='ru'||this.lang==='kk'?'Загрузка 3D-атласа…':'Loading 3D atlas…';this.msg.style.display='block';
    try{const b64=await atlasData(sex);const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;await THREE.MeshoptDecoder.ready;
      const L=new THREE.GLTFLoader();L.setMeshoptDecoder(THREE.MeshoptDecoder);const g=await new Promise((res,rej)=>L.parse(bin,'',res,rej));if(my!==this.loadId)return false;this.real=true;this.buildReal(g.scene)}
    catch(e){console.warn('atlas: fallback to simple figure',e);if(my!==this.loadId)return false;this.buildSimple();this.real=false}
    this.msg.style.display='none';this.ok=true;this.frame();this.apply();return true}
  clear(){this.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});this.root.clear();this.parts=[];this.heart=null;this.lungs=[];this.heartP=null;this.lungsP=[]}
  mat(sys,base,col){const T=THREE,cp=[this.clip];
    if(sys==='skin')return new T.MeshPhysicalMaterial({color:col,roughness:.5,sheen:.6,sheenColor:0xffd2bd,sheenRoughness:.5,transparent:true,opacity:1,clippingPlanes:cp});
    if(sys==='mus')return new T.MeshPhysicalMaterial({color:col,roughness:.38,clearcoat:.45,clearcoatRoughness:.35,sheen:.35,sheenColor:0xff9a8a,transparent:true,clippingPlanes:cp});
    if(sys==='skel')return new T.MeshPhysicalMaterial({color:col,roughness:.55,clearcoat:.15,sheen:.2,sheenColor:0xfff1d6,transparent:true});
    if(sys==='vess')return new T.MeshPhysicalMaterial({color:col,roughness:.3,clearcoat:.6,clearcoatRoughness:.2,transparent:true});
    if(sys==='nerv')return new T.MeshPhysicalMaterial({color:col,roughness:.35,clearcoat:.4,emissive:0x332800,transparent:true});
    return new T.MeshPhysicalMaterial({color:col,roughness:.36,clearcoat:.55,clearcoatRoughness:.3,sheen:.3,transparent:true})}
  buildReal(scene){this.clear();const T=THREE;scene.updateMatrixWorld(true);const ms=[];scene.traverse(o=>{if(o.isMesh)ms.push(o)});
    ms.forEach(m=>{let n=m;while(n.parent&&!ATLAS_SYS[n.parent.name])n=n.parent;const sys=ATLAS_SYS[n.parent&&n.parent.name]||'org',key=n.name.replace(/_\d+$/,''),side=(key.match(/_([lr])$/)||[])[1]||null,base=key.replace(/_[lr]$/,'');
      const pt=ATLAS_PT[base],pts=pt?pt.split(' '):null,tp=pts?ATLAS_TP[pts[0]]:(sys==='nerv'?'brain':null);
      const col=sys==='skin'?ATLAS_COL.skin:sys==='skel'?(base==='teeth'?ATLAS_COL.teeth:ATLAS_COL.bone):sys==='mus'?(ATLAS_COL[base]||ATLAS_COL.mus):sys==='nerv'?ATLAS_COL.nerv:
        sys==='vess'?(ATLAS_COL[base]||(/vein|vena/.test(base)?ATLAS_COL.vein:ATLAS_COL.art)):(ATLAS_COL[base]||0xcc8f80);
      if(sys==='org'||sys==='vess'||sys==='nerv')this.clean(m,sys==='org'?.05:.09);
      m.material=this.mat(sys,base,col);m.userData={key,base,side,sys,pts,tp,base0:new T.Color(col),op0:1};this.root.attach(m);this.parts.push(m)});
    this.parts.filter(m=>m.userData.base==='lung').forEach(m=>{const u=m.userData;u.key+='_tree';u.base='bronchi';const sh=this.lungShell(m);
      sh.material=this.mat('org','lung',ATLAS_COL.lung);sh.material.side=T.DoubleSide;sh.userData={key:m.name,base:'lung',side:u.side,sys:'org',pts:['lungs'],tp:'lungs',base0:new T.Color(ATLAS_COL.lung),op0:.62};this.root.add(sh);this.parts.push(sh)});
    this.post()}
  clean(m,max){const g=m.geometry,ix=g.index;if(!ix)return;const P=g.attributes.position,k=m.matrixWorld.getMaxScaleOnAxis(),A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),out=[];
    const E=new Float32Array(ix.count/3);for(let i=0,j=0;i<ix.count;i+=3,j++){A.fromBufferAttribute(P,ix.getX(i));B.fromBufferAttribute(P,ix.getX(i+1));C.fromBufferAttribute(P,ix.getX(i+2));E[j]=Math.max(A.distanceTo(B),B.distanceTo(C),C.distanceTo(A))*k}
    const med=Float32Array.from(E).sort()[E.length>>1],lim=Math.min(max,med*5);
    for(let i=0,j=0;i<ix.count;i+=3,j++)if(E[j]<=lim)out.push(ix.getX(i),ix.getX(i+1),ix.getX(i+2));
    if(out.length<ix.count)g.setIndex(out)}
  lungShell(m){const T=THREE,P=m.geometry.attributes.position,w=m.matrixWorld,box=new T.Box3().setFromObject(m),c=new T.Vector3(),sz=new T.Vector3();box.getCenter(c);box.getSize(sz);
    const L=Math.max(sz.x,sz.y,sz.z)+.06,mc=new T.MarchingCubes(44,new T.MeshBasicMaterial(),false,false,120000),v=new T.Vector3(),step=Math.max(1,Math.floor(P.count/700));mc.isolation=80;
    for(let i=0;i<P.count;i+=step){v.fromBufferAttribute(P,i).applyMatrix4(w);mc.addBall((v.x-c.x)/L+.5,(v.y-c.y)/L+.5,(v.z-c.z)/L+.5,.07,12)}
    mc.update();const n=mc.count,g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(mc.positionArray.slice(0,n*3),3));g.setAttribute('normal',new T.BufferAttribute(mc.normalArray.slice(0,n*3),3));
    const sh=new T.Mesh(g);sh.position.copy(c);sh.scale.setScalar(L/2);sh.name=m.name;mc.geometry.dispose();return sh}
  buildSimple(){this.clear();const L={};['skin','mus','skel','org','vess'].forEach(n=>{const g=new THREE.Group();g.name=n;this.root.add(g);L[n]=g});const r=anatBuild(THREE,this.clip,L);
    this.root.updateMatrixWorld(true);const all=[];this.root.traverse(m=>{if(m.isMesh)all.push(m)});all.forEach(m=>{const u=m.userData;this.root.attach(m);
      m.material=m.material.clone();m.material.transparent=true;const sys=u.sys||'skin';m.userData={key:(u.pt||sys)+'_'+m.id,base:u.pt||sys,side:null,sys,pts:u.pt?[u.pt]:null,tp:u.tp||null,base0:m.material.color.clone()};this.parts.push(m)});
    this.post()}
  post(){const T=THREE;this.root.updateMatrixWorld(true);const ctr=m=>{const c=new T.Vector3();new T.Box3().setFromObject(m).getCenter(c);const g=new T.Group();g.position.copy(c);this.root.add(g);g.updateMatrixWorld(true);g.attach(m);return g};
        this.heart=this.parts.find(m=>m.userData.base==='heart'||(m.userData.pts&&m.userData.pts[0]==='heart'&&m.userData.sys==='org'));if(this.heart)this.heartP=ctr(this.heart);
    this.lungs=this.parts.filter(m=>m.userData.base==='lung'||/_tree$/.test(m.userData.key)||(!this.real&&m.userData.sys==='org'&&m.userData.pts&&m.userData.pts[0]==='lungs'));this.lungsP=this.lungs.map(ctr);
    const b=new T.Box3();this.parts.forEach(m=>b.expandByObject(m));this.box=b;this.H=b.max.y-b.min.y;this.rings.position.y=b.min.y-.005}
  frame(v='front'){if(!this.box)return;const c=new THREE.Vector3();this.box.getCenter(c);const H=this.H,y0=this.box.min.y;
    const tf=Math.tan(this.cam.fov*Math.PI/360),D=Math.max(H*.6/tf,H*.18/(tf*this.cam.aspect)),P={front:[0,c.y,D,0],side:[D,c.y,0,0],back:[0,c.y,-D,0],head:[0,y0+H*.92,D*.24,y0+H*.92],chest:[0,y0+H*.72,D*.42,y0+H*.72],belly:[0,y0+H*.58,D*.42,y0+H*.58],legs:[0,y0+H*.3,D*.6,y0+H*.3]}[v]||[0,c.y,D,0];
    this.oc.target.set(0,P[3]||c.y,0);this.cam.position.set(P[0],P[1],P[2]);this.oc.update()}
  setVis(v){this.vis=Object.assign({skin:0,mus:0,skel:0,org:0,vess:0,nerv:0},v);this.apply()}
  setLevel(n){const v={};for(const k in ATLAS_DEPTH)v[k]=ATLAS_DEPTH[k]>=n?1:0;v.skin=n<=1?1:.08;if(n===3)v.nerv=1;this.setVis(v);this.level=n}
  setCut(x){this.cut=x;this.clip.constant=x>0?(this.box?this.box.max.z:.15)-x*.32:9}
  apply(){for(const m of this.parts){const u=m.userData,v=this.vis[u.sys]||0,on=v>0&&!this.hidden.has(u.key)&&(!this.iso||this.iso===u.key);m.visible=on;
    const op=(u.sys==='skin'?Math.min(v,this.skinOp??1):v)*(u.op0??1),gh=on&&op<1;m.material.opacity=op;if(m.material.transparent!==gh){m.material.transparent=gh;m.material.needsUpdate=true}m.material.depthWrite=!gh;m.renderOrder=gh?(u.sys==='skin'?4:2):0;
    if(gh&&!u.twin){u.twin=new THREE.Mesh(m.geometry,new THREE.MeshBasicMaterial({colorWrite:false,transparent:true,clippingPlanes:[this.clip]}));m.add(u.twin)}
    if(u.twin){u.twin.visible=gh;u.twin.renderOrder=m.renderOrder-.5}}}
  select(key){this.sel=key;const m=this.parts.find(p=>p.userData.key===key);this.selTp=m?m.userData.tp:null}
  hideSel(){if(this.sel){this.hidden.add(this.sel);this.sel=null;this.apply()}}
  isoSel(){if(this.sel){this.iso=this.iso===this.sel?null:this.sel;this.apply()}}
  showAll(){this.hidden.clear();this.iso=null;this.apply()}
  pick(e){if(!this.ok)return null;const r=this.R.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.cam);
    const list=this.parts.filter(m=>m.visible&&(m.material.opacity>=.5||m.userData.base==='lung')),hs=this.ray.intersectObjects(list,false);
    for(const h of hs){if(this.cut>0&&h.point.z>this.clip.constant&&(h.object.userData.sys==='skin'||h.object.userData.sys==='mus'))continue;return h.object}return null}
  pickAt(key){const m=this.parts.find(p=>p.userData.key===key||p.userData.base===key);if(!m)return null;const v=new THREE.Vector3();new THREE.Box3().setFromObject(m).getCenter(v);return v}
  setMarkers(list){const T=THREE;this.mk.clear();(list||[]).forEach(x=>{const m=this.parts.find(p=>p.userData.pts&&p.userData.pts.includes(x.pt)&&p.userData.sys!=='skin');if(!m)return;
    const b=new T.Box3().setFromObject(m),c=new T.Vector3();b.getCenter(c);c.z=b.max.z+.01;
    const s=new T.Mesh(new T.SphereGeometry(.02+x.lv*.003,16,12),new T.MeshBasicMaterial({color:['#3ad6a6','#ffb224','#ff5f4c'][x.lv>=7?2:x.lv>=4?1:0],transparent:true,opacity:.9,depthTest:false}));s.renderOrder=9;s.position.copy(c);this.mk.add(s)})}
  tick(){const t=this.clock.getElapsedTime(),T=THREE;if(this.ok){
    const ph=(t*this.pulse/60)%1,beat=1+.07*Math.pow(Math.max(0,Math.sin(ph*Math.PI*2)),6);if(this.heartP)this.heartP.scale.setScalar(beat);
    const br=1+.035*Math.sin(t*1.5);(this.lungsP||[]).forEach(l=>l.scale.set(1+(br-1)*.6,br,br));
    for(const m of this.parts){const u=m.userData,M=m.material;if(!m.visible)continue;const lv=this.colorFn?this.colorFn(u):null,sel=this.sel&&u.key===this.sel,selT=!sel&&this.selTp&&u.tp===this.selTp&&u.sys!=='skin';
      if(this.heat&&lv!=null&&u.sys!=='skin')M.color.copy(u.base0).lerp(new T.Color(['#3ad6a6','#ffb224','#ff5f4c'][lv]),lv?.85:.45);else M.color.copy(u.base0);
      if(sel){M.emissive.set('#69a8ff');M.emissiveIntensity=.45+.2*Math.sin(t*6)}else if(lv>0){M.emissive.set(lv===2?'#ff3b2a':'#ffa21a');M.emissiveIntensity=lv===2?.32+.28*Math.sin(t*5):.18+.08*Math.sin(t*3)}
      else if(selT){M.emissive.set('#69a8ff');M.emissiveIntensity=.18}else{M.emissive.set(u.sys==='nerv'?'#332800':'#000');M.emissiveIntensity=1}}
    this.mk.children.forEach((s,i)=>s.scale.setScalar(1+.25*Math.sin(t*4+i)))}
    this.oc.autoRotate=!!this.spin;this.oc.update();this.R.render(this.sc,this.cam)}
}
const ATLAS=new Atlas();
