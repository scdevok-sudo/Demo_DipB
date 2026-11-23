# Auditoría v2.5 · inicio según "DISEÑO DB.pdf" de Juan

Se compara la maqueta (`index.html`, `home=pdf`, a 1280 px, con los parámetros por defecto) contra el brief `brief-maqueta-v2-5-diseno-db-desktop.md` y las 6 páginas del PDF. El PDF usa capturas viejas y notas de otros medios: solo se toma como referencia de estructura (sección 0 del brief). Capturas en esta misma carpeta.

Resultado: **cumple** en todo. Lo único que sigue pendiente depende de Juan (ver el final). Última revisión: commit "v2.5 ajustes auditoría", que corrigió `texto3`, `grilla4`, la encuesta y el contador.

## Página 1 del PDF · franja, tapa y módulo Diputados

| Punto del PDF / brief | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| "Contador de sesiones" (solo nombrado, sin diseño) | Franja arriba de la tapa con "Sesiones 2026 · Diputados 38 · Senado 24", "Última sesión: jueves 29 de octubre · Diputados" y "Próxima sesión: jueves 26 de noviembre · Senado" (datos de fantasía de `data/sesiones.json`; la última en el pasado y la próxima en el futuro). Marcada "Diseño a definir" solo con `?demo=1`. Altura 84 px (el brief pedía ≲ 160). Mobile: una línea con la próxima sesión | **Cumple** | `aud5-01-franja-d1280.png`, `y-franja-d1280-demo.png`, `y-franja-m390-top.png` |
| "Encuestas" (solo nombrado) | Pregunta neutra con 3 opciones: se elige una (queda marcada con ✓ y un aro, contraste 5,4:1) y se confirma con el botón "Votar" (deshabilitado hasta elegir; área tocable de 45 px). Después aparecen las barras con porcentaje en la misma celda, y la franja mantiene su alto (84 px desktop, 83 px la encuesta en mobile). El voto vive solo en memoria | **Cumple** | `ajaudit-franja-seleccion-d1280.png`, `ajaudit-franja-votada-d1280.png`, `ajaudit-franja-seleccion-m390.png`, `ajaudit-franja-votada-m390.png` |
| Tapa: foto a la izquierda, texto a la derecha | `tapa=foto-izq` es el default de `index.html`. Cintillo, título grande y bajada. Sin pie de foto ni "LA PLATA" | **Cumple** | `aud5-02-tapa-d1280.png` |
| Las dos notas chicas: título arriba de la foto (flechas rojas) | Cintillo y título arriba, foto debajo, bajada al final, alineados entre las dos columnas | **Cumple** (con la interpretación del brief; sigue sin confirmar con Juan) | `aud5-02-tapa-d1280.png` |
| Línea fina horizontal entre la nota grande y las dos chicas (línea roja) | Filete de 1 px entre la nota grande y la fila | **Cumple** (misma interpretación) | `aud5-02-tapa-d1280.png` |
| Módulo Diputados (gris y chico de v2.3, no el celeste del PDF) | Módulo gris con retratos de fantasía, sin la marca "FOTO DE EJEMPLO" del PDF | **Cumple** | `aud5-04-modulo-diputados-d1280.png` |

## Página 2 · uno-dos, espejo y rodante

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Una grande y dos chicas, dos columnas con filete vertical (≈ 55 / 45) | `uno-dos`: grande con foto 2:1, cintillo, título de 29 px y autor; dos chicas apiladas con texto a la izquierda y foto cuadrada a la derecha; filete fino entre ellas | **Cumple** | `aud5-03-unodos-d1280.png` |
| Bloque rotado 180° | Se interpretó como "espejado": `uno-dos-espejo` con la grande a la derecha y las chicas a la izquierda con la foto a la izquierda | **Cumple** (con la interpretación del brief; sigue sin confirmar con Juan) | `aud5-05-unodos-espejo-d1280.png` |
| Sin bajadas ni pie de foto | Ninguna de las dos variantes tiene bajada ni pie | **Cumple** | `aud5-03…`, `aud5-05…` |
| Rodante horizontal "Construí tu futuro" con rótulo "PUBLICIDAD" | Rodante de banners horizontales de 90 px, sin rótulo, después del espejo | **Cumple** | `aud5-06-rodante-horizontal-d1280.png` |
| Contenido de otros medios (La Nación, Infoplatense, Ámbito…) | No se copió: notas, fotos y autores de la maqueta (autores de fantasía) | **Cumple** | `aud5-03…` |

