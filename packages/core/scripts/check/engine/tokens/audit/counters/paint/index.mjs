import { readFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { countArc09PaintInFile } from '../../../../../../libraries/paint/inline/index.mjs';
import { countRuntimeSvgPaintByFile } from '../../../../../../libraries/paint/svg/index.mjs';
import { countEmbeddedCssPaintByFile } from '../../../../../../libraries/paint/embedded/index.mjs';
import { ARC09_INLINE_PAINT_FILES, collectFleetInlinePaintSourceFiles } from '../../../../../../libraries/paint/fleet/index.mjs';
import { collectSkinFiles } from '../../../../../../libraries/engine/skins/files/index.mjs';
import { collectSourceFiles as collectRuntimeSvgSourceFiles } from '../../../../css/paint/runtime-svg/index.mjs';
import { SKIN_LITERAL_CLASSES, countInlineGeometryInFile, countSkinLiterals } from '../../hardcodes/index.mjs';
import { FIXTURE_SKIN_ANCHOR, componentRelOf, hardcodeFixtures, withSourceFixture } from '../../context/fixtures/index.mjs';
import { componentsDir, requireUiSource, tokensCssDir } from '../../context/paths/index.mjs';
import { sparse } from '../../context/sparse/index.mjs';

/**
 * WO-ARC-09: inline PAINT that has not yet moved to an unlayered skin.
 *
 * Positive "no inline paint" gate.
 * Counts paint property NAMES inside `style={{ … }}` object literals in the
 * migratable files of the six workspace-tier components — the modern + rustic
 * engine files plus the five engine-agnostic files (the two structures and the
 * three shared data-table files). classic is excluded BY CONSTRUCTION: Ant
 * Design keeps its own paint, so a classic `style={{}}` is not a migration
 * target. Per file, decrease-only; each component's checkpoint drives its files
 * to 0 (data-table's virtual-offset transform is the one documented residual,
 * handled at that checkpoint).
 *
 * Paint vs layout is decided by the property-NAME class, never by a value regex
 * (that is the axis `inlineStateLiterals` gets wrong in both directions). The
 * counted names are background*, border*, outline*, color, boxShadow,
 * textShadow, fill, stroke, accentColor, filter, backdropFilter and transform
 * (a state transform is paint — ARC-07 moved `translateY(0)` into CSS). Layout
 * (size/padding/margin/flex/grid/position/zIndex/display/overflow), the ARC-08
 * container contract (containerType/containerName), runtime-measured dynamics
 * (column widths, virtual offsets) and the two residuals ARC-07 kept (opacity,
 * animation) are NOT paint names, so they never enter the count. `borderCollapse`
 * and `borderSpacing` match `border*` but are table box-model layout, so they
 * are subtracted back out.
 *
 * Bounding to `style={{}}` spans (not a whole-file regex like fixedWidthLiterals)
 * matters here: `filter:` and `transform:` are also data-table/filter-panel
 * config keys, and only the ones inside an inline style object are paint.
 */
/** Per-file `arc09.inlinePaint.<path>` counters, spread into the counter map. */
function arc09InlinePaintCounters() {
  const out = {};
  for (const rel of ARC09_INLINE_PAINT_FILES) {
    const full = requireUiSource(rel, 'ARC-09 inline-paint audit');
    out[`arc09.inlinePaint.${rel}`] = countArc09PaintInFile(readFileSync(full, 'utf8'), full);
  }
  return out;
}

/**
 * Per-file `fleet.inlinePaint.<path>` counters for the WO-SKIN lane: every
 * TypeScript source admitted by the historical skin-census law below
 * primitives/patterns/structures/surfaces, including files currently at zero.
 * That law intentionally retains the already-baselined `story-helpers.tsx` and
 * `test-utils.tsx` files (7 sites total); it excludes actual test/story catalog
 * files, classic engines and the thirteen ARC-09-owned paths. Decrease-only,
 * using the exact lexer ARC-09 uses. Dynamic enumeration means a new file cannot
 * bypass the ratchet and a deleted file cannot silently remove its key;
 * reverse-presence checking below owns the latter half.
 */
function fleetInlinePaintCounters() {
  const sourceFiles = collectFleetInlinePaintSourceFiles(componentsDir);
  const out = {
    'fleet.inlinePaint.filesScanned': sourceFiles.length,
  };
  let total = 0;
  for (const file of sourceFiles) {
    const rel = relative(componentsDir, file).replaceAll('\\', '/');
    const count = countArc09PaintInFile(readFileSync(file, 'utf8'), file);
    out[`fleet.inlinePaint.${rel}`] = count;
    total += count;
  }
  out['fleet.inlinePaint.total'] = total;
  return out;
}

/**
 * Per-file runtime-SVG paint ratchet for the whole productive component tree.
 *
 * The inline-paint lexer cannot see D3 setters, intrinsic SVG JSX attributes,
 * or DOM `setAttribute` writes. The AST counter covers those channels over the
 * whole productive component tree and intentionally emits a key for every source
 * file, including current zeros: a new file or a reintroduced site therefore
 * cannot hide behind a stale, hand-maintained renderer list. `count` includes
 * computed property names classified fail-closed as possible paint. The
 * aggregate unclassified counter catches a refactor from a literal paint name
 * to a computed alias even when that file's total site count stays unchanged.
 *
 * Canvas paint is a separate channel. Structural SVG values (`none`,
 * `currentColor`, local paint-server references and nullish removals) are
 * reported separately so the checkpoint can prove their disposition without
 * misrepresenting them as authored colour decisions.
 */
function runtimeSvgPaintCounters() {
  const sourceFiles = collectRuntimeSvgSourceFiles(componentsDir, {
    productionOnly: true,
  });
  const result = countRuntimeSvgPaintByFile(sourceFiles);
  const out = {
    // These two sentinels make collector deletion/collapse observable even when
    // every per-file key would otherwise disappear from the current map.
    'runtimeSvgPaint.filesScanned': Object.keys(result.files).length,
    'runtimeSvgPaint.total': result.total,
    'runtimeSvgPaint.unclassified': result.unclassified,
    'runtimeSvgPaint.ignoredStructural': result.ignoredStructural,
  };

  for (const [file, counts] of Object.entries(result.files)) {
    const rel = relative(componentsDir, file).replaceAll('\\', '/');
    out[`runtimeSvgPaint.${rel}`] = counts.count;
  }
  return out;
}

/**
 * Per-file ratchet for source-authored paint declarations inside real injected
 * CSS strings/templates. This is intentionally separate from JavaScript inline
 * paint and runtime SVG/D3 paint: one channel cannot pay down another. Every
 * productive component source emits a key, including current zeros; parse
 * failures and computed CSS property names count fail-closed.
 */
function embeddedCssPaintCounters() {
  const sourceFiles = collectRuntimeSvgSourceFiles(componentsDir, {
    productionOnly: true,
  });
  const result = countEmbeddedCssPaintByFile(sourceFiles);
  const out = {
    'embeddedCssPaint.filesScanned': Object.keys(result.files).length,
    'embeddedCssPaint.total': result.total,
    'embeddedCssPaint.classifiedPaint': result.classifiedPaint,
    'embeddedCssPaint.unclassified': result.unclassified,
    'embeddedCssPaint.parseFailures': result.parseFailures,
    'embeddedCssPaint.dynamicProperties': result.dynamicProperties,
    'embeddedCssPaint.unknownSinks': result.unknownSinks,
  };
  for (const [file, counts] of Object.entries(result.files)) {
    const rel = relative(componentsDir, file).replaceAll('\\', '/');
    out[`embeddedCssPaint.${rel}`] = counts.count;
  }
  return out;
}

const FROZEN_SKIN_RE = /[\\/]engines[\\/](?:classic|rustic)[\\/]/;

/**
 * HARD-2 / owner ruling 7: hardcode-census's per-class skin literal census
 * (F.1-F.10, F-63), folded into this audit. Productive skins (modern +
 * presentation) are keyed `skinLiterals.<class>.<path below tokens/css>`;
 * the frozen classic/rustic skins are ratcheted per class in aggregate. The
 * classifier and its one TEC/FLOOR exclusion file live in `./hardcodes`.
 * `DEBUG_SKIN_LITERALS=<class>` prints every counted site of that class.
 */
function skinLiteralCounters() {
  const all = collectSkinFiles();
  const productive = all.filter((f) => !FROZEN_SKIN_RE.test(f));
  const frozen = all.filter((f) => FROZEN_SKIN_RE.test(f));
  const relOf = (f) => relative(tokensCssDir, f).split(sep).join('/');
  const live = countSkinLiterals(productive, relOf);
  if (hardcodeFixtures.skin) {
    const planted = countSkinLiterals([hardcodeFixtures.skin], () => 'fixture');
    for (const klass of SKIN_LITERAL_CLASSES) {
      live.perFile[FIXTURE_SKIN_ANCHOR].counts[klass] += planted.totals[klass];
      live.totals[klass] += planted.totals[klass];
    }
    live.parseFailures += planted.parseFailures;
  }
  const cold = countSkinLiterals(frozen, relOf);
  const out = { 'skinLiterals.parseFailures': live.parseFailures + cold.parseFailures };
  for (const klass of SKIN_LITERAL_CLASSES) {
    out[`skinLiterals.${klass}.total`] = live.totals[klass];
    out[`skinLiterals.frozen.${klass}`] = cold.totals[klass];
  }
  const debugClass = process.env.DEBUG_SKIN_LITERALS;
  for (const [rel, result] of Object.entries(live.perFile)) {
    for (const klass of SKIN_LITERAL_CLASSES) sparse(out, `skinLiterals.${klass}.${rel}`, result.counts[klass]);
    if (debugClass) {
      for (const site of result.sites.filter((s) => s.klass === debugClass)) {
        console.error(`[skin-literals:${debugClass}] ${rel}:${site.line} ${site.text.replace(/\s+/g, ' ')}`);
      }
    }
  }
  return out;
}

/**
 * HARD-2 / F-64: static geometry literals in JSX `style={{}}` over every
 * productive component source -- the layout half `fleet.inlinePaint` never
 * counted. See `countInlineGeometryInFile` for what counts.
 */
function inlineGeometryCounters(sourceFiles) {
  const out = {};
  const perPath = new Map();
  let total = 0;
  for (const file of withSourceFixture(sourceFiles)) {
    const count = countInlineGeometryInFile(readFileSync(file, 'utf8'), file);
    total += count;
    const key = `inlineGeometry.${componentRelOf(file)}`;
    perPath.set(key, (perPath.get(key) ?? 0) + count);
  }
  for (const [key, count] of perPath) sparse(out, key, count);
  out['inlineGeometry.total'] = total;
  return out;
}

export {
  arc09InlinePaintCounters,
  fleetInlinePaintCounters,
  runtimeSvgPaintCounters,
  embeddedCssPaintCounters,
  skinLiteralCounters,
  inlineGeometryCounters,
};
