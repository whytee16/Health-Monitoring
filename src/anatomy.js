/* ===== анатомическая фигура: три слоя, все части кликабельны ===== */
const SIL='M160 12 C183 12 191 34 191 54 C191 72 183 86 174 92 L174 102 C190 108 212 112 222 124 C232 136 234 180 238 222 C242 260 248 292 250 314 C254 330 256 348 250 360 C244 364 238 356 236 344 C232 330 230 318 228 312 C222 290 216 256 214 226 C212 200 208 170 206 152 C204 190 198 228 198 252 C198 276 208 292 210 314 C212 360 206 410 202 450 C204 500 198 560 194 592 C196 606 204 620 204 630 C196 636 172 636 166 630 C166 616 170 602 170 590 C170 550 164 500 170 450 C168 410 164 360 160 334 Z';
function anatSVG(){
  const mir=s=>s+`<g transform="translate(320 0) scale(-1 1)">${s}</g>`;
  const pt=(tp,inner)=>`<g class="pt" data-tp="${tp}" tabindex="0" role="button"><title></title>${inner}</g>`;
  const s=(d,w)=>`<path class="s" d="${d}" stroke-width="${w}"/>`, fl=d=>`<path class="f" d="${d}"/>`, ln=d=>`<path class="ln" d="${d}"/>`;
  let grid='';for(let y=40;y<640;y+=40)grid+=`<line x1="20" y1="${y}" x2="300" y2="${y}"/>`;grid+='<line x1="160" y1="4" x2="160" y2="652"/>';
  /* скелет */
  let ribs='';for(let i=0;i<10;i++){const y=118+i*11,e=26+Math.sin((i+1)/10*Math.PI)*16;ribs+=s(`M166 ${y} C ${166+e*.6} ${y-7}, ${166+e} ${y-2}, ${164+e} ${y+9}`+(i<7?` C ${160+e} ${y+14}, 178 ${y+13}, 165 ${y+9}`:''),2.2)}
  let vert='';for(let i=0;i<5;i++)vert+=`<rect class="fb" x="155" y="${(88+i*4.4).toFixed(1)}" width="10" height="3.4" rx="1.2"/>`;
  for(let i=0;i<17;i++){const w=10+i*.45;vert+=`<rect class="fb" x="${(160-w/2).toFixed(1)}" y="${110+i*11}" width="${w.toFixed(1)}" height="8.5" rx="2"/>`}
  vert+='<path class="fb" d="M150 298 L170 298 L160 326 Z"/>';
  let fing='';for(let i=0;i<5;i++)fing+=s(`M${233+i*3.6} 325 L${230+i*5} ${352-Math.abs(i-2)*4}`,2);
  const skel=
    pt('bone','<path class="fb" d="M160 18 C139 18 133 38 135 52 C136 60 140 64 142 68 L145 82 C150 89 170 89 175 82 L178 68 C180 64 184 60 185 52 C187 38 181 18 160 18Z"/><ellipse class="dk" cx="150.5" cy="55" rx="6" ry="5"/><ellipse class="dk" cx="169.5" cy="55" rx="6" ry="5"/><path class="dk" d="M160 61 L156.5 70 L163.5 70Z"/><path class="ln" style="stroke:#0f1a2b;opacity:1" d="M149 78 H171 M152 75 V81 M156 75 V81 M160 75 V81 M164 75 V81 M168 75 V81"/>')+
    pt('bone',mir(ribs+s('M163 112 C180 104 200 108 216 118',4))+'<rect class="fb" x="155" y="114" width="10" height="60" rx="4"/>')+
    pt('spine',vert)+
    pt('bone',mir('<circle class="fb" cx="217" cy="121" r="6"/>'+s('M218 124 L228 216',7.5)+s('M229 224 L242 312',4)+s('M223 226 L234 314',3.4)+'<ellipse class="fb" cx="240" cy="320" rx="7" ry="4"/>'+fing))+
    pt('hip',mir('<path class="fb" d="M160 300 C146 292 126 290 120 306 C116 320 126 336 142 338 C150 340 156 336 160 346 Z"/><ellipse class="dk" cx="146" cy="329" rx="5" ry="4"/><circle class="fb" cx="177" cy="322" r="7.5"/>'+s('M180 330 L186 444',9)))+
    pt('bone',mir('<circle class="fb" cx="186" cy="452" r="5.5"/>'+s('M185 462 L183 588',7.5)+s('M194 464 L191 588',3)+s('M183 594 L186 606 L198 626',6)+s('M190 624 L192 632 M184 620 L184 630',2.4)));
  /* мышцы */
  let abs='';for(let i=0;i<4;i++)abs+=`<rect class="f" x="163" y="${166+i*24}" width="17" height="20" rx="5"/>`;
  const mus=
    pt('corem',mir(fl('M170 94 C176 104 196 110 214 116 C200 117 184 117 172 114 Z')+abs+fl('M184 166 C198 172 202 222 198 262 C194 280 188 290 184 296 Z')+ln('M187 180 L197 200 M187 204 L198 226 M187 230 L197 252 M186 256 L193 276')))+
    pt('armm',mir(fl('M206 114 C224 112 236 130 234 156 C226 152 214 142 206 128 Z')+ln('M212 118 L228 146 M218 116 L232 142')+
      fl('M163 118 L204 120 C210 138 200 158 182 160 C172 160 165 154 163 146 Z')+ln('M166 124 L202 128 M166 134 L202 140 M168 146 L194 152')+
      fl('M216 152 C230 158 236 196 234 216 C226 220 218 198 214 172 Z')+ln('M221 160 L229 210')+
      fl('M219 228 C234 232 244 284 247 308 C240 314 233 302 226 270 C222 250 219 238 219 228 Z')+ln('M224 236 L240 300 M229 236 L244 296')))+
    pt('legm',mir(fl('M163 336 C170 342 175 382 173 420 C167 402 163 372 163 336 Z')+
      fl('M172 330 C198 322 212 356 208 404 C206 428 198 444 188 448 C180 446 176 420 176 380 C176 360 174 344 172 330 Z')+ln('M184 334 C190 370 192 410 188 444 M196 336 C204 372 204 410 196 440')+
      fl('M175 462 C194 454 204 498 198 546 C194 570 188 582 182 586 C174 562 171 502 175 462 Z')+ln('M185 464 C190 500 190 540 184 580')));
  /* органы */
  const org=
    pt('lungs','<path class="so" stroke-width="3.2" d="M160 96 L160 124 M160 124 L151 134 M160 124 L169 134"/>'+mir(fl('M166 122 C180 118 194 138 196 176 C196 198 188 206 172 200 C166 192 165 150 166 122 Z')+ln('M170 150 L192 160 M170 176 L194 184')))+
    pt('heart','<path class="so" stroke-width="3" d="M168 150 C168 136 181 136 181 150"/>'+fl('M160 152 C152 142 142 152 147 166 C152 180 164 190 171 196 C181 186 192 170 187 156 C182 144 167 144 160 152 Z')+ln('M158 158 C162 170 168 182 171 192'))+
    pt('metab',fl('M126 214 C138 202 168 204 182 210 C180 224 160 236 140 236 C130 234 124 224 126 214 Z')+ln('M160 207 L156 232')+
      fl('M172 216 C190 210 198 224 192 242 C184 254 170 250 166 240 C174 236 176 226 172 216 Z')+
      '<path class="so" stroke-width="8" d="M138 314 L138 276 Q138 268 146 268 L174 268 Q182 268 182 276 L182 314"/><path class="so" stroke-width="4.5" d="M149 281 H171 q5 5 0 10 H149 q-5 5 0 10 H171 q5 5 0 10 H152"/>')+
    pt('kidney','<ellipse class="f" cx="137" cy="254" rx="7" ry="12" transform="rotate(-12 137 254)"/><ellipse class="f" cx="183" cy="254" rx="7" ry="12" transform="rotate(12 183 254)"/><path class="so" stroke-width="1.6" d="M141 262 C150 290 156 310 158 322 M179 262 C170 290 164 310 162 322"/><ellipse class="f" cx="160" cy="329" rx="9" ry="7"/>')+
    pt('brain',fl('M160 22 C145 22 137 31 138 39 C138 46 146 50 152 50 L168 50 C174 50 182 46 182 39 C183 31 175 22 160 22Z')+ln('M145 31 q5-4 10 0 q5 4 10 0 q4-3 9 0 M143 40 q6-4 11 0 q6 4 11 0 q5-3 8 1 M160 22 L160 50')+fl('M157 50 L157 60 L163 60 L163 50Z'))+
    pt('eyes','<ellipse class="f" cx="150.5" cy="57" rx="5.4" ry="3.6"/><ellipse class="f" cx="169.5" cy="57" rx="5.4" ry="3.6"/><circle class="fb" cx="150.5" cy="57" r="1.7"/><circle class="fb" cx="169.5" cy="57" r="1.7"/>');
  return `<svg id="anat" viewBox="0 0 320 656" role="group" data-layer="org"><g class="grid">${grid}</g>${mir(`<path class="sil" d="${SIL}"/>`)}${mir(`<path class="halo" d="${SIL.replace(" Z","")}"/>`)}<g class="L-mus">${mus}</g><g class="L-skel">${skel}</g><g class="L-org">${org}</g></svg>`;
}
const LAYERS=[['skin','l_skin'],['mus','l_mus'],['vess','l_vess'],['skel','l_skel'],['org','l_org'],['all','l_all']];
const LPRE={skin:{skin:1},mus:{mus:1,skin:.08},vess:{vess:1,nerv:1,skel:.12,skin:.08},skel:{skel:1,skin:.08},org:{org:1,skel:.12,skin:.08},all:{skel:1,org:1,vess:1,nerv:1,skin:.1}};
let layer='org',selTp='heart',atlasOn=null;
const topicLv=tp=>Math.max(0,...TOPIC[tp].m.map(c=>lvCard(c)),TOPIC[tp].mood?lvCard('mood'):0);
const topicOf=c=>c==='mood'?'brain':c==='ex'?'legm':c==='rad'?'hip':Object.keys(TOPIC).find(o=>TOPIC[o].m.includes(c))||'heart';
const layerOf=tp=>['spine','hip','bone'].includes(tp)?'skel':['legm','corem','armm'].includes(tp)?'mus':'org';
function rAnat(){
  if(atlasOn===null)atlasOn=!!(window.THREE&&typeof ATLAS!=='undefined'&&ATLAS.init());
  $('#layerSel').innerHTML=LAYERS.map(([k,i])=>`<button class="chip ${k===layer?'sel':''}" data-layer="${k}">${t(i)}</button>`).join('');
  if(atlasOn)return rAtlas();
  if(!$('#anat'))$('#anatBox').innerHTML=anatSVG();
  const a=$('#anat');a.dataset.layer=['org','skel','mus'].includes(layer)?layer:'all';
  $$('#anat .pt').forEach(g=>{const tp=g.dataset.tp,l=topicLv(tp);g.setAttribute('class','pt l'+l+(tp===selTp?' sel':''));g.setAttribute('aria-label',tx(TOPIC[tp].n)+': '+t('st'+l));g.querySelector('title').textContent=tx(TOPIC[tp].n)});
  $$('#anat .halo').forEach(h=>h.setAttribute('class','halo h'+lvCard('rad')));
}
const AT_LV=['skin','mus','vess','skel','org'];
function rAtlas(){const box=$('#anatBox');
  if(!$('#atlasBox')||!$('#atlasBox .atlasCv')){box.innerHTML=`<div class="atlasBox" id="atlasBox"><div class="atlasBar" id="atlasBar"></div><div class="atlasDepth" id="atlasDepth"></div></div><p class="credit">${esc(ATLAS_CREDIT)}</p>`;
    ATLAS.mount($('#atlasBox'));ATLAS.load('M').then(()=>{ATLAS.frame('front');rAtlas()})}else ATLAS.start();
  if(ATLAS.ok&&rAtlas.last!==layer){if(rAtlas.last!==undefined)ATLAS.frame(layer==='org'?'chest':'front');rAtlas.last=layer}
  ATLAS.lang=LANG;ATLAS.setVis(LPRE[layer]);ATLAS.colorFn=u=>u.tp?topicLv(u.tp):null;ATLAS.selTp=selTp;ATLAS.pulse=clamp(today().v.pulse,35,200);
  ATLAS.onPick=u=>{if(u&&u.tp&&u.tp!==selTp){selTp=u.tp;rBody()}else rAtlasBar()};
  ATLAS.tipFn=u=>`<b>${esc(ATLAS.name(u))}</b>`+(u.tp?`<br>${esc(tx(TOPIC[u.tp].n))} ${lvTag(topicLv(u.tp))}`:'');rAtlasBar()}
