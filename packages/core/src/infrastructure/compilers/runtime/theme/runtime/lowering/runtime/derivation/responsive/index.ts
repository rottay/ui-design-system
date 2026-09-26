/**
 * @fileoverview The responsive family: the breakpoint ladder, projected as
 * channels. The governed container posture travels as data, never as a channel.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/responsive
 * @category Compilers
 * @package @rottay/design-system
 */

import { RESPONSIVE_BREAKPOINTS } from "@/foundation/contracts/kernel/responsive/breakpoints";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * One responsive contract, projected once.
 *
 * `responsive.posture` is NOT projected here (G103-02, WO-FAM-12). The
 * capability's own law is that the ladder "travels as DATA ... never a CSS
 * channel" (`tenants/capabilities`, the responsive.posture row): it reaches
 * layout through `normalizedAppearance` -> `useContainerPosture` / `spanBias`
 * -> `data-posture`, which the auto-fit kit reads. The four `--ds-posture-*`
 * channels this family once emitted had no reader anywhere (measured: core,
 * the showroom and all three apps), and a `@container` prelude cannot read a
 * custom property, so they were a second, unread authority beside the data
 * route and are retired rather than pinned.
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
  produces: ["--ds-breakpoint-*"],
  derive: (context) => deriveResponsiveChannels(context.theme),
};

/** The ladder is the same for every theme; the parameter keeps the deriver shape. */
export function deriveResponsiveChannels(
  _theme: FlatTheme
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [step, px] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
    if (step === PROJECTION_FLOOR) continue;
    vars[`--ds-breakpoint-${step}`] = `${px}px`;
  }
  return vars;
}
