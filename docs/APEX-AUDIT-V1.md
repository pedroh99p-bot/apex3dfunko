# Apex3D — Auditoria V1 de UX, conversão, pricing, mobile e tracking

Data: 12–13/09/2026
Versão auditada: `main` em `c28f182`
Baseline estrutural: tag `baseline-original-2026-09-11` (`175babe`)
Escopo original: diagnóstico do `main` em `c28f182`.

> **Atualização de 13/09/2026:** o hardening da branch `feat/apex-commercial-v1` trata integralmente 24 achados, trata parcialmente 8 e mantém 2 pendentes por dependerem de dados reais ou revisão externa. Pricing, WhatsApp, FIRST10, troca de produto, hero, progresso, assistente, consentimento e tracking placeholder estão implementados. O histórico abaixo permanece como evidência do estado auditado; a entrega atual está documentada em `docs/APEX-COMMERCIAL-V1.md`.

## Situação após o hardening

| Situação | Achados |
| --- | --- |
| Tratados | APEX-002, 003, 005, 006, 007, 008, 009, 010, 011, 012, 013, 015, 016, 017, 019, 020, 023, 025, 026, 029, 030, 031, 032, 034 |
| Parciais | APEX-001, 004, 018, 021, 022, 024, 027, 033 |
| Pendentes externos | APEX-014, 028 |

APEX-001 agora possui rota comercial real por WhatsApp, mas pedido persistente continua para o backend. APEX-004 comunica subtotal/desconto/frete/total parcial sem fingir frete final. APEX-014 depende de origem/licença das mídias; APEX-028 depende de tráfego e RUM reais. FIRST10 é funcional para UX, porém sua elegibilidade ainda não é antifraude até a autoridade migrar ao servidor.

## Resumo executivo

Foram registrados **34 achados: 4 P0, 18 P1, 7 P2 e 5 P3**. O motor local é tecnicamente consistente: os quatro produtos, tamanhos, uploads, vestuário, pose, pessoas, pets, acessórios, base, caixa, data, revisão e limpeza de estado passaram nos testes existentes tanto na origem quanto no build. Os P0 não são regressões silenciosas do cálculo; são bloqueios explícitos de prontidão comercial: não existe envio real de pedido, os CTAs de WhatsApp não abrem o WhatsApp, a tabela inteira ainda é estimativa e o “total” não inclui frete.

No mobile não houve overflow do documento em 360, 375, 390, 430, 768, 1024 ou 1440 px. O problema principal é de comprimento e hierarquia: em 390 px a página mede 17.968 px, o hero ocupa 2.420 px e o CTA primário aparece apenas em y=1.710 px. Processo, FAQ, galeria e confiança entram tarde demais para reduzir objeções antes da configuração.

## Método e evidências

- Leitura de `dev.html`, módulos de estado/preço/revisão/pedido, configurações comerciais, CSS e documentação existente.
- Comparação estrutural com `baseline-original-2026-09-11`: 36 regiões, ordem, imagens, SVGs, contagens e 280 arquivos locais preservados.
- `npm test`: 24/24 testes aprovados.
- `npm run test:structure`: aprovado.
- `npm run test:smoke`: 22/22 cenários de jornada e 51/51 cenários do shell aprovados.
- `npm run test:smoke:build`: os mesmos 73 cenários aprovados no artefato de build.
- Lint estático: sem erros; alertas para ausência de WhatsApp real, `100vw`, `overflow-x`, tipografia por viewport e nomes acessíveis.
- Auditoria temporária em Edge/Playwright nas sete larguras solicitadas, com coleta de geometria, recursos, CLS/LCP sintéticos, nomes acessíveis e capturas.
- Evidência automatizada: `test-results/audit-v1/audit-v1-evidence.json`.
- Capturas principais: `test-results/audit-v1/full-1440.png` e `test-results/audit-v1/full-390.png`; capturas adicionais de hero, modelos, entrega, caneca, FAQ e barra fixa no mesmo diretório.

As métricas de performance são de laboratório local, cache frio e servidor sem throttling. Elas são úteis para encontrar risco técnico, mas não substituem CrUX/RUM nem autorizam alegar resultado real de usuários.

## Matriz de pricing observada

| Produto | 6 cm | 10 cm | 15 cm | 20 cm |
| --- | ---: | ---: | ---: | ---: |
| Individual | R$ 100 | R$ 150 | R$ 170 | R$ 200 |
| Pet | R$ 100 | R$ 150 | R$ 170 | R$ 200 |
| Casal | R$ 200 | R$ 300 | R$ 340 | R$ 400 |
| Família | R$ 300 | R$ 450 | R$ 510 | R$ 600 |

Regras observadas: pessoa adicional custa uma unidade do tamanho selecionado; pet adicional custa R$ 79 e fica fixo em 4 cm; acessório simples custa R$ 15; detalhado, R$ 20; os 35 objetos do catálogo custam R$ 15 ou R$ 20; nome na base custa R$ 19; nome + data, R$ 29; caixa personalizada custa R$ 39 em todos os tamanhos. Frete é `null`/“a confirmar”; caneca, minis e entregas aceleradas não possuem preço executável; não há promoção.

O cálculo implementado é internamente coerente com sua tabela provisória: `base/composição + tamanho por figura + adicionais`, multiplicado por quantidade. O problema comercial é a tabela ainda não homologada e o total não ser final.

## Achados

### APEX-001 — Pedido real não existe

- **SEÇÃO:** Revisão / pedido
- **PRIORIDADE:** P0
- **TIPO:** Funcional / prontidão comercial
- **PROBLEMA:** A jornada termina em “Gerar pedido de teste”; nenhum pedido, upload, checkout ou pagamento é enviado.
- **EVIDÊNCIA:** `config/endpoints.js` mantém `order`, `upload`, `checkout` e `payment` como `null`; o draft fica local e `productionReady` é `false`.
- **CAUSA PROVÁVEL:** Staging deliberado antes da definição do backend e do Asaas.
- **IMPACTO:** O site não consegue concluir uma venda nem preservar o lead após recarregar.
- **CORREÇÃO PROPOSTA:** Tratar como gate de lançamento: definir primeiro a rota comercial (WhatsApp ou backend), contrato de pedido, persistência, privacidade e estados de falha; integrar pagamento apenas em fase autorizada.
- **ARQUIVOS PROVÁVEIS:** `config/endpoints.js`, `js/order.js`, `js/shell-controller.js`, backend futuro.
- **TESTE DE ACEITAÇÃO:** Um pedido válido recebe ID persistente, confirmação verificável e tratamento idempotente; nenhuma venda depende apenas de estado local.

### APEX-002 — CTAs de WhatsApp não abrem o WhatsApp

