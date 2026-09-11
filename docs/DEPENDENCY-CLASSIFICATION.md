> Documento histórico das etapas 1–3. Para a versão comercial atual, consulte [APEX-FRONTEND-V05](APEX-FRONTEND-V05.md) e [APEX-DEPENDENCIES](APEX-DEPENDENCIES.md). Preços e regras herdados abaixo não são a oferta V0.5.

# Classificação das dependências — etapas 2 e 3

Fonte primária: RESOURCE-INVENTORY.md e INTEGRATIONS.md da auditoria. Nenhum JavaScript remoto foi copiado ou consultado nesta etapa. O index original permanece intacto. A classificação é uma proposta para a migração, não uma remoção em massa.

- **A**: responsabilidade que precisa de substituição própria para a plataforma Apex completa.
- **B**: pode ser removida/substituída durante o rebranding.
- **C**: apresentação visual (inclui interações de apresentação).
- **D**: analytics/marketing.
- **E**: suporte de plataforma antiga ou declaração desnecessária na arquitetura vanilla.

Na entrada dev, todos os scripts legados estão inativos. Os 53 links de CSS permanecem, inclusive duplicatas e estilos de plugins, para não misturar a fundação com limpeza visual. A disponibilidade e o conteúdo desses CSS ainda são externos.

## Declarações externas, uma classificação por ocorrência

A coluna linha identifica a URL completa no inventário original, evitando duplicar URLs e identificadores públicos de integrações.

| Linha original | ID/recurso | Tipo | Classe | Categoria MVP | Tratamento |
| --- | --- | --- | --- | --- | --- |
| 216 | jquery-ui-css-css | link | E | CSS | Estilo de integração inativa; mantido nesta etapa no template. |
| 217 | gateway-css | link | E | CSS | Estilo de integração inativa; mantido nesta etapa no template. |
| 218 | mf-google-fonts-css | link | C | fonte | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 219 | mf-variables-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 220 | mf-header-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 221 | mf-footer-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 222 | mf-styles-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 223 | mf-material-icons-css | link | C | fonte | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 224 | mf-product-personalized-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 225 | mf-personalizer-extra-step-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 226 | mf-personalizer-mini-step-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 227 | mf-personalizer-pet-groups-tech-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 228 | mf-personalizer-step-nav-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 229 | mf-personalizer-summary-card-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 230 | mf-personalizer-type-selector-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 231 | mf-product-b2b-cta-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 232 | mf-product-cart-drawer-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 233 | mf-product-delivery-section-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 234 | delivery-section.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 235 | mf-product-faq-section-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 236 | faq-section.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 237 | mf-product-fixed-cart-bar-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 238 | mf-product-gift-upsell-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 239 | gift-upsell.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 240 | mf-product-image-annotator-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 241 | image-annotator.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 242 | mf-product-info-tabs-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 243 | info-tabs.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 244 | mf-product-presupuesto-hero-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 245 | mf-product-product-hero-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 246 | mf-product-reviews-mini-slider-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 247 | reviews-mini-slider.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 248 | mf-product-reviews-proof-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 249 | reviews-proof.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 250 | mf-product-reviews-slider-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 251 | reviews-slider.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 252 | mf-product-sales-features-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 253 | sales-features.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 254 | mf-product-sales-video-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 255 | sales-video.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 256 | mf-product-showcase-gallery-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 257 | mf-product-sketch-cta-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 258 | sketch-cta.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 259 | mf-product-social-proof-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 260 | social-proof.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 261 | mf-product-trust-section-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 262 | trust-section.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 263 | mf-product-video-modal-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 264 | video-modal.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 265 | mf-product-whatsapp-cta-css | link | C | CSS | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 266 | whatsapp-cta.css | link | E | CSS | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 267 | moove_gdpr_frontend-css | link | E | CSS | Estilo de integração inativa; mantido nesta etapa no template. |
| 343 | jquery-core-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 344 | jquery-migrate-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 345 | wc-jquery-blockui-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 350 | wc-add-to-cart-js | script | A | legado removível | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 355 | wc-single-product-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 356 | wc-js-cookie-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 361 | woocommerce-js | script | A | legado removível | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 362 | gtmkit-woocommerce-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 367 | gtmkit-engagement-events-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 374 | wp-hooks-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 379 | pmw-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 380 | react-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 381 | react-jsx-runtime-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 382 | wp-deprecated-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 383 | wp-dom-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 384 | react-dom-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 385 | wp-escape-html-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 386 | wp-element-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 387 | wp-is-shallow-equal-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 388 | wp-i18n-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 401 | wp-keycodes-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 402 | wp-priority-queue-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 403 | wp-private-apis-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 404 | wp-undo-manager-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 405 | wp-compose-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 406 | wp-redux-routine-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 407 | wp-data-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 421 | gtmkit-woocommerce-blocks-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 758 | wc-blocks-style-css | link | E | CSS | Estilo de integração inativa; mantido nesta etapa no template. |
| 7695 | wc-facebook-signals-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 7700 | jquery-ui-core-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7701 | jquery-ui-mouse-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7702 | jquery-ui-resizable-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7703 | jquery-ui-draggable-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7704 | jquery-ui-controlgroup-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7705 | jquery-ui-checkboxradio-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7706 | jquery-ui-button-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7707 | jquery-ui-dialog-js | script | E | legado removível | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7712 | ppcp-smart-button-js | script | A | legado removível | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7713 | mf-main-js | script | C | legado removível | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7714 | mf-footer-js | script | B | legado removível | Vínculo da operação/marca original; decidir remoção no rebranding. |
| 7719 | mf-product-personalized-js | script | A | comportamento crítico | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7724 | mf-visitor-tracking-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 7725 | mf-personalizer-step-nav-js | script | A | comportamento crítico | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7726 | mf-product-cart-drawer-js | script | A | legado removível | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7731 | mf-product-gift-upsell-js | script | A | comportamento crítico | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7732 | mf-product-image-annotator-js | script | A | legado removível | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7733 | mf-product-presupuesto-hero-js | script | B | legado removível | Vínculo da operação/marca original; decidir remoção no rebranding. |
| 7734 | mf-product-product-hero-js | script | C | legado removível | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7735 | mf-product-reviews-mini-slider-js | script | C | legado removível | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7736 | mf-product-reviews-slider-js | script | C | legado removível | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7737 | mf-product-social-proof-js | script | C | legado removível | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7738 | mf-product-video-modal-js | script | C | legado removível | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7739 | sourcebuster-js-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 7744 | wc-order-attribution-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 7745 | wc-facebook-pixel-events-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 7746 | facebook-capi-param-builder-js | script | D | analytics | Analytics/marketing da operação original; inativo na entrada local. |
| 7757 | moove_gdpr_frontend-js | script | B | legado removível | Vínculo da operação/marca original; decidir remoção no rebranding. |

