// Auditoría v2.2 a 390 px. Uso: node audit-v22.mjs [list]  (list = solo bajadas que terminan en puntos suspensivos)
import { chromium } from 'playwright'; import path from 'node:path';
const OUT = path.resolve(import.meta.dirname, '..', 'capturas'); const B = 'http://localhost:8765/';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const open = async (u) => {
  await p.goto(B + u); await p.waitForTimeout(700);
  await p.evaluate(async () => { document.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; }); document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await new Promise(r => setTimeout(r, 1000)); });
  await p.waitForTimeout(1200);
};
const ELL = /(…|\.\.\.|&hellip;)\s*$/;
const ell = [];
for (const u of ['index.html', 'seccion.html']) {
  await open(u);
  if (u === 'seccion.html') await p.evaluate(() => { const t = document.querySelector('#sec-tpl'); if (t) document.querySelector('#sflow').append(...t.content.children); });
  const r = await p.evaluate(src => { const re = new RegExp(src); return [...document.querySelectorAll('.dek')].filter(d => d.offsetParent && re.test(d.textContent.trim())).map(d => ({ t: d.textContent.trim().slice(-70), h: d.closest('article')?.querySelector('h2 a,h3 a')?.getAttribute('href') })); }, ELL.source);
  r.forEach(x => ell.push({ page: u, ...x }));
}
console.log('BAJADAS CON PUNTOS SUSPENSIVOS:', JSON.stringify(ell, null, 1));
if (process.argv[2] === 'list') { await b.close(); process.exit(); }
const res = {};
await open('index.html');
const shot = async (sel, name, idx = 0) => { const l = p.locator(sel).nth(idx); await l.scrollIntoViewIfNeeded(); await l.screenshot({ path: path.join(OUT, name) }); };
res.cards = await p.evaluate(() => {
  const cards = [...document.querySelectorAll('.card--lead,.card--med,.card--tf')].filter(c => c.offsetParent);
  const bad = [], kickBad = [], tit = [];
  for (const c of cards) {
    const t = c.querySelector('h1,h2,h3'), f = c.querySelector('.thumb'), k = c.querySelector('.kicker,.dateline');
    if (t && f && !(t.getBoundingClientRect().bottom <= f.getBoundingClientRect().top + 1)) bad.push(t.textContent.slice(0, 40));
    if (k && t && getComputedStyle(k).display !== 'none' && !(k.getBoundingClientRect().bottom <= t.getBoundingClientRect().top + 1)) kickBad.push(t.textContent.slice(0, 40));
    if (t) tit.push(parseFloat(getComputedStyle(t).fontSize) + '/' + getComputedStyle(t).fontWeight);
  }
  const k = document.querySelector('.f2 .kicker'), t = document.querySelector('.f2 h3');
  const lead = document.querySelector('.tapa .card--lead');
  const vis = [...document.querySelectorAll('.card,.srow')].filter(e => e.offsetParent);
  return {
    n: cards.length, titleBelowPhoto: bad, kickerBelowTitle: kickBad, tit: [...new Set(tit)],
    kSize: k && getComputedStyle(k).fontSize, kColor: k && getComputedStyle(k).color, kFont: k && getComputedStyle(k).fontFamily.slice(0, 20), kW: k && getComputedStyle(k).fontWeight,
    tSize: t && getComputedStyle(t).fontSize, tColor: t && getComputedStyle(t).color,
    leadDek: !!(lead && [...lead.querySelectorAll('.dek,.vermas')].some(e => e.offsetParent)),
    dekClamped: [...document.querySelectorAll('.card .dek')].filter(d => d.offsetParent && d.scrollHeight > d.clientHeight + 2).length,
    deks: [...document.querySelectorAll('.card .dek')].filter(d => d.offsetParent).length,
    relTimes: [...document.querySelectorAll('.card .meta,.srow .meta')].filter(m => m.offsetParent).length,
    relText: /Hace \d|Ayer/.test(vis.map(e => e.innerText).join(' ')),
    credit: vis.filter(c => c.querySelector('.thumb')).length + '/' + vis.filter(c => c.querySelector('.cap__credit,.srow__cred') && c.querySelector('.cap__credit,.srow__cred').offsetParent).length,
  };
});
await p.evaluate(() => scrollTo(0, 0));
await shot('.tapa__lead', 'aud-01-02-09-nota1-tapa.png');
await shot('.tapa__two > div', 'aud-01-07-tapa-nota2-bajada-entera.png');
await shot('.f1 > *', 'aud-01-07-formato1-tarjeta.png');
await shot('.f2 > *', 'aud-02-tipografia-formato2.png', 1);
res.sec = await p.evaluate(() => {
  const m = document.querySelector('.strip__more'), cs = getComputedStyle(m), q = document.querySelectorAll('.strip__col'), ps = getComputedStyle(q[1], '::before');
  return { titles: [...document.querySelectorAll('.strip .sec-title')].map(x => parseFloat(getComputedStyle(x).fontSize)), more: { h: Math.round(m.getBoundingClientRect().height), w: Math.round(m.getBoundingClientRect().width), colW: Math.round(m.parentElement.getBoundingClientRect().width), border: cs.borderTopWidth + ' ' + cs.borderTopColor, radius: cs.borderRadius, arrow: getComputedStyle(m, '::after').content }, dividerH: ps.height, dividerBorders: ps.borderTopWidth + '/' + ps.borderBottomWidth, firstDivider: getComputedStyle(q[0], '::before').content, cols: q.length };
});
await shot('.stripband', 'aud-03-04-05-franja-secciones.png');
res.ad = await p.evaluate(() => { const z = document.querySelector('.adz'); const vis = e => !!(e && e.offsetParent); return { head: vis(z.querySelector('.adz__head')), label: vis(document.querySelector('.adbanner__label')), h: Math.round(z.getBoundingClientRect().height), bannerH: Math.round(document.querySelector('.adbanner').getBoundingClientRect().height), text: z.innerText.trim().slice(0, 40) }; });
await shot('.adz', 'aud-06-anunciantes.png'); await shot('.adband', 'aud-06-banner-flujo.png');
res.leg = await p.evaluate(() => [...document.querySelectorAll('.legband--a')].map(s => ({ t: s.querySelector('h2').textContent, count: s.querySelector('.lcar__count').textContent, href: s.querySelector('.legband__head a').getAttribute('href'), items: s.querySelectorAll('.lcar__item:not([aria-hidden])').length })));
await p.locator('.legband--a').first().scrollIntoViewIfNeeded();
const bx = await p.evaluate(() => { const a = document.querySelectorAll('.legband--a'); const r1 = a[0].getBoundingClientRect(), r2 = a[a.length - 1].getBoundingClientRect(); return { y: r1.top + scrollY, h: r2.bottom - r1.top }; });
await p.screenshot({ path: path.join(OUT, 'aud-08-modulos.png'), fullPage: true, clip: { x: 0, y: bx.y, width: 390, height: bx.h } });
await p.evaluate(() => scrollTo(0, 1200)); await p.waitForTimeout(500);
res.dock = await p.evaluate(() => { const d = document.querySelector('.dock'), r = d.getBoundingClientRect(), tt = document.querySelector('.totop').getBoundingClientRect(); return { pos: getComputedStyle(d).position, bottom: Math.round(innerHeight - r.bottom), h: Math.round(r.height), btns: [...d.querySelectorAll('.dock__b')].map(x => x.innerText.trim() + ':' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height)), totopAbove: tt.bottom <= r.top, burgerHdr: !!document.querySelector('.hdr__tools .burger')?.offsetParent, extra: d.children.length }; });
await p.screenshot({ path: path.join(OUT, 'aud-10-zocalo.png') });
await open('seccion.html');
res.secPage = await p.evaluate(() => {
  const s = document.querySelector('.srow'), k = (s.querySelector('.kicker') || s.querySelector('h3')).getBoundingClientRect(), t = s.querySelector('h3').getBoundingClientRect(), d = s.querySelector('.dek').getBoundingClientRect(), f = s.querySelector('.thumb').getBoundingClientRect();
  return { kicker: !!s.querySelector('.kicker'), meta: [...document.querySelectorAll('.card .meta,.srow .meta')].filter(m => m.offsetParent).length, order: (!s.querySelector('.kicker') || k.bottom <= t.top + 1) && t.bottom <= d.top + 1 && d.bottom <= f.top + 1 };
});
await shot('.srow', 'aud-11-seccion-fila.png');
console.log(JSON.stringify(res, null, 1)); await b.close();
