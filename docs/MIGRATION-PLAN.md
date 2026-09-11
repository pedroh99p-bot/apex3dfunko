# Plano incremental de migração Apex3D

## Ponto de partida e limite desta entrega

Etapa atual: baseline Git, auditoria, documentação e validação. `index.html` permanece byte a byte igual à tag `baseline-original-2026-09-11`. Nenhuma extração de produção, alteração de preço/fluxo/copy, rebranding, dependência, framework ou deploy foi feito.

A arquitetura original não é um HTML que contém todo o aplicativo: depende de recursos e de um backend WordPress/WooCommerce externo. Portanto, antes de “extrair o JS do index”, resolver **procedência autorizada do tema e contrato de servidor**. O maior script nem está no repositório. Copiar silenciosamente os arquivos remotos não produz propriedade Apex nem recria o backend.

## Sequência recomendada

| Passo futuro | Risco | Antes de mover | Extração/resultado | Evidência mínima e rollback |
| --- | --- | --- | --- | --- |
| 0. Congelar original e mapear | **BAIXO** | Verificar arquivo e recursos | Feito nesta entrega: tag, docs, manifestos e smoke | Comparar SHA-256 e `git diff baseline-original-2026-09-11 -- index.html` |
| 1. Confirmar origem de código/visuais | **BAIXO** para inventário | Materiais do proprietário/licenças; não presumir autorização do tema | Registro de procedência por asset/script, decisão sobre o que pode ser versionado | Revisão do ASSET-MAP; não mudar runtime |
| 2. CSS/tokens | **BAIXO** em CSS local pequeno; **MÉDIO** para internalizar tema | Ordem/cascata, `:root`, CSS crítico, breakpoints; licença do remoto | Uma extração por commit. `css/tokens.css` preservando valores e `css/legacy.css` preservando seletores | Screenshots mesmas larguras, visibilidade de form/caixa/menu; reverter só o commit da extração |
| 3. CSS/componentes | **MÉDIO** | Dependências de produto, estados hidden/open/selected, specificity e duplicatas de link | CSS por grupos visualmente isolados, mantendo ordem de inclusão | Galeria, accordion, drawer, modais, barra fixa e mobile; não “limpar” duplicatas simultaneamente |
| 4. Configurações | **MÉDIO** | Leitores de `mfPersonalizedConfig`, i18n, IDs, slugs, globals e ordem | Config separado com adaptador para globals atuais; nonces continuam vindo do servidor correto | Inicialização e todos os contratos de form/evento; não incluir credencial permanente |
| 5. Conteúdo | **MÉDIO** | Identificar textos usados como estado/preço, JSON-LD/SEO duplicado | Conteúdo sem alterar copy inicialmente; componente lê dados mantendo DOM | Hero, preço comparativo, acessibilidade, FAQ e metadados iguais |
| 6. Pricing | **ALTO** | Tabelas de referência, fórmula no servidor, caixa/tamanho/pets/minis/casal, moeda | Config de preços única + cálculo puro que retorna itens e total; adaptador legado | Matriz de totais/detalhamentos, quantidade/carrinho e parity servidor; rollback inteiro do módulo |
| 7. Configurador | **ALTO** | Estado DOM, form ownership, clones, referências removidas e timers | Adaptador de seleção/state, depois extrair passo por passo sem trocar markup/names | Trocar tipo, completar cada modalidade, editar P2, campos disabled, tamanho/caixa, validadores |
| 8. Uploads | **ALTO** | Limites reais, contrato multipart, storage/ACL/retention, existentes vs Files novos | Serviço de arquivos em memória com API explícita; preservar preview/editor antes de mudar persistência | Seleção múltipla, homônimos, exclusão, edição PNG, erros, limites, reload, clones e multipart |
| 9. Checkout/carrinho | **ALTO** | Backend próprio/autorizado, sessão, anti-CSRF, recálculo e associação de fotos | Adaptador para serviços; preservar comportamento UI e só depois substituir endpoint | Ambiente de testes do backend, sucesso/erro/duplicidade/editar/quantidade e confirmação verdadeira |
| 10. Analytics | **MÉDIO**; alterar contas/eventos de compra é **ALTO** | Consentimento, esquema de eventos e inventário de duplicação | Um emissor de eventos desacoplado dos campos, adaptador legado temporário | Não registrar fotos/dados pessoais; checkout/carrinho só emitem eventos no estado correto |
| 11. Identidade Apex3D | **MÉDIO**, etapa posterior | Dados comerciais/marca/assets próprios aprovados; funcionalidades estáveis | Preto/grafite/vermelho, logo e conteúdo/contexto brasileiros | Revisão de contrastes, URLs, metadados, promessas, moeda/condições e mobile |

