/**
 * @fileoverview The surfaces family: the semantic surface grounds, shadows,
 * the decorative layer and its intensity dial. The material roots ON those
 * grounds are the materials family's, the geometry is the shape family's and
 * the depth is the elevation family's, so a theme's state stack has one
 * producer instead of two.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/surfaces
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import { semanticSurfaceRolesToSurfaceVariables } from "../../../foundation/materials";

/**
 * Everything a surface states: its grounds, its shadow ladder and its
 * decorative layer.
 *
 * Depth is NOT here. The elevation ladder and the stacking bands are one axis
 * with one owner (`../elevation`); a surface states what it is made of, not
 * how far off the page it sits.
 */
export const surfacesDeriver: FamilyDeriver = {
  family: "surfaces",
  rank: "derived",
  consumes: ["surfaces.*", "expressive.*"],
  produces: [
    "--ds-surface-*",
    "--ds-shadow-*",
    "--ds-glass-*",
    "--ds-gradient-*",
    "--ds-overlay-*",
    "--ds-effect-intensity",
  ],
  derive: (context) =>
    deriveSurfaceChannels(context.theme, context.expressive.expansion),
};

export function deriveSurfaceChannels(
  bt: FlatTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const su = bt.surfaces;
  const vars: Record<string, string> = {};
  if (!su) return vars;
  Object.assign(
    vars,
    semanticSurfaceRolesToSurfaceVariables(su.surfaceRoles ?? su.materials)
  );
  if (su.shadows) {
    if (su.shadows.sm) vars["--ds-shadow-sm"] = su.shadows.sm;
    if (su.shadows.md) vars["--ds-shadow-md"] = su.shadows.md;
    if (su.shadows.lg) vars["--ds-shadow-lg"] = su.shadows.lg;
    if (su.shadows.xl) vars["--ds-shadow-xl"] = su.shadows.xl;
    if (su.shadows.xs) vars["--ds-shadow-xs"] = su.shadows.xs;
    // `2xl` cannot be an identifier, so the field is `xxl` and the channel
    // keeps the scale's own spelling.
    if (su.shadows.xxl) vars["--ds-shadow-2xl"] = su.shadows.xxl;
    if (su.shadows.inner) vars["--ds-shadow-inner"] = su.shadows.inner;
    if (su.shadows.focusRing)
      vars["--ds-shadow-focus-ring"] = su.shadows.focusRing;
    if (su.shadows.focusRingError)
      vars["--ds-shadow-focus-ring-error"] = su.shadows.focusRingError;
  }
  if (su.glass) {
    // 'none' is legacy zero-decoration suppression. The premium.css defaults
    // plus the --ds-effect-intensity dial own collapse now, so emitting a
    // 'none' override clobbers premium.css for every non-zero-intensity
    // tenant. A tenant stays flat via --ds-effect-intensity: 0, never by
    // nulling the role token.
    if (su.glass.background && su.glass.background !== "none")
      vars["--ds-glass-bg"] = su.glass.background;
    if (su.glass.border && su.glass.border !== "none")
      vars["--ds-glass-border"] = su.glass.border;
    if (su.glass.blur && su.glass.blur !== "none")
      vars["--ds-glass-blur"] = su.glass.blur;
  }
  if (su.gradients) {
    if (su.gradients.primary && su.gradients.primary !== "none")
      vars["--ds-gradient-primary"] = su.gradients.primary;
    if (su.gradients.surface && su.gradients.surface !== "none")
      vars["--ds-gradient-surface"] = su.gradients.surface;
    if (su.gradients.mesh && su.gradients.mesh !== "none")
      vars["--ds-gradient-mesh"] = su.gradients.mesh;
  }
  if (su.overlays) {
    if (su.overlays.light) vars["--ds-overlay-light"] = su.overlays.light;
    if (su.overlays.medium) vars["--ds-overlay-medium"] = su.overlays.medium;
    if (su.overlays.heavy) vars["--ds-overlay-heavy"] = su.overlays.heavy;
  }
  // Premium effect-intensity dial (engines/modern spec section 5): multiplies
  // the gradient/glass/glow layer; 0 collapses it to flat.
  vars["--ds-effect-intensity"] = String(su.effectIntensity ?? 1);
  return vars;
}