## Página 3 · Formato 2, anunciantes, Senadores y recomendadas

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Formato 2 con 4 notas de Diputados | 2 × 2 notas de Diputados, foto a la izquierda, fondo suave | **Cumple** | `aud5-07-formato2-diputados-d1280.png` |
| Anunciantes cuadrados, rótulos "Anunciantes" y "PUBLICIDAD" | Rodante de 4 banners cuadrados sin ningún rótulo | **Cumple** (el brief ordena sacar los rótulos) | `aud5-08-anunciantes-d1280.png` |
| Módulo Senadores y segundo Formato 2 con notas del Senado | Módulo gris y 4 notas del Senado, en ese orden | **Cumple** | `aud5-09-modulo-senadores-d1280.png`, `aud5-10-formato2-senadores-d1280.png` |
| Recomendadas: exactamente 3 notas, título de bloque con filete, "Por autor" (decisión v2.5.4: sin autores, pedido de Santi), foto debajo | 3 notas fijas desde `data/recomendadas.json`, fondo crema `--recomendadas-bg`, filete de acento, autor y foto 16:10. El título dice "de la semana" (el PDF dice "del sábado"; manda el brief) | **Cumple** | `aud5-11-recomendadas-d1280.png`, `w-recomendadas-d1280.png` |

## Página 4 · noticias comunes y franja de secciones

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Grilla de 3 columnas × 2 filas, tarjeta con sombra suave, foto 16:9, título, "Por autor" (decisión v2.5.4: sin autores, pedido de Santi) | Igual; cintillo arriba del título y sin la mini-etiqueta en mayúsculas del PDF ni etiqueta de sección sobre la foto (pedido de Santi) | **Cumple** | `aud5-12-grilla3-d1280.png`, `x-grilla3-d1280.png` |
| Franja final Congreso / Nación / Provincia / Municipios, una nota menos por columna | 4 columnas con 1 nota con foto + 2 de texto y "Ver más" | **Cumple** | `aud5-13-franja-secciones-d1280.png` |

## Página 5 · súper destacadas (opcionales)

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Súper destacada 1: título ARRIBA de la foto, foto muy apaisada, flechas y puntos, 2 a 3 notas | `super=1`: carrusel de 3 notas, cintillo y título arriba, "Por autor" (decisión v2.5.4: sin autores, pedido de Santi), foto de 430 px de alto (≈ 2,8:1 a 1280), flechas oscuras con borde blanco, puntos, teclado ←/→, altura fija. Bloque de ~605 px | **Cumple.** Decisión: el valor del parámetro es `1` y no `foto` (alias `foto` → `1`) | `z-s1-d1280.png`, `z-s1-m390.png` |
| Súper destacada 2: solo texto, título centrado y grande, autor chico, filete arriba y abajo | `super=2`: cintillo, título de hasta 58 px centrado, "Por autor" (decisión v2.5.4: sin autores, pedido de Santi), entre dos filetes | **Cumple.** Decisión: `2` pasó a significar solo esto (antes apilaba las dos); documentado en el README | `z-s2-d1280.png`, `z-s2-m390.png` |
| Apagadas por defecto | `super=off` por defecto; no alteran el reparto de notas del home | **Cumple** | — |

## Página 6 · otros recursos posibles (opcionales)

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Texto en 3 columnas: cintillo, título en negrita, autor, filete fino arriba y abajo de cada columna | `texto3=1`: 3 columnas con cintillo, título y "Por autor" (decisión v2.5.4: sin autores, pedido de Santi); cada una con un filete de 1 px arriba y otro abajo; sin etiqueta de sección | **Cumple** | `z-t3-d1280.png`, `z-t3-m390.png` |
| Grilla de 4 columnas × 2 filas: foto cuadrada, título en negrita con la primera frase destacada, autor, filetes verticales entre columnas | `grilla4=1`: 4 × 2, foto cuadrada, título con la primera frase en negrita 800 y el resto en 500 (hasta el primer `:` o `.`, o las 4 primeras palabras), "Por autor" (decisión v2.5.4: sin autores, pedido de Santi), filetes verticales de 1 px entre columnas, sin sombra. Mobile: 1 columna con foto 16:9, máximo 3 tarjetas | **Cumple** (Santi corrigió la instrucción de sombra de la etapa G) | `z-g4-d1280.png`, `z-g4-m390.png` |
| Disponibles en el flujo, no activados | Están en `FLOW_PDF` con el parámetro en `off` | **Cumple** | — |

## Reglas generales del brief

