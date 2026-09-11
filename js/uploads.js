import { uploadPolicy } from '../config/uploads.js';

async function validSignature(file) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start, length) => String.fromCharCode(...b.slice(start, start + length));
  if (file.type === 'image/png') return [137,80,78,71,13,10,26,10].every((v, i) => b[i] === v);
  if (file.type === 'image/jpeg') return b[0] === 255 && b[1] === 216 && b[2] === 255;
  if (file.type === 'image/gif') return ['GIF87a', 'GIF89a'].includes(ascii(0, 6));
  if (file.type === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
  return false;
}

export class UploadStore {
  #entries = new Map();
  #revision = 0;
  constructor(policy = uploadPolicy) { this.policy = policy; }
  async add(owner, files, { multiple = false } = {}) {
    if (!owner?.itemId || !owner?.field) throw new Error('Destino da imagem não identificado.');
    const revision = this.#revision;
    const incoming = Array.from(files);
    if (!multiple && incoming.length > 1) throw new Error('Selecione apenas uma imagem neste campo.');
    for (const file of incoming) {
      if (!this.policy.mimeTypes.includes(file.type)) throw new Error('Tipo inválido. Use JPEG, PNG, WebP ou GIF.');
      if (!file.size || file.size > this.policy.maxBytes) throw new Error(`A imagem deve ter entre 1 byte e ${this.policy.maxBytes / 1_000_000} MB.`);
      if (!await validSignature(file)) throw new Error('O conteúdo do arquivo não corresponde ao tipo de imagem.');
    }
    if (revision !== this.#revision) return []; // Seleção cancelada por troca de produto.
    const existing = this.list().filter(e => e.owner.itemId === owner.itemId && e.owner.field === owner.field);
    if (this.policy.maxFilesPerField && (multiple ? existing.length : 0) + incoming.length > this.policy.maxFilesPerField) throw new Error('Limite de imagens deste campo excedido.');
    if (!multiple && incoming.length) existing.forEach(e => this.remove(e.id));
    const added = incoming.map(file => {
      const entry = { id: crypto.randomUUID(), owner: { ...owner }, name: file.name, type: file.type, size: file.size, file, previewUrl: URL.createObjectURL(file) };
      this.#entries.set(entry.id, entry);
      return entry.id;
    });
    return added;
  }
  list() { return Array.from(this.#entries.values()); }
  metadata() { return this.list().map(({ file, previewUrl, ...metadata }) => structuredClone(metadata)); }
  remove(id) {
    const entry = this.#entries.get(id);
    if (entry) URL.revokeObjectURL(entry.previewUrl);
    this.#entries.delete(id);
  }
  clear() { this.#revision++; this.list().forEach(e => this.remove(e.id)); }
}
