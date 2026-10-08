import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { collectSkinFiles } from '../../../../../../libraries/engine/skins/files/index.mjs';
import { duplicateRootDeclarations } from '../../hardcodes/index.mjs';
import { KNOWN_DUPLICATE_ROOT_DECLARATIONS } from '../../hardcodes/exclusions/index.mjs';
import { hardcodeFixtures } from '../../context/fixtures/index.mjs';
import { foundationDir, tokensCssDir } from '../../context/paths/index.mjs';
import { cssFilesUnder, rootScopedDeclarations, stripBlockComments } from '../../parsing/index.mjs';

/**
 * Count radius SCALE definition sites at the foundation/engine layer (tenant
 * artifacts and legacy tenant files are tenant-specific overrides, not scales
 * - same convention as countShadowScales). The single source of truth is
 * foundation/themes/default/index.css's literal radius scale; every other consumer
 * (including the component-specific --ds-radius-button/-card/... aliases in
 * foundation/base/borders/index.css) must reference it via var(), never redeclare the
 * literal scale. Since W4-B1 the sm/md/lg/xl steps carry the tenant radius dial
 * as calc(var(--ds-radius-<step>-base) * var(--ds-radius-scale, 1)); the literal
 * now lives in the private --ds-radius-<step>-base tokens, still in the same one
 * file. A "declaration site" therefore requires TWO core scale keys (sm AND md),
 * in EITHER their public or their -base form, defined with a literal px/rem
 * value in the same file, to avoid flagging a lone component-specific alias.
 * Target: exactly 1.
 */
function countRadiusScaleDeclarations() {
  const files = [
    ...cssFilesUnder(join(tokensCssDir, 'foundation')),
    ...cssFilesUnder(join(tokensCssDir, 'runtime/engines')),
  ];
  let scales = 0;
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    if (/--ds-radius-sm(?:-base)?:\s*(?!var\()[^;]*(?:px|rem)/.test(t) && /--ds-radius-md(?:-base)?:\s*(?!var\()[^;]*(?:px|rem)/.test(t)) {
      scales += 1;
    }
  }
  return scales;
}

/**
 * W4-B1 (design section 3.2): count hardcoded font-size length literals inside
 * the engine + agnostic SKIN stylesheets. A skin that writes `font-size: 13px`
 * instead of `font-size: var(--ds-font-size-sm)` opts out of the type-scale
 * ramp -- the tenant --ds-type-scale dial cannot reach it. A `font-size:` set
 * from a --ds-* token or from a keyword (inherit/…) is fine and does not count;
 * clamp()/calc() carrying a raw px/rem/em literal does. Decrease-only ratchet
 * (baseline = measured count); drain opportunistically toward 0.
 */
function countFontSizeLiterals() {
  const declRe = /font-size\s*:\s*([^;}{]+)[;}]/gi;
  const literalLen = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em)\b/;
  let total = 0;
  for (const file of collectSkinFiles()) {
    // A `font-size` mentioned in prose is not a declaration: strip comments
    // first, or the counter reads one higher than the tree.
    const t = stripBlockComments(readFileSync(file, 'utf8'));
    for (const m of t.matchAll(declRe)) {
      const val = m[1];
      if (/var\(\s*--/.test(val)) continue;
      if (!literalLen.test(val)) continue;
      total += 1;
    }
  }
  return total;
}

/**
 * DUP (HARD-2): tokens declared at bare `:root` by more than one foundation
 * file. Two declarers of one root token means the value that wins depends on
 * import order, and the loser is a dead second authority. The known set is
 * pinned BY NAME in `hardcodes/exclusions` (with its owner), so a rename or a
 * swap is roster drift even when the count holds.
 */
function duplicateRootDeclarationCounters() {
  const byFile = cssFilesUnder(foundationDir)
    .filter((f) => !f.includes(`${sep}tests${sep}`))
    .map((f) => [relative(foundationDir, f).split(sep).join('/'), rootScopedDeclarations(readFileSync(f, 'utf8')).map(([n]) => n)]);
  if (hardcodeFixtures.foundation) {
    byFile.push(['fixture', rootScopedDeclarations(readFileSync(hardcodeFixtures.foundation, 'utf8')).map(([n]) => n)]);
  }
  const duplicates = duplicateRootDeclarations(byFile);
  const known = new Set(Object.keys(KNOWN_DUPLICATE_ROOT_DECLARATIONS));
  const unlisted = [...duplicates.keys()].filter((name) => !known.has(name));
  const stale = [...known].filter((name) => !duplicates.has(name));
  for (const name of unlisted) {
    console.error(`  - root token declared by ${duplicates.get(name).join(' + ')} is not a known duplicate: ${name}`);
  }
  for (const name of stale) {
    console.error(`  - known duplicate is no longer duplicated; drop it from hardcodes/exclusions: ${name}`);
  }
  return {
    'scale.duplicateRootDeclarations': duplicates.size,
    'scale.duplicateRootRosterDrift': unlisted.length + stale.length,
  };
}

export {
  countRadiusScaleDeclarations,
  countFontSizeLiterals,
  duplicateRootDeclarationCounters,
};
