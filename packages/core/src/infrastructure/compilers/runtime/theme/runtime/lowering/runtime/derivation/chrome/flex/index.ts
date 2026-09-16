/**
 * @fileoverview The flex family: the room it leaves between children, and the
 * reflow it animates when the axis rearranges.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/flex
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own chrome outranks every relation stated here. */
export const flexChromeDeriver: FamilyDeriver = {
  family: "flex",
  rank: "derived",
  consumes: ["spacing.rhythm", "density", "motion.*"],
  produces: [
    "--ds-flex-column-gap",
    "--ds-flex-gap",
    "--ds-flex-reflow-transition",
    "--ds-flex-row-gap",
  ],
  derive: () => deriveFlexChannels(),
};

/**
 * The three gap channels carry their resting value here and the caller's own
 * gap inline: a rung resolves to a ramp token the skin may scale by rhythm, a
 * measurement resolves to itself and the skin's enumerated rung selectors never
 * match it. That split is the exact-geometry law, and it lives in the selector,
 * not in a value.
 */
export function deriveFlexChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-flex-gap"] = "0px";
  vars["--ds-flex-column-gap"] = "0px";
  vars["--ds-flex-row-gap"] = "0px";
  vars["--ds-flex-reflow-transition"] = "var(--ds-transition-rearrange)";
  return vars;
}