- **SEÇÃO:** Header, hero e barra fixa
- **PRIORIDADE:** P0
- **TIPO:** Funcional / conversão
- **PROBLEMA:** A segunda rota de conversão é apresentada como WhatsApp, mas os três links apenas voltam ao configurador.
- **EVIDÊNCIA:** “Escreva-nos”, “Tire suas dúvidas sobre a criação” e o ícone fixo usam `href="#personalizar"`; `config/brand.js` possui `whatsapp: null`.
- **CAUSA PROVÁVEL:** Contato comercial ainda não informado e shell preservado sem integração externa.
- **IMPACTO:** Usuários que procuram atendimento humano entram em loop e abandonam; cliques futuros seriam contabilizados incorretamente como WhatsApp.
- **CORREÇÃO PROPOSTA:** Após confirmar número e mensagem, usar URL `wa.me` codificada; separar “Criar minha miniatura” de “Fazer pedido pelo WhatsApp” e incluir contexto do produto/configuração sem PII.
- **ARQUIVOS PROVÁVEIS:** `config/brand.js`, `dev.html`, `js/shell-controller.js`.
- **TESTE DE ACEITAÇÃO:** Cada CTA de WhatsApp abre conversa com número homologado e mensagem contextual; desktop e mobile passam por teste real; CTA do configurador continua distinto.

### APEX-003 — Toda a tabela comercial ainda é provisória

- **SEÇÃO:** Modelos, tamanhos, adicionais, base, caixa e revisão
- **PRIORIDADE:** P0
- **TIPO:** Pricing
- **PROBLEMA:** Preços exibidos como oferta são estimativas; acessórios especiais e caixa usam placeholders e a caneca não possui preço.
- **EVIDÊNCIA:** `pricesAreEstimates: true`, `status: estimate`, avisos “valores provisórios”; 35 objetos a R$ 15/R$ 20; caixa a R$ 39 para todos os tamanhos; caneca lança “sem preço aprovado”.
- **CAUSA PROVÁVEL:** Ausência de custo, margem, compatibilidade e operação homologados.
- **IMPACTO:** Risco de promessa comercial incorreta, margem negativa e retrabalho no atendimento.
- **CORREÇÃO PROPOSTA:** Homologar uma fonte única com custo, margem, impostos, complexidade e compatibilidade; versionar a tabela e remover linguagem de oferta antes de aprovada.
- **ARQUIVOS PROVÁVEIS:** `config/commercial.js`, `config/pricing.js`, `config/special-objects.js`, `config/products.js`, `js/pricing.js`.
- **TESTE DE ACEITAÇÃO:** Tabela assinada pelo responsável; cards, estado, sticky e revisão exibem os mesmos centavos para todas as combinações e rejeitam versão obsoleta.

### APEX-004 — “Total” não é total final

- **SEÇÃO:** Sticky bar e revisão
- **PRIORIDADE:** P0
- **TIPO:** Pricing / transparência
- **PROBLEMA:** O valor chamado de “Total estimado” exclui frete; promoções não fazem parte do contrato e `finalCheckout` permanece falso.
- **EVIDÊNCIA:** `freightCents: null`; shipping custa zero apenas como placeholder; revisão mostra “Frete: A confirmar”.
- **CAUSA PROVÁVEL:** Frete, CEP, prazo e promoção ainda não modelados.
- **IMPACTO:** O comprador ancora no preço incompleto e pode perceber aumento tardio.
- **CORREÇÃO PROPOSTA:** Enquanto não houver frete, rotular “Subtotal dos itens”; depois calcular `itens + tamanho + extras + frete − desconto = total`, com desconto discriminado e regra de validade.
- **ARQUIVOS PROVÁVEIS:** `js/pricing.js`, `js/review.js`, `js/shell-controller.js`, configuração futura de frete/promoção.
- **TESTE DE ACEITAÇÃO:** O mesmo subtotal e total final aparecem em card, estado, sticky, revisão e pedido; frete/desconto possuem linhas próprias e testes de arredondamento.

### APEX-005 — CTA primário fica fora da primeira dobra mobile

- **SEÇÃO:** Hero
- **PRIORIDADE:** P1
- **TIPO:** Conversão / mobile
- **PROBLEMA:** Em mobile, “Personalizar minha miniatura” aparece tarde.
- **EVIDÊNCIA:** Topo do CTA: 1.677 px em 360, 1.674 em 375, 1.710 em 390 e 1.720 em 430; viewport auditado de 844 px.
- **CAUSA PROVÁVEL:** Mídia, título, prova provisória, preço, benefícios e quatro modelos precedem a ação.
- **IMPACTO:** Intenção de compra precisa atravessar cerca de duas telas antes da ação principal.
- **CORREÇÃO PROPOSTA:** Expor CTA logo após promessa/preço e repetir após modelos; manter a decisão de produto sem bloquear o início.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `css/original/product-hero.css`, `css/apex-theme.css`.
- **TESTE DE ACEITAÇÃO:** Em 360–430 px, marca, benefício, prova curta, preço inicial e CTA cabem na primeira dobra sem colisão.

### APEX-006 — Hero mobile é excessivamente alto

- **SEÇÃO:** Hero
- **PRIORIDADE:** P1
- **TIPO:** UX / conversão
- **PROBLEMA:** O hero contém galeria, 23 indicadores, tags, oferta, modelos, dois CTAs, B2B e depoimento provisório.
- **EVIDÊNCIA:** Altura de 2.420 px em 390 e 2.387 px em 360; configurador começa em y=2.520/2.487.
- **CAUSA PROVÁVEL:** Preservação 1:1 do shell original e acúmulo de funções comerciais no mesmo bloco.
- **IMPACTO:** Dilui a mensagem, alonga a decisão e esconde o início da personalização.
- **CORREÇÃO PROPOSTA:** Limitar o primeiro bloco a promessa, prova visual, preço e dois caminhos; mover B2B e prova longa para seções próprias.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, CSS do hero e mini-reviews.
- **TESTE DE ACEITAÇÃO:** Hero mobile termina perto da primeira/segunda dobra e a taxa de clique por contexto pode ser medida.

### APEX-007 — Prova e processo aparecem depois do configurador

- **SEÇÃO:** Ordem de rolagem
- **PRIORIDADE:** P1
- **TIPO:** Conversão
- **PROBLEMA:** O usuário precisa configurar antes de ver processo, galeria e confiança completos.
- **EVIDÊNCIA:** Em 390 px: configurador y=2.520; processo y≈8.396; FAQ y≈12.549; galeria y≈13.258; confiança y≈15.623.
- **CAUSA PROVÁVEL:** Ordem herdada prioriza o formulário.
- **IMPACTO:** Objeções de qualidade, aprovação e credibilidade chegam tarde, aumentando abandono durante a configuração.
- **CORREÇÃO PROPOSTA:** Inserir prova visual curta e processo de 3 passos antes do configurador; manter as versões extensas depois.
- **ARQUIVOS PROVÁVEIS:** `dev.html` e CSS das seções.
- **TESTE DE ACEITAÇÃO:** Antes do primeiro upload existem ao menos uma prova visual legítima, processo curto e garantia de aprovação.

