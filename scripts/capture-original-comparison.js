import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '../tests/playwright-runtime.js';
const origin='http://127.0.0.1:4190';
const server=spawn(process.execPath,['scripts/dev-server.js'],{env:{...process.env,PORT:'4190'},stdio:'ignore',windowsHide:true});
let browser;
try {
  for(let i=0;i<50;i++){try{if((await fetch(origin)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({channel:process.env.APEX_BROWSER||'msedge',headless:true});
  const page=await browser.newPage();const requests=[];
  await page.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==origin||request.method()!=='GET'){requests.push(request.url());return route.abort();}
    if(url.pathname==='/baseline')return route.fulfill({contentType:'text/html',body:fs.readFileSync('test-results/original-shell/baseline-local.html','utf8')});
    return route.continue();
  });
  const geometry=[];
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    for(const variant of ['baseline','apex']) {
      await page.goto(origin+(variant==='baseline'?'/baseline':'/'));
      if(variant==='baseline')await page.evaluate(()=>{
        // Reproduce only the audited original initial layout, never its engine.
        const grid=document.querySelector('.mf-product-customizer-grid');
        grid.prepend(document.querySelector('[data-mf-size-step]'));
        document.querySelectorAll('[data-mf-pet-step],[data-mf-pet-size-step]').forEach(n=>n.hidden=true);
        document.querySelector('form.cart').hidden=true;
      });
      await page.evaluate(()=>document.querySelectorAll('img').forEach(n=>n.loading='eager'));
      await page.waitForFunction(()=>[...document.images].every(n=>n.complete));
      const measurements=await page.evaluate(()=>{
        const selectors=['.mf-product-hero__grid','.mf-product-hero__media','.mf-product-hero__summary','.mf-product-how-grid','.mf-product-showcase__grid'];
        return Object.fromEntries(selectors.map(s=>{const n=document.querySelector(s),r=n.getBoundingClientRect();return[s,{width:r.width,x:r.x,columns:getComputedStyle(n).gridTemplateColumns,gap:getComputedStyle(n).gap}];}));
      });
      geometry.push({variant,viewport:width,measurements});
      if(variant==='baseline')await page.screenshot({path:'test-results/original-shell/baseline-'+width+'.png',fullPage:true});
    }
  }
  if(requests.length)throw Error('Unexpected external baseline request: '+requests.join(', '));
  fs.writeFileSync('docs/evidence/original-shell-geometry.json',JSON.stringify(geometry,null,2));
  console.log('Baseline renderizado com motor removido; screenshots 390/1440 e geometria comparativa salvos.');
} finally {await browser?.close();server.kill();}
