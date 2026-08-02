/**
 * OKLCH <-> sRGB round-trip proof (WO-TOK-02).
 *
 * The round trip (hex -> OKLCH -> hex) is the primary correctness check: it
 * is self-consistent (it does not depend on recalling an external reference
 * value correctly) and catches matrix/sign/inverse errors directly -- if the
 * forward and inverse OKLab matrices did not actually invert each other, the
 * round trip would diverge visibly. A handful of known-value checks (white,
 * black, and a loosely-toleranced reference for pure sRGB red) are included
 * as a secondary sanity check.
 */
import { describe, expect, it } from 'vitest';

import { gamutMapToSrgb, hexToOklab, hexToOklch, oklabToOklch, oklchToHex, oklchToOklab } from '../index';

function hexToBytes(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
}

/** Max per-channel byte delta allowed for a round trip to count as faithful. */
function expectRoundTrips(hex: string, maxByteDelta = 1) {
  const oklch = hexToOklch(hex);
  const back = oklchToHex(oklch);
  const [r1, g1, b1] = hexToBytes(hex);
  const [r2, g2, b2] = hexToBytes(back);
  expect(Math.abs(r1 - r2), `${hex} -> ${back} red channel`).toBeLessThanOrEqual(maxByteDelta);
  expect(Math.abs(g1 - g2), `${hex} -> ${back} green channel`).toBeLessThanOrEqual(maxByteDelta);
  expect(Math.abs(b1 - b2), `${hex} -> ${back} blue channel`).toBeLessThanOrEqual(maxByteDelta);
}

describe('OKLCH <-> sRGB round trip', () => {
  const swatches = [
    '#FFFFFF',
    '#000000',
    '#808080',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    // First-party tenant seeds (WO-TOK-02 delegation brief)
    '#0A0A0A', // rottay primaryColor
    '#FFFFFF', // rottay darkPrimaryColor
    '#0C0C0E', // rottay darkBackgroundColor
    '#3A6FB0', // bithire primaryColor (LinkedIn Blue)
    '#2F7D5E', // bithire secondaryColor
    '#6E9A5E', // bithire accentColor
    '#F8FBFF', // bithire backgroundColor
    '#171717', // evnto primaryColor
    '#7A6A5A', // evnto secondaryColor
    '#FFFFFF', // evnto backgroundColor
    '#131210', // evnto darkBackgroundColor
    '#22C55E', // success
    '#F59E0B', // warning
    '#EF4444', // error
    '#3B82F6', // info
  ];

  it.each(swatches)('round trips %s within 1 byte per channel', (hex) => {
    expectRoundTrips(hex);
  });

  it('reproduces pure white and pure black exactly', () => {
    expect(oklchToHex(hexToOklch('#FFFFFF'))).toBe('#FFFFFF');
    expect(oklchToHex(hexToOklch('#000000'))).toBe('#000000');
  });

  it('white has L close to 1 and C close to 0', () => {
    const { l, c } = hexToOklch('#FFFFFF');
    expect(l).toBeGreaterThan(0.999);
    expect(c).toBeLessThan(1e-4);
  });

  it('black has L close to 0 and C close to 0', () => {
    const { l, c } = hexToOklch('#000000');
    expect(l).toBeLessThan(1e-4);
    expect(c).toBeLessThan(1e-4);
  });

  it('mid-gray is achromatic (C close to 0) regardless of lightness', () => {
    const { c } = hexToOklch('#808080');
    expect(c).toBeLessThan(1e-3);
  });

  it('pure sRGB red lands near the commonly published OKLCH reference (L~0.628, C~0.258, H~29.2deg)', () => {
    const { l, c, h } = hexToOklch('#FF0000');
    expect(l).toBeGreaterThan(0.6);
    expect(l).toBeLessThan(0.66);
    expect(c).toBeGreaterThan(0.2);
    expect(c).toBeLessThan(0.3);
    expect(h).toBeGreaterThan(20);
    expect(h).toBeLessThan(40);
  });

  it('oklabToOklch and oklchToOklab are inverses', () => {
    const original = hexToOklab('#3A6FB0');
    const oklch = oklabToOklch(original);
    const back = oklchToOklab(oklch);
    expect(back.l).toBeCloseTo(original.l, 6);
    expect(back.a).toBeCloseTo(original.a, 6);
    expect(back.b).toBeCloseTo(original.b, 6);
  });

  it('hue is reported as 0 for an achromatic color instead of NaN', () => {
    const { h } = hexToOklch('#808080');
    expect(Number.isNaN(h)).toBe(false);
    expect(h).toBe(0);
  });
});

describe('sRGB gamut mapping', () => {
  it('leaves an already-in-gamut color unchanged', () => {
    const oklch = hexToOklch('#3A6FB0');
    const mapped = gamutMapToSrgb(oklch);
    expect(mapped.c).toBeCloseTo(oklch.c, 6);
  });

  it('reduces chroma for an out-of-gamut request until it fits', () => {
    // L=0.6, huge chroma, sRGB-red-ish hue: not representable in sRGB at full chroma.
    const outOfGamut = { l: 0.6, c: 5, h: 29 };
    const mapped = gamutMapToSrgb(outOfGamut);
    expect(mapped.c).toBeLessThan(5);
    expect(mapped.l).toBe(0.6);
    expect(mapped.h).toBe(29);
    // The mapped color must actually render to a valid hex (no NaN/negative clamps).
    const hex = oklchToHex(mapped);
    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('collapses to gray (c=0) when the requested lightness itself has no in-gamut color', () => {
    const impossible = { l: -0.2, c: 0.1, h: 0 };
    const mapped = gamutMapToSrgb(impossible);
    expect(mapped.c).toBe(0);
  });
});
