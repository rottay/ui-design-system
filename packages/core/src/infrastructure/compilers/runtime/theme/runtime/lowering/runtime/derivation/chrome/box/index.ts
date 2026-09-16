/**
 * @fileoverview The box family: the corner and the depth the polymorphic
 * escape hatch may wear, each rung named so a decision can move it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/box
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own chrome outranks every relation stated here. */
export const boxChromeDeriver: FamilyDeriver = {
  family: "box",
  rank: "derived",
  consumes: ["surfaces.radiusScale", "surfaces.elevation"],
  produces: [
    "--ds-box-corner-2xl",
    "--ds-box-corner-full",
    "--ds-box-corner-lg",
    "--ds-box-corner-md",
    "--ds-box-corner-sm",
    "--ds-box-corner-xl",
    "--ds-box-corner-xs",
    "--ds-box-depth-2xl",
    "--ds-box-depth-lg",
    "--ds-box-depth-md",
    "--ds-box-depth-sm",
    "--ds-box-depth-xl",
    "--ds-box-depth-xs",
  ],
  derive: () => deriveBoxChannels(),
};

/**
 * Both ladders are pure projections of a shared scale: the corner rungs read the
 * radius ramp and the depth rungs read the elevation ramp, so `shape.radiusScale`
 * and `surfaces.elevation` reach every Box without the family owning a value of
 * its own. `2xl` mounts `--ds-elevation-6` bare -- the old `--ds-elevation-5`
 * fallback described a token layer that no longer exists and could never fire.
 */
export function deriveBoxChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // Written one literal key at a time on purpose: the producer census reads
  // `vars["--ds-x"] = ...` assignments out of this source, so a computed key is
  // an emission nothing can see.
  vars["--ds-box-corner-xs"] = "var(--ds-radius-xs)";
  vars["--ds-box-corner-sm"] = "var(--ds-radius-sm)";
  vars["--ds-box-corner-md"] = "var(--ds-radius-md)";
  vars["--ds-box-corner-lg"] = "var(--ds-radius-lg)";
  vars["--ds-box-corner-xl"] = "var(--ds-radius-xl)";
  vars["--ds-box-corner-2xl"] = "var(--ds-radius-2xl)";
  vars["--ds-box-corner-full"] = "var(--ds-radius-full)";
  vars["--ds-box-depth-xs"] = "var(--ds-elevation-1)";
  vars["--ds-box-depth-sm"] = "var(--ds-elevation-2)";
  vars["--ds-box-depth-md"] = "var(--ds-elevation-3)";
  vars["--ds-box-depth-lg"] = "var(--ds-elevation-4)";
  vars["--ds-box-depth-xl"] = "var(--ds-elevation-5)";
  vars["--ds-box-depth-2xl"] = "var(--ds-elevation-6)";
  return vars;
}
