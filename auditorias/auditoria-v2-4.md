# Auditoría v2.4 contra los criterios de aceptación del brief (sección 7)

Medido sobre el DOM renderizado con `tools/audit-v24.mjs` (resultados crudos en `capturas/audit-v24.json`) y `tools/audit-v24-espaciado.mjs` (`capturas/espaciado-v24-antes.json`, `-despues.json`, `-desktop.json`), en mobile 360, 390 y 412 px y desktop 1280 y 1440 px. LCP y CLS con `tools/perf.mjs`. Todo se midió contra un servidor local (`python -m http.server 8765`). Nada se publicó ni se subió.

## Resumen

| Punto | Resultado |
|---|---|
| Tipografía (peso, tamaño, interlineado, tapa de Minnaard) | **cumple** |
| Espaciado vertical (≤ ~24 px entre tarjetas con filete, sin dobles márgenes) | **cumple** en tarjetas; quedan 3 excepciones anotadas |
| Formato 2 mobile y `tapa2=chica` | **cumple** la foto; **no cumple** el tope de líneas en un título (caso Nanni) |
| Etiquetas bajo el título y sobre la foto, `etiqueta=caja` | **cumple** |
| Header `header=prod\|actual` (v2.4.1) | **cumple**; ver la sección 9 |
| Sin scroll horizontal | **cumple** (6 páginas × 5 anchos) |
| CLS < 0,1 y LCP re-medidos | **cumple** |
| Panel `?demo=1`, "Copiar link" y README | **cumple** |

## 1. Tipografía

| Criterio | Resultado | Medición | Captura |
|---|---|---|---|
| `peso` default 700 en mobile y desktop; 600, 700, 800 y 900 por parámetro | **cumple** | Peso computado 700 en tapa y tarjetas en los 5 anchos. `?peso=600` y `?peso=800` cambian el valor (`data-peso`). Se quitó el alias `600 → 700`. | `k-titulos-peso600-390.png`, `k-titulos-peso700-390.png`, `k-titulos-peso800-390.png` |
| Títulos mobile más chicos | **cumple** | Tapa 32 → 27 px; superdestacada 28 → 26 px; tarjetas (Formato 1, tapa2, listados) 28 → 22 px. | idem |
| Interlineado cerrado (~1.15 a 1.2) | **cumple** | Tapa 1,15; tarjetas 1,17 (Formato 2: 1,15). | idem |
| Nota de la tapa de Minnaard ≤ 4 líneas en 390 px | **cumple** | 3 líneas en 360, 390 y 412 px. | `k-titulos-peso700-390.png` |
| Títulos de Formato 1 de 3 a 4 líneas | **cumple** | 360 px: 4-3-4-3-3-4-3-3. 390 y 412 px: 4-3-3-3-3-3-3-3 (máximo 4). | `l-espaciado-index-m390.png` |
| Cuerpo de la nota sin tocar | **cumple** | No se modificó ninguna regla del cuerpo. | — |
| Desktop | cambio mínimo | El peso 700 pasa a ser el default también en desktop (decisión provisoria del brief). Tamaños de desktop sin cambios (tapa 46 px, tarjeta 24 px). | — |

### Las 9 combinaciones fuente × peso a 390 px

Medido sobre el home (31 títulos visibles), con las fuentes ya cargadas. Capturas: `p-fuente-actual-390.png`, `p-fuente-merriweather-390.png`, `p-fuente-literata-390.png` (cada una con 600, 700 y 800 lado a lado, tapa arriba y Formato 2 abajo). Datos: `fuente-peso-v24.json`.

| Fuente | Peso | Máx. líneas en un título | Líneas en el Formato 2 (8 tarjetas) | Tapa de Minnaard | Desbordes / scroll horizontal | Veredicto |
|---|---|---|---|---|---|---|
| Source Serif 4 (actual) | 600 | 6 | 4-4-4-6-4-5-4-4 | 3 | 0 / no | bien |
| Source Serif 4 (actual) | 700 | 6 | 4-4-4-6-4-5-4-4 | 3 | 0 / no | bien (default) |
| Source Serif 4 (actual) | 800 | 6 | 4-4-4-6-4-5-4-4 | 3 | 0 / no | bien |
| Merriweather | 600 | 6 | 4-4-4-6-4-5-4-4 | 3 | 0 / no | bien |
| Merriweather | 700 | 6 | 4-4-4-6-4-5-4-4 | 3 | 0 / no | bien |
| Merriweather | 800 | 6 | 4-5-4-6-4-5-4-4 | 3 | 0 / no | bien; una tarjeta de Formato 2 gana una línea |
| Literata | 600 | 6 | 4-4-4-6-4-5-4-4 | 3 | 0 / no | bien |
| Literata | 700 | 6 | 4-5-4-6-5-5-4-4 | 3 | 0 / no | **algo ancha**: 2 tarjetas de Formato 2 ganan una línea |
| Literata | 800 | **7** | 4-5-4-7-5-5-4-4 | 3 | 0 / no | **demasiado ancha**: Nanni llega a 7 líneas |