**Não executar agora passos de risco médio/alto.** Mesmo ações de baixo risco relacionadas à licença não são permissão para copiar mídia. Esta entrega optou por documentação e integridade, sem extrair CSS prematuramente.

## Fronteiras propostas

- `config`: configurações públicas de marca, conteúdo, catálogo/pricing e integrações. Não armazena segredos/nonces estáticos. Separar texto comercial de identificador de contrato.
- `pricing`: cálculo sem DOM; mesmos itens alimentam subtotal, resumo, hero e breakdown. Servidor valida a cobrança.
- `configurator`: estado de seleção e regras de visibilidade, módulos de cada passo e adaptador que conserva `mf_*` durante transição.
- `uploads`: Files/previews/editor e serialização, referência por figura/slot. Fotos de clientes não entram no Git nem em assets públicos.
- `checkout`: montagem do payload, transporte, retorno estruturado, carrinho e fluxo de edição. Não simular pagamento concluído a partir do modal “adicionado”.
- `analytics`: escuta eventos de negócio explícitos; políticas de consentimento e contas próprias. Não acoplar aos textos traduzidos dos botões.
- `content`/`brand`: apenas após extrações equivalentes, migrar dados da marca por checklist contextual, incluindo SEO, links sociais, reviews e vídeos.

## Estrutura vanilla futura

```text
index.html
README.md
docs/
  TECHNICAL-MAP.md
  USER-FLOW.md
  PRICING.md
  UPLOAD-AUDIT.md
  INTEGRATIONS.md
  ASSET-MAP.md
  MIGRATION-PLAN.md
  VALIDATION.md
  evidence/
assets/
  brand/
  products/
  examples/
  backgrounds/
  ui/
css/
  tokens.css
  base.css
  components.css
  configurator.css
js/
  main.js
  config/
    brand.js
    content.js
    catalog.js
    pricing.js
    integrations.js
  pricing/
    calculate.js
    render.js
  configurator/
    state.js
    legacy-adapter.js
    steps.js
    summary.js
  uploads/
    files.js
    preview.js
    editor.js
  checkout/
    payload.js
    client.js
    cart.js
  analytics/
    events.js
```

Essa árvore é **proposta**, não dezenas de arquivos vazios criados. Pode começar com menos arquivos (um por fronteira) e subdividir apenas quando ajudar manutenção. Sem React, Next, bundler, CMS ou banco por motivo de organização. Pode usar `<script defer>` e namespaces durante a transição; ES modules somente quando ordem e globals estiverem explicitamente adaptados. A escolha de backend é decisão separada, não consequência da estrutura de pastas.

O catálogo futuro pode representar `figures[]` com tipos pessoa/pet, mais acessórios, tamanhos, caixa e uploads por `figureId`. Individual é uma pessoa, casal duas; família passa a ter múltiplas figuras com regra/preço próprios a definir, **sem derivar automaticamente preços não fornecidos**. Preservar a conversão para slugs/fields atuais enquanto coexistir com o legado. Prévia de fotos e resumo existem; prévia 3D requer serviço/artefatos próprios e especificação futura.

## Dependências e gates para a etapa seguinte

1. Obter origem/licença e capacidade de preservar os recursos autorizados. Baseline Git atual sozinho não restaura WooCommerce, imagens remotas ou banco.
2. Ter ambiente controlado de backend para testes, com dados fictícios e endpoint próprio; explicitar limite e persistência de fotos.
3. Fechar contratos: seletores e campos de FORM-FIELDS, eventos/globals do TECHNICAL-MAP, tabela PRICING, payload USER-FLOW.
4. Implementar uma única extração sem redesign/alterar comportamento; comparar mesma configuração e viewport.
5. Se houver divergência, reverter aquela extração e documentar a dependência antes de prosseguir. A tag original permanece intocada.

Problemas críticos registrados (uploads upsell, perdas em refresh, ausência de backend, remoção de item sem validação) devem ter correções separadas da modularização. Corrigir bugs e mover código no mesmo commit dificulta provar equivalência; as correções exigem escopo próprio de próxima etapa.
