import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/health-monitoring/index.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':1360,'height':860},locale='ru-RU'); pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.click('[data-scn=flare]'); await pg.click('#nav [data-t=body]')
        for L in ['skel','mus','all']:
            await pg.click(f'[data-layer={L}]'); await pg.wait_for_timeout(200)
            await pg.locator('#anatBox').screenshot(path=f'/tmp/an_{L}.png')
        await pg.click('#nav [data-t=over]'); await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/v2_over.png')
        await pg.click('#nav [data-t=mission]'); await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/v2_mission.png',full_page=True)
        for d in ['europa','titan','proxima','andromeda','moon','iss']:
            await pg.click(f'[data-dest={d}]'); await pg.click('#nav [data-t=over]'); await pg.wait_for_timeout(1500)
            await pg.locator('#view').screenshot(path=f'/tmp/sky_{d}.png'); await pg.click('#nav [data-t=mission]')
        await pg.click('#nav [data-t=colony]'); await pg.click('#colStart'); await pg.click('[data-sp="8"]')
        for i in range(40):
            await pg.wait_for_timeout(400)
            if await pg.evaluate('!!CG.ev'): await pg.click('[data-opt="0"]')
            await pg.evaluate("UPG.forEach(u=>{if(!CG.upg[u.id]&&CG.pts>=u.cost)colBuy(u.id)})")
        await pg.screenshot(path='/tmp/v2_colony.png',full_page=True)
        print(await pg.evaluate('JSON.stringify({sol:CG.sol,tot:Math.round(cgTot()),h:CG.health|0,m:CG.morale|0,u:CG.unity|0,s:CG.supply|0,g:CG.grief|0,ended:CG.ended})'))
        print('ERR',errs or 'none',await pg.evaluate('Object.keys(MISS)')); await b.close()
asyncio.run(main())
