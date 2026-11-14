/* ===== Family Connection: каюта с видом на Землю, аватары близких, послания, галерея, календарь =====
   Аватар — цифровой образ из фото, созданный с согласия. Он воспроизводит только то, что человек сам записал или написал. */
Object.assign(U,{
fam_kicker:['Family Connection','Family Connection'],fam_title:['Каюта связи с домом','Home connection cabin'],
fam_sub:['Тихое место на станции: семья рядом, Земля в окне. Послания открываются в свой сол, ответ уйдёт со следующим сеансом связи.','A quiet spot on the station: family close by, Earth in the window. Messages open on their sol; your reply leaves with the next comms window.'],
fam_upload:['Upload Family Photo','Upload Family Photo'],fam_record:['Record a Message','Record a Message'],
fam_ethic:['Аватар — цифровой образ, созданный с согласия родственника. Он воспроизводит только то, что человек сам записал или написал, и никогда не говорит за него.','An avatar is a digital likeness made with the relative’s consent. It plays only what the person recorded or wrote, and never speaks for them.'],
fam_members:['Семья на связи','Family on the line'],fam_msgs:['посланий: {0}','messages: {0}'],fam_next:['следующее: сол {0}','next: sol {0}'],fam_open:['Открыть','Open'],
fam_empty:['Пока никого нет','No one here yet'],fam_emptyH:['Загрузите фото близкого человека с его согласия, и здесь появится его аватар.','Upload a photo of a loved one, with their consent, and their avatar will appear here.'],
fam_tab_msg:['Послания','Messages'],fam_tab_gal:['Фото и видео','Photos & videos'],fam_tab_reply:['Ответить','Reply'],
fam_voice:['голос','voice'],fam_text:['текст','text'],fam_tts:['озвучено синтезатором речи, не голосом человека','read by a speech synthesiser, not the person’s voice'],
fam_locked:['откроется в сол {0}','opens on sol {0}'],fam_nomsg:['Посланий от этого человека пока нет.','No messages from this person yet.'],fam_addgal:['Добавить фото или видео','Add a photo or video'],
fam_nogal:['Здесь будут семейные фото и видео. Они хранятся только на этом устройстве.','Family photos and videos will live here. They stay on this device only.'],
fam_replyH:['Ответ для: {0}. Уйдёт со следующим сеансом связи (задержка {1}).','Reply to: {0}. It leaves with the next comms window (delay {1}).'],fam_sent:['Ответ поставлен в очередь связи','Reply queued for the comms window'],
fam_cal:['Календарь семьи','Family calendar'],fam_calH:['Нажмите на сол, чтобы добавить событие. Золотые точки — послания, голубые — даты семьи.','Click a sol to add an event. Gold dots are messages, blue dots are family dates.'],
fam_tomorrow:['Завтра: {0}','Tomorrow: {0}'],fam_rel:['Кем приходится (необязательно)','Relation (optional)'],fam_manage:['Послания, люди и ответы','Messages, people and replies'],fam_close:['Закрыть','Close'],
fam_born:['Аватар создан из фото. Добро пожаловать в каюту!','Avatar created from the photo. Welcome to the cabin!']});
const FAM={av:{},earth:null,open:null,tab:'msg',blob:null,lastN:0};
/* голографический аватар из фото: маска, мягкий тон, ореол, сканлинии */
function famAvatar(p){if(FAM.av[p.id])return Promise.resolve(FAM.av[p.id]);const src=avaSrc(p);
  return new Promise(res=>{const im=new Image();im.onload=()=>{const S2=320,c=document.createElement('canvas');c.width=c.height=S2;const x=c.getContext('2d');
    x.save();x.beginPath();x.arc(S2/2,S2/2,S2/2-8,0,7);x.clip();const k=Math.max(S2/im.width,S2/im.height);x.drawImage(im,(S2-im.width*k)/2,(S2-im.height*k)/2,im.width*k,im.height*k);
    const g=x.createLinearGradient(0,0,S2,S2);g.addColorStop(0,'rgba(57,189,235,.22)');g.addColorStop(1,'rgba(139,131,246,.22)');x.globalCompositeOperation='soft-light';x.fillStyle=g;x.fillRect(0,0,S2,S2);
    x.globalCompositeOperation='source-over';x.fillStyle='rgba(255,255,255,.035)';for(let y=0;y<S2;y+=3)x.fillRect(0,y,S2,1);
    const v=x.createRadialGradient(S2/2,S2/2,S2*.3,S2/2,S2/2,S2/2);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(6,10,20,.55)');x.fillStyle=v;x.fillRect(0,0,S2,S2);x.restore();
    x.strokeStyle='rgba(229,185,107,.85)';x.lineWidth=4;x.beginPath();x.arc(S2/2,S2/2,S2/2-8,0,7);x.stroke();
    try{FAM.av[p.id]=c.toDataURL('image/jpeg',.88)}catch(e){FAM.av[p.id]=src}res(FAM.av[p.id])};im.onerror=()=>res(src);im.src=src})}
