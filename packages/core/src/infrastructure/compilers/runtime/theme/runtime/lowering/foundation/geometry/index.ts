/**
 * @fileoverview The geometry facts every shape reader needs: the vertical's
 * radius baseline, and the channels a bounded button silhouette states.
 *
 * @module Compilers/Theme/Lowering/Foundation/geometry
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { dialReachableRadius, resolveRadiusScale } from "@/foundation/kernel/geometry/radius-dial";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import {
  appearancePostureToVariables,
  buttonStyleRadius,
} from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";

/**
 * The `--ds-radius-scale` the VERTICAL's own dial position resolves to.
 *
 * This is the divisor every authored radius is normalized against, and the
 * tenant's own statement is deliberately excluded from it. A resolved theme
 * already carries the tenant patch, so reading `surfaces.radiusScale` off it
 * gave a divisor that tracked the dial the same block emits -- the product was
 * then constant for every scale, which is the self-cancellation F-07 measured
 * across all three verticals. When the tenant re-dials, the vertical's position
 * is the geometry its expressive profile states; when it does not, the theme's
 * own value IS the vertical's.
 */
export function resolveRadiusBaseline(
  theme: FlatTheme,
  expansion: ExpressiveExpansion,
  tenantRadiusScale: number | undefined
): string {
  const verticalScale =
    tenantRadiusScale === undefined ? theme.surfaces?.radiusScale : undefined;
  return (
    appearancePostureToVariables({ radiusScale: verticalScale })[
      "--ds-radius-scale"
    ] ??
    appearancePostureToVariables(expansion.fieldDefaults)["--ds-radius-scale"] ??
    "1"
  );
}

/** The silhouette radius a bounded word resolves to, dial-reachable. */
function silhouetteRadius(
  buttonStyle: AppearancePostureFields["buttonStyle"],
  radiusBaseline: string
): string | undefined {
  const authored = buttonStyleRadius(buttonStyle);
  return authored === undefined
    ? undefined
    : dialReachableRadius(authored, resolveRadiusScale(radiusBaseline));
}

/**
 * The alias a silhouette publishes, and nothing else.
 *
 * This is what an unstated posture may imply: an expressive profile filling the
 * word nobody chose states the family's ramp alias, not the five per-size radii
 * a component skin varies on purpose.
 */
export function buttonSilhouetteAlias(
  buttonStyle: AppearancePostureFields["buttonStyle"],
  radiusBaseline: string
): Record<string, string> {
  const radius = silhouetteRadius(buttonStyle, radiusBaseline);
  return radius === undefined ? {} : { "--ds-radius-button": radius };
}

/**
 * Every channel a NAMED button radius states, folded onto the same dial.
 *
 * The same six channels `buttonSilhouetteChannels` writes, because they are the
 * same leaf: an override that moved `--ds-radius-button` while five per-size
 * radii kept the silhouette's value would replace one answer with two. Folded
 * through `dialReachableRadius` for the same reason the chrome family folds its
 * own radii through `applyRadiusDial` -- an authored radius is a value at the
 * vertical's dial position, and the grammar it is emitted in must not depend on
 * which rank happened to write it.
 */
export function buttonRadiusChannels(
  radius: string | undefined,
  radiusBaseline: string
): Record<string, string> {
  if (radius === undefined) return {};
  const folded = dialReachableRadius(radius, resolveRadiusScale(radiusBaseline));
  return {
    "--ds-radius-button": folded,
    "--ds-button-xs-radius": folded,
    "--ds-button-sm-radius": folded,
    "--ds-button-md-radius": folded,
    "--ds-button-lg-radius": folded,
    "--ds-button-xl-radius": folded,
  };
}

/**
 * Every channel a CHOSEN `shape.button-style` states, for BOTH transports.
 *
 * The DB ingress used to expand the silhouette into a `chrome.controls`
 * geometry leaf of its own, so the same word reached six channels through a
 * document and one through a static theme. The expansion belongs to the
 * lowering, where neither transport can miss it: the alias the ramp publishes
 * plus the five per-size radii the button skin actually paints through.
 */
export function buttonSilhouetteChannels(
  buttonStyle: AppearancePostureFields["buttonStyle"],
  radiusBaseline: string
): Record<string, string> {
  const radius = silhouetteRadius(buttonStyle, radiusBaseline);
  if (radius === undefined) return {};
  // Written as explicit per-size assignments, not a loop: an interpolated
  // channel template belongs to no enumerator, and both the reach gate and the
  // typed parity graph resolve a `for…of` binding to a wildcard that names no
  // concrete channel.
  return {
    "--ds-radius-button": radius,
    "--ds-button-xs-radius": radius,
    "--ds-button-sm-radius": radius,
    "--ds-button-md-radius": radius,
    "--ds-button-lg-radius": radius,
    "--ds-button-xl-radius": radius,
  };
}
