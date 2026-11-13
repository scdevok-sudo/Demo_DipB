// Capturas del zócalo mobile (con y sin menú abierto) y del home hasta cierto scroll. Uso: node dock-shots.mjs
import { chromium } from 'playwright'; import path from 'node:path';
const OUT = path.resolve(import.meta.dirname, '..', 'capturas');
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
await p.evaluate(() => scrollTo(0, 1500)); await p.waitForTimeout(600);
await p.screenshot({ path: path.join(OUT, 'zocalo-m390.png') });
await p.tap('.js-dock-menu'); await p.waitForTimeout(600);
await p.screenshot({ path: path.join(OUT, 'zocalo-menu-abierto-m390.png') });
await p.tap('.nav__close'); await p.waitForTimeout(500);
await p.goto('http://localhost:8765/senadores.html'); await p.waitForTimeout(600);
await p.screenshot({ path: path.join(OUT, 'zocalo-senadores-m390.png') });
await b.close();
