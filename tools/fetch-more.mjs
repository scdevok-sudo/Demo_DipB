// Trae notas reales recientes (API pública de WP) para completar las filas de Legislatura.
// Salida: data/11_notas_extra.json + imágenes en assets/img/notas (s=480, m=800, full=1200 solo hero/candidatas).
import fs from 'node:fs'; import path from 'node:path'; import sharp from 'sharp';
const root = path.resolve(import.meta.dirname, '..');
const B = 'https://diputadosbsas.com.ar/wp-json/wp/v2/posts?_embed=wp:featuredmedia,wp:term&_fields=id,date,title,excerpt,link,content,_links,_embedded';
const strip = s => s.replace(/<[^>]+>/g, '').replace(/&hellip;|\[…\]|\[&hellip;\]/g, '…').replace(/&#8217;/g, '’').replace(/&#8220;|&#8221;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)).trim();
const get = async u => { const r = await fetch(u); if (!r.ok) throw new Error(u + ' ' + r.status); return r; };
const conv = async post => {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const terms = (post._embedded?.['wp:term'] || []).flat();
  const cats = terms.filter(t => t.taxonomy === 'category').map(t => t.name), tags = terms.filter(t => t.taxonomy === 'post_tag').map(t => t.name);
  const sz = media?.media_details?.sizes || {};
  return { id: post.id, fecha: post.date.replace('T', ' '), titulo: strip(post.title.rendered), extracto: strip(post.excerpt.rendered).slice(0, 260), categorias: cats, tags, imagen: media?.source_url || '', imagen_media: (sz.medium_large || sz.large || {}).source_url || media?.source_url || '', url: post.link, palabras: strip(post.content.rendered).split(/\s+/).length, _html: post.content.rendered };
};
const pull = async q => (await (await get(`${B}&${q}`)).json());
const list = new Map();
for (const q of ['categories=16383&per_page=40', 'per_page=30']) for (const p of await pull(q)) list.set(p.id, p);
const notas = [];
for (const p of list.values()) notas.push(await conv(p));
const dims = JSON.parse(fs.readFileSync(path.join(root, 'data/dims.json'), 'utf8'));
const out = path.join(root, 'assets/img/notas');
let n = 0;
for (const x of notas) {
  if (!x.imagen) continue;
  try {
    const buf = Buffer.from(await (await get(x.imagen.replace(/^http:/, 'https:'))).arrayBuffer());
    for (const [k, w] of [['s', 480], ['m', 800], ['full', 1200]]) {
      const f = path.join(out, `${x.id}-${k}.webp`);
      const info = await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: k === 'full' ? 78 : 72 }).toFile(f);
      dims[`assets/img/notas/${x.id}-${k}.webp`] = [info.width, info.height];
    }
    n++;
  } catch (e) { console.log('sin imagen', x.id, e.message); x.imagen = ''; }
}
fs.writeFileSync(path.join(root, 'data/dims.json'), JSON.stringify(dims));
// cuerpos para las notas de demostración: se eligen en build.mjs; se guardan todos los html
fs.writeFileSync(path.join(root, 'data/11_notas_extra.json'), JSON.stringify(notas));
console.log('notas', notas.length, 'con imagen', n);
