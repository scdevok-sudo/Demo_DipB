// Capturas Playwright + auditoría de overflow horizontal y de filas de 2 notas en mobile.
// Uso (servidor en :8765): node shots.mjs [paginas] [viewports] [query]
//   node shots.mjs index d1440,m390 "diario=off"      → capturas/index-d1440-diario-off.png
// Variables: FULL=0 (solo el primer viewport) · OUT=carpeta · BASE=url
import { chromium } from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const R = path.resolve(import.meta.dirname, '..');
const BASE = process.env.BASE || 'http://localhost:8765/';
const OUT = path.join(R, process.env.OUT || 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const pages = (process.argv[2] || 'index,nota,seccion,legisladores,legislador').split(',');
const VP = {
  m360: { width: 360, height: 740, mobile: true, dpr: 2 },
  m390: { width: 390, height: 844, mobile: true, dpr: 2 },
  m412: { width: 412, height: 915, mobile: true, dpr: 2 },
  t: { width: 820, height: 1180, dpr: 1 },
  d1280: { width: 1280, height: 800, dpr: 1 },
  d1440: { width: 1440, height: 900, dpr: 1 },
};
const sel = (process.argv[3] || 'm390,d1440').split(',');
const query = process.argv[4] || '';
const tag = query ? '-' + query.replace(/[&=]/g, '-') : '';
const b = await chromium.launch({ channel: 'chrome' });
for (const k of sel) {
  const v = VP[k];
  const ctx = await b.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr, isMobile: !!v.mobile, hasTouch: !!v.mobile });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
  for (const n of pages) {
    await p.goto(BASE + n + '.html' + (query ? '?' + query : ''), { waitUntil: 'load' }); await p.waitForTimeout(500);
    await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }))); for (let y = 0; y < document.body.scrollHeight && y < 12000; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(700);
    const ov = await p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > w + 1 && !e.closest('.lcar__track,.nav,.demo,.adr__view') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map(e => e.className || e.tagName);
      // mobile: ninguna fila con 2 notas lado a lado (tarjetas med/lead/tf al mismo top y distinto left)
      const cards = [...document.querySelectorAll('.card--med,.card--lead,.card--tf')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
      let twoUp = 0; if (w < 700) for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) if (Math.abs(cards[i].top - cards[j].top) < 4 && Math.abs(cards[i].left - cards[j].left) > 40) twoUp++;
      const lead = document.querySelector('.card--lead .thumb')?.getBoundingClientRect();
      return { over: document.documentElement.scrollWidth - w, bad, twoUp, leadH: lead ? Math.round(lead.height) : null, vh: innerHeight };
    });
    if (process.env.FULL !== '0') await p.screenshot({ path: path.join(OUT, `${n}-${k}${tag}.png`), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `${n}-${k}${tag}-fold.png`) });
    console.log(k, n, 'overflowX', ov.over, ov.bad.join(','), '| filas de 2:', ov.twoUp, '| foto fuerte', ov.leadH, '/ viewport', ov.vh);
  }
  console.log(k, 'errores:', [...new Set(errs)].slice(0, 8));
  await ctx.close();
}
await b.close();
