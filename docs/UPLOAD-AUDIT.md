# Auditoria de uploads

## Resultado

As fotos do configurador ficam **na memória do navegador até adicionar ao carrinho**. O cliente prepara envio multipart com arquivos reais; não é apenas uma simulação de preview. Entretanto, o repositório não contém o backend que recebe/processa esse envio. No upsell, a foto é exigida na interface mas **não é transportada pelo código de envio**. Fotos novas se perdem ao recarregar a página, comportamento reproduzido no smoke test.

Evidência: index (`H`), `product-personalized.js` (`P`, carregado em H7719) e `image-annotator.js` (`I`, H7732), consultados em 11/09/2026. Hashes em `evidence/remote-manifest.json`. Não foram enviados arquivos de teste à MiFunko.

## Quantidade e tipos de campo

O HTML contém **46 inputs de arquivo**: oito com `multiple` e 38 sem. Isso não significa limite de 46 fotos, pois campos são condicionais e JS cria outros. Não foi encontrado teto global de fotos no núcleo/editor consultados.

| Uso | Campo / referência | Quantidade/condição |
| --- | --- | --- |
| Rosto | `mf_face_photo_upload[]`, `#mf-face-photo-upload`, H1759 | Múltiplas; ao menos uma exigida para figura humana |
| Óculos | `mf_face_glasses_upload`, H1899 | Uma; opcional, toggle habilita área |
| Roupa | `mf_outfit_photo_upload[]`, H2359 | Múltiplas; ao menos uma exigida por figura humana |
| Pets adicionais | `mf_pet_1/2/3_photo[]`, H2601/2734/2867 | Múltiplas por slot; até três pets; cada pet selecionado exige referência conforme validação ativa |
| Foto extra de acessório especial | 35 `mf_special_accessory_extra_photo_<slug>`, H3420–4462 | Uma por campo, exibido conforme seleção; não confundir com uploads dinâmicos adicionais do acessório |
| Outro acessório | `mf_special_other_photo[]`, H4495 | Múltiplas, condicional |
| Pet principal | `mf_pet_photo[]`, H5053 | Múltiplas; foto obrigatória no tipo mascota |
| Olhos pet | `mf_pet_eyes_photo[]`, H5242 | Múltiplas, condicional |
| Dedicatória da caixa | `mf_box_dedication_image`, H6360 | Uma, opcional, inicialmente disabled; habilitada pela personalização |
| Presente upsell | `.mf-gift-upsell-modal__upload-input`, H6608 | Uma; sem `name` e sem associação ao form principal; não enviada pelo handler atual |
| Segunda figura | Clones com `mf_partner_2_face_photo_upload[]`, roupa, óculos e acessórios | Herdam campos e múltiplos da origem; `renameCoupleCloneFields` P1236–1259 |
| Acessórios/logos dinâmicos | `buildSpecialAccessoryUploadField`, `createScopedUploadField`, `renderScopedUploadFields` | Slots acompanham quantidade/catálogo por figura; nomes gerados e `form` explícito |
| Minis dinâmicos | `mf_mini_unit_photo_1..3` | Uma opcional por mini, P3210–3255; sem `multiple` |

Os campos completos, incluindo os 35 slugs, estão em [FORM-FIELDS](FORM-FIELDS.md). Não há regra universal de “máximo N fotos”; a capacidade por interação depende de multiple, criação de slots, memória e limites desconhecidos do servidor.

## Formatos, tamanho e validação

- Todos os 46 campos estáticos declaram `accept="image/*"`; campos dinâmicos também usam imagem. Isso é filtro do seletor, não validação de conteúdo ou segurança.
- O texto promete “Máx. 10 MB”, mas **não há verificação de `File.size`/10×1024²** em P ou I consultados. Não se pode afirmar que o limite é aplicado. Limites PHP, `post_max_size`, `upload_max_filesize`, quantidade de arquivos e allowlist do servidor não foram fornecidos.
- O editor I32–49 só processa arquivos cujo MIME começa com `image/` e exclui SVG do editor. **SVG não é rejeitado pelo upload**: fica fora da edição, ainda pode permanecer no input. Não há inspeção de assinatura/magic bytes no código lido.
- JPEG/PNG/WebP e outros formatos decodificáveis pelo navegador podem abrir; compatibilidade HEIC/AVIF e animações varia e não foi certificada. Arquivo que não decodifica sai do editor com resultado nulo; isso não é garantia de rejeição pelo formulário.
- `inputHasFile` P183 aceita FileList não vazia **ou** `data-mf-has-existing=1`. `validateRequiredFields` P5435–5582 verifica presença e seleção, não conteúdo/tamanho das fotos.
- Textos citam arrastar, mas não foram encontrados handlers `drop`/`dragover` dedicados em P/I. Seletor nativo funciona; drag-and-drop customizado não está comprovado.

## Seleção, edição e preview

