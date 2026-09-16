/**
 * @fileoverview The filter-chip vocabulary at the one resting value the Modern list-toolbar skin
 * reads, for every channel that paints the same resolved at the theme root.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/filter-chip
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own filter-chip chrome outranks every relation stated here. */
export const filterChipChromeDeriver: FamilyDeriver = {
  family: "filter-chip",
  rank: "derived",
  consumes: [
    "palette.*",
  ],
  produces: [
    "--ds-filter-chip-bg",
    "--ds-filter-chip-border",
  ],
  derive: () => deriveFilterChipChannels(),
};

export function deriveFilterChipChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-filter-chip-bg"] = "var(--ds-surface-card)";
  vars["--ds-filter-chip-border"] = "var(--ds-toolbar-control-border, var(--ds-color-border))";
  return vars;
}
