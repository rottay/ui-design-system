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
  isDensityPreference,
  resolveDensityModeFactor,
} from "@/foundation/tokens/ts/foundation/base/density";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * The two independent density inputs, and nothing else.
 *
 * `normal` USED TO BE INEXPRESSIBLE. The posture table emitted the mode factor
 * only when it differed from 1, so a vertical whose baseline is compact could
 * not be brought back to normal by any decision: the channel simply went
 * unstated and the compact baseline kept winning. An AUTHORED posture is a
 * statement, including when it states the identity, so it is emitted either
 * way -- which is what makes "set it back to normal" a reachable request
 * rather than an absence. A posture the expressive PROFILE merely defaults to
 * is not an authored statement and keeps the old silence at the identity, so
 * an absent decision still compiles to an absent channel.
 *
 * `densityScale` is the structural white-label multiplier and `density` is the
 * semantic posture; they are orthogonal by construction and stay two channels.
 * The effective scale they compose is derived ONCE, in
 * `foundation/base/spacing` and its density-boundary projection, so the clamp
 * has one author rather than one per transport.
 */
export const densityDeriver: FamilyDeriver = {
  family: "density",
  rank: "derived",
  consumes: ["surfaces.densityScale", "surfaces.density", "expressive.*"],
  produces: ["--ds-density-scale", "--ds-density-mode-factor"],
  derive: (context) =>
    deriveDensityChannels(context.theme, context.expressive.expansion),
};

export function deriveDensityChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const vars: Record<string, string> = {
    "--ds-density-scale": String(bt.surfaces?.densityScale ?? 1),
  };
  const profile = expansion.fieldDefaults.density;
  if (isDensityPreference(profile)) {
    const factor = resolveDensityModeFactor(profile);
    if (factor !== 1) vars[DENSITY_MODE_FACTOR_VARIABLE] = String(factor);
  }
  const authored = bt.surfaces?.density;
  if (isDensityPreference(authored)) {
    vars[DENSITY_MODE_FACTOR_VARIABLE] = String(
      resolveDensityModeFactor(authored)
    );
  }
  return vars;
}
