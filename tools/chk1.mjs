import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [vw, mob] of [[1280,false],[390,true]]) {
  const c = await b.newContext({ viewport: { width: vw, height: 900 }, isMobile: mob, hasTouch: mob });
  const p = await c.newPage(); await p.goto('http://localhost:8765/index.html', { waitUntil: 'load' });
  const r = await p.evaluate(() => {
    const vis = e => e.offsetParent !== null && getComputedStyle(e).display !== 'none';
    const h = [...document.querySelectorAll('.adz--h')];
    return { vw: innerWidth, adbanner: [...document.querySelectorAll('.adbanner')].filter(vis).length,
      adzH: h.length, adzHvis: h.filter(vis).length, slides: h[0]?.querySelectorAll('.adr__slide').length,
      first: h[0]?.querySelector('.adr__slide img')?.getAttribute('src') || h[0]?.querySelector('.adr__slide img')?.dataset.src,
      dots: h[0]?.querySelectorAll('.adr__dot').length, arrows: h[0]?.querySelectorAll('.adr__arrow').length,
      order: [...document.querySelectorAll('main.home > *')].filter(vis).map(e => (e.className||e.tagName).toString().split(' ').slice(0,2).join('.')+'@'+Math.round(e.getBoundingClientRect().top+scrollY)) };
  });
  console.log(JSON.stringify(r));
  await c.close();
}
await b.close();
