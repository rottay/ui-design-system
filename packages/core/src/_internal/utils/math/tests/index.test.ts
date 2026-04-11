import { describe, expect, it } from 'vitest';

import { clamp, lerp, normalize, range, remap, roundTo } from '..';

describe('shared/utils/math', () => {
  it('clamps values at both bounds', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('interpolates values and clamps interpolation factor', () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 2)).toBe(100);
    expect(lerp(0, 100, -1)).toBe(0);
  });

  it('normalizes values and handles degenerate ranges', () => {
    expect(normalize(50, 0, 100)).toBe(0.5);
    expect(normalize(200, 0, 100)).toBe(1);
    expect(normalize(-50, 0, 100)).toBe(0);
    expect(normalize(10, 5, 5)).toBe(0);
  });

  it('remaps values between ranges', () => {
    expect(remap(50, 0, 100, 0, 1)).toBe(0.5);
    expect(remap(5, 0, 10, 0, 100)).toBe(50);
    expect(remap(0.25, 0, 1, 10, 20)).toBe(12.5);
  });

  it('rounds numbers to the requested precision', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
    expect(roundTo(3.14159, 0)).toBe(3);
    expect(roundTo(1.005, 2)).toBe(1);
    expect(roundTo(1.0051, 2)).toBe(1.01);
    expect(roundTo(12.345, -3)).toBe(12);
  });

  it('builds ascending and descending ranges and guards invalid steps', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
    expect(range(0, 5, 0)).toEqual([]);
    expect(range(5, 0, 1)).toEqual([]);
    expect(range(0, 5, -1)).toEqual([]);
  });
});