const holo=(p,cls)=>`<span class="holo ${cls||''}" data-hav="${p.id}"><img src="${FAM.av[p.id]||avaSrc(p)}" alt=""><i class="hp"></i><i class="hp"></i><i class="hp"></i></span>`;
function rFamily(){const sol=solNow();if(S.people.length>FAM.lastN&&FAM.lastN)FAM.fresh=S.people[S.people.length-1].id;FAM.lastN=S.people.length;
  $('#famShelf').innerHTML=S.people.filter(p=>MEDIA['photo:'+p.id]).slice(0,4).map((p,i)=>`<figure class="frame" style="--r:${[-4,3,-2,5][i]}deg"><img src="${MEDIA['photo:'+p.id]}" alt=""><figcaption>${esc(tx(p.name))}</figcaption></figure>`).join('');
  $('#famGrid').innerHTML=S.people.length?S.people.map(p=>{const caps=S.caps.filter(c=>c.who===p.id),open=caps.filter(c=>c.sol<=sol).length,nx=caps.filter(c=>c.sol>sol).sort((a,b)=>a.sol-b.sol)[0];
    return`<button class="fcard ${FAM.fresh===p.id?'born':''}" data-fam="${p.id}">${holo(p)}<b>${esc(tx(p.name))}</b>${p.rel?`<small>${esc(p.rel)}</small>`:''}<span class="fmeta">${t('fam_msgs',open)}${nx?' · '+t('fam_next',nx.sol):''}</span><span class="fgo">${t('fam_open')} →</span></button>`}).join('')
    :FX.empty('👨‍👩‍👧',t('fam_empty'),t('fam_emptyH'),`<button class="gold" data-famup>${t('fam_upload')}</button>`);
  S.people.forEach(p=>famAvatar(p).then(u=>$$(`[data-hav="${p.id}"] img`).forEach(i=>{if(i.src!==u)i.src=u})));
  if(FAM.fresh){const f=FAM.fresh;setTimeout(()=>{if(FAM.fresh===f)FAM.fresh=null},2400)}
  rFamCal();famEarth(true);
  const tm=S.dates.find(d=>d.sol===sol+1);S.remind=S.remind||{};if(tm&&!S.remind[sol]){S.remind[sol]=1;save();setTimeout(()=>toast(t('fam_tomorrow',tx(tm.t))),600)}
  if(typeof spSuggest==='function')spSuggest('earth');if(FAM.open)rFamModal()}
function rFamCal(){const sol=solNow(),s0=sol-3;$('#famCal').innerHTML=[...Array(28)].map((_,i)=>{const s=s0+i,ev=S.dates.filter(d=>d.sol===s),cp=S.caps.filter(c=>c.sol===s);
  return`<button class="cday ${s===sol?'now':''} ${s<sol?'past':''}" data-csol="${s}" ${ev.length||cp.length?`data-tip="${esc([...ev.map(d=>tx(d.t)),...cp.map(c=>'✉ '+(person(c.who)?tx(person(c.who).name):''))].join(' · '))}"`:''}><b>${s}</b><span>${ev.map(()=>'<i class="dB"></i>').join('')}${cp.map(()=>'<i class="dG"></i>').join('')}</span></button>`}).join('')}
