/* ===== Герой обзора: крупный заголовок, статус, 3D-планета текущего мира с орбитами ===== */
Object.assign(U,{sys_status:['Статус систем','System status'],hero_1:['Следи.','Monitor.'],hero_2:['Дыши.','Breathe.'],hero_3:['Вернись.','Return.'],
  hero_sub:['Монитор здоровья экипажа: тело, психика и связь с домом в одном окне. Работает и без связи с Землёй.','Crew health monitor: body, mind and home in one window. Works even without a link to Earth.'],
  hero_cta1:['Осмотр тела','Body check'],hero_cta2:['Mission Games','Mission Games'],rail_sol:['сол миссии','mission sol'],rail_xp:['опыт','experience'],rail_msg:['посланий из дома','messages from home'],
  tgt_lbl:['Мир миссии','Mission world'],tgt_delay:['задержка связи: {0}','signal delay: {0}']});
const HERO={};
function rHero(){const st=worst(),mt=t('master'+st);$('#heroSt').textContent=mt;$('#heroSt').style.color=['var(--ok)','var(--warn)','var(--doc)'][st];
  $('#heroTgt').innerHTML=`<span>${t('tgt_lbl')}</span><b>${esc(tx(D().n).split(',')[0])}</b><small>${esc(t('tgt_delay',tx(D().delay)))}</small>`;
  const open=S.caps.filter(c=>c.sol<=solNow()).length;
  $('#heroRail').innerHTML=[['◎',solNow(),'rail_sol'],['✦',S.xp||0,'rail_xp'],['✉',open,'rail_msg']].map(([i,v,l])=>`<div><i>${i}</i><b>${v}</b><span>${t(l)}</span></div>`).join('');
  heroPlanet()}
