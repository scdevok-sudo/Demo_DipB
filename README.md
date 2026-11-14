# Maqueta v2.2 · Diputados Bonaerenses (diseño "diario", 2 formatos en el flujo, ajustes mobile del 12/11)

Maqueta estática, mobile first, sin frameworks. Todas las páginas llevan `noindex,nofollow`. No toca el WordPress.

## Cómo abrirla
- Servir la carpeta (`python -m http.server 8765`, `npx http-server .`, o subirla, ver "Publicar").
- Panel de variantes: **`/index.html?demo=1`** (botón flotante "Variantes", tocable en el celular).
- Regenerar el HTML: `node build.mjs` (lee `data/`; también genera `assets/css/main.min.css` a partir de `main.css`, que es la fuente).
- Capturas: `cd tools && node shots.mjs index,seccion d1440,m390 "diario=off"` (viewports `m360 m390 m412 t d1280 d1440`; avisa overflow horizontal y filas de 2 notas en mobile).
- Rendimiento: `cd tools && node perf.mjs` (ver "Rendimiento").

## Orden del home (desktop) y lista de bloques `FLOW`
```
cabecera (fecha · menú · doble línea)
[superdestacada opcional]
TAPA de 3
[legis=a] Diputados + Senadores (dos módulos)
FORMATO 1 (4 notas)
banner 1180×90
FORMATO 1 (4 notas más)
[legis=b] Diputados + Senadores (dos módulos)
─── doble línea ───
FORMATO 2 (8 notas, fondo suave)
Anunciantes
─── doble línea ───
franja de secciones (Congreso · Nación · Provincia · Municipios)
footer
```
19 notas en el flujo (3 + 4 + 4 + 8), cada nota se usa una sola vez. La secuencia es una lista en `build.mjs`:

```js
const FLOW = ['tapa','legis-a','f1','banner','f1','legis-b','linea','f2','anunciantes','linea','secciones'];
```
Bloques: `tapa · legis-a · legis-b · f1 · f2 · banner · linea · anunciantes · secciones`. Para mover, sumar o sacar bloques se edita esa lista y se corre `node build.mjs`. Cada `f1` consume las 4 notas siguientes (hay dos juegos cargados: `f1a`, `f1b`); si se suma un tercer `f1` o `f2`, ampliar la cantidad en `mk(...)`.

**Los dos formatos** (más la tapa y la franja de secciones, no hay otros en el flujo):
- **Formato 1 · título arriba** (`.f1`): 2×2, volanta (si corresponde) → titular serif ~22 px → hora relativa → foto 16:10 → crédito. Sin bajada (`?bajada=on` la muestra). Línea fina arriba de la 2.ª fila y filete vertical entre columnas. Fondo blanco. Las fotos de una fila quedan alineadas aunque un titular tenga volanta y el otro no.
- **Formato 2 · horizontal con fondo** (`.f2`): 8 notas, 2 columnas × 4 filas; foto 4:3 a la izquierda (~40 %), volanta, titular serif ~20 px, bajada cortada a 3 líneas y hora. Fondo `--paper-tint` (`?fondos=off` lo apaga) y doble línea arriba (bloque `linea`).
- **Mobile**: una columna, una nota por fila. F1: foto 16:10, volanta, titular, hora. F2: foto 16:10 arriba, volanta, titular, bajada de 2 líneas y hora, con el fondo suave.

**Volanta de Legislatura**: `SHOW_LEGISLATURA_LABEL = false` en `build.mjs` omite el texto "Legislatura Bonaerense" en las notas de esa categoría (tapa, formatos, listas laterales y notas vinculadas); las demás categorías conservan su volanta. Ponerlo en `true` lo revierte. No hay título "Legislatura Bonaerense" encima de ningún bloque; la página de la sección sí lo lleva. El dateline "LA PLATA" se mantiene.