## Serviços, carregadores inline e recursos transitivos

| Dependência | Classe | Situação local |
| --- | --- | --- |
| POST produto, admin-ajax e Store API WooCommerce | A | Sem equivalente transacional nesta etapa; substituídos apenas pela montagem de rascunho. Endpoints locais nulos. |
| Checkout MiFunko, WooCommerce/PayPal, Redsys | A | Nenhuma navegação, SDK, aprovação ou pagamento permitido na prévia. Implementação futura separada. |
| Configs inline WP/WC/PayPal, nonces e associações de sessão | E | Não são importados como código executável nem reutilizados nos módulos. |
| jQuery, jQuery UI, React/React DOM e pacotes WordPress transitivos | E | O configurador vanilla não depende dessas bibliotecas. |
| GTM/gtag, Clarity, Facebook Pixel/CAPI, Pixel Manager, Sourcebuster, tracker MiFunko | D | Carregadores inline, scripts e pixels noscript inativos. Nenhum evento de cliente é enviado. |
| Dropdown inline de idiomas | B | Menu de idiomas e destino multilíngue aguardam decisão de rebranding; links inativos. |
| WhatsApp, redes sociais, conta, esboço, B2B, contato e páginas legais da MiFunko | B | Links inativos na prévia. Dados públicos futuros em config/brand.js. |
| Revi e Trustpilot; depoimentos estáticos da marca original | B | Conteúdo original preservado, links externos inativos. Não representa prova social Apex. |
| YouTube/iframe do vídeo original | C | Iframe não montado. Player local/asset autorizado pendente. |
| Google Fonts, Material Icons e fontes do tema | C | Remotos; falhas de CORS herdadas podem ocorrer. |
| Assets A001–A278 de ASSET-INVENTORY.md, SVGs de INLINE-ASSETS.md | C | Inventário completo por URL/ID já existente. Referências visuais mantidas; nenhum asset copiado. Logos, selos, contatos e prova social também têm destino B no rebranding. |
| Dados estruturados/canonical da marca original | B | Baseline preservado. A entrada dev é noindex; SEO final não foi trabalhado. |
| Namespaces schema.org, w3.org e api.w.org | E | Identificadores de vocabulário, não APIs operacionais da Apex. |

