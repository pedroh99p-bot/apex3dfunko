# Sistema de preços — valores originais preservados

H = index; P = `product-personalized.js` remoto consultado em 11/09/2026. Esta documentação registra preços em **EUR (€)** da MiFunko, sem os adotar como preços Apex3D. Inventário granular: [PRICE-ATTRIBUTES](PRICE-ATTRIBUTES.md).

## Fonte de verdade atual

Não há configuração única. Os valores estão em `data-*` do HTML, spans de preço, metadados JSON/analytics e números fixos em P. A lógica de servidor que decide o preço cobrado não está no repositório. P7138 obtém base do hidden `mf_funko_type_price` (preenchido da opção selecionada), com fallback para preço inicial do hero. P7170–7348 soma adicionais. P7644 calcula **base + adicionais** e atualiza a apresentação; não multiplica esse total pela quantidade WooCommerce.

## Tabelas efetivas do cliente

| Item | Valor/regra original | Evidência |
| --- | --- | --- |
| Individual | Base 59 | H1260–1279 `data-type-price` |
| Pet principal (`mascota`) | Base 59 | H1281–1300 |
| Casal (`pareja`, alias `parejas`) | Base 109 | H1302–1321; P7164 |
| Casamento (`boda`) | Base 119 | H1323–1342 |
| Tamanho humano | 6 cm +0; 10 cm +20; 15 cm +45; 20 cm +65 | H4613–4674 `data-mf-size-base-price` |
| Multiplicador de tamanho | ×2 em casal/casamento; ×1 nos demais | P7164–7168; `mfApplySizePricing` só recalcula apresentação; total aplica multiplicador em P7238–7240 |
| Pet principal: tamanho | 6 cm incluído; 10 cm +20; 15 cm +40; 20 cm +60 | H4739–4814, spans lidos em P7243–7247 |
| Cabelo/pele | Opções representadas por cores/imagens; o total procura `.__price` dentro do card e soma 0 se não houver | H1580–1760 e H2102–2228; P7181–7202; não inventar acréscimo onde não existe |
| Olhos humanos | Preto padrão incluído; alternativas +5 | H1770–1857; P7205–7214 |
| Óculos | +5 por figura ativa selecionada | Hardcoded P7224; foto separada opcional |
| Boca | `sin_boca` 0; nove expressões +2 cada | H1904–2054 `data-mouth-price`; soma P7228–7235; detalhes no inventário |
| Pets adicionais | 1 +30; 2 +60; 3 +80 | H2420–2481; total lê span em P7289–7292 |
| Tamanho de cada pet adicional | 4 cm +0; 6 cm +10; 10 cm +40 | H2582–2590, 2715–2723, 2848–2856; hidden por slot P7295–7304 |
| Acessório comum / logo | +5 por unidade, somando campos de ambas figuras | P7307–7308; controles H2980+ e H4509+; builders 0..5 |
| Acessórios especiais | 35 opções de +5 a +80, dependem do slug | H3041–3358. Ex.: ramo +10, altar +50, guitarra +30, bicicleta +35, carro +80; preço integral em PRICE-ATTRIBUTES |
| Pet principal: olhos | Padrão 0; outras cores +4 | H5120–5205, `data-pet-price` |
| Catálogo pet legado | Acessórios +10 a +80 (raquete 10, guitarra 35, bolsa 15, arma 25, bicicleta 45, piano 70, moto/bateria/carro 80, mesa DJ 60); bases 0/+6/+10/+8 | H5278–5643. Esses steps estão fora do layout `mascota` atual P829 e só entram no total se ativos; não equivalem ao catálogo especial visível |
| Minis: quantidade | Sem 0; 1=39; 2=78; 3=116 | H5669–5724; três não são 117, preservar valor cadastrado |
| Minis: tamanho | 4 cm +0; 6 cm +10; 10 cm +30; 15 cm +40 **por mini** | H5749–5817; P7274–7276 multiplica adicional por `getMiniQuantityCount` |
| Bases / proteção | Suporte 0; capa 0; ímãs 0; base nome +6; nome+data +10; grama +8 | H5903–6110; `enforceExclusiveBaseExtraSelection` controla escolha |
| Caixa sem personalização | `caja_standard` 0 | H6187–6212 |
| Caixa individual | Para 6/10 cm +10; para 15 cm +15 | H6213 + P6830–6895, sobrescreve valor do dataset e span |
| Caixa dupla | Para 6/10 cm +15; para 15 cm +20 | H6239 + P6830–6895; casal/casamento ocultam caixa individual |
| Caixa 20 cm | Nenhuma opção disponível; seleção é desmarcada e opções removidas do DOM | P6850–6889 |
| Dedicatória | +6, apenas se toggle ativo e caixa paga | P7264–7265; foto da dedicatória é opcional |
| Prazo padrão | +0, 28 dias | H6387–6406 |
| Express | +10, 21 dias (`envio_urgente`) | H6408–6427 |
| Serviço express | +15, 14 dias (`envio_express`, marcado `data-shipping-mode=standard`) | H6430–6448; identificadores/rótulos não são uniformes |
| Presente upsell | Produto adicional 20 | H6539+; cobrança via outro produto/GET, não somado ao preço da figura por `getSelectedOptionsPrice` |

