import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const OUT = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/';
const ROOTS = [
  ['core', '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src'],
  ['bithire', '/Users/daniel/Developer/Rottay/app-bithire/src'],
  ['evnto', '/Users/daniel/Developer/Rottay/app-evnto/src'],
  ['platform', '/Users/daniel/Developer/Rottay/app-platform/src'],
];
function walk(dir, acc = []) {
  let e; try { e = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const x of e) { if (x.name === 'node_modules' || x.name === '.git') continue; const f = join(dir, x.name); if (x.isDirectory()) walk(f, acc); else if (/\.(ts|tsx)$/.test(x.name)) acc.push(f); }
  return acc;
}
// PRODUCER shape: the name appears QUOTED and immediately followed by `:` (object key),
// `,` (setProperty second arg / array), or `]` (vars['--x'] = ...).
const PROD = /(['"`])(--ds-[a-zA-Z0-9_-]+)\1\s*(?:as\s+[A-Za-z_$][\w$]*\s*)?(?=[:,\]])/g;
const PRIVPROD = /(['"`])(--_ds-[a-zA-Z0-9_-]+)\1\s*(?:as\s+[A-Za-z_$][\w$]*\s*)?(?=[:,\]])/g;
const prod = new Map(), privProd = new Map();
let scanned = 0, tests = 0;
for (const [label, root] of ROOTS) {
  const files = walk(root);
  for (const f of files) {
    const isTest = /\.(test|spec)\.[tj]sx?$/.test(f) || f.includes('/tests/') || f.includes('/__tests__/');
    const txt = readFileSync(f, 'utf8');
    scanned += 1; if (isTest) tests += 1;
    for (const m of txt.matchAll(PROD)) {
      const key = m[2];
      if (!prod.has(key)) prod.set(key, { prodSites: [], testSites: [] });
      (isTest ? prod.get(key).testSites : prod.get(key).prodSites).push(label + ':' + f.split('/src/')[1]);
    }
    for (const m of txt.matchAll(PRIVPROD)) {
      const key = m[2];
      if (!privProd.has(key)) privProd.set(key, { prodSites: [], testSites: [] });
      (isTest ? privProd.get(key).testSites : privProd.get(key).prodSites).push(label + ':' + f.split('/src/')[1]);
    }
  }
}
console.log('archivos ts/tsx escaneados:', scanned, '(de los cuales test:', tests + ')');
const realProd = [...prod].filter(([, v]) => v.prodSites.length > 0).map(([k]) => k).sort();
console.log('--ds-* con FORMA de productor en TS/TSX de produccion:', realProd.length, '| solo en tests:', [...prod].filter(([, v]) => v.prodSites.length === 0).length);
writeFileSync(OUT + 'P2-ts-producers.txt', realProd.join('\n') + '\n');
const realPriv = [...privProd].filter(([, v]) => v.prodSites.length > 0).map(([k]) => k).sort();
console.log('--_ds-* con FORMA de productor en TS/TSX de produccion:', realPriv.length, realPriv.join(', '));
console.log('--_ds-* SOLO en tests:', [...privProd].filter(([, v]) => v.prodSites.length === 0).map(([k]) => k).join(', '));
writeFileSync(OUT + 'P2-ts-priv-producers.txt', realPriv.join('\n') + '\n');
writeFileSync(OUT + 'P2-ts-priv-producers.json', JSON.stringify(Object.fromEntries(privProd), null, 1));
