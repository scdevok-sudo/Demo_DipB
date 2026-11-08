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
const SHOW_LEGISLATURA_LABEL = false; // false: en las notas de Legislatura no se repite la volanta "Legislatura Bonaerense" (Legislatura es el todo, no un módulo)
const DEMO_PLACEHOLDERS = true;     // pie de foto / crédito de ejemplo donde el dato no existe
const SECTION_AD_EVERY = 10;        // mobile, secciones internas: un slot 300x250 cada N notas (0 = apagado)
const SECTION_TOTAL = 120;          // notas que se pueden "scrollear" en la sección (se reutilizan con ids distintos)
const SECTION_CHUNK = 10;
/* Valores por defecto de cada parámetro (se pisan con ?param=valor, que se recuerda en la sesión). Ver README. */
const DEFAULTS = { super: 'off', tapa: 'izq', legis: 'a', bajada: 'off', ad: 'on', fondos: 'on', fotos: 'ejemplo', font: 'a', hora: 'off', diario: 'on', credito: 'on' };
const OPTIONS = {
  super: ['off', 'foto', 'texto', '2', '3'], tapa: ['izq', 'der'], legis: ['a', 'b'], bajada: ['on', 'off'],
  ad: ['on', 'off'], fondos: ['on', 'off'], fotos: ['ejemplo', 'iniciales'], font: ['a', 'b'], hora: ['on', 'off'], diario: ['on', 'off'], credito: ['on', 'off'],
};

