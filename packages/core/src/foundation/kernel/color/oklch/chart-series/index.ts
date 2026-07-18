/**
 * @fileoverview Tenant chart-series palette generation (W4-C3).
 *
 * Derives ten categorical chart mark colors from a single brand seed: hue
 * offsets spread the wheel from the seed's own hue, chroma is clamped into a
 * band that keeps even a gray-ish brand distinguishable without turning
 * radioactive, and lightness alternates between two surface-keyed bands so
 * adjacent slots separate by more than hue alone. Every slot is gamut-mapped
 * and then nudged in lightness until it clears the same WCAG 2.2 non-text
 * 3:1 floor the compiled chart-category validator enforces, against every
 * supplied ground.
 *
 * Pure and deterministic: same inputs always produce the same ten hex
 * strings. This module knows hex colors and a surface key only -- it must not
 * import the tenant-theme schema, contract, or compiler.
 */
import { contrastRatio } from '../../contrast';
import { hexToOklch, oklchToHex } from '..';

/**
 * The tenant's own rendering surface. Structurally identical to the ramp
 * module's RampSurface -- declared locally so this owner does not depend on a
 * sibling owner for a two-string union.
 */
export type ChartSeriesSurface = 'light' | 'dark';

export const CHART_SERIES_SLOT_COUNT = 10;

/** Hue offsets (degrees) from the seed hue, one per slot. */
export const CHART_SERIES_HUE_OFFSETS = [0, 40, 80, 135, 170, 205, 240, 275, 305, 340] as const;

/** Chroma band: floor keeps gray seeds distinguishable, ceiling keeps marks calm. */
export const CHART_SERIES_CHROMA_MIN = 0.09;
export const CHART_SERIES_CHROMA_MAX = 0.16;

/**
 * Alternating lightness bands keyed to the rendering surface. Both bands sit
 * inside the luminance window that can clear 3:1 against a white ground and a
 * near-black ground simultaneously, so `auto` tenants converge too.
 */
export const CHART_SERIES_LIGHTNESS_BANDS: Record<ChartSeriesSurface, readonly [number, number]> = {
  light: [0.52, 0.66],
  dark: [0.68, 0.56],
};

/** Must equal the compiled chart-category validator's contrast floor. */
export const CHART_SERIES_MIN_CONTRAST = 3;

/** Lightness step per nudge iteration, in OKLCH L units. */
export const CHART_SERIES_NUDGE_STEP_L = 0.02;

/** Maximum nudge iterations per slot. */
export const CHART_SERIES_NUDGE_MAX_ITERATIONS = 10;

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isHex(value: string): boolean {
  return HEX_COLOR.test(value.trim());
}

/** Passes iff the validator's failure test (`ratio + EPSILON < floor`) does not fire. */
function clearsFloor(hex: string, ground: string): boolean {
  return !(contrastRatio(hex, ground) + Number.EPSILON < CHART_SERIES_MIN_CONTRAST);
}

function failingGrounds(hex: string, grounds: readonly string[]): string[] {
  return grounds.filter((ground) => !clearsFloor(hex, ground));
}

/**
 * Lowest-ratio failing ground decides the nudge direction; ties resolve to
 * the earlier ground in the (deduplicated, order-preserving) input list.
 */
function worstFailingGround(hex: string, failing: readonly string[]): string {
  let worst = failing[0];
  let worstRatio = contrastRatio(hex, worst);
  for (const ground of failing.slice(1)) {
    const ratio = contrastRatio(hex, ground);
    if (ratio < worstRatio) {
      worst = ground;
      worstRatio = ratio;
    }
  }
  return worst;
}

/**
 * Derive the ten `--ds-chart-series-*` slot colors for a tenant.
 *
 * @param seedHex - brand seed (3- or 6-digit hex; anything else throws)
 * @param grounds - every ground the chart validator would check the palette
 *   against (default mode grounds plus authored hex surfaces); non-hex
 *   entries are ignored, duplicates collapse, order is preserved. An empty
 *   effective set skips the contrast nudge entirely.
 * @param surface - the tenant's own rendering surface, keying the lightness
 *   bands (same semantics as the ramp module's RampSurface)
 * @returns exactly ten uppercase 6-digit hex strings
 */
export function deriveChartSeriesPalette(
  seedHex: string,
  grounds: readonly string[],
  surface: ChartSeriesSurface
): readonly string[] {
  if (typeof seedHex !== 'string' || !isHex(seedHex)) {
    throw new TypeError(`deriveChartSeriesPalette requires a hex seed, got ${JSON.stringify(seedHex)}`);
  }

  const seed = hexToOklch(seedHex.trim());
  const chroma = Math.min(CHART_SERIES_CHROMA_MAX, Math.max(CHART_SERIES_CHROMA_MIN, seed.c));
  const bands = CHART_SERIES_LIGHTNESS_BANDS[surface];

  const effectiveGrounds: string[] = [];
  for (const ground of grounds) {
    if (!isHex(ground)) continue;
    const canonical = ground.trim().toUpperCase();
    if (!effectiveGrounds.includes(canonical)) effectiveGrounds.push(canonical);
  }

  return CHART_SERIES_HUE_OFFSETS.map((offset, index) => {
    const hue = (seed.h + offset) % 360;
    let lightness = bands[index % 2];
    let hex = oklchToHex({ l: lightness, c: chroma, h: hue });

    for (let step = 0; step < CHART_SERIES_NUDGE_MAX_ITERATIONS; step += 1) {
      const failing = failingGrounds(hex, effectiveGrounds);
      if (failing.length === 0) break;
      const worst = worstFailingGround(hex, failing);
      const direction = hexToOklch(worst).l > lightness ? -1 : 1;
      lightness += direction * CHART_SERIES_NUDGE_STEP_L;
      hex = oklchToHex({ l: lightness, c: chroma, h: hue });
    }

    return hex;
  });
}
