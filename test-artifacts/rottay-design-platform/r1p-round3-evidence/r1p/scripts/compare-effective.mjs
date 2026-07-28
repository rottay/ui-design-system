/** Pixel-preservation acid test: effective root map, before vs after, per state. */
import { readFileSync } from 'node:fs';
import { effectiveMap } from './effective-map.mjs';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const ROOT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const before = JSON.parse(readFileSync(`${ROOT}/r1p/effective-before.json`, 'utf-8'));
const norm = (v) => (v == null ? null : v.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim().toLowerCase());

for (const slug of ['bithire', 'evnto', 'rottay']) {
  const css = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`, 'utf-8');
  for (const state of ['default', 'light', 'dark']) {
    const after = Object.fromEntries([...effectiveMap(css, state, slug)].map(([k, v]) => [k, v.value]));
    const b = before[slug][state];
    const added = Object.keys(after).filter((k) => !(k in b));
    const dropped = Object.keys(b).filter((k) => !(k in after));
    const changed = Object.keys(b).filter((k) => k in after && norm(b[k]) !== norm(after[k]));
    const flag = added.length || dropped.length || changed.length ? '' : '  (identical)';
    console.log(`${slug} ${state}: +${added.length} -${dropped.length} ~${changed.length}${flag}`);
    for (const k of added.slice(0, 6)) console.log(`   + ${k}: ${JSON.stringify(after[k])}`);
    for (const k of dropped.slice(0, 8)) console.log(`   - ${k}: was ${JSON.stringify(b[k])}`);
    for (const k of changed.slice(0, 8)) console.log(`   ~ ${k}: ${JSON.stringify(b[k])} -> ${JSON.stringify(after[k])}`);
    if (changed.length > 8) console.log(`   … +${changed.length - 8} more changed`);
  }
}
