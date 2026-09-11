import { products } from '../config/products.js';

export function createOrderState(product = 'individual') {
  if (!Object.hasOwn(products, product)) throw new Error('Produto desconhecido.');
  return {
    version: 1, product, quantity: 1, size: 6,
    customizations: {
      figures: Array.from({ length: products[product].figures }, (_, i) => ({
        id: `figure-${i + 1}`, eyes: 'ojos_standard', mouth: 'sin_boca', glasses: false,
        accessories: 0, logos: 0, specialAccessories: [], fields: {},
      })),
      pet: { eyes: 'estandar', accessories: 0, logos: 0, specialAccessories: [], fields: {} }, pets: [],
      minis: { quantity: 0, size: 4, fields: {} },
      box: { type: 'caja_standard', dedication: false, fields: {} },
      extras: [], fields: {},
    },
    uploads: [], // Metadados + owner explícito. File/Blob ficam apenas em UploadStore.
    shipping: { option: 'envio_estandard', date: '', flexible: false },
    gift: { enabled: false, imageSource: 'sketch', text: '' },
    pricing: null, notes: '',
  };
}
