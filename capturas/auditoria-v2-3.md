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
| 3 | Desktop: Diputados y Senadores como dos módulos grises separados por un bloque de noticias, más chicos, solo nombre y bloque | **cumple** | Orden medido: Diputados, Formato 1, banner, Formato 1, Senadores. Fondo `rgb(238,238,238)`, 213 px de alto cada uno, retratos de 72 px, tarjetas con nombre y bloque (Fuerza Patria, La Libertad Avanza, PRO, UCR...). Sin "Diputados · Bloque D". | `g-legisladores-d1280.png` |
| 4a | Franja final: una nota menos por columna | **cumple** | 3 notas por columna (antes 4). | `g-franja-d1280.png` |
| 4b | "Ver más" con flecha sin borde; `vermas=boton` lo devuelve | **cumple** | Borde 0 px y flecha →; con `?vermas=boton` el borde es de 1 px. | `g-franja-d1280.png` |
| 5a | Títulos más gruesos (default 800) | **cumple** (tras la corrección 1) | Peso computado 800 en tarjetas, tapa y título de la nota. | `g-home-d1280.png` |
| 5b | Tres alternativas por `font` | **cumple** | `actual` = Source Serif 4, `merriweather`, `literata`: las tres se aplican a 800. | — |
| 5c | Tamaños un poco mayores; cuerpo de la nota más grande | **cumple** | Cuerpo de la nota 22 px en desktop y 20 px en mobile, interlineado 1,6. Títulos de tarjeta 24 px, tapa 46 px. | `g-nota-d1280.png` |
| 6a | Dos páginas con pestañas cruzadas, buscador por nombre y filtro por bloque | **cumple** | `diputados.html` (16) y `senadores.html` (8); pestañas "Diputados \| Senadores" con la activa marcada. Buscar "SOFÍA" da 1 resultado (sin distinguir acentos ni mayúsculas); bloque UCR da 4. Sin filtro por partido y sin carrusel. Tarjetas: foto, nombre y bloque. | `g-diputados-d1280.png` |
| 6b | Perfil con bloque, mandato, sección electoral y ciudad | **cumple** | "Bloque Fuerza Patria · Mandato 2023 a 2027 · Sección electoral Segunda · Ciudad Mar del Plata". Biografía con leer más, compartir y copiar link. Un perfil sin biografía no muestra bloque vacío. Publicidad en columna lateral sticky de 300 px. | `g-perfil-d1280.png` |
| 7a | Nota: cintillo arriba, bajada, fecha sin hora y sección debajo de la foto, sin "LA PLATA" | **cumple** | Fecha "23 de octubre de 2026" (sin hora), debajo de la foto, con la etiqueta de sección. El pie de foto se conserva. 0 apariciones de "LA PLATA" en las 44 notas. | `g-nota-d1280.png` |
| 7b | Compartir en gris, sin colores de marca | **cumple** | WhatsApp, Facebook, X, Instagram, Telegram y copiar link, todos `rgb(243,243,243)` con texto `rgb(68,68,68)`. | `g-nota-d1280.png` |
| 7c | Publicidad y "Leé también" al costado, fijos, con títulos completos | **cumple** | Columna lateral `position: sticky`; tras bajar 1800 px queda a 120 px del borde. Los 4 títulos de "Leé también" se ven enteros. Sin banner debajo de la nota en desktop. | `g-nota-d1280-scroll.png` |
| 7d | Elementos de la nota que no aportan | **pendiente de OK** | Lista en `nota-elementos-dudosos.md`; no se borró nada. | `d-nota-meta-1280.png` |
| 8a | Mobile: líneas finas entre tarjetas | **cumple** | Los 3 flujos del home tienen borde de 1 px (`--filete-suave`) entre tarjetas, en 360, 390 y 412 px. | `g-home-m390.png` |
| 8b | Mobile: ninguna bajada | **cumple** | 0 bajadas visibles en el home y en la sección interna. La nota conserva la bajada. | `g-home-m390.png` |
| 8c | Mobile: Formato 2 con tarjeta chica y foto al costado | **cumple** | Foto de 96×72 a la derecha del texto en 360, 390 y 412 px. | `g-home-m390.png`, `e-tapa2-chica-390.png` |
| 8d | Mobile: banner 300×300 rodante, sin textos | **cumple** | Slot de 300×300 en los tres anchos, sin título ni rótulo; rotación y swipe por JS. El swipe no se probó en un teléfono físico. | `g-home-m390.png` |
| 8e | Mobile: sin scroll horizontal ni saltos | **cumple** | Sin scroll horizontal en home, nota y sección (360, 390, 412). CLS 0. Diputados y Senadores consecutivos. | — |
| 9 | CLS < 0,1 y LCP medidos de nuevo | **cumple** | Ver "Mediciones" abajo. | — |
| 10 | Panel `?demo=1`, "Copiar link" y README al día | **cumple** | El panel tiene `seccion`, `tapa2`, `tapa`, `vermas`, `bajada`, `peso`, `font` y los demás; "Copiar link" arma la URL con todos. README con parámetros y constantes. | — |

## Mediciones (`tools/perf.mjs`: 390 px, CPU ×4, red 1,6 Mbps / 150 ms, scroll hasta el final)
| Página | LCP | CLS |
|---|---|---|
| index | 2,05 a 2,41 s (4 corridas: 2,41 · 2,33 · 2,05 · 2,33) | 0,0000 |
| seccion | 1,64 s | 0,0000 |
| nota-413361 | 1,98 s | 0,0000 |
| diputados | 1,96 s | 0,0000 |
| senadores | 1,96 s | 0,0000 |
| legislador | 1,71 s | 0,0000 |
| index con `font=merriweather` | 2,08 s | 0,0000 |
| index con `font=literata` | 2,06 s | 0,0029 |

## Peso de fuentes y CSS
- Por defecto se descargan **Source Serif 4 (49,7 KB) + Inter (47,1 KB) = 96,8 KB** (woff2 variable, `font-display: swap`, las dos precargadas).
- Alternativas (solo si se eligen): Merriweather 95,3 KB, Literata 38,1 KB. Con `font=merriweather` se descarga además la Source Serif precargada, que no se usa (se puede quitar el preload si Juan elige otra).
- `main.min.css`: 46,1 KB (9,8 KB comprimido con gzip).
- El LCP medido es el de una red lenta emulada; Lighthouse da valores más altos (ver README).
