/* ===== миссия: выбор мира, песочница, симулятор плана ===== */
function setDest(id){if(!DEST[id]||id===S.dest)return;S.dest=id;S.hist=seedHist(id);S.rout={};selTile=null;renderAll();toast(t('dest_set',tx(D().n)))}
const SB={pulse:[40,140],sys:[80,190],dia:[50,120],spo2:[82,100],temp:[35,40],glu:[50,200],sleep:[2,10],water:[0.5,4],ex:[0,180]};
const PL=[['sleep',4,9,.5,'pl_sleep'],['ex',0,180,5,'pl_ex'],['eva',0,30,1,'pl_eva'],['shield',0,80,5,'pl_shield'],['contact',0,7,1,'pl_contact'],['sols',30,1000,10,'pl_sols']];
function rMission(){
  $('#dests').innerHTML=Object.keys(DEST).map(id=>{const d=DEST[id];
    return `<button class="dest ${id===S.dest?'sel':''}" data-dest="${id}"><span class="orb" style="background:${d.orb}"></span><b>${tx(d.n)}</b><span class="tag">${tx(TIER[d.tier])}</span>
      <dl><dt>${t('d_g')}</dt><dd>${f(d.g,2)} g</dd><dt>${t('d_rad')}</dt><dd>${f(d.rad,1)} ${tx(M.rad.u)}</dd><dt>${t('d_delay')}</dt><dd style="font-family:var(--sans)">${tx(d.delay)}</dd><dt>${t('d_day')}</dt><dd>${d.day}</dd></dl></button>`}).join('');
  const d=D();$('#destInfo').innerHTML=`<b>${tx(d.n)}.</b> ${tx(d.note)}<br><span class="sm mu">${t('dest_fx',exTarget(d.g),f(d.rad,1),t('esc3_'+d.dc))}</span>`;
  // песочница: живые ползунки
  const box=$('#sbSliders'),key=solNow()+S.dest+LANG;
  if(box.dataset.key!==key||!box.contains(document.activeElement)){box.dataset.key=key;
    const rows=KEYS.map(k=>{const r=k==='rad'?[0,+(d.rad*6).toFixed(1)]:SB[k];return `<div class="q" style="margin:.25rem 0 .5rem"><label for="sb_${k}" class="sm">${mName(k)} <b class="mono" id="sbv_${k}">${f(today().v[k],M[k].d)}</b> ${mUnit(k)} <span id="sbs_${k}"></span></label><input type="range" id="sb_${k}" data-sb="${k}" min="${r[0]}" max="${r[1]}" step="${M[k].step}" value="${today().v[k]}"></div>`});
    rows.push(...['well','home'].map((k,i)=>`<div class="q" style="margin:.25rem 0 .5rem"><label for="sb_${k}" class="sm">${tx(DQ[i].q)} <b class="mono" id="sbv_${k}">${today().d[k]}</b>/5</label><input type="range" id="sb_${k}" data-sbd="${k}" min="1" max="5" step="1" value="${today().d[k]}"></div>`));
    box.innerHTML=rows.join('')}
  KEYS.forEach(k=>{const c=k==='sys'||k==='dia'?'bp':k,e=$('#sbs_'+k);if(e)e.innerHTML=`<span class="st st${k==='sys'||k==='dia'?dev(k,today().v[k]).lv:lvCard(c)}"><i></i></span>`});
  const pb=$('#plSliders');
  if(pb.dataset.key!==LANG||!pb.contains(document.activeElement)){pb.dataset.key=LANG;
    pb.innerHTML=PL.map(([k,a,b,s,i])=>`<div class="q" style="margin:.25rem 0 .5rem"><label for="pl_${k}" class="sm">${t(i)} <b class="mono" id="plv_${k}">${f(S.plan[k],k==='sleep'?1:0)}</b></label><input type="range" id="pl_${k}" data-pl="${k}" min="${a}" max="${b}" step="${s}" value="${S.plan[k]}"></div>`).join('')}
  rPlan()}