### APEX-008 — Página longa sem progresso global

- **SEÇÃO:** Navegação da página
- **PRIORIDADE:** P1
- **TIPO:** UX / mobile
- **PROBLEMA:** Não há “Você está em” nem progresso entre início, modelos, detalhes, extras, entrega e pedido.
- **EVIDÊNCIA:** Altura total de 17.968 px em 390, 18.083 em 430 e 11.330 em 1440; detector encontrou zero componente global.
- **CAUSA PROVÁVEL:** Existem apenas botões locais “Seguinte” e navegação interna herdada.
- **IMPACTO:** Usuário perde noção de esforço, posição e caminho restante.
- **CORREÇÃO PROPOSTA:** Barra discreta abaixo da navbar; desktop com sete segmentos e rótulo; mobile com segmento atual + “x/7”, sem roubar altura útil.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `js/shell-interactions.js`, `css/apex-shell.css`.
- **TESTE DE ACEITAÇÃO:** IntersectionObserver atualiza seção sem saltos; links funcionam por teclado; barra não cobre conteúdo e respeita redução de movimento.

### APEX-009 — Barra fixa pode cobrir conteúdo durante a rolagem

- **SEÇÃO:** Entrega / sticky bar
- **PRIORIDADE:** P1
- **TIPO:** Mobile
- **PROBLEMA:** No enquadramento natural da seção de entrega, a barra fixa passa sobre o campo de observações.
- **EVIDÊNCIA:** Captura `sticky-over-field-390.png`; ao centralizar explicitamente os campos o overlap cai a zero, indicando problema de reserva/scroll, não de largura.
- **CAUSA PROVÁVEL:** CTA fixo sem `scroll-padding-bottom`/`scroll-margin` suficiente para todos os estados.
- **IMPACTO:** Campo e texto ficam parcialmente escondidos; foco/validação pode parecer quebrado.
- **CORREÇÃO PROPOSTA:** Reservar safe area equivalente à barra + browser chrome; aplicar margem de rolagem a campos e erros; ocultar/reduzir sticky quando teclado/modal estiver aberto.
- **ARQUIVOS PROVÁVEIS:** `css/original/fixed-cart-bar.css`, `css/apex-shell.css`, `js/shell-controller.js`.
- **TESTE DE ACEITAÇÃO:** Focar qualquer campo em 360–430 px mantém campo, label e erro integralmente acima da barra.

### APEX-010 — Alvos de toque abaixo de 44 px

- **SEÇÃO:** Hero, carrosséis, links e configurador
- **PRIORIDADE:** P1
- **TIPO:** Mobile / acessibilidade
- **PROBLEMA:** Setas têm 32 px, indicadores do hero 10–11,5 px, dots de depoimentos 6–18 px e vários links têm 18–40 px de altura.
- **EVIDÊNCIA:** Medição automatizada nas sete larguras; exemplos se repetem em 360–430 px.
- **CAUSA PROVÁVEL:** Controles visuais dimensionados sem área clicável invisível mínima.
- **IMPACTO:** Erros de toque e baixa usabilidade motora.
- **CORREÇÃO PROPOSTA:** Área interativa mínima de 44×44, mantendo o glifo visual menor; aumentar espaçamento e foco visível.
- **ARQUIVOS PROVÁVEIS:** CSS do hero, reviews, header, FAQ e step-nav.
- **TESTE DE ACEITAÇÃO:** Todos os controles acionáveis expõem caixa de toque ≥44×44 em 360–430 px e foco por teclado.

### APEX-011 — Observações sem nome acessível programático

- **SEÇÃO:** Entrega
- **PRIORIDADE:** P1
- **TIPO:** Acessibilidade / formulário
- **PROBLEMA:** O `textarea` de observações é o único controle visível habilitado detectado sem label associado, `aria-label` ou `aria-labelledby`.
- **EVIDÊNCIA:** Auditoria DOM em todas as larguras; `name="mf_instructions_text"`.
- **CAUSA PROVÁVEL:** Texto visual não conectado ao controle após o port.
- **IMPACTO:** Leitor de tela anuncia o campo sem propósito; erro de preenchimento aumenta.
- **CORREÇÃO PROPOSTA:** Associar `label[for]` estável e ajuda via `aria-describedby`.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `js/shell-controller.js`.
- **TESTE DE ACEITAÇÃO:** Accessibility tree anuncia “Comentário adicional sobre sua encomenda”, ajuda e estado de erro.

### APEX-012 — Hero tem 23 controles e navegação excessiva

- **SEÇÃO:** Hero / galeria
- **PRIORIDADE:** P1
- **TIPO:** UX / mobile
- **PROBLEMA:** São 23 slides, 23 thumbs/dots e setas, sem curadoria por história ou etapa.
- **EVIDÊNCIA:** Smoke test confirma 23/23; em 3,6 s o slide ativo permaneceu em `0`.
- **CAUSA PROVÁVEL:** Acervo original inteiro promovido ao hero.
- **IMPACTO:** Poluição visual, muitos alvos minúsculos e custo de mídia sem reforçar uma narrativa clara.
- **CORREÇÃO PROPOSTA:** Curar 4–6 sequências representativas e mover o catálogo completo para a galeria.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `js/shell-interactions.js`, CSS do hero.
- **TESTE DE ACEITAÇÃO:** Hero comunica foto → modelo → miniatura em poucos slides, com swipe/teclado e fallback estático.

### APEX-013 — Depoimentos placeholders são repetidos

- **SEÇÃO:** Hero e Confiança
- **PRIORIDADE:** P1
- **TIPO:** Prova social / copy
- **PROBLEMA:** Quatro mini-depoimentos e quatro cards completos repetem “Avaliação futura”, estrelas vazias e STAGING.
- **EVIDÊNCIA:** Duas áreas antes/depois do configurador; smoke confirma quatro slides e quatro cards.
- **CAUSA PROVÁVEL:** Layout preservado sem depoimentos Apex verificados.
- **IMPACTO:** A ausência de prova vira destaque negativo e parece site inacabado.
- **CORREÇÃO PROPOSTA:** Até haver prova real, substituir a função comercial por processo verificável, aprovação e bastidores; publicar depoimentos somente com autorização.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, CSS de reviews.
- **TESTE DE ACEITAÇÃO:** Nenhum card simula avaliação; prova publicada tem origem, consentimento e conteúdo real.

