/* ===== общая 3D-анатомия: кожа, мышцы, скелет, органы, сосуды (three.js) =====
   У каждой детали userData: tp — тема модуля «Тело», pt — участок (для сайта экипажа), sys — система, base — родной цвет. */
const ANAT_PARTS={
  skel:{skull:'Череп',spine:'Позвоночник',ribs:'Рёбра и грудина',shoulder:'Ключицы и лопатки',pelvis:'Таз',femur:'Бедренные кости',shin:'Голени',arm:'Кости рук',hand:'Кисти',foot:'Стопы'},
  mus:{chest:'Грудные',abs:'Пресс',obliq:'Косые мышцы',back:'Спина',glutes:'Ягодицы',quads:'Квадрицепсы',hams:'Задняя поверхность бедра',calves:'Икры',delts:'Плечи',biceps:'Бицепсы',triceps:'Трицепсы',forearm:'Предплечья'},
  vess:{aorta:'Аорта и сонные артерии',art_leg:'Артерии ног',vein_leg:'Глубокие вены ног',art_arm:'Артерии рук',vein_arm:'Вены рук',vena:'Полая вена'},
  org:{brain:'Мозг',eyes:'Глаза',heart:'Сердце',lungs:'Лёгкие',liver:'Печень',stomach:'Желудок',gut:'Кишечник',kidney:'Почки',bladder:'Мочевой пузырь'}
};
function anatBuild(T,clip,L){
  const V=(x,y,z)=>new T.Vector3(x,y,z),parts=[],cp=clip?[clip]:[];
  const mat=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.05},o));
  const put=(sys,geo,m,tp,pt,pos,scl,rot)=>{const o=new T.Mesh(geo,sys==='skin'?m:m.clone());if(pos)o.position.copy(pos);if(scl)o.scale.copy(scl);if(rot)o.rotation.set(...rot);
    o.userData={tp,pt,sys,base:m.color.clone(),s0:o.scale.clone()};L[sys].add(o);if(pt)parts.push(o);return o};
  const SPH=new T.SphereGeometry(1,32,20);
  const ell=(sys,m,tp,pt,p,s,r)=>put(sys,SPH,m,tp,pt,V(...p),V(...s),r);
  const seg=(sys,m,tp,pt,a,b,r)=>{const A=V(...a),Bv=V(...b),len=A.distanceTo(Bv);const o=put(sys,new T.CapsuleGeometry(r,Math.max(.001,len),6,16),m,tp,pt,A.clone().add(Bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(V(0,1,0),Bv.clone().sub(A).normalize());return o};
  const both=fn=>[-1,1].forEach(fn);
  // кожа
  const sk=new T.MeshPhysicalMaterial({color:0xe2b69c,roughness:.6,transparent:true,opacity:.3,depthWrite:false,clippingPlanes:cp});
  ell('skin',sk,null,null,[0,1.635,.005],[.098,.122,.11]);seg('skin',sk,null,null,[0,1.47,0],[0,1.56,0],.052);
  const prof=[[.001,.84],[.14,.86],[.168,.93],[.158,1.04],[.138,1.12],[.15,1.24],[.178,1.35],[.19,1.41],[.15,1.46],[.06,1.49],[.001,1.495]].map(p=>new T.Vector2(p[0],p[1]));
  put('skin',new T.LatheGeometry(prof,48),sk,null,null).scale.set(1,1,.62);
  both(s=>{seg('skin',sk,null,null,[s*.2,1.42,0],[s*.26,1.14,0],.046);seg('skin',sk,null,null,[s*.26,1.14,0],[s*.29,.88,.02],.038);ell('skin',sk,null,null,[s*.3,.8,.02],[.034,.075,.05]);
    seg('skin',sk,null,null,[s*.092,.88,0],[s*.1,.49,.01],.078);seg('skin',sk,null,null,[s*.1,.49,.01],[s*.1,.08,0],.056);ell('skin',sk,null,null,[s*.1,.04,.05],[.045,.035,.11])});
  // мышцы
  const mu=new T.MeshStandardMaterial({color:0xa8443c,roughness:.5,clippingPlanes:cp});
  both(s=>{ell('mus',mu,'corem','chest',[s*.075,1.33,.06],[.078,.055,.032]);ell('mus',mu,'corem','obliq',[s*.12,1.08,.025],[.04,.09,.06]);ell('mus',mu,'corem','back',[s*.1,1.2,-.05],[.07,.14,.035]);
    for(let i=0;i<3;i++)put('mus',new T.RoundedBoxGeometry(.052,.05,.024,2,.01),mu,'corem','abs',V(s*.029,1.02+i*.06,.075));
    ell('mus',mu,'legm','glutes',[s*.07,.9,-.065],[.075,.075,.06]);seg('mus',mu,'legm','quads',[s*.09,.85,.015],[s*.1,.54,.015],.058);seg('mus',mu,'legm','hams',[s*.092,.84,-.018],[s*.1,.55,-.018],.05);
    ell('mus',mu,'legm','calves',[s*.1,.36,-.022],[.043,.1,.042]);seg('mus',mu,'legm','calves',[s*.108,.45,.02],[s*.104,.14,.02],.024);
    ell('mus',mu,'armm','delts',[s*.205,1.4,0],[.055,.062,.055]);seg('mus',mu,'armm','biceps',[s*.215,1.35,.014],[s*.25,1.19,.014],.034);seg('mus',mu,'armm','triceps',[s*.215,1.35,-.014],[s*.25,1.18,-.014],.031);
    seg('mus',mu,'armm','forearm',[s*.26,1.13,.01],[s*.285,.9,.02],.029)});
  ell('mus',mu,'corem','back',[0,1.38,-.055],[.13,.075,.04]);
  // скелет
  const bo=mat(0xe9e3d3,{roughness:.7});
  ell('skel',bo,'bone','skull',[0,1.64,0],[.08,.094,.09]);ell('skel',bo,'bone','skull',[0,1.565,.03],[.055,.028,.05]);
  for(let i=0;i<24;i++){const k=i/23,y=1.53-k*.6,z=-.035+.018*Math.sin(k*Math.PI*2.2);put('skel',new T.CylinderGeometry(.017,.017,.018,12),bo,'spine','spine',V(0,y,z))}
  ell('skel',bo,'spine','spine',[0,.9,-.04],[.04,.05,.025]);
  for(let i=0;i<10;i++){const y=1.41-i*.033,r=.085+.06*Math.sin(Math.min(1,(i+1)/6)*Math.PI/2)-(i>6?(i-6)*.008:0),arc=Math.PI*(i>7?1.35:1.72);
    const g=new T.TorusGeometry(r,.006,6,32,arc);g.rotateX(-Math.PI/2);const c=(arc+Math.PI*2)/2;g.rotateY(-Math.atan2(Math.cos(c),-Math.sin(c)));
    const o=put('skel',g,bo,'bone','ribs',V(0,y,-.005));o.scale.z=.72;o.rotation.x=.22}
  put('skel',new T.RoundedBoxGeometry(.03,.16,.012,2,.005),bo,'bone','ribs',V(0,1.29,.09));
  both(s=>{seg('skel',bo,'bone','shoulder',[s*.02,1.44,.07],[s*.18,1.45,.02],.009);ell('skel',bo,'bone','shoulder',[s*.1,1.34,-.095],[.045,.06,.008]);
    ell('skel',bo,'hip','pelvis',[s*.085,.97,-.015],[.05,.045,.02],[0,s*.5,0]);put('skel',SPH,bo,'hip','femur',V(s*.08,.88,0),V(.024,.024,.024));seg('skel',bo,'hip','femur',[s*.088,.86,0],[s*.1,.52,.01],.016);
    ell('skel',bo,'bone','shin',[s*.1,.5,.045],[.02,.022,.012]);seg('skel',bo,'bone','shin',[s*.1,.47,.005],[s*.1,.1,0],.014);seg('skel',bo,'bone','shin',[s*.125,.46,-.01],[s*.123,.11,-.01],.007);
    seg('skel',bo,'bone','arm',[s*.2,1.42,0],[s*.26,1.14,0],.013);seg('skel',bo,'bone','arm',[s*.255,1.13,.01],[s*.285,.89,.025],.008);seg('skel',bo,'bone','arm',[s*.27,1.13,-.01],[s*.3,.89,.0],.008);
    put('skel',new T.RoundedBoxGeometry(.05,.1,.02,2,.006),bo,'bone','hand',V(s*.3,.8,.02));put('skel',new T.RoundedBoxGeometry(.06,.025,.16,2,.008),bo,'bone','foot',V(s*.1,.03,.05))});
  const pv=put('skel',new T.TorusGeometry(.075,.018,10,40),bo,'hip','pelvis',V(0,.93,0));pv.rotation.x=Math.PI/2.4;pv.scale.set(1.2,.9,1);
  // органы
  const brain=new T.SphereGeometry(1,48,32),bp=brain.attributes.position;
  for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i),n=1+.05*Math.sin(x*19)*Math.sin(y*17)*Math.sin(z*21)-(Math.abs(x)<.06?.08:0);bp.setXYZ(i,x*n,y*n,z*n)}brain.computeVertexNormals();
  put('org',brain,mat(0xe7a1a8),'brain','brain',V(0,1.665,-.005),V(.07,.058,.083));
  both(s=>{ell('org',mat(0xf4f4f4,{roughness:.2}),'eyes','eyes',[s*.033,1.635,.078],[.014,.014,.014]);ell('org',mat(0x3f7fd0,{roughness:.2}),'eyes','eyes',[s*.033,1.635,.091],[.006,.006,.003])});
  const heart=ell('org',mat(0xc0392b,{roughness:.4}),'heart','heart',[.022,1.27,.045],[.048,.06,.044],[0,0,-.45]);
  const lungs=[-1,1].map(s=>ell('org',mat(0xe88f8f,{roughness:.6}),'lungs','lungs',[s*.075,1.29,0],[s>0?.055:.062,.11,.06]));
  ell('org',mat(0x7b2d26),'metab','liver',[-.055,1.13,.04],[.095,.045,.06],[0,0,.25]);ell('org',mat(0xd08f6a),'metab','stomach',[.065,1.115,.05],[.05,.038,.034],[0,0,-.3]);
  const ip=[];for(let j=0;j<5;j++){const y=1.06-j*.024;for(let i=0;i<=6;i++){const x=(j%2?1:-1)*(-.075+i*.025);ip.push(V(x,y+Math.sin(i)*.004,.04+.01*Math.cos(i*1.3)))}}
  put('org',new T.TubeGeometry(new T.CatmullRomCurve3(ip),160,.011,8),mat(0xd99a86),'metab','gut');
  both(s=>ell('org',mat(0x8e3b3b),'kidney','kidney',[s*.06,1.08,-.05],[.022,.04,.018]));ell('org',mat(0xd7b46a),'kidney','bladder',[0,.92,.045],[.03,.025,.025]);
  // сосуды
  const art=mat(0xd2322d,{roughness:.35,emissive:0x330000}),vein=mat(0x3a5fc8,{roughness:.35,emissive:0x000a33});
  const tube=(m,pt,pts,r)=>put('vess',new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V(...p))),64,r,8),m,'heart',pt);
  tube(art,'aorta',[[.02,1.3,.03],[.02,1.37,.0],[0,1.33,-.03],[0,1.1,-.025],[0,.95,-.01]],.009);
  both(s=>{const o=s*.014;tube(art,'art_leg',[[0,.95,-.01],[s*.07,.87,.01],[s*.095,.6,.02],[s*.1,.3,.0],[s*.1,.07,.03]],.006);tube(vein,'vein_leg',[[o,.96,-.01],[s*.07+o,.87,.0],[s*.095+o,.6,.0],[s*.1+o,.3,-.01],[s*.1+o,.07,.02]],.006);
    tube(art,'aorta',[[s*.01,1.36,0],[s*.02,1.5,.01],[s*.025,1.6,.0]],.004);tube(art,'art_arm',[[s*.01,1.36,0],[s*.12,1.42,.0],[s*.21,1.38,.01],[s*.26,1.13,.02],[s*.29,.86,.03]],.005);
    tube(vein,'vein_arm',[[s*.02,1.32,.02],[s*.14,1.4,.02],[s*.22,1.36,.025],[s*.27,1.12,.03],[s*.295,.86,.035]],.005)});
  tube(vein,'vena',[[-.012,1.3,.03],[-.015,1.1,-.01],[.0,.96,-.005]],.009);
  return{parts,heart,lungs,skinMat:sk};
}
