/* Capturas v2.3.3: nota, sección y perfil a 1280 y 390 px (página completa, con los rodantes ya cargados) */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const pages = [['nota', 'nota-413361'], ['seccion', 'seccion'], ['perfil', 'legislador-agustina-roldan'], ['diputados', 'diputados']];
for (const [vw, mob, tag] of [[1280, false, 'd1280'], [390, true, 'm390']]) {
  for (const [name, file] of pages) {
    const c = await b.newContext({ viewport: { width: vw, height: 900 }, isMobile: mob, hasTouch: mob }); const p = await c.newPage();
    await p.goto(`http://localhost:8765/${file}.html`, { waitUntil: 'load' });
    await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }));
    for (const el of await p.$$('.adz')) { if (await el.isVisible()) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900); } }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
    await p.screenshot({ path: `../capturas/j-${name}-${tag}.png`, fullPage: true });
    await c.close();
  }
}
await b.close();