/* окно взаимодействия */
function famOpen(id){FAM.open=id;FAM.tab='msg';const M=$('#famModal');M.classList.add('on','intro');clearTimeout(FAM.ih);FAM.ih=setTimeout(()=>M.classList.remove('intro'),1500);rFamModal();setTimeout(()=>{const c=$('#famModal .fmClose');c&&c.focus()},50)}
function famClose(){FAM.open=null;stopVoice();$('#famModal').classList.remove('on');document.documentElement.style.setProperty('--vu',0)}
function rFamModal(){const p=person(FAM.open);if(!p){famClose();return}const sol=solNow(),caps=S.caps.filter(c=>c.who===p.id).sort((a,b)=>b.sol-a.sol),gal=(S.gallery||[]).filter(g=>g.pid===p.id&&MEDIA['gal:'+g.id]);
  const body=FAM.tab==='msg'?(caps.length?`<ul class="fmList">${caps.map(c=>{const op=c.sol<=sol,hv=!!MEDIA['voice:'+c.id];return`<li class="${op?'':'lock'}"><div><b>${t('sol')} ${c.sol}</b> <span class="mu sm">${op?(hv?'🎙 '+t('fam_voice'):'✎ '+t('fam_text')):t('fam_locked',c.sol)}</span>${op?`<p>«${esc(tx(c.text))}»</p>`:''}${op&&!hv?`<small class="mu">${t('fam_tts')}</small>`:''}</div>${op?`<button class="pri" data-fplay="${c.id}">▶ ${t(hv?'listen_voice':'read_aloud')}</button>`:''}</li>`}).join('')}</ul>`:FX.empty('✉',t('fam_nomsg'),'',''))
    :FAM.tab==='gal'?`<div class="fmGal">${gal.map(g=>g.type==='video'?`<video src="${MEDIA['gal:'+g.id]}" controls playsinline></video>`:`<img src="${MEDIA['gal:'+g.id]}" alt="">`).join('')}</div>${gal.length?'':FX.empty('🖼',t('fam_tab_gal'),t('fam_nogal'),'')}
      <label class="fmUp"><input type="file" id="famGalIn" accept="image/*,video/*" multiple>＋ ${t('fam_addgal')}</label>`
    :`<p class="sm mu">${t('fam_replyH',esc(tx(p.name)),tx(D().delay))}</p><textarea id="famRText" maxlength="400" placeholder="${t('ph_reply')}"></textarea>
      <div class="row" style="margin:.5rem 0"><button id="famRec">🎙 ${t('fam_record')}</button><span class="sm mu" id="famRecSt"></span></div><button class="pri" id="famSend">${t('queue_reply')}</button>`;
  $('#famModalBox').innerHTML=`<button class="fmClose" aria-label="${t('fam_close')}">✕</button><div class="fmHead">${holo(p,'big')}<div><span class="lbl">${t('fam_kicker')}</span><h2>${esc(tx(p.name))}</h2>${p.rel?`<p class="mu">${esc(p.rel)}</p>`:''}</div></div>
    <p class="fmEthic">🛡 ${t('fam_ethic')}</p><nav class="fmTabs">${[['msg','fam_tab_msg'],['gal','fam_tab_gal'],['reply','fam_tab_reply']].map(([k,i])=>`<button class="${FAM.tab===k?'sel':''}" data-ftab="${k}">${t(i)}</button>`).join('')}</nav><div class="fmBody">${body}</div>`}
