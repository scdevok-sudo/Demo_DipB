// Genera el HTML estático de la maqueta desde ./data (sin servidor, sin framework).
// Maqueta v2 · diseño "diario" acordado el 4/11. Uso: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const R = import.meta.dirname;
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
const J = f => JSON.parse(rd(f));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------ switches de construcción (los de diseño se cambian en vivo con ?demo=1 o por URL) */
const SHOW_TOP_BANNER = false;      // banner superior: APAGADO
const EDITION_LINE = '';            // "Año XX · Edición Nº": no se inventa; configurable y vacío
const SHOW_LEGISLATURA_LABEL = true;  // v2.3: true = la etiqueta de sección también aparece en las notas de Legislatura Bonaerense (Juan: "en todas, todas, todas"); false la omite
const DEMO_PLACEHOLDERS = true;     // pie de foto / crédito de ejemplo donde el dato no existe
const SECTION_AD_EVERY = 10;        // mobile, secciones internas: un slot 300x250 cada N notas (0 = apagado)
const SECTION_TOTAL = 120;          // notas que se pueden "scrollear" en la sección (se reutilizan con ids distintos)
const SECTION_CHUNK = 10;
const SHOW_FECHA_EN_NOTA = true;    // dentro de la página de la nota se conserva la fecha de publicación (false la saca)
const SHOW_TAPA_RELACIONADAS = false; // desktop: false oculta las 2 notas relacionadas (con guión) bajo la bajada de la nota principal; el markup se conserva, true las vuelve a mostrar
const HEADER_MENU_MOBILE = false;   // mobile: false = las tres barritas viven solo en el zócalo; true = también arriba a la derecha
/* Valores por defecto de cada parámetro (se pisan con ?param=valor, que se recuerda en la sesión). Ver README. */
const DEFAULTS = { seccion: 'foto', super: 'off', tapa: 'texto-izq', vermas: 'flecha', bajada: 'auto', ad: 'on', fondos: 'on', fotos: 'ejemplo', font: 'actual', hora: 'off', diario: 'on', credito: 'on', tiempo: 'off', peso: '700', tapa2: 'normal', ritmo: 'actual', etiqueta: 'texto', header: 'prod', home: 'pdf' };
const OPTIONS = {
  seccion: ['foto', 'abajo'], super: ['off', 'foto', 'texto', '2', '3'], tapa: ['texto-izq', 'foto-izq'], vermas: ['flecha', 'boton'], bajada: ['auto', 'on', 'off'],
  ad: ['on', 'off'], fondos: ['on', 'off'], fotos: ['ejemplo', 'iniciales'], font: ['actual', 'merriweather', 'literata'], hora: ['on', 'off'], diario: ['on', 'off'], credito: ['on', 'off'], tiempo: ['off', 'on'], peso: ['600', '700', '800', '900'], tapa2: ['normal', 'chica'], ritmo: ['actual', 'b', 'c'], etiqueta: ['texto', 'caja'], header: ['prod', 'actual'], home: ['pdf', 'anterior'],
};

/* Alias de valores viejos de parámetros (los links ya compartidos siguen funcionando) */
const ALIAS = { header: { marca: 'prod', marca2: 'prod' }, font: { a: 'actual', b: 'merriweather' }, tapa: { izq: 'foto-izq', der: 'texto-izq' } };

