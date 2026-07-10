/**
 * @fileoverview Perceptually-even OKLCH color ramp derivation (WO-TOK-02).
 *
 * Builds a 10-step --ds-color-{role}-{50..900} ramp from a single tenant
 * seed color, keyed to the tenant's own rendering surface: a dark-surface
 * tenant's ramp runs from near-canvas (step 50) to near-foreground (step
 * 900); a light-surface tenant's ramp runs the other direction, so the
 * low-numbered steps always sit closest to that tenant's own canvas
 * regardless of whether the canvas itself is light or dark. Hue is held
 * constant at the seed's own hue; lightness steps evenly between the
 * ground-anchored end and the opposite extreme; chroma tapers toward both
 * ends (an extreme lightness cannot carry full chroma in sRGB) and every
 * step is gamut-mapped individually.
 */
import { hexToOklch, oklchToHex, type Oklch } from './index';

export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type RampStep = (typeof RAMP_STEPS)[number];
export type ColorRamp = Record<RampStep, string>;

/** Which canvas this ramp is keyed to -- the tenant's OWN surface, never a toggle. */
export type RampSurface = 'light' | 'dark';

// Fixed opposite-extreme endpoints (kept off 0/1 so the ramp's most extreme
// step never fully clips to pure black/white, which would erase the tenant's
// hue entirely at that step).
const FAR_LIGHT_L = 0.97;
const FAR_DARK_L = 0.16;

// The near-ground endpoint tracks the tenant's ACTUAL ground lightness
// (computed by the caller from its own palette), clamped to a band that
// keeps step 50 visibly distinct from the canvas behind it.
const NEAR_LIGHT_MIN = 0.9;
const NEAR_LIGHT_MAX = 0.99;
const NEAR_DARK_MIN = 0.04;
const NEAR_DARK_MAX = 0.22;

function clampRange(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * The lightness step 50 anchors to (nearest the tenant's own ground) and the
 * lightness step 900 anchors to (the opposite extreme), for a given ground
 * lightness and surface.
 */
function rampEndpoints(groundL: number, surface: RampSurface): { near: number; far: number } {
  if (surface === 'light') {
    return { near: clampRange(groundL, NEAR_LIGHT_MIN, NEAR_LIGHT_MAX), far: FAR_DARK_L };
  }
  return { near: clampRange(groundL, NEAR_DARK_MIN, NEAR_DARK_MAX), far: FAR_LIGHT_L };
}

/**
 * Chroma taper: full chroma near the middle of the ramp (where the seed's
 * own saturation is achievable in sRGB), fading toward a floor at both
 * extremes so very light and very dark steps do not force an out-of-gamut
 * chroma that would otherwise get silently clipped to a muddy, hue-shifted
 * color by gamut mapping.
 */
function taperChroma(seedChroma: number, stepL: number, near: number, far: number): number {
  const lo = Math.min(near, far);
  const hi = Math.max(near, far);
  if (hi - lo < 1e-6) return seedChroma;
  const t = (stepL - lo) / (hi - lo); // 0 at the ramp's darkest step, 1 at its lightest
  const bell = 1 - Math.pow(2 * t - 1, 2); // peaks at t=0.5, 0 at both extremes
  const factor = 0.35 + 0.65 * Math.max(0, bell);
  return seedChroma * factor;
}

/**
 * Derive a perceptually-even, gamut-mapped 10-step OKLCH ramp from a single
 * seed color, keyed to the tenant's own ground.
 *
 * @param seedHex - the tenant's palette seed for this role (e.g. primaryColor)
 * @param groundHex - the tenant's OWN canvas for the surface this ramp
 *   renders on (backgroundColor for a light-surface tenant, darkBackgroundColor
 *   for a dark-surface tenant)
 * @param surface - 'light' (step 50 near-ground/light .. step 900 near-black)
 *   or 'dark' (step 50 near-ground/dark .. step 900 near-white)
 */
export function deriveOklchRamp(seedHex: string, groundHex: string, surface: RampSurface): ColorRamp {
  const seed = hexToOklch(seedHex);
  const ground = hexToOklch(groundHex);
  const { near, far } = rampEndpoints(ground.l, surface);

  const result = {} as ColorRamp;
  RAMP_STEPS.forEach((step, index) => {
    const t = index / (RAMP_STEPS.length - 1); // 0 at step 50, 1 at step 900
    const l = near + (far - near) * t;
    const c = taperChroma(seed.c, l, near, far);
    const oklch: Oklch = { l, c, h: seed.h };
    result[step] = oklchToHex(oklch);
  });
  return result;
}