function heroPlanet(){const box=$('#heroPlanet');if(!box||!window.THREE)return;const T=THREE;
  if(!HERO.R){let R;try{R=new T.WebGLRenderer({antialias:true,alpha:true})}catch(e){return}R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;box.prepend(R.domElement);
    const sc=new T.Scene(),cam=new T.PerspectiveCamera(30,1,.1,200);cam.position.set(0,0,14);const g=new T.Group();sc.add(g);
    const sun=new T.DirectionalLight(0xffffff,3.2);sun.position.set(-6,5,3);sc.add(sun);sc.add(new T.AmbientLight(0x404650,.25));
    const pl=new T.Mesh(new T.SphereGeometry(3,96,64),new T.MeshStandardMaterial({roughness:.9}));g.add(pl);
    const atm=new T.Mesh(new T.SphereGeometry(3.28,64,48),new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,side:T.BackSide,depthWrite:false,uniforms:{c:{value:new T.Color(1,1,1)}},
      vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform vec3 c;varying vec3 vN;void main(){float i=pow(.7-dot(vN,vec3(0,0,1.)),3.);gl_FragColor=vec4(c,1.)*i;}'}));g.add(atm);
    const orb=(rx,rz,tilt)=>{const pts=[];for(let i=0;i<=200;i++){const a=i/200*Math.PI*2;pts.push(new T.Vector3(Math.cos(a)*rx,0,Math.sin(a)*rz))}const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.28}));l.rotation.set(tilt,0,-.35);sc.add(l);return l};
    const o1=orb(5.2,4.2,1.25),o2=orb(6.6,5.4,1.1);
    const moon=new T.Mesh(new T.SphereGeometry(.62,48,32),new T.MeshStandardMaterial({color:0x8a8d93,roughness:1}));sc.add(moon);
    const sat=new T.Mesh(new T.SphereGeometry(.16,16,12),new T.MeshStandardMaterial({color:0xd8dbe0,roughness:.6}));sc.add(sat);
    const st=[];for(let i=0;i<300;i++)st.push((Math.random()-.5)*60,(Math.random()-.5)*36,-20-Math.random()*20);const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(st,3));
    sc.add(new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:1.2,sizeAttenuation:false,transparent:true,opacity:.7})));
    HERO.R=R;HERO.sc=sc;HERO.cam=cam;HERO.g=g;HERO.pl=pl;HERO.atm=atm;HERO.moon=moon;HERO.sat=sat;HERO.o1=o1;HERO.o2=o2;HERO.ck=new T.Clock();
    new ResizeObserver(()=>{const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();const nar=w<860;g.position.set(nar?0:w>1100?2.2:1.6,nar?-1.2:-.1,0);
      [o1,o2,moon,sat].forEach(o=>o.userData.c=g.position.clone())}).observe(box)}
  if(HERO.dest!==S.dest){HERO.dest=S.dest;const d=D(),gnd=(d.sky.gnd||[[120,160,220],[30,60,120]]),cv=document.createElement('canvas');cv.width=1024;cv.height=512;const x=cv.getContext('2d'),im=x.createImageData(1024,512),q=im.data,r=rng(S.dest.length*13+5);
    const P=[...Array(256)].map(()=>r()),N=(a,b)=>{const i=Math.floor(a),j=Math.floor(b),fa=a-i,fb=b-j,h=(u,v)=>P[((u&15)*16+(v&15))&255],s=z=>z*z*(3-2*z);return h(i,j)*(1-s(fa))*(1-s(fb))+h(i+1,j)*s(fa)*(1-s(fb))+h(i,j+1)*(1-s(fa))*s(fb)+h(i+1,j+1)*s(fa)*s(fb)};
    const a=gnd[0],b=gnd[1],earthy=S.dest==='iss';
    for(let yy=0;yy<512;yy++)for(let xx=0;xx<1024;xx++){const u=xx/1024*12,v=yy/512*6;let n=0,am=1,f=1;for(let o=0;o<5;o++){n+=am*N(u*f,v*f);am*=.5;f*=2}n/=1.94;const lat=Math.abs(yy/512-.5)*2,o=(yy*1024+xx)*4;let c;
      if(earthy)c=lat>.85?[230,236,242]:n>.52?[60+n*80,90+n*50,50]:[10,40,90+n*60];else{const k=Math.min(1,Math.max(0,(n-.3)*1.8));c=[b[0]+(a[0]-b[0])*k,b[1]+(a[1]-b[1])*k,b[2]+(a[2]-b[2])*k];if(lat>.88){c=c.map(z=>z*.4+150)}const cr=N(u*3+9,v*3+4);if(cr>.78)c=c.map(z=>z*.82)}
      q[o]=c[0];q[o+1]=c[1];q[o+2]=c[2];q[o+3]=255}
    x.putImageData(im,0,0);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;if(HERO.pl.material.map)HERO.pl.material.map.dispose();HERO.pl.material.map=tex;HERO.pl.material.needsUpdate=true;
    const h=d.sky.hor;HERO.atm.material.uniforms.c.value.setRGB(h[0]/255*.9+.1,h[1]/255*.9+.1,h[2]/255*.9+.1)}
  const H2=HERO;H2.R.setAnimationLoop(()=>{if(curTab!=='over'){H2.R.setAnimationLoop(null);return}const tt=H2.ck.getElapsedTime(),c=H2.g.position;if(!FX.reduce)H2.pl.rotation.y=tt*.04;
    H2.o1.position.copy(c);H2.o2.position.copy(c);const a=tt*.18,b=tt*.32+2;
    H2.moon.position.set(c.x+Math.cos(a)*5.2,c.y+Math.sin(a)*4.2*Math.cos(1.25)+Math.cos(a)*5.2*Math.sin(-.35)*.0,c.z+Math.sin(a)*4.2*Math.sin(1.25));
    const v=new THREE.Vector3(Math.cos(b)*6.6,0,Math.sin(b)*5.4).applyEuler(H2.o2.rotation);H2.sat.position.copy(c).add(v);
    const vm=new THREE.Vector3(Math.cos(a)*5.2,0,Math.sin(a)*4.2).applyEuler(H2.o1.rotation);H2.moon.position.copy(c).add(vm);
    H2.R.render(H2.sc,H2.cam)})}