## v2.3 · Cintillo y sección (etapa A)
- **Cintillo** (texto libre de la redacción, siempre arriba del título) vive en `data/cintillos.json` (id de nota → texto; `tools/gen-cintillos.mjs` lo generó con frases de ejemplo y ahora se edita a mano). Si una nota no tiene cintillo, la tarjeta arranca con el título. En producción es **un campo editable en el editor de notas de WordPress** (requisito del Hito 2). Color: variable `--cintillo-color`.
- **Sección** (categoría) es una etiqueta chica con fondo (`--seccion-bg`, `--seccion-fg`). Parámetro `seccion=foto|abajo` (default `foto`: sobre la foto, esquina inferior izquierda; `abajo`: debajo de la foto, a la derecha). En tarjetas sin foto va debajo del título.
- `SHOW_LEGISLATURA_LABEL` ahora vale `true` (la etiqueta también aparece en Legislatura Bonaerense). El dateline ("LA PLATA") ya no se muestra.

## v2.3 · Tipografía y tamaños (etapa B)
- Fuentes variables self-hosted (latin, `font-display: swap`), peso 400 a 900 cada una: Source Serif 4 (51 KB, la actual y la única que se descarga por defecto junto con Inter, 48 KB), Merriweather (98 KB) y Literata (39 KB). Las alternativas solo se descargan si se elige esa fuente.
- Títulos de tarjeta +2 px (grandes) o +1 px (chicos) en mobile y desktop; peso por defecto 800.
- Cuerpo de la nota: 20 px en mobile, 21 px en tablet y 22 px en desktop, con `line-height` 1.6 (antes 18 px); bajada 20/23 px.

## Parámetros de variante (URL o panel; se recuerdan en la sesión; `?reset=1` los borra)
Ejemplo: `index.html?demo=1&super=2&legis=b&bajada=on`. "Copiar link de esta variante" arma la URL.

| Parámetro | Valores (default **en negrita**) | Qué cambia |
|---|---|---|
| `super` | **off** · foto · texto · 2 · 3 | Superdestacada sobre la tapa: A foto, B solo texto, o apiladas |
| `tapa` | **izq** · der | Foto de la nota fuerte a izquierda o derecha |
| `legis` | **a** · b | Diputados y Senadores tras la tapa (a) o tras el segundo Formato 1 (b) |
| `bajada` | **auto** · on · off | Bajada del Formato 1. `auto`: en mobile siempre con bajada entera (sin recorte), en desktop sin bajada en F1. La nota 1 de la tapa en mobile nunca lleva bajada |
| `peso` | 700 · **800** · 900 | Peso de los títulos de tarjetas y notas, en todas las pantallas (variable CSS `--titulo-peso`). `600` queda como alias de `700` |
| `tiempo` | **off** · on | Hora relativa ("Hace 2 horas") en las tarjetas. OJO: `hora` sigue siendo la franja "Última hora" (el brief asumía que `hora` era la de las tarjetas, por eso se creó `tiempo`) |
| `ad` | **on** · off | Banner 1180×90 (320×100 en mobile); apagado colapsa |
| `fondos` | **on** · off | Fondo suave del Formato 2 |
| `fotos` | **ejemplo** · iniciales | Retratos de fantasía o iniciales |
| `font` | **actual** · merriweather · literata | Serif de los títulos. `actual` = Source Serif 4 (referencia; es la que ya usaba la maqueta). Alias viejos: `a` → actual, `b` → merriweather. Clarín usa Portada/Portada Text (TypeTogether, comercial): no se pueden usar sin licencia |
| `hora` | on · **off** | Franja "Última hora" |
| `diario` | **on** · off | Todos los detalles de diario juntos |
| `credito` | **on** · off | Crédito de foto en mayúsculas |

Los parámetros `m1` y `m2` ya no existen. Un script inline en `<head>` pone los valores en `<html data-*>` antes del primer render.

