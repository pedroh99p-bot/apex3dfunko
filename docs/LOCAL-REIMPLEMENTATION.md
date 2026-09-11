# Reimplementação local Apex — etapas 2 e 3

Branch: `refactor/apex-foundation`. Baseline: `baseline-original-2026-09-11`. O `index.html` não foi editado. A etapa 2 estabeleceu a fundação; a etapa 3 implementou o contrato próprio do MVP em APEX-MVP-CONTRACT.md. Paridade integral não é objetivo.

## Fontes e separação

Fontes primárias: TECHNICAL-MAP, USER-FLOW, PRICING, UPLOAD-AUDIT, INTEGRATIONS, MIGRATION-PLAN, FORM-FIELDS e PRICE-ATTRIBUTES. Os trechos do HTML foram consultados por seletores/linhas desses mapas. Nenhum código de `product-personalized.js` ou outro JS proprietário remoto foi copiado, baixado ou executado nesta etapa. O catálogo de preços foi transcrito dos fatos documentados em PRICE-ATTRIBUTES.

`npm run dev` serve `/` como `dev.html`. `js/template.js` lê o HTML original como texto local, monta somente markup/estilos e descarta scripts, handlers inline, iframes, pixels noscript e configurações transacionais da cópia em memória. O arquivo original e suas declarações continuam no baseline. `/index.html` redireciona para a entrada dev; `/legacy-template` é servido como `text/plain` com `nosniff`. Não publicar essa rota ou o snapshot original como produto final.

O servidor de desenvolvimento aceita GET/HEAD e expõe apenas a entrada e pastas públicas autorizadas. CSP permite scripts/conexões locais, estilos/fontes/imagens visuais herdados, bloqueando forms, frames e scripts remotos. Links externos ficam inativos na cópia montada. O servidor não é um backend de pedidos e só escuta em `127.0.0.1`.

## Módulos e contratos

| Arquivo | Entrada | Saída/responsabilidade |
| --- | --- | --- |
| config/brand.js | Configuração pública editável | Nome/contato/domínio herdados, locale e reserva para logo próprio; não aplica troca automática da marca no template nesta etapa |
| config/products.js | IDs locais de produto | Quatro tipos, quantidade de figuras e produto adicional; sem acoplamento a IDs WooCommerce |
| config/pricing.js | Tabelas documentadas | Todos os preços usados pela função local, centavos EUR, 35 especiais, tamanhos, caixas, minis e urgências |
| config/endpoints.js | Modo de desenvolvimento | Template local, origens visuais; order/upload/checkout/payment nulos |
| config/uploads.js | Política temporária | 10 MB decimais por arquivo, MIME permitidos e máximo opcional por campo |
| js/state.js | ID do produto | Objeto previsível, novo a cada troca de produto |
| js/pricing.js | orderState | Linhas, preço unitário, subtotal principal, adicional e total do rascunho |
| js/uploads.js | owner + File[] + multiple | Identificadores, previews Blob, metadados e erros; nenhum envio |
| js/order.js | orderState | Pedido normalizado e representação segura para inspeção |
| js/ui.js | Eventos DOM | Adaptação dos seletores existentes ao estado local e atualização da interface |
| js/template.js / main.js | Template local | Inicialização sem execução de JavaScript legado |

Não há React, Next, bundler ou dependência de WordPress nos módulos. As classes/atributos `mf-*` permanecem como adaptador do HTML atual. Em rebranding posterior, conectar os pontos visuais de marca/logo/textos à configuração sem alterar a lógica de estado/pricing. Os preços estáticos das legendas herdadas continuam no template; o cálculo e os totais dinâmicos já usam exclusivamente config/pricing.js. A sincronização de todas as legendas comerciais será necessária antes de mudar a oferta.

## Estado e pedido

