import { describe, expect, it } from 'vitest';

import {
  COLOR_SCHEME_MAP,
  DEFAULT_COLORS,
  MONOCHROME_COLORS,
} from '../foundation/palettes';
import { firstPartyFixture } from "@tests/support/theme-lowering";

const bithireBrandTheme = firstPartyFixture('bithire');

/**
 * WO-DES-12 — chart one-blue law (design-language §8.3 + Craft Bar A5.5).
 *
 * The law has two halves. The MECHANISM is engine-owned: `useChartPersonality`
 * resolves the active `colorScheme` through `COLOR_SCHEME_MAP`, and the
 * `monochrome` entry is the single-hue primary scale rather than a rainbow
 * categorical palette. The SELECTION is a decision: which scheme BitHire picks.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and no
 * preset document decides a chart scheme -- measured, `charts` is `{}` on all
 * three composed baselines, where the authored BitHire theme pinned
 * `charts.colorScheme: 'monochrome'`. The mechanism half is re-anchored on the
 * scheme name itself, which is what the engine actually reads; the selection
 * half is pinned to the measured state below.
 */
describe('BitHire chart palette (WO-DES-12 one-blue law)', () => {
  // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): `charts.colorScheme`
  // (pending DT registration); pinned to the measured state until the lane lands.
  // The one-blue law is a BitHire product decision with no preset decision behind
  // it any more, so the vertical carries no chart scheme and every chart falls to
  // the engine default. Kept as a live assertion, not deleted: when DER-07 or the
  // vertical restores the decision this goes red and is re-adjudicated.
  it('carries no chart scheme decision: the one-blue selection has no preset behind it', () => {
    expect(bithireBrandTheme.charts?.colorScheme).toBeUndefined();
  });

  it('resolves the monochrome scheme to the single-hue primary scale', () => {
    const resolved = COLOR_SCHEME_MAP.monochrome;

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
