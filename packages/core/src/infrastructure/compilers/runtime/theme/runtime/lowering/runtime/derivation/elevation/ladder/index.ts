/**
 * @fileoverview Elevation sub-owner: the seven-role ladder and the three
 * postures that scale it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation/ladder
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";

export type ElevationPosture = NonNullable<
  AppearancePostureFields["elevation"]
>;

/** The seven canonical roles, from the resting ground to the deepest overlay. */
export const ELEVATION_ROLES = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * Per-role KEY and AMBIENT depth, in the same units the foundation ramp uses.
 * `soft` is the identity posture: it states no override, so the derived
 * foundation ramp stands.
 */
const POSTURE_LADDER: Readonly<
  Record<Exclude<ElevationPosture, "soft">, readonly string[]>
> = {
  flat: [
    "none",
    "none",
    "none",
    "0 1px 2px rgba(0,0,0,0.05)",
    "0 1px 3px rgba(0,0,0,0.06)",
    "0 2px 4px rgba(0,0,0,0.07)",
    "0 2px 6px rgba(0,0,0,0.08)",
  ],
  elevated: [
    "none",
    "0 2px 4px rgba(0,0,0,0.08)",
    "0 4px 8px rgba(0,0,0,0.1)",
    "0 8px 16px rgba(0,0,0,0.12)",
    "0 16px 32px rgba(0,0,0,0.14)",
    "0 24px 48px rgba(0,0,0,0.16)",
    "0 32px 64px rgba(0,0,0,0.18)",
  ],
};

/** Border weight the posture implies; a flat ladder leans on the edge instead. */
const POSTURE_BORDER_STYLE: Readonly<Record<ElevationPosture, string>> = {
  flat: "solid",
  soft: "solid",
  elevated: "none",
};

/**
 * The ladder a posture presets, over all seven roles.
 *
 * The preset table used to state levels 1..3 only, so `flat` left roles 4..6
 * carrying the full derived ramp: a theme that asked for a flat product still
 * got a deep modal shadow, and the ladder it published was three steps of one
 * posture on top of four of another. A posture is a statement about the whole
 * ladder or it is not a posture.
 */
export function deriveElevationLadder(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const su = bt.surfaces;
  const posture = su ? su.elevation ?? expansion.fieldDefaults.elevation : undefined;
  const vars: Record<string, string> = {};
  if (posture) {
    vars["--ds-elevation-border-style"] = POSTURE_BORDER_STYLE[posture];
    const ladder = posture === "soft" ? undefined : POSTURE_LADDER[posture];
    if (ladder) {
      for (const role of ELEVATION_ROLES) {
        vars[`--ds-elevation-${role}`] = ladder[role]!;
      }
    }
  }
  const authored = su?.elevations;
  if (authored) {
    if (authored.level0) vars["--ds-elevation-0"] = authored.level0;
    if (authored.level1) vars["--ds-elevation-1"] = authored.level1;
    if (authored.level2) vars["--ds-elevation-2"] = authored.level2;
    if (authored.level3) vars["--ds-elevation-3"] = authored.level3;
    if (authored.level4) vars["--ds-elevation-4"] = authored.level4;
    if (authored.level5) vars["--ds-elevation-5"] = authored.level5;
  }
  return vars;
}
