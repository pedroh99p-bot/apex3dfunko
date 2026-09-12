import fs from 'node:fs';
import { chromium } from '../tests/playwright-runtime.js';
import { originalRegions } from './original-selectors.js';
const manifest=JSON.parse(fs.readFileSync('docs/evidence/original-shell-assets.json'));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();
 const result=await page.evaluate(({html,manifest,regions})=>{
  const d=new DOMParser().parseFromString(html.replace(/<div class=.[”]?mf-review-card__badge[”]?.[\s\S]*?<\/div>/g, block => block.replaceAll('”','\"')),'text/html'), map=new Map(manifest.filter(x=>x.file).map(x=>[x.url,'/'+x.file]));
  const q=s=>d.querySelector(s), all=s=>[...d.querySelectorAll(s)], set=(s,t)=>all(s).forEach(n=>{if(!n.querySelector('svg')){n.textContent=t;return;}const walk=d.createTreeWalker(n,NodeFilter.SHOW_TEXT),texts=[];let x;while(x=walk.nextNode())if(x.textContent.trim()&&!x.parentElement.closest('svg')&&!/^[→×◇]+$/.test(x.textContent.trim()))texts.push(x);if(texts.length){texts[0].textContent=t;for(const rest of texts.slice(1))rest.textContent='';}else n.append(d.createTextNode(t));});
  const local=u=>map.get(u)||u;
  const csp="default-src 'none'; script-src 'self'; connect-src 'none'; style-src 'self'; img-src 'self' blob: data:; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  // Never attach or execute the original document's scripts.
  all('script,iframe,object,embed,noscript,#moove_gdpr_cookie_info_bar,#moove_gdpr_cookie_modal').forEach(n=>n.remove());
  const styles=all('link[rel=stylesheet]').map(n=>n.getAttribute('href')).filter(u=>map.has(u));
  const styleFiles=[...new Set(styles.map(local))];
  const critical=q('#mf-critical-product')?.textContent||'';
  d.head.innerHTML='<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
  const meta=d.createElement('meta');meta.httpEquiv='Content-Security-Policy';meta.content=csp;d.head.append(meta);
  for(const src of styleFiles){const link=d.createElement('link');link.rel='stylesheet';link.href=src;d.head.append(link);}
  const inline=[];
  for(const n of all('*')){
   for(const a of [...n.attributes]){
    if(/^on/i.test(a.name)||/nonce|checkout-url|cart-url|ajax|endpoint|tracking/.test(a.name))n.removeAttribute(a.name);
    else if(a.name==='srcset') n.setAttribute(a.name,a.value.split(',').map(part=>{const bits=part.trim().split(/\s+/);bits[0]=local(bits[0]);return bits.join(' ');}).join(', '));
    else if(a.name==='src') n.setAttribute(a.name,local(a.value));
   }
   if(n.hasAttribute('style')){let css=n.getAttribute('style');for(const [url,file] of map)css=css.replaceAll(url,file);const cls='source-inline-'+inline.length;inline.push('.'+cls+'{'+css+'}');n.classList.add(cls);n.removeAttribute('style');}
  }
  all('img[src=""]').forEach(img=>{img.src='/assets/brand/apex-logo.webp';img.alt='Apex3D';});
  all('.custom-logo').forEach(img=>{img.src='/assets/brand/apex-logo.webp';img.alt='Apex3D';img.width=1536;img.height=1024;});
  // Fix four malformed star paths from the captured source, retaining the same icon.
  all('svg path').filter(n=>/\.{3}|…/.test(n.getAttribute('d')||'')).forEach(n=>n.setAttribute('d','M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'));
  for(const [id,sel] of regions)all(sel).forEach(n=>n.dataset.originalRegion=id);
  all('form').forEach(f=>{f.removeAttribute('action');f.removeAttribute('method');f.noValidate=true;});
  all('input[type=hidden]').forEach(n=>n.remove());
  const baseDocument=d.documentElement.outerHTML;
  d.documentElement.lang='pt-BR';d.documentElement.dataset.apexShell='original-v1';
  d.title='Apex3D | Miniatura 3D Personalizada';
  for(const [name,content] of [['description','Transforme sua foto em uma miniatura 3D feita especialmente para você. Você aprova o modelo antes da produção.'],['robots','noindex,nofollow'],['referrer','no-referrer'],['theme-color','#cc1233']]){const n=d.createElement('meta');n.name=name;n.content=content;d.head.append(n);}
  for(const [property,content] of [['og:title',d.title],['og:description','Sua história em uma miniatura 3D personalizada. Prévia Apex3D.'],['og:image','/assets/brand/apex-logo.webp'],['og:type','website']]){const n=d.createElement('meta');n.setAttribute('property',property);n.content=content;d.head.append(n);}
  for(const href of ['/css/shell-inline.css','/css/apex-shell.css']){const n=d.createElement('link');n.rel='stylesheet';n.href=href;d.head.append(n);}
  const script=d.createElement('script');script.type='module';script.src='/js/main.js';d.head.append(script);
  const walker=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT);let text;
  while(text=walker.nextNode())text.nodeValue=text.nodeValue.replace(/Mi\s?Funko/gi,'Apex3D').replace(/Funko\s*Pop/gi,'miniatura 3D').replace(/funkos/gi,'miniaturas').replace(/funko/gi,'miniatura').replace(/\+?\s*\d+(?:[.,]\d+)?\s*€/g,' A confirmar').replace(/€/g,'').replace(/\bEUR\b/g,'BRL');
  for(const n of all('*'))for(const a of [...n.attributes]){
   if(['title','alt','aria-label','placeholder'].includes(a.name))n.setAttribute(a.name,a.value.replace(/Mi\s?Funko/gi,'Apex3D').replace(/funko(?:\s*pop)?/gi,'miniatura 3D'));
   if(/price|data-extra-price|base-price/.test(a.name)&&a.value)n.removeAttribute(a.name);
   if(a.name.startsWith('data-')&&(/https?:|add-to-cart|Funko|MiFunko/i.test(a.value)||/product-id|add-url/.test(a.name)))n.removeAttribute(a.name);
  }
  for(const a of all('a')){
   const href=a.getAttribute('href')||'';a.removeAttribute('target');a.removeAttribute('rel');
   if(href.startsWith('#')){if(!d.getElementById(href.slice(1)))a.href='#personalizar';continue;}
   a.href=/instagram|trabaj/.test(href)?'#trabajos':/opinion|review|revi\.|trustpilot/.test(href)?'#opiniones':/faq|legal|privacidad|politica|termin|reembolso/.test(href)?'#faqs':/como|proceso/.test(href)?'#como-lo-hacemos':'#personalizar';
  }
  q('.mf-header .custom-logo-link')?.setAttribute('href','#inicio');q('.mf-product-hero').id='inicio';
  all('.mf-lang__menu,.mf-header__mobile-langs').forEach(n=>n.remove());set('.mf-lang__code','PT-BR');all('.mf-lang__toggle').forEach(n=>{n.disabled=true;n.setAttribute('aria-label','Idioma português do Brasil');});all('.mf-lang__flag').forEach(n=>n.textContent='BR');
  set('.mf-header__cta-label','Criar miniatura');set('.mf-product-whatsapp__text','Tire suas dúvidas sobre a criação');
  q('.mf-product-sales__title').innerHTML='Sua <span>Miniatura 3D</span> personalizada';
  set('.mf-product-sales__description','Transforme sua foto em uma miniatura 3D feita especialmente para você. Você aprova o modelo antes da produção.');
  set('.mf-product-sales__stars','☆☆☆☆☆');set('.mf-product-sales__score','Prévia');set('.mf-product-sales__review','Avaliações futuras');set('.mf-product-sales__social','Feita a partir das suas fotos');
  q('.mf-product-sales__price .price').innerHTML='<small>A partir de</small> <ins><span class="amount" data-apex-starting-price></span></ins>';
  set('.mf-product-sales__saving','Valores provisórios');set('.mf-product-sales__ship-main','Data e frete a confirmar');set('.mf-product-sales__ship-note','Sem promessa automática de entrega');
  set('.mf-product-sales__video-question','Como sua foto ganha forma?');set('.mf-product-sales__video-link','Veja o processo');
  const features=['Modelagem a partir das suas fotos','Você aprova antes da produção','Roupa, pose e detalhes personalizados','Referências guardadas apenas nesta sessão'];
  all('.mf-product-sales__feature').forEach((n,i)=>{const p=n.querySelector('p');p.textContent=features[i%features.length];});
  set('.mf-funko-type-selector__title','Escolha sua miniatura');set('.mf-funko-type-link__text','Uma criação para cada história');
  const products=[['individual','Individual'],['pet','Pet'],['casal','Casal'],['familia','Família']];
  all('[data-mf-funko-type-option]').forEach((n,i)=>{n.dataset.product=products[i][0];n.dataset.chooseProduct=products[i][0];n.querySelector('.mf-funko-type-option__title').textContent=products[i][1];n.querySelector('.mf-funko-type-option__price').innerHTML='<span class="mf-funko-type-option__price-desde">A partir de</span> <b data-apex-product-price="'+products[i][0]+'"></b>';n.removeAttribute('data-type-price');});
  const form=q('form.cart');form.id='configurator';form.dataset.apexForm='true';form.hidden=true;
  all('.single_add_to_cart_button').forEach(n=>{n.type='button';n.textContent='Personalizar minha miniatura';n.dataset.apexStart='';n.removeAttribute('name');n.removeAttribute('value');});
  all('[data-mf-personalize-cta]').forEach(n=>{n.type='button';const t=n.querySelector('span');if(t)t.textContent='Personalizar minha miniatura';n.dataset.apexStart='';});
  set('.mf-product-sketch__title','Veja como sua ideia ganha forma');set('.mf-product-sketch__text','Conheça a modelagem e a aprovação antes da produção.');set('.mf-product-sketch__badge','VOCÊ PARTICIPA');set('.mf-product-sketch__button','Conhecer o processo');
  set('.mf-product-b2b-label','IDEIAS PARA COMPARTILHAR');set('.mf-product-b2b__title','Miniaturas para grupos e empresas');set('.mf-product-b2b__text','Uma composição com várias histórias. Condições para projetos maiores ainda em definição.');set('.mf-product-b2b__button','Explorar uma composição');all('.mf-product-b2b__tag').forEach((n,i)=>n.textContent=['Grupos','Equipes','Presentes'][i%3]);
  set('.mf-product-section-heading__title','Comece a personalizar');set('.mf-product-section-heading__description','Escolha os detalhes nos painéis abaixo. As fotos guiam a aparência. Esta prévia gera apenas pedidos de teste, sem cobrança.');
  set('.mf-product-summary__eyebrow','O SEU PEDIDO');set('.mf-product-summary__title-meta',' · data a confirmar');
  all('.mf-product-summary__notes li').forEach((n,i)=>n.textContent=['Modelagem 3D a partir das fotos','Aprovação antes da produção','Valores e entrega a confirmar'][i%3]);
  const actions=q('[data-mf-summary-form]');actions.innerHTML='<button type="submit" form="configurator" class="single_add_to_cart_button button alt review-button">Revisar pedido de teste</button><p class="apex-staging-note">Estimativa de teste · sem envio ou pagamento.</p>';
  const errors=d.createElement('div');errors.id='validation-errors';errors.className='apex-errors';errors.hidden=true;errors.tabIndex=-1;errors.setAttribute('role','alert');q('.mf-product-extra-options__main')?.prepend(errors);
  set('.mf-product-showcase__eyebrow','GALERIA · REFERÊNCIAS DE ESTILO');q('.mf-product-showcase__title').innerHTML='Histórias que <span>ganham forma</span>';
  set('.mf-product-showcase__description','Todas as comparações do acervo original estão preservadas nesta prévia. Referências de estilo, ainda não um portfólio Apex3D.');
  const insta=q('.mf-product-showcase__instagram');if(insta){insta.href='#personalizar';insta.querySelector('span:last-child').textContent='Criar minha miniatura';}
  set('.mf-reviews-slider__eyebrow','ESPAÇO PARA HISTÓRIAS REAIS');set('.mf-reviews-slider__title','Futuras experiências com a Apex3D');set('.mf-reviews-slider__score','—');set('.mf-reviews-slider__denom','');set('.mf-reviews-slider__based','Avaliações reais serão publicadas após entregas verificadas.');set('.mf-reviews-slider__badge-text','STAGING');set('.mf-reviews-slider__more','Conhecer o processo');
  all('.mf-reviews-slider__badge-icon').forEach(n=>n.textContent='◇');
  all('.mf-review-card__name,.mf-reviews-mini-slide__author').forEach(n=>n.textContent='Avaliação futura');
  all('.mf-review-card__date').forEach(n=>n.textContent='Espaço reservado');all('.mf-review-card__verified').forEach(n=>n.textContent='STAGING');
  all('.mf-review-card__text,.mf-reviews-mini-slide__text').forEach(n=>n.textContent='Aqui aparecerá uma experiência real de quem recebeu uma miniatura Apex3D. Ainda não há depoimento publicado.');
  all('.mf-review-card__avatar,.mf-reviews-mini-slide__photo').forEach(n=>{n.src='/assets/ui/review-placeholder.svg';n.removeAttribute('srcset');n.alt='Espaço reservado para avaliação futura';});
  all('.mf-review-card__stars svg,.mf-reviews-mini-slide__stars svg,.mf-reviews-slider__header-stars svg').forEach(n=>{n.setAttribute('fill','none');n.setAttribute('stroke','#c29436');n.setAttribute('aria-hidden','true');});
  const counters=all('.mf-product-social-proof__item');counters.forEach((n,i)=>{const value=n.querySelector('[data-mf-social-proof-value]')||n.querySelector('p');if(value)value.textContent=['Fotos','Aprovação','Detalhes'][i%3];const label=n.querySelector('p:last-child');if(label&&label!==value)label.textContent=['Guiam sua criação','Antes da produção','Escolhidos por você'][i%3];});
  const trustTitles=['Sua foto como referência','Aprovação do modelo','Espaço para ajustes','Data combinada','Pedido de teste','Condições transparentes'];
  const trustCopy=['A aparência é baseada nas referências enviadas.','Você aprova o modelo antes da produção.','As condições de alterações serão confirmadas antes do pedido.','A data desejada depende de confirmação de disponibilidade.','Esta prévia não cobra nem envia pedidos.','Preço, embalagem, frete e produção ainda passam por homologação.'];
  set('.mf-product-trust__title','Você participa de cada detalhe');set('.mf-product-trust__description','Informações claras para construir sua criação.');all('.mf-product-trust-card').forEach((n,i)=>{n.querySelector('.mf-product-trust-card__title').textContent=trustTitles[i];n.querySelector('.mf-product-trust-card__description').textContent=trustCopy[i];});
  set('.mf-product-trust__eyebrow','CRIAÇÃO COM CLAREZA');
  set('.mf-product-info-tabs__title','Da sua foto à miniatura pronta');
  const processTitles=['Seu pedido começa nas fotos','Primeiro modelo 3D','Cor e aprovação','Apresentação da caixa','Impressão 3D','Preparação e acabamento','Pintura dos detalhes','Embalagem da criação','Envio combinado'];
  const processCopy=['Escolha sua composição e compartilhe as referências.','Suas fotos orientam roupa, pose e aparência.','Confira o modelo e os ajustes antes da produção.','A personalização e as medidas serão confirmadas.','O modelo aprovado segue para impressão.','A peça é preparada para receber os detalhes.','As cores acompanham as referências aprovadas.','O formato da embalagem depende da criação.','Frete e disponibilidade são confirmados antes do pedido.'];
  all('.mf-product-how-grid > *').forEach((n,i)=>{if(n.querySelector('h3'))n.querySelector('h3').textContent=processTitles[i];const tag=n.querySelector('.mf-product-how-card__tag');if(tag)tag.textContent='ETAPA '+(i+1);const p=n.querySelector('.mf-product-how-card__description');if(p)p.textContent=processCopy[i];});
  for(const sel of ['#como-lo-hacemos','#trabajos']){const p=d.createElement('p');p.className='apex-origin-note';p.textContent='Imagens de referência do acervo original, utilizadas para revisão visual. Não representam instalações ou trabalhos próprios da Apex3D.';q(sel).append(p);}
  set('.mf-product-delivery__title','Quando sua criação precisa chegar?');set('.mf-product-delivery__subtitle','Informe sua necessidade. A disponibilidade será confirmada antes do pedido.');
  all('.mf-product-delivery-option').forEach((n,i)=>{n.querySelector('.mf-product-delivery-option__title').textContent=i?'Expresso · em definição':'Padrão · a confirmar';n.querySelector('.mf-product-delivery-option__subtitle').textContent=i?'Ainda não disponível':'Prazo e frete combinados antes da confirmação';n.querySelector('.mf-product-delivery-option__price').textContent=i?'Indisponível':'Sem urgência automática';const input=n.querySelector('input');input.disabled=i>0;input.checked=i===0;});
  set('.mf-product-delivery-date__label','Quando você precisa receber?');set('.mf-product-delivery-date__lead','A data informada é uma necessidade, não uma promessa automática.');set('.mf-product-delivery-date__hint','Confirmaremos a disponibilidade da data após o pedido.');set('.mf-product-delivery-flexibility__description','Podemos combinar uma alternativa, sem urgência automática.');
  set('.mf-footer__cta-title','Sua história pode ganhar forma.');set('.mf-footer__cta-text','Personalize uma miniatura 3D a partir das suas fotos.');set('.mf-footer__cta-btn','Criar minha miniatura');set('.mf-footer__text','Apex3D · Miniatura 3D Personalizada. Prévia de homologação: sem envio de pedidos ou pagamentos.');set('.mf-footer__wa','Como funciona');set('.mf-footer__video','Conhecer o processo');
  all('.mf-fixed-cart-bar__name').forEach(n=>n.textContent='Miniatura 3D Personalizada');
  // Preserve unavailable offers visually and route their actions to an explanation.
  for(const selector of ['.mf-gift-upsell','[data-mf-mini-step]']){const node=q(selector);node.dataset.apexPending='true';const p=d.createElement('p');p.className='apex-staging-note';p.textContent='EM HOMOLOGAÇÃO · opção visual preservada, ainda indisponível para adicionar ao pedido.';node.append(p);}
  all('input,select,textarea').forEach(n=>n.removeAttribute('required'));
  all('.mf-size-option__badge').forEach(n=>n.textContent='Em destaque');
  const faq=[['Quais fotos devo enviar?','Use imagens nítidas, bem iluminadas, sem filtros, com rosto ou focinho visível. Cada pessoa e pet precisa da própria referência.'],['Como funciona a aprovação?','Você aprova o modelo antes da produção. As condições de ajustes serão combinadas antes do pedido.'],['Posso escolher roupa, pose e acessórios?','Sim. Siga as fotos ou descreva sua ideia. Acessórios selecionados precisam de descrição ou referência própria.'],['Quais tamanhos e composições existem?','Explore os tamanhos de 6, 10, 15 e 20 cm e os modelos Individual, Casal, Família e Pet. Preços e compatibilidade ainda são provisórios.'],['Como são prazo e entrega?','Informe quando precisa receber. Produção, disponibilidade, frete e entrega serão confirmados; a data selecionada não é uma promessa.'],['Quando começa a produção?','Após confirmação das condições e aprovação do modelo. Os pedidos de teste desta prévia não entram em produção.'],['Posso pagar por aqui?','Ainda não. Esta versão gera um rascunho local, sem cobrança, sem backend e sem envio do pedido. As fotos são perdidas ao sair ou recarregar.']];
  all('[data-mf-faq-item]').forEach((n,i)=>{const toggle=n.querySelector('[data-mf-faq-toggle]');const label=[...toggle.children].find(x=>x.tagName!=='SVG');if(label)label.textContent=faq[i][0];else toggle.firstChild.textContent=faq[i][0];n.querySelector('[data-mf-faq-body]').textContent=faq[i][1];});
  set('.mf-product-info-tabs__description','Conheça o caminho da referência à criação pronta. As imagens ilustram as etapas e passam por revisão de origem.');
  all('.mf-review-card__badge').forEach(n=>{const text=[...n.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());if(text)text.textContent='Referência visual';});
  all('.mf-pets-step__badge').forEach(n=>n.textContent='Opcional');
  all('.mf-size-step__compare, .mf-size-step__compare-trigger').forEach(n=>{if(n.tagName==='BUTTON')n.textContent='Compare os quatro tamanhos';});
  set('[data-mf-skin-summary]','Seguiremos suas fotos');set('[data-mf-outfit-summary]','Seguir a foto ou personalizar');
  set('[data-mf-extras-tab=logos]','Detalhados');set('.mf-accessories-builder__meta','Preço provisório');
  all('[data-mf-skin-step] .mf-field-required,[data-mf-skin-step] .mf-required,[data-mf-outfit-step] .mf-required').forEach(n=>n.textContent='');
  set('.mf-extra-step__notice-title','Bases e complementos para sua criação');
  set('.mf-extra-step__notice-text','Confira as opções disponíveis. Os demais itens aguardam homologação.');
  set('.mf-extra-option__badge','Oferta em revisão');
  all('.mf-extra-option__price').filter(n=>/Grátis/.test(n.textContent)).forEach(n=>n.textContent='A confirmar');
  all('[data-mf-extra-step] i').forEach(n=>n.textContent='Compatibilidade em revisão');
  set('.mf-size-compare__title','Compare os tamanhos');set('.mf-size-compare__note','Referência de escala. Medidas, detalhes e embalagem sujeitos à confirmação.');
  set('.mf-gift-upsell__price','Preço a confirmar');set('.mf-gift-upsell__card-badge','Em homologação');set('.mf-gift-upsell-modal__badge','Em homologação');
  all('[data-mf-gift-upsell-open]').forEach(n=>{n.disabled=true;n.querySelector('.mf-gift-upsell__add-label--default').textContent='Indisponível nesta prévia';});
  all('.mf-gift-upsell-modal input,.mf-gift-upsell-modal textarea,.mf-gift-upsell-modal select').forEach(n=>n.disabled=true);
  const wording=new Map([['Contacto','Contato'],['*Balón no incluido','Objeto esportivo não incluído'],['Tu escolhes quais e onde vão.','Você escolhe quais e onde vão.'],['telemóvel','celular'],['auscultadores','fones de ouvido'],['Esboço 3D grátis','Conheça a modelagem'],['Devoluções','Condições em definição'],['Aviso legal y política de privacidad','Privacidade das fotos'],['Política de cookies','Dados nesta sessão'],['Ver carrinho','Revisar criação'],['Continuar a comprar','Continuar personalizando'],['Impostos incluídos','Valores provisórios'],['* Apenas península','Frete a confirmar'],['Foto do cliente','Referência visual'],['Tamanho Grande (sem caixa miniatura)','Grande formato · caixa a confirmar'],['¿No sabes qué tamaño elegir? Compara los 4 tamaños','Compare os quatro tamanhos']]);
  const texts=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT);let piece;while(piece=texts.nextNode()){for(const [from,to] of wording)piece.nodeValue=piece.nodeValue.replaceAll(from,to);}
  all('.mf-pets-step__title-badge, .mf-pets-step__discount').forEach(n=>n.textContent='Opcional');
  all('[data-mf-skin-step] [class*=required], [data-mf-outfit-step] [class*=required], [data-mf-box-step] [class*=required]').forEach(n=>n.textContent='');
  all('.mf-footer a').forEach(a=>{if(/privacidade|dados|condições/i.test(a.textContent))a.href='#faqs';});
  const dialog=d.createElement('dialog');dialog.id='order-review';dialog.setAttribute('aria-labelledby','review-title');dialog.innerHTML='<div id="review-content"></div>';d.body.append(dialog);
  const confirmation=d.createElement('dialog');confirmation.id='order-confirmation';confirmation.innerHTML='<h2 id="confirmation-title" tabindex="-1">Seu pedido de teste está pronto.</h2><p>Nenhum pedido foi enviado e nenhum pagamento foi realizado. O rascunho permanece apenas nesta sessão.</p><button type="button" id="close-confirmation">Voltar à criação</button>';d.body.append(confirmation);
  const favicon=d.createElement('link');favicon.rel='icon';favicon.href='/assets/brand/apex-logo.webp';d.head.append(favicon);
  const lightbox=d.createElement('dialog');lightbox.id='gallery-lightbox';lightbox.innerHTML='<button type="button" aria-label="Fechar imagem" data-gallery-close>×</button><img src="/assets/brand/apex-logo.webp" alt="Referência de estilo" id="gallery-enlarged"><p>Referência visual · ORIGIN_REVIEW_REQUIRED</p>';d.body.append(lightbox);
  return {html:'<!doctype html>\n'+d.documentElement.outerHTML,baseline:'<!doctype html>\n'+baseDocument,inline:critical+'\n'+inline.join('\n')};
 },{html:fs.readFileSync('index.html','utf8'),manifest,regions:originalRegions});
 fs.mkdirSync('css',{recursive:true});fs.mkdirSync('assets/ui',{recursive:true});
 fs.writeFileSync('assets/ui/review-placeholder.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#faf6f1"/><circle cx="50" cy="36" r="14" fill="none" stroke="#8a8078" stroke-width="3"/><path d="M24 79c0-28 52-28 52 0" fill="none" stroke="#8a8078" stroke-width="3"/></svg>');
 fs.writeFileSync('dev.html',result.html);fs.writeFileSync('css/shell-inline.css',result.inline);
 fs.writeFileSync('test-results/original-shell/baseline-local.html',result.baseline.replace('</head>','<link rel="stylesheet" href="/css/shell-inline.css"></head>'));
 console.log('Shell original portado: '+Buffer.byteLength(result.html)+' bytes.');
}finally{await browser.close();}
