import { pricing as p } from '../config/pricing.js';
import { products } from '../config/products.js';

const value = (map, key) => {
  if (!Object.hasOwn(map, key)) throw new Error(`Opção de preço desconhecida: ${key}`);
  return map[key];
};
export function calculatePrice(state) {
  const product = value(products, state.product);
  if (!Number.isSafeInteger(state.quantity) || state.quantity < 1) throw new Error('Quantidade inválida.');
  const c = state.customizations;
  if (c.figures.length !== product.figures) throw new Error('Quantidade de figuras incompatível com o produto.');
  const lines = [];
  const add = (code, label, cents) => { lines.push({ code, label, cents }); };
  add('base', product.label, value(p.base, state.product));
  add('size', `${state.size} cm`, value(product.kind === 'pet' ? p.petSize : p.humanSize, state.size) * (product.figures || 1));
  c.figures.forEach((f, i) => {
    const prefix = `figure-${i + 1}`;
    add(`${prefix}:eyes`, `Olhos · figura ${i + 1}`, value(p.eyes, f.eyes));
    add(`${prefix}:mouth`, `Boca · figura ${i + 1}`, value(p.mouth, f.mouth));
    add(`${prefix}:glasses`, `Óculos · figura ${i + 1}`, f.glasses ? p.glasses : 0);
  });
  const accessories = product.kind === 'pet' ? [c.pet] : c.figures;
  accessories.forEach((f, i) => {
    for (const [key, unit] of [['accessories', p.accessory], ['logos', p.logo]]) {
      const count = f[key] || 0;
      if (!Number.isInteger(count) || count < 0 || count > p.maxAccessories) throw new Error('Quantidade de acessórios inválida.');
      add(`${i}:${key}`, key === 'logos' ? 'Logótipos' : 'Pequenos acessórios', count * unit);
    }
    for (const slug of new Set(f.specialAccessories || [])) add(`${i}:${slug}`, slug, value(p.specialAccessories, slug));
  });
  if (product.kind === 'pet') add('pet-eyes', 'Olhos do animal', value(p.petEyes, c.pet.eyes));
  add('pets', 'Animais adicionais', value(p.additionalPets, c.pets.length));
  c.pets.forEach((pet, i) => add(`pet-${i + 1}:size`, `Animal ${i + 1} · ${pet.size} cm`, value(p.additionalPetSize, pet.size)));
  add('minis', 'Minis', value(p.minis, c.minis.quantity));
  add('mini-size', 'Tamanho das minis', value(p.miniSize, c.minis.size) * c.minis.quantity);
  for (const extra of new Set(c.extras)) add(extra, extra, value(p.extras, extra));
  add('box', 'Caixa', value(value(p.box, c.box.type), state.size));
  if (c.box.dedication && c.box.type !== 'caja_standard') add('dedication', 'Dedicatória', p.dedication);
  add('shipping-priority', 'Prazo de produção/entrega', value(p.shipping, state.shipping.option));
  const unitTotalCents = lines.reduce((sum, line) => sum + line.cents, 0);
  const mainTotalCents = unitTotalCents * state.quantity;
  const giftTotalCents = state.gift.enabled ? p.gift : 0;
  const totalCents = mainTotalCents + giftTotalCents;
  if (!Number.isSafeInteger(totalCents)) throw new Error('Total fora do limite numérico.');
  return { currency: p.currency, lines, unitTotalCents, mainTotalCents, giftTotalCents, totalCents, freightCents: null, finalCheckout: false };
}
