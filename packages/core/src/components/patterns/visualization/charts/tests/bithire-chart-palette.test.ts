import { describe, expect, it } from 'vitest';

import { ACCESSIBLE_COLORS } from '../foundation/palettes';
import { resolveChartSeriesPaint } from '../runtime/chart-engine/foundation/grammar/palette';
import { firstPartyFixture } from "@tests/support/theme-lowering";

const bithireFlatTheme = firstPartyFixture('bithire');

const CHAIN = /^var\(--ds-chart-category-(\d+), var\(--ds-chart-series-\1, var\(--ds-chart-([a-z]+)-\1, (#[0-9a-f]{6})\)\)\)$/;

/** Hue in degrees, so "one blue" can be measured rather than asserted by name. */
function hueOf(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const span = max - min;
  if (span === 0) return 0;
  const raw =
    max === r ? (g - b) / span + (g < b ? 6 : 0)
    : max === g ? (b - r) / span + 2
    : (r - g) / span + 4;
  return raw * 60;
}

function terminalLiterals(scheme: 'accessible' | 'monochrome'): string[] {
  return resolveChartSeriesPaint(scheme).map((expression, index) => {
    const match = CHAIN.exec(expression);
    expect(match, `slot ${index + 1} of ${scheme} is not a chain expression: ${expression}`).not.toBeNull();
    expect(match?.[1]).toBe(String(index + 1));
    expect(match?.[2]).toBe(scheme);
    return match?.[3] as string;
  });
}

/**
 * WO-DES-12 -- chart one-blue law (design-language §8.3 + Craft Bar A5.5).
 *
 * The law has two halves. The MECHANISM is engine-owned: the `monochrome`
 * scheme is a single-hue scale rather than a rainbow categorical palette. The
 * SELECTION is a decision: which scheme BitHire picks.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and no
 * preset document decides a chart scheme -- measured, `charts` is `{}` on all
 * three composed baselines, where the authored BitHire theme pinned
 * `charts.colorScheme: 'monochrome'`. The mechanism half is re-anchored on the
 * scheme name itself, which is what the engine actually reads; the selection
 * half is pinned to the measured state below.
 *
 * The mechanism is the governed chain. A monochrome chart must stay one hue
 * AND stay reachable by a tenant-authored or compiler-generated chart palette:
 * a single-hue array of raw `--ds-color-primary-N` reads satisfies the first
 * half and makes the second half structurally impossible, so both are pinned.
 */
describe('BitHire chart palette (WO-DES-12 one-blue law)', () => {
  // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): `charts.colorScheme`
  // (pending DT registration); pinned to the measured state until the lane lands.
  // The one-blue law is a BitHire product decision with no preset decision behind
  // it any more, so the vertical carries no chart scheme and every chart falls to
  // the engine default. Kept as a live assertion, not deleted: when DER-07 or the
  // vertical restores the decision this goes red and is re-adjudicated.
  it('carries no chart scheme decision: the one-blue selection has no preset behind it', () => {
    expect(bithireFlatTheme.charts?.colorScheme).toBeUndefined();
  });

  it('resolves the monochrome scheme through the governed chain, not a local array', () => {
    const resolved = resolveChartSeriesPaint('monochrome');

    expect(resolved).toHaveLength(10);
    // A tenant palette reaches every slot: both tenant channels sit above the
    // scheme channel, which sits above the audited literal.
    for (const [index, expression] of resolved.entries()) {
      const slot = index + 1;
      expect(expression).toContain(`var(--ds-chart-category-${slot},`);
      expect(expression).toContain(`var(--ds-chart-series-${slot},`);
      expect(expression).toContain(`var(--ds-chart-monochrome-${slot},`);
    }
    expect(resolved).not.toEqual(resolveChartSeriesPaint('default'));
    expect(resolved).not.toEqual(resolveChartSeriesPaint('accessible'));
  });

  it('keeps every monochrome step on the ONE hue -- no second hue', () => {
    const hues = terminalLiterals('monochrome').map(hueOf);

    // The whole scale sits inside a single hue band; a categorical palette
    // spans the wheel. Measured today: monochrome 1.9 degrees, accessible 314.
    expect(Math.max(...hues) - Math.min(...hues)).toBeLessThan(10);
    for (const hue of hues) {
      expect(hue).toBeGreaterThan(180);
      expect(hue).toBeLessThan(260);
    }
  });

  it('binds the legacy imperative fallback to the chain it used to duplicate', () => {
    // ACCESSIBLE_COLORS is the SSR/imperative fallback the engine renderers no
    // longer read. It was a fifth copy of the same table that nothing compared;
    // it is compared here so it cannot drift while it waits for retirement.
    expect(ACCESSIBLE_COLORS.map((color) => color.toLowerCase())).toEqual(
      terminalLiterals('accessible'),
    );
  });
});
