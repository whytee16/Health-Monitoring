import asyncio
from playwright.async_api import async_playwright
JS='''(strat)=>{const out=[];for(const dest of ['mars','moon','europa','proxima']){let wins=0,res=[];for(let run=0;run<6;run++){
 document.querySelector('#colDest').value=dest;colStart();
 while(!CG.ended){ if(CG.ev){colChoose(strat==='bad'?1:0)} if(strat!=='none'){const order=strat==='med'?UPG.filter(u=>u.br==='med'):UPG;for(const u of order){if(!CG.upg[u.id]&&CG.pts>=u.cost){colBuy(u.id);break}}} colTick(); }
 const tot=Math.round(cgTot());res.push(CG.sol+'/'+tot+'/m'+Math.round(CG.morale)+'/u'+Math.round(CG.unity));if(CG.sol>=1500&&tot>=200&&CG.morale>=40)wins++;colQuit()}
 out.push(dest+' '+strat+' wins '+wins+'/6 :: '+res.join(' '))}return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(); await pg.goto('file:///home/claude/health-monitoring/index.html'); await pg.click('#nav [data-t=colony]')
        for s in ['none','med','all','bad']:
            for l in await pg.evaluate(JS,s): print(l)
        await b.close()
asyncio.run(main())