### APEX-014 — Galeria é referência, não portfólio Apex

- **SEÇÃO:** Galeria / confiança
- **PRIORIDADE:** P1
- **TIPO:** Conversão / marca
- **PROBLEMA:** As 22 imagens são declaradas como acervo original e não como trabalhos próprios.
- **EVIDÊNCIA:** Copy explícita “ainda não um portfólio Apex3D” e notas de origem.
- **CAUSA PROVÁVEL:** Falta de produção e acervo próprios homologados.
- **IMPACTO:** Grande área visual não comprova capacidade da marca e pode gerar dúvidas de autoria.
- **CORREÇÃO PROPOSTA:** Priorizar 3–6 casos próprios com foto recebida, render/aprovação e peça final; manter referências em área claramente editorial enquanto necessário.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `assets/examples`, documentação de direitos.
- **TESTE DE ACEITAÇÃO:** Cada caso informa estágio real e autorização; imagens de referência nunca são apresentadas como entrega Apex.

### APEX-015 — Ofertas indisponíveis criam becos sem saída

- **SEÇÃO:** Extras, caneca e entrega
- **PRIORIDADE:** P1
- **TIPO:** Conversão / UX
- **PROBLEMA:** Minis, caneca e duas opções expressas aparecem em destaque, mas estão desabilitadas.
- **EVIDÊNCIA:** Controles `:disabled`; caneca mostra “Em homologação / Preço a confirmar / Indisponível”; expressos repetem “em definição”.
- **CAUSA PROVÁVEL:** Estrutura visual preservada para oferta futura.
- **IMPACTO:** Interrompe o fluxo com promessas não compráveis e aumenta sensação de staging.
- **CORREÇÃO PROPOSTA:** Enquanto não homologados, apresentar no máximo como “avise-me” fora do fluxo de compra; não usar card de seleção desabilitado como upsell.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `js/shell-controller.js`, CSS de gift/mini/delivery.
- **TESTE DE ACEITAÇÃO:** Todo card dentro do configurador possui ação válida, preço/regra claros ou é removido da decisão ativa sem apagar a seção futura.

### APEX-016 — Entrega não oferece decisão comercial útil

- **SEÇÃO:** Entrega
- **PRIORIDADE:** P1
- **TIPO:** Copy / operação / conversão
- **PROBLEMA:** Só “Padrão · a confirmar” é selecionável; dois cards “Expresso · em definição” repetem “Indisponível”.
- **EVIDÊNCIA:** Uma opção habilitada; prazo/frete sempre combinados posteriormente; data é declarada como necessidade, não promessa.
- **CAUSA PROVÁVEL:** Capacidade, SLA e logística não homologados.
- **IMPACTO:** Usuário não sabe se a compra atende sua data e não percebe diferença entre modalidades.
- **CORREÇÃO PROPOSTA:** Homologar Padrão, Prioritária e Expressa com elegibilidade, custo e capacidade; antes disso, manter apenas “Informe a data necessária” + flexibilidade.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `config/pricing.js`, `js/validation.js`, `js/review.js`.
- **TESTE DE ACEITAÇÃO:** Nenhum prazo inventado; modalidade selecionada chega ao estado/revisão e datas inviáveis recebem resposta clara.

### APEX-017 — Ancoragem de tamanhos é fraca

- **SEÇÃO:** Tamanho
- **PRIORIDADE:** P1
- **TIPO:** Pricing / conversão
- **PROBLEMA:** 6 cm é “Mini”, 10 cm apenas “Em destaque/Padrão”, 15 cm “Maxi” e 20 cm “Grande formato”, sem comparação concreta de valor/uso.
- **EVIDÊNCIA:** Saltos de R$100→150 (+50%), 150→170 (+13%) e 170→200 (+18%); não há justificativa visual nem selo comprovado “mais escolhido”.
- **CAUSA PROVÁVEL:** Preços provisórios e nomenclatura herdada.
- **IMPACTO:** O usuário pode escolher só por preço ou desconfiar da diferença pequena entre 10/15/20.
- **CORREÇÃO PROPOSTA:** Depois da homologação, mostrar escala lado a lado, indicação de ambiente/detalhe e recomendação honesta; usar “mais escolhido” apenas com dado real ou “recomendado” como decisão editorial.
- **ARQUIVOS PROVÁVEIS:** `config/commercial.js`, `dev.html`, `js/shell-controller.js`.
- **TESTE DE ACEITAÇÃO:** Cada tamanho explica benefício, limites e preço incremental por figura; total atualiza em card, sticky e revisão.

### APEX-018 — Composições não comunicam economia nem custo adicional

- **SEÇÃO:** Modelos / pessoa adicional
- **PRIORIDADE:** P1
- **TIPO:** Pricing / upsell
- **PROBLEMA:** Casal e Família são exatamente 2×/3× o individual, sem desconto de conjunto; o seletor de pessoa adicional não mostra o valor antes do clique.
- **EVIDÊNCIA:** Bases R$100/R$200/R$300; controles gerados mostram apenas “+1 pessoa(s)” etc.; custo entra no total conforme tamanho.
- **CAUSA PROVÁVEL:** Fórmula por unidade sem estratégia de pacote.
- **IMPACTO:** Oferta familiar perde incentivo e o upsell de pessoa adicional não é transparente no ponto de escolha.
- **CORREÇÃO PROPOSTA:** Decidir margem e eventual desconto de conjunto; sempre mostrar “+R$ X no tamanho atual” e economia real, se houver.
- **ARQUIVOS PROVÁVEIS:** `config/pricing.js`, `js/shell-controller.js`, `js/pricing.js`.
- **TESTE DE ACEITAÇÃO:** Pacotes e pessoa adicional exibem o mesmo valor calculado; desconto possui linha explícita e nunca é apenas visual.

### APEX-019 — Há português europeu e resíduos de idioma interno

- **SEÇÃO:** Acessórios, WhatsApp, caneca e navegação
- **PRIORIDADE:** P1
- **TIPO:** Copy / localização
- **PROBLEMA:** Textos visíveis incluem “O teu acessório”, “Diz-nos”, “Escrevemos-te”, “Logótipos”, “Contacte-nos”, “figurine”, “mota” e “portátil”; IDs mantêm espanhol, o que é aceitável apenas internamente.
- **EVIDÊNCIA:** Ocorrências em `dev.html`; `lang="pt-BR"` promete português brasileiro.
- **CAUSA PROVÁVEL:** Port do original ibérico com revisão parcial.
- **IMPACTO:** Reduz naturalidade, confiança local e consistência da marca.
- **CORREÇÃO PROPOSTA:** Revisão editorial PT-BR completa; preservar IDs internos para não quebrar estado, alterando somente copy visível.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, mensagens em `js/*.js`, metadados.
- **TESTE DE ACEITAÇÃO:** Busca editorial aprovada não encontra termos fora do glossário PT-BR; labels do estado continuam estáveis.

