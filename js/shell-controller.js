import { createOrderState, createFigure } from './state.js';
import { additionalPersonPrice, calculatePrice, formatMoney } from './pricing.js';
import { products } from '../config/products.js';
import { pricing, specialObjectCategories } from '../config/pricing.js';
import { sizes as sizeOptions } from '../config/commercial.js';
import { UploadStore } from './uploads.js';
import { minimumDesiredDate, displayDate } from './date.js';
import { validateOrderForProduction } from './validation.js';
import { renderOrderReview } from './review.js';
import { createOrderDraft, safeOrderSummary } from './order.js';
import { q, all, el, note, show, accordion, reveal } from './shell-dom.js';
import { track } from './analytics.js';

export function startConfigurator() {
  const requested = new URLSearchParams(location.search).get('tipo');
  let state = createOrderState(Object.hasOwn(products, requested) ? requested : 'individual');
  try { const savedPromotion = JSON.parse(localStorage.getItem(pricing.promotion.storageKey) || 'null'); if (savedPromotion?.claimed) state.promotion = { code: pricing.promotion.code, claimed: true }; } catch { localStorage.removeItem(pricing.promotion.storageKey); }
  const uploads = new UploadStore(), uploadErrors = new Map(), pending = new Set();
  let revision = 0, draft = null;
  const grid = q('.mf-product-customizer-grid'), initialGrid = grid.cloneNode(true);
  const box = q('[data-mf-box-step]'), boxTemplate = box.cloneNode(true);
  const errors = q('#validation-errors');
  const roots = ['[data-mf-pets-step]', '[data-mf-extra-step]'];
  const shared = new Map(roots.map(s => [s, q(s, initialGrid)]));
  const uploadViews = new Map();
  const fieldNode = key => all('[data-field]').find(n => n.dataset.field === key && !n.disabled);
  const sync = () => {
    state.uploads = uploads.metadata(); state.pricing = calculatePrice(state);
    const price = formatMoney(state.pricing.totalCents), label = products[state.product].label + ' · ' + state.size + ' cm';
    all('[data-mf-summary-price], [data-mf-fixed-bar-price], [data-mf-cart-drawer-subtotal]').forEach(n => { n.textContent = price; n.setAttribute('aria-live', 'polite'); });
    all('[data-mf-summary-selection], [data-mf-fixed-bar-meta]').forEach(n => n.textContent = label);
    all('[data-mf-fixed-bar-price-lead]').forEach(n => n.textContent = price);
    all('[data-mf-fixed-bar-shipping]').forEach(n => n.textContent = 'Frete a confirmar');
    all('[data-apex-product-price]').forEach(n => n.textContent = formatMoney(pricing.base[n.dataset.apexProductPrice || n.closest('[data-product]')?.dataset.product]));
    all('[data-apex-starting-price]').forEach(n => n.textContent = formatMoney(pricing.base[state.product]));
    const list = q('[data-mf-breakdown-list]');
    if (list) {
      const rows = state.pricing.lines.map(line => { const row = el('li'); row.append(el('span', line.label), el('strong', formatMoney(line.cents))); return row; });
      if (state.pricing.discountCents) { const row = el('li'); row.className = 'apex-discount-line'; row.append(el('span', 'Desconto primeira compra −10%'), el('strong', '− ' + formatMoney(state.pricing.discountCents))); rows.push(row); }
      list.replaceChildren(...rows);
    }
    all('[data-product]').forEach(n => { const active = n.dataset.product === state.product; n.classList.toggle('is-active', active); n.classList.toggle('is-selected', active); n.setAttribute('aria-pressed', String(active)); });
    for (const card of all('[data-apex-figure]', grid)) {
      const prefix = card.dataset.apexFigure, figure = state.customizations.figures.find(f => f.id === prefix);
      const photoCount = state.uploads.filter(u => u.owner.field === prefix + '.mf_face_photo_upload[]').length;
      const face = q('[data-mf-face-summary]', card); if(face) face.textContent = photoCount ? photoCount + ' foto(s) anexada(s)' : 'Envie uma foto';
      const skin = q('[data-mf-skin-summary]', card); if(skin) skin.textContent = 'Seguindo suas fotos';
      const outfit = q('[data-mf-outfit-summary]', card); if(outfit && figure) outfit.textContent = figure.outfit.mode === 'reference' ? 'Seguindo a foto' : 'Roupa personalizada';
      const accessory = q('[data-mf-option-summary]', card), f = figure || state.customizations.pet;
      if(accessory) { const n = f.accessories + f.logos + f.specialAccessories.length; accessory.textContent = n ? n + ' adicional(is)' : 'Opcional'; }
      if(face)card.classList.toggle('is-complete', photoCount > 0);
    }
    all('[data-mf-size-summary], [data-mf-pet-size-summary]').forEach(n => n.textContent = state.size + ' cm');
    document.dispatchEvent(new CustomEvent('apex:change', { detail: { product: state.product, size: state.size, total: price, totalCents: state.pricing.totalCents, subtotalCents: state.pricing.subtotalCents, promotionCode: state.pricing.promotionCode, hasDraft: Boolean(draft) } }));
  };
  const changed = () => { revision++; draft = null; sync(); show(errors, false); };
  const trackField = key => {
    if (key === 'size') track('select_size', { size: state.size, product: state.product });
    else if (key.includes('.outfit')) track('customize_outfit', { product: state.product });
    else if (key === 'mf_pets_option') track('add_pet', { quantity: state.customizations.pets.length });
    else if (key.includes('accessories') || key.includes('.logos')) track('add_accessory', { product: state.product });
    else if (key === 'mf_box_option') track('add_box', { type: state.customizations.box.type });
    else if (key.startsWith('mf_shipping')) track('select_delivery', { flexible: state.shipping.flexible });
  };
  function bind(input, key, value, update, event = 'change') {
    if (!input) return;
    input.disabled = false; input.dataset.field = key;
    if (input.type === 'checkbox' || input.type === 'radio') input.checked = Boolean(value); else input.value = value ?? '';
    const paint = () => { if (!['radio', 'checkbox'].includes(input.type)) return; all('input', input.closest('article') || input.parentElement).filter(n => n.name === input.name).forEach(n => n.closest('label')?.classList.toggle('is-active', n.checked)); };
    paint();
    input.addEventListener(event, () => { update(input.type === 'checkbox' ? input.checked : input.value); paint(); changed(); trackField(key); });
  }
  function removeFields(predicate) {
    uploads.cancelPending();
    for (const entry of uploads.list()) if (predicate(entry.owner.field)) uploads.remove(entry.id);
    for (const key of uploadErrors.keys()) if (predicate(key)) uploadErrors.delete(key);
    for (const key of pending) if (predicate(key)) pending.delete(key);
    for (const [key, render] of uploadViews) if (predicate(key)) render();
  }
  function upload(input, key, label) {
    if (!input) return;
    input.disabled = false; input.dataset.field = key; input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    const multiple = input.multiple = /\[\]$/.test(key);
    const host = el('div', undefined, 'apex-upload-state');
    (input.closest('label') || input).after(host);
    input.setAttribute('aria-label', label);
    const render = () => {
      host.replaceChildren();
      for (const entry of uploads.list().filter(e => e.owner.field === key)) {
        const item = el('div', undefined, 'apex-upload-preview'), img = el('img'); img.src = entry.previewUrl; img.alt = label;
        const remove = el('button', 'Remover', 'apex-remove'); remove.type = 'button'; remove.setAttribute('aria-label', 'Remover foto de ' + label);
        remove.addEventListener('click', () => { uploads.remove(entry.id); changed(); render(); }); item.append(img, el('span', entry.name), remove); host.append(item);
      }
      if (pending.has(key)) host.append(el('p', 'Validando imagem…', 'apex-note'));
      if (uploadErrors.has(key)) {
        const error = el('p', uploadErrors.get(key), 'file-error'), discard = el('button', 'Descartar seleção inválida'); discard.type = 'button';
        discard.addEventListener('click', () => { input.value = ''; uploadErrors.delete(key); changed(); render(); }); host.append(error, discard);
      }
    };
    uploadViews.set(key, render); render();
    input.addEventListener('change', async () => {
      if (!input.files.length) return;
      const currentInput = input; pending.add(key); changed(); render();
      try { await uploads.add({ itemId: 'main-1', field: key }, input.files, { multiple }); if (currentInput.isConnected) { uploadErrors.delete(key); track('upload_reference', { product: state.product, fieldType: key.includes('face') || key.includes('pet') ? 'subject' : 'detail' }); } }
      catch (error) { if (currentInput.isConnected) uploadErrors.set(key, error.message); }
      finally { if (currentInput.isConnected) { pending.delete(key); input.value = ''; changed(); render(); } }
    });
  }
  const named = (root, name) => all('[name]', root).find(n => n.getAttribute('name') === name);
  function inputLine(root, label, key, value, update, type = 'text') {
    const wrap = el('label', label, 'apex-field'), input = el('input'); input.type = type; input.className = 'mf-outfit-step__input'; wrap.append(input); root.append(wrap); bind(input, key, value, update, 'input'); return input;
  }
  function modes(root, f, prefix) {
    for (const [kind, label] of [['outfit', 'Roupa'], ['pose', 'Pose']]) {
      const wrap = el('fieldset', undefined, 'apex-mode'); wrap.append(el('legend', label));
      for (const [value, title] of [['reference', 'Seguir a foto'], ['custom', 'Quero personalizar']]) {
        const choice = el('label', undefined, 'mf-box-option'), radio = el('input'); radio.type = 'radio'; radio.name = prefix + '.' + kind; radio.value = value; radio.className = 'mf-box-option__input';
        choice.append(radio, el('span', title, 'mf-box-option__label')); wrap.append(choice);
        bind(radio, prefix + '.' + kind, f[kind].mode === value, v => { f[kind].mode = v; if (kind === 'outfit' && v === 'reference') removeFields(k => k === prefix + '.mf_outfit_photo_upload[]'); updateVisibility(); });
      }
      const detail = inputLine(wrap, 'Descreva a ' + label.toLowerCase(), prefix + '.' + kind + '.description', f[kind].description, v => f[kind].description = v);
      const updateVisibility = () => { show(detail.parentElement, f[kind].mode === 'custom'); if (kind === 'outfit') show(q('[data-apex-outfit-upload]', root), f.outfit.mode === 'custom'); };
      root.prepend(wrap); updateVisibility();
    }
  }
  function decorate(card, prefix) {
    const n = card.cloneNode(true); n.removeAttribute('hidden'); n.dataset.apexFigure = prefix;
    for (const node of all('[id]', n)) { const old = node.id; node.id = prefix + '-' + old; all('[for]', n).filter(l => l.htmlFor === old).forEach(l => l.htmlFor = node.id); }
    all('input,select,textarea', n).forEach(input => input.disabled = true);
    accordion(n); return n;
  }
  function personCards(f, index) {
    const prefix = f.id;
    const divider = el('h3', 'Pessoa ' + (index + 1), 'mf-person-divider'); divider.dataset.apexPersonHeading = prefix;
    grid.append(divider);
    for (const kind of ['face', 'skin', 'outfit', 'accessories']) {
      const selector = { face: '[data-mf-face-step]', skin: '[data-mf-skin-step]', outfit: '[data-mf-outfit-step]', accessories: '[data-mf-card-kind="extras"]' }[kind];
      const card = decorate(q(selector, initialGrid), prefix); grid.append(card);
      const body = [...card.children].find(n => /__body$/.test(n.classList[0] || ''));
      if (kind === 'face') {
        note(body, 'A aparência segue suas fotos. As amostras de cabelo, olhos e boca abaixo são referências visuais opcionais.');
        upload(named(card, 'mf_face_photo_upload[]'), prefix + '.mf_face_photo_upload[]', 'Fotos da pessoa ' + (index + 1));
        bind(named(card, 'mf_face_detail_text'), prefix + '.appearance', f.fields.appearance, v => f.fields.appearance = v, 'input');
        const photoLabel = named(card, 'mf_face_photo_upload[]')?.closest('label');
        if (photoLabel) { const preview = photoLabel.nextElementSibling; body.prepend(photoLabel, preview); }
        const glasses = named(card, 'mf_face_glasses_enabled');
        bind(glasses, prefix + '.glasses', f.glasses, v => { f.glasses = v; show(q('[data-mf-face-glasses-panel]', card), v); if (!v) removeFields(k => k === prefix + '.mf_face_glasses_upload'); });
        upload(named(card, 'mf_face_glasses_upload'), prefix + '.mf_face_glasses_upload', 'Óculos da pessoa ' + (index + 1)); show(q('[data-mf-face-glasses-panel]', card), f.glasses);
      }
      if (kind === 'skin') note(body, 'Seguiremos o tom de pele das fotos. Esta paleta é somente uma referência visual.');
      if (kind === 'outfit') {
        note(body, 'Sua roupa e pose podem seguir a foto ou receber uma descrição personalizada.');
        const file = named(card, 'mf_outfit_photo_upload[]'); upload(file, prefix + '.mf_outfit_photo_upload[]', 'Roupa da pessoa ' + (index + 1));
        const holder = el('div'); holder.dataset.apexOutfitUpload = ''; const label = file.closest('label'); const preview = label.nextElementSibling; label.before(holder); holder.append(label, preview);
        modes(body, f, prefix);
        show(named(card, 'mf_outfit_detail_text')?.closest('label'), false);
        note(q('[data-mf-outfit-colors]', card), 'As cores finais seguem a foto ou sua descrição.');
      }
      if (kind === 'accessories') configureAccessories(card, f, prefix);
    }
  }
  function configureAccessories(card, f, prefix) {
    card.id = prefix + '-extras';
    for (const [key, stem] of [['accessories', 'accessory'], ['logos', 'logo']]) {
      const area = q('[data-mf-' + key + '-fields]', card), container = q('[data-mf-' + key + '-details]', card);
      const buttons = all('[data-mf-' + key + '-quantity-option]', card);
      const render = () => {
        area.replaceChildren(); show(container, f[key] > 0);
        buttons.forEach(b => { const active = Number(b.getAttribute('data-mf-' + key + '-quantity-option')) === f[key]; b.classList.toggle('is-active', active); b.setAttribute('aria-pressed', String(active)); });
        for (let i = 1; i <= f[key]; i++) {
          const item = el('div', undefined, 'mf-accessories-field');
          inputLine(item, (key === 'logos' ? 'Acessório detalhado ' : 'Acessório simples ') + i, prefix + '.mf_' + stem + '_detail_' + i, f.fields['mf_' + stem + '_detail_' + i], v => f.fields['mf_' + stem + '_detail_' + i] = v);
          const fileLabel = el('label', 'Adicionar foto de referência (opcional)', 'mf-outfit-step__upload'), file = el('input'); file.type = 'file'; fileLabel.append(file); item.append(fileLabel); upload(file, prefix + '.mf_' + stem + '_upload_' + i, 'Acessório ' + i); area.append(item);
        }
      };
      for (const b of buttons) {
        const count = Number(b.getAttribute('data-mf-' + key + '-quantity-option'));
        const badge = q('.mf-accessories-quantity__badge', b); if (badge) badge.textContent = '+' + formatMoney(count * (key === 'logos' ? pricing.logo : pricing.accessory));
        b.dataset.field = prefix + '.' + key; b.dataset.value = count;
        b.addEventListener('click', () => { f[key] = count; removeFields(k => k.startsWith(prefix + '.mf_' + stem + '_upload_') && Number(k.split('_').at(-1)) > count); for (const field of Object.keys(f.fields)) if (field.startsWith('mf_' + stem + '_detail_') && Number(field.split('_').at(-1)) > count) delete f.fields[field]; render(); changed(); });
      }
      render();
    }
    all('[data-mf-extras-tab]', card).forEach(tab => tab.addEventListener('click', () => {
      all('[data-mf-extras-tab]', card).forEach(n => { const active = n === tab; n.classList.toggle('is-active', active); n.setAttribute('aria-selected', String(active)); });
      all('[data-mf-extras-section]', card).forEach(n => show(n, n.dataset.mfExtrasSection === tab.dataset.mfExtrasTab));
    }));
    const specialGrid = q('[data-mf-special-accessories-grid]', card);
    for (const id of ['simples', 'detalhado']) {
      const label = q('[data-mf-special-accessory-card]', card).cloneNode(true), entry = specialObjectCategories[id];
      label.dataset.apexAdditionalCategory = id;
      const input = q('input', label); input.value = id; input.id = prefix + '-object-' + id; input.setAttribute('aria-label', entry.label + ' · +' + formatMoney(entry.cents));
      const text = q('.mf-accessories-specials__label', label) || q('[class*=title]', label); if(text) text.textContent = entry.label;
      specialGrid.prepend(label);
    }
    const expandCatalog = expanded => {
      specialGrid.classList.toggle('is-collapsed', !expanded);
      all('[data-mf-special-accessory-card]', specialGrid).forEach((n,i) => show(n, expanded || i < 6 || q('input',n).checked));
      show(q('[data-mf-accessories-more]', card), !expanded); show(q('[data-mf-accessories-less]', card), expanded);
      const count = q('[data-mf-accessories-more-count]', card); if(count) count.textContent = '+' + (all('[data-mf-special-accessory-card]', specialGrid).length - 6);
    };
    all('[data-mf-accessories-more], [data-mf-accessories-less]', card).forEach(b => b.addEventListener('click', () => expandCatalog(b.hasAttribute('data-mf-accessories-more'))));
    for (const input of all('[data-mf-special-accessory-input]', card)) {
      const id = input.value, entry = specialObjectCategories[id]; if (!entry) continue;
      input.name = prefix + '.specialAccessories';
      const label = input.closest('label'); const cost = q('[class*=price]', label); if (cost) cost.textContent = '+' + formatMoney(entry.cents);
      const detail = q('[data-mf-accessory-extras-panel="' + id + '"]', card) || el('div', undefined, 'mf-accessory-extras-panel apex-object-detail'); detail.dataset.objectDetail = id;
      if (!detail.parentElement) specialGrid.after(detail);
      let text = q('textarea,input[type=text]', detail);
      if (text) bind(text, prefix + '.object_' + id, f.fields['object_' + id] || '', v => f.fields['object_' + id] = v, 'input');
      else text = inputLine(detail, 'Detalhes de ' + entry.label, prefix + '.object_' + id, f.fields['object_' + id] || '', v => f.fields['object_' + id] = v);
      let file = q('input[type=file]', detail);
      if (!file) { const fileLabel = el('label', 'Foto opcional', 'mf-outfit-step__upload'); file = el('input'); file.type = 'file'; fileLabel.append(file); detail.append(fileLabel); }
      upload(file, prefix + '.mf_special_accessory_extra_photo_' + id, entry.label);
      bind(input, prefix + '.specialAccessories', f.specialAccessories.includes(id), checked => {
        if (checked) { f.specialAccessories.push(id); f.fields['object_' + id] ||= entry.label; text.value = f.fields['object_' + id]; }
        else { f.specialAccessories = f.specialAccessories.filter(v => v !== id); delete f.fields['object_' + id]; removeFields(k => k === prefix + '.mf_special_accessory_extra_photo_' + id); }
        show(detail, checked); label.classList.toggle('is-selected', checked);
      }); show(detail, input.checked);
    }
    expandCatalog(false);
    note(q('[data-mf-special-other-card]', card), 'Sob consulta');
    note(q('[data-mf-option-panel]', card), 'Escolha apenas os detalhes que fazem sentido para a sua história.');
  }
  function sizes(card) {
    accordion(card, true);
    all('input[type=radio]', card).forEach(input => {
      const cm = Number(input.value.match(/\d+/)?.[0]); if (!Object.hasOwn(pricing.productSize, cm)) return;
      input.name = 'apex-size'; input.dataset.value = cm;
      const option = sizeOptions.find(item => item.cm === cm), label = input.closest('label');
      const subtitle = q('.mf-size-option__subtitle', label); if (subtitle) subtitle.textContent = option.label;
      const badge = q('.mf-size-option__badge', label); if (badge) badge.textContent = 'Recomendado';
      label.classList.toggle('mf-size-option--featured', cm === 10);
      const price = q('[class*=price]', input.closest('label')); if (price) price.textContent = formatMoney(pricing.productSize[cm][state.product] + state.customizations.additionalPeople * additionalPersonPrice(cm));
      bind(input, 'size', state.size === cm, () => { state.size = cm; });
    });
  }
  function pets(card) {
    accordion(card);
    const radios = all('input[name="mf_pets_option"]', card);
    const render = () => {
      all('[data-mf-pets-group]', card).forEach(slot => {
        const i = Number(slot.dataset.mfPetsGroup), pet = state.customizations.pets[i - 1]; show(slot, Boolean(pet)); if (!pet) return;
        all('[data-pet-type]', slot).forEach(type => { type.classList.toggle('is-selected', type.dataset.petType === pet.type); type.setAttribute('aria-pressed', String(type.dataset.petType === pet.type)); });
      });
    };
    radios.forEach((input, count) => { input.dataset.value = count; return bind(input, 'mf_pets_option', state.customizations.pets.length === count, () => {
      state.customizations.pets = Array.from({ length: count }, (_, i) => state.customizations.pets[i] || { type: '', size: 4, fields: {} });
      removeFields(k => /^mf_pet_\d+_/.test(k) && Number(k.match(/^mf_pet_(\d+)_/)[1]) > count); render();
    }); });
    all('[data-mf-pets-group]', card).forEach(slot => {
      const i = Number(slot.dataset.mfPetsGroup);
      all('[data-pet-type]', slot).forEach(type => {
        type.role = 'button'; type.tabIndex = 0; type.dataset.field = 'mf_pet_' + i + '_type'; type.dataset.value = type.dataset.petType;
        const choose = () => { const pet = state.customizations.pets[i - 1]; if (pet) { pet.type = type.dataset.petType; render(); changed(); } };
        type.addEventListener('click', choose); type.addEventListener('keydown', e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); choose(); } });
      });
      upload(named(slot, 'mf_pet_' + i + '_photo[]'), 'mf_pet_' + i + '_photo[]', 'Pet adicional ' + i);
      const text = named(slot, 'mf_pet_' + i + '_detail');
      bind(text, 'mf_pet_' + i + '_detail', state.customizations.pets[i - 1]?.fields.details, v => { if (state.customizations.pets[i - 1]) state.customizations.pets[i - 1].fields.details = v; }, 'input');
    }); render();
    note(q('[class*="__body"]', card), 'Cada pet adicional tem 4 cm e custa ' + formatMoney(pricing.additionalPets[1]) + '.');
  }
  function included(card) {
    accordion(card); const c = state.customizations;
    const baseText = named(card, 'mf_extra_text_data');
    bind(baseText, 'mf_extra_text_data', c.fields.mf_extra_text_data, v => c.fields.mf_extra_text_data = v, 'input');
    const date = inputLine(q('[class*="__body"]', card), 'Data para gravar na base', 'baseDate', c.fields.baseDate, v => c.fields.baseDate = v, 'date');
    const render = () => {
      show(baseText?.closest('label') || baseText?.parentElement, c.extras.length > 0); show(date.parentElement, c.extras.includes('base-com-nome-data'));
      all('input[name="mf_extra_option[]"]', card).forEach(input => { if (Object.hasOwn(pricing.extras, input.value)) input.checked = c.extras.includes(input.value); });
    };
    all('input[name="mf_extra_option[]"]', card).forEach(input => {
      if (!Object.hasOwn(pricing.extras, input.value)) { const label = input.closest('label'); note(label, input.value === 'base-de-suporte' ? 'Base padrão · referência de composição' : 'Disponível sob consulta'); return; }
      const cost = q('[class*=price]', input.closest('label')); if (cost) cost.textContent = '+' + formatMoney(pricing.extras[input.value]);
      bind(input, 'mf_extra_option[]', c.extras.includes(input.value), checked => { c.extras = checked ? [input.value] : []; if (!checked) c.fields = {}; render(); });
    }); render();
  }
  function packaging() {
    const c = state.customizations.box;
    box.replaceChildren(...[...boxTemplate.cloneNode(true).childNodes]);
    all('input,select,textarea', box).forEach(n => n.disabled = true);
    const render = () => { show(q('[data-mf-box-customization]', box), c.type !== 'caja_standard'); show(q('[data-mf-box-dedication-text-wrap]', box), c.dedication); };
    all('[data-mf-box-option-input]', box).forEach(input => {
      if (!Object.hasOwn(pricing.box, input.value)) { note(input.closest('label'), 'Disponível sob consulta'); return; }
      const cost = q('[class*=price]', input.closest('label')); if (cost) cost.textContent = input.value === 'caja_standard' ? 'Padrão' : '+' + formatMoney(pricing.box[input.value][state.size]);
      bind(input, 'mf_box_option', c.type === input.value, v => { c.type = v; if (v === 'caja_standard') { c.dedication = false; c.fields = {}; removeFields(k => k === 'mf_box_dedication_image'); named(box, 'mf_box_dedication_enabled').checked = false; all('input[type=text],textarea', box).forEach(n => n.value = ''); } render(); });
    });
    for (const name of ['mf_box_character_name', 'mf_box_number', 'mf_box_collection_name', 'mf_box_dedication_text']) bind(named(box, name), name, c.fields[name], v => c.fields[name] = v, 'input');
    all('input[name=mf_box_color]', box).forEach(input => bind(input, 'mf_box_color', c.fields.mf_box_color === input.value, v => c.fields.mf_box_color = v));
    bind(named(box, 'mf_box_color_custom'), 'mf_box_color_custom', c.fields.mf_box_color_custom || '#cc1233', v => c.fields.mf_box_color_custom = v, 'input');
    bind(named(box, 'mf_box_dedication_enabled'), 'mf_box_dedication_enabled', c.dedication, v => { c.dedication = v; if (!v) { delete c.fields.mf_box_dedication_text; removeFields(k => k === 'mf_box_dedication_image'); } render(); });
    upload(named(box, 'mf_box_dedication_image'), 'mf_box_dedication_image', 'Dedicatória da caixa');
    all('[data-mf-box-size-notice], [data-mf-box-size-notice-6cm], [data-mf-box-zero-notice]', box).forEach(n => { const title = q('.mf-box-step__size-notice-title', n), text = q('.mf-box-step__size-notice-text', n); if(title) title.textContent = 'Embalagem feita para proteger'; if(text) text.textContent = 'A opção escolhida acompanha o tamanho da sua miniatura.'; show(n, n.hasAttribute('data-mf-box-size-notice')); });
    q('[data-mf-box-to-delivery]', box)?.addEventListener('click', () => reveal(q('#needed-date'))); render();
  }
  function render() {
    uploads.cancelPending(); pending.clear(); uploadViews.clear(); grid.replaceChildren();
    const petMode = state.product === 'pet';
    const size = q(petMode ? '[data-mf-pet-size-step]' : '[data-mf-size-step]', initialGrid).cloneNode(true); grid.append(size); sizes(size);
    if (petMode) {
      const type = decorate(q('[data-mf-pet-step="pet_type"]', initialGrid), 'main-pet'); grid.prepend(type);
      all('input[name=mf_pet_type]', type).forEach(input => bind(input, 'mf_pet_type', input.value === state.customizations.pet.fields.mf_pet_type, v => state.customizations.pet.fields.mf_pet_type = v));
      upload(named(type, 'mf_pet_photo[]'), 'mf_pet_photo[]', 'Fotos do pet');
      bind(named(type, 'mf_pet_detail'), 'mf_pet_detail', state.customizations.pet.fields.details, v => state.customizations.pet.fields.details = v, 'input');
      const eyes = decorate(q('[data-mf-pet-step="pet_eyes"]', initialGrid), 'main-pet'); grid.append(eyes); note(q('[class*="__body"]', eyes), 'Os olhos seguem a foto. As amostras são referências visuais.');
      const accessories = decorate(q('[data-mf-card-kind="extras"]', initialGrid), 'figure-1'); grid.append(accessories); configureAccessories(accessories, state.customizations.pet, 'figure-1');
      for (const kind of ['pet_accessories', 'pet_extras']) { const ref = decorate(q('[data-mf-pet-step="' + kind + '"]', initialGrid), 'pet-reference'); grid.append(ref); note(q('[class*="__body"]', ref), 'Referências visuais. Selecione e descreva os adicionais no painel Acessórios acima.'); }
    } else state.customizations.figures.forEach(personCards);
    const people = el('article', undefined, 'mf-mini-step apex-people');
    people.append(el('h3', 'Mais alguém nessa história?', 'mf-mini-step__title'));
    const choices = el('div', undefined, 'mf-mini-options');
    for (let n = 0; n <= pricing.maxAdditionalPeople; n++) {
      const label = el('label', undefined, 'mf-mini-option'), input = el('input'); input.type = 'radio'; input.name = 'additional-people'; input.value = n;
      const choice = n ? `+${n} pessoa(s) · +${formatMoney(n * additionalPersonPrice(state.size))}` : 'Sem pessoas adicionais';
      label.append(input, el('span', choice, 'mf-mini-option__label')); choices.append(label);
      bind(input, 'figures', n === state.customizations.additionalPeople, value => {
        state.customizations.additionalPeople = Number(value); const count = products[state.product].figures + Number(value);
        state.customizations.figures = Array.from({ length: count }, (_, i) => state.customizations.figures[i] || createFigure(i));
        removeFields(k => /^figure-\d+\./.test(k) && Number(k.match(/^figure-(\d+)/)[1]) > count); render();
      });
    }
    people.append(choices); show(people, !petMode); grid.append(people);
    for (const [selector, template] of shared) {
      const card = template.cloneNode(true); all('input,select,textarea', card).forEach(n => n.disabled = true); grid.append(card);
      if (selector.includes('pets')) pets(card);
      else if (selector.includes('extra')) included(card);
    }
    // Preserve alternate original regions as templates, without inactive form controls in the active order.
    const alternate = document.createElement('template'); alternate.id = 'apex-alternate-original-regions';
    for (const selector of [petMode ? '[data-mf-size-step]' : '[data-mf-pet-size-step]', ...(!petMode ? ['[data-mf-pet-step="pet_type"]', '[data-mf-pet-step="pet_eyes"]', '[data-mf-pet-step="pet_accessories"]', '[data-mf-pet-step="pet_extras"]'] : ['[data-mf-face-step]', '[data-mf-skin-step]', '[data-mf-outfit-step]'])]) alternate.content.append(q(selector, initialGrid).cloneNode(true));
    grid.append(alternate); packaging(); sync();
  }
  function validation() {
    state.uploads = uploads.metadata(); state.pricing = calculatePrice(state);
    const result = validateOrderForProduction(state);
    for (const [field, message] of uploadErrors) result.errors.push({ field, code: 'UPLOAD_SELECTION', message });
    for (const field of pending) result.errors.push({ field, code: 'UPLOAD_PENDING', message: 'Aguarde a validação da imagem.' });
    result.valid = result.errors.length === 0; return result;
  }
  function report(result) {
    errors.replaceChildren(el('h3', 'Confira estes detalhes antes de continuar'));
    for (const error of result.errors) { const b = el('button', error.message); b.type = 'button'; b.addEventListener('click', () => reveal(fieldNode(error.field))); errors.append(b); }
    show(errors, true); errors.scrollIntoView({ behavior: 'smooth', block: 'center' }); errors.focus();
  }
  function review() {
    const result = validation(); if (!result.valid) return report(result);
    track('review_order', { product: state.product, value: state.pricing.totalCents / 100, currency: state.pricing.currency });
    track('begin_checkout', { product: state.product, value: state.pricing.totalCents / 100, currency: state.pricing.currency });
    const reviewedRevision = revision, dialog = q('#order-review');
    renderOrderReview(q('#review-content'), structuredClone(state), { uploads: uploads.list(), onEdit: () => dialog.close(), onGenerate: () => {
      if (revision !== reviewedRevision) { dialog.close(); return report({ errors: [{ field: 'notes', message: 'A configuração mudou. Revise novamente antes de preparar o pedido.' }] }); }
      const checked = validation(); if (!checked.valid) { dialog.close(); return report(checked); }
      const result = createOrderDraft(state); if (!result.valid) { dialog.close(); return report(result); }
      draft = result.orderDraft; sync(); dialog.close(); q('#order-confirmation').showModal(); q('#confirmation-title').focus();
    } });
    dialog.showModal(); q('#review-title').focus();
  }
  all('#personalizar input, #personalizar select, #personalizar textarea').forEach(n => n.disabled = true);
  render();
  const date = named(document, 'mf_shipping_date'); date.id = 'needed-date'; date.min = minimumDesiredDate(); date.tabIndex = 0; date.removeAttribute('aria-hidden'); date.lang = 'pt-BR'; date.setAttribute('aria-label', 'Quando você precisa receber?');
  q('.mf-product-delivery-date__label').htmlFor = date.id;
  show(q('[data-mf-shipping-flexibility]'), true);
  bind(date, 'mf_shipping_date', state.shipping.date, v => { state.shipping.date = v; all('[data-mf-shipping-date-display], [data-mf-shipping-date-value]').forEach(n => n.textContent = displayDate(v)); }, 'input');
  bind(named(document, 'mf_shipping_flexible_date'), 'mf_shipping_flexible', state.shipping.flexible, v => state.shipping.flexible = v);
  const notes = named(document, 'mf_instructions_text'); notes.id = 'notes'; bind(notes, 'notes', state.notes, v => state.notes = v, 'input');
  const noteCard = q('[data-mf-instructions-step]'); accordion(noteCard);
  const shipping = all('input[name=mf_shipping_option]'); shipping.forEach(n => { n.disabled = n.value !== 'envio_estandard'; n.checked = !n.disabled; });
  all('[data-product]').forEach(b => b.addEventListener('click', () => {
    if (!Object.hasOwn(products, b.dataset.product) || b.dataset.product === state.product) return;
    const promotion = structuredClone(state.promotion); uploads.clear(); uploadErrors.clear(); state = createOrderState(b.dataset.product); state.promotion = promotion; date.value = notes.value = ''; const flexible = named(document, 'mf_shipping_flexible_date'); if (flexible) flexible.checked = false;
    history.replaceState(null, '', '?tipo=' + state.product); render(); changed();
    track('select_product', { product: state.product });
  }));
  all('form').forEach(form => form.addEventListener('submit', e => { e.preventDefault(); review(); }));
  q('.review-button').addEventListener('click', e => { e.preventDefault(); review(); });
  all('[data-mf-fixed-bar-button]').forEach(b => { b.textContent = 'Revisar criação'; b.addEventListener('click', review); });
  q('#close-confirmation').addEventListener('click', () => q('#order-confirmation').close());
  document.addEventListener('click', e => {
    const next = e.target.closest('[data-mf-step-nav-button]'); if (!next) return;
    const card = next.closest('[data-apex-accordion]'); const cards = all('[data-apex-accordion]', grid).filter(n => !n.hidden); const target = cards[cards.indexOf(card) + 1];
    if (target) reveal(q('button', target)); else reveal(date);
  });
  // Only sanitized inspection data is exposed; Files and free text remain private in this closure.
  window.apexDevelopment = Object.freeze({
    inspect: () => ({ product: state.product, size: state.size, figures: state.customizations.figures.length, additionalPeople: state.customizations.additionalPeople, pets: state.customizations.pets.length, promotion: structuredClone(state.promotion), pricing: structuredClone(state.pricing), uploads: uploads.metadata().map(({ name, ...u }) => u) }),
    inspectDraft: () => draft ? safeOrderSummary(draft) : null, validate: validation,
  });
  document.addEventListener('apex:review', review);
  document.addEventListener('apex:claim-promo', () => { if (state.promotion.claimed) return; state.promotion = { code: pricing.promotion.code, claimed: true }; changed(); track('promo_claim', { code: pricing.promotion.code }); });
  document.addEventListener('apex:discard', () => { uploads.clear(); uploadErrors.clear(); state = createOrderState(state.product); date.value = notes.value = ''; render(); changed(); });
  document.documentElement.dataset.apexReady = 'true';
}
