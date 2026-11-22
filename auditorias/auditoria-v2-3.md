# Auditoría v2.3 contra los criterios de aceptación del brief (sección 9)

Medido con `tools/audit-v23.mjs` (Playwright sobre el DOM renderizado; resultados crudos en `tools/audit-v23.json`) en desktop 1280 px y mobile 360, 390 y 412 px. LCP y CLS con `tools/perf.mjs`. Las capturas están en esta carpeta.

## Correcciones hechas durante la auditoría
1. **Títulos de desktop en peso 700 en vez de 800.** Una llave `}` de sobra en `main.css` (bloque del botón "Ver más") hacía que el navegador descartara la regla siguiente, la que aplica `--titulo-peso` a las tarjetas. Los títulos de tarjetas, formatos y franja se veían en 700 aunque el default fuera 800 (la tapa y la superdestacada sí estaban en 800). Corregido: todas las tarjetas miden 800 en desktop. **Esto engrosa visiblemente el desktop respecto de lo que se aprobó en la etapa C.**
2. **Títulos mobile en peso 400** (variable inexistente `--titulo-peso-mobile`): corregido en la etapa E.
3. **Slot lateral de publicidad (nota y perfil) de ~40 px** (`adOne()` no aplicaba `adz--one`): corregido en la etapa D.

## Los puntos de la sección 9

