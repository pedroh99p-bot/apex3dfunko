# Mapa de assets e procedência

## Escopo e quantidade

O projeto recebido contém **zero arquivos locais de imagem, vídeo ou fonte**: somente `index.html`. O inventário não baixou mídia para compor a identidade Apex.

| Medida | Quantidade / definição |
| --- | --- |
| Elementos `<img>` no HTML | 220, incluindo repetição, placeholders e elementos em noscript |
| Imagens src vazio | 2 (`data-mf-gift-upsell-modal-image`, `data-mf-added-drawer-image`); placeholders preenchidos por JS, não arquivos perdidos |
| SVGs embutidos no HTML | 268 ocorrências, com repetição; cada localização em INLINE-ASSETS |
| URLs de arquivos visuais/fontes | 276 únicas no HTML + CSS consultados + URLs literais do JS customizado; incluem variantes srcset, fontes e sprites de plugins |
| Data URIs nos CSS externos consultados | 2 únicas: SVG de interface e GIF Base64; conteúdo não copiado para docs |
| Linhas no inventário por URL | 278 (276 remotas + 2 inline); não são 278 fotos distintas |
| Vídeo externo | 1 vídeo YouTube (`Be9Oh053xd8`), com link e embed; contado separadamente das URLs de arquivo acima |
| Tags `<video>` / arquivos locais de vídeo | 0 / 0; há 1 iframe inicialmente vazio |
| Fontes de texto/ícones | Nunito, Poppins, Material Icons; GDPR também traz Nunito e fonte própria de ícones; binários/variantes no inventário |
| Materiais comprovadamente Apex fornecidos | 0; propriedade/licença dos visuais atuais não foi demonstrada |

Contagem obtida por parser HTML e leitura de URLs em atributos, srcset, metadados/JSON, `url(...)` CSS e literais JS. A contagem inclui duplicatas visuais em URLs diferentes e variantes que podem nunca ser requisitadas neste viewport. SVGs gerados pelos templates JS são adicionais dinâmicos, não somados às 268 ocorrências estáticas.

## Inventários completos

- [ASSET-INVENTORY](ASSET-INVENTORY.md): arquivo/URL, linhas e uso, finalidade, remoto/inline, situação de referência, marca/licença, substituição e possibilidade de guardar localmente.
- [INLINE-ASSETS](INLINE-ASSETS.md): cada um dos 268 SVGs e ocorrências de Material Icons com contexto e linha, sem copiar desenhos.
- [RESOURCE-INVENTORY](RESOURCE-INVENTORY.md): loaders de fontes, scripts/CSS e versões; CSS pode carregar imagens/fontes transitivas.
- `evidence/resource-check.json`: sondagem HEAD de 333 URLs de arquivos visuais + scripts; status, tipo e CORS, sem corpos de mídia. Ver VALIDATION para limites.

“Referenciado” significa uso no código, inclusive condicional. Não é prova de visibilidade, licença ou download. Com nenhum diretório de assets local, não há arquivo local órfão a mover ou apagar; uso morto de todas as variantes do servidor externo não pode ser determinado a partir desta página.

## Famílias e destino futuro

