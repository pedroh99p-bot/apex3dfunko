# Original 1:1 — mapa antes do port

Baseline visual: 175babe2df4ffa416f6feae680019600689c72a7, tag baseline-original-2026-09-11. Motor funcional escolhido: V0.6, commit 5fab9b5a213a55c3be72dbd2af9d042df9cb699b, com 24 testes e 62 cenários de navegador na fonte/build. Nenhum layout V0.5/V0.6 será importado.

## Estado Git e backup

Após git fetch --all --tags, origin/main não existe. O HEAD remoto aponta a feat/apex-frontend-v05, commit 353fb44a455cdd80a828cce648126463bf5694f0. Backup recuperável criado e enviado: tag backup-main-before-original-shell-2026-09-12 e branch archive/pre-original-shell, ambos nesse commit. V0.6 permanece em sua própria branch remota. A nova branch parte diretamente do baseline e main será criada a partir do histórico principal existente antes da promoção, sem force push.

## Inventário ordenado de regiões comerciais e componentes aninhados

A lista distingue a rolagem principal dos painéis dentro do configurador. Inclui componentes de modal/barra fora do fluxo de rolagem. As contagens não somam imagens de pais e filhos como arquivos distintos.

| Ordem | Região / seletor | Função e estrutura preservada | Nós | Imagens | SVG |
| --- | --- | --- | --- | --- | --- |
| 1 | header / .mf-header | Marca e navegação | 1 | 1 | 13 |
| 2 | hero / .mf-product-hero | Mídia à esquerda e oferta à direita | 1 | 54 | 38 |
| 3 | hero-gallery / .mf-product-gallery | Carrossel, 23 slides e miniaturas | 1 | 46 | 2 |
| 4 | product-types / .mf-funko-type-selector | Quatro modelos dentro da oferta | 1 | 4 | 4 |
| 5 | sketch / .mf-product-sketch | Convite para visualizar a criação | 1 | 0 | 1 |
| 6 | business / .mf-product-b2b | Oferta para grupos e empresas | 1 | 0 | 1 |
| 7 | mini-reviews / [data-mf-mini-slider] | Carrossel compacto de prova social | 1 | 4 | 22 |
| 8 | configurator / #personalizar | Configuração e resumo em duas colunas | 1 | 122 | 157 |
| 9 | face / [data-mf-face-step] | Fotos e referência da aparência | 1 | 5 | 17 |
| 10 | skin / [data-mf-skin-step] | Referência visual de pele | 1 | 5 | 2 |
| 11 | outfit / [data-mf-outfit-step] | Roupa e pose | 1 | 1 | 9 |
| 12 | pets / [data-mf-pets-step] | Pets adicionais | 1 | 31 | 11 |
| 13 | accessories / [data-mf-card-kind="extras"] | Catálogo e acessórios | 1 | 36 | 86 |
| 14 | human-size / [data-mf-size-step] | Tamanhos humanos | 1 | 2 | 4 |
| 15 | pet-size / [data-mf-pet-size-step] | Tamanhos do pet | 1 | 1 | 2 |
| 16 | pet-type / [data-mf-pet-step="pet_type"] | Espécie e referência do pet | 1 | 11 | 3 |
| 17 | pet-eyes / [data-mf-pet-step="pet_eyes"] | Aparência do pet | 1 | 1 | 4 |
| 18 | pet-accessories / [data-mf-pet-step="pet_accessories"] | Referências de acessórios do pet | 1 | 10 | 2 |
| 19 | pet-extras / [data-mf-pet-step="pet_extras"] | Referências extras do pet | 1 | 3 | 2 |
| 20 | minis / [data-mf-mini-step] | Miniaturas adicionais; homologação pendente | 1 | 1 | 2 |
| 21 | included / [data-mf-extra-step] | Bases, inclusos e complementos | 1 | 7 | 3 |
| 22 | box / [data-mf-box-step] | Caixas ilustradas e personalização | 1 | 4 | 3 |
| 23 | delivery / .mf-product-delivery | Modalidades, calendário e flexibilidade | 1 | 1 | 2 |
| 24 | notes / [data-mf-instructions-step] | Observações | 1 | 0 | 0 |
| 25 | gift / .mf-gift-upsell | Caneca adicional; homologação pendente | 1 | 1 | 0 |
| 26 | summary / .mf-product-summary | Preço grande, detalhamento e CTA | 1 | 0 | 2 |
| 27 | social-proof / .mf-product-social-proof | Três blocos de confiança | 1 | 0 | 0 |
| 28 | reviews / #opiniones | Carrossel de avaliações | 1 | 8 | 33 |
| 29 | process / #como-lo-hacemos | Nove cards originais do processo | 1 | 9 | 0 |
| 30 | faq / #faqs | Sete accordions de FAQ | 1 | 0 | 7 |
| 31 | showcase / #trabajos | Grade de trabalhos com 22 imagens | 1 | 22 | 1 |
| 32 | trust / .mf-product-trust | Seis cards de confiança e CTA | 1 | 0 | 7 |
| 33 | video / [data-mf-video-modal] | Modal de apresentação | 1 | 0 | 0 |
| 34 | drawer / [data-mf-cart-drawer] | Resumo lateral convertido para pedido local | 1 | 0 | 4 |
| 35 | fixed-summary / [data-mf-fixed-cart-bar] | Barra de resumo e CTA | 1 | 1 | 2 |
| 36 | footer / .mf-footer | Marca, links e CTA final | 1 | 1 | 6 |

