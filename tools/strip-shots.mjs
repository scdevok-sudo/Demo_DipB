// Captura de la franja de secciones sin la cabecera fija ni el botón de volver arriba. Uso: node strip-shots.mjs antes|despues
import { chromium } from 'playwright'; import path from 'node:path';
const tag = process.argv[2] || 'despues';
const OUT = path.resolve(import.meta.dirname, '..', 'capturas');
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [1280, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(600);
  await p.addStyleTag({ content: '.hdr,.totop,.demo{display:none!important}' });
  await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await new Promise(r => setTimeout(r, 1200)); });
  await p.waitForTimeout(1200);
  await p.locator('.stripband').screenshot({ path: path.join(OUT, `franja-d${w}-${tag}.png`) });
}
await b.close();
