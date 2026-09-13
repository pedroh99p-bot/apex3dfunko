import { pricing as p, specialObjectCategories } from '../config/pricing.js';
import { products } from '../config/products.js';

export const formatMoney = cents => new Intl.NumberFormat(p.locale, { style: 'currency', currency: p.currency }).format(cents / 100);
export const additionalPersonPrice = size => value(value(p.productSize, size), 'individual');
const value = (map, key) => {
  if (!Object.hasOwn(map, key)) throw new Error('Opção de preço desconhecida.');
  return map[key];
};
export function expectedFigureCount(state) {
  const product = value(products, state.product), extra = state.customizations.additionalPeople;
  if (!Number.isInteger(extra) || extra < 0 || extra > p.maxAdditionalPeople || (product.kind === 'pet' && extra)) throw new Error('Quantidade de pessoas adicionais inválida.');
  return product.figures + extra;
}
export function calculatePrice(state) {
  const product = value(products, state.product), c = state.customizations;
  if (!Number.isSafeInteger(state.quantity) || state.quantity < 1) throw new Error('Quantidade inválida.');
  if (!state.promotion || typeof state.promotion.claimed !== 'boolean' || (state.promotion.claimed && state.promotion.code !== p.promotion.code)) throw new Error('Promoção inválida.');
  if (c.figures.length !== expectedFigureCount(state)) throw new Error('Quantidade de pessoas incompatível.');
  const lines = [];
  const add = (code, label, cents) => {
    if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Preço não cadastrado.');
    if (cents || code === 'base') lines.push({ code, label, cents });
  };
  add('base', product.label + ' · ' + state.size + ' cm', value(value(p.productSize, state.size), state.product));
  add('people', 'Pessoa adicional · ' + state.size + ' cm', c.additionalPeople * additionalPersonPrice(state.size));
  const accessories = product.kind === 'pet' ? [c.pet] : c.figures;
  c.figures.forEach(f => {
    value(p.eyes, f.eyes); value(p.mouth, f.mouth);
    if (typeof f.glasses !== 'boolean') throw new Error('Referência inválida.');
  });
  if (product.kind === 'pet') value(p.petEyes, c.pet.eyes);
  accessories.forEach((f, i) => {
    for (const [key, cents, label] of [['accessories', p.accessory, 'Acessório simples'], ['logos', p.logo, 'Acessório detalhado']]) {
      if (!Number.isInteger(f[key]) || f[key] < 0 || f[key] > p.maxAccessories) throw new Error('Quantidade de acessórios inválida.');
      add('accessory:' + i + ':' + key, label + (product.kind === 'pet' ? ' · pet' : ' · pessoa ' + (i + 1)), f[key] * cents);
    }
    if (new Set(f.specialAccessories).size !== f.specialAccessories.length) throw new Error('Objeto duplicado.');
    for (const id of f.specialAccessories) add('object:' + i + ':' + id, specialObjectCategories[id]?.label || 'Objeto', value(p.specialAccessories, id));
  });
  add('pets', 'Pet adicional', value(p.additionalPets, c.pets.length));
  c.pets.forEach(pet => value(p.additionalPetSize, pet.size));
  const baseLabels = { 'base-com-nome': 'Nome na base', 'base-com-nome-data': 'Nome + data na base' };
  for (const extra of c.extras) add(extra, baseLabels[extra], value(p.extras, extra));
  add('box', 'Caixa personalizada', value(value(p.box, c.box.type), state.size));
  value(p.shipping, state.shipping.option);
  const unitSubtotalCents = lines.reduce((sum, line) => sum + line.cents, 0);
  const subtotalCents = unitSubtotalCents * state.quantity;
  const eligiblePromotion = state.promotion?.claimed && state.promotion.code === p.promotion.code;
  const discountCents = eligiblePromotion ? Math.round(subtotalCents * p.promotion.percent / 100) : 0;
  const totalCents = subtotalCents - discountCents;
  if (![subtotalCents, discountCents, totalCents].every(Number.isSafeInteger)) throw new Error('Total fora do limite numérico.');
  return { currency: p.currency, lines, unitSubtotalCents, subtotalCents, discountCents, mainTotalCents: totalCents, totalCents, freightCents: null, finalCheckout: false, promotionCode: eligiblePromotion ? p.promotion.code : null };
}