/* Земля в панорамном окне (three.js) */
function famEarth(on){const box=$('#famWin');if(!box)return;if(!on||!window.THREE){if(FAM.earth)FAM.earth.R.setAnimationLoop(null);return}
  if(!FAM.earth){const T=THREE;let R;try{R=new T.WebGLRenderer({antialias:true,alpha:true})}catch(e){return}R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;box.prepend(R.domElement);
    const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,100);cam.position.set(0,.2,6.4);const g=new T.Group();g.rotation.z=.41;g.position.set(.7,-.4,0);sc.add(g);
    const tex=document.createElement('canvas');tex.width=1024;tex.height=512;const x=tex.getContext('2d'),r=rng(42),N=(()=>{const P=[...Array(256)].map(()=>r());return(a,b)=>{const i=Math.floor(a),j=Math.floor(b),fa=a-i,fb=b-j,h=(u,v)=>P[((u&15)*16+(v&15))&255],s=q=>q*q*(3-2*q);return h(i,j)*(1-s(fa))*(1-s(fb))+h(i+1,j)*s(fa)*(1-s(fb))+h(i,j+1)*(1-s(fa))*s(fb)+h(i+1,j+1)*s(fa)*s(fb)}})();
    const im=x.createImageData(1024,512),d=im.data;for(let yy=0;yy<512;yy++)for(let xx=0;xx<1024;xx++){const u=xx/1024*16,v=yy/512*8;let n=0,a=1,f=1;for(let o=0;o<5;o++){n+=a*N(u*f,v*f);a*=.5;f*=2}n/=1.94;const lat=Math.abs(yy/512-.5)*2,o=(yy*1024+xx)*4;
      let c;if(lat>.86)c=[235,242,250];else if(n>.53){const h=(n-.53)*4;c=lat>.6?[150,140,110]:[46+h*120,96+h*60,52+h*20];if(lat<.25&&n>.6)c=[176,150,96]}else{const dp=(.53-n)*2.2;c=[8,40+40*(1-dp),104+50*(1-dp)]}d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
    x.putImageData(im,0,0);const ct=document.createElement('canvas');ct.width=1024;ct.height=512;const y=ct.getContext('2d'),ci=y.createImageData(1024,512),cd=ci.data;
    for(let yy=0;yy<512;yy++)for(let xx=0;xx<1024;xx++){const u=xx/1024*24+7,v=yy/512*12+3;let n=0,a=1,f=1;for(let o=0;o<4;o++){n+=a*N(u*f,v*f*1.6);a*=.5;f*=2}n/=1.87;const o=(yy*1024+xx)*4,al=clamp((n-.5)*3.2,0,1);cd[o]=cd[o+1]=cd[o+2]=255;cd[o+3]=al*230}y.putImageData(ci,0,0);
    const et=new T.CanvasTexture(tex);et.colorSpace=T.SRGBColorSpace;const earth=new T.Mesh(new T.SphereGeometry(2,96,64),new T.MeshStandardMaterial({map:et,roughness:.85,metalness:0}));g.add(earth);
    const cl=new T.Mesh(new T.SphereGeometry(2.03,96,64),new T.MeshStandardMaterial({map:new T.CanvasTexture(ct),transparent:true,depthWrite:false}));g.add(cl);
    const atm=new T.Mesh(new T.SphereGeometry(2.25,64,48),new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,side:T.BackSide,depthWrite:false,
      vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec3 vN;void main(){float i=pow(.72-dot(vN,vec3(0,0,1.)),3.);gl_FragColor=vec4(.33,.72,1.,1.)*i;}'}));g.add(atm);
    const sun=new T.DirectionalLight(0xfff3e0,2.6);sun.position.set(-5,2,4);sc.add(sun);sc.add(new T.AmbientLight(0x2a3a66,.35));
    const ck=new T.Clock();FAM.earth={R,sc,cam,earth,cl,ck,box};new ResizeObserver(()=>{const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}).observe(R.domElement)}
  const E=FAM.earth;E.R.setAnimationLoop(()=>{if(curTab!=='earth'){E.R.setAnimationLoop(null);return}const tt=E.ck.getElapsedTime();if(!FX.reduce){E.earth.rotation.y=tt*.035;E.cl.rotation.y=tt*.045}E.R.render(E.sc,E.cam)})}
/* голос аватара: свечение ореола от громкости */
const _mouth=window.mouth;window.mouth=function(v){_mouth(v);document.documentElement.style.setProperty('--vu',(+v).toFixed(2))};
/* события */
document.addEventListener('click',e=>{const b=e.target.closest('[data-fam],[data-famup],[data-ftab],[data-fplay],[data-csol],.fmClose,#famRec,#famSend,#famUpload,#famRecordBtn');if(!b)return;
  if(b.dataset.fam)famOpen(b.dataset.fam);
  else if(b.id==='famUpload'||b.dataset.famup!==undefined&&b.hasAttribute('data-famup')){const d=$('#m-earth details');d.open=true;d.scrollIntoView({behavior:FX.reduce?'auto':'smooth',block:'center'});setTimeout(()=>$('#pName').focus(),300)}
  else if(b.id==='famRecordBtn'){if(S.people.length)famOpen(S.people[0].id),FAM.tab='reply',rFamModal();else $('#rText').focus()}
  else if(b.dataset.ftab){FAM.tab=b.dataset.ftab;rFamModal()}
  else if(b.dataset.fplay){const c=S.caps.find(x=>x.id===b.dataset.fplay);if(!c)return;if(MEDIA['voice:'+c.id])playVoice(MEDIA['voice:'+c.id]);else speakText(tx(c.text));if(!c.seen){c.seen=1;S.energy+=5;logAct(t('log_cap'));save()}}
  else if(b.dataset.csol){$('#dtS').value=b.dataset.csol;$('#dtT').focus();$('#dtT').scrollIntoView({behavior:FX.reduce?'auto':'smooth',block:'center'})}
  else if(b.classList.contains('fmClose'))famClose();
  else if(b.id==='famRec')recToggle(b,$('#famRecSt'),bl=>{FAM.blob=bl});
  else if(b.id==='famSend'){const s=$('#famRText').value.trim();if(!s&&!FAM.blob){toast(t('need_text'));return}const id='r'+Date.now();S.replies.push({id,sol:solNow(),text:s,to:FAM.open});if(FAM.blob)mediaPut('reply:'+id,FAM.blob);FAM.blob=null;logAct(t('fam_sent'));toast(t('fam_sent'));renderAll()}});
document.addEventListener('change',e=>{if(e.target.id!=='famGalIn')return;S.gallery=S.gallery||[];[...e.target.files].forEach(f=>{const id='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  mediaPut('gal:'+id,f);S.gallery.push({id,pid:FAM.open,type:f.type.startsWith('video')?'video':'image'})});save();rFamModal()});
$('#famModal').addEventListener('click',e=>{if(e.target.id==='famModal')famClose()});addEventListener('keydown',e=>{if(e.key==='Escape'&&FAM.open)famClose()});
/* «кем приходится» для новой карточки */
$('#pForm').addEventListener('submit',()=>{const n=S.people.length,rel=(($('#pRel')||{}).value||'').trim();let k=0;
  const w=setInterval(()=>{if(S.people.length>n){clearInterval(w);const p=S.people[S.people.length-1];if(rel){p.rel=rel.slice(0,40);$('#pRel').value='';save()}toast(t('fam_born'));if(curTab==='earth')rFamily()}else if(++k>60)clearInterval(w)},50)},true);
