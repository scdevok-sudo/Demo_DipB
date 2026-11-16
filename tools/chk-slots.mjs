import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [vw, mob] of [[390, true], [1280, false]]) {
  const c = await b.newContext({ viewport: { width: vw, height: 900 }, isMobile: mob, hasTouch: mob }); const p = await c.newPage();
  await p.goto('http://localhost:8765/seccion.html', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  const info = () => p.evaluate(() => {
    const vis = e => e.offsetParent !== null; const s = [...document.querySelectorAll('.srow-ad')]; const R = e => e.getBoundingClientRect();
    return { slotsEnDOM: s.length, visibles: s.filter(vis).length, rodantes: s.filter(e => e.querySelector('.adz')).length, sueltos: s.filter(e => e.querySelector('.srow-ad__in')).length, medida: s.filter(vis).slice(0, 2).map(e => { const v = e.querySelector('.adr__view'); return Math.round(R(v).width) + 'x' + Math.round(R(v).height); }), inicializados: s.filter(e => e.querySelector('.adz[data-init]')).length, notasAntesDelPrimero: s.length ? [...document.querySelectorAll('#sflow > *')].findIndex(e => e.classList.contains('srow-ad')) : null, hscroll: document.documentElement.scrollWidth > innerWidth };
  });
  console.log(vw, 'inicial', JSON.stringify(await info()));
  for (let k = 0; k < 4; k++) { await p.evaluate(() => document.querySelector('#sec-more')?.scrollIntoView()); await p.waitForTimeout(1500); }
  console.log(vw, 'tras scroll infinito', JSON.stringify(await info()));
  const rot = await p.evaluate(async () => { const z = [...document.querySelectorAll('.srow-ad .adz')].filter(e => e.offsetParent).pop(); if (!z) return null; z.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 800)); const a = () => [...z.querySelectorAll('.adr__slide')].findIndex(s => s.classList.contains('is-active')); const i0 = a(); z.querySelector('.adr__arrow[aria-label="Banner siguiente"]').click(); await new Promise(r => setTimeout(r, 400)); return { ultimoSlotRota: i0 + '→' + a(), imgCargada: !!z.querySelector('.adr__slide.is-active img').getAttribute('src') }; });
  console.log(vw, 'rodante inyectado', JSON.stringify(rot));
  await c.close();
}
await b.close();
