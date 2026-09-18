/**
 * @fileoverview The grid family: the room between its tracks, and the reflow it
 * animates when the tracks rearrange.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/grid
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own chrome outranks every relation stated here. */
export const gridChromeDeriver: FamilyDeriver = {
  family: "grid",
  rank: "derived",
  consumes: ["spacing.rhythm", "density", "motion.*"],
  produces: ["--ds-grid-gap", "--ds-grid-reflow-transition"],
  derive: () => deriveGridChannels(),
};

/**
 * `--ds-grid-gap` carries the resting value here and the caller's own gap
 * inline: a rung resolves to a ramp token the skin may scale by rhythm, a
 * measurement resolves to itself and the skin's enumerated rung selectors never
 * match it. The two axis seams stay private (`--_ds-grid-{column,row}-gap`)
 * because a family writer does not mint public channels for an intermediate.
 */
export function deriveGridChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-grid-gap"] = "var(--ds-spacing-4, 1rem)";
  vars["--ds-grid-reflow-transition"] = "var(--ds-transition-rearrange)";
  return vars;
}