/* CSS: main.css es la fuente; se minifica a main.min.css (menos bytes bloqueando el primer render). No editar el .min a mano. */
{ const css = rd('assets/css/main.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
  fs.writeFileSync(path.join(R, 'assets/css/main.min.css'), css); console.log('✓ main.min.css', (css.length / 1024).toFixed(1) + ' KB'); }

/* ------------------------------------------------------------ datos */
const raw = J('data/10_muestra_notas.json');
const extra = J('data/11_notas_extra.json');
const banners = J('data/banners.json');
const cuerpo = J('data/nota-412179-cuerpo.json');
const dims = J('data/dims.json');
const cintillos = J('data/cintillos.json');   // id → cintillo (texto libre). En producción: campo editable en el editor de notas de WordPress
const autores = J('data/autores.json');            // id → autor de FANTASIA (tools/gen-autores.mjs). En producción: autor de WordPress o campo propio (Hito 2)
const recomendadas = J('data/recomendadas.json'); // las 3 recomendadas de la semana (ids fijos, editables a mano)
const sesiones = J('data/sesiones.json');         // contador de sesiones: DATOS DE EJEMPLO (diseño a definir)
const encuesta = J('data/encuesta.json');         // encuesta: DATOS DE EJEMPLO (diseño a definir)
const cats = rd('data/02_categorias.csv').trim().split('\n').slice(1).map(l => { const m = l.match(/^(\d+),"?([^",]+)"?,([^,]+),(\d+),(\d+)$/); return { name: m[2], slug: m[3], count: +m[5] }; });
const catCount = n => (cats.find(c => c.name.toLowerCase() === n.toLowerCase()) || {}).count;
const fmtN = n => n.toLocaleString('es-AR');
const D = (n, k) => dims[`assets/img/notas/${n.id}-${k}.webp`];
const hasImg = n => !!(D(n, 'm') || D(n, 's'));

const all = new Map();
[...raw.ultimas, ...Object.values(raw.por_categoria).flatMap(c => c.notas)].forEach(n => all.set(n.id, n));
extra.forEach(n => all.set(n.id, n));
all.forEach(n => { if (!autores[n.id]) throw new Error('Falta autor de fantasía para la nota ' + n.id + ' (node tools/gen-autores.mjs)'); n.autor = autores[n.id]; });
const byDate = [...all.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
const isCable = n => n.categorias.includes('Cables');
const pub = byDate.filter(n => !isCable(n) && !n.categorias.some(c => /Colegios|Opini/.test(c)));
const NOTA_ID = 412179;
const NOW_REF = new Date('2026-11-02T20:00:00');           // "ahora" de la maqueta: las horas relativas se calculan contra este instante
const SIN_FOTO = new Set([412621]);
const FOCAL = {};

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const dOf = n => new Date(n.fecha.replace(' ', 'T'));
/* Hora relativa: "Hace 12 min", "Hace 2 horas", "Ayer", "Hace 3 días", "29 oct" */
const rel = n => {
  const mins = Math.max(0, Math.round((NOW_REF - dOf(n)) / 60000)), h = Math.floor(mins / 60), d = Math.floor(mins / 1440);
  if (mins < 60) return `Hace ${Math.max(1, mins)} min`;
  if (h < 24) return `Hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  if (d === 1) return 'Ayer';
  if (d < 7) return `Hace ${d} días`;
  return `${+n.fecha.slice(8, 10)} ${MES[+n.fecha.slice(5, 7) - 1]}`;
};
const fechaLarga = n => `${+n.fecha.slice(8, 10)} de ${MESL[+n.fecha.slice(5, 7) - 1]} de ${n.fecha.slice(0, 4)}`;
const hoyStr = (() => { const d = new Date(); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESL[d.getMonth()]} de ${d.getFullYear()}`.replace(/^./, c => c.toUpperCase()); })();
const sectionOf = n => n.categorias.find(c => !/Destacada|Cables|Elecciones|Sin categor|Soy tu/.test(c)) || n.categorias[0];
const isLeg = n => n.categorias.includes('Legislatura Bonaerense');

/* ------------------------------------------------------------ páginas de nota */
const hasPage = n => n.id === NOTA_ID || !!n._html;
const pageOf = n => n.id === NOTA_ID ? 'nota.html' : `nota-${n.id}.html`;
const noteHref = n => hasPage(n) ? pageOf(n) : '#" data-stub="Maqueta: esta nota de la muestra no tiene página interna (se abren las notas con cuerpo completo).';

/* ------------------------------------------------------------ reparto de notas (cada nota se usa una sola vez en el home) */
const used = new Set();
const use = n => { used.add(n.id); return n; };
/* toma k notas sin repetir; si el pool se agota, recicla (se avisa en consola) */
let recycled = 0;
const take = (pool, k, pred = () => true) => {
  const r = [];
  for (const n of pool) { if (r.length >= k) break; if (!used.has(n.id) && pred(n)) r.push(use(n)); }
  while (r.length < k) { const c = pool.filter(pred)[r.length % Math.max(1, pool.filter(pred).length)]; if (!c) break; recycled++; r.push(c); }
  return r;
};
const SECCIONES = ['Congreso', 'Nación', 'Provincia', 'Municipios'];
let hero, tapa2, tapa, mods, superNotes, flow, f1a, f1b, f2n, textoN;
let recom, unodosA, unodosB, f2d, f2s, grid3, text3, grid4;   // solo home=pdf
let curPage = 'pdf';
/* Reparto de notas del home. Se llama una vez por cada versión del inicio (index.html = home=pdf, index-anterior.html = home=anterior): cada una arranca con las notas libres. */
const allocate = (kind = 'anterior') => {
hero = use(all.get(413361));
tapa2 = [take(pub.filter(n => n.categorias.includes('Nación')), 1, hasImg)[0], take(pub.filter(n => n.categorias.includes('Provincia')), 1, hasImg)[0]];
tapa = [hero, ...tapa2];
if (kind === 'pdf') recom = recomendadas.ids.map(id => { const n = all.get(id); if (!n || !hasImg(n)) throw new Error('recomendadas.json: la nota ' + id + ' no existe o no tiene foto'); return use(n); });   // exactamente 3, fijas (se reservan antes que la franja de secciones para que no se repitan ahi)
// franja de secciones (reservada primero para que el flujo se arme con lo que sobra, mayormente Legislatura)
mods = SECCIONES.map(c => { const p = pub.filter(n => n.categorias.includes(c)); const ph = take(p, 1, hasImg); return [c, [...ph, ...take(p, 2)]]; });
// superdestacadas de demostración (recurso a demanda): el campo `super` de la nota manda; si no hay, se usan sobrantes con foto grande
superNotes = (() => {
  const marked = pub.filter(n => n.super === 'foto' || n.super === 'texto');
  const left = pub.filter(n => !used.has(n.id) && D(n, 'full'));
  const s = [marked[0] || left[0], marked[1] || left[1], marked[2] || left[2]];
  return s.map((n, i) => ({ n: use(n), kind: n.super || (i === 1 ? 'texto' : 'foto') }));
})();
flow = pub.filter(n => !used.has(n.id) && hasImg(n));
const mk = k => take(flow, k, hasImg);
if (kind === 'pdf') {
  /* home=pdf: Formato 2 con notas de Diputados y otro con notas del Senado (como en el PDF), y notas distintas en cada bloque */
  const dip = n => /diputad/i.test(n.titulo) && !/senad/i.test(n.titulo), sen = n => /senad/i.test(n.titulo);
  f2d = take(flow, 4, n => hasImg(n) && dip(n)); f2s = take(flow, 4, n => hasImg(n) && sen(n));
  unodosA = mk(3); unodosB = mk(3); grid3 = mk(6); text3 = mk(3); grid4 = mk(8);
  f1a = f1b = f2n = textoN = [];
} else {
  f1a = mk(4); f1b = mk(4); f2n = mk(8);   // 19 notas en el flujo: 3 (tapa) + 4 + 4 + 8
  textoN = mk(6);   // ritmo=c: bloque de solo texto (cintillo y título, sin foto)
}
};
const ticker = pub.slice(0, 5);
const legPool = pub.filter(isLeg);
// "ver también" de la tapa: notas relacionadas por etiquetas (ya existentes, sin autor)
const related = (n, k) => pub.filter(x => x.id !== n.id && hasPage(x)).map(x => [x, x.tags.filter(t => n.tags.includes(t)).length]).sort((a, b) => b[1] - a[1] || b[0].fecha.localeCompare(a[0].fecha)).slice(0, k).map(a => a[0]);

/* ------------------------------------------------------------ publicidad */
const BANNERS_POR_CICLO = 4;
const SEGUNDOS_POR_BANNER = 5;
const BANNER_HORIZ_ID = '410410';
const uniq = [...new Map(banners.map(b => [b.id, b])).values()];
const isH = b => b.w / b.h > 3;
const hB = uniq.find(b => b.id === BANNER_HORIZ_ID);
const isSq = b => b.w / b.h > .9 && b.w / b.h < 1.12;
const ROT = uniq.filter(isSq).slice(0, 16);                                   // solo cuadrados (4 slots x 4 banners)
const SLOTS4 = [0, 1, 2, 3].map(k => ROT.filter((_, i) => i % 4 === k));
const HROT = [hB, ...uniq.filter(b => isH(b) && b.id !== BANNER_HORIZ_ID)];   // UN solo rodante horizontal (desktop): el de Banco Provincia es la 1.ª slide; tira de 90 px, contain, sin desborde
const adLink = b => b.dest ? `href="${esc(b.dest)}" target="_blank" rel="noopener sponsored"` : 'href="#" data-stub="Banner sin destino cargado en el sitio actual."';
const adSlide = (b, first) => `<a class="adr__slide" ${adLink(b)} aria-label="Publicidad"><img ${first ? `src="${b.file}"` : `data-src="${b.file}"`} alt="Banner publicitario" width="${b.w}" height="${b.h}"></a>`;
const adSlot = list => `<div class="adr"><div class="adr__view">${list.map(b => adSlide(b, false)).join('')}</div></div>`;
const adZone = (lists = SLOTS4, cls = '') => `<section class="adz ${cls}" data-interval="${SEGUNDOS_POR_BANNER * 1000}" aria-label="Publicidad"><div class="wrap adz__in">
  <div class="adz__slots">${lists.map(adSlot).join('')}</div>
  <div class="adz__dots"></div>
</div></section>`;
const adZoneH = (cls = '') => adZone([HROT], ('adz--h ' + cls).trim());
const adOne = () => adZone([ROT], 'adz--one');   // un solo slot rodante (antes el replace no matcheaba y salían 4 slots de 43 px)
/* Banner horizontal 1180x90 (320x100 en mobile). Interruptor: ?ad=on|off. Si está apagado colapsa (display:none). */
const hBanner = () => `<div class="adbanner" aria-label="Publicidad"><a class="adbanner__box" ${adLink(hB)}><img src="${hB.file}" alt="Banner publicitario" width="${hB.w}" height="${hB.h}" loading="lazy"></a></div>`;
const topBanner = () => SHOW_TOP_BANNER ? `<div class="topbanner" aria-label="Publicidad"><div class="wrap"><a ${adLink(hB)}><img src="${hB.file}" alt="" width="${hB.w}" height="${hB.h}" loading="lazy"></a></div></div>` : '';
/* slot de sección interna: 300x600 sticky (desktop) / 300x250 cada N notas (mobile) */
/* publicidad lateral (nota, perfil, secciones y listados, solo desktop): rodante de banners cuadrados (los mismos del rodante de cuadrados del home), 300x250 máx., sticky, con puntos y flechas chicas, sin rótulos, object-fit: contain, pasa solo cada ~5 s y a mano */
const adSide = () => adZone([ROT], 'adz--one adz--side');
/* final de página (nota, perfil, sección y listados): abajo de todo el contenido y antes del pie, sin rótulos.
   Desktop: solo el rodante horizontal (los 7 banners) a todo el ancho del contenido.
   Mobile y tablet (< 1024 px, donde no hay lateral): primero el rodante de cuadrados 300x300 y debajo el horizontal. */
const adEnd = () => `<div class="ad-end">${adZone([ROT], 'adz--one adz--sq')}${adZoneH('adz--end')}</div>`;

/* ------------------------------------------------------------ legisladores (MUESTRA) */
const NOMBRES = ['Lucía Ferrer', 'Martín Salgado', 'Valeria Ruiz', 'Gonzalo Páez', 'Camila Orellana', 'Julián Berro', 'Sofía Mansilla', 'Tomás Aguirre', 'Noelia Bravo', 'Ezequiel Lamas', 'Paula Cardozo', 'Facundo Ibarra', 'Marina Quiroga', 'Hernán Dubois', 'Agustina Roldán', 'Matías Sosa', 'Daniela Vega', 'Rodolfo Pineda', 'Carla Escobar', 'Nicolás Barrios', 'Mariana Toledo', 'Sebastián Fuentes', 'Romina Acosta', 'Leandro Cabrera'];
const BLOQUES = ['Fuerza Patria', 'La Libertad Avanza', 'UCR', 'PRO', 'Coalición Cívica'];
const SECCIONES_E = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava'];
const CIUDADES = ['La Plata', 'Bahía Blanca', 'Mar del Plata', 'Quilmes', 'Lomas de Zamora', 'San Isidro', 'Tandil', 'Junín', 'Pergamino', 'Olavarría', 'Lanús', 'Morón'];
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '-');
// `foto`: ruta del retrato de fantasía (assets/img/fantasia/NN.jpg). En el sitio real viene del registro del legislador; si falta, se ven las iniciales.
const legs = NOMBRES.map((nombre, i) => ({ nombre, slug: slugify(nombre), bloque: BLOQUES[(i + (i >> 2)) % 5], cam: i % 3 === 2 ? 'Senado' : 'Diputados', mandato: i % 3 === 2 ? '2021 a 2025' : '2023 a 2027', seccion_electoral: `${SECCIONES_E[(i * 3 + 1) % 8]} sección electoral`, ciudad: CIUDADES[(i * 5 + 2) % 12], ini: nombre.split(' ').map(p => p[0]).join(''), foto: `assets/img/fantasia/${String(i + 1).padStart(2, '0')}.jpg`, file: i === 0 ? 'legislador.html' : `legislador-${slugify(nombre)}.html` }));
const avatarIn = l => `<span class="avatar__ini">${l.ini}</span>${l.foto ? `<img class="avatar__img" src="${l.foto}" alt="" width="128" height="128" loading="lazy" decoding="async" onerror="this.remove()">` : ''}`;
const tagEj = `<span class="tag-ejemplo"><span class="on-ej">Foto de ejemplo</span><span class="on-ini">Datos de muestra</span></span>`;

/* ------------------------------------------------------------ componentes */
const SZ = {
  lead: '(min-width:1024px) 700px, 100vw',
  s6: '(min-width:1024px) 600px, (min-width:768px) 50vw, 100vw',
  s4: '(min-width:1024px) 400px, (min-width:768px) 50vw, 100vw',
  s3: '(min-width:1024px) 300px, (min-width:768px) 50vw, 100vw',
  sm: '(min-width:768px) 120px, 112px',
  full: '(min-width:1024px) 1240px, 100vw',
};
/* Imagen con srcset/sizes y width/height reservados. eager: solo la primera (fetchpriority=high). */
const thumb = (n, { sizes = SZ.s4, big = false, eager = false, cls = '', alt = '' } = {}) => {
  const p = k => `assets/img/notas/${n.id}-${k}.webp`;
  const s = D(n, 's'), m = D(n, 'm'), f = D(n, 'full');
  const set = [s && `${p('s')} ${s[0]}w`, m && `${p('m')} ${m[0]}w`, f && (big || eager) && `${p('full')} ${f[0]}w`].filter(Boolean).join(', ');
  const base = m || s || f; if (!base) return '';
  const fp = FOCAL[n.id] ? ` style="--fp:${FOCAL[n.id]}"` : '';
  const img = `<img src="${p(m ? 'm' : 's')}" srcset="${set}" sizes="${sizes}" width="${base[0]}" height="${base[1]}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'} onerror="this.remove()">`;
  return `<a class="thumb ${cls}" href="${noteHref(n)}" tabindex="-1" aria-hidden="true" data-ph="${esc(sectionOf(n))}"${fp}>${img}</a>`;
};
const PIE = 'Pie de foto de ejemplo: acá va la descripción de la imagen.';
/* Pie de foto: descripción en sans gris + crédito en mayúsculas (el crédito se apaga con ?credito=off). Nunca el autor de la nota. */
const caption = (n, { txt = true } = {}) => `<figcaption class="cap">${txt ? `<span class="cap__txt${DEMO_PLACEHOLDERS ? ' is-ph' : ''}">${PIE}</span> ` : ''}<span class="cap__credit${DEMO_PLACEHOLDERS ? ' is-ph' : ''}">Foto: Archivo</span></figcaption>`;
const fig = (n, o = {}) => { const t = thumb(n, o); return t ? `<figure class="fig">${t}${o.noTag ? '' : secTag(n)}${o.cap ? caption(n, { txt: o.cap !== 'credit' }) : ''}</figure>` : ''; };
/* Los 4 tipos de tarjeta: lead (fuerte) · med (foto + título) · sm (miniatura + título) · txt (solo texto). Sin autor. */
/* volanta: en Legislatura Bonaerense se omite (SHOW_LEGISLATURA_LABEL); en las demás categorías se conserva */
const kick = n => cintillos[n.id] ? `<span class="cintillo">${esc(cintillos[n.id])}</span>` : '';   // cintillo: texto libre de la redacción, SIEMPRE arriba del título; sin cintillo no deja hueco
/* etiqueta de sección (chica, con fondo): sobre la foto o debajo (?seccion=foto|abajo); en tarjetas sin foto va debajo del título */
const secTag = (n, cls = '') => (isLeg(n) && !SHOW_LEGISLATURA_LABEL) ? '' : `<span class="sectag ${cls}">${esc(sectionOf(n))}</span>`;
const card = (n, { t = 'med', dek = false, h = 3, tf = false, cap = false, eager = false, sizes, big = false, cls = '', dekAfter = false, by = '' } = {}) => {
  const title = `<h${h}><a href="${noteHref(n)}">${esc(n.titulo)}</a></h${h}>`;
  const kicker = kick(n), below = secTag(n, 'sectag--t');
  const meta = `<div class="meta">${rel(n)}</div>`;
  const au = by ? `<span class="autor${by === 'por' ? ' autor--por' : ''}">${by === 'por' ? 'Por ' : ''}${esc(n.autor)}</span>` : '';   // autor de FANTASIA (data/autores.json): 'caps' = MAYÚSCULAS grises chicas, 'por' = "Por …"
  const dk = dek ? `<p class="dek">${esc(n.extracto)}</p>` : '';   // dekAfter: la bajada va después de la foto (tapa del PDF: cintillo y título, foto, bajada)
  if (t === 'txt') return `<article class="card card--txt ${cls}">${kicker}${title}${below}${meta}</article>`;
  if (t === 'sm') return `<article class="card card--sm ${cls}"><div class="card__txt">${kicker}${title}${below}${meta}</div>${thumb(n, { sizes: SZ.sm })}</article>`;
  const f = fig(n, { sizes, big, eager, cap, alt: eager ? n.titulo : '' });
  const txt = `<div class="card__txt">${kicker}${title}${f ? secTag(n, 'sectag--t sectag--cmp') : below}${dekAfter ? '' : dk}${au}${meta}</div>`;
  return `<article class="card card--${t}${tf ? ' card--tf' : ''} ${cls}">${tf ? txt + f + (dekAfter ? dk : '') : f + txt}</article>`;
};
const secTitle = (label, href, id) => `<div class="sec-head"><h2 class="sec-title"${id ? ` id="${id}"` : ''}><span>${label}</span></h2>${href ? `<a href="${href}">Ver más</a>` : ''}</div>`;
const ruleDouble = (cls = '') => `<div class="rule-double ${cls}" role="presentation"></div>`;
const NAV = [['Home', 'index.html'], ['Legislatura Bonaerense', 'seccion.html'], ['Congreso', null], ['Nación', null], ['Provincia', null], ['Municipios', null], ['Diputados', 'diputados.html'], ['Senadores', 'senadores.html']];
const LOGO = '<img src="assets/img/logo-dark.png" alt="Diputados Bonaerenses" width="781" height="100">';
const I = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  burger: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  leg: '<svg viewBox="0 0 24 24"><path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>',
  dip: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/></svg>',
  sen: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 6a3 3 0 0 1 0 5.5M18 14c2 .7 3 2.4 3 5"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="m6 14 6-6 6 6"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2Z"/></svg>',
  fb: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4.5h-3A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16.5L17 11h-3.5V8.8c0-.5.3-.8.5-.8Z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.8 7.2h.01"/></svg>',
  tg: '<svg viewBox="0 0 24 24"><path d="M21 4 3 11l5.5 2L10 19l3-3.5 4.5 3.5L21 4Z"/><path d="m8.5 13 8-5.5"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
};

