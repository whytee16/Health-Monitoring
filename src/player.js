/* ===== Space Soundscape: общий музыкальный плеер и мягкие звуки интерфейса =====
   Музыка играет только после нажатия Play. Встроенные треки лежат в audio/*.js (base64, грузятся по требованию),
   свои файлы пользователя хранятся в IndexedDB этого браузера. */
const SP={cats:[
  {id:'deep',ic:'🌌',n:['Deep Space','Deep Space'],d:['Спокойный эмбиент и мягкие синтезаторы: для работы и отдыха','Calm ambient and soft synths for work and rest']},
  {id:'sleep',ic:'🌙',n:['Relax & Sleep','Relax & Sleep'],d:['Очень тихие текстуры перед сном','Very quiet textures before sleep']},
  {id:'focus',ic:'◎',n:['Focus Mode','Focus Mode'],d:['Минималистичная музыка для концентрации','Minimal music for concentration']},
  {id:'earth',ic:'🌍',n:['Earth Memories','Earth Memories'],d:['Тёплая музыка для семейных фото и посланий','Warm music for family photos and messages']},
  {id:'med',ic:'✦',n:['Cosmic Meditation','Cosmic Meditation'],d:['Медленные переходы для дыхания и медитации','Slow transitions for breathing and meditation']}],
  builtin:[{id:'b-deep',cat:'deep',name:'Space Ambient',by:'leberch',src:'deep'},{id:'b-focus',cat:'focus',name:'Reversal of Time',by:'alexzavesa',src:'focus'},
    {id:'b-sleep',cat:'sleep',name:'Meditative Ambient Space',by:'music_unlimited',src:'sleep'},{id:'b-earth',cat:'earth',name:'Natural Universe',by:'liecio',src:'earth'},
    {id:'b-med',cat:'med',name:'Endless Cosmos',by:'ashot_danielyan',src:'med'}],
  KEY:'space_sound_v1',st:null,a:null,url:{},ctx:null,an:null,gain:null,open:false,cur:null,hum:null};
const spL=()=>{const l=(window.LANG||document.documentElement.lang||'ru');return l==='ru'||l==='kk'?0:1};
const SPT={play:['Играть','Play'],pause:['Пауза','Pause'],prev:['Предыдущий трек','Previous track'],next:['Следующий трек','Next track'],vol:['Громкость','Volume'],
  mute:['Отключить все звуки','Mute all sound'],unmute:['Включить звуки','Unmute'],cat:['Категория','Category'],add:['Добавить свои треки','Add your tracks'],
  empty:['В этой категории пока нет треков','No tracks in this category yet'],emptyH:['Загрузите свою музыку: MP3, OGG или WAV. Файлы остаются только на этом устройстве.','Upload your own music: MP3, OGG or WAV. Files stay on this device only.'],
  hum:['Гул корабля','Ship hum'],sfx:['Звуки интерфейса','Interface sounds'],del:['Удалить','Delete'],title:['Space Soundscape','Space Soundscape'],
  added:['Добавлено треков: {0}','Tracks added: {0}'],fit:['Подходит сейчас:','Fits now:'],loading:['Загрузка трека…','Loading track…'],nothing:['Нет трека','No track'],builtin:['встроенный','built-in'],
  credit:['Встроенная музыка: авторы Pixabay (leberch, alexzavesa, music_unlimited, liecio, ashot_danielyan).','Built-in music: Pixabay authors (leberch, alexzavesa, music_unlimited, liecio, ashot_danielyan).']};
const spt=(k,...a)=>{let s=SPT[k][spL()];a.forEach((v,i)=>s=s.replace('{'+i+'}',v));return s};
/* хранилище */
function spLoad(){try{SP.st=JSON.parse(localStorage.getItem(SP.KEY))}catch(e){}SP.st=Object.assign({cat:'deep',vol:.6,muted:false,sfx:true,hum:false,tracks:[],idx:{}},SP.st||{})}
function spSave(){try{localStorage.setItem(SP.KEY,JSON.stringify(SP.st))}catch(e){}}
let spDB=null;
function spDBOpen(){return new Promise(res=>{try{const r=indexedDB.open('space-sound',1);r.onupgradeneeded=()=>r.result.createObjectStore('t');r.onsuccess=()=>{spDB=r.result;res()};r.onerror=()=>res()}catch(e){res()}})}
function spGet(id){return new Promise(res=>{if(!spDB)return res(null);try{const q=spDB.transaction('t').objectStore('t').get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)}catch(e){res(null)}})}
function spPut(id,blob){try{spDB&&spDB.transaction('t','readwrite').objectStore('t').put(blob,id)}catch(e){}}
function spDel(id){try{spDB&&spDB.transaction('t','readwrite').objectStore('t').delete(id)}catch(e){}}
const spTracks=cat=>[...SP.builtin.filter(t=>t.cat===cat),...SP.st.tracks.filter(t=>t.cat===cat)];
function spBuiltinURL(src){return new Promise((res,rej)=>{const A=window.__AUD;if(A&&A[src])return res(A[src]);const s=document.createElement('script');s.src='audio/'+src+'.js';
  s.onload=()=>window.__AUD&&__AUD[src]?res(__AUD[src]):rej();s.onerror=rej;document.head.appendChild(s)}).then(b64=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return URL.createObjectURL(new Blob([u],{type:'audio/mpeg'}))})}
