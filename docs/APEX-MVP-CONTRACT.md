# Contrato do MVP Apex — etapa 3

O MVP é um configurador local de um pedido personalizado por fluxo. A interface de trabalho é `dev.html`, servida por `npm run dev`. Não há carrinho WooCommerce, transação, autenticação, backend, pagamento ou envio externo. O `index.html` original permanece intacto.

## Fluxo

Produto → configuração → fotos → personalização → data necessária → preço → revisão → geração do rascunho Apex.

O botão **Revisar pedido** valida a configuração antes de abrir a revisão. O cliente pode voltar e editar. **Gerar rascunho do pedido** valida novamente e cria `orderDraft` em memória. A confirmação informa que nenhum envio ou pagamento foi realizado. Qualquer mudança posterior invalida o rascunho e exige nova revisão.

Uma caneca opcional integra o mesmo pedido. Não há mini-cart, múltiplas canecas independentes ou gerenciamento de itens de carrinho. O objeto continua preparado para itens, sem introduzir essas interfaces agora.

## Campos e regras do MVP

| Campo | Regra |
| --- | --- |
| Produto | Individual, animal, casal ou casamento. Produto ativo deve existir na configuração. Trocar produto reinicia o fluxo e elimina os anexos anteriores. |
| Quantidade/tamanho | Quantidade inteira positiva; tamanho válido da tabela atual. Seleções padrão visíveis, como 6 cm, são válidas; campos ausentes/fora da tabela não são. |
| Pessoas | Individual: uma; casal/casamento: duas; produto animal: nenhuma pessoa. IDs e fotos separados por pessoa. |
| Cabelo/pele/olhos/boca/óculos | Cabelo e pele precisam de escolha explícita; olhos e boca podem manter o padrão visível, óculos opcionais. Cor personalizada de cabelo deve ser válida. |
| Referência humana | Pelo menos uma foto de rosto por pessoa. Roupa exige descrição ou foto de referência própria. Texto e foto podem coexistir. |
| Animal principal | Tipo selecionado, tamanho, olhos válidos e pelo menos uma foto do animal. Raça é texto opcional. Cor de olhos personalizada deve ser válida. |
| Animais adicionais | De zero a três; tipo/tamanho válidos e pelo menos uma foto por animal. Raça livre opcional. |
| Minis | Quantidade/tamanho da oferta atual; descrição da aparência/roupa e foto por mini. Não há seletores complexos de partes. |
| Acessórios/logótipos comuns | Até cinco por categoria e figura; descrição ou foto por unidade escolhida. |
| Especiais | Catálogo de 35 opções já precificadas; fotos/textos adicionais pertencem ao especial selecionado. Orçamento “Outro” não integra o MVP. |
| Caixa | Opção válida para produto/tamanho. A 20 cm, sem caixa; casal/casamento não aceitam caixa individual. Caixa paga exige nome, coleção, número de até quatro dígitos e cor válida. |
| Dedicatória | Só com caixa paga; texto ou imagem obrigatórios quando selecionada. |
| Bases | Uma base personalizada paga por vez; nome/nome+data exigem texto. |
| Caneca | Origem da imagem: esboço da figura ou imagem própria validada. Imagem própria obrigatória quando escolhida. Texto opcional. Pode remover a caneca do pedido sem recriar um carrinho. |
| Data necessária | Campo **Quando você precisa receber?**, obrigatório, data real, hoje ou futura no calendário local do navegador. Sem bloqueio de fim de semana, plugin ou alteração automática de preço. |
| Prazo | Opção explícita já mapeada; os acréscimos existentes permanecem. A data desejada não seleciona nem altera a urgência. |
| Observações | Texto opcional, preservado no rascunho e mostrado na revisão. |

As regras de prazo futuras estão em `config/mvp.js`: obrigatoriedade, dias mínimos e dias da semana excluídos. Hoje o mínimo adicional é zero e não há dias excluídos. Datas anteriores a hoje são sempre inválidas. A necessidade informada **não é promessa de entrega**; o resumo informa que a disponibilidade será confirmada posteriormente.

O pricing continua em centavos de EUR, sem mudança de oferta ou conversão para BRL. O pedido distingue preço unitário, quantidade, subtotal principal, caneca e subtotal total. Frete final permanece `null`, sem novo preço inventado.

## Fotos e editor

O MVP mantém seleção múltipla onde aplicável, preview da imagem original e remoção. Não transforma, gira, recorta ou regrava arquivos. Nenhum arquivo original é alterado silenciosamente. Edição não é necessária para o fluxo de referência e fica fora desta entrega.

São aceitos JPEG, PNG, WebP e GIF, até 10.000.000 bytes por arquivo. A seleção valida MIME, tamanho, assinatura e decodificação no navegador. Arquivos inválidos não substituem os anteriores. A pessoa pode tentar novamente ou descartar a seleção inválida. Enquanto um arquivo estiver sendo validado ou existir um erro de seleção não resolvido, a finalização é bloqueada.

Cada arquivo tem ID próprio e destino `owner: { itemId, field }`. Files e previews Blob ficam em memória. Um recibo interno criado pelo UploadStore comprova que o arquivo passou pelo validador e continua disponível com aquele ID/tipo/tamanho/nome/destino. Alterar metadados ou reutilizar o ID de outra pessoa/pet não fabrica um recibo válido. Não há envio de arquivo ou Base64 no estado do pedido.

Uploads de opções retiradas são removidos/revogados; fotos preparadas para uma caneca ainda não adicionada ficam fora do pedido. A foto da caneca entra exclusivamente em `gift-1`; a opção esboço referencia `main-1`. Fechar/recarregar a página perde o pedido em memória.