/* ------------------------------------------------------------ datos */
const raw = J('data/10_muestra_notas.json');
const extra = J('data/11_notas_extra.json');
const banners = J('data/banners.json');
const cuerpo = J('data/nota-412179-cuerpo.json');
const dims = J('data/dims.json');
const cats = rd('data/02_categorias.csv').trim().split('\n').slice(1).map(l => { const m = l.match(/^(\d+),"?([^",]+)"?,([^,]+),(\d+),(\d+)$/); return { name: m[2], slug: m[3], count: +m[5] }; });
const catCount = n => (cats.find(c => c.name.toLowerCase() === n.toLowerCase()) || {}).count;
const fmtN = n => n.toLocaleString('es-AR');
const D = (n, k) => dims[`assets/img/notas/${n.id}-${k}.webp`];
const hasImg = n => !!(D(n, 'm') || D(n, 's'));

const all = new Map();
[...raw.ultimas, ...Object.values(raw.por_categoria).flatMap(c => c.notas)].forEach(n => all.set(n.id, n));
extra.forEach(n => all.set(n.id, n));
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
const datelineOf = n => n.dateline || (isLeg(n) ? 'La Plata' : n.categorias.includes('Congreso') ? 'Buenos Aires' : '');

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
const hero = use(all.get(413361));
const tapa2 = [take(pub.filter(n => n.categorias.includes('Nación')), 1, hasImg)[0], take(pub.filter(n => n.categorias.includes('Provincia')), 1, hasImg)[0]];
const tapa = [hero, ...tapa2];
// franja de secciones (reservada primero para que el flujo se arme con lo que sobra, mayormente Legislatura)
const SECCIONES = ['Congreso', 'Nación', 'Provincia', 'Municipios'];
const mods = SECCIONES.map(c => { const p = pub.filter(n => n.categorias.includes(c)); const ph = take(p, 1, hasImg); return [c, [...ph, ...take(p, 3)]]; });
// superdestacadas de demostración (recurso a demanda): el campo `super` de la nota manda; si no hay, se usan sobrantes con foto grande
const superNotes = (() => {
  const marked = pub.filter(n => n.super === 'foto' || n.super === 'texto');
  const left = pub.filter(n => !used.has(n.id) && D(n, 'full'));
  const s = [marked[0] || left[0], marked[1] || left[1], marked[2] || left[2]];
  return s.map((n, i) => ({ n: use(n), kind: n.super || (i === 1 ? 'texto' : 'foto') }));
})();
const flow = pub.filter(n => !used.has(n.id) && hasImg(n));
const mk = k => take(flow, k, hasImg);
const f1a = mk(4), f1b = mk(4), f2n = mk(8);   // 19 notas en el flujo: 3 (tapa) + 4 + 4 + 8
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
const ROT = uniq.filter(b => b.id !== BANNER_HORIZ_ID).sort((a, b) => isH(a) - isH(b));
const SLOTS4 = [0, 1, 2, 3].map(k => ROT.filter((_, i) => i % 4 === k));
const adLink = b => b.dest ? `href="${esc(b.dest)}" target="_blank" rel="noopener sponsored"` : 'href="#" data-stub="Banner sin destino cargado en el sitio actual."';
const adSlide = (b, first) => `<a class="adr__slide" ${adLink(b)} aria-label="Publicidad"><img ${first ? `src="${b.file}"` : `data-src="${b.file}"`} alt="Banner publicitario" width="${b.w}" height="${b.h}"></a>`;
const adSlot = list => `<div class="adr"><div class="adr__view">${list.map(b => adSlide(b, false)).join('')}</div></div>`;
const adZone = (lists = SLOTS4) => `<section class="adz" data-group="${BANNERS_POR_CICLO}" data-interval="${SEGUNDOS_POR_BANNER * 1000}" aria-label="Anunciantes"><div class="wrap adz__in">
  <div class="adz__head"><h2 class="sec-title"><span>Anunciantes</span></h2><span class="adz__label">Publicidad</span></div>
  <div class="adz__slots">${lists.map(adSlot).join('')}</div>
  <div class="adz__dots"></div>
</div></section>`;
const adOne = () => adZone([ROT]).replace('<section class="adz"', '<section class="adz adz--one"');
/* Banner horizontal 1180x90 (320x100 en mobile). Interruptor: ?ad=on|off. Si está apagado colapsa (display:none). */
const hBanner = () => `<div class="adbanner" aria-label="Publicidad"><span class="adbanner__label">Publicidad</span><a class="adbanner__box" ${adLink(hB)}><img src="${hB.file}" alt="Banner publicitario" width="${hB.w}" height="${hB.h}" loading="lazy"></a></div>`;
const topBanner = () => SHOW_TOP_BANNER ? `<div class="topbanner" aria-label="Publicidad"><div class="wrap"><a ${adLink(hB)}><img src="${hB.file}" alt="" width="${hB.w}" height="${hB.h}" loading="lazy"></a></div></div>` : '';
/* slot de sección interna: 300x600 sticky (desktop) / 300x250 cada N notas (mobile) */
const adBox = cls => `<aside class="adbox ${cls}" aria-label="Publicidad"><span class="adbox__label">Publicidad</span><a class="adbox__in" ${adLink(ROT.find(b => !isH(b)))}><img src="${ROT.find(b => !isH(b)).file}" alt="Banner publicitario" width="300" height="300" loading="lazy"></a></aside>`;

/* ------------------------------------------------------------ legisladores (MUESTRA) */
const NOMBRES = ['Lucía Ferrer', 'Martín Salgado', 'Valeria Ruiz', 'Gonzalo Páez', 'Camila Orellana', 'Julián Berro', 'Sofía Mansilla', 'Tomás Aguirre', 'Noelia Bravo', 'Ezequiel Lamas', 'Paula Cardozo', 'Facundo Ibarra', 'Marina Quiroga', 'Hernán Dubois', 'Agustina Roldán', 'Matías Sosa', 'Daniela Vega', 'Rodolfo Pineda', 'Carla Escobar', 'Nicolás Barrios', 'Mariana Toledo', 'Sebastián Fuentes', 'Romina Acosta', 'Leandro Cabrera'];
const BLOQUES = ['Bloque A', 'Bloque B', 'Bloque C', 'Bloque D'], PARTIDOS = ['Partido 1', 'Partido 2', 'Partido 3'];
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '-');
// `foto`: ruta del retrato de fantasía (assets/img/fantasia/NN.jpg). En el sitio real viene del registro del legislador; si falta, se ven las iniciales.
const legs = NOMBRES.map((nombre, i) => ({ nombre, slug: slugify(nombre), bloque: BLOQUES[i % 4], partido: PARTIDOS[(i * 7 + (i >> 2)) % 3], cam: i % 3 === 2 ? 'Senado' : 'Diputados', ini: nombre.split(' ').map(p => p[0]).join(''), foto: `assets/img/fantasia/${String(i + 1).padStart(2, '0')}.jpg`, file: i === 0 ? 'legislador.html' : `legislador-${slugify(nombre)}.html` }));
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
const fig = (n, o = {}) => { const t = thumb(n, o); return t ? `<figure class="fig">${t}${o.cap ? caption(n, { txt: o.cap !== 'credit' }) : ''}</figure>` : ''; };
/* Los 4 tipos de tarjeta: lead (fuerte) · med (foto + título) · sm (miniatura + título) · txt (solo texto). Sin autor. */
/* volanta: en Legislatura Bonaerense se omite (SHOW_LEGISLATURA_LABEL); en las demás categorías se conserva */
const kick = n => (isLeg(n) && !SHOW_LEGISLATURA_LABEL) ? '' : `<span class="kicker">${esc(sectionOf(n))}</span>`;
const card = (n, { t = 'med', dek = false, h = 3, tf = false, cap = false, eager = false, sizes, big = false, cls = '' } = {}) => {
  const title = `<h${h}><a href="${noteHref(n)}">${esc(n.titulo)}</a></h${h}>`;
  const kicker = kick(n);
  const meta = `<div class="meta">${rel(n)}</div>`;
  const dk = dek ? `<p class="dek">${esc(n.extracto)}</p>` : '';
  if (t === 'txt') return `<article class="card card--txt ${cls}">${kicker}${title}${meta}</article>`;
  if (t === 'sm') return `<article class="card card--sm ${cls}"><div class="card__txt">${kicker}${title}${meta}</div>${thumb(n, { sizes: SZ.sm })}</article>`;
  const f = fig(n, { sizes, big, eager, cap, alt: eager ? n.titulo : '' });
  const txt = `<div class="card__txt">${kicker}${title}${dk}${meta}</div>`;
  return `<article class="card card--${t}${tf ? ' card--tf' : ''} ${cls}">${tf ? txt + f : f + txt}</article>`;
};
const secTitle = (label, href, id) => `<div class="sec-head"><h2 class="sec-title"${id ? ` id="${id}"` : ''}><span>${label}</span></h2>${href ? `<a href="${href}">Ver más</a>` : ''}</div>`;
const ruleDouble = (cls = '') => `<div class="rule-double ${cls}" role="presentation"></div>`;
const NAV = [['Home', 'index.html'], ['Legislatura Bonaerense', 'seccion.html'], ['Congreso', null], ['Nación', null], ['Provincia', null], ['Municipios', null], ['Diputados Bonaerenses', 'legisladores.html']];
const LOGO = '<img src="assets/img/logo-dark.png" alt="Diputados Bonaerenses" width="500" height="68">';
const I = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  burger: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="m6 14 6-6 6 6"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2Z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
};

