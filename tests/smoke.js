import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.APEX_PLAYWRIGHT_PATH ? pathToFileURL(process.env.APEX_PLAYWRIGHT_PATH).href : 'playwright');
const port = 4174;
const server = spawn(process.execPath, ['scripts/dev-server.js'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore', windowsHide: true });
let browser;
const results = [];
const origin = `http://127.0.0.1:${port}`;
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(origin)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ channel: process.env.APEX_BROWSER || 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Imagem sintética minúscula, sem arquivo pessoal ou referência externa.
  const fixture = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    canvas.getContext('2d').fillRect(0, 0, 1, 1); return canvas.toDataURL('image/png').split(',')[1];
  }), 'base64');
  page.setDefaultTimeout(10000);
  const errors = [], unsafe = [];
  page.on('pageerror', error => errors.push(error.message));
  // Intercepta antes da rede: uma regressão de segurança deve falhar sem enviar dados.
  await page.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() !== 'GET' || (request.resourceType() === 'script' && url.origin !== origin) || /add-to-cart|admin-ajax|checkout|finalizar-compra/.test(url.href)) {
      unsafe.push({ method: request.method(), resource: request.resourceType() }); return route.abort();
    }
    return route.continue();
  });
  async function run(name, task) { await task(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  const price = () => page.locator('[data-mf-summary-price]').textContent();
  const select = async (name, value) => {
    const input = page.locator(`[name="${name}"][value="${value}"]`);
    await input.locator('xpath=..').click(); assert.equal(await input.isChecked(), true);
  };
  const open = async selector => { const toggle = page.locator(selector); if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click(); };
  const inspect = () => page.evaluate(() => window.apexDevelopment.inspect());
  await run('carrega entrada local sem JavaScript externo', async () => {
    await page.goto(origin); await page.waitForSelector('html[data-apex-ready="true"]');
    assert.match(await price(), /59,00/);
    assert.equal(await page.locator('script[src^="https:"]').count(), 0);
    assert.equal((await fetch(`${origin}/legacy-template`)).headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.equal((await fetch(`${origin}/.git/config`)).status, 404);
  });
  await run('produto e tamanho com preços observados', async () => {
    await select('mf_size_option', 'tamano_10cm'); assert.match(await price(), /79,00/);
    await page.locator('[data-type-value="pareja"]').click();
    await select('mf_size_option', 'tamano_15cm'); await select('mf_box_option', 'caja_doble'); assert.match(await price(), /219,00/);
    await select('mf_size_option', 'tamano_20cm'); assert.match(await price(), /239,00/);
    await page.locator('[data-type-value="mascota"]').click(); await open('[data-mf-pet-size-toggle]');
    await select('mf_pet_size_option', '10-cm'); assert.match(await price(), /79,00/);
    await page.locator('[data-type-value="boda"]').click(); assert.match(await price(), /119,00/);
  });
  await run('segunda figura mantém preço independente e campos próprios', async () => {
    await open('[data-apex-figure="1"] [data-mf-face-toggle]');
    await select('mf_partner_2_eyes_option', 'ojos_verdes'); assert.match(await price(), /124,00/);
    assert.equal(await page.locator('[name="mf_eyes_option"][value="ojos_standard"]').isChecked(), true);
  });
  await run('adiciona imagens homônimas, gera preview e remove por ID', async () => {
    await page.locator('[data-type-value="individual"]').click(); await open('[data-mf-face-toggle]');
    const payload = { name: 'referencia.png', mimeType: 'image/png', buffer: fixture };
    await page.locator('#mf-face-photo-upload').setInputFiles([payload, payload]);
    await page.waitForFunction(() => window.apexDevelopment.inspect().uploads.length === 2);
    assert.equal(await page.locator('.apex-upload-list img').count(), 2);
    assert.equal(await page.locator('.apex-upload-list img').first().evaluate(img => img.complete && img.naturalWidth > 0), true);
    await page.locator('[data-apex-remove-upload]').first().click(); assert.equal((await inspect()).uploads.length, 1);
    await page.locator('[data-apex-remove-upload]').first().click(); assert.equal((await inspect()).uploads.length, 0);
  });
  await run('limite real de 10 MB e rejeição de MIME e conteúdo inválidos', async () => {
    const input = page.locator('#mf-face-photo-upload'); const error = page.locator('.apex-upload-error:visible');
    await input.setInputFiles({ name: 'excede.png', mimeType: 'image/png', buffer: Buffer.alloc(10_000_001) });
    await error.filter({ hasText: '10 MB' }).waitFor();
    await input.setInputFiles({ name: 'arquivo.txt', mimeType: 'text/plain', buffer: Buffer.from('fixture') });
    await error.filter({ hasText: 'Tipo inválido' }).waitFor();
    await input.setInputFiles({ name: 'falso.png', mimeType: 'image/png', buffer: Buffer.from('fixture') });
    await error.filter({ hasText: 'conteúdo' }).waitFor();
    assert.equal((await inspect()).uploads.length, 0);
  });
  await run('foto da caneca pertence somente ao item de upsell', async () => {
    await page.locator('[data-mf-gift-upsell-open]').click(); await select('mf_gift_upsell_image_source', 'upload');
    await page.locator('[data-mf-gift-upsell-modal-submit]').click();
    assert.equal(await page.locator('[data-mf-gift-upsell-modal-error]').isVisible(), true);
    await page.locator('.mf-gift-upsell-modal__upload-input').setInputFiles({ name: 'caneca.png', mimeType: 'image/png', buffer: fixture });
    await page.locator('[data-mf-gift-upsell-modal] .apex-upload-list img').waitFor();
    await page.locator('[data-mf-gift-upsell-modal-submit]').click();
    const order = await inspect();
    assert.equal(order.items[1].id, 'gift-1'); assert.equal(order.uploads[0].owner.itemId, 'gift-1');
    assert.deepEqual(order.items[1].uploadIds, [order.uploads[0].id]); assert.deepEqual(order.items[0].uploadIds, []);
  });
  await run('configuração incompleta não gera rascunho no MVP', async () => {
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-validation-errors').waitFor();
    assert.equal(await page.locator('#apex-order-preview').isVisible(), false);
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
  });
  await run('troca de produto limpa anexos e opções anteriores', async () => {
    await page.locator('[data-type-value="pareja"]').click(); const order = await inspect();
    assert.equal(order.uploads.length, 0); assert.equal(order.items.length, 1); assert.equal(order.pricing.totalCents, 10900);
  });
  await run('acessórios, minis e pets adicionais usam a tabela central', async () => {
    await page.locator('[data-type-value="individual"]').click();
    await open('[data-mf-option-toggle]'); await page.locator('[data-mf-accessories-quantity-option="2"]').click();
    assert.equal(await page.locator('[name="mf_accessory_upload_1"]').count(), 1); assert.match(await price(), /69,00/);
    await open('[data-mf-mini-toggle]'); await select('mf_mini_option', '3-unidades'); await select('mf_mini_size_option', 'mini_size_6cm');
    assert.match(await price(), /215,00/);
    await open('[data-mf-pets-toggle]'); await select('mf_pets_option', 'tres_mascotas'); assert.match(await price(), /295,00/);
    await page.locator('[data-type-value="pareja"]').click();
  });
  await run('galeria, menu mobile e FAQ locais', async () => {
    const before = await page.locator('[data-mf-product-thumb].is-active').getAttribute('data-mf-product-thumb');
    await page.locator('[data-mf-product-next]').click();
    assert.notEqual(await page.locator('[data-mf-product-thumb].is-active').getAttribute('data-mf-product-thumb'), before);
    await page.setViewportSize({ width: 390, height: 844 }); await page.locator('[data-mf-header-toggle]').click();
    await page.locator('[data-mf-mobile-menu]').waitFor({ state: 'visible' });
    await page.locator('[data-mf-header-toggle]').click();
    await page.locator('[data-mf-faq-toggle]').nth(1).click(); await page.locator('[data-mf-faq-body]').nth(1).waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  });
  await mkdir('test-results', { recursive: true });
  await page.evaluate(() => window.scrollTo(0,0)); await page.screenshot({ path: 'test-results/mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: 'test-results/desktop.png' });
  await run('lógica local funciona com recursos externos bloqueados', async () => {
    const offline = await browser.newPage();
    await offline.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await offline.goto(origin); await offline.waitForSelector('html[data-apex-ready="true"]');
    assert.match(await offline.locator('[data-mf-summary-price]').textContent(), /59,00/);
    await offline.locator('[name="mf_size_option"][value="tamano_10cm"]').locator('xpath=..').click();
    assert.equal(await offline.evaluate(() => window.apexDevelopment.inspect().pricing.totalCents), 7900);
    await offline.close();
  });
  assert.deepEqual(errors, []); assert.deepEqual(unsafe, []);
  await writeFile('test-results/smoke.json', JSON.stringify({ tests: results, javascriptErrors: errors.length, unsafeRequests: unsafe.length }, null, 2));
  console.log(`${results.length} cenários aprovados; zero exceções JS e zero tentativas transacionais.`);
} finally { await browser?.close(); server.kill(); }
