import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderState } from '../js/state.js';
import { UploadStore } from '../js/uploads.js';
import { calculatePrice } from '../js/pricing.js';
import { validateOrderForProduction, createOrderDraft, safeOrderSummary } from '../js/order.js';
import { validateDesiredDate } from '../js/date.js';

const now = new Date(2030, 4, 10, 12);
const options = { now };
const codes = state => validateOrderForProduction(state, options).errors.map(e => e.code);
const file = () => new File([new Uint8Array([137,80,78,71,13,10,26,10])], 'fixture.png', { type: 'image/png' });
async function complete(t, product = 'individual') {
  const state = createOrderState(product), store = new UploadStore(); t.after(() => store.clear());
  state.shipping.date = '2030-05-10';
  for (const f of state.customizations.figures) {
    f.fields = { mf_face_option: 'negro', mf_skin_tones_option: 'estandard', mf_outfit_detail_text: 'Camiseta lisa' };
    await store.add({ itemId: 'main-1', field: `${f.id}.mf_face_photo_upload[]` }, [file()]);
  }
  if (product === 'mascota') {
    state.customizations.pet.fields.mf_pet_type = 'cao';
    await store.add({ itemId: 'main-1', field: 'mf_pet_photo[]' }, [file()]);
  }
  state.uploads = store.metadata(); return { state, store };
}
test('produção: quatro produtos válidos geram orderDraft com preço preservado', async t => {
  for (const [type, expected] of [['individual', 5900], ['mascota', 5900], ['pareja', 10900], ['boda', 11900]]) {
    const { state } = await complete(t, type), result = createOrderDraft(state, options);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.orderDraft.pricing.totalCents, expected);
    assert.equal(result.orderDraft.productionValidation, 'passed'); assert.equal(result.orderDraft.shipping.date, '2030-05-10');
    assert.equal(result.orderDraft.customer, null); assert.equal(result.orderDraft.mode, 'development');
  }
});
test('produção: produto sem foto obrigatória é bloqueado com erro estruturado', async t => {
  const { state } = await complete(t); state.uploads = [];
  const result = createOrderDraft(state, options);
  assert.equal(result.orderDraft, null); assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.field === 'figure-1.mf_face_photo_upload[]' && e.code === 'PHOTO_REQUIRED' && e.message));
});
test('produção: produto, tamanho, pessoas/pets e configuração incompleta', async t => {
  const { state } = await complete(t); state.product = ''; state.size = null;
  state.customizations.figures[0].fields = {}; state.customizations.pets = [{ size: 6, type: '', fields: {} }];
  assert.ok(codes(state).includes('PRODUCT_REQUIRED')); assert.ok(codes(state).includes('SIZE_REQUIRED'));
  assert.ok(codes(state).includes('HAIR_REQUIRED')); assert.ok(codes(state).includes('SKIN_REQUIRED')); assert.ok(codes(state).includes('OUTFIT_REQUIRED')); assert.ok(codes(state).includes('PET_CONFIGURATION'));
  state.product = 'pareja'; assert.ok(codes(state).includes('FIGURE_COUNT'));
});
test('produção: datas passadas/inexistentes rejeitadas, hoje e fim de semana aceitos', async t => {
  const { state } = await complete(t);
  for (const [date, code] of [['', 'DATE_REQUIRED'], ['2030-05-09', 'DATE_PAST'], ['2030-02-30', 'DATE_INVALID']]) {
    state.shipping.date = date; assert.ok(codes(state).includes(code));
  }
  assert.equal(validateDesiredDate('2030-05-11', options), null);
  assert.equal(validateDesiredDate('2030-05-10', options), null);
  assert.equal(validateDesiredDate('2030-05-10', { now, rule: { required: true, minLeadDays: 2, excludedWeekdays: [] } }).code, 'DATE_UNAVAILABLE');
});
test('produção: bytes/MIME inválidos e metadados sem File validado não passam', async t => {
  const { state } = await complete(t); state.uploads[0].size = 10_000_001;
  assert.ok(codes(state).includes('UPLOAD_INVALID'));
  state.uploads[0].size = 8; state.uploads[0].type = 'text/html'; assert.ok(codes(state).includes('UPLOAD_INVALID'));
  state.uploads[0].type = 'image/png'; state.uploads[0].id = 'inventado'; assert.ok(codes(state).includes('UPLOAD_INVALID'));
});
test('produção: foto de uma pessoa não substitui a da outra', async t => {
  const { state } = await complete(t, 'pareja'); state.uploads.pop();
  const forged = structuredClone(state.uploads[0]); forged.owner.field = 'figure-2.mf_face_photo_upload[]'; state.uploads.push(forged);
  assert.ok(codes(state).includes('PHOTO_REQUIRED')); assert.ok(codes(state).includes('UPLOAD_INVALID')); assert.ok(codes(state).includes('UPLOAD_DUPLICATE'));
});
test('produção: associação deve pertencer a uma opção ativa do item correto', async t => {
  const { state, store } = await complete(t);
  await store.add({ itemId: 'gift-1', field: 'figure-1.mf_face_photo_upload[]' }, [file()]); state.uploads = store.metadata();
  assert.ok(codes(state).includes('UPLOAD_OWNER'));
  store.remove(state.uploads[0].id); state.uploads.pop(); assert.ok(codes(state).includes('UPLOAD_INVALID'));
});
test('produção: caneca exige foto própria ou referencia o esboço do item principal', async t => {
  const { state, store } = await complete(t); state.gift.enabled = true; state.gift.imageSource = 'upload';
  assert.ok(codes(state).includes('GIFT_PHOTO_REQUIRED'));
  await store.add({ itemId: 'gift-1', field: 'gift_image' }, [file()]); state.uploads = store.metadata();
  const result = createOrderDraft(state, options); assert.equal(result.valid, true);
  assert.deepEqual(result.orderDraft.items[1].uploads, [state.uploads[1].id]);
  state.gift.imageSource = 'sketch'; state.uploads = state.uploads.filter(u => u.owner.itemId === 'main-1');
  assert.equal(createOrderDraft(state, options).orderDraft.items[1].customizations.sourceItemId, 'main-1');
});
test('produção: preço é recalculado e estado de preço divergente é bloqueado', async t => {
  const { state } = await complete(t); state.pricing = calculatePrice(state); state.pricing.totalCents = 1;
  assert.ok(codes(state).includes('PRICE_STALE'));
  state.pricing = null; state.customizations.figures[0].eyes = 'inexistente'; assert.ok(codes(state).includes('PRICE_INVALID'));
});
test('produção: caixa, base e acessórios precisam dos detalhes de fabricação', async t => {
  const { state } = await complete(t); state.customizations.box.type = 'caja_personalizada';
  state.customizations.figures[0].accessories = 1; state.customizations.extras = ['base-com-nome'];
  assert.ok(codes(state).includes('BOX_DETAIL')); assert.ok(codes(state).includes('BOX_NUMBER')); assert.ok(codes(state).includes('ACCESSORY_DETAIL')); assert.ok(codes(state).includes('BASE_TEXT_REQUIRED'));
});
test('produção: minis e pets selecionados exigem referência própria', async t => {
  const { state } = await complete(t); state.customizations.minis.quantity = 1;
  state.customizations.pets = [{ type: 'Cão', size: 4, fields: {} }];
  assert.ok(codes(state).includes('MINI_DETAIL'));
  const errors = validateOrderForProduction(state, options).errors;
  assert.ok(errors.some(e => e.field === 'mf_mini_unit_upload_1' && e.code === 'PHOTO_REQUIRED'));
  assert.ok(errors.some(e => e.field === 'mf_pet_1_photo[]' && e.code === 'PHOTO_REQUIRED'));
});
test('produção: estado malformado retorna erros, inspeção omite textos livres', async t => {
  for (const state of [null, {}, { customizations: [] }]) assert.equal(validateOrderForProduction(state).valid, false);
  const { state } = await complete(t); state.notes = 'nota-sintetica';
  const result = createOrderDraft(state, options);
  assert.doesNotMatch(JSON.stringify(safeOrderSummary(result.orderDraft)), /nota-sintetica|fixture\.png|base64|previewUrl/);
});
