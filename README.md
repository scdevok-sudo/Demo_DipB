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
módulo DIPUTADOS (gris, chico)
FORMATO 1 (4 notas)
banner 1180×90
FORMATO 1 (4 notas más)
módulo SENADORES (gris, chico)
─── doble línea ───
FORMATO 2 (8 notas, fondo suave)
Anunciantes
─── doble línea ───
franja de secciones (Congreso · Nación · Provincia · Municipios)
footer
```
19 notas en el flujo (3 + 4 + 4 + 8), cada nota se usa una sola vez. La secuencia es una lista en `build.mjs`:

```js
const FLOW = ['tapa','legis-diputados','f1','textos','f1','trio','legis-senadores','linea','f2','anunciantes','linea','secciones','banner'];
```
Bloques: `tapa · legis-diputados · legis-senadores · f1 · f2 · banner · linea · anunciantes · secciones`, más `textos` y `trio`, que solo se ven con `?ritmo=c` y `?ritmo=b` (con `ritmo=actual` quedan ocultos y el home es idéntico al anterior). `banner` (el horizontal suelto) está oculto en desktop, donde es una slide más del rodante horizontal de `anunciantes`, y solo se ve en mobile. `FLOW_MOBILE` define el orden propio de mobile (ver etapa E y v2.3.1). Para mover, sumar o sacar bloques se edita esa lista y se corre `node build.mjs`. Cada `f1` consume las 4 notas siguientes (hay dos juegos cargados: `f1a`, `f1b`); si se suma un tercer `f1` o `f2`, ampliar la cantidad en `mk(...)`.

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
- Títulos de tarjeta +2 px (grandes) o +1 px (chicos) en mobile y desktop; peso por defecto 800 (700 desde v2.4).
- Cuerpo de la nota: 20 px en mobile, 21 px en tablet y 22 px en desktop, con `line-height` 1.6 (antes 18 px); bajada 20/23 px.

## v2.3 · Home desktop (etapa C)
- **Sin pie de foto** en ninguna tarjeta del home ni de los listados (se conserva en la página de la nota). `credito` ahora solo afecta a la nota.
- **Diputados y Senadores**: dos módulos grises (`--modulo-legisladores-bg`), retratos de 72 px, solo nombre y bloque. Bloques reales de ejemplo (Fuerza Patria, La Libertad Avanza, UCR, PRO, Coalición Cívica). El parámetro `legis` fue removido: la posición de los módulos Diputados y Senadores la define únicamente `FLOW` (en mobile se resolverá con un orden propio, etapa E, sin tocar el de desktop). Cada legislador de muestra tiene `mandato`, `seccion_electoral` y `ciudad` (los usa el perfil, etapa D).
- **Anunciantes**: sin título ni rótulo "Publicidad", sin fondo, con puntos y flechas chicas. Los 4 slots rotan solo banners cuadrados (16). Los horizontales rotan en **un único rodante** de 90 px con `object-fit: contain` (solo desktop), con flechas y puntos: son 7 slides y la primera es el banner 1180×90 de Banco Provincia, que antes estaba suelto entre los Formato 1. Desde v2.3.2 ese rodante va dentro del 1.º Formato 1, entre sus dos filas.
- **Franja final**: una nota menos por columna (1 con foto + 2 de texto). En la franja la etiqueta de sección no se muestra porque cada columna ya se titula con la sección.
- **Colores**: `--fondo-f2` (gris para el Formato 2), `--modulo-legisladores-bg`, `--cintillo-color`, `--seccion-bg`; todo en el `:root` de `assets/css/main.css`.

## v2.3 · Legisladores y nota (etapa D)
- **Dos páginas**, `diputados.html` y `senadores.html` (se eliminó `legisladores.html`; todos los enlaces "Legisladores" del menú y del pie ahora son "Diputados" y "Senadores"). Pestañas cruzadas arriba, buscador por nombre (sin acentos ni mayúsculas), filtro por bloque y contador. Sin filtro por partido, distrito ni sección. Las tarjetas muestran solo foto, nombre y bloque. No había carrusel mezclado dentro de estas páginas; el módulo rodante de anunciantes del final se sacó.
- **Perfil**: cabecera con bloque, mandato, sección electoral y ciudad (se quitó "Cámara" y "Partido"; `PARTIDOS` ya no existe). Sin bloque de biografía vacío cuando el legislador no tiene biografía. Publicidad lateral: un solo banner de 300×250 como máximo, fijo (v2.3.1); en mobile queda al final.
- **Campos a cargar por legislador** (planilla de Google Sheets del Hito 2): `nombre`, `camara`, `bloque`, `mandato` (ej. "2023 a 2027"), `seccion_electoral` (ej. "Octava"), `ciudad`, `foto`, `biografia` (opcional). Salen de las páginas oficiales de la Cámara y del Senado.
- **Nota**: la fecha (solo día, sin hora) y la sección van debajo de la foto; el pie de foto y la bajada se conservan. Botones de compartir en gris neutro: WhatsApp, Facebook, X, Instagram, Telegram y copiar link (Instagram no tiene enlace de compartir web, avisa con un toast). "Leé también" lateral muestra el título completo.
- **Corrección**: `adOne()` no aplicaba la clase `adz--one` y el slot lateral salía en 4 columnas de ~40 px; ahora ocupa el ancho de la columna.
- Elementos de la nota que podrían sobrar: `capturas/nota-elementos-dudosos.md` (esperan confirmación, no se borró nada).

## v2.3 · Mobile (etapa E)
- **Sin bajadas** en ninguna tarjeta mobile (tapa, formatos, secciones y listados). La página de la nota las conserva. `?bajada=on` las vuelve a mostrar para comparar.
- **Líneas finas** de 1 px entre tarjetas (variable `--filete-suave`) en el home, la franja final y los listados.
- **Formato 2 compacto**: texto a la izquierda (cintillo, título, etiqueta de sección) y foto de 96×72 a la derecha. `?tapa2=chica` aplica lo mismo a las notas 2 y 3 de la tapa (default `normal`).
- **Banners**: slot de 300×300 reales, centrado, rodante cada ~5 s, deslizable con el dedo, con pausa al tocar; sin textos y con 8 px de aire. Altura reservada (CLS 0 en 360, 390 y 412 px). El banner horizontal del flujo no se tocó.
- **Orden propio de los legisladores en mobile**: `FLOW_MOBILE` (en `build.mjs`) pone Diputados y Senadores consecutivos; el `FLOW` de desktop no cambia. Cada bloque lleva `--o` y el CSS lo reordena solo en < 768 px.
- **Corrección**: los títulos mobile salían en peso 400 porque la regla usaba una variable inexistente (`--titulo-peso-mobile`); ahora respetan `--titulo-peso` (default 800).

## v2.3 · Ritmo del home de escritorio (etapa F, exploración opcional)
Parámetro `ritmo=actual|b|c` (default `actual`: sin ningún cambio; verificado con el mismo alto de página y la misma cantidad de bloques que antes en 1280, 1440 y 390 px). Solo afecta a desktop (≥ 768 px); en mobile las tres opciones se ven igual.
- **`b`**: el 2.º Formato 1 (4 notas iguales) se reemplaza por **una nota grande y dos chicas con foto al costado** (2/3 y 1/3 del ancho, la columna de las chicas separada por un filete). Usa 3 de las 4 notas de ese bloque, así que no suma notas nuevas.
- **`c`**: se suma un **bloque de solo texto** (cintillo, título y etiqueta de sección, sin foto; 3 columnas × 2 filas, entre dos filetes) entre los dos Formato 1 (v2.3.1: ya no hay banner suelto en medio). Usa 6 notas más del flujo, sin repetir.
- Los dos formatos nuevos usan la misma familia tipográfica, filetes y espaciado que el resto. No se sumó la variante de columna angosta "Lo último".
- Los bloques ocultos están siempre en el HTML (la variante se elige en el navegador, como los demás parámetros); sus fotos son `loading=lazy` y no se descargan mientras están ocultos.
- Capturas a 1280 px: `capturas/f-ritmo-actual-d1280.png`, `f-ritmo-b-d1280.png` y `f-ritmo-c-d1280.png`.

## Parámetros de variante (URL o panel; se recuerdan en la sesión; `?reset=1` los borra)
Ejemplo: `index.html?demo=1&super=2&bajada=on`. "Copiar link de esta variante" arma la URL.

| Parámetro | Valores (default **en negrita**) | Qué cambia |
|---|---|---|
| `super` | **off** · 1 · 2 | v2.5 etapa G: superdestacada opcional sobre la tapa. `1` = carrusel de 3 notas con la foto grande (~2,4:1), el título ARRIBA de la foto y flechas y puntos de navegación; `2` = solo texto centrado (cintillo, título grande, "Por autor") entre dos filetes finos, sin foto. Alias de links viejos: `foto` → `1`, `texto` → `2`, `3` → `1`. (Antes `2` apilaba las dos; ya no) |
| `texto3` | **off** · 1 | v2.5 etapa G: bloque de notas solo texto en 3 columnas (cintillo, título y "Por autor"), después de la grilla de 3 columnas. Mobile: 1 columna con filetes |
| `grilla4` | **off** · 1 | v2.5 etapa G: grilla de 4 columnas (2 filas de 4) con tarjetas de sombra suave, después del bloque anterior. Mobile: 1 columna, máximo 3 tarjetas |
| `seccion` | **foto** · abajo | Etiqueta de sección: sobre la foto (esquina inferior izquierda, default) o debajo de la foto, a la derecha. En tarjetas sin foto va debajo del título |
| `tapa` | **texto-izq** · foto-izq | Tapa desktop: texto a la izquierda y foto a la derecha (default), o al revés. Alias de links viejos: `izq` → `foto-izq`, `der` → `texto-izq` |
| `vermas` | **flecha** · boton | "Ver más de X" de la franja final: texto con flecha sin borde (default) o botón con borde |
| `bajada` | **auto** · on · off | Bajada de las tarjetas. En mobile `auto` y `off` no la muestran; `on` la muestra. En desktop, `auto` la oculta en el Formato 1 (la tapa y el Formato 2 la mantienen) |
| `ritmo` | **actual** · b · c | Desktop: ritmo del flujo del home. `b` = una nota grande y dos chicas con foto al costado en lugar del 2.º Formato 1; `c` = bloque de solo texto entre dos Formato 1. `actual` no cambia nada |
| `tapa2` | **normal** · chica | Mobile: las notas 2 y 3 de la tapa como tarjetas normales o compactas con foto al costado |
| `peso` | 600 · **700** · 800 · 900 | Peso de los títulos de tarjetas y notas, en todas las pantallas (variable CSS `--titulo-peso`). Default 700 desde v2.4 (antes 800); 600 ya no es alias de 700 |
| `etiqueta` | **texto** · caja | v2.4: etiqueta de sección bajo el título como texto gris chico sin caja (`--seccion-texto`), o la caja oscura de v2.3. La etiqueta sobre la foto (`seccion=foto`) baja a 10 px en el modo `texto`. La caja de la cabecera de la nota no cambia |
| `header` | **prod** · actual | v2.4.1: paleta oficial del sitio en producción (`prod`, default): barra superior en `--brand-sky`, barra de menú en `--brand-blue` con el ítem activo en `--brand-sky`. `actual` = el azul oscuro anterior, solo para comparar. `marca` y `marca2` (v2.4) se eliminaron y redirigen a `prod` |
| `home` | **pdf** · anterior | v2.5, solo desktop: el inicio es el diseño del PDF "DISEÑO DB" de Juan (`pdf`, default; se arma por etapas) o el flujo anterior a v2.5 (`anterior`, con el rodante horizontal en el medio del 1.º Formato 1). Son dos archivos: `index.html` e `index-anterior.html`; `?home=` redirige al que corresponde (el valor se recuerda en la sesión, así que el logo y el menú vuelven a la versión elegida). El panel `?demo=1` tiene la fila "Inicio (desktop)" |
| `tiempo` | **off** · on | Hora relativa ("Hace 2 horas") en las tarjetas. OJO: `hora` sigue siendo la franja "Última hora" (el brief asumía que `hora` era la de las tarjetas, por eso se creó `tiempo`) |
| `ad` | **on** · off | Banner horizontal suelto del flujo, solo mobile (320×100); apagado colapsa. En desktop el horizontal es una slide del rodante |
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
Mini tapa de 1 nota + flujo vertical (línea arriba, volanta, titular, bajada, hora, foto a la derecha) + columna lateral sticky de 300 px en desktop (rodante de cuadrados desde v2.3.3). Scroll infinito con `IntersectionObserver`, esqueleto de un bloque entero (altura reservada) y botón "Ver más notas" de respaldo; carga de a 10 hasta 120 (las notas se reutilizan con `data-uid` distinto). Mobile: slot 300×250 cada `SECTION_AD_EVERY` notas (0 lo apaga). Esta lista es independiente de los dos formatos del home.

## Superdestacada y WordPress
> **Cambio de significado de `super=2` (v2.5 etapa G).** Hasta v2.4 `super=2` apilaba las dos superdestacadas (foto + texto). Desde la etapa G `2` muestra **solo la de texto**; la foto pasó a `1`. Los links viejos siguen andando por alias (`foto` → `1`, `texto` → `2`, `3` → `1`), pero un link viejo con `super=2` ahora muestra solo el texto.

| Valor | Qué hace |
|---|---|
| `off` (por defecto) | Sin superdestacada; el home queda como antes |
| `1` | Carrusel de 3 notas: cintillo, título ARRIBA de la foto, "Por autor", foto con flechas (sobre la foto) y puntos; teclado ←/→; sin autoplay. Desktop: foto de 430 px de alto con `object-fit: cover` (bloque ≈ 605 px). Mobile: foto 16:10 |
| `2` | Solo texto centrado (cintillo, título grande, "Por autor") entre dos filetes finos, sin foto |

`super=1` y `super=2` están apagadas por defecto y no alteran el reparto de notas del resto del home. La 1 usa las notas con `super: "foto"` en el JSON y, si faltan, notas sobrantes con foto grande. La 2 usa la nota con `super: "texto"` o, si no hay, una nota sobrante que se toma al final del reparto. Ambas notas (y las de `texto3` y `grilla4`) cuentan para el chequeo anti-repetidas del build. En WordPress: campo "Superdestacada: Foto / Solo texto / No" en la nota (viabilidad a confirmar por Santi). Componentes: `.super--foto` (`.scar`, con `data-scar`) y `.super--texto` (`.stext`); JS del carrusel en `assets/js/main.js` (las 3 diapositivas ocupan la misma celda de una grilla para que la altura no salte). Flechas: fondo oscuro semitransparente con borde blanco (contraste ≥ 3:1 contra la foto, medido); puntos de 44 px de área tocable en mobile.

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

**Después de la etapa F (ritmo):** index LCP 2,18 a 2,48 s en 5 corridas (con `ritmo=b` 2,42 s, con `c` 2,47 s), CLS 0,0000 a 0,0001; en una tanda de corridas seguidas con otros procesos en la máquina salieron 3,08 y 3,22 s, que no se repitieron al correrlo solo.

**Medición v2.3 (16/11, `tools/perf.mjs`, mismo método):** index LCP 2,05 a 2,41 s · CLS 0; seccion 1,64 s; nota 1,98 s; diputados 1,96 s; senadores 1,96 s; legislador 1,71 s; todos con CLS 0,0000. Fuentes por defecto: Source Serif 4 (49,7 KB) + Inter (47,1 KB); alternativas Merriweather (95,3 KB) y Literata (38,1 KB). CSS minificado 46,1 KB (9,8 KB gzip). Detalle y auditoría punto por punto en `capturas/auditoria-v2-3.md` (`tools/audit-v23.mjs`).

**Medición v2.2 (13/11, `tools/perf.mjs`, 390 px, CPU ×4, red 1,6 Mbps / 150 ms, con scroll hasta el final):** index LCP 2,04 s · CLS 0,0000; seccion LCP 1,86 s · CLS 0,0000; diputados LCP 1,78 s · CLS 0,0000. No hizo falta ajustar el esqueleto ni el espacio del zócalo.
**404:** era `/favicon.ico` (las páginas no declaraban ícono). Se agregó `assets/img/favicon.svg` y `<link rel="icon">`; `tools/find404.mjs` recorre todas las páginas a 390 y 1280 px y ya no reporta errores.

## Publicar en una URL privada (todavía no desplegado)
Archivos listos: `robots.txt` (`Disallow: /`), `_headers` y `netlify.toml` (Netlify), `vercel.json` y `.vercelignore` (Vercel), todos con `X-Robots-Tag: noindex, nofollow`; además cada HTML lleva `<meta name="robots" content="noindex,nofollow">`.
1. `node build.mjs` (regenera HTML y `main.min.css`).
2. **Netlify**: arrastrar la carpeta en app.netlify.com/drop, o `netlify deploy --prod --dir .`. Desde el panel, poner protección con contraseña o dominio con nombre no adivinable.
3. **Vercel**: `vercel --prod` en la carpeta (`.vercelignore` deja afuera `tools`, `data`, `capturas` y `build.mjs`). Activar "Vercel Authentication" para que sea privada de verdad.
4. No enlazar la URL desde ningún sitio público. Probar `curl -I <url>` y verificar el `X-Robots-Tag`.

## v2.3.1 · cambios posteriores a la aprobación de G y F
Un commit por punto, sin push. Auditoría en `capturas/auditoria-v2-3.md` (sección v2.3.1) y `tools/audit-v231.mjs`.
1. **Un solo rodante horizontal en desktop.** `HROT` ahora incluye el banner de Banco Provincia (`BANNER_HORIZ_ID`) como primera slide: 7 slides, flechas y puntos en un único módulo. Se sacó el banner suelto del flujo de desktop (el bloque `banner` quedó al final de `FLOW` y se oculta ≥ 768 px). El rodante de cuadrados es otro módulo y no cambió.
2. **Publicidad lateral** (nota, perfil y `seccion.html`; reemplazada en v2.3.3 por un rodante, ver abajo): un solo banner (`adSide()`), 300×250 como máximo, `position: sticky`, sin placeholder beige ni rótulo y con `object-fit: contain`, así que el logo no se corta ni domina la columna. En la nota, si Leé también + banner no entran en la altura de la ventana (≤ 960 px), solo el banner queda fijo y Leé también corre con la nota. En mobile el banner del perfil queda al final y la nota usa el rodante 300×300 de `ad-end`.
3. **Pie de foto:** sin cambios (se mantiene en la nota y no aparece en el home).
4. **Barra superior:** solo fecha y Buscar; Diputados y Senadores quedan en el menú principal.
5. **Mobile:** toda la publicidad del home (rodante 300×300 y banner horizontal) va al final, después de la franja de secciones (`FLOW_MOBILE`). Medidas, rodado y swipe sin cambios; sin títulos ni rótulos. Los slots de 300×250 que se intercalan en `seccion.html` (`SECTION_AD_EVERY`) no se tocaron.
6. **Bonus Leé también (nota):** columna lateral de 348 px (antes ~270), foto de 72 px y etiqueta de sección en una línea (9,5 px); los títulos pasan de 6 a 8 líneas a 3 o 4.

## v2.3.2 · rodante horizontal dentro del 1.º Formato 1 (home, desktop)
- El rodante horizontal (los 7 banners, con Banco Provincia) está **entre la fila de arriba y la de abajo del primer Formato 1** (el que sigue al módulo de Diputados): ocupa el ancho de la grilla, mide 90 px más sus flechas y puntos, sin rótulos. Se hace dentro de `BLOCKS.f1` (primera instancia) como un hijo más de la grilla, `grid-column: 1 / -1`.
- Se sacó de su lugar anterior (justo después del rodante de cuadrados, en `anunciantes`), así que no queda duplicado. El resto de `FLOW` no cambia.
- Espaciado: un filete arriba y otro abajo, con 24 px de aire de cada lado y sin hueco doble entre las filas. Mobile no cambia (el rodante es solo desktop; la publicidad sigue al final, después de la franja de secciones).
- `ritmo=b` y `ritmo=c` verificados: el rodante vive en el 1.º Formato 1, que ninguna variante toca; en `c` el bloque de solo texto sigue entre los dos Formato 1.
- Capturas del home completo a 1280 px: `capturas/i-home-completo-d1280.png` (más `i-home-ritmo-b-d1280.png`, `i-home-ritmo-c-d1280.png` y el detalle `i-f1-con-rodante-d1280.png`).

## v2.3.3 · publicidad de las páginas interiores (nota, perfil, seccion, diputados y senadores)
1. **Lateral (desktop)**: ahora es un **rodante de banners cuadrados** (los 16 del rodante de cuadrados del home), 300×250 como máximo, `sticky`, con puntos y flechas chicas, sin rótulos, `object-fit: contain`, que rota cada ~5 s y se pasa a mano (`adSide()` = `adZone([ROT], 'adz--one adz--side')`). El logo del Colegio de Psicólogos es solo una de las slides. Se agregó la columna lateral a `diputados.html` y `senadores.html` (grilla de 4 columnas con lateral de 300 px).
2. **Rectangular al final**: el rodante horizontal de los 7 banners va debajo de todo el contenido (después de "Leé también", el listado o el perfil) y antes del pie, a todo el ancho del contenido, delgado (90 px) y sin rótulos (`adEnd()`).
3. **Mobile y tablet (< 1024 px, sin lateral)**: al final de la página, primero el rodante de cuadrados 300×300 y debajo el horizontal (64 px de alto en mobile). Sin títulos ni rótulos y sin scroll horizontal.
4. **`seccion.html` mobile**: los slots cada 10 notas (`SECTION_AD_EVERY`) son el rodante de cuadrados 300×300 (mismo componente que el del final, no un banner suelto), también los que entran por scroll infinito: `carousel.js` expone `window.initAdz` y `main.js` lo llama con cada bloque nuevo. Los rectangulares quedan solo al final.
5. Quedan afuera el home y los banners de "Anunciantes" del home.
- Capturas a 1280 y 390 px: `capturas/j-{nota,seccion,perfil,diputados}-{d1280,m390}.png`.
- Un detalle: cada rodante es una instancia propia y todas arrancan en la primera slide, así que los slots de una misma página muestran el mismo banner al mismo tiempo hasta que rotan.

### Medición de CLS y LCP después de v2.3.3
Con `tools/perf.mjs` (Playwright con Chromium, servidor local en `:8765`): viewport mobile de 390×844 con factor 2, CPU 4× más lenta y red emulada de 1,6 Mbps con 150 ms de latencia (CDP); `PerformanceObserver` registra `largest-contentful-paint` y `layout-shift` (sin los que siguen a una interacción) y espera 3 s tras `load`. Es una medición de laboratorio en una red lenta emulada, no Lighthouse ni datos de usuarios reales: sirve para comparar entre versiones.

| Página | LCP | CLS |
|---|---|---|
| index | 2,01 s en la tanda completa; 2,02 y 1,99 s en dos corridas sueltas | 0,0000 |
| seccion | 1,84 s | 0,0000 |
| nota-413361 | 1,87 s | 0,0000 |
| diputados | 1,72 s | 0,0000 |
| senadores | 1,88 s | 0,0000 |
| legislador | 1,48 s | 0,0000 |

CLS queda por debajo de 0,1 en todas las páginas y el LCP del index (alrededor de 2 s) está en el rango anterior o algo por debajo (la medición de v2.3.1 daba 2,08 a 2,39 s); la variación entre corridas y sesiones es de unos 0,3 s, así que no hay una mejora real que atribuir a estos cambios.

## v2.4 · Feedback de Juan sobre el mobile (17/11)
Auditoría y medidas en `capturas/auditoria-v2-4.md`. Scripts: `tools/audit-v24.mjs` y `tools/audit-v24-espaciado.mjs`.
- **Tipografía**: `peso` default 700 (antes 800) en mobile y desktop. Títulos mobile más chicos (tapa 27 px, superdestacada 26 px, tarjetas 22 px) con interlineado 1,15 a 1,17. La tapa de Minnaard sale en 3 líneas en 360, 390 y 412 px. El cuerpo de la nota no se tocó. Probadas las 9 combinaciones fuente × peso a 390 px: ninguna se rompe; Literata en 700/800 es la más ancha y Merriweather casi no cambia entre 600 y 800.
- **Espaciado vertical (mobile)**: entre el contenido de una tarjeta y el de la siguiente quedan 25 px (24 de aire + el filete de 1 px) en tapa, Formato 1, Formato 2 y secciones, medido en 360, 390 y 412 px; sin dobles márgenes (cintillo, tapa, `min-height` de las filas de sección). En `seccion.html` la tapa queda a ~41 px de la primera fila, con la doble línea gruesa. Desktop: solo se recortaron bandas y doble línea (32 a 24 px) y el aire doble entre dos filas de Formato 1.
- **Formato 2 y `tapa2=chica` (mobile)**: foto cuadrada a la derecha, 32% del ancho en 390 y 412 px (115 y 122 px) y 30% en pantallas de hasta 375 px, título de 20 px (19 px en ≤ 375 px), sin bajada. Caso conocido: la nota de Nanni ("Nanni exige la finalización de la colectora…") sale en 6 líneas; no se acortó el título.
- **Etiquetas**: ver parámetro `etiqueta`.
- **Header**: ver parámetro `header` y la sección "v2.4.1".
- **Medición de CLS y LCP v2.4** (`tools/perf.mjs`, mismo método que arriba): index LCP 2,06 s en la tanda y 2,07 a 2,20 s en corridas sueltas; seccion 2,35 s en la tanda y 1,94 a 2,00 s en corridas sueltas; nota 1,85 s; diputados 1,80 s; senadores 1,81 s; legislador 1,52 s. CLS 0,0000 a 0,0001 en todas, también en `seccion.html` sin el `min-height` de las filas.

## v2.4.1 · Paleta oficial
Tokens en `:root` de `assets/css/main.css`: `--brand-sky` #3daef4 (barra superior, ítem activo del menú, placeholders), `--brand-blue` #1b75bb (barra de menú, cintillos y acentos, etiquetas de sección, botones, pie de página) y `--ink` #222 (texto y botón Buscar). El navy anterior (#0b2236) ya no se usa en ningún lado; solo vive dentro de `html[data-header="actual"]` para comparar. Los colores nuevos de cualquier etapa siguiente salen de estos tokens. Sobre fondos grises (#eee, #f2f2f2) el texto azul chico usa `--brand-blue-dk` para llegar a AA. Contraste AA verificado con `tools/audit-contraste.mjs` (tabla de pares en `capturas/auditoria-v2-4.md`, sección 9). Pendiente: el logo blanco sobre `--brand-sky` da 2,45:1 (ver auditoría).

## Pendientes
- **Logo**: se reemplazó por `logo-big.png` del sitio actual (781×100, blanco sobre transparente, ~2.6× a 300 px). Sigue sin ser vectorial: si Santi consigue el SVG, reemplazar `assets/img/logo-dark.png` (o ajustar `LOGO` en `build.mjs`).
- `referencias/` (Word de Juan y capturas) no está en el repo; se trabajó desde los briefs.
- Constantes en `build.mjs`: `FLOW`, `SHOW_LEGISLATURA_LABEL`, `EDITION_LINE` (vacía), `SHOW_TOP_BANNER` (apagado), `DEMO_PLACEHOLDERS`, `SECTION_AD_EVERY`, `SECTION_TOTAL`, `NOW_REF`.
- Fuera de alcance: Hito 3, carga interna de WordPress, contenido real.
