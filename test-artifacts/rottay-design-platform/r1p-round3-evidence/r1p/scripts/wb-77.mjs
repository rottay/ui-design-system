/** What are rottay's 77 default-state capability-gap overlaps, and can the new fields hold them? */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');

const artifact = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/rottay/index.css`, 'utf-8');
const root = postcss.parse(artifact, { from: 'rottay' });
const compiledBase = new Map();
let armed = false;
root.each((node) => {
  if (node.type === 'comment' && /Compiled from BrandTheme via/.test(node.text)) { armed = true; return; }
  if (armed && node.type === 'rule') {
    for (const d of node.nodes ?? []) if (d.type === 'decl') compiledBase.set(d.prop, d.value);
    armed = false;
  }
});

const ext = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/rottay/_source/extension.css`, 'utf-8');
const extRoot = postcss.parse(ext, { from: 'rottay' });
let region = null;
extRoot.walkComments((c) => {
  if (region || !/reachability=shipped/.test(c.text)) return;
  let n = c.next();
  while (n && n.type !== 'rule') n = n.next();
  if (n) region = n;
});

const overlaps = (region.nodes ?? [])
  .filter((d) => d.type === 'decl' && compiledBase.has(d.prop))
  .map((d) => ({ prop: d.prop, extension: d.value, compiled: compiledBase.get(d.prop) }));

console.log(`rottay default-state capability-gap overlaps: ${overlaps.length}\n`);
const varish = overlaps.filter((o) => /var\(/.test(o.extension));
console.log(`carrying a var() indirection (AD-1's documented "cannot live in a typed color field"): ${varish.length}`);
console.log(`plain literals: ${overlaps.length - varish.length}\n`);
for (const o of overlaps) {
  console.log(`  ${o.prop}`);
  console.log(`     extension: ${o.extension}`);
  console.log(`     compiled : ${o.compiled}`);
}
