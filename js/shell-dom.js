export const q = (selector, root = document) => root.querySelector(selector);
export const all = (selector, root = document) => [...root.querySelectorAll(selector)];
export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function note(root, text) { const n = el('p', text, 'apex-note'); root.prepend(n); return n; }
export function show(node, visible) { if (node) { node.hidden = !visible; node.classList.toggle('apex-hidden', !visible); } }
export function accordion(card, opened = false) {
  const toggle = [...card.children].find(n => n.tagName === 'BUTTON');
  const body = [...card.children].find(n => /__body$/.test(n.classList[0] || ''));
  if (!toggle || !body) return;
  card.dataset.apexAccordion = '';
  if (!body.id) body.id = 'panel-' + crypto.randomUUID();
  toggle.setAttribute('aria-controls', body.id);
  const set = value => { card.classList.toggle('is-open', value); toggle.setAttribute('aria-expanded', String(value)); show(body, value); };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  set(opened);
}
export function reveal(node) {
  if (!node) return;
  let parent = node.parentElement;
  while (parent) {
    if (parent.matches('[data-apex-accordion]') && !parent.classList.contains('is-open')) [...parent.children].find(n => n.tagName === 'BUTTON')?.click();
    parent = parent.parentElement;
  }
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  node.focus({ preventScroll: true });
}
