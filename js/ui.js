import { brand } from '../config/brand.js';
import { products } from '../config/products.js';
import { pricing } from '../config/pricing.js';
import { createOrderState } from './state.js';
import { calculatePrice } from './pricing.js';
import { UploadStore } from './uploads.js';
import { buildOrder, safeOrderSummary, createOrderDraft, validateOrderForProduction } from './order.js';
import { minimumDesiredDate, displayDate, validateDesiredDate } from './date.js';
import { renderOrderReview } from './review.js';

const q = (selector, root = document) => root.querySelector(selector);
const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const byName = (name, root = document) => qa('[name]', root).filter(el => el.name === name);
const read = (name, root = document, fallback = '') => {
  const fields = byName(name, root).filter(el => !el.disabled);
  const el = fields.find(el => !['radio', 'checkbox'].includes(el.type) || el.checked);
  return el ? (el.type === 'checkbox' ? true : el.value) : fallback;
};
const checked = (name, root = document) => byName(name, root).filter(el => el.checked && !el.disabled).map(el => el.value);
const cm = (text, fallback) => Number(String(text).match(/\d+/)?.[0] || fallback);
const money = cents => new Intl.NumberFormat(brand.locale, { style: 'currency', currency: pricing.currency }).format(cents / 100);
const setText = (selector, text) => qa(selector).forEach(el => { el.textContent = text; });
const setRadio = (name, value, root = document) => byName(name, root).forEach(el => { el.checked = el.value === value; });
const figureIndex = el => Number(el.closest('[data-apex-figure]')?.dataset.apexFigure || 0);
const nameOf = el => el.name.replace(/^mf_partner_2_/, 'mf_');
const fieldOwner = el => ({ itemId: el.closest('[data-mf-gift-upsell-modal]') ? 'gift-1' : 'main-1',
  field: el.closest('[data-apex-figure]') ? `figure-${figureIndex(el) + 1}.${nameOf(el)}` : el.name });

