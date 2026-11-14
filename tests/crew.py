"""Проверка сайта экипажа crew.html: python3 tests/crew.py (playwright + chromium)."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent;URL=(ROOT.parent/'crew.html').as_uri();OUT=ROOT/'shots';OUT.mkdir(exist_ok=True)
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
        await pg.click('[data-p=tim]');await pg.wait_for_timeout(1200)
        ok('Тимур: недопуск за пропущенный ОАК',await pg.evaluate("admit(P('tim')).lv")==2 and 'Общий анализ крови' in await pg.inner_text('.adm'))
        await pg.screenshot(path=str(OUT/'crew_over.png'),full_page=True)
        await pg.goto(URL+'#/p/tim/chk');await pg.wait_for_timeout(300)
        await pg.click('[data-form=cbc] button.pri');await pg.wait_for_timeout(300)
        ok('после внесения ОАК допуск снят с блокировки по ОАК',await pg.evaluate("chk(P('tim'),CHK[0]).s")<2)
        ok('Даниил: недопуск по психике',await pg.evaluate("admit(P('dan')).r.some(x=>x.includes('Психолог'))"))
        ok('Мария: высокий риск тромбоза',await pg.evaluate("status(P('mar')).th.risk")>=25)
        for s in ['skel','mus','vess']:
            await pg.goto(URL+'#/p/ele/body');await pg.wait_for_timeout(200);await pg.click(f'[data-sys={s}]');await pg.wait_for_timeout(1200);await pg.screenshot(path=str(OUT/f'crew_{s}.png'),full_page=True)
        await pg.goto(URL+'#/p/dan/psy');await pg.wait_for_timeout(600);await pg.screenshot(path=str(OUT/'crew_psy.png'),full_page=True)
        await pg.goto(URL+'#/p/arm/well');await pg.wait_for_timeout(800);await pg.click('[data-addpain=calves]');await pg.click('[data-form=well] button.pri');await pg.wait_for_timeout(300)
        ok('опрос самочувствия сохранён с болью',await pg.evaluate("last(P('arm').well).date===today()&&last(P('arm').well).pain.length===1"))
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
