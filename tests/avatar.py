"""Проверка модуля 09 «Аватар 3D»: python3 tests/avatar.py (playwright + chromium)."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent;URL=(ROOT.parent/'index.html').as_uri();OUT=ROOT/'shots';OUT.mkdir(exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=__import__('os').environ.get('CHROME','/opt/pw-browsers/chromium') if __import__('os').path.exists('/opt/pw-browsers') else None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1400,'height':900},locale='ru-RU');errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(URL);await pg.wait_for_timeout(600);await pg.click('#nav [data-t=avatar]');await pg.wait_for_timeout(1500)
        R=[]
        R.append(('3D запущен',await pg.evaluate('AV.ok&&AV.run')))
        await pg.screenshot(path=str(OUT/'av_map.png'))
        await pg.evaluate("mapGoTo('water')");await pg.wait_for_function("!AV.map.target",timeout=20000)
        R.append(('аватар дошёл до водного узла',await pg.evaluate("nearGoal()&&nearGoal().g.id")=='water'))
        w0=await pg.evaluate('today().v.water');await pg.click('[data-avdo=water]');await pg.wait_for_timeout(300)
        R.append(('цель выполнена, вода +0,5',await pg.evaluate(f'avDone("water")&&Math.abs(today().v.water-{w0}-.5)<1e-6')))
        await pg.screenshot(path=str(OUT/'av_map2.png'))
        await pg.click('[data-avm=body]');await pg.wait_for_timeout(1200);await pg.screenshot(path=str(OUT/'av_body.png'))
        await pg.click('[data-avl=skin]');await pg.click('[data-avl=org]');await pg.click('[data-avl=vess]');await pg.click('[data-avv=front]');await pg.wait_for_timeout(500)
        box=await pg.locator('#avCv canvas').first.bounding_box()
        await pg.wait_for_timeout(800);pt=await pg.evaluate("(()=>{const o=AV.body.parts.find(p=>p.userData.pt==='femur');const v=new THREE.Vector3();o.getWorldPosition(v);v.project(AV.body.cam);return[(v.x+1)/2,(1-v.y)/2]})()")
        await pg.mouse.click(box['x']+box['width']*pt[0],box['y']+box['height']*pt[1]);await pg.wait_for_timeout(300)
        R.append(('клик по скелету выбирает кость',await pg.evaluate('AV.sel') in ('spine','bone','hip')))
        await pg.screenshot(path=str(OUT/'av_skel.png'))
        await pg.click('[data-avl=mus]');await pg.click('[data-avl=skel]');await pg.click('[data-avv=heat]');await pg.wait_for_timeout(500);await pg.screenshot(path=str(OUT/'av_mus.png'))
        for n,c in R:print(('OK  ' if c else 'FAIL'),n)
        print('errors:',errs[:5]);await b.close();sys.exit(0 if all(c for _,c in R) and not errs else 1)
asyncio.run(main())
