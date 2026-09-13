import { commercialRules } from '../config/commercial.js';
import { track } from './analytics.js';

const q = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const html = (tag, className, content) => { const node = document.createElement(tag); if (className) node.className = className; if (content !== undefined) node.innerHTML = content; return node; };

function brandLockup() {
  all('.custom-logo-link').forEach(link => {
    const logo = q('img', link);
    logo.src = '/assets/brand/apex-logo.png';
    logo.width = 1060;
    logo.height = 276;
    logo.alt = 'Apex3D Personalizados';
    link.setAttribute('aria-label', 'Apex3D Personalizados');
    q('.apex-brand-label', link)?.remove();
  });
  const footerBrand = q('.mf-footer__logo-link');
  if (footerBrand) { const phone = html('a', 'apex-phone', '(21) 92367-9482'); phone.href = '#'; phone.dataset.apexWhatsapp = ''; phone.dataset.placement = 'faq'; footerBrand.append(phone); }
}

function curateHero() {
  const gallery = q('.mf-product-gallery');
  const slides = all('[data-mf-product-slide]', gallery);
  const thumbs = all('[data-mf-product-thumb]', gallery);
  const candidates = (slides.length <= 6 ? slides.map((_, index) => index) : [0, 2, 5, 8, 15, 22]).filter(index => slides[index]);
  const seed = sessionStorage.getItem('apex:hero-seed') || String(Math.floor(Math.random() * 1e6));
  sessionStorage.setItem('apex:hero-seed', seed);
  const ordered = [...candidates].sort((a, b) => ((a * 31 + Number(seed)) % 97) - ((b * 31 + Number(seed)) % 97));
  const stageNames = ['Da foto à miniatura', 'Traços que contam uma história', 'Detalhes feitos para você', 'Casais em 3D', 'Pets também viram arte', 'Um presente com significado'];
  const slideTrack = q('.mf-product-gallery__slides', gallery);
  const thumbTrack = thumbs[0]?.parentElement;
  const selectedSlides = ordered.map((sourceIndex, index) => {
    const slide = slides[sourceIndex];
    const image = q('img', slide); slide.classList.toggle('is-active', index === 0); slide.dataset.mfSlideLegend = stageNames[index];
    const legend = q('.mf-product-gallery__legend', slide); if (legend) legend.textContent = stageNames[index];
    image.loading = index === 0 ? 'eager' : 'lazy'; image.fetchPriority = index === 0 ? 'high' : 'auto'; image.decoding = 'async';
    return slide;
  });
  slideTrack?.replaceChildren(...selectedSlides);
  if (thumbTrack) thumbTrack.replaceChildren(...ordered.map((sourceIndex, index) => {
    const thumb = thumbs[sourceIndex] || thumbs[0].cloneNode(true); thumb.dataset.mfProductThumb = String(index); thumb.setAttribute('aria-label', `Mostrar história ${index + 1}`); return thumb;
  }));
  gallery.dataset.apexAutoplay = '3000';
  const title = q('.mf-product-sales__title'); if (title) title.innerHTML = 'Transforme sua foto em uma <span>miniatura 3D única</span>';
  if (title && !q('.apex-hero-brand')) title.before(html('p', 'apex-hero-brand', 'APEX3D <strong>PERSONALIZADOS</strong><span>Sua história em miniatura</span>'));
  const description = q('.mf-product-sales__description'); if (description) description.textContent = 'Criamos sua miniatura personalizada e você aprova antes da produção.';
  const proof = q('.mf-product-sales__proof'); if (proof && !q('.apex-proof-chip', proof)) proof.replaceChildren(html('span', 'apex-proof-chip', '✓ Modelagem autoral'), html('span', 'apex-proof-chip', '✓ Aprovação antes de produzir'));
  const saving = q('.mf-product-sales__saving'); if (saving) saving.textContent = 'Preços definidos por tamanho';
  if (description && !q('.apex-hero-actions')) { const actions = html('div', 'apex-hero-actions'); actions.innerHTML = '<a href="#personalizar" class="apex-button apex-button--primary" data-apex-start>Criar minha miniatura</a><a href="#" class="apex-button apex-button--whatsapp" data-apex-whatsapp data-placement="hero">Fazer pedido pelo WhatsApp</a>'; description.after(actions); }
  q('[data-mf-mini-slider]')?.remove();
}

