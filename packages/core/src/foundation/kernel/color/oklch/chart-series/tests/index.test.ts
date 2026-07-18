/**
 * Chart-series palette generation proof (W4-C3).
 *
 * Proves the generator emits exactly ten unique, gamut-valid hex slots whose
 * hues track the seed's offsets, whose chroma stays in the calm band, and
 * (property, 200 seeded random brand seeds across light/dark/auto ground
 * sets) whose every slot clears the compiled chart-category validator's 3:1
 * floor -- using the validator's own failure test (`ratio + EPSILON < 3`) --
 * by construction. Also proves determinism and the non-hex seed rejection.
 */
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../../../contrast';
import { hexToOklch } from '../../index';
import {
  CHART_SERIES_CHROMA_MAX,
  CHART_SERIES_HUE_OFFSETS,
  CHART_SERIES_MIN_CONTRAST,
  CHART_SERIES_SLOT_COUNT,
  deriveChartSeriesPalette,
} from '../index';

/**
 * Ground sets mirroring validateCompiledChartCategories: the deterministic
 * default grounds per background mode, plus any authored hex chart surfaces.
 */
const DEFAULT_GROUNDS = { light: '#FFFFFF', dark: '#0C0C0E' } as const;

function validatorGrounds(mode: 'light' | 'dark' | 'auto', surfaces: readonly string[] = []): string[] {
  const grounds =
    mode === 'auto' ? [DEFAULT_GROUNDS.light, DEFAULT_GROUNDS.dark] : [DEFAULT_GROUNDS[mode]];
  return [...grounds, ...surfaces];
}

function clearsValidatorFloor(hex: string, ground: string): boolean {
  return !(contrastRatio(hex, ground) + Number.EPSILON < CHART_SERIES_MIN_CONTRAST);
}

/** mulberry32: deterministic 32-bit PRNG (integer ops only, no Math.random). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomHex(next: () => number): string {
  const byte = () =>
    Math.floor(next() * 256)
      .toString(16)
      .padStart(2, '0');
  return `#${byte()}${byte()}${byte()}`;
}

describe('deriveChartSeriesPalette', () => {
  it('emits exactly ten unique 6-digit uppercase hex slots', () => {
    const palette = deriveChartSeriesPalette('#2F6B9A', validatorGrounds('light'), 'light');
    expect(palette).toHaveLength(CHART_SERIES_SLOT_COUNT);
    for (const hex of palette) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
    expect(new Set(palette).size).toBe(CHART_SERIES_SLOT_COUNT);
  });

  it('tracks the seed hue through the published offsets', () => {
    const seed = '#2F6B9A';
    const seedHue = hexToOklch(seed).h;
    const palette = deriveChartSeriesPalette(seed, validatorGrounds('light'), 'light');
    palette.forEach((hex, index) => {
      const expected = (seedHue + CHART_SERIES_HUE_OFFSETS[index]) % 360;
      const actual = hexToOklch(hex).h;
      const delta = Math.abs(actual - expected);
      expect(Math.min(delta, 360 - delta)).toBeLessThan(4);
    });
  });

  it('keeps chroma at or below the calm ceiling', () => {
    const vivid = deriveChartSeriesPalette('#FF2D00', validatorGrounds('light'), 'light');
    for (const hex of vivid) {
      // Gamut mapping may reduce chroma below the floor at some hues; the
      // ceiling must hold everywhere (hex quantization tolerance only).
      expect(hexToOklch(hex).c).toBeLessThanOrEqual(CHART_SERIES_CHROMA_MAX + 0.005);
    }
  });

  it('yields ten distinguishable slots from a gray seed (chroma floor)', () => {
    const palette = deriveChartSeriesPalette('#808080', validatorGrounds('light'), 'light');
    expect(new Set(palette).size).toBe(CHART_SERIES_SLOT_COUNT);
    for (const hex of palette) {
      expect(hexToOklch(hex).c).toBeGreaterThan(0.04);
    }
  });

  it('clears the validator floor against authored hex chart surfaces too', () => {
    const surfaces = ['#F6F7F9', '#FBFCFE'];
    const palette = deriveChartSeriesPalette('#A23B72', validatorGrounds('light', surfaces), 'light');
    for (const hex of palette) {
      for (const ground of validatorGrounds('light', surfaces)) {
        expect(clearsValidatorFloor(hex, ground)).toBe(true);
      }
    }
  });

  it('clears the validator floor on a dark surface with an authored dark ground', () => {
    const surfaces = ['#101218'];
    const palette = deriveChartSeriesPalette('#5AC8FA', validatorGrounds('dark', surfaces), 'dark');
    for (const hex of palette) {
      for (const ground of validatorGrounds('dark', surfaces)) {
        expect(clearsValidatorFloor(hex, ground)).toBe(true);
      }
    }
  });

  it('ignores non-hex grounds and collapses duplicates', () => {
    const clean = deriveChartSeriesPalette('#2F6B9A', ['#FFFFFF'], 'light');
    const noisy = deriveChartSeriesPalette(
      '#2F6B9A',
      ['#FFFFFF', 'var(--ds-color-bg)', '#ffffff', '#FFFFFF'],
      'light'
    );
    expect(noisy).toEqual(clean);
  });

  it('is deterministic: identical inputs produce byte-identical palettes', () => {
    const first = deriveChartSeriesPalette('#A23B72', validatorGrounds('auto'), 'light');
    const second = deriveChartSeriesPalette('#A23B72', validatorGrounds('auto'), 'light');
    expect(first).toEqual(second);
  });

  it('rejects a non-hex seed', () => {
    expect(() => deriveChartSeriesPalette('var(--ds-color-primary)', ['#FFFFFF'], 'light')).toThrow(
      TypeError
    );
    expect(() => deriveChartSeriesPalette('rgb(1,2,3)', ['#FFFFFF'], 'light')).toThrow(TypeError);
  });

  it('property: 200 seeded random brand seeds pass the validator floor by construction', () => {
    const next = mulberry32(0xc4a7);
    const modes = ['light', 'dark', 'auto'] as const;

    for (let i = 0; i < 200; i += 1) {
      const seed = randomHex(next);
      const mode = modes[i % modes.length];
      const surface = mode === 'dark' ? 'dark' : 'light';
      const grounds = validatorGrounds(mode);
      const palette = deriveChartSeriesPalette(seed, grounds, surface);

      expect(palette).toHaveLength(CHART_SERIES_SLOT_COUNT);
      expect(new Set(palette).size).toBe(CHART_SERIES_SLOT_COUNT);
      for (const hex of palette) {
        expect(hex).toMatch(/^#[0-9A-F]{6}$/);
        for (const ground of grounds) {
          expect(clearsValidatorFloor(hex, ground)).toBe(true);
        }
      }
    }
  });
});