```js
{
  version: 1,
  product: 'individual', quantity: 1, size: 6,
  customizations: {
    figures: [{ id: 'figure-1', eyes, mouth, glasses,
      accessories, logos, specialAccessories, fields }],
    pet: { eyes, fields }, pets: [{ size, fields }],
    minis: { quantity, size, fields },
    box: { type, dedication, fields }, extras: [], fields: {}
  },
  uploads: [{ id, owner: { itemId, field }, name, type, size }],
  shipping: { option, date, flexible },
  gift: { enabled, imageSource, text }, pricing, notes
}
```

`main-1` é o item configurado; `gift-1` é a caneca. Campos por figura têm owner `figure-1.<campo>` ou `figure-2.<campo>`. Os campos exclusivos do pet/minis/caixa usam seu nome específico. No produto mascota, o bloco de acessórios de índice zero representa o pet principal, não uma figura humana cobrada. O nome do arquivo não é identidade: dois homônimos têm IDs diferentes.

Os Files e URLs Blob existem somente no UploadStore. O estado contém metadados. Trocar produto limpa opções, rascunho de upsell e arquivos, revogando URLs. Remover um arquivo, reduzir quantidades dinâmicas ou desativar a personalização elimina os anexos correspondentes. Seleções assíncronas de produto anterior são descartadas. Recarregar/fechar a página perde o rascunho; não há localStorage, sessão WooCommerce, IndexedDB ou persistência.

`buildOrder(state)` retorna `schemaVersion`, `mode: development`, `status: draft`, `customer: null`, `items`, `uploads`, `pricing`, `shipping` e `notes`. Cada item referencia seus IDs de upload. A caneca com imagem própria exige seu arquivo; com esboço referencia `main-1`. Foto preparada para uma caneca não adicionada não entra no pedido normalizado.

`validateOrder`/`buildOrder` continuam como serialização da fundação. A geração atual usa **validateOrderForProduction → revisão → createOrderDraft**, com validação de fabricação conforme o contrato MVP, fotos válidas por owner, data obrigatória e detecção de preço/estado inconsistente. Não é mais possível gerar um rascunho pela interface com campos obrigatórios incompletos. Erros estruturados levam aos campos. O pedido continua local, sem viabilidade de prazo/frete confirmada por servidor.

`safeOrderSummary` omite arquivos, URLs Blob, nomes de arquivos, textos livres, detalhes da personalização e informações do cliente. A inspeção aparece no diálogo, via textContent, sem console de dados do usuário. `window.apexDevelopment.inspect()` fornece somente essa cópia segura do estado comercial; `validate()` retorna erros e `inspectDraft()` expõe somente a inspeção segura do rascunho validado atual, ou null. Eventos `apex:state-changed`, `apex:product-changed`, `apex:uploads-changed` e `apex:order-preview` divulgam apenas tipo, total e contagem de imagens.

## Decisões do MVP — registradas antes da implementação da etapa 3

KEEP mantém o comportamento necessário; SIMPLIFY substitui pelo contrato menor abaixo; LATER adia; REMOVE elimina a reprodução do legado. As decisões se aplicam à entrada dev, preservando index.html. A coluna Status reflete o resultado atual da etapa 3. A matriz anterior continua recuperável no commit f2405f9.

- Validação de produção: KEEP, com erros estruturados, fotos por figura/pet e revisão obrigatória.
- Calendário: SIMPLIFY para data necessária obrigatória, hoje ou futuro, sem plugin/bloqueio de dias da semana e sem reajuste automático de preço.
- Raças: SIMPLIFY para texto opcional. Minis: SIMPLIFY para descrição e foto por mini.
- Editor: manter preview/remoção (KEEP); rotação, crop/zoom, reset de edição, desenho e drag-and-drop (LATER). Nenhuma transformação silenciosa do original.
- Prova social: SIMPLIFY como conteúdo estático; player de vídeo e animações (LATER). Barra fixa: SIMPLIFY para acesso à revisão, sem reproduzir todo o comportamento de scroll.
- Carrinho, drawer, edição e sessões WooCommerce: REMOVE. Múltiplos itens/canecas e persistência própria: LATER. Uma caneca opcional continua no mesmo pedido, com imagem corretamente associada.
- Orçamento sem preço, filtros avançados, checkout/pagamento/backend: LATER.