| Criterio | Resultado | Evidencia |
|---|---|---|
| Flujo de la sección 2 en orden a 1280 y 1440; `home=anterior` conserva el anterior | **Cumple** (13 bloques en el orden del brief) | todas las capturas `aud5-*` |
| Sin pie de foto, "LA PLATA", "Anunciantes", "PUBLICIDAD" | **Cumple:** 0 `figcaption`; sin rótulos. Había dos notas con cintillo "La Plata" que funcionaba como dateline (colectora de Exaltación de la Cruz y despidos en Campana): se cambiaron por "Obra pendiente" y "Conflicto laboral". Quedan otras dos en `cintillos.json` (411370 y 412755) pero esas notas no están publicadas | `h-home-m390-completo.png` |
| Sin contenido de otros medios ni nombres de encuestadoras | **Cumple:** búsqueda en `index.html`, `index-anterior.html` y los JSON de datos (medios, encuestadoras y los autores y notas del PDF): 0 resultados. Las notas, fotos y banners son los de la muestra del propio sitio. **Ojo:** esas notas nombran políticos reales (son las notas reales del sitio, no inventadas) | ver README, "Contenido" |
| Sin scroll horizontal en 360, 390, 412, 1280 y 1440 | **Cumple** (60 combinaciones: 2 homes × 6 variantes × 5 anchos, todas en 0, repetido después de los ajustes) | — |
| CLS < 0,1 y LCP re-medido con `tools/perf.mjs` | **Cumple.** Desktop (`DESKTOP=1`, sin throttling): 1280 px LCP 0,44 a 0,52 s, CLS 0,0021; 1440 px LCP 0,45 a 0,48 s, CLS 0,0018. Mobile (CPU 4x, 4G lenta): LCP 2,14 s, CLS 0,0001 | README, "Rendimiento v2.5" |
| Anti-repetidas | **Cumple:** el build falla si un id se repite; hoy dice "sin notas repetidas en el home" | `node build.mjs` |
| Panel `?demo=1`, "Copiar link" y README al día | **Cumple** (`home`, `tapa`, `super`, `texto3`, `grilla4`; README con la sección v2.5) | README |
| Contraste AA | **Cumple.** Re-medido después de los ajustes en `texto3` y `grilla4`, a 1280 y a 390 px, con el color de texto calculado contra el fondo real (blanco): cintillo 4,87:1 (azul `--brand-blue`, 14 a 20 px, peso 600); "Por autor" (decisión v2.5.4: sin autores, pedido de Santi) 4,87:1 (13 px, peso 600); título 15,91:1 (`--ink`, 22 px en `texto3` y 17 px en `grilla4`); primera frase destacada de `grilla4` 15,91:1 (17 px, peso 800); resto del título 15,91:1 (peso 500). Mínimo de los dos bloques: 4,87:1, por encima de 4,5:1. Resultado idéntico en desktop y mobile (mismos colores y fondo blanco). Antes: 4,87:1 en los bloques nuevos; flechas del carrusel ≥ 3:1 contra la foto; opción de encuesta seleccionada 5,4:1 | método: `getComputedStyle` de cada elemento visible, fondo compuesto subiendo por los ancestros |
| Mobile (sección 9, propuesta) | **Cumple** con lo propuesto: contador en una línea, encuesta como tarjeta, uno-dos compacto, recomendadas apiladas, grilla de 3 en 1 columna (3 tarjetas), súper al ancho con título arriba. Zonas tocables ≥ 44 px, aire ≤ ~24 px | `h-home-m390-completo.png`, `v-unodos-m390.png`, `w-recomendadas-m390.png`, `x-grilla3-m390.png`, `y-franja-m390-top.png`, `y-franja-m390-encuesta.png` |

## Pendientes (dependen de Juan)

1. Confirmar la interpretación de las marcas rojas de la tapa: título arriba de la foto en las dos notas chicas y filete fino entre la grande y la fila.
2. Confirmar que el bloque rotado 180° de la página 2 significa "espejado".

## Decisiones tomadas (no son desvíos)

- Los valores de `super` son `1` y `2` en lugar de `foto` y `texto` (con alias para los links viejos); `super=2` cambió de significado.
- El título de la tarjeta chica del uno-dos "Nanni exige la finalización de la colectora…" ocupa 6 líneas a 360 y 390 px y 5 a 412 px; Santi decidió dejarlo así, sin acortar el título.

## v2.5.1 · cambios de Santi sobre la v2.5 (un commit por punto, sin push)

