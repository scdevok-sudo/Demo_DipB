import { chromium } from 'playwright'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const R = path.resolve(import.meta.dirname, '..');
const b = await chromium.launch({ channel: 'chrome' });
const pages = ['index', 'nota', 'seccion', 'legisladores', 'legislador', 'publicidad'];
const vp = { m: { width: 390, height: 844 }, t: { width: 768, height: 1024 }, d: { width: 1280, height: 900 } };
for (const [k, v] of Object.entries(vp)) {
  const ctx = await b.newContext({ viewport: v, deviceScaleFactor: 1, isMobile: k === 'm' });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
  for (const n of pages) {
    await p.goto(pathToFileURL(path.join(R, n + '.html')).href); await p.waitForTimeout(500);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } scrollTo(0, 0); });
    await p.waitForTimeout(1200);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await p.screenshot({ path: path.join(R, `capturas/${n}-${k}.png`), fullPage: true });
    console.log(k, n, 'overflowX', ov);
  }
  console.log(k, 'errores:', [...new Set(errs)].slice(0, 8));
  await ctx.close();
}
await b.close();
