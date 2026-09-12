// Contrato mínimo de fabricação local. Não altera a tabela de preços.
export const mvpRules = Object.freeze({
  hair: ['negro', 'castano_osc', 'castano_claro', 'rubio_osc', 'rubio', 'rubio_claro', 'pelirrojo', 'otro', 'sin_pelo'],
  skin: ['blanco_palido', 'estandard', 'moreno', 'moreno_oscuro'],
  petTypes: ['cao', 'gato', 'ave', 'cavalo', 'tartaruga', 'coelho', 'roedor', 'lagarto', 'cabra', 'outro'],
  additionalPetTypes: ['Cão', 'Gato', 'Ave', 'Cavalo', 'Tartaruga', 'Coelho', 'Roedor', 'Lagarto', 'Cabra', 'Outro'],
  date: { required: true, minLeadDays: 0, excludedWeekdays: [] },
});
