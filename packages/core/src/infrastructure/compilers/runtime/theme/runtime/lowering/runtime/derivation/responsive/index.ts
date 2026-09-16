/**
 * @fileoverview The responsive family: the breakpoint ladder and the governed
 * container posture, projected as channels instead of travelling as data.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/responsive
 * @category Compilers
 * @package @rottay/design-system
 */

import { RESPONSIVE_BREAKPOINTS } from "@/foundation/contracts/kernel/responsive/breakpoints";
import {
  resolveResponsivePosture,
  RESPONSIVE_POSTURE_SCHEMA_VERSION,
} from "@/foundation/tokens/ts/presentation/responsive-postures";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * One responsive contract, projected once.
 *
 * `responsive.posture` used to enter the lowering and emit nothing: the
 * selected id travelled to the artifact as data and only the adaptive solver
 * could read it, so a tenant could not see, probe or style its own ladder. The
 * ladder is bounded data either way -- what changes here is that the ladder a
 * tenant selected is observable in the compiled block, on the same channels
 * every other family uses, next to the viewport scale it shares its vocabulary
 * with.
 *
 * The viewport steps are the ONE scale
 * (`foundation/contracts/kernel/responsive/breakpoints`); this family never
 * invents a second one. A CSS media query cannot read a custom property, so
 * these channels are the contract's value projection, not a replacement for
 * the thresholds a `@media` prelude spells out; the responsive token sheet is
 * the single place those literals are allowed to live.
 */
/**
 * The ladder's zero step is NOT projected as a channel.
 *
 * `xs` is `0`: the floor every other step is measured from, and the one rung a
 * consumer can never read. A `@media`/`@container` prelude cannot read a custom
 * property at all, and the routes that CAN read one -- the container measure
 * ladder that `derivation/chrome/container` wires to `--ds-breakpoint-{sm..2xl}`,
 * JS, a compiled tenant block -- have no use for a zero. It was emitted into
 * every tenant artifact and read by nobody (measured: 0 readers in core, the
 * showroom and all three apps), so it retires here rather than staying a
 * permanent dead writer. The STEP itself is untouched: `xs` remains a member of
 * `RESPONSIVE_BREAKPOINTS` and of the order every responsive hook cascades over.
 */
const PROJECTION_FLOOR = "xs";

export const responsiveDeriver: FamilyDeriver = {
  family: "responsive",
  rank: "derived",
  consumes: ["responsive.posture", "responsive.schemaVersion"],
  produces: [
    "--ds-breakpoint-*",
    "--ds-posture-container-compact-max",
    "--ds-posture-container-standard-max",
    "--ds-posture-span-bias",
    "--ds-posture-id",
  ],
  derive: (context) => deriveResponsiveChannels(context.theme),
};

export function deriveResponsiveChannels(
  bt: FlatTheme
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [step, px] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
    if (step === PROJECTION_FLOOR) continue;
    vars[`--ds-breakpoint-${step}`] = `${px}px`;
  }
  const selection = bt.responsive;
  const posture = resolveResponsivePosture(
    selection?.posture,
    selection?.schemaVersion ?? RESPONSIVE_POSTURE_SCHEMA_VERSION
  );
  vars["--ds-posture-id"] = posture.id;
  vars[
    "--ds-posture-container-compact-max"
  ] = `${posture.thresholds.compactMaxPx}px`;
  vars[
    "--ds-posture-container-standard-max"
  ] = `${posture.thresholds.standardMaxPx}px`;
  vars["--ds-posture-span-bias"] = posture.spanBias;
  return vars;
}
