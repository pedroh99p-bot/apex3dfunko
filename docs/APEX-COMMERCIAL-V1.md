# Apex3D — Hardening Comercial V1

Data: 13/09/2026
Branch: `feat/apex-commercial-v1`

## Escopo entregue

A V1 fecha a apresentação comercial do frontend sem criar backend ou processar pagamento. A fonte única de preço está em `config/commercial.js` e `config/pricing.js`; cálculo, estado, sticky, revisão e `orderDraft` usam centavos inteiros em BRL.

| Tamanho | Individual | Pet | Casal | Família (3) |
| --- | ---: | ---: | ---: | ---: |
| 6 cm · Compacto | R$ 99,90 | R$ 99,90 | R$ 189,90 | R$ 269,90 |
| 10 cm · Recomendado | R$ 149,90 | R$ 149,90 | R$ 279,90 | R$ 399,90 |
| 15 cm · Mais presença | R$ 179,90 | R$ 179,90 | R$ 339,90 | R$ 479,90 |
| 20 cm · Premium | R$ 219,90 | R$ 219,90 | R$ 419,90 | R$ 599,90 |

Upsells ativos: pessoa adicional pelo preço Individual do tamanho atual; pet R$ 79,90; acessório simples R$ 19,90; acessório detalhado R$ 39,90; objeto especial R$ 39,90; nome na base R$ 19,90; nome + data R$ 29,90; caixa personalizada R$ 39,90.

## Promoção FIRST10

FIRST10 aplica 10% sobre o subtotal elegível dos itens, arredondado para centavos. A revisão separa subtotal, desconto, frete a confirmar e total parcial. O estado não permite aplicação duplicada.

O `localStorage` controla somente a experiência de exibição por 30 dias e restaura a escolha durante a navegação. Ele não comprova primeira compra, não evita fraude e não pode ser a autoridade quando o backend entrar. A elegibilidade final deverá ser validada no servidor antes de criar cobrança.

## Conversão e atendimento

- Hero curto no mobile, CTA principal na primeira dobra e seis histórias curadas com autoplay de três segundos, pausa fora da viewport e reduced motion.
- Marquee após o hero, prova curta antes do configurador e progresso global com sete etapas.
- Troca entre Individual, Casal, Família e Pet sincroniza seleção, URL, estado, uploads, preço e revisão.
- WhatsApp oficial `5521923679482` com templates por hero, configurador, extras, FAQ e assistente. Contexto permitido: produto, tamanho e subtotal. Fotos, blobs, notas e texto livre são proibidos.
- Assistente local/determinístico com seis dúvidas e encaminhamento para atendimento humano.
- Depoimentos, estrelas e números não verificados foram substituídos por compromissos verificáveis do fluxo.
- Caneca, minis e modalidades de entrega sem SLA foram retirados da jornada ativa. A entrega pergunta somente data desejada e flexibilidade.

## Tracking e consentimento

`config/analytics.js` contém `GTM-PLACEHOLDER`, `G-PLACEHOLDER`, `AW-PLACEHOLDER` e `META-PLACEHOLDER`. `js/analytics.js` aceita apenas parâmetros escalares e mantém estes eventos: `view_product`, `select_product`, `select_size`, `upload_reference`, `customize_outfit`, `add_pet`, `add_accessory`, `add_box`, `select_delivery`, `review_order`, `whatsapp_click`, `promo_view`, `promo_claim`, `begin_checkout` e `purchase`.

Enquanto houver placeholder, o helper não chama provedores nem carrega tags. Consentimento separa necessários, analytics e publicidade. `purchase` é apenas parte do contrato futuro e não é disparado nesta V1.

## Validação da entrega

- `npm test`: 28 testes aprovados.
- `npm run test:structure`: baseline imutável, regiões, ordem, contagens e 278 arquivos locais verificados.
- `npm run test:smoke`: 23 cenários do motor e 63 cenários comerciais aprovados na fonte.
- `npm run test:smoke:build`: os mesmos 86 cenários aprovados no artefato de `dist`.
- Responsividade e ausência de overflow verificadas em 360, 375, 390, 430, 768, 1024 e 1440 px.
- Alvos principais de toque com pelo menos 44 px e CLS sintético local até 0,10 cobertos pelo smoke test.
- Screenshots de hero, progresso, modelos, tamanhos, configurador, vestuário, extras, entrega, sticky, popup, assistente e FAQ estão em `test-results/original-shell/`.
- Lint estático de `dist/index.html`: zero erros; os avisos restantes são heurísticas sobre CSS herdado, links preenchidos em runtime e controles envolvidos por `label`, todos cobertos pelos testes de navegador.

## Limites e próxima fase

Ainda não existem persistência do pedido, armazenamento de imagens, identidade do cliente, cálculo de frete por CEP, reserva de capacidade, webhook, checkout, cobrança, antifraude ou confirmação de pagamento. O backend deverá recalcular toda a matriz e a promoção, emitir versão de preço, validar elegibilidade, tornar criação e pagamento idempotentes e disparar `purchase` apenas depois da confirmação confiável do Asaas.

As mídias herdadas continuam sujeitas às revisões de origem registradas no mapa de assets. Antes da publicação definitiva também faltam domínio canônico, política de privacidade/termos finais, IDs reais com consentimento, observabilidade/RUM e validação real do número do WhatsApp em aparelho.
