// Lista recursos con status >= 400 por página. Uso: node find404.mjs (servidor en :8765)
import { chromium } from 'playwright'; import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..');
const pages = fs.readdirSync(R).filter(f => f.endsWith('.html'));
const b = await chromium.launch({ channel: 'chrome' });
const found = {};
for (const w of [390, 1280]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const p = await ctx.newPage();
  p.on('response', r => { if (r.status() >= 400) { const k = r.status() + ' ' + r.url() + ' <- ' + p.url(); found[k] = 1; } });
  for (const f of pages) { await p.goto('http://localhost:8765/' + f, { waitUntil: 'load' }); await p.waitForTimeout(400); }
  await ctx.close();
}
console.log(Object.keys(found).join('\n') || 'sin errores'); await b.close();
