/**
 * W-B acid test: pre-WB snapshot vs current artifacts, per reachable state.
 *
 * HEAD-vs-current would fold in W1's authorized deltas; W-B's own target is
 * that moving the mode blocks from hand-written CSS into the typed contract
 * changes NOTHING in any state.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { effectiveMap } from './effective-map.mjs';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const R1P = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p';
const SNAP = `${R1P}/closure/wb-snapshot`;

const norm = (v) =>
  v == null
    ? null
    : v.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim().toLowerCase();

const out = {};
let totalChanged = 0;
for (const slug of ['bithire', 'evnto', 'rottay']) {
  const before = readFileSync(`${SNAP}/${slug}.index.css`, 'utf-8');
  const after = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`, 'utf-8');
  out[slug] = {};
  for (const state of ['default', 'light', 'dark']) {
    const b = Object.fromEntries([...effectiveMap(before, state, slug)].map(([k, v]) => [k, v.value]));
    const a = Object.fromEntries([...effectiveMap(after, state, slug)].map(([k, v]) => [k, v.value]));
    const added = Object.keys(a).filter((k) => !(k in b));
    const dropped = Object.keys(b).filter((k) => !(k in a));
    const changed = Object.keys(b)
      .filter((k) => k in a && norm(b[k]) !== norm(a[k]))
      .map((k) => ({ k, before: b[k], after: a[k] }));
    out[slug][state] = {
      added: added.map((k) => ({ k, v: a[k] })),
      dropped: dropped.map((k) => ({ k, was: b[k] })),
      changed,
    };
    totalChanged += added.length + dropped.length + changed.length;
    console.log(`${slug} ${state}: +${added.length} -${dropped.length} ~${changed.length}`);
    for (const c of changed.slice(0, 12)) console.log(`     ~ ${c.k}: ${c.before}  ->  ${c.after}`);
    for (const k of dropped.slice(0, 12)) console.log(`     - ${k}: was ${b[k]}`);
    for (const k of added.slice(0, 12)) console.log(`     + ${k}: ${a[k]}`);
  }
}
writeFileSync(`${R1P}/closure/wb-acid-delta.json`, JSON.stringify(out, null, 1));
console.log(`\nTOTAL effective differences across all states: ${totalChanged}`);