/* Script que corre ANTES del primer render: lee los parámetros de la URL (o los recordados en la sesión) y los pone en <html data-*>.
   Así no hay parpadeo ni salto de layout al cambiar de variante. */
const EARLY = `<script>(function(){var d=document.documentElement,O=${JSON.stringify(OPTIONS)},P=new URLSearchParams(location.search),S={};try{S=JSON.parse(sessionStorage.getItem('dbv')||'{}')}catch(e){}if(P.get('reset')){S={};}for(var k in O){var v=P.get(k);if(v&&O[k].indexOf(v)>-1)S[k]=v;if(S[k]&&O[k].indexOf(S[k])>-1)d.setAttribute('data-'+k,S[k]);}try{sessionStorage.setItem('dbv',JSON.stringify(S));if(P.get('demo')==='1')sessionStorage.setItem('demo','1');}catch(e){}})()</script>`;

const head = (title, { extra = '', body = '', desc = 'Maqueta del rediseño de Diputados Bonaerenses. Documento de trabajo, no indexable.' } = {}) => `<!doctype html>
<html lang="es" ${Object.entries(DEFAULTS).map(([k, v]) => `data-${k}="${v}"`).join(' ')}><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b2236">
${EARLY}
<link rel="stylesheet" href="assets/css/main.css">${extra}
</head><body class="${[SHOW_TOP_BANNER && 'show-topbanner', body].filter(Boolean).join(' ')}">
<a class="skip" href="#main">Saltar al contenido</a>`;