## Validação e geração

`validateOrderForProduction(orderState)` é síncrona, independente do DOM, e retorna:

```js
{
  valid: false,
  errors: [{
    field: 'figure-1.mf_face_photo_upload[]',
    code: 'PHOTO_REQUIRED',
    message: 'Envie pelo menos uma foto de referência da pessoa 1.'
  }]
}
```

Verifica produto/tamanho/quantidade, estrutura de pessoas e pets, escolhas obrigatórias, fotos por destino, metadados/recibos de arquivos, opções ativas, duplicidades, dados da caixa/bases/minis, data e preço recalculado. Um preço armazenado divergente também bloqueia. Códigos e campos permitem exibir erros com botões que levam ao campo correspondente; não há mensagens de validação espalhadas como fonte de verdade pelo HTML.

`createOrderDraft(state)` usa essa validação. Em falha retorna `{valid: false, errors, orderDraft: null}`. Em sucesso retorna o objeto normalizado com ID, data de criação, `mode: development`, `status: draft`, `productionValidation: passed`, `customer: null`, itens, personalizações, referências de upload, prazo/data, preço e observações.

`buildOrder` permanece como serializador da fundação e não equivale à finalização aprovada. A interface final sempre passa por `createOrderDraft`. Nenhum desses métodos envia dados.

Na UI há duas verificações adicionais: uploads pendentes/erros de seleção e revisão ainda correspondente à versão atual do estado. Se a configuração mudar durante a revisão, a geração é bloqueada com `REVIEW_STALE`. `orderDraft` é invalidado por qualquer edição ou troca de produto.

## Revisão e inspeção

A revisão mostra nomes compreensíveis de produto/opções, tamanho, pessoas/pets/minis, roupa e características, acessórios, caixa/bases/caneca, quantidade de fotos, data necessária, observações, preços e avisos de prazo/frete. Os textos são inseridos via `textContent`, sem executar HTML digitado pelo usuário. O diálogo abre no início da revisão, suporta teclado e adapta-se ao mobile.

A confirmação separa o resultado visual da inspeção técnica, recolhida em **Inspeção de desenvolvimento**. `window.apexDevelopment.inspectDraft()` retorna apenas uma representação segura do rascunho gerado, ou `null` quando não há rascunho atual. `inspect()` continua mostrando o estado comercial resumido; `validate()` permite inspecionar erros estruturados. Não expõem Files, nomes de arquivos ou textos pessoais. Não há impressão de dados do usuário no console.

## Módulos

| Módulo | Responsabilidade |
| --- | --- |
| config/mvp.js | Regras mínimas de opções e calendário |
| js/date.js | Datas locais, mínimo configurável, validação e apresentação |
| js/validation.js | validateOrderForProduction e erros estruturados |
| js/uploads.js | Arquivos em memória, validação real, recibos e revogação |
| js/state.js / pricing.js | Estado simples e cálculo com preços preservados |
| js/order.js | Serialização, criação de orderDraft validado e inspeção segura |
| js/review.js | Revisão orientada ao cliente, sem detalhes técnicos |
| js/ui.js | Campos, seleção, foco dos erros, revisão e confirmação local |
| js/template.js | Montagem sem scripts remotos e exclusão dos controles de carrinho/legado fora do MVP |

## Removido e adiado

**REMOVE:** carrinho/drawer WooCommerce, edição e atualização remota, restauração de sessão antiga, nonces/AJAX/Store API, gateway e contas de analytics da MiFunko. O snapshot original não é destruído; os scripts continuam descartados e os controles de carrinho são retirados da cópia usada no laboratório.

**LATER:** múltiplos itens/canecas, persistência própria, orçamento fora do catálogo, filtros avançados, rotação/crop/zoom/reset de edição/desenho, drag-and-drop, vídeo/animações, backend próprio, frete real e pagamento. Conteúdo de prova social permanece estático, sem seus controles inativos de carrossel. As seleções de cores do produto e seus resets são locais; não são edição de arquivo de imagem.

Não há dependência funcional de `product-personalized.js` nem de outro JS remoto no fluxo definido aqui. CSS, fontes, imagens, ícones e markup ainda são herdados. O teste completo com toda a rede externa bloqueada comprova a independência da lógica; a aparência fica degradada sem os recursos visuais. Nenhum asset remoto foi baixado para o repositório.

## Verificação

`npm test` executa os testes do núcleo e produção. `npm run test:smoke` executa os cenários da fundação e do MVP em Edge/Playwright, com interceptação preventiva de chamadas transacionais e JavaScript externo. O segundo smoke cobre pedidos válidos/inválidos, revisão, invalidação, caneca, casal, pet, fluxo completo sem rede externa e larguras 1440/768/390. Resultados e screenshots sintéticos ficam em `test-results/`, ignorado no Git.

Resultado em 11/09/2026: **17 testes do núcleo/produção + 21 cenários de navegador aprovados**. Zero exceções JavaScript e zero tentativas de POST/checkout/JS externo nos cenários monitorados. O pedido com acessório, mini, animal adicional e caixa personalizada também passou, com preço preservado de €143 no cenário testado.

Problemas encontrados durante a implementação foram corrigidos: referências dos campos hidden de tipo/tamanho do animal adicional estavam fora do slot visual; inputs de raça e detalhes de acessórios estavam atrás de wrappers legados; cor personalizada da caixa precisava de seleção local explícita; autofocus do diálogo levava ao fim da revisão. O hash do index continua `327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb`.

Esta validação atende ao contrato local do MVP; não substitui uma futura revisão humana de viabilidade de fabricação, frete ou prazo, nem validação em servidor quando existir backend.
