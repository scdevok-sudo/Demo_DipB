// Auditoría v2.3: mide en el DOM renderizado cada punto de la sección 9 del brief. Uso: node audit-v23.mjs  (servidor en :8765)
import { chromium } from 'playwright'; import fs from 'node:fs'; import path from 'node:path';
const BASE = 'http://localhost:8765/', CAP = path.resolve(import.meta.dirname, '..', 'capturas');
const b = await chromium.launch({ channel: 'chrome' }); const out = {};
const open = async (w, h, url, mobile = false) => { const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile }); const p = await c.newPage(); await p.goto(BASE + url); await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; })); await p.waitForTimeout(1500); return p; };
const shot = (p, f, sel) => sel ? p.locator(sel).first().screenshot({ path: path.join(CAP, f) }) : p.screenshot({ path: path.join(CAP, f), fullPage: true });

/* --- HOME DESKTOP 1280 --- */
let p = await open(1280, 900, 'index.html');
out.home = await p.evaluate(() => {
  const vis = e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed';
  const cards = [...document.querySelectorAll('main .card')].filter(vis);
  const txt = document.querySelector('main').innerText;
  const leg = [...document.querySelectorAll('.legband')].map(e => ({ h: Math.round(e.getBoundingClientRect().height), bg: getComputedStyle(e).backgroundColor, img: Math.round(e.querySelector('.avatar').getBoundingClientRect().width), title: e.querySelector('h2').innerText, small: [...e.querySelectorAll('.lcar__item small')].slice(0, 3).map(x => x.innerText), palabrasViejas: /Diputado ·|Senado ·|Bloque [A-E]/.test(e.innerText) }));
  const kids = [...document.querySelectorAll('main>*')].map(e => e.className.split(' ')[0] + (e.className.includes('legband') ? ':' + e.querySelector('h2').innerText : ''));
  const strips = [...document.querySelectorAll('.strip__col')].map(c => { const a = c.querySelector('.strip__more'), s = getComputedStyle(a); return { notas: c.querySelectorAll('.card').length, border: s.borderTopWidth, after: getComputedStyle(a, '::after').content, text: a.innerText }; });
  return { cards: cards.length, conCintillo: cards.filter(c => c.querySelector('.cintillo')).length, conSec: cards.filter(c => c.querySelector('.sectag')).length, figcaption: [...document.querySelectorAll('main figcaption')].filter(vis).length, meta: [...document.querySelectorAll('main .meta')].filter(vis).length, anunciantes: /anunciantes/i.test(txt), publicidad: /publicidad/i.test(txt), leg, kids, strips, tapaTxtIzq: document.querySelector('.tapa__lead .card__txt').getBoundingClientRect().left < document.querySelector('.tapa__lead .fig').getBoundingClientRect().left, f2bg: getComputedStyle(document.querySelector('.f2band')).backgroundColor };
});
await shot(p, 'g-home-d1280.png'); await shot(p, 'g-legisladores-d1280.png', '.legband'); await shot(p, 'g-franja-d1280.png', '.stripband');
out.hbanners = await p.evaluate(async () => {
  const z = document.querySelector('.adz--h'); const view = z.querySelector('.adr__view'); const vr = view.getBoundingClientRect();
  const slides = [...z.querySelectorAll('.adr__slide')]; const res = [];
  for (const s of slides) { slides.forEach(x => x.classList.remove('is-active')); s.classList.add('is-active'); const im = s.querySelector('img'); if (im.dataset.src) { im.src = im.dataset.src; } await new Promise(r => { if (im.complete && im.naturalWidth) r(); else { im.onload = im.onerror = r; setTimeout(r, 3000); } }); const r = im.getBoundingClientRect(); res.push({ nat: im.naturalWidth + 'x' + im.naturalHeight, box: Math.round(r.width) + 'x' + Math.round(r.height), fits: r.width <= vr.width + .5 && r.height <= vr.height + .5, fit: getComputedStyle(im).objectFit }); }
  return { slot: Math.round(vr.width) + 'x' + Math.round(vr.height), res };
});
out.tipo = await p.evaluate(() => { const g = (s, pr) => getComputedStyle(document.querySelector(s))[pr]; return { peso: g('.card h3', 'fontWeight'), lead: g('.card--lead h2', 'fontSize'), card: g('.f1 .card--med h3', 'fontSize'), cintillo: g('.cintillo', 'fontSize') + ' ' + g('.cintillo', 'fontWeight') + ' ' + g('.cintillo', 'color'), cintilloVar: getComputedStyle(document.documentElement).getPropertyValue('--cintillo-color') }; });
await p.context().close();

