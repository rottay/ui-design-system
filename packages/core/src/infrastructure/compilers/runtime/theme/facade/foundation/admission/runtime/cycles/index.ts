/**
 * @fileoverview Admission: an override may point a channel at another channel,
 * but not at itself.
 *
 * `chrome.controls.buttonGeometry.radius: var(--ds-radius-button)` passed every
 * station and was painted verbatim into the very channel it names, plus the
 * five per-size button radii derived from it -- a CSS custom property that
 * resolves to itself is invalid at use time, so the tenant's own button radius
 * silently became "no radius at all" while the ledger reported the override as
 * effective. The pill-vs-override law says the painted value and its
 * provenance agree or the combination is refused by name; this is the station
 * that refuses it.
 *
 * TWO READINGS, ONE LAW. The AUTHORED reading runs at the door, inside the
 * value station, where the override path still has a name: a chrome value is
 * refused when a `var()` it reads is a channel that same leaf WRITES, and the
 * write set is probed from `chromeToVariables` -- the one chrome emitter the
 * lowering itself calls -- so it covers the leaf's derived fan-out and can
 * never drift from it. The EMITTED reading is this owner: it runs after the
 * lowering over the tenant's own delta, where every governed override path has
 * already collapsed into channels, and refuses any cycle however many hops it
 * takes and whichever authoring route produced it.
 *
 * THE BOUNDARY. Both readings are closed over what the TENANT emitted. A
 * reference into a channel the tenant did not move resolves against the
 * vertical's own compiled baseline, which is code-owned and acyclic by
 * construction, so it is a legitimate cross-reference and stays admitted.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Cycles
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantThemeArtifactModeDelta } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { cyclesIn } from "../../foundation/references";
import type { ThemeAdmissionIssue } from "../../foundation/issues";

/** What this station measures: the tenant's own delta, block by block. */
interface EmittedDelta {
  readonly variables: Readonly<Record<string, string>>;
  readonly modeDeltas: readonly TenantThemeArtifactModeDelta[];
}

/**
 * Refuse an emission whose channels reference each other in a circle.
 *
 * Measured per EFFECTIVE block -- the base delta, and each mode delta over it
 * -- because a mode overlay can close a circle the base block leaves open.
 */
export function referenceCycleIssues(
  delta: EmittedDelta
): ThemeAdmissionIssue[] {
  const issues: ThemeAdmissionIssue[] = [];
  const reported = new Set<string>();
  const blocks: Readonly<Record<string, string>>[] = [
    delta.variables,
    ...delta.modeDeltas.map((block) => ({
      ...delta.variables,
      ...block.variables,
    })),
  ];
  for (const block of blocks) {
    for (const [channel, cycle] of cyclesIn(block)) {
      if (reported.has(channel)) continue;
      reported.add(channel);
      issues.push({
        code: "unsafe_value",
        path: `$.variables[${JSON.stringify(channel)}]`,
        message: `Appearance compiler emitted a reference cycle: ${cycle.join(
          " -> "
        )}`,
      });
    }
  }
  return issues;
}