## Estrutura, comportamento e assets

- Header → hero com galeria/oferta/tipos → convites de esboço/B2B e minidepoimentos → configurador → confiança numérica → avaliações → processo → FAQ → trabalhos → garantias → rodapé. Os blocos aninhados permanecem nos mesmos contêineres.
- Hero original: grade 0,88fr/1,12fr, gap de 45 px, mídia sticky, stage quadrado arredondado, 23 slides e respectivos thumbnails. Não trocar os lados nem reduzir a mídia.
- Configurador: grade original e sidebar; accordions com ícones, resumo, chevron e estado. O JS original rearranja tamanhos antes de rosto e agrupa pessoas por tipo; essa ordem dinâmica foi inspecionada como texto e será reproduzida pelo adaptador local.
- Processo: nove cards, mesmo grid, imagens e badges. FAQ: sete itens. Trabalhos: 22 imagens, preservando grid 4/2 colunas. Depoimentos: preservar carrosséis, substituindo alegações e avaliações por conteúdo explícito de staging.
- CSS: 32 arquivos estruturais do tema, incluindo variáveis, página, hero, step-nav, summary-card, extras, entrega, processo e galeria. SVGs inline, classes e data attributes são contratos visuais preservados.
- Imagens: 220 ocorrências em body (incluem repetição, branding e placeholders técnicos); hero 23 slides, trabalhos 22 imagens, processo 9. URLs src/srcset e url() CSS inventariadas; variantes mantidas, arquivos idênticos deduplicados por SHA-256. Tipografia original Poppins/Nunito e Material Icons localizada quando disponível.
- Responsividade original: limites de 1024/768 px e regras específicas por componente; corrigir apenas causas reais de overflow, nunca reduzir seções para ajustar tela.

## Exclusões e adaptações justificadas

Remover scripts inline/externos antigos, configurações de checkout, nonces, tracking, WooCommerce, autenticação, widgets/cookies dependentes desses serviços e branding concorrente. O CSS estrutural e os componentes visuais continuam. O drawer passa a revisar o estado Apex, sem carrinho remoto.

Aparência segue fotos: não tornar cabelo/pele/olhos/boca campos obrigatórios. Painéis e iconografia preservam referências visuais, com opções condicionadas à oferta Apex. Caneca/minis, inclusos não comprovados e modalidades de prazo não homologadas mantêm apresentação e aviso de revisão; não simulam funcionalidade comercial aprovada.

Preços e tamanhos seguem configuração central em BRL, com PRICING_REVIEW_REQUIRED quando provisórios. Ajustes de copy removem prazo, desconto, avaliações, números, garantias e contatos da marca de origem. Logo Apex local. A mídia herdada é ORIGIN_REVIEW_REQUIRED; não bloqueia staging, conforme instrução do proprietário.

O teste scripts/compare-original-shell.js comparará esta estrutura e os assets finais; exceções deverão ter justificativa específica. A versão original será renderizada para comparação com scripts transacionais bloqueados, sem executar seu motor.
