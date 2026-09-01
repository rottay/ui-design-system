import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const SP = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad';
const m = require(SP + '/P5-bundle.cjs');

// leaves(): same walker as Cloud's reaud-A-diff.mjs, but records the value too.
function leaves(v, p, o) {
  if (v === null || typeof v !== 'object') { o.push([p, v]); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => leaves(x, p + '[' + i + ']', o)); return; }
  const ks = Object.keys(v);
  if (ks.length === 0) { o.push([p, '<EMPTY-OBJ>']); return; }   // marker only, reported apart
  for (const k of ks) leaves(v[k], p ? p + '.' + k : k, o);
}
const norm = s => s.replace(/\[\d+\]/g, '[]');

const VERTS = ['bithire', 'evnto', 'rottay'];
const all = new Map();        // normpath -> {defined:Set(vert), undef:Set(vert), empty:Set(vert)}
const perVert = {};
for (const v of VERTS) {
  const o = [];
  leaves(m.FIRST_PARTY_THEMES[v], '', o);
  perVert[v] = { total: 0, defined: 0, undef: 0, nul: 0, empty: 0 };
  for (const [rawp, val] of o) {
    const p = norm(rawp);
    if (val === '<EMPTY-OBJ>') { perVert[v].empty++; continue; } // not counted as leaf by Cloud walker
    perVert[v].total++;
    let e = all.get(p);
    if (!e) { e = { defined: new Set(), undef: new Set() }; all.set(p, e); }
    if (val === undefined) { perVert[v].undef++; e.undef.add(v); }
    else { if (val === null) perVert[v].nul++; perVert[v].defined++; e.defined.add(v); }
  }
}
console.log('--- per vertical (Cloud walker: undefined counts as a leaf) ---');
for (const v of VERTS) console.log(v.padEnd(9), JSON.stringify(perVert[v]));

const META = new Set(['id', 'name', 'extends']);
const union = [...all.keys()].filter(p => !META.has(p.split('.')[0]));
const unionDefined = union.filter(p => all.get(p).defined.size > 0);
const unionNeverDefined = union.filter(p => all.get(p).defined.size === 0);
console.log();
console.log('UNION leaves (sans id/name/extends)        :', union.length);
console.log('  ... defined in >=1 vertical             :', unionDefined.length);
console.log('  ... undefined in ALL 3 verticals        :', unionNeverDefined.length);
const unionWithMeta = [...all.keys()];
console.log('UNION leaves incl. id/name/extends        :', unionWithMeta.length);

fs.writeFileSync(SP + '/P5-union-all.txt', union.sort().join('\n'));
fs.writeFileSync(SP + '/P5-union-defined.txt', unionDefined.sort().join('\n'));
fs.writeFileSync(SP + '/P5-union-neverdefined.txt', unionNeverDefined.sort().join('\n'));