1. Inputs disparam `change`. P3737 `mergeFilesIntoAcc` acumula imagens múltiplas em arrays. Deduplica pela identidade File ou **nome-base**, retirando extensão e `-editado`: duas fotos diferentes `foto.jpg` e `foto.png` podem substituir uma à outra.
2. P3754 `syncAccToInput` recria FileList via **DataTransfer**. Há try/catch e proteção para não substituir o input por uma lista incompleta. O fallback evita apagar tudo, mas não garante que todos os arquivos do acumulador sejam transmitidos em browsers incompatíveis.
3. P3771 `renderUploadThumbs` cria thumbnails com **URL.createObjectURL(File)**; libera a URL em `img.onload` com revokeObjectURL. Botão excluir atualiza acumulador/FileList/resumo. Não há revoke no caminho de erro de decode dessa função; avaliar liberação ao reconstruir/remover previews.
4. `bindDynamicUploadField` P1360–1415 usa acumulador para multiple e apenas primeiro File para campo simples. Helpers próprios cobrem rosto, roupa, óculos, pets e dedicatória. Recriar componentes pode perder o estado capturado no closure.
5. I32 registra `change` delegado no documento e mantém um WeakSet de Files processados. `editQueue` abre editor sequencial para novos arquivos; não reabre em loop após `applyFiles` disparar input/change.
6. `openEditor` I81 carrega por object URL; `buildEditor` I101 desenha em canvas, limitando a maior dimensão a **1600 pixels** (`MAX_DIM`, I13). Há recorte, lápis, seta, cor, espessura e desfazer.
7. Histórico de desfazer usa **canvas.toDataURL('image/png')**, portanto Base64 **em memória**, limitado a 15 estados (I158–160). Não é persistência nem payload de upload.
8. Salvar usa **canvas.toBlob → new File PNG**, sufixo `-editado.png` (I379–383). Substitui File no input via DataTransfer e reapresenta preview. “Ignorar”/cancelar mantém original. Usar original preserva resolução; salvar pode reduzir dimensão e aumentar bytes em relação a JPEG comprimido.

Não foi encontrado uso de FileReader para fotos do configurador nos scripts P/I/gift consultados. Há File API, Blob, FileList, DataTransfer, object URLs e FormData. Os SVGs/Base64 de interface inventariados em ASSET-MAP são distintos das fotos fornecidas pelo cliente.

## Quando os bytes saem do navegador

**Fluxo principal:** apenas `submitAddToCart` P6045–6141 cria `new FormData(productForm)` e envia POST à URL atual, com `credentials:'same-origin'`. Campos externos precisam de `form=mf-product-form-875`. Não há upload antecipado dedicado nem endpoint separado de imagens no núcleo consultado. A associação inicial é pelo conjunto de campos no mesmo POST que adiciona o produto 875 ao carrinho. Depois depende do processamento WooCommerce/PHP não incluído.

Na URL original, o POST iria ao produto em `mifunko.com/personalizacion/pt/encomenda-funko-pop-personalizado/`; na cópia localhost, vai para localhost. Um servidor de arquivos não sabe armazenar imagens nem criar item de carrinho. O form também mantém action remota para fallback nativo; ver USER-FLOW.

**Edição de item existente:** P7989 `restoreExistingPhoto` reconstitui previews por URL retornada no contrato de edição, marca existência e cria `mf_existing_*` hidden (array ou sufixos). As URLs podem então acompanhar novo POST, sem reenvio do File. É necessário verificar autorização, validação dessas URLs e vínculo do arquivo ao dono no backend; não foi possível auditar isso aqui.

**Upsell:** `gift-upsell.js` 147–186 faz GET somente na URL de adicionar produto. O arquivo, origem da imagem e texto do modal não são serializados. Nem `name` no file H6608 nem uma API própria de fotos existe nesse handler. Isso permite avançar com uma seleção local que não chega ao pedido.

## Armazenamento, refresh e perdas

| Situação | Resultado / risco |
| --- | --- |
| Antes de adicionar ao carrinho | Files em inputs/arrays e imagens em memória; sem backend, IndexedDB ou autosave local |
| Recarregar/fechar aba | Perde arquivos e escolhas em curso. Smoke: fileCount 1 → 0; tamanho 10 cm → nenhuma seleção |
| Trocar tipo | P4161 chama `resetFunkoPersonalization`; limpa configuração, inclusive uploads. Mudança intencional do fluxo atual, não corrigida |
| “Guardar progreso” no HTML | H6741–6743 contém apenas comentário; não há UI/implementação de salvar progresso ali |
| sessionStorage | `mf_edit_config` só restaura dados de item já existente; é removido ao ler. Não armazena bytes das fotos novas |
| Nome de arquivo igual | `mergeFilesIntoAcc` substitui pelo nome-base mesmo com extensão distinta, possível perda silenciosa |
| Quantidade/slots reduzidos ou re-render | Campos removidos podem perder arquivos; builders/clones precisam testes antes de extração |
| Rede falha / POST rejeitado | UI mostra erro, mas não oferece fila persistente/reenvio resiliente. Refresh após falha perde trabalho |
| Edição adiciona novo, remoção antiga falha | Confirma sucesso mesmo na falha de remoção; possível duplicação de item e confusão de imagens |
| Fotos já enviadas | Persistência, ACL, retenção, exclusão e vínculo final ao pedido desconhecidos: dependem do backend não fornecido |

## Próxima etapa sugerida

Antes de migrar, obter contrato autorizado do backend e definir limites reais, validação servidor, armazenamento privado, IDs estáveis por upload/pedido, expiração de rascunhos e política de retenção. Criar um adaptador de uploads preservando nomes e eventos atuais; só depois introduzir persistência de rascunho ou envio antecipado. O plano não transfere arquivos de clientes nem introduz serviço novo nesta etapa.
