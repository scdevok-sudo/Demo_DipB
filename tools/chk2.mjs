import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
for (const pg of ['nota-413361','seccion','legislador-agustina-roldan']) {
  const p = await c.newPage(); await p.goto(`http://localhost:8765/${pg}.html`, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const q = [...document.querySelectorAll('.adbox, .adz')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return `${e.className.split(' ').slice(0,2).join('.')} ${Math.round(r.width)}x${Math.round(r.height)} pos=${getComputedStyle(e.closest('.aside__sticky,.prof-side,.sec-side .adbox') || e).position}`; });
    const tags = [...document.querySelectorAll('.aside .sectag')].map(e => Math.round(e.getBoundingClientRect().height));
    const hs = [...document.querySelectorAll('.aside .card--sm h3')].map(e => Math.round(e.getBoundingClientRect().height/ (parseFloat(getComputedStyle(e).lineHeight))));
    const art = document.querySelector('.art')?.getBoundingClientRect().width;
    return { ads: q, sectagH: tags, titleLines: hs, artW: art, imgOK: [...document.querySelectorAll('.adbox img')].map(i => i.complete && i.naturalWidth > 0) };
  });
  console.log(pg, JSON.stringify(r));
  await p.close();
}
await b.close();
