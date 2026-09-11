# Apex3D — auditoria e preparação da base

Etapa 1 concluída em 11/09/2026. O `index.html` original foi preservado **byte a byte**. Não houve redesign, troca de marca, alterações de preços, checkout, dependências ou extração de código de produção.

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

Inventários auxiliares: [assets por URL](docs/ASSET-INVENTORY.md), [SVGs inline](docs/INLINE-ASSETS.md), [campos](docs/FORM-FIELDS.md), [atributos de preço](docs/PRICE-ATTRIBUTES.md), [scripts e CSS](docs/RESOURCE-INVENTORY.md). Os manifestos em `docs/evidence/` registram hashes e resultados, sem copiar código remoto ou valores de credenciais.

## Uso local

Sem build ou instalação de pacotes. Se Python estiver disponível:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8000/`. Esse servidor serve arquivos, mas **não processa pedidos**. A página original ainda carrega integrações e links da MiFunko; os testes desta auditoria usaram bloqueio de analytics, pagamentos e chamadas transacionais no navegador. Consulte VALIDATION antes de reproduzi-los.

A próxima etapa deve resolver titularidade das dependências e contrato de backend antes de uma migração comercial. A identidade Apex3D e o tema preto/grafite/vermelho estão apenas propostos em MIGRATION-PLAN.
