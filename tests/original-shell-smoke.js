import assert from 'node:assert/strict';
import { suite } from './browser-helpers.js';
import { originalSpecialObjects } from '../config/special-objects.js';
import { pricing } from '../config/pricing.js';
import { mkdir } from 'node:fs/promises';

await suite('original-shell-smoke', 4176, async ({ page, run, open, field, inspect, total, upload, complete, review, generate, extras }) => {
  const dir = 'test-results/original-shell/' + (process.env.APEX_TEST_BUILD === '1' ? 'build' : 'source'); await mkdir(dir, { recursive: true });
  await run('Hero original com 23 slides, 23 miniaturas e navegação por botão/teclado', async () => {
    assert.equal(await page.locator('[data-mf-product-slide]').count(), 23);
    assert.equal(await page.locator('[data-mf-product-thumb]').count(), 23);
    await page.locator('[data-mf-product-next]').click(); assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-slide'), '1');
    await page.locator('[data-mf-product-thumb="22"]').click(); assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-slide'), '22');
    await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-slide'), '0');
  });
  await run('Mini depoimentos preservam quatro slides e navegam', async () => {
    assert.equal(await page.locator('[data-mf-mini-slide]').count(), 4);
    await page.locator('[data-mf-mini-next]').click(); assert.equal(await page.locator('[data-mf-mini-slider]').getAttribute('data-apex-slide'), '1');
    assert.equal(await page.locator('.mf-review-card').count(), 4);
    assert.match(await page.locator('#opiniones').innerText(), /Ainda não há depoimento publicado/);
  });
  await run('Processo com nove cards, galeria com 22 imagens e FAQ com sete itens', async () => {
    assert.equal(await page.locator('.mf-product-how-card').count(), 9);
    assert.equal(await page.locator('#trabajos img').count(), 22);
    assert.equal(await page.locator('.mf-product-faq-item').count(), 7);
    await page.locator('.mf-product-faq-item > button').nth(4).click();
    assert.equal(await page.locator('.mf-product-faq-item > button').nth(4).getAttribute('aria-expanded'), 'true');
  });
  for (const product of ['individual','pet','casal','familia']) {
    await open(product);
    for (const size of [6,10,15,20]) await run(product + ' · tamanho ' + size + ' cm usa a tabela central', async () => {
      await field('size').selectOption(size);
      const count = {individual:1, pet:1, casal:2, familia:3}[product];
      await total(pricing.base[product] + pricing.humanSize[size] * count);
      assert.equal((await inspect()).size, size);
    });
  }
  await run('Catálogo preserva os 35 objetos originais com imagens e preço provisório', async () => {
    await complete(); await extras();
    assert.equal(Object.keys(originalSpecialObjects).length, 35);
    const values = await page.locator('[data-mf-card-kind=extras] [data-mf-special-accessory-input]').evaluateAll(ns=>ns.map(n=>n.value));
    for (const id of Object.keys(originalSpecialObjects)) assert.ok(values.includes(id), id);
    await page.locator('[data-mf-accessories-more]').first().click();
    await page.locator('[data-mf-card-kind=extras] label').filter({has:page.locator('input[value="guitarra-8"]')}).click();
    await total(11500);
    await upload('figure-1.mf_special_accessory_extra_photo_guitarra-8');
    await review(); assert.match(await page.locator('#review-content').innerText(), /Guitarra/);
    await page.keyboard.press('Escape');
    await page.locator('[data-mf-card-kind=extras] label').filter({has:page.locator('input[value="guitarra-8"]')}).click();
    assert.equal((await inspect()).uploads.length, 1); await total(10000);
  });
  await run('Caixa e dedicatória mantêm foto própria e limpam anexo ao desativar', async () => {
    await field('mf_box_option').selectOption('caja_personalizada'); await field('mf_box_character_name').fill('Criação de teste');
    await field('mf_box_dedication_enabled').check(); await upload('mf_box_dedication_image');
    await review(); assert.equal(await page.locator('#review-content img').count(), 2); await page.keyboard.press('Escape');
    await field('mf_box_option').selectOption('caja_standard'); assert.equal((await inspect()).uploads.length, 1);
  });
  await run('Flexibilidade de data chega à revisão e ao rascunho sem custo de urgência', async () => {
    await field('mf_shipping_flexible').check(); await review();
    assert.match(await page.locator('#review-content').innerText(), /Data flexível\s+Sim/); await total(10000); await generate();
    await page.locator('#close-confirmation').click();
  });
  await run('Minis, caneca, caixa dupla e prazos não homologados ficam indisponíveis', async () => {
    assert.equal(await page.locator('[data-mf-mini-step] input:enabled').count(), 0);
    assert.equal(await page.locator('[data-mf-gift-upsell-open]').isDisabled(), true);
    assert.equal(await page.locator('input[value=caja_doble]').isDisabled(), true);
    assert.equal(await page.locator('input[name=mf_shipping_option]:enabled').count(), 1);
  });
  await run('Drawer original revisa e descarta apenas a criação local', async () => {
    await page.locator('.mf-header__action--cart').click();
    await page.locator('[data-mf-cart-drawer].is-visible').waitFor({state:'visible'});
    assert.match(await page.locator('[data-mf-cart-drawer]').innerText(), /Pedido de teste gerado/);
    await page.getByRole('button',{name:'Descartar criação desta sessão',exact:true}).click();
    assert.equal((await inspect()).uploads.length,0); assert.equal(await page.evaluate(()=>window.apexDevelopment.inspectDraft()),null);
  });
  for (const width of [360,390,430,768,1024,1440]) {
    await page.setViewportSize({width,height:1000});
    for (const product of ['individual','pet','casal','familia']) await run('Sem overflow com todos os painéis abertos · '+product+' · '+width+'px', async () => {
      await open(product);
      await page.locator('[data-apex-ready]').waitFor();
      await page.evaluate(()=>document.querySelectorAll('[data-apex-accordion] > button[aria-expanded=false]').forEach(n=>n.click()));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
      assert.ok(await page.evaluate(()=>!['hidden','clip'].includes(getComputedStyle(document.documentElement).overflowX)&&!['hidden','clip'].includes(getComputedStyle(document.body).overflowX)));
    });
    if([390,1440].includes(width)) {
      await open(); await page.evaluate(()=>document.querySelectorAll('img').forEach(n=>n.loading='eager'));
      await page.waitForFunction(()=>[...document.images].every(n=>n.complete));
      await page.screenshot({path:dir+'/full-'+width+'.png',fullPage:true});
      const sections={hero:'.mf-product-hero',products:'.mf-funko-type-selector',process:'#como-lo-hacemos',gallery:'#trabajos',configurator:'#personalizar',size:'[data-mf-size-step]',extras:'[data-mf-card-kind=extras]',delivery:'.mf-product-delivery',testimonials:'#opiniones',faq:'#faqs'};
      for(const [key,selector] of Object.entries(sections)) {
        const region=page.locator(selector).first();
        const toggle=region.locator(':scope > button[aria-expanded=false]'); if(await toggle.count())await toggle.click();
        await region.scrollIntoViewIfNeeded(); await region.screenshot({path:dir+'/'+key+'-'+width+'.png'});
      }
      if(width===390){await page.locator('.mf-product-delivery').scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/sticky-390.png'});}
    }
  }
  await run('Fotos originais e variantes locais carregam sem imagens quebradas', async () => {
    await page.evaluate(()=>document.querySelectorAll('img').forEach(n=>n.loading='eager'));
    await page.waitForFunction(()=>[...document.images].every(n=>n.complete));
    assert.deepEqual(await page.evaluate(()=>[...document.images].filter(n=>!n.naturalWidth).map(n=>n.getAttribute('src'))),[]);
  });
  await run('Galeria mobile, menu e ampliação continuam operacionais', async () => {
    await page.setViewportSize({width:390,height:844});await open();
    await page.locator('[data-mf-product-next]').click();
    await page.waitForFunction(()=>document.querySelector('.mf-product-gallery__slides').scrollLeft>0);
    await page.locator('[data-mf-header-toggle]').click();assert.equal(await page.locator('[data-mf-mobile-menu]').isVisible(),true);
    await page.keyboard.press('Escape');
    await page.locator('#trabajos img').first().click();await page.locator('#gallery-lightbox[open]').waitFor();await page.keyboard.press('Escape');
  });
});
