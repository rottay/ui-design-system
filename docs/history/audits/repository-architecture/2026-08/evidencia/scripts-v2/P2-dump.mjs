import { readFileSync, writeFileSync } from 'node:fs';
import { classifyCascadeWiring, varCalls } from '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs';
import { collectSkinFiles } from '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/lib/engine/skin-files/index.mjs';

const OUT = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/';
const files = collectSkinFiles();
const r = classifyCascadeWiring(files);
console.log('files', r.files, 'read', r.read, 'roots(fallbackTargets)', r.roots, 'denominator', r.denominator.length, 'wired', r.wired, 'debt', r.debt.length);

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
// per-name: occurrences, whether any occurrence has a fallback at all, engine of occurrence
const occ = new Map(); // name -> {count, withFallback, withoutFallback, engines:Set, files:Set}
for (const f of files) {
  const rel = f.split('packages/core/')[1];
  const m = rel.match(/runtime\/engines\/([^/]+)\//);
  const engine = m ? m[1] : 'presentation';
  const text = strip(readFileSync(f, 'utf8'));
  for (const call of varCalls(text)) {
    if (!call.name.startsWith('--ds-')) continue;
    let e = occ.get(call.name);
    if (!e) { e = { count:0, withFallback:0, withoutFallback:0, engines:new Set(), files:new Set() }; occ.set(call.name, e); }
    e.count++;
    if (call.fallback === null || call.fallback.trim() === '') e.withoutFallback++; else e.withFallback++;
    e.engines.add(engine); e.files.add(rel);
  }
}
const debtSet = new Set(r.debt);
let noFallbackAnywhere = [], someFallback = [];
for (const name of r.debt) {
  const e = occ.get(name);
  if (e.withFallback === 0) noFallbackAnywhere.push(name); else someFallback.push(name);
}
console.log('debt total', r.debt.length, 'sin fallback en ninguna ocurrencia', noFallbackAnywhere.length, 'con fallback en alguna', someFallback.length);

// top fan-out
const top = [...r.debt].sort((a,b)=>occ.get(b).count-occ.get(a).count).slice(0,12);
for (const n of top) console.log('  ', occ.get(n).count, n, 'fallback=', occ.get(n).withFallback>0?'yes':'no', [...occ.get(n).engines].join('/'));

writeFileSync(OUT+'P2-debt.txt', r.debt.join('\n')+'\n');
writeFileSync(OUT+'P2-debt-nofallback.txt', noFallbackAnywhere.join('\n')+'\n');
writeFileSync(OUT+'P2-debt-withfallback.txt', someFallback.join('\n')+'\n');
writeFileSync(OUT+'P2-denominator.txt', r.denominator.join('\n')+'\n');
writeFileSync(OUT+'P2-fallbackTargets.txt', [...r.fallbackTargets].sort().join('\n')+'\n');
writeFileSync(OUT+'P2-read.txt', [...new Set([...occ.keys()])].sort().join('\n')+'\n');
writeFileSync(OUT+'P2-occ.json', JSON.stringify(Object.fromEntries([...occ].map(([k,v])=>[k,{count:v.count,withFallback:v.withFallback,withoutFallback:v.withoutFallback,engines:[...v.engines],files:[...v.files]}])), null, 0));

// engine breakdown of debt
const byEngine = {};
for (const n of r.debt) {
  const key = [...occ.get(n).engines].sort().join('+');
  byEngine[key] = (byEngine[key]||0)+1;
}
console.log('debt por engine-set:', byEngine);
const denByEngine = {};
for (const n of r.denominator) { const key=[...occ.get(n).engines].sort().join('+'); denByEngine[key]=(denByEngine[key]||0)+1; }
console.log('denominador por engine-set:', denByEngine);