| Família / localização | Finalidade e situação | Marca/origem | Destino sugerido |
| --- | --- | --- | --- |
| Header/footer e favicon, H754–757/768+/7560 | Logo MiFunko e variações do ícone; carregados por URL | MiFunko; licença não fornecida | `assets/brand` somente com logo Apex autorizado |
| Galeria H914–1155 | Produtos individuais, casal, casamento e pets; muitas resoluções srcset | Portfólio MiFunko e pessoas fotografadas | `assets/products` / `assets/examples` após comprovar direitos ou substituir |
| Seletor H1260–1342 | Quatro modelos ilustrados | MiFunko | `assets/products` com imagens próprias de cada modalidade |
| Ícones de rosto/pele/roupa/pets/minis/bases/caixa | Ilustram campos e opções, alguns SVGs inline e imagens em URL | MiFunko/terceiros, incluindo referência à marca Funko | `assets/ui`/`assets/products`, com licença identificada |
| Catálogo especial H3036–4498 | 35 acessórios e variantes/contextos por espécie/tipo | MiFunko/terceiros | `assets/products` após validar propriedade |
| Comparativo de tamanho H4680+ | Imagem estática e lightbox, não simulação 3D | MiFunko | `assets/examples` ou `assets/ui`, recriar com catálogo real Apex na fase visual |
| Avaliações H1442+/6800+ | Fotos/avatares, logotipos Revi/Trustpilot/Google e prova social | Clientes/serviços da marca de origem | Substituir por prova real autorizada; não transportar depoimentos como Apex |
| Processo H7004–7108 | Nove etapas de fabricação e variantes de imagem | MiFunko | `assets/examples`, somente processo real/documentado Apex |
| Trabalhos H7254–7325 | Galeria de exemplos | MiFunko | `assets/examples` com autorização ou portfólio próprio |
| Backgrounds/sprites CSS | Texturas, símbolos e sprites de jQuery UI/GDPR; alguns data URIs | Bibliotecas/plugins; condições específicas não fornecidas no projeto | `assets/backgrounds`/`assets/ui` após verificar distribuição/licença |
| Fontes | Google Fonts e fontes GDPR | Terceiros; licença precisa ser guardada por família/arquivo | `assets/ui/fonts` se houver licença que permita hospedar; nenhuma cópia nesta etapa |
| Fotos do configurador | Conteúdo futuro enviado pelo cliente; não é asset estático de marca | Usuário/cliente | Armazenamento privado de uploads a definir com backend; **não colocar em assets públicos** |

### Vídeo e recursos dinâmicos

Vídeo V001: link [YouTube](https://youtu.be/Be9Oh053xd8), H7583/H7605; embed `https://www.youtube.com/embed/Be9Oh053xd8?autoplay=1&rel=0`, `video-modal.js:9`. Marca MiFunko, licença não comprovada, uso condicionado ao clique. Candidato a substituição por vídeo próprio; armazenamento local apenas com arquivo/autorização, não copiar automaticamente do YouTube.

P5612 referencia `https://mifunko.com/new/wp-content/uploads/2026/05/icon-caja-individual.webp` para lembrete de caixa. Retornou **404** na sondagem e falhou por ORB no navegador ao abrir modal. Não está no HTML estático, mas integra ASSET-INVENTORY.

Imagens de itens/edição do carrinho vêm de respostas do backend e URLs em `mf_edit_config`; sua quantidade/URLs não podem ser enumeradas sem uma sessão/pedido autorizado. Previews novos usam `blob:` efêmero; desenhos inline também são inseridos por `createMiniUnitBlock`, builders, modais e editor. Nenhuma foto de cliente foi persistida na documentação.

## Situação de origem/licença

Não foi fornecido LICENSE, contrato de cessão, comprovante de autoria ou material de marca Apex. Cada asset remoto está marcado como terceiro/MiFunko e **licença a verificar**. A presença de uma URL pública não autoriza reuso. Assets de Google Fonts/jQuery UI/GDPR precisam de identificação da versão/licença correspondente, sem presumir que todo o tema compartilha a mesma licença.

Não mover os arquivos por “organização” nem substituir URLs indiscriminadamente. A única cópia versionada da marca original permanece no HTML do baseline solicitado; nenhum arquivo proprietário de mídia/tema foi acrescentado ao repositório. Cópias temporárias de JS/CSS serviram apenas para auditoria, fora do workspace; no Git entram só referências, hashes e documentação original.

## Organização futura preparada

```text
assets/
  brand/        # logo, favicon, marca Apex autorizados
  products/     # catálogo próprio e opções ilustradas
  examples/     # exemplos/processo com autorização
  backgrounds/  # texturas e fundos próprios/licenciados
  ui/           # ícones, fontes e licenças correspondentes
```

Pastas propostas, sem mover caminhos atuais ou preenchê-las com material MiFunko. Quando houver materiais do proprietário, registrar por arquivo: autor/origem, titular, licença/termo e localização do comprovante, autorização de imagem de pessoas quando pertinente, finalidade, substitui qual ID Axxx/V001 e onde é utilizado. O repositório não deve publicar comprovantes privados; registrar referência segura. Primeiro adicionar o asset autorizado e verificar dimensões/caminhos; depois trocar uma referência por vez com QA.
