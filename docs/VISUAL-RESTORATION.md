# Restauração visual seletiva — inventário de decisões

Comparação: baseline-original-2026-09-11 (index preservado) versus V0.5 anterior à correção (1221799). Esta classificação cobre todas as URLs do inventário original, incluindo variantes responsivas e fontes. O mapeamento de origem permanece em ASSET-INVENTORY.md.

O componente original é #mf-product-gallery / [data-mf-product-gallery], index:917–1153. Os slides usam img.src/srcset/sizes, legenda data-mf-slide-legend e loading lazy nos seguintes. As imagens comparativas já contêm foto/modelo/miniatura. Não é preciso recortar, montar um novo bitmap ou restaurar JS remoto. Cards originais: index:1260–1339, img.src e atributos data-type-visual-value. Família não existia: o quarto tipo era Casamento.

## Arquivos efetivamente recuperados

| Arquivo local | Origem exata | Uso | Bytes | SHA-256 | Situação |
| --- | --- | --- | ---: | --- | --- |
| assets/examples/pet.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/06/ejemplo-mascota-1.webp | Hero, slide 4; exemplos de personalização | 55052 | ee9b592778542ee641ddc3a05f74751572b50d8ea554691d9ab1a86b5ab700ae | ORIGIN_REVIEW_REQUIRED |
| assets/products/casal.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/05/funko-tipo-parejas.webp | Card Casal; composição do card Família | 6646 | 5b80cdeea292d4e28886ef7ba0b22348f801a53793a25e588f92d359e38a4d88 | ORIGIN_REVIEW_REQUIRED |
| assets/products/pet.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/05/funko-tipo-mascota.webp | Card Pet | 4350 | cbea35a9e2769461d4466482192db9eead801f2cd51bf47a1a579513697fd9b6 | ORIGIN_REVIEW_REQUIRED |
| assets/examples/casal.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/06/ejemplo-parejas-1.webp | Hero, slide 3; exemplos de personalização | 29870 | 5e81d6df908efc6b3d9cf8dac3b46bca698f36f733ac9c390452fb20a3658ca6 | ORIGIN_REVIEW_REQUIRED |
| assets/examples/individual-futebol.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/06/individual-principal-1.webp | Hero, slide 1 | 24808 | a80c07fef43131782034a57c6a57adb29928a90dcefc95b246ad17e2863ec901 | ORIGIN_REVIEW_REQUIRED |
| assets/examples/individual-profissao.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/06/individual-principal-2-1024x1024.webp | Hero, slide 2; exemplos de personalização | 57478 | e590d50f0bd6fc01c3599b06073041b146677fa32e6fa749822732a99fc2ba83 | ORIGIN_REVIEW_REQUIRED |
| assets/products/individual.webp | https://mifunko.com/personalizacion/wp-content/uploads/2026/05/funko-tipo-individual-male-1.webp | Card Individual; composição do card Família | 3740 | 6157efbb43d618f1b3ba445cd83ccf12b86bf153260556c60b8749693e3e395d | ORIGIN_REVIEW_REQUIRED |

Sete arquivos, 181944 bytes no total. Cópias intactas, sem recompressão/conversão/corte. Todos locais, nenhuma URL concorrente é requisitada em runtime. Uso autorizado pelo proprietário para esta correção de staging; direitos/licença e consentimentos de imagem precisam de revisão antes de produção definitiva.

A variante de 600 px de individual-principal-2 respondeu HTTP 522. Foi mantido o src de 1024 px já presente no baseline (57.478 bytes), sem depender da variante. As demais imagens do hero têm 600 × 600 e os ícones de categoria 150 × 128. CSS fluido/object-fit contain conserva enquadramento; lazy loading abaixo da dobra e prioridade alta apenas no primeiro slide.

Família: RESTORE da representação de três pessoas através de duas imagens intactas (Casal + Individual), composta em HTML/CSS, sem edição dos arquivos. Uma fotografia/ilustração exclusiva de três pessoas continua REPLACE LATER; não se usa imagem de casamento como família.

## Classificação por asset original

