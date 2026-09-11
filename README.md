# Apex3D — auditoria e preparação da base

Etapas 1 (auditoria) e 2 (fundação local) concluídas em 11/09/2026. O `index.html` original permanece preservado **byte a byte**. Não houve redesign, troca de marca, alteração da oferta ou integração de pagamento.

A branch `refactor/apex-foundation` contém uma entrada de desenvolvimento em `dev.html`, módulos vanilla próprios em `js/`, configuração pública em `config/`, CSS de suporte em `css/`, servidor estático em `scripts/` e testes em `tests/`. As pastas `assets/brand`, `products`, `examples`, `backgrounds` e `ui` estão reservadas, sem assets de terceiros copiados.

A finalização local produz somente um rascunho para inspeção segura. Não há envio de imagens, POST, checkout externo ou backend de pedidos. A aparência ainda usa CSS, fontes, imagens e markup herdados. Os módulos próprios não usam JavaScript remoto da MiFunko.

## Baseline recuperável

- Tag: `baseline-original-2026-09-11`
- Commit: `175babe2df4ffa416f6feae680019600689c72a7`
- Arquivo: `index.html`, 560.040 bytes, 7.942 linhas.
- SHA-256: `327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb`.
- Git local criado antes da documentação; nenhum remoto configurado ou conteúdo publicado.

Para recuperar em outra pasta sem sobrescrever o trabalho atual:

```powershell
git worktree add --detach ../apex3d-baseline baseline-original-2026-09-11
```

**Limite do baseline:** preserva a cópia HTML recebida. A interface abre e as interações principais funcionam com acesso aos recursos remotos. Não é uma loja autônoma nem um backup do WordPress, dos uploads ou do banco de dados MiFunko. O checkout completo não funciona apenas com este repositório. Não há como garantir a disponibilidade futura dos recursos de terceiros a partir desta tag.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [TECHNICAL-MAP](docs/TECHNICAL-MAP.md) | Arquitetura, blocos do index, seletores, funções, eventos e Brand Replacement Inventory |
| [USER-FLOW](docs/USER-FLOW.md) | Jornada, formulário, payload, carrinho, checkout e confirmação |
| [PRICING](docs/PRICING.md) | Preços atuais, cálculo, divergências e centralização futura |
| [UPLOAD-AUDIT](docs/UPLOAD-AUDIT.md) | Fotos, edição, armazenamento, envio e perda de dados |
| [INTEGRATIONS](docs/INTEGRATIONS.md) | Serviços externos, endpoints, analytics e limites de segurança |
| [ASSET-MAP](docs/ASSET-MAP.md) | Quantidades, origem, licença e organização futura dos assets |
| [MIGRATION-PLAN](docs/MIGRATION-PLAN.md) | Sequência de extrações e estrutura vanilla proposta |
| [VALIDATION](docs/VALIDATION.md) | Verificações, smoke tests, falhas originais e limitações |
| [LOCAL-REIMPLEMENTATION](docs/LOCAL-REIMPLEMENTATION.md) | Contratos, estado e matriz de comportamentos locais/pendentes |
| [DEPENDENCY-CLASSIFICATION](docs/DEPENDENCY-CLASSIFICATION.md) | Classificação A–E das 110 declarações e serviços externos |
| [FOUNDATION-VALIDATION](docs/FOUNDATION-VALIDATION.md) | Execução e resultados dos testes da etapa 2 |

Inventários auxiliares: [assets por URL](docs/ASSET-INVENTORY.md), [SVGs inline](docs/INLINE-ASSETS.md), [campos](docs/FORM-FIELDS.md), [atributos de preço](docs/PRICE-ATTRIBUTES.md), [scripts e CSS](docs/RESOURCE-INVENTORY.md). Os manifestos em `docs/evidence/` registram hashes e resultados, sem copiar código remoto ou valores de credenciais.

## Uso local

Com Node.js, sem build ou instalação de pacotes para executar a aplicação:

```powershell
npm run dev
```

Abrir `http://127.0.0.1:4173/`. Essa entrada lê o original como template inerte e executa os módulos locais. `/index.html` redireciona para a mesma entrada. Use esse comando para a etapa 2: servir o original em outro servidor genérico reativa os scripts e links legados. Nenhum fluxo da etapa 2 depende de abrir diretamente o snapshot original.

`npm test` executa a validação do núcleo com o test runner nativo. `npm run test:smoke` requer Playwright e um navegador instalado; veja FOUNDATION-VALIDATION para configurar. Evidências efêmeras ficam em `test-results/`, fora do Git.

A próxima etapa deve completar as pendências da matriz e substituir os materiais/serviços remotos por recursos próprios aprovados antes da migração comercial. Nome, logo, WhatsApp e domínio estão preparados em config/brand.js; a aplicação visual dessa configuração permanece para o rebranding autorizado. A oferta continua herdada em EUR.
