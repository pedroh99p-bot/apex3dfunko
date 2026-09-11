// Presentation adapter only: selection handlers, offer and configuration stay untouched.
const imagery = {
  individual: { files: ['individual'], label: 'Referência de miniatura individual' },
  casal: { files: ['casal'], label: 'Referência de duas miniaturas para casal' },
  familia: { files: ['casal', 'individual'], label: 'Composição ilustrativa de três miniaturas para família' },
  pet: { files: ['pet'], label: 'Referência de miniatura de pet' },
};
export function restoreProductImagery() {
  for (const [id, item] of Object.entries(imagery)) {
    const visual = document.querySelector(`[data-choose-product="${id}"] .product-visual`);
    if (!visual) continue;
    visual.replaceChildren(); visual.removeAttribute('aria-hidden');
    visual.setAttribute('role', 'img'); visual.setAttribute('aria-label', item.label);
    const group = document.createElement('div');
    group.className = 'category-imagery' + (id === 'familia' ? ' category-family' : '');
    for (const file of item.files) {
      const image = document.createElement('img');
      image.src = `/assets/products/${file}.webp`; image.alt = '';
      image.width = 150; image.height = 128; image.loading = 'lazy'; image.decoding = 'async';
      group.append(image);
    }
    visual.append(group);
  }
}