### APEX-020 — Linguagem de homologação domina a oferta

- **SEÇÃO:** Hero, adicionais, revisão, depoimentos, confiança e footer
- **PRIORIDADE:** P1
- **TIPO:** Copy / conversão
- **PROBLEMA:** “Staging”, “homologação”, “provisório”, “indisponível”, “em definição” e “pedido de teste” se repetem; links “Contato” e “Empresas” apontam ao configurador.
- **EVIDÊNCIA:** Múltiplas ocorrências visíveis e navegação com destinos genéricos.
- **CAUSA PROVÁVEL:** Transparência técnica de pré-lançamento foi colocada na camada comercial.
- **IMPACTO:** Página parece interna, enfraquece desejo e cria expectativas falsas sobre contato.
- **CORREÇÃO PROPOSTA:** Manter um único aviso de prévia no staging; em produção usar copy comercial direta e destinos verdadeiros.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `js/review.js`, `js/shell-controller.js`.
- **TESTE DE ACEITAÇÃO:** Todo CTA descreve sua ação e destino; termos técnicos só aparecem onde legal/operacionalmente necessários.

### APEX-021 — CLS sintético acima do alvo recomendado

- **SEÇÃO:** Carregamento / hero
- **PRIORIDADE:** P1
- **TIPO:** Performance
- **PROBLEMA:** O layout deslocou de forma perceptível durante o carregamento local.
- **EVIDÊNCIA:** CLS de laboratório 0,206; LCP observado foi a imagem principal do hero. Não é dado de campo.
- **CAUSA PROVÁVEL:** CSS/fontes em muitas folhas, 116 imagens sem ambos os atributos intrínsecos e montagem dinâmica do shell.
- **IMPACTO:** Botões e conteúdo podem mudar de posição, especialmente em rede/dispositivo lentos.
- **CORREÇÃO PROPOSTA:** Reservar proporções, reduzir reflow de fontes, consolidar CSS crítico e medir o componente que gera cada shift.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, CSS do hero/configurador, assets/fontes.
- **TESTE DE ACEITAÇÃO:** Lighthouse repetido em ambiente equivalente com CLS ≤0,10 e rastreio de shifts sem input.

### APEX-022 — Carga inicial e DOM visual são excessivos

- **SEÇÃO:** Página inteira
- **PRIORIDADE:** P1
- **TIPO:** Performance / mobile
- **PROBLEMA:** A página entrega muito HTML/CSS/mídia e mantém centenas de imagens/controles no DOM.
- **EVIDÊNCIA:** `dev.html` 399.593 B; CSS 435.038 B em 37 folhas; 194 imagens no DOM, 125 carregadas na amostra inicial (~1,41 MB transferidos); assets 6,42 MB; 11 TTF somam 1,74 MB.
- **CAUSA PROVÁVEL:** Shell original monolítico, catálogo completo e múltiplas variantes/fontes.
- **IMPACTO:** Maior custo de parse, memória, rede e risco de INP/LCP ruim em celulares reais; tracking/motion futuros ampliariam o custo.
- **CORREÇÃO PROPOSTA:** Orçamento de performance, CSS crítico + consolidação, subconjunto de fontes, renderização progressiva do catálogo e variantes responsivas de imagem.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `css/**`, `assets/**`, build.
- **TESTE DE ACEITAÇÃO:** Comparação cache frio com orçamento aprovado; nenhum ganho é aceito se piorar LCP/CLS/INP de campo.

### APEX-023 — Tracking ainda não existe

- **SEÇÃO:** Jornada inteira
- **PRIORIDADE:** P2
- **TIPO:** Analytics
- **PROBLEMA:** Não há GTM, GA4, Google Ads, Meta Pixel nem `dataLayer`.
- **EVIDÊNCIA:** `dataLayer=false`, `gtag`/`fbq` indefinidos; comentários legados de Pixel sem código executável.
- **CAUSA PROVÁVEL:** Remoção deliberada de tracking no staging.
- **IMPACTO:** Não há baseline de funil, origem, dispositivo ou conversão; decisões continuam hipotéticas.
- **CORREÇÃO PROPOSTA:** Implementar o plano desta auditoria somente após CMP/consentimento e IDs homologados.
- **ARQUIVOS PROVÁVEIS:** novo módulo de analytics, `dev.html`, GTM container.
- **TESTE DE ACEITAÇÃO:** Preview do GTM, DebugView GA4, Pixel Helper e rede mostram um único evento por ação, respeitando consentimento.

### APEX-024 — Eventos não têm contrato de contexto/deduplicação

- **SEÇÃO:** CTAs e configurador
- **PRIORIDADE:** P2
- **TIPO:** Tracking / dados
- **PROBLEMA:** O mesmo tipo de ação ocorre em hero, sticky, FAQ e final sem `cta_location`, `product_id`, `value` ou `event_id` padronizados.
- **EVIDÊNCIA:** Nenhuma instrumentação atual; CTAs diferentes compartilham destino interno.
- **CAUSA PROVÁVEL:** Tracking ainda não planejado no código.
- **IMPACTO:** Futuro relatório pode duplicar conversões e não indicar qual contexto funciona.
- **CORREÇÃO PROPOSTA:** Contrato de evento versionado, helper único, localização explícita, moeda BRL, valor em reais e `event_id` para deduplicação browser/servidor.
- **ARQUIVOS PROVÁVEIS:** módulo futuro `analytics`, data attributes em `dev.html`.
- **TESTE DE ACEITAÇÃO:** Matriz de eventos passa em teste automatizado e nenhum clique gera dois eventos equivalentes.

### APEX-025 — Não há consentimento para analytics/ads

- **SEÇÃO:** Global
- **PRIORIDADE:** P2
- **TIPO:** Privacidade / LGPD
- **PROBLEMA:** Não existe UI de consentimento; isso se torna um bloqueio antes de ativar analytics/ads não essenciais.
- **EVIDÊNCIA:** Zero banner/CMP visível e nenhum estado de consentimento. A ANPD recomenda transparência, controle, política e banners para cookies; cookies não essenciais devem ser gerenciáveis.
- **CAUSA PROVÁVEL:** Tracking foi removido do staging.
- **IMPACTO:** Ativar tags diretamente criaria risco de coleta sem governança e revogação adequada.
- **CORREÇÃO PROPOSTA:** Banner PT-BR com “Aceitar”, “Rejeitar não essenciais” e “Configurar”; categorias necessárias, analytics e publicidade; consentimento granular, revogável e registrado. Validar base legal com assessoria responsável. Fonte: [Guia orientativo da ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/%40%40display-file/file).
- **ARQUIVOS PROVÁVEIS:** CMP/banner futuro, política de privacidade/cookies, GTM Consent Mode.
- **TESTE DE ACEITAÇÃO:** Antes do aceite não há cookies/tags não essenciais; rejeitar funciona tão facilmente quanto aceitar; revogação atualiza tags e armazenamento.

