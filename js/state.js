import { products } from '../config/products.js';

export function createFigure(index) {
  return {
    id: 'figure-' + (index + 1), referenceMode: 'photo',
    outfit: { mode: 'reference', description: '' }, pose: { mode: 'reference', description: '' },
    eyes: 'ojos_standard', mouth: 'sin_boca', glasses: false,
    accessories: 0, logos: 0, specialAccessories: [], fields: {},
  };
}
export function createOrderState(product = 'individual') {
  if (!Object.hasOwn(products, product)) throw new Error('Produto desconhecido.');
  return {
    version: 2, product, quantity: 1, size: 6,
    customizations: {
      additionalPeople: 0, figures: Array.from({ length: products[product].figures }, (_, i) => createFigure(i)),
      pet: { eyes: 'estandar', accessories: 0, logos: 0, specialAccessories: [], fields: {} }, pets: [],
      box: { type: 'caja_standard', dedication: false, fields: {} },
      extras: [], fields: {},
    },
    uploads: [],
    shipping: { option: 'envio_estandard', date: '', flexible: false },
    promotion: { code: null, claimed: false },
    pricing: null, notes: '',
  };
}
