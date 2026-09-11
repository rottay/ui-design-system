/**
 * @fileoverview Shape sub-owner: the law a nested corner follows, stated as
 * the two operands the concentric derivation already reads.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape/nesting
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

/**
 * Kit row 12, as two statements about ONE derivation.
 *
 * Card and SemanticSurface derive a nested corner the same way: the parent's
 * resolved radius minus an inset, where the inset is the smaller of the
 * container's own padding and the LARGER of a governed floor
 * (`--ds-radius-nest-inset`) and a fraction of the parent radius
 * (`--ds-radius-nest-ratio`). That fraction used to be a literal `/ 2` inside
 * both consumers, which is why a tenant could scale the radius ramp but never
 * decide whether nesting stepped the corner down at all.
 *
 * The row states both operands because either one alone cannot express
 * `uniform`: the ratio term floors the inset at half the parent radius, so
 * zeroing only the governed floor leaves the step-down in place, and zeroing
 * only the ratio leaves the 4px floor. Together they collapse the inset to
 * zero, and `max(0, parent - 0)` IS the parent corner.
 *
 * `concentric` restates the resting law rather than differing from it, for the
 * same reason `typography.roleWeights: regular` does: a posture that had to
 * differ from the default to be expressible would make the default
 * inexpressible.
 */
const NESTING_LAW: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["surfaces"]>["nesting"]>,
    Readonly<Record<string, string>>
  >
> = {
  concentric: {
    "--ds-radius-nest-inset": "4px",
    "--ds-radius-nest-ratio": "0.5",
  },
  uniform: {
    "--ds-radius-nest-inset": "0px",
    "--ds-radius-nest-ratio": "0",
  },
};

/**
 * The nesting law the theme DECIDED, or nothing.
 *
 * Own-property guarded for the same reason `../../typography/weights` is: a
 * BrandTheme is plain data by the time it reaches this compiler, so a bare
 * bracket read of a closed table resolves inherited members and unknown words
 * alike -- the first would paint the literal string `undefined` into a `max()`
 * operand and take every nested corner with it.
 */
export function deriveNestingLaw(bt: BrandTheme): Record<string, string> {
  const authored = bt.surfaces?.nesting;
  if (
    typeof authored !== "string" ||
    !Object.prototype.hasOwnProperty.call(NESTING_LAW, authored)
  ) {
    return {};
  }
  return { ...NESTING_LAW[authored as keyof typeof NESTING_LAW] };
}