## Matriz de responsabilidades

Os nomes nesta tabela descrevem comportamentos próprios; não são cópias das funções remotas.

| Comportamento / função necessária | Status | Decisão MVP | Inputs / eventos / seletores | Outputs, estado e dependências |
| --- | --- | --- | --- | --- |
| Inicialização isolada | IMPLEMENTADA LOCALMENTE | KEEP | dev.html → main.js → template.js | Markup herdado, somente módulos locais, pronto em html[data-apex-ready] |
| Seleção/reset de produto | IMPLEMENTADA LOCALMENTE | KEEP | click [data-mf-funko-type-option], data-type-value, ?tipo | Novo orderState, galeria filtrada, preço base, anexos limpos |
| Layout humano/pet e segunda figura | IMPLEMENTADA LOCALMENTE | KEEP | [data-mf-*-step], produto | Ordem dos blocos; names mf_partner_2_ e IDs únicos para segunda figura |
| Abrir passos e seguir | IMPLEMENTADA LOCALMENTE | KEEP | [data-apex-toggle], [data-mf-step-nav-button] | hidden, is-open, aria-expanded e navegação local; não valida fabricação |
| Características e detalhes por figura | IMPLEMENTADA LOCALMENTE | KEEP | input/change, mf_face_option, mf_eyes_option, mf_mouth_option, pele, cores e texto | fields por figura; extras de olhos/boca/óculos; cabelo/pele sem acréscimo |
| Campos condicionais de óculos/cabelo/roupa | IMPLEMENTADA LOCALMENTE | KEEP | Toggles locais, [data-mf-face-glasses-panel], [data-mf-outfit-colors-body] | Visibilidade e desativação de campos |
| Quantidades de acessórios/logótipos | IMPLEMENTADA LOCALMENTE | KEEP | [data-mf-accessories-quantity-option], [data-mf-logos-quantity-option] | 0–5 por categoria/figura; campos próprios, foto e preço central |
| Seleção dos 35 especiais e anexos adicionais | IMPLEMENTADA LOCALMENTE | KEEP | mf_special_accessories[], [data-mf-accessory-extras-panel] | Slugs, painel correspondente, upload com owner; preço do catálogo |
| Filtros, busca e editor avançado dos especiais | PENDENTE | LATER | Catálogo e anexos especiais | Catálogo básico funciona; paridade de filtros/editor ainda não implementada |
| “Outro” com orçamento | PENDENTE | LATER | mf_special_other, texto/fotos | LATER: opção fora de preço documentado oculta no laboratório; API rejeita se injetada no estado. |
| Tamanho humano/pet principal | IMPLEMENTADA LOCALMENTE | KEEP | mf_size_option / mf_pet_size_option | 6/10/15/20 cm; multiplicador por figura, tabela pet independente |
| Pets adicionais | IMPLEMENTADA LOCALMENTE | KEEP | mf_pets_option, .pet-type, .pet-size, foto por slot | 0–3 pets, tipo/tamanho/fotos associados, tabela 4/6/10 cm |
| Catálogo de raças e dependências espécie/raça | IMPLEMENTADA LOCALMENTE | SIMPLIFY | mf_pet_breed, mf_pet_N_breed | Texto opcional para raça principal/adicional, sem catálogo externo. |
| Minis: quantidade, tamanho, descrição/foto | IMPLEMENTADA LOCALMENTE | KEEP | mf_mini_option, mf_mini_size_option, [data-mf-mini-units] | Campos genéricos por mini; quantidade e tamanho precificados |
| Minis: seletores específicos de rosto/roupa do legado | IMPLEMENTADA LOCALMENTE | SIMPLIFY | Campos dinâmicos de mini | SIMPLIFY: descrição de aparência/roupa e foto obrigatória por mini; sem seletores complexos. |
| Bases e adicionais | IMPLEMENTADA LOCALMENTE | KEEP | mf_extra_option[], mf_extra_text_data | Seleção e preço; bases pagas mutuamente exclusivas pela interface |
| Caixa e dedicatória | IMPLEMENTADA LOCALMENTE | KEEP | mf_box_option, campos e upload da caixa | Preço por tamanho, dupla para casal, sem caixa a 20 cm, texto/foto associados |
| Prazo e data nativa | IMPLEMENTADA LOCALMENTE | KEEP | mf_shipping_option, mf_shipping_date, flexibilidade | Prazo explicitamente selecionado; data necessária no estado/resumo. Data não reajusta preço nem urgência. |
| Calendário comercial completo | IMPLEMENTADA LOCALMENTE | SIMPLIFY | Dias da semana, datas e dependências comerciais | SIMPLIFY: date nativo obrigatório, hoje/futuro, regras futuras em config/mvp.js; sem bloquear dias da semana. |
| Cálculo e resumo | IMPLEMENTADA LOCALMENTE | KEEP | calculatePrice(orderState), [data-mf-summary-price], hero, barra e breakdown | Centavos EUR, decomposição, subtotal por quantidade e caneca separada |
| Validação estrutural do rascunho | IMPLEMENTADA LOCALMENTE | KEEP | validateOrder / buildOrder | Erros explícitos para preço/quantidade/owner inválidos e foto ausente da caneca |
| Validação completa de produção e modal de lembretes | IMPLEMENTADA LOCALMENTE | KEEP | Campos obrigatórios por passo | validateOrderForProduction, erros estruturados, foco por campo e bloqueio; sem reproduzir modal de upsell/lembretes legado. |
| Seleção múltipla, preview e remoção de imagens | IMPLEMENTADA LOCALMENTE | KEEP | change file, multiple original, botão remover | Blob/File em memória, UUID, owner, revogação de URL |
| Validação real dos arquivos | IMPLEMENTADA LOCALMENTE | KEEP | config/uploads.js | Bytes, allowlist MIME, assinatura e decodificação no navegador; erros sem expor conteúdo |
| Arrastar/soltar, cortar, desenhar, desfazer/refazer | PENDENTE | LATER | Editor e drop targets herdados | Não há editor local nesta etapa; seleção funciona pelo seletor de arquivos |
| Upsell com imagem própria/esboço | IMPLEMENTADA LOCALMENTE | KEEP | Modal existente, radios e arquivo | Item gift-1 + upload explícito ou referência ao item principal; sem GET add-to-cart |
| Várias canecas/editar/remover item de carrinho | PENDENTE | LATER | Drawer e ações por item | Fundação contempla uma caneca por rascunho; repetição de adicionar atualiza esse adicional |
| Construção/inspeção de pedido | IMPLEMENTADA LOCALMENTE | KEEP | submit local / barra fixa | createOrderDraft após revisão e validação; confirmação visual e inspeção técnica recolhida, sem transação. |
| Carrinho persistente e restaurar configuração | NÃO NECESSÁRIA PARA APEX | REMOVE | Drawer/session restore | REMOVE: drawer/controles/sessão WooCommerce fora do fluxo. Persistência própria futura é LATER. |
| Header mobile, galeria e FAQ | IMPLEMENTADA LOCALMENTE | KEEP | Click/teclado, thumbs/setas, faq-toggle | Interações vanilla preservando markup/classes |
| Carrosséis secundários, contadores, abas informativas e vídeo | IMPLEMENTADA LOCALMENTE | SIMPLIFY | Reviews, social proof, info tabs, vídeo | SIMPLIFY: conteúdo estático, controles de carrosséis/vídeo inativos retirados; animação/player são LATER. |
| Barra fixa: comportamento completo de scroll | IMPLEMENTADA LOCALMENTE | SIMPLIFY | Scroll/intersection, etapa ativa | SIMPLIFY: botão direciona à revisão local; resumo é acesso primário, sem recriar regras de scroll do legado. |
| Eventos mf:* para plugins antigos | NÃO NECESSÁRIA PARA APEX | REMOVE | Contratos legados | Eventos locais apex:* bastam nesta entrada sem plugins |
| AJAX WooCommerce, nonces e validação por contador HTML | NÃO NECESSÁRIA PARA APEX | REMOVE | POST/admin-ajax/HTML remoto | Não reutilizar esse protocolo no backend próprio futuro |
| jQuery/React embarcados por WP | NÃO NECESSÁRIA PARA APEX | REMOVE | Dependências de plugins | Nenhum módulo local precisa deles |
| Tracking/contas e consentimento da MiFunko | NÃO NECESSÁRIA PARA APEX | REMOVE | Cookies, pixels e beacons da operação original | Nenhum carregamento nesta prévia; eventual analytics próprio é outra etapa |
| Checkout, frete real e pagamento Apex | PENDENTE | LATER | Endpoints próprios futuros | Fora do escopo desta etapa; nada implementado ou acionado |

