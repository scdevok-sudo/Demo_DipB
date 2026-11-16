# Página de la nota: elementos que hoy podrían no aportar (v2.3 etapa D)

**No se borró ninguno.** Dateline "LA PLATA": ahora también se oculta al renderizar (`sinDateline` en `build.mjs`) si el primer párrafo lo trae; en las 44 notas de ejemplo no había ninguno visible (verificado con el navegador). Esperan el OK de Santi. Lo único que se quitó fue lo pedido: el "LA PLATA" debajo de la foto (ya no existe en la página: el dateline salió de las tarjetas en la etapa A y no queda ninguno bajo la foto; el que aparece dentro del primer párrafo de algunas notas es parte del cuerpo).

| # | Elemento | Dónde | Por qué dudo | Captura |
|---|---|---|---|---|
| 1 | "7 min de lectura" | línea fecha/sección, bajo la foto | Juan no lo mencionó; los otros medios no lo muestran | `d-nota-meta-1280.png` |
| 2 | Íconos mini de WhatsApp y copiar link | misma línea, a la derecha | Duplican el bloque "Compartir" del final | `d-nota-meta-1280.png` |
| 3 | Barra fija de compartir (WhatsApp + Copiar link) | mobile, sobre el zócalo | Es la tercera vez que aparece "compartir" en la misma página | `d-nota-390.png` |
| 4 | Bloque "Etiquetas" (chips) | final de la nota | Los enlaces no llevan a ningún lado en la maqueta; candidato a "esto no sé qué es" | `d-nota-etiquetas-1280.png` |
| 5 | Letra capital en el primer párrafo | inicio del cuerpo | Se apaga con `?diario=off`; no está en el brief | `d-nota-1280-top.png` |
| 6 | Doble línea entre bajada y foto | cabecera | Decorativa | `d-nota-1280-top.png` |
| 7 | "Ver más" de "Leé también" | lateral | Lleva a la sección Legislatura, no a un listado de relacionadas | `d-nota-1280-top.png` |

Pregunta abierta: ¿cuál es el elemento que Juan marcó con "esto no sé qué es, esto no va"? Si lo identifican en la reunión, lo saco.

## Franja entre el pie de foto y el cuerpo (donde Juan dijo "esto no sé qué es")
Orden real de arriba hacia abajo: **foto → pie de foto → línea de metadatos → cuerpo**. En esa franja hay:
- **Fecha** (pedida por Juan) y **etiqueta de sección** (pedida): se quedan.
- **#1 "7 min de lectura"**: candidato principal.
- **#2 Íconos mini de WhatsApp y copiar link** (a la derecha de la línea): candidato principal.
- **#5 Letra capital** (la "A" grande al inicio del cuerpo): candidato.
Los demás de la tabla (#3, #4, #6, #7) están fuera de esa franja. Captura: `d-nota-meta-1280.png`. Esperan OK; no se borra nada.