Lo que se ve en las capturas:
- Ninguna combinación se rompe: no hay texto desbordado, ni scroll horizontal, ni solapamientos.
- **Literata en 700 y 800 es la más ancha**: en el Formato 2 los títulos cortan en renglones de 2 o 3 palabras. Si se elige Literata conviene dejarla en 600.
- **Merriweather casi no cambia entre 600, 700 y 800** (el trazo se engrosa poco) y a igual peso se ve más liviana que Source Serif 4 y Literata. No es un error de carga: la fuente variable se carga y `font-weight` se aplica (computado 600, 700, 800). Si Juan la quiere "con más cuerpo", hay que probar 800 o 900.
- La fuente actual no cambia el reparto de líneas entre 600, 700 y 800.

## 2. Espaciado vertical

Medido como la distancia entre el borde inferior del contenido de una tarjeta y el borde superior del contenido de la siguiente (sin contar el padding), con el filete de 1 px incluido. Meta: ≤ ~24 px de aire + 1 px de filete = **≤ 25 px**. Los valores son iguales en 360, 390 y 412 px.

| Medida (390 px) | Antes | Después |
|---|---|---|
| Header → primera etiqueta del home | 34 px | 12 px |
| Entre tarjetas del home, mediana | 33 px | 25 px |
| Tapa: nota 1 → nota 2 | 75 px | 25 px |
| Tapa: nota 2 → nota 3 | 43 px | 25 px |
| Formato 1, entre tarjetas | 59 px | 25 px |
| Formato 2, entre tarjetas | 33 px | 25 px |
| Lista "Seguí leyendo" (solo texto) | 30 a 32 px | 26 a 28 px |
| Sección: tapa → primera fila (con la doble línea gruesa) | ~89 px (62 en la medición intermedia) | **41 px** |
| Sección: entre filas | ~89 px | 25 px |
| Pares tarjeta → tarjeta que cumplen (≤ 25 px), home | 0 de 25 | 15 de 26 |
| Pares que cumplen, `seccion.html` | 0 de 10 | 9 de 10 |

Los 11 pares del home que no son tarjeta contra tarjeta (30 a 125 px) son saltos de bloque: módulo de legisladores, doble línea, publicidad, y el salto entre dos filas de Formato 1 (32 px, entre bandas). El único en `seccion.html` es el de la tapa a la primera fila (41 px, pedido de ~40 px; se conserva la doble línea gruesa).

Qué se corrigió: el margen de 10 px arriba del cintillo sumado al padding de la tarjeta; el padding + margen + gap de la nota 1 de la tapa; el `min-height` de 490 px de las filas de sección en mobile; las bandas y la doble línea de 24 a 32 px bajaron a 16 px; el filete fino pegado a la doble línea en la tapa de sección. Se conservan el filete fino entre tarjetas y la doble línea de separación de bloques.

**Excepciones conocidas** (dentro de lo aceptado, pero por encima de 25 px):
1. Lista "Seguí leyendo": 26 a 28 px (la tarjeta de solo texto tiene la etiqueta en una línea propia).
2. Saltos de bloque (doble línea, módulos, publicidad): no son tarjeta contra tarjeta y no se tocaron.
3. Sección: tapa → primera fila, 41 px (a pedido, ~40 px).

**Desktop** (1280 y 1440 px): se recortaron solo espacios claramente excesivos, sin reestructurar. Bandas de Formato 1 y 2 de 32 a 24 px; doble línea entre bloques de 32 a 24 px de margen; dos filas de Formato 1 seguidas sumaban 64 px de aire y quedaron en 24 px. La medición de pares en desktop es poco fiable (las columnas se mezclan al ordenar por posición vertical) y se juzgó por inspección. Captura: `l-espaciado-index-d1280.png`.

Capturas: `l-espaciado-index-m390.png`, `l-espaciado-index-d1280.png`.

## 3. Formato 2 en mobile y `tapa2=chica`