### APEX-026 — Metadados ainda são de staging

- **SEÇÃO:** SEO / compartilhamento
- **PRIORIDADE:** P2
- **TIPO:** Branding / SEO
- **PROBLEMA:** `robots=noindex,nofollow`, domínio é `null`, não há canonical e o OG usa URL externa; tagline oficial não aparece de forma consistente.
- **EVIDÊNCIA:** Head e `config/brand.js`; favicon/logo e OG/Twitter existem, mas a configuração não está pronta para URL pública.
- **CAUSA PROVÁVEL:** Prévia sem domínio final.
- **IMPACTO:** Lançamento acidental não indexa; compartilhamento depende de terceiro e identidade pode variar.
- **CORREÇÃO PROPOSTA:** No gate de produção, definir domínio/canonical, política de indexação e OG público 1200×630; manter `noindex` em previews.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `config/brand.js`, `assets/brand`, deploy.
- **TESTE DE ACEITAÇÃO:** URL pública retorna metadados corretos, OG 200 e preview social; staging continua noindex.

### APEX-027 — Semântica e textos alternativos precisam revisão

- **SEÇÃO:** Hero, galeria e formulários
- **PRIORIDADE:** P2
- **TIPO:** Acessibilidade / SEO
- **PROBLEMA:** A descrição principal é um `h2` imediatamente sob o `h1`; várias imagens de conteúdo usam `alt=""`; o lint encontrou muitos controles suspeitos, embora a maioria esteja embrulhada em label.
- **EVIDÊNCIA:** Outline DOM e HTML da galeria; APEX-011 é o controle confirmado sem nome.
- **CAUSA PROVÁVEL:** Estrutura herdada e limpeza parcial de atributos.
- **IMPACTO:** Navegação por headings perde clareza e imagens relevantes não são descritas.
- **CORREÇÃO PROPOSTA:** Transformar subtítulo em parágrafo; mapear imagem decorativa versus informativa; revisar árvore de acessibilidade por componente.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, templates dinâmicos em `js/shell-controller.js`.
- **TESTE DE ACEITAÇÃO:** Axe/manual sem violações críticas; outline lógico; toda imagem informativa possui alt útil e decorativa usa alt vazio conscientemente.

### APEX-028 — Não há dados de campo de Web Vitals

- **SEÇÃO:** Performance / tracking
- **PRIORIDADE:** P2
- **TIPO:** Observabilidade
- **PROBLEMA:** LCP/CLS/INP reais não são medidos; INP não pode ser concluído desta amostra sintética.
- **EVIDÊNCIA:** Apenas teste local; um long task de 50 ms e evento sintético de 40 ms não representam INP de usuários.
- **CAUSA PROVÁVEL:** Analytics/RUM ainda ausentes.
- **IMPACTO:** Otimizações podem mirar sintomas locais e ignorar aparelhos/rede reais.
- **CORREÇÃO PROPOSTA:** Após consentimento, coletar Web Vitals por página, device e versão, sem PII; usar percentil 75 e volume mínimo.
- **ARQUIVOS PROVÁVEIS:** módulo futuro de RUM/analytics.
- **TESTE DE ACEITAÇÃO:** Dashboard segmenta LCP, CLS e INP p75 por versão/dispositivo e alerta regressão.

### APEX-029 — Aplicação da marca não fecha o sistema verbal

- **SEÇÃO:** Navbar, hero e footer
- **PRIORIDADE:** P2
- **TIPO:** Branding
- **PROBLEMA:** Logo Apex3D está presente, mas “Apex3D PERSONALIZADOS” e “Sua história em miniatura.” não formam uma assinatura consistente nos pontos principais.
- **EVIDÊNCIA:** Headline e metadados usam variações “Sua história em 3D”/“Miniatura 3D Personalizada”; footer enfatiza prévia de homologação.
- **CAUSA PROVÁVEL:** Atualização visual recente sem revisão verbal completa.
- **IMPACTO:** Menor memorização e consistência entre site e compartilhamento.
- **CORREÇÃO PROPOSTA:** Definir lockup e hierarquia: marca, categoria e tagline; aplicar sem repetir excessivamente.
- **ARQUIVOS PROVÁVEIS:** `config/brand.js`, `dev.html`, `assets/brand`.
- **TESTE DE ACEITAÇÃO:** Navbar, hero, footer, favicon e metadata usam nomes aprovados e continuam legíveis em 360 px.

### APEX-030 — Hero futuro precisa de arquitetura leve

- **SEÇÃO:** Hero
- **PRIORIDADE:** P3
- **TIPO:** Motion / performance
- **PROBLEMA:** O carrossel automático foto → modelo → miniatura ainda não existe; adicionar autoplay sobre 23 slides agravaria carga e distração.
- **EVIDÊNCIA:** Slide não mudou após 3,6 s; 23 slides/controles presentes; LCP atual já é imagem do hero.
- **CAUSA PROVÁVEL:** Interação atual é manual e preservada.
- **IMPACTO:** Implementação ingênua pode piorar LCP, CLS, bateria e acessibilidade.
- **CORREÇÃO PROPOSTA:** Curar grupos de três frames, embaralhar a ordem por sessão, trocar a cada ~3 s com opacity/transform, pausar fora da viewport, reservar aspecto e respeitar `prefers-reduced-motion`; pré-carregar só o próximo frame.
- **ARQUIVOS PROVÁVEIS:** módulo futuro do hero, CSS do hero, manifesto de imagens.
- **TESTE DE ACEITAÇÃO:** Sem CLS adicional; primeiro frame é LCP prioritário; reduced motion mantém frame estático; teclado e swipe continuam funcionais.

### APEX-031 — Assistente Apex ainda não possui ponto de entrada

- **SEÇÃO:** Hero, configurador e FAQ
- **PRIORIDADE:** P3
- **TIPO:** Arquitetura futura / WhatsApp
- **PROBLEMA:** Não há componente que responda tamanho, fotos, prazo, pet e personalizado nem handoff contextual ao WhatsApp.
- **EVIDÊNCIA:** Zero componente/endpoint; CTAs atuais são âncoras.
- **CAUSA PROVÁVEL:** Fase anterior ao atendimento automatizado.
- **IMPACTO:** Dúvidas interrompem o fluxo ou viram abandono.
- **CORREÇÃO PROPOSTA:** Começar como painel de respostas determinísticas alimentado por conteúdo homologado, posicionado após modelos e como ajuda no configurador; handoff ao WhatsApp leva apenas resumo consentido. IA futura deve usar a mesma base e limites.
- **ARQUIVOS PROVÁVEIS:** novo componente, conteúdo FAQ, `config/brand.js`.
- **TESTE DE ACEITAÇÃO:** Respostas não inventam preço/prazo; usuário fecha por teclado; handoff inclui contexto mínimo e nunca fotos/dados sensíveis no analytics.

