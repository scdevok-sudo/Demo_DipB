// v2.5.1 punto 3: la franja esta apagada por defecto y con ?franja=1 funciona (contador + encuesta: elegir, votar, barras, alto estable)
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const b = await chromium.launch();
for (const [w, mob] of [[390, true], [1280, false]]) for (const q of ['', '?franja=1', '?demo=1']) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage(); await p.goto(BASE + 'index.html' + q); await p.waitForTimeout(500);
  const vis = await p.evaluate(() => { const f = document.querySelector('.fr'); return { display: getComputedStyle(f).display, hasSes: !!document.querySelector('.fr__ses'), over: document.documentElement.scrollWidth - innerWidth, attr: document.documentElement.dataset.franja }; });
  let flow = '';
  if (q === '?franja=1') {
    const poll = p.locator('[data-poll]'); const h0 = await poll.evaluate(e => e.getBoundingClientRect().height);
    await poll.locator('.fr__opt').first().click(); const dis = await poll.locator('.fr__vote').isDisabled();
    await poll.locator('.fr__vote').click(); await p.waitForTimeout(200);
    const h1 = await poll.evaluate(e => e.getBoundingClientRect().height); const pcts = await poll.locator('.fr__pct').allTextContents();
    flow = ` | encuesta: votar habilitado tras elegir=${!dis}, alto ${Math.round(h0)}→${Math.round(h1)}, resultados ${pcts.join(' ')}`;
  }
  console.log(`${w}px ${q || '(default)'}: .fr display=${vis.display} data-franja=${vis.attr} overflowX=${vis.over}${flow}`);
  await ctx.close();
}
await b.close();