async function spURL(t){if(SP.url[t.id])return SP.url[t.id];let u=null;if(t.src)u=await spBuiltinURL(t.src);else{const b=await spGet(t.id);if(b)u=URL.createObjectURL(b)}if(u)SP.url[t.id]=u;return u}
/* звук */
function spCtx(){if(!SP.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;SP.ctx=new A()}if(SP.ctx.state==='suspended')SP.ctx.resume();return SP.ctx}
function spWire(){if(SP.an||!spCtx())return;try{const src=SP.ctx.createMediaElementSource(SP.a);SP.an=SP.ctx.createAnalyser();SP.an.fftSize=64;src.connect(SP.an);SP.an.connect(SP.ctx.destination)}catch(e){}}
async function spPlay(){const list=spTracks(SP.st.cat);if(!list.length){spOpen(true);return}
  let i=SP.st.idx[SP.st.cat]||0;if(i>=list.length)i=0;const t=list[i];
  if(SP.cur!==t.id){SP.cur=t.id;$sp('.spName').textContent=spt('loading');let u;try{u=await spURL(t)}catch(e){u=null}if(!u){spNotify(spt('nothing'));spRender();return}SP.a.src=u}
  spCtx();spWire();SP.a.volume=SP.st.vol;SP.a.muted=SP.st.muted;try{await SP.a.play()}catch(e){}spRender();spWave()}
function spPause(){SP.a.pause();spRender()}
function spStep(d){const list=spTracks(SP.st.cat);if(!list.length)return;SP.st.idx[SP.st.cat]=((SP.st.idx[SP.st.cat]||0)+d+list.length)%list.length;spSave();const was=!SP.a.paused;SP.cur=null;if(was)spPlay();else spRender()}
function spSetCat(c){if(SP.st.cat===c)return;SP.st.cat=c;spSave();const was=SP.a&&!SP.a.paused;SP.cur=null;if(SP.a)SP.a.pause();if(was&&spTracks(c).length)spPlay();else spRender()}
function spMute(m){SP.st.muted=m;spSave();if(SP.a)SP.a.muted=m;if(m)spHum(false);window.dispatchEvent(new CustomEvent('spmute',{detail:m}));spRender()}
function spWave(){const bars=[...document.querySelectorAll('.spWave i')];if(!bars.length)return;const buf=new Uint8Array(32);
  (function loop(){if(!SP.a||SP.a.paused){bars.forEach(b=>b.style.transform='scaleY(.18)');return}
    if(SP.an){SP.an.getByteFrequencyData(buf);bars.forEach((b,i)=>b.style.transform=`scaleY(${(.15+buf[2+i*4]/255*.95).toFixed(2)})`)}
    else{const t=performance.now()/180;bars.forEach((b,i)=>b.style.transform=`scaleY(${(.35+.3*Math.sin(t+i)).toFixed(2)})`)}requestAnimationFrame(loop)})()}
const fmt=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
/* интерфейсные звуки: мягкие, короткие */
const SFX={tone(f,d,g,type){if(SP.st.muted||!SP.st.sfx)return;const c=spCtx();if(!c)return;const o=c.createOscillator(),a=c.createGain(),t=c.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(g,t+.02);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(c.destination);o.start(t);o.stop(t+d+.05)},
  notify(){this.tone(880,.35,.035);setTimeout(()=>this.tone(1320,.4,.025),90)},
  success(){[523,659,784].forEach((f,i)=>setTimeout(()=>this.tone(f,.55,.04,'triangle'),i*110))}};
