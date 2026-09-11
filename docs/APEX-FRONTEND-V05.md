# Apex3D — frontend comercial V0.5

## Direção e escopo

Transformar referências pessoais em uma Miniatura 3D Personalizada. Público: pessoas presenteando a si, casais, famílias e tutores de pets. Ação principal: Criar minha miniatura. Prova disponível: logo enviada pelo proprietário; nenhum portfólio ou depoimento autorizado foi fornecido. Página em HTML/CSS/JS vanilla, preservando cálculo, validação e recibos de uploads.

Não há associação a produto oficial Funko. A promessa de processo é “Você aprova o modelo antes da produção”; a ferramenta de aprovação ainda não existe nesta versão.

## Identidade e assets

- Superfície branca, grafite, cinzas e vermelho de ação #cc1233, escolhido visualmente da família de vermelhos da logo, escurecido para legibilidade do botão branco.
- Tokens em css/tokens.css; tipografia de sistema Segoe UI/Arial, sem fontes remotas.
- Logo original intacta em assets/brand/apex-logo.webp, 1536 × 1024; navbar, footer e OpenGraph local. Proporção preservada, sem corte, recriação ou edição.
- Fonte autorizada pelo proprietário: https://res.cloudinary.com/dhbrxzt5a/image/upload/v1786751962/ChatGPT_Image_Aug_14_2026_08_39_25_PM_1_yz9ejr.webp.
- A logo só foi baixada na implementação. Não existe dependência Cloudinary em runtime.
- Hero e cards usam placeholders neutros feitos em CSS local, explicitamente ilustrativos. Slots de exemplos aguardam fotos reais. Nenhuma avaliação, venda ou portfólio foi inventado.
- Favicon próprio ficou para etapa posterior: reduzir a composição completa comprometeria a leitura. Não foi redesenhado.
- Staging permanece noindex. OG usa caminho local; URL absoluta/canonical dependem do domínio de staging/produção que ainda não foi fornecido.

## Oferta e preços de homologação

Fonte única: config/pricing.js; moeda BRL, locale pt-BR, valores inteiros em centavos. calculatePrice(state) recalcula o total; nenhum input ou HTML determina preços.

| Produto/adicional | Centavos | Valor |
| --- | ---: | ---: |
| Individual | 19700 | R$197 |
| Pet | 15700 | R$157 |
| Casal | 34700 | R$347 |
| Família, 3 pessoas | 47700 | R$477 |
| Pessoa adicional | 13000 | R$130 |
| Pet adicional | 7900 | R$79 |
| Acessório simples | 1900 | R$19 |
| Acessório detalhado | 3900 | R$39 |
| Nome na base | 1900 | R$19 |
| Nome + data na base | 2900 | R$29 |
| Caixa personalizada | 3900 | R$39 |
| Objeto especial simples / detalhado | 1900 / 3900 | R$19 / R$39 |

Objetos especiais usam specialObjectCategories, com as mesmas faixas de acessórios aprovadas no briefing como enquadramento inicial de homologação. A categoria e a viabilidade final serão revisadas antes de produção; não há tabela arbitrária em HTML.

A oferta utiliza apenas o tamanho-base herdado de 6 cm, sem inventar novos acréscimos. Pets adicionais mantêm 4 cm. Dimensões físicas, caixas para composições e limites precisam de homologação do proprietário. Até 3 pessoas adicionais em produtos humanos (até 6 na Família); até 3 pets adicionais. Até 5 acessórios de cada categoria por pessoa/pet principal. Sem urgência paga, promessa de frete grátis ou parcelamento.

Minis independentes, caneca e outras medidas continuam representáveis pela arquitetura histórica, mas não estão à venda: faltam preços e regras Apex aprovados. Pessoa adicional usa uma figura completa, com seus próprios detalhes e recibos. Base sem gravação e embalagem padrão inclusas. Dedicatória textual opcional integra a caixa personalizada, sem novo acréscimo.

## Jornada e validação

Produto → fotos → roupa/pose → adicionais opcionais → base/embalagem → data → observações → preço → revisão → pedido de teste.

A seleção de Individual/Casal/Família cria uma, duas ou três figuras. Aparência vem da foto (referenceMode: photo); não se preenchem valores fictícios de cabelo ou pele. Compatibilidade interna mantém olhos/boca padrão sem cobrar características visíveis. Roupa e pose seguem a referência ou recebem descrição obrigatória quando personalizadas; foto da roupa é opcional.

