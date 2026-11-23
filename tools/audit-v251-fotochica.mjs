// v2.5.1 punto 1: líneas de título de la tarjeta compacta mobile según el ancho de la foto (32/36/38 %) en 360, 390 y 412.
// Uso (servidor en :8765): node audit-v251-fotochica.mjs [pcts]   p.ej. "32,36,38"
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const pcts = (process.argv[2] || '32,36,38').split(',').map(Number);
const TIPOS = { 'franja de secciones': '.strip .card--med h3', 'Formato 2': '.f2 .card--med h3', 'uno-dos chica': '.ud__side .card--ud h3' };
const b = await chromium.launch();
for (const w of (process.env.WIDTHS || '360,390,412').split(',').map(Number)) for (const pc of pcts) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(BASE + 'index.html'); await p.waitForTimeout(400);
  if (pc) await p.addStyleTag({ content: `@media (max-width:767px){.f2 .card--med,.ud__side .card--med,.strip .card--med{grid-template-columns:minmax(0,1fr) ${pc}%!important}}` });
  await p.waitForTimeout(300);
  const r = await p.evaluate(T => {
    const out = {};
    for (const [k, s] of Object.entries(T)) {
      const hs = [...document.querySelectorAll(s)].filter(h => h.offsetParent);
      const L = hs.map(h => Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)));
      const nanni = hs.find(h => /^Nanni exige/.test(h.textContent.trim()));
      out[k] = { max: Math.max(...L), n: L.length, dist: L.join(','), nanni: nanni ? Math.round(nanni.getBoundingClientRect().height / parseFloat(getComputedStyle(nanni).lineHeight)) : null, fs: hs[0] && getComputedStyle(hs[0]).fontSize };
    }
    const fotoW = document.querySelector('.strip .card--med .thumb')?.getBoundingClientRect().width;
    return { out, fotoPx: Math.round(fotoW) };
  }, TIPOS);
  console.log(`${w}px foto ${pc}% (${r.fotoPx}px):`, Object.entries(r.out).map(([k, v]) => `${k}: máx ${v.max} líneas [${v.dist}] Nanni=${v.nanni} (${v.fs})`).join(' | '));
  await ctx.close();
}
await b.close();