function insertMarqueeAndProof() {
  const hero = q('#inicio');
  const marquee = html('div', 'apex-marquee', '<div>Sua foto <span>✦</span> Sua miniatura <span>✦</span> Casais <span>✦</span> Famílias <span>✦</span> Pets <span>✦</span> Presentes únicos <span>✦</span> Aprovação antes da produção <span>✦</span> Personalização 3D <span>✦</span></div>');
  marquee.setAttribute('aria-label', 'Diferenciais Apex3D'); hero?.after(marquee);
  const proof = html('section', 'apex-proof-strip', '<p class="apex-eyebrow">UMA CRIAÇÃO, QUATRO GARANTIAS</p><h2>Você acompanha cada detalhe</h2><div><article><strong>1</strong><span>Envie suas fotos</span></article><article><strong>2</strong><span>Personalize roupa e pose</span></article><article><strong>3</strong><span>Aprove o modelo</span></article><article><strong>4</strong><span>Produção após sua aprovação</span></article></div>');
  proof.id = 'garantias'; q('#personalizar')?.before(proof);
}

function replaceUnverifiedProof() {
  q('[data-mf-social-proof]')?.replaceWith(html('section', 'apex-trust-principles', '<div><strong>Feito a partir das suas fotos</strong><span>As referências orientam rosto, roupa e pose.</span></div><div><strong>Aprovação antes da produção</strong><span>Você confere o modelo antes de seguirmos.</span></div><div><strong>Preço transparente</strong><span>Cada adicional aparece no resumo.</span></div>'));
  const reviews = q('#opiniones');
  if (reviews) reviews.innerHTML = '<div class="mf-container apex-why"><p class="apex-eyebrow">POR QUE CRIAR COM A APEX3D?</p><h2 id="mf-reviews-slider-title">Personalização com clareza do início ao fim</h2><div class="apex-why-grid"><article><b>01</b><h3>Você decide os detalhes</h3><p>Tamanho, composição, acessórios, base e embalagem ficam visíveis no resumo.</p></article><article><b>02</b><h3>Suas fotos guiam a criação</h3><p>Usamos as referências somente para construir a peça escolhida por você.</p></article><article><b>03</b><h3>Aprovação antes de produzir</h3><p>A modelagem segue para produção somente depois da sua confirmação.</p></article><article><b>04</b><h3>Atendimento humano</h3><p>Prazo e frete são combinados pelo WhatsApp conforme a sua necessidade.</p></article></div></div>';
}

function simplifyConfigurator() {
  q('[data-mf-mini-step]')?.remove();
  q('[data-original-region="gift"]')?.remove();
  q('[data-mf-gift-upsell-modal]')?.remove();
  q('[data-mf-added-drawer]')?.remove();
  q('[data-mf-shipping-options]')?.remove();
  const deliverySubtitle = q('.mf-product-delivery__subtitle'); if (deliverySubtitle) deliverySubtitle.textContent = 'Conte quando precisa receber. Confirmamos disponibilidade e frete no atendimento.';
  const notes = q('[name="mf_instructions_text"]'); if (notes) notes.placeholder = 'Conte aqui qualquer detalhe que ainda não apareceu na personalização.';
  const familyTitle = q('[data-product="familia"] .mf-funko-type-option__title'); if (familyTitle) familyTitle.textContent = 'Família';
  const confirmation = q('#confirmation-title'); if (confirmation) confirmation.textContent = 'Sua criação está pronta para o atendimento.';
  const confirmationText = q('#order-confirmation p'); if (confirmationText) confirmationText.textContent = 'O resumo ficou salvo somente nesta sessão. Fale com a gente para confirmar frete, prazo e próximos passos.';
  const extrasHelp = html('a', 'apex-inline-whatsapp apex-button apex-button--whatsapp', 'Preciso de ajuda com um extra'); extrasHelp.href = '#'; extrasHelp.dataset.apexWhatsapp = ''; extrasHelp.dataset.placement = 'extras'; q('[data-mf-extra-step]')?.after(extrasHelp);
  const faqHelp = html('a', 'apex-inline-whatsapp apex-button apex-button--whatsapp', 'Falar com a equipe no WhatsApp'); faqHelp.href = '#'; faqHelp.dataset.apexWhatsapp = ''; faqHelp.dataset.placement = 'faq'; q('#faqs .mf-container')?.append(faqHelp);
}

