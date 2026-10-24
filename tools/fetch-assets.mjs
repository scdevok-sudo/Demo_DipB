// Descarga y optimiza las imágenes que usa la maqueta (sin hotlinking al bucket).
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import sharp from 'sharp';
const root = path.resolve(import.meta.dirname, '..');
const j = JSON.parse(fs.readFileSync(path.join(root, 'data/10_muestra_notas.json'), 'utf8'));
const h = u => crypto.createHash('md5').update(u).digest('hex').slice(0, 10);
const get = async u => { const r = await fetch(u.replace(/^http:/, 'https:')); if (!r.ok) throw new Error(r.status); return Buffer.from(await r.arrayBuffer()); };
const dims = {};

// Notas
const notas = new Map();
[...j.ultimas, ...Object.values(j.por_categoria).flatMap(c => c.notas)].forEach(n => notas.set(n.id, n));
const jobs = [];
for (const n of notas.values()) {
  for (const [k, w] of [['imagen_media', 800], ['imagen', 1200]]) {
    if (k === 'imagen' && ![412179, 412148].includes(n.id)) continue; // full solo para la nota interna y hero
    const u = n[k] || n.imagen; if (!u) continue;
    jobs.push({ u, out: `assets/img/notas/${n.id}-${k === 'imagen' ? 'full' : 'm'}.webp`, w });
    if (k === 'imagen_media') jobs.push({ u, out: `assets/img/notas/${n.id}-s.webp`, w: 480 });
  }
}
// Banners
const ban = fs.readFileSync(path.join(root, 'data/06_home_estructura.txt'), 'utf8').split('== Banners')[1].split('\n').slice(1);
const banners = [];
for (const l of ban) {
  const m = l.match(/^(\d+) \| "?([^|"]*)"? \| (\S+)/); if (!m) continue;
  banners.push({ id: m[1], dest: m[2].trim().replace(/&amp;/g, '&'), src: m[3] });
}
for (const b of banners) jobs.push({ u: b.src, out: `assets/img/ads/${b.id}`, w: 1180, ad: true, b });
jobs.push({ u: 'https://dptdsbsas.nyc3.digitaloceanspaces.com/wp-content/uploads/2021/07/15163212/logo-dark-retina.png', out: 'assets/img/logo-dark.png', raw: true });
jobs.push({ u: 'https://diputadosbsas.com.ar/wp-content/uploads/2021/07/logo-light.png', out: 'assets/img/logo-light.png', raw: true });

const run = async job => {
  try {
    const buf = await get(job.u); const f = path.join(root, job.out);
    if (job.raw) { fs.writeFileSync(f, buf); return; }
    if (job.ad) {
      const ext = path.extname(new URL(job.u).pathname).toLowerCase();
      const gif = ext === '.gif'; const out = f + (gif ? '.gif' : '.webp');
      const meta = await sharp(buf).metadata();
      const w = meta.width, hgt = meta.pageHeight || meta.height;
      if (gif) fs.writeFileSync(out, buf); else await sharp(buf).resize({ width: Math.min(w, w / hgt > 5 ? 1180 : 600) }).webp({ quality: 82 }).toFile(out);
      job.b.file = path.relative(root, out).split(path.sep).join('/'); job.b.w = w; job.b.h = hgt; return;
    }
    const info = await sharp(buf).resize({ width: job.w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(f);
    dims[job.out] = [info.width, info.height];
  } catch (e) { console.log('FALLO', job.u, e.message); job.failed = true; }
};
const q = [...jobs]; await Promise.all(Array.from({ length: 8 }, async () => { while (q.length) await run(q.shift()); }));
fs.writeFileSync(path.join(root, 'data/banners.json'), JSON.stringify(banners.filter(b => b.file), null, 1));
fs.writeFileSync(path.join(root, 'data/dims.json'), JSON.stringify(dims));
console.log('ok', jobs.length, 'jobs;', banners.filter(b => b.file).length, 'banners;', jobs.filter(j => j.failed).length, 'fallos');
