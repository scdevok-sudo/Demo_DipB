# Maqueta v2 · Diputados Bonaerenses (diseño "diario" acordado el 4/11)

Maqueta estática, mobile first, sin frameworks. Todas las páginas llevan `noindex,nofollow`. No toca el WordPress.

## Cómo abrirla
- Servir la carpeta (`python -m http.server 8765`, `npx http-server .` o Vercel/Netlify con URL privada).
- Panel de variantes: **`/index.html?demo=1`** (botón flotante "Variantes", tocable en el celular).
- Regenerar el HTML: `node build.mjs` (lee `data/`).
- Capturas: `cd tools && node shots.mjs index,seccion d1440,m390 "diario=off"` (viewports: `m360 m390 m412 t d1280 d1440`; avisa overflow horizontal y filas de 2 notas en mobile).

## Parámetros de variante (URL o panel; se recuerdan en la sesión; `?reset=1` los borra)
Ejemplo: `index.html?demo=1&super=3&legis=b&m2=2`. "Copiar link de esta variante" en el panel arma la URL.

| Parámetro | Valores (default **en negrita**) | Qué cambia |
|---|---|---|
| `super` | **off** · foto · texto · 2 · 3 | Superdestacada arriba de la tapa: A foto, B solo texto, o apiladas |
| `tapa` | **izq** · der | Foto de la nota fuerte a izquierda o derecha |
| `legis` | **a** · b | Módulo Diputados y Senadores tras la tapa (a) o en el medio del flujo (b) |
| `m1` | **2x2** · 4x1 | Primer módulo |
| `m1bajada` | on · **off** | Bajada en el primer módulo |
| `m2` | 1 · 2 · **alt** | Segundo módulo: posibilidad 1, 2 o alternando (hay dos bloques de 8) |
| `ad` | **on** · off | Banner 1180×90 tras el primer módulo (320×100 en mobile); apagado colapsa |
| `fondos` | **on** · off | Fondos alternados blanco / `--paper-tint` |
| `fotos` | **ejemplo** · iniciales | Retratos de fantasía o iniciales |
| `font` | **a** · b | Source Serif 4 o Merriweather |
| `hora` | on · **off** | Franja "Última hora" |
| `diario` | **on** · off | Todos los detalles de diario juntos (doble línea, barra de sección, filetes verticales y finos, fecha de cabecera, letra capital, "ver también", datelines, crédito de foto) |
| `credito` | **on** · off | Crédito de foto en mayúsculas |

Implementación: un script inline en `<head>` pone los valores en `<html data-*>` antes del primer render (sin parpadeo ni saltos de layout); todo el resto es CSS.

## Estructura del home
[superdestacada opcional] → tapa de 3 (fuerte con foto 7/12 + texto centrado verticalmente, y 2 debajo) → doble línea → (legisladores A) → módulo 1 (4 notas, título arriba) + banner → doble línea → (legisladores B) → módulo 2 (bloque de 8, ×2) → último bloque de fotos chicas → Anunciantes (4 slots 300×300) → doble línea → franja de secciones (Congreso, Nación, Provincia, Municipios) → footer.

- Grilla de 12 columnas (`.row`, spans `.span-3/4/6/8/9/12`); tablet 2 columnas; mobile 1. Un solo elemento por fila en el celular.
- 4 tipos de tarjeta: `lead`, `med`, `sm`, `txt` (`card()` en `build.mjs`).
- Cada nota del home se usa una sola vez (las secciones se reservan primero; el flujo mezcla categorías por fecha). Si el pool se agota, `build.mjs` avisa.
- En el módulo 2 posibilidad 2 el bloque de 8 queda 3 + 3 + 2; las dos últimas ocupan `span-6` para que la fila sume 12.
- Mobile: franja de secciones apilada, sin desplegables (1 nota con foto + 2 solo título); legisladores en carrusel con `scroll-snap` y autoavance.

## Secciones internas (`seccion.html`)
Mini tapa de 1 nota con el formato de la tapa fuerte + flujo vertical (línea arriba, volanta, titular, bajada, hora relativa, foto a la derecha) + columna lateral sticky de 300 px (300×600) en desktop. Scroll infinito con `IntersectionObserver`, esqueleto con altura reservada y botón "Ver más notas" de respaldo; carga de a 10 hasta 120 (las notas se reutilizan con `data-uid` distinto, no hay noticias inventadas). Mobile: slot 300×250 cada `SECTION_AD_EVERY` notas (constante en `build.mjs`, 0 lo apaga).

## Superdestacada y WordPress
Cada nota admite `super: "foto" | "texto" | null` en el JSON. Si ninguna lo trae, la maqueta usa tres notas sobrantes de demostración. En WordPress: campo "Superdestacada: Foto / Solo texto / No" en la nota; el home consulta las que lo tengan, por fecha, y las apila sobre la tapa. Viabilidad a confirmar por Santi; el componente (`.super--foto`, `.super--texto`) ya está listo.

## Fotos de fantasía
Retratos de `randomuser.me` descargados en `assets/img/fantasia/01..24.jpg` (128×128, tal como los entrega el servicio; mezcla de hombres y mujeres según el nombre de pila). Cartel "Foto de ejemplo" en módulo, listado y perfil. **Reemplazo por fotos reales:** campo `foto` de cada legislador (`legs` en `build.mjs`; en el sitio real, el campo del registro); si falta o no carga, se ven las iniciales. `?fotos=iniciales` vuelve a las iniciales.

## Qué es real y qué es muestra
| Real | Muestra / placeholder |
|---|---|
| Notas (titulares, bajadas, fotos, tags, fechas) de `data/` | Legisladores (nombres, bloques, partidos) y sus retratos |
| 44 cuerpos de nota, 32 banners de Anunciantes | Biografía del perfil de prueba; pie de foto y crédito ("Foto: Archivo", marcados `is-ph`) |
| Menú de 7 ítems | Contacto/redes del footer |

Las horas relativas ("Hace 2 horas") se calculan contra `NOW_REF` (2/11/2026 20:00, momento de la muestra de notas), no contra el reloj real. La fecha de la cabecera sí es la del día.

## Pendientes y decisiones
- **Referencias**: la carpeta `referencias/` (Word de Juan, capturas) no estaba en el repo; se trabajó desde el texto del brief.
- **Logo**: sigue el PNG 500×68 (`assets/img/logo-dark.png`, texto blanco para fondo azul). No hay original vectorial a mano: reemplazarlo manteniendo el nombre. El logo ocupa la barra azul de la cabecera.
- Dateline: LA PLATA (Legislatura) y BUENOS AIRES (Congreso) solo en la tapa fuerte y en la nota interna; en la nota va arriba del cuerpo, como línea propia, para que no choque con la letra capital.
- `EDITION_LINE` (vacía), `SHOW_TOP_BANNER` (apagado), `DEMO_PLACEHOLDERS`, `SECTION_AD_EVERY`, `SECTION_TOTAL` en `build.mjs`.
- Sin verificar: Lighthouse (no corrió en este entorno); accesibilidad revisada a mano (`--accent-text`, foco visible, `aria-label`, `prefers-reduced-motion`).
- Fuera de alcance: Hito 3, carga interna de WordPress, contenidos reales.
