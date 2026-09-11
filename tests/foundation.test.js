import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderState } from '../js/state.js';
import { calculatePrice } from '../js/pricing.js';
import { UploadStore } from '../js/uploads.js';
import { buildOrder, safeOrderSummary } from '../js/order.js';

test('cenários observados no baseline: tipo, tamanho e caixa', () => {
  for (const [type, size, box, expected] of [
    ['individual', 6, 'caja_standard', 5900], ['individual', 10, 'caja_standard', 7900],
    ['pareja', 15, 'caja_doble', 21900], ['pareja', 20, 'caja_standard', 23900],
    ['mascota', 10, 'caja_standard', 7900], ['boda', 6, 'caja_standard', 11900],
  ]) {
    const state = createOrderState(type); state.size = size; state.customizations.box.type = box;
    assert.equal(calculatePrice(state).unitTotalCents, expected);
  }
});
test('regras documentadas: figuras independentes, três minis, animais e urgência', () => {
  const state = createOrderState('pareja');
  state.customizations.figures[1].eyes = 'ojos_verdes';
  state.customizations.figures[1].specialAccessories = ['guitarra-8'];
  state.customizations.minis = { quantity: 3, size: 6 };
  state.customizations.pets = [{ size: 4 }, { size: 6 }, { size: 10 }];
  state.shipping.option = 'envio_express';
  assert.equal(calculatePrice(state).unitTotalCents, 43500);
  state.quantity = 2; state.gift.enabled = true;
  assert.equal(calculatePrice(state).totalCents, 89000);
});
test('falha explícita para preço ou quantidade desconhecidos', () => {
  const state = createOrderState(); state.quantity = -1;
  assert.throws(() => calculatePrice(state)); state.quantity = 1;
  state.size = 99; assert.throws(() => calculatePrice(state));
  state.size = 20; state.customizations.box.type = 'caja_doble';
  assert.throws(() => calculatePrice(state));
});
const png = new Uint8Array([137,80,78,71,13,10,26,10]);
test('upload: MIME, assinatura, bytes, homônimos, substituição e remoção', async () => {
  const store = new UploadStore({ maxBytes: 8, mimeTypes: ['image/png'], maxFilesPerField: null });
  const owner = { itemId: 'main-1', field: 'figure-1.face' };
  const good = new File([png], 'mesmo.png', { type: 'image/png' });
  await store.add(owner, [good, good], { multiple: true });
  assert.equal(store.list().length, 2); assert.notEqual(store.list()[0].id, store.list()[1].id);
  await assert.rejects(store.add(owner, [new File([png, 'x'], 'grande.png', { type: 'image/png' })]), /MB/);
  await assert.rejects(store.add(owner, [new File(['html'], 'falso.png', { type: 'image/png' })]), /conteúdo/);
  await assert.rejects(store.add(owner, [new File(['x'], 'x.svg', { type: 'image/svg+xml' })]), /Tipo/);
  assert.equal(store.list().length, 2);
  store.remove(store.list()[0].id); assert.equal(store.list().length, 1);
  await store.add(owner, [good]); assert.equal(store.list().length, 1);
  assert.equal(store.metadata()[0].file, undefined); store.clear(); assert.equal(store.list().length, 0);
});
test('pedido normalizado associa upsell; inspeção não contém texto ou arquivos pessoais', () => {
  const state = createOrderState(); state.gift = { enabled: true, imageSource: 'upload', text: 'texto privado' };
  assert.throws(() => buildOrder(state), /imagem da caneca/);
  state.uploads = [{ id: 'img-1', owner: { itemId: 'gift-1', field: 'image' }, name: 'nome privado.png', type: 'image/png', size: 8 }];
  state.notes = 'observações privadas';
  const order = buildOrder(state);
  assert.deepEqual(order.items[1].uploads, ['img-1']);
  assert.equal(order.pricing.totalCents, 7900);
  const safe = JSON.stringify(safeOrderSummary(order));
  assert.doesNotMatch(safe, /privad|base64|previewUrl/);
  state.gift.enabled = false; assert.equal(buildOrder(state).uploads.length, 0);
});