function rAtlasBar(){const d=AT_LV.indexOf(layer),sel=ATLAS.sel?ATLAS.parts.find(p=>p.userData.key===ATLAS.sel):null;
  $('#atlasBar').innerHTML=[['front','av_front'],['side','av_side'],['back','av_back'],['head','at_head'],['chest','at_chest'],['legs','at_legs']].map(([k,i])=>`<button data-atv="${k}">${t(i)}</button>`).join('')+
    `<button data-atv="spin" class="${ATLAS.spin?'sel':''}">${t('av_rot')}</button><button data-atv="heat" class="${ATLAS.heat?'sel':''}">${t('av_heat')}</button>`;
  $('#atlasDepth').innerHTML=`<span class="lbl">${t('at_depth')}</span><button data-atd="-1" ${d<=0?'disabled':''} aria-label="-">−</button><b class="mono">${d<0?'·':d+1}</b><button data-atd="1" ${d>=4?'disabled':''} aria-label="+">+</button>`+
    (sel?`<span class="atSel">${esc(ATLAS.name(sel.userData))}</span><button data-atv="hide">${t('at_hide')}</button><button data-atv="iso" class="${ATLAS.iso?'sel':''}">${t('at_iso')}</button>`:'')+
    (ATLAS.hidden.size||ATLAS.iso?`<button data-atv="all">${t('at_all')}</button>`:'')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-atv],[data-atd]');if(!b||!$('#atlasBox')||!$('#atlasBox').contains(b))return;
  if(b.dataset.atd){const d=clamp(AT_LV.indexOf(layer)+ +b.dataset.atd,0,4);layer=AT_LV[d];return rAnat()}
  const k=b.dataset.atv;if(k==='spin')ATLAS.spin=!ATLAS.spin;else if(k==='heat')ATLAS.heat=!ATLAS.heat;else if(k==='hide')ATLAS.hideSel();else if(k==='iso')ATLAS.isoSel();else if(k==='all')ATLAS.showAll();else ATLAS.frame(k);rAtlasBar()});

