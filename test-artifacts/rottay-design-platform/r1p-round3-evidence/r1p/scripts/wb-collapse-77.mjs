/**
 * Collapse rottay's default-state capability-gap ramp overlaps into the typed
 * `palette.ramps` field the dual-mode contract added.
 *
 * These 70 declarations exist because the seed field owned all ten steps of a
 * ramp, so rottay's hand-tuned steps had nowhere to live but the extension.
 * `BrandPalette.ramps` is exactly that home, and the extension value is the one
 * that ships today (its `:not([data-theme=light])` selector outranks the base
 * block), so adopting it is value-preserving by construction.
 *
 *   node wb-collapse-77.mjs          # plan
 *   node wb-collapse-77.mjs --write  # apply
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');
const write = process.argv.includes('--write');

const RAMP = /^--ds-color-(primary|secondary|accent|success|warning|error|info|neutral)-(50|100|200|300|400|500|600|700|800|900)$/;

const artifact = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/rottay/index.css`, 'utf-8');
const artRoot = postcss.parse(artifact, { from: 'rottay' });
const compiledBase = new Set();
let armed = false;
artRoot.each((node) => {
  if (node.type === 'comment' && /Compiled from BrandTheme via/.test(node.text)) { armed = true; return; }
  if (armed && node.type === 'rule') {
    for (const d of node.nodes ?? []) if (d.type === 'decl') compiledBase.add(d.prop);
    armed = false;
  }
});

const extPath = `${CORE}/src/foundation/tokens/css/facade/artifacts/rottay/_source/extension.css`;
const extRoot = postcss.parse(readFileSync(extPath, 'utf-8'), { from: 'rottay' });
let region = null;
extRoot.walkComments((c) => {
  if (region || !/reachability=shipped/.test(c.text)) return;
  let n = c.next();
  while (n && n.type !== 'rule') n = n.next();
  if (n) region = n;
});

const adopt = [];
for (const decl of region.nodes ?? []) {
  if (decl.type !== 'decl' || !compiledBase.has(decl.prop)) continue;
  const m = RAMP.exec(decl.prop);
  if (!m) continue;
  adopt.push({ prop: decl.prop, value: decl.value, role: m[1], step: m[2], node: decl });
}

console.log(`ramp steps to adopt into palette.ramps: ${adopt.length}`);
const byRole = {};
for (const a of adopt) (byRole[a.role] ??= []).push(a);
console.log(Object.entries(byRole).map(([r, v]) => `${r}(${v.length})`).join(' '));

if (!write) process.exit(0);

for (const a of adopt) a.node.remove();
writeFileSync(extPath, extRoot.toString());

const literal = [
  '    /**',
  '     * Hand-tuned ramp steps. Rottay does not want the even OKLCH derivation',
  '     * for these roles: the steps are set against its own dark canvas. They',
  '     * shipped as a root block in the artifact extension until the contract',
  '     * could express a ramp step, which is what `ramps` is for.',
  '     */',
  '    ramps: {',
  ...Object.entries(byRole).flatMap(([role, entries]) => [
    `      ${role}: {`,
    ...entries.map((e) => `        ${e.step}: ${JSON.stringify(e.value)},`),
    '      },',
  ]),
  '    },',
].join('\n');

const tsPath = `${CORE}/src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts`;
const ts = readFileSync(tsPath, 'utf-8');
// Anchor on the base body's palette, never the overlay's: the overlay block is
// introduced by `modes:` and appears earlier in the file.
const anchor = /^(  palette: \{\n)/m;
if (!anchor.test(ts)) throw new Error('platform: base palette anchor not found');
writeFileSync(tsPath, ts.replace(anchor, `$1${literal}\n`));
console.log(`adopted ${adopt.length} ramp steps into platform palette.ramps`);
