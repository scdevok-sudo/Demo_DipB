import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const pages = ['nota-413361', 'seccion', 'legislador-agustina-roldan', 'diputados', 'senadores'];
for (const [vw, mob] of [[1280, false], [390, true]]) {
  for (const pg of pages) {
    const c = await b.newContext({ viewport: { width: vw, height: 900 }, isMobile: mob, hasTouch: mob }); const p = await c.newPage();
    await p.goto(`http://localhost:8765/${pg}.html`, { waitUntil: 'load' }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const vis = e => e.offsetParent !== null; const R = e => e.getBoundingClientRect(); const end = document.querySelector('.ad-end'); const foot = document.querySelector('footer'); const wrap = document.querySelector('main .wrap');
      const sq = end.querySelector('.adz--sq'), h = end.querySelector('.adz--end');
      const hv = h.querySelector('.adr__view'), sv = sq.querySelector('.adr__view');
      const hs = [...document.querySelectorAll('.adz--h')].filter(vis).length;
      return { finVisible: vis(end), cuadradosVisible: vis(sq), horizVisible: vis(h), hSlides: h.querySelectorAll('.adr__slide').length, hW: Math.round(R(hv).width), hH: Math.round(R(hv).height), contenidoW: Math.round(R(wrap).width), sqW: vis(sq) ? Math.round(R(sv).width) + 'x' + Math.round(R(sv).height) : '-', ordenSqH: vis(sq) ? R(sq).top < R(h).top : null, antesDelPie: R(end).bottom <= R(foot).top + 1, gapAlPie: Math.round(R(foot).top - R(end).bottom), horizontalesVisibles: hs, texto: end.innerText.trim().length, hscroll: document.documentElement.scrollWidth > innerWidth };
    });
    console.log(vw, pg, JSON.stringify(r)); await c.close();
  }
}
await b.close();
