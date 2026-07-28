/**
 * W-B step 0: classify every declaration in the three authored mode-block
 * regions against the compiler's channel map.
 *
 * For each declaration we ask: is there a BrandTheme leaf path whose sentinel
 * reached this variable, and does that path control ONLY this variable (a
 * clean typed field) or a whole derived family (a ramp seed, where authoring
 * the seed would re-derive values the hand block pinned by hand)?
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const R1P = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');

const themePaths = JSON.parse(readFileSync(`${R1P}/theme-paths.json`, 'utf-8'));

/** Extract the declarations of every `kind=mode-block` region of an extension. */
function modeBlocks(css, file) {
  const root = postcss.parse(css, { from: file });
  const out = [];
  root.walkComments((comment) => {
    if (!/@ds-exception\s+kind=mode-block/.test(comment.text)) return;
    let node = comment.next();
    while (node && node.type !== 'rule') node = node.next();
    if (!node) return;
    out.push({
      selector: node.selector,
      startLine: comment.source.start.line,
      endLine: node.source.end.line,
      decls: (node.nodes ?? [])
        .filter((d) => d.type === 'decl')
        .map((d) => ({ prop: d.prop, value: d.value })),
    });
  });
  return out;
}

const report = {};
for (const [slug, themeKey] of [
  ['bithire', 'bithire'],
  ['evnto', 'evnto'],
  ['rottay', 'rottay'],
]) {
  const css = readFileSync(
    `${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`,
    'utf-8',
  );
  const blocks = modeBlocks(css, slug);
  const byVar = themePaths[themeKey]?.byVar;
  const classified = [];
  for (const block of blocks) {
    for (const { prop, value } of block.decls) {
      if (!prop.startsWith('--')) {
        classified.push({ prop, value, klass: 'non-custom-property' });
        continue;
      }
      const candidates = byVar?.[prop] ?? [];
      const exact = candidates.filter((c) => c.controls === 1);
      const derived = candidates.filter((c) => c.controls > 1);
      classified.push({
        prop,
        value,
        klass: exact.length
          ? 'direct'
          : derived.length
            ? 'derived-family'
            : 'no-path',
        paths: exact.map((c) => c.path),
        derivedPaths: derived.map((c) => ({ path: c.path, controls: c.controls })),
      });
    }
  }
  const tally = {};
  for (const c of classified) tally[c.klass] = (tally[c.klass] ?? 0) + 1;
  report[slug] = {
    blocks: blocks.map((b) => ({
      selector: b.selector,
      lines: [b.startLine, b.endLine],
      declCount: b.decls.length,
    })),
    tally,
    classified,
  };
  console.log(
    `${slug}: ${classified.length} decls  ${JSON.stringify(tally)}`,
  );
}

writeFileSync(`${R1P}/closure/wb-mode-analysis.json`, JSON.stringify(report, null, 1));

// Show the no-path channels, grouped by prefix, and the derived-family ones.
for (const slug of Object.keys(report)) {
  const noPath = report[slug].classified.filter((c) => c.klass === 'no-path');
  const derived = report[slug].classified.filter((c) => c.klass === 'derived-family');
  const groups = {};
  for (const c of noPath) {
    const g = c.prop.split('-').slice(0, 4).join('-');
    (groups[g] ??= []).push(c.prop);
  }
  console.log(`\n== ${slug}: ${noPath.length} no-path, ${derived.length} derived-family`);
  console.log('   no-path groups:', Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 25)
    .map(([g, v]) => `${g}(${v.length})`)
    .join(' '));
  if (derived.length) {
    const dg = {};
    for (const c of derived) {
      const key = c.derivedPaths.map((d) => d.path).join('|');
      (dg[key] ??= []).push(c.prop);
    }
    console.log('   derived-family:', Object.entries(dg).map(([k, v]) => `${k} -> ${v.length}`).join(' ; '));
  }
}
