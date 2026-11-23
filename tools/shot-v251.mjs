// Captura de un elemento: node shot-v251.mjs <selector> <ancho> <archivo.png> [query] [alto-ventana]   (servidor en :8765; guarda en ../capturas)
import { chromium } from 'playwright'; import path from 'node:path';
const [sel, w, out, query = '', h] = process.argv.slice(2); const mob = +w < 768;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: +h || (mob ? 844 : 800) }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
const p = await ctx.newPage(); await p.goto((process.env.BASE || 'http://127.0.0.1:8765/') + 'index.html' + (query ? '?' + query : '')); await p.waitForTimeout(500);
await p.evaluate(async () => { document.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; }); document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
await p.waitForTimeout(800);
const box = await p.evaluate(([sel, process_idx]) => { const e = document.querySelectorAll(sel)[+(process_idx)]; const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; }, [sel, process.env.IDX || 0]);
await p.evaluate(() => { document.querySelectorAll('header,.topstrip,.nav,.lasthour').forEach(h => { if (getComputedStyle(h).position === 'fixed' || getComputedStyle(h).position === 'sticky') h.style.position = 'static'; }); });
await p.evaluate(([sel, process_idx]) => { const e = document.querySelectorAll(sel)[+(process_idx)]; window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 10); }, [sel, process.env.IDX || 0]); await p.waitForTimeout(300);
const box2 = await p.evaluate(([sel, process_idx]) => { const r = document.querySelectorAll(sel)[+(process_idx)].getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; }, [sel, process.env.IDX || 0]);
await p.screenshot({ path: path.resolve(import.meta.dirname, '..', 'capturas', out), fullPage: true, clip: box2 }); await b.close(); console.log('ok', out);
