// Busca en el HTML generado y en assets/ cualquier nombre de data/autores.json y cualquier markup .autor. Uso: node tools/check-autores.mjs (desde la raiz)
import fs from 'node:fs';
const A = [...new Set(Object.values(JSON.parse(fs.readFileSync('data/autores.json', 'utf8'))))];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
const files = [...fs.readdirSync('.').filter(f => f.endsWith('.html')), ...walk('assets').filter(f => /\.(css|js|svg|json|txt)$/.test(f)), 'robots.txt'];
let hits = 0;
for (const f of files) { const t = fs.readFileSync(f, 'utf8'); for (const a of A) if (t.includes(a)) { hits++; console.log('HIT', f, a); } if (f.endsWith('.html') && /class="autor/.test(t)) { hits++; console.log('MARKUP .autor en', f); } }
console.log(`archivos revisados ${files.length} · nombres ${A.length} · coincidencias ${hits}`);
process.exit(hits ? 1 : 0);