| Criterio | Resultado | Medición | Captura |
|---|---|---|---|
| Foto cuadrada, ~32 a 35% del ancho, a la derecha, alineada arriba | **cumple** | 1:1. 360 px: 98×98 (30%); 390 px: 115×115 (32%); 412 px: 122×122 (32%). El brief orientaba a 120 a 135 px en 390; quedó en 115 px por el ajuste pedido (32% en 390 y 412 px, 30% en ≤ 375 px). | `m-formato2-f2-390.png` |
| Texto a la izquierda: cintillo, título, sección; sin bajada | **cumple** | Sin bajada visible en las 8 tarjetas. | idem |
| Fondo suave y filetes | **cumple** | Se conservan. | idem |
| `tapa2=chica` usa la misma tarjeta | **cumple** | Mismas medidas de foto y título (19 px en ≤ 375 px, 20 px en 390 y 412 px). | `m-formato2-tapa2chica-390.png` |
| Título ≤ 4 líneas | **no cumple en 1 título (caso Nanni)** | 360 px: 4-5-4-6-4-5-4-4. 390 px: 4-4-4-6-4-5-4-4. 412 px: 4-4-4-6-4-4-4-4. Se aceptó hasta 5 líneas a 360 px; sólo la nota de Nanni pasa. | idem |
| Título corto y largo conviven sin huecos | **cumple** | Las tarjetas se alinean arriba; no hay huecos entre texto y foto. | idem |
| Sin scroll horizontal | **cumple** | — | — |

**Caso conocido, sin cambio:** "Nanni exige la finalización de la colectora entre Exaltación de la Cruz y Pilar: “Quedó una obra a medias e insegura”" (117 caracteres) sale en **6 líneas** en 360, 390 y 412 px. Es el título más largo de la muestra y no se acortó (los títulos son de los datos). En Literata 800 llega a 7 líneas. Si más adelante se quiere resolver, la opción de diseño es bajar un punto la fuente en ese formato, no recortar el texto.

## 4. Etiquetas

| Criterio | Resultado | Medición | Captura |
|---|---|---|---|
| Bajo el título: texto gris chico, sin caja | **cumple** | 11,5 px, peso 600, mayúsculas, letra espaciada 0,04em, color `#6b6b6b` (`--seccion-texto`), fondo transparente, padding 0. Aplica en Formato 2, listados, secciones, tarjetas sin foto y lateral. | `n-etiqueta-f2-texto.png`, `n-etiqueta-seccion-texto.png` |
| Sobre la foto, un escalón más chica | **cumple** (decisión mía, avisada en el brief) | 11 px → 10 px, padding 3×8 → 2×6. | `n-etiqueta-f1-d1280.png` |
| `etiqueta=caja` restaura la versión anterior | **cumple** | Con `?etiqueta=caja`: 11 px, peso 700, padding 3×8 y la caja de v2.3, ahora en `--brand-blue` (v2.4.1) en vez del navy. | `n-etiqueta-f2-caja.png` |
| Aplica en mobile y desktop | **cumple** | — | `n-etiqueta-f1-d1280.png` |

Decisiones mías: (1) la caja de la cabecera de la nota individual (fecha · sección · minutos de lectura) se dejó como estaba, el brief no la nombra; (2) en la superdestacada de texto, que tiene fondo oscuro, la etiqueta es blanca semitransparente en vez de gris.

## 5. Header

**Actualizado en v2.4.1 (paleta oficial, ver la sección 9).** La etapa E de v2.4 había dejado `header=actual|marca|marca2` con dos azules candidatos tomados de la maqueta, porque el logo es blanco y no había un color para muestrear. Con la paleta oficial del sitio en producción, `marca` y `marca2` se eliminaron (los links viejos con `?header=marca` o `marca2` se redirigen a `prod`) y el default pasó a ser `header=prod`.