const header = active => `<header class="hdr">
  <div class="topstrip"><div class="wrap topstrip__in">
    <time class="topstrip__date" data-hoy>${hoyStr}</time>${EDITION_LINE ? `<span class="topstrip__ed">${esc(EDITION_LINE)}</span>` : ''}
    <div class="topstrip__links"><button class="topstrip__btn js-search" type="button" aria-expanded="false">${I.search}Buscar</button><a href="legisladores.html">Legisladores</a></div>
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
<div class="lasthour" role="region" aria-label="Última hora"><div class="wrap"><span class="lasthour__tag">Última hora</span><div class="lasthour__list">${ticker.map(n => `<a class="lasthour__item" href="${noteHref(n)}"><time>${n.fecha.slice(11, 16)}</time><span>${esc(n.titulo)}</span></a>`).join('')}</div></div></div>`;

const footer = () => `${ruleDouble('rule-double--ftr')}<footer class="ftr"><div class="wrap">
  <div class="ftr__grid">
    <div><img class="ftr__logo" src="assets/img/logo-dark.png" alt="Diputados Bonaerenses" width="500" height="68" loading="lazy">
      <p>Todas las noticias de la Legislatura Bonaerense, Congreso Nacional, Nación, Provincia y Municipios.</p></div>
    <div><h2>Secciones</h2><ul>${NAV.slice(1).map(([t, h]) => `<li><a ${h ? `href="${h}"` : 'href="#" data-stub="Sección no incluida en la maqueta."'}>${t}</a></li>`).join('')}</ul></div>
    <div><h2>Institucional</h2><ul>
      <li><a href="#" data-stub="Dato institucional a completar con el cliente.">Quiénes somos</a></li>
      <li><a href="legisladores.html">Legisladores</a></li></ul></div>
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

/* ================================================================ módulo "Diputados y Senadores" (dos posiciones: a = tras la tapa · b = en el medio del flujo) */
const legModule = slot => `<section class="legband legband--${slot}" aria-labelledby="t-leg-${slot}"><div class="wrap">
  <div class="legband__head"><h2 class="sec-title" id="t-leg-${slot}"><span>Diputados y Senadores</span></h2>${tagEj}<a href="legisladores.html">Ver todos</a></div>
  <div class="lcar" aria-roledescription="carrusel" aria-label="Legisladores">
    <button class="lcar__btn lcar__btn--p" type="button" aria-label="Anteriores">${I.prev}</button>
    <div class="lcar__track" tabindex="0">${legs.map(l => `<a class="lcar__item" href="${l.file}"><div class="avatar" aria-hidden="true">${avatarIn(l)}</div><b>${l.nombre}</b><small>${l.cam} · ${l.bloque}</small></a>`).join('')}</div>
    <button class="lcar__btn lcar__btn--n" type="button" aria-label="Siguientes">${I.next}</button>
    <div class="lcar__count" aria-hidden="true"></div>
  </div>
