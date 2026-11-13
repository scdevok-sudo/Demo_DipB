// Limpia extractos que terminan en puntos suspensivos: corta en la ultima oracion completa (o cierra con punto).
// Reemplazo a nivel de texto para no reformatear los JSON.
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..');
const ELL = /\s*(&hellip;|\u2026|\.\.\.)\s*$/;
const fix = t => { const body = t.replace(ELL, ''); const i = body.lastIndexOf('. '); return i > 40 ? body.slice(0, i + 1) : body.replace(/[\s,;:]+$/, '') + '.'; };
const log = [];
for (const f of ['data/10_muestra_notas.json', 'data/11_notas_extra.json']) {
  const fp = path.join(R, f); const raw = fs.readFileSync(fp, 'utf8');
  const out = raw.replace(/("extracto"\s*:\s*)("(?:[^"\\]|\\.)*")/g, (m, k, lit) => {
    const v = JSON.parse(lit); if (!ELL.test(v)) return m;
    const nv = fix(v); log.push(`...${v.slice(-45)}  ->  ...${nv.slice(-45)}`); return k + JSON.stringify(nv);
  });
  JSON.parse(out); fs.writeFileSync(fp, out);
}
console.log(log.join('\n') || 'nada que limpiar');
