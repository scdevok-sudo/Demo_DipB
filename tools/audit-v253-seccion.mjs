// v2.5.3: espacios de la nota principal de seccion.html. Uso: node audit-v253-seccion.mjs [ancho ...]
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of (process.argv.slice(2).length ? process.argv.slice(2) : ['1280', '1440', '390']).map(Number)) {
  const mob = w < 768; const p = await (await b.newContext({ viewport: { width: w, height: 900 }, isMobile: mob, hasTouch: mob })).newPage();
  await p.goto((process.env.BASE || 'http://127.0.0.1:8765/') + 'seccion.html'); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const rc = s => document.querySelector(s).getBoundingClientRect(), $ = s => document.querySelector(s);
    const lead = rc('.sec-tapa'), th = rc('.sec-tapa .thumb'), tx = rc('.sec-tapa .card__txt'), hp = rc('.sec-hero p'), rule = $('.sec-tapa').nextElementSibling.getBoundingClientRect();
    const h2 = $('.sec-tapa h2'), cs = getComputedStyle(h2);
    return { 'bajada de la sección → nota principal': Math.round(Math.min(th.top, tx.top) - hp.bottom), 'foto → doble línea': Math.round(rule.top - Math.max(th.bottom, tx.bottom)),
      'aire del texto arriba / abajo de la foto': Math.round(tx.top - th.top) + ' / ' + Math.round(th.bottom - tx.bottom), 'foto, ancho (% del bloque) y alto': Math.round(th.width / lead.width * 100) + '% · ' + Math.round(th.width) + '×' + Math.round(th.height),
      'título': cs.fontSize + ' · ' + Math.round(h2.getBoundingClientRect().height / parseFloat(cs.lineHeight)) + ' líneas', overflowX: document.documentElement.scrollWidth - innerWidth, 'alto del bloque': Math.round(lead.height) };
  });
  console.log(`--- ${w}px`); for (const [k, v] of Object.entries(r)) console.log('  ' + k + ': ' + v);
}
await b.close();
