/* ===== 3D-колония для карты целей: low-poly рельеф, город на опорах, монорельс, корабли (всё процедурно) ===== */
const COL3={craters:[],anim:[],blink:[]};
const sstep=(a,b,v)=>{const q=clamp((v-a)/(b-a),0,1);return q*q*(3-2*q)};
function H(x,z){if(AV.map&&AV.map.flat)return 0;const r=Math.hypot(x,z);
  const n=Math.sin(x*.15)*Math.cos(z*.13)*.6+Math.sin(x*.37+z*.21)*.25+Math.sin(z*.5-x*.3)*.1;
  const rd=1-Math.abs(Math.sin(x*.045+Math.cos(z*.03)*1.7)*Math.cos(z*.05-x*.012));
  let h=n*.22+sstep(36,54,r)*(n*2.4+2.6)+sstep(50,100,r)*(rd*rd*24+Math.sin(x*.11)*Math.cos(z*.09)*5);
  for(const c of COL3.craters){const d=Math.hypot(x-c[0],z-c[1])/c[2];if(d<1)h-=c[3]*(1-d*d);else if(d<1.4)h+=c[3]*.45*Math.max(0,1-Math.abs(d-1.15)/.25)}
  return h}
/* общие материалы и помощники */
function colMats(){const T=THREE,M=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.62,metalness:.12,flatShading:true},o));
  return{W:M(0xE9E5DE),W2:M(0xCFCBC4),G:M(0x8E939B),D:M(0x3B4049,{roughness:.5,metalness:.35}),K:M(0x24282F,{roughness:.4,metalness:.5}),
    Cy:M(0x6FE6FF,{emissive:0x2FC7F0,emissiveIntensity:1.4}),Or:M(0xFFB04A,{emissive:0xFF8A1E,emissiveIntensity:1.5}),Win:M(0xFFE1A8,{emissive:0xFFC46B,emissiveIntensity:1.1}),
    Red:M(0xE8452F,{emissive:0x9A1C10,emissiveIntensity:.6}),Sol:M(0x1E2C4A,{roughness:.25,metalness:.6}),Gl:new T.MeshPhysicalMaterial({color:0xBDEBFF,roughness:.08,metalness:0,transparent:true,opacity:.28,depthWrite:false}),
    Pl:M(0x5FBF6A,{roughness:.8}),Ylw:M(0xF2C230,{emissive:0x5a4300})}}
function mk(geo,mat,x,y,z,rx,ry,rz,sx,sy,sz){const o=new THREE.Mesh(geo,mat);o.position.set(x||0,y||0,z||0);o.rotation.set(rx||0,ry||0,rz||0);if(sx)o.scale.set(sx,sy||sx,sz||sx);o.castShadow=true;o.receiveShadow=true;return o}
/* жилой модуль на опорах (как на референсе) */
function podGeo(){if(COL3.pod)return COL3.pod;const T=THREE;COL3.pod={body:new T.CylinderGeometry(1.25,1.1,1.1,8),roof:new T.CylinderGeometry(.95,1.28,.35,8),cap:new T.CylinderGeometry(.5,.7,.25,8),
  band:new T.CylinderGeometry(1.27,1.27,.18,8,1,true),leg:new T.CylinderGeometry(.07,.09,1,5)};return COL3.pod}
function podsInstanced(list,MT){const T=THREE,P=podGeo(),n=list.length,parts=[[P.body,MT.W],[P.roof,MT.W2],[P.cap,MT.G],[P.band,MT.Win]],grp=new T.Group(),m4=new T.Matrix4(),q=new T.Quaternion(),s=new T.Vector3(1,1,1),v=new T.Vector3();
  parts.forEach(([g,mat],pi)=>{const im=new T.InstancedMesh(g,mat,n);im.castShadow=im.receiveShadow=true;list.forEach((p,i)=>{const k=p.s||1,yb=p.y+p.h;const off=[.55,1.27,1.5,.75][pi]*k;q.setFromAxisAngle(new T.Vector3(0,1,0),p.a);v.set(p.x,yb+off,p.z);m4.compose(v,q,new T.Vector3(k,k,k));im.setMatrixAt(i,m4)});grp.add(im)});
  const legs=new T.InstancedMesh(P.leg,MT.D,n*4);legs.castShadow=true;let k=0;list.forEach(p=>{const ks=p.s||1;for(let j=0;j<4;j++){const a=p.a+j*Math.PI/2+.4;v.set(p.x+Math.cos(a)*.85*ks,p.y+p.h/2,p.z+Math.sin(a)*.85*ks);m4.compose(v,q.identity(),new T.Vector3(ks,p.h,ks));legs.setMatrixAt(k++,m4)}});grp.add(legs);return grp}
