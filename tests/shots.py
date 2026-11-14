import asyncio,sys,json
from playwright.async_api import async_playwright
URL='file:///home/claude/health-monitoring/index.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        errs=[]
        for name,vp in [('desk',{'width':1360,'height':860}),('phone',{'width':390,'height':780})]:
            ctx=await b.new_context(viewport=vp,locale='ru-RU'); pg=await ctx.new_page()
            pg.on('console',lambda m: errs.append(name+' '+m.text) if m.type=='error' else None)
            pg.on('pageerror',lambda e: errs.append(name+' PE '+str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(1200)
            await pg.click('[data-scn=flare]'); await pg.wait_for_timeout(2500)
            for t in ['over','body','trend','mind','earth','help','mission','colony']:
                await pg.click(f'#nav [data-t={t}]'); await pg.wait_for_timeout(500)
                await pg.screenshot(path=f'/tmp/v2_{name}_{t}.png',full_page=(name=='phone' or t not in('over',)))
            if name=='desk':
                for L in ['en','kk','zh','ja','fr','de','es','ru']:
                    await pg.select_option('#langSel',L)
                    for t in ['over','body','trend','mind','earth','help','mission','colony']:
                        await pg.click(f'#nav [data-t={t}]')
                print('MISSING',await pg.evaluate('Object.keys(MISS)'))
            await ctx.close()
        print('ERR',errs or 'none'); await b.close()
asyncio.run(main())