function progressNavigation() {
  const progress = q('.apex-progress') || html('nav', 'apex-progress', '<span class="apex-progress-label" aria-live="polite">Você está em: <strong>INÍCIO</strong></span><ol><li><a href="#inicio">INÍCIO</a></li><li><a href="#tipo">MODELOS</a></li><li><a href="#tamanho">TAMANHO</a></li><li><a href="#detalhes">DETALHES</a></li><li><a href="#extras">EXTRAS</a></li><li><a href="#entrega">ENTREGA</a></li><li><button type="button" data-apex-progress-review>PEDIDO</button></li></ol>');
  progress.setAttribute('aria-label', 'Etapas da sua criação'); if (!progress.isConnected) q('.mf-header')?.after(progress);
  const selector = q('[data-mf-funko-type-selector]'); if (selector) selector.id = 'tipo';
  q('[data-apex-progress-review]')?.addEventListener('click', () => document.dispatchEvent(new Event('apex:review')));
  let orderMarker = q('#pedido');
  if (!orderMarker) {
    orderMarker = html('span', 'apex-progress-marker');
    orderMarker.id = 'pedido';
    orderMarker.setAttribute('aria-hidden', 'true');
    q('#personalizar')?.after(orderMarker);
  }
  const links = all('li', progress);
  let milestones = [];
  let observer;
  let frame;
  const setActive = index => {
    const safeIndex = Math.max(0, Math.min(index, links.length - 1));
    links.forEach((item, itemIndex) => {
      item.classList.toggle('is-current', itemIndex === safeIndex);
      item.classList.toggle('is-complete', itemIndex < safeIndex);
    });
    q('.apex-progress-label strong', progress).textContent = links[safeIndex].innerText.trim();
    progress.dataset.step = `${safeIndex + 1}/7`;
    progress.style.setProperty('--apex-progress-value', `${safeIndex / (links.length - 1) * 100}%`);
  };
  const update = () => {
    frame = 0;
    const anchor = Math.min(innerHeight * .28, progress.getBoundingClientRect().bottom + 80);
    let active = 0;
    milestones.forEach((node, index) => { if (node.getBoundingClientRect().top <= anchor) active = index; });
    setActive(active);
  };
  const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
  const findMilestones = () => {
    const grid = q('.mf-product-customizer-grid');
    const size = q('[data-mf-size-step], [data-mf-pet-size-step]', grid);
    const details = q('[data-mf-face-step], [data-mf-pet-step="pet_eyes"]', grid);
    const extras = q('[data-mf-card-kind="extras"]', grid);
    const delivery = q('[data-original-region="delivery"]');
    if (size) size.id = 'tamanho';
    if (details) details.id = 'detalhes';
    if (extras) extras.id = 'extras';
    if (delivery) {
      delivery.id = 'entrega';
      if (orderMarker.previousElementSibling !== delivery) delivery.after(orderMarker);
    }
    return [q('#inicio'), selector, size, details, extras, delivery, orderMarker].filter(Boolean);
  };
  const refresh = () => {
    const next = findMilestones();
    if (next.length !== links.length) return;
    const unchanged = next.every((node, index) => node === milestones[index]);
    milestones = next;
    if (!unchanged) {
      observer?.disconnect();
      observer = new IntersectionObserver(scheduleUpdate, { rootMargin: '-20% 0px -65%', threshold: [0, .5, 1] });
      milestones.forEach(node => observer.observe(node));
    }
    scheduleUpdate();
  };
  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('resize', scheduleUpdate, { passive: true });
  document.addEventListener('apex:change', () => requestAnimationFrame(refresh));
  requestAnimationFrame(refresh);
}

const localAssistantProvider = Object.freeze({
  topics: Object.freeze({
    'Qual tamanho escolher?': 'Há opções de 6, 10, 15 e 20 cm. A de 10 cm equilibra presença e delicadeza.',
    'Como enviar as fotos?': 'Envie fotos nítidas, de frente e com boa luz. Elas ficam apenas nesta sessão do navegador.',
    'Posso adicionar pet?': 'Sim. Você pode escolher uma miniatura de pet ou adicionar pets à composição humana.',
    'Posso pedir alterações?': 'Sim. Você confere o modelo e pode alinhar ajustes antes de autorizar a produção.',
    'Como funciona o prazo?': 'Informe a data desejada. A disponibilidade e o frete são confirmados no atendimento.',
    'Quero uma personalização diferente': 'Conte sua ideia no WhatsApp. A equipe verifica como incluir a personalização especial.',
  }),
});

function assistant(provider = localAssistantProvider) {
  const root = html('aside', 'apex-assistant'); root.innerHTML = '<button type="button" class="apex-assistant-toggle" aria-expanded="false">Precisa de ajuda?</button><div class="apex-assistant-panel" hidden><button type="button" class="apex-assistant-close" aria-label="Fechar ajuda">×</button><p class="apex-eyebrow">ASSISTENTE APEX3D</p><h2>Como posso ajudar?</h2><div class="apex-assistant-topics"></div><p class="apex-assistant-answer" aria-live="polite">Escolha um assunto para ver a resposta.</p><a href="#" data-apex-whatsapp data-placement="assistant" class="apex-button apex-button--whatsapp">Falar com a equipe no WhatsApp</a></div>';
  document.body.append(root);
  const toggle = q('.apex-assistant-toggle', root), panel = q('.apex-assistant-panel', root);
  Object.entries(provider.topics).forEach(([label, answer]) => { const button = html('button', '', label); button.type = 'button'; button.addEventListener('click', () => q('.apex-assistant-answer', root).textContent = answer); q('.apex-assistant-topics', root).append(button); });
  const setOpen = open => { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setOpen(panel.hidden)); q('.apex-assistant-close', root).addEventListener('click', () => setOpen(false));
}

