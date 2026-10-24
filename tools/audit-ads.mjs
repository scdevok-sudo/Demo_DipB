// Audita la regla del cliente: publicidad solo en la franja bajo el header + 1 zona (sidebar desktop / final mobile)
import { chromium } from 'playwright'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const R = path.resolve(import.meta.dirname, '..'); const b = await chromium.launch({ channel: 'chrome' });
for (const [k, v] of [['390', { width: 390, height: 844 }], ['1280', { width: 1280, height: 900 }]]) {
  const p = await (await b.newContext({ viewport: v, isMobile: k === '390' })).newPage();
  for (const n of ['index', 'nota', 'seccion', 'legisladores', 'legislador']) {
    await p.goto(pathToFileURL(path.join(R, n + '.html')).href);
    const r = await p.evaluate(() => {
      const vis = e => e.offsetParent !== null;
      const zones = [...document.querySelectorAll('.adr--sq')].filter(vis), strips = [...document.querySelectorAll('.strip__d,.strip__m')].filter(vis);
      const bad = [...document.querySelectorAll('.blocks .adr,.listing .adr,.art__body .adr,.grid3 .adr,.rail .adr,.blk .adr')].length;
      const h = z => Math.round(z.getBoundingClientRect().height);
      return { zonas: zones.length, franjas: strips.length, dentroDeContenido: bad, altoZona: zones[0] && h(zones[0]) };
    });
    console.log(k, n.padEnd(13), JSON.stringify(r));
  }
}
await b.close();