Estos cambios reemplazan lo que dicen las tablas de arriba sobre la franja de sesiones y encuesta (ahora apagada por defecto), el fondo crema de las recomendadas, la pastilla amarilla y la posición de la nota grande del primer uno-dos. Capturas nuevas en `capturas/v251-*.png` (tapa mobile 390, tapa desktop 1280, recomendadas, módulo Diputados, uno-dos 1 y 2, franja de secciones mobile 390).

| Punto | Qué se hizo | Medición |
|---|---|---|
| 1 · Foto de la tarjeta compacta mobile (franja de secciones, Formato 2, uno-dos chica) | Foto por ancho de pantalla con la variable `--chica-foto`: 38 % desde 412 px, 36 % de 390 a 411, 34 % de 375 a 389, 32 % hasta 374. Un 36 % único o 38 % único hacían que el título de Nanni pasara de 6 líneas en 360 y 390 | Líneas máximas de título a 360 / 390 / 412: franja de secciones 5 / 5 / 5, Formato 2 5 / 5 / 5, uno-dos chica 6 / 6 / 6 (Nanni 6 / 6 / 6). `tools/audit-v251-fotochica.mjs` |
| 2 · Nota principal de la tapa | Mobile: foto a ancho completo 4:3, título 28 px, peso 700, interlineado 1,15. Desktop (1280 y 1440): foto 65/35 (63 % del bloque), título 52 px (46 px entre 1024 y 1263), bajada 22 px (20 px), texto centrado respecto de la foto | `tools/audit-v251-aire.mjs` |
| 3 · Franja de sesiones y encuesta | Apagada por defecto en desktop y mobile (también la encuesta mobile); `franja=1` la enciende. Código y JSON intactos; está en el panel `?demo=1`, en "Copiar link" y en el README | `tools/test-v251-franja.mjs`: elegir, "Votar", barras 42 / 27 / 31 %, alto de la encuesta estable (72 → 72 px mobile, 33 → 33 desktop). El build sigue diciendo "sin notas repetidas en el home" |
| 4 · Menos blanco en la tapa | Ver la tabla de abajo | |
| 5 · Sin amarillo | `--recomendadas-bg` #fbf1e3 → **#edf3f8**; pastilla "FOTO DE EJEMPLO" #fff3c4 → #d7e6f2 con texto `--ink`; además el aviso `.notice` de los perfiles (amarillo), `--paper-tint` #f6f3ee (crema, ahora #f3f5f7) y los puntos del rodante (#b9b3a8, ahora #b8bec4). Ya no queda ningún amarillo ni crema en CSS, JS, build ni HTML | Contraste sobre el fondo elegido (cintillo y "Por autor" (decisión v2.5.4: sin autores, pedido de Santi) con `--brand-blue-dk`, 16 y 13 px, peso 600): **4,82:1**; etiqueta de sección sobre la foto 4,87:1; título 14,23:1. Con #e8f0f6 daba 4,68:1 (también pasaba). Se eligió #edf3f8 por el margen. Pastilla 12,49:1. `tools/audit-v251-contraste.mjs` |
| 6 · Uno-dos | Las dos instancias con la nota grande a la derecha, con notas distintas en cada una (413216, 412334, 413203 y 413192, 413105, 412689); `unodos=alterna` vuelve al PDF. Mobile sin cambios (grande arriba) | `tools/test-v251-unodos.mjs` |

**Aire de la tapa, antes (v2.5) y después (v2.5.1):**

| Medida | 390 px antes | 390 px después | 1280 px antes | 1280 px después |
|---|---|---|---|---|
| Padding superior del bloque | 12 | 12 | 24 | 12 |
| Padding inferior del bloque | 12 | 12 | 24 | 12 |
| Padding bajo la nota principal (hasta el filete) | 12 | 12 | 24 | 16 |
| Aire arriba del cintillo (desde el elemento anterior) | 12 | 11 | — | — |
| Cintillo → título | 4 | 4 | — | — |
| Título → foto | 12 | 12 | — | — |
| Margen lateral de la foto | 0 (a ancho completo) | 0 | 36 | 20 |
| Aire del texto respecto de la foto, arriba y abajo | — | — | 82 y 82 | 17 y 17 |

(En mobile el aire ya cumplía ≤ 12 px; se dejó fijado. En desktop el bloque de la tapa sale 16 px a cada lado solo desde 1264 px de ancho, y la foto pasó de 3:2 a 5:3.)

