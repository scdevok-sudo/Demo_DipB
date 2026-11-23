// v2.5.1: controles de siempre en 360, 390, 412, 1280 y 1440 (servidor en :8765).
// Uso: node audit-v251.mjs [query]   → overflow horizontal, pies de foto y rotulos, zonas tocables < 44 px (mobile), aire entre bloques (mobile), AA del texto del home
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const q = process.argv[2] ? '?' + process.argv[2] : '';
const b = await chromium.launch();
for (const w of [360, 390, 412, 1280, 1440]) {
  const mob = w < 768; const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage(); await p.goto(BASE + 'index.html' + q); await p.waitForTimeout(500);
  await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await new Promise(r => setTimeout(r, 600)); });
  const r = await p.evaluate(mob => {
    const rc = e => e.getBoundingClientRect(), vis = e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed';
    const o = {};
    o.overflowX = document.documentElement.scrollWidth - innerWidth;
    o.figcaption = document.querySelectorAll('figcaption').length; o.caps = [...document.querySelectorAll('.cap')].filter(vis).length;
    o.rotulos = /LA PLATA|PUBLICIDAD|Anunciantes/.test(document.querySelector('main').innerText) ? 'HAY' : 'no';
    // zonas tocables (mobile): botones e iconos propios de la interfaz, area efectiva = rect del elemento o de su ::after
    if (mob) o.chicos = [...document.querySelectorAll('main button, .dock a, .dock button, .hdr button, .hdr .ibtn, .lcar button, .scar__dot, .scar__arrow')].filter(vis).map(e => { const r = rc(e); return { c: (e.className || e.tagName).toString().slice(0, 28), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(x => x.w < 44 || x.h < 44).filter(x => x.w * x.h > 0);
    // aire entre bloques (contenido a contenido)
    const bl = [...document.querySelectorAll('main.home>section,main.home>div,main.home>hr')].filter(e => vis(e) && rc(e).height > 0).map(e => { const r = rc(e), cs = getComputedStyle(e); return { n: (e.className || e.tagName).toString().split(' ').slice(-1)[0], t: r.top + scrollY + parseFloat(cs.paddingTop), b: r.bottom + scrollY - parseFloat(cs.paddingBottom), cs, mt: parseFloat(cs.marginTop), mb: parseFloat(cs.marginBottom) }; }).sort((a, c) => a.t - c.t);
    o.aire = bl.slice(1).map((x, i) => ({ de: bl[i].n, a: x.n, gap: Math.round(x.t - bl[i].b) })).filter(g => g.gap > 24.5);
    // contraste AA del texto visible del home
    const lum = c => { const a = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
    const parse = s => { const q = s.match(/color\(srgb ([^)]+)\)/); if (q) { const v = q[1].split(/[ \/]+/).map(Number); return { c: v.slice(0, 3).map(x => x * 255), a: v[3] ?? 1 }; } const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,\/]+/).map(Number); return { c: v.slice(0, 3), a: v[3] ?? 1 }; };
    const bgOf = e => { const L = []; for (let n = e; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { L.push(c); if (c.a >= 1) break; } } let out = [255, 255, 255]; for (const l of L.reverse()) out = out.map((v, i) => v * (1 - l.a) + l.c[i] * l.a); return out; };
    const bad = []; let min = 99, n = 0;
    const walker = document.createTreeWalker(document.querySelector('main.home'), NodeFilter.SHOW_TEXT);
    for (let t; (t = walker.nextNode());) { if (!t.textContent.trim()) continue; const e = t.parentElement; if (!vis(e) || e.closest('.demo,.fig,.thumb,.adz,.fr')) continue; const cs = getComputedStyle(e); const f = parse(cs.color); if (!f || +cs.opacity < 1) continue; const bg = bgOf(e);
      const fg = f.a < 1 ? f.c.map((v, i) => v * f.a + bg[i] * (1 - f.a)) : f.c; const a = lum(fg), c = lum(bg), ratio = (Math.max(a, c) + .05) / (Math.min(a, c) + .05); n++; min = Math.min(min, ratio);
      const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700); if (ratio < (big ? 3 : 4.5)) bad.push((e.className || e.tagName).toString().slice(0, 24) + ' ' + cs.fontSize + ' ' + ratio.toFixed(2)); }
    o.aa = { textos: n, minimo: +min.toFixed(2), fallan: [...new Set(bad)] };
    return o;
  }, mob);
  console.log(`${w}px ${q || '(default)'}: overflowX=${r.overflowX} figcaption=${r.figcaption} caps=${r.caps} rotulos=${r.rotulos} | AA mínimo ${r.aa.minimo}:1 (${r.aa.textos} textos, fallan: ${r.aa.fallan.join('; ') || 'ninguno'})` + (mob ? ` | tocables <44: ${JSON.stringify(r.chicos)} | aire>24: ${JSON.stringify(r.aire)}` : ` | aire entre bloques >24 (desktop, informativo): ${r.aire.length}`));
  await ctx.close();
}
await b.close();
