import { join } from 'node:path';
import {
  collectEngineFiles,
  modernEngineColorFiles,
  modernEngineFiles,
} from '../../../../../libraries/engine/corpus/index.mjs';
import { countDaisyClassConsumers } from '../../../../../libraries/engine/consumers/daisy-classes/index.mjs';
import { countSkinExemptionBreaches } from '../../../../../libraries/engine/skins/exemptions/index.mjs';
import { measurePassThrough } from '../../../../../libraries/engine/skins/pass-through/index.mjs';
import { collectSourceFiles as collectRuntimeSvgSourceFiles } from '../../../css/paint/runtime-svg/index.mjs';
import { countDeadParts } from '../../../skins/dead-parts/index.mjs';
import {
  classicThemeCssPath,
  componentsDir,
  repoRoot,
  rusticThemeCssPath,
  themeCssPath,
} from '../context/paths/index.mjs';
import { countColorLiterals, componentColorCounters } from '../counters/color/index.mjs';
import { evaluateApcaPairings } from '../counters/contrast/index.mjs';
import { countMagicZIndex } from '../counters/content/index.mjs';
import { countDarkPureBlackElevations, countShadowScales } from '../counters/depth/index.mjs';
import { countEffectConsumers } from '../counters/effects/index.mjs';
import {
  countFallbackParityExtensions,
  countFallbackParityViolations,
  fallbackParityFileCounters,
} from '../counters/fallback-parity/index.mjs';
import { countCrossEngineLayoutDivergences } from '../counters/layout/index.mjs';
import {
  countCompositorOnlyViolations,
  countMotionLiterals,
  countRecipeConsumers,
} from '../counters/motion/index.mjs';
import {
  arc09InlinePaintCounters,
  embeddedCssPaintCounters,
  fleetInlinePaintCounters,
  inlineGeometryCounters,
  runtimeSvgPaintCounters,
  skinLiteralCounters,
} from '../counters/paint/index.mjs';
import {
  countFixedWidthLiterals,
  countResponsiveOverflowCells,
  countViewportMediaQueriesInSkins,
} from '../counters/responsive/index.mjs';
import {
  countFontSizeLiterals,
  countRadiusScaleDeclarations,
  duplicateRootDeclarationCounters,
} from '../counters/scale/index.mjs';
import { countSkinParseErrors, countUnwiredSkins } from '../counters/skins/index.mjs';
import { countDarkFocusRingDefects, countInlineStateLiterals } from '../counters/state/index.mjs';
import { auditEngineTheme, auditThemeCss } from '../counters/theme-css/index.mjs';
import {
  collectTypesFiles,
  countDuplicateSizeVocabDeclarations,
  countRawAntdSizeUnions,
} from '../counters/vocabulary/index.mjs';
import { printDaisyConsumerInventory } from '../diagnostics/index.mjs';
import { applyEvasionFixture, applyThemeCssConsumerFixture } from '../seams/index.mjs';

/**
 * The engine-source corpus lives in `lib/engine/corpus/index.mjs` so this script and
 * its guard test read the SAME walk. It is recursive (WO-GAT-02 generalized it
 * from the modern-only walk so the classic/rustic dead-selector counters build
 * their consumed-class sets from the same scan) and it excludes tests/stories
 * declaratively; see that module for both rules and why they are there.
 */
const modernFiles = modernEngineFiles;
const modernColorFiles = modernEngineColorFiles;

/** The three P-88 fleet aggregates (WO-ARC-12), from the shared pass-through census. */
function passThroughCounters() {
  const { totals } = measurePassThrough({ repoRoot }).census;
  return {
    'skins.passThroughViolations': totals.sites,
    'skins.callerPartDependents': totals.callerPartDependents,
    'skins.callerStateDependents': totals.callerStateDependents,
  };
}

