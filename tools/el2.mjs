import { chromium } from 'playwright'; import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
const box = await p.evaluate(() => { const a = document.querySelectorAll('.legband--a'); const r1 = a[0].getBoundingClientRect(), r2 = a[a.length - 1].getBoundingClientRect(); return { y: r1.top + scrollY, h: r2.bottom - r1.top }; });
await p.screenshot({ path: path.resolve(import.meta.dirname, '..', 'capturas', 'modulos-diputados-senadores-m390.png'), fullPage: true, clip: { x: 0, y: box.y, width: 390, height: box.h } });
await b.close();
