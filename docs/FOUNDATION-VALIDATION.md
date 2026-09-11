# Validação da fundação — 11/09/2026

Registro histórico da etapa 2. A etapa 3 mantém as referências de preço, mas a finalização agora bloqueia configuração incompleta e exige revisão. Resultados atuais: **17 testes do núcleo/produção e 21 cenários de navegador** (11 de fundação + 10 do MVP) aprovados, zero exceções JS e zero tentativas transacionais nos fluxos monitorados. Ver APEX-MVP-CONTRACT.md. A antiga lacuna de validação de produção foi resolvida conforme o contrato MVP; itens LATER/REMOVE não são requisitos pendentes de paridade.

## Executar

Ambiente validado: Windows, Node.js 24.15.0, Playwright já disponível no runtime local e Microsoft Edge headless. Aplicação e testes do núcleo não precisam de instalação de dependências.

```powershell
npm run dev
npm test
```

Abrir `http://127.0.0.1:4173/`. O servidor de desenvolvimento é estático e local. Não serve `.git`, documentos, arquivos privados nem rotas transacionais. Aceita apenas GET/HEAD.

Para o smoke, disponibilizar Playwright pelo pacote local ou apontar `APEX_PLAYWRIGHT_PATH` para seu `index.mjs` já instalado:

```powershell
$env:APEX_PLAYWRIGHT_PATH = 'C:/caminho/para/playwright/index.mjs'
npm run test:smoke
```

O smoke abre seu próprio servidor em 127.0.0.1:4174 e o encerra ao finalizar. Edge é o canal padrão; `APEX_BROWSER` permite selecionar outro canal já instalado. Os recursos visuais remotos são permitidos no teste visual; a interceptação bloqueia qualquer tentativa de POST, script remoto ou rota transacional **antes do envio**. Um cenário adicional bloqueia toda a rede externa para validar a independência da lógica.

## Resultados

- **5 testes do núcleo aprovados**: seis referências de preço observadas, combinações documentadas, rejeição de entradas inválidas, regras de arquivos e normalização/inspeção segura.
- **11 cenários de navegador aprovados**: carregar entrada; produtos/tamanhos; segunda figura; múltiplas imagens/preview/remoção; limite/MIME/conteúdo; imagem da caneca; rascunho seguro; reset; acessórios/minis/pets; galeria/menu/FAQ; lógica sem recursos externos.
- **Zero exceções JavaScript e zero tentativas transacionais** no fluxo de smoke monitorado.
- Verificação visual dos screenshots a 1440×1000 e 390×844. Sem overflow horizontal de documento a 390 px. Não é certificação visual de todas as seções/breakpoints.
- HTML original verificado por SHA-256 e comparação Git com a tag; sem alteração.

| Referência auditada | Esperado | Resultado local |
| --- | --- | --- |
| Individual 6 cm | €59 | €59 |
| Individual 10 cm | €79 | €79 |
| Casal 15 cm, caixa dupla | €219 | €219 |
| Casal 20 cm, sem caixa | €239 | €239 |
| Pet principal 10 cm | €79 | €79 |
| Casamento 6 cm | €119 | €119 |

As referências vêm dos documentos/evidências da etapa 1. A comparação não reexecuta JS proprietário remoto nem acessa checkout. Cenários adicionais conferem os fatos documentados: três minis €116; acréscimo por tamanho/figura; preços de especiais; animais adicionais; urgência; caneca como item separado.

Os testes usam somente uma imagem sintética de 1 pixel e buffers artificiais para rejeição. Nenhuma foto pessoal é usada. O teste comprova rejeição acima de 10.000.000 bytes, MIME inválido e conteúdo que não corresponde à imagem, além de independência de IDs para arquivos homônimos. O teste unitário aceita exatamente o limite configurado em uma política pequena, para exercitar a fronteira sem alocação excessiva.

## Regressões encontradas e corrigidas nesta etapa

- Galeria de casal/casamento inicialmente filtrava rótulos em português, mas o atributo usa Pareja/Boda: mapeamento corrigido.
- Menu mobile retirava hidden, porém o CSS remoto ainda o mantinha em display:none: regra funcional local corrigida.
- Carregamento tardio de estilos causava instabilidade de interação nos primeiros testes: inicialização aguarda estilos/fontes e testes clicam os labels visíveis.
- Fixture inicial de PNG era inválida para decodificação: substituída por imagem sintética criada pelo navegador, mantendo a validação real de conteúdo.
- Campos condicionais e anexos de opções retiradas foram ajustados para não produzir imagens órfãs.

## Limites remanescentes

Não há paridade integral com o JS remoto. Editor/drag-and-drop, catálogo completo de raças, seletores avançados de minis, calendário comercial, validação para fabricação, carrosséis secundários, vídeo e carrinho persistente estão pendentes. Links de conta/atendimento/checkout ficam inativos por desenho da prévia. Esses limites estão discriminados, função a função, em LOCAL-REIMPLEMENTATION.md.

O snapshot original e seus defeitos conhecidos permanecem: SVGs malformados, fontes com restrições de CORS, possíveis assets remotos indisponíveis e textos promocionais inconsistentes. O teste monitora exceções de execução JavaScript e requisições transacionais; não declara ausência de mensagens de rede/CSP/SVG no console. Aparência degradada sem internet é esperada enquanto CSS/fontes/imagens forem externos.

Screenshots e resultado JSON ficam em test-results (ignorado pelo Git). Não são persistidos binários, arquivos enviados pelo usuário ou dados de cliente na documentação. Nenhum pedido, upload externo, pagamento, mensagem, push ou deploy foi executado.
