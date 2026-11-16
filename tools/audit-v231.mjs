/* Auditoría de los cambios v2.3.1 (puntos 1 a 5 + bonus). Resultados crudos en tools/audit-v231.json */
import { chromium } from 'playwright'; import fs from 'node:fs'; import path from 'node:path';
const CAP = path.resolve('..', 'capturas'), B = 'http://localhost:8765/';
const b = await chromium.launch({ channel: 'chrome' }); const out = {};
const open = async (vw, vh, url, mob) => { const c = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: !!mob, hasTouch: !!mob }); const p = await c.newPage(); await p.goto(B + url, { waitUntil: 'load' }); await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; })); await p.waitForTimeout(1200); return p; };

/* 1 · home desktop */
let p = await open(1280, 900, 'index.html');
out.p1 = await p.evaluate(() => {
  const vis = e => e.offsetParent !== null; const hs = [...document.querySelectorAll('.adz--h')];
  const z = hs[0]; const slides = [...z.querySelectorAll('.adr__slide img')].map(i => (i.getAttribute('src') || i.dataset.src || '').split('/').pop());
  const blocks = [...document.querySelectorAll('main.home > *')].filter(vis).map(e => (e.className || e.tagName).toString().split(' ').slice(0, 2).join('.'));
  return { bannerSueltoVisible: [...document.querySelectorAll('.adbanner')].filter(vis).length, rodantesHorizontales: hs.length, slides, primeraSlide: slides[0], flechas: z.querySelectorAll('.adr__arrow').length, puntos: z.querySelectorAll('.adr__dot').length, rodanteCuadrados: [...document.querySelectorAll('.adz:not(.adz--h)')].filter(vis).length, bloques: blocks, topstrip: document.querySelector('.topstrip').innerText.replace(/\s+/g, ' ') };
});
await p.evaluate(() => document.querySelector('.adz--h').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800);
const r = await p.evaluate(() => { const r = document.querySelector('.adz--h').getBoundingClientRect(); return { y: Math.round(r.top + scrollY - 20), h: Math.round(r.height + 40) }; });
await p.screenshot({ path: path.join(CAP, 'h-rodante-horizontal-d1280.png'), fullPage: true, clip: { x: 0, y: r.y, width: 1280, height: r.h } });
await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: path.join(CAP, 'h-topbar-d1280.png'), clip: { x: 0, y: 0, width: 1280, height: 160 } });
/* el rodante cambia de slide (avanza) */
out.p1.avanza = await p.evaluate(async () => { const z = document.querySelector('.adz--h'); const a = () => [...z.querySelectorAll('.adr__slide')].findIndex(s => s.classList.contains('is-active')); const i0 = a(); z.querySelector('.adr__arrow[aria-label="Banner siguiente"]').click(); await new Promise(r => setTimeout(r, 400)); return i0 + ' → ' + a(); });
await p.context().close();

