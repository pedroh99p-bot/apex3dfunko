// Nenhum endpoint transacional está habilitado. Somente URLs públicas.
export const endpoints = Object.freeze({
  mode: 'development', template: '/legacy-template',
  order: null, upload: null, checkout: null, payment: null,
  inherited: { publicOrigin: 'https://mifunko.com', temporary: true },
  visualOrigins: ['https://mifunko.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
});