export function startConfigurator() {
  let state = createOrderState();
  let orderDraft = null;
  let revision = 0;
  let reviewedRevision = -1;
  let pendingUploads = 0;
  const uploadFailures = new Map();
  const store = new UploadStore();
  const sectionTemplate = q('[data-mf-extra-options-section]').cloneNode(true);
  const form = q('form.cart');
  form.noValidate = true; // Erros estruturados e foco local são responsabilidade da validação Apex.
  const status = message => { const node = q('#apex-status'); node.textContent = message; node.hidden = !message; };
  const emit = name => document.dispatchEvent(new CustomEvent(name, { detail: { product: state.product, totalCents: state.pricing?.totalCents, uploadCount: state.uploads.length } }));

  function setupProduct(type) {
    store.clear(); state = createOrderState(type); orderDraft = null; uploadFailures.clear();
    q('#apex-order-review').close(); q('#apex-order-preview').close();
    form.remove();
    q('[data-mf-extra-options-section]').replaceWith(sectionTemplate.cloneNode(true));
    q('[data-mf-summary-form]').append(form); form.reset();
    qa('[data-mf-funko-type-option]').forEach(button => {
      const active = button.dataset.typeValue === type;
      button.classList.toggle('is-selected', active); button.setAttribute('aria-pressed', String(active));
    });
    const grid = q('.mf-product-customizer-grid');
    const steps = {
      size: q('[data-mf-size-step]'), face: q('[data-mf-face-step]'), skin: q('[data-mf-skin-step]'),
      outfit: q('[data-mf-outfit-step]'), extras: q('[data-mf-card-kind="extras"]'), pets: q('[data-mf-pets-step]'),
      mini: q('[data-mf-mini-step]'), extra: q('[data-mf-extra-step]'), box: q('[data-mf-box-step]'),
      pet_type: q('[data-mf-pet-step="pet_type"]'), pet_eyes: q('[data-mf-pet-step="pet_eyes"]'), pet_size: q('[data-mf-pet-size-step]'),
    };
    // Mantém os fragmentos legados no DOM, inativos, para auditoria posterior.
    qa('[data-mf-pet-step="pet_accessories"], [data-mf-pet-step="pet_extras"]').forEach(step => {
      step.hidden = true; qa('input,select,textarea', step).forEach(el => { el.disabled = true; });
    });
    const human = products[type].kind === 'human';
    for (const key of ['size', 'face', 'skin', 'outfit']) steps[key].hidden = !human;
    for (const key of ['pet_type', 'pet_eyes', 'pet_size']) steps[key].hidden = human;
    const ordered = human ? [steps.size] : [steps.pet_type, steps.pet_size, steps.pet_eyes];
    for (let i = 0; i < (products[type].figures || 1); i++) {
      if (products[type].figures === 2) {
        const title = document.createElement('p'); title.className = 'apex-figure-label'; title.textContent = `Figura ${i + 1}`; ordered.push(title);
      }
      for (const key of human ? ['face', 'skin', 'outfit', 'extras'] : ['extras']) {
        const step = i ? steps[key].cloneNode(true) : steps[key];
        step.dataset.apexFigure = String(i);
        if (i) qa('[name], [id], [for]', step).forEach(el => {
          if (el.name) el.name = el.name.replace(/^mf_/, 'mf_partner_2_');
          if (el.id) el.id += '-partner-2';
          if (el.htmlFor) el.htmlFor += '-partner-2';
        });
        ordered.push(step);
      }
    }
    ordered.push(steps.pets, steps.box, steps.mini, steps.extra);
    ordered.forEach(step => { if (step) grid.append(step); });
    qa('article', grid).forEach(step => {
      const toggle = q(':scope > button', step);
      const body = Array.from(step.children).find(el => Array.from(el.attributes).some(a => /data-mf-.*-(body|panel)$/.test(a.name)));
      if (toggle && body) { toggle.dataset.apexToggle = ''; body.dataset.apexBody = ''; }
      if (step.hidden) qa('input,select,textarea', step).forEach(el => { el.disabled = true; });
    });
    qa('[data-apex-figure]').forEach(step => {
      const prefix = Number(step.dataset.apexFigure) ? 'mf_partner_2_' : 'mf_';
      for (const [key, value] of [['eyes_option', 'ojos_standard'], ['mouth_option', 'sin_boca']]) setRadio(prefix + key, value, step);
    });
    setRadio('mf_size_option', 'tamano_6cm'); setRadio('mf_pet_size_option', '6-cm');
    setRadio('mf_pet_eyes', 'estandar'); setRadio('mf_pets_option', 'sin_mascota');
    setRadio('mf_mini_option', 'sin'); setRadio('mf_mini_size_option', 'mini_size_4cm');
    setRadio('mf_box_option', 'caja_standard'); setRadio('mf_shipping_option', 'envio_estandard');
    const giftFile = q('.mf-gift-upsell-modal__upload-input'); giftFile.name = 'gift_image';
    q('.mf-gift-upsell-modal__input').name = 'gift_text';
    qa('.pet-type,.pet-size').forEach(el => { el.setAttribute('role', 'button'); el.tabIndex = 0; });
    setupMvpControls();
    initializeUploads(); sync(); gallery();
    const first = ordered.find(el => el.matches('article'));
    if (first) openStep(first, true);
    const url = new URL(location.href); url.searchParams.set('tipo', type); history.replaceState(null, '', url);
    status(''); emit('apex:product-changed');
  }

  function setupMvpControls() {
    q('.single_add_to_cart_button').textContent = 'Revisar pedido';
    setText('.mf-fixed-cart-bar__button-full,.mf-fixed-cart-bar__button-short', 'Revisar pedido');
    const errors = document.createElement('div'); errors.id = 'apex-validation-errors'; errors.role = 'alert'; errors.tabIndex = -1; errors.hidden = true;
    q('[data-mf-summary-form]').prepend(errors);
    const date = q('[data-mf-shipping-date]');
    date.classList.add('apex-native-date'); date.removeAttribute('aria-hidden'); date.removeAttribute('tabindex'); date.lang = 'pt-BR'; date.required = true;
    q('label[for="mf-shipping-date-native"]').textContent = 'Quando você precisa receber?';
    q('[data-mf-shipping-date-trigger]').replaceChildren(date);
    setText('[data-mf-shipping-date-hint]', 'Informe a data desejada. A disponibilidade será confirmada posteriormente.');
    const dateError = document.createElement('p'); dateError.id = 'apex-date-error'; dateError.role = 'alert'; dateError.hidden = true; date.after(dateError); date.setAttribute('aria-describedby', dateError.id);
    q('.mf-product-delivery-date__lead')?.remove();
    const dateSummary = document.createElement('p'); dateSummary.dataset.apexDateSummary = ''; q('[data-mf-summary-price]').parentElement.after(dateSummary);
    // SIMPLIFY: raça opcional em texto, sem base externa ou seletores vazios.
    qa('[data-mf-pet-breed-select], [data-mf-pet-breed]').forEach(select => {
      const input = document.createElement('input'); input.type = 'text'; input.name = select.name; input.id = select.id;
      input.placeholder = 'Raça (opcional)'; input.setAttribute('aria-label', 'Raça (opcional)'); input.className = 'apex-breed'; select.replaceWith(input);
      input.parentElement.hidden = false; input.parentElement.style.display = '';
      const section = input.closest('.raza-section'); if (section) section.style.display = '';
      input.parentElement.querySelector('.raza-dropdown__trigger')?.remove();
    });
    qa('[data-mf-special-other-card], [data-mf-special-other-panel]').forEach(node => { node.hidden = true; qa('input,textarea', node).forEach(input => { input.disabled = true; }); });
    qa('[data-mf-special-accessories-grid]').forEach(node => node.classList.remove('is-collapsed'));
    q('[data-mf-box-custom-radio]').value = 'custom';
    const removeGift = document.createElement('button'); removeGift.type = 'button'; removeGift.dataset.apexRemoveGift = ''; removeGift.textContent = 'Remover caneca do pedido'; removeGift.hidden = true;
    q('[data-mf-gift-upsell-open]').after(removeGift);
  }

  function openStep(step, open) {
    const button = q('[data-apex-toggle]', step), body = q('[data-apex-body]', step);
    if (!button || !body) return;
    body.hidden = !open; button.setAttribute('aria-expanded', String(open)); step.classList.toggle('is-open', open);
  }
  function gallery(index) {
    const legend = { individual: 'Individual', pareja: 'Pareja', boda: 'Boda', mascota: 'Mascota' }[state.product];
    const slides = qa('[data-mf-product-slide]'), thumbs = qa('[data-mf-product-thumb]');
    const available = slides.map((slide, i) => slide.dataset.mfSlideLegend === legend || !slide.dataset.mfSlideLegend ? i : -1).filter(i => i >= 0);
    const active = available.includes(index) ? index : available[0];
    slides.forEach((slide, i) => { slide.hidden = i !== active; slide.classList.toggle('is-active', i === active); });
    thumbs.forEach((thumb, i) => { thumb.hidden = !available.includes(i); thumb.classList.toggle('is-active', i === active); thumb.setAttribute('aria-selected', String(i === active)); });
  }
  function initializeUploads() {
    qa('input[type="file"]').forEach(input => {
      if (input.dataset.apexUpload) return;
      input.dataset.apexUpload = crypto.randomUUID();
      const error = document.createElement('p'); error.className = 'apex-upload-error'; error.role = 'alert'; error.hidden = true;
      error.id = `upload-error-${input.dataset.apexUpload}`; input.setAttribute('aria-describedby', error.id);
      const list = document.createElement('div'); list.className = 'apex-upload-list'; list.dataset.apexUploadList = input.dataset.apexUpload;
      // Fora do label para o botão Remover não reabrir o seletor de arquivos.
      (input.closest('label') || input).after(error, list);
    });
  }
  function renderUploads() {
    qa('input[type="file"]').forEach(input => {
      const owner = fieldOwner(input);
      const list = q(`[data-apex-upload-list="${input.dataset.apexUpload}"]`);
      if (!list) return;
      list.replaceChildren();
      for (const entry of store.list().filter(e => e.owner.itemId === owner.itemId && e.owner.field === owner.field)) {
        const figure = document.createElement('figure'); const img = document.createElement('img'); img.src = entry.previewUrl; img.alt = 'Prévia da imagem selecionada';
        const caption = document.createElement('figcaption'); caption.textContent = entry.name;
        const remove = document.createElement('button'); remove.type = 'button'; remove.dataset.apexRemoveUpload = entry.id; remove.textContent = 'Remover imagem';
        figure.append(img, caption, remove); list.append(figure);
      }
    });
  }
  function fields(root, prefix = '') {
    const output = {};
    qa('input[name],textarea[name],select[name]', root).forEach(el => {
      if (el.disabled || el.type === 'file' || el.type === 'hidden' || (['radio', 'checkbox'].includes(el.type) && !el.checked)) return;
      const key = nameOf(el);
      if (prefix && !key.startsWith(prefix)) return;
      const value = el.type === 'checkbox' ? true : el.value;
      if (key.endsWith('[]')) (output[key] ||= []).push(value); else output[key] = value;
    });
    return output;
  }
  function sync() {
    revision++; orderDraft = null;
    state.quantity = Number(read('quantity', form, 1));
    state.size = cm(read(state.product === 'mascota' ? 'mf_pet_size_option' : 'mf_size_option'), 6);
    const c = state.customizations;
    const petCount = { sin_mascota: 0, una_mascota: 1, dos_mascotas: 2, tres_mascotas: 3 }[read('mf_pets_option')] || 0;
    c.pets = Array.from({ length: petCount }, (_, i) => ({ type: read(`mf_pet_${i + 1}_type`), size: cm(read(`mf_pet_${i + 1}_size`), 4), fields: fields(q(`[data-mf-pets-group="${i + 1}"]`)) }));
    qa('[data-mf-pets-group]').forEach(el => { el.hidden = Number(el.dataset.mfPetsGroup) > petCount; });
    for (let i = 0; i < (c.figures.length || 1); i++) {
      const f = c.figures[i] || c.pet;
      const roots = qa(`[data-apex-figure="${i}"]`);
      const data = Object.assign({}, ...roots.map(root => fields(root)));
      const prefix = i ? 'mf_partner_2_' : 'mf_';
      f.fields = data;
      if (data.mf_face_option !== 'otro') delete f.fields.mf_face_custom_color;
      f.eyes = c.figures.length ? data.mf_eyes_option || 'ojos_standard' : read('mf_pet_eyes', document, 'estandar');
      f.mouth = data.mf_mouth_option || 'sin_boca'; f.glasses = Boolean(data.mf_face_glasses_enabled);
      f.accessories = Number(read(prefix + 'accessories_quantity') || 0);
      f.logos = Number(read(prefix + 'logos_quantity') || 0);
      f.specialAccessories = checked(prefix + 'special_accessories[]');
    }
    c.pet.fields = { ...c.pet.fields, ...fields(q('[data-mf-pet-step="pet_type"]')), ...fields(q('[data-mf-pet-step="pet_eyes"]')) };
    if (c.pet.eyes !== 'otro') delete c.pet.fields.mf_pet_eyes_custom_color;
    c.minis.quantity = cm(read('mf_mini_option'), 0); c.minis.size = cm(read('mf_mini_size_option'), 4);
    c.minis.fields = fields(q('[data-mf-mini-step]'));
    c.extras = checked('mf_extra_option[]');
    c.box.type = read('mf_box_option', document, 'caja_standard');
    if (state.size === 20 || (c.figures.length === 2 && c.box.type === 'caja_personalizada')) {
      c.box.type = 'caja_standard'; setRadio('mf_box_option', c.box.type);
    }
    c.box.dedication = c.box.type !== 'caja_standard' && Boolean(read('mf_box_dedication_enabled'));
    c.box.fields = c.box.type === 'caja_standard' ? {} : fields(q('[data-mf-box-step]'));
    if (c.box.fields.mf_box_color !== 'custom') delete c.box.fields.mf_box_color_custom;
    if (!c.box.dedication) delete c.box.fields.mf_box_dedication_text;
    c.fields = fields(q('[data-mf-extra-step]'));
    state.shipping = { option: read('mf_shipping_option', document, 'envio_estandard'), date: read('mf_shipping_date'), flexible: Boolean(read('mf_shipping_flexible_date')) };
    state.notes = read('mf_instructions_text');
    state.gift.imageSource = read('mf_gift_upsell_image_source', document, 'sketch'); state.gift.text = read('gift_text');
    updateConditionalFields();
    // Arquivos de opções retiradas não podem escapar como anexos órfãos do pedido.
    const activeOwners = qa('input[type="file"]').filter(input => !input.disabled).map(fieldOwner);
    store.list().filter(entry => !activeOwners.some(owner => owner.itemId === entry.owner.itemId && owner.field === entry.owner.field)).forEach(entry => store.remove(entry.id));
    state.uploads = store.metadata().filter(u => u.owner.itemId !== 'gift-1' || (state.gift.enabled && state.gift.imageSource === 'upload'));
    q('[data-apex-remove-gift]').hidden = !state.gift.enabled;
    setText('[data-apex-date-summary]', `Data necessária: ${displayDate(state.shipping.date)}`);
    const dateError = validateDesiredDate(state.shipping.date);
    q('#apex-date-error').hidden = !state.shipping.date || !dateError;
    q('#apex-date-error').textContent = dateError?.message || '';
    try {
      state.pricing = calculatePrice(state);
      setText('[data-mf-summary-price],[data-mf-fixed-bar-price],[data-mf-fixed-bar-price-lead],.mf-product-sales__price ins .amount', money(state.pricing.unitTotalCents));
      setText('.mf-product-sales__price del .amount', money(Math.round(state.pricing.unitTotalCents * pricing.comparePriceRatio)));
      setText('[data-mf-installment-price]', money(Math.round(state.pricing.unitTotalCents / pricing.installments)));
      setText('[data-mf-summary-selection]', products[state.product].label);
      setText('.mf-product-summary__title-meta', ` · ${state.size} cm · ${pricing.shippingDays[state.shipping.option]} dias`);
      const list = q('[data-mf-breakdown-list]'); list.replaceChildren();
      state.pricing.lines.filter(line => line.cents).forEach(line => { const li = document.createElement('li'); li.textContent = `${line.label}: ${money(line.cents)}`; list.append(li); });
      const total = document.createElement('li'); total.textContent = `Subtotal (${state.quantity} × figura configurada${state.gift.enabled ? ' + caneca' : ''}): ${money(state.pricing.totalCents)}`; list.append(total);
    } catch (error) { state.pricing = null; status(error.message); }
    renderUploads(); emit('apex:state-changed');
  }

  function updateConditionalFields() {
    const c = state.customizations;
    const paid = c.box.type !== 'caja_standard';
    q('[data-mf-box-size-notice]').hidden = state.size !== 20;
    q('[data-mf-mini-size-section]').hidden = !c.minis.quantity;
    q('[data-mf-pet-type-extra]').hidden = !read('mf_pet_type');
    q('[data-mf-pet-eyes-custom-selector]').hidden = c.pet.eyes !== 'otro';
    qa('[data-mf-pets-group]').forEach(slot => {
      qa('input[type="file"]', slot).forEach(input => { input.disabled = slot.hidden; });
    });
    qa('[data-apex-figure]').forEach(root => {
      const glasses = q('[data-mf-face-glasses-panel]', root);
      if (glasses) {
        glasses.hidden = !q('[data-mf-face-glasses-toggle]', root).checked;
        qa('input', glasses).forEach(input => { input.disabled = glasses.hidden; });
      }
      const custom = q('[data-mf-face-custom-selector]', root);
      if (custom) custom.hidden = !q('[data-mf-face-option-input]:checked', root)?.matches('[data-face-custom-color="true"]');
      const other = q('[data-mf-special-other-panel]', root);
      if (other) { other.hidden = true; qa('input,textarea', other).forEach(input => { input.disabled = true; }); }
    });
    q('[data-mf-box-customization]').hidden = !paid;
    qa('[data-mf-box-customization-field]').forEach(el => { el.disabled = !paid; });
    q('[data-mf-box-dedication-text-wrap]').hidden = !c.box.dedication;
    qa('[data-mf-box-dedication-text],[data-mf-box-dedication-file-input]').forEach(el => { el.disabled = !c.box.dedication; });
    byName('mf_box_option').forEach(input => {
      input.closest('label').hidden = state.size === 20 || (c.figures.length === 2 && input.value === 'caja_personalizada');
      const label = q('.mf-box-option__price', input.closest('label'));
      if (label && pricing.box[input.value][state.size] != null) label.textContent = `+${money(pricing.box[input.value][state.size])}`;
    });
    qa('[data-mf-accessory-extras-panel]').forEach(panel => {
      const slug = panel.dataset.mfAccessoryExtrasPanel;
      const prefix = figureIndex(panel) ? 'mf_partner_2_' : 'mf_';
      panel.hidden = !checked(prefix + 'special_accessories[]').includes(slug);
      qa('input,textarea', panel).forEach(input => { input.disabled = panel.hidden; });
    });
    // Os campos nativos de data permanecem acessíveis, sem recriar calendário de terceiros.
    const date = q('[data-mf-shipping-date]');
    date.min = minimumDesiredDate();
    qa('[data-mf-accessories-details],[data-mf-logos-details]').forEach(panel => { panel.hidden = !panel.querySelector('[data-apex-unit]'); });
    qa('.mf-custom-color-selector').forEach(panel => {
      const input = q('input[type="color"]', panel); if (!input) return;
      panel.style.setProperty('--mf-custom-color', input.value);
      const code = q('.mf-custom-color-selector__code', panel); if (code) code.textContent = input.value.toUpperCase();
    });
    setText('[data-mf-box-color-code]', read('mf_box_color_custom').toUpperCase());
  }

  function dynamicFields(container, count, base, label) {
    for (const child of Array.from(container.children)) if (Number(child.dataset.apexUnit) > count) {
      qa('input[type="file"]', child).forEach(input => {
        const owner = fieldOwner(input); store.list().filter(e => e.owner.itemId === owner.itemId && e.owner.field === owner.field).forEach(e => store.remove(e.id));
      }); child.remove();
    }
    const prefix = figureIndex(container) ? 'mf_partner_2_' : 'mf_';
    for (let i = 1; i <= count; i++) {
      if (q(`[data-apex-unit="${i}"]`, container)) continue;
      const block = document.createElement('div'); block.className = 'apex-field'; block.dataset.apexUnit = String(i);
      const title = document.createElement('label'); title.textContent = `${label} ${i}`;
      const detail = document.createElement('textarea'); detail.name = `${prefix}${base}_detail_${i}`; detail.rows = 2; title.append(detail);
      const fileLabel = document.createElement('label'); fileLabel.textContent = base === 'mini_unit' ? 'Foto de referência (obrigatória)' : 'Imagem (opcional)';
      const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/jpeg,image/png,image/webp,image/gif'; file.name = `${prefix}${base}_upload_${i}`; fileLabel.append(file);
      block.append(title, fileLabel); container.append(block);
    }
    initializeUploads();
  }

  function focusField(field) {
    const match = field.match(/^figure-(\d+)\.(.+)$/);
    const name = match ? (match[1] === '2' ? match[2].replace(/^mf_/, 'mf_partner_2_') : match[2]) : field;
    let input = byName(name)[0];
    const pet = name.match(/^mf_pet_(\d+)_(type|size)$/);
    if (pet) input = q(`[data-mf-pets-group="${pet[1]}"] .pet-${pet[2]}`);
    if (field === 'size') input = byName(state.product === 'mascota' ? 'mf_pet_size_option' : 'mf_size_option')[0];
    if (!input) { q('#apex-validation-errors').focus(); return; }
    const step = input.closest('article'); if (step) openStep(step, true);
    if (input.closest('[data-mf-gift-upsell-modal]')) q('[data-mf-gift-upsell-open]').click();
    input.setAttribute('aria-invalid', 'true'); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); input.focus({ preventScroll: true });
  }
  function productionValidation() {
    const result = validateOrderForProduction(state);
    if (pendingUploads) result.errors.push({ field: 'uploads', code: 'UPLOAD_PENDING', message: 'Aguarde a validação das imagens.' });
    for (const [key, failure] of uploadFailures) {
      const input = qa('[data-apex-upload]').find(el => el.dataset.apexUpload === key);
      if (input?.isConnected && !input.disabled) result.errors.push(failure);
    }
    result.valid = !result.errors.length; return result;
  }
  function showErrors(errors) {
    const box = q('#apex-validation-errors'); box.replaceChildren(); box.hidden = !errors.length;
    qa('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    if (!errors.length) return;
    const title = document.createElement('p'); title.textContent = 'Revise os campos abaixo antes de gerar o pedido:'; box.append(title);
    const list = document.createElement('ul');
    for (const error of errors) {
      const li = document.createElement('li'), button = document.createElement('button'); button.type = 'button'; button.textContent = error.message; button.dataset.errorCode = error.code;
      button.addEventListener('click', () => focusField(error.field)); li.append(button); list.append(li);
    }
    box.append(list); box.scrollIntoView({ block: 'center' }); box.focus({ preventScroll: true });
  }
  function labelFor(name, value) {
    if (!value) return 'Não informado';
    const input = byName(name).find(el => el.value === value);
    const fromData = input && Object.entries(input.dataset).find(([key]) => key.endsWith('Label'))?.[1];
    const label = input?.closest('label');
    return fromData || (label && q('[class$="__title"],[class$="__label"]', label)?.textContent.trim()) || (name === 'mf_box_color' ? value : 'Opção selecionada');
  }
  function generateDraft() {
    // Não faz sync: qualquer alteração desde a revisão invalida o snapshot.
    const validation = productionValidation();
    if (reviewedRevision !== revision) validation.errors.push({ field: 'order', code: 'REVIEW_STALE', message: 'A configuração mudou. Revise o pedido novamente.' });
    if (validation.errors.length) { q('#apex-order-review').close(); showErrors(validation.errors); return; }
    const result = createOrderDraft(state);
    if (!result.valid) { q('#apex-order-review').close(); showErrors(result.errors); return; }
    orderDraft = result.orderDraft;
    q('#apex-order-review').close();
    q('#apex-order-preview pre').textContent = JSON.stringify(safeOrderSummary(orderDraft), null, 2);
    q('#apex-order-preview').showModal(); status('Rascunho do pedido montado. Nenhum envio ou pagamento foi realizado.'); emit('apex:order-preview');
  }
  function finalize() {
    sync();
    const validation = productionValidation(); showErrors(validation.errors);
    if (!validation.valid) return;
    reviewedRevision = revision;
    renderOrderReview(q('#apex-order-review'), state, { labelFor, onEdit: () => q('#apex-order-review').close(), onGenerate: generateDraft });
    q('#apex-order-review').showModal();
    q('#apex-order-review h2').focus({ preventScroll: true }); q('#apex-order-review').scrollTop = 0;
  }

  document.addEventListener('submit', event => { event.preventDefault(); event.stopImmediatePropagation(); finalize(); }, true);
  document.addEventListener('click', event => {
    const el = event.target.closest('button,a,[role="button"]');
    if (!el) return;
    if (el.matches('a')) {
      event.preventDefault();
      if (el.dataset.apexExternal) { status('Ligação externa inativa nesta prévia local.'); return; }
      const id = el.getAttribute('href')?.slice(1);
      if (id) document.getElementById(id === 'mf-product-extra-options' ? 'personalizar' : id)?.scrollIntoView({ behavior: 'smooth' });
    }
    if (el.matches('[data-mf-funko-type-option]')) setupProduct(el.dataset.typeValue);
    else if (el.matches('[data-mf-product-thumb]')) gallery(Number(el.dataset.mfProductThumb));
    else if (el.matches('[data-mf-product-next],[data-mf-product-prev]')) {
      const available = qa('[data-mf-product-thumb]').filter(thumb => !thumb.hidden);
      const current = available.findIndex(thumb => thumb.classList.contains('is-active'));
      gallery(Number(available[(current + (el.hasAttribute('data-mf-product-next') ? 1 : -1) + available.length) % available.length].dataset.mfProductThumb));
    }
    else if (el.matches('[data-mf-header-toggle]')) { const menu = q('[data-mf-mobile-menu]'); menu.hidden = !menu.hidden; el.setAttribute('aria-expanded', String(!menu.hidden)); }
    else if (el.matches('[data-mf-outfit-colors-toggle]')) {
      const body = q('[data-mf-outfit-colors-body]', el.parentElement); body.hidden = !body.hidden;
      qa('input', body).forEach(input => { input.disabled = body.hidden; }); el.setAttribute('aria-expanded', String(!body.hidden)); sync();
    }
    else if (el.matches('[data-mf-custom-color-reset]')) {
      const input = q('input[type="color"]', el.closest('.mf-custom-color-selector')); input.value = input.dataset.mfCustomColorDefault; sync();
    }
    else if (el.matches('[data-mf-box-to-delivery]')) q('.mf-product-delivery').scrollIntoView({ behavior: 'smooth' });
    else if (el.matches('[data-apex-toggle]')) openStep(el.closest('article'), el.getAttribute('aria-expanded') !== 'true');
    else if (el.matches('[data-mf-fixed-bar-button]')) finalize();
    else if (el.matches('[data-apex-remove-gift]')) {
      state.gift.enabled = false; store.list().filter(e => e.owner.itemId === 'gift-1').forEach(e => store.remove(e.id)); sync();
    }
    else if (el.matches('[data-apex-discard-upload-error]')) {
      uploadFailures.delete(el.dataset.apexDiscardUploadError); el.parentElement.hidden = true;
    }
    else if (el.matches('[data-apex-remove-upload]')) { event.preventDefault(); store.remove(el.dataset.apexRemoveUpload); sync(); emit('apex:uploads-changed'); }
    else if (el.matches('[data-mf-breakdown-toggle]')) { const body = q('[data-mf-price-breakdown]'); body.hidden = !body.hidden; el.setAttribute('aria-expanded', String(!body.hidden)); }
    else if (el.matches('[data-mf-faq-toggle]')) { const article = el.closest('article'); const body = q('[data-mf-faq-body]', article); const open = el.getAttribute('aria-expanded') !== 'true'; body.hidden = !open; article.classList.toggle('is-open', open); el.setAttribute('aria-expanded', String(open)); }
    else if (el.matches('[data-mf-step-nav-button]')) {
      const step = el.closest('article'); const steps = qa('.mf-product-customizer-grid > article').filter(s => !s.hidden); const next = steps[steps.indexOf(step) + 1];
      if (next) { openStep(step, false); openStep(next, true); next.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } else if (el.matches('[data-mf-extras-tab]')) {
      const root = el.closest('[data-mf-card-kind="extras"]');
      qa('[data-mf-extras-section]', root).forEach(section => { section.hidden = section.dataset.mfExtrasSection !== el.dataset.mfExtrasTab; });
      qa('[data-mf-extras-tab]', root).forEach(button => { const active = button === el; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
    } else if (el.matches('[data-mf-accessories-quantity-option],[data-mf-logos-quantity-option]')) {
      const key = el.hasAttribute('data-mf-accessories-quantity-option') ? 'accessories' : 'logos';
      const count = Number(el.getAttribute(`data-mf-${key}-quantity-option`)); const root = el.closest('[data-mf-card-kind="extras"]');
      q(`[data-mf-${key}-quantity-input]`, root).value = String(count);
      qa(`[data-mf-${key}-quantity-option]`, root).forEach(button => { const active = button === el; button.classList.toggle('is-selected', active); button.setAttribute('aria-pressed', String(active)); });
      dynamicFields(q(`[data-mf-${key}-fields]`, root), count, key === 'accessories' ? 'accessory' : 'logo', key === 'accessories' ? 'Acessório' : 'Logótipo'); sync();
    } else if (el.matches('.pet-type,.pet-size')) {
      const slot = el.closest('[data-mf-pets-group]'); const kind = el.matches('.pet-type') ? 'type' : 'size';
      q(`[data-mf-pet-${kind}-hidden="${slot.dataset.mfPetsGroup}"]`).value = el.getAttribute(kind === 'type' ? 'data-pet-type' : 'data-size');
      qa(`.pet-${kind}`, slot).forEach(button => { button.classList.toggle('is-selected', button === el); button.setAttribute('aria-pressed', String(button === el)); });
      qa('.tamano-section,.foto-section', slot).forEach(section => { section.style.display = ''; }); sync();
    } else if (el.matches('[data-mf-gift-upsell-open]')) {
      q('[data-mf-gift-upsell-modal]').hidden = false; q('[data-mf-gift-upsell-modal]').classList.add('is-open');
      setText('[data-mf-gift-upsell-modal-title]', el.dataset.productTitle); setText('[data-mf-gift-upsell-modal-price]', money(pricing.gift));
      setText('[data-mf-gift-upsell-modal-description]', el.dataset.productDescription);
      q('[data-mf-gift-upsell-modal-image]').src = el.dataset.productImage;
    } else if (el.matches('[data-mf-gift-upsell-close]')) { q('[data-mf-gift-upsell-modal]').hidden = true; }
    else if (el.matches('[data-mf-gift-upsell-modal-submit]')) {
      sync(); const error = q('[data-mf-gift-upsell-modal-error]');
      if (state.gift.imageSource === 'upload' && !store.metadata().some(u => u.owner.itemId === 'gift-1')) { error.hidden = false; error.textContent = 'Adicione uma imagem válida para a caneca.'; return; }
      error.hidden = true; state.gift.enabled = true; q('[data-mf-gift-upsell-modal]').hidden = true; sync(); status('Caneca adicionada ao rascunho local.');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.target.matches('.pet-type,.pet-size') && ['Enter', ' '].includes(event.key)) { event.preventDefault(); event.target.click(); }
    if (event.key === 'Escape') { const modal = q('[data-mf-gift-upsell-modal]'); if (modal) modal.hidden = true; }
  });
  let uploadQueue = Promise.resolve();
  document.addEventListener('change', event => {
    const input = event.target;
    if (input.type === 'file') {
      const files = Array.from(input.files); const owner = fieldOwner(input); input.value = '';
      pendingUploads++;
      uploadQueue = uploadQueue.then(async () => {
        try {
          if (!input.isConnected || input.disabled) return;
          const error = document.getElementById(input.getAttribute('aria-describedby'));
          try { await store.add(owner, files, { multiple: input.multiple }); uploadFailures.delete(input.dataset.apexUpload); error.hidden = true; sync(); emit('apex:uploads-changed'); }
          catch (failure) {
            error.hidden = false; error.textContent = failure.message;
            const discard = document.createElement('button'); discard.type = 'button'; discard.dataset.apexDiscardUploadError = input.dataset.apexUpload; discard.textContent = 'Descartar seleção inválida'; error.append(' ', discard);
            uploadFailures.set(input.dataset.apexUpload, { field: owner.field, code: 'UPLOAD_INVALID', message: failure.message });
          }
        } finally { pendingUploads--; }
      });
      return;
    }
    if (input.name === 'mf_mini_option') dynamicFields(q('[data-mf-mini-units]'), cm(input.value, 0), 'mini_unit', 'Mini');
    if (input.name === 'mf_extra_option[]' && input.checked && input.value.startsWith('base-')) byName(input.name).filter(el => el !== input && el.value.startsWith('base-') && !el.disabled).forEach(el => { el.checked = false; });
    sync();
  });
  document.addEventListener('input', event => {
    if (event.target.matches('[data-mf-box-color-picker]')) q('[data-mf-box-custom-radio]').checked = true;
    if (event.target.matches('input:not([type=file]),textarea,select')) sync();
  });
  window.addEventListener('pagehide', () => store.clear());
  // Somente cópias da representação segura; não expõe File, textos ou mutação do estado.
  window.apexDevelopment = Object.freeze({ inspect: () => safeOrderSummary(buildOrder(state)), validate: () => productionValidation(), inspectDraft: () => orderDraft ? safeOrderSummary(orderDraft) : null });
  setupProduct(Object.hasOwn(products, new URL(location.href).searchParams.get('tipo')) ? new URL(location.href).searchParams.get('tipo') : 'individual');
}