**Controles de siempre** (`tools/audit-v251.mjs`, default y con `franja=1`, `unodos=alterna`, `super=1` y `super=2&texto3=1&grilla4=1`) en 360, 390, 412, 1280 y 1440: sin scroll horizontal; 0 `figcaption`, sin "LA PLATA", "PUBLICIDAD" ni "Anunciantes"; contraste mínimo del texto del home 4,59:1 (ningún texto bajo AA); en mobile 0 zonas tocables menores de 44 px (se corrigieron las flechas y los puntos del rodante de anunciantes, que medían 32 y 22 × 20 px) y ningún espacio entre bloques sobre 24 px. Rendimiento (`tools/perf.mjs`): mobile LCP 2,03 a 2,05 s y CLS 0,0000; desktop 1280 LCP 0,36 a 0,41 s y CLS 0,0021; 1440 LCP 0,38 a 0,42 s y CLS 0,0018.

## v2.5.2 · alineación, aire de la publicidad y rodante de cuadrados (un commit por punto, sin push)

Capturas en `capturas/v252-*.png`: tapa 1280 y 1440, recomendadas 1280, grilla de 3 (1280 y 1440), publicidad antes de la franja de secciones 1280 y el tramo Formato 2 Diputados a Senadores 1280.

| Punto | Qué se hizo | Medición |
|---|---|---|
| 1 · Alineación arriba entre columnas | Tapa: las dos notas chicas arrancaban con `align-self:end` (cintillo y título pegados abajo de su celda); ahora arrancan arriba y el aire extra queda debajo del título más corto, con la foto alineada por la subgrid. Recomendadas y grilla de 3: cintillo y título arriba y "Por autor" (decisión v2.5.4: sin autores, pedido de Santi) al pie del texto (`margin-top:auto`), igual entre columnas. Uno-dos: la foto grande y el cintillo de la primera chica ya arrancaban a la misma altura | `tools/audit-v252-alinea.mjs`, 1280 y 1440: diferencia de alto entre columnas 0 px en cintillo, título, autor y foto. Títulos de distinto largo: tapa 3 / 2 líneas, grilla 3 fila 1 con 3 / 2 / 3 líneas |
| 2 · Aire de la publicidad (desktop) | Rodante horizontal: 24 px arriba y 40 abajo de padding. Rodante de cuadrados: 40 px arriba y abajo, y 24 / 16 en su lugar nuevo. Mobile sin cambios | `tools/audit-v252-publi.mjs`, contenido a contenido: rodante horizontal 48 arriba y 64 abajo (40 hasta el borde del fondo gris); cuadrados 46 arriba y 40 abajo hasta la doble línea. Mobile: 20 y 20 |
| 3 · Rodante de cuadrados | Sale de entre el Formato 2 de Diputados y el módulo Senadores y va después de la grilla de 3 (y de `texto3` / `grilla4` si están encendidas), justo antes de la doble línea y la franja de secciones. `FLOW_PDF` y el README actualizados; `FLOW_MOBILE_PDF` no cambia | Orden a 1280: … recomendadas > grilla3 > publicidad > doble línea > franja de secciones. Mobile: …> franja de secciones > publicidad > banner. `index-anterior.html`: orden y espacios idénticos a antes, 0 overflow a 360 y 1280 y 0 errores de consola (las reglas nuevas se acotaron con `html:not([data-home="anterior"])`) |

**Controles de siempre** (`tools/audit-v251.mjs`, por defecto y con `franja=1&unodos=alterna&texto3=1&grilla4=1`) en 360, 390, 412, 1280 y 1440: 0 px de overflow horizontal, 0 `figcaption`, sin rótulos "PUBLICIDAD" ni "Anunciantes", contraste mínimo 4,59:1 (ningún texto bajo AA), 0 zonas tocables menores de 44 px en mobile, aire entre bloques en mobile ≤ 24 px, build con "sin notas repetidas en el home". Rendimiento (`tools/perf.mjs`): mobile LCP 1,97 y 2,04 s, CLS 0,0000; desktop 1280 LCP 0,40 y 0,41 s, CLS 0,0021; 1440 LCP 0,38 y 0,40 s, CLS 0,0018.

## v2.5.3 · nota principal de las páginas de sección (un commit, sin push)

`seccion.html` es la única página con este componente (`.sec-tapa`: la nota principal con texto a la izquierda y foto a la derecha); los perfiles, `diputados.html`, `senadores.html` y los listados no lo usan, así que no se tocó nada ahí. Se aplicó la receta de la tapa (v2.5.1) solo en desktop (≥ 1024 px). Capturas: `capturas/v253-seccion-d1280.png` y `v253-seccion-d1440.png`.

