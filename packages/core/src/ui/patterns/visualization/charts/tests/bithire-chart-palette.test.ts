import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '../../../../../foundation/tokens/ts/presentation/brand-themes';
import {
  COLOR_SCHEME_MAP,
  DEFAULT_COLORS,
  MONOCHROME_COLORS,
} from '../foundation/palettes';

/**
 * WO-DES-12 — chart one-blue law (design-language §8.3 + Craft Bar A5.5).
 *
 * BitHire pins `charts.colorScheme: 'monochrome'` so every chart draws its
 * series from the single-hue primary scale (#3A6FB0 tonalities) instead of a
 * rainbow categorical palette. `useChartPersonality` resolves the active
 * `colorScheme` through `COLOR_SCHEME_MAP`, so asserting that map entry proves
 * the resolved BitHire chart palette is the single-hue primary scale.
 */
describe('BitHire chart palette (WO-DES-12 one-blue law)', () => {
  it('pins the monochrome color scheme in the brand theme', () => {
    expect(bithireBrandTheme.charts?.colorScheme).toBe('monochrome');
  });

  it('resolves the pinned scheme to the single-hue primary scale', () => {
    const scheme = bithireBrandTheme.charts?.colorScheme ?? 'default';
    const resolved = COLOR_SCHEME_MAP[scheme];

    // The resolved palette is the monochrome (primary) scale, not the
    // multi-hue categorical default.
    expect(resolved).toBe(MONOCHROME_COLORS);
    expect(resolved).not.toBe(DEFAULT_COLORS);

    // Every series color is a step of the ONE primary hue — no second hue.
    for (const color of resolved) {
      expect(color).toMatch(/^var\(--ds-color-primary-\d+\)$/);
    }
  });
});
