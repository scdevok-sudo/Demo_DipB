// Genera el HTML estático de la maqueta desde ./data (sin servidor, sin framework).
// Uso: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const R = import.meta.dirname;
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
const J = f => JSON.parse(rd(f));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------ flags (se pueden alternar en vivo con ?demo=1) */
const SHOW_TOP_BANNER = false;   // banner publicitario superior: APAGADO por defecto
const SHOW_LAST_HOUR = false;    // franja "Última hora": APAGADA por defecto
const DEFAULTS = { font: 'a', aside: 'a', lee: '2' };   // font a = Source Serif 4, b = Merriweather · aside a/b · lee 2 | 4 columnas

/* ------------------------------------------------------------ datos */
const raw = J('data/10_muestra_notas.json');
const extra = J('data/11_notas_extra.json');
const banners = J('data/banners.json');
const cuerpo = J('data/nota-412179-cuerpo.json');
const cats = rd('data/02_categorias.csv').trim().split('\n').slice(1).map(l => { const m = l.match(/^(\d+),"?([^",]+)"?,([^,]+),(\d+),(\d+)$/); return { name: m[2], slug: m[3], count: +m[5] }; });
const catCount = n => (cats.find(c => c.name.toLowerCase() === n.toLowerCase()) || {}).count;
const fmtN = n => n.toLocaleString('es-AR');

const all = new Map();
[...raw.ultimas, ...Object.values(raw.por_categoria).flatMap(c => c.notas)].forEach(n => all.set(n.id, n));
extra.forEach(n => all.set(n.id, n));                    // las notas nuevas (con cuerpo) pisan a la muestra
const byDate = [...all.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
const isCable = n => n.categorias.includes('Cables');
const pub = byDate.filter(n => !isCable(n) && !n.categorias.some(c => /Colegios|Opini/.test(c)));              // lo que puede ir en portada
const NOTA_ID = 412179;                                   // la nota larga con imágenes internas (ya existente)
const TODAY = '2026-11-02';
const SIN_FOTO = new Set([412621]);                       // caso de demostración: nota sin foto
const FOCAL = {};                                         // punto focal por nota: { id: '50% 20%' }

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fecha = n => n.fecha.startsWith(TODAY) ? `Hoy ${n.fecha.slice(11, 16)}` : `${+n.fecha.slice(8, 10)} ${MES[+n.fecha.slice(5, 7) - 1]}`;
const fechaLarga = n => `${+n.fecha.slice(8, 10)} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][+n.fecha.slice(5, 7) - 1]} de ${n.fecha.slice(0, 4)}`;
const sectionOf = n => n.categorias.find(c => !/Destacada|Cables|Elecciones|Sin categor|Soy tu/.test(c)) || n.categorias[0];
const isLeg = n => n.categorias.includes('Legislatura Bonaerense');

/* ------------------------------------------------------------ páginas de nota */
const hasPage = n => n.id === NOTA_ID || !!n._html;
const pageOf = n => n.id === NOTA_ID ? 'nota.html' : `nota-${n.id}.html`;
const noteHref = n => hasPage(n) ? pageOf(n) : '#" data-stub="Maqueta: esta nota de la muestra no tiene página interna (se abren las notas con cuerpo completo).';

/* ------------------------------------------------------------ portada (editorial) */
const HERO_ID = 413361;
const TAPA2 = [413339, 413263];
const hero = all.get(HERO_ID), tapa2 = TAPA2.map(i => all.get(i));
const used = new Set([hero, ...tapa2].map(n => n.id));
const take = (pool, k) => { const r = []; for (const n of pool) { if (r.length >= k) break; if (!used.has(n.id)) { used.add(n.id); r.push(n); } } return r; };
const legPool = pub.filter(isLeg);
const leg1 = take(legPool, 7);           // primer bloque de Legislatura
const leg2 = take(legPool, 5);           // segundo bloque, tras el módulo de legisladores
const legLast = take(legPool, 5);        // "Lo último de Legislatura" junto a Anunciantes
const mods = ['Congreso', 'Nación', 'Provincia', 'Municipios'].map(c => [c, take(pub.filter(n => n.categorias.includes(c)), 3)]);
const ticker = pub.slice(0, 5);

/* ------------------------------------------------------------ publicidad (zona única "Anunciantes") */
const BANNERS_POR_CICLO = 4;   // banners por ciclo del rotador (puntos de paginación)
const SEGUNDOS_POR_BANNER = 5;
const TOP_BANNER_ID = '410410';   // creatividad de la franja superior (apagada por defecto)
const uniq = [...new Map(banners.map(b => [b.id, b])).values()];
const isH = b => b.w / b.h > 3;
const topB = uniq.find(b => b.id === TOP_BANNER_ID);
const ROT = uniq.filter(b => b.id !== TOP_BANNER_ID).sort((a, b) => isH(a) - isH(b));
const SLOT_A = ROT.filter((_, i) => i % 2 === 0), SLOT_B = ROT.filter((_, i) => i % 2 === 1);
const adLink = b => b.dest ? `href="${esc(b.dest)}" target="_blank" rel="noopener sponsored"` : 'href="#" data-stub="Banner sin destino cargado en el sitio actual."';
const adSlide = (b, first) => `<a class="adr__slide" ${adLink(b)} aria-label="Publicidad"><img ${first ? `src="${b.file}"` : `data-src="${b.file}"`} alt="Banner publicitario" width="${b.w}" height="${b.h}"></a>`;
// Slot: caja cuadrada fija (max 300px); la imagen va "contain" y centrada, nunca se sale de la caja
const adSlot = list => `<div class="adr"><div class="adr__view">${list.map(b => adSlide(b, false)).join('')}</div></div>`;
// Zona "Anunciantes": UNA etiqueta "Publicidad", slots que rotan juntos y UN solo juego de puntos centrado debajo
const adZone = (lists = [SLOT_A, SLOT_B]) => `<section class="adz" data-group="${BANNERS_POR_CICLO}" data-interval="${SEGUNDOS_POR_BANNER * 1000}" aria-label="Anunciantes"><div class="adz__in">
  <div class="sec-head"><h2>Anunciantes</h2><span class="adz__label">Publicidad</span></div>
  <div class="adz__slots">${lists.map(adSlot).join('')}</div>
  <div class="adz__dots"></div>
</div></section>`;
const adOne = () => adZone([ROT]);
const topBanner = () => `<div class="topbanner" aria-label="Publicidad"><div class="wrap"><a ${adLink(topB)} aria-label="Publicidad"><img src="${topB.file}" alt="Banner publicitario superior" width="${topB.w}" height="${topB.h}" loading="lazy"></a></div></div>`;

/* ------------------------------------------------------------ legisladores (MUESTRA: no hay 11_funcionarios.json) */
const NOMBRES = ['Lucía Ferrer', 'Martín Salgado', 'Valeria Ruiz', 'Gonzalo Páez', 'Camila Orellana', 'Julián Berro', 'Sofía Mansilla', 'Tomás Aguirre', 'Noelia Bravo', 'Ezequiel Lamas', 'Paula Cardozo', 'Facundo Ibarra', 'Marina Quiroga', 'Hernán Dubois', 'Agustina Roldán', 'Matías Sosa', 'Daniela Vega', 'Rodolfo Pineda', 'Carla Escobar', 'Nicolás Barrios', 'Mariana Toledo', 'Sebastián Fuentes', 'Romina Acosta', 'Leandro Cabrera'];
const BLOQUES = ['Bloque A', 'Bloque B', 'Bloque C', 'Bloque D'], PARTIDOS = ['Partido 1', 'Partido 2', 'Partido 3'];
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '-');
const legs = NOMBRES.map((nombre, i) => ({ nombre, slug: slugify(nombre), bloque: BLOQUES[i % 4], partido: PARTIDOS[(i * 7 + (i >> 2)) % 3], cam: i % 3 === 2 ? 'Senado' : 'Diputados', ini: nombre.split(' ').map(p => p[0]).join(''), file: i === 0 ? 'legislador.html' : `legislador-${slugify(nombre)}.html` }));

/* ------------------------------------------------------------ componentes */
const dims = J('data/dims.json');
const D = (n, k) => dims[`assets/img/notas/${n.id}-${k}.webp`];
const SZ = {
  1: '(max-width:767px) 100vw, (min-width:1024px) 300px, 50vw',
  2: '(max-width:767px) 100vw, (min-width:1024px) 610px, 50vw',
  4: '(min-width:1024px) 1200px, 100vw',
  s: '(max-width:767px) 96px, (min-width:1024px) 300px, 50vw',
};
/* Imagen con srcset/sizes, width/height reservados. eager: solo la hero (fetchpriority=high). */
const thumb = (n, { span = 1, mobSm = false, eager = false, sizes, cls = '', alt = '', tag = 'a' } = {}) => {
  const p = k => `assets/img/notas/${n.id}-${k}.webp`;
  const s = D(n, 's'), m = D(n, 'm'), f = D(n, 'full');
  const sz = sizes || (mobSm ? SZ.s : SZ[span] || SZ[1]);
  const set = [s && `${p('s')} ${s[0]}w`, m && `${p('m')} ${m[0]}w`, f && (span >= 2 || eager) && `${p('full')} ${f[0]}w`].filter(Boolean).join(', ');
  const base = m || s || f; if (!base) return '';
  const fp = FOCAL[n.id] ? ` style="--fp:${FOCAL[n.id]}"` : '';
  const img = `<img src="${p(m ? 'm' : 's')}" srcset="${set}" sizes="${sz}" width="${base[0]}" height="${base[1]}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'} onerror="this.remove()">`;
  return tag === 'a'
    ? `<a class="thumb ${cls}" href="${noteHref(n)}" tabindex="-1" aria-hidden="true" data-ph="${esc(sectionOf(n))}"${fp}>${img}</a>`
    : `<span class="thumb ${cls}" data-ph="${esc(sectionOf(n))}"${fp}>${img}</span>`;
};
/* Los 4 tipos de tarjeta: lead (fuerte) · med · sm (chica con foto) · txt (solo texto). Sin autor en ningún lado. */
const card = (n, { t = 'med', span = 1, dek = false, mob = 'big', eager = false, tapa = false, h = 3 } = {}) => {
  const c = `col-${span}`;
  const hh = `h${h}`;
  const title = `<${hh}><a href="${noteHref(n)}">${esc(n.titulo)}</a></${hh}>`;
  const kicker = `<span class="kicker">${esc(sectionOf(n))}</span>`;
  const meta = `<div class="meta">${fecha(n)}</div>`;
  if (t === 'txt') return `<article class="card card--txt ${c}">${kicker}${title}${meta}</article>`;
  if (t === 'sm') return `<article class="card card--sm ${c}"><div class="card__txt">${kicker}${title}${meta}</div>${thumb(n, { mobSm: true })}</article>`;
  const mobSm = t === 'med' && mob === 'sm';
  return `<article class="card card--${t}${tapa ? ' card--tapa' : ''}${mobSm ? ' mob-sm' : ''} ${c}">${thumb(n, { span: t === 'lead' ? (span === 4 ? 4 : 2) : span, mobSm, eager, alt: eager ? n.titulo : '', sizes: tapa && span === 4 ? '(min-width:1024px) 1200px, 100vw' : undefined })}<div class="card__txt">${kicker}${title}${dek ? `<p class="dek${t === 'lead' && tapa ? '' : ' dek--2'}">${esc(n.extracto)}</p>` : ''}${meta}</div></article>`;
};
const list = (ns, span, extraCls = '') => `<div class="list ${extraCls} col-${span}">${ns.map(n => card(n, { t: 'txt', span: 1 })).join('')}</div>`;
const secHead = (label, href, lg = false) => `<div class="sec-head${lg ? ' sec-head--lg' : ''}"><h2>${label}</h2>${href ? `<a href="${href}">Ver más</a>` : ''}</div>`;

/* "Lo último de Legislatura": 1 con foto 16:10 + 4 con miniatura 96×96, sin autor */
const lastLeg = (ns, span) => `<section class="lastleg" aria-labelledby="t-ll${span}"><div class="sec-head"><h2 id="t-ll${span}">Lo último de Legislatura</h2></div>
  ${card(ns[0], { t: 'med', span })}
  <div class="lastleg__list">${ns.slice(1, 5).map(n => card(n, { t: 'sm' })).join('')}</div>
  <a class="lastleg__more" href="seccion.html">Ver toda la Legislatura</a></section>`;
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

const head = (title, { extra = '', body = '', desc = 'Maqueta del rediseño de Diputados Bonaerenses. Documento de trabajo, no indexable.' } = {}) => `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b2236">
<link rel="stylesheet" href="assets/css/main.css">${extra}
</head><body class="${[SHOW_TOP_BANNER && 'show-topbanner', SHOW_LAST_HOUR && 'show-lasthour', body].filter(Boolean).join(' ')}" data-font="${DEFAULTS.font}" data-aside="${DEFAULTS.aside}" data-lee="${DEFAULTS.lee}">
<a class="skip" href="#main">Saltar al contenido</a>`;

const header = active => `<header class="hdr">
  <div class="wrap hdr__top">
    <a class="hdr__logo" href="index.html" aria-label="Diputados Bonaerenses, inicio">${LOGO}</a>
    <span class="hdr__date">${new Date(TODAY + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
    <div class="hdr__tools">
      <button class="ibtn js-search" type="button" aria-label="Buscar" aria-expanded="false">${I.search}</button>
      <button class="ibtn burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">${I.burger}</button>
    </div>
  </div>
  <form class="search" role="search"><div class="wrap"><div class="search__row"><label class="sr" for="q">Buscar noticias</label><input id="q" type="search" placeholder="Buscar en Diputados Bonaerenses"><button class="btn" type="submit">Buscar</button></div></div></form>
  <nav class="nav" id="nav" aria-label="Principal"><div class="nav__bar"><a href="index.html" aria-label="Inicio">${LOGO}</a><button class="ibtn nav__close" type="button" aria-label="Cerrar menú">${I.close}</button></div><div class="wrap"><ul>
    ${NAV.map(([t, h]) => `<li><a ${h ? `href="${h}"` : 'href="#" data-stub="Sección real del menú; en la maqueta se diseñó Legislatura Bonaerense."'}${h === active ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n    ')}
  </ul><form class="nav__search" role="search"><label class="sr" for="q2">Buscar</label><input id="q2" type="search" placeholder="Buscar noticias"><button class="btn" type="submit">Buscar</button></form></div></nav>
</header>
${topBanner()}
<div class="lasthour" role="region" aria-label="Última hora"><div class="wrap"><span class="lasthour__tag">Última hora</span><div class="lasthour__list">${ticker.map(n => `<a class="lasthour__item" href="${noteHref(n)}"><time>${n.fecha.slice(11, 16)}</time><span>${esc(n.titulo)}</span></a>`).join('')}</div></div></div>`;

const footer = (extraMain = '') => `<footer class="ftr"><div class="wrap">
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
  <div class="ftr__legal">Maqueta navegable · SCdev · Contenido real extraído de diputadosbsas.com.ar el ${fechaLarga({ fecha: TODAY })}. Documento de trabajo, no indexable.</div>
</div></footer><div class="toast" role="status" aria-live="polite"></div>
<button class="totop" type="button" aria-label="Volver arriba">${I.up}</button>
<script src="assets/js/main.js" defer></script>
<script>addEventListener('load',function(){var s=document.createElement('script');s.src='assets/js/carousel.js';document.body.appendChild(s)})</script></body></html>`;

const write = (f, html) => { fs.writeFileSync(path.join(R, f), html); console.log('✓', f, (html.length / 1024).toFixed(0) + ' KB'); };
// patrón mobile: una grande cada tres (grande, chica, chica, grande…)
const mp = i => i % 3 === 0 ? 'big' : 'sm';

/* ================================================================ módulo de legisladores (estrella del home) */
const legModule = () => `<section class="legband" aria-labelledby="t-leg"><div class="wrap">
  <div class="sec-head"><h2 id="t-leg">Diputados y Senadores</h2><a href="legisladores.html">Ver todos</a></div>
  <p class="legband__sub">Los perfiles de quienes integran ambas cámaras, con sus notas. <span class="tag-muestra">Datos de muestra</span></p>
  <div class="lcar" aria-roledescription="carrusel" aria-label="Legisladores">
    <button class="lcar__btn lcar__btn--p" type="button" aria-label="Anteriores">${I.prev}</button>
    <div class="lcar__track" tabindex="0">${legs.map(l => `<a class="lcar__item" href="${l.file}"><div class="avatar" aria-hidden="true">${l.ini}</div><b>${l.nombre}</b><small>${l.cam} · ${l.bloque}</small></a>`).join('')}</div>
    <button class="lcar__btn lcar__btn--n" type="button" aria-label="Siguientes">${I.next}</button>
    <div class="lcar__count" aria-hidden="true"></div>
  </div>
</div></section>`;

/* ================================================================ index.html */
const modulito = ([cat, ns]) => ns.length ? `<details class="mod col-1" open><summary>${cat}</summary>
  ${card(ns[0], { t: 'sm' })}<div class="list list--lines">${ns.slice(1).map(n => card(n, { t: 'txt' })).join('')}</div><a class="mod__more" href="#" data-stub="Sección no incluida en la maqueta.">Ver más de ${cat}</a></details>` : '';

write('index.html', `${head('Diputados Bonaerenses · Maqueta', { extra: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${hero.id}-m.webp ${D(hero, 'm')[0]}w, assets/img/notas/${hero.id}-full.webp ${D(hero, 'full')[0]}w" imagesizes="(min-width:1024px) 1200px, 100vw">` })}
${header('index.html')}
<main id="main">
<h1 class="sr">Diputados Bonaerenses: noticias de la Legislatura Bonaerense</h1>
<div class="wrap">
 <section class="sec" aria-label="Portada"><div class="grid">
  ${card(hero, { t: 'lead', span: 4, dek: true, eager: true, tapa: true, h: 2 })}
  ${tapa2.map(n => card(n, { t: 'med', span: 2, dek: true }).replace('col-2', 'col-2 t-1')).join('')}
 </div></section>

 <section class="sec" aria-labelledby="t-l1">${secHead('Legislatura Bonaerense', 'seccion.html', true).replace('<h2>', '<h2 id="t-l1">')}
  <div class="grid">
   ${card(leg1[0], { t: 'med', span: 2, dek: true })}
   ${card(leg1[1], { t: 'med', span: 1, mob: 'sm' })}
   ${card(leg1[2], { t: 'med', span: 1, mob: 'sm' })}
   ${card(leg1[3], { t: 'med', span: 1, mob: 'sm' })}
   ${card(leg1[4], { t: 'med', span: 1, mob: 'sm' })}
   <div class="list col-2 hide-m">${[leg1[5], leg1[6]].map(n => card(n, { t: 'txt' })).join('')}</div>
  </div>
 </section>
</div>
${legModule()}
<div class="wrap">
 <section class="sec" aria-labelledby="t-l2">${secHead('Más Legislatura Bonaerense', 'seccion.html').replace('<h2>', '<h2 id="t-l2">')}
  <div class="grid">
   ${card(leg2[0], { t: 'med', span: 2, dek: true })}
   ${card(leg2[1], { t: 'med', span: 1, mob: 'sm' })}
   ${list(leg2.slice(2, 5), 1)}
  </div>
 </section>

 <div class="sec grid adrow">
  <div class="col-2 adcol">${adZone()}</div>
  <div class="col-2">${lastLeg(legLast, 2)}</div>
 </div>

 <section class="sec" aria-label="Otras secciones"><div class="grid">${mods.map(modulito).join('')}</div></section>
</div>
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
  return `<figure class="art__fig art__fig--bleed"><img src="${p(f ? 'full' : 'm')}" ${f && m ? `srcset="${p('m')} ${m[0]}w, ${p('full')} ${f[0]}w" sizes="(min-width:1024px) 920px, 100vw"` : ''} alt="${esc(n.titulo)}" width="${b[0]}" height="${b[1]}" fetchpriority="high" decoding="async"></figure>`;
};
const leeTambien = n => {
  const ns = legPool.filter(x => x.id !== n.id).slice(0, 4);
  return `<section class="sec lee" aria-labelledby="t-lee">${secHead('Leé también', 'seccion.html').replace('<h2>', '<h2 id="t-lee">')}
  <div class="grid">${ns.map((x, i) => card(x, { t: 'med', span: 2, mob: mp(i) }).replace('col-2', 'col-lee')).join('')}</div></section>`;
};
const asideBlock = n => `<aside class="aside col-1" aria-label="Columna lateral"><div class="aside__sticky">
  <div class="aside-b">${lastLeg(legPool.filter(x => x.id !== n.id).slice(0, 5), 1)}</div>
  ${adOne()}
</div></aside>`;

const notaPage = n => {
  const mins = Math.max(1, Math.round(n.palabras / 200));
  return `${head(n.titulo + ' · Diputados Bonaerenses', { body: 'has-sharebar', extra: (D(n, 'full') || D(n, 'm')) && !SIN_FOTO.has(n.id) ? `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${n.id}-m.webp ${D(n, 'm')?.[0]}w${D(n, 'full') ? `, assets/img/notas/${n.id}-full.webp ${D(n, 'full')[0]}w` : ''}" imagesizes="(min-width:1024px) 920px, 100vw">` : '', desc: n.extracto })}
${header('seccion.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › <a href="seccion.html">Legislatura Bonaerense</a></p>
 <div class="grid" style="margin-top:8px">
  <article class="col-3">
   <header class="art__head"><a class="kicker" href="seccion.html">${esc(sectionOf(n))}</a><h1>${esc(n.titulo)}</h1>
    <p class="art__lead">${esc(n.extracto)}</p>
   </header>
   ${artFigure(n)}
   <div class="art__meta"><time datetime="${n.fecha.replace(' ', 'T')}">${fechaLarga(n)} · ${n.fecha.slice(11, 16)} h</time><span>${mins} min de lectura</span>
    <div class="mini-share"><a class="ibtn-sq ibtn-sq--wa" href="https://wa.me/?text=${shareText(n)}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">${I.wa}</a><button class="ibtn-sq js-copy" type="button" data-url="${esc(n.url)}" aria-label="Copiar link">${I.link}</button></div></div>
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

/* ================================================================ seccion.html */
const secNotas = pub.filter(isLeg).slice(0, 24);
const secTotal = catCount('Legislatura Bonaerense');
// filas que siempre suman 4: [2·1·1] primera fila (1 fuerte + 2), luego variadas
const ROWS = [[2, 1, 1], [1, 1, 1, 1], [2, 1, 1], [1, 1, 2], [1, 1, 1, 1], [1, 2, 1], [1, 1, 1, 1]];
let k = 0;
const secRows = ROWS.map((row, ri) => {
  const first = ri === 0;
  const htmlRow = row.map((sp, ci) => {
    const n = secNotas[k]; if (!n) return ''; const i = k++;
    const cardHtml = first && ci === 0 ? card(n, { t: 'lead', span: 2, dek: true, h: 2, eager: true }) : card(n, { t: 'med', span: sp, dek: sp === 2, mob: first ? 'sm' : mp(i) });
    return ri >= 4 ? cardHtml.replace('<article class="card', '<article class="is-extra card') : cardHtml;
  }).join('');
  return htmlRow;
}).join('');
write('seccion.html', `${head('Legislatura Bonaerense · Diputados Bonaerenses', { extra: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${secNotas[0].id}-m.webp ${D(secNotas[0], 'm')[0]}w${D(secNotas[0], 'full') ? `, assets/img/notas/${secNotas[0].id}-full.webp ${D(secNotas[0], 'full')[0]}w` : ''}" imagesizes="(min-width:1024px) 610px, 100vw">` })}
${header('seccion.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Legislatura Bonaerense</p>
 <div class="sec-hero"><h1>Legislatura Bonaerense</h1><p>Sesiones, proyectos y la actividad de ambas cámaras de la Provincia de Buenos Aires. ${fmtN(secTotal)} notas en el archivo.</p></div>
 <div class="grid" style="margin-top:24px" id="sec-grid">${secRows}</div>
 <div class="morebar"><button class="btn btn--ghost js-more" type="button" data-target="#sec-grid" data-step="12">Ver más notas</button></div>
 <div class="sec">${adOne()}</div>
</div>
</main>
${footer()}`);

/* ================================================================ legisladores.html */
write('legisladores.html', `${head('Diputados Bonaerenses · Legisladores')}
${header('legisladores.html')}
<main id="main">
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Diputados Bonaerenses</p>
 <div class="sec-hero"><h1>Diputados y Senadores</h1><p>Perfiles de legisladores de la Provincia de Buenos Aires.</p></div>
 <div class="sec" style="margin-top:24px">
  <div class="notice"><b>Dato de muestra.</b> No se recibió el export del CPT <code>funcionario</code>: nombres, bloques y partidos son ficticios y las fotos son iniciales. En el Hito 2 se reemplazan por los registros reales.</div>
  <form class="filters" onsubmit="return false"><label>Bloque<select id="f-bloque"><option value="">Todos</option>${BLOQUES.map(b => `<option>${b}</option>`).join('')}</select></label>
   <label>Partido<select id="f-partido"><option value="">Todos</option>${PARTIDOS.map(b => `<option>${b}</option>`).join('')}</select></label>
   <div style="display:flex;gap:12px;align-items:center"><button class="btn btn--ghost" id="f-reset" type="button">Limpiar</button><span id="f-count" class="meta" role="status"></span></div></form>
  <div class="legs" id="legs">${legs.map(l => `<a class="leg" href="${l.file}" data-bloque="${l.bloque}" data-partido="${l.partido}"><div class="avatar" aria-hidden="true">${l.ini}</div><h3>${l.nombre}</h3><small>${l.cam} · ${l.bloque} · ${l.partido}</small></a>`).join('')}</div>
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
 <section class="prof"><div class="avatar" role="img" aria-label="Foto de ${L.nombre} (muestra)">${L.ini}</div>
  <div><h1>${L.nombre}</h1><ul class="prof__facts"><li><b>Cámara</b>${L.cam}</li><li><b>Bloque</b>${L.bloque}</li><li><b>Partido</b>${L.partido}</li></ul>
   <div class="prof__share" style="margin-top:16px"><a class="btn btn--wa" href="https://wa.me/?text=${encodeURIComponent(L.nombre + ' · Diputados Bonaerenses')}" target="_blank" rel="noopener">${I.wa}Compartir perfil</a><button class="btn btn--ghost js-copy" type="button" data-url="${L.file}">${I.link}Copiar link</button></div></div></section>
 <div class="notice" style="margin-top:8px"><b>Dato de muestra.</b> Perfil ficticio para mostrar el diseño${withBio ? '; la biografía es texto de ejemplo' : '; este perfil no tiene biografía cargada (estado vacío)'}. Las notas vinculadas sí son reales.</div>
 ${withBio
    ? `<section class="bio" aria-labelledby="t-bio"><h2 id="t-bio">Biografía <span class="tag-muestra">texto de ejemplo</span></h2><div class="bio__txt" id="bio-txt">${BIO.map(p => `<p>${p}</p>`).join('')}</div><button class="btn btn--ghost bio__btn js-bio" type="button" aria-expanded="false" aria-controls="bio-txt">Leer más</button></section>`
    : `<section class="bio bio--empty" aria-labelledby="t-bio"><h2 id="t-bio">Biografía</h2><p>Todavía no hay una biografía cargada para este perfil.</p></section>`}
 <section class="sec" aria-labelledby="t-nv">${secHead('Notas vinculadas').replace('<h2>', '<h2 id="t-nv">')}
  <p class="meta" style="margin:-4px 0 16px">En el sitio final equivale al tag de la persona (ejemplo).</p>
  <div class="grid" id="nv-grid">${linked.map((n, i) => { const c = card(n, { t: 'med', span: 1, mob: mp(i) }); return i >= 4 ? c.replace('<article class="card', '<article class="is-extra card') : c; }).join('')}</div>
  <div class="morebar"><button class="btn btn--ghost js-more" type="button" data-target="#nv-grid" data-step="4">Ver más</button></div>
 </section>
 <div class="sec">${adOne()}</div>
</div>
</main>
${footer()}`;
legs.forEach((L, i) => write(L.file, perfil(L, i === 0)));

console.log('Listo:', pub.length, 'notas publicables ·', demoNotes.length, 'páginas de nota');
