import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.APEX_PLAYWRIGHT_PATH ? pathToFileURL(process.env.APEX_PLAYWRIGHT_PATH).href : 'playwright');
export async function suite(name, port, execute) {
  const origin = 'http://127.0.0.1:' + port, results = [], errors = [], unsafe = [];
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
    await page.route('**/*', route => {
      const req = route.request(), url = new URL(req.url());
      if (url.origin !== origin || req.method() !== 'GET' || /admin-ajax|checkout|add-to-cart|mifunko/i.test(url.href)) {
        unsafe.push({ method: req.method(), url: url.origin, resource: req.resourceType() }); return route.abort();
      }
      return route.continue();
    });
    const run = async (title, task) => { await task(); results.push({ name: title, passed: true }); console.log('PASS ' + title); };
    const open = async (product = 'individual') => { await page.goto(origin + '/?tipo=' + product); await page.waitForSelector('html[data-apex-ready="true"]'); };
    const field = key => page.locator('[data-field="' + key + '"]');
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
      await page.locator('#needed-date').fill(await page.locator('#needed-date').getAttribute('min'));
    };
    const review = async () => {
      await page.locator('.review-button').click();
      await page.waitForSelector('#order-review[open]');
    };
    const generate = async () => {
      await page.getByRole('button', { name: 'Gerar pedido de teste', exact: true }).click();
      await page.waitForSelector('#order-confirmation[open]');
      assert.equal((await page.evaluate(() => window.apexDevelopment.inspectDraft())).productionValidation, 'passed');
    };
    const extras = async () => { if (!await page.locator('#upsell-details').getAttribute('open') && !await page.locator('#upsell-details').evaluate(n => n.open)) await page.locator('#upsell-details > summary').click(); };
    await mkdir('test-results', { recursive: true });
    await execute({ page, run, open, field, inspect, total, upload, fixture, complete, review, generate, extras, origin });
    assert.deepEqual(errors, []); assert.deepEqual(unsafe, []);
    results.push({ name: 'Sem exceções JS, recursos externos ou chamadas transacionais', passed: true });
    await writeFile('test-results/' + name + '.json', JSON.stringify({ results, jsErrors: errors, unsafeRequests: unsafe }, null, 2));
    console.log(name + ': ' + results.length + ' cenários aprovados.');
  } finally { await browser?.close(); server.kill(); }
}