/* мир */
function mapWorld(){
  const T=THREE,m=AV.map,d=D(),sk=d.sky,key=S.dest+LANG;if(m.key===key)return;m.key=key;
  m.world.traverse(o=>{if(o.geometry)o.geometry.dispose()});m.world.clear();m.flat=d.kind!=='surface';COL3.anim=[];COL3.blink=[];const MT=COL3.M=COL3.M||colMats();
  const c3=a=>new T.Color(a[0]/255,a[1]/255,a[2]/255),r=rng(11);
  COL3.craters=m.flat?[]:[...Array(26)].map((_,i)=>{const a=r()*6.283,dd=i<6?24+r()*7:36+r()*48,rad=i<6?1.4+r()*1.4:2.5+r()*6;return[Math.cos(a)*dd,Math.sin(a)*dd,rad,rad*.32]}).filter(c=>!AVG.some((g,j)=>Math.hypot(c[0]-stPos(j).x,c[1]-stPos(j).z)<c[2]+4));
  // небо и туман
  const top=c3(sk.top),hor=c3(sk.hor),sg=new T.SphereGeometry(400,40,20),col=[];
  for(let i=0;i<sg.attributes.position.count;i++){const y=sg.attributes.position.getY(i)/400,c=hor.clone().lerp(top,clamp(Math.pow(Math.max(y,0),.6)*1.3,0,1));col.push(c.r,c.g,c.b)}
  sg.setAttribute('color',new T.Float32BufferAttribute(col,3));m.world.add(new T.Mesh(sg,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,depthWrite:false,fog:false})));
  m.sc.fog=new T.Fog(hor.clone().lerp(new T.Color(0xffffff),.08),m.flat?120:70,m.flat?380:230);
  if(sk.star>0){const p=[];for(let i=0;i<1400;i++){const u=r()*2-1,a=r()*6.283,q=Math.sqrt(1-u*u);if(u<.12)continue;p.push(q*Math.cos(a)*380,u*380,q*Math.sin(a)*380)}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));m.world.add(new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.3,sizeAttenuation:false,transparent:true,opacity:sk.star*.8,fog:false})))}
  if(m.flat){const pl=new T.Mesh(new T.SphereGeometry(140,48,32),new T.MeshStandardMaterial({color:S.dest==='iss'?0x2f6fc0:0x24304f,roughness:.8,emissive:S.dest==='iss'?0x0a2350:0}));pl.position.set(-60,-170,-220);pl.material.fog=false;m.world.add(pl)}
  const sc=sk.sun[1];m.sun.color.setRGB(sc[0]/255,sc[1]/255,sc[2]/255);m.sun.intensity=2.7;m.hemi.color.copy(hor.clone().lerp(new T.Color(0xffffff),.35));m.hemi.groundColor.copy(c3((sk.gnd||[[90,90,96]])[0]).multiplyScalar(.45));
  // гранёный рельеф
  const gnd=sk.gnd||[[132,136,146],[78,82,92]],ga=c3(gnd[0]),gb=c3(gnd[1]),gc=ga.clone().lerp(new T.Color(0xffffff),.16);
  const tg=new T.PlaneGeometry(240,240,m.flat?24:120,m.flat?24:120).toNonIndexed();tg.rotateX(-Math.PI/2);const ps=tg.attributes.position,tc=[];
  for(let i=0;i<ps.count;i++)ps.setY(i,H(ps.getX(i),ps.getZ(i)));
  for(let i=0;i<ps.count;i+=3){const y=(ps.getY(i)+ps.getY(i+1)+ps.getY(i+2))/3,j=r();let c;
    if(m.flat){const x=ps.getX(i),z=ps.getZ(i);c=new T.Color(Math.hypot(x,z)<36?0x5c626d:0x3a3f48).multiplyScalar(.85+j*.2)}
    else c=gb.clone().lerp(ga,clamp(.35+y*.04+j*.35,0,1)).lerp(gc,y>8?clamp((y-8)/18,0,.7)*j:0);
    for(let k=0;k<3;k++)tc.push(c.r,c.g,c.b)}
  tg.setAttribute('color',new T.Float32BufferAttribute(tc,3));tg.computeVertexNormals();
  const ground=new T.Mesh(tg,new T.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:m.flat?.3:0,flatShading:true}));ground.receiveShadow=true;ground.name='ground';m.world.add(ground);m.ground=ground;
  // камни
  if(!m.flat){const rg=new T.DodecahedronGeometry(1,0),rm=new T.MeshStandardMaterial({color:gb,roughness:1,flatShading:true}),N=140,im=new T.InstancedMesh(rg,rm,N),m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler();let k=0;
    for(let i=0;i<N*2&&k<N;i++){const a=r()*6.283,dd=7+r()*44,x=Math.cos(a)*dd,z=Math.sin(a)*dd;if(AVG.some((g,j)=>Math.hypot(x-stPos(j).x,z-stPos(j).z)<4.5)||Math.abs(dd-28)<2.5)continue;
      const s=.15+r()*r()*1.3;e.set(r()*3,r()*3,0);q.setFromEuler(e);m4.compose(new T.Vector3(x,H(x,z)+s*.2,z),q,new T.Vector3(s,s*.65,s*(.8+r()*.4)));im.setMatrixAt(k++,m4)}
    im.count=k;im.castShadow=im.receiveShadow=true;m.world.add(im)}
  colonyHub(m,MT,r);
  AVG.forEach((g,j)=>{const p=stPos(j);m.world.add(road(0,0,p.x,p.z));const st=station(g);st.position.set(p.x,H(p.x,p.z),p.z);st.lookAt(0,st.position.y,0);m.world.add(st);m.st[g.id]=st});
  m.hero.position.copy(m.pos).setY(H(m.pos.x,m.pos.z));
}
/* центр колонии, кольцо жилых модулей, монорельс, солнечная ферма, корабли */
function colonyHub(m,MT,r){const T=THREE,W=m.world,y0=H(0,0);
  // площадка и чаша-арена
  W.add(mk(new T.CylinderGeometry(6.2,6.6,.4,12),MT.G,0,y0+.1,0));
  const ar=new T.LatheGeometry([[5.2,0],[5.6,0],[5.9,.9],[5.7,1.05],[5.3,.95],[5.05,.2]].map(p=>new T.Vector2(p[0],p[1])),24);W.add(mk(ar,MT.W,0,y0+.3,0));
  W.add(mk(new T.TorusGeometry(5.65,.06,6,48),MT.Cy,0,y0+1.32,0,Math.PI/2));
  // главная башня с плавниками
  const tw=new T.Group();tw.position.set(0,y0+.3,0);W.add(tw);
  [[0,2.2,1.7,6],[6,1.8,1.4,5],[11,1.4,1.1,4],[15,.9,.8,2.5]].forEach(([y,w,dd,h],i)=>{tw.add(mk(new T.BoxGeometry(w,h,dd),i%2?MT.W2:MT.W,0,y+h/2,0));
    tw.add(mk(new T.BoxGeometry(.12,h*.85,.04),MT.Cy,w*.32,y+h/2,dd/2+.02));tw.add(mk(new T.BoxGeometry(.12,h*.85,.04),MT.Cy,-w*.32,y+h/2,dd/2+.02))});
  tw.add(mk(new T.BoxGeometry(4.2,.35,.5),MT.W,0,15.6,0));tw.add(mk(new T.BoxGeometry(.5,.35,3.6),MT.W,0,15.6,0));
  tw.add(mk(new T.CylinderGeometry(.04,.04,3),MT.D,0,19,0));const bl=mk(new T.SphereGeometry(.18,8,6),MT.Red,0,20.5,0);tw.add(bl);COL3.blink.push(bl);
  // вторые башни
  [[-3.6,-2.2,9],[3.4,-2.8,11],[2.8,3.1,7.5]].forEach(([x,z,h],i)=>{const t=mk(new T.BoxGeometry(1.3,h,1.3),MT.W,x,y0+h/2+.3,z);W.add(t);W.add(mk(new T.BoxGeometry(.1,h*.85,.06),MT.Cy,x+.3,y0+h/2+.3,z+.66));W.add(mk(new T.BoxGeometry(.1,h*.85,.06),MT.Cy,x-.3,y0+h/2+.3,z+.66));
    W.add(mk(new T.CylinderGeometry(.9,.9,.25,8),MT.D,x,y0+h+.45,z))});
  // кольцо жилых модулей на опорах — между дорогами к станциям
  const pods=[],angs=AVG.map((g,j)=>Math.atan2(stPos(j).z,stPos(j).x));
  for(let ring=0;ring<2;ring++){const R=ring?12.6:9.2,n=ring?22:15;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+ring*.13;if(angs.some(b=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))<(ring?.17:.22)))continue;
    const x=Math.cos(a)*R,z=Math.sin(a)*R;pods.push({x,z,y:H(x,z),h:1.1+((i*7+ring*3)%4)*.4,a:r()*6,s:.72})}}
  W.add(podsInstanced(pods,MT));COL3.pods=pods;
  // монорельс по кольцу
  const RR=28,yr=3.4;W.add(mk(new T.TorusGeometry(RR,.16,6,160),MT.G,0,yr,0,Math.PI/2));W.add(mk(new T.TorusGeometry(RR,.05,4,160),MT.Cy,0,yr+.17,0,Math.PI/2));
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2,x=Math.cos(a)*RR,z=Math.sin(a)*RR,h=yr-H(x,z);W.add(mk(new T.CylinderGeometry(.12,.18,h,6),MT.D,x,H(x,z)+h/2,z));W.add(mk(new T.BoxGeometry(.9,.18,.5),MT.W2,x,yr-.12,z,0,-a))}
  const train=new T.Group();for(let c=0;c<4;c++){const car=new T.Group();car.add(mk(new T.CapsuleGeometry(.42,1.5,4,8),c?MT.W:MT.W2,0,0,0,0,0,Math.PI/2));car.add(mk(new T.BoxGeometry(1.4,.16,.86),MT.Cy,0,.12,0));car.userData.k=c;train.add(car)}
  W.add(train);COL3.anim.push((dt,t)=>{train.children.forEach(car=>{const a=t*.12-car.userData.k*.075,x=Math.cos(a)*RR,z=Math.sin(a)*RR;car.position.set(x,yr+.55,z);car.rotation.y=-a})});
  // кольцевая дорога и роверы
  const rr=new T.Mesh(new T.RingGeometry(30.6,31.8,96),new T.MeshStandardMaterial({color:0xD9C7B4,roughness:1,transparent:true,opacity:.22,depthWrite:false}));rr.rotation.x=-Math.PI/2;rr.position.y=.06;if(!m.flat)W.add(rr);
  for(let i=0;i<3;i++){const rv=new T.Group();rv.add(mk(new T.BoxGeometry(1.3,.45,.8),i===1?MT.Red:MT.W,0,.45,0));rv.add(mk(new T.BoxGeometry(.5,.35,.7),MT.D,.25,.85,0));
    [[-.45,.4],[.45,.4],[-.45,-.4],[.45,-.4]].forEach(([x,z])=>rv.add(mk(new T.CylinderGeometry(.2,.2,.16,8),MT.K,x,.2,z,Math.PI/2)));W.add(rv);
    const ph=i*2.1,sp=.05+i*.012;COL3.anim.push((dt,t)=>{const a=ph+t*sp,x=Math.cos(a)*31.2,z=Math.sin(a)*31.2;rv.position.set(x,H(x,z),z);rv.rotation.y=-a-Math.PI/2})}
  // солнечная ферма за кольцом
  const sp=new T.BoxGeometry(2.2,.08,1.2),N=60,im=new T.InstancedMesh(sp,MT.Sol,N),m4=new T.Matrix4(),q=new T.Quaternion().setFromEuler(new T.Euler(-.5,0,0));let k=0;
  for(let i=0;i<10;i++)for(let j=0;j<6;j++){const a=3.6+i*.045,R=36+j*1.7,x=Math.cos(a)*R,z=Math.sin(a)*R;m4.compose(new T.Vector3(x,H(x,z)+.7,z),q,new T.Vector3(1,1,1));im.setMatrixAt(k++,m4)}
  im.castShadow=true;W.add(im);
  // посадочная площадка с шаттлом
  const lp=new T.Group(),la=2.5,lx=Math.cos(la)*38,lz=Math.sin(la)*38;lp.position.set(lx,H(lx,lz),lz);W.add(lp);
  lp.add(mk(new T.CylinderGeometry(4.5,4.8,.35,6),MT.G,0,.17,0));lp.add(mk(new T.TorusGeometry(3.4,.08,4,6),MT.Ylw,0,.37,0,Math.PI/2));
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([x,z],i)=>{const l=mk(new T.SphereGeometry(.14,6,4),MT.Or,x*4.2,.45,z*4.2);lp.add(l);COL3.blink.push(l)});
  const sh=new T.Group();sh.add(mk(new T.CapsuleGeometry(.8,3,4,10),MT.W,0,0,0,0,0,Math.PI/2));sh.add(mk(new T.BoxGeometry(1.2,.12,3.2),MT.W2,-.4,-.2,0));sh.add(mk(new T.ConeGeometry(.5,.6,8),MT.D,-2.4,0,0,0,0,Math.PI/2));
  sh.position.set(0,1.4,0);lp.add(sh);
  // летающие корабли
  for(let i=0;i<4;i++){const s=new T.Group(),L=3+i%2*2;s.add(mk(new T.CylinderGeometry(.5,.5,L,8),i%2?MT.W:MT.W2,0,0,0,0,0,Math.PI/2));
    for(let b=0;b<3;b++)s.add(mk(new T.BoxGeometry(.6,.7,.7),b%2?MT.G:MT.W2,-L/2+.6+b*(L-1.2)/2,.55,0));
    const fl=new T.Mesh(new T.ConeGeometry(.42,1.6,8,1,true),new T.MeshBasicMaterial({color:0xFFC46B,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));fl.rotation.z=Math.PI/2;fl.position.x=-L/2-.8;s.add(fl);
    W.add(s);const R=48+i*14,hgt=16+i*5,ph=i*1.7,spd=(i%2?-1:1)*(.025+i*.006);s.scale.setScalar(1.4+i*.3);
    COL3.anim.push((dt,t)=>{const a=ph+t*spd,x=Math.cos(a)*R,z=Math.sin(a)*R;s.position.set(x,hgt+Math.sin(t*.5+i)*1.2,z);s.rotation.y=-a+(spd>0?-Math.PI/2:Math.PI/2);fl.scale.y=.85+.25*Math.sin(t*30+i)})}
  // дроны у башни
  for(let i=0;i<3;i++){const dr=new T.Group();dr.add(mk(new T.BoxGeometry(.35,.12,.35),MT.D));const l=mk(new T.SphereGeometry(.07,6,4),MT.Cy,0,-.1,0);dr.add(l);W.add(dr);
    COL3.anim.push((dt,t)=>{const a=t*(.3+i*.1)+i*2,R=7+i*2;dr.position.set(Math.cos(a)*R,8+i*2.5+Math.sin(t*1.3+i)*.5,Math.sin(a)*R)})}
  // антенны и тарелки по периметру
  [[1.2,25],[4.3,24],[5.6,34]].forEach(([a,R])=>{const x=Math.cos(a)*R,z=Math.sin(a)*R,y=H(x,z);W.add(mk(new T.CylinderGeometry(.08,.12,3.2,6),MT.D,x,y+1.6,z));
    const dish=mk(new T.SphereGeometry(1,10,6,0,6.283,0,1),MT.W,x,y+3.3,z,-1.2,a);dish.material=MT.W;W.add(dish)})}
