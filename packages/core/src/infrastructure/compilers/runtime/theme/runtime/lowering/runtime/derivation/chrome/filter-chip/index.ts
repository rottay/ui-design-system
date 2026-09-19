/**
 * @fileoverview The filter-chip vocabulary at the one resting value the Modern list-toolbar skin
 * reads, for every channel that paints the same resolved at the theme root.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/filter-chip
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own filter-chip chrome outranks every relation stated here.
 *
 * The chip radius rests on the EXPANSION of the skin's
 * `--ds-list-toolbar-radius-control` alias rather than on the alias itself: the
 * ladder is declared on the component root and is invisible at the theme root
 * this deriver writes to, so naming it would silently drop to the literal.
 * Expanded, the root value is byte-equal to what the ladder resolves to on the
 * chip, and a tenant that moves `--ds-button-sm-radius` still moves it.
 */
export const filterChipChromeDeriver: FamilyDeriver = {
  family: "filter-chip",
  rank: "derived",
  consumes: [
    "palette.*",
  ],
  produces: [
    "--ds-filter-chip-bg",
    "--ds-filter-chip-border",
    "--ds-filter-chip-radius",
  ],
  derive: () => deriveFilterChipChannels(),
};

export function deriveFilterChipChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-filter-chip-bg"] = "var(--ds-surface-card)";
  vars["--ds-filter-chip-border"] = "var(--ds-toolbar-control-border, var(--ds-color-border))";
  vars["--ds-filter-chip-radius"] = "var(--ds-button-sm-radius, var(--ds-radius-sm, 6px))";
  return vars;
}
