import { track } from './analytics.js';

export const WHATSAPP_NUMBER = '5521923679482';

const templates = Object.freeze({
  hero: 'Olá! Vi as miniaturas personalizadas da Apex3D e quero ajuda para fazer meu pedido.',
  configurator: 'Olá! Estou montando minha miniatura na Apex3D e gostaria de ajuda para finalizar.',
  extras: 'Olá! Quero ajuda com uma personalização especial na minha miniatura Apex3D.',
  faq: 'Olá! Tenho uma dúvida sobre as miniaturas personalizadas da Apex3D.',
  assistant: 'Olá! Usei o Assistente Apex e quero falar com a equipe sobre minha miniatura.',
});

export function buildWhatsAppUrl({ product, size, subtotalCents, placement = 'hero' } = {}) {
  const context = [
    product ? `produto ${String(product).slice(0, 30)}` : '',
    Number.isFinite(size) ? `${size} cm` : '',
    Number.isSafeInteger(subtotalCents) ? `subtotal ${(subtotalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '',
  ].filter(Boolean).join(', ');
  const message = `${templates[placement] || templates.hero}${context ? ` Contexto: ${context}.` : ''}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function startWhatsAppLinks() {
  const update = event => {
    const detail = event?.detail || {};
    document.querySelectorAll('[data-apex-whatsapp], .mf-product-whatsapp, .mf-header__mobile-link--whatsapp').forEach(link => {
      if (link.matches('.mf-product-whatsapp') && !link.dataset.placement) link.dataset.placement = 'configurator';
      link.href = buildWhatsAppUrl({ product: detail.product, size: detail.size, subtotalCents: detail.subtotalCents, placement: link.dataset.placement });
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.dataset.apexWhatsapp = '';
    });
  };
  update(); document.addEventListener('apex:change', update);
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-apex-whatsapp]');
    if (link) track('whatsapp_click', { placement: link.dataset.placement || 'site' });
  });
}