/* Script que corre ANTES del primer render: lee los parámetros de la URL (o los recordados en la sesión) y los pone en <html data-*>.
   Así no hay parpadeo ni salto de layout al cambiar de variante. */
const early = page => `<script>(function(){var PG=${JSON.stringify(page || '')},d=document.documentElement,O=${JSON.stringify(OPTIONS)},AL=${JSON.stringify(ALIAS)},P=new URLSearchParams(location.search),S={};try{S=JSON.parse(sessionStorage.getItem('dbv')||'{}')}catch(e){}if(P.get('reset')){S={};}for(var k in O){var v=P.get(k);if(v&&AL[k]&&AL[k][v])v=AL[k][v];if(v&&O[k].indexOf(v)>-1)S[k]=v;if(S[k]&&AL[k]&&AL[k][S[k]])S[k]=AL[k][S[k]];if(S[k]&&O[k].indexOf(S[k])>-1)d.setAttribute('data-'+k,S[k]);}var H=P.get('home')||S.home;if(PG==='pdf'&&H==='anterior'){location.replace('index-anterior.html'+location.search+location.hash);return}if(PG==='anterior'){if(H==='pdf'){location.replace('index.html'+location.search+location.hash);return}S.home='anterior';d.setAttribute('data-home','anterior')}try{sessionStorage.setItem('dbv',JSON.stringify(S));if(P.get('demo')==='1')sessionStorage.setItem('demo','1');}catch(e){}})()</script>`;