/* 2 y 3 · laterales y pie de foto */
out.p2 = {};
for (const pg of ['nota-413361.html', 'seccion.html', 'legislador-agustina-roldan.html']) {
  for (const vh of [900, 1080]) {
    p = await open(1280, vh, pg);
    out.p2[pg + '@' + vh] = await p.evaluate(async () => {
      const q = [...document.querySelectorAll('.adbox, .adz, .adr')].filter(e => e.offsetParent); const box = document.querySelector('.adbox--side'), a = box.getBoundingClientRect(), img = box.querySelector('img'), cs = getComputedStyle(img), bg = getComputedStyle(box.querySelector('.adbox__in')).backgroundColor;
      const y0 = box.getBoundingClientRect().top; scrollTo(0, 2500); await new Promise(r => setTimeout(r, 300)); const y1 = Math.round(box.getBoundingClientRect().top);
      return { bloquesDePublicidadVisibles: q.length, w: Math.round(a.width), h: Math.round(a.height), position: getComputedStyle(box).position, objectFit: cs.objectFit, fondo: bg, imgCargada: img.complete && img.naturalWidth > 0, topTrasScroll: y1, figcaptionEnNota: document.querySelectorAll('.art__fig figcaption').length };
    });
    await p.context().close();
  }
}
p = await open(1280, 900, 'nota-413361.html');
out.bonus = await p.evaluate(() => { const a = document.querySelector('.aside'); const ar = a.getBoundingClientRect(); const tags = [...a.querySelectorAll('.sectag')].map(e => { const lh = parseFloat(getComputedStyle(e).lineHeight); return Math.round(e.getBoundingClientRect().height - 4) <= Math.round(lh) + 2 ? 1 : 2; }); const tl = [...a.querySelectorAll('.card--sm h3')].map(h => Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight))); return { anchoColumna: Math.round(ar.width), lineasEtiqueta: tags, lineasTitulos: tl, titulosCompletos: [...a.querySelectorAll('.card--sm h3')].every(h => h.scrollHeight <= h.clientHeight + 3), anchoNota: Math.round(document.querySelector('.art').getBoundingClientRect().width) }; });
await p.screenshot({ path: path.join(CAP, 'h-leetambien-d1280.png'), clip: { x: 880, y: 150, width: 400, height: 1000 }, fullPage: true });
await p.context().close();
p = await open(1280, 900, 'index.html'); out.homeFigcaption = await p.evaluate(() => [...document.querySelectorAll('figcaption')].filter(e => e.offsetParent).length); await p.context().close();

/* 4 · barra superior en otras páginas */
out.p4 = {};
for (const pg of ['index.html', 'seccion.html', 'nota-413361.html', 'diputados.html', 'legislador.html']) { p = await open(1280, 900, pg); out.p4[pg] = await p.evaluate(() => ({ barra: document.querySelector('.topstrip').innerText.replace(/\s+/g, ' ').trim(), enlacesDiputadosSenadoresEnBarra: [...document.querySelectorAll('.topstrip a')].map(a => a.innerText), menuPrincipal: [...document.querySelectorAll('.nav a')].map(a => a.innerText.trim()).filter(t => /diputados|senadores/i.test(t)) })); await p.context().close(); }

/* 5 · mobile */
out.p5 = {};
for (const vw of [360, 390, 412]) {
  p = await open(vw, 800, 'index.html', true);
  out.p5[vw] = await p.evaluate(() => {
    const vis = e => e.offsetParent !== null; const blocks = [...document.querySelectorAll('main.home > *')].filter(vis).map(e => ({ n: (e.className || e.tagName).toString().split(' ').slice(0, 2).join('.'), top: Math.round(e.getBoundingClientRect().top + scrollY) })).sort((a, b) => a.top - b.top);
    const strip = blocks.find(x => x.n.includes('stripband')), ads = blocks.filter(x => /^adz|adband/.test(x.n));
    const sq = document.querySelector('.adz:not(.adz--h) .adr__view').getBoundingClientRect(); const rot = [...document.querySelectorAll('.adz:not(.adz--h) .adr')].filter(vis).length;
    const textos = [...document.querySelectorAll('.adz, .adband')].map(e => e.innerText.trim()).join('').length;
    return { ultimosBloques: blocks.slice(-5).map(x => x.n + '@' + x.top), publicidadDespuesDeSecciones: ads.length > 0 && ads.every(a => a.top > strip.top), cuadrado: Math.round(sq.width) + 'x' + Math.round(sq.height), cantidadSlotsCuadrados: rot, textosEnPublicidad: textos, adHorizontalVisible: [...document.querySelectorAll('.adz--h')].filter(vis).length, bannerHorizontal: [...document.querySelectorAll('.adbanner')].filter(vis).length, scrollHorizontal: document.documentElement.scrollWidth > innerWidth };
  });
  if (vw === 390) {
    const y = await p.evaluate(() => { const s = document.querySelector('.stripband'); return Math.round(s.getBoundingClientRect().bottom + scrollY - 260); });
    await p.screenshot({ path: path.join(CAP, 'h-mobile-publicidad-al-final-m390.png'), fullPage: true, clip: { x: 0, y, width: 390, height: 1000 } });
  }
  await p.context().close();
}
fs.writeFileSync('audit-v231.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
await b.close();
