// v2.4: comprobaciones de la auditoria sobre el DOM renderizado. Uso: BASE=http://127.0.0.1:8765/ node audit-v24.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
const B = process.env.BASE || 'http://127.0.0.1:8765/';
const b = await chromium.launch(); const out = {};
const pages = ['index', 'seccion', 'nota-413361', 'diputados', 'senadores', 'legislador'];
for (const w of [360, 390, 412, 1280, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 768 }); const o = out[w] = { hx: {} };
  for (const pg of pages) { const p = await ctx.newPage(); await p.goto(B + pg + '.html'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
    o.hx[pg] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (pg === 'index') o.idx = await p.evaluate(() => {
      const lines = h => Math.round(h.scrollHeight / parseFloat(getComputedStyle(h).lineHeight));
      const lead = document.querySelector('.card--lead h1,.card--lead h2'), cs = e => e ? getComputedStyle(e) : new Proxy({}, { get: () => '-' });
      const f2 = [...document.querySelectorAll('.f2 .card--med')].filter(c => c.offsetParent);
      const f2t = f2.map(c => c.querySelector('h3')), th = f2[0].querySelector('.thumb').getBoundingClientRect(), fw = f2[0].getBoundingClientRect().width;
      const tg = [...document.querySelectorAll('.sectag--t')].filter(e => e.offsetParent && !e.closest('.super,.art__meta'))[0], ft = document.querySelector('.fig>.sectag');
      const hd = document.querySelector('.hdr__main');
      return { peso: cs(lead).fontWeight, tapaPx: cs(lead).fontSize, tapaLh: (parseFloat(cs(lead).lineHeight) / parseFloat(cs(lead).fontSize)).toFixed(2), tapaLin: lines(lead), tapaTxt: lead.textContent.trim().slice(0, 20),
        f1px: cs(document.querySelector('.f1 h3')).fontSize, f1lin: [...document.querySelectorAll('.f1 h3')].filter(e => e.offsetParent).map(lines).join(''),
        f2px: cs(f2t[0]).fontSize, f2lin: f2t.map(lines).join(''), f2foto: Math.round(th.width) + 'x' + Math.round(th.height), f2pct: Math.round(th.width / fw * 100), f2dek: f2.some(c => c.querySelector('.dek') && c.querySelector('.dek').offsetParent),
        etqTxt: [cs(tg).fontSize, cs(tg).fontWeight, cs(tg).backgroundColor, cs(tg).color, cs(tg).padding].join(' '), etqFoto: [cs(ft).fontSize, cs(ft).padding].join(' '), header: cs(hd).backgroundColor,
        tapa2cbCards: document.querySelectorAll('.card--tapa2').length };
    });
    await p.close(); }
  await ctx.close();
}
fs.writeFileSync('../capturas/audit-v24.json', JSON.stringify(out, null, 1));
for (const w in out) console.log(w, JSON.stringify(out[w].hx), '\n  ', JSON.stringify(out[w].idx));
await b.close();
