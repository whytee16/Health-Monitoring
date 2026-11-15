"""Проверка сайта экипажа crew.html: python3 tests/crew.py (playwright + chromium)."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent;URL=(ROOT.parent/'crew.html').as_uri();OUT=ROOT/'shots';OUT.mkdir(exist_ok=True)

PROJ="""(k=>{const o=ATLAS.parts.find(p=>p.userData.key===k||p.userData.base===k);const v=new THREE.Vector3();new THREE.Box3().setFromObject(o).getCenter(v);v.z=new THREE.Box3().setFromObject(o).max.z;v.project(ATLAS.cam);return[(v.x+1)/2,(1-v.y)/2]})"""
async def atlas_click(pg,key):
    """Кликает по центру структуры атласа (луч от камеры)."""
    pt=await pg.evaluate(PROJ+f"('{key}')");box=await pg.locator('.atlasCv').bounding_box()
    await pg.mouse.click(box['x']+box['width']*pt[0],box['y']+box['height']*pt[1]);await pg.wait_for_timeout(300)
async def snap(pg,path,**kw):
    """Программный рендер медленный: перед снимком рисуем кадр синхронно."""
    await pg.evaluate("typeof ATLAS!=='undefined'&&ATLAS.run&&ATLAS.ok&&(ATLAS.stop(),ATLAS.tick(),ATLAS.start())");await pg.wait_for_timeout(250);await pg.screenshot(path=path,**kw)
EXE='/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=EXE,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1400,'height':900});errs=[];R=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        ok=lambda n,c:R.append((n,c))
        await pg.goto(URL);await pg.wait_for_timeout(1500);await pg.screenshot(path=str(OUT/'crew_home.png'),full_page=True)
        await pg.click('#staffBtn');await pg.wait_for_timeout(400);ok('список персонала',await pg.locator('#staffList li').count()==8)
        await pg.screenshot(path=str(OUT/'crew_drawer.png'))
        await pg.click('[data-p=tim]');await pg.wait_for_function('ATLAS.ok',timeout=60000);await pg.wait_for_timeout(500)
        ok('Тимур: недопуск за пропущенный ОАК',await pg.evaluate("admit(P('tim')).lv")==2 and 'Общий анализ крови' in await pg.inner_text('.adm'))
        await snap(pg,str(OUT/'crew_over.png'),full_page=True)
        await pg.goto(URL+'#/p/tim/chk');await pg.wait_for_timeout(300)
        await pg.click('[data-form=cbc] button.pri');await pg.wait_for_timeout(300)
        ok('после внесения ОАК допуск снят с блокировки по ОАК',await pg.evaluate("chk(P('tim'),CHK[0]).s")<2)
        ok('Даниил: недопуск по психике',await pg.evaluate("admit(P('dan')).r.some(x=>x.includes('Психолог'))"))
        ok('Мария: высокий риск тромбоза',await pg.evaluate("status(P('mar')).th.risk")>=25)
        for s in ['skel','vess','mus']:
            await pg.goto(URL+'#/p/ele/body');await pg.wait_for_timeout(200);await pg.click(f'[data-sys={s}]');await pg.wait_for_function('ATLAS.ok&&ATLAS.sex==="F"',timeout=60000);await pg.wait_for_timeout(500);await snap(pg,str(OUT/f'crew_{s}.png'),full_page=True)
        await atlas_click(pg,'calf_l');ok('клик по 3D: выбраны икры, панель мышц',await pg.evaluate('C.selPt')=='calves' and 'Икры' in await pg.inner_text('#sysPanel'))
        await pg.goto(URL+'#/p/dan/psy');await pg.wait_for_timeout(600);await pg.screenshot(path=str(OUT/'crew_psy.png'),full_page=True)
        await pg.goto(URL+'#/p/arm/well');await pg.wait_for_function('ATLAS.ok&&ATLAS.sex==="M"',timeout=60000);await pg.wait_for_timeout(400);await atlas_click(pg,'quadriceps_r');ok('карта боли: клик по бедру на 3D',await pg.evaluate("C.draft.pain.some(x=>x.pt==='quads')"));await pg.click('[data-addpain=calves]');await pg.click('[data-form=well] button.pri');await pg.wait_for_timeout(300)
        ok('опрос самочувствия сохранён с болью',await pg.evaluate("last(P('arm').well).date===today()&&last(P('arm').well).pain.length===2"))
        await pg.goto(URL+'#/p/arm/train');await pg.wait_for_timeout(400);await pg.click('[data-tr]');ok('тренировка отмечена',await pg.evaluate("P('arm').train.some(x=>x.date===today()&&x.n)"))
        await pg.screenshot(path=str(OUT/'crew_train.png'),full_page=True)
        for t in ['food']:
            await pg.goto(URL+'#/p/ser/'+t);await pg.wait_for_timeout(400);await pg.screenshot(path=str(OUT/f'crew_{t}.png'),full_page=True)
        await pg.goto(URL+'#/rating');await pg.wait_for_timeout(300);await pg.screenshot(path=str(OUT/'crew_rating.png'),full_page=True)
        await pg.goto(URL+'#/schedule');await pg.wait_for_timeout(300);await pg.screenshot(path=str(OUT/'crew_sched.png'),full_page=True)
        await pg.set_viewport_size({'width':390,'height':844});await pg.goto(URL+'#/p/dan');await pg.wait_for_timeout(800)
        ok('телефон: без горизонтальной прокрутки',await pg.evaluate('document.documentElement.scrollWidth<=innerWidth'));await pg.screenshot(path=str(OUT/'crew_phone.png'))
        for n,c in R:print(('OK  ' if c else 'FAIL'),n)
        print('errors:',errs[:5]);await b.close();sys.exit(0 if all(c for _,c in R) and not errs else 1)
asyncio.run(main())