### APEX-032 — Marquee de marketing ainda não existe

- **SEÇÃO:** Após hero
- **PRIORIDADE:** P3
- **TIPO:** Branding / motion
- **PROBLEMA:** Não há faixa contínua que reforce categorias e aprovação.
- **EVIDÊNCIA:** Detector encontrou zero elemento marquee.
- **CAUSA PROVÁVEL:** Recurso ainda conceitual.
- **IMPACTO:** Oportunidade de ritmo e reforço de mensagem não aproveitada; impacto comercial é menor que clareza/CTA.
- **CORREÇÃO PROPOSTA:** Só adicionar após encurtar o hero; texto curto, uma trilha duplicada semântica, pausa/redução de movimento e sem roubar foco.
- **ARQUIVOS PROVÁVEIS:** `dev.html`, `css/apex-theme.css`.
- **TESTE DE ACEITAÇÃO:** Sem overflow/CLS; reduced motion exibe faixa estática; texto não é duplicado por leitor de tela.

### APEX-033 — Promoção de primeira compra não possui regra

- **SEÇÃO:** Conversão / promoção
- **PRIORIDADE:** P3
- **TIPO:** Growth / pricing
- **PROBLEMA:** Não existe popup, cupom, elegibilidade, expiração nem linha de desconto.
- **EVIDÊNCIA:** Zero popup/promo e nenhuma promoção em `calculatePrice`.
- **CAUSA PROVÁVEL:** Ideia ainda não homologada comercialmente.
- **IMPACTO:** Implementar apenas a UI criaria desconto sem governança e total divergente.
- **CORREÇÃO PROPOSTA:** Homologar margem e regras; depois testar gatilhos mutuamente exclusivos: 30–40% de scroll, ~30 s ou exit intent desktop, com frequência limitada e fechamento fácil.
- **ARQUIVOS PROVÁVEIS:** configuração comercial, pricing, componente de promoção, analytics.
- **TESTE DE ACEITAÇÃO:** Desconto aparece como linha única em state/sticky/review/pedido; não reaparece após recusa no período definido; `promo_claim` é deduplicado.

### APEX-034 — Motion não está organizado por hierarquia

- **SEÇÃO:** Hero, accordions, preço, cards e progresso
- **PRIORIDADE:** P3
- **TIPO:** Motion / polish
- **PROBLEMA:** Existem transições herdadas, mas não um sistema de microinterações ligado a mudança de estado; reduced motion global já está previsto.
- **EVIDÊNCIA:** `prefers-reduced-motion` reduz duração; carrossel atual é manual; barra global não existe.
- **CAUSA PROVÁVEL:** Preservação visual antes do polish.
- **IMPACTO:** Feedback de seleção/preço pode parecer brusco, enquanto efeitos futuros podem ficar inconsistentes.
- **CORREÇÃO PROPOSTA:** Tokens de duração/easing; animar apenas opacity/transform para entrada do hero, accordion, seleção, preço e progresso; price update com breve realce e `aria-live` moderado.
- **ARQUIVOS PROVÁVEIS:** `css/apex-shell.css`, `css/apex-theme.css`, interações JS.
- **TESTE DE ACEITAÇÃO:** Sem layout shift ou long tasks; reduced motion elimina deslocamentos; estado permanece claro sem animação.

## Auditoria comercial por seção

| Seção | Função comercial | Problema principal | Recomendação | Prioridade |
| --- | --- | --- | --- | --- |
| Hero | Explicar oferta e iniciar ação | Alto demais; CTA fora da dobra mobile; prova provisória | Encurtar, subir CTA e curar sequência foto→modelo→miniatura | P1 |
| Modelos | Escolher composição e ancorar entrada | Pacotes são múltiplos exatos; sem economia/critério | Mostrar diferença, por quem é e preço transparente | P1 |
| Como funciona | Reduzir risco percebido | Só aparece após configurador | Versão curta antes da configuração; versão longa depois | P1 |
| Galeria | Provar qualidade e variedade | Acervo de referência, muito tarde | Casos próprios e curadoria por Individual/Casal/Família/Pet | P1 |
| Configurador | Capturar requisitos do pedido | Longo, com itens futuros desabilitados | Progresso global, disclosure progressivo e ajuda contextual | P1 |
| Tamanho | Aumentar ticket com valor | Ancoragem e saltos sem justificativa | Comparação visual/uso e badge honesto | P1 |
| Fotos | Obter matéria-prima correta | Fluxo funciona; revisar alt/ajuda e privacidade futura | Exemplos bons/ruins e política clara de retenção | P2 |
| Vestuário | Personalizar e elevar valor | Copy/IDs herdados; preço não se aplica | PT-BR e feedback visual leve | P1 |
| Extras | Aumentar ticket | 35 itens provisórios e selector denso | Curar categorias, preço homologado e busca sob consulta | P0 |
| Caixa | Presenteabilidade | R$39 único sem compatibilidade homologada | Matriz por tamanho e imagem real | P0 |
| Caneca | Cross-sell | Card chamativo, porém indisponível e sem preço | Retirar da decisão ativa ou usar “avise-me” até homologar | P1 |
| Entrega | Resolver urgência | Uma opção real e duas indisponíveis | Data necessária + flexibilidade até SLAs aprovados | P1 |
| Confiança | Reduzir objeções | Depoimentos futuros e imagens de referência | Aprovação, processo e bastidores verificáveis | P1 |
| FAQ | Fechar dúvidas | Funciona, mas contém linguagem de staging | Reescrever por objeção real e inserir handoff ao WhatsApp | P1 |
| CTA final | Recuperar indecisos | Pedido/contato apontam ao configurador | Dois caminhos reais: configurar ou WhatsApp | P0 |

## Avaliação dos upsells

