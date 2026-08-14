/**
 * @fileoverview Tests for shared color math — the small hex/RGB utilities
 * every higher-level derivation (ramps, interaction floor, readable ink)
 * builds on.
 *
 * This file used to also prove "ThemeProvider and static generator produce
 * identical outputs from the same inputs" by exercising `buildRuntimeScale`,
 * `buildDarkRuntimeScale` and `getReadableForegroundColor` through the
 * runtime tenant-CSS generator (the retired runtime tenant-CSS generator). All three of those
 * functions and that whole generator module are gone — see the retirement
 * notes below each migrated block for where the underlying property lives
 * now.
 */

import { describe, it, expect } from 'vitest';
import { isHexColor, normalizeHexColor, hexToRgb, mixColor } from '..';
import {
  deriveReadableInk,
  measureReadableInk,
  UnmeasurableInkError,
  WCAG_AA_NORMAL_TEXT_RATIO,
} from '../readable-ink';

describe('color-math canonical implementation', () => {
  it('isHexColor validates correctly', () => {
    expect(isHexColor('#abc')).toBe(true);
    expect(isHexColor('#aabbcc')).toBe(true);
    expect(isHexColor('rgb(0,0,0)')).toBe(false);
    expect(isHexColor('var(--ds-color-primary)')).toBe(false);
  });

  it('normalizeHexColor expands shorthand', () => {
    expect(normalizeHexColor('#abc')).toBe('#aabbcc');
    expect(normalizeHexColor('#aabbcc')).toBe('#aabbcc');
    expect(normalizeHexColor('not-hex')).toBe('not-hex');
  });

  it('hexToRgb parses correctly', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('not-hex')).toBeNull();
  });

  it('mixColor interpolates', () => {
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixColor('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    expect(mixColor('not-hex', '#ffffff', 0.5)).toBe('not-hex');
  });
});

// `buildRuntimeScale` and `buildDarkRuntimeScale` (10-step sRGB scales built
// straight from a hex seed) were deleted with their sole caller, the runtime
// tenant-CSS generator (`infrastructure/compilers/runtime/tenant-css/visual-config`,
// fully retired). Nothing in `color-math` re-derives a ramp any more — see
// this module's own file header. The "one seed produces one full, ordered
// step ramp" property they defended has a real successor, but it lives one
// module over: `deriveOklchRamp` (`@/foundation/kernel/color/oklch/ramp`),
// exercised end-to-end through `deriveTenantColorRamps` in
// `../../../runtime/brand-theme/tests/color-ramps.test.ts`. There is nothing
// left to assert here — a ramp built from raw hex math is exactly the second
// implementation this retirement was meant to remove.

describe('measureReadableInk / deriveReadableInk', () => {
  // The retired `getReadableForegroundColor` was an NTSC-luma THRESHOLD
  // heuristic (luminance > 186 -> dark ink, else light ink); these two are a
  // WCAG-contrast OPTIMIZER — they measure both canonical inks over the seed
  // and report whichever actually has the higher ratio. On white and black
  // seeds the two approaches agree, so the historical pins below are
  // unchanged in VALUE even though the reasoning that produces them changed.
  it('picks the dark ink for a white seed', () => {
    const measurement = measureReadableInk('#ffffff');
    expect(measurement).toMatchObject({ status: 'measured', ink: '#171717' });
    expect(deriveReadableInk('#ffffff')).toBe('#171717');
  });

  it('picks the light ink for a black seed', () => {
    const measurement = measureReadableInk('#000000');
    expect(measurement).toMatchObject({ status: 'measured', ink: '#ffffff' });
    expect(deriveReadableInk('#000000')).toBe('#ffffff');
  });

  it('a measured result reports the actual WCAG ratio and whether it clears AA', () => {
    const white = measureReadableInk('#ffffff');
    if (white.status !== 'measured') throw new Error('expected a measured result');
    expect(white.contrast).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_RATIO);
    expect(white.meetsAA).toBe(true);
  });

  it('reports a measurable mid-gray pair as below AA instead of certifying it', () => {
    const gray = measureReadableInk('#777777');
    expect(gray).toMatchObject({ status: 'measured', meetsAA: false });
    if (gray.status !== 'measured') throw new Error('expected a measured result');
    expect(gray.contrast).toBeLessThan(WCAG_AA_NORMAL_TEXT_RATIO);
  });

  it('is a first-class "unmeasurable" result for a non-hex seed, not a silent default', () => {
    // The retired function had no such case: an unresolvable seed like
    // `var(--brand)` fell through to a hard-coded default and reported it as
    // though it had been checked. This is the exact regression a `var()`
    // primary would have reintroduced if the new derivation guessed instead
    // of deferring.
    expect(measureReadableInk('var(--brand-primary)')).toEqual({
      status: 'unmeasurable',
      reason: 'non-hex-seed',
    });
    expect(measureReadableInk('oklch(0.6 0.1 250)')).toEqual({
      status: 'unmeasurable',
      reason: 'non-hex-seed',
    });
  });

  it('deriveReadableInk throws UnmeasurableInkError rather than inventing an ink for a non-hex seed', () => {
    expect(() => deriveReadableInk('var(--brand-primary)')).toThrow(UnmeasurableInkError);
  });

  it('the amber regression: the retired NTSC heuristic answered white (~1.9:1); WCAG measurement answers dark (>4.5:1)', () => {
    // #F59E0B sums to ~167 on the old NTSC luma scale, under its 186
    // threshold, so the retired heuristic picked white — a contrast ratio of
    // roughly 1.9:1, well under AA. The WCAG-measured derivation picks the
    // dark ink, which clears AA by a wide margin. See also the focal drill
    // for this exact seed in `../../../runtime/brand-theme/tests/extended-palette-floor.test.ts`,
    // where it guards the same regression through the compiled floor.
    const measurement = measureReadableInk('#F59E0B');
    expect(measurement).toMatchObject({ status: 'measured', ink: '#171717' });
    if (measurement.status !== 'measured') throw new Error('expected a measured result');
    expect(measurement.meetsAA).toBe(true);
    expect(measurement.contrast).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_RATIO);
  });
});
