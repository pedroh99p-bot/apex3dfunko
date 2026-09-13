# Apex3D — Comercial V1

Frontend standalone da Apex3D Personalizados. A página combina uma jornada comercial curta com configurador, pricing em BRL, uploads locais, promoção FIRST10, atendimento por WhatsApp, revisão do pedido e tracking preparado para ativação futura.

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

Preços homologados em reais e centavos inteiros ficam centralizados em `config/commercial.js` e `config/pricing.js`. A matriz cobre Individual, Pet, Casal e Família em 6, 10, 15 e 20 cm. Pessoa adicional usa o preço Individual do tamanho atual; pet, acessórios, objetos, bases e caixa usam a tabela central. Cards, configurador, sticky, revisão e `orderDraft` derivam do mesmo cálculo.

FIRST10 concede 10% sobre o subtotal elegível e nunca sobre frete. A sinalização de primeira compra no `localStorage` serve apenas à experiência frontend; não é antifraude nem autoridade de elegibilidade. Fotos permanecem em memória até recarregar ou descartar. Não há envio remoto, cobrança, backend, banco, checkout ou Asaas; `productionReady` permanece falso.

O WhatsApp oficial é `(21) 92367-9482`. Os CTAs usam `wa.me` e podem incluir somente produto, tamanho e subtotal, nunca fotos, URLs blob, observações ou dados pessoais. Depoimentos simulados e caneca foram removidos do MVP. Modalidades de entrega sem SLA ficam fora da interface.

Tracking tem um helper único em `js/analytics.js` e IDs placeholder em `config/analytics.js`. Enquanto qualquer ID contiver `PLACEHOLDER`, nenhuma tag externa é carregada e nenhum request de analytics é enviado, mesmo com consentimento. O evento `purchase` está reservado para confirmação futura do backend/Asaas e não é disparado pelo frontend.

## Documentação

- [Entrega e decisões da V1](docs/APEX-ORIGINAL-SHELL-V1.md)
- [Hardening Comercial V1](docs/APEX-COMMERCIAL-V1.md)
- [Auditoria que originou o hardening](docs/APEX-AUDIT-V1.md)
- [Mapa das 36 regiões antes do port](docs/ORIGINAL-1TO1-MAP.md)
- [Mapa completo de assets](docs/ASSET-MAP.md)
- [Manifesto de arquivos e hashes](docs/evidence/original-shell-assets.json)
- [Comparação de geometria com o baseline](docs/evidence/original-shell-geometry.json)

Relatórios e screenshots dos testes ficam em `test-results/`, fora do deploy e do Git. Os demais inventários técnicos preservados em `docs/` registram a origem e o contrato das etapas anteriores; o documento da V1 descreve a implementação atual.