| # | Criterio | Resultado | Motivo / medición | Captura |
|---|---|---|---|---|
| 1 | Cintillo y sección en toda tarjeta y nota; sin datelines ni volantas como etiqueta bajo el título | **cumple** | Home desktop: 31 tarjetas visibles, 31 con cintillo y 31 con etiqueta de sección. Nota: cintillo arriba del título y etiqueta bajo la foto. `?seccion=abajo` mueve la etiqueta bajo la foto, a la derecha (verificado). Cintillo 16 px serif 600, color `--cintillo-color` (#1673ad). | `g-home-d1280.png`, `g-nota-d1280.png` |
| 2a | Home: ningún pie de foto ni hora en tarjetas | **cumple** | 0 `figcaption` y 0 `.meta` visibles en el home. | `g-home-d1280.png` |
| 2b | Sin "Anunciantes" ni "PUBLICIDAD" | **cumple** | No hay título ni rótulo. La palabra "publicidad" aparece una vez en el texto del home, pero es parte de un titular de nota ("prohibir la publicidad y los canjes"). | `g-home-d1280.png` |
| 2c | Los seis banners horizontales caben enteros | **cumple** | Slot 1180×90 con `object-fit: contain`; los seis (970×90, 580×90, 1180×90 ×3, 970×90) caben sin cortarse ni agrandarse. | `g-home-d1280.png` |
| 3 | Desktop: Diputados y Senadores como dos módulos grises separados por un bloque de noticias, más chicos, solo nombre y bloque | **cumple** | Orden medido (v2.3.1): Diputados, Formato 1, Formato 1, Senadores (el banner suelto ya no está entre los Formato 1). Fondo `rgb(238,238,238)`, 213 px de alto cada uno, retratos de 72 px, tarjetas con nombre y bloque (Fuerza Patria, La Libertad Avanza, PRO, UCR...). Sin "Diputados · Bloque D". | `g-legisladores-d1280.png` |
| 4a | Franja final: una nota menos por columna | **cumple** | 3 notas por columna (antes 4). | `g-franja-d1280.png` |
| 4b | "Ver más" con flecha sin borde; `vermas=boton` lo devuelve | **cumple** | Borde 0 px y flecha →; con `?vermas=boton` el borde es de 1 px. | `g-franja-d1280.png` |
| 5a | Títulos más gruesos (default 800) | **cumple** (tras la corrección 1) | Peso computado 800 en tarjetas, tapa y título de la nota. | `g-home-d1280.png` |
| 5b | Tres alternativas por `font` | **cumple** | `actual` = Source Serif 4, `merriweather`, `literata`: las tres se aplican a 800. | — |
| 5c | Tamaños un poco mayores; cuerpo de la nota más grande | **cumple** | Cuerpo de la nota 22 px en desktop y 20 px en mobile, interlineado 1,6. Títulos de tarjeta 24 px, tapa 46 px. | `g-nota-d1280.png` |
| 6a | Dos páginas con pestañas cruzadas, buscador por nombre y filtro por bloque | **cumple** | `diputados.html` (16) y `senadores.html` (8); pestañas "Diputados \| Senadores" con la activa marcada. Buscar "SOFÍA" da 1 resultado (sin distinguir acentos ni mayúsculas); bloque UCR da 4. Sin filtro por partido y sin carrusel. Tarjetas: foto, nombre y bloque. | `g-diputados-d1280.png` |
| 6b | Perfil con bloque, mandato, sección electoral y ciudad | **cumple** | "Bloque Fuerza Patria · Mandato 2023 a 2027 · Sección electoral Segunda · Ciudad Mar del Plata". Biografía con leer más, compartir y copiar link. Un perfil sin biografía no muestra bloque vacío. Publicidad en columna lateral sticky de 300 px. | `g-perfil-d1280.png` |
| 7a | Nota: cintillo arriba, bajada, fecha sin hora y sección debajo de la foto, sin "LA PLATA" | **cumple** | Fecha "23 de octubre de 2026" (sin hora), debajo de la foto, con la etiqueta de sección. El pie de foto se conserva. 0 apariciones de "LA PLATA" en las 44 notas. | `g-nota-d1280.png` |
| 7b | Compartir en gris, sin colores de marca | **cumple** | WhatsApp, Facebook, X, Instagram, Telegram y copiar link, todos `rgb(243,243,243)` con texto `rgb(68,68,68)`. | `g-nota-d1280.png` |
| 7c | Publicidad y "Leé también" al costado, fijos, con títulos completos | **cumple** (actualizado en v2.3.1) | Columna lateral `position: sticky`; tras bajar queda a 120 px del borde. En ventanas de ≤ 960 px de alto solo el banner queda fijo (ver v2.3.1). Los 4 títulos de "Leé también" se ven enteros. Sin banner debajo de la nota en desktop. | `g-nota-d1280-scroll.png` |
| 7d | Elementos de la nota que no aportan | **pendiente de OK** | Lista en `nota-elementos-dudosos.md`; no se borró nada. | `d-nota-meta-1280.png` |
| 8a | Mobile: líneas finas entre tarjetas | **cumple** | Los 3 flujos del home tienen borde de 1 px (`--filete-suave`) entre tarjetas, en 360, 390 y 412 px. | `g-home-m390.png` |
| 8b | Mobile: ninguna bajada | **cumple** | 0 bajadas visibles en el home y en la sección interna. La nota conserva la bajada. | `g-home-m390.png` |
| 8c | Mobile: Formato 2 con tarjeta chica y foto al costado | **cumple** | Foto de 96×72 a la derecha del texto en 360, 390 y 412 px. | `g-home-m390.png`, `e-tapa2-chica-390.png` |
| 8d | Mobile: banner 300×300 rodante, sin textos | **cumple** | Slot de 300×300 en los tres anchos, sin título ni rótulo; rotación y swipe por JS. El swipe no se probó en un teléfono físico. | `g-home-m390.png` |
| 8e | Mobile: sin scroll horizontal ni saltos | **cumple** | Sin scroll horizontal en home, nota y sección (360, 390, 412). CLS 0. Diputados y Senadores consecutivos. | — |
| 9 | CLS < 0,1 y LCP medidos de nuevo | **cumple** | Ver "Mediciones" abajo. | — |
| 10 | Panel `?demo=1`, "Copiar link" y README al día | **cumple** | El panel tiene `seccion`, `tapa2`, `tapa`, `vermas`, `bajada`, `peso`, `font`, `ritmo` y los demás; "Copiar link" arma la URL con todos. README con parámetros y constantes. | — |

## Etapa F: ritmo del home de escritorio (`ritmo=actual|b|c`, opcional)
| Criterio | Resultado | Motivo / medición | Captura |
|---|---|---|---|
| `ritmo=actual` no cambia nada | **cumple** | Comparado contra el `index.html` del commit anterior (etapa G): mismo alto de página y misma cantidad de bloques visibles en 1280 px (7320 px, 13 bloques), 1440 px (7320 px, 13) y 390 px (12276 px, 12). | `f-ritmo-actual-d1280.png` |
| `b`: una nota grande y dos chicas con foto al costado | **cumple** | Reemplaza al 2.º Formato 1; usa 3 de sus 4 notas. Alto de página 6973 px a 1280 px. Foto grande de 784 px de ancho con fuente de 600 px (se ve algo blanda, es el tamaño que hay de esa foto). | `f-ritmo-b-d1280.png` |
| `c`: bloque de solo texto entre dos bloques con foto | **cumple** (la salvedad original quedó resuelta en v2.3.1) | Bloque de 6 notas (3 × 2, cintillo, título y etiqueta, sin foto) entre el 1.º y el 2.º Formato 1: ya no hay banner suelto en medio. Alto de página 7773 px a 1280 px. | `f-ritmo-c-d1280.png` |
| Misma familia visual; no más de dos formatos nuevos | **cumple** | Mismas tipografías, filetes y espaciado; solo `trio` y `textos` son formatos nuevos. | — |
| Mobile | **sin cambios** | Con `ritmo=b` y `c` el home mobile mide lo mismo que con `actual` (12276 px). | — |
| Rendimiento con los bloques ocultos | **cumple** | Las fotos de los bloques ocultos son lazy y no se descargan. LCP del index con `actual`: 2,18 a 2,48 s (5 corridas); `b` 2,42 s; `c` 2,47 s; CLS 0,0000 a 0,0001. | — |

## Mediciones (`tools/perf.mjs`: 390 px, CPU ×4, red 1,6 Mbps / 150 ms, scroll hasta el final)
| Página | LCP | CLS |
|---|---|---|
| index | 2,05 a 2,41 s antes de F (4 corridas: 2,41 · 2,33 · 2,05 · 2,33); 2,18 a 2,48 s después de F (5 corridas: 2,38 · 2,33 · 2,18 · 2,48 · 2,38) | 0,0000 |
| seccion | 1,64 s | 0,0000 |
| nota-413361 | 1,98 s | 0,0000 |
| diputados | 1,96 s | 0,0000 |
| senadores | 1,96 s | 0,0000 |
| legislador | 1,71 s | 0,0000 |
| Segunda tanda, después de F (otra sesión de la máquina): seccion 2,04 s · nota 2,26 s · diputados 2,14 s | 2,04 a 2,26 s | 0,0000 |
| index con `font=merriweather` | 2,08 s | 0,0000 |
| index con `font=literata` | 2,06 s | 0,0029 |

Nota: las páginas que F no toca (seccion, nota, diputados) también subieron 0,2 a 0,4 s entre tandas, así que la variación entre sesiones es de ese orden; todas siguen por debajo de 2,5 s salvo alguna corrida suelta del index.

## Peso de fuentes y CSS
- Por defecto se descargan **Source Serif 4 (49,7 KB) + Inter (47,1 KB) = 96,8 KB** (woff2 variable, `font-display: swap`, las dos precargadas).
- Alternativas (solo si se eligen): Merriweather 95,3 KB, Literata 38,1 KB. Con `font=merriweather` se descarga además la Source Serif precargada, que no se usa (se puede quitar el preload si Juan elige otra).
- `main.min.css`: 46,1 KB (9,8 KB comprimido con gzip).
- El LCP medido es el de una red lenta emulada; Lighthouse da valores más altos (ver README).

## v2.3.1 · cambios pedidos después de aprobar G y F
Medido con `tools/audit-v231.mjs` (resultados crudos en `tools/audit-v231.json`). Un commit por punto, sin push.

| # | Pedido | Resultado | Motivo / medición | Captura |
|---|---|---|---|---|
| 1 | Un solo rodante horizontal en desktop; el banner de Banco Provincia es una slide más | **cumple** | Home 1280 px: 0 banners horizontales sueltos visibles; 1 rodante horizontal con 7 slides (la primera es `410410.gif`, Banco Provincia), 2 flechas y 7 puntos; la flecha "siguiente" avanza de la slide 0 a la 1. El rodante de cuadrados sigue aparte (1 módulo). Bloques visibles: tapa, legisladores, 2 Formato 1, legisladores, línea, Formato 2, cuadrados, horizontal, línea, secciones. | `h-rodante-horizontal-d1280.png` |
| 2 | Lateral de nota, perfil y sección: un solo banner, 300×250 máx., sticky, sin placeholders, logo contenido | **cumple** | En las tres páginas hay 1 bloque de publicidad visible de 300×250, fondo transparente, `object-fit: contain`, imagen cargada y `position: sticky` (en la nota el wrapper de la columna, o el banner solo si la ventana mide ≤ 960 px de alto). En la nota queda a 120 px del borde tras bajar (ventana de 900 px). | `h-nota-d1280.png`, `h-seccion-d1280.png`, `h-perfil-d1280.png` |
| 3 | Pie de foto sin cambios | **cumple** | La nota conserva su `figcaption`; el home tiene 0 visibles. | — |
| 4 | Barra superior solo con fecha y Buscar | **cumple** | La barra dice "Lunes 16 de noviembre de 2026 · Buscar" en home, sección, nota, listado y perfil; 0 enlaces Diputados/Senadores en la barra; siguen en el menú principal. | `h-topbar-d1280.png` |
| 5 | Mobile: toda la publicidad al final, después de la franja de secciones, 300×300, rodando, sin títulos ni rótulos | **cumple** | En 360, 390 y 412 px: rodante cuadrado de 300×300 (1 slot visible) y banner horizontal después de la franja de secciones (p. ej. secciones en 7484 px, rodante en 10907 px y banner en 11255 px a 390); 0 caracteres de texto en la publicidad; sin scroll horizontal. El rodante horizontal de desktop queda oculto. Los slots intercalados en `seccion.html` (cada 10 notas) no se movieron. | `h-mobile-publicidad-al-final-m390.png` |
| Bonus | "Leé también": etiqueta en una línea y títulos más cortos | **cumple** | Columna de 348 px (la nota pasa de 866 a 812 px de ancho); las 4 etiquetas ocupan 1 línea; títulos de 4, 3, 3 y 4 líneas (antes 6 a 8), completos. | `h-leetambien-d1280.png`, `h-nota-d1280.png` |

Pendiente de probar en un teléfono real: el deslizamiento del rodante 300×300 (ya figuraba así). LCP y CLS medidos de nuevo con `tools/perf.mjs` (mobile 390 px, CPU ×4, 1,6 Mbps / 150 ms): index 2,08 a 2,39 s, seccion 1,78 s, nota 2,08 s, diputados 1,90 s, senadores 1,89 s, legislador 1,83 s; CLS 0,0000 en todas salvo legislador (0,0002). Detalle en el README.

## v2.3.2 y v2.3.3 · rodante en el 1.º Formato 1 y publicidad de las páginas interiores
Medido en 1280 y 390 px con Playwright (`tools/audit-v233-lateral.mjs`, `audit-v233-final.mjs`, `audit-v233-slots.mjs`; el comprobador del home se corrió suelto). Las comprobaciones de laterales de `audit-v231.mjs` (`.adbox`) quedaron obsoletas: las reemplazan las de v233.

| # | Pedido | Resultado | Motivo / medición | Captura |
|---|---|---|---|---|
| H | Rodante horizontal en el medio del 1.º Formato 1, sin duplicado | **cumple** | Home 1280: 1 rodante horizontal visible, dentro de `.f1--ad`, de 1208 px (ancho de la grilla) entre las dos filas; 25 px sobre él y 24 px bajo él, con filete arriba y abajo y sin hueco doble; filas de notas en 1539 px y 2226 px. Ya no está después de los cuadrados. Mobile: 0 horizontales visibles en el flujo (la publicidad sigue al final). | `i-home-completo-d1280.png`, `i-f1-con-rodante-d1280.png` |
| H | `ritmo=b` y `c` | **cumple** | `b`: el 2.º Formato 1 se reemplaza por el trío y el rodante sigue en el 1.º. `c`: orden Formato 1, bloque de texto, Formato 1. | `i-home-ritmo-b-d1280.png`, `i-home-ritmo-c-d1280.png` |
| 1 | Lateral = rodante de cuadrados, 300×250, sticky, puntos y flechas, sin rótulos | **cumple** | En nota, seccion, perfil, diputados y senadores: 1 lateral visible de 300×250, 16 slides, 16 puntos y 2 flechas, `object-fit: contain`, 0 caracteres de texto, sticky; la flecha avanza de la slide 0 a la 1 y la activa tiene imagen cargada. 0 restos de la versión vieja (`.adbox`). Diputados y senadores mantienen 4 columnas. | `j-nota-d1280.png`, `j-seccion-d1280.png`, `j-perfil-d1280.png`, `j-diputados-d1280.png` |
| 2 | Rectangular al final, debajo de todo y antes del pie | **cumple** | Las 5 páginas a 1280: rodante de 7 slides, 1180 × 90 px (el ancho completo del contenido es 1208), antes del pie y sin texto. | `j-nota-d1280.png` |
| 3 | Mobile: cuadrados 300×300 y rectangular juntos al final, en ese orden | **cumple** | 390 px en las 5 páginas: cuadrado de 300×300, rectangular de 358×64 debajo, orden cuadrado → rectangular, antes del pie, sin texto y sin scroll horizontal. | `j-nota-m390.png`, `j-seccion-m390.png`, `j-perfil-m390.png` |
| 4 | `seccion.html` mobile: slots cada 10 notas = rodante de cuadrados | **cumple** | 1 slot a las 10 notas, rodante de 300×300; tras 4 cargas de scroll infinito hay 5, todos rodantes inicializados y ninguno suelto; el último rota con la flecha y carga su imagen. En desktop no se ven. | `j-seccion-m390.png` |
| 5 | Afuera: home y "Anunciantes" del home | **cumple** | No se tocaron (rodante de cuadrados del home sin cambios). | — |

Mediciones de LCP y CLS después de estos cambios (390 px, CPU ×4, 1,6 Mbps / 150 ms): index 2,01 s (corridas sueltas 2,02 y 1,99), seccion 1,84, nota 1,87, diputados 1,72, senadores 1,88, legislador 1,48; CLS 0,0000 en todas.