As opções de preço de rosto/pele/olhos nem sempre têm span com classe específica. O cálculo usa 0 quando não encontra; validar isso ao transformar imagens ou textos. `getFieldPrice` P7062 reconhece `data-price-sale`/`data-price`, mas não é a fórmula central atual; não remover por aparente falta de uso sem checar plugins.

## Quantidade, descontos, frete e arredondamento

- A quantidade WooCommerce começa em 1, min=1/step=1 (H1353–1365); é escondida pelo CSS crítico e movida para resumo. `getSelectedOptionsPrice` trata quantidade de pets/minis/acessórios, enquanto `updatePersonalizeCtaPrice` exibe total da configuração sem multiplicar por `quantity`. Drawer calcula/mostra valores fornecidos pelo backend.
- Hero contém preço anterior 99 e atual 79 no HTML; o JS guarda a razão 99/79 e projeta o comparativo sobre qualquer total. O texto comercial de economia não é uma regra de desconto aplicada no cliente. Não há aplicação local de cupom. Orçamento por volume abre página B2B, não fórmula local.
- JSON-LD, dataLayer e `gtmkit_product_data` usam 79 enquanto tipo base inicial é 59 (79 corresponde ao individual de 10 cm, mas o tamanho não vem selecionado). Esses metadados podem divergir do valor exibido.
- `mfPersonalizedConfig.shipping.thresholds` H7716 declara individual/pet 95, casal 129 e casamento 149. P7647 usa **95 fixo** na progressão de frete, independente do tipo. Alguns elementos de progresso nem estão presentes neste HTML. A cobrança real de frete por endereço/zona não é implementada localmente; somar urgência não prova frete grátis no checkout.
- Parcelamento é apenas valor visual `total / 3` em P7650; não comprova parcelamento ativo no gateway.
- `formatPrice` arredonda inteiro com `Math.round` + €; detalhado e parcelas usam duas casas com ponto; compacto troca para vírgula; comparativo usa `Intl.NumberFormat('es-ES', EUR)`. Decimal e moeda estão espalhados.
- Bases exclusivas e filtros por tipo/espécie tornam “somar todos os checked” incorreto. Vários cálculos checam visibilidade/disabled, mas acessórios especiais originais não fazem a mesma verificação de disabled dos clones: considerar apenas resultados de cenários válidos.

## Atualização visual e duplicação

`updatePersonalizeCtaPrice` P7644–7699 chama `syncDisplayedHeroPrices`, atualiza `data-mf-installment-price`, `data-mf-personalize-price`, `data-mf-summary-price`, botão final e barra fixa. `renderPriceBreakdown`/`getPriceBreakdown` P7374–7642 repetem regras para linhas do detalhamento. Os listeners P7789–7929 unem eventos do form, extraOptions, documento e `updated_addons`, além de timers; uma mudança de card pode disparar mais de uma atualização.

## Centralização futura recomendada

Criar `js/config/pricing.js` com moeda/locale e valores **em centavos**, versionados: tipos, tamanhos/multiplicadores, características por figura, catálogo de adicionais, pets, minis, bases, caixas/dedicatória, urgência e regras de frete. Conservar nesta primeira extração exatamente a tabela atual, incluindo 116 para três minis, sem inventar preço para família.

Separar função pura `calculatePrice(config, selection)` retornando itens + total e usar esse mesmo resultado para resumo/hero/barra. Um adaptador converte os atuais slugs e `data-*` para selection, mantendo names do POST até o backend estar pronto. **O servidor precisa recalcular e validar**; configuração cliente e hidden de preço não são autoridade para cobrança.

Antes de extrair: registrar testes de referência para cada tipo/tamanho, ambas figuras, caixa 6/10/15/20, dedicatória, pets por slot, três minis e urgência; comparar total e detalhamento. Definir explicitamente com o proprietário como resolver diferenças de preço promocional/frete/moeda em etapa comercial posterior. Trocar EUR por BRL não é apenas mudar o símbolo.
