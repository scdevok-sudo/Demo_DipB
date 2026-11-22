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
| Recomendadas: exactamente 3 notas, título de bloque con filete, "Por autor", foto debajo | 3 notas fijas desde `data/recomendadas.json`, fondo crema `--recomendadas-bg`, filete de acento, autor y foto 16:10. El título dice "de la semana" (el PDF dice "del sábado"; manda el brief) | **Cumple** | `aud5-11-recomendadas-d1280.png`, `w-recomendadas-d1280.png` |

## Página 4 · noticias comunes y franja de secciones

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Grilla de 3 columnas × 2 filas, tarjeta con sombra suave, foto 16:9, título, "Por autor" | Igual; cintillo arriba del título y sin la mini-etiqueta en mayúsculas del PDF ni etiqueta de sección sobre la foto (pedido de Santi) | **Cumple** | `aud5-12-grilla3-d1280.png`, `x-grilla3-d1280.png` |
| Franja final Congreso / Nación / Provincia / Municipios, una nota menos por columna | 4 columnas con 1 nota con foto + 2 de texto y "Ver más" | **Cumple** | `aud5-13-franja-secciones-d1280.png` |

## Página 5 · súper destacadas (opcionales)

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Súper destacada 1: título ARRIBA de la foto, foto muy apaisada, flechas y puntos, 2 a 3 notas | `super=1`: carrusel de 3 notas, cintillo y título arriba, "Por autor", foto de 430 px de alto (≈ 2,8:1 a 1280), flechas oscuras con borde blanco, puntos, teclado ←/→, altura fija. Bloque de ~605 px | **Cumple.** Decisión: el valor del parámetro es `1` y no `foto` (alias `foto` → `1`) | `z-s1-d1280.png`, `z-s1-m390.png` |
| Súper destacada 2: solo texto, título centrado y grande, autor chico, filete arriba y abajo | `super=2`: cintillo, título de hasta 58 px centrado, "Por autor", entre dos filetes | **Cumple.** Decisión: `2` pasó a significar solo esto (antes apilaba las dos); documentado en el README | `z-s2-d1280.png`, `z-s2-m390.png` |
| Apagadas por defecto | `super=off` por defecto; no alteran el reparto de notas del home | **Cumple** | — |

## Página 6 · otros recursos posibles (opcionales)

| Punto | Qué se hizo | Veredicto | Captura |
|---|---|---|---|
| Texto en 3 columnas: cintillo, título en negrita, autor, filete fino arriba y abajo de cada columna | `texto3=1`: 3 columnas con cintillo, título y "Por autor"; cada una con un filete de 1 px arriba y otro abajo; sin etiqueta de sección | **Cumple** | `z-t3-d1280.png`, `z-t3-m390.png` |
| Grilla de 4 columnas × 2 filas: foto cuadrada, título en negrita con la primera frase destacada, autor, filetes verticales entre columnas | `grilla4=1`: 4 × 2, foto cuadrada, título con la primera frase en negrita 800 y el resto en 500 (hasta el primer `:` o `.`, o las 4 primeras palabras), "Por autor", filetes verticales de 1 px entre columnas, sin sombra. Mobile: 1 columna con foto 16:9, máximo 3 tarjetas | **Cumple** (Santi corrigió la instrucción de sombra de la etapa G) | `z-g4-d1280.png`, `z-g4-m390.png` |
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
| Contraste AA | **Cumple.** Re-medido después de los ajustes en `texto3` y `grilla4`, a 1280 y a 390 px, con el color de texto calculado contra el fondo real (blanco): cintillo 4,87:1 (azul `--brand-blue`, 14 a 20 px, peso 600); "Por autor" 4,87:1 (13 px, peso 600); título 15,91:1 (`--ink`, 22 px en `texto3` y 17 px en `grilla4`); primera frase destacada de `grilla4` 15,91:1 (17 px, peso 800); resto del título 15,91:1 (peso 500). Mínimo de los dos bloques: 4,87:1, por encima de 4,5:1. Resultado idéntico en desktop y mobile (mismos colores y fondo blanco). Antes: 4,87:1 en los bloques nuevos; flechas del carrusel ≥ 3:1 contra la foto; opción de encuesta seleccionada 5,4:1 | método: `getComputedStyle` de cada elemento visible, fondo compuesto subiendo por los ancestros |
| Mobile (sección 9, propuesta) | **Cumple** con lo propuesto: contador en una línea, encuesta como tarjeta, uno-dos compacto, recomendadas apiladas, grilla de 3 en 1 columna (3 tarjetas), súper al ancho con título arriba. Zonas tocables ≥ 44 px, aire ≤ ~24 px | `h-home-m390-completo.png`, `v-unodos-m390.png`, `w-recomendadas-m390.png`, `x-grilla3-m390.png`, `y-franja-m390-top.png`, `y-franja-m390-encuesta.png` |

## Pendientes (dependen de Juan)

1. Confirmar la interpretación de las marcas rojas de la tapa: título arriba de la foto en las dos notas chicas y filete fino entre la grande y la fila.
2. Confirmar que el bloque rotado 180° de la página 2 significa "espejado".

## Decisiones tomadas (no son desvíos)

- Los valores de `super` son `1` y `2` en lugar de `foto` y `texto` (con alias para los links viejos); `super=2` cambió de significado.
- El título de la tarjeta chica del uno-dos "Nanni exige la finalización de la colectora…" ocupa 6 líneas a 360 y 390 px y 5 a 412 px; Santi decidió dejarlo así, sin acortar el título.
