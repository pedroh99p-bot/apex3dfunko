# Apex3D Original Shell V1

## Resultado

O shell comercial foi portado diretamente do baseline `175babe2df4ffa416f6feae680019600689c72a7`, tag `baseline-original-2026-09-11`. A branch `feat/apex-original-shell-v1` nasceu desse commit. O inventário das 36 regiões foi registrado antes da edição, no commit `c7a4867`.

O motor funcional veio da V0.6, commit `5fab9b5a213a55c3be72dbd2af9d042df9cb699b`. Não foram transplantados layout, CSS ou wizard visual da V0.5/V0.6. `dev.html` conserva a árvore e as classes do original; `css/original/` guarda seus 32 estilos estruturais. `css/apex-shell.css` contém marca, estados funcionais, revisão e correções de geometria.

## Paridade visual

Todas as 36 regiões do contrato permanecem no documento: header, hero, seletor de produtos, sketch, B2B, carrossel curto de depoimentos, configurador e seus painéis, caixa, entrega, notas, caneca, resumo, prova social, depoimentos, processo, FAQ, trabalhos, confiança, modal, drawer, barra fixa e footer.

- Hero: 23 slides e 23 miniaturas; mídia à esquerda, oferta à direita, mesma proporção 0,88/1,12 e gap de 45 px no desktop.
- Produtos: quatro cards originais. Individual, Pet, Casal e Família. O card de Família conserva a imagem original de casal/casamento como referência provisória; precisa de foto/render próprio de três pessoas antes da oferta definitiva.
- Configurador: mesmos painéis, ícones, acordeões, grids, imagens de opções, estados e navegação. Rosto, roupa e acessórios são instanciados por pessoa a partir dos próprios templates originais. Os painéis de outro tipo de produto permanecem em um template inerte e voltam ao trocar a composição.
- Objetos: os 35 itens originais e suas imagens estão acessíveis por “Ver mais”; duas categorias genéricas de simulação complementam o catálogo, sem substituir seus itens.
- Processo: nove cards. Trabalhos: 22 imagens. FAQ: sete itens. Depoimentos: quatro slides pequenos e quatro cards completos, com avatares e texto de staging.
- As amostras de cabelo, pele, olhos e boca continuam visuais, sem seleção obrigatória. A produção é guiada por fotos próprias de cada pessoa/pet.

O teste estrutural exige contagem exata de imagens e SVGs por região. Exceções específicas: nove SVGs de bandeiras/idiomas removidos do header e dois selos externos de plataformas de avaliação. Nenhum ícone de produto, processo ou configurador foi eliminado. Quatro câmeras com aspas tipográficas inválidas e quatro paths de estrelas danificados no HTML capturado foram corrigidos, preservando o propósito e a contagem.

Os containers medidos têm geometria idêntica ao baseline em 390/1440 px: no desktop, hero 1320 px, colunas 561/714 px, processo em três colunas e galeria em quatro; no mobile, conteúdo 370 px e galeria em duas colunas. A altura total muda com copy, controles ativos e avisos, portanto não se declara identidade de pixels.

## Motor e contrato do pedido

Reutilizados: `state`, `pricing`, `uploads`, `date`, `validation`, `review`, `orderDraft`. O adaptador `shell-controller.js` conecta os controles originais; `shell-interactions.js` implementa galerias, menu, FAQ, comparador de tamanhos, drawer e modal sem engine legado.

O estado diferencia produto, tamanho, pessoas adicionais, fotos por pessoa, roupa, pose, óculos, pets, acessórios simples/detalhados, objetos, base, caixa, dedicatória, data, flexibilidade e observações. Selecionar outro produto limpa anexos e configurações. Remover um adicional remove seus anexos e invalida o rascunho.

Uploads são `File` reais em memória, com MIME, tamanho, assinatura e decodificação da imagem. Recibos identificam dono e campo; nomes iguais não confundem fotos. Entradas inválidas bloqueiam a revisão até descarte; alterações durante a revisão obrigam nova conferência. URLs blob são revogadas na remoção. Nenhuma foto é enviada ou salva em storage remoto/localStorage.

A revisão apresenta referências, textos, composição, extras e valores. O rascunho é `schemaVersion: 2`, `mode: homologation`, `productionValidation: passed` e `productionReady: false`. A inspeção pública omite nomes de arquivos e textos livres. Não existe backend, banco, pedido comercial, Asaas, pagamento ou integração de checkout.

## Preços provisórios — PRICING_REVIEW_REQUIRED

A orientação específica do usuário para placeholders por tamanho foi mantida durante o port: 6 cm R$100, 10 cm R$150, 15 cm R$170, 20 cm R$200 por miniatura. A tabela repetida no novo briefing (197/157/347/477 e adicionais 130/19/39) diverge dessa orientação; a confirmação foi solicitada e não houve nova definição até esta entrega. Nenhuma das duas é tratada como tabela comercial homologada.

