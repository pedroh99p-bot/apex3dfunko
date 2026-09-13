export const sizes = Object.freeze([
  { cm: 6, label: 'Compacto', description: 'Pequena no tamanho. Cheia de personalidade.' },
  { cm: 10, label: 'Recomendado', description: 'Um equilíbrio entre presença e delicadeza.' },
  { cm: 15, label: 'Mais presença', description: 'Mais espaço para apreciar os detalhes.' },
  { cm: 20, label: 'Premium', description: 'Para ocupar um lugar especial.' },
]);
export const commercialRules = Object.freeze({
  productSizeCents: Object.freeze({
    6: Object.freeze({ individual: 9990, pet: 9990, casal: 18990, familia: 26990 }),
    10: Object.freeze({ individual: 14990, pet: 14990, casal: 27990, familia: 39990 }),
    15: Object.freeze({ individual: 17990, pet: 17990, casal: 33990, familia: 47990 }),
    20: Object.freeze({ individual: 21990, pet: 21990, casal: 41990, familia: 59990 }),
  }),
  promotion: Object.freeze({ code: 'FIRST10', percent: 10, storageKey: 'apex:first10:v1' }),
});
