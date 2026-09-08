/**
 * @fileoverview The radius dial a theme resolves to, and the one divisor every
 * radius operand is emitted against.
 *
 * @module Compilers/Theme/Lowering/Foundation/dial
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";

/**
 * The `--ds-radius-scale` this theme's dial resolves to, as a string.
 *
 * Resolved once and carried on the lowering context, never re-derived per
 * consumer: the chrome emitter and the surfaces family both DIVIDE authored
 * radius literals by this exact number, and a divisor that disagrees with the
 * declared scale is a silent repaint rather than a failure.
 *
 * The VERTICAL dial, deliberately. A tenant that re-dials radius states that
 * at the tenant rank, above the operands; folding it into the divisor as well
 * would apply the tenant's dial twice.
 */
export function resolveRadiusScaleChannel(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): string {
  return (
    appearancePostureToVariables({ radiusScale: bt.surfaces?.radiusScale })[
      "--ds-radius-scale"
    ] ??
    appearancePostureToVariables(expansion.fieldDefaults)["--ds-radius-scale"] ??
    "1"
  );
}
