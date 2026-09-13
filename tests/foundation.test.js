import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderState, createFigure } from '../js/state.js';
import { calculatePrice, formatMoney } from '../js/pricing.js';
import { UploadStore } from '../js/uploads.js';
import { pricing } from '../config/pricing.js';
for (const [product, expected] of [['individual',9990],['pet',9990],['casal',18990],['familia',26990]]) {
  test('oferta BRL: ' + product, () => {
    const price = calculatePrice(createOrderState(product));
    assert.equal(price.totalCents, expected); assert.equal(price.currency, 'BRL');
    assert.match(formatMoney(expected), /R\$/); assert.equal(price.freightCents, null);
  });
}
test('pessoas adicionais preservam contagem e preço por pessoa', () => {
  const state = createOrderState('familia'); state.customizations.additionalPeople = 2;
  state.customizations.figures.push(createFigure(3), createFigure(4));
  assert.equal(calculatePrice(state).totalCents, 46970);
  state.customizations.figures.pop(); assert.throws(() => calculatePrice(state));
  const pet = createOrderState('pet'); pet.customizations.additionalPeople = 1; assert.throws(() => calculatePrice(pet));
});
test('cada upsell usa a tabela central em centavos', () => {
  const cases = [
    [s => s.customizations.pets.push({ type: 'Cão', size: 4, fields: {} }), 7990],
    [s => s.customizations.figures[0].accessories = 1, 1990],
    [s => s.customizations.figures[0].logos = 1, 3990],
    [s => s.customizations.extras = ['base-com-nome'], 1990],
    [s => s.customizations.extras = ['base-com-nome-data'], 2990],
    [s => s.customizations.box.type = 'caja_personalizada', 3990],
    [s => s.customizations.figures[0].specialAccessories = ['detalhado'], 3990],
  ];
  for (const [set, delta] of cases) { const s = createOrderState(); set(s); assert.equal(calculatePrice(s).totalCents, 9990 + delta); }
});
test('combinação de adicionais, quantidade e total sem floats', () => {
  const s = createOrderState(); const c = s.customizations;
  c.additionalPeople = 1; c.figures.push(createFigure(1));
  c.pets = [{ type: 'Cão', size: 4, fields: {} }];
  c.figures[0].accessories = 1; c.figures[0].logos = 1; c.figures[0].specialAccessories = ['detalhado'];
  c.extras = ['base-com-nome-data']; c.box.type = 'caja_personalizada';
  assert.equal(calculatePrice(s).totalCents, 44920);
  s.quantity = 2; assert.equal(calculatePrice(s).totalCents, 89840);
  assert.equal(Object.hasOwn(pricing, 'status'), false);
});
test('opções fora da tabela homologada e valores arbitrários são rejeitados', () => {
  for (const change of [
    s => s.quantity = -1, s => s.quantity = 1.5, s => s.size = 25,
    s => s.promotion = { code: 'FAKE', claimed: true },
    s => s.customizations.figures[0].specialAccessories = ['inventado'],
    s => s.customizations.figures[0].accessories = -1,
    s => s.shipping.option = 'envio_express',
  ]) { const s = createOrderState(); change(s); assert.throws(() => calculatePrice(s)); }
  const s = createOrderState(); s.price = 1; assert.equal(calculatePrice(s).totalCents, 9990);
  assert.equal(Object.hasOwn(s, 'gift'), false); assert.equal(Object.hasOwn(s.customizations, 'minis'), false);
});
const png = new Uint8Array([137,80,78,71,13,10,26,10]);
test('quatro tamanhos cobram por miniatura, incluindo pessoas adicionais', () => {
  const matrix = { 6:{individual:9990,pet:9990,casal:18990,familia:26990}, 10:{individual:14990,pet:14990,casal:27990,familia:39990}, 15:{individual:17990,pet:17990,casal:33990,familia:47990}, 20:{individual:21990,pet:21990,casal:41990,familia:59990} };
  for (const [size, values] of Object.entries(matrix)) {
    for (const [product, expected] of Object.entries(values)) {
      const state = createOrderState(product); state.size = size;
      assert.equal(calculatePrice(state).totalCents, expected);
      state.customizations.box.type = 'caja_personalizada';
      assert.equal(calculatePrice(state).totalCents, expected + 3990);
      if (product !== 'pet') {
        state.customizations.additionalPeople = 1;
        state.customizations.figures.push(createFigure(state.customizations.figures.length));
        assert.equal(calculatePrice(state).totalCents, expected + values.individual + 3990);
      }
    }
  }
});
test('FIRST10 aplica 10% uma única vez sobre itens e nunca sobre frete', () => {
  const state = createOrderState('casal'); state.size = 10; state.customizations.box.type = 'caja_personalizada';
  state.promotion = { code: 'FIRST10', claimed: true };
  const price = calculatePrice(state);
  assert.equal(price.subtotalCents, 31980); assert.equal(price.discountCents, 3198); assert.equal(price.totalCents, 28782); assert.equal(price.freightCents, null);
  state.promotion.claimed = true; assert.deepEqual(calculatePrice(state), price);
});
test('upload: MIME, assinatura, bytes, homônimos, substituição e remoção', async () => {
  const store = new UploadStore({ maxBytes: 8, mimeTypes: ['image/png'], maxFilesPerField: 2 });
  const owner = { itemId: 'main-1', field: 'figure-1.face' };
  const good = new File([png], 'mesmo.png', { type: 'image/png' });
  await store.add(owner, [good, good], { multiple: true });
  assert.equal(store.list().length, 2); assert.notEqual(store.list()[0].id, store.list()[1].id);
  await assert.rejects(store.add(owner, [good], { multiple: true }), /Limite/);
  await assert.rejects(store.add(owner, [new File([png, 'x'], 'grande.png', { type: 'image/png' })]), /MB/);
  await assert.rejects(store.add(owner, [new File(['html'], 'falso.png', { type: 'image/png' })]), /conteúdo/);
  await assert.rejects(store.add(owner, [new File(['x'], 'x.svg', { type: 'image/svg+xml' })]), /Tipo/);
  assert.equal(store.list().length, 2);
  store.remove(store.list()[0].id); assert.equal(store.list().length, 1);
  await store.add(owner, [good]); assert.equal(store.list().length, 1);
  assert.equal(store.metadata()[0].file, undefined); store.clear(); assert.equal(store.list().length, 0);
});
test('upload pendente é cancelado em troca de composição', async () => {
  const store = new UploadStore(), file = new File([png], 'referencia.png', { type: 'image/png' });
  const pending = store.add({ itemId: 'main-1', field: 'foto' }, [file]);
  store.cancelPending(); await pending; assert.equal(store.list().length, 0);
});