out.fonts = {};
for (const f of ['actual', 'merriweather', 'literata']) { p = await open(1280, 900, 'index.html?font=' + f); out.fonts[f] = await p.evaluate(() => getComputedStyle(document.querySelector('.card--lead h2')).fontFamily.split(',')[0] + ' ' + getComputedStyle(document.querySelector('.card--lead h2')).fontWeight); await p.context().close(); }
p = await open(1280, 900, 'index.html?vermas=boton'); out.vermasBoton = await p.evaluate(() => getComputedStyle(document.querySelector('.strip__more')).borderTopWidth); await p.context().close();
p = await open(1280, 900, 'index.html?seccion=abajo'); out.seccionAbajo = await p.evaluate(() => { const f = document.querySelector('.f1 .fig'); const t = f.querySelector('.sectag'); const fi = f.querySelector('.thumb').getBoundingClientRect(), tr = t.getBoundingClientRect(); return { debajoDeLaFoto: tr.top >= fi.bottom - 1, aLaDerecha: tr.right > fi.right - 20 }; }); await p.context().close();
p = await open(1280, 900, 'index.html?tapa=foto-izq'); out.tapaFotoIzq = await p.evaluate(() => document.querySelector('.tapa__lead .fig').getBoundingClientRect().left < document.querySelector('.tapa__lead .card__txt').getBoundingClientRect().left); await p.context().close();

p = await open(1280, 900, 'diputados.html');
out.listado = await p.evaluate(() => ({ tabs: [...document.querySelectorAll('.tabs a')].map(a => a.innerText + (a.getAttribute('aria-current') ? '*' : '') + '→' + a.getAttribute('href')), tarjetas: document.querySelectorAll('.leg').length, hijos: [...new Set([...document.querySelectorAll('.leg')].map(l => [...l.children].map(c => c.tagName).join('+')))], buscador: !!document.querySelector('#f-nombre'), bloque: !!document.querySelector('#f-bloque'), partido: !!document.querySelector('#f-partido'), carrusel: !!document.querySelector('.lcar') }));
await p.fill('#f-nombre', 'SOFÍA'); out.listado.busquedaSofia = await p.textContent('#f-count'); await p.fill('#f-nombre', ''); await p.selectOption('#f-bloque', 'UCR'); out.listado.bloqueUCR = await p.textContent('#f-count');
await p.selectOption('#f-bloque', ''); await shot(p, 'g-diputados-d1280.png'); await p.context().close();
p = await open(1280, 900, 'senadores.html'); out.senadores = await p.evaluate(() => ({ tabs: [...document.querySelectorAll('.tabs a')].map(a => a.innerText + (a.getAttribute('aria-current') ? '*' : '')), n: document.querySelectorAll('.leg').length })); await p.context().close();
p = await open(1280, 900, 'legislador.html');
out.perfil = await p.evaluate(() => { const ad = document.querySelector('.prof-side'); const s = getComputedStyle(ad); return { facts: [...document.querySelectorAll('.prof__facts li')].map(l => l.innerText), bio: !!document.querySelector('.bio'), leerMas: !!document.querySelector('.js-bio'), compartir: !!document.querySelector('.prof__share .btn'), copiar: !!document.querySelector('.js-copy'), adLateral: s.position, adW: Math.round(ad.getBoundingClientRect().width), adImg: Math.round(ad.querySelector('.adbox__in').getBoundingClientRect().width) }; });
await shot(p, 'g-perfil-d1280.png'); await p.context().close();
p = await open(1280, 900, 'legislador-agustina-roldan.html'); out.perfilSinBio = await p.evaluate(() => ({ bioVacia: !!document.querySelector('.bio--empty'), seccionBio: !!document.querySelector('.bio') })); await p.context().close();

