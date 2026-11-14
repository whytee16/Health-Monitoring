"""Сквозная проверка в Chrome: python3 tests/functional.py (нужен playwright и Google Chrome)."""
import asyncio,pathlib
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent
URL=(ROOT.parent/'index.html').as_uri()
R=[]
def ok(n,c,x=''): R.append(('OK  ' if c else 'FAIL')+' '+n+(' | '+str(x) if x!='' else ''))
async def rng(pg,sel,v): await pg.evaluate("([s,v])=>{const e=document.querySelector(s);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}",[sel,v])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
        ctx=await b.new_context(viewport={'width':1360,'height':860},permissions=['microphone'],locale='ru-RU')
        pg=await ctx.new_page(); errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append('PE '+str(e)))
        tab=lambda t: pg.click(f'#nav [data-t={t}]')
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.click('#sndBtn'); await pg.click('[data-scn=flare]'); await pg.wait_for_timeout(1500)
        r=await pg.evaluate('''()=>{const b=new Uint8Array(analyser.fftSize);let mx=0;return new Promise(res=>{let n=0;const iv=setInterval(()=>{analyser.getByteTimeDomainData(b);for(const v of b)mx=Math.max(mx,Math.abs(v-128));if(++n>40){clearInterval(iv);res({state:AC.state,mx})}},50)})}''')
        ok('звук: контекст работает, сигнал не нулевой',r['state']=='running' and r['mx']>3,r); await pg.click('#sndBtn')
        ok('главный индикатор: нужен врач при вспышке','st2' in await pg.get_attribute('#master','class'))
        await pg.click('#tmBody tr[data-c=rad]'); ok('строка сводки ведёт к скелету, тема «таз и бедро»', await pg.evaluate("curTab=='body'&&selTp=='hip'&&layer=='skel'"))
        await pg.fill('#in_spo2','90'); await pg.click('#mForm button[type=submit]'); await pg.wait_for_timeout(200)
        await pg.click('[data-layer=org]'); bb=await pg.locator('#anat [data-tp=lungs] path.f').first.bounding_box(); await pg.mouse.click(bb['x']+bb['width']*.83,bb['y']+bb['height']*.69)
        ok('клик по лёгким на фигуре', await pg.evaluate("selTp")=='lungs' and 'l2' in await pg.get_attribute('#anat [data-tp=lungs]','class'))
        for L,tp in [('skel','spine'),('mus','legm')]:
            await pg.click(f'[data-layer={L}]'); await pg.locator(f'#anat [data-tp={tp}]').first.dispatch_event('click'); ok(f'слой {L}: выбирается {tp}', await pg.evaluate('selTp')==tp)
        await pg.click('.chip[data-tp=lungs]'); await pg.click('#tpPanel [data-pr]'); ok('протокол отмечен, +5 энергии', await pg.evaluate('S.energy')==25)
        await tab('mind'); await rng(pg,'#dq_home',5); await pg.click('#dForm button[type=submit]'); ok('дневник сохранён, мягкий вывод по одному дню', await pg.evaluate('today().d.home')==5 and await pg.locator('#dInsight .note.doc').count()==0)
        await tab('earth'); await pg.click('#m-earth details summary'); await pg.fill('#pName','Папа'); await pg.set_input_files('#pPhoto',str(ROOT/'photo.png')); await pg.check('#pOk'); await pg.click('#pForm button[type=submit]'); await pg.wait_for_timeout(300)
        pid=await pg.evaluate('S.people[S.people.length-1].id'); ok('фото загружено', await pg.evaluate(f"!!MEDIA['photo:{pid}']"))
        await pg.select_option('#cWho',pid); await pg.fill('#cText','Сынок, мы тебя ждём.'); await pg.set_input_files('#cVoice',str(ROOT/'voice.wav')); await pg.click('#capForm button[type=submit]')
        ok('без согласия послание не сохраняется', await pg.evaluate('S.caps.length')==4)
        await pg.check('#cOk'); await pg.click('#capForm button[type=submit]'); await pg.wait_for_timeout(300); cid=await pg.evaluate('S.caps[S.caps.length-1].id')
        await pg.click(f'[data-open={cid}]'); await pg.click('#playVoice')
        mx=await pg.evaluate('''()=>new Promise(res=>{let mx=0,n=0;const iv=setInterval(()=>{mx=Math.max(mx,+document.querySelector('#fMouth').getAttribute('ry'));if(++n>30){clearInterval(iv);res(mx)}},50)})''')
        ok('голос из файла играет, губы двигаются',mx>4,mx); await pg.click('#playStop')
        await pg.click('#rRec'); await pg.wait_for_timeout(1200); await pg.click('#rRec'); await pg.wait_for_timeout(500); await pg.fill('#rText','Привет домой'); await pg.click('#rSave')
        rid=await pg.evaluate('S.replies[0].id'); ok('запись с микрофона (фиктивное устройство)', await pg.evaluate(f"!!MEDIA['reply:{rid}']"))
        await pg.reload(); await pg.wait_for_timeout(1000); ok('после перезагрузки данные и медиа на месте', await pg.evaluate(f"S.people.length==3&&!!MEDIA['photo:{pid}']&&!!MEDIA['voice:{cid}']&&today().v.spo2==90"))
        await pg.check('#shortCb'); await tab('mind'); await pg.select_option('#bWho',pid); await pg.click('#bStart')
        box=await pg.locator('#holdBtn').bounding_box()
        for i in range(2):
            await pg.mouse.move(box['x']+50,box['y']+20); await pg.mouse.down(); await pg.wait_for_timeout(2500); await pg.mouse.up(); await pg.wait_for_timeout(3500)
        await pg.wait_for_timeout(600); ok('дыхание: 2 ровных цикла очищают сигнал, фото и послание', await pg.evaluate("B.done&&B.clar==1&&document.querySelector('#sigImg').src.startsWith('blob:')") and 'Сынок' in await pg.inner_text('#bMsg'))
        await rng(pg,'#bAfter',5); await pg.click('#bSave'); ok('настроение после сеанса записано', await pg.evaluate("today().d.well==5&&curTab=='over'"))
        await tab('mind'); await pg.click('[data-g=garden]'); g0=await pg.evaluate('gardenScore().total'); await pg.click('#gWater'); ok('сад: полив', await pg.evaluate('gardenScore().total')==g0+1)
        await pg.click('[data-g=memory]'); n0=await pg.evaluate('S.mem.length')
        for a,c in await pg.evaluate('(()=>{const m={};Mem.cards.forEach((c,i)=>(m[c.s]=m[c.s]||[]).push(i));return Object.values(m)})()'):
            await pg.click(f'[data-mc="{a}"]'); await pg.click(f'[data-mc="{c}"]')
        ok('память: игра проходится', await pg.evaluate('S.mem.length')==n0+1)
        await tab('mission')
        for d,rad,ex,dc in [('iss',0.6,120,0),('moon',1.4,105,0),('europa',2.0,105,1),('proxima',2.5,45,2),('andromeda',1.0,45,2),('mars',0.7,75,1)]:
            await pg.click(f'[data-dest={d}]'); ok(f'мир {d}: доза, план тренировок, класс связи', await pg.evaluate(f"base('rad')=={rad}&&base('ex')=={ex}&&D().dc=={dc}&&lvCard('rad')==0"))
        await rng(pg,'#sb_sleep',4); ok('песочница: ползунок сна меняет статус и погоду', await pg.evaluate("lvCard('sleep')==2&&Tx.fog>.9"))
        await rng(pg,'#pl_sols',1000); await rng(pg,'#pl_ex',0); r1=await pg.evaluate('simPlan()'); await rng(pg,'#pl_ex',120); r2=await pg.evaluate('simPlan()')
        ok('симулятор: без тренировок кости теряют больше; доза за 1000 солов на Марсе пересекает 600 мЗв', r1['bone']<r2['bone'] and r1['cross'] is not None,[round(r1['bone'],1),round(r2['bone'],1),r1['cross']])
        await tab('over'); await pg.click('[data-scn=out]'); ok('сценарий вне коридора: шаг 3', await pg.evaluate('escal().step')==3)
        await pg.click('[data-scn=homesick]'); ok('тоска 3 сола: шаг 1 по динамике', await pg.evaluate('escal().step')==1)
        await pg.click('[data-scn=calm]'); ok('спокойный сол: шаг 0', await pg.evaluate('escal().step')==0)
        await tab('help'); await pg.check('[data-fl="0"]'); ok('тревожный признак: сразу шаг 3', await pg.evaluate('escal().step')==3); await pg.click('#sumQueue'); await pg.uncheck('[data-fl="0"]')
        await tab('over')
        for i in range(3): await pg.click('#nextSol')
        ok('сол 150: послание открылось', await pg.evaluate("solNow()==150"))
        await pg.select_option('#langSel','en'); await pg.wait_for_timeout(200)
        ok('английский: интерфейс и содержание', 'status board' in (await pg.text_content('#m-over')).lower() and (await pg.text_content('#master')).lower() in ('all systems nominal','caution','consult surgeon'))
        await tab('help'); ok('английский: сводка для врача', 'SUMMARY FOR THE FLIGHT SURGEON' in await pg.inner_text('#sumTxt'))
        for L,w in [('kk','Шолу'),('zh','总览'),('ja','概要'),('fr','Aperçu'),('de','Übersicht'),('es','Resumen')]:
            await pg.select_option('#langSel',L); ok(f'язык {L}: навигация', w in await pg.text_content('#nav'))
        await pg.select_option('#langSel','ru'); await tab('colony'); await pg.click('#colStart'); await pg.click('[data-sp="8"]')
        for i in range(30):
            await pg.wait_for_timeout(250)
            if await pg.evaluate('!!CG.ev'): await pg.click('[data-opt="0"]')
            await pg.evaluate("(()=>{const u=UPG.find(u=>!CG.upg[u.id]&&CG.pts>=u.cost);if(u)document.querySelector('[data-upg='+u.id+']').click()})()")
        ok('ковчег: время идёт, решения покупаются, события приходят', await pg.evaluate('CG.sol>=150&&Object.keys(CG.upg).length>=3&&CG.log.length>3'), await pg.evaluate('[CG.sol,Object.keys(CG.upg).length]'))
        await pg.click('#colQuit'); await tab('over'); await pg.click('#resetAll'); await pg.check('#shortCb'); await pg.click('#demoGo'); seen=[]
        for i in range(7):
            await pg.wait_for_timeout(3000 if i==0 else 6000); seen.append(await pg.evaluate("[Demo.i,curTab,escal().step]"))
        await pg.wait_for_timeout(7000); ok('демо «Сол 147»: 7 шагов и завершение', await pg.evaluate('!Demo.on') and [s[1] for s in seen]==['over','over','body','over','mind','help','trend'],seen)
        ok('нет пропущенных ключей перевода', await pg.evaluate('Object.keys(MISS).length')==0, await pg.evaluate('Object.keys(MISS)'))
        print('\n'.join(R)); print('ERRORS:',errs or 'none'); await b.close()
asyncio.run(main())
