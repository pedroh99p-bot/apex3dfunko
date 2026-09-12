# Ajustes de marca e compartilhamento — setembro de 2026

Atualização solicitada após a publicação da Original Shell V1 no repositório
`pedroh99p-bot/apex3dfunko`.

- Open Graph e Twitter Card usam a arte enviada pelo usuário, em URL HTTPS
  pública do Cloudinary. A transformação JPEG de 1200 × 675 preserva a composição
  e respondeu HTTP 200 com `image/jpeg` (108146 bytes). A cópia WebP original está
  em `assets/brand/apex-share.webp`.
- A etapa 5 usa `assets/process/apex-impressao-3d.webp`, imagem enviada pelo
  usuário. O `srcset` antigo foi removido para não servir a imagem anterior em
  telas menores. Os arquivos históricos permanecem preservados.
- A opção de caixa dupla foi removida do HTML. A comparação estrutural registra
  exatamente uma imagem a menos na embalagem e no configurador que a contém.
- `css/apex-theme.css` contém somente substituições de cores, geradas com
  `node scripts/build-apex-theme.js`. Os CSS originais permanecem intactos.
  Tons amarelos e creme do tema passam a vermelho e rosa; amostras de pele,
  cabelo, olhos e cores reais de embalagem mantêm seus valores.
- Navbar com logo de até 192 px (156 px no celular); rodapé com logo de 280 px
  centralizada na largura da seção. O indicador de idioma desativado fica oculto
  no celular para reservar espaço à marca e aos controles.
- Menu de contexto e arraste são cancelados somente nas imagens. A seleção de
  texto, campos de upload, teclado e abertura da galeria continuam disponíveis.
  Essa proteção dificulta o salvamento casual; não impede capturas ou acesso aos
  arquivos públicos pelo navegador.

Validação: 24 testes unitários, 73 cenários de navegador no build, comparação de
36 regiões e integridade dos 280 recursos históricos. Após os ajustes finais de
contraste, verificação do build em 360, 390, 430, 768, 1024, 1100 e 1440 px,
incluindo centralização das logos, ausência de overflow, imagem da etapa 5,
remoção da caixa dupla e eventos de proteção. Capturas locais em
`test-results/original-shell/build/*-new-*.png`.

Os metadados estão no HTML estático publicado. A aparência efetiva da prévia
depende da hospedagem servir esta versão e de o WhatsApp atualizar seu cache;
não foi realizado envio de mensagem para verificar a prévia no aplicativo.