## Pricing preservado e limites

Config central em centavos, sem números monetários no adaptador. Os cenários observados aprovados são: individual 6 cm €59; individual 10 cm €79; casal 15 cm + caixa dupla €219; casal 20 cm sem caixa €239; pet 10 cm €79; casamento 6 cm €119. Testes adicionais cobrem olhos por segunda figura, especiais, três minis (€116), tamanhos adicionais, animais e urgência.

O resumo/hero continuam mostrando o preço unitário configurado. O detalhamento e o objeto distinguem preço unitário, quantidade, subtotal e caneca (€20, item separado). `freightCents: null` e `finalCheckout: false`: não se inventou frete por endereço, impostos ou desconto. O texto promocional estático original não foi reescrito; suas divergências já constam em PRICING. A tabela de frete grátis herdada está registrada, mas não é promessa de cálculo final.

## Uploads e segurança

10 MB significa 10.000.000 bytes por arquivo nesta etapa. JPEG, PNG, WebP e GIF são aceitos; SVG, HEIC e demais MIME não implementados recebem erro explícito. Isso restringe de forma deliberada o antigo accept=image/*, que não validava conteúdo. A extensão sozinha não é aceita como prova de tipo. No navegador, a decodificação também precisa funcionar. O teste Node verifica bytes/assinatura; o smoke verifica preview decodificado.

O modo multiple original é respeitado; campo simples substitui o anexo apenas após validar o novo arquivo. Um lote inválido não elimina anexos anteriores. Não havia limite global de quantidade documentado; maxFilesPerField permanece null, configurável, sem inventar restrição comercial. Cada erro aparece junto ao campo. Os previews não usam Base64; a pequena fixture Base64 do teste é apenas uma imagem sintética de 1 pixel gerada no próprio navegador.

Não foram adicionados segredos, cookies, sessões, arquivos pessoais ou credenciais. O snapshot original contém configurações públicas herdadas já identificadas na auditoria; elas não foram regravadas em novos arquivos ou reutilizadas. Não houve push, deploy, pedido, checkout ou envio de mensagem.

## Testes e evidências

Consulte FOUNDATION-VALIDATION.md. DEPENDENCY-CLASSIFICATION.md classifica as 110 declarações externas e os serviços/carregadores transitivos. Os screenshots e dados efêmeros de testes ficam em test-results (ignorado no Git). O contrato atual é APEX-MVP-CONTRACT.md. O fluxo obrigatório passa sem rede externa; as opções LATER/REMOVE não bloqueiam o MVP. Aparência remota será substituída no rebranding.

## Resultado da etapa 3

Todos os comportamentos KEEP/SIMPLIFY do contrato MVP têm implementação local. Não resta dependência funcional de product-personalized.js no fluxo de produto → configuração/fotos → data → preço → revisão → orderDraft. Editor avançado não foi reconstruído; previews usam o arquivo original. O index original e a identidade visual permanecem preservados.
