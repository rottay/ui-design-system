/**
 * @fileoverview Tenant colour ramp derivation over the theme palette.
 *
 * @module Compilers/Theme/Lowering/Foundation/ramps
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandPalette } from "@/foundation/contracts/composition/tenants/themes";
import {
  RAMP_STEPS,
  deriveOklchRamp,
} from "@/foundation/kernel/color/oklch/ramp";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
} from "../ground";

interface RampRoleSpec {
  name: string;
  seed: string | undefined;
}

/**
 * The 7 palette roles a ramp can be derived for.
 *
 * One seed per role, whatever the surface. A mode overlay that wants a
 * different seed restates `primaryColor` in `modes.{mode}.palette`, which
 * re-enters this same derivation against that mode's own ground -- so the
 * other mode is a real compiled block rather than a parallel channel family
 * nothing consumes.
 */
function rampRoleSpecs(palette: BrandPalette): readonly RampRoleSpec[] {
  return [
    { name: "primary", seed: palette.primaryColor },
    { name: "secondary", seed: palette.secondaryColor },
    { name: "accent", seed: palette.accentColor },
    { name: "success", seed: palette.successColor },
    { name: "warning", seed: palette.warningColor },
    { name: "error", seed: palette.errorColor },
    { name: "info", seed: palette.infoColor },
  ];
}

/**
 * Derive the perceptually-even `--ds-color-{role}-{50..900}` ramp for every
 * palette role that declares a seed, keyed to the surface being compiled: any
 * seed color mechanically yields a full, even, gamut-mapped palette -- no
 * per-tenant design work. See `deriveOklchRamp` for the derivation itself
 * (OKLCH lightness/chroma interpolation, hue held constant, gamut mapped per
 * step).
 *
 * `surface` is the mode this palette is being compiled FOR, passed by the
 * caller that knows it. One call derives one ramp; a second mode is a second
 * call with that mode's merged palette, not a second channel family.
 */
export function deriveTenantColorRamps(
  palette: BrandPalette | undefined,
  surface: RampSurface = "light"
): Record<string, string> {
  if (!palette) return {};
  const ground =
    palette.backgroundColor ??
    (surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND);

  const vars: Record<string, string> = {};
  for (const role of rampRoleSpecs(palette)) {
    if (!role.seed) continue;
    const ramp = deriveOklchRamp(role.seed, ground, surface);
    for (const step of RAMP_STEPS) {
      vars[`--ds-color-${role.name}-${step}`] = ramp[step];
    }
  }
  // Authored steps win over derived ones. A role that is authored-only
  // (`neutral` has no seed to derive from) emits nothing until authored, so an
  // absent override never claims a channel.
  for (const [role, ramp] of Object.entries(palette.ramps ?? {})) {
    for (const [step, value] of Object.entries(ramp ?? {})) {
      if (value) vars[`--ds-color-${role}-${step}`] = value;
    }
  }
  return vars;
}
