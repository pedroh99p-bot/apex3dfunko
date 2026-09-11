# Validação do baseline — 11/09/2026

## Conclusão e integridade

O `index.html` abre em HTTP local e suas interações principais funcionaram no cenário testado, **com dependências remotas acessíveis**. Não houve exceção JavaScript (`pageerror`) nos smoke tests. Há erros preexistentes de SVG e carregamento de recursos no console; portanto o baseline **não é “sem erros”**, nem uma loja independente com checkout validado.

Antes da documentação: commit `175babe2df4ffa416f6feae680019600689c72a7`, tag `baseline-original-2026-09-11`. Depois: mesmo arquivo de 560.040 bytes e SHA-256 `327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb`. Nenhuma linha da aplicação foi alterada; apenas README/documentos/evidências foram adicionados. O baseline foi criado antes dessas adições e pode ser recuperado em worktree separado.

## Ambiente e proteção do teste

- Windows, Node/Playwright já disponíveis no runtime fornecido; Edge/Chromium headless; sem instalar dependências no projeto.
- Servidor temporário ligado somente a `127.0.0.1:8765`, servindo o HTML original. Trata query `?tipo=` como a mesma página. POST local retorna 405 por ser uma cópia estática.
- Navegador permitiu GET dos arquivos de interface de MiFunko, Google Fonts e unpkg. Analytics/trackers, SDK PayPal, navegação externa e requisições transacionais foram bloqueados **somente pelo harness**, sem editar o site. Erros `ERR_BLOCKED_BY_CLIENT` são esperados nessa configuração.
- Uma PNG sintética de 1×1 px/68 bytes foi selecionada em memória. Verificou-se a presença de File no FormData, sem chamar endpoint de pedido/upload.
- Capturas do topo desktop/mobile foram examinadas visualmente; screenshots ficaram na área temporária de auditoria, não foram adicionados assets MiFunko ao projeto Apex.

Essa rede controlada não certifica consentimento, pagamentos, analytics ou sessão WooCommerce em produção. O script [evidence/smoke.cjs](evidence/smoke.cjs) permite reproduzir o teste com Playwright previamente disponível. Ele usa pasta temporária para screenshots/resultado; `APEX_PLAYWRIGHT_MODULE` pode apontar para a instalação existente de Playwright e `APEX_AUDIT_OUTPUT` para pasta de saída. Não há `npm install` necessário nesta entrega.

## Checks estáticos

| Check | Resultado |
| --- | --- |
| Inventário da skill `project_inventory.mjs` | HTML estático, sem package/build/test scripts, nenhum arquivo de segredo separado |
| Sintaxe de scripts inline | 31 blocos JavaScript compilados via `vm.Script` sem executar; sem erro de sintaxe |
| Dados estruturados/speculationrules | 3 blocos parseados como JSON; sem erro |
| IDs duplicados | Nenhum no HTML original; não é certificação dos IDs após todas as combinações de clones |
| Paths de src locais | Nenhum src não vazio aponta para arquivo relativo/local. Todos os assets do HTML dependem de URLs externas |
| Lint estático da skill | 2 erros (src vazio em placeholders) e 169 warnings heurísticos; não foram corrigidos |
| Lint: stylesheets | Ferramenta informou 0; falso negativo de leitura das tags deste HTML. Parser dedicado encontrou **53** declarações externas |
| Integridade de fonte | SHA-256 e diff contra tag original, sem mudança |

Os dois src vazios pertencem aos modais de upsell/added-drawer e são preenchidos dinamicamente; não comprovam arquivo inexistente. Warnings incluem 159 suspeitas de label, sete links WhatsApp com número não brasileiro, dois anchors ausentes e OpenGraph ausente. Os sete avisos de WhatsApp decorrem do número espanhol válido para a marca de origem; os labels estão frequentemente aninhados em `<label>` e exigem auditoria semântica própria, não correção automática dos 159.

Anchors `#mf-product-extra-options` em H1375/H7463 não têm alvo literal no HTML (`#personalizar` é o ID real). O CTA principal é interceptado pelo JS do configurador, mas o fallback sem JS e link do carrinho vazio precisam revisão. Não renomeados nesta etapa.

## Smoke tests funcionais

| Cenário | Resultado |
| --- | --- |
| Inicialização | `mfPersonalizedJsLoaded=true`, form `mf-product-form-875`, total inicial 59 €; sem imagens quebradas dentre as carregadas no estado inicial |
| Casal → individual | Criados quatro clones; casal base 109 €; retorno funciona |
| Individual de 10 cm | Total 79 € |
| Foto de rosto | Editor abriu, opção usar original funcionou, 1 File no input, 1 miniatura, arquivo de 68 bytes presente em FormData |
| Adicionar incompleto | Modal de campos obrigatórios; envio não realizado |
| Reload após foto/tamanho | Foto 1 → 0 e tamanho → nenhuma seleção; confirma perda de rascunho original |
| FAQ | Primeiro item fechou e reabriu; aria-expanded false → true |
| Menu de idioma | Abriu; aria-expanded true |
| Casal 15 cm com caixa dupla | Total 219 € (=109+90+20) |
| Casal 20 cm | Total 239 € (=109+130); opções de caixa retiradas do DOM |
| Pet principal 10 cm | Total 79 € (=59+20) |
| Casamento | Base 119 € |
| 390×844, 430×932, 768×1024, 1365×768 | scrollWidth igual à largura da viewport; sem overflow horizontal global nesse estado |