| Criterio | Resultado | Medición | Captura |
|---|---|---|---|
| `--header-bg` en `:root` y parámetro de header | **cumple** | `--header-bg` = `--brand-sky` (#3daef4). Opciones: `prod` (default) y `actual` (el azul oscuro anterior, solo para comparar). | `t-paleta-home-d1280.png`, `t-paleta-home-navy-d1280.png` |
| Se aplica a buscador y barra del menú mobile | **cumple** | `.search` y `.nav__bar` usan `--header-bg`. | `t-paleta-home-m390.png` |

## 6. Rendimiento

Método: `tools/perf.mjs` (Playwright con Chromium, 390×844 factor 2, CPU 4× más lenta, red 1,6 Mbps con 150 ms de latencia por CDP, scroll lento hasta el final de la página; `PerformanceObserver` de `largest-contentful-paint` y `layout-shift`, sin contar los shifts con `hadRecentInput`).

| Página | LCP | CLS |
|---|---|---|
| seccion (tanda completa) | 2,35 s | 0,0000 |
| seccion (3 corridas sueltas) | 1,94 · 1,98 · 2,00 s | 0,0000 |
| index (tanda completa) | 2,06 s | 0,0001 |
| index (3 corridas sueltas) | 2,10 · 2,20 · 2,07 s | 0,0000 · 0,0000 · 0,0001 |
| nota-413361 | 1,85 s | 0,0000 |
| diputados | 1,80 s | 0,0000 |
| senadores | 1,81 s | 0,0000 |
| legislador | 1,52 s | 0,0000 |

**`seccion.html` (se quitó el `min-height` de las filas): CLS 0,0000, por debajo de 0,1**, incluyendo el scroll infinito hasta el final. El LCP de la tanda completa (2,35 s) fue el más alto de las cuatro mediciones; las tres corridas sueltas dieron ~2 s. La variación entre corridas es de ~0,3 s (ya se había visto en v2.3.1); no hay un cambio de diseño que lo explique, pero el mejor lugar para vigilarlo es la tanda completa.

## 7. Sin scroll horizontal

`document.documentElement.scrollWidth > innerWidth` es falso en `index`, `seccion`, `nota-413361`, `diputados`, `senadores` y `legislador` a 360, 390, 412, 1280 y 1440 px (`capturas/audit-v24.json`).

## 8. Panel, "Copiar link" y README

El panel `?demo=1` tiene filas nuevas para `etiqueta` y `header`, y `peso` incluye 600. "Copiar link de esta variante" arma la URL con los `data-*` de `<html>`, así que incluye `peso`, `etiqueta` y `header`. El README documenta `peso` (600, 700 default, 800, 900), `etiqueta` y `header`.

## 9. v2.4.1 · paleta oficial

Cambio pedido a partir de una captura del sitio en producción. Commit propio: "v2.4.1 paleta oficial".

**Tokens en `:root`:** `--brand-sky: #3daef4`, `--brand-blue: #1b75bb`, `--ink: #222`. `--accent` = `--brand-sky` y `--accent-text` (cintillos y acentos, antes #1673ad) = `--brand-blue`. Las etiquetas de sección, `--header-bg`, la barra de menú, el pie de página, los botones, el placeholder de las fotos y el avatar de las iniciales salen de ahí. El navy (#0b2236, `--navy`) se eliminó: el hex solo sobrevive dentro de `html[data-header="actual"]`, para comparar. También se cambiaron `theme-color` y el favicon.

| Elemento | Antes | Ahora |
|---|---|---|
| Barra superior (desktop y mobile) | navy | `--brand-sky`, logo y lupa blancos |
| Barra de menú desktop | blanca con subrayado | `--brand-blue`, texto blanco, ítem activo en `--brand-sky` con texto `--ink` |
| Barra del menú mobile (panel) y buscador | navy | `--brand-sky` |
| Botón Buscar del panel | celeste | `--ink` |
| Etiquetas de sección (sobre la foto y `etiqueta=caja`) | navy | `--brand-blue`, texto blanco |
| Pie de página | navy | `--brand-blue`, texto blanco |
| Cintillos, enlaces, botones | #1673ad | `--brand-blue` |
| Placeholder de foto | degradado celeste-azul con texto blanco | `--brand-sky` sólido con texto `--ink` |
| Avatar con iniciales | degradado celeste-azul | `--brand-blue` con texto blanco |
| Texto del cuerpo | #111 | `--ink` (#222) |

**Dos ajustes de contraste:**
1. En las superficies grises (módulo de legisladores #eee y fondo suave del Formato 2 #f2f2f2) el `--brand-blue` solo da 4,2 y 4,35:1 con texto chico. Ahí el texto azul (cintillos y "Ver todos") usa `--brand-blue-dk`, el mismo azul al 94% de luminosidad (#196eb0): 4,6 a 4,8:1.
2. El placeholder de la foto pasó a texto `--ink` sobre `--brand-sky` (6,5:1); con texto blanco daba 2,4:1.

**Pares de color usados.** Barrido automático de todos los textos visibles con `tools/audit-contraste.mjs` (index, index-anterior, seccion, nota, perfil y diputados, a 390 y 1280 px; datos en `capturas/contraste-v241.json`). Mínimo AA: 4,5:1 texto normal y 3:1 texto grande (≥ 24 px, o ≥ 18,66 px en negrita):

| Texto | Fondo | Contraste | Mínimo | Resultado | Dónde |
|---|---|---|---|---|---|
| `#6b6b6b` | `#eeeeee` | 4,59:1 | 4,5:1 | cumple | small. · div.lcar__count |
| `#196eb0` | `#eeeeee` | 4,64:1 | 4,5:1 | cumple | a. |
| `#6b6b6b` | `#f2f2f2` | 4,76:1 | 4,5:1 | cumple | span.sectag |
| `#196eb0` | `#f2f2f2` | 4,81:1 | 4,5:1 | cumple | span.cintillo |
| `#ffffff` | `#1b75bb` | 4,87:1 | 4,5:1 | cumple | span.sectag · p. · h2. · a. |
| `#1b75bb` | `#ffffff` | 4,87:1 | 4,5:1 | cumple | span.cintillo · a.strip__more · span. · a. |
| `#ffffff` | `#1b75bb` | 4,87:1 (texto grande) | 3:1 | cumple | span.avatar__ini |
| `#1b75bb` | `#ffffff` | 4,87:1 (texto grande) | 3:1 | cumple | a. · strong. |
| `#6b6b6b` | `#ffffff` | 5,33:1 | 4,5:1 | cumple | p.crumbs · span.sectag · time. · span. |
| `#222222` | `#3daef4` | 6,48:1 | 4,5:1 | cumple | a. |
| `#6b4e00` | `#fff3c4` | 6,95:1 | 4,5:1 | cumple | span.on-ej |
| `#5b4500` | `#fff8dc` | 8,59:1 | 4,5:1 | cumple | b. · div.notice |
| `#444444` | `#f2f2f2` | 8,7:1 | 4,5:1 | cumple | p.dek |
| `#444444` | `#f3f3f3` | 8,78:1 | 4,5:1 | cumple | span. |
| `#444444` | `#ffffff` | 9,74:1 | 4,5:1 | cumple | span. · p. · p.art__lead · a.chip |
| `#222222` | `#eeeeee` | 13,71:1 | 4,5:1 | cumple | span. · b. |
| `#222222` | `#f2f2f2` | 14,21:1 (texto grande) | 3:1 | cumple | a. |
| `#222222` | `#ffffff` | 15,91:1 | 4,5:1 | cumple | a.skip · a. · span.cap__credit · p. |
| `#222222` | `#ffffff` | 15,91:1 (texto grande) | 3:1 | cumple | a. · span. · h1. · strong. |

Todos los textos cumplen. Quedan fuera del barrido el texto que está directamente sobre una foto o un degradado; las etiquetas sobre la foto sí se midieron porque tienen su propia caja (blanco sobre `--brand-blue`, 4,87:1).

**Pendiente de decisión (se hizo lo pedido, pero conviene mirarlo):** el logo blanco y la lupa blanca sobre `--brand-sky` dan 2,45:1. No son texto de la página (el logo es una imagen y la lupa un ícono), pero un ícono de interfaz pide 3:1. Si se quiere más contraste hay dos salidas: usar el logo en `--ink` (habría que conseguir el archivo) u oscurecer apenas la barra (`--brand-sky` al 88%, ~3:1).

**Capturas** (`capturas/t-paleta-*`): home, sección, nota y perfil a 390 y 1280 px (`t-paleta-home-m390.png`, `t-paleta-home-d1280.png`, `t-paleta-seccion-*`, `t-paleta-nota-*`, `t-paleta-perfil-*`), el pie (`t-paleta-pie-*`) y el home con el navy anterior para comparar (`t-paleta-home-navy-*`).

## Qué se cambió y dónde

| Etapa | Commit | Archivos principales |
|---|---|---|
| A. Tipografía | `fd03e89` | `assets/css/main.css`, `build.mjs`, `assets/js/main.js` |
| B. Espaciado | `3449bf1` | `assets/css/main.css`, `tools/audit-v24-espaciado.mjs` |
| C. Formato 2 mobile | `e55b80b` y ajuste de ≤ 375 px | `assets/css/main.css` |
| D. Etiquetas | `983b2a5` | `assets/css/main.css`, `build.mjs`, `assets/js/main.js` |
| E. Header | `d2571ac` | `assets/css/main.css`, `build.mjs`, `assets/js/main.js` |
| F. Auditoría, README y perf | este commit | `capturas/auditoria-v2-4.md`, `README.md`, `tools/audit-v24.mjs` |
