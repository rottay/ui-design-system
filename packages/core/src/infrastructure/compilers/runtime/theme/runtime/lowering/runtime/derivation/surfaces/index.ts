/**
 * @fileoverview The surfaces family: the semantic surface grounds, radius
 * operands, shadows, the elevation ladder, the decorative layer and its
 * intensity dial. The material roots ON those grounds are the materials
 * family's, so a theme's state stack has one producer instead of two.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/surfaces
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { FamilyDeriver } from "../../../foundation/contract";
import { ELEVATION_PRESET_CHANNELS } from "../../../foundation/contract";
import { semanticSurfaceRolesToSurfaceVariables } from "../../../foundation/materials";

const ELEVATION_CHANNELS: ReadonlySet<string> = new Set<string>(
  ELEVATION_PRESET_CHANNELS
);

/** The ladder a bounded elevation posture presets, and nothing else. */
function elevationPresetVariables(
  elevation: Parameters<typeof appearancePostureToVariables>[0]["elevation"]
): Record<string, string> {
  if (!elevation) return {};
  const vars: Record<string, string> = {};
  for (const [channel, value] of Object.entries(
    appearancePostureToVariables({ elevation })
  )) {
    if (ELEVATION_CHANNELS.has(channel)) vars[channel] = value;
  }
  return vars;
}

/**
 * Everything a surface states: its grounds, its geometry operands, its shadow
 * and elevation ladders and its decorative layer.
 *
 * The elevation preset a posture implies is emitted here rather than with the
 * scale axes, because the authored ladder that outranks it is a surfaces
 * statement -- one family, one channel, resolved in one place instead of two
 * writers separated by three hundred lines.
 */
export const surfacesDeriver: FamilyDeriver = {
  family: "surfaces",
  rank: "derived",
  consumes: ["surfaces.*", "expressive.*"],
  produces: [
    "--ds-elevation-*",
    "--ds-surface-*",
    "--ds-radius-*",
    "--ds-shadow-*",
    "--ds-glass-*",
    "--ds-gradient-*",
    "--ds-overlay-*",
    "--ds-effect-intensity",
  ],
  derive: (context) =>
    deriveSurfaceChannels(
      context.theme,
      context.radiusScale,
      context.expressive.expansion
    ),
};

export function deriveSurfaceChannels(
  bt: BrandTheme,
  radiusScaleChannel: string,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const su = bt.surfaces;
  const vars: Record<string, string> = {};
  if (!su) return vars;
  Object.assign(
    vars,
    elevationPresetVariables(su.elevation ?? expansion.fieldDefaults.elevation)
  );
  Object.assign(
    vars,
    semanticSurfaceRolesToSurfaceVariables(su.surfaceRoles ?? su.materials)
  );
  if (su.borderRadius) {
    // sm/md/lg/xl are emitted as the `-base` OPERANDS of the foundation dial,
    // never as resolved radii: `themes/default.css` computes each step as
    // `calc(base * var(--ds-radius-scale, 1))`, and a flat `--ds-radius-*` at
    // tenant scope replaces that calc entirely, which is how the dial stops
    // being able to move them. The division is expressed in CSS rather than
    // evaluated here so the browser multiplies and divides in one pass, which
    // is exact for any scale instead of correct only for the ones that divide
    // evenly. Written as explicit per-step assignments, not a loop: the typed
    // graph both parity gates share seeds identifier domains from
    // initializers, so a `for…of` binding degrades to a wildcard that
    // resolves to no concrete channel.
    const radiusScale = Number(radiusScaleChannel);
    const dialed =
      Number.isFinite(radiusScale) && radiusScale > 0 && radiusScale !== 1;
    const radiusBase = (authored: string) =>
      dialed ? `calc(${authored} / ${radiusScale})` : authored;
    if (su.borderRadius.sm)
      vars["--ds-radius-sm-base"] = radiusBase(su.borderRadius.sm);
    if (su.borderRadius.md)
      vars["--ds-radius-md-base"] = radiusBase(su.borderRadius.md);
    if (su.borderRadius.lg)
      vars["--ds-radius-lg-base"] = radiusBase(su.borderRadius.lg);
    if (su.borderRadius.xl)
      vars["--ds-radius-xl-base"] = radiusBase(su.borderRadius.xl);
    // `full` is a pill radius, outside the dial ramp (themes/default.css).
    if (su.borderRadius.full) vars["--ds-radius-full"] = su.borderRadius.full;
  }
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
  if (su.elevations) {
    if (su.elevations.level0) vars["--ds-elevation-0"] = su.elevations.level0;
    if (su.elevations.level1) vars["--ds-elevation-1"] = su.elevations.level1;
    if (su.elevations.level2) vars["--ds-elevation-2"] = su.elevations.level2;
    if (su.elevations.level3) vars["--ds-elevation-3"] = su.elevations.level3;
    if (su.elevations.level4) vars["--ds-elevation-4"] = su.elevations.level4;
    if (su.elevations.level5) vars["--ds-elevation-5"] = su.elevations.level5;
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
