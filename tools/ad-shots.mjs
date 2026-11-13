// Capturas del bloque Anunciantes a 390 px: espera a que la rotación pase por cada banner y captura los de proporciones distintas.
import { chromium } from 'playwright'; import path from 'node:path';
const OUT = path.resolve(import.meta.dirname, '..', 'capturas');
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
await p.evaluate(() => document.querySelector('.adz').scrollIntoView({ block: 'center' }));
const want = new Set([2, 4, 6, 7]); const got = []; const zones = new Set();
const t0 = Date.now();
while (want.size && Date.now() - t0 < 90000) {
  await p.waitForTimeout(300);
  const info = await p.evaluate(() => {
    const sl = [...document.querySelectorAll('.adz .adr:first-child .adr__slide')]; const k = sl.findIndex(s => s.classList.contains('is-active')); const im = sl[k]?.querySelector('img');
    if (!im || !im.naturalWidth) return null;
    const z = document.querySelector('.adz').getBoundingClientRect(), v = document.querySelector('.adz .adr__view').getBoundingClientRect();
    return { k, zone: Math.round(z.height), view: Math.round(v.width) + 'x' + Math.round(v.height), nat: im.naturalWidth + 'x' + im.naturalHeight };
  });
  if (!info) continue; zones.add(info.zone);
  if (want.has(info.k)) { await p.waitForTimeout(700); want.delete(info.k); got.push(info); console.log(JSON.stringify(info)); await p.evaluate(() => document.querySelector('.adz').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200); await p.locator('.adz').screenshot({ path: path.join(OUT, `anunciantes-110-banner-${info.nat}-m390.png`) }); }
}
console.log('alturas del bloque vistas durante la rotación:', [...zones].join(', '), '| capturas:', got.length);
await p.evaluate(() => document.querySelector('.adband').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800);
console.log('flujo', await p.evaluate(() => { const r = document.querySelector('.adbanner__box').getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }));
await p.locator('.adband').screenshot({ path: path.join(OUT, 'banner-flujo-110-m390.png') });
await b.close();
