// Recorte de una región de página: node crop.mjs pagina viewport "sel" salida.png [query]
import { chromium } from 'playwright';
const [pg, vp, sel, out, q = ''] = process.argv.slice(2);
const V = { m390: [390, 844, 2, 1], m360: [360, 740, 2, 1], m412: [412, 915, 2, 1], d1280: [1280, 800, 1, 0], d1440: [1440, 900, 1, 0] }[vp];
const b = await chromium.launch({ channel: 'chrome' });
const c = await b.newContext({ viewport: { width: V[0], height: V[1] }, deviceScaleFactor: V[2], isMobile: !!V[3], hasTouch: !!V[3] });
const p = await c.newPage(); await p.goto(`http://localhost:8765/${pg}.html${q ? '?' + q : ''}`, { waitUntil: 'load' }); await p.waitForTimeout(800);
const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
await el.screenshot({ path: '../capturas-tmp/' + out }); await b.close();
