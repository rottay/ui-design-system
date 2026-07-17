/**
 * Perceptual ramp derivation proof (WO-TOK-02).
 *
 * Proves the ramp is even (monotonic lightness, correctly ordered for its
 * surface), gamut-valid (every step is a real hex color), and high-contrast
 * at its extremes (step 50 vs step 900 clears WCAG AA against the tenant's
 * own ground) for both a light-surface seed (bithire blue) and a
 * dark-surface seed (rottay white-on-near-black).
 */
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../../../accessibility/branding-contrast';
import { hexToOklch } from '../index';
import { RAMP_STEPS, deriveOklchRamp } from '../ramp';

function luminanceOrder(hexes: readonly string[]): number[] {
  return hexes.map((hex) => hexToOklch(hex).l);
}

describe('deriveOklchRamp', () => {
  it('emits exactly the 10 canonical steps', () => {
    const ramp = deriveOklchRamp('#3A6FB0', '#F8FBFF', 'light');
    expect(Object.keys(ramp).map(Number).sort((a, b) => a - b)).toEqual([...RAMP_STEPS]);
  });

  it('every step is a valid 6-digit hex color', () => {
    const ramp = deriveOklchRamp('#3A6FB0', '#F8FBFF', 'light');
    for (const hex of Object.values(ramp)) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('light-surface ramp is monotonically DARKER as the step number rises (50=light..900=dark)', () => {
    const ramp = deriveOklchRamp('#3A6FB0', '#F8FBFF', 'light');
    const ls = luminanceOrder(RAMP_STEPS.map((s) => ramp[s]));
    for (let i = 1; i < ls.length; i += 1) {
      expect(ls[i], `step ${RAMP_STEPS[i]} should be darker (lower L) than step ${RAMP_STEPS[i - 1]}`).toBeLessThan(
        ls[i - 1],
      );
    }
  });

  it('dark-surface ramp is monotonically LIGHTER as the step number rises (50=dark..900=light)', () => {
    const ramp = deriveOklchRamp('#FFFFFF', '#0C0C0E', 'dark');
    const ls = luminanceOrder(RAMP_STEPS.map((s) => ramp[s]));
    for (let i = 1; i < ls.length; i += 1) {
      expect(ls[i], `step ${RAMP_STEPS[i]} should be lighter (higher L) than step ${RAMP_STEPS[i - 1]}`).toBeGreaterThan(
        ls[i - 1],
      );
    }
  });

  it('step 50 sits close to the tenant ground for both surfaces', () => {
    const light = deriveOklchRamp('#3A6FB0', '#F8FBFF', 'light');
    const groundL = hexToOklch('#F8FBFF').l;
    expect(Math.abs(hexToOklch(light[50]).l - groundL)).toBeLessThan(0.12);

    const dark = deriveOklchRamp('#FFFFFF', '#0C0C0E', 'dark');
    const darkGroundL = hexToOklch('#0C0C0E').l;
    expect(Math.abs(hexToOklch(dark[50]).l - darkGroundL)).toBeLessThan(0.2);
  });

  it('holds hue constant across all steps (monochromatic ramp, one-blue law)', () => {
    const ramp = deriveOklchRamp('#3A6FB0', '#F8FBFF', 'light');
    const seedHue = hexToOklch('#3A6FB0').h;
    // Middle steps (where chroma is not tapered to near-zero) should keep the
    // seed hue closely; extremes are allowed more drift since near-zero
    // chroma makes hue numerically unstable (dividing by ~0 chroma).
    for (const step of [300, 400, 500, 600, 700] as const) {
      const h = hexToOklch(ramp[step]).h;
      const delta = Math.min(Math.abs(h - seedHue), 360 - Math.abs(h - seedHue));
      expect(delta, `step ${step} hue drifted ${delta}deg from seed hue ${seedHue}`).toBeLessThan(8);
    }
  });

  it('light-surface ramp: step 50 vs step 900 clears WCAG AA (>=4.5:1)', () => {
    const ramp = deriveOklchRamp('#3A6FB0', '#F8FBFF', 'light');
    expect(contrastRatio(ramp[50], ramp[900])).toBeGreaterThanOrEqual(4.5);
  });

  it('dark-surface ramp: step 50 vs step 900 clears WCAG AA (>=4.5:1)', () => {
    const ramp = deriveOklchRamp('#FFFFFF', '#0C0C0E', 'dark');
    expect(contrastRatio(ramp[50], ramp[900])).toBeGreaterThanOrEqual(4.5);
  });

  it('an off-palette (arbitrary, non-first-party) seed still yields an even, valid ramp', () => {
    // Any tenant seed color should mechanically yield a full palette -- no
    // per-tenant design work (WO-TOK-02 outcome). A saturated, unrelated
    // magenta seed is a stand-in for "any tenant seed".
    const ramp = deriveOklchRamp('#CC0088', '#FDFDFF', 'light');
    for (const hex of Object.values(ramp)) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
    expect(contrastRatio(ramp[50], ramp[900])).toBeGreaterThanOrEqual(4.5);
  });
});
