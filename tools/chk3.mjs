import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const h of [900, 1080]) {
  const c = await b.newContext({ viewport: { width: 1280, height: h } });
  const p = await c.newPage(); await p.goto('http://localhost:8765/nota-413361.html', { waitUntil: 'load' });
  for (const y of [0, 1800, 3000]) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const a = document.querySelector('.adbox--side').getBoundingClientRect(), l = document.querySelector('.aside section')?.getBoundingClientRect(); return { adTop: Math.round(a.top), adBottom: Math.round(a.bottom), leeTop: Math.round(l.top), leeBottom: Math.round(l.bottom), vh: innerHeight }; });
    console.log(h, y, JSON.stringify(r)); }
  await c.close();
}
await b.close();
