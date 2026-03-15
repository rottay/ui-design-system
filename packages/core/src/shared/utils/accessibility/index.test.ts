import { describe, expect, it } from 'vitest';

import {
  checkColorAccessibility,
  contrastRatio,
  getContrastingTextColor,
  meetsContrastLevel,
} from '.';

describe('shared/utils/accessibility', () => {
  describe('contrastRatio', () => {
    it('calculates WCAG contrast ratios for 3-digit, 6-digit, and rgb colors', () => {
      expect(contrastRatio('#000', '#fff')).toBe(21);
      expect(contrastRatio('#000000', '#ffffff')).toBe(21);
      expect(contrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBe(21);
      expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.4781, 3);
    });

    it('returns null for css variables or invalid colors', () => {
      expect(contrastRatio('var(--ds-color-text)', '#ffffff')).toBeNull();
      expect(contrastRatio('#12', '#ffffff')).toBeNull();
      expect(contrastRatio('#zzzzzz', '#ffffff')).toBeNull();
      expect(contrastRatio('rgb(300, 0, 0)', '#ffffff')).toBeNull();
      expect(contrastRatio('rgba(0, 0, 0, 1)', '#ffffff')).toBeNull();
      expect(contrastRatio('  var(--ds-color-text-muted)  ', '#ffffff')).toBeNull();
    });
  });

  describe('meetsContrastLevel', () => {
    it('evaluates AA and AAA thresholds for normal and large text', () => {
      expect(meetsContrastLevel(4.5, 'AA')).toBe(true);
      expect(meetsContrastLevel(4.49, 'AA')).toBe(false);
      expect(meetsContrastLevel(3, 'AA', true)).toBe(true);
      expect(meetsContrastLevel(2.99, 'AA', true)).toBe(false);
      expect(meetsContrastLevel(7, 'AAA')).toBe(true);
      expect(meetsContrastLevel(6.99, 'AAA')).toBe(false);
      expect(meetsContrastLevel(4.5, 'AAA', true)).toBe(true);
      expect(meetsContrastLevel(4.49, 'AAA', true)).toBe(false);
    });
  });

  describe('getContrastingTextColor', () => {
    it('returns the best contrasting text color for dark and light backgrounds', () => {
      expect(getContrastingTextColor('#1a1a2e')).toBe('#ffffff');
      expect(getContrastingTextColor('#f0f0f0')).toBe('#000000');
      expect(getContrastingTextColor('rgb(16, 16, 16)')).toBe('#ffffff');
    });

    it('returns null for colors that cannot be parsed statically', () => {
      expect(getContrastingTextColor('var(--ds-color-surface)')).toBeNull();
      expect(getContrastingTextColor('not-a-color')).toBeNull();
    });
  });

  describe('checkColorAccessibility', () => {
    it('returns a full WCAG report for valid color pairs', () => {
      expect(checkColorAccessibility('#000000', '#ffffff')).toEqual({
        ratio: 21,
        AA: true,
        AALargeText: true,
        AAA: true,
        AAALargeText: true,
      });

      expect(checkColorAccessibility('#777777', '#ffffff')).toEqual({
        ratio: expect.any(Number),
        AA: false,
        AALargeText: true,
        AAA: false,
        AAALargeText: false,
      });
    });

    it('returns null when the color pair cannot be evaluated', () => {
      expect(checkColorAccessibility('var(--ds-color-text)', '#ffffff')).toBeNull();
      expect(checkColorAccessibility('#12345', '#ffffff')).toBeNull();
    });
  });
});
