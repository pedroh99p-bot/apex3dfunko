# Integrações externas e segurança do baseline

Inventário da cópia HTML e dos scripts públicos do tema consultados em 11/09/2026. Acesso de leitura a JS/CSS/HEAD não autentica contas nem comprova disponibilidade de APIs. Nenhum endpoint transacional externo foi acionado na auditoria. [RESOURCE-INVENTORY](RESOURCE-INVENTORY.md) lista individualmente todos os 57 scripts externos e 53 declarações de CSS, inclusive ordem e duplicatas. Manifesto de fontes consultadas em `evidence/remote-manifest.json`.

## Serviços

| Integração | Onde / mecanismo | Uso e dependência |
| --- | --- | --- |
| WordPress | `mifunko.com/personalizacion/wp-*`; H192–422/7696+ | Página já renderizada; Hooks, i18n, data, compose, element, React/ReactDOM 18.3.1 e jQuery 3.7.1/Migrate. Não há instalação WordPress local |
| Tema MiFunko | H220–267 e H7713–7738 | CSS/JS de configurador, galeria, resumo, uploads/editor, drawer, reviews, vídeo e tracking. Versão na URL 3.6.36.1788504072; titularidade/licença não fornecida |
| WooCommerce | H345–362, configs/cart, plugins finais | Produto simples 875; página anuncia assets 10.8.1; add-to-cart, single-product, blockUI, js-cookie e módulos block. Loja/banco não entregues |
| WP REST / Store API | H422, H7716 | `/wp-json/`, `/wp-json/wp/v2/product/875`, `/wp-json/wc/store/v1`; Store API configurada, mas `submitAddToCart` usa POST HTML, não Store API |
| AJAX WordPress/WooCommerce | H347/357/7716 e scripts do carrinho | `admin-ajax.php`, `?wc-ajax=%%endpoint%%`; sessões/cookies e nonces da origem |
| PayPal Commerce | H7708–7712, script ppcp e CSS H217 | SDK remoto `www.paypal.com/sdk/js`, EUR, capture, endpoints de criação/aprovação/captura de ordem. Credenciais/pagamento não testados |
| Redsys | CSS `redsyspur/...jquery-ui.min.css` H206 e jQuery UI H7700–7707 | Evidência de plugin de pagamento instalado na origem; não prova método ativo no checkout |
| Google Tag Manager / GTM Kit | H301–342/363–373/417–421 | Loader `www.googletagmanager.com/gtm.js`, dataLayer/ecommerce view_item, integração WooCommerce e engagement. IDs pertencem à origem |
| Pixel Manager for WooCommerce | H375–379/439–461 | `pmwDataLayer`, configurações Google Ads/remarketing e outros canais. Duplicação potencial de eventos com GTM/Facebook precisa medição futura |
| Meta / Facebook for WooCommerce | H463–752, 7691–7695, 7745–7752, 7762–7792 | `connect.facebook.net/en_US/fbevents.js`, PageView/signals, sessionStorage de deduplicação; endpoint `wc_facebook_record_client_signals`; CAPI client ParamBuilder via unpkg |
| Microsoft Clarity | H423–434 | Loader `www.clarity.ms/tag/...`; analytics da origem. ID não tratado como chave secreta, mas não adotado para Apex |
| Tracker próprio MiFunko | H7720–7724, `visitor-tracking.js` | POST JSON para admin-ajax `action=mf_track_events` por sendBeacon/Blob, fallback XHR; lotes de 15 ou timeout de 8s e saída da página |
| Sourcebuster / atribuição WC | H7739–7744 | Cookies/referrer/UTM e atribuição de pedidos; settings da origem. Não é persistência de configuração |
| GDPR Cookie Compliance | H268–300/7753–7761/7797–7938 | Banner, preferências/cookies, AJAX, fontes Nunito e ícones do plugin. Consentimento deve ser revisado junto dos trackers antes de publicação Apex |
| Google Fonts | H218–219 | Nunito/Poppins pesos 400–800; Material Icons. CSS em fonts.googleapis.com e binários em fonts.gstatic.com |
| YouTube | H1200/1207/7408–7423/7583/7605; video-modal.js | Um vídeo `Be9Oh053xd8`; iframe só recebe embed ao abrir. Links sociais externos não são reprodução local |
| Revi / Trustpilot | H1165/6826/6832/6978 | Links para reviews da MiFunko; conteúdo de depoimentos também está estático no HTML. Não há chamada direta de API de reviews no código inspecionado |
| WhatsApp | Header/hero/tipo/data/footer | `api.whatsapp.com/send/?phone=34613647712`, `wa.me/34613647712`; link de pedido especial traz saudação espanhola. Não envia payload do configurador |
| Redes sociais | H1168/7312/7564–7573 | Instagram, Facebook, TikTok e YouTube da marca atual; navegação externa |
| Esboço/B2B/contato/conta/legais | Links `/tumini/pt/`, `/personalizacion/...` | Outros serviços e páginas MiFunko; nada implementado como rotas locais |
| CDN | unpkg, Google Fonts e o próprio servidor MiFunko | Script Meta sem versão de pacote fixada no caminho unpkg; imagens majoritariamente wp-content/uploads, com srcset e lazy-loading |

## Endpoints e payloads relevantes