Resultado consolidado: **10 checks funcionais passaram, quatro viewports observadas sem overflow**, mais observação de perda após reload. Capturas desktop/mobile preservam aparência original. A galeria tem trilha horizontal própria no mobile; não confundir com overflow global. Uma tentativa preliminar do teste de 20 cm fechou o accordion já aberto e falhou por timeout do harness; corrigiu-se a pré-condição do teste e repetiu-se, sem modificar a aplicação.

## Console e recursos: problemas encontrados

| Problema | Evidência / impacto |
| --- | --- |
| SVGs com aspas tipográficas | H6875, H6905, H6935, H6965: atributos width/height/viewBox/path/circle usam aspas curvas inválidas. Console registra erro de parsing; ícones de foto de reviews podem falhar |
| Fontes GDPR sem CORS | `.../gdpr-cookie-compliance/dist/fonts/nunito-v8-latin-{regular,700}.{woff2,woff,ttf}` falharam no localhost por ausência de Access-Control-Allow-Origin. Não confundir resposta HTTP possível com permissão de uso pelo browser |
| Ícone dinâmico antigo | P5612 `/new/wp-content/uploads/2026/05/icon-caja-individual.webp`: HEAD 404 e erro ORB observado em execução preliminar ao abrir modal de validação |
| Recursos deliberadamente bloqueados | GTM, Clarity, Meta/Facebook, tracker MiFunko, Sourcebuster/atribuição e SDK PayPal; não contabilizar como regressão do produto |
| Requisições canceladas | Algumas imagens geram ERR_ABORTED durante troca de tipo/reload; não equivale a URL inexistente |

Sondagem de leitura **HEAD em 333 URLs** (276 URLs de arquivos visuais/fontes + 57 scripts): 240 respostas 200, uma 404 e 92 timeouts de 15 segundos. Timeouts indicam resultado **inconclusivo**, não 92 assets quebrados. Não foi feito download/reincorporação de mídia. Alguns endereços estranhos `%22images%2F...png%22` estão literalmente no CSS do plugin Redsys consultado, não são URLs inventadas pela auditoria. Não foram normalizados na aplicação.

Os JS/CSS customizados usados no mapa foram obtidos por GET de leitura e registrados com hash; CSS complementares de fontes/plugins também foram inspecionados. Recursos de srcset podem não ser carregados no smoke por viewport/lazy-loading. Evidências: [resource-check.json](evidence/resource-check.json), [smoke-result.json](evidence/smoke-result.json), [remote-manifest.json](evidence/remote-manifest.json).

## Problemas críticos de produto / plataforma

1. **Não existe backend local de pedido/checkout/upload.** O POST da configuração usa a URL atual; hospedar como HTML estático não cria loja funcional. O checkout ainda leva à MiFunko.
2. **Upload do upsell não chega ao envio.** O handler exige arquivo mas faz GET sem foto/texto; ver USER-FLOW e UPLOAD-AUDIT.
3. **Não há persistência de rascunho com fotos.** Perda em reload foi reproduzida; limite anunciado de 10 MB não foi encontrado implementado no núcleo/editor.
4. **Dependência e titularidade externas.** Todo o tema visual, lógica importante e mídia dependem de terceiros; o Git local não é backup funcional de WordPress ou desses assets.
5. **Edição não atômica.** O fluxo confirma adição mesmo se a remoção do item anterior falhar; duplicação é risco do cliente, sem backend disponível para confirmar transação.

Preços não centralizados, comparativo/analytics/frete divergentes e SVG/CORS são detalhados nos mapas. Nada foi corrigido para respeitar o congelamento funcional solicitado.

## Limites e reprodução

Não testados: pagamento real/sandbox, criação final de pedido, e-mail, banco, entrega por WhatsApp, retenção/ACL de fotos, todos os slugs de acessórios, todos os browsers, edição completa de item já persistido e cálculo real de frete. Não foram criados mocks que fingem confirmação de compra.

Reprodução estática sem instalar pacotes:

```powershell
git diff baseline-original-2026-09-11 -- index.html
Get-FileHash -LiteralPath index.html -Algorithm SHA256
node docs/evidence/smoke.cjs
```

O último comando requer Playwright/Edge já disponíveis, porta 8765 livre e rede para recursos originais. Se o ambiente não resolver `playwright`, apontar `APEX_PLAYWRIGHT_MODULE` para a instalação existente. Não abrir chamadas de pedidos externos para “validar” a cópia. Para garantir compra de ponta a ponta na próxima etapa será necessário backend autorizado e ambiente de testes próprio.
