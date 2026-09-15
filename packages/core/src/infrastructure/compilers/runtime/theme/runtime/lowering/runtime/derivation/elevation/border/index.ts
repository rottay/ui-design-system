/**
 * @fileoverview Elevation sub-owner: the keyline weight, authored directly.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation/border
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

/**
 * Kit row 18, as three statements about the three border-width ROLES.
 *
 * The values are the edge vocabulary the expressive `edge` axis already
 * publishes (`borderless-shadow`, `hairline`, `outlined`), reused rather than
 * re-invented: a decision and a profile that disagreed about what "1px" means
 * would be two edge ladders, and the profile is the floor this decision is
 * expected to outrank, not a different scale.
 *
 * The three widths are the WHOLE row. No border style is stated: a `0px`
 * role width already draws nothing, and the style token the skins compose
 * beside these widths is `--ds-edge-standard-style`, which the expressive
 * `edge` axis owns.
 *
 * Structural `--ds-border-width-{0,1,2,4,8}` scale tokens are untouched: this
 * posture modulates roles, never the scale. Selection, error and focus borders
 * ride their own state channels, so no value here can make a state
 * border-only invisible.
 */
const BORDER_POSTURE: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["surfaces"]>["borderStyle"]>,
    Readonly<Record<string, string>>
  >
> = {
  none: {
    "--ds-edge-hairline-width": "0px",
    "--ds-edge-standard-width": "0px",
    "--ds-edge-emphasis-width": "1px",
  },
  hairline: {
    "--ds-edge-hairline-width": "1px",
    "--ds-edge-standard-width": "1px",
    "--ds-edge-emphasis-width": "1px",
  },
  strong: {
    "--ds-edge-hairline-width": "1px",
    "--ds-edge-standard-width": "1.5px",
    "--ds-edge-emphasis-width": "2px",
  },
};

/**
 * The keyline the theme DECIDED, or nothing.
 *
 * Own-property guarded for the same reason `../../typography/weights` is: a
 * BrandTheme is plain data by the time it reaches this compiler, so a bare
 * bracket read of a closed table resolves inherited members and unknown words
 * alike -- the first would paint the literal string `undefined` onto three
 * width roles, the second would throw and take the compile down.
 */
export function deriveBorderPosture(bt: BrandTheme): Record<string, string> {
  const authored = bt.surfaces?.borderStyle;
  if (
    typeof authored !== "string" ||
    !Object.prototype.hasOwnProperty.call(BORDER_POSTURE, authored)
  ) {
    return {};
  }
  return { ...BORDER_POSTURE[authored as keyof typeof BORDER_POSTURE] };
}
