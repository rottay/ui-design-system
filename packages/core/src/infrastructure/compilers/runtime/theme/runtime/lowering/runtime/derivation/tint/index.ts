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
  derive: (context) => {
    const vars: Record<string, string> = {};
    setTintScaleVariables(vars, context.theme);
    return vars;
  },
};
