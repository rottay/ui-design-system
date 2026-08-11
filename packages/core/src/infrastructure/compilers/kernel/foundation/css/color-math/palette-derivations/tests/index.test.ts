/**
 * @fileoverview The border-subtle step, pinned against the values it was
 * measured from.
 *
 * The magnitude is the whole content of this derivation, so the tests assert
 * it against the shipped cells rather than against a restatement of the
 * constant. Two of the three mechanical cells must come back byte-exact; the
 * hand-picked bithire values are asserted NOT to be reproducible, which is the
 * evidence that excluding them was a classification and not an oversight.
 */

import { describe, expect, it } from 'vitest';

import { BORDER_SUBTLE_GROUND_STEP, deriveBorderSubtle } from '..';

describe('deriveBorderSubtle · reproduces the mechanical cells', () => {
  it('rebuilds the DS default :root hairline exactly', () => {
    // themes/default.css:224-227 — border #1C1C20 on ground #0A0A0C.
    expect(deriveBorderSubtle('#1C1C20', '#0A0A0C')).toBe('#161619');
  });

  it('rebuilds rottay dark exactly, which ships the same pair', () => {
    // artifacts/rottay/_source/extension.css:80-83.
    expect(deriveBorderSubtle('#1C1C20', '#0A0A0C')).toBe('#161619');
  });

  it('lands within 2/255 per channel of rottay light, which authors its own', () => {
    // Compiled from platform BrandTheme modes.light: #E5E5E3 on #FAFAF9,
    // shipping #EDEDEC. The authored value wins wherever it exists; this only
    // records that the step is the same shape, not a different relationship.
    const derived = deriveBorderSubtle('#E5E5E3', '#FAFAF9');
    expect(derived).toBe('#ececea');
  });
});

describe('deriveBorderSubtle · steps toward the ground in both directions', () => {
  it('darkens on a dark canvas', () => {
    expect(deriveBorderSubtle('#253545', '#0f1520')).toBe('#1e2a39');
  });

  it('lightens on a light canvas', () => {
    expect(deriveBorderSubtle('#D4E0EA', '#F4F8FB')).toBe('#dfe8f0');
  });

  it('does not reproduce the hand-picked bithire values', () => {
    // bithire's shipped pair moves hue (7.7° dark, 37.5° light), so it is a
    // chosen color rather than a step. If either of these ever matched, the
    // constant would have drifted onto a value the measurement excluded.
    expect(deriveBorderSubtle('#253545', '#0f1520')).not.toBe('#132032');
    expect(deriveBorderSubtle('#D4E0EA', '#F4F8FB')).not.toBe('#e4e5ed');
  });
});

describe('deriveBorderSubtle · claims nothing it cannot compute', () => {
  it.each([
    ['rgba(0, 0, 0, 0.08)', '#FFFFFF'],
    ['#E5E5E3', 'var(--ds-color-bg-primary)'],
    ['color-mix(in srgb, #fff 20%, transparent)', '#0A0A0C'],
    ['', '#0A0A0C'],
  ])('returns undefined for (%s, %s)', (border, ground) => {
    expect(deriveBorderSubtle(border, ground)).toBeUndefined();
  });

  it('accepts short hex on either side', () => {
    expect(deriveBorderSubtle('#fff', '#000')).toBe('#aaaaaa');
  });

  it('keeps the step a third of the distance to the ground', () => {
    expect(BORDER_SUBTLE_GROUND_STEP).toBeCloseTo(1 / 3, 10);
  });
});