Os adicionais são revelados em “Deixe sua miniatura ainda mais única”. Pessoas adicionais ganham campos nas etapas de fotos e personalização. Pets adicionais exigem tipo e foto própria. Acessório simples/detalhado e objeto exigem descrição ou referência. Nome na base exige texto; nome + data também exige data válida para gravação (pode ser histórica). Caixa exige nome; dedicatória é opcional.

A data necessária continua obrigatória, hoje ou futura, sem urgência automática. Texto: “Confirmaremos a disponibilidade da data após o pedido.”

validateOrderForProduction preserva {valid, errors:[{field,code,message}]}. Confere composição, opções, dados necessários, preços recalculados, estado coerente e uploads ativos com recibo. Receipts verificam nome, MIME, bytes e owner sem expor File. JPEG/PNG/WebP/GIF até 10 MB por arquivo, assinatura e decodificação real no navegador; quantidade máxima configurável.

Trocar produto limpa fotos e customizações. Remover pessoa/pet/acessório/roupa personalizada limpa os anexos incompatíveis e revoga seus URLs/recibos. Operações assíncronas anteriores são canceladas por revisão da composição. Arquivo inválido bloqueia revisão até substituição válida ou descarte explícito; foto válida anterior é preservada.

Revisão acessível em dialog nativo, focada no título, botão de fechar, Escape e edição; total no início, fotos e detalhes por item, preço base/adicionais/total, frete e data sujeitos a confirmação. Conteúdo do usuário entra por textContent. Ao editar, o draft é invalidado; gerar revalida e verifica se a revisão está atualizada.

Draft schemaVersion 2, mode homologation. “Gerar pedido de teste” apenas cria dados em memória. Confirmação informa que nada foi enviado/pago. Sem exportar binários, dados pessoais em console, POST, storage, backend ou SDK de pagamento.

## Página e dependências

Navbar desktop/mobile; hero Foto → Modelo → Miniatura; processo em três passos; quatro produtos; configurador; slots para exemplos; benefícios; FAQ; footer. HTML comercial próprio, sem montar o index histórico.

Zero dependências externas em runtime, inclusive CSS, fonte e imagem. CSP bloqueia conexão, scripts externos, frames e envio de formulário. Relatório: [APEX-DEPENDENCIES](APEX-DEPENDENCIES.md).

## Execução e staging

npm run dev serve dev.html em localhost:4173 e redireciona /index.html. O original não é servido como template.

npm run build gera dist/index.html a partir de dev.html e copia uma lista explícita de arquivos públicos. O build verifica o destino dentro deste workspace antes de recriar dist; não altera o index original. Publicar exclusivamente dist. CSP também está no HTML para hospedagem estática; _headers oferece cabeçalhos adicionais a hosts compatíveis. Push da branch não equivale a deploy.

## Validação

- npm test: 23 testes do núcleo.
- npm run test:smoke: 13 cenários de apresentação + 22 de fluxo = 35 cenários de navegador.
- Ofertas BRL, Família e pessoa adicional, pet, acessórios, objeto, bases, caixa, combinação de R$571; revisão, draft, datas, troca de produto e limpeza; assinatura/bytes/MIME, decodificação, homônimos, recibos, bloqueio/recuperação, revisão desatualizada e texto sem injeção HTML.
- 1440, 1024, 768, 430, 390 e 360 px; sem overflow em página e dialog. Teclado, FAQ e foco verificados.
- Screenshots landing/config/upsells/review em test-results/apex-*.png, ignoradas no Git. Revisão visual desktop/mobile.
- Nenhuma exceção JS, chamada externa, chamada transacional ou JS de concorrente observado pelos testes. Interceptação bloqueia tentativas antes de chegarem à rede.
- Hash do index original preservado: 327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb.

## Limites e próximos passos

1. Homologar catálogo, dimensões, preços, categorias de objetos, capacidade física e embalagem de composições.
2. Fornecer portfólio/fotos autorizados e favicon. Não há prova social disponível para substituir placeholders.
3. Escolher domínio/host e publicar dist em staging; testar a URL pública e os cabeçalhos daquele host.
4. Definir regras de prazo, ajustes, entrega e privacidade antes da produção comercial.
5. Backend/storage/pagamento/Asaas/autenticação/admin dependem de próxima etapa explícita. A validação do navegador é proteção de UX, não autorização ou validação de servidor.

Branch: feat/apex-frontend-v05. Origin esperado: https://github.com/pedroh99p-bot/apex3dpersonalizados. Sem merge em main, alteração de baseline ou operações em BW Fitness.
