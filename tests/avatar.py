"""Проверка модуля 09 «Аватар 3D»: python3 tests/avatar.py (playwright + chromium)."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent;URL=(ROOT.parent/'index.html').as_uri();OUT=ROOT/'shots';OUT.mkdir(exist_ok=True)

PROJ="""(k=>{const o=ATLAS.parts.find(p=>p.userData.key===k||p.userData.base===k);const v=new THREE.Vector3();new THREE.Box3().setFromObject(o).getCenter(v);v.z=new THREE.Box3().setFromObject(o).max.z;v.project(ATLAS.cam);return[(v.x+1)/2,(1-v.y)/2]})"""
async def atlas_click(pg,key):
    """Кликает по центру структуры атласа (луч от камеры)."""
    pt=await pg.evaluate(PROJ+f"('{key}')");box=await pg.locator('.atlasCv').bounding_box()
    await pg.mouse.click(box['x']+box['width']*pt[0],box['y']+box['height']*pt[1]);await pg.wait_for_timeout(300)
async def snap(pg,path,**kw):
    """Программный рендер медленный: перед снимком рисуем кадр синхронно."""
    await pg.evaluate("typeof ATLAS!=='undefined'&&ATLAS.run&&ATLAS.ok&&(ATLAS.stop(),ATLAS.tick(),ATLAS.start())");await pg.wait_for_timeout(250);await pg.screenshot(path=path,**kw)
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
        await pg.click('[data-avm=body]');await pg.wait_for_function('ATLAS.ok',timeout=60000);await pg.wait_for_timeout(500)
        R.append(('3D-атлас загружен из BodyParts3D',await pg.evaluate('ATLAS.real&&ATLAS.parts.length>100')))
        await snap(pg,str(OUT/'av_body.png'))
        await pg.click('[data-avl=skin]');await pg.click('[data-avl=org]');await pg.click('[data-avl=vess]');await pg.click('[data-avv=front]');await pg.wait_for_timeout(300)
        await atlas_click(pg,'femur_l')
        R.append(('клик по бедренной кости выбирает тему «таз и бедро»',await pg.evaluate('AV.sel')=='hip'))
        await snap(pg,str(OUT/'av_skel.png'))
        await pg.click('[data-avl=mus]');await pg.click('[data-avl=skel]');await pg.click('[data-avv=heat]');await pg.wait_for_timeout(300);await snap(pg,str(OUT/'av_mus.png'))
        await pg.click('[data-avm=map]');await pg.wait_for_timeout(300);R.append(('возврат на карту: атлас выгружен',await pg.evaluate("AV.run&&!ATLAS.run")))
        for n,c in R:print(('OK  ' if c else 'FAIL'),n)
        print('errors:',errs[:5]);await b.close();sys.exit(0 if all(c for _,c in R) and not errs else 1)
asyncio.run(main())