</div></section>`;

/* ================================================================ superdestacada (recurso a demanda, apilable) */
const superBlock = ({ n, kind }, i) => kind === 'texto'
  ? `<section class="super super--texto" data-s="${i + 1}" aria-label="Superdestacada"><div class="wrap"><a class="super__in" href="${noteHref(n)}"><span class="super__kicker">${esc(sectionOf(n))} <i aria-hidden="true">›</i></span><h2>${esc(n.titulo)}</h2></a></div></section>`
  : `<section class="super super--foto" data-s="${i + 1}" aria-label="Superdestacada"><div class="wrap"><article class="card card--super">${fig(n, { sizes: SZ.full, big: true, cap: true, alt: n.titulo })}<div class="card__txt"><span class="kicker">${esc(sectionOf(n))}</span><h2><a href="${noteHref(n)}">${esc(n.titulo)}</a></h2><p class="dek">${esc(n.extracto)}</p><div class="meta">${rel(n)}</div></div></article></div></section>`;

/* ================================================================ index.html */
const band = (inner, cls = '') => `<section class="band ${cls}"><div class="wrap">${inner}</div></section>`;
const vermas = hero2 => `<ul class="vermas">${related(hero2, 2).map(r => `<li><a href="${noteHref(r)}">${esc(r.titulo)}</a></li>`).join('')}</ul>`;
const dl = n => datelineOf(n) ? `<span class="dateline">${esc(datelineOf(n))}</span>` : '';

/* ---- Secuencia del home: lista configurable de bloques (mover, sumar o sacar sin reescribir componentes) ----
   Bloques disponibles: tapa · legis-a · legis-b · f1 · f2 · banner · linea · anunciantes · secciones
   (cada "f1"/"f2" toma las siguientes notas del flujo, en orden de fecha y sin repetir) */
const FLOW = ['tapa', 'legis-a', 'f1', 'banner', 'f1', 'legis-b', 'linea', 'f2', 'anunciantes', 'linea', 'secciones'];
const F1_POOL = [f1a, f1b];
let f1i = 0;
const BLOCKS = {
  tapa: () => band(`<div class="tapa">
  <article class="card card--lead tapa__lead">
    ${fig(hero, { sizes: SZ.lead, big: true, eager: true, cap: true, alt: hero.titulo })}
    <div class="card__txt">${kick(hero)}<h2><a href="${noteHref(hero)}">${esc(hero.titulo)}</a></h2>${dl(hero)}<p class="dek">${esc(hero.extracto)}</p>${vermas(hero)}<div class="meta">${rel(hero)}</div></div>
  </article>
  <div class="row vr cols-2 tapa__two">${tapa2.map(n => `<div class="span-6">${card(n, { t: 'med', dek: true, h: 2, big: true, sizes: SZ.s6, cap: true, cls: 'card--tapa2' })}</div>`).join('')}</div>
