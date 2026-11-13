// Captura de un elemento. Uso: node el-shot.mjs <pagina> <ancho> "<selector>" <salida.png> [query] [indice]
import { chromium } from 'playwright'; import path from 'node:path';
const [pg, w, sel, out, q = '', idx = '0'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: +w, height: 844 }, deviceScaleFactor: 2, isMobile: +w < 768, hasTouch: +w < 768 });
const p = await ctx.newPage();
await p.goto(`http://localhost:8765/${pg}.html${q ? '?' + q : ''}`); await p.waitForTimeout(600);
await p.evaluate(async () => { document.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; }); document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await new Promise(r => setTimeout(r, 1200)); });
await p.waitForTimeout(1500);
await p.locator(sel).nth(+idx).screenshot({ path: path.resolve(import.meta.dirname, '..', 'capturas', out) });
await b.close();