p = await open(1280, 900, 'nota.html');
out.nota = await p.evaluate(() => { const A = document.querySelector('.art'); const head = A.querySelector('.art__head'); const fig = A.querySelector('.art__fig'), meta = A.querySelector('.art__meta'); const aside = document.querySelector('.aside'); const sticky = aside.querySelector('.aside__sticky'); const tit = [...aside.querySelectorAll('.card--sm h3')].map(h => h.scrollHeight <= h.clientHeight + 3 && !/…|\.\.\.$/.test(h.innerText)); const colors = [...document.querySelectorAll('.share__b')].map(a => getComputedStyle(a).backgroundColor + '|' + getComputedStyle(a).color);
  return { cintilloArriba: !!head.querySelector('.cintillo') && head.querySelector('.cintillo').getBoundingClientRect().top < head.querySelector('h1').getBoundingClientRect().top, bajada: !!head.querySelector('.art__lead'), fecha: meta.querySelector('time') && meta.querySelector('time').innerText, tieneHora: /\d{1,2}:\d{2}|\bh\b/.test((meta.querySelector('time') || {}).innerText || ''), metaDebajoFoto: meta.getBoundingClientRect().top >= fig.getBoundingClientRect().bottom - 1, seccion: !!meta.querySelector('.sectag'), pie: !!fig.querySelector('figcaption'), laPlata: /LA PLATA/.test(A.innerText), redes: [...document.querySelectorAll('.share__b span')].map(s => s.innerText), coloresCompartir: [...new Set(colors)], aside: { position: getComputedStyle(sticky).position, lee: !!aside.querySelector('.sec-head'), ad: !!aside.querySelector('.adbox'), adW: Math.round(aside.querySelector('.adbox__in').getBoundingClientRect().width), adH: Math.round(aside.querySelector('.adbox__in').getBoundingClientRect().height), adPos: getComputedStyle(aside.querySelector('.adbox')).position }, titulosCompletos: tit.every(Boolean) + ' (' + tit.length + ')', bannerAbajoDesktop: getComputedStyle(document.querySelector('.ad-end')).display, bodyPx: getComputedStyle(A.querySelector('.art__body')).fontSize, lh: getComputedStyle(A.querySelector('.art__body')).lineHeight, h1Peso: getComputedStyle(A.querySelector('h1')).fontWeight };
});
await p.evaluate(() => scrollTo(0, 1800)); await p.waitForTimeout(400);
out.nota.stickyTopTrasScroll = await p.evaluate(() => Math.round(document.querySelector('.aside .adbox').getBoundingClientRect().top));
await p.screenshot({ path: path.join(CAP, 'g-nota-d1280-scroll.png') });
await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: path.join(CAP, 'g-nota-d1280.png') }); await p.context().close();

out.mobile = {};
for (const w of [360, 390, 412]) {
  p = await open(w, 844, 'index.html', true);
  out.mobile[w] = await p.evaluate(() => {
    const vis = e => e.offsetParent !== null;
    const f2 = document.querySelector('.f2 .card--med'), fr = f2.querySelector('.thumb').getBoundingClientRect(), tr = f2.querySelector('.card__txt').getBoundingClientRect();
    const v = [...document.querySelectorAll('.adz:not(.adz--h) .adr__view')].filter(vis)[0].getBoundingClientRect();
    const lines = [...document.querySelectorAll('.flow')].map(f => [...f.children].slice(1).every(c => parseFloat(getComputedStyle(c).borderTopWidth) >= 1));
    const idx = [...document.querySelectorAll('main.home>*')].filter(e => !e.classList.contains('sr')).sort((a, b) => +getComputedStyle(a).order - +getComputedStyle(b).order).filter(e => e.offsetParent).map(e => e.className.split(' ')[0]);
    return { sx: document.documentElement.scrollWidth > innerWidth, dekVisibles: [...document.querySelectorAll('.dek')].filter(vis).length, f2Foto: Math.round(fr.width) + 'x' + Math.round(fr.height), f2FotoADerecha: fr.left > tr.left, banner: Math.round(v.width) + 'x' + Math.round(v.height), lineasFlow: lines.join(','), legConsecutivos: idx.join('>').includes('legband>legband'), anunciantesTexto: /anunciantes|publicidad/i.test(document.querySelector('.adz').innerText), zocalo: document.querySelectorAll('.dock__b').length };
  });
  if (w === 390) { await p.screenshot({ path: path.join(CAP, 'g-home-m390.png'), fullPage: true }); }
  await p.context().close();
}
p = await open(390, 844, 'nota.html', true); out.notaM = await p.evaluate(() => ({ sx: document.documentElement.scrollWidth > innerWidth, bajada: getComputedStyle(document.querySelector('.art__lead')).display, bodyPx: getComputedStyle(document.querySelector('.art__body')).fontSize })); await p.context().close();
p = await open(390, 844, 'seccion.html', true); out.seccionM = await p.evaluate(() => ({ dek: [...document.querySelectorAll('.dek')].filter(e => e.offsetParent).length, sx: document.documentElement.scrollWidth > innerWidth })); await p.context().close();
p = await open(1280, 900, 'index.html?demo=1'); out.panel = await p.evaluate(() => [...document.querySelectorAll('.demo__row')].map(r => r.dataset.k)); await p.context().close();
console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(path.join(import.meta.dirname, 'audit-v23.json'), JSON.stringify(out, null, 1)); await b.close();