| Destino | Quando/método | Estrutura enviada |
| --- | --- | --- |
| `window.location.href` (no original: página do produto) | P6080, adicionar configuração; POST multipart | `quantity`, `add-to-cart`, `mf_*`, arquivos File e eventual `mf_edit_replace_key`; USER-FLOW detalha campos |
| `/personalizacion/wp-admin/admin-ajax.php` | Drawer, POST multipart | `action=mf_cart_drawer_data`, `nonce` |
| Mesmo admin-ajax | Remover/alterar quantidade | `action=mf_cart_remove_item` + key; `action=mf_cart_update_qty` + key + quantity; nonce |
| Mesmo admin-ajax `?action=mf_track_events` | Após eventos/timeout/saída; sendBeacon ou XHR POST JSON | Objeto com `nonce` e `events[]`; cada evento contém sid, t, type, el, lb, val, ft |
| `/personalizacion/pt/?wc-ajax=...` | Plugins WC/PayPal | Templates e endpoints do plugin; formatos exatos constam da configuração pública, valores de nonces omitidos |
| URL `data-add-to-cart-url` do upsell | GET com parâmetro add-to-cart | Produto identificado na URL; **não inclui foto, texto ou origem de imagem** |
| `/personalizacion/pt/finalizar-compra-2/` | Navegação para checkout | Carrinho depende da sessão do servidor de origem; este repositório não envia formulário de pagamento |
| `www.paypal.com/sdk/js` | Loader SDK | Configuração pública de integração, moeda e componentes; parâmetros de identificação omitidos deste documento |

O config PayPal H7709 declara os endpoints relativos `/personalizacion/pt/?wc-ajax=` com ações `ppc-simulate-cart`, `ppc-change-cart`, `ppc-create-order`, `ppc-approve-order`, `ppc-get-order`, `ppc-approve-subscription`, `ppc-save-checkout-form`, `ppc-validate-checkout`, `ppc-cart-script-params`, `ppc-update-shipping` e `update_shipping_method`. Também declara Store API `/cart/select-shipping-rate`, `/cart/` e `/cart/update-customer` sob `https://mifunko.com/personalizacion/wp-json/wc/store/v1`. A intenção configurada é capture; não há endpoint de captura dedicado nessa lista. Foram inventariados como configuração de gateway, **não como APIs chamadas pelo botão principal P6080**. Não confundir uma string de endpoint presente com uma chamada observada.

## Storage e cookies

- `sessionStorage.mf_edit_config`: edição de item do carrinho, lida/removida por P; pode conter dados da personalização e URLs de imagens. Não guarda Files novos.
- `sessionStorage._mft`: identificador por aba/visita do tracker MiFunko.
- `sessionStorage.wc_facebook_signals_seen_event_ids`: deduplicação de sinais/eventos em H499/570.
- Nenhuma chamada `localStorage` encontrada no HTML e scripts customizados MiFunko consultados; bibliotecas externas de plugins podem ter outros mecanismos, não se afirma ausência global no site de origem.
- Cookies WooCommerce, GDPR, Sourcebuster e trackers pertencem a plugins; não há banco local/IndexedDB para rascunhos identificado no código customizado.
- Fetchs customizados usam `credentials:'same-origin'`: em localhost não compartilham cookies da MiFunko. O HTML copiado não carrega a sessão original do servidor.

## Domínios presentes no HTML

| Papel | Domínios |
| --- | --- |
| Loja/assets/backend | `mifunko.com` |
| Fontes/CDN | `fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com` |
| Tracking | `www.googletagmanager.com`, `www.clarity.ms`, `connect.facebook.net`, `www.facebook.com` |
| Pagamento | `www.paypal.com` |
| Atendimento | `api.whatsapp.com`, `wa.me` |
| Reviews | `revi.io`, `es.trustpilot.com` |
| Social/vídeo | `www.instagram.com`, `www.facebook.com`, `www.tiktok.com`, `www.youtube.com`, `youtu.be` |
| Vocabulários/namespaces (não necessariamente requisições) | `schema.org`, `www.w3.org`, `api.w.org` |

São 20 domínios distintos literais no HTML (www.facebook.com aparece em mais de um papel). Fontes/scripts podem carregar dependências transitivas diferentes conforme navegador, consentimento e rede; o grafo de todas as contas/plugins não foi certificado.

## Nonces e material sensível

A busca por padrões de senha, segredo, token e chave encontrou **nonces públicos de WordPress/Store API/gateway** e identificadores públicos de integrações. **Não foi identificada chave privada, senha ou segredo de servidor** na inspeção realizada. Não se deve chamar todo nonce ou client ID público de segredo vazado; tampouco reutilizá-los como credencial permanente.

Locais a revisar antes de hospedar: H376 (`pmw`), H418 (GTM blocks), H7692 (Facebook signals), H7709 (PayPal), H7716 (Store API/cart drawer), H7721 (tracking), H7754 (GDPR). Valores não são reproduzidos na documentação, evidências ou exemplos. `i18n_password_show/hide` H358 são textos de interface, não senhas.

O baseline local guarda o HTML recebido integralmente; não houve push nem publicação. Caso uma revisão autorizada do backend revele segredo real, registrar apenas localização, retirar da publicação e substituir no serviço responsável; não copiar valores para docs ou issues.

## Dependências operacionais antes da migração

Confirmar titularidade/licença de código e conteúdo; obter backend autorizado ou especificar o próprio; mapear nonces por sessão, cookies, CORS e recálculo de preços. Desvincular analytics/gateway da origem somente na fase autorizada e com contas próprias. Nada disso foi alterado nesta etapa.
