import { endpoints } from '../config/endpoints.js';

export async function mountTemplate() {
  const response = await fetch(endpoints.template, { credentials: 'omit' });
  if (!response.ok) throw new Error('Não foi possível carregar o template local.');
  const source = new DOMParser().parseFromString(await response.text(), 'text/html');
  // A cópia em memória é apenas markup/estilos. Nenhum JS remoto ou inline é executado.
  source.querySelectorAll('script, noscript, iframe, object, embed, base, dialog, #moove_gdpr_cookie_info_bar').forEach(node => node.remove());
  source.querySelectorAll('*').forEach(node => {
    for (const attr of Array.from(node.attributes)) {
      if (/^on/i.test(attr.name) || /nonce|token|session|checkout-url|product-add-url/i.test(attr.name) || ['srcdoc', 'action', 'formaction', 'ping'].includes(attr.name)) node.removeAttribute(attr.name);
    }
    if (node.hasAttribute('href') && node.tagName !== 'LINK') {
      const href = node.getAttribute('href');
      if (!href.startsWith('#')) { node.setAttribute('href', '#'); node.dataset.apexExternal = 'true'; }
    }
  });
  source.querySelectorAll('input[name="gtmkit_product_data"]').forEach(node => node.remove());
  source.querySelectorAll('img[src=""]').forEach(node => node.removeAttribute('src'));
  source.querySelectorAll('form').forEach(form => { form.removeAttribute('method'); form.removeAttribute('enctype'); });
  document.title = source.title;
  document.body.className = source.body.className;
  const stylesReady = [];
  const appendStyle = node => {
    if (node.tagName === 'LINK') stylesReady.push(new Promise(resolve => {
      const timer = setTimeout(resolve, 12000);
      const done = () => { clearTimeout(timer); resolve(); };
      node.addEventListener('load', done, { once: true }); node.addEventListener('error', done, { once: true });
    }));
    document.head.append(node);
  };
  for (const node of source.head.querySelectorAll('style, link[rel="stylesheet"]')) appendStyle(node);
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/css/foundation.css'; appendStyle(css);
  document.body.replaceChildren(...source.body.childNodes);
  const banner = document.createElement('aside'); banner.className = 'apex-development';
  banner.textContent = 'Prévia local · finalização gera somente um rascunho · nenhum pedido é enviado';
  document.body.prepend(banner);
  const status = document.createElement('p'); status.id = 'apex-status'; status.role = 'status'; status.hidden = true;
  banner.append(status);
  const dialog = document.createElement('dialog'); dialog.id = 'apex-order-preview';
  const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Fechar'; close.addEventListener('click', () => dialog.close());
  const title = document.createElement('h2'); title.textContent = 'Rascunho local — inspeção segura';
  const note = document.createElement('p'); note.textContent = 'Sem envio. Frete final e validação de produção ainda pendentes. Textos livres e nomes de arquivos omitidos.';
  const pre = document.createElement('pre'); dialog.append(close, title, note, pre); document.body.append(dialog);
  await Promise.all(stylesReady);
  await document.fonts.ready;
}
