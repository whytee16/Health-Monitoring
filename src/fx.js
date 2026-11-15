/* ===== Визуальные эффекты: звёздный фон, появление карточек, кольцевые диаграммы, пустые состояния ===== */
const FX={reduce:window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches};
(function starfield(){const c=document.createElement('canvas');c.id='starfield';c.setAttribute('aria-hidden','true');document.body.prepend(c);const x=c.getContext('2d');
  let W=0,H=0,dpr=1;const st=[...Array(140)].map(()=>({x:Math.random(),y:Math.random(),z:.2+Math.random()*.8,tw:Math.random()*6.28})),dust=[...Array(10)].map(()=>({x:Math.random(),y:Math.random(),r:60+Math.random()*140,h:Math.random()<.5?'57,189,235':'139,131,246'}));
  const size=()=>{dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)};size();addEventListener('resize',size);
  let last=0;function draw(ts){if(document.hidden){requestAnimationFrame(draw);return}if(ts-last<33&&!FX.reduce){requestAnimationFrame(draw);return}last=ts;x.clearRect(0,0,W,H);
    dust.forEach(d=>{const g=x.createRadialGradient(d.x*W,d.y*H,0,d.x*W,d.y*H,d.r);g.addColorStop(0,`rgba(${d.h},.045)`);g.addColorStop(1,`rgba(${d.h},0)`);x.fillStyle=g;x.fillRect(d.x*W-d.r,d.y*H-d.r,d.r*2,d.r*2)});
    const t=ts/1000;st.forEach(s=>{if(!FX.reduce){s.x+=.000035*s.z;s.y+=.000012*s.z;if(s.x>1)s.x=0;if(s.y>1)s.y=0}const a=.25+.55*s.z*(.6+.4*Math.sin(t*1.3+s.tw));x.fillStyle=`rgba(220,236,255,${a})`;x.beginPath();x.arc(s.x*W,s.y*H,.5+s.z*1.1,0,6.283);x.fill()});
    if(!FX.reduce)requestAnimationFrame(draw)}requestAnimationFrame(draw)})();
/* появление карточек каскадом (CSS-анимация, всегда заканчивается видимым состоянием) */
FX.reveal=function(root,sel){if(!root||FX.reduce)return;[...root.querySelectorAll(sel||'.pn,.card,.gcard,.fcard,.ring')].forEach((el,i)=>{if(el.dataset.rv)return;el.dataset.rv=1;el.style.setProperty('--d',Math.min(i,8)*55+'ms');el.classList.add('rv')})};
/* кольцевая диаграмма: значение 0..1 */
FX.ring=function(v,color,big,small){const r=44,C=2*Math.PI*r,off=C*(1-Math.max(0,Math.min(1,v)));
  return`<div class="ring"><svg viewBox="0 0 108 108" aria-hidden="true"><circle class="rv0" cx="54" cy="54" r="${r}" fill="none" stroke-width="9"/><circle class="rv1" cx="54" cy="54" r="${r}" fill="none" stroke="${color}" color="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-off="${off.toFixed(1)}" transform="rotate(-90 54 54)"/>
  <text x="54" y="60" text-anchor="middle" fill="#EAF1FB" font-size="19" font-weight="800" font-family="Manrope,system-ui,sans-serif">${big}</text></svg><span>${small}</span></div>`};
FX.ringsGo=function(root){requestAnimationFrame(()=>requestAnimationFrame(()=>(root||document).querySelectorAll('.ring .rv1[data-off]').forEach(c=>c.setAttribute('stroke-dashoffset',c.dataset.off))))};
FX.empty=(icon,title,hint,action)=>`<div class="empty"><div class="ei">${icon}</div><b>${title}</b>${hint?`<p>${hint}</p>`:''}${action||''}</div>`;
