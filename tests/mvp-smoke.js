import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.APEX_PLAYWRIGHT_PATH ? pathToFileURL(process.env.APEX_PLAYWRIGHT_PATH).href : 'playwright');
const origin = 'http://127.0.0.1:4175';
const server = spawn(process.execPath, ['scripts/dev-server.js'], { env: { ...process.env, PORT: '4175' }, stdio: 'ignore', windowsHide: true });
let browser;
const errors = [], unsafe = [], results = [];
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(origin)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ channel: process.env.APEX_BROWSER || 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); page.setDefaultTimeout(12000);
  page.on('pageerror', error => errors.push(error.message));
  const png = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 2;
    canvas.getContext('2d').fillRect(0, 0, 2, 2); return canvas.toDataURL().split(',')[1];
  }), 'base64');
  const payload = { name: 'referencia-sintetica.png', mimeType: 'image/png', buffer: png };
  const guard = async (route, offline = false) => {
    const req = route.request(), url = new URL(req.url());
    if (req.method() !== 'GET' || (req.resourceType() === 'script' && url.origin !== origin) || /add-to-cart|admin-ajax|checkout|finalizar-compra/.test(url.href)) {
      unsafe.push({ method: req.method(), type: req.resourceType() }); return route.abort();
    }
    return offline && url.origin !== origin ? route.abort() : route.continue();
  };
  await page.route('**/*', route => guard(route));
  async function run(name, task) { await task(); results.push({ name, passed: true }); console.log(`PASS MVP ${name}`); }
  const open = async (page, selector) => { const el = page.locator(selector); if (await el.getAttribute('aria-expanded') !== 'true') await el.click(); };
  const select = async (page, name, value) => { const input = page.locator(`[name="${name}"][value="${value}"]`); await input.locator('xpath=..').click(); assert.equal(await input.isChecked(), true); };
  const chooseDate = async (page, offset = 30) => {
    const date = await page.evaluate(offset => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }, offset);
    await page.locator('[data-mf-shipping-date]').fill(date); return date;
  };
  const fillHuman = async (page, i = 1) => {
    const prefix = i === 1 ? 'mf_' : 'mf_partner_2_';
    await open(page, `[data-apex-figure="${i - 1}"] [data-mf-face-toggle]`);
    await select(page, `${prefix}face_option`, 'negro');
    await page.locator(`[name="${prefix}face_photo_upload[]"]`).setInputFiles(payload);
    await page.waitForFunction(i => window.apexDevelopment.inspect().uploads.some(u => u.owner.field === `figure-${i}.mf_face_photo_upload[]`), i);
    await open(page, `[data-apex-figure="${i - 1}"] [data-mf-skin-toggle]`);
    await select(page, `${prefix}skin_tones_option`, 'estandard');
    await open(page, `[data-apex-figure="${i - 1}"] [data-mf-outfit-toggle]`);
    await page.locator(`[name="${prefix}outfit_detail_text"]`).fill('Camiseta lisa e calça azul');
  };
  await run('pedido inválido bloqueado com erros e navegação para o campo', async () => {
    await page.goto(origin); await page.waitForSelector('html[data-apex-ready]');
    assert.equal(await page.locator('[data-mf-cart-drawer],[data-mf-open-cart-drawer]').count(), 0);
    await page.locator('.single_add_to_cart_button').click();
    await page.locator('[data-error-code="PHOTO_REQUIRED"]').first().waitFor();
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
    await page.locator('[data-error-code="HAIR_REQUIRED"]').click();
    assert.equal(await page.locator('[data-mf-face-body]').isVisible(), true);
  });
  await run('configuração válida, preço e data necessária sem reajuste automático', async () => {
    await fillHuman(page); const before = await page.evaluate(() => window.apexDevelopment.inspect().pricing.totalCents);
    await chooseDate(page, -1); assert.equal(await page.locator('#apex-date-error').isVisible(), true);
    await page.locator('.single_add_to_cart_button').click(); await page.locator('[data-error-code="DATE_PAST"]').waitFor();
    const date = await chooseDate(page, 0);
    assert.match(await page.locator('[data-apex-date-summary]').textContent(), new RegExp(date.split('-').reverse().join('/')));
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspect().pricing.totalCents), before);
    assert.equal(await page.evaluate(() => window.apexDevelopment.validate().valid), true);
  });
  await run('revisão clara antes de gerar, confirmação e inspeção segura', async () => {
    await page.locator('[name="mf_instructions_text"]').fill('Observação sintética do teste');
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-order-review[open]').waitFor();
    const text = await page.locator('#apex-order-review').innerText();
    assert.match(text, /Camiseta lisa/); assert.match(text, /Observação sintética/); assert.match(text, /Fotos anexadas/);
    assert.doesNotMatch(text, /mf_|figure-1|schemaVersion/);
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
    await page.locator('[data-apex-generate]').click(); await page.locator('#apex-order-preview[open]').waitFor();
    const draft = await page.evaluate(() => window.apexDevelopment.inspectDraft());
    assert.equal(draft.productionValidation, 'passed'); assert.equal(draft.pricing.totalCents, 5900);
    assert.doesNotMatch(JSON.stringify(draft), /Observação sintética|referencia-sintetica|base64|previewUrl/);
    await page.locator('#apex-order-preview button').click();
  });
  await run('alteração invalida o rascunho e exige nova revisão', async () => {
    await page.locator('[name="mf_instructions_text"]').fill('Nova observação');
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-order-review[open]').waitFor();
    // Simula alteração assíncrona após a revisão: o botão não pode gerar conteúdo não revisado.
    await page.evaluate(() => { const input = document.querySelector('[name="mf_instructions_text"]'); input.value = 'Alterado após revisão'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.locator('[data-apex-generate]').click(); await page.locator('[data-error-code="REVIEW_STALE"]').waitFor();
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
  });
  await run('arquivo inválido é rejeitado e pode ser descartado sem travar o fluxo', async () => {
    await open(page, '[data-mf-face-toggle]');
    await page.locator('#mf-face-photo-upload').setInputFiles({ name: 'falso.png', mimeType: 'image/png', buffer: Buffer.from('texto') });
    await page.locator('[data-apex-discard-upload-error]').waitFor();
    await page.locator('.single_add_to_cart_button').click(); await page.locator('[data-error-code="UPLOAD_INVALID"]').waitFor();
    await page.locator('[data-apex-discard-upload-error]').click();
    assert.equal(await page.evaluate(() => window.apexDevelopment.validate().valid), true);
  });
  await run('caneca com foto própria no rascunho validado', async () => {
    await page.locator('[data-mf-gift-upsell-open]').click(); await select(page, 'mf_gift_upsell_image_source', 'upload');
    await page.locator('[data-mf-gift-upsell-modal-submit]').click(); await page.locator('[data-mf-gift-upsell-modal-error]').waitFor();
    await page.locator('.mf-gift-upsell-modal__upload-input').setInputFiles(payload);
    await page.locator('[data-mf-gift-upsell-modal] .apex-upload-list img').waitFor();
    await page.locator('[data-mf-gift-upsell-modal-submit]').click();
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-order-review[open]').waitFor();
    await page.locator('[data-apex-generate]').click();
    const draft = await page.evaluate(() => window.apexDevelopment.inspectDraft());
    assert.equal(draft.items.length, 2); assert.equal(draft.pricing.totalCents, 7900);
    assert.equal(draft.uploads.find(u => u.id === draft.items[1].uploadIds[0]).owner.itemId, 'gift-1');
    await page.locator('#apex-order-preview button').click(); await page.locator('[data-apex-remove-gift]').click();
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspect().items.length), 1);
  });
  await run('casal com fotos separadas e revisão responsiva', async () => {
    await page.locator('[data-type-value="pareja"]').click(); await fillHuman(page, 1);
    const before = await page.evaluate(() => window.apexDevelopment.validate());
    assert.ok(before.errors.some(e => e.field === 'figure-2.mf_face_photo_upload[]'));
    await fillHuman(page, 2); await chooseDate(page);
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-order-review[open]').waitFor();
    await mkdir('test-results', { recursive: true });
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(await page.locator('#apex-order-review').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
      await page.screenshot({ path: `test-results/mvp-review-${width}.png` });
    }
    await page.locator('[data-apex-generate]').click(); assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft().items[0].uploadIds.length), 2);
    await page.locator('#apex-order-preview button').click();
  });
  await run('pet principal: espécie, raça livre e foto obrigatória', async () => {
    await page.locator('[data-type-value="mascota"]').click();
    await select(page, 'mf_pet_type', 'cao'); await page.locator('[name="mf_pet_breed"]').fill('Raça de teste');
    await page.locator('[name="mf_pet_photo[]"]').setInputFiles(payload);
    await page.waitForFunction(() => window.apexDevelopment.inspect().uploads.length === 1); await chooseDate(page);
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-order-review[open]').waitFor();
    assert.match(await page.locator('#apex-order-review').innerText(), /Raça de teste/);
    await page.locator('[data-apex-generate]').click(); assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft().productionValidation), 'passed');
  });
  await run('pedido válido completo com toda a rede externa bloqueada', async () => {
    const offline = await browser.newPage({ viewport: { width: 390, height: 844 } }); offline.on('pageerror', error => errors.push(error.message));
    await offline.route('**/*', route => guard(route, true));
    await offline.goto(origin); await offline.waitForSelector('html[data-apex-ready]');
    await fillHuman(offline); await chooseDate(offline);
    await offline.locator('.single_add_to_cart_button').click(); await offline.locator('#apex-order-review[open]').waitFor();
    await offline.locator('[data-apex-generate]').click(); assert.equal(await offline.evaluate(() => window.apexDevelopment.inspectDraft().productionValidation), 'passed');
    await offline.close();
  });
  await run('adicionais completos: acessório, mini, animal e caixa personalizada', async () => {
    await page.locator('#apex-order-preview button').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-type-value="individual"]').click(); await fillHuman(page);
    await open(page, '[data-mf-option-toggle]'); await page.locator('[data-mf-accessories-quantity-option="1"]').click();
    await page.locator('[name="mf_accessory_detail_1"]').fill('Livro azul');
    await open(page, '[data-mf-mini-toggle]'); await select(page, 'mf_mini_option', '1-unidade');
    await page.locator('[name="mf_mini_unit_detail_1"]').fill('Mini com roupa igual à referência');
    await page.locator('[name="mf_mini_unit_upload_1"]').setInputFiles(payload);
    await open(page, '[data-mf-pets-toggle]'); await select(page, 'mf_pets_option', 'una_mascota');
    await page.locator('[data-mf-pets-group="1"] [data-pet-type="Cão"]').click();
    await page.locator('[name="mf_pet_1_breed"]').fill('Raça livre');
    await page.locator('[name="mf_pet_1_photo[]"]').setInputFiles(payload);
    await page.waitForFunction(() => window.apexDevelopment.inspect().uploads.length === 3);
    await select(page, 'mf_box_option', 'caja_personalizada');
    await page.locator('[name="mf_box_character_name"]').fill('Personagem');
    await page.locator('[name="mf_box_collection_name"]').fill('Coleção');
    await page.locator('[name="mf_box_number"]').fill('12');
    await page.locator('[name="mf_box_color_custom"]').fill('#00aaff');
    await chooseDate(page);
    assert.equal(await page.evaluate(() => window.apexDevelopment.validate().valid), true, JSON.stringify(await page.evaluate(() => window.apexDevelopment.validate())));
    await page.locator('.single_add_to_cart_button').click(); await page.locator('#apex-order-review[open]').waitFor();
    assert.match(await page.locator('#apex-order-review').innerText(), /Livro azul/);
    await page.locator('[data-apex-generate]').click();
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft().pricing.totalCents), 14300);
  });
  assert.deepEqual(errors, []); assert.deepEqual(unsafe, []);
  await writeFile('test-results/mvp-smoke.json', JSON.stringify({ results, javascriptErrors: errors.length, unsafeRequests: unsafe.length }, null, 2));
  console.log(`${results.length} cenários MVP aprovados; zero POST/checkout/JS remoto.`);
} finally { await browser?.close(); server.kill(); }
