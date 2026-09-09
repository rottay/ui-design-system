/**
 * @fileoverview The density family: one vocabulary, one factor table, and a
 * posture that stays expressible at its identity value.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/density
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  DENSITY_MODE_FACTOR_VARIABLE,
  DENSITY_SCALE_BOUNDS,
  isDensityPreference,
  resolveDensityModeFactor,
} from "@/foundation/tokens/ts/foundation/base/density";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * The two independent density inputs, and the one effective scale they compose.
 *
 * `normal` USED TO BE INEXPRESSIBLE. The posture table emitted the mode factor
 * only when it differed from 1, so a vertical whose baseline is compact could
 * not be brought back to normal by any decision: the channel simply went
 * unstated and the compact baseline kept winning. A posture is a statement,
 * including when it states the identity, so the factor is emitted whenever a
 * posture is present -- which is what makes "set it back to normal" a
 * reachable request rather than an absence.
 *
 * `densityScale` is the structural white-label multiplier and `density` is the
 * semantic posture; they are orthogonal by construction and composed here, in
 * the compiler, so the CSS ramp reads ONE effective channel instead of
 * recomposing three inputs at every declaration site.
 */
export const densityDeriver: FamilyDeriver = {
  family: "density",
  rank: "derived",
  consumes: ["surfaces.densityScale", "surfaces.density", "expressive.*"],
  produces: [
    "--ds-density-scale",
    "--ds-density-mode-factor",
    "--ds-density-posture",
    "--ds-density-global-effective-scale",
  ],
  derive: (context) =>
    deriveDensityChannels(context.theme, context.expressive.expansion),
};

export function deriveDensityChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const structural = bt.surfaces?.densityScale ?? 1;
  const posture = isDensityPreference(bt.surfaces?.density)
    ? bt.surfaces!.density!
    : isDensityPreference(expansion.fieldDefaults.density)
    ? expansion.fieldDefaults.density!
    : undefined;
  const vars: Record<string, string> = {
    "--ds-density-scale": String(structural),
  };
  if (posture === undefined) return vars;
  const modeFactor = resolveDensityModeFactor(posture);
  vars["--ds-density-posture"] = posture;
  vars[DENSITY_MODE_FACTOR_VARIABLE] = String(modeFactor);
  vars["--ds-density-global-effective-scale"] = `clamp(${
    DENSITY_SCALE_BOUNDS.min
  }, calc(${structural} * ${modeFactor}), ${DENSITY_SCALE_BOUNDS.max})`;
  return vars;
}