/* дороги к станциям: светлая полоса по рельефу */
function road(x1,z1,x2,z2){const T=THREE,n=40,w=.85,p=[],ix=[],dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz),nx=-dz/L*w,nz=dx/L*w;
  for(let i=0;i<=n;i++){const k=i/n,x=x1+dx*k,z=z1+dz*k;p.push(x+nx,H(x+nx,z+nz)+.05,z+nz,x-nx,H(x-nx,z-nz)+.05,z-nz);if(i<n){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
  const o=new T.Mesh(g,new T.MeshStandardMaterial({color:0xE8DACB,transparent:true,opacity:.32,roughness:1,side:T.DoubleSide,depthWrite:false}));o.receiveShadow=true;return o}
/* детальные здания для целей */
function station(g){const T=THREE,MT=COL3.M||(COL3.M=colMats()),G=new T.Group(),add=o=>{G.add(o);return o};
  add(mk(new T.CylinderGeometry(3,3.2,.3,8),MT.G,0,.15,0));add(mk(new T.TorusGeometry(2.95,.05,4,8),MT.Cy,0,.32,0,Math.PI/2));let top=3;
  switch(g.id){
    case'med':add(mk(new T.CylinderGeometry(1.9,2,1.8,6),MT.W,0,1.2,0));add(mk(new T.SphereGeometry(1.5,8,5,0,6.283,0,Math.PI/2),MT.W2,0,2.1,0));
      add(mk(new T.BoxGeometry(1,.26,.08),MT.Red,0,1.4,1.75));add(mk(new T.BoxGeometry(.26,1,.08),MT.Red,0,1.4,1.75));add(mk(new T.BoxGeometry(2.6,.2,.08),MT.Win,0,.85,1.73));
      add(mk(new T.CylinderGeometry(.05,.05,1.6,5),MT.D,1.1,3.2,0));const bm=add(mk(new T.SphereGeometry(.12,6,4),MT.Red,1.1,4,0));COL3.blink.push(bm);
      add(mk(new T.BoxGeometry(1.6,.6,1.2),MT.W,-1.9,.65,-.8));top=4.3;break;
    case'lab':add(mk(new T.SphereGeometry(1.4,10,6,0,6.283,0,Math.PI/2),MT.W,-1,.3,0));add(mk(new T.SphereGeometry(1.1,10,6,0,6.283,0,Math.PI/2),MT.W2,1.4,.3,.3));
      add(mk(new T.CylinderGeometry(.45,.45,1.6,8),MT.W,.2,.6,0,0,0,Math.PI/2));add(mk(new T.TorusGeometry(1.42,.06,4,24),MT.Cy,-1,.55,0,Math.PI/2));
      [[-.2,-1.6],[.6,-1.7]].forEach(([x,z])=>{add(mk(new T.CylinderGeometry(.35,.35,1.8,8),MT.G,x,1.2,z));add(mk(new T.SphereGeometry(.35,8,4,0,6.283,0,Math.PI/2),MT.W2,x,2.1,z))});
      add(mk(new T.BoxGeometry(1.4,.1,.05),MT.Win,-1,.9,1.35));top=3.2;break;
    case'gym':{const shp=new T.Shape();shp.absarc(0,0,1.4,0,Math.PI,false);shp.lineTo(1.4,0);const hg=new T.ExtrudeGeometry(shp,{depth:4.2,bevelEnabled:false,curveSegments:10});add(mk(hg,MT.W,0,.3,-2.1));
      const gl=add(mk(new T.CircleGeometry(1.35,10,0,Math.PI),MT.Cy,0,.3,2.12));gl.material=MT.Gl;add(mk(new T.TorusGeometry(1.42,.07,4,10,Math.PI),MT.Cy,0,.3,2.1));
      [-1.2,0,1.2].forEach(z=>add(mk(new T.TorusGeometry(1.45,.05,4,10,Math.PI),MT.D,0,.3,z)));add(mk(new T.BoxGeometry(.9,.25,1.6),MT.K,0,.45,1.2));top=3;break}
    case'water':[[-1,-.6,2.6],[.9,-.8,2.1],[0,.9,1.8]].forEach(([x,z,h])=>{add(mk(new T.CylinderGeometry(.7,.7,h,10),MT.W,x,h/2+.3,z));add(mk(new T.SphereGeometry(.7,10,5,0,6.283,0,Math.PI/2),MT.W2,x,h+.3,z));
        add(mk(new T.CylinderGeometry(.72,.72,.14,10,1,true),MT.Cy,x,h*.6+.3,z))});
      add(mk(new T.CylinderGeometry(.12,.12,2.2,6),MT.G,0,.7,-.7,0,0,Math.PI/2));add(mk(new T.BoxGeometry(.5,3.6,.5),MT.D,1.9,2,.9));const ol=add(mk(new T.SphereGeometry(.14,6,4),MT.Or,1.9,3.9,.9));COL3.blink.push(ol);top=4.2;break;
    case'shield':add(mk(new T.CylinderGeometry(1.5,2.6,1.7,4),MT.W2,0,1.1,0,0,Math.PI/4));add(mk(new T.TorusGeometry(2.6,.55,4,12),MT.D,0,.35,0,Math.PI/2)).material=new T.MeshStandardMaterial({color:0x8A5A44,roughness:1,flatShading:true});
      add(mk(new T.BoxGeometry(1.1,1,.1),MT.Ylw,0,.85,1.95));for(let i=0;i<4;i++)add(mk(new T.BoxGeometry(.12,1,.11),MT.K,-.42+i*.28,.85,1.97,0,0,.5));
      [-1,1].forEach(s=>{const l=add(mk(new T.SphereGeometry(.12,6,4),MT.Or,s*.75,1.55,1.9));COL3.blink.push(l)});top=3;break;
    case'bed':{const pl=[[-1.1,-.5,1.6],[1.1,-.4,2.2],[0,1.1,1.3]].map(([x,z,h])=>({x,z,y:.3,h,a:x}));add(podsInstanced(pl,MT));add(mk(new T.CylinderGeometry(.18,.18,2.2,6),MT.G,0,1.9,0,0,0,Math.PI/2));top=4.6;break}
    case'green':{const dg=new T.IcosahedronGeometry(2.4,1);add(mk(dg,MT.Gl,0,.3,0));const ed=new T.LineSegments(new T.EdgesGeometry(dg),new T.LineBasicMaterial({color:0xE6F7FF,transparent:true,opacity:.75}));ed.position.y=.3;add(ed);
      [[-.8,-.4],[.6,.5],[.2,-.9],[-.3,.9],[1,-.3]].forEach(([x,z],i)=>add(mk(new T.IcosahedronGeometry(.45+i%2*.2,0),MT.Pl,x,.75,z)));const gl2=new T.PointLight(0xffe6b0,4,7);gl2.position.y=1.4;G.add(gl2);top=3.4;break}
    case'comms':{const lat=new T.LineSegments(new T.EdgesGeometry(new T.CylinderGeometry(.25,.8,5,4,5)),new T.LineBasicMaterial({color:0xD8DCE2}));lat.position.y=2.8;add(lat);
      add(mk(new T.CylinderGeometry(.05,.05,5,4),MT.D,0,2.8,0));const dish=add(mk(new T.SphereGeometry(1.4,12,6,0,6.283,0,1),MT.W,0,5.3,.3,-1.1,0));dish.material=MT.W;
      add(mk(new T.CylinderGeometry(.04,.04,1.1,4),MT.D,0,5.6,.9,-1.1));const bl=add(mk(new T.SphereGeometry(.14,6,4),MT.Red,0,6.5,0));COL3.blink.push(bl);top=6.6;break}}
  G.traverse(o=>{if(o.isMesh&&o.material===MT.Gl)o.castShadow=false});
  const beam=new T.Mesh(new T.CylinderGeometry(.08,.08,9,8,1,true),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.16,blending:T.AdditiveBlending,depthWrite:false}));beam.position.y=top+4.5;G.add(beam);
  const halo=new T.Mesh(new T.TorusGeometry(.45,.05,6,32),new T.MeshBasicMaterial({color:0xffffff}));halo.position.y=top+1;G.add(halo);
  const ck=new T.Mesh(new T.OctahedronGeometry(.28),new T.MeshStandardMaterial({color:0x3ad6a6,emissive:0x1a6b53}));ck.position.y=top+1;G.add(ck);
  const lb=label(g.ic+'  '+tx(g.n),'#A8E6A1');lb.position.y=top+2.1;G.add(lb);
  G.userData={goal:g.id,beam,halo,ck,lb,hy:top+1};G.traverse(o=>{o.userData.goal=g.id});return G}
function col3Tick(dt,t){COL3.anim.forEach(f=>f(dt,t));const on=Math.sin(t*3)>0;COL3.blink.forEach((b,i)=>{b.visible=(i%2?on:!on)||Math.sin(t*1.7+i)>.6})}
