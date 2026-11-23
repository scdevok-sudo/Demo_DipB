// v2.5.5: altura de texto vs altura de foto en las tarjetas horizontales de desktop (foto al costado). Uso: node audit-v255-chicas.mjs [ancho ...]   (env CSS="..." inyecta CSS de prueba)
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of (process.argv.slice(2).length ? process.argv.slice(2) : ['1280', '1440']).map(Number)) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto((process.env.BASE || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(500);
  if (process.env.CSS) await p.addStyleTag({ content: process.env.CSS }); await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const rc = e => e.getBoundingClientRect();
    const grupos = { 'uno-dos chica (normal)': '.ud--a .ud__side .card--ud', 'uno-dos chica (espejo)': '.ud--espejo .ud__side .card--ud', 'Formato 2 Diputados': '.f2band:nth-of-type(1) .card, ', };
    const sel = { 'uno-dos chica (normal)': '.ud--a .ud__side .card--ud', 'uno-dos chica (espejo)': '.ud--espejo .ud__side .card--ud', 'Formato 2 (8 tarjetas)': '.f2 .card--med', 'franja de secciones (nota con foto)': '.strip .card--med' };
    const out = {};
    for (const [k, s] of Object.entries(sel)) out[k] = [...document.querySelectorAll(s)].filter(c => c.offsetParent).map(c => {
      const th = c.querySelector('.thumb'), h = c.querySelector('h3'); const txt = c.querySelector('.card__txt'); const kids = [...txt.children].filter(e => getComputedStyle(e).display !== 'none' && rc(e).height > 0);
      const t0 = Math.min(...kids.map(e => rc(e).top)), t1 = Math.max(...kids.map(e => rc(e).bottom));
      const horiz = Math.abs(rc(th).top - rc(txt).top) < 4 || rc(th).left > rc(txt).right - 4 || rc(th).right < rc(txt).left + 4;
      return { fs: getComputedStyle(h).fontSize, l: Math.round(rc(h).height / parseFloat(getComputedStyle(h).lineHeight)), txt: Math.round(t1 - t0), foto: Math.round(rc(th).height), dk: Math.round(t0 - rc(th).top), dc: Math.round(rc(h).top - (rc(c.querySelector('.cintillo') || h).top)), horiz };
    });
    return out;
  });
  for (const [k, v] of Object.entries(r)) console.log(`${w}px ${k}: fuente ${[...new Set(v.map(x => x.fs))]} · líneas máx ${Math.max(...v.map(x => x.l))} · texto/foto (px): ${v.map(x => x.txt + '/' + x.foto).join('  ')} · desfase texto-foto arriba ${v.map(x => x.dk).join(',')} · horizontal=${v.every(x => x.horiz)}`);
}
await b.close();
