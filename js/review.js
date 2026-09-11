import { products } from '../config/products.js';
import { brand } from '../config/brand.js';
import { pricing } from '../config/pricing.js';
import { displayDate } from './date.js';

const currency = cents => new Intl.NumberFormat(brand.locale, { style: 'currency', currency: pricing.currency }).format(cents / 100);
export function renderOrderReview(container, state, { labelFor, onEdit, onGenerate }) {
  container.replaceChildren();
  const title = document.createElement('h2'); title.textContent = 'Revise seu pedido'; title.tabIndex = -1; title.setAttribute('autofocus', '');
  const dl = document.createElement('dl');
  const row = (title, value) => {
    const dt = document.createElement('dt'); dt.textContent = title;
    const dd = document.createElement('dd'); dd.textContent = value || 'Não informado'; dl.append(dt, dd);
  };
  const c = state.customizations;
  row('Produto', products[state.product]?.label);
  row('Tamanho', `${state.size} cm`); row('Quantidade', String(state.quantity));
  row('Pessoas e animais', `${c.figures.length} pessoa(s), ${c.pets.length + (state.product === 'mascota' ? 1 : 0)} animal(is), ${c.minis.quantity} mini(s)`);
  const showAccessories = (f, prefix) => {
    const descriptions = [];
    for (const [key, stem, label] of [['accessories', 'accessory', 'Acessório'], ['logos', 'logo', 'Logótipo']]) {
      for (let i = 1; i <= (f[key] || 0); i++) descriptions.push(`${label} ${i}: ${f.fields[`mf_${stem}_detail_${i}`] || 'conforme foto'}`);
    }
    (f.specialAccessories || []).forEach(slug => descriptions.push(labelFor('mf_special_accessories[]', slug)));
    row(`Acessórios · ${prefix}`, descriptions.join('\n') || 'Nenhum');
    for (const [name, value] of Object.entries(f.fields)) {
      if (name.startsWith('mf_special_accessory_extra_text') && value) row(`Texto do acessório · ${prefix}`, value);
    }
  };
  c.figures.forEach((f, i) => {
    const fields = f.fields;
    row(`Pessoa ${i + 1}`, [
      `Cabelo: ${labelFor('mf_face_option', fields.mf_face_option)}`,
      fields.mf_face_option === 'otro' ? `Cor do cabelo: ${fields.mf_face_custom_color}` : '',
      `Pele: ${labelFor('mf_skin_tones_option', fields.mf_skin_tones_option)}`,
      `Olhos: ${labelFor('mf_eyes_option', f.eyes)}`, `Boca: ${labelFor('mf_mouth_option', f.mouth)}`,
      `Óculos: ${f.glasses ? 'Sim' : 'Não'}`, `Detalhes: ${fields.mf_face_detail_text || 'Conforme foto'}`,
      `Roupa: ${fields.mf_outfit_detail_text || 'Conforme foto'}`,
      ...['top', 'bottom', 'shoes'].filter(key => fields[`mf_outfit_color_${key}`]).map(key => `${({top:'Cor superior',bottom:'Cor inferior',shoes:'Calçado'})[key]}: ${fields[`mf_outfit_color_${key}`]}`),
    ].filter(Boolean).join('\n'));
    showAccessories(f, `pessoa ${i + 1}`);
  });
  if (state.product === 'mascota') {
    row('Animal principal', [labelFor('mf_pet_type', c.pet.fields.mf_pet_type), c.pet.fields.mf_pet_breed, `Olhos: ${labelFor('mf_pet_eyes', c.pet.eyes)}`, c.pet.eyes === 'otro' ? c.pet.fields.mf_pet_eyes_custom_color : '', c.pet.fields.mf_pet_detail, c.pet.fields.mf_pet_eyes_detail].filter(Boolean).join('\n'));
    showAccessories(c.pet, 'animal principal');
  }
  c.pets.forEach((pet, i) => row(`Animal adicional ${i + 1}`, `${pet.type} · ${pet.size} cm${pet.fields[`mf_pet_${i + 1}_breed`] ? ` · ${pet.fields[`mf_pet_${i + 1}_breed`]}` : ''}`));
  for (let i = 1; i <= c.minis.quantity; i++) row(`Mini ${i}`, `${c.minis.size} cm · ${c.minis.fields[`mf_mini_unit_detail_${i}`] || ''}`);
  row('Caixa', labelFor('mf_box_option', c.box.type));
  if (c.box.type !== 'caja_standard') {
    row('Personalização da caixa', [c.box.fields.mf_box_character_name, c.box.fields.mf_box_collection_name, c.box.fields.mf_box_number,
      labelFor('mf_box_color', c.box.fields.mf_box_color), c.box.fields.mf_box_color_custom].filter(Boolean).join(' · '));
    if (c.box.dedication) row('Dedicatória', c.box.fields.mf_box_dedication_text || 'Conforme imagem anexada');
  }
  row('Base e adicionais', c.extras.map(s => labelFor('mf_extra_option[]', s)).join(', ') || 'Nenhum');
  if (c.fields.mf_extra_text_data) row('Texto da base', c.fields.mf_extra_text_data);
  if (state.gift.enabled) row('Caneca', `${state.gift.imageSource === 'upload' ? 'Imagem própria anexada' : 'Esboço da figura'}${state.gift.text ? ` · ${state.gift.text}` : ''}`);
  row('Fotos anexadas', String(state.uploads.length));
  row('Quando você precisa receber?', displayDate(state.shipping.date));
  row('Prazo selecionado', labelFor('mf_shipping_option', state.shipping.option));
  row('Observações', state.notes || 'Nenhuma');
  row('Preço unitário da configuração', currency(state.pricing.unitTotalCents));
  if (state.gift.enabled) row('Caneca adicional', currency(state.pricing.giftTotalCents));
  row('Subtotal do pedido', currency(state.pricing.totalCents));
  const notice = document.createElement('p'); notice.className = 'apex-review-notice';
  notice.textContent = 'A data informada é uma necessidade, não uma confirmação de entrega. Frete final não calculado. Gerar o rascunho não envia o pedido e não realiza pagamento.';
  const actions = document.createElement('div'); actions.className = 'apex-review-actions';
  const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Voltar e editar'; edit.addEventListener('click', onEdit);
  const generate = document.createElement('button'); generate.type = 'button'; generate.dataset.apexGenerate = ''; generate.textContent = 'Gerar rascunho do pedido'; generate.addEventListener('click', onGenerate);
  actions.append(edit, generate); container.append(title, dl, notice, actions);
}