function simPlan(){
  const p=S.plan,d=D(),un=clamp(1-d.g,0,1),need=30+90*un,exF=clamp(p.ex/need,0,1);
  const boneR=1.25*un*(1-.75*exF)/30,musR=3*un*(1-.85*exF)/30,ev=p.eva/168;
  const doseDay=d.rad*((1-ev)*(1-p.shield/100*.5)+ev*1.25),iso=[.5,1,1.6][d.dc];
  let mood=4,bone=100,mus=100,dose=0,cross=null;const out={x:[],bone:[],mus:[],dose:[],mood:[]},step=Math.max(1,Math.round(p.sols/60));
  for(let s=1;s<=p.sols;s++){
    bone=Math.max(55,bone-boneR);mus=Math.max(60,mus-musR*(mus-60)/40);dose+=doseDay;if(cross==null&&dose>=600)cross=s;
    mood=clamp(mood-.0035*iso+(p.sleep-7.5)*.004+p.contact*.0009*(d.dc===2?.5:1)+(p.ex>=need*.6?.0008:-.0006),1,5);
    if(s%step===0||s===p.sols){out.x.push(s);out.bone.push(bone);out.mus.push(mus);out.dose.push(dose/6);out.mood.push(mood*20)}}
  return{out,bone,mus,dose,mood,cross,need,doseDay}}
function rPlan(){
  const r=simPlan(),o=r.out,p=S.plan;
  $('#plKpi').innerHTML=[[t('k_bone'),f(r.bone,1)+' %',r.bone<92?(r.bone<85?2:1):0],[t('k_dose'),f(r.dose,0)+' '+t('msv'),r.dose>=600?2:r.dose>=400?1:0],[t('k_mood'),f(r.mood,1)+'/5',r.mood<2.7?2:r.mood<3.3?1:0]]
    .map(k=>`<div class="kpi"><div class="lbl">${k[0]}</div><b>${k[1]}</b>${lvTag(k[2])}</div>`).join('');
  drawChart($('#plChart'),{xs:o.x,min:0,max:Math.max(120,Math.min(260,Math.max(...o.dose)+10)),dec:0,lines:[100],
    series:[{vals:o.bone,color:'#e9eff7',dots:false},{vals:o.mus,color:'#3ad6a6',dots:false},{vals:o.dose,color:'#ff5f4c',dots:false},{vals:o.mood,color:'#69a8ff',dots:false}]});
  $('#plLegend').innerHTML=[['#e9eff7','lg_bone'],['#3ad6a6','lg_mus'],['#ff5f4c','lg_dose'],['#69a8ff','lg_mood']].map(x=>`<span class="chip" style="min-height:26px"><i style="width:14px;height:3px;background:${x[0]};display:inline-block"></i>${t(x[1])}</span>`).join('');
  const v=[];
  if(r.cross)v.push(['doc',t('v_dose',r.cross)]);else v.push(['',t('v_dose_ok',f(r.dose,0))]);
  if(r.bone<92)v.push(['warn',t('v_bone',f(100-r.bone,1),Math.round(r.need))]);
  if(r.mood<3.3)v.push(['warn',t(D().dc===2?'v_mood_far':'v_mood')]);
  if(p.sleep<6.5)v.push(['warn',t('v_sleep')]);
  $('#plVerdict').innerHTML=v.map(x=>`<div class="note ${x[0]}">${x[1]}</div>`).join('')+`<p class="sm mu">${t('plan_model')}</p>`}
document.addEventListener('input',e=>{const d=e.target.dataset;
  if(d.sb){const v=parseFloat(e.target.value);today().v[d.sb]=v;$('#sbv_'+d.sb).textContent=f(v,M[d.sb].d);wxTargets();wxText();rBoard();rHelp();rMission();padUpdate();save()}
  else if(d.sbd){today().d[d.sbd]=+e.target.value;$('#sbv_'+d.sbd).textContent=e.target.value;wxTargets();wxText();rBoard();rHelp();padUpdate();save()}
  else if(d.pl){S.plan[d.pl]=parseFloat(e.target.value);$('#plv_'+d.pl).textContent=f(S.plan[d.pl],d.pl==='sleep'?1:0);rPlan();save()}});
