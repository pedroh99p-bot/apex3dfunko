import { q, all, el, show, accordion, reveal } from './shell-dom.js';

export function startShellInteractions() {
  // Discourage casual image saving without blocking text selection, uploads,
  // keyboard shortcuts, gallery navigation or accessible image controls.
  for (const eventName of ['contextmenu', 'dragstart']) {
    document.addEventListener(eventName, event => {
      if (event.target instanceof Element && event.target.closest('img, picture')) event.preventDefault();
    });
  }
  function slider(root, slideSelector, previous, next, bulletSelector) {
    const slides = all(slideSelector, root), bullets = bulletSelector ? all(bulletSelector, root) : [];
    if (!slides.length) return;
    let index = 0;
    const select = n => {
      index = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => { const active = i === index; slide.classList.toggle('is-active', active); slide.setAttribute('aria-hidden', String(!active)); });
      bullets.forEach((bullet, i) => { bullet.classList.toggle('is-active', i === index); bullet.setAttribute('aria-current', String(i === index)); });
      root.dataset.apexSlide = index; if (root.matches('.mf-product-gallery') && matchMedia('(max-width: 768px)').matches) { const track = q('.mf-product-gallery__slides', root); track.scrollTo({left:slides[index].offsetLeft - slides[0].offsetLeft, behavior:'smooth'}); }
    };
    q(previous, root)?.addEventListener('click', () => select(index - 1));
    q(next, root)?.addEventListener('click', () => select(index + 1));
    bullets.forEach((bullet, i) => bullet.addEventListener('click', () => select(i)));
    root.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key) && !e.target.matches('input,textarea')) { e.preventDefault(); select(index + (e.key === 'ArrowRight' ? 1 : -1)); } });
    let start;
    root.addEventListener('pointerdown', e => { start = { x: e.clientX, y: e.clientY }; });
    root.addEventListener('pointerup', e => { if (start && Math.abs(e.clientX - start.x) > 45 && Math.abs(e.clientY - start.y) < 65) select(index + (e.clientX < start.x ? 1 : -1)); start = null; });
    select(0);
  }
  slider(q('.mf-product-gallery'), '[data-mf-product-slide]', '[data-mf-product-prev]', '[data-mf-product-next]', '[data-mf-product-thumb]');
  slider(q('[data-mf-mini-slider]'), '[data-mf-mini-slide]', '[data-mf-mini-prev]', '[data-mf-mini-next]', '[data-mf-mini-bullet]');
  const track = q('[data-mf-reviews-track]');
  for (const [selector, sign] of [['[data-mf-reviews-prev]', -1], ['[data-mf-reviews-next]', 1]]) q(selector)?.addEventListener('click', () => {
    const last = track.scrollWidth - track.clientWidth;
    const left = sign > 0 && track.scrollLeft >= last - 2 ? 0 : sign < 0 && track.scrollLeft <= 2 ? last : track.scrollLeft + sign * (track.firstElementChild.getBoundingClientRect().width + 20);
    track.scrollTo({ left, behavior: 'smooth' });
  });
  all('.mf-product-faq-item').forEach((card, i) => accordion(card, i === 0));
  const menu = q('[data-mf-mobile-menu]'), menuButton = q('[data-mf-header-toggle]');
  menuButton.addEventListener('click', () => { const expanded = menuButton.getAttribute('aria-expanded') !== 'true'; show(menu, expanded); document.body.classList.toggle('menu-open', expanded); menuButton.setAttribute('aria-expanded', String(expanded)); });
  all('a', menu).forEach(a => a.addEventListener('click', () => { show(menu, false); document.body.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); }));
  const breakdown = q('[data-mf-price-breakdown]'), breakdownButton = q('[data-mf-breakdown-toggle]');
  breakdownButton?.addEventListener('click', () => { const expanded = breakdownButton.getAttribute('aria-expanded') !== 'true'; breakdownButton.setAttribute('aria-expanded', String(expanded)); show(breakdown, expanded); });
  all('[data-apex-start], [data-apex-start-configurator]').forEach(b => b.addEventListener('click', () => reveal(q('[data-apex-accordion] > button'))));
  const lightbox = q('#gallery-lightbox');
  all('.mf-product-gallery__slide img, #trabajos img, .mf-product-how-card img, .mf-reviews-slider__card img').forEach(img => {
    img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', 'Ampliar ' + (img.alt || 'referência visual'));
    const open = () => { const enlarged = q('#gallery-enlarged'); enlarged.src = img.currentSrc || img.src; enlarged.alt = img.alt || 'Referência visual'; lightbox.showModal(); };
    img.addEventListener('click', open); img.addEventListener('keydown', e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); open(); } });
  });
  q('[data-gallery-close]').addEventListener('click', () => lightbox.close());
  document.addEventListener('click', e => {
    for (const [toggleSelector, bodySelector] of [
      ['[data-mf-size-compare-toggle]', '[data-mf-size-compare-body]'],
      ['[data-mf-mouth-trigger]', '[data-mf-mouth-body]'],
      ['[data-mf-outfit-colors-toggle]', '[data-mf-outfit-colors-body]'],
    ]) {
      const toggle = e.target.closest(toggleSelector);
      if (toggle) { const body = q(bodySelector, toggle.parentElement); const expanded = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(expanded)); show(body, expanded); }
    }
    const zoom = e.target.closest('[data-mf-size-compare-zoom]');
    if (zoom) { const img = q('img', zoom); q('#gallery-enlarged').src = img.currentSrc || img.src; q('#gallery-enlarged').alt = 'Comparação dos quatro tamanhos'; lightbox.showModal(); }
  });
  const fixed = q('[data-mf-fixed-cart-bar]');
  const observer = new IntersectionObserver(entries => { fixed.classList.toggle('is-visible', !entries[0].isIntersecting); show(fixed, !entries[0].isIntersecting); }, { threshold: 0 }); observer.observe(q('.mf-product-hero__summary'));
  const drawer = q('[data-mf-cart-drawer]'), panel = q('.mf-cart-drawer__panel');
  panel.role = 'dialog'; panel.setAttribute('aria-label', 'Sua criação nesta sessão'); panel.tabIndex = -1;
  q('.mf-cart-drawer__title').textContent = 'Sua criação';
  show(q('[data-mf-cart-drawer-loading]'), false); show(q('[data-mf-cart-drawer-items]'), true); show(q('[data-mf-cart-drawer-footer]'), true);
  q('[data-mf-cart-drawer-items]').replaceChildren(el('li', 'Configure sua miniatura para revisar os detalhes. As fotos permanecem nesta sessão.', 'apex-note'));
  q('[data-mf-cart-drawer-shipping-text]').textContent = 'Sem envio de dados ou pagamento nesta prévia.';
  const checkout = q('[data-mf-cart-drawer-checkout]'); checkout.textContent = 'Revisar criação';
  const closeDrawer = () => { show(drawer, false); drawer.classList.remove('is-visible'); };
  checkout.addEventListener('click', e => { e.preventDefault(); closeDrawer(); document.dispatchEvent(new Event('apex:review')); });
  all('[data-mf-cart-drawer-close]').forEach(n => n.addEventListener('click', closeDrawer));
  q('.mf-header__action--cart').addEventListener('click', e => { e.preventDefault(); show(drawer, true); drawer.classList.add('is-visible'); panel.focus(); });
  const discard = el('button', 'Descartar criação desta sessão', 'mf-cart-drawer__footer-link'); discard.type = 'button'; q('[data-mf-cart-drawer-footer]').append(discard);
  discard.addEventListener('click', () => { document.dispatchEvent(new Event('apex:discard')); closeDrawer(); });
  document.addEventListener('apex:change', e => {
    const { product, size, total, hasDraft } = e.detail;
    q('[data-mf-cart-drawer-items]').replaceChildren(el('li', product + ' · ' + size + ' cm · ' + total, 'apex-note'), el('li', hasDraft ? 'Pedido de teste gerado nesta sessão.' : 'Criação em andamento. Revise para gerar o pedido de teste.', 'apex-note'));
    q('[data-mf-cart-drawer-count]').textContent = hasDraft ? '1' : '0';
  });
  const video = q('[data-mf-video-modal]'), videoPanel = q('.mf-video-modal__dialog') || q('.mf-video-modal__content') || video.children[1];
  const text = el('div', undefined, 'apex-process-preview'); text.append(el('h2', 'Como sua foto ganha forma'), el('p', 'Referência, modelagem, aprovação e produção. Nosso vídeo está em preparação; conheça os nove passos na página.'));
  const processLink = el('a', 'Conhecer as etapas', 'button'); processLink.href = '#como-lo-hacemos'; processLink.addEventListener('click', () => show(video, false)); text.append(processLink); videoPanel.append(text);
  all('[data-mf-video-open]').forEach(n => n.addEventListener('click', () => { show(video, true); q('[data-mf-video-close]', video).focus(); }));
  all('[data-mf-video-close]').forEach(n => n.addEventListener('click', () => show(video, false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDrawer(); show(video, false); show(menu, false); document.body.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); }
    if (e.key === 'Tab' && !drawer.hidden) { const focusable = all('button,a[href]', panel).filter(n => n.getClientRects().length); const first = focusable[0], last = focusable.at(-1); if (e.shiftKey && [first, panel].includes(document.activeElement)) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
}
