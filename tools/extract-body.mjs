import fs from 'node:fs'; import sharp from 'sharp';
const h = fs.readFileSync(new URL('./nota.html', import.meta.url), 'utf8');
const start = h.indexOf('<p class="wp-block-paragraph">');
const seg = h.slice(start - 4000 > 0 ? start - 4000 : 0);
const re = /<p class="wp-block-paragraph">[\s\S]*?<\/p>|<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>|<figure class="wp-block-image[\s\S]*?<\/figure>/g;
let out = [], m, imgs = [];
const clean = s => s.replace(/ (target|rel|data-[a-z-]+|class|style|id|decoding|loading|srcset|sizes)="[^"]*"/g, '').replace(/<a href="https?:\/\/diputadosbsas\.com\.ar\/?"/g, '<a href="#"');
const headingsSeen = [];
while ((m = re.exec(seg))) {
  const t = m[0];
  if (t.startsWith('<figure')) {
    const u = (t.match(/data-src="([^"]+)"/) || t.match(/src="(https?[^"]+)"/))[1];
    imgs.push(u); out.push(`<!--IMG${imgs.length - 1}-->`);
  } else if (/^<h/.test(t) && /Notas relacionadas|Leé también|Compart|^Destacadas|DEJA UNA/i.test(t.replace(/<[^>]+>/g, "").trim())) break;
  else out.push(clean(t));
}
const imgOut = [];
for (let i = 0; i < imgs.length; i++) {
  const buf = Buffer.from(await (await fetch(imgs[i].replace(/^http:/, 'https:'))).arrayBuffer());
  await sharp(buf).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 78 }).toFile(new URL(`../assets/img/notas/412179-body${i}.webp`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  imgOut.push(`assets/img/notas/412179-body${i}.webp`);
}
fs.writeFileSync(new URL('../data/nota-412179-cuerpo.json', import.meta.url), JSON.stringify({ html: out.join('\n'), imgs: imgOut }, null, 1));
console.log(out.length, 'bloques;', imgs.length, 'imgs');
console.log(out.map(s => s.replace(/<[^>]+>/g, '').slice(0, 70)).join('\n'));