| Item | Simulação usada |
| --- | --- |
| Individual / Pet | Uma unidade por tamanho |
| Casal / Família | Duas / três unidades por tamanho |
| Pessoa adicional | Uma unidade no tamanho escolhido; até três adicionais |
| Pet adicional | R$79 por pet, 4 cm; até três |
| Acessório simples / detalhado | R$15 / R$20; até cinco de cada por pessoa/pet |
| 35 objetos originais | R$15 ou R$20, explicitamente provisórios |
| Nome / nome + data na base | R$19 / R$29 |
| Caixa personalizada | R$39; compatibilidade com cada tamanho ainda em revisão |
| Frete e prazo | A confirmar; sem urgência automática |

Valores internos são centavos inteiros. O HTML não é fonte do cálculo. Minis, caneca, ímãs, proteção, base de grama, caixa dupla e envio expresso preservam apresentação, mas ficam indisponíveis ou identificados para revisão. Não se promete produção, desconto, item grátis, avaliação real ou data de entrega herdados da marca original.

## Runtime e build

O arquivo original `index.html` continua imutável e fora de `dist`. O build publica `dev.html` como `dist/index.html`, módulos Apex e o manifesto explícito de mídia/CSS. Os recursos necessários são locais: 235 imagens, 32 CSS originais, 11 fontes e dois CSS de fontes, além da marca Apex e avatar de staging.

Foram removidos scripts inline/externos legados, WooCommerce/Store API, AJAX, nonces, URLs de carrinho/checkout, autenticação, pixels, cookies ligados a rastreamento e embeds remotos. As classes `mf-*`, atributos de controles e alguns nomes históricos são contratos locais de apresentação, sem runtime ou APIs correspondentes. A CSP bloqueia conexões, formulários externos, frames e scripts fora da origem.

O modal de vídeo original conserva o contêiner e direciona às etapas locais: não há vídeo Apex homologado. O drawer representa somente a criação da sessão, permitindo revisar e descartar.

## Validação e evidências

- `npm test`: 24 testes aprovados.
- `npm run test:smoke`: 22 cenários do fluxo MVP e 51 do shell original, total 73.
- `npm run test:smoke:build`: os mesmos 73 cenários sobre `dist`.
- `npm run test:structure`: 36 regiões, ordem, imagens/SVGs, 35 objetos e 280 arquivos verificados por hash.
- Quatro produtos com painéis abertos em 360/390/430/768/1024/1440: sem overflow. Combinação completa de extras e modal de revisão também passa nesses seis tamanhos.
- Sem exceções JS, 404s de recursos, requisições externas ou chamadas transacionais nos testes.

Correções mobile atuam na origem: tracks de galeria com largura de grid limitada e scroll próprio, botões do carrossel dentro do conteúdo, min-width de acessórios/upload e cards com quebra de texto. Não se usa `overflow-x: hidden` no root para mascarar defeitos. A barra inferior exibe preço e revisão; menu, swipe, lightbox e teclado foram testados.

Screenshots em `test-results/original-shell/source/` e `build/`: página completa 1440/390, hero, produtos, processo, galeria, configurador, tamanho, extras, entrega, depoimentos, FAQ e sticky mobile. Comparação original segura em `baseline-1440.png` / `baseline-390.png`, sem executar seu motor. Geometria registrada em `docs/evidence/original-shell-geometry.json`.

## Git e promoção

O repositório remoto não tinha `main`; a branch padrão existente era `feat/apex-frontend-v05`, em `353fb44a455cdd80a828cce648126463bf5694f0`. Antes de trabalhar, foram criados e enviados `archive/pre-original-shell` e a tag `backup-main-before-original-shell-2026-09-12` nesse commit. As branches e tags anteriores permanecem recuperáveis.

A estratégia de promoção cria `main` a partir desse histórico e grava um commit com a árvore aprovada de `feat/apex-original-shell-v1`, seguido de testes e push normal. Não há force push. O hash final e o resultado remoto/deploy são informados no relatório da entrega. A configuração da Vercel usa `npm run build` e saída `dist`; uma branch nova pode gerar apenas preview se a produção ainda estiver configurada para V0.5.

## Antes da próxima etapa

Homologar tabela comercial única, compatibilidade de tamanhos/caixa, catálogo executável, inclusos, frete e prazos; revisar direitos de mídia/fontes e imagens com marcas visíveis; substituir a referência de Família; produzir portfólio, depoimentos e vídeo próprios; definir contato comercial. A revisão de origem não bloqueou este staging, conforme autorização do usuário. Backend e pagamento não foram iniciados.
