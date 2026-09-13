import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyticsConfig, isTrackingConfigured } from '../config/analytics.js';
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from '../js/whatsapp.js';

test('tracking permanece no-op enquanto qualquer ID for placeholder', () => {
  assert.equal(isTrackingConfigured(), false);
  assert.deepEqual(analyticsConfig, {
    gtmContainerId: 'GTM-PLACEHOLDER', ga4MeasurementId: 'G-PLACEHOLDER', googleAdsId: 'AW-PLACEHOLDER', metaPixelId: 'META-PLACEHOLDER',
  });
});

test('WhatsApp usa o número oficial, template e somente contexto comercial seguro', () => {
  const url = new URL(buildWhatsAppUrl({ product: 'casal', size: 10, subtotalCents: 27990, placement: 'configurator' }));
  assert.equal(WHATSAPP_NUMBER, '5521923679482'); assert.equal(url.hostname, 'wa.me'); assert.equal(url.pathname, '/5521923679482');
  const text = url.searchParams.get('text');
  assert.match(text, /montando minha miniatura|casal|10 cm|subtotal R\$\s*279,90/); assert.doesNotMatch(text, /blob:|foto|observa/i);
});

test('frontend não dispara purchase nem integra checkout externo', async () => {
  const files = ['js/main.js','js/commercial-ui.js','js/shell-controller.js','js/shell-interactions.js','js/whatsapp.js'];
  const source = (await Promise.all(files.map(file => readFile(new URL('../' + file, import.meta.url), 'utf8')))).join('\n');
  assert.doesNotMatch(source, /track\(['"]purchase/); assert.doesNotMatch(source, /asaas|checkout\.session|payment[_-]?intent/i);
});
