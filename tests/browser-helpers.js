import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from './playwright-runtime.js';
export async function suite(name, port, execute) {
  const origin = 'http://127.0.0.1:' + port, results = [], errors = [], unsafe = [], resourceFailures = [];
  const server = spawn(process.execPath, ['scripts/dev-server.js'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore', windowsHide: true });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Servidor não iniciou');
    browser = await chromium.launch({ channel: process.env.APEX_BROWSER || 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if(response.status() >= 400) resourceFailures.push({path:new URL(response.url()).pathname,status:response.status()}); });
    await page.route('**/*', route => {
      const req = route.request(), url = new URL(req.url());
      if (url.origin !== origin || req.method() !== 'GET' || /admin-ajax|checkout|add-to-cart|mifunko/i.test(url.href)) {
        unsafe.push({ method: req.method(), url: url.origin, resource: req.resourceType() }); return route.abort();
      }
      return route.continue();
    });
    const run = async (title, task) => { await task(); results.push({ name: title, passed: true }); console.log('PASS ' + title); };
    const open = async (product = 'individual') => { await page.goto(origin + '/?tipo=' + product); await page.waitForSelector('html[data-apex-ready="true"]'); };
    const dismissPromo = async () => {
      const promo = page.locator('.apex-promo[open]');
      if (await promo.count()) await promo.getByRole('button', { name: 'Agora não' }).click();
    };
    const reveal = async locator => {
      await locator.first().evaluate(n => { let p=n.parentElement; while(p){if(p.matches('[data-apex-accordion]')&&!p.classList.contains('is-open'))p.querySelector(':scope > button').click();p=p.parentElement;} const section=n.closest('[data-mf-extras-section]'); if(section?.hidden)n.closest('[data-mf-card-kind="extras"]').querySelector('[data-mf-extras-tab="'+section.dataset.mfExtrasSection+'"]').click(); });
    };
    const go = async key => {
      const selectors={product:'.mf-funko-type-selector',photos:'[data-mf-face-step]',extras:'[data-mf-card-kind="extras"]',review:'.mf-product-summary'};
      const target=page.locator(selectors[key]||'#personalizar').first(); if(await target.count()){await reveal(target);await target.scrollIntoViewIfNeeded();}
    };
    const field = key => {
      const group=page.locator('[data-field="'+key+'"]:not(:disabled)');
      const locator=group.first();
      return new Proxy(locator,{get(target,method){
        if(method==='selectOption')return async value=>{
          const option=String(value), candidates=await group.evaluateAll(ns=>ns.map(n=>({tag:n.tagName,value:n.value,data:n.dataset.value})));
          if(candidates[0]?.tag==='SELECT'){await reveal(locator);return locator.selectOption(option);}
          let index=candidates.findIndex(n=>String(n.data??n.value)===option);
          if(index<0&&key==='size')index=candidates.findIndex(n=>n.value?.includes(option+'cm'));
          assert.ok(index>=0,'Opção '+option+' do campo '+key+' existe');
          const chosen=group.nth(index);await reveal(chosen);
          const isInput=await chosen.evaluate(n=>n.tagName==='INPUT');
          if(isInput)await chosen.locator('xpath=ancestor::label[1]').click();else await chosen.click();
        };
        if(['check','uncheck'].includes(method))return async()=>{await reveal(locator);if(await locator.isChecked()!==(method==='check')){const label=locator.locator('xpath=ancestor::label[1]');await label.evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));await label.click();}};
        if(['fill','setInputFiles','click'].includes(method))return async(...args)=>{await reveal(locator);return locator[method](...args);};
        return typeof target[method]==='function'?target[method].bind(target):target[method];
      }});
    };
    const inspect = () => page.evaluate(() => window.apexDevelopment.inspect());
    const total = async expected => assert.equal((await inspect()).pricing.totalCents, expected);
    const upload = async key => {
      const before = (await inspect()).uploads.length;
      await field(key).setInputFiles({ name: 'referencia.png', mimeType: 'image/png', buffer: fixture });
      await page.waitForFunction(count => window.apexDevelopment.inspect().uploads.length > count, before);
    };
    await open();
    const fixture = Buffer.from(await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = c.height = 24;
      c.getContext('2d').fillRect(0, 0, 24, 24); return c.toDataURL('image/png').split(',')[1];
    }), 'base64');
    const complete = async (product = 'individual') => {
      await open(product);
      if (product === 'pet') { await field('mf_pet_type').selectOption('cao'); await upload('mf_pet_photo[]'); }
      else {
        const n = { individual: 1, casal: 2, familia: 3 }[product];
        for (let i = 1; i <= n; i++) await upload('figure-' + i + '.mf_face_photo_upload[]');
      }
      await field('mf_shipping_date').fill(await page.locator('#needed-date').getAttribute('min'));
    };
    const review = async () => {
      await dismissPromo();
      await go('review');
      await dismissPromo();
      await page.locator('.review-button').click();
      await dismissPromo();
      await page.waitForSelector('#order-review[open]');
    };
    const generate = async () => {
      await page.getByRole('button', { name: 'Preparar pedido', exact: true }).click();
      await page.waitForSelector('#order-confirmation[open]');
      assert.equal((await page.evaluate(() => window.apexDevelopment.inspectDraft())).productionValidation, 'passed');
    };
    const extras = async () => { await go('extras'); await dismissPromo(); const toggle=page.locator('[data-mf-card-kind="extras"] > button').first(); if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click(); };
    await mkdir('test-results', { recursive: true });
    await execute({ page, run, open, field, inspect, total, upload, fixture, complete, review, generate, extras, go, origin });
    assert.deepEqual(errors, []); assert.deepEqual(unsafe, []); assert.deepEqual(resourceFailures, []);
    results.push({ name: 'Sem exceções JS, recursos externos ou chamadas transacionais', passed: true });
    await writeFile('test-results/' + (process.env.APEX_TEST_BUILD === '1' ? 'build-' : '') + name + '.json', JSON.stringify({ results, jsErrors: errors, unsafeRequests: unsafe, resourceFailures }, null, 2));
    console.log(name + ': ' + results.length + ' cenários aprovados.');
  } finally { await browser?.close(); server.kill(); }
}
