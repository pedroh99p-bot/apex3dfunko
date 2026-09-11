# Apex3D · Frontend comercial V0.5

Implementação standalone em HTML, CSS e JavaScript local. Oferta em BRL, personalização guiada por fotos, adicionais progressivos, revisão e pedido de teste. Sem backend, pagamento, envio externo ou persistência das fotos.

A entrada comercial é **dev.html**. O **index.html da raiz é um snapshot histórico preservado** e não deve ser publicado como a página Apex.

## Executar e homologar

- **npm run dev**: página comercial em http://127.0.0.1:4173/.
- **npm test**: testes de cálculo, uploads e contrato de produção.
- **npm run test:smoke**: Playwright com Edge; evidências em test-results/ (ignorado).
- **npm run build**: cria **dist/** com a página Apex como index e somente arquivos públicos autorizados. Configure a hospedagem de staging para publicar **dist**, nunca a raiz.

Node.js é suficiente para executar e gerar o site. Para os testes de navegador, disponibilize Playwright e Edge. O runner aceita APEX_PLAYWRIGHT_PATH apontando ao módulo playwright/index.mjs e APEX_BROWSER para selecionar outro canal Chromium instalado.

## Contrato atual

Consulte [APEX-FRONTEND-V05](docs/APEX-FRONTEND-V05.md) para identidade, oferta, preços de homologação, limites e resultado dos testes; [dependências atuais](docs/APEX-DEPENDENCIES.md) e [procedência dos assets](docs/ASSET-MAP.md).

Individual R$197; Pet R$157; Casal R$347; Família (3 pessoas) R$477. Preços centralizados em config/pricing.js, sujeitos a revisão antes da produção. Frete não incluído.

Fotos permanecem em memória com validação e recibos internos por pessoa/pet/adicional. O CTA “Gerar pedido de teste” gera um rascunho local: não faz cobrança, não envia pedido e não inicia produção. Recarregar encerra a configuração. A inspeção em window.apexDevelopment omite textos livres e nomes dos arquivos.

## Baseline preservado

- Tag: baseline-original-2026-09-11.
- Commit: 175babe2df4ffa416f6feae680019600689c72a7.
- index.html: 560.040 bytes; SHA-256 327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb.
- Fundação anterior: branch refactor/apex-foundation.
- V0.5: branch feat/apex-frontend-v05.
- Origin: https://github.com/pedroh99p-bot/apex3dpersonalizados.

Os inventários TECHNICAL-MAP, USER-FLOW, PRICING, LOCAL-REIMPLEMENTATION, DEPENDENCY-CLASSIFICATION e APEX-MVP-CONTRACT documentam fases anteriores. As decisões comerciais V0.5 prevalecem sobre regras e preços herdados. Nenhum asset proprietário do concorrente integra o frontend comercial.
