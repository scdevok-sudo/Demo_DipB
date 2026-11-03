// Capturas Playwright de las páginas clave + auditoría de overflow horizontal.
// Uso (con el servidor en :8765): node shots.mjs [pagina,pagina] [vp,vp]
import { chromium } from 'playwright'; import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..');
const BASE = process.env.BASE || 'http://localhost:8765/';
const pages = (process.argv[2] || 'index,nota,nota-413105,nota-412621,seccion,legisladores,legislador,legislador-martin-salgado').split(',');
const VP = {
  'm390': { width: 390, height: 844, mobile: true, dpr: 3 },
  'm412': { width: 412, height: 915, mobile: true, dpr: 2.625 },
  'm360': { width: 360, height: 740, mobile: true, dpr: 3 },
  'm375': { width: 375, height: 812, mobile: true, dpr: 3 },
  'm430': { width: 430, height: 932, mobile: true, dpr: 3 },
  't': { width: 820, height: 1180, dpr: 1 },
  'd': { width: 1366, height: 900, dpr: 1 },
};
const sel = (process.argv[3] || 'm390,t,d').split(',');
const b = await chromium.launch({ channel: 'chrome' });
for (const k of sel) {
  const v = VP[k];
  const ctx = await b.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr, isMobile: !!v.mobile, hasTouch: !!v.mobile });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
  for (const n of pages) {
    await p.goto(BASE + n + '.html', { waitUntil: 'load' }); await p.waitForTimeout(600);
    const ov = await p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > w + 1 && !e.closest('.lcar__track,.nav,.demo') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map(e => e.className || e.tagName);
      return { over: document.documentElement.scrollWidth - w, bad };
    });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } scrollTo(0, 0); });
    await p.waitForTimeout(800);
    if (process.env.FULL !== '0') await p.screenshot({ path: path.join(R, `capturas/${n}-${k}.png`), fullPage: true });
    await p.screenshot({ path: path.join(R, `capturas/${n}-${k}-fold.png`) });
    console.log(k, n, 'overflowX', ov.over, ov.bad.join(','));
  }
  console.log(k, 'errores:', [...new Set(errs)].slice(0, 8));
  await ctx.close();
}
await b.close();
