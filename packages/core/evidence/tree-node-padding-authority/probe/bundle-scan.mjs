/* Bundle-level proof: enumerate every reader and every producer of the three
   node-padding names in the composed `fresh` bundle of each vertical, over the
   WHOLE text (a reader may wrap across lines), plus each reader's fallback. */
import { resolveBundle } from '../../../scripts/check/tokens/cascade/probe/runtime/bundle/index.mjs';

const NAMES = ['--ds-tree-node-padding', '--ds-tree-node-padding-block', '--ds-tree-node-padding-inline'];

function selectorAt(lines, index) {
  for (let j = index; j >= 0; j -= 1) if (lines[j].trimEnd().endsWith('{')) return lines[j].trim();
  return '(none)';
}

for (const vertical of ['bithire', 'evnto', 'rottay']) {
  const { css, provenance } = await resolveBundle({ vertical, mode: 'fresh' });
  const lines = css.split('\n');
  const lineOf = (offset) => css.slice(0, offset).split('\n').length - 1;
  console.log(`\n== ${vertical}  sha=${provenance.sha256.slice(0, 12)} bytes=${css.length}`);
  for (const name of NAMES) {
    // a declaration of the name: `name` followed by `:` and not preceded by `(`
    const decl = new RegExp(`(^|[;{\\s])(${name})\\s*:`, 'g');
    const producers = [];
    for (const m of css.matchAll(decl)) {
      const i = lineOf(m.index + m[1].length);
      producers.push(`${i + 1}  ${selectorAt(lines, i)}`);
    }
    const use = new RegExp(`var\\(\\s*(${name})\\s*([,)])`, 'g');
    const readers = [];
    for (const m of css.matchAll(use)) {
      const i = lineOf(m.index);
      readers.push(`${i + 1}  ${selectorAt(lines, i)}   fallback=${m[2] === ',' ? 'YES' : 'NONE'}`);
    }
    console.log(`  ${name}`);
    console.log(`    producers (${producers.length})`);
    producers.forEach((p) => console.log(`      ${p}`));
    console.log(`    readers (${readers.length})`);
    readers.forEach((r) => console.log(`      ${r}`));
  }
}
