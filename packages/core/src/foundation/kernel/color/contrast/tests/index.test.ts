/**
 * WCAG 2.2 scalar colorimetry proof.
 *
 * Pins the transfer function and contrast ratio against published WCAG
 * values (white/black 21:1, the 4.5:1 boundary gray, per-channel luminance
 * coefficients), proves symmetry and hex-parsing behavior, and pins the
 * single-home law: the branding-contrast re-export is the same function.
 */
import { describe, expect, it } from 'vitest';

import { contrastRatio as reExportedContrastRatio } from '../../../accessibility/branding-contrast';
import {
  contrastRatio,
  isHexColor,
  linearizeSrgbChannel,
  parseHex,
  relativeLuminance,
} from '../index';

describe('isHexColor', () => {
  it('accepts 3- and 6-digit hex with surrounding whitespace', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#1A5FB4')).toBe(true);
    expect(isHexColor('  #1a5fb4  ')).toBe(true);
  });

  it('rejects non-hex color syntaxes', () => {
    expect(isHexColor('fff')).toBe(false);
    expect(isHexColor('#1A5F')).toBe(false);
    expect(isHexColor('rgb(1,2,3)')).toBe(false);
    expect(isHexColor('var(--ds-color-primary)')).toBe(false);
    expect(isHexColor('white')).toBe(false);
  });
});

describe('parseHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#1A5FB4')).toEqual({ r: 0x1a, g: 0x5f, b: 0xb4 });
  });

  it('expands 3-digit hex', () => {
    expect(parseHex('#fa3')).toEqual({ r: 0xff, g: 0xaa, b: 0x33 });
  });

  it('returns null for non-hex values', () => {
    expect(parseHex('rgb(1,2,3)')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('linearizeSrgbChannel', () => {
  it('is linear below the WCAG threshold', () => {
    // 0.04045 * 255 = 10.31; channel 10 sits below the piecewise split.
    expect(linearizeSrgbChannel(10)).toBeCloseTo(10 / 255 / 12.92, 10);
  });

  it('is the 2.4 power curve above the threshold', () => {
    const channel = 128;
    const expected = Math.pow((128 / 255 + 0.055) / 1.055, 2.4);
    expect(linearizeSrgbChannel(channel)).toBeCloseTo(expected, 10);
  });

  it('maps the extremes to 0 and 1', () => {
    expect(linearizeSrgbChannel(0)).toBe(0);
    expect(linearizeSrgbChannel(255)).toBeCloseTo(1, 10);
  });
});

describe('relativeLuminance', () => {
  it('uses the WCAG channel coefficients', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 10);
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FF0000')).toBeCloseTo(0.2126, 4);
    expect(relativeLuminance('#00FF00')).toBeCloseTo(0.7152, 4);
    expect(relativeLuminance('#0000FF')).toBeCloseTo(0.0722, 4);
  });

  it('returns 0 for non-hex input', () => {
    expect(relativeLuminance('var(--x)')).toBe(0);
  });
});

describe('contrastRatio', () => {
  it('reports the published extremes', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 10);
  });

  it('matches the published 4.5:1 boundary gray on white', () => {
    // #767676 is the canonical just-passing AA gray.
    const ratio = contrastRatio('#767676', '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeLessThan(4.6);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#1A5FB4', '#F4F6F8')).toBe(contrastRatio('#F4F6F8', '#1A5FB4'));
  });

  it('is never below 1', () => {
    expect(contrastRatio('#808080', '#818181')).toBeGreaterThanOrEqual(1);
  });
});

describe('single home', () => {
  it('branding-contrast re-exports this module\'s contrastRatio unchanged', () => {
    expect(reExportedContrastRatio).toBe(contrastRatio);
  });
});