function consent() {
  const key = 'apex:consent:v1'; if (localStorage.getItem(key)) return;
  const banner = html('section', 'apex-consent'); banner.setAttribute('aria-label', 'Preferências de privacidade');
  banner.innerHTML = '<div><strong>Sua privacidade importa</strong><p>Usamos cookies para melhorar sua experiência e medir nossas campanhas.</p></div><div class="apex-consent-actions"><button type="button" data-consent="reject">Rejeitar não essenciais</button><button type="button" data-consent="settings">Configurar</button><button type="button" data-consent="accept" class="is-primary">Aceitar</button></div><form hidden><label><input type="checkbox" checked disabled> Necessários</label><label><input type="checkbox" name="analytics"> Analytics</label><label><input type="checkbox" name="ads"> Publicidade</label><button type="submit">Salvar preferências</button></form>';
  document.body.append(banner);
  const save = value => { localStorage.setItem(key, value); banner.remove(); document.dispatchEvent(new CustomEvent('apex:consent', { detail: { value } })); };
  q('[data-consent="reject"]', banner).addEventListener('click', () => save('rejected'));
  q('[data-consent="accept"]', banner).addEventListener('click', () => save('accepted'));
  q('[data-consent="settings"]', banner).addEventListener('click', () => { q('form', banner).hidden = false; });
  q('form', banner).addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); save(form.has('analytics') || form.has('ads') ? 'accepted' : 'rejected'); });
}

function promotion() {
  const { storageKey, code, percent } = commercialRules.promotion;
  let stored = null; try { stored = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { localStorage.removeItem(storageKey); }
  const period = 30 * 24 * 60 * 60 * 1000;
  if (stored && Date.now() - stored.shownAt < period) return;
  let shown = false;
  const modal = html('dialog', 'apex-promo'); modal.innerHTML = `<button type="button" class="apex-promo-close" aria-label="Fechar oferta">×</button><p class="apex-eyebrow">BOAS-VINDAS À APEX3D</p><h2>10% OFF na sua primeira criação</h2><p>Ganhe 10% de desconto no seu primeiro pedido Apex3D.</p><button type="button" class="apex-button apex-button--primary" data-claim-promo>Quero meu desconto</button><button type="button" class="apex-promo-later">Agora não</button>`; document.body.append(modal);
  const show = () => { if (shown) return; shown = true; localStorage.setItem(storageKey, JSON.stringify({ shownAt: Date.now(), claimed: false })); modal.showModal(); track('promo_view', { code }); };
  const onScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; if (max > 0 && scrollY / max >= .35) { show(); removeEventListener('scroll', onScroll); } };
  addEventListener('scroll', onScroll, { passive: true }); setTimeout(show, 30000);
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) document.addEventListener('mouseout', event => { if (event.clientY <= 0 && !event.relatedTarget) show(); }, { once: true });
  q('.apex-promo-close', modal).addEventListener('click', () => modal.close());
  q('.apex-promo-later', modal).addEventListener('click', () => modal.close());
  q('[data-claim-promo]', modal).addEventListener('click', () => { localStorage.setItem(storageKey, JSON.stringify({ shownAt: Date.now(), claimed: true })); document.dispatchEvent(new Event('apex:claim-promo')); modal.close(); });
}

function ptBrCopy() {
  const replacements = new Map([['Opiniões', 'Por que escolher'], ['FAQs', 'Dúvidas'], ['A minha conta', 'Minha conta'], ['Ir para o carrinho', 'Ver minha criação'], ['Escreva-nos', 'Falar no WhatsApp'], ['encomenda', 'pedido'], ['logótipo', 'logo'], ['Carregue', 'Envie']]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node; while ((node = walker.nextNode())) for (const [from, to] of replacements) if (node.nodeValue.includes(from)) node.nodeValue = node.nodeValue.replaceAll(from, to);
}

export function startCommercialUI() {
  brandLockup(); curateHero(); insertMarqueeAndProof(); replaceUnverifiedProof(); simplifyConfigurator(); progressNavigation(); assistant(); consent(); promotion(); ptBrCopy();
  track('view_product', { product: new URLSearchParams(location.search).get('tipo') || 'individual' });
}