| Upsell | Estado e preço atual | Avaliação | Próxima decisão necessária |
| --- | --- | --- | --- |
| Pessoa adicional | Funciona; custa a unidade do tamanho selecionado | Estado, foto, preço e revisão passam; preço não aparece no seletor | Exibir surcharge atual e decidir desconto de composição |
| Pet adicional | Funciona; R$79, 4 cm fixos | Tipo/foto/revisão passam; tamanho e regra precisam destaque | Homologar custo, limite e compatibilidade |
| Acessório simples | R$15 cada, até 5 | Boa mecânica; valor provisório | Homologar escopo “simples” com exemplos próprios |
| Acessório detalhado/logo | R$20 cada, até 5 | Boa mecânica; terminologia e custo provisórios | Definir critério de complexidade e orçamento fora da faixa |
| Objeto especial | 35 itens a R$15/R$20 | Visualmente rico, porém longo e todo provisório | Curar itens mais vendidos e homologar por complexidade |
| Base com nome | +R$19 | Funciona e chega à revisão | Confirmar material, limite de caracteres e margem |
| Base com nome + data | +R$29 | Funciona e valida data/texto | Confirmar formato, espaço e política de correção |
| Caixa personalizada | +R$39 em todo tamanho | Funciona; compatibilidade ainda não comprovada | Matriz tamanho×caixa, fotos reais e custo por variante |
| Caneca personalizada | Indisponível, sem preço | Não deve ocupar espaço de upsell comprável | Homologar fornecedor, arte, preço, prazo e imagem; só então ativar |

## Estrutura recomendada de entrega, sem inventar prazo

1. **Padrão:** produção e frete conforme capacidade homologada; exibir prazo somente após operação aprovar.
2. **Prioritária:** fila priorizada com capacidade limitada, custo e elegibilidade documentados.
3. **Expressa:** somente para combinações/tamanhos realmente possíveis, com cutoff e capacidade.
4. **Data necessária:** campo obrigatório tratado como necessidade do cliente, nunca promessa automática.
5. **Flexibilidade:** opção clara para receber proposta alternativa.

Antes de publicar qualquer número, homologar: tempo de modelagem, janela de aprovação/revisões, impressão/acabamento, embalagem, transportadora/CEP, feriados, reprocesso, capacidade diária, cutoff e política quando a data não puder ser atendida.

## Plano de WhatsApp e assistente

- Rota primária: **Criar minha miniatura** → configurador.
- Rota secundária: **Fazer pedido pelo WhatsApp** → conversa real com origem (`hero`, `configurador`, `extras`, `faq`, `sticky`) e resumo não sensível.
- Hero: dois CTAs juntos, com hierarquia visual clara.
- Configurador: WhatsApp como ajuda, sem apagar estado.
- Extras: “Preciso de algo diferente” abre atendimento com categoria e tamanho, não com fotos.
- FAQ: handoff ao fim de respostas sobre prazo, fotos e personalizado.
- Sticky: no mobile, ícone + rótulo acessível; não pode cobrir campos.
- Assistente Apex V1: base determinística homologada para tamanho, fotos, prazo, pet e personalizado. V2 com IA apenas após fonte de verdade, logs/privacidade, fallback humano e proibição explícita de inventar preço/prazo.

## Tracking plan

### Contrato comum

Parâmetros permitidos: `event_id`, `page_version`, `product_id`, `size_cm`, `currency=BRL`, `value`, `cta_location`, `item_category`, `quantity`, `delivery_type`, `consent_state`. Não enviar nome, telefone, texto livre, conteúdo de foto, URL de blob ou observação.

| Evento | Disparo recomendado | Parâmetros adicionais |
| --- | --- | --- |
| `view_product` | Produto/hero visto de forma elegível | `product_id`, `value` |
| `select_product` | Troca real de Individual/Pet/Casal/Família | anterior/novo, `value` |
| `select_size` | Mudança de tamanho | `size_cm`, `value` |
| `upload_reference` | Upload validado, nunca na seleção bruta | tipo da referência, quantidade; sem nome/arquivo |
| `customize_outfit` | Escolha referência/personalizado concluída | modo, sem descrição livre |
| `add_pet` | Quantidade de pet muda para >0 | quantidade, `value` |
| `add_accessory` | Acessório confirmado | categoria, quantidade, `value`; sem texto livre |
| `add_mug` | Caneca homologada e adicionada | variante, `value` |
| `add_box` | Caixa personalizada selecionada | variante, `value` |
| `select_delivery` | Modalidade válida escolhida | `delivery_type`, `value` |
| `review_order` | Revisão abre com estado válido | itens, `value` |
| `whatsapp_click` | Antes de abrir `wa.me` | `cta_location`, produto, `value` |
| `promo_claim` | Promoção realmente aplicada | código interno, desconto; sem e-mail/telefone |
| `begin_checkout` | Backend/checkout aceita início | `event_id`, itens, `value` |
| `purchase` | Confirmação autoritativa do pagamento | Preferir servidor/Asaas futuro; deduplicar por `event_id` |

### Ordem de implementação

1. Aprovar CMP, política e categorias de consentimento.
2. Criar helper único para `dataLayer` com schema versionado e testes.
3. Instalar GTM e mapear GA4; ativar Google Ads/Meta apenas conforme consentimento e finalidade.
4. Separar microconversão (`whatsapp_click`, `review_order`) de venda (`purchase`).
5. Validar Preview/DebugView/Pixel Helper, deduplicação e bloqueio pré-consentimento.
6. Publicar dashboard por origem, dispositivo, produto, tamanho e etapa; comparar períodos com volume suficiente.

## Performance: linha de base e orçamento

- HTML: 399,6 KB; CSS: 435,0 KB; JS/config: 82,5 KB; assets locais: 6,42 MB.
- 194 imagens no DOM; 181 marcadas lazy; 125 foram requisitadas na amostra inicial; nenhuma quebrada.
- 116 imagens não têm simultaneamente `width` e `height` como atributos, embora parte tenha contenção por CSS.
- 37 folhas de estilo; 11 fontes TTF somando 1,74 MB.
- Laboratório local: DCL ~264 ms, load ~291 ms, LCP ~152 ms (imagem do hero), CLS 0,206, um long task de 50 ms. Tempos rápidos refletem localhost; CLS e complexidade estrutural continuam relevantes.
- INP não foi afirmado: sem tráfego real e sem interação representativa suficiente.

Orçamento recomendado para a próxima versão: CLS ≤0,10; nenhuma regressão de LCP/INP p75; hero com apenas primeiro frame prioritário; fontes reduzidas aos pesos usados; catálogo progressivo; tracking/motion dentro de orçamento separado e testado em aparelho/rede móvel.

## Conclusão

O frontend é uma base de staging tecnicamente protegida e com estado/preço coerentes, mas ainda não é uma experiência comercial publicável. A ordem correta de ataque é: **P0 comerciais → hero/CTA/ordem mobile → prova/entrega/upsells → performance/acessibilidade → tracking/consentimento → motion/growth**. Nenhum HTML, CSS, JavaScript, preço, asset, backend ou tracking foi corrigido nesta auditoria.