## v2.2 · Mobile (< 768 px), feedback de Juan 12/11
- **Tarjetas**: cintillo (volanta o dateline "La Plata", serif 20 px, color de acento) → título (26 px, 30 px la nota 1 de la tapa; peso 600) → bajada entera → foto 16:10 → "FOTO: ARCHIVO". Nota 1 de la tapa sin bajada ni relacionadas. En la franja de secciones se oculta el cintillo (la categoría ya es el título de la columna). Listas de la sección interna con el mismo orden.
- **Zócalo fijo** (`.dock`): Menú · Legislatura · Diputados · Senadores, 56 px + safe-area, sin ocultarse al scrollear. Menú abre el panel de siempre (queda por encima del zócalo, se cierra con su X). Volver arriba, barra de compartir y panel `?demo=1` quedan encima del zócalo. Nuevas páginas `diputados.html` y `senadores.html` (filtradas por cámara).
- **Módulos separados** Diputados / Senadores (también en desktop, uno tras otro, contadores propios "1 de 16" / "1 de 8").
- **Franja final**: títulos a 28 px, "Ver más de X" como botón con flecha, doble línea entre secciones, anunciantes sin título ni rótulo y con 8 px de aire.
- **Anunciantes mobile**: slot de alto fijo 110 px, ancho completo, `object-fit: contain` sobre `--paper-tint` (el banner del flujo usa el mismo criterio); el bloque mide 146 px durante toda la rotación (sin saltos). Desktop sin cambios.
- **Tapa desktop**: `SHOW_TAPA_RELACIONADAS = false` oculta las 2 notas relacionadas bajo la bajada de la nota principal (en la tapa y en la mini tapa de la sección); el markup se conserva.
- Constantes en `build.mjs`: `SHOW_TAPA_RELACIONADAS` (false), `HEADER_MENU_MOBILE` (false: sin las tres barritas arriba en mobile), `SHOW_FECHA_EN_NOTA` (true). La hora de las tarjetas está apagada en todas las pantallas (`tiempo=off`).
- Capturas en `capturas/`: `index-m390.png`, `zocalo-*`, `modulos-diputados-senadores-m390.png`, `franja-secciones-m390.png`, `anunciantes-m390.png`, `comparacion-peso-600-vs-700-m360.png`, `index-d1280.png`.

## Secciones internas (`seccion.html`)
Mini tapa de 1 nota + flujo vertical (línea arriba, volanta, titular, bajada, hora, foto a la derecha) + columna lateral sticky de 300 px en desktop. Scroll infinito con `IntersectionObserver`, esqueleto de un bloque entero (altura reservada) y botón "Ver más notas" de respaldo; carga de a 10 hasta 120 (las notas se reutilizan con `data-uid` distinto). Mobile: slot 300×250 cada `SECTION_AD_EVERY` notas (0 lo apaga). Esta lista es independiente de los dos formatos del home.

## Superdestacada y WordPress
Cada nota admite `super: "foto" | "texto" | null` en el JSON; si ninguna lo trae, la maqueta usa tres notas sobrantes de demostración. En WordPress: campo "Superdestacada: Foto / Solo texto / No" en la nota (viabilidad a confirmar por Santi). Componentes: `.super--foto`, `.super--texto`.

## Fotos de fantasía (limitación de la fuente)
Retratos de `randomuser.me` en `assets/img/fantasia/01..24.jpg`, **128×128 y no se estiran**: círculo de 128 px en el perfil, 96 px en el listado y en el carrusel. Cartel "Foto de ejemplo" visible. Reemplazo por fotos reales: campo `foto` de cada legislador (`legs` en `build.mjs`); si falta, se ven las iniciales. `?fotos=iniciales` las apaga.

## Qué es real y qué es muestra
| Real | Muestra / placeholder |
|---|---|
| Notas (titulares, bajadas, fotos, tags, fechas), 44 cuerpos, 32 banners | Legisladores (nombres, bloques, partidos) y retratos |
| Menú de 7 ítems, logo | Biografía del perfil; pie de foto y crédito ("Foto: Archivo", `is-ph`); contacto del footer |

**Horas relativas**: ("Hace 2 horas", "Ayer") se calculan contra `NOW_REF` = 2/11/2026 20:00 (el momento de la muestra de notas), no contra el reloj real, para que no digan "hace 6 días". La fecha de la cabecera sí es la del día. Si la maqueta se rehace con notas nuevas, actualizar `NOW_REF`.

**Contenido de notas**: `nota-412768.html` pertenece a la categoría real "Colegios profesionales" (volanta y título). Es contenido, no navegación; la auditoría (`tools/audit-brief.mjs`) no revisa Opinión/Colegios en las páginas de nota y sí en navegación, home, secciones, perfiles y footer (0 hallazgos).

