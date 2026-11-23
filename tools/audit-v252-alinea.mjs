// v2.5.2 punto 1: alto (top) de cintillo, titulo, autor y foto de cada columna del mismo bloque. Uso: node audit-v252-alinea.mjs [ancho] [query]
import { chromium } from 'playwright';
const w = +(process.argv[2] || 1280), q = process.argv[3] ? '?' + process.argv[3] : '';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
await p.goto((process.env.BASE || 'http://127.0.0.1:8765/') + 'index.html' + q); await p.waitForTimeout(500);
await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; })); await p.waitForTimeout(500);
const res = await p.evaluate(() => {
  const T = (c, s) => { const e = c.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; };
  const L = (c, s) => { const e = c.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.height / parseFloat(getComputedStyle(e).lineHeight)); };
  const grp = (nombre, cards) => ({ nombre, cols: cards.map(c => ({ cintillo: T(c, '.cintillo'), titulo: T(c, 'h2,h3'), lineas: L(c, 'h2,h3'), autor: T(c, '.autor'), foto: T(c, '.thumb') })) });
  const out = [];
  out.push(grp('tapa: 2 notas chicas', [...document.querySelectorAll('.tapa__two .card')]));
  out.push(grp('recomendadas', [...document.querySelectorAll('.recom__grid .card')]));
  const g = [...document.querySelectorAll('.g3 .card')]; out.push(grp('grilla3 fila 1', g.slice(0, 3))); out.push(grp('grilla3 fila 2', g.slice(3, 6)));
  document.querySelectorAll('.ud').forEach((u, i) => { const bg = u.querySelector('.ud__big .card'), ch = u.querySelector('.ud__side .card'); out.push({ nombre: 'uno-dos ' + (i + 1) + ' (arriba de la foto grande vs. cintillo y foto de la chica 1)', cols: [{ cintillo: T(bg, '.thumb'), titulo: null, autor: null, foto: T(bg, '.thumb') }, { cintillo: T(ch, '.cintillo'), titulo: null, autor: null, foto: T(ch, '.thumb') }] }); });
  return out;
});
for (const g of res) { const d = k => { const v = g.cols.map(c => c[k]).filter(x => x != null); return v.length ? Math.max(...v) - Math.min(...v) : '-'; };
  console.log(`${w}px ${g.nombre}: dif. cintillo ${d('cintillo')} | título ${d('titulo')} | autor ${d('autor')} | foto ${d('foto')} | líneas título ${g.cols.map(c => c.lineas).join('/')}`); }
await b.close();
