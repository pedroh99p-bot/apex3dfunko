// Valores de HOMOLOGAÇÃO, em centavos inteiros. Revisar antes da produção.
// Somente o tamanho-base herdado (6 cm) está ofertado; novas faixas exigem aprovação.
export const specialObjectCategories = Object.freeze({
  simples: { label: 'Objeto simples', cents: 1900 },
  detalhado: { label: 'Objeto detalhado', cents: 3900 },
});
export const pricing = Object.freeze({
  currency: 'BRL', locale: 'pt-BR', status: 'homologation',
  base: { individual: 19700, pet: 15700, casal: 34700, familia: 47700 },
  additionalPerson: 13000, maxAdditionalPeople: 3,
  humanSize: { 6: 0 }, petSize: { 6: 0 },
  eyes: { ojos_standard: 0 }, mouth: { sin_boca: 0 }, glasses: 0,
  petEyes: { estandar: 0 },
  additionalPets: { 0: 0, 1: 7900, 2: 15800, 3: 23700 },
  additionalPetSize: { 4: 0 },
  accessory: 1900, logo: 3900, maxAccessories: 5,
  specialAccessories: Object.fromEntries(Object.entries(specialObjectCategories).map(([id, c]) => [id, c.cents])),
  extras: { 'base-com-nome': 1900, 'base-com-nome-data': 2900 },
  // Arquitetura preservada, opções sem preço aprovado indisponíveis no V0.5.
  minis: { 0: 0 }, miniSize: { 4: 0 },
  box: { caja_standard: { 6: 0 }, caja_personalizada: { 6: 3900 } },
  dedication: 0, shipping: { envio_estandard: 0 }, gift: null,
});
