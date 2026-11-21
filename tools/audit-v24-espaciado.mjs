// v2.4 etapa B: mide el espacio vertical entre contenidos de tarjetas consecutivas (borde inferior del ultimo elemento visible
// de una tarjeta -> borde superior del primero de la siguiente). Uso: node audit-v24-espaciado.mjs <salida.json> [paginas] [anchos]
import { chromium } from 'playwright';
import fs from 'node:fs';
const R = 'file:///' + import.meta.dirname.split('\\').join('/').replace(/\/tools$/, '') + '/';
const out = process.argv[2] || 'espaciado.json';
const pages = (process.argv[3] || 'index,seccion').split(',');
const widths = (process.argv[4] || '360,390,412').split(',').map(Number);
const b = await chromium.launch(); const res = {};
for (const w of widths) for (const pg of pages) {
  const p = await (await b.newContext({ viewport: { width: w, height: 844 }, isMobile: w < 768 })).newPage();
  await p.goto(R + pg + '.html'); await p.waitForTimeout(1200);
  res[pg + '@' + w] = await p.evaluate(() => {
    const ext = e => { let t = 1e9, bt = -1e9; const all = [e, ...e.querySelectorAll('*')];
      for (const x of all) { if (x.children.length && x.tagName !== 'FIGURE') continue; const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const r = x.getBoundingClientRect(); if (!r.height) continue; t = Math.min(t, r.top + scrollY); bt = Math.max(bt, r.bottom + scrollY); } return [t, bt]; };
    const els = [...document.querySelectorAll('main .card, main .srow')].filter(e => e.offsetParent && !e.parentElement.closest('.card,.srow') && !e.closest('.lcar,.legband,.adz,.srow-ad'));
    const rows = els.map(e => { const [t, bt] = ext(e); return { n: e.className.toString().replace(/\s+/g, '.').replace('card--', '').slice(0, 26), t: Math.round(t), b: Math.round(bt) }; }).sort((a, c) => a.t - c.t);
    const hdr = Math.round(document.querySelector('header').getBoundingClientRect().bottom);
    const gaps = rows.slice(1).map((r, i) => ({ de: rows[i].n, a: r.n, gap: r.t - rows[i].b })).filter(g => g.gap < 160 && g.gap > -5);
    return { header_a_primera: rows[0].t - hdr, gaps };
  });
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
for (const k in res) { const g = res[k].gaps.map(x => x.gap); console.log(k.padEnd(14), 'header→1.ª', res[k].header_a_primera, '| pares', g.length, '| max', Math.max(...g), '| mediana', g.sort((a, c) => a - c)[g.length >> 1], '| >24:', g.filter(x => x > 24).length); }
await b.close();
