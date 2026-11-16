import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const pg of ['nota-413361', 'seccion', 'legislador-agustina-roldan', 'diputados', 'senadores']) {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
  await p.goto(`http://localhost:8765/${pg}.html`, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const vis = e => e.offsetParent !== null; const z = [...document.querySelectorAll('.adz--side')].filter(vis); const R = e => e.getBoundingClientRect();
    const zz = z[0]; const v = zz.querySelector('.adr__view'); const act = () => [...zz.querySelectorAll('.adr__slide')].findIndex(s => s.classList.contains('is-active'));
    const i0 = act(); zz.querySelector('.adr__arrow[aria-label="Banner siguiente"]').click(); await new Promise(r => setTimeout(r, 400)); const i1 = act();
    const src = zz.querySelector('.adr__slide.is-active img');
    return { lateralesVisibles: z.length, viewW: Math.round(R(v).width), viewH: Math.round(R(v).height), slides: zz.querySelectorAll('.adr__slide').length, puntos: zz.querySelectorAll('.adr__dot').length, flechas: zz.querySelectorAll('.adr__arrow').length, avanza: i0 + '→' + i1, activaCargada: !!(src && src.getAttribute('src')), fit: getComputedStyle(zz.querySelector('.adr__slide img')).objectFit, texto: zz.innerText.trim().length, viejoAdbox: document.querySelectorAll('.adbox').length, sticky: getComputedStyle(zz.closest('.aside__sticky,.prof-side') || zz).position, hscroll: document.documentElement.scrollWidth > innerWidth, legsCols: document.querySelector('.legs') ? getComputedStyle(document.querySelector('.legs')).gridTemplateColumns.split(' ').length : null };
  });
  console.log(pg, JSON.stringify(r)); await c.close();
}
await b.close();
