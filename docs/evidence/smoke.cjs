const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require(process.env.APEX_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..', '..');
const out = process.env.APEX_AUDIT_OUTPUT || path.join(require('os').tmpdir(), 'apex3d-smoke');
fs.mkdirSync(out, { recursive: true });
const result = { date: new Date().toISOString(), errors: [], consoleErrors: [], failed: [], blocked: [], checks: [], responses: [] };
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405); res.end('Static baseline: no backend'); return; }
  if (req.url.split('?')[0] === '/' || req.url.startsWith('/index.html')) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fs.readFileSync(path.join(root, 'index.html'))); }
  else { res.writeHead(404); res.end('Not found'); }
});
function safeUrl(url) { try { const u = new URL(url); return u.origin + u.pathname; } catch { return url.slice(0,120); } }
(async () => {
  await new Promise(resolve => server.listen(8765, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 }, serviceWorkers: 'block' });
  await context.route('**/*', async route => {
    const r = route.request(), u = new URL(r.url());
    const local = u.hostname === '127.0.0.1';
    const asset = ['script','stylesheet','image','font','media'].includes(r.resourceType()) || /\.(png|ico)$/.test(u.pathname);
    const trusted = ['mifunko.com','fonts.googleapis.com','fonts.gstatic.com','unpkg.com'].includes(u.hostname);
    if (r.method() === 'GET' && (local || (asset && trusted && !/visitor-tracking|gtm-kit|facebook|adwords|sourcebuster|order-attribution|pmw-public/i.test(u.pathname)))) return route.continue();
    result.blocked.push({ url: safeUrl(r.url()), method: r.method(), type: r.resourceType() });
    return route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  page.on('pageerror', e => result.errors.push(e.message));
  page.on('console', m => { if(m.type()==='error') result.consoleErrors.push(m.text().replace(/https?:\/\/[^\s]+/g, v=>safeUrl(v))); });
  page.on('requestfailed', r => result.failed.push({ url: safeUrl(r.url()), error: r.failure()?.errorText }));
  page.on('response', r => result.responses.push({url:safeUrl(r.url()),status:r.status(),type:r.request().resourceType()}));
  await page.goto('http://127.0.0.1:8765/', {waitUntil:'load', timeout:60000});
  await page.waitForTimeout(1600);
  await page.screenshot({path:path.join(out,'desktop.png')});
  result.initial = await page.evaluate(() => ({ title:document.title, price:document.querySelector('[data-mf-summary-price]')?.textContent, formId:document.querySelector('form.cart')?.id, initialized:!!window.mfPersonalizedJsLoaded, files:document.querySelectorAll('input[type=file]').length, images:[...document.images].filter(x=>x.getAttribute('src')&&x.complete&&!x.naturalWidth).map(x=>x.currentSrc), steps:[...document.querySelector('.mf-product-customizer-grid').children].map(x=>({class:x.className,hidden:x.hidden})) }));
  async function check(name, fn) { try { result.checks.push({name,status:'pass',detail:await fn()}); } catch(e) { result.checks.push({name,status:'fail',error:e.message.slice(0,1000)}); } }
  await check('Tipo casal e retorno individual', async()=>{await page.locator('[data-type-value="pareja"]').click(); await page.waitForTimeout(500);const couple=await page.locator('[data-mf-couple-clone-step]').count();const price=await page.locator('[data-mf-summary-price]').textContent();await page.locator('[data-type-value="individual"]').click(); if(!couple)throw Error('Clones não criados');return {couple,price};});
  await check('Tamanho 10cm e preço',async()=>{await page.locator('[data-mf-size-toggle]').click();await page.locator('label').filter({has:page.locator('[name="mf_size_option"][value="tamano_10cm"]')}).click();await page.waitForTimeout(500);const price=await page.locator('[data-mf-summary-price]').textContent();if(!price.includes('79'))throw Error(price);return {price};});
  await check('Upload sintético, editor, preview e FormData',async()=>{await page.locator('[data-mf-face-toggle]').first().click(); await page.locator('#mf-face-photo-upload').setInputFiles({name:'audit-face.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64')});await page.waitForTimeout(500); const skip=page.locator('[data-act="skip"]');const editor=await skip.count();if(editor)await skip.click(); const data=await page.evaluate(()=>{const f=document.querySelector('#mf-face-photo-upload');const fd=new FormData(document.querySelector('form.cart'));return {fileCount:f.files.length,form:f.form?.id,payload:fd.getAll(f.name).map(v=>({name:v.name,size:v.size})),thumbs:document.querySelectorAll('[data-mf-face-thumbs] img').length};}); if(data.fileCount!==1||!data.payload[0]?.size)throw Error(JSON.stringify(data));return {editor,...data};});
  await check('Validação de pedido incompleto sem envio',async()=>{await page.locator('.single_add_to_cart_button').click();await page.waitForTimeout(300);const modal=page.locator('.mf-req-modal');if(!await modal.count())throw Error('Modal ausente'); await page.screenshot({path:path.join(out,'validation.png')}); return (await modal.textContent()).replace(/\s+/g,' ').slice(0,600);});
  await page.reload({waitUntil:'load'});await page.waitForTimeout(500);
  result.afterReload=await page.evaluate(()=>({files:document.querySelector('#mf-face-photo-upload').files.length,selectedSize:document.querySelector('[name="mf_size_option"]:checked')?.value||null}));
  for(const [width,height] of [[390,844],[430,932],[768,1024],[1365,768]]){await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);result.checks.push({name:`Viewport ${width}x${height}`,status:'observed',detail:await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth}))});if(width===390)await page.screenshot({path:path.join(out,'mobile.png')});}
  await check('FAQ fecha e reabre',async()=>{const b=page.locator('[data-mf-faq-toggle]').first();await b.click();const closed=await b.getAttribute('aria-expanded');await b.click();const opened=await b.getAttribute('aria-expanded');if(closed!=='false'||opened!=='true')throw Error(JSON.stringify({closed,opened}));return {closed,opened};});
  await check('Menu de idioma abre',async()=>{const b=page.locator('[data-mf-lang-toggle]').first();await b.click();const expanded=await b.getAttribute('aria-expanded');if(expanded!=='true')throw Error('aria-expanded='+expanded+' após click');return expanded;});
  await page.keyboard.press('Escape');
  await check('Casal 15cm e caixa dupla',async()=>{await page.locator('[data-type-value="pareja"]').click();await page.locator('[data-mf-size-toggle]').click();await page.locator('label').filter({has:page.locator('[name="mf_size_option"][value="tamano_15cm"]')}).click();await page.waitForTimeout(250);await page.locator('label').filter({has:page.locator('[name="mf_box_option"][value="caja_doble"]')}).click();await page.waitForTimeout(300);const price=await page.locator('[data-mf-summary-price]').textContent();if(price!=='219€')throw Error(price);return {price};});
  await check('Casal 20cm retira caixa',async()=>{const toggle=page.locator('[data-mf-size-toggle]');if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();await page.locator('label').filter({has:page.locator('[name="mf_size_option"][value="tamano_20cm"]')}).click();await page.waitForTimeout(300);const data=await page.evaluate(()=>({price:document.querySelector('[data-mf-summary-price]').textContent,boxes:document.querySelectorAll('[name="mf_box_option"]').length}));if(data.price!=='239€'||data.boxes)throw Error(JSON.stringify(data));return data;});
  await check('Pet principal 10cm',async()=>{await page.locator('[data-type-value="mascota"]').click();await page.locator('[data-mf-pet-size-toggle]').click();const radio=page.locator('[data-mf-pet-size-option-input][data-size-label="10 cm"]');await page.locator('label').filter({has:radio}).click();await page.waitForTimeout(300);const price=await page.locator('[data-mf-summary-price]').textContent();if(price!=='79€')throw Error(price);return {price};});
  await check('Casamento base',async()=>{await page.locator('[data-type-value="boda"]').click();await page.waitForTimeout(250);const price=await page.locator('[data-mf-summary-price]').textContent();if(price!=='119€')throw Error(price);return {price};});
  fs.writeFileSync(path.join(out,'smoke-result.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({initial:result.initial,checks:result.checks,afterReload:result.afterReload,errors:result.errors,failed:result.failed.filter(x=>x.error!=='net::ERR_BLOCKED_BY_CLIENT'),blocked:result.blocked.length},null,2));
  await browser.close(); server.close();
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'smoke-result.json'),JSON.stringify(result,null,2));server.close();process.exit(1);});
