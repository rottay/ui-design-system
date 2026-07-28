/**
 * W-B step 0b: intersect each authored mode block with the channel set the
 * compiler already emits in that vertical's base block.
 *
 * A channel the compiler already owns is one a typed overlay can carry (the
 * field exists; only the value differs per mode). A channel the compiler never
 * emits needs a contract addition or stays a declared capability gap.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const R1P = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');

const analysis = JSON.parse(readFileSync(`${R1P}/closure/wb-mode-analysis.json`, 'utf-8'));

/** Channels of the artifact's compiled block (the compiler's own output). */
function compiledChannels(slug) {
  const css = readFileSync(
    `${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`,
    'utf-8',
  );
  const root = postcss.parse(css, { from: slug });
  const map = new Map();
  let inCompiled = false;
  root.walkComments((c) => {
    if (/Compiled from BrandTheme/.test(c.text)) inCompiled = true;
  });
  // The compiled block is the first rule in the file after that banner.
  let seenBanner = false;
  root.each((node) => {
    if (node.type === 'comment' && /Compiled from BrandTheme/.test(node.text)) {
      seenBanner = true;
      return;
    }
    if (seenBanner && node.type === 'rule') {
      for (const d of node.nodes ?? []) {
        if (d.type === 'decl') map.set(d.prop, d.value);
      }
      seenBanner = false;
    }
  });
  void inCompiled;
  return map;
}

const out = {};
for (const slug of ['bithire', 'evnto', 'rottay']) {
  const compiled = compiledChannels(slug);
  const mode = analysis[slug].classified;
  const owned = mode.filter((c) => compiled.has(c.prop));
  const foreign = mode.filter((c) => !compiled.has(c.prop) && c.prop.startsWith('--'));
  // Of the owned ones, how many actually carry a DIFFERENT value in the mode?
  const sameValue = owned.filter(
    (c) => compiled.get(c.prop).replace(/\s+/g, ' ').trim().toLowerCase()
      === c.value.replace(/\s+/g, ' ').trim().toLowerCase(),
  );
  out[slug] = {
    compiledChannelCount: compiled.size,
    modeDeclCount: mode.length,
    compilerOwned: owned.length,
    compilerOwnedRedundant: sameValue.length,
    foreignToCompiler: foreign.length,
    ownedProps: owned.map((c) => c.prop),
    foreignProps: foreign.map((c) => c.prop),
    redundantProps: sameValue.map((c) => c.prop),
  };
  console.log(
    `${slug}: compiled=${compiled.size} modeDecls=${mode.length} | compiler-owned=${owned.length} (of which value-identical=${sameValue.length}) | foreign=${foreign.length}`,
  );
  const groups = {};
  for (const c of foreign) {
    const g = c.prop.split('-').slice(0, 4).join('-');
    (groups[g] ??= []).push(c.prop);
  }
  console.log(
    '   foreign groups:',
    Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([g, v]) => `${g}(${v.length})`)
      .join(' '),
  );
}
writeFileSync(`${R1P}/closure/wb-coverage.json`, JSON.stringify(out, null, 1));