| ID | Arquivo / referência | Decisão | Motivo |
| --- | --- | --- | --- |
| A001 | data URI de interface | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A002 | data URI de interface | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A003 | flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A004 | XRXI3I6Li01BKofiOc5wtlZ2di8HDDsmRTM.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A005 | XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmRTM.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A006 | XRXI3I6Li01BKofiOc5wtlZ2di8HDGUmRTM.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A007 | XRXI3I6Li01BKofiOc5wtlZ2di8HDIkhRTM.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A008 | XRXI3I6Li01BKofiOc5wtlZ2di8HDLshRTM.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A009 | pxiByp8kv8JHgFVrLCz7V1s.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A010 | pxiByp8kv8JHgFVrLDD4V1s.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A011 | pxiByp8kv8JHgFVrLEj6V1s.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A012 | pxiByp8kv8JHgFVrLGT9V1s.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A013 | pxiEyp8kv8JHgFVrFJA.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A014 | icon-caja-individual.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A015 | nunito-v8-latin-700.eot | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A016 | nunito-v8-latin-700.eot#iefix | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A017 | nunito-v8-latin-700.svg#svgFontName | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A018 | nunito-v8-latin-700.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A019 | nunito-v8-latin-700.woff | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A020 | nunito-v8-latin-700.woff2 | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A021 | nunito-v8-latin-regular.eot | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A022 | nunito-v8-latin-regular.eot#iefix | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A023 | nunito-v8-latin-regular.svg#svgFontName | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A024 | nunito-v8-latin-regular.ttf | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A025 | nunito-v8-latin-regular.woff | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A026 | nunito-v8-latin-regular.woff2 | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A027 | gdpr-logo.png | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A028 | %22images%2Fui-icons_444444_256x240.png%22 | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A029 | %22images%2Fui-icons_555555_256x240.png%22 | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A030 | %22images%2Fui-icons_777620_256x240.png%22 | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A031 | %22images%2Fui-icons_777777_256x240.png%22 | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A032 | %22images%2Fui-icons_cc0000_256x240.png%22 | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A033 | %22images%2Fui-icons_ffffff_256x240.png%22 | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A034 | ui-icons_444444_256x240.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A035 | ui-icons_555555_256x240.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A036 | ui-icons_777620_256x240.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A037 | ui-icons_777777_256x240.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A038 | ui-icons_cc0000_256x240.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A039 | ui-icons_ffffff_256x240.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A040 | comparativa-tamanos.webp | REPLACE LATER | Material de processo/dimensão depende da homologação física Apex; evitar promessas herdadas. |
| A041 | funko-tono_piel_estandar.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A042 | funko-tono_piel_moreno_claro.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A043 | funko-tono_piel_moreno_oscuro.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A044 | funko-tono_piel_palido.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A045 | 120-1.jpg | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A046 | 120-2.jpg | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A047 | 120-3.jpg | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A048 | 120.jpg | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A049 | PNFMIFUNKOPERSONALIZADO-1-1-1.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A050 | extra-funda-protectora-caja.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A051 | extra-imanes-estabilidad.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A052 | extra-peana-funko.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A053 | funko-tipo-boda.webp | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A054 | funko-tipo-individual-male-1.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A055 | funko-tipo-mascota.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A056 | funko-tipo-parejas.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A057 | icon-caja-doble.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A058 | icon-caja-individual.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A059 | icon-sin-caja-personalizada.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A060 | icono-accesorio.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A061 | icono-arma-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A062 | icono-bateria-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A063 | icono-bicicleta-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A064 | icono-bolso-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A065 | icono-caballo.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A066 | icono-cabra.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A067 | icono-caja-individual-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A068 | icono-coche-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A069 | icono-conejo-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A070 | icono-entrega-transporte.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A071 | icono-extras.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A072 | icono-funko-mini.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A073 | icono-gato-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A074 | icono-guitarra-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A075 | icono-hamster.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A076 | icono-lagarto.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A077 | icono-mascota-2.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A078 | icono-mascota.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A079 | icono-mesa-dj-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A080 | icono-moto-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A081 | icono-otra-mascota-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A082 | icono-pajaro-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A083 | icono-piano-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A084 | icono-raqueta-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A085 | icono-rostro-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A086 | icono-tamano-funko.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A087 | icono-tono-piel.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A088 | icono-tortuga.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A089 | icono-vestimenta.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A090 | ojos-azules-v2.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A091 | ojos-estandar-v2.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A092 | ojos-marrones-v2.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A093 | ojos-verdes-v2.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A094 | otros-trabajos-realizados-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A095 | otros-trabajos-realizados-7-300x300.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A096 | paso1-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A097 | paso1-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A098 | paso1-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A099 | paso1-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A100 | paso2-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A101 | paso2-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A102 | paso2-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A103 | paso2-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A104 | paso3-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A105 | paso3-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A106 | paso3-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A107 | paso3-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A108 | paso4-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A109 | paso4-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A110 | paso4-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A111 | paso4-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A112 | paso5-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A113 | paso5-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A114 | paso5-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A115 | paso5-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A116 | paso6-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A117 | paso6-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A118 | paso6-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A119 | paso6-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A120 | paso7-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A121 | paso7-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A122 | paso7-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A123 | paso7-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A124 | paso8-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A125 | paso8-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A126 | paso8-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A127 | paso8-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A128 | paso9-proceso_funkos-300x200.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A129 | paso9-proceso_funkos-600x400.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A130 | paso9-proceso_funkos-768x512.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A131 | paso9-proceso_funkos.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A132 | review-1-150x150.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A133 | review-1.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A134 | review-2-150x150.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A135 | review-2.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A136 | review-3-150x150.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A137 | review-3.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A138 | review-4-150x150.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A139 | review-4.jpg | KEEP REMOVED | Marca, prova social, promoção, casamento fora da oferta ou suporte de interface histórica. |
| A140 | cropped-ICONOMIFUNKOPNGNEGRO-1-1-100x100.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A141 | cropped-ICONOMIFUNKOPNGNEGRO-1-1-300x300.png | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A142 | ejemplo-boda-1-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A143 | ejemplo-boda-1-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A144 | ejemplo-boda-1-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A145 | ejemplo-boda-1.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A146 | ejemplo-boda-2-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A147 | ejemplo-boda-2-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A148 | ejemplo-boda-2-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A149 | ejemplo-boda-2.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A150 | ejemplo-boda-3-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A151 | ejemplo-boda-3-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A152 | ejemplo-boda-3-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A153 | ejemplo-boda-3.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A154 | ejemplo-boda-4-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A155 | ejemplo-boda-4-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A156 | ejemplo-boda-4-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A157 | ejemplo-boda-4.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A158 | ejemplo-mascota-1-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A159 | ejemplo-mascota-1-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A160 | ejemplo-mascota-1-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A161 | ejemplo-mascota-1.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A162 | ejemplo-mascota-2-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A163 | ejemplo-mascota-2-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A164 | ejemplo-mascota-2-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A165 | ejemplo-mascota-2.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A166 | ejemplo-mascota-3-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A167 | ejemplo-mascota-3-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A168 | ejemplo-mascota-3-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A169 | ejemplo-mascota-3.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A170 | ejemplo-mascota-4-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A171 | ejemplo-mascota-4-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A172 | ejemplo-mascota-4-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A173 | ejemplo-mascota-4.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A174 | ejemplo-mascota-5-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A175 | ejemplo-mascota-5-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A176 | ejemplo-mascota-5-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A177 | ejemplo-mascota-5.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A178 | ejemplo-mascota-6-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A179 | ejemplo-mascota-6-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A180 | ejemplo-mascota-6-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A181 | ejemplo-mascota-6.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A182 | ejemplo-mascota-7-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A183 | ejemplo-mascota-7-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A184 | ejemplo-mascota-7-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A185 | ejemplo-mascota-7.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A186 | ejemplo-parejas-1-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A187 | ejemplo-parejas-1-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A188 | ejemplo-parejas-1-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A189 | ejemplo-parejas-1.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A190 | ejemplo-parejas-2-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A191 | ejemplo-parejas-2-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A192 | ejemplo-parejas-2-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A193 | ejemplo-parejas-2.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A194 | ejemplo-parejas-3-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A195 | ejemplo-parejas-3-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A196 | ejemplo-parejas-3-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A197 | ejemplo-parejas-3.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A198 | ejemplo-parejas-4-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A199 | ejemplo-parejas-4-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A200 | ejemplo-parejas-4-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A201 | ejemplo-parejas-4.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A202 | extra-peana-cesped-futbolista.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A203 | extra-peana-nombre-fecha.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A204 | extra-peana-nombre.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A205 | icono-altar-nupcial.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A206 | icono-arbol-gatos.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A207 | icono-arenero.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A208 | icono-bandana-perros-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A209 | icono-cama-perros-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A210 | icono-camara.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A211 | icono-cana-pesca.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A212 | icono-caseta-madera-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A213 | icono-cojin-portaalianzas.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A214 | icono-collar-placa-perros-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A215 | icono-comedero-gatos.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A216 | icono-comedero-perros-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A217 | icono-copas-champagne.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A218 | icono-corona-flores.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A219 | icono-esquis.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A220 | icono-hueso-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A221 | icono-maleta.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A222 | icono-mochila.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A223 | icono-mordedor-cuerda-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A224 | icono-paso-ojos-mascota.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A225 | icono-paso-tamano-mascota.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A226 | icono-paso-tipo-mascota.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A227 | icono-patinete-electrico.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A228 | icono-pelota-kong-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A229 | icono-pizarra.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A230 | icono-portatil.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A231 | icono-ramo-flores.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A232 | icono-rascador-1.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A233 | icono-tarta-novios.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A234 | individual-principal-1-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A235 | individual-principal-1-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A236 | individual-principal-1-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A237 | individual-principal-1.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A238 | individual-principal-11-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A239 | individual-principal-11-1024x1024.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A240 | individual-principal-11-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A241 | individual-principal-11-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A242 | individual-principal-11-600x600.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A243 | individual-principal-11-768x768.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A244 | individual-principal-11.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A245 | individual-principal-13-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A246 | individual-principal-13-1024x1024.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A247 | individual-principal-13-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A248 | individual-principal-13-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A249 | individual-principal-13-600x600.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A250 | individual-principal-13-768x768.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A251 | individual-principal-13.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A252 | individual-principal-2-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A253 | individual-principal-2-1024x1024.webp | RESTORE | Compreensão da transformação ou escolha do produto; cópia local inspecionada. |
| A254 | individual-principal-2-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A255 | individual-principal-2-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A256 | individual-principal-2-600x600.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A257 | individual-principal-2-768x768.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A258 | individual-principal-2.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A259 | individual-principal-3-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A260 | individual-principal-3-1024x1024.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A261 | individual-principal-3-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A262 | individual-principal-3-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A263 | individual-principal-3-600x600.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A264 | individual-principal-3-768x768.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A265 | individual-principal-3.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A266 | individual-principal-4-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A267 | individual-principal-4-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A268 | individual-principal-4-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A269 | individual-principal-4.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A270 | individual-principal-9-100x100.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A271 | individual-principal-9-1024x1024.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A272 | individual-principal-9-150x150.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A273 | individual-principal-9-300x300.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A274 | individual-principal-9-600x600.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A275 | individual-principal-9-768x768.webp | KEEP REMOVED | Variante responsiva/miniatura redundante; não duplicar mídia sem necessidade. |
| A276 | individual-principal-9.webp | REPLACE LATER | Exemplo/processo adicional; priorizar portfólio Apex e revisar origem antes de ampliar a galeria. |
| A277 | regalo-extra-taza.webp | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |
| A278 | tr | KEEP REMOVED | Ícone, opção detalhada ou apoio do layout antigo; não necessário à correção seletiva nem ao configurador atual. |

Resumo por URL: {"RESTORE":7,"KEEP REMOVED":242,"REPLACE LATER":29}. Variantes e fontes contam separadamente; não são fotografias distintas.
