import assert from 'node:assert/strict';
import { suite } from './browser-helpers.js';
await suite('visual-smoke', 4176, async ({page,run,open}) => {
  const carousel=page.locator('.hero-carousel'), active=() => carousel.getAttribute('data-slide');
  await run('Hero local com quatro transformações, LCP prioritária e dimensões fixas',async()=>{
    assert.equal(await page.locator('.carousel-slide').count(),4);
    assert.equal(await page.locator('.carousel-slide img').first().getAttribute('fetchpriority'),'high');
    assert.notEqual(await page.locator('.carousel-slide img').first().getAttribute('loading'),'lazy');
    await page.waitForFunction(()=>[...document.querySelectorAll('.carousel-slide img')].every(img=>img.complete&&img.naturalWidth>0));
    assert.ok(await page.locator('.carousel-slide img').evaluateAll(images=>images.every(img=>getComputedStyle(img).objectFit==='contain')));
  });
  await run('Autoplay avança e botão pausa corretamente',async()=>{
    await open();
    await page.waitForFunction(()=>document.querySelector('.hero-carousel').dataset.slide==='1',null,{timeout:8000});
    await page.locator('[data-carousel-play]').click();
    assert.equal(await carousel.getAttribute('data-playing'),'false');
  });
  await run('Setas, dots, teclado e acessibilidade sem salto de layout',async()=>{
    const height=(await page.locator('.carousel-stage').boundingBox()).height;
    await page.locator('[data-carousel-dot="0"]').click();
    await page.locator('[data-carousel-next]').click(); assert.equal(await active(),'1');
    await page.keyboard.press('ArrowRight'); assert.equal(await active(),'2');
    await page.locator('[data-carousel-prev]').click(); assert.equal(await active(),'1');
    assert.equal(await page.locator('.carousel-slide[aria-hidden="false"]').count(),1);
    assert.equal(await page.locator('[data-carousel-dot][aria-current="true"]').count(),1);
    assert.equal((await page.locator('.carousel-stage').boundingBox()).height,height);
    assert.equal(await carousel.getAttribute('data-playing'),'false');
  });
  await run('Swipe mobile real por toque avança e preserva scroll vertical',async()=>{
    await page.setViewportSize({width:390,height:1000});
    await page.locator('[data-carousel-dot="0"]').click();
    await page.locator('.carousel-stage').scrollIntoViewIfNeeded();
    const box=await page.locator('.carousel-stage').boundingBox(),y=box.y+box.height/2;
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*.8,y}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.2,y}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await client.detach(); assert.equal(await active(),'1');
    assert.match(await page.locator('.carousel-stage').evaluate(n=>getComputedStyle(n).touchAction),/pan-y/);
  });
  await run('Movimento reduzido inicia pausado; reprodução continua opcional',async()=>{
    await page.emulateMedia({reducedMotion:'reduce'}); await open();
    assert.equal(await carousel.getAttribute('data-playing'),'false');
    await page.locator('[data-carousel-next]').click(); assert.equal(await active(),'1');
    await page.emulateMedia({reducedMotion:'no-preference'});
  });
  for(const id of ['individual','casal','familia','pet']){
    await run('Imagem de produto íntegra: '+id,async()=>{
      const visual=page.locator('[data-choose-product="'+id+'"] .product-visual');
      await visual.scrollIntoViewIfNeeded();
      await page.waitForFunction(product=>[...document.querySelectorAll('[data-choose-product="'+product+'"] img')].every(img=>img.complete&&img.naturalWidth>0),id);
      assert.equal(await visual.locator('img').count(),id==='familia'?2:1);
      assert.equal(await visual.getAttribute('role'),'img');
      assert.ok(await visual.locator('img').evaluateAll(images=>images.every(img=>getComputedStyle(img).objectFit==='contain')));
    });
  }
  for(const width of [1440,390]){
    await run('Screenshots hero, produtos e configurador: '+width+'px',async()=>{
      await page.setViewportSize({width,height:1000}); await page.emulateMedia({reducedMotion:'reduce'}); await open();
      await page.locator('.carousel-slide img').first().evaluate(img=>img.decode());
      await page.screenshot({path:'test-results/restored-top-'+width+'.png'});
      for(const [name,selector] of [['hero','.hero'],['products','#produtos'],['config','#personalize']]){
        await page.locator(selector).scrollIntoViewIfNeeded();
        if(name==='config'){
          await page.locator('#personalize').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));
          await page.screenshot({path:'test-results/restored-'+name+'-'+width+'.png'});
        } else if(name==='hero' && width===390) {
          // Capture the full mobile hero and navbar without sticky-header overlap.
          await page.setViewportSize({width,height:1400});
          await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
          await page.screenshot({path:'test-results/restored-'+name+'-'+width+'.png'});
          await page.setViewportSize({width,height:1000});
        } else await page.locator(selector).screenshot({path:'test-results/restored-'+name+'-'+width+'.png'});
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    });
  }
});