/** Every counter in emission order, plus the audit records the report modes print. */
function collectAuditState() {
  const files = modernFiles(componentsDir);
  printDaisyConsumerInventory(files);

  const motion = countMotionLiterals(files);
  const effects = countEffectConsumers();
  const colorFiles = modernColorFiles(componentsDir);
  const color = countColorLiterals(colorFiles);
  const classicFiles = collectEngineFiles(componentsDir, 'classic');
  const rusticFiles = collectEngineFiles(componentsDir, 'rustic');
  // Keyed by engine name rather than branched on it: a record is not a second
  // roster, and this seam must not restate one (engine-wiring-gate, ROSTER_OWNER).
  const themeCssConsumerCorpora = { modern: files, classic: classicFiles, rustic: rusticFiles };
  applyThemeCssConsumerFixture(themeCssConsumerCorpora);
  const themeCssAudit = auditThemeCss(files);
  const classicThemeAudit = auditEngineTheme(classicThemeCssPath, classicFiles, {
    // "ant-" (Ant Design 5.x component classes), "anticon" (Ant Design's icon-font class -- no
    // hyphen after "ant"), "slick-" (react-slick, vendored internally by antd's Carousel). All
    // three are externally-consumed runtime classes, never written literally in DS source -- see
    // auditEngineTheme's doc comment for how this list was derived from the measured baseline.
    allowlistPrefixes: ['ant-', 'anticon', 'slick-'],
  });
  const rusticThemeAudit = auditEngineTheme(rusticThemeCssPath, rusticFiles);
  const crossEngineLayoutDivergences = countCrossEngineLayoutDivergences();
  const apca = evaluateApcaPairings();

  const typesFiles = collectTypesFiles(componentsDir);
  const rawAntdSizeUnions = countRawAntdSizeUnions(typesFiles);
  const duplicateSizeVocabDeclarations = countDuplicateSizeVocabDeclarations(typesFiles);

  const productiveComponentSources = collectRuntimeSvgSourceFiles(componentsDir, { productionOnly: true });
  const fallbackParityExtensions = countFallbackParityExtensions();

  const counters = {
    'motion.cubicBezierLiterals': motion.cubicBezier,
    'motion.rawDurationLiterals': motion.rawDuration,
    'motion.orphanMotionTokens': motion.orphanTokens,
    // WO-CRA-06 (choreography layer): compositor-only law. See this counter's
    // module doc (search "Compositor-only motion gate") for exact scope.
    'motion.compositorOnlyViolations': countCompositorOnlyViolations(files),
    // WO-CRA-15 (motion recipe canon adoption): distinct src/components components whose
    // production source consumes useMotionRecipe*/useMotionRecipePresentation.
    // MIN floor: the recipe canon must never regress to zero functional
    // consumers again (audit MOT-02). See countRecipeConsumers() for scope.
    'motion.recipeConsumers': countRecipeConsumers(),
    'depth.shadowScales': countShadowScales(),
    'depth.darkPureBlackElevations': countDarkPureBlackElevations(),
    'scale.radiusScaleDeclarations': countRadiusScaleDeclarations(),
    'scale.fallbackParityViolations': countFallbackParityViolations(),
    // W4-B1 (design section 3.2): hardcoded font-size length literals in skins.
    // The type-scale ramp (calc(--ds-font-size-*-base * var(--ds-type-scale,1)))
    // only reaches skins that read the token; a raw `font-size: 13px` opts out.
    // Decrease-only ratchet; drain toward 0.
    'scale.fontSizeLiterals': countFontSizeLiterals(),
    'state.darkFocusRingDefects': countDarkFocusRingDefects(),
    'state.inlineStateLiterals': countInlineStateLiterals(),
    // NOT the authority on whether the effect renders. This is a MIN floor over
    // the number of FILES that mention var(--ds-gradient-surface); it stayed green
    // while rottay's card face measured a top-to-bottom luminance delta of exactly
    // 0.000. The pixel gate is packages/showroom/e2e/visual/effects.spec.ts, which
    // decodes a screenshot. Keep this floor: it still catches a component that
    // stops reading the token entirely.
    'effects.gradientConsumers': effects.gradient,
    'effects.glassConsumers': effects.glass,
    'effects.glowConsumers': effects.glow,
    // WO-TOK-03 verdict 2026-07-10: DaisyUI stays; the residue is ratcheted.
    // TypeScript-AST counter -- see libraries/engine/consumers/daisy-classes for why a
    // regex cannot separate a rendered class from `data-part="skeleton"`,
    // `role="alert"` or `kind: 'modal'`.
    'daisy.classConsumers': countDaisyClassConsumers(files),
    'color.modernHexLiterals': color.hex,
    'color.modernRgbaLiterals': color.rgba,
    'themeCss.unreferencedSelectors': themeCssAudit.unreferencedSelectors,
    'themeCss.lineCount': themeCssAudit.lineCount,
    // WO-GAT-02: classic/rustic dead-selector counters, generalized from WO-ENG-08's modern scan
    // (`auditEngineTheme`, shared). Decrease-only, no hard target -- draining classic/rustic CSS
    // is future work; these counters only stop further growth. Classic's near-total .ant-*
    // allowlisting (see auditEngineTheme's doc comment) is reported separately, not counted here.
    'themeCss.deadSelectorsClassic': classicThemeAudit.unreferencedSelectors,
    'themeCss.deadSelectorsRustic': rusticThemeAudit.unreferencedSelectors,
    'content.magicZIndex': countMagicZIndex(files),
    'layout.crossEngineDivergences': crossEngineLayoutDivergences,
    // WO-GAT-04 (accessibility CI, proposal P-10): APCA text/surface pairings below their Lc
    // threshold, across the foundation + rottay/bithire/evnto palettes. Decrease-only, no hard
    // target (dark-surface saturated status colors and low-emphasis muted text sit below the bar
    // today; a future color WO ratchets them down). Skip count (unresolvable pairs) is reported,
    // not gated — see evaluateApcaPairings(). Threshold + pairing list documented at APCA_PAIRINGS.
    'a11y.apcaPairings': apca.failures,
    // WO-ENG-12 (spec section 13). Both decrease-only. fixedWidthLiterals is a
    // static scan; overflowCells reflects what the browser actually measured at
    // 360px and is owned by packages/showroom/e2e/responsive/.
    'responsive.fixedWidthLiterals': countFixedWidthLiterals(files, themeCssPath),
    'responsive.overflowCells': countResponsiveOverflowCells(),
    // WO-ARC-01 (component API normalization, proposal P-13): the offcanon-vocabulary gate --
    // see this file's "Off-canon vocabulary gate" module doc above for the counting method and
    // the @deprecated exemption rule. Both decrease-only.
    'vocabulary.rawAntdSizeUnions': rawAntdSizeUnions,
    'vocabulary.duplicateSizeDeclarations': duplicateSizeVocabDeclarations,
    // WO-ARC-05: a skin adapts to its container, not to the window. Decrease-only,
    // and the baseline is 0 -- so the first viewport breakpoint added to a skin
    // fails the build, which is the point.
    'responsive.viewportMqInSkins': countViewportMediaQueriesInSkins(),
    // WO-SKIN-03: a skin that does not PARSE loads no rules at all, and every
    // other signal stays green -- the counter reads source text, tsc never sees
    // CSS, and the unit suites assert the DOM. A stray `*/` inside a header
    // comment silently voided an entire migrated skin this way. Exact-0.
    'skins.parseErrors': countSkinParseErrors(),
    // WO-SKIN-03: a skin nobody imports paints nothing, and it fails exactly as
    // quietly as one that does not parse. Every skin must reach the one authored
    // entrypoint, facade/entrypoints/base/index.css, which is inlined into every
    // shipped bundle including dist/styles.css. Exact-0.
    'skins.unwired': countUnwiredSkins(),
    // skin ownership migration: sites whose PAINT VALUE is runtime data (a tenant's chosen hex, a
    // per-datum chart colour, a per-user identity colour) cannot live in a skin. They
    // are NOT pending work -- carrying them as debt that can never reach 0 is a lie in
    // the ratchet and makes the zero target impossible. Each is
    // declared with concrete per-file channel FLOORS in roadmap/skin-exemptions.json.
    // Inline and runtime-SVG floors are summed separately across families before
    // comparison; malformed configuration, globs, missing files and files migrated
    // below either sum all breach this exact-0 gate.
    // This proves aggregate per-file cardinality only. The checkpoint contract plus its
    // focused and visual tests prove that the remaining sites are the intended expressions
    // and still render correctly; this counter does not infer source-site identity.
    'skins.exemptionsBreached': countSkinExemptionBreaches({
      exemptionsPath: join(repoRoot, 'roadmap/skin-exemptions.json'),
      componentsDir,
    }),
    // skin ownership migration (P-79): the THIRD way a skin silently paints nothing. It parses
    // (skins.parseErrors) and it is imported (skins.unwired), but every one of its
    // selectors anchors on a `[data-part='X']` the source never stamps -- because
    // Grid/Card drop a consumer's data-part, or the part was renamed, or it is a
    // typo. tsc accepts it, the counter does not read attributes, and the rule
    // reaches nobody. Static, exact-0: every part a skin selects for must be
    // stamped somewhere in the components tree.
    'skins.deadParts': countDeadParts(),
    // WO-ARC-12 (P-88): the pass-through fleet ratchet's three aggregates, read from the ONE
    // census the engine/skins/pass-through gate reads (that gate owns the roster and the
    // per-family sets). Ordinary decrease-only ceilings, never folded into skins.deadParts:
    // dead-parts counts a caller literal as a stamp, so it cannot see a dependent's rules die.
    ...passThroughCounters(),
    // WO-ARC-09: per-file inline-paint ratchet over the six workspace-tier
    // components' migratable files. Decrease-only; each checkpoint's exit is its
    // files at 0. See countArc09PaintInFile()'s doc for the paint-vs-layout rule.
    ...arc09InlinePaintCounters(),
    ...fleetInlinePaintCounters(),
    ...runtimeSvgPaintCounters(),
    ...embeddedCssPaintCounters(),
    // HARD-2 (owner ruling 7, WO-EVI-02): hardcode-census's obligations, folded
    // into this audit rather than a second census.
    ...skinLiteralCounters(),
    ...componentColorCounters(productiveComponentSources),
    ...inlineGeometryCounters(productiveComponentSources),
    'scale.fallbackParityColorViolations': fallbackParityExtensions.color,
    'scale.fallbackParityChannelViolations': fallbackParityExtensions.channel,
    ...fallbackParityFileCounters(fallbackParityExtensions),
    ...duplicateRootDeclarationCounters(),
  };

  const evasionProbe = applyEvasionFixture(counters);

  return { files, counters, themeCssAudit, classicThemeAudit, rusticThemeAudit, apca, evasionProbe };
}

export {
  collectAuditState,
};
