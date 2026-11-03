// Capturas del bloque "Anunciantes + Lo último de Legislatura" (home) y de la columna lateral B de la nota.
// Uso: node shots-ads.mjs antes|despues   (con el servidor en :8765)
import { chromium } from 'playwright'; import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..');
const tag = process.argv[2] || 'despues';
const BASE = process.env.BASE || 'http://localhost:8765/';
const VPS = [360, 390, 412, 768, 1024, 1280];
const b = await chromium.launch({ channel: 'chrome' });
for (const w of VPS) {
  const mobile = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.goto(BASE + 'index.html', { waitUntil: 'load' }); await p.waitForTimeout(700);
  await p.addStyleTag({ content: '.hdr{position:static!important}.totop{display:none!important}' });
  const row = p.locator('div.sec.grid').first();
  await row.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollTo(0, document.querySelector('div.sec.grid').getBoundingClientRect().top + scrollY - 300)); await p.waitForTimeout(2200);
  const m = await p.evaluate(() => {
    const r = document.querySelector('div.sec.grid'); const W = document.documentElement.clientWidth;
    const cols = [...r.children].map(c => { const q = c.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.right), Math.round(q.height)]; });
    const slots = [...r.querySelectorAll('.adr__view')].filter(v => v.offsetParent).map(v => { const q = v.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; });
    const dots = [...r.querySelectorAll('.adr__dot')].filter(d => d.offsetParent).map(d => { const q = d.getBoundingClientRect(); return Math.round(q.width) + 'x' + Math.round(q.height); });
    return { overflow: document.documentElement.scrollWidth - W, cols, slots, dots: [...new Set(dots)], labels: r.querySelectorAll('.adr__label,.adz__label').length };
  });
  console.log(tag, w, JSON.stringify(m));
  await row.screenshot({ path: path.join(R, `capturas/anunciantes/${tag}-${w}.png`) });
  await ctx.close();
}
await b.close();
