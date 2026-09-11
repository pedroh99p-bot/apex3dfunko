import { products } from '../config/products.js';
import { pricing } from '../config/pricing.js';
import { uploadPolicy } from '../config/uploads.js';
import { mvpRules } from '../config/mvp.js';
import { calculatePrice } from './pricing.js';
import { validateDesiredDate } from './date.js';
import { isValidatedUpload } from './uploads.js';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const filled = value => typeof value === 'string' && value.trim().length > 0;
const own = (map, key) => Object.hasOwn(map, key);

export function validateOrderForProduction(state, options = {}) {
  const errors = [];
  const add = (field, code, message) => errors.push({ field, code, message });
  const result = () => ({ valid: errors.length === 0, errors });
  if (!record(state)) { add('order', 'STATE_INVALID', 'A configuração do pedido está inválida.'); return result(); }
  if (!own(products, state.product)) add('product', 'PRODUCT_REQUIRED', 'Selecione um produto válido.');
  const c = state.customizations;
  if (!record(c) || !Array.isArray(c.figures) || !Array.isArray(c.pets) || !Array.isArray(c.extras)
    || !record(c.pet) || !record(c.pet.fields) || !record(c.minis) || !record(c.minis.fields)
    || !record(c.box) || !record(c.box.fields) || !record(c.fields) || !record(state.gift)
    || !record(state.shipping) || !Array.isArray(state.uploads)) {
    add('order', 'STATE_INVALID', 'A configuração está incompleta. Selecione novamente o produto.'); return result();
  }
  const product = products[state.product];
  if (!Number.isSafeInteger(state.quantity) || state.quantity < 1) add('quantity', 'QUANTITY_INVALID', 'Informe uma quantidade inteira maior que zero.');
  if (!product || !own(product.kind === 'pet' ? pricing.petSize : pricing.humanSize, state.size) || typeof state.size !== 'number') add('size', 'SIZE_REQUIRED', 'Escolha um tamanho válido.');
  if (product && c.figures.length !== product.figures) add('figures', 'FIGURE_COUNT', 'A quantidade de pessoas não corresponde ao produto.');
  if (!own(pricing.additionalPets, c.pets.length)) add('mf_pets_option', 'PET_COUNT', 'Selecione de zero a três animais adicionais.');
  if (!Number.isInteger(c.minis.quantity) || !own(pricing.minis, c.minis.quantity) || !own(pricing.miniSize, c.minis.size)) add('mf_mini_option', 'MINI_CONFIGURATION', 'Confira a quantidade e o tamanho das minis.');
  const uploads = state.uploads;
  const validUploads = uploads.filter(isValidatedUpload);
  const photo = field => validUploads.some(u => u.owner.itemId === 'main-1' && u.owner.field === field);
  const allowed = new Set();
  const allow = field => allowed.add(`main-1:${field}`);
  const requiredPhoto = (field, label) => { allow(field); if (!photo(field)) add(field, 'PHOTO_REQUIRED', `Envie pelo menos uma foto de referência ${label}.`); };
  const checkAccessories = (f, prefix) => {
    if (!Array.isArray(f.specialAccessories) || !record(f.fields)) { add(prefix, 'STATE_INVALID', 'Confira os acessórios selecionados.'); return; }
    for (const [key, stem, label] of [['accessories', 'accessory', 'acessório'], ['logos', 'logo', 'logótipo']]) {
      const count = f[key] ?? 0;
      if (!Number.isInteger(count) || count < 0 || count > pricing.maxAccessories) { add(prefix, 'ACCESSORY_COUNT', 'Quantidade de acessórios inválida.'); continue; }
      for (let n = 1; n <= count; n++) {
        const field = `${prefix}.mf_${stem}_upload_${n}`; allow(field);
        if (!filled(f.fields[`mf_${stem}_detail_${n}`]) && !photo(field)) add(`${prefix}.mf_${stem}_detail_${n}`, 'ACCESSORY_DETAIL', `Descreva ou envie uma foto do ${label} ${n}.`);
      }
    }
    if (new Set(f.specialAccessories).size !== f.specialAccessories.length) add(prefix, 'DUPLICATE_OPTION', 'Há acessórios duplicados na configuração.');
    for (const slug of f.specialAccessories) if (own(pricing.specialAccessories, slug)) allow(`${prefix}.mf_special_accessory_extra_photo_${slug}`);
    if (f.fields.mf_special_other) add(prefix, 'OPTION_UNAVAILABLE', 'Orçamentos de acessórios fora do catálogo ficam para uma próxima etapa.');
  };
  c.figures.forEach((f, i) => {
    const prefix = `figure-${i + 1}`;
    if (!record(f) || !record(f.fields)) { add(prefix, 'STATE_INVALID', 'Confira os dados de cada pessoa.'); return; }
    if (f.id !== prefix) add(prefix, 'FIGURE_ID', 'A identificação das pessoas está inconsistente.');
    if (!mvpRules.hair.includes(f.fields.mf_face_option)) add(`${prefix}.mf_face_option`, 'HAIR_REQUIRED', `Escolha o cabelo da pessoa ${i + 1}.`);
    if (!mvpRules.skin.includes(f.fields.mf_skin_tones_option)) add(`${prefix}.mf_skin_tones_option`, 'SKIN_REQUIRED', `Escolha o tom de pele da pessoa ${i + 1}.`);
    if (f.fields.mf_face_option === 'otro' && !/^#[\da-f]{6}$/i.test(f.fields.mf_face_custom_color || '')) add(`${prefix}.mf_face_custom_color`, 'COLOR_REQUIRED', 'Escolha a cor personalizada do cabelo.');
    if (!own(pricing.eyes, f.eyes) || !own(pricing.mouth, f.mouth) || typeof f.glasses !== 'boolean') add(prefix, 'FACE_CONFIGURATION', `Confira olhos, boca e óculos da pessoa ${i + 1}.`);
    if ((f.fields.mf_eyes_option && f.fields.mf_eyes_option !== f.eyes) || (f.fields.mf_mouth_option && f.fields.mf_mouth_option !== f.mouth)) add(prefix, 'FACE_INCONSISTENT', 'As características da pessoa estão inconsistentes. Revise a seleção.');
    requiredPhoto(`${prefix}.mf_face_photo_upload[]`, `da pessoa ${i + 1}`);
    allow(`${prefix}.mf_outfit_photo_upload[]`);
    if (!filled(f.fields.mf_outfit_detail_text) && !photo(`${prefix}.mf_outfit_photo_upload[]`)) add(`${prefix}.mf_outfit_detail_text`, 'OUTFIT_REQUIRED', `Descreva ou envie uma foto da roupa da pessoa ${i + 1}.`);
    if (f.glasses) allow(`${prefix}.mf_face_glasses_upload`);
    checkAccessories(f, prefix);
  });
  if (product?.kind === 'pet') {
    if (!mvpRules.petTypes.includes(c.pet.fields.mf_pet_type)) add('mf_pet_type', 'PET_TYPE_REQUIRED', 'Escolha o tipo do animal principal.');
    requiredPhoto('mf_pet_photo[]', 'do animal principal'); allow('mf_pet_eyes_photo[]');
    if (!own(pricing.petEyes, c.pet.eyes)) add('mf_pet_eyes', 'PET_EYES_REQUIRED', 'Escolha os olhos do animal.');
    if (c.pet.eyes === 'otro' && !/^#[\da-f]{6}$/i.test(c.pet.fields.mf_pet_eyes_custom_color || '')) add('mf_pet_eyes_custom_color', 'COLOR_REQUIRED', 'Escolha a cor dos olhos do animal.');
    checkAccessories(c.pet, 'figure-1');
  }
  c.pets.forEach((pet, i) => {
    if (!record(pet) || !record(pet.fields)) { add('mf_pets_option', 'STATE_INVALID', 'Confira os dados dos animais adicionais.'); return; }
    if (!mvpRules.additionalPetTypes.includes(pet.type) || !own(pricing.additionalPetSize, pet.size)) add(`mf_pet_${i + 1}_type`, 'PET_CONFIGURATION', `Escolha o tipo e tamanho do animal adicional ${i + 1}.`);
    requiredPhoto(`mf_pet_${i + 1}_photo[]`, `do animal adicional ${i + 1}`);
  });
  for (let i = 1; i <= Math.min(c.minis.quantity, 3); i++) {
    const field = `mf_mini_unit_detail_${i}`;
    if (!filled(c.minis.fields[field])) add(field, 'MINI_DETAIL', `Descreva a aparência e roupa da mini ${i}.`);
    requiredPhoto(`mf_mini_unit_upload_${i}`, `da mini ${i}`);
  }
  const b = c.box;
  if (!own(pricing.box, b.type)) add('mf_box_option', 'BOX_REQUIRED', 'Escolha uma opção de caixa.');
  if ((state.size === 20 && b.type !== 'caja_standard') || (c.figures.length === 2 && b.type === 'caja_personalizada')) add('mf_box_option', 'BOX_INCOMPATIBLE', 'A caixa escolhida não é compatível com este produto/tamanho.');
  if (b.type !== 'caja_standard') {
    for (const [field, label] of [['mf_box_character_name', 'o nome da caixa'], ['mf_box_collection_name', 'o nome da coleção'], ['mf_box_color', 'a cor da caixa']]) if (!filled(b.fields[field])) add(field, 'BOX_DETAIL', `Informe ${label}.`);
    if (!/^\d{1,4}$/.test(b.fields.mf_box_number || '')) add('mf_box_number', 'BOX_NUMBER', 'Informe um número de caixa de até quatro dígitos.');
    const boxColor = b.fields.mf_box_color === 'custom' ? b.fields.mf_box_color_custom : b.fields.mf_box_color;
    if (!/^#[\da-f]{6}$/i.test(boxColor || '')) add('mf_box_color', 'COLOR_REQUIRED', 'Escolha uma cor válida para a caixa.');
  }
  if (typeof b.dedication !== 'boolean' || (b.dedication && b.type === 'caja_standard')) add('mf_box_dedication_enabled', 'DEDICATION_INCONSISTENT', 'A dedicatória exige uma caixa personalizada.');
  if (b.dedication) {
    allow('mf_box_dedication_image');
    if (!filled(b.fields.mf_box_dedication_text) && !photo('mf_box_dedication_image')) add('mf_box_dedication_text', 'DEDICATION_REQUIRED', 'Escreva a dedicatória ou adicione uma imagem.');
  }
  if (new Set(c.extras).size !== c.extras.length || c.extras.filter(s => typeof s === 'string' && s.startsWith('base-') && pricing.extras[s] > 0).length > 1) add('mf_extra_option[]', 'EXTRAS_INCONSISTENT', 'Escolha somente uma base personalizada.');
  if (c.extras.some(s => ['base-com-nome', 'base-com-nome-data'].includes(s)) && !filled(c.fields.mf_extra_text_data)) add('mf_extra_text_data', 'BASE_TEXT_REQUIRED', 'Informe o texto da base personalizada.');
  if (!own(pricing.shipping, state.shipping.option)) add('mf_shipping_option', 'SHIPPING_REQUIRED', 'Escolha uma opção de prazo.');
  const dateError = validateDesiredDate(state.shipping.date, options);
  if (dateError) add('mf_shipping_date', dateError.code, dateError.message);
  if (typeof state.gift.enabled !== 'boolean' || !['sketch', 'upload'].includes(state.gift.imageSource)) add('gift', 'GIFT_INVALID', 'Confira a personalização da caneca.');
  if (state.gift.enabled && state.gift.imageSource === 'upload') {
    allowed.add('gift-1:gift_image');
    if (!validUploads.some(u => u.owner.itemId === 'gift-1' && u.owner.field === 'gift_image')) add('gift_image', 'GIFT_PHOTO_REQUIRED', 'Envie a imagem da caneca ou escolha o esboço.');
  }
  const ids = new Set();
  for (const u of uploads) {
    if (!record(u) || !record(u.owner)) { add('uploads', 'UPLOAD_INVALID', 'Um anexo está inválido.'); continue; }
    if (ids.has(u.id)) add('uploads', 'UPLOAD_DUPLICATE', 'A mesma imagem foi associada mais de uma vez.'); ids.add(u.id);
    if (!allowed.has(`${u.owner.itemId}:${u.owner.field}`)) add(u.owner.field || 'uploads', 'UPLOAD_OWNER', 'Uma imagem não pertence a uma personalização ativa deste pedido.');
    if (!isValidatedUpload(u) || !uploadPolicy.mimeTypes.includes(u.type) || !Number.isSafeInteger(u.size) || u.size < 1 || u.size > uploadPolicy.maxBytes) add(u.owner.field || 'uploads', 'UPLOAD_INVALID', 'Uma imagem é inválida ou não está mais disponível. Remova e selecione novamente.');
  }
  try {
    const price = calculatePrice(state);
    if (state.pricing && ['currency', 'totalCents', 'unitTotalCents', 'mainTotalCents', 'giftTotalCents'].some(key => state.pricing[key] !== price[key])) add('pricing', 'PRICE_STALE', 'O preço está desatualizado. Revise a configuração.');
  } catch { add('pricing', 'PRICE_INVALID', 'Não foi possível calcular o preço. Confira as opções selecionadas.'); }
  return result();
}
