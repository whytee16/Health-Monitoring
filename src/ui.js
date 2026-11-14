/* ===== интерфейс модулей здоровья ===== */
const NAV=[['over','nav_over'],['body','nav_body'],['trend','nav_trend'],['mind','nav_mind'],['earth','nav_earth'],['help','nav_help'],['mission','nav_mission'],['colony','nav_colony']];
let curTab='over',chMet='rad',chRange=14,dRange=14,selTile=null,curGame='breath';
const sols=n=>{if(LANG==='ru'||LANG==='kk'){const a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'сол':a>=2&&a<=4&&(b<10||b>20)?'сола':'солов')}return n+(n===1?' sol':' sols')};
function applyI18n(){
  document.documentElement.lang=LANG;document.title=t('brand');
  $$('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
  $('#nav').innerHTML=NAV.map(([k,i],n)=>`<button role="tab" data-t="${k}" aria-selected="${k===curTab}"><i>0${n+1}</i><span>${t(i)}${k==='help'?'<span class="dot" id="docBdg"></span>':''}</span></button>`).join('');
  $('#langSel').innerHTML=LANGS.map(([k,n])=>`<option value="${k}" ${k===LANG?'selected':''}>${n}</option>`).join('');
  $('#sndBtn').textContent=t(sndOn?'snd_off':'snd_on');
  $('#cText').placeholder=t('ph_cap');$('#pName').placeholder=t('ph_name');$('#dtT').placeholder=t('ph_date');$('#dtS').placeholder=t('sol').toLowerCase();$('#rText').placeholder=t('ph_reply');
  $('#scn').innerHTML=SCN.map(k=>`<button data-scn="${k}">${t('scn_'+k)}</button>`).join('');
  $('#colPause').textContent=t(CG.paused?'col_resume':'col_pause');
}
function setTab(k,keep){curTab=k;$$('.mod').forEach(e=>e.classList.toggle('on',e.id==='m-'+k));
  $$('#nav button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===k));if(!keep)window.scrollTo(0,0);renderAll()}

/* ---------- обзор ---------- */
function rBoard(){
  const rows=[...CARDS,'mood'];
  $('#tmBody').innerHTML=rows.map(c=>{const l=lvCard(c),k=c==='bp'?'sys':c;
    const vals=c==='mood'?S.hist.slice(-14).map(h=>moodScore(h.d)):S.hist.slice(-14).map(h=>h.v[k]);
    const d=c==='mood'?null:today().v[k]-base(k);
    return `<tr data-c="${c}" tabindex="0"><td><b>${mName(c)}</b>${WX[c]?`<div class="sm mu">${t(WX[c])}</div>`:''}</td>
      <td class="v">${valTxt(c)} <span class="sm mu">${mUnit(c)}</span></td><td class="d hide">${normTxt(c)}${d==null?'':' / '+(d>0?'+':'')+f(d,M[k].d)}</td><td class="hide">${spark(vals,l)}</td><td>${lvTag(l)}</td></tr>`}).join('');
  const w=worst(),m=$('#master');m.className='master st'+w;m.textContent=t('master'+w);
}
function routState(){return S.rout[solNow()]||(S.rout[solNow()]={})}
function rRemind(){
  const st=routState(),nx=ROUT.find(r=>!st[r.id]);
  $('#remind').innerHTML=nx?`<p><b>${tx(nx.when)}.</b> ${tx(nx.t)}</p><details><summary>${t('how_do')}</summary><p class="sm">${tx(nx.how)}</p></details>
    <div class="row"><button class="pri" data-go="${nx.id==='diary'?'mind':'body'}">${t(nx.id==='diary'?'open_diary':'enter_meas')}</button><button data-rd="${nx.id}">${t('already')}</button></div>
    <p class="sm mu" style="margin-top:.5rem">${t('rout_done',Object.keys(st).length,ROUT.length)}</p>`:`<p>${t('rout_all')}</p>`;
  $('#routine').innerHTML=ROUT.map(r=>`<div class="proto ${st[r.id]?'done':''}"><div><b>${tx(r.when)}.</b> ${tx(r.t)}<details><summary>${t('how_do')}</summary><p class="sm">${tx(r.how)}</p></details></div>
    <button data-rd="${r.id}" ${st[r.id]?'disabled':''}>${t(st[r.id]?'done':'mark')}</button></div>`).join('')}
function rForecast(){
  const on=['sleep','rad','pulse','ex','mood'].filter(c=>lvCard(c)>0);let h;
  if(!on.length)h=`<p><b>${t('fc_clear')}</b> ${t('fc_keep')}</p>`;
  else h=on.map(c=>`<p>${lvTag(lvCard(c))} <b>${mName(c)}</b><br>${t('fc_'+c)}${c!=='mood'?` <span class="mu sm">${t('over3')}: ${trendTxt(c,3)}.</span>`:''}</p>`).join('');
  const dt=S.dates.filter(d=>d.sol>solNow()&&d.sol-solNow()<=3)[0],cp=S.caps.filter(c=>c.sol===solNow()+1)[0];
  if(dt)h+=`<p class="note">${t('in_n',sols(dt.sol-solNow()))}: ${esc(tx(dt.t))}.</p>`;
  if(cp)h+=`<p class="note">${t('cap_tomorrow')}</p>`;
  $('#forecast').innerHTML=h}

/* ---------- тренды ---------- */
function rChart(){
  $('#chMet').innerHTML=CARDS.map(c=>`<button class="chip ${c===chMet?'sel':''}" data-m="${c}"><span class="st st${lvCard(c)}"><i></i></span>${mName(c)}</button>`).join('');
  $$('[data-r]').forEach(b=>b.classList.toggle('sel',+b.dataset.r===chRange));
  const k=chMet==='bp'?'sys':chMet,m=M[k],hs=S.hist.slice(-chRange),b=base(k),[w1,w2]=thr(k);
  const band=[m.dir===1?-Infinity:b-w1,m.dir===-1?Infinity:b+w1],lines=[];if(m.dir!==1)lines.push(b-w2);if(m.dir!==-1)lines.push(b+w2);
  const series=[{vals:hs.map(h=>h.v[k]),color:'#e9eff7',lv:hs.map(h=>dev(k,h.v[k]).lv)}];
  if(chMet==='bp')series.push({vals:hs.map(h=>h.v.dia),color:'#8b9cb3',lv:hs.map(h=>dev('dia',h.v.dia).lv)});
  drawChart($('#chart'),{xs:hs.map(h=>h.sol),series,band:chMet==='bp'?[b-w1,b+w1]:band,lines:chMet==='bp'?[b+w2]:lines.filter(v=>v>0),dec:m.d,events:hs.map((h,i)=>h.ev?{i,t:evName(h.ev)}:null).filter(Boolean)});
  $('#chNote').textContent=mName(chMet)+', '+mUnit(chMet)+'. '+t('chart_note')+' '+t('over_n',sols(Math.min(chRange,S.hist.length)))+': '+trendTxt(chMet,chRange)+'.'}
function solWorst(h){return Math.max(...CARDS.map(c=>lvCard(c,h)),lvCard('mood',h))}
function rTiles(){
  const hs=S.hist.slice(-14),col=['rgba(58,214,166,.22)','rgba(255,178,36,.34)','rgba(255,95,76,.42)'];
  $('#tiles').innerHTML=hs.map(h=>{const l=solWorst(h);return `<button class="tile ${selTile===h.sol?'sel':''}" data-sol="${h.sol}" style="background:${col[l]}" title="${t('st'+l)}">${h.sol}<small>${h.ev?'◆':'&nbsp;'}</small></button>`}).join('');
  const h=S.hist.find(x=>x.sol===selTile);
  if(h){const dv=CARDS.filter(c=>lvCard(c,h)>0).map(c=>`${mName(c)} ${valTxt(c,h)} ${mUnit(c)} (${t('st'+lvCard(c,h)).toLowerCase()})`);
    const ac=S.log.filter(a=>a.sol===h.sol).map(a=>esc(a.t));
    $('#tileInfo').innerHTML=`<b>${t('sol')} ${h.sol}.</b> ${h.ev?t('event')+': '+esc(evName(h.ev))+'. ':''}${dv.length?dv.join('; ')+'.':t('wx_all_ok')} ${t('m_mood')} ${f(moodScore(h.d),1)}/5.${ac.length?' '+t('done_list')+': '+ac.join('; ')+'.':''}`}
  else $('#tileInfo').textContent=''}

/* ---------- тело ---------- */
function corPos(k,v){const b=base(k),[w1,w2]=thr(k),d=v-b,a=Math.abs(d),p=a<=w1?a/w1*20:a<=w2?20+(a-w1)/(w2-w1)*20:40+Math.min((a-w2)/w2,1)*9;return 50+Math.sign(d)*p}
function metCard(c){
  const l=lvCard(c),m=M[c],k=c==='bp'?'sys':c,v=today().v[k],d=v-base(k),sn=streak(c,1);
  const dTxt=Math.abs(d)<1e-9?t('on_base'):t(d>0?'above':'below')+' '+f(Math.abs(d),M[k].d);
  let extra='';if(c==='rad')extra=' '+t('rad_env',tx(D().n),f(D().rad,1));if(c==='ex')extra=' '+t('ex_env',tx(D().n),f(D().g,2),exTarget(D().g));
  const pr=l>0?m.p.map((p,i)=>{const dn=S.done[solNow()+':'+c+':'+i];return `<div class="proto ${dn?'done':''}"><span>${tx(p)}</span><button data-pr="${c}:${i}" ${dn?'disabled':''}>${dn?t('done'):t('done')+' +5 ✦'}</button></div>`}).join('')
    :`<p class="sm"><span class="lbl">${t('prevent')}</span><br>${tx(m.prev)}</p>`;
  return `<div class="met"><div class="hd2"><b>${mName(c)}</b>${lvTag(l)}</div>
    <div class="hd2"><span class="val">${valTxt(c)} <span class="sm mu">${mUnit(c)}</span></span><span class="sm mu">${t('your_base')} ${normTxt(c)}, ${dTxt}${sn>1?', '+t('in_row',sols(sn)):''}</span></div>
    <div class="cor" aria-hidden="true"><u style="left:${corPos(k,v)}%"></u></div>
    <details><summary>${t('what_why')}</summary><p class="sm">${tx(m.what)}</p><p class="sm"><b>${t('how_meas')}</b> ${tx(m.how)}</p></details>
    <details><summary>${t('space_fx')}</summary><p class="sm">${tx(m.space)}${extra}</p></details>
    ${l>0?`<p class="lbl" style="margin:.6rem 0 .2rem">${t('do_now')}</p>`:''}${pr}
    <button class="ghost sm" data-chart="${c}">${t('to_chart')}</button></div>`}
function rBody(){
  rAnat();const O=TOPIC[selTp],l=topicLv(selTp);$('#tpLbl').textContent=tx(O.n);
  let mood='';if(O.mood){const ml=lvCard('mood');mood=`<div class="met"><div class="hd2"><b>${t('mood_diary')}</b>${lvTag(ml)}</div><p class="sm">${t('mood_today',f(moodScore(today().d),1))}</p><button data-go="mind">${t('open_diary')}</button></div>`}
  $('#tpPanel').innerHTML=`<div class="hd2" style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;align-items:baseline"><h2>${tx(O.n)}</h2>${lvTag(l)}</div>
    <p>${tx(O.t)}</p><p class="note sm"><span class="lbl">${t('space_fx')}</span><br>${tx(O.s)}</p>${O.m.map(metCard).join('')}${mood}
    <div class="chips" style="margin-top:.8rem">${Object.keys(TOPIC).map(o=>`<button class="chip ${o===selTp?'sel':''}" data-tp="${o}"><span class="st st${topicLv(o)}"><i></i></span>${tx(TOPIC[o].n)}</button>`).join('')}</div>`}
function rForm(){
  const key=solNow()+S.dest+LANG;if($('#mInputs').dataset.key===key&&$('#mInputs').contains(document.activeElement))return;
  $('#mInputs').dataset.key=key;
  $('#mInputs').innerHTML=KEYS.map(k=>`<div><label for="in_${k}">${mName(k)}, ${mUnit(k)}</label><input type="number" inputmode="decimal" id="in_${k}" min="${M[k].min}" max="${M[k].max}" step="${M[k].step}" value="${today().v[k]}"></div>`).join('')}

/* ---------- дневник ---------- */
function rDiary(){
  const d=today().d;
  if(!$('#dQs').contains(document.activeElement)||$('#dQs').dataset.l!==LANG){$('#dQs').dataset.l=LANG;
    $('#dQs').innerHTML=DQ.map(q=>`<div class="q"><label for="dq_${q.k}"><b>${tx(q.q)}</b> <span class="mono" id="dv_${q.k}">${d[q.k]}</span>/5</label><input type="range" id="dq_${q.k}" min="1" max="5" step="1" value="${d[q.k]}"><div class="ends"><span>${tx(q.a)}</span><span>${tx(q.b)}</span></div></div>`).join('')}
  $$('[data-dr]').forEach(b=>b.classList.toggle('sel',+b.dataset.dr===dRange));
  const hs=S.hist.slice(-dRange);
  drawChart($('#dChart'),{xs:hs.map(h=>h.sol),min:.6,max:5.4,dec:0,series:DQ.map(q=>({vals:hs.map(h=>h.d?h.d[q.k]:null),color:q.c})),events:hs.map((h,i)=>h.ev?{i,t:evName(h.ev)}:null).filter(Boolean)});
  $('#dLegend').innerHTML=DQ.map(q=>`<span class="chip" style="min-height:26px"><i style="width:14px;height:3px;background:${q.c};display:inline-block"></i>${tx(q.q)}</span>`).join('');
  $('#dInsight').innerHTML=diaryInsight().map(x=>`<div class="note ${x.doc?'doc':''}">${x.t}${x.btn?`<div class="row" style="margin-top:.4rem">${x.btn}</div>`:''}</div>`).join('')}
function dStreak(k,test){let n=0;for(let i=S.hist.length-1;i>=0&&S.hist[i].d&&test(S.hist[i].d[k]);i--)n++;return n}
function diaryInsight(){
  const o=[],hm=dStreak('home',v=>v>=4),ti=dStreak('tired',v=>v>=4),wl=dStreak('well',v=>v<=2),so=dStreak('social',v=>v<=2);
  const btn=`<button data-go="earth">${t('nav_earth')}</button><button data-game="breath">${t('g_breath')}</button>`;
  if(hm>=5)o.push({doc:1,t:t('in_home5',sols(hm)),btn});else if(hm>=2)o.push({t:t('in_home2',sols(hm)),btn});else if(hm===1)o.push({t:t('in_home1'),btn});
  if(ti>=3)o.push({t:t('in_tired',sols(ti))});if(wl>=3)o.push({doc:1,t:t('in_well',sols(wl))});if(so>=3)o.push({t:t('in_social',sols(so))});
  if(!o.length)o.push({t:t('in_none')});return o}

/* ---------- земля ---------- */
const DEMO_IMG='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb7e6"/><stop offset="1" stop-color="#fbe3b8"/></linearGradient></defs><rect width="400" height="300" fill="url(#s)"/><circle cx="318" cy="66" r="30" fill="#fff3c9"/><path d="M0 220 Q100 170 200 215 T400 200 V300 H0Z" fill="#7fb069"/><path d="M0 250 Q140 215 400 245 V300 H0Z" fill="#5d9450"/><rect x="60" y="150" width="110" height="80" fill="#f4e3c8"/><path d="M48 152 L115 100 L182 152Z" fill="#b5533c"/><rect x="78" y="172" width="28" height="28" fill="#ffd97a"/><rect x="126" y="184" width="26" height="46" fill="#8a5a3c"/><rect x="262" y="150" width="10" height="70" fill="#7a5235"/><circle cx="267" cy="140" r="36" fill="#4f8a45"/><circle cx="252" cy="130" r="5" fill="#d9483b"/><circle cx="280" cy="150" r="5" fill="#d9483b"/><g fill="#26303f"><circle cx="205" cy="196" r="10"/><path d="M193 250 L197 210 H213 L217 250Z"/><path d="M213 214 L232 192" stroke="#26303f" stroke-width="5" stroke-linecap="round"/><circle cx="236" cy="210" r="8"/><path d="M227 250 L230 221 H242 L245 250Z"/><path d="M230 224 L218 206" stroke="#26303f" stroke-width="4" stroke-linecap="round"/></g></svg>');
function avaSrc(p){if(p&&MEDIA['photo:'+p.id])return MEDIA['photo:'+p.id];const n=p?tx(p.name):'?';
  return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect width="60" height="60" fill="#18233a"/><circle cx="30" cy="24" r="11" fill="${p?p.skin:'#e8bb9c'}"/><path d="M10 60 Q30 30 50 60Z" fill="#0b3d91"/><text x="30" y="56" text-anchor="middle" font-size="10" fill="#e9eff7" font-family="sans-serif">${esc(n[0]||'')}</text></svg>`)}
const person=id=>S.people.find(p=>p.id===id);
function rEarth(){
  $('#people').innerHTML=S.people.map(p=>`<div class="person"><img class="ava" src="${avaSrc(p)}" alt=""><div style="flex:1"><b>${esc(tx(p.name))}</b><div class="sm mu">${t(MEDIA['photo:'+p.id]?'photo_yes':'photo_no')}</div></div><button class="ghost sm" data-pdel="${p.id}">${t('del')}</button></div>`).join('')||`<p class="mu">${t('no_people')}</p>`;
  const opts=S.people.map(p=>`<option value="${p.id}">${esc(tx(p.name))}</option>`).join('');
  if(document.activeElement!==$('#cWho'))$('#cWho').innerHTML=opts;
  const bw=$('#bWho'),bv=bw.value;bw.innerHTML=opts+`<option value="">${t('demo_pic')}</option>`;if([...bw.options].some(o=>o.value===bv))bw.value=bv;
  const sol=solNow();
  $('#capsList').innerHTML=[...S.caps].sort((a,b)=>a.sol-b.sol).map(c=>{const p=person(c.who),nm=p?esc(tx(p.name)):t('relative');
    return c.sol<=sol?`<div class="caps"><div class="row" style="justify-content:space-between"><span><b>${nm}</b> <span class="mu sm">${t('sol').toLowerCase()} ${c.sol}${c.sol===sol?', '+t('opened_today'):''}${MEDIA['voice:'+c.id]?', '+t('with_voice'):''}${c.demo?', '+t('demo_text'):''}</span></span><span class="row"><button class="pri" data-open="${c.id}">${t('open')}</button><button class="ghost sm" data-cdel="${c.id}">${t('del')}</button></span></div></div>`
      :`<div class="caps locked"><b>${nm}</b> <span class="mu sm">${t('opens_in',c.sol,sols(c.sol-sol))}</span></div>`}).join('')||`<p class="mu">${t('no_caps')}</p>`;
  $('#dates').innerHTML=[...S.dates].sort((a,b)=>a.sol-b.sol).map(d=>`<div class="person" style="padding:.4rem 0"><div style="flex:1"><b>${esc(tx(d.t))}</b><div class="sm mu">${t('sol').toLowerCase()} ${d.sol}, ${d.sol===sol?t('today'):d.sol>sol?t('in_n',sols(d.sol-sol)):t('passed')}</div></div><button class="ghost sm" data-ddel="${S.dates.indexOf(d)}">${t('del')}</button></div>`).join('')||`<p class="mu">${t('no_dates')}</p>`;
  $('#replyHint').textContent=t('reply_hint',tx(D().delay));
  $('#replies').innerHTML=S.replies.map(r=>`<div class="caps"><span class="mu">${t('sol')} ${r.sol}, ${t('queued')}.</span> ${esc(r.text||t('voice_msg'))} ${MEDIA['reply:'+r.id]?`<button class="sm" data-rplay="${r.id}">${t('listen')}</button>`:''}</div>`).join('')}
let playing=null,curCap=null;
function mouth(v){const m=$('#fMouth');m.setAttribute('ry',(2.5+v*13).toFixed(1));m.setAttribute('rx',(13-v*3).toFixed(1))}
function stopVoice(){if(playing){try{playing.a&&playing.a.pause()}catch(e){}clearInterval(playing.iv);cancelAnimationFrame(playing.raf)}playing=null;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}mouth(0)}
function playVoice(url){
  stopVoice();const ac=acGet(),a=new Audio(url),me={a};playing=me;
  if(ac){try{const src=ac.createMediaElementSource(a),an=ac.createAnalyser();an.fftSize=256;src.connect(an);an.connect(ac.destination);const buf=new Uint8Array(an.fftSize);
    const loop=()=>{if(playing!==me)return;an.getByteTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++){const x=(buf[i]-128)/128;s+=x*x}mouth(clamp(Math.sqrt(s/buf.length)*5,0,1));me.raf=requestAnimationFrame(loop)};loop()}catch(e){}}
  a.onended=()=>{if(playing===me)stopVoice()};a.play().catch(()=>{toast(t('play_fail'));stopVoice()})}
function speakText(s){
  stopVoice();if(!('speechSynthesis' in window)){toast(t('no_tts'));return}
  const u=new SpeechSynthesisUtterance(s);u.lang={ru:'ru-RU',en:'en-US',kk:'kk-KZ',zh:'zh-CN',ja:'ja-JP',fr:'fr-FR',de:'de-DE',es:'es-ES'}[LANG];u.rate=.95;const me={};playing=me;
  me.iv=setInterval(()=>mouth(.2+Math.random()*.7),110);u.onend=u.onerror=()=>{if(playing===me)stopVoice()};speechSynthesis.speak(u)}
function openCap(id){
  const c=S.caps.find(x=>x.id===id);if(!c||c.sol>solNow())return;curCap=c;const p=person(c.who);
  $('#playCard').style.display='';$('#playTitle').textContent=(p?tx(p.name):t('relative'))+', '+t('sol').toLowerCase()+' '+c.sol;$('#playText').textContent='«'+tx(c.text)+'»';
  $('#fHead').setAttribute('fill',p?p.skin:'#e8bb9c');$('#fNeck').setAttribute('fill',p?p.skin:'#e2b193');$('#fHair').setAttribute('fill',p?p.hair:'#4a3530');
  const ph=$('#playPhoto');if(p&&MEDIA['photo:'+p.id]){ph.src=MEDIA['photo:'+p.id];ph.style.display=''}else ph.style.display='none';
  const hv=!!MEDIA['voice:'+c.id];$('#playVoice').textContent=t(hv?'listen_voice':'read_aloud');$('#playNote').textContent=t(hv?'voice_real':'voice_tts');
  if(!c.seen){c.seen=1;logAct(t('log_cap'));S.energy+=5;save()}
  $('#playCard').scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest'})}
setInterval(()=>{const e=$('#fEyes');if(!e)return;e.setAttribute('transform','translate(0 65) scale(1 .1)');setTimeout(()=>e.removeAttribute('transform'),130)},4200);
let rec=null;
async function recToggle(btn,stEl,cb){
  if(rec){rec.stop();return}
  if(!navigator.mediaDevices||!window.MediaRecorder){stEl.textContent=t('rec_na');return}
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:true}),chunks=[];const r=new MediaRecorder(stream);rec=r;const lbl=btn.textContent;
    r.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    r.onstop=()=>{stream.getTracks().forEach(x=>x.stop());rec=null;btn.textContent=lbl;stEl.textContent=t('rec_ready');cb(new Blob(chunks,{type:r.mimeType||'audio/webm'}))};
    r.start();btn.textContent=t('rec_stop');stEl.textContent=t('rec_going')}
  catch(e){stEl.textContent=t('rec_denied')}}
let capBlob=null,replyBlob=null;

/* ---------- разгрузка: игры ---------- */
function setGame(g){curGame=g;$$('.game').forEach(e=>e.style.display=e.id==='g-'+g?'':'none');$$('#gameSel [data-g]').forEach(b=>b.classList.toggle('sel',b.dataset.g===g));if(g==='garden')drawGarden();if(g==='memory'&&!Mem.cards.length)memNew()}
const B={on:false,t0:0,cycle:0,total:5,inh:4,exh:6,match:0,frames:0,clar:0,held:false,done:false,auto:false};
function sigDraw(){
  const c=$('#sigNoise');if(!c.clientWidth)return;if(c.width!==160){c.width=160;c.height=120}
  const x=c.getContext('2d'),n=1-B.clar;x.clearRect(0,0,160,120);
  if(n>.01){const im=x.createImageData(160,120),d=im.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=v*.75;d[i+1]=v*.85;d[i+2]=v;d[i+3]=255*Math.min(1,n*1.1)*(.55+Math.random()*.45)}x.putImageData(im,0,0);
    x.fillStyle=`rgba(5,7,12,${n*.5})`;for(let y=0;y<120;y+=4)x.fillRect(0,y,160,1)}
  $('#sigImg').style.filter=`blur(${(n*14).toFixed(1)}px) saturate(${(.3+.7*B.clar).toFixed(2)})`}
function breathPhoto(){const p=person($('#bWho').value);$('#sigImg').src=p&&MEDIA['photo:'+p.id]?MEDIA['photo:'+p.id]:DEMO_IMG}
function breathReset(){B.on=false;B.done=false;B.clar=0;B.cycle=0;B.match=B.frames=0;B.auto=false;$('#bEnd').style.display='none';$('#holdBtn').disabled=true;$('#holdBtn').classList.remove('held');B.held=false;$('#ringC').setAttribute('r',26);$('#ringT').textContent=t('ready');$('#bStat').textContent='';breathPhoto();sigDraw()}
function breathStart(){breathReset();B.total=S.short?2:5;B.inh=S.short?2.5:4;B.exh=S.short?3.5:6;B.on=true;B.t0=performance.now();$('#holdBtn').disabled=false;$('#bStat').textContent=t('cycle_n',1,B.total);requestAnimationFrame(breathLoop)}
function breathLoop(ts){
  if(!B.on)return;const el=(ts-B.t0)/1000,per=B.inh+B.exh,cyc=Math.floor(el/per),ph=el%per,inh=ph<B.inh;
  if(cyc>B.cycle){const acc=B.frames?B.match/B.frames:0;B.clar=clamp(B.clar+(acc>=.55?1:.4)/B.total,0,1);B.cycle=cyc;B.match=B.frames=0;
    if(B.clar>=.999){breathFinish();return}
    $('#bStat').textContent=t(acc>=.55?'br_good':'br_almost')+' '+t('br_clear',Math.round(B.clar*100))}
  B.frames++;if(B.held===inh)B.match++;
  $('#ringC').setAttribute('r',(inh?26+52*(ph/B.inh):78-52*((ph-B.inh)/B.exh)).toFixed(1));$('#ringT').textContent=t(inh?'inhale':'exhale');
  if(B.frames%3===0)sigDraw();requestAnimationFrame(breathLoop)}
function breathFinish(){
  B.on=false;B.done=true;B.clar=1;sigDraw();$('#holdBtn').disabled=true;$('#ringT').textContent=t('linked');$('#bStat').textContent=t('br_done');
  const who=$('#bWho').value,cp=[...S.caps].filter(c=>c.sol<=solNow()&&(!who||c.who===who)).sort((a,b)=>b.sol-a.sol)[0];B.cap=cp;
  $('#bMsg').textContent='«'+(cp?tx(cp.text):t('br_default'))+'»';$('#bVoice').style.display=cp?'':'none';$('#bVoice').textContent=t(cp&&MEDIA['voice:'+cp.id]?'listen_voice':'read_aloud');
  const b=+$('#bBefore').value;$('#bAfter').value=Math.min(5,b+1);$('#bAv').textContent=$('#bAfter').value;$('#bEnd').style.display='';
  S.energy+=25;S.gBreath++;logAct(t('log_breath'));renderAll()}
function breathAuto(){breathReset();B.auto=true;const t0=performance.now(),dur=S.short?2200:5000;$('#ringT').textContent=t('inhale');
  (function st(ts){if(!B.auto)return;B.clar=clamp((ts-t0)/dur,0,1);$('#ringC').setAttribute('r',(52+26*Math.sin((ts-t0)/1000*1.6)).toFixed(1));sigDraw();if(B.clar>=1){B.auto=false;breathFinish()}else requestAnimationFrame(st)})(t0)}
function hold(v){if(!B.on)return;B.held=v;$('#holdBtn').classList.toggle('held',v)}
function gardenScore(){const sl=S.hist.slice(-7).filter(h=>dev('sleep',h.v.sleep).lv===0).length;return{sl,total:sl+S.gBreath+S.gWater}}
function drawGarden(){
  const c=$('#gardenCv'),w=c.clientWidth,h=c.clientHeight;if(!w)return;const dpr=Math.min(devicePixelRatio||1,2);c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
  const g=gardenScore(),k=clamp(g.total/14,0,1),dull=lvCard('sleep')>0,leaf=dull?'#6f9a84':'#3ad6a6',bx=w/2,by=h-46;
  x.fillStyle='#0a1019';x.fillRect(0,0,w,h);x.strokeStyle='#16233a';for(let i=40;i<w;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}
  x.fillStyle='rgba(105,168,255,.08)';x.beginPath();x.ellipse(bx,by-90,150,120,0,0,7);x.fill();
  x.fillStyle='#34486b';x.beginPath();x.moveTo(bx-46,by);x.lineTo(bx+46,by);x.lineTo(bx+34,by+38);x.lineTo(bx-34,by+38);x.fill();x.fillStyle='#5a3d2e';x.fillRect(bx-44,by-6,88,8);
  const H=24+k*(h-120),sway=dull?10:0;x.strokeStyle=leaf;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(bx,by-4);x.quadraticCurveTo(bx+14+sway,by-H*.5,bx+sway*.6,by-H);x.stroke();
  const n=Math.floor(g.total/1.4);for(let i=0;i<n;i++){const q=(i+1)/(n+1),px=bx+(14+sway)*2*q*(1-q)+sway*.6*q*q,py=by-H*q,sd=i%2?1:-1,L=16+10*(1-q);
    x.fillStyle=leaf;x.beginPath();x.ellipse(px+sd*L*.8,py-(dull?-3:5),L,6,sd*(dull?.5:-.45),0,7);x.fill()}
  const tx0=bx+sway*.6,ty=by-H;
  if(g.total>=13){x.fillStyle='#fc3d21';x.beginPath();x.arc(tx0,ty-4,13,0,7);x.fill();x.fillStyle=leaf;x.fillRect(tx0-6,ty-18,12,3)}
  else if(g.total>=10){x.fillStyle='#e9eff7';for(let i=0;i<6;i++){x.beginPath();x.ellipse(tx0+Math.cos(i*1.047)*10,ty-4+Math.sin(i*1.047)*10,7,4,i*1.047,0,7);x.fill()}x.fillStyle='#ffb224';x.beginPath();x.arc(tx0,ty-4,5,0,7);x.fill()}
  const stage=t(g.total>=13?'gs_fruit':g.total>=10?'gs_bloom':g.total>=5?'gs_leaf':'gs_sprout');
  $('#gInfo').innerHTML=`<b>${stage}.</b> ${t('g_info',g.total,g.sl,S.gBreath,S.gWater)}${dull?' '+t('g_dull'):''}`;$('#gWater').disabled=S.energy<5}
const Mem={cards:[],open:[],moves:0,t0:0,lock:false,got:0};
function memNew(){const sy=['☾','✦','★','☀','♥','▲','●','◆'].slice(0,S.short?6:8),a=[...sy,...sy];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  Mem.cards=a.map(s=>({s,st:0}));Mem.open=[];Mem.moves=0;Mem.t0=0;Mem.got=0;Mem.lock=false;rMem()}
function rMem(){$('#memGrid').innerHTML=Mem.cards.map((c,i)=>`<button class="mc ${c.st===1?'open':c.st===2?'got':''}" data-mc="${i}" aria-label="${c.st?c.s:'#'+(i+1)}">${c.st?c.s:''}</button>`).join('');
  $('#memStat').textContent=Mem.moves?t('moves')+': '+Mem.moves:'';
  const m=S.mem.slice(-5);$('#memHist').innerHTML=m.length?t('mem_last')+': '+m.map(x=>`${t('sol').toLowerCase()} ${x.sol}: ${x.moves} / ${x.sec} s`).join('; ')+'.':''}
function memClick(i){const c=Mem.cards[i];if(Mem.lock||!c||c.st)return;if(!Mem.t0)Mem.t0=Date.now();c.st=1;Mem.open.push(i);
  if(Mem.open.length===2){Mem.moves++;const[a,b]=Mem.open;if(Mem.cards[a].s===Mem.cards[b].s){Mem.cards[a].st=Mem.cards[b].st=2;Mem.open=[];Mem.got+=2;
      if(Mem.got===Mem.cards.length){const sec=Math.round((Date.now()-Mem.t0)/1000);S.mem.push({sol:solNow(),moves:Mem.moves,sec});S.energy+=10;logAct(t('log_mem',Mem.moves));toast(t('mem_win'));renderAll()}}
    else{Mem.lock=true;setTimeout(()=>{Mem.cards[a].st=Mem.cards[b].st=0;Mem.open=[];Mem.lock=false;rMem()},S.short?450:800)}}
  rMem()}

/* ---------- лестница помощи и сводка ---------- */
function escal(){
  let step=0;const why=[];
  CARDS.forEach(c=>{const l=lvCard(c),s1=streak(c,1),s2=streak(c,2);if(!l)return;let st=1,x=`${mName(c)}: ${t('st'+l).toLowerCase()}`;
    if(l===1&&s1>=3){st=2;x+=', '+t('in_row',sols(s1))}
    if(l===2){st=2;if(s2>=2){st=3;x+=', '+t('in_row',sols(s2))}}
    step=Math.max(step,st);why.push(x)});
  const hm=dStreak('home',v=>v>=4),wl=dStreak('well',v=>v<=2);
  if(hm>=2){step=Math.max(step,hm>=5?2:1);why.push(tx(DQ[1].q)+': '+t('in_row',sols(hm)))}
  if(wl>=3){step=Math.max(step,2);why.push(tx(DQ[0].q)+': '+t('in_row',sols(wl)))}
  const fl=FLAGS.filter((_,i)=>S.flags[i]).map(tx);if(fl.length){step=3;why.unshift(t('h_flags')+': '+fl.join('; ').toLowerCase())}
  return{step,why,fl}}
function rHelp(){
  const e=escal(),dc=D().dc;
  const bd=$('#docBdg');if(bd)bd.style.background=['transparent','#ffb224','#ffb224','#ff5f4c'][e.step];
  $('#escWhy').textContent=e.step?t('esc_why')+': '+e.why.join('. ')+'.':t('esc_none');
  const st=[[t('esc1'),t('esc1d')],[t('esc2'),t('esc2d')],[t('esc3_'+dc),t('esc3d_'+dc,tx(D().delay))]];
  $('#ladder').innerHTML=st.map((s,i)=>`<div class="step s${i+1} ${e.step>=i+1?'on':''}"><b>${i+1}. ${s[0]}</b>${e.step===i+1?` <span class="lbl">${t('cur_step')}</span>`:''}<div class="sm">${s[1]}</div></div>`).join('');
  $('#flags').innerHTML=FLAGS.map((x,i)=>`<label style="display:block;padding:.3rem 0"><input type="checkbox" data-fl="${i}" ${S.flags[i]?'checked':''}> ${tx(x)}</label>`).join('')+(e.fl.length?`<div class="note doc"><b>${t('act_now')}</b> ${t('act_now_d')}</div>`:'');
  const lg=S.log.slice(-8).reverse();$('#logList').innerHTML=lg.length?lg.map(a=>`<div>${t('sol')} ${a.sol}: ${esc(a.t)}</div>`).join(''):`<span class="mu">${t('log_none')}</span>`;
  $('#sumTxt').textContent=summary(e)}
function summary(e){
  e=e||escal();const sol=solNow(),L=[];
  L.push(t('sum_head'),`${t('sol')} ${sol}. ${t('dest')}: ${tx(D().n)}. ${t('comm')}: ${tx(D().delay)}.`,t('sum_level')+': '+t('sum_l'+e.step)+'.','');
  L.push(t('sum_dev'));
  const dv=CARDS.filter(c=>lvCard(c)>0);
  if(dv.length)dv.forEach(c=>L.push(`- ${mName(c)}: ${valTxt(c)} ${mUnit(c)}, ${t('base_short')} ${normTxt(c)} (${t('st'+lvCard(c)).toLowerCase()}); ${t('in_row',sols(streak(c,1)))}; ${t('over_n',sols(7))}: ${trendTxt(c,7)}`));
  else L.push('- '+t('sum_nodev'));
  L.push('',t('sum_rest')+': '+(CARDS.filter(c=>!lvCard(c)).map(c=>mName(c).toLowerCase()+' '+valTxt(c)).join(', ')||'—')+'.','');
  const av=(k,a,b)=>{const x=S.hist.slice(a,b).filter(h=>h.d).map(h=>h.d[k]);return x.length?x.reduce((s,v)=>s+v,0)/x.length:0};
  L.push(t('sum_diary'));DQ.forEach(q=>L.push(`- ${tx(q.q)}: ${f(av(q.k,-3),1)} (${f(av(q.k,-10,-3),1)})`));
  L.push('',t('h_flags')+': '+(e.fl.length?e.fl.join('; '):t('sum_noflags'))+'.','');
  const ev=S.hist.slice(-14).filter(h=>h.ev).map(h=>t('sol').toLowerCase()+' '+h.sol+' '+evName(h.ev).toLowerCase());L.push(t('sum_events')+': '+(ev.join(', ')||'—')+'.','');
  L.push(t('h_log'));const lg=S.log.filter(a=>a.sol>=sol-3);lg.length?lg.forEach(a=>L.push(`- ${t('sol').toLowerCase()} ${a.sol}: ${a.t}`)):L.push('- '+t('log_none'));
  L.push('',t('sum_foot'));return L.join('\n')}

/* ---------- сценарии и показ ---------- */
function resetRecent(){const fr=seedHist(S.dest),n=S.hist.length;for(let i=0;i<3&&i<n;i++){const h=S.hist[n-1-i],s=fr[fr.length-1-i];h.v={...s.v};h.d={...s.d};h.ev=null}S.flags={}}
const prev=i=>S.hist[S.hist.length-1-i];
const MOD={
  calm(){},
  flare(){const x=today();x.v.rad=+(base('rad')*3.6).toFixed(2);x.v.pulse+=9;x.ev='flare'},
  nosleep(){const x=today();x.v.sleep=4.8;prev(1).v.sleep=6.0;x.v.pulse=Math.max(x.v.pulse,76);x.d.tired=4;x.d.sleepq=2;x.ev=x.ev?x.ev+',nosleep':'nosleep'},
  homesick(){prev(2).d.home=4;prev(1).d.home=4;const x=today();x.d.home=5;x.d.well=2;x.d.social=2;if(!x.ev)x.ev='home'},
  out(){prev(1).v.sys=146;prev(1).v.dia=93;const x=today();x.v.sys=150;x.v.dia=96;x.ev='bp'},
  recover(){prev(2).v.rad=+(base('rad')*3.4).toFixed(2);prev(2).ev='flare';prev(2).v.sleep=5.0;prev(1).v.rad=+(base('rad')*1.8).toFixed(2);prev(1).v.sleep=6.4;prev(1).v.sys=138;prev(1).d.home=4;prev(2).d.home=4;
    const x=today();x.v.sleep=7.8;x.d={well:5,home:2,tired:2,sleepq:5,social:4};x.ev='rec'}
};
const SCN=['calm','flare','nosleep','homesick','out','recover'];
function runScn(k){resetRecent();MOD[k]();renderAll()}
const Demo={i:-1,h:0,on:false};
const STEPS=[
  ()=>{resetRecent();chMet='rad';chRange=14;setTab('over')},
  ()=>{MOD.flare();setTab('over')},
  ()=>{selTp='hip';layer='skel';setTab('body')},
  ()=>{today().v.rad=+(base('rad')*1.8).toFixed(2);MOD.nosleep();MOD.homesick();setTab('over')},
  ()=>{setTab('mind');setGame('breath');$('#g-breath').scrollIntoView({block:'center'});breathAuto()},
  ()=>{MOD.out();setTab('help')},
  ()=>{resetRecent();MOD.recover();chMet='rad';chRange=7;setTab('trend')}
];
function demoStep(){if(!Demo.on)return;Demo.i++;if(Demo.i>=STEPS.length){demoStop(t('demo_end'));return}
  STEPS[Demo.i]();$('#demoCap').textContent=(Demo.i+1)+'/'+STEPS.length+'. '+t('demo_s'+(Demo.i+1));$('#demoCap').classList.add('on');clearTimeout(Demo.h);Demo.h=setTimeout(demoStep,S.short?6000:20000)}
function demoStart(){Demo.on=true;Demo.i=-1;$('#demoNext').disabled=$('#demoStop').disabled=false;if(!sndOn)soundSet(true);demoStep()}
function demoStop(msg){Demo.on=false;clearTimeout(Demo.h);B.auto=false;$('#demoNext').disabled=$('#demoStop').disabled=true;const c=$('#demoCap');if(msg){c.textContent=msg;setTimeout(()=>c.classList.remove('on'),3000)}else c.classList.remove('on')}

/* ---------- общий рендер ---------- */
function renderAll(){
  $('#solN').textContent=solNow();$('#destN').textContent=tx(D().n);$('#shortCb').checked=!!S.short;$('#enN').textContent=S.energy;
  wxTargets();wxText();rBoard();rHelp();
  if(curTab==='over'){rRemind();rForecast()}
  if(curTab==='body'){rBody();rForm();rRemind()}
  if(curTab==='trend'){rChart();rTiles()}
  if(curTab==='mind'){rDiary();rEarth();if(curGame==='garden')drawGarden();if(curGame==='memory')rMem();if(!B.on&&!B.done&&!B.auto)breathReset()}
  if(curTab==='earth')rEarth();
  if(curTab==='mission')rMission();
  if(curTab==='colony')rColony();
  padUpdate();save()}

/* ---------- события ---------- */
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setTab(b.dataset.t)});
$('#sndBtn').onclick=()=>soundSet(!sndOn);
$('#langSel').onchange=e=>{LANG=e.target.value;applyI18n();renderAll();if(!U_FULL.includes(LANG))toast(t('lang_note'))};
$('#shortCb').onchange=e=>{S.short=e.target.checked;save()};
$('#demoGo').onclick=demoStart;$('#demoNext').onclick=demoStep;$('#demoStop').onclick=()=>demoStop();
$('#nextSol').onclick=()=>{const x=today(),r=Math.random,v={};KEYS.forEach(k=>{const b=base(k),y=(x.v[k]+b)/2+(r()*2-1)*thr(k)[0]*.25;v[k]=+y.toFixed(M[k].d)});v.spo2=Math.min(100,v.spo2);
  S.hist.push({sol:x.sol+1,v,d:{...x.d},ev:null});if(S.hist.length>60)S.hist.shift();renderAll();toast(t('new_sol',solNow()))};
$('#resetAll').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}mediaClear();S=fresh('mars');selTile=null;demoStop();breathReset();Mem.cards=[];renderAll();toast(t('reset_ok'))};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-c],[data-go],[data-rd],[data-m],[data-r],[data-sol],[data-tp],[data-layer],[data-pr],[data-chart],[data-dr],[data-game],[data-scn],[data-open],[data-cdel],[data-pdel],[data-ddel],[data-rplay],[data-g],[data-mc],[data-dest],[data-sp],[data-upg],[data-opt]');if(!el)return;const d=el.dataset;
  if(d.c){if(d.c==='mood')setTab('mind');else{selTp=topicOf(d.c);layer=layerOf(selTp);setTab('body')}}
  else if(d.go)setTab(d.go);
  else if(d.rd){routState()[d.rd]=1;logAct(t('log_rout')+': '+tx(ROUT.find(r=>r.id===d.rd).t).toLowerCase());renderAll()}
  else if(d.m){chMet=d.m;rChart()}
  else if(d.r){chRange=+d.r;rChart()}
  else if(d.sol){selTile=+d.sol;rTiles()}
  else if(d.tp){selTp=d.tp;if(el.classList.contains('chip'))layer=layerOf(selTp);rBody()}
  else if(d.layer){layer=d.layer;rAnat()}
  else if(d.pr){const[c,i]=d.pr.split(':');S.done[solNow()+':'+d.pr]=1;S.energy+=5;logAct(mName(c)+': '+tx(M[c].p[i]).toLowerCase());renderAll();toast(t('marked'))}
  else if(d.chart){chMet=d.chart;setTab('trend')}
  else if(d.dr){dRange=+d.dr;rDiary()}
  else if(d.game){setTab('mind');setGame(d.game);$('#g-'+d.game).scrollIntoView({block:'center'})}
  else if(d.scn)runScn(d.scn);
  else if(d.open)openCap(d.open);
  else if(d.cdel){S.caps=S.caps.filter(c=>c.id!==d.cdel);$('#playCard').style.display='none';stopVoice();renderAll()}
  else if(d.pdel){S.people=S.people.filter(p=>p.id!==d.pdel);renderAll()}
  else if(d.ddel){S.dates.splice(+d.ddel,1);renderAll()}
  else if(d.rplay)playVoice(MEDIA['reply:'+d.rplay]);
  else if(d.g)setGame(d.g);
  else if(d.mc)memClick(+d.mc);
  else if(d.dest)setDest(d.dest);
  else if(d.sp)colSpeed(+d.sp);
  else if(d.upg)colBuy(d.upg);
  else if(d.opt)colChoose(+d.opt);
});
document.addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('#anat .pt, table.tm tr');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();g.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
$('#mForm').onsubmit=e=>{e.preventDefault();const v={};for(const k of KEYS){const x=parseFloat($('#in_'+k).value.replace(',','.'));if(!isFinite(x)||x<M[k].min||x>M[k].max){toast(mName(k)+': '+M[k].min+'–'+M[k].max);$('#in_'+k).focus();return}v[k]=x}
  today().v=v;const st=routState();['am','glu','ex','rad'].forEach(i=>st[i]=1);logAct(t('log_meas'));document.activeElement.blur();renderAll();toast(t('meas_ok'))};
$('#dQs').addEventListener('input',e=>{$('#dv_'+e.target.id.slice(3)).textContent=e.target.value});
$('#dForm').onsubmit=e=>{e.preventDefault();const d={};DQ.forEach(q=>d[q.k]=+$('#dq_'+q.k).value);today().d=d;routState().diary=1;logAct(t('log_diary'));document.activeElement.blur();renderAll();toast(t('diary_ok'))};
document.addEventListener('change',e=>{if(e.target.dataset.fl!=null){S.flags[e.target.dataset.fl]=e.target.checked;if(e.target.checked)logAct(t('h_flags')+': '+tx(FLAGS[e.target.dataset.fl]).toLowerCase());renderAll()}});
$('#sumQueue').onclick=()=>{S.queue.push({sol:solNow(),text:$('#sumTxt').textContent});logAct(t('log_sum'));renderAll();$('#sumSt').textContent=t('sum_queued',tx(D().delay))};
$('#sumCopy').onclick=async()=>{const s=$('#sumTxt').textContent;try{await navigator.clipboard.writeText(s);toast(t('copied'))}catch(e){const r=document.createRange();r.selectNodeContents($('#sumTxt'));const g=getSelection();g.removeAllRanges();g.addRange(r);toast(t('copy_manual'))}};
$('#pForm').onsubmit=e=>{e.preventDefault();const n=$('#pName').value.trim(),fl=$('#pPhoto').files[0];if(!n){toast(t('need_name'));return}if(fl&&!$('#pOk').checked){toast(t('need_consent'));return}
  const id='p'+Date.now(),sk=['#e8bb9c','#d9a47f','#c98f6b','#f0cbb0'],hr=['#4a3530','#2f2327','#8a6a4a','#b9b0aa'];S.people.push({id,name:n,skin:sk[S.people.length%4],hair:hr[S.people.length%4]});if(fl)mediaPut('photo:'+id,fl);e.target.reset();renderAll();toast(t('added'))};
$('#cRec').onclick=()=>recToggle($('#cRec'),$('#cRecSt'),b=>{capBlob=b});
$('#capForm').onsubmit=e=>{e.preventDefault();const s=$('#cText').value.trim(),who=$('#cWho').value,sol=+$('#cSol').value,fl=$('#cVoice').files[0]||capBlob;
  if(!who){toast(t('need_person'));return}if(!s&&!fl){toast(t('need_text'));return}if(!(sol>=1)){toast(t('need_sol'));return}if(!$('#cOk').checked){toast(t('need_consent'));return}
  const id='c'+Date.now();S.caps.push({id,who,sol,text:s||t('voice_msg')});if(fl)mediaPut('voice:'+id,fl);capBlob=null;$('#cRecSt').textContent='';e.target.reset();$('#cSol').value=solNow();renderAll();toast(sol<=solNow()?t('cap_open'):t('cap_later',sol))};
$('#playVoice').onclick=()=>{if(!curCap)return;const u=MEDIA['voice:'+curCap.id];u?playVoice(u):speakText(tx(curCap.text))};
$('#playStop').onclick=stopVoice;
$('#dtForm').onsubmit=e=>{e.preventDefault();const s=$('#dtT').value.trim(),n=+$('#dtS').value;if(!s||!(n>=1)){toast(t('need_date'));return}S.dates.push({t:s,sol:n});e.target.reset();renderAll()};
$('#rRec').onclick=()=>recToggle($('#rRec'),$('#rRecSt'),b=>{replyBlob=b});
$('#rSave').onclick=()=>{const s=$('#rText').value.trim();if(!s&&!replyBlob){toast(t('need_text'));return}const id='r'+Date.now();S.replies.push({id,sol:solNow(),text:s});if(replyBlob)mediaPut('reply:'+id,replyBlob);replyBlob=null;$('#rText').value='';$('#rRecSt').textContent='';logAct(t('log_reply'));S.energy+=5;renderAll();toast(t('reply_ok'))};
$('#bWho').onchange=()=>{if(!B.on)breathReset()};
$('#bBefore').oninput=e=>$('#bBv').textContent=e.target.value;$('#bAfter').oninput=e=>$('#bAv').textContent=e.target.value;
$('#bStart').onclick=breathStart;
const hb=$('#holdBtn');hb.addEventListener('pointerdown',e=>{e.preventDefault();hold(true)});['pointerup','pointercancel','pointerleave'].forEach(ev=>hb.addEventListener(ev,()=>hold(false)));
hb.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('keydown',e=>{if(e.code==='Space'&&B.on&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();hold(true)}});
document.addEventListener('keyup',e=>{if(e.code==='Space'&&B.on)hold(false)});
$('#bVoice').onclick=()=>{const c=B.cap;if(!c)return;const u=MEDIA['voice:'+c.id];u?playVoice(u):speakText(tx(c.text))};
$('#bSave').onclick=()=>{const b=+$('#bBefore').value,a=+$('#bAfter').value,d=today().d;d.well=a;if(a>b){d.home=Math.max(1,d.home-1);d.tired=Math.max(1,d.tired-1)}
  logAct(t('log_mood',b,a));stopVoice();B.done=false;setTab('over');toast(t(a>b?'sky_clears':'thanks_note'))};
$('#gWater').onclick=()=>{if(S.energy<5)return;S.energy-=5;S.gWater++;renderAll();toast(t('watered'))};
$('#memNew').onclick=memNew;
let rsz;window.addEventListener('resize',()=>{clearTimeout(rsz);rsz=setTimeout(renderAll,150)});
