# Maqueta Hito 1 · Diputados Bonaerenses

Maqueta estática, responsive y mobile first del rediseño. No toca el WordPress ni el VPS.

## Cómo abrirla
- Doble click en `index.html` (funciona sin servidor) o subir la carpeta a Vercel/Netlify.
- Páginas: `index` (Home), `nota`, `seccion` (Legislatura Bonaerense), `legisladores`, `legislador`, `publicidad` (mapa de slots).
- Todas llevan `noindex,nofollow`.
- Regenerar el HTML: `node build.mjs` (lee `data/`). Descargar/optimizar imágenes: `cd tools && npm i && node fetch-assets.mjs` y `node extract-body.mjs` (requiere `tools/nota.html` descargado de la URL de la nota)``.

## Qué es real y qué es muestra
| Real | Muestra / placeholder |
|---|---|
| Titulares, extractos, autores, fechas, categorías y tags de 70 notas (`data/10_muestra_notas.json`) | **Legisladores**: nombres, bloques, partidos e iniciales (no llegó `11_funcionarios.json`) |
| Cuerpo completo de la nota interna (traído de su URL pública) | **Proyectos** del perfil (marcados "ejemplo") |
| Menú, conteos de categorías, tags, notas por año | Datos de contacto, redes e institucional del footer (a completar) |
| 29 banners reales de la Home actual, con su destino | "Lo central" de la nota (armado con lo que dice la nota, marcado muestra) | Franja 320×100 mobile (no hay creatividad: placeholder) |
| Secciones del menú distintas de Legislatura: avisan que no están en la maqueta |

Imágenes descargadas a `assets/img/` (WebP, máx. 1200 px; banners GIF se conservan animados). No hay hotlinking al bucket.

## Decisiones de diseño
- Celeste `#3daef4` para acentos y chips (con texto oscuro); texto y botones sobre blanco usan `#0868a6` para cumplir contraste AA; `#0a7cc4` en hover.
- Portada: hero = última nota "Destacada", secundarias = "Destacada Inferior". "Cables" queda fuera de portada y última hora.
- Publicidad (criterio del cliente): los banners viven en UNA zona: bloque rotativo sticky en el sidebar (desktop) y un slot 300×300 al final de la página (mobile). Más UNA franja bajo el header (970×90 desktop / 320×100 mobile) para el anunciante principal. Nunca entre notas, en listados ni dentro de una nota. Altura fija en cada slot. Constantes en `build.mjs`: `BANNERS_POR_CICLO` (4), `SEGUNDOS_POR_BANNER` (5), `PRINCIPAL`. `tools/audit-ads.mjs` verifica la regla.
- Logo: el actual (versión blanca), sobre barra azul oscura.

## Para el Hito 2
- Los perfiles saldrán de Google Sheets como base liviana (altas/bajas sin tocar el backend de WP).
- "Noticias vinculadas" del perfil equivale a un tag.
- El buscador de proyectos es Hito 3.
