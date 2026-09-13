import { commercialRules } from './commercial.js';
import { originalSpecialObjects } from './special-objects.js';
export const specialObjectCategories = Object.freeze({
  ...Object.fromEntries(Object.entries(originalSpecialObjects).map(([id, item]) => [id, { ...item, cents: 3990 }])),
  simples: { label: 'Objeto simples', cents: 1990 },
  detalhado: { label: 'Objeto detalhado', cents: 3990 },
});
export const pricing = Object.freeze({
  currency: 'BRL', locale: 'pt-BR',
  productSize: commercialRules.productSizeCents,
  base: Object.freeze(Object.fromEntries(Object.keys(commercialRules.productSizeCents[6]).map(product => [product, commercialRules.productSizeCents[6][product]]))),
  maxAdditionalPeople: 3,
  eyes: { ojos_standard: 0 }, mouth: { sin_boca: 0 }, glasses: 0,
  petEyes: { estandar: 0 },
  additionalPets: { 0: 0, 1: 7990, 2: 15980, 3: 23970 },
  additionalPetSize: { 4: 0 },
  accessory: 1990, logo: 3990, maxAccessories: 5,
  specialAccessories: Object.fromEntries(Object.entries(specialObjectCategories).map(([id, c]) => [id, c.cents])),
  extras: { 'base-com-nome': 1990, 'base-com-nome-data': 2990 },
  box: { caja_standard: { 6: 0, 10: 0, 15: 0, 20: 0 }, caja_personalizada: { 6: 3990, 10: 3990, 15: 3990, 20: 3990 } },
  dedication: 0, shipping: { envio_estandard: 0 },
  promotion: commercialRules.promotion,
});
