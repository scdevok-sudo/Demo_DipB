// Genera el HTML estático de la maqueta desde ./data (sin servidor, sin framework).
// Uso: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const R = import.meta.dirname;
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
const J = f => JSON.parse(rd(f));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------ datos */
const raw = J('data/10_muestra_notas.json');
const banners = J('data/banners.json');
const cuerpo = J('data/nota-412179-cuerpo.json');
const cats = rd('data/02_categorias.csv').trim().split('\n').slice(1).map(l => { const m = l.match(/^(\d+),"?([^",]+)"?,([^,]+),(\d+),(\d+)$/); return { name: m[2], slug: m[3], count: +m[5] }; });
const tagsTop = rd('data/03_tags_top.csv').trim().split('\n').slice(1).map(l => { const m = l.match(/^(\d+),"?([^",]+)"?,([^,]+),(\d+)$/); return { name: m[2], count: +m[4] }; });
const years = rd('data/05_posts_por_anio.txt').trim().split('\n').slice(1).map(l => l.split('\t')).reverse();
const catCount = n => (cats.find(c => c.name.toLowerCase() === n.toLowerCase()) || {}).count;
const fmtN = n => n.toLocaleString('es-AR');

const all = new Map();
[...raw.ultimas, ...Object.values(raw.por_categoria).flatMap(c => c.notas)].forEach(n => all.set(n.id, n));
const byDate = [...all.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
const isCable = n => n.categorias.includes('Cables');
const pub = byDate.filter(n => !isCable(n));          // lo que puede ir en portada
const NOTA_ID = 412179;                                // la más larga con imágenes
const TODAY = '2026-10-23';

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fecha = n => n.fecha.startsWith(TODAY) ? `Hoy ${n.fecha.slice(11, 16)}` : `${+n.fecha.slice(8, 10)} ${MES[+n.fecha.slice(5, 7) - 1]}`;
const fechaLarga = n => `${+n.fecha.slice(8, 10)} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][+n.fecha.slice(5, 7) - 1]} de ${n.fecha.slice(0, 4)}`;
const sectionOf = n => n.categorias.find(c => !/Destacada|Cables|Elecciones/.test(c)) || n.categorias[0];

/* portada: hero = Destacada, secundarias = Destacada Inferior (la lógica editorial actual), sin Cables */
const hero = pub.find(n => n.categorias.includes('Destacada'));
const seco = pub.filter(n => n.categorias.includes('Destacada Inferior') && n !== hero).slice(0, 4);
const used = new Set([hero, ...seco].map(n => n.id));
const ticker = pub.slice(0, 5);
const rail = pub.filter(n => !used.has(n.id)).slice(0, 8);
const railIds = new Set(rail.map(n => n.id));
const blockNotes = cat => (raw.por_categoria[cat]?.notas || []).filter(n => !isCable(n) && !used.has(n.id) && !railIds.has(n.id)).slice(0, 5);

/* ------------------------------------------------------------ publicidad
   Regla del cliente: los banners viven en UNA zona (rotador) + UNA franja bajo el header. */
const BANNERS_POR_CICLO = 4;   // cuántos banners agrupa cada ciclo del rotador (puntos de paginación)
const SEGUNDOS_POR_BANNER = 5; // rotación automática
const PRINCIPAL = '410410';    // anunciante de la franja única bajo el header (decisión a confirmar con el cliente)
const uniq = [...new Map(banners.map(b => [b.id, b])).values()];
const isH = b => b.w / b.h > 5;
const principal = uniq.find(b => b.id === PRINCIPAL);
const ROT = uniq.filter(b => b.id !== PRINCIPAL).sort((a, b) => isH(a) - isH(b));          // todo el resto del inventario, incl. horizontales (580x90 con su proporción)
const adLink = b => b.dest ? `href="${esc(b.dest)}" target="_blank" rel="noopener sponsored"` : 'href="#" data-stub="Banner sin destino cargado en el sitio actual."';
const adSlide = (b, first) => `<a class="adr__slide${isH(b) ? ' adr__slide--h' : ''}" ${adLink(b)} aria-label="Publicidad"><img ${first ? `src="${b.file}"` : `data-src="${b.file}"`} alt="Banner publicitario" width="${b.w}" height="${b.h}"></a>`;
const rotSq = id => `<div class="adr adr--sq" data-group="${BANNERS_POR_CICLO}" data-interval="${SEGUNDOS_POR_BANNER * 1000}" id="${id}" role="region" aria-label="Publicidad">
  <span class="adr__label">Publicidad</span>
  <div class="adr__view">${ROT.map((b, i) => adSlide(b, i === 0 && id === 'adr-d')).join('')}</div>
  <div class="adr__dots"></div><div class="adr__meta"></div>
</div>`;
// Franja única: 970x90 en desktop, 320x100 en mobile (no hay creatividad 320x100 en el inventario: placeholder)
const strip = () => `<div class="strip"><div class="wrap"><span class="adr__label">Publicidad</span>
  <a class="strip__d" ${adLink(principal)} aria-label="Publicidad"><img src="${principal.file}" alt="Banner del anunciante principal" width="${principal.w}" height="${principal.h}" loading="lazy"></a>
  <div class="strip__m ph" role="img" aria-label="Espacio publicitario 320 por 100">320×100<br>anunciante principal · creatividad a definir</div>
</div></div>`;
const adZoneM = () => `<div class="only-m ad-end">${rotSq('adr-m')}</div>`;

/* ------------------------------------------------------------ legisladores (MUESTRA: no hay 11_funcionarios.json) */
const NOMBRES = ['Lucía Ferrer', 'Martín Salgado', 'Valeria Ruiz', 'Gonzalo Páez', 'Camila Orellana', 'Julián Berro', 'Sofía Mansilla', 'Tomás Aguirre', 'Noelia Bravo', 'Ezequiel Lamas', 'Paula Cardozo', 'Facundo Ibarra', 'Marina Quiroga', 'Hernán Dubois', 'Agustina Roldán', 'Matías Sosa', 'Daniela Vega', 'Rodolfo Pineda', 'Carla Escobar', 'Nicolás Barrios', 'Mariana Toledo', 'Sebastián Fuentes', 'Romina Acosta', 'Leandro Cabrera'];
const BLOQUES = ['Bloque A', 'Bloque B', 'Bloque C', 'Bloque D'], PARTIDOS = ['Partido 1', 'Partido 2', 'Partido 3'];
const legs = NOMBRES.map((nombre, i) => ({ nombre, slug: nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '-'), bloque: BLOQUES[i % 4], partido: PARTIDOS[(i * 7 + (i >> 2)) % 3], ini: nombre.split(' ').map(p => p[0]).join('') }));

/* ------------------------------------------------------------ componentes */
const NAV = [['Home', 'index.html'], ['Legislatura Bonaerense', 'seccion.html'], ['Congreso', null], ['Nación', null], ['Provincia', null], ['Municipios', null], ['Colegios Profesionales', null], ['Opinión', null], ['Diputados Bonaerenses', 'legisladores.html']];
const noteHref = n => n.id === NOTA_ID ? 'nota.html' : '#" data-stub="Maqueta: solo la nota destacada del Hito 1 tiene página interna.';
const dims = J('data/dims.json');
const D = (n, k) => dims[`assets/img/notas/${n.id}-${k}.webp`] || (k === 's' ? [480, 320] : [800, 533]);
// big: imagen de portada (carga inmediata, prioridad alta). js: carga diferida real (data-src, la dispara carousel.js al acercarse).
const thumb = (n, alt = '', big = false, js = false) => {
  const [sw, sh] = D(n, 's'), [mw, mh] = D(n, 'm');
  const p = k => `assets/img/notas/${n.id}-${k}.webp`;
  const bigSet = big && D(n, 'full')[0] ? `${p('m')} ${mw}w, ${p('full')} ${D(n, 'full')[0]}w` : '';
  const attrs = big
    ? `src="${p('m')}" srcset="${bigSet}" sizes="(min-width:1000px) 860px, 100vw" fetchpriority="high" width="${mw}" height="${mh}"`
    : js
      ? `data-src="${p('s')}" data-srcset="${p('s')} ${sw}w, ${p('m')} ${mw}w" sizes="${SIZES}" width="${sw}" height="${sh}"`
      : `src="${p('s')}" srcset="${p('s')} ${sw}w, ${p('m')} ${mw}w" sizes="${SIZES}" loading="lazy" width="${sw}" height="${sh}"`;
  return `<span class="thumb" data-ph="${esc(sectionOf(n))}"><img ${attrs} alt="${esc(alt)}" decoding="async" onerror="this.remove()"></span>`;
};
const SIZES = '(min-width:1000px) 420px, (min-width:700px) 50vw, 90vw';
const card = (n, js = true) => `<article class="card"><a href="${noteHref(n)}" tabindex="-1" aria-hidden="true">${thumb(n, '', false, js)}</a>
  <span class="kicker" style="margin-top:10px">${esc(sectionOf(n))}</span>
  <h3><a href="${noteHref(n)}">${esc(n.titulo)}</a></h3>
  <p>${esc(n.extracto)}</p><div class="meta"><b>${esc(n.autor)}</b> · ${fecha(n)}</div></article>`;
const mini = n => `<article class="card mini"><a href="${noteHref(n)}" tabindex="-1" aria-hidden="true">${thumb(n)}</a>
  <div><span class="kicker">${esc(sectionOf(n))}</span><h3><a href="${noteHref(n)}">${esc(n.titulo)}</a></h3><div class="meta">${fecha(n)}</div></div></article>`;

const head = (title, extra = '') => `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<meta name="description" content="Maqueta Hito 1 del rediseño de Diputados Bonaerenses. Documento de trabajo, no indexable.">
<meta name="theme-color" content="#0b2236">
<link rel="stylesheet" href="assets/css/main.css">${extra}
</head><body>
<a class="skip" href="#main">Saltar al contenido</a>`;

const header = active => `<header class="hdr">
  <div class="wrap hdr__top">
    <a class="hdr__logo" href="index.html" aria-label="Diputados Bonaerenses, inicio"><img src="assets/img/logo-dark.png" alt="Diputados Bonaerenses" width="500" height="68"></a>
    <span class="hdr__date">${new Date(TODAY + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
    <div class="hdr__tools">
      <button class="ibtn js-search" type="button" aria-label="Buscar" aria-expanded="false"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
      <button class="ibtn burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <form class="search" role="search"><div class="wrap"><div style="display:flex;gap:8px"><label class="sr" for="q">Buscar noticias</label><input id="q" type="search" placeholder="Buscar en Diputados Bonaerenses"><button class="btn" type="submit">Buscar</button></div></div></form>
  <nav class="nav" id="nav" aria-label="Principal"><span class="nav__grip" aria-hidden="true"></span><div class="wrap"><ul>
    ${NAV.map(([t, h]) => `<li><a ${h ? `href="${h}"` : 'href="#" data-stub="Sección real del menú; en la maqueta solo se diseñó Legislatura Bonaerense."'}${h === active ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n    ')}
  </ul><button class="btn nav__close" type="button">Cerrar menú</button></div></nav>
</header><div class="scrim"></div>`;

const tickerHTML = () => `<div class="tick" role="region" aria-label="Última hora"><div class="wrap">
  <span class="tick__tag"><i></i>Última hora</span>
  <div class="tick__list" aria-live="off">${ticker.map(n => `<a class="tick__item" href="${noteHref(n)}"><time>${n.fecha.slice(11, 16)}</time><span>${esc(n.titulo)}</span></a>`).join('')}</div>
  <div class="tick__nav"><button class="js-tprev" type="button" aria-label="Anterior"><svg class="rbtn" viewBox="0 0 24 24" style="border:0;width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2.2"><path d="m15 5-7 7 7 7"/></svg></button><button class="js-tnext" type="button" aria-label="Siguiente"><svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2.2"><path d="m9 5 7 7-7 7"/></svg></button></div>
</div></div>`;

const footer = () => `<footer class="ftr"><div class="wrap">
  <div class="ftr__grid">
    <div><img class="ftr__logo" src="assets/img/logo-dark.png" alt="Diputados Bonaerenses" width="500" height="68" loading="lazy">
      <p>Todas las noticias de la Legislatura Bonaerense, Congreso Nacional, Nación, Provincia y Municipios.</p></div>
    <div><h2>Secciones</h2><ul>${NAV.slice(1, 8).map(([t, h]) => `<li><a ${h ? `href="${h}"` : 'href="#" data-stub="Sección no incluida en la maqueta."'}>${t}</a></li>`).join('')}<li><a href="#" data-stub="Cables (agencias) tiene su sección propia, fuera de la portada.">Cables (agencias)</a></li></ul></div>
    <div><h2>Institucional</h2><ul>
      <li><a href="#" data-stub="Dato institucional a completar con el cliente.">Quiénes somos</a></li>
      <li><a href="publicidad.html">Publicidad (mapa de slots)</a></li>
      <li><a href="legisladores.html">Legisladores</a></li></ul></div>
    <div><h2>Contacto y redes</h2><ul>
      <li><a href="#" data-stub="Datos de contacto y redes: a completar con el cliente.">Contacto <small>(a completar)</small></a></li>
      <li><a href="#" data-stub="Redes: a completar con el cliente.">Redes sociales <small>(a completar)</small></a></li></ul></div>
  </div>
  <div class="ftr__legal">Maqueta navegable Hito 1 · SCdev · Contenido real extraído de diputadosbsas.com.ar el ${fechaLarga({ fecha: TODAY })}. Documento de trabajo, no indexable.</div>
</div></footer><div class="toast" role="status" aria-live="polite"></div>
<script src="assets/js/main.js" defer></script>
<script>addEventListener('load',function(){var s=document.createElement('script');s.src='assets/js/carousel.js';document.body.appendChild(s)})</script></body></html>`;

const dotsAside = () => `<aside class="aside" aria-label="Publicidad y temas"><div class="aside__sticky">
  ${rotSq('adr-d')}
  <div class="box"><h2>Temas frecuentes</h2><div class="chips">${tagsTop.filter(t => !/corona|pandemia|covid|Alberto/i.test(t.name)).slice(0, 9).map(t => `<a class="chip" href="#" data-stub="Los temas llevan al archivo por tag del sitio actual.">${esc(t.name)}</a>`).join('')}</div></div>
</div></aside>`;

const write = (f, html) => { fs.writeFileSync(path.join(R, f), html); console.log('✓', f, (html.length / 1024).toFixed(0) + ' KB'); };

/* ================================================================ index.html */
const block = (cat, label, href) => {
  const ns = blockNotes(cat); if (!ns.length) return '';
  const [f, ...rest] = ns;
  return `<section class="blk" aria-labelledby="b-${esc(label)}"><div class="sec-head sec-head--brand"><h2 id="b-${esc(label)}">${label}</h2><a href="${href || '#'}"${href ? '' : ' data-stub="Sección no incluida en la maqueta."'}>Ver más</a></div>
  ${card(f)}<ul>${rest.slice(0, 4).map(n => `<li><a href="${noteHref(n)}">${esc(n.titulo)}</a><span class="meta">${fecha(n)} · ${esc(n.autor)}</span></li>`).join('')}</ul></section>`;
};

write('index.html', `${head('Diputados Bonaerenses · Maqueta Hito 1', `<link rel="preload" as="image" fetchpriority="high" imagesrcset="assets/img/notas/${hero.id}-m.webp ${D(hero, 'm')[0]}w, assets/img/notas/${hero.id}-full.webp ${D(hero, 'full')[0]}w" imagesizes="(min-width:1000px) 860px, 100vw">`)}
${header('index.html')}
<main id="main">
${tickerHTML()}
${strip()}
<div class="wrap layout">
 <div>
  <section class="front" aria-label="Portada">
    <a class="hero card" href="${noteHref(hero)}">${thumb(hero, hero.titulo, true)}
      <div class="hero__txt"><span class="kicker kicker--chip">${esc(sectionOf(hero))}</span><h1>${esc(hero.titulo)}</h1><p>${esc(hero.extracto)}</p><div class="meta"><b>${esc(hero.autor)}</b> · ${fecha(hero)}</div></div></a>
    <div class="front__list">${seco.map(mini).join('')}</div>
  </section>
  <section class="rail" style="margin-top:30px" aria-labelledby="t-rail">
    <div class="sec-head"><h2 id="t-rail">Más noticias</h2><div class="rail__btns"><button class="rbtn js-rprev" type="button" aria-label="Anteriores"><svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button><button class="rbtn js-rnext" type="button" aria-label="Siguientes"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></button></div></div>
    <div class="rail__track" tabindex="0" aria-label="Carrusel de noticias">${rail.map((n, i) => card(n, i > 0)).join('')}</div>
  </section>
  <div class="blocks" style="margin-top:30px">
    ${block('Legislatura Bonaerense', 'Legislatura Bonaerense', 'seccion.html')}
    ${block('Provincia', 'Provincia')}
    ${block('Nación', 'Nación')}
    ${block('Municipios', 'Municipios')}
    ${block('Opinión', 'Opinión')}
    ${block('Colegios profesionales', 'Colegios Profesionales')}
  </div>
 </div>
 ${dotsAside()}
</div>
<section class="band" aria-labelledby="t-leg"><div class="wrap">
  <div class="sec-head sec-head--brand"><h2 id="t-leg">Diputados Bonaerenses</h2><a href="legisladores.html">Ver todos</a></div>
  <p class="meta" style="margin:0 0 10px"><span class="tag-muestra">Dato de muestra</span> Los perfiles reales llegan desde la base de legisladores en el Hito 2.</p>
  <div class="leg-row">${legs.slice(0, 12).map(l => `<a href="legislador.html"><div class="avatar" aria-hidden="true">${l.ini}</div>${l.nombre}</a>`).join('')}</div>
</div></section>
<div class="wrap">${adZoneM()}</div>
</main>
${footer()}`);

/* ================================================================ nota.html */
const nota = all.get(NOTA_ID);
const parts = cuerpo.html.match(/<p[\s\S]*?<\/p>|<h2[\s\S]*?<\/h2>|<!--IMG\d-->/g);
const bodyHTML = parts.map(p => {
  const im = p.match(/<!--IMG(\d)-->/);
  if (im) { const [w, h] = cuerpo.dims[+im[1]]; return `<figure class="art__fig"><img src="${cuerpo.imgs[+im[1]]}" alt="Imagen dentro de la nota" loading="lazy" width="${w}" height="${h}"></figure>`; }
  return p.replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener" href="$1');
}).join('\n');
const relNotas = pub.filter(n => n.id !== NOTA_ID && n.categorias.includes('Legislatura Bonaerense')).slice(0, 3);
const shareURL = encodeURIComponent(`${nota.titulo} ${nota.url}`);
// "Lo central": dato de muestra, armado solo con lo que dice la nota (extracto y títulos internos)
const central = ['El Senado bonaerense recién tratará en noviembre los dos proyectos de salud enviados por Axel Kicillof y Nicolás Kreplak.', 'Uno crea el Sistema Integrado de Salud (SIPBA); el otro, una empresa estatal de medicamentos.', 'Buscan llegar antes del Presupuesto.'];
const WA = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.500l1.700-5A8.500 8.500 0 1 1 21 11.500Z"/><path d="M9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.500-2-1-1 .8c-1-.4-2-1.400-2.400-2.400l.8-1-1-2Z"/></svg>';
const shareBlock = label => `<div class="share" role="group" aria-label="${label}"><a class="btn btn--wa btn--block" href="https://wa.me/?text=${shareURL}" target="_blank" rel="noopener">${WA}Compartir por WhatsApp</a>
 <div class="share__more"><a class="btn btn--ghost" href="#" data-stub="Compartir en redes: se resuelve en el Hito 2.">Facebook</a><a class="btn btn--ghost" href="#" data-stub="Compartir en redes: se resuelve en el Hito 2.">X</a><a class="btn btn--ghost" href="#" data-stub="Copiar enlace: se resuelve en el Hito 2.">Copiar link</a></div></div>`;
write('nota.html', `${head(nota.titulo + ' · Diputados Bonaerenses')}
${header('seccion.html')}
<main id="main">
${strip()}
<div class="wrap">
<p class="crumbs"><a href="index.html">Home</a> › <a href="seccion.html">Legislatura Bonaerense</a></p>
<div class="layout layout--art">
 <article class="art">
  <header class="art__head"><a class="kicker kicker--chip" href="seccion.html">${esc(sectionOf(nota))}</a><h1>${esc(nota.titulo)}</h1>
   <p class="art__lead">${esc(nota.extracto)}</p>
   <div class="art__by"><span>Por <b>${esc(nota.autor)}</b></span><time datetime="${nota.fecha.replace(' ', 'T')}">${fechaLarga(nota)} · ${nota.fecha.slice(11, 16)} h</time><span>${Math.max(1, Math.round(nota.palabras / 200))} min de lectura</span></div>
  </header>
  <aside class="central" aria-labelledby="t-central"><h2 id="t-central">Lo central</h2><ul>${central.map(c => `<li>${esc(c)}</li>`).join('')}</ul><span class="tag-muestra">Dato de muestra · lo redacta el editor en el Hito 2</span></aside>
  <figure class="art__fig"><img src="assets/img/notas/${NOTA_ID}-full.webp" alt="${esc(nota.titulo)}" width="${D(nota, 'full')[0]}" height="${D(nota, 'full')[1]}"></figure>
  ${shareBlock('Compartir')}
  <div class="art__body">${bodyHTML}</div>
  <div class="art__tags"><h2>Etiquetas</h2><div class="chips">${nota.tags.map(t => `<a class="chip" href="#" data-stub="Cada tag lleva a su archivo en el sitio actual.">${esc(t)}</a>`).join('')}</div></div>
  ${shareBlock('Compartir al final')}
  <section class="related" aria-labelledby="t-rel"><div class="sec-head sec-head--brand"><h2 id="t-rel">Notas relacionadas</h2></div><div class="grid3">${relNotas.map(n => card(n)).join('')}</div></section>
  ${adZoneM()}
 </article>
 ${dotsAside()}
</div></div>
</main>
${footer()}`);

/* ================================================================ seccion.html */
const secNotas = pub.filter(n => n.categorias.includes('Legislatura Bonaerense')).slice(0, 12);
const secTotal = catCount('Legislatura Bonaerense');
write('seccion.html', `${head('Legislatura Bonaerense · Diputados Bonaerenses')}
${header('seccion.html')}
<main id="main">
${strip()}
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Legislatura Bonaerense</p>
 <div class="sec-hero"><h1>Legislatura Bonaerense</h1><p>Sesiones, proyectos y la actividad de ambas cámaras de la Provincia de Buenos Aires.</p><span class="count">${fmtN(secTotal)} notas en esta sección · el archivo completo sigue disponible</span></div>
 <div class="layout">
  <div>
   <div class="listing">${secNotas.map((n, i) => `<article class="card row"><a href="${noteHref(n)}" tabindex="-1" aria-hidden="true">${thumb(n, '', false, i > 2)}</a><div><span class="kicker">${esc(n.categorias.filter(c => !/Destacada|Legislatura/.test(c)).join(' · ') || 'Legislatura Bonaerense')}</span><h3><a href="${noteHref(n)}">${esc(n.titulo)}</a></h3><p>${esc(n.extracto)}</p><div class="meta"><b>${esc(n.autor)}</b> · ${fecha(n)}</div></div></article>`).join('')}</div>
   <nav class="pager" aria-label="Paginación"><span aria-current="page">1</span><a href="#" data-stub="La paginación real recorre las ${fmtN(Math.ceil(secTotal / 12))} páginas del archivo.">2</a><a href="#" data-stub="La paginación real recorre las ${fmtN(Math.ceil(secTotal / 12))} páginas del archivo.">3</a><span>…</span><a href="#" data-stub="Última página del archivo.">${fmtN(Math.ceil(secTotal / 12))}</a><a href="#" data-stub="Siguiente página.">Siguiente</a></nav>
   ${adZoneM()}
  </div>
  <aside class="aside" aria-label="Publicidad y archivo"><div class="aside__sticky">
   ${rotSq('adr-d')}
   <div class="box"><h2>Archivo por año</h2><div class="arch">${years.slice(0, 6).map(([y, c]) => `<a href="#" data-stub="El archivo histórico se conserva completo."><span>${y}</span><small>${fmtN(+c)} notas</small></a>`).join('')}</div></div>
   <div class="box"><h2>Otras secciones</h2><div class="arch">${cats.filter(c => /Congreso|Nación|Provincia|Municipios|Opinión|Colegios|Cables/.test(c.name)).map(c => `<a href="#" data-stub="Sección no incluida en la maqueta."><span>${esc(c.name)}</span><small>${fmtN(c.count)}</small></a>`).join('')}</div></div>
  </div></aside>
 </div>
</div>
</main>
${footer()}`);

/* ================================================================ legisladores.html */
write('legisladores.html', `${head('Diputados Bonaerenses · Legisladores')}
${header('legisladores.html')}
<main id="main">
${strip()}
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Diputados Bonaerenses</p>
 <div class="sec-hero"><h1>Diputados Bonaerenses</h1><p>Perfiles de legisladores de la Provincia de Buenos Aires.</p></div>
 <div class="layout">
  <div>
   <div class="notice"><b>Dato de muestra.</b> No se recibió el export del CPT <code>funcionario</code> (11_funcionarios.json): nombres, bloques y partidos son ficticios y las fotos son iniciales. En el Hito 2 se reemplazan por los registros reales y la base liviana (Google Sheets).</div>
   <form class="filters" onsubmit="return false"><label>Bloque<select id="f-bloque"><option value="">Todos</option>${BLOQUES.map(b => `<option>${b}</option>`).join('')}</select></label>
    <label>Partido<select id="f-partido"><option value="">Todos</option>${PARTIDOS.map(b => `<option>${b}</option>`).join('')}</select></label>
    <div style="display:flex;gap:12px;align-items:center"><button class="btn btn--ghost" id="f-reset" type="button">Limpiar</button><span id="f-count" class="meta" role="status"></span></div></form>
   <div class="legs" id="legs">${legs.map(l => `<a class="leg" href="legislador.html" data-bloque="${l.bloque}" data-partido="${l.partido}"><div class="avatar" aria-hidden="true">${l.ini}</div><h3>${l.nombre}</h3><small>${l.bloque} · ${l.partido}</small><span class="tag-muestra">muestra</span></a>`).join('')}</div>
   ${adZoneM()}
  </div>
  ${dotsAside()}
 </div>
</div>
</main>
${footer()}`);

/* ================================================================ legislador.html */
const L = legs[0];
const tagEj = 'Senado bonaerense';
const vinc = pub.filter(n => n.tags.includes(tagEj)).slice(0, 4);
write('legislador.html', `${head(L.nombre + ' · Diputados Bonaerenses')}
${header('legisladores.html')}
<main id="main">
${strip()}
<div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › <a href="legisladores.html">Diputados Bonaerenses</a> › ${L.nombre}</p>
 <div class="notice"><b>Dato de muestra.</b> Perfil ficticio para mostrar el diseño. Los proyectos son de ejemplo; las noticias vinculadas sí son reales y salen de un tag.</div>
 <div class="layout">
  <div>
   <section class="prof"><div class="avatar" role="img" aria-label="Foto de ${L.nombre} (muestra)">${L.ini}</div>
    <div><h1>${L.nombre}</h1><ul class="facts"><li><b>Bloque</b>${L.bloque}</li><li><b>Partido</b>${L.partido}</li><li><b>Cámara</b>Dato de muestra</li><li><b>Mandato</b>Dato de muestra</li></ul></div></section>
   <section aria-labelledby="t-pr"><div class="sec-head sec-head--brand"><h2 id="t-pr">Proyectos presentados</h2></div>
    <ul class="proj"><li><span>Proyecto de ley sobre un tema de ejemplo n.º 1</span><em>ejemplo</em></li><li><span>Proyecto de resolución sobre un tema de ejemplo n.º 2</span><em>ejemplo</em></li><li><span>Proyecto de declaración sobre un tema de ejemplo n.º 3</span><em>ejemplo</em></li></ul>
    <p class="meta" style="margin-top:10px">El buscador real de proyectos es parte del Hito 3.</p></section>
   <section style="margin-top:34px" aria-labelledby="t-nv"><div class="sec-head sec-head--brand"><h2 id="t-nv">Noticias vinculadas</h2><span class="meta">Equivale al tag «${tagEj}» (ejemplo)</span></div>
    <div class="grid3">${vinc.map(n => card(n)).join('')}</div></section>
   ${adZoneM()}
  </div>
  ${dotsAside()}
 </div>
</div>
</main>
${footer()}`);

/* ================================================================ publicidad.html: antes (35 dispersos) vs después (1 zona + 1 franja) */
// "Antes": esquema de la Home actual: 3 espacios arriba y 2 después de cada uno de ~16 bloques = 35
const antes = ['a', 'a', 'a', ...Array.from({ length: 16 }, () => ['c', 'a', 'a']).flat()].slice(0, 51).map(s => s === 'c' ? '<div class="wb wb--c2">contenido</div>' : '<div class="wb wb--bad">publicidad</div>').join('');
const nAds = (antes.match(/wb--bad/g) || []).length;
const inv = b => `<figure><div class="im${isH(b) ? ' im--h' : ''}"><img src="${b.file}" alt="Banner ${b.w}x${b.h}" loading="lazy" width="${b.w}" height="${b.h}"></div>${b.w}×${b.h} · ${b.dest ? esc(new URL(b.dest).hostname.replace('www.', '')) : 'sin destino'}<br>${b.id === PRINCIPAL ? '<b>Franja principal</b>' : 'Bloque rotativo' + (b.w === 580 ? ' (proporción respetada)' : '')}</figure>`;
write('publicidad.html', `${head('Mapa de publicidad · Diputados Bonaerenses')}
${header('index.html')}
<main id="main"><div class="wrap">
 <p class="crumbs"><a href="index.html">Home</a> › Mapa de publicidad</p>
 <div class="sec-hero"><h1>Publicidad: de 35 espacios dispersos a una zona</h1><p>Mismo inventario de anunciantes. Los banners quedan acotados a una sola zona más una única franja horizontal. Ninguno va entre notas, dentro de listados ni entre párrafos.</p></div>
 <div class="dia">
  <div class="stat is-old"><b>${nAds}</b>espacios dispersos hoy en la Home, intercalados entre ~16 bloques de contenido</div>
  <div class="stat"><b>1 + 1</b>desktop: un bloque rotativo sticky en el sidebar + una franja 970×90 bajo el header</div>
  <div class="stat"><b>1 + 1</b>mobile: un slot 300×300 al final de la página + una franja 320×100 bajo el header</div>
 </div>
 <div class="wire" aria-label="Antes y después">
  <div class="wire__pg"><h3>Antes · Home actual (${nAds} espacios)</h3><div class="wire__stack">${antes}</div></div>
  <div class="wire__pg"><h3>Después · Desktop</h3><div class="wb">Header + menú</div><div class="wb wb--ad wb--h">Franja única · 970×90 · anunciante principal</div><div style="display:grid;grid-template-columns:1fr 34%;gap:8px"><div style="display:grid;gap:8px"><div class="wb wb--c">Portada editorial</div><div class="wb">Carrusel de noticias</div><div class="wb wb--c">Bloques por sección<br>(sin publicidad entre medio)</div></div><div class="wb wb--ad" style="min-height:240px;align-self:start">Bloque rotativo 300×300<br>todo el inventario · sticky</div></div><div class="wb">Footer</div></div>
  <div class="wire__pg"><h3>Después · Mobile (390 px)</h3><div class="wb">Header + hamburguesa</div><div class="wb wb--ad wb--h" style="min-height:44px">Franja única · 320×100</div><div class="wb wb--c">Portada: principal + secundarias</div><div class="wb">Carrusel de noticias</div><div class="wb">Bloques por sección</div><div class="wb wb--ad" style="min-height:130px;width:60%;justify-self:center;aspect-ratio:1/1">Slot 300×300 · al final · un banner cada ${SEGUNDOS_POR_BANNER} s · ciclos de ${BANNERS_POR_CICLO}</div><div class="wb">Footer</div></div>
 </div>
 <p class="meta" style="margin:0 0 6px"><b>Nota técnica.</b> Cada slot tiene altura fija reservada para evitar saltos de layout. En la nota interna, el bloque va en el sidebar (desktop) y al final del artículo (mobile). Banners por ciclo: constante <code>BANNERS_POR_CICLO</code> en <code>build.mjs</code>.</p>
 <h2 style="margin:30px 0 12px;font-size:24px">Inventario real (${uniq.length} banners únicos de la Home actual)</h2>
 <p class="meta" style="margin-bottom:14px">1 anunciante en la franja principal (${principal.w}×${principal.h}) y ${ROT.length} en el bloque rotativo, incluidos los ${ROT.filter(isH).length} horizontales (con su proporción, se ven chicos: conviene pedir versión cuadrada). En la Home actual hay además 4 espacios sin imagen cargada.</p>
 <div class="inv">${[principal, ...ROT].map(inv).join('')}</div>
 <h2 style="margin:30px 0 12px;font-size:20px">Así se ve un espacio sin banner</h2>
 <div class="inv"><figure><div class="im"><div class="ph">300×300<br>espacio disponible</div></div></figure><figure><div class="im im--h" style="aspect-ratio:970/90"><div class="ph">970×90</div></div></figure></div>
</div></main>
${footer()}`);
