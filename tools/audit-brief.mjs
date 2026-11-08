// Auditoría de criterios del brief sobre el HTML generado: cero autor, Opinión, Colegios, Temas frecuentes, Proyectos, Playfair.
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..');
const bad = [/Opini[oó]n/i, /Colegios? Profesionales/i, /Temas frecuentes/i, /Proyectos presentados/i, /Playfair/i, /class="[^"]*\b(autor|author|byline)\b/i, /Basterrechea/, /\bPor <b>/];
const body = /<div class="art__body">[\s\S]*?<\/div>\s*<div class="share"/;   // el cuerpo editorial puede decir "opinión" como palabra común
let n = 0, hits = 0;
for (const f of fs.readdirSync(R).filter(f => f.endsWith('.html'))) {
  const h = fs.readFileSync(path.join(R, f), 'utf8').replace(body, ''); n++;
  // Contenido real de las notas (título, volanta, alt de la foto): no se audita Opinión/Colegios ahí; sí en navegación, home, secciones, perfiles y footer.
  const isNota = /^nota(-\d+)?\.html$/.test(f);
  for (const re of bad) if (!(isNota && /Opini|Colegios/.test(String(re))) && re.test(h)) { hits++; console.log('✗', f, re); }
}
if (/Playfair/i.test(fs.readFileSync(path.join(R, 'assets/css/main.css'), 'utf8'))) { hits++; console.log('✗ css Playfair'); }
console.log(`${n} páginas auditadas · ${hits} hallazgos`);
