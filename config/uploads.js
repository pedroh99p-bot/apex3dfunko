export const uploadPolicy = Object.freeze({
  // 10 MB anunciado no baseline; adotamos MB decimal, explicitamente.
  maxBytes: 10_000_000,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // Não havia máximo de quantidade documentado. Sem inventar restrição comercial.
  maxFilesPerField: null,
});
