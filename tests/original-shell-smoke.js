import assert from 'node:assert/strict';
import { suite } from './browser-helpers.js';
import { originalSpecialObjects } from '../config/special-objects.js';
import { pricing } from '../config/pricing.js';
import { mkdir } from 'node:fs/promises';

await suite('original-shell-smoke', 4176, async ({ page, run, open, field, inspect, total, upload, complete, review, generate, extras }) => {
  const dir = 'test-results/original-shell/' + (process.env.APEX_TEST_BUILD === '1' ? 'build' : 'source'); await mkdir(dir, { recursive: true });
  await run('Hero curado com seis histórias, autoplay e navegação acessível', async () => {
    assert.equal(await page.locator('[data-mf-product-slide]').count(), 6);
    assert.equal(await page.locator('[data-mf-product-thumb]').count(), 6);
    assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-autoplay'), '3000');
    await page.locator('[data-mf-product-next]').click(); assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-slide'), '1');
    await page.locator('[data-mf-product-thumb="5"]').click(); assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-slide'), '5');
    await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('.mf-product-gallery').getAttribute('data-apex-slide'), '0');
  });
  await run('Prova não usa depoimentos, estrelas ou números simulados', async () => {
    assert.equal(await page.locator('[data-mf-mini-slide], .mf-review-card').count(), 0);
    assert.match(await page.locator('#opiniones').innerText(), /Por que criar com a Apex3D/i);
    assert.doesNotMatch(await page.locator('#opiniones').innerText(), /STAGING|Avaliação futura|★|☆/i);
  });
  await run('Hero, marca, marquee e progresso entregam a primeira dobra comercial', async () => {
    await page.setViewportSize({width:390,height:844}); await open();
    assert.match(await page.locator('.apex-hero-brand').innerText(), /APEX3D\s+PERSONALIZADOS\s+Sua história em miniatura/i);
    assert.equal(await page.locator('.apex-marquee').count(), 1); assert.equal(await page.locator('.apex-progress li').count(), 7);
    assert.equal(await page.locator('.custom-logo').first().getAttribute('src'), '/assets/brand/apex-logo.png');
    const media = await page.locator('.mf-product-hero__media').boundingBox(), summary = await page.locator('.mf-product-hero__summary').boundingBox();
    assert.ok(media.y < summary.y, 'O carrossel precisa vir antes do texto do hero');
    assert.equal(await page.locator('.apex-progress').evaluate(n=>getComputedStyle(n).position), 'sticky');
    await page.setViewportSize({width:1440,height:1000});
  });
  await run('Indicador percorre as sete posições reais sem pular o passo 3', async () => {
    await page.setViewportSize({width:390,height:844}); await open();
    const steps = ['inicio','tipo','tamanho','detalhes','extras','entrega','pedido'];
    for (let index = 0; index < steps.length; index++) {
      await page.locator('#' + steps[index]).evaluate(node => node.scrollIntoView({block:'start'}));
      await page.waitForTimeout(120);
      assert.equal(await page.locator('.apex-progress').getAttribute('data-step'), `${index + 1}/7`, steps[index]);
    }
    await page.setViewportSize({width:1440,height:1000});
  });
  await run('Mobile mantém alvos principais de 44 px e CLS dentro da meta', async () => {
    await page.addInitScript(() => {
      window.__apexCls = 0;
      new PerformanceObserver(list => list.getEntries().forEach(entry => { if (!entry.hadRecentInput) window.__apexCls += entry.value; })).observe({ type: 'layout-shift', buffered: true });
    });
    await page.setViewportSize({width:390,height:844}); await open(); await page.waitForTimeout(3200);
    const small = await page.locator('.mf-header button, .apex-hero-actions a, [data-mf-product-prev], [data-mf-product-next], [data-product], .apex-progress a, [data-apex-progress-review], .apex-assistant-toggle, .mf-product-faq-item > button').evaluateAll(nodes => nodes.filter(node => {
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && !node.disabled && (rect.width < 44 || rect.height < 44);
    }).map(node => ({ label: node.getAttribute('aria-label') || node.textContent.trim().slice(0, 40), rect: node.getBoundingClientRect().toJSON() })));
    assert.deepEqual(small, []);
    assert.ok(await page.evaluate(() => window.__apexCls <= .10), 'CLS excedeu 0,10');
    await page.setViewportSize({width:1440,height:1000});
  });
  await run('Troca completa de produtos mantém UI, URL, estado e preço sincronizados', async () => {
    await open('individual');
    for (const product of ['casal','familia','pet','individual']) {
      await page.locator(`[data-product="${product}"]`).click();
      const state = await inspect(); assert.equal(state.product, product); assert.equal(state.pricing.totalCents, pricing.productSize[6][product]);
      assert.equal(await page.locator(`[data-product="${product}"]`).getAttribute('aria-pressed'), 'true'); assert.match(page.url(), new RegExp(`tipo=${product}`));
    }
  });
  await run('WhatsApp oficial recebe template e contexto sem dados sensíveis', async () => {
    await open('casal');
    const href = await page.locator('[data-placement=hero]').getAttribute('href'); const url = new URL(href);
    assert.equal(url.pathname, '/5521923679482'); assert.match(url.searchParams.get('text'), /Vi as miniaturas|casal|6 cm|R\$\s*189,90/);
    assert.doesNotMatch(url.searchParams.get('text'), /blob:|observa/i);
    assert.match(await page.locator('.mf-footer__logo-link').innerText(), /\(21\) 92367-9482/);
  });
  await run('Copy comercial visível não expõe linguagem interna ou prova simulada', async () => {
    await open(); await page.evaluate(()=>document.querySelectorAll('[data-apex-accordion] > button[aria-expanded=false]').forEach(button=>button.click()));
    assert.doesNotMatch(await page.locator('body').innerText(), /staging|homologa|provisóri|indisponível|em definição|pedido de teste|avaliação futura/i);
  });
  await run('Processo com nove cards, galeria com 22 imagens e FAQ com sete itens', async () => {
    await open();
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
      await total(pricing.productSize[size][product]);
      assert.equal((await inspect()).size, size);
    });
  }
  await run('Catálogo preserva os 35 objetos originais pelo preço homologado', async () => {
    await complete(); await extras();
    assert.equal(Object.keys(originalSpecialObjects).length, 35);
    const values = await page.locator('[data-mf-card-kind=extras] [data-mf-special-accessory-input]').evaluateAll(ns=>ns.map(n=>n.value));
    for (const id of Object.keys(originalSpecialObjects)) assert.ok(values.includes(id), id);
    await page.locator('[data-mf-accessories-more]').first().click();
    await page.locator('[data-mf-card-kind=extras] label').filter({has:page.locator('input[value="guitarra-8"]')}).click();
    await total(13980);
    await upload('figure-1.mf_special_accessory_extra_photo_guitarra-8');
    await review(); assert.match(await page.locator('#review-content').innerText(), /Guitarra/);
    await page.keyboard.press('Escape');
    await page.locator('[data-mf-card-kind=extras] label').filter({has:page.locator('input[value="guitarra-8"]')}).click();
    assert.equal((await inspect()).uploads.length, 1); await total(9990);
  });
  await run('Caixa e dedicatória mantêm foto própria e limpam anexo ao desativar', async () => {
    await field('mf_box_option').selectOption('caja_personalizada'); await field('mf_box_character_name').fill('Criação de teste');
    await field('mf_box_dedication_enabled').check(); await upload('mf_box_dedication_image');
    await review(); assert.equal(await page.locator('#review-content img').count(), 2); await page.keyboard.press('Escape');
    await field('mf_box_option').selectOption('caja_standard'); assert.equal((await inspect()).uploads.length, 1);
  });
  await run('Flexibilidade de data chega à revisão e ao rascunho sem custo de urgência', async () => {
    assert.equal(await page.getByLabel('Algum comentário adicional sobre o seu pedido?').count(), 1);
    await field('mf_shipping_flexible').check(); await review();
    assert.match(await page.locator('#review-content').innerText(), /Data flexível\s+Sim/); await total(9990); await generate();
    await page.locator('#close-confirmation').click();
  });
  await run('Caneca, minis e modalidades sem SLA não aparecem no MVP', async () => {
    assert.equal(await page.locator('[data-mf-mini-step], [data-mf-gift-upsell-open], [data-original-region=gift]').count(), 0);
    assert.equal(await page.locator('input[value=caja_doble]').count(), 0);
    assert.equal(await page.locator('input[name=mf_shipping_option]').count(), 0);
  });
  await run('Drawer original revisa e descarta apenas a criação local', async () => {
    await page.locator('.mf-header__action--cart').click();
    await page.locator('[data-mf-cart-drawer].is-visible').waitFor({state:'visible'});
    assert.match(await page.locator('[data-mf-cart-drawer]').innerText(), /Resumo preparado/);
    await page.getByRole('button',{name:'Descartar criação desta sessão',exact:true}).click();
    assert.equal((await inspect()).uploads.length,0); assert.equal(await page.evaluate(()=>window.apexDevelopment.inspectDraft()),null);
  });
  for (const width of [360,375,390,430,768,1024,1440]) {
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
      const consent = page.locator('.apex-consent'); if (await consent.count()) await consent.getByRole('button',{name:'Rejeitar não essenciais'}).click();
      await page.waitForFunction(()=>[...document.images].every(n=>n.complete));
      await page.screenshot({path:dir+'/full-'+width+'.png',fullPage:true});
      const sections={hero:'.mf-product-hero',progress:'.apex-progress',products:'.mf-funko-type-selector',process:'#como-lo-hacemos',gallery:'#trabajos',configurator:'#personalizar',size:'[data-mf-size-step]',outfit:'[data-mf-outfit-step]',extras:'[data-mf-card-kind=extras]',delivery:'.mf-product-delivery',trust:'#opiniones',faq:'#faqs'};
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
  await run('FIRST10 abre por rolagem, aplica uma vez e atualiza o total', async () => {
    await page.evaluate(() => localStorage.removeItem('apex:first10:v1')); await open();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .5));
    await page.locator('.apex-promo[open]').waitFor(); await page.setViewportSize({width:390,height:844}); await page.screenshot({path:dir+'/promo-390.png'}); await page.getByRole('button',{name:'Quero meu desconto',exact:true}).click();
    const first = await inspect(); assert.equal(first.pricing.subtotalCents,9990); assert.equal(first.pricing.discountCents,999); assert.equal(first.pricing.totalCents,8991);
    await page.evaluate(() => document.dispatchEvent(new Event('apex:claim-promo'))); assert.equal((await inspect()).pricing.totalCents,8991);
    assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('apex:first10:v1')).claimed)),true);
  });
  await run('Assistente local abre sem colisão e encaminha ao WhatsApp', async () => {
    await open(); await page.setViewportSize({width:390,height:844}); await page.locator('.apex-assistant-toggle').click();
    await page.getByRole('button',{name:'Qual tamanho escolher?',exact:true}).click(); assert.match(await page.locator('.apex-assistant-answer').innerText(),/6, 10, 15 e 20 cm/);
    await page.screenshot({path:dir+'/assistant-390.png'}); assert.equal(await page.locator('.apex-assistant-panel [data-apex-whatsapp]').getAttribute('target'),'_blank');
  });
  await run('Consentimento expõe categorias e tracking placeholder segue sem requests', async () => {
    await page.evaluate(() => localStorage.removeItem('apex:consent:v1')); await page.reload(); await page.locator('html[data-apex-ready=true]').waitFor();
    const banner = page.locator('.apex-consent'); await banner.getByRole('button',{name:'Configurar'}).click(); assert.equal(await banner.locator('form').isVisible(),true);
    assert.match(await banner.innerText(),/Usamos cookies para melhorar sua experiência e medir nossas campanhas|Necessários|Analytics|Publicidade/);
    await banner.getByRole('button',{name:'Rejeitar não essenciais'}).click(); assert.equal(await page.evaluate(()=>localStorage.getItem('apex:consent:v1')),'rejected');
    assert.equal(await page.evaluate(()=>window.apexAnalytics.configured()),false);
    assert.equal((await page.evaluate(()=>window.apexAnalytics.inspect().some(event=>event.name==='purchase'))),false);
  });
});