## O que impede standalone

O JavaScript de configuração, pricing, upload em memória e rascunho funciona sem o JavaScript MiFunko. A apresentação ainda usa HTML/SVGs herdados e CSS/imagens/fontes remotos. No MVP da etapa 3, validação de produção, data necessária, revisão e geração de orderDraft são locais. Editor avançado e persistência própria foram adiados; carrinho WooCommerce foi removido. Paridade integral deixou de ser objetivo. Não existe backend, cálculo de frete final, checkout ou pagamento próprio. Bloquear a rede permite testar a lógica com aparência degradada; não torna esta etapa uma loja independente pronta para publicar.

## Recorte de recursos para o MVP (etapa 3)

As 110 declarações acima têm categoria MVP. CSS/fontes/imagens/ícones permanecem como dependência de aparência. Comportamento crítico indica a responsabilidade ORIGINAL: nenhuma dessas implementações remotas é carregada pelo MVP. Os equivalentes estão em ui.js, validation.js, date.js, review.js, uploads.js e order.js. Carrinho/checkout/WordPress/gateways são legado removível no laboratório, sem reprodução.

As referências visuais detalhadas continuam no ASSET-INVENTORY; a categoria por ID está agrupada abaixo, sem copiar arquivos ou URLs. SVGs inline de INLINE-ASSETS são ícones herdados já embutidos no template, sem download adicional.

| Categoria | Quantidade | IDs no inventário existente |
| --- | --- | --- |
| fonte | 17 | A003, A004, A005, A006, A007, A008, A009, A010, A011, A012, A013, A018, A019, A020, A024, A025, A026 |
| imagem | 180 | A001, A002, A015, A016, A021, A022, A040, A041, A042, A043, A044, A045, A046, A047, A048, A049, A050, A051, A052, A053, A054, A055, A056, A090, A091, A092, A093, A094, A095, A096, A097, A098, A099, A100, A101, A102, A103, A104, A105, A106, A107, A108, A109, A110, A111, A112, A113, A114, A115, A116, A117, A118, A119, A120, A121, A122, A123, A124, A125, A126, A127, A128, A129, A130, A131, A132, A133, A134, A135, A136, A137, A138, A139, A142, A143, A144, A145, A146, A147, A148, A149, A150, A151, A152, A153, A154, A155, A156, A157, A158, A159, A160, A161, A162, A163, A164, A165, A166, A167, A168, A169, A170, A171, A172, A173, A174, A175, A176, A177, A178, A179, A180, A181, A182, A183, A184, A185, A186, A187, A188, A189, A190, A191, A192, A193, A194, A195, A196, A197, A198, A199, A200, A201, A202, A203, A204, A234, A235, A236, A237, A238, A239, A240, A241, A242, A243, A244, A245, A246, A247, A248, A249, A250, A251, A252, A253, A254, A255, A256, A257, A258, A259, A260, A261, A262, A263, A264, A265, A266, A267, A268, A269, A270, A271, A272, A273, A274, A275, A276, A277 |
| ícone | 80 | A014, A017, A023, A027, A028, A029, A030, A031, A032, A033, A034, A035, A036, A037, A038, A039, A057, A058, A059, A060, A061, A062, A063, A064, A065, A066, A067, A068, A069, A070, A071, A072, A073, A074, A075, A076, A077, A078, A079, A080, A081, A082, A083, A084, A085, A086, A087, A088, A089, A140, A141, A205, A206, A207, A208, A209, A210, A211, A212, A213, A214, A215, A216, A217, A218, A219, A220, A221, A222, A223, A224, A225, A226, A227, A228, A229, A230, A231, A232, A233 |
| analytics | 1 | A278 |


**Dependência funcional MiFunko restante no fluxo MVP: nenhuma.** O smoke completo, inclusive geração de orderDraft, passa com todas as requisições externas bloqueadas. A aparência offline é degradada até o rebranding com materiais próprios.
