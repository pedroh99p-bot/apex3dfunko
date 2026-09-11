> Correção visual: sete imagens recuperadas do baseline, locais e marcadas ORIGIN_REVIEW_REQUIRED. A composição do hero/cards/exemplos substituiu os placeholders. Zero dependências remotas em runtime; veja VISUAL-RESTORATION.md.

# Dependências do frontend Apex3D V0.5

Este relatório substitui, para a entrada comercial, a situação visual descrita nos inventários históricos das etapas 1–3.

| Categoria | Runtime V0.5 | Origem |
| --- | --- | --- |
| JavaScript funcional | Módulos próprios locais; zero scripts remotos | js/ e config/ |
| CSS e tokens | Dois arquivos locais | css/apex.css e css/tokens.css |
| Fontes | Sistema operacional, sem requisições | Segoe UI / Arial / sans-serif |
| Logo | WebP local, sem chamada Cloudinary | Asset fornecido pelo proprietário |
| Ilustrações | Formas neutras em CSS; não são produtos reais | Código local original |
| Portfólio / avaliações | Slots e texto de disponibilidade futura | Nenhum conteúdo de concorrente |
| Ícones | Caracteres Unicode de interface | Sem pacote de ícones remoto |
| Fotos selecionadas | File + URLs blob, somente memória | Sessão do visitante |
| Analytics, cookies de marketing e pixels | Nenhum | Não implementados |
| Pagamento, checkout e transações | Nenhum | Endpoints desabilitados |

**MiFunko: zero dependências funcionais e zero dependências visuais no frontend comercial.** O index original segue versionado por requisito de preservação, com URLs históricas; não é carregado pela aplicação, nem incluído no build. Documentos históricos não descrevem a página atual.

Os testes de navegador abortam e registram toda tentativa de requisição fora da origem local, todo método diferente de GET e URLs de transação/concorrente. Os fluxos, incluindo pedidos de teste, passaram sem tentativas externas. A CSP proíbe connect-src e recursos remotos.

Procedência e hash da logo: ASSET-MAP. Artefatos de build/teste ignorados; sem download de imagens, fontes ou SVGs proprietários de terceiros.
