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
  safeFocusRingColor,
} from "@/foundation/kernel/color/oklch/ramp";
import type {
  ColorRamp,
  RampSurface,
} from "@/foundation/kernel/color/oklch/ramp";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
} from "../ground";

interface RampRoleSpec {
  name: string;
  seed: string | undefined;
}

/**
 * The 6 palette roles a ramp is derived for.
 *
 * One seed per role, whatever the surface. A mode overlay that wants a
 * different seed restates `primaryColor` in `modes.{mode}.palette`, which
 * re-enters this same derivation against that mode's own ground -- so the
 * other mode is a real compiled block rather than a parallel channel family
 * nothing consumes.
 *
 * `accent` is deliberately absent. Its ten ramp steps have no reader anywhere
 * -- not one `var(--ds-color-accent-<step>)` in the package, against 48 for
 * secondary -- so emitting them made the role look customizable while only the
 * `--ds-color-accent` seed itself painted. They re-enter with the family cut
 * that gives them a consumer, not before.
 */
const UNREAD_RAMP_ROLES: ReadonlySet<string> = new Set(["accent"]);

function rampRoleSpecs(palette: BrandPalette): readonly RampRoleSpec[] {
  return [
    { name: "primary", seed: palette.primaryColor },
    { name: "secondary", seed: palette.secondaryColor },
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
  // Authored steps win over derived ones. Two roles are excluded rather than
  // overridden: `neutral`, whose ramp is a TEMPERATURE decision and belongs to
  // the palette family that owns it, and `accent`, whose steps no reader
  // resolves. One channel keeps one producing family.
  for (const [role, ramp] of Object.entries(palette.ramps ?? {})) {
    if (role === "neutral" || UNREAD_RAMP_ROLES.has(role)) continue;
    for (const [step, value] of Object.entries(ramp ?? {})) {
      if (value) vars[`--ds-color-${role}-${step}`] = value;
    }
  }

  const ring = focusRingColor(palette.primaryColor, vars, ground, surface);
  if (ring) vars["--ds-focus-ring-color"] = ring;
  return vars;
}

/**
 * The focus ring this surface can actually show, derived where the seed, the
 * ramp and THIS surface's ground are all in hand.
 *
 * The sheet states the ring as the seed in a light scope and as step 400 in a
 * dark one, and those are the right preferences: the seed IS the brand, and on
 * a dark canvas the lighter tint of it reads where the seed does not. What
 * neither scope can do is check itself, because CSS cannot measure contrast --
 * so an admitted seed like `#FFFFFF` painted a 1.00:1 ring on a white canvas.
 * Here the preference is checked against the ground this block compiles for and
 * moved to the nearest ramp stop only when it fails, so a compliant seed
 * resolves to itself and nothing about the six first-party cells moves.
 *
 * Emitted only when the tenant states a seed: a vertical that states none has
 * no ramp either, and the sheet's own declaration is the answer for it.
 */
function focusRingColor(
  seed: string | undefined,
  vars: Readonly<Record<string, string>>,
  ground: string,
  surface: RampSurface
): string | undefined {
  if (!seed) return undefined;
  const ramp = {} as ColorRamp;
  for (const step of RAMP_STEPS) {
    const value = vars[`--ds-color-primary-${step}`];
    if (!value) return undefined;
    ramp[step] = value;
  }
  // The same preference each scope of the sheet states, checked before it ships.
  const preferred = surface === "dark" ? ramp[400] : seed;
  return safeFocusRingColor(preferred, ramp, ground);
}