## Rendimiento (medido)
- **Lighthouse 13, móvil, simulado** (Chromium de Playwright vía `CHROME_PATH`, `--headless=new --no-sandbox`), servidor local:

| Página | Performance | Accesibilidad | CLS | LCP |
|---|---|---|---|---|
| index | 89 | 96 | 0 | 2.6–2.7 s |
| seccion | 92 | 92 | 0 | 3.0 s |
| nota | 96 | 100 | 0 | 2.3 s |
| legislador | 97 | 96 | 0 | 2.4 s |

- **Playwright + PerformanceObserver** (`tools/perf.mjs`; 390 px, CPU ×4, red 1.6 Mbps / 150 ms, con scroll hasta el final): CLS 0.000 en las 5 páginas; LCP 1.5–2.5 s.
- **Criterios**: CLS < 0.05 ✔ · Performance ≥ 85 ✔ · Accesibilidad ≥ 90 ✔. **LCP < 2.5 s: no se cumple en Lighthouse** para index (2.6–2.7 s) y seccion (3.0 s), cerca en las demás. El tiempo se va en el render (CSS y fuentes bloqueando, ~0,6 s de retraso con la imagen ya cargada). Pendiente si se quiere bajar: CSS crítico inline y subconjunto de fuentes.
- Se corrigió el CLS precargando las fuentes (`<link rel=preload>`), y el scroll infinito con esqueleto de bloque. Accesibilidad: quedan avisos de `color-contrast` (secundarios) en index/seccion/legislador y `link-in-text-block` en seccion, sin corregir.

**Medición v2.2 (13/11, `tools/perf.mjs`, 390 px, CPU ×4, red 1,6 Mbps / 150 ms, con scroll hasta el final):** index LCP 2,04 s · CLS 0,0000; seccion LCP 1,86 s · CLS 0,0000; diputados LCP 1,78 s · CLS 0,0000. No hizo falta ajustar el esqueleto ni el espacio del zócalo.
**404:** era `/favicon.ico` (las páginas no declaraban ícono). Se agregó `assets/img/favicon.svg` y `<link rel="icon">`; `tools/find404.mjs` recorre todas las páginas a 390 y 1280 px y ya no reporta errores.

## Publicar en una URL privada (todavía no desplegado)
Archivos listos: `robots.txt` (`Disallow: /`), `_headers` y `netlify.toml` (Netlify), `vercel.json` y `.vercelignore` (Vercel), todos con `X-Robots-Tag: noindex, nofollow`; además cada HTML lleva `<meta name="robots" content="noindex,nofollow">`.
1. `node build.mjs` (regenera HTML y `main.min.css`).
2. **Netlify**: arrastrar la carpeta en app.netlify.com/drop, o `netlify deploy --prod --dir .`. Desde el panel, poner protección con contraseña o dominio con nombre no adivinable.
3. **Vercel**: `vercel --prod` en la carpeta (`.vercelignore` deja afuera `tools`, `data`, `capturas` y `build.mjs`). Activar "Vercel Authentication" para que sea privada de verdad.
4. No enlazar la URL desde ningún sitio público. Probar `curl -I <url>` y verificar el `X-Robots-Tag`.

## Pendientes
- **Logo**: se reemplazó por `logo-big.png` del sitio actual (781×100, blanco sobre transparente, ~2.6× a 300 px). Sigue sin ser vectorial: si Santi consigue el SVG, reemplazar `assets/img/logo-dark.png` (o ajustar `LOGO` en `build.mjs`).
- `referencias/` (Word de Juan y capturas) no está en el repo; se trabajó desde los briefs.
- Constantes en `build.mjs`: `FLOW`, `SHOW_LEGISLATURA_LABEL`, `EDITION_LINE` (vacía), `SHOW_TOP_BANNER` (apagado), `DEMO_PLACEHOLDERS`, `SECTION_AD_EVERY`, `SECTION_TOTAL`, `NOW_REF`.
- Fuera de alcance: Hito 3, carga interna de WordPress, contenido real.
