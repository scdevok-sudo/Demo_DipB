# Maqueta · Diputados Bonaerenses (ajustes tras la reunión del 2/11)

Maqueta estática, mobile first, sin frameworks. No toca el WordPress ni el VPS. Todas las páginas llevan `noindex,nofollow`.

## Cómo abrirla
- Subir la carpeta a Vercel/Netlify (URL privada) o servirla con cualquier servidor estático (`npx http-server .`).
- Para la reunión: abrir **`/index.html?demo=1`** (activa el panel de decisiones y lo mantiene mientras se navega).
- Regenerar el HTML: `node build.mjs` (lee `data/`).
- Verificación: `cd tools && node shots.mjs` (capturas Playwright en `capturas/`, con auditoría de overflow horizontal) y `node ../tools/audit-brief.mjs` (cero autor / Opinión / Colegios / Temas / Proyectos / Playfair).

## Qué cambió respecto de la primera maqueta
- **Grilla fija de 4 columnas** (desktop ≥1024), 2 en tablet, 1 en mobile. Todo bloque usa `.col-1 .col-2 .col-3 .col-4`; las filas suman 4.
- **4 tipos de tarjeta** y nada más: `lead` (fuerte), `med`, `sm` (chica con foto, miniatura 96×96), `txt` (solo texto).
- **Tipografía serif**: Source Serif 4 (variable `--font-title` en `main.css`; opción B Merriweather con `body[data-font="b"]`). Inter para UI. Playfair eliminada.
- **Home**: tapa (1 fuerte a 4 columnas + 2) → Legislatura Bonaerense → módulo "Diputados y Senadores" (rodante, pausa al hover, flechas) → más Legislatura → Anunciantes (+ "Lo último de Legislatura") → 4 modulitos (Congreso, Nación, Provincia, Municipios) → footer.
- **Mobile**: foto de la nota fuerte a sangre (4:5, máx. 62svh) con el título **debajo**; ningún texto sobre foto. Carrusel de legisladores con `scroll-snap`, autoavance y contador; menú a pantalla completa; botón volver arriba (48 px); barra de compartir inferior en la nota (se oculta al bajar); WhatsApp primero.
- **Nota**: volanta → título → bajada → foto → fecha/compartir → cuerpo. Sin autor, sin "Lo central". Etiquetas al final. "Leé también" automático (últimas 4 de Legislatura, excluye la actual).
- **Perfil**: sin "Proyectos presentados". Biografía con "Leer más/menos" (`aria-expanded`), notas vinculadas con "Ver más" (de a 4). Un perfil completo de prueba (`legislador.html`) y 23 con la biografía vacía.
- **Sacado**: Opinión, Colegios Profesionales, Temas frecuentes, autores, franja premium, `publicidad.html` (mapa de slots, desactualizado por las nuevas reglas).
- **Se agregó el banner COLPSIBA** (tomado del home en vivo) al inventario de Anunciantes.

## Qué es real y qué es muestra
| Real | Muestra / placeholder |
|---|---|
| Notas (titulares, bajadas, fotos, tags, fechas) de `data/10_muestra_notas.json` y `data/11_notas_extra.json` (traídas de la API pública del 2/11, con cuerpo) | **Legisladores**: nombres, bloques, partidos, cámara y fotos (son iniciales: no hay fotos reales a mano) |
| Cuerpo completo de 44 notas (el de `nota.html` con imágenes internas; los demás solo texto, sin imágenes internas) | **Biografía** del perfil de prueba: texto de ejemplo, marcado |
| 32 banners reales de Anunciantes, con su destino | Datos de contacto y redes del footer |
| Menú (7 ítems) | `nota-412621.html` se muestra **sin foto** a propósito (caso de nota sin imagen) |

Las notas de la muestra del 23/10 que no tienen cuerpo descargado muestran un aviso al hacer clic.

## Switches
| Qué | Dónde | Por defecto |
|---|---|---|
| Banner superior | `SHOW_TOP_BANNER` en `build.mjs` · panel `?demo=1` | **apagado** |
| Franja "Última hora" (una línea, 5 notas) | `SHOW_LAST_HOUR` · panel | **apagada** |
| Fuente de titulares A/B | `DEFAULTS.font` · panel (`body[data-font]`) | A: Source Serif 4 |
| Columna lateral de la nota A/B | `DEFAULTS.aside` · panel (`body[data-aside]`) | A: solo Anunciantes |
| "Leé también" 2 / 4 columnas | `DEFAULTS.lee` · panel (`body[data-lee]`) | 2 |

La franja horizontal premium se eliminó; el componente opcional es el banner superior (`.topbanner`, 970×90, apagado).

## Pendientes y notas
- **Logo**: sigue siendo el PNG de 500×68 del sitio actual. Reemplazar `assets/img/logo-dark.png` por el original (SVG o PNG grande) manteniendo el nombre; el CSS ya usa `height:auto` y `object-fit:contain`, no se deforma.
- Punto focal de la foto en mobile: `FOCAL` en `build.mjs` (`{ id: '50% 20%' }`).
- Publicidad: zona única "Anunciantes" (1 slot en mobile, 2 en tablet/desktop), nunca entre notas ni en listados. Altura reservada por slot.
- Rendimiento (Lighthouse mobile, simulado, local): Performance 88–95, Accesibilidad 92–100 (la sección da 92 por el contraste de enlaces dentro de texto; pendiente), CLS ≤ 0.009 en home, sección y perfil; la nota dio CLS 0.001. LCP 2.0–2.4 s. Los resultados varían entre corridas.
- Hito 2 (WordPress): los perfiles saldrán de la base de legisladores; "Leé también" será una consulta por categoría.
