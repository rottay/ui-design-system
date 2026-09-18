/**
 * The ground decides the ink: a preferred colour that clears the floor is
 * returned untouched, one that does not is moved along lightness until it
 * clears, and a colour with no compile-time value is deferred rather than
 * guessed at.
 */
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../../../contrast';
import { hexToOklch } from '../..';
import { safeInkOnGround } from '..';

const AA_TEXT = 4.5;

describe('safeInkOnGround', () => {
  it('returns a preferred ink that already clears the floor', () => {
    expect(safeInkOnGround('#2F5BE8', '#FFFFFF', AA_TEXT)).toBe('#2F5BE8');
    expect(safeInkOnGround('#737373', '#FFFFFF', AA_TEXT)).toBe('#737373');
  });

  it('moves a failing ink until it clears the floor on a dark ground', () => {
    for (const [preferred, ground] of [
      ['#171717', '#0b1220'],
      ['#2F5BE8', '#0A0A0A'],
      ['#737373', '#0A0A0A'],
    ] as const) {
      expect(contrastRatio(preferred, ground)).toBeLessThan(AA_TEXT);
      const ink = safeInkOnGround(preferred, ground, AA_TEXT);
      expect(ink).not.toBe(preferred);
      expect(contrastRatio(ink, ground)).toBeGreaterThanOrEqual(AA_TEXT);
      // Lighter, because the ground is the darker side of the pair.
      expect(hexToOklch(ink).l).toBeGreaterThan(hexToOklch(preferred).l);
    }
  });

  it('moves a failing ink DARKER on a light ground', () => {
    const ink = safeInkOnGround('#FFE9A8', '#FFFFFF', AA_TEXT);
    expect(contrastRatio(ink, '#FFFFFF')).toBeGreaterThanOrEqual(AA_TEXT);
    expect(hexToOklch(ink).l).toBeLessThan(hexToOklch('#FFE9A8').l);
  });

  it('holds the preferred hue and chroma while it moves the lightness', () => {
    const preferred = '#2F5BE8';
    const moved = hexToOklch(safeInkOnGround(preferred, '#0A0A0A', AA_TEXT));
    const source = hexToOklch(preferred);
    expect(moved.h).toBeCloseTo(source.h, 1);
    expect(moved.c).toBeCloseTo(source.c, 2);
  });

  it('defers an unmeasurable preferred ink or ground instead of guessing', () => {
    expect(safeInkOnGround('var(--brand)', '#0A0A0A', AA_TEXT)).toBe('var(--brand)');
    expect(safeInkOnGround('#737373', 'var(--ground)', AA_TEXT)).toBe('#737373');
    expect(safeInkOnGround('oklch(0.5 0.1 250)', '#FFFFFF', AA_TEXT)).toBe('oklch(0.5 0.1 250)');
  });

  it('answers the most legible extreme when no lightness clears the floor', () => {
    expect(safeInkOnGround('#808080', '#808080', 21)).toBe('#000000');
    expect(safeInkOnGround('#FFFFFF', '#000000', 22)).toBe('#ffffff');
  });
});
