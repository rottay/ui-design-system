/**
 * @fileoverview The single admission: one policy, every origin.
 *
 * Five stations -- tier, engine, envelope, contrast, limits -- asked in one
 * place by `compileThemeIntent`. Before WO-CAT-03 four of the five existed only
 * inside `compileTenantTheme`, so `static-vertical`, `preview` and the
 * `BrandTheme` draft reached the channel writers with only the engine checked:
 * a preview accepted `typography.scale 100`, `radiusScale 9`, `notacolor` and a
 * palette under the APCA floor that publish refused (F-13), and any consumer
 * holding the published `compileTheme` could skip even that (F-24).
 *
 * SPLIT IN TWO, AND WHY. Tier, engine and envelope are questions about the
 * INTENT, so they are asked before a single channel is written -- a refusal
 * that arrives after the compile has already run is a refusal that paid for
 * the thing it refuses. Contrast and limits are questions about the EMISSION,
 * which does not exist until the lowering has run, and they are measured
 * against the vertical's own compile because a tenant is only answerable for
 * what it changed.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission
 * @category Compilers
 * @package @rottay/design-system
 */

import type { EngineAdapter } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type {
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import { baselineFor } from "../../../runtime/resolution";
import { movedLeaves } from "./foundation/authorship";
import { admitEngine } from "./runtime/engine";
import { chartCategoryIssues, compiledChartGrounds, contrastIssues } from "./runtime/contrast";
import { envelopeIssues } from "./runtime/envelope";
import { ThemeAdmissionError, refuse, type ThemeAdmissionIssue } from "./foundation/issues";
import { limitIssues, themeChannelDelta } from "./runtime/limits";
import type { ThemeChannelDelta } from "./runtime/limits";
import { tierIssues } from "./runtime/tier";

export { ThemeAdmissionError };
export type { ThemeAdmissionIssue };

/** What an emission-stage refusal graded before it refused. */
export interface RefusedThemeCompilation {
  readonly compiled: ThemeCompilation;
  readonly baseline: ThemeCompilation;
  readonly delta: ThemeChannelDelta;
}
export {
  authoredForegroundChannels,
  chartCategoryIssues,
  compiledChartGrounds,
  contrastIssues,
  DEFAULT_CHART_GROUNDS,
  SIDEBAR_CONTRAST_ATTRIBUTION,
} from "./runtime/contrast";
export {
  authoredColorIssues,
  closedDomainIssues,
  envelopeIssues,
  envelopeRangeIssues,
  readThemePath,
} from "./runtime/envelope";
export {
  assertExpressiveEdgeWidthInvariant,
  isSafeVisualValue,
  limitIssues,
  sortedThemeVariables,
  themeChannelDelta,
} from "./runtime/limits";
export type { ThemeChannelDelta } from "./runtime/limits";
export { decisionsAboveTier, decisionsActivatedBy, tierIssues } from "./runtime/tier";
export { admitEngine } from "./runtime/engine";
export {
  authoredLeaves,
  authoredUnderPrefix,
  isAuthoredLeaf,
  movedLeaves,
} from "./foundation/authorship";

/**
 * Ask the intent questions: what plan entitles this, what engine renders it,
 * and does every authored value sit inside the vertical's envelope and its
 * closed domains.
 *
 * The engine check runs on its own error type (`EngineNotAdmittedForCompileError`
 * / `EngineControlUnsupportedError`) rather than as an issue, because those two
 * refusals are already published names a caller catches; folding them into a
 * list would retire a contract to gain nothing.
 */
export function admitThemeIntent(input: {
  intent: ThemeIntent;
  resolution: ThemeResolution;
  adapter: EngineAdapter;
}): void {
  const { intent, resolution, adapter } = input;
  admitEngine(adapter, resolution.provenance);
  if (!resolution.provenance.tenantAuthored) return;
  // What this tenant MOVED against its vertical.
  //
  // Not `provenance.authoredPaths`: that set is a documented over-approximation
  // -- it enumerates container keys and the v1 migration's `undefined`-valued
  // palette fields, so a document that only set a background reads as having
  // authored every ink. And not membership alone: a `BrandTheme` draft carries
  // the whole theme it was opened on, so every value the author never touched
  // is still in the patch. A tenant answers for what it changed.
  //
  // The baseline is RESOLVED, never compiled: these stations run before a
  // single channel is written.
  const baseline = baselineFor(intent.vertical, intent.slug);
  const leaves = movedLeaves(intent.patch, baseline);
  refuse([
    ...tierIssues(leaves, intent.entitlement),
    ...envelopeIssues(
      resolution.theme,
      leaves,
      getTenantThemeVerticalEnvelope(intent.vertical),
      baseline
    ),
  ]);
}

/**
 * Ask the emission questions: does what this tenant CHANGED clear the APCA
 * floor, the categorical chart floor, the value grammar and the payload
 * ceilings.
 *
 * The delta against the vertical's own compile is computed once here and
 * returned, because the DB terminal writes exactly those bytes into its
 * artifact and recomputing them would be a second answer to "what did this
 * tenant move".
 */
export function admitThemeCompilation(input: {
  resolution: ThemeResolution;
  compiled: ThemeCompilation;
  baseline: ThemeCompilation;
  patch: ThemeLayerPatch;
  baselineTheme: Theme;
}): ReturnType<typeof themeChannelDelta> {
  const { resolution, compiled, baseline, patch, baselineTheme } = input;
  const delta = themeChannelDelta(compiled, baseline);
  if (!resolution.provenance.tenantAuthored) return delta;
  const issues: ThemeAdmissionIssue[] = [
    ...contrastIssues(compiled, baseline, patch, baselineTheme),
    ...chartCategoryIssues(delta.variables, compiledChartGrounds(compiled)),
    ...limitIssues(delta),
  ];
  // The refusal carries what it graded: an authoring surface has to tell its
  // author WHICH pair is illegible, and the pair only exists in the compile.
  refuse(issues, { compiled, baseline, delta });
  return delta;
}
