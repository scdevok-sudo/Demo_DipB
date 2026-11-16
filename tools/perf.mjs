// Mide LCP y CLS con PerformanceObserver dentro de Playwright (Chromium), con CPU 4x y red "4G lenta" emuladas por CDP.
// Uso: node perf.mjs [pagina,pagina] [query]
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8765/';
const pages = (process.argv[2] || 'index,seccion,nota-413361,diputados,senadores,legislador').split(',');
const q = process.argv[3] ? '?' + process.argv[3] : '';
const b = await chromium.launch();
for (const n of pages) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__m.cls += e.value; (window.__s = window.__s || []).push([e.value.toFixed(4), Math.round(e.startTime), (e.sources || []).map(s => (s.node && (s.node.className || s.node.nodeName)) + '@' + Math.round(s.previousRect.y) + '>' + Math.round(s.currentRect.y)).join(' ; ')]); } }).observe({ type: 'layout-shift', buffered: true });
  });
  await p.goto(BASE + n + '.html' + q, { waitUntil: 'load' });
  await p.waitForTimeout(3000);
  // scroll lento hasta el final (lo que ve un lector); el CLS cuenta todo el recorrido
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => window.__m);
  if (process.env.DEBUG) console.log(JSON.stringify(await p.evaluate(() => window.__s || []).then(a => a.sort((x, y) => y[0] - x[0]).slice(0, 6)), null, 1));
  console.log(n.padEnd(14), 'LCP', (m.lcp / 1000).toFixed(2) + ' s', '· CLS', m.cls.toFixed(4));
  await ctx.close();
}
await b.close();
