// v2.5.1 punto 6: posicion de la nota grande de cada uno-dos con unodos=derecha (default) / alterna, en desktop y mobile
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const b = await chromium.launch();
for (const [w, mob] of [[1280, false], [390, true]]) for (const q of ['', '?unodos=alterna', '?reset=1']) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage();
  await p.goto(BASE + 'index.html' + q); await p.waitForTimeout(400);
  const r = await p.evaluate(mob => [...document.querySelectorAll('.ud')].map(u => { const big = u.querySelector('.ud__big').getBoundingClientRect(), side = u.querySelector('.ud__side').getBoundingClientRect(); const ids = [...u.querySelectorAll('h2 a,h3 a')].map(a => a.getAttribute('href').match(/\d+/)[0]); return (mob ? (big.top < side.top ? 'grande arriba' : 'grande abajo') : (big.left > side.left ? 'grande a la DERECHA' : 'grande a la izquierda')) + ' [' + ids.join(',') + ']'; }), mob);
  console.log(`${w}px ${q || '(default)'}: ${r.join('  |  ')}`); await ctx.close();
}
await b.close();
