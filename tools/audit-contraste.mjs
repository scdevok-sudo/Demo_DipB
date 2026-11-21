// v2.4.1: barrido de contraste AA de los textos visibles (pares color de texto / fondo efectivo). Uso: BASE=http://127.0.0.1:8765/ node audit-contraste.mjs [salida.json]
import { chromium } from 'playwright';
import fs from 'node:fs';
const B = process.env.BASE || 'http://127.0.0.1:8765/';
const pages = ['index', 'index-anterior', 'seccion', 'nota-413361', 'legislador', 'diputados'];
const b = await chromium.launch(); const pairs = new Map();
for (const [w, mob] of [[390, true], [1280, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: mob });
  for (const pg of pages) {
    const p = await ctx.newPage(); await p.goto(B + pg + '.html?demo=0'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const parse = c => { const m = c.match(/[\d.]+/g).map(Number); const k = c.startsWith('color(') ? 255 : 1; return { r: m[0] * k, g: m[1] * k, b: m[2] * k, a: m.length > 3 ? m[3] : 1 }; };
      const over = (f, bg) => ({ r: f.r * f.a + bg.r * (1 - f.a), g: f.g * f.a + bg.g * (1 - f.a), b: f.b * f.a + bg.b * (1 - f.a), a: 1 });
      const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      const bgOf = e => { let layers = []; for (let x = e; x; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c.a > 0) { layers.push(c); if (c.a === 1) break; } } let bg = { r: 255, g: 255, b: 255, a: 1 }; for (const c of layers.reverse()) bg = over(c, bg); return bg; };
      const out = [], seen = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) { if (!n.textContent.trim()) continue; const e = n.parentElement; if (!e || seen.has(e) || !e.offsetParent && getComputedStyle(e).position !== 'fixed') continue; if (e.closest('.demo,.sr,script,style')) continue; seen.add(e);
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue; const bg = bgOf(e); if (!bg) { out.push({ sel: e.tagName.toLowerCase() + '.' + (e.className + '').split(' ')[0], skip: 'sobre imagen/degradado' }); continue; }
        const fg = over(parse(cs.color), bg), L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05), px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, large = px >= 24 || (px >= 18.66 && bold);
        out.push({ sel: e.tagName.toLowerCase() + '.' + (e.className + '').split(' ')[0], fg: [fg.r, fg.g, fg.b].map(Math.round).join(','), bg: [bg.r, bg.g, bg.b].map(Math.round).join(','), ratio, large, px }); }
      return out; });
    for (const o of r) { if (o.skip) continue; const k = `${o.fg}|${o.bg}|${o.large}`; const e = pairs.get(k) || { ...o, n: 0, sels: new Set(), pages: new Set() }; e.n++; e.sels.add(o.sel); e.pages.add(pg + '@' + w); pairs.set(k, e); }
    await p.close();
  }
  await ctx.close();
}
const hex = s => '#' + s.split(',').map(v => (+v).toString(16).padStart(2, '0')).join('');
const rows = [...pairs.values()].map(e => ({ texto: hex(e.fg), fondo: hex(e.bg), ratio: +e.ratio.toFixed(2), grande: e.large, minimo: e.large ? 3 : 4.5, ok: e.ratio >= (e.large ? 3 : 4.5), usos: e.n, ejemplos: [...e.sels].slice(0, 4).join(' · ') })).sort((a, c) => a.ratio - c.ratio);
fs.writeFileSync(process.argv[2] || '../capturas/contraste-v241.json', JSON.stringify(rows, null, 1));
for (const r of rows) console.log((r.ok ? 'ok  ' : 'FALLA'), String(r.ratio).padEnd(6), r.texto, 'sobre', r.fondo, r.grande ? '(grande)' : '', 'x' + r.usos, r.ejemplos);
await b.close();
