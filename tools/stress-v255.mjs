// v2.5.5: prueba de estres: pone en cada tarjeta chica del uno-dos cada uno de los titulos de todas las notas y mide lineas y alto de texto contra la foto. Uso: node stress-v255.mjs <fuente px> <interlineado> [ancho]
import { chromium } from 'playwright'; import fs from 'node:fs';
const [fs_, lh, w = 1280] = process.argv.slice(2); const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +w, height: 900 } })).newPage();
await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(500);
if (fs_ !== 'actual') await p.addStyleTag({ content: `.ud__side .card--ud h3{font-size:${fs_}px!important;line-height:${lh}!important}` });
const coleccion = []; const rec = o => { if (Array.isArray(o)) o.forEach(rec); else if (o && typeof o === 'object') { if (typeof o.titulo === 'string') coleccion.push(o.titulo); Object.values(o).forEach(rec); } };
for (const f of ['../data/10_muestra_notas.json', '../data/11_notas_extra.json']) rec(JSON.parse(fs.readFileSync(f, 'utf8')));
const titulos = [...new Set(coleccion)];
const r = await p.evaluate(T => { const out = []; for (const c of document.querySelectorAll('.ud__side .card--ud')) { const h = c.querySelector('h3'), a = h.querySelector('a'), th = c.querySelector('.thumb'), txt = c.querySelector('.card__txt'); const orig = a.textContent;
  for (const t of T) { a.textContent = t; const kids = [...txt.children].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0); const t0 = Math.min(...kids.map(e => e.getBoundingClientRect().top)), t1 = Math.max(...kids.map(e => e.getBoundingClientRect().bottom)); out.push({ t, l: Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)), txt: Math.round(t1 - t0), foto: Math.round(th.getBoundingClientRect().height) }); } a.textContent = orig; } return out; }, titulos);
const max = r.reduce((m, x) => x.txt > m.txt ? x : m, r[0]); const excede = r.filter(x => x.txt > x.foto);
console.log(`${w}px ${fs_}/${lh}: títulos probados ${titulos.length} × 4 tarjetas · líneas máx ${Math.max(...r.map(x => x.l))} · texto máx ${max.txt} px vs foto ${max.foto} px ("${max.t.slice(0, 50)}…") · casos con texto > foto: ${excede.length}`);
await b.close();
