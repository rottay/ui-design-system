/**
 * @fileoverview The tint family: the closed five-step interaction scale.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/tint
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../foundation/contract";
import { setTintScaleVariables } from "../../../foundation/tint";

/**
 * The closed tint scale per palette role.
 *
 * A single role colour mixed over the page background generates every
 * interaction tint, which is what lets a vertical drop a foreign second blue
 * and re-derive hover/active/selected/focus from its primary alone.
 *
 * `consumes` names the palette decisions that fill the channels these formulas
 * READ, the way the notifier and alert families do; the derivation itself takes
 * no Theme, because a step that names `var(--ds-color-primary)` is correct for
 * a theme that seeds the role and for one that inherits the DS base.
 */
export const tintDeriver: FamilyDeriver = {
  family: "tint",
  rank: "derived",
  consumes: [
    "palette.primaryColor",
    "palette.successColor",
    "palette.warningColor",
    "palette.errorColor",
    "palette.infoColor",
  ],
  produces: ["--ds-tint-*"],
  derive: () => {
    const vars: Record<string, string> = {};
    setTintScaleVariables(vars);
    return vars;
  },
};