</div>`, 'band--tapa'),
  'legis-a': () => legModule('a'),
  'legis-b': () => legModule('b'),
  // Formato 1: 4 notas, 2×2, título arriba de la foto, fondo blanco
  f1: () => band(`<div class="flow vr cols-2 f1">${(F1_POOL[f1i++] || []).map(n => card(n, { t: 'med', tf: true, dek: true, cap: 'credit', big: true, sizes: SZ.s6 })).join('')}</div>`, 'f1band'),
  // Formato 2: 8 notas, 2 columnas × 4 filas, foto a la izquierda, fondo suave
  f2: () => band(`<div class="flow vr cols-2 f2">${f2n.map(n => card(n, { t: 'med', dek: true, big: true, sizes: SZ.s6 })).join('')}</div>`, 'f2band band--alt'),
  banner: () => band(hBanner(), 'adband'),
  linea: () => ruleDouble('rule-double--wrap'),
  anunciantes: () => adZone(),
  secciones: () => band(`<div class="strip vr cols-4" aria-label="Secciones">${mods.map(([cat, ns]) => `<section class="strip__col" aria-label="${cat}">${secTitle(cat, null)}
  ${card(ns[0], { t: 'med' })}<div class="list">${ns.slice(1).map(n => card(n, { t: 'txt' })).join('')}</div><a class="strip__more" href="#" data-stub="Sección no incluida en la maqueta.">Ver más de ${cat}</a></section>`).join('')}</div>`, 'stripband'),
};
write('index.html', `${head('Diputados Bonaerenses · Maqueta', { extra: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${hero.id}-m.webp ${D(hero, 'm')[0]}w, assets/img/notas/${hero.id}-full.webp ${D(hero, 'full')[0]}w" imagesizes="(min-width:1024px) 700px, 100vw">` })}
${header('index.html')}
<main id="main">
<h1 class="sr">Diputados Bonaerenses: noticias de la Legislatura Bonaerense</h1>
${superNotes.map(superBlock).join('\n')}
${FLOW.map(k => BLOCKS[k]()).join('\n')}
</main>
${footer()}`);

/* ================================================================ páginas de nota */
const shareText = n => encodeURIComponent(`${n.titulo} ${n.url}`);
const shareBtns = n => `<div class="share" role="group" aria-label="Compartir"><a class="btn btn--wa" href="https://wa.me/?text=${shareText(n)}" target="_blank" rel="noopener">${I.wa}Compartir por WhatsApp</a><div class="share__row"><button class="btn btn--ghost js-copy" type="button" data-url="${esc(n.url)}">${I.link}Copiar link</button><a class="btn btn--ghost" href="#" data-stub="Compartir en otras redes: se resuelve en el Hito 2.">Más redes</a></div></div>`;
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
const bodyOf = n => {
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
  ${adOne()}
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
   <header class="art__head"><a class="kicker" href="seccion.html">${esc(sectionOf(n))}</a><h1>${esc(n.titulo)}</h1>
    <p class="art__lead">${esc(n.extracto)}</p>
    ${ruleDouble('art__rule')}
   </header>
   <div class="art__meta"><time datetime="${n.fecha.replace(' ', 'T')}">${fechaLarga(n)} · ${n.fecha.slice(11, 16)} h</time><span>${mins} min de lectura</span>
    <div class="mini-share"><a class="ibtn-sq ibtn-sq--wa" href="https://wa.me/?text=${shareText(n)}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">${I.wa}</a><button class="ibtn-sq js-copy" type="button" data-url="${esc(n.url)}" aria-label="Copiar link">${I.link}</button></div></div>
   ${artFigure(n)}
   ${datelineOf(n) ? `<p class="art__dateline"><span class="dateline">${esc(datelineOf(n))}</span></p>` : ''}
   <div class="art__body">${bodyOf(n)}</div>
   ${shareBtns(n)}
   <div class="art__tags"><h2>Etiquetas</h2><div class="chips">${n.tags.filter(t => !/Colegios|Opini/i.test(t)).map(t => `<a class="chip" href="#" data-stub="Cada etiqueta lleva a su archivo en el sitio actual.">${esc(t)}</a>`).join('')}</div></div>
  </article>
  ${asideBlock(n)}
 </div>
 ${leeTambien(n)}
 <div class="ad-end">${adOne()}</div>
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
const sRow = (n, uid) => `<article class="srow" data-uid="${uid}"><div class="srow__txt"><span class="kicker">${esc(sectionOf(n))}</span><h3><a href="${noteHref(n)}">${esc(n.titulo)}</a></h3><p class="dek">${esc(n.extracto)}</p><div class="meta">${rel(n)}</div></div>${thumb(n, { sizes: '(min-width:768px) 280px, 120px' })}</article>`;
const secRows = [];
for (let i = 0; secRows.length < SECTION_TOTAL; i++) { const base = secPool[(i % (secPool.length - 1)) + 1]; secRows.push(sRow(base, i < secPool.length - 1 ? `n${base.id}` : `n${base.id}-r${Math.floor(i / (secPool.length - 1))}`)); }
const adM = () => `<div class="srow-ad only-m"><span class="adbox__label">Publicidad</span><a class="srow-ad__in" ${adLink(ROT.find(b => !isH(b)))}><img src="${ROT.find(b => !isH(b)).file}" alt="Banner publicitario" width="300" height="250" loading="lazy"></a></div>`;
const withAds = (rows, startIdx) => rows.map((r, i) => r + (SECTION_AD_EVERY && (startIdx + i + 1) % SECTION_AD_EVERY === 0 ? adM() : '')).join('');
write('seccion.html', `${head('Legislatura Bonaerense · Diputados Bonaerenses', { extra: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${secLead.id}-m.webp ${D(secLead, 'm')[0]}w${D(secLead, 'full') ? `, assets/img/notas/${secLead.id}-full.webp ${D(secLead, 'full')[0]}w` : ''}" imagesizes="(min-width:1024px) 700px, 100vw">` })}
${header('seccion.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Legislatura Bonaerense</p>
 <div class="sec-hero"><h1 class="sec-title sec-title--lg"><span>Legislatura Bonaerense</span></h1><p>Sesiones, proyectos y la actividad de ambas cámaras de la Provincia de Buenos Aires. ${fmtN(secTotal)} notas en el archivo.</p></div>
 <article class="card card--lead tapa__lead sec-tapa">
   ${fig(secLead, { sizes: SZ.lead, big: true, eager: true, cap: true, alt: secLead.titulo })}
   <div class="card__txt"><span class="kicker">${esc(sectionOf(secLead))}</span><h2><a href="${noteHref(secLead)}">${esc(secLead.titulo)}</a></h2>${dl(secLead)}<p class="dek">${esc(secLead.extracto)}</p>${vermas(secLead)}<div class="meta">${rel(secLead)}</div></div>
 </article>
 ${ruleDouble('rule-double--wrap')}
 <div class="sec-layout">
  <div class="sec-main">
   <div class="sflow" id="sflow">${withAds(secRows.slice(0, SECTION_CHUNK), 0)}</div>
   <div class="sec-more" id="sec-more" data-chunk="${SECTION_CHUNK}"><button class="btn btn--ghost js-infinite" type="button">Ver más notas</button></div>
   <template id="sec-tpl">${withAds(secRows.slice(SECTION_CHUNK), SECTION_CHUNK)}</template>
  </div>
  <aside class="sec-side" aria-label="Publicidad">${adBox('adbox--tall')}</aside>
 </div>
</div>
</main>
${footer()}`);

/* ================================================================ legisladores.html */
write('legisladores.html', `${head('Diputados Bonaerenses · Legisladores')}
${header('legisladores.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Diputados Bonaerenses</p>
 <div class="sec-hero"><h1 class="sec-title sec-title--lg"><span>Diputados y Senadores</span></h1><p>Perfiles de legisladores de la Provincia de Buenos Aires. ${tagEj}</p></div>
 <div class="sec" style="margin-top:24px">
  <div class="notice"><b>Dato de muestra.</b> No se recibió el export del CPT <code>funcionario</code>: nombres, bloques y partidos son ficticios y las fotos son retratos de ejemplo (se vuelve a las iniciales con <code>?fotos=iniciales</code>). En el Hito 2 se reemplazan por los registros reales.</div>
  <form class="filters" onsubmit="return false"><label>Bloque<select id="f-bloque"><option value="">Todos</option>${BLOQUES.map(b => `<option>${b}</option>`).join('')}</select></label>
   <label>Partido<select id="f-partido"><option value="">Todos</option>${PARTIDOS.map(b => `<option>${b}</option>`).join('')}</select></label>
   <div style="display:flex;gap:12px;align-items:center"><button class="btn btn--ghost" id="f-reset" type="button">Limpiar</button><span id="f-count" class="meta" role="status"></span></div></form>
  <div class="legs" id="legs">${legs.map(l => `<a class="leg" href="${l.file}" data-bloque="${l.bloque}" data-partido="${l.partido}"><div class="avatar" aria-hidden="true">${avatarIn(l)}</div><h3>${l.nombre}</h3><small>${l.cam} · ${l.bloque} · ${l.partido}</small></a>`).join('')}</div>
 </div>
 <div class="sec">${adOne()}</div>
</div>
</main>
${footer()}`);

/* ================================================================ legislador*.html (perfil completo de prueba + 23 sin biografía) */
const BIO = [
  'Texto de ejemplo para definir el formato. Esta biografía presenta la trayectoria de la legisladora: su formación, los primeros cargos que ocupó en la gestión pública y el recorrido político que la llevó a la Cámara.',
  'Texto de ejemplo. Dentro de la Legislatura integra comisiones de trabajo y participa de las sesiones ordinarias y especiales. En este espacio se cuentan sus áreas de interés, las iniciativas en las que se involucró y su vínculo con el territorio que representa.',
  'Texto de ejemplo. El párrafo final resume otros datos relevantes para quien lee el perfil: actividad previa al cargo, participación en organizaciones civiles y dónde seguir su actividad pública. La biografía real la carga el equipo editorial desde la base de legisladores.',
];
const linked = legPool.slice(0, 12);
const perfil = (L, withBio) => `${head(L.nombre + ' · Diputados Bonaerenses')}
${header('legisladores.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › <a href="legisladores.html">Diputados Bonaerenses</a> › ${L.nombre}</p>
 <section class="prof"><div class="avatar" role="img" aria-label="Foto de ${L.nombre} (muestra)">${avatarIn(L)}</div>
  <div><h1>${L.nombre}</h1><ul class="prof__facts"><li><b>Cámara</b>${L.cam}</li><li><b>Bloque</b>${L.bloque}</li><li><b>Partido</b>${L.partido}</li></ul>
   <p style="margin:10px 0 0">${tagEj}</p>
   <div class="prof__share" style="margin-top:16px"><a class="btn btn--wa" href="https://wa.me/?text=${encodeURIComponent(L.nombre + ' · Diputados Bonaerenses')}" target="_blank" rel="noopener">${I.wa}Compartir perfil</a><button class="btn btn--ghost js-copy" type="button" data-url="${L.file}">${I.link}Copiar link</button></div></div></section>
 ${ruleDouble('rule-double--wrap')}
 <div class="notice" style="margin-top:8px"><b>Dato de muestra.</b> Perfil ficticio para mostrar el diseño${withBio ? '; la biografía es texto de ejemplo' : '; este perfil no tiene biografía cargada (estado vacío)'}. Las notas vinculadas sí son reales.</div>
 ${withBio
    ? `<section class="bio" aria-labelledby="t-bio"><h2 class="sec-title" id="t-bio"><span>Biografía</span></h2><div class="bio__txt" id="bio-txt">${BIO.map(p => `<p>${p}</p>`).join('')}</div><button class="btn btn--ghost bio__btn js-bio" type="button" aria-expanded="false" aria-controls="bio-txt">Leer más</button></section>`
    : `<section class="bio bio--empty" aria-labelledby="t-bio"><h2 class="sec-title" id="t-bio"><span>Biografía</span></h2><p>Todavía no hay una biografía cargada para este perfil.</p></section>`}
 <section class="sec" aria-labelledby="t-nv">${secTitle('Notas vinculadas', null, 't-nv')}
  <p class="meta" style="margin:-4px 0 16px">En el sitio final equivale al tag de la persona (ejemplo).</p>
  <div class="row vr cols-4" id="nv-grid">${linked.map((n, i) => `<div class="span-3${i >= 4 ? ' is-extra' : ''}">${card(n, { t: 'med' })}</div>`).join('')}</div>
  <div class="morebar"><button class="btn btn--ghost js-more" type="button" data-target="#nv-grid" data-step="4">Ver más</button></div>
 </section>
 <div class="sec">${adOne()}</div>
</div>
</main>
${footer()}`;
legs.forEach((L, i) => write(L.file, perfil(L, i === 0)));

console.log('Listo:', pub.length, 'notas publicables ·', demoNotes.length, 'páginas de nota ·', recycled ? `⚠ ${recycled} notas recicladas en el home` : 'sin notas repetidas en el home');