const head = (title, { extra = '', body = '', page = '', desc = 'Maqueta del rediseño de Diputados Bonaerenses. Documento de trabajo, no indexable.' } = {}) => `<!doctype html>
<html lang="es" ${Object.entries({ ...DEFAULTS, ...(page === 'pdf' ? { tapa: 'foto-izq' } : {}) }).map(([k, v]) => `data-${k}="${v}"`).join(' ')}><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#3daef4">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
${early(page)}
<link rel="preload" href="assets/fonts/SourceSerif4-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/Inter-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/main.min.css">${extra}
</head><body class="${[SHOW_TOP_BANNER && 'show-topbanner', !HEADER_MENU_MOBILE && 'no-hdr-burger', !SHOW_TAPA_RELACIONADAS && 'no-tapa-rel', body].filter(Boolean).join(' ')}">
<a class="skip" href="#main">Saltar al contenido</a>`;

const DOCK = [['menu', 'Menú', null, I.burger], ['leg', 'Legislatura', 'seccion.html', I.leg], ['dip', 'Diputados', 'diputados.html', I.dip], ['sen', 'Senadores', 'senadores.html', I.sen]];
const dockHtml = act => `<nav class="dock" aria-label="Navegación rápida">${DOCK.map(([k, t, h, ic]) => h ? `<a class="dock__b" href="${h}"${h === act ? ' aria-current="page"' : ''}>${ic}<span>${t}</span></a>` : `<button class="dock__b js-dock-menu" type="button" aria-expanded="false" aria-controls="nav">${ic}<span>${t}</span></button>`).join('')}</nav>`;
const header = (active, dockActive = active) => `<header class="hdr">
  <div class="topstrip"><div class="wrap topstrip__in">
    <time class="topstrip__date" data-hoy>${hoyStr}</time>${EDITION_LINE ? `<span class="topstrip__ed">${esc(EDITION_LINE)}</span>` : ''}
    <div class="topstrip__links"><button class="topstrip__btn js-search" type="button" aria-expanded="false">${I.search}Buscar</button></div>
  </div></div>
  <div class="hdr__main"><div class="wrap hdr__top">
    <a class="hdr__logo" href="index.html" aria-label="Diputados Bonaerenses, inicio">${LOGO}</a>
    <div class="hdr__tools">
      <button class="ibtn js-search hide-d" type="button" aria-label="Buscar" aria-expanded="false">${I.search}</button>
      <button class="ibtn burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">${I.burger}</button>
    </div>
  </div></div>
  <form class="search" role="search"><div class="wrap"><div class="search__row"><label class="sr" for="q">Buscar noticias</label><input id="q" type="search" placeholder="Buscar en Diputados Bonaerenses"><button class="btn" type="submit">Buscar</button></div></div></form>
  <nav class="nav" id="nav" aria-label="Principal"><div class="nav__bar"><a href="index.html" aria-label="Inicio">${LOGO}</a><button class="ibtn nav__close" type="button" aria-label="Cerrar menú">${I.close}</button></div><div class="wrap"><ul>
    ${NAV.map(([t, h]) => `<li><a ${h ? `href="${h}"` : 'href="#" data-stub="Sección real del menú; en la maqueta se diseñó Legislatura Bonaerense."'}${h === active ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n    ')}
  </ul><form class="nav__search" role="search"><label class="sr" for="q2">Buscar</label><input id="q2" type="search" placeholder="Buscar noticias"><button class="btn" type="submit">Buscar</button></form></div></nav>
  ${ruleDouble('rule-double--hdr')}
</header>
${topBanner()}
<div class="lasthour" role="region" aria-label="Última hora"><div class="wrap"><span class="lasthour__tag">Última hora</span><div class="lasthour__list">${ticker.map(n => `<a class="lasthour__item" href="${noteHref(n)}"><time>${n.fecha.slice(11, 16)}</time><span>${esc(n.titulo)}</span></a>`).join('')}</div></div></div>
${dockHtml(dockActive)}`;

const footer = () => `${ruleDouble('rule-double--ftr')}<footer class="ftr"><div class="wrap">
  <div class="ftr__grid">
    <div><img class="ftr__logo" src="assets/img/logo-dark.png" alt="Diputados Bonaerenses" width="781" height="100" loading="lazy">
      <p>Todas las noticias de la Legislatura Bonaerense, Congreso Nacional, Nación, Provincia y Municipios.</p></div>
    <div><h2>Secciones</h2><ul>${NAV.slice(1).map(([t, h]) => `<li><a ${h ? `href="${h}"` : 'href="#" data-stub="Sección no incluida en la maqueta."'}>${t}</a></li>`).join('')}</ul></div>
    <div><h2>Institucional</h2><ul>
      <li><a href="#" data-stub="Dato institucional a completar con el cliente.">Quiénes somos</a></li>
      </ul></div>
    <div><h2>Contacto y redes</h2><ul>
      <li><a href="#" data-stub="Datos de contacto y redes: a completar con el cliente.">Contacto <small>(a completar)</small></a></li>
      <li><a href="#" data-stub="Redes: a completar con el cliente.">Redes sociales <small>(a completar)</small></a></li></ul></div>
  </div>
  <div class="ftr__legal">© 2026 Diputados Bonaerenses. Todos los derechos reservados.</div>
</div></footer><div class="toast" role="status" aria-live="polite"></div>
<button class="totop" type="button" aria-label="Volver arriba">${I.up}</button>
<script src="assets/js/main.js" defer></script>
<script>addEventListener('load',function(){var s=document.createElement('script');s.src='assets/js/carousel.js';document.body.appendChild(s)})</script></body></html>`;

const write = (f, html) => { fs.writeFileSync(path.join(R, f), html); console.log('✓', f, (html.length / 1024).toFixed(0) + ' KB'); };

/* ================================================================ módulos "Diputados" y "Senadores" (dos módulos grises y chicos; cada uno es un bloque del FLOW) */
const legOne = (cam, titulo, href) => { const L = legs.filter(l => l.cam === cam); return `<section class="legband" aria-labelledby="t-leg-${href}"><div class="wrap">
  <div class="legband__head"><h2 class="sec-title" id="t-leg-${href}"><span>${titulo}</span></h2>${tagEj}<a href="${href}.html">Ver todos</a></div>
  <div class="lcar" aria-roledescription="carrusel" aria-label="${titulo}">
    <button class="lcar__btn lcar__btn--p" type="button" aria-label="Anteriores">${I.prev}</button>
    <div class="lcar__track" tabindex="0">${L.map(l => `<a class="lcar__item" href="${l.file}"><div class="avatar" aria-hidden="true">${avatarIn(l)}</div><b>${l.nombre}</b><small>${l.bloque}</small></a>`).join('')}</div>
    <button class="lcar__btn lcar__btn--n" type="button" aria-label="Siguientes">${I.next}</button>
    <div class="lcar__count" aria-hidden="true"></div>
  </div>
</div></section>`; };

/* ================================================================ superdestacada (recurso a demanda, apilable) */
const superBlock = ({ n, kind }, i) => kind === 'texto'
  ? `<section class="super super--texto" data-s="${i + 1}" aria-label="Superdestacada"><div class="wrap"><a class="super__in" href="${noteHref(n)}"><span class="super__kicker">${esc(cintillos[n.id] || '')} <i aria-hidden="true">›</i></span><h2>${esc(n.titulo)}</h2>${secTag(n, 'sectag--t')}</a></div></section>`
  : `<section class="super super--foto" data-s="${i + 1}" aria-label="Superdestacada"><div class="wrap"><article class="card card--super">${fig(n, { sizes: SZ.full, big: true, alt: n.titulo })}<div class="card__txt">${kick(n)}<h2><a href="${noteHref(n)}">${esc(n.titulo)}</a></h2><p class="dek">${esc(n.extracto)}</p><div class="meta">${rel(n)}</div></div></article></div></section>`;

/* ================================================================ index.html */
const band = (inner, cls = '') => `<section class="band ${cls}"><div class="wrap">${inner}</div></section>`;
const vermas = hero2 => `<ul class="vermas">${related(hero2, 2).map(r => `<li><a href="${noteHref(r)}">${esc(r.titulo)}</a></li>`).join('')}</ul>`;

/* ---- Secuencia del home: lista configurable de bloques (mover, sumar o sacar sin reescribir componentes) ----
   Bloques disponibles: tapa · legis-diputados · legis-senadores · f1 · f2 · banner · linea · anunciantes · secciones
   (cada "f1"/"f2" toma las siguientes notas del flujo, en orden de fecha y sin repetir) */
/* 'textos' (ritmo=c) y 'trio' (ritmo=b) están siempre en el HTML pero ocultos: con ritmo=actual no se ve ningún cambio. El 2.º 'f1' se oculta con ritmo=b (lo reemplaza 'trio'). */
const FLOW_ANTERIOR = ['tapa', 'legis-diputados', 'f1', 'textos', 'f1', 'trio', 'legis-senadores', 'linea', 'f2', 'anunciantes', 'linea', 'secciones', 'banner'];   // 'banner' (horizontal suelto) solo se ve en mobile; en desktop está oculto porque ya es una slide del rodante horizontal de 'anunciantes'
/* Orden propio para mobile (< 768 px): los dos módulos de legisladores van consecutivos. El FLOW de desktop no se toca: cada bloque lleva su posición mobile en --o y el CSS lo reordena solo en pantallas chicas. */
const FLOW_MOBILE_ANTERIOR = ['tapa', 'legis-diputados', 'legis-senadores', 'f1', 'textos', 'f1', 'trio', 'linea', 'f2', 'linea', 'secciones', 'anunciantes', 'banner'];   // toda la publicidad al final, después de la franja de secciones
/* home=pdf (default): el diseño de Juan (PDF "DISEÑO DB"). Se arma por etapas; por ahora igual al anterior. */
const FLOW_PDF = ['tapa', 'uno-dos', 'legis-diputados', 'uno-dos-espejo', 'rodante-h', 'f2d', 'anunciantes', 'legis-senadores', 'f2s', 'recomendadas', 'grilla3', 'linea', 'secciones', 'banner'];   // se completa por etapas: franja, recomendadas y grilla3
const FLOW_MOBILE_PDF = ['tapa', 'uno-dos', 'legis-diputados', 'legis-senadores', 'uno-dos-espejo', 'f2d', 'f2s', 'recomendadas', 'grilla3', 'linea', 'secciones', 'anunciantes', 'banner'];   // 'rodante-h' es solo desktop
const mobilePosOf = (FL, FM) => { const seen = {}; return FL.map(k => { const nth = seen[k] = (seen[k] ?? -1) + 1; let c = -1; return FM.findIndex(m => m === k && ++c === nth) + 1; }); };
const F1_POOL = () => [f1a, f1b];
let f1i = 0;
const unoDos = ([g, c1, c2], espejo) => band(`<div class="ud${espejo ? ' ud--espejo' : ''}"><div class="ud__big">${card(g, { t: 'med', h: 2, big: true, sizes: SZ.s6, by: 'caps', cls: 'card--udbig' })}</div><div class="ud__side">${[c1, c2].map(n => card(n, { t: 'med', sizes: SZ.s3, by: 'caps', cls: 'card--ud' })).join('')}</div></div>`, 'udband');
const BLOCKS = {
  tapa: () => band(`<div class="tapa">
  <article class="card card--lead tapa__lead">
    ${fig(hero, { sizes: SZ.lead, big: true, eager: true, alt: hero.titulo })}
    <div class="card__txt">${kick(hero)}<h2><a href="${noteHref(hero)}">${esc(hero.titulo)}</a></h2><p class="dek">${esc(hero.extracto)}</p>${vermas(hero)}<div class="meta">${rel(hero)}</div></div>
  </article>
  <div class="row vr cols-2 tapa__two${curPage === 'pdf' ? ' tapa__two--tf' : ''}">${tapa2.map(n => `<div class="span-6">${card(n, curPage === 'pdf' ? { t: 'med', tf: true, dekAfter: true, dek: true, h: 2, big: true, sizes: SZ.s6, cls: 'card--tapa2' } : { t: 'med', dek: true, h: 2, big: true, sizes: SZ.s6, cls: 'card--tapa2' })}</div>`).join('')}</div>
</div>`, 'band--tapa'),
  'legis-diputados': () => legOne('Diputados', 'Diputados', 'diputados'),
  'legis-senadores': () => legOne('Senado', 'Senadores', 'senadores'),
  // Formato 1: 4 notas, 2×2, título arriba de la foto, fondo blanco
  f1: () => { const k = f1i++; const cs = (F1_POOL()[k] || []).map(n => card(n, { t: 'med', tf: true, dek: true, big: true, sizes: SZ.s6 }));
    /* v2.3.2: en el 1.º Formato 1 el rodante horizontal va entre la fila de arriba (2 notas) y la de abajo (2 notas); solo desktop */
    const body = k === 0 ? [...cs.slice(0, 2), `<div class="f1__ad">${adZoneH()}</div>`, ...cs.slice(2)] : cs;
    return band(`<div class="flow vr cols-2 f1${k === 0 ? ' f1--ad' : ''}">${body.join('')}</div>`, 'f1band' + (k === 1 ? ' rv-a2' : '')); },
  // ritmo=b: una nota grande y dos chicas con foto al costado (reemplaza al 2.º Formato 1; usa 3 de sus 4 notas)
  trio: () => { const [g, c1, c2] = F1_POOL()[1]; return band(`<div class="trio"><div class="trio__main">${card(g, { t: 'med', h: 2, big: true, sizes: SZ.s6 })}</div><div class="trio__side">${card(c1, { t: 'sm' })}${card(c2, { t: 'sm' })}</div></div>`, 'rv rv-b'); },
  // ritmo=c: bloque de solo texto entre dos bloques con foto, para cortar la grilla
  textos: () => band(`<div class="solotxt vr cols-3">${textoN.map(n => card(n, { t: 'txt' })).join('')}</div>`, 'rv rv-c'),
  // Formato 2: 8 notas, 2 columnas × 4 filas, foto a la izquierda, fondo suave
  f2: () => band(`<div class="flow vr cols-2 f2">${f2n.map(n => card(n, { t: 'med', dek: true, big: true, sizes: SZ.s6 })).join('')}</div>`, 'f2band band--alt'),
  /* uno-dos (pág. 2 del PDF): una nota grande (foto 2:1, cintillo, título, autor) y dos chicas apiladas con foto cuadrada a la derecha; el espejo invierte las columnas (y la foto de las chicas pasa a la izquierda) */
  'uno-dos': () => unoDos(unodosA, false),
  'uno-dos-espejo': () => unoDos(unodosB, true),
  'rodante-h': () => band(adZoneH(), 'rodh'),   // home=pdf: el rodante horizontal de 7 banners como bloque propio (solo desktop)
  f2d: () => band(`<div class="flow vr cols-2 f2">${f2d.map(n => card(n, { t: 'med', dek: true, big: true, sizes: SZ.s6 })).join('')}</div>`, 'f2band band--alt'),   // Formato 2 con notas de Diputados
  f2s: () => band(`<div class="flow vr cols-2 f2">${f2s.map(n => card(n, { t: 'med', dek: true, big: true, sizes: SZ.s6 })).join('')}</div>`, 'f2band band--alt'),   // Formato 2 con notas del Senado
  /* Las recomendadas de la semana (pág. 4 del PDF): 3 notas fijas (data/recomendadas.json), foto 16:10, desktop: cintillo, título y "Por autor" arriba y la foto debajo; mobile: foto arriba; fondo crema; sin bajada ni pie de foto */
  recomendadas: () => band(`<div class="recom"><h2 class="recom__title"><span>${esc(recomendadas.titulo)}</span></h2><div class="recom__grid">${recom.map(n => card(n, { t: 'med', tf: true, sizes: SZ.s4, by: 'por', cls: 'card--recom' })).join('')}</div></div>`, 'recomband'),
  /* grilla3 (pág. 4 del PDF): noticias comunes en 3 columnas x 2 filas (6 notas), tarjeta blanca con sombra suave, foto 16:9, cintillo, título y "Por autor"; para más filas, repetir 'grilla3' en el FLOW (cada una reparte otras 6 notas desde grid3) */
  grilla3: () => band(`<div class="g3">${grid3.map(n => card(n, { t: 'med', sizes: SZ.s4, by: 'por', cls: 'card--g3' })).join('')}</div>`, 'g3band'),
  banner: () => band(hBanner(), 'adband'),
  linea: () => ruleDouble('rule-double--wrap'),
  anunciantes: () => adZone(),   // el rodante horizontal ya no va acá: está dentro del 1.º Formato 1 (v2.3.2)
  secciones: () => band(`<div class="strip vr cols-4" aria-label="Secciones">${mods.map(([cat, ns]) => `<section class="strip__col" aria-label="${cat}">${secTitle(cat, null)}
  ${card(ns[0], { t: 'med' })}<div class="list">${ns.slice(1).map(n => card(n, { t: 'txt' })).join('')}</div><a class="strip__more" href="#" data-stub="Sección no incluida en la maqueta.">Ver más de ${cat}</a></section>`).join('')}</div>`, 'stripband'),
};
/* Arma una versión del inicio: file = archivo, FL/FM = bloques desktop/mobile, page = 'pdf' | 'anterior' (para el redireccionamiento por ?home=) */
const renderHome = (file, FL, FM, page) => {
  used.clear(); curPage = page; allocate(page); f1i = 0;
  const mob = mobilePosOf(FL, FM);
  const superHtml = superNotes.map(superBlock);
  const blocksHtml = FL.map((k, i) => BLOCKS[k]().replace(/^<(\w+)/, `<$1 style="--o:${mob[i]}"`));
  /* index.html (home=pdf): el build FALLA si un mismo id de nota aparece mas de una vez en cualquier bloque (tarjetas con titulo y superdestacadas) */
  if (page === 'pdf') {
    const donde = new Map();
    const scan = (html, nombre) => { for (const m of html.matchAll(/<h[23]><a href="nota-(\d+)\.html"|class="super__in" href="nota-(\d+)\.html"/g)) { const id = m[1] || m[2]; (donde.get(id) || donde.set(id, []).get(id)).push(nombre); } };
    superHtml.forEach((h, i) => scan(h, 'superdestacada ' + (i + 1)));
    blocksHtml.forEach((h, i) => scan(h, FL[i] + ' (posicion ' + (i + 1) + ')'));
    const rep = [...donde].filter(([, v]) => v.length > 1);
    if (rep.length) throw new Error('index.html: ' + rep.length + ' nota(s) repetida(s):\n' + rep.map(([id, v]) => '  - nota ' + id + ' (' + (all.get(+id)?.titulo || '?') + ') en: ' + v.join(' | ')).join('\n'));
  }
  write(file, `${head('Diputados Bonaerenses · Maqueta', { page, extra: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${hero.id}-m.webp ${D(hero, 'm')[0]}w, assets/img/notas/${hero.id}-full.webp ${D(hero, 'full')[0]}w" imagesizes="(min-width:1024px) 700px, 100vw">` })}
${header('index.html')}
<main id="main" class="home">
<h1 class="sr">Diputados Bonaerenses: noticias de la Legislatura Bonaerense</h1>
${superHtml.join('\n')}
${blocksHtml.join('\n')}
</main>
${footer()}`);
};
renderHome('index-anterior.html', FLOW_ANTERIOR, FLOW_MOBILE_ANTERIOR, 'anterior');
renderHome('index.html', FLOW_PDF, FLOW_MOBILE_PDF, 'pdf');

/* ================================================================ páginas de nota */
const shareText = n => encodeURIComponent(`${n.titulo} ${n.url}`);
const shareLinks = n => { const u = encodeURIComponent(n.url), t = encodeURIComponent(n.titulo); return [['WhatsApp', I.wa, `https://wa.me/?text=${shareText(n)}`], ['Facebook', I.fb, `https://www.facebook.com/sharer/sharer.php?u=${u}`], ['X', I.x, `https://twitter.com/intent/tweet?text=${t}&url=${u}`], ['Instagram', I.ig, null], ['Telegram', I.tg, `https://t.me/share/url?url=${u}&text=${t}`]]; };
const shareBtns = n => `<div class="share" role="group" aria-label="Compartir"><span class="share__lbl">Compartir</span><ul class="share__list">${shareLinks(n).map(([nm, ic, h]) => `<li><a class="share__b" ${h ? `href="${h}" target="_blank" rel="noopener"` : 'href="#" data-stub="Instagram no tiene enlace de compartir web: se resuelve en el Hito 2."'}>${ic}<span>${nm}</span></a></li>`).join('')}<li><button class="share__b js-copy" type="button" data-url="${esc(n.url)}">${I.link}<span>Copiar link</span></button></li></ul></div>`;
const cleanBody = html => {
  let h = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|iframe|object|video|nav)[\s\S]*?<\/\1>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '').replace(/<div[^>]*>[\s\S]*?<\/div>/gi, '');
  h = h.replace(/<\/?(\w+)([^>]*)>/g, (m, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!/^(p|h2|h3|h4|ul|ol|li|strong|b|em|i|a|blockquote|br)$/.test(tag)) return '';
    if (m.startsWith('</')) return `</${tag}>`;
    if (tag === 'h4') return '<h3>';
    if (tag === 'a') { const href = (attrs.match(/href="([^"]*)"/) || [])[1]; return href && href !== '#' ? `<a href="${href}" target="_blank" rel="noopener">` : '<a>'; }
    return `<${tag}>`;
  }).replace(/<\/h4>/g, '</h3>');
  return h.replace(/<p>\s*(&nbsp;|<br>|\s)*<\/p>/g, '').replace(/\n{2,}/g, '\n').trim();
};
/* dateline ("LA PLATA", "LA PLATA.-", "LA PLATA (NA)") al inicio del primer párrafo: se oculta al renderizar (decisión de Juan); no queda ninguno en los datos de muestra, pero el contenido real puede traerlo */
const sinDateline = h => h.replace(/^(\s*<p>\s*)(?:<(strong|b)>\s*)?LA PLATA\b\s*(?:\((?:NA|DIB|Télam|Agencia)\))?[\s\-–—.:]*(?:<\/\2>)?[\s\-–—.:]*/, '$1');
const bodyOf = n => sinDateline(bodyOf0(n));
const bodyOf0 = n => {
  if (n.id !== NOTA_ID) return cleanBody(n._html);
  const parts = cuerpo.html.match(/<p[\s\S]*?<\/p>|<h2[\s\S]*?<\/h2>|<!--IMG\d-->/g);
  return parts.map(p => {
    const im = p.match(/<!--IMG(\d)-->/);
    if (im) { const [w, h] = cuerpo.dims[+im[1]]; return `<figure><img src="${cuerpo.imgs[+im[1]]}" alt="Imagen dentro de la nota" loading="lazy" width="${w}" height="${h}"></figure>`; }
    return p.replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener" href="$1');
  }).join('\n');
};
const artFigure = n => {
  if (SIN_FOTO.has(n.id)) return '';
  const f = D(n, 'full'), m = D(n, 'm'), b = f || m; if (!b) return '';
  const p = k => `assets/img/notas/${n.id}-${k}.webp`;
  return `<figure class="art__fig art__fig--bleed"><img src="${p(f ? 'full' : 'm')}" ${f && m ? `srcset="${p('m')} ${m[0]}w, ${p('full')} ${f[0]}w" sizes="(min-width:1024px) 900px, 100vw"` : ''} alt="${esc(n.titulo)}" width="${b[0]}" height="${b[1]}" fetchpriority="high" decoding="async">${caption(n)}</figure>`;
};
const leeTambien = n => {
  const ns = legPool.filter(x => x.id !== n.id).slice(0, 4);
  return `<section class="sec lee" aria-labelledby="t-lee">${secTitle('Leé también', 'seccion.html', 't-lee')}
  <div class="row vr cols-2">${ns.map(x => `<div class="span-6">${card(x, { t: 'med' })}</div>`).join('')}</div></section>`;
};
const asideBlock = n => `<aside class="aside span-3" aria-label="Columna lateral"><div class="aside__sticky">
  <section aria-labelledby="t-lee-a">${secTitle('Leé también', 'seccion.html', 't-lee-a')}<div class="list">${legPool.filter(x => x.id !== n.id).slice(0, 4).map(x => card(x, { t: 'sm' })).join('')}</div></section>
  ${adSide()}
</div></aside>`;

const notaPage = n => {
  const mins = Math.max(1, Math.round(n.palabras / 200));
  return `${head(n.titulo + ' · Diputados Bonaerenses', { body: 'has-sharebar', extra: (D(n, 'full') || D(n, 'm')) && !SIN_FOTO.has(n.id) ? `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${n.id}-m.webp ${D(n, 'm')?.[0]}w${D(n, 'full') ? `, assets/img/notas/${n.id}-full.webp ${D(n, 'full')[0]}w` : ''}" imagesizes="(min-width:1024px) 900px, 100vw">` : '', desc: n.extracto })}
${header('seccion.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › <a href="seccion.html">Legislatura Bonaerense</a></p>
 <div class="row art-row">
  <article class="span-9 art">
   <header class="art__head">${kick(n)}<h1>${esc(n.titulo)}</h1>
    <p class="art__lead">${esc(n.extracto)}</p>
    ${ruleDouble('art__rule')}
   </header>
   ${artFigure(n)}
   <div class="art__meta">${SHOW_FECHA_EN_NOTA ? `<time datetime="${n.fecha.slice(0, 10)}">${fechaLarga(n)}</time>` : ''}${secTag(n, 'sectag--t')}<span>${mins} min de lectura</span>
    <div class="mini-share"><a class="ibtn-sq ibtn-sq--wa" href="https://wa.me/?text=${shareText(n)}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">${I.wa}</a><button class="ibtn-sq js-copy" type="button" data-url="${esc(n.url)}" aria-label="Copiar link">${I.link}</button></div></div>
   <div class="art__body">${bodyOf(n)}</div>
   ${shareBtns(n)}
   <div class="art__tags"><h2>Etiquetas</h2><div class="chips">${n.tags.filter(t => !/Colegios|Opini/i.test(t)).map(t => `<a class="chip" href="#" data-stub="Cada etiqueta lleva a su archivo en el sitio actual.">${esc(t)}</a>`).join('')}</div></div>
  </article>
  ${asideBlock(n)}
 </div>
 ${leeTambien(n)}
 ${adEnd()}
</div>
</main>
<div class="sharebar" role="group" aria-label="Compartir"><a class="btn btn--wa" href="https://wa.me/?text=${shareText(n)}" target="_blank" rel="noopener">${I.wa}WhatsApp</a><button class="btn btn--ghost js-copy" type="button" data-url="${esc(n.url)}">${I.link}Copiar link</button></div>
${footer()}`;
};
const demoNotes = [all.get(NOTA_ID), ...extra.filter(n => !isCable(n))];
for (const n of demoNotes) write(pageOf(n), notaPage(n));

/* ================================================================ seccion.html: mini tapa + flujo vertical infinito + columna de publicidad */
const secPool = pub.filter(isLeg);
const secLead = secPool[0];
const secTotal = catCount('Legislatura Bonaerense');
/* fila del flujo: línea fina arriba, volanta, titular serif, bajada gris, "Hace X" y foto a la DERECHA */
const sRow = (n, uid) => `<article class="srow" data-uid="${uid}"><div class="srow__txt">${kick(n)}<h3><a href="${noteHref(n)}">${esc(n.titulo)}</a></h3>${secTag(n, 'sectag--t')}<p class="dek">${esc(n.extracto)}</p><div class="meta">${rel(n)}</div></div>${thumb(n, { sizes: '(min-width:768px) 280px, 100vw' })}</article>`;
const secRows = [];
for (let i = 0; secRows.length < SECTION_TOTAL; i++) { const base = secPool[(i % (secPool.length - 1)) + 1]; secRows.push(sRow(base, i < secPool.length - 1 ? `n${base.id}` : `n${base.id}-r${Math.floor(i / (secPool.length - 1))}`)); }
/* mobile: el slot cada N notas es el rodante de cuadrados 300x300 (la misma pieza que el del final de la página), no un banner suelto */
const adM = () => `<div class="srow-ad only-m">${adZone([ROT], 'adz--one adz--sq')}</div>`;
const withAds = (rows, startIdx) => rows.map((r, i) => r + (SECTION_AD_EVERY && (startIdx + i + 1) % SECTION_AD_EVERY === 0 ? adM() : '')).join('');
write('seccion.html', `${head('Legislatura Bonaerense · Diputados Bonaerenses', { extra: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${secLead.id}-m.webp ${D(secLead, 'm')[0]}w${D(secLead, 'full') ? `, assets/img/notas/${secLead.id}-full.webp ${D(secLead, 'full')[0]}w` : ''}" imagesizes="(min-width:1024px) 700px, 100vw">` })}
${header('seccion.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Legislatura Bonaerense</p>
 <div class="sec-hero"><h1 class="sec-title sec-title--lg"><span>Legislatura Bonaerense</span></h1><p>Sesiones, proyectos y la actividad de ambas cámaras de la Provincia de Buenos Aires. ${fmtN(secTotal)} notas en el archivo.</p></div>
 <article class="card card--lead tapa__lead sec-tapa">
   ${fig(secLead, { sizes: SZ.lead, big: true, eager: true, alt: secLead.titulo })}
   <div class="card__txt">${kick(secLead)}<h2><a href="${noteHref(secLead)}">${esc(secLead.titulo)}</a></h2><p class="dek">${esc(secLead.extracto)}</p>${vermas(secLead)}<div class="meta">${rel(secLead)}</div></div>
 </article>
 ${ruleDouble('rule-double--wrap')}
 <div class="sec-layout">
  <div class="sec-main">
   <div class="sflow" id="sflow">${withAds(secRows.slice(0, SECTION_CHUNK), 0)}</div>
   <div class="sec-more" id="sec-more" data-chunk="${SECTION_CHUNK}"><button class="btn btn--ghost js-infinite" type="button">Ver más notas</button></div>
   <template id="sec-tpl">${withAds(secRows.slice(SECTION_CHUNK), SECTION_CHUNK)}</template>
  </div>
  <aside class="sec-side" aria-label="Publicidad">${adSide()}</aside>
 </div>
 ${adEnd()}
</div>
</main>
${footer()}`);

/* ================================================================ diputados.html y senadores.html (dos páginas, pestañas cruzadas, buscador por nombre y filtro por bloque; no hay legisladores.html) */
const legTabs = act => `<nav class="tabs" aria-label="Cámara"><a href="diputados.html"${act === 'Diputados' ? ' aria-current="page"' : ''}>Diputados</a><a href="senadores.html"${act === 'Senado' ? ' aria-current="page"' : ''}>Senadores</a></nav>`;
const legPage = (file, tit, cam) => { const list = legs.filter(l => l.cam === cam); write(file, `${head(tit + ' · Diputados Bonaerenses')}
${header(file)}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › ${tit}</p>
 ${legTabs(cam)}
 <div class="sec-hero"><h1 class="sec-title sec-title--lg"><span>${tit}</span></h1>${tagEj}</div>
 <div class="sec-layout" style="margin-top:16px"><div class="sec-main">
  <form class="filters" role="search" onsubmit="return false"><label>Buscar por nombre<input id="f-nombre" type="search" placeholder="Nombre o apellido" autocomplete="off"></label>
   <label>Bloque<select id="f-bloque"><option value="">Todos</option>${BLOQUES.map(b => `<option>${b}</option>`).join('')}</select></label>
   <div class="filters__end"><button class="btn btn--ghost" id="f-reset" type="button">Limpiar</button><span id="f-count" class="meta" role="status" aria-live="polite"></span></div></form>
  <div class="legs" id="legs">${list.map(l => `<a class="leg" href="${l.file}" data-bloque="${l.bloque}" data-nombre="${slugify(l.nombre).replace(/-/g, ' ')}"><div class="avatar" aria-hidden="true">${avatarIn(l)}</div><h3>${l.nombre}</h3><small>${l.bloque}</small></a>`).join('')}</div>
  <p class="legs__empty" id="legs-empty" hidden>No hay legisladores que coincidan con la búsqueda.</p>
 </div>
 <aside class="sec-side" aria-label="Publicidad">${adSide()}</aside></div>
 ${adEnd()}
</div>
</main>
${footer()}`); };
legPage('diputados.html', 'Diputados', 'Diputados');
legPage('senadores.html', 'Senadores', 'Senado');

/* ================================================================ legislador*.html (perfil completo de prueba + 23 sin biografía) */
const BIO = [
  'Texto de ejemplo para definir el formato. Esta biografía presenta la trayectoria de la legisladora: su formación, los primeros cargos que ocupó en la gestión pública y el recorrido político que la llevó a la Cámara.',
  'Texto de ejemplo. Dentro de la Legislatura integra comisiones de trabajo y participa de las sesiones ordinarias y especiales. En este espacio se cuentan sus áreas de interés, las iniciativas en las que se involucró y su vínculo con el territorio que representa.',
  'Texto de ejemplo. El párrafo final resume otros datos relevantes para quien lee el perfil: actividad previa al cargo, participación en organizaciones civiles y dónde seguir su actividad pública. La biografía real la carga el equipo editorial desde la base de legisladores.',
];
const linked = legPool.slice(0, 12);
const perfil = (L, withBio) => `${head(L.nombre + ' · Diputados Bonaerenses')}
${header(L.cam === 'Senado' ? 'senadores.html' : 'diputados.html')}
<main id="main">
<div class="wrap">
 <div class="prof-layout"><div class="prof-main">
 <p class="crumbs"><a href="index.html">Home</a> › <a href="${L.cam === 'Senado' ? 'senadores.html' : 'diputados.html'}">${L.cam === 'Senado' ? 'Senadores' : 'Diputados'}</a> › ${L.nombre}</p>
 <section class="prof"><div class="avatar" role="img" aria-label="Foto de ${L.nombre} (muestra)">${avatarIn(L)}</div>
  <div><h1>${L.nombre}</h1><ul class="prof__facts"><li><b>Bloque</b>${L.bloque}</li><li><b>Mandato</b>${L.mandato}</li><li><b>Sección electoral</b>${L.seccion_electoral.replace(' sección electoral', '')}</li><li><b>Ciudad</b>${L.ciudad}</li></ul>
   <p style="margin:10px 0 0">${tagEj}</p>
   <div class="prof__share" style="margin-top:16px"><a class="btn btn--wa" href="https://wa.me/?text=${encodeURIComponent(L.nombre + ' · Diputados Bonaerenses')}" target="_blank" rel="noopener">${I.wa}Compartir perfil</a><button class="btn btn--ghost js-copy" type="button" data-url="${L.file}">${I.link}Copiar link</button></div></div></section>
 ${ruleDouble('rule-double--wrap')}
 <div class="notice" style="margin-top:8px"><b>Dato de muestra.</b> Perfil ficticio para mostrar el diseño${withBio ? '; la biografía es texto de ejemplo' : '; este perfil no tiene biografía cargada, así que la sección no se muestra'}. Las notas vinculadas sí son reales.</div>
 ${withBio
    ? `<section class="bio" aria-labelledby="t-bio"><h2 class="sec-title" id="t-bio"><span>Biografía</span></h2><div class="bio__txt" id="bio-txt">${BIO.map(p => `<p>${p}</p>`).join('')}</div><button class="btn btn--ghost bio__btn js-bio" type="button" aria-expanded="false" aria-controls="bio-txt">Leer más</button></section>`
    : ''}
 <section class="sec" aria-labelledby="t-nv">${secTitle('Notas vinculadas', null, 't-nv')}
  <div class="row vr cols-4" id="nv-grid">${linked.map((n, i) => `<div class="span-3${i >= 4 ? ' is-extra' : ''}">${card(n, { t: 'med' })}</div>`).join('')}</div>
  <div class="morebar"><button class="btn btn--ghost js-more" type="button" data-target="#nv-grid" data-step="4">Ver más</button></div>
 </section>
 </div>
 <aside class="prof-side" aria-label="Publicidad">${adSide()}</aside></div>
 ${adEnd()}
</div>
</main>
${footer()}`;
legs.forEach((L, i) => write(L.file, perfil(L, i === 0)));

console.log('Listo:', pub.length, 'notas publicables ·', demoNotes.length, 'páginas de nota ·', recycled ? `⚠ ${recycled} notas recicladas en el home` : 'sin notas repetidas en el home');