function spHum(on){SP.st.hum=on;spSave();if(SP.hum){const h=SP.hum;SP.hum=null;h.g.gain.setTargetAtTime(0,h.c.currentTime,.4);setTimeout(()=>h.os.forEach(o=>o.stop()),1500)}
  if(on&&!SP.st.muted){const c=spCtx();if(!c)return;const g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;g.gain.value=0;lp.connect(g);g.connect(c.destination);
    const os=[55,55.6,110.3].map((f,i)=>{const o=c.createOscillator();o.frequency.value=f;o.type=i<2?'sine':'triangle';const k=c.createGain();k.gain.value=i<2?.5:.08;o.connect(k);k.connect(lp);o.start();return o});
    g.gain.setTargetAtTime(.05,c.currentTime,1.5);SP.hum={c,g,os}}spRender()}
/* уведомление */
function spNotify(s){if(typeof window.toast==='function')window.toast(s)}
/* разметка */
const $sp=s=>document.querySelector('#spPlayer '+s);
function spBuild(){const el=document.createElement('section');el.id='spPlayer';el.setAttribute('aria-label','Space Soundscape');document.body.appendChild(el);
  SP.a=new Audio();SP.a.preload='none';SP.a.addEventListener('timeupdate',spTime);SP.a.addEventListener('ended',()=>spStep(1));SP.a.addEventListener('pause',spRender);SP.a.addEventListener('play',spRender);
  el.addEventListener('click',spClick);el.addEventListener('input',e=>{if(e.target.classList.contains('spVol')){SP.st.vol=+e.target.value;SP.a.volume=SP.st.vol;spSave()}if(e.target.classList.contains('spSeek')&&isFinite(SP.a.duration))SP.a.currentTime=+e.target.value*SP.a.duration});
  el.addEventListener('change',async e=>{if(!e.target.classList.contains('spFile'))return;const fs=[...e.target.files].filter(f=>/^audio\//.test(f.type)||/\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(f.name));
    fs.forEach(f=>{const id='u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);spPut(id,f);SP.url[id]=URL.createObjectURL(f);SP.st.tracks.push({id,cat:SP.st.cat,name:f.name.replace(/\.[^.]+$/,'').slice(0,60)})});
    e.target.value='';spSave();spRender();if(fs.length){spNotify(spt('added',fs.length));SFX.success()}});
  spRender()}
function spTime(){const c=$sp('.spTime');if(c)c.textContent=fmt(SP.a.currentTime)+' / '+fmt(SP.a.duration);const s=$sp('.spSeek');if(s&&isFinite(SP.a.duration)&&document.activeElement!==s)s.value=SP.a.currentTime/SP.a.duration}
function spRender(){const el=document.getElementById('spPlayer');if(!el)return;const c=SP.cats.find(x=>x.id===SP.st.cat),L=spL(),list=spTracks(SP.st.cat),i=Math.min(SP.st.idx[SP.st.cat]||0,Math.max(0,list.length-1)),t=list[i],pl=SP.a&&!SP.a.paused;
  el.classList.toggle('playing',!!pl);el.classList.toggle('open',SP.open);el.classList.toggle('muted',!!SP.st.muted);
  const ic={play:'<path d="M8 5v14l11-7z"/>',pause:'<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',prev:'<path d="M6 6h2v12H6zM9.5 12l8.5 6V6z"/>',next:'<path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/>',
    vol:SP.st.muted?'<path d="M3 9v6h4l5 5V4L7 9H3zm13.6 3l2.9-2.9-1.4-1.4-2.9 2.9-2.9-2.9-1.4 1.4 2.9 2.9-2.9 2.9 1.4 1.4 2.9-2.9 2.9 2.9 1.4-1.4z"/>':'<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/>'};
  const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ic[k]}</svg>`;
  el.innerHTML=`<div class="spHead"><button class="spCat" data-sp="cat" aria-expanded="${SP.open}" data-tip="${spt('cat')}"><span>${c.ic}</span><b>${c.n[L]}</b><small>▾</small></button>
      <button class="spIco" data-sp="mute" aria-label="${spt(SP.st.muted?'unmute':'mute')}" data-tip="${spt(SP.st.muted?'unmute':'mute')}">${svg('vol')}</button></div>
    <div class="spNow"><div class="spWave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="spMeta"><span class="spName">${t?esc2(t.name):spt('nothing')}</span><small>${t?(t.by?esc2(t.by)+' · '+spt('builtin'):''):''}</small></div></div>
    <input class="spSeek" type="range" min="0" max="1" step=".001" value="0" aria-label="seek" ${t?'':'disabled'}>
    <div class="spCtl"><button class="spIco" data-sp="prev" aria-label="${spt('prev')}" ${list.length>1?'':'disabled'}>${svg('prev')}</button>
      <button class="spMain" data-sp="${pl?'pause':'play'}" aria-label="${spt(pl?'pause':'play')}">${svg(pl?'pause':'play')}</button>
      <button class="spIco" data-sp="next" aria-label="${spt('next')}" ${list.length>1?'':'disabled'}>${svg('next')}</button><span class="spTime mono">0:00 / 0:00</span></div>
    <label class="spVolL"><span class="sr">${spt('vol')}</span><input class="spVol" type="range" min="0" max="1" step=".01" value="${SP.st.vol}" aria-label="${spt('vol')}"></label>
    <div class="spPanel" ${SP.open?'':'hidden'}>
      <div class="spCats">${SP.cats.map(x=>`<button data-spc="${x.id}" class="${x.id===SP.st.cat?'sel':''}" data-tip="${esc2(x.d[L])}"><span>${x.ic}</span>${x.n[L]}<em>${spTracks(x.id).length}</em></button>`).join('')}</div>
      <p class="spDesc">${esc2(c.d[L])}</p>
      ${list.length?`<ol class="spList">${list.map((x,j)=>`<li class="${j===i?'cur':''}"><button data-spt="${j}">${esc2(x.name)}${x.by?` <small>${esc2(x.by)}</small>`:''}</button>${x.src?'':`<button class="spX" data-spd="${x.id}" aria-label="${spt('del')}">✕</button>`}</li>`).join('')}</ol>`
        :`<div class="spEmpty"><div>🎧</div><b>${spt('empty')}</b><p>${spt('emptyH')}</p></div>`}
      <label class="spUp"><input type="file" class="spFile" accept="audio/*,.mp3,.ogg,.wav,.m4a" multiple>＋ ${spt('add')}</label>
      <div class="spOpts"><label><input type="checkbox" data-sp="sfx" ${SP.st.sfx?'checked':''}> ${spt('sfx')}</label><label><input type="checkbox" data-sp="hum" ${SP.st.hum?'checked':''}> ${spt('hum')}</label></div>
      <p class="spCredit">${spt('credit')}</p></div>
    <div class="spSug" hidden></div>`;
  spTime();if(pl)spWave()}
const esc2=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function spOpen(v){SP.open=v===undefined?!SP.open:v;spRender()}
function spClick(e){const b=e.target.closest('[data-sp],[data-spc],[data-spt],[data-spd]');if(!b){if(e.target.closest('.spNow'))spOpen();return}const k=b.dataset.sp;
  if(b.dataset.spc){spSetCat(b.dataset.spc);return}
  if(b.dataset.spt!=null){SP.st.idx[SP.st.cat]=+b.dataset.spt;SP.cur=null;spSave();spPlay();return}
  if(b.dataset.spd){const id=b.dataset.spd;spDel(id);SP.st.tracks=SP.st.tracks.filter(x=>x.id!==id);if(SP.cur===id){SP.a.pause();SP.cur=null}spSave();spRender();return}
  if(k==='play')spPlay();else if(k==='pause')spPause();else if(k==='prev')spStep(-1);else if(k==='next')spStep(1);else if(k==='cat')spOpen();
  else if(k==='mute')spMute(!SP.st.muted);else if(k==='sfx'){SP.st.sfx=b.checked;spSave()}else if(k==='hum')spHum(b.checked);else if(k==='sug'){spSetCat(b.dataset.cat);spPlay()}}
/* контекстная подсказка: «подходит сейчас» */
function spSuggest(cat){const el=$sp('.spSug');if(!el)return;if(!cat||cat===SP.st.cat||(SP.a&&!SP.a.paused&&cat===SP.st.cat)){el.hidden=true;return}const c=SP.cats.find(x=>x.id===cat);
  el.innerHTML=`${spt('fit')} <button data-sp="sug" data-cat="${cat}">${c.ic} ${c.n[spL()]} ▶</button>`;el.hidden=false}
(async function(){spLoad();await spDBOpen();spBuild();if(SP.st.hum)SP.st.hum=false;
  const T=window.toast;if(typeof T==='function'){window.toast=function(s){T(s);SFX.notify()}}
  addEventListener('keydown',e=>{if(e.key==='Escape'&&SP.open)spOpen(false)})})();
