/**
 * @fileoverview Shape sub-owner: how tall a control stands, as one factor
 * every control family folds in beside the density scale.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape/control-height
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";

/**
 * Kit row 14, as three statements about ONE factor.
 *
 * A FACTOR, not a ramp. Every control family already pairs its own size ramp
 * with the control radii a vertical chose for it -- BitHire runs 26/32/36/40/46
 * against 7/8/9/10/11 on purpose -- so a governed absolute ramp would be a
 * fifth size vocabulary beside the four the kit row already counts, and it
 * would flatten the pairing it was supposed to govern. Shifting the ramp the
 * vertical authored keeps that pairing and still moves every family.
 *
 * `standard` is the identity: the resting height ladder is expressible, so a
 * tenant can name it back after a vertical baseline moved it.
 *
 * The factors are deliberately narrow. A control height is a pointer target
 * before it is a posture, and the mechanical floors the control skins already
 * carry (32px fine, 36px default, 44px coarse) clamp the compact end anyway --
 * a wider dial would only be clamped further, which reads as a control that
 * ignores its own decision.
 */
const CONTROL_HEIGHT_SCALE: Readonly<
  Record<
    NonNullable<NonNullable<FlatTheme["surfaces"]>["controlHeight"]>,
    string
  >
> = {
  compact: "0.9",
  standard: "1",
  tall: "1.15",
};

/**
 * The posture the theme DECIDED, or nothing.
 *
 * Own-property guarded for the same reason `../../typography/weights` is: a
 * FlatTheme is plain data by the time it reaches this compiler, so a bare
 * bracket read of a closed table resolves inherited members and unknown words
 * alike -- and the literal string `undefined` inside a `calc()` product
 * invalidates the whole declaration, which collapses every control to its
 * content height.
 */
export function deriveControlHeightScale(
  bt: FlatTheme
): Record<string, string> {
  const authored = bt.surfaces?.controlHeight;
  if (
    typeof authored !== "string" ||
    !Object.prototype.hasOwnProperty.call(CONTROL_HEIGHT_SCALE, authored)
  ) {
    return {};
  }
  return {
    "--ds-control-height-scale":
      CONTROL_HEIGHT_SCALE[authored as keyof typeof CONTROL_HEIGHT_SCALE],
  };
}
