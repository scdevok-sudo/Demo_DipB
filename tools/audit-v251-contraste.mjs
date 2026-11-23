// v2.5.1 punto 5: contraste AA del texto de las recomendadas (y del modulo con la pastilla) sobre candidatos de fondo. Uso: node audit-v251-contraste.mjs [#fondo,#fondo...]
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const bgs = (process.argv[2] || '').split(',').filter(Boolean);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
for (const bg of bgs.length ? bgs : ['']) {
  for (const [page, scope] of [['index.html', '.recomband'], ['index.html', '.legband'], ['index.html', '.recomband@390']]) {
    const mob = scope.endsWith('@390'); const sc = scope.replace('@390', '');
    await p.setViewportSize({ width: mob ? 390 : 1280, height: 800 }); await p.goto(BASE + page); await p.waitForTimeout(400);
    if (bg && sc === '.recomband') await p.addStyleTag({ content: `:root{--recomendadas-bg:${bg}!important}` });
    const res = await p.evaluate(sc => {
      const lum = c => { const a = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
      const parse = s => { const q = s.match(/color\(srgb ([^)]+)\)/); if (q) { const v = q[1].split(/[ \/]+/).map(Number); return { c: v.slice(0, 3).map(x => x * 255), a: v[3] ?? 1 }; } const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,\/]+/).map(Number); return { c: v.slice(0, 3), a: v[3] ?? 1 }; };
      const bgOf = e => { let layers = []; for (let n = e; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } } let out = [255, 255, 255]; for (const l of layers.reverse()) out = out.map((o, i) => o * (1 - l.a) + l.c[i] * l.a); return out; };
      const ratio = (f, g) => { const a = lum(f), b = lum(g); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
      const root = document.querySelector(sc); const out = []; const seen = new Set();
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) { if (!n.textContent.trim()) continue; const e = n.parentElement; if (!e.offsetParent || seen.has(e)) continue; seen.add(e);
        const cs = getComputedStyle(e); const fg = parse(cs.color); if (!fg) continue; const bgc = bgOf(e);
        const fgc = fg.a < 1 ? fg.c.map((v, i) => v * fg.a + bgc[i] * (1 - fg.a)) : fg.c; out.push({ cls: (e.className || e.tagName).toString().split(' ')[0], fs: cs.fontSize, fw: cs.fontWeight, r: +ratio(fgc, bgc).toFixed(2), onPhoto: !!e.closest('.fig') }); }
      const agg = {}; out.forEach(o => { const k = o.cls + ' ' + o.fs + '/' + o.fw; if (!agg[k] || o.r < agg[k].r) agg[k] = o; });
      return { bg: getComputedStyle(root).backgroundColor, items: Object.entries(agg).map(([k, o]) => k + ' = ' + o.r + ':1' + (o.onPhoto ? ' (sobre la foto)' : '')) };
    }, sc);
    console.log(`[${bg || 'actual'}] ${scope}  fondo ${res.bg}\n  ` + res.items.join('\n  '));
  }
}
await b.close();
