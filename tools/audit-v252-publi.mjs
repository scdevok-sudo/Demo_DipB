// v2.5.2 puntos 2 y 3: aire (contenido a contenido) arriba y abajo de cada bloque de publicidad y orden de los bloques. Uso: node audit-v252-publi.mjs [ancho ...]
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of (process.argv.slice(2).length ? process.argv.slice(2) : ['1280', '1440', '390']).map(Number)) {
  const mob = w < 768; const p = await (await b.newContext({ viewport: { width: w, height: 900 }, isMobile: mob, hasTouch: mob })).newPage();
  await p.goto((process.env.BASE || 'http://127.0.0.1:8765/') + 'index.html' + (process.env.Q ? '?' + process.env.Q : '')); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const kids = [...document.querySelectorAll('main.home>*')].filter(e => e.offsetParent && e.getBoundingClientRect().height > 0 && !e.classList.contains('sr'));
    const info = kids.map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); const isAd = e.matches('.rodh,.adz,.adband');
      const inner = isAd ? (e.querySelector('.adz__dots') ? [e.querySelector('.adz__slots,.adr__view,.adbanner__box'), e.querySelector('.adz__dots')] : [e.querySelector('.adz__slots,.adr__view,.adbanner__box,.adbanner')]) : null;
      let t = r.top + scrollY + parseFloat(cs.paddingTop), bt = r.bottom + scrollY - parseFloat(cs.paddingBottom);
      if (inner) { const rs = inner.filter(Boolean).map(x => x.getBoundingClientRect()); t = Math.min(...rs.map(x => x.top)) + scrollY; bt = Math.max(...rs.map(x => x.bottom)) + scrollY; }
      return { n: (e.className || e.tagName).toString().replace(/\s+/g, '.').slice(0, 24), ad: isAd, t, b: bt, o: +cs.order }; });
    const ord = info.sort((a, c) => a.t - c.t);
    return ord.map((x, i) => ({ n: x.n, ad: x.ad, arriba: i ? Math.round(x.t - ord[i - 1].b) : null, abajo: i < ord.length - 1 ? Math.round(ord[i + 1].t - x.b) : null }));
  });
  console.log(`--- ${w}px: orden de bloques: ${r.map(x => x.n).join(' > ')}`);
  console.log(r.filter(x => x.ad).map(x => `${w}px ${x.n}: aire arriba ${x.arriba} · abajo ${x.abajo}`).join('\n'));
}
await b.close();
