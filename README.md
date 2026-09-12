# Apex3D — Original Shell V1

Port do HTML, CSS e experiência comercial originais para o motor standalone Apex. A página mantém a composição do hero, os painéis do configurador, tamanhos, acessórios, processo, galerias, depoimentos e FAQ. Esta versão gera somente pedidos de teste locais.

O arquivo `index.html` é o baseline histórico imutável. **O site em desenvolvimento é `dev.html`; o deploy publica `dist/index.html`, gerado a partir dele.** Não servir o baseline como aplicação atual.

## Executar

Requer Node.js 20 ou superior.

```sh
npm run dev
npm test
npm run test:structure
npm run test:smoke
npm run test:smoke:build
```

Prévia: `http://127.0.0.1:4173/`. Os testes de navegador usam Playwright e Microsoft Edge. Podem usar o runtime local do Codex ou um Playwright instalado, com `APEX_PLAYWRIGHT_PATH` para indicar seu módulo e `APEX_BROWSER` para escolher um canal compatível.

## Build / Vercel

```sh
npm run build
```

`vercel.json` configura `buildCommand: npm run build` e `outputDirectory: dist`. O build usa uma lista explícita de arquivos públicos. Não inclui baseline, documentos, scripts de auditoria, fotos enviadas ou credenciais.

## Estado comercial

Preços provisórios em reais, centralizados em `config/commercial.js`, `config/pricing.js` e `config/special-objects.js`. A simulação por miniatura usa 6/10/15/20 cm a R$100/150/170/200. As composições multiplicam o valor por pessoa; adicionais usam a tabela documentada. A divergência com a tabela anterior do briefing está registrada para confirmação.

Fotos permanecem em memória até recarregar ou descartar a criação. Não há envio, armazenamento remoto, cobrança, backend, banco ou checkout. `productionReady` permanece falso mesmo após validação de um pedido de teste.

Mídias herdadas são referências visuais, sujeitas à revisão de origem. Depoimentos são placeholders explícitos. Minis, caneca, inclusos não confirmados, caixa dupla e envio expresso não estão disponíveis para contratação.

## Documentação

- [Entrega e decisões da V1](docs/APEX-ORIGINAL-SHELL-V1.md)
- [Mapa das 36 regiões antes do port](docs/ORIGINAL-1TO1-MAP.md)
- [Mapa completo de assets](docs/ASSET-MAP.md)
- [Manifesto de arquivos e hashes](docs/evidence/original-shell-assets.json)
- [Comparação de geometria com o baseline](docs/evidence/original-shell-geometry.json)

Relatórios e screenshots dos testes ficam em `test-results/`, fora do deploy e do Git. Os demais inventários técnicos preservados em `docs/` registram a origem e o contrato das etapas anteriores; o documento da V1 descreve a implementação atual.
