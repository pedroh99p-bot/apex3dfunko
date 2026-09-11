// Local presentation only. No relationship with configuration, uploads or orders.
export function startHeroCarousel() {
  const root = document.querySelector('.hero-carousel');
  if (!root) return;
  const slides = [...root.querySelectorAll('.carousel-slide')];
  const dots = [...root.querySelectorAll('[data-carousel-dot]')];
  const stage = root.querySelector('.carousel-stage');
  const play = root.querySelector('[data-carousel-play]');
  const status = root.querySelector('.carousel-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, playing = !motion.matches, hovering = false, visible = true, timer, pointer;
  function schedule() {
    clearTimeout(timer);
    if (playing && !hovering && visible && !document.hidden) timer = setTimeout(() => show(index + 1), 5500);
  }
  function updatePlayback() {
    play.textContent = playing ? 'Ⅱ' : '▷';
    play.setAttribute('aria-label', playing ? 'Pausar carrossel' : 'Reproduzir carrossel');
    root.dataset.playing = String(playing);
    status.setAttribute('aria-live', playing ? 'off' : 'polite');
    schedule();
  }
  function pause() { playing = false; updatePlayback(); }
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.inert = i !== index;
      dots[i].setAttribute('aria-current', String(i === index));
    });
    slides[index].querySelector('img').loading = 'eager';
    status.textContent = slides[index].getAttribute('aria-label');
    root.dataset.slide = String(index);
    schedule();
  }
  function move(direction) { pause(); show(index + direction); }
  root.querySelector('[data-carousel-prev]').addEventListener('click', () => move(-1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => move(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => { pause(); show(i); }));
  play.addEventListener('click', () => { playing = !playing; updatePlayback(); });
  root.addEventListener('focusin', event => {
    // Focusing any control stops autoplay; the play button can explicitly restart it.
    if (!root.contains(event.relatedTarget)) pause();
  });
  root.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pause(); pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { pointer = null; });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { if (motion.matches) pause(); });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; schedule();
  }, { threshold: 0.15 });
  observer.observe(root);
  window.addEventListener('pagehide', () => { clearTimeout(timer); observer.disconnect(); });
  show(0); updatePlayback();
}
