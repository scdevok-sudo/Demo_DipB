// v2.5.1 punto 4: espacios de la tapa. Uso: node audit-v251-aire.mjs [query]   (servidor en :8765)
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const q = process.argv[2] ? '?' + process.argv[2] : '';
const b = await chromium.launch();
const R = e => e.getBoundingClientRect();
for (const [w, h, mob] of [[390, 844, true], [1280, 800, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage(); await p.goto(BASE + 'index.html' + q); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const rc = e => e.getBoundingClientRect(), $ = s => document.querySelector(s);
    const band = $('.band--tapa'), lead = $('.tapa__lead'), fig = lead.querySelector('.fig'), txt = lead.querySelector('.card__txt');
    const kick = lead.querySelector('.cintillo'), h2 = lead.querySelector('h2'), thumb = lead.querySelector('.thumb');
    const cand = [...document.querySelectorAll('header,.topstrip,.nav,.lasthour,.fr__ses,.fr__poll,main.home>*')].filter(e => e !== band && !band.contains(e) && rc(e).height > 0 && getComputedStyle(e).display !== 'none' && rc(e).bottom <= rc(kick).top + 1); const pv = cand.map(e => [e, rc(e)]).sort((a, b) => b[1].bottom - a[1].bottom)[0];
    const hdr = $('.header,header'); const wrap = $('.band--tapa .wrap,.band--tapa>div') || band;
    const o = { vw: innerWidth };
    o.bandPadTop = Math.round(parseFloat(getComputedStyle(band).paddingTop)); o.bandPadBottom = Math.round(parseFloat(getComputedStyle(band).paddingBottom));
    o.bandTopMenosPrevio = pv ? Math.round(rc(band).top - pv[1].bottom) : null;
    o.leadPadBottom = Math.round(parseFloat(getComputedStyle(lead).paddingBottom));
    o.cintilloArriba = Math.round(rc(kick).top - (pv ? pv[1].bottom : rc(band).top));
    o.cintilloATitulo = Math.round(rc(h2).top - rc(kick).bottom);
    o.tituloAFoto = Math.round(rc(thumb).top - rc(h2).bottom);
    o.foto = { x: Math.round(rc(thumb).left), w: Math.round(rc(thumb).width), h: Math.round(rc(thumb).height), derecha: Math.round(innerWidth - rc(thumb).right) };
    o.titulo = { px: getComputedStyle(h2).fontSize, lh: getComputedStyle(h2).lineHeight, peso: getComputedStyle(h2).fontWeight, lineas: Math.round(rc(h2).height / parseFloat(getComputedStyle(h2).lineHeight)) };
    const dek = lead.querySelector('.dek'); o.dek = dek && getComputedStyle(dek).display !== 'none' ? getComputedStyle(dek).fontSize : null;
    const tb = rc(txt), fb = rc(thumb);
    o.textoAireArriba = Math.round(tb.top - fb.top); o.textoAireAbajo = Math.round(fb.bottom - tb.bottom);
    o.anchoFotoPctDelBloque = Math.round(fb.width / rc(lead).width * 100);
    o.bloqueAlto = Math.round(rc(band).height);
    return o;
  });
  console.log(w + ' px', JSON.stringify(r));
  await ctx.close();
}
await b.close();
