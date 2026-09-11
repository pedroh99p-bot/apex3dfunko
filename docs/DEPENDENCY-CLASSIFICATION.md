# Classificação das dependências — etapa 2

Fonte primária: RESOURCE-INVENTORY.md e INTEGRATIONS.md da auditoria. Nenhum JavaScript remoto foi copiado ou consultado nesta etapa. O index original permanece intacto. A classificação é uma proposta para a migração, não uma remoção em massa.

- **A**: responsabilidade que precisa de substituição própria para a plataforma Apex completa.
- **B**: pode ser removida/substituída durante o rebranding.
- **C**: apresentação visual (inclui interações de apresentação).
- **D**: analytics/marketing.
- **E**: suporte de plataforma antiga ou declaração desnecessária na arquitetura vanilla.

Na entrada dev, todos os scripts legados estão inativos. Os 53 links de CSS permanecem, inclusive duplicatas e estilos de plugins, para não misturar a fundação com limpeza visual. A disponibilidade e o conteúdo desses CSS ainda são externos.

## Declarações externas, uma classificação por ocorrência

A coluna linha identifica a URL completa no inventário original, evitando duplicar URLs e identificadores públicos de integrações.

| Linha original | ID/recurso | Tipo | Classe | Tratamento |
| --- | --- | --- | --- | --- |
| 216 | jquery-ui-css-css | link | E | Estilo de integração inativa; mantido nesta etapa no template. |
| 217 | gateway-css | link | E | Estilo de integração inativa; mantido nesta etapa no template. |
| 218 | mf-google-fonts-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 219 | mf-variables-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 220 | mf-header-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 221 | mf-footer-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 222 | mf-styles-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 223 | mf-material-icons-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 224 | mf-product-personalized-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 225 | mf-personalizer-extra-step-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 226 | mf-personalizer-mini-step-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 227 | mf-personalizer-pet-groups-tech-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 228 | mf-personalizer-step-nav-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 229 | mf-personalizer-summary-card-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 230 | mf-personalizer-type-selector-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 231 | mf-product-b2b-cta-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 232 | mf-product-cart-drawer-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 233 | mf-product-delivery-section-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 234 | delivery-section.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 235 | mf-product-faq-section-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 236 | faq-section.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 237 | mf-product-fixed-cart-bar-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 238 | mf-product-gift-upsell-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 239 | gift-upsell.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 240 | mf-product-image-annotator-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 241 | image-annotator.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 242 | mf-product-info-tabs-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 243 | info-tabs.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 244 | mf-product-presupuesto-hero-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 245 | mf-product-product-hero-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 246 | mf-product-reviews-mini-slider-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 247 | reviews-mini-slider.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 248 | mf-product-reviews-proof-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 249 | reviews-proof.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 250 | mf-product-reviews-slider-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 251 | reviews-slider.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 252 | mf-product-sales-features-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 253 | sales-features.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 254 | mf-product-sales-video-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 255 | sales-video.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 256 | mf-product-showcase-gallery-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 257 | mf-product-sketch-cta-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 258 | sketch-cta.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 259 | mf-product-social-proof-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 260 | social-proof.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 261 | mf-product-trust-section-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 262 | trust-section.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 263 | mf-product-video-modal-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 264 | video-modal.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 265 | mf-product-whatsapp-cta-css | link | C | Estilo/fonte remoto ainda usado para preservar a apresentação. |
| 266 | whatsapp-cta.css | link | E | Declaração duplicada; preservar apenas uma na futura limpeza. |
| 267 | moove_gdpr_frontend-css | link | E | Estilo de integração inativa; mantido nesta etapa no template. |
| 343 | jquery-core-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 344 | jquery-migrate-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 345 | wc-jquery-blockui-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 350 | wc-add-to-cart-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 355 | wc-single-product-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 356 | wc-js-cookie-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 361 | woocommerce-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 362 | gtmkit-woocommerce-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 367 | gtmkit-engagement-events-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 374 | wp-hooks-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 379 | pmw-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 380 | react-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 381 | react-jsx-runtime-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 382 | wp-deprecated-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 383 | wp-dom-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 384 | react-dom-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 385 | wp-escape-html-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 386 | wp-element-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 387 | wp-is-shallow-equal-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 388 | wp-i18n-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 401 | wp-keycodes-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 402 | wp-priority-queue-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 403 | wp-private-apis-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 404 | wp-undo-manager-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 405 | wp-compose-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 406 | wp-redux-routine-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 407 | wp-data-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 421 | gtmkit-woocommerce-blocks-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 758 | wc-blocks-style-css | link | E | Estilo de integração inativa; mantido nesta etapa no template. |
| 7695 | wc-facebook-signals-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 7700 | jquery-ui-core-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7701 | jquery-ui-mouse-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7702 | jquery-ui-resizable-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7703 | jquery-ui-draggable-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7704 | jquery-ui-controlgroup-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7705 | jquery-ui-checkboxradio-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7706 | jquery-ui-button-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7707 | jquery-ui-dialog-js | script | E | Suporte de plugins WP/WooCommerce; não é dependência dos módulos vanilla. |
| 7712 | ppcp-smart-button-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7713 | mf-main-js | script | C | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7714 | mf-footer-js | script | B | Vínculo da operação/marca original; decidir remoção no rebranding. |
| 7719 | mf-product-personalized-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7724 | mf-visitor-tracking-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 7725 | mf-personalizer-step-nav-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7726 | mf-product-cart-drawer-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7731 | mf-product-gift-upsell-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7732 | mf-product-image-annotator-js | script | A | Responsabilidade funcional a substituir; ver matriz LOCAL-REIMPLEMENTATION. |
| 7733 | mf-product-presupuesto-hero-js | script | B | Vínculo da operação/marca original; decidir remoção no rebranding. |
| 7734 | mf-product-product-hero-js | script | C | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7735 | mf-product-reviews-mini-slider-js | script | C | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7736 | mf-product-reviews-slider-js | script | C | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7737 | mf-product-social-proof-js | script | C | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7738 | mf-product-video-modal-js | script | C | Interação de apresentação; galeria/menu locais, demais pendências na matriz. |
| 7739 | sourcebuster-js-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 7744 | wc-order-attribution-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 7745 | wc-facebook-pixel-events-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 7746 | facebook-capi-param-builder-js | script | D | Analytics/marketing da operação original; inativo na entrada local. |
| 7757 | moove_gdpr_frontend-js | script | B | Vínculo da operação/marca original; decidir remoção no rebranding. |

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

O JavaScript de configuração, pricing, upload em memória e rascunho funciona sem o JavaScript MiFunko. A apresentação ainda usa HTML/SVGs herdados e CSS/imagens/fontes remotos. A paridade do editor, carrosséis secundários, regras completas de produção, carrinho persistente e atendimento não está completa. Não existe backend, cálculo de frete final, checkout ou pagamento próprio. Bloquear a rede permite testar a lógica com aparência degradada; não torna esta etapa uma loja independente pronta para publicar.
