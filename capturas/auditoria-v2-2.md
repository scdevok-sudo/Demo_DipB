# Auditoría v2.2 contra el feedback de Juan (13/11/2026, 390 px)

Medido con `tools/audit-v22.mjs` (Playwright, iPhone 390×844, DPR 2) sobre `index.html` y `seccion.html`. Los números salen del DOM renderizado, no de leer el CSS. Las capturas están en esta misma carpeta (`aud-*.png`).

## Correcciones hechas durante la auditoría (2 "no cumple" encontrados y arreglados)
1. **Bajada oculta en las listas de la sección interna (mobile).** Una regla heredada (`.srow .dek{display:none}`) la escondía. Ahora se muestra entera, igual que en el home.
2. **Cintillo "Legislatura Bonaerense" repetido en cada fila de la sección interna.** Contradecía `SHOW_LEGISLATURA_LABEL = false`. Las filas y la nota de la mini tapa de la sección ahora usan la misma regla de volanta que el home.

## Los 11 puntos

| # | Punto de Juan | Resultado | Motivo / medición | Captura |
|---|---|---|---|---|
| 1 | Título arriba de la foto en casi todo el mobile | **cumple** | De 23 tarjetas con foto del home, 0 tienen el título debajo de la foto. En las filas de la sección interna el orden es título → bajada → foto (verificado). | `aud-01-02-09-nota1-tapa.png`, `aud-01-07-formato1-tarjeta.png`, `aud-11-seccion-fila.png` |
| 2 | Cintillo arriba, más chico que el título, en otro color; tipografía menos gruesa | **cumple** | Cintillo 20 px serif 600 en azul de acento `rgb(22,115,173)`; títulos 26 px (30 px la nota 1) en `rgb(17,17,17)`, peso **600**. 0 tarjetas con el cintillo debajo del título. Comparación 600 vs 700: `comparacion-peso-600-vs-700-m360.png`. Matiz: en la franja de secciones del final el cintillo se oculta a propósito (la categoría ya es el título de la columna). | `aud-02-tipografia-formato2.png` |
| 3 | Nombres de sección más grandes | **cumple** | Los 4 títulos de la franja miden 28 px (antes 22 px, +27 %) y quedan iguales. | `aud-03-04-05-franja-secciones.png` |
| 4 | "Ver más" con presencia | **cumple** | Botón de 358 px (ancho completo de la columna) × 48 px, borde 1 px azul de acento, radio 4 px, flecha →. | `aud-03-04-05-franja-secciones.png` |
| 5 | Divisor de doble línea entre secciones | **cumple** | Entre las 4 secciones hay 3 divisores de 3 px con borde 1 px arriba y abajo; no hay divisor antes de la primera. | `aud-03-04-05-franja-secciones.png` |
| 6 | Anunciantes sin textos y más finos | **cumple en parte** | Sin título "Anunciantes" ni rótulo "PUBLICIDAD" (también el del banner del flujo); padding de 8 px y puntos de 6 px. El bloque mide 330 px y el banner del flujo 112 px. **No cumple una parte:** el brief pedía el banner "a ancho completo con su proporción natural". El slot sigue siendo un cuadrado de 300 px centrado, porque la rotación mezcla banners de formatos distintos (250×250 a 1458×1458, 580×400, 281×191) y con proporción natural el bloque cambiaría de alto en cada rotación (CLS). Hay que decidir con Juan. | `aud-06-anunciantes.png`, `aud-06-banner-flujo.png` |
| 7 | Bajada entera, sin "…" | **cumple** | 18 bajadas visibles en el home, 0 recortadas (alto del texto = alto de la caja). 0 bajadas visibles terminan en "…" en el home y en las 120 filas de la sección. Ver "Bajadas con …" más abajo. | `aud-01-07-tapa-nota2-bajada-entera.png` |
| 8 | Dos módulos: Diputados y Senadores | **cumple** | "Diputados" (1 de 16, → `diputados.html`) y "Senadores" (1 de 8, → `senadores.html`), cada uno con su carrusel y su contador, uno tras otro con filete fino. | `aud-08-modulos.png` |
| 9 | Nota 1 de la tapa sin bajada ni relacionadas | **cumple** | `.tapa .card--lead`: 0 elementos `.dek` o `.vermas` visibles. | `aud-01-02-09-nota1-tapa.png` |
| 10 | Zócalo fijo con 4 botones | **cumple** | `position:fixed`, `bottom:0`, 56 px de alto, exactamente 4 hijos (Menú, Legislatura, Diputados, Senadores) de 98×55 px (≥ 44 px). Volver arriba queda por encima del zócalo, y el menú de tres barritas ya no está en la cabecera. Medido con el scroll ya avanzado. | `aud-10-zocalo.png`, `zocalo-menu-abierto-m390.png` |
| 11 | Sin hora de publicación en las noticias | **cumple** | 0 elementos `.meta` visibles en tarjetas del home y de la sección; el texto "Hace N horas" / "Ayer" no aparece en ninguna tarjeta. La fecha se conserva solo dentro de la página de la nota (`SHOW_FECHA_EN_NOTA`). | `aud-11-seccion-fila.png` |

Verificaciones transversales: crédito "FOTO: ARCHIVO" en las 23 tarjetas con foto del home (23/23), sin scroll horizontal. El CLS después de estos arreglos: index 0,0001, seccion 0,0001 (LCP 2,19 s y 1,98 s).

## Bajadas con "…"
- **Visibles en mobile: ninguna** (home y sección, con las 120 filas de la sección cargadas). Ojo: antes del arreglo 1 la bajada de las filas de la sección estaba oculta, así que ese chequeo en la sección recién vale desde ahora.
- **En los datos, sin mostrarse hoy: 5 extractos** terminaban en `&hellip;` (4 son de la categoría Cables, que el home excluye, y 1 de Municipios). Se limpiaron con `tools/clean-extractos.mjs`, que corta en la última oración completa (si no hay, cierra con punto):

| Nota | Antes | Después |
|---|---|---|
| 348413 | "…su ingresó a la…" | "…Coalición Cívica en la provincia de Buenos Aires." |
| 339434 | "…su ingresó a la política,…" | "…Fuerza Patria por la Segunda sección electoral." |
| 330606 | "…del radicalismo y más. Todo, en…" | "…qué piensa del futuro del radicalismo y más." |
| 340392 | "…su ingresó a la…" | "…Buenos Aires por la Octava sección electoral." |
| 113712 | "…que navegaba en la…" | "…de Buenos Aires, en la Bahía de Samborombón." |

Nota: estos extractos son texto real del sitio actual (no de fantasía). Al cortar en la última oración completa quedan más cortos que el original.

## Actualización del punto 6 (13/11)
Resuelto con la decisión de Santi: slot de alto fijo de 110 px, ancho completo, `object-fit: contain` sobre `--paper-tint`, 8 px de aire y puntos de 6 px, sin textos. El bloque mide 146 px en todos los banners (medido durante la rotación completa) y no se corta ninguno (`anunciantes-110-comparacion-m390.png`). Punto 6: **cumple**.