| Medida (px) | 1280 antes | 1280 después | 1440 antes | 1440 después | 390 antes y después |
|---|---|---|---|---|---|
| Bajada de la sección → nota principal | 32 | 20 | 32 | 20 | 32 |
| Foto → doble línea de abajo | 49 | 21 | 49 | 21 | 12 |
| Aire del texto arriba / abajo de la foto | 82 / 82 | 23 / 23 | 82 / 82 | 23 / 23 | — |
| Foto (ancho × alto) | 686 × 457 (57 %, 3:2) | 741 × 395 (61 % del bloque, 63 % sin la separación) | igual | igual | 390 × 244 |
| Título | 46 px, 4 líneas | 46 px, 5 líneas | igual | igual | 27 px, 3 líneas |
| Alto del bloque | 482 | 396 | 482 | 396 | 525 |

**Decisiones por conflicto entre pedidos.** Con la foto al 63 % y en 5:3 (445 px de alto) el texto de esta nota ("Minnaard reclamó obras para Bahía Blanca ante la amenaza de El Niño") queda con 48 px de aire arriba y abajo, no 24. Para llegar a ~24 se llevó la foto a 15:8 (en vez de 5:3) y la bajada a 22 px, como en la tapa. Y la columna de texto, al ser más angosta (37 %), parte el título en 5 líneas a 46 px; a 44 px da 4 líneas pero el aire sube a 80 px. Se dejó 46 px y 5 líneas. Si se prefiere 4 líneas o 5:3 exactos, es un ajuste de una línea en el CSS.

Mobile: idéntico a antes (mismas medidas, 0 px de overflow horizontal a 360, 390 y 412). Controles de siempre en `seccion.html` a 360, 390, 412, 1280 y 1440: 0 px de overflow, 0 `figcaption`, contraste mínimo 4,87:1; rendimiento (`tools/perf.mjs`): mobile LCP 2,02 y 2,05 s, CLS 0,0000; desktop 1280 LCP 0,24 s, CLS 0,0038; 1440 LCP 0,28 s, CLS 0,0018. El home sigue con "sin notas repetidas en el home" (el build no cambió su reparto).

## v2.5.4 · decisión: sin autores, pedido de Santi

Se sacó todo autor visible del sitio: "Por autor" y el autor en mayúsculas grises en todas las tarjetas y bloques del home (tapa, uno-dos, módulos, Formato 2, recomendadas, grilla de 3, `grilla4`, `texto3`, súperdestacadas 1 y 2, franja de secciones), páginas de sección y listados. Las páginas de nota no tenían byline. Por eso, los puntos de arriba que mencionan "Por autor" quedaron anotados como "decisión v2.5.4: sin autores, pedido de Santi". `SHOW_AUTOR = false` en `build.mjs` y el parámetro `autores=1` (panel `?demo=1`, "Copiar link", README) los vuelven a mostrar; `data/autores.json` y la opción `by` siguen en el código.

- **Revisión de texto de autor:** en las 73 páginas HTML, con `autores` apagado y con `?autores=0`, ninguno de los 103 nombres de `autores.json` aparece en el texto visible; fuera de los `<span class="autor">` ocultos tampoco aparece en ningún lugar del HTML (no hay JSON-LD, `meta author` ni byline en las notas, ni autores en la búsqueda de legisladores). Una coincidencia con "Por Santa Cruz" en `nota-413239.html` es el nombre de un partido dentro del cuerpo de la nota, no un autor.
- **Alineación** (`tools/audit-v252-alinea.mjs`, 1280 y 1440): 0 px de diferencia en cintillo, título y foto entre columnas en tapa, uno-dos, recomendadas y grilla de 3; sin aire de más al pie de las tarjetas (no hizo falta ajustar alto ni padding).
- **Controles** en 360, 390, 412, 1280 y 1440 (`tools/audit-v251.mjs`, con autores apagados y con `autores=1`): 0 px de overflow horizontal, 0 `figcaption`, contraste mínimo 4,59:1, 0 zonas tocables menores de 44 px y aire entre bloques ≤ 24 px en mobile, "sin notas repetidas en el home". Rendimiento: mobile LCP 2,03 y 2,02 s, CLS 0,0000; desktop 1280 con CLS 0,0021. Capturas: `capturas/v254-tapa-d1280.png`, `v254-recomendadas-d1280.png` y `v254-home-m390.png`.
