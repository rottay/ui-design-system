/**
 * Family-emphasis law (C2): closed vocabulary, quantized coherent ladders,
 * var()-chain-only values, fail-closed on anything unknown.
 */
import { describe, expect, it } from 'vitest';

import {
  EMPHASIS_FAMILIES,
  quantizeEmphasis,
  resolveFamilyEmphasis,
} from '..';

describe('resolveFamilyEmphasis', () => {
  it('quantizes deterministically into the four steps', () => {
    expect(quantizeEmphasis(0)).toBe(0);
    expect(quantizeEmphasis(0.3)).toBe(1);
    expect(quantizeEmphasis(0.6)).toBe(2);
    expect(quantizeEmphasis(0.95)).toBe(3);
    expect(quantizeEmphasis(Number.NaN)).toBe(1);
  });

  it('emits only var() chains or explicit zero/none — never a color or px literal beyond 0px/1px fallbacks', () => {
    for (const family of EMPHASIS_FAMILIES) {
      for (const intensity of [0, 0.3, 0.6, 1]) {
        const bundle = resolveFamilyEmphasis(family, intensity);
        expect(Object.keys(bundle).length).toBeGreaterThan(0);
        for (const [channel, value] of Object.entries(bundle)) {
          expect(channel.startsWith('--ds-')).toBe(true);
          expect(value).toMatch(/^(none|0px|var\(--ds-[a-z0-9-]+(, (none|0?\.?\d+px))?\))$/);
          expect(value).not.toMatch(/#|rgb|hsl|oklch/);
        }
      }
    }
  });

  it('raises depth while retiring the edge as intensity grows (coherence law)', () => {
    const rest = resolveFamilyEmphasis('card', 0);
    const max = resolveFamilyEmphasis('card', 1);
    expect(rest['--ds-card-shadow']).toBe('none');
    expect(max['--ds-card-shadow']).toContain('--ds-elevation-3');
    expect(max['--ds-card-border-width']).toBe('0px');
  });

  it('fails closed on unknown families and hostile intensities', () => {
    expect(resolveFamilyEmphasis('hero-banner', 0.5)).toEqual({});
    expect(resolveFamilyEmphasis('card', Number.POSITIVE_INFINITY)).toEqual({});
    expect(resolveFamilyEmphasis('card', -5)['--ds-card-shadow']).toBe('none');
  });
});
