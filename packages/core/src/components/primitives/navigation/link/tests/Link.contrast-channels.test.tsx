import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ratioFromLuminance as contrastRatio,
  parseHex,
  relativeLuminanceOf,
} from '@/foundation/kernel/color/contrast';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/link/index.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1 for body-size text). The link's base ink is
 * a bounded 16%-darkened mix of the variant tone; the state ramp darkens
 * monotonically (16 -> 30 -> 42), preserving hue while clearing AA everywhere.
 */
/**
 * The colour math is the design system's one owner. `luminanceOf` and
 * `hexToRgb` stay as local ADAPTERS -- this file measures colour-mix results,
 * whose channels are a weighted mean with no hex of its own -- but neither the
 * transfer curve nor the ratio is restated here.
 */
function luminanceOf(r: number, g: number, b: number): number {
  return relativeLuminanceOf({ r, g, b });
}

function hexToRgb(hex: string): [number, number, number] {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Expected a hex color, received: ${hex}`);
  return [rgb.r, rgb.g, rgb.b];
}

/** Reproduces `color-mix(in srgb, <hex> <pct>%, black <100-pct>%)` luminance. */
function mixWithBlack(hex: string, pct: number): number {
  const [r, g, b] = hexToRgb(hex);
  const f = pct / 100;
  return luminanceOf(r * f, g * f, b * f);
}

function mixHex(hexA: string, hexB: string, pctA: number): number {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const f = pctA / 100;
  return luminanceOf(r1 * f + r2 * (1 - f), g1 * f + g2 * (1 - f), b1 * f + b2 * (1 - f));
}

function hexLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return luminanceOf(r, g, b);
}


/**
 * Governed-source snapshot: variant tone -> page surface (light schemes).
 * bithire = artifact light; tmm = The Management Miami DB appearance
 * (canvas #FBF6EC); rottay = fallback chain light hues on white.
 */
const CASES: Array<{ variant: string; source: string; tone: string; surface: string }> = [
  { variant: 'primary', source: 'bithire', tone: '#3A6FB0', surface: '#F4F5F7' },
  { variant: 'primary', source: 'tmm', tone: '#0F766E', surface: '#FBF6EC' },
  { variant: 'primary', source: 'rottay', tone: '#171717', surface: '#FFFFFF' },
  { variant: 'secondary', source: 'bithire', tone: '#315F86', surface: '#F4F5F7' },
  { variant: 'secondary', source: 'tmm', tone: '#8C6D46', surface: '#FBF6EC' },
  { variant: 'secondary', source: 'rottay', tone: '#6B6B6B', surface: '#FFFFFF' },
];

describe('Link modern skin: base-ink contrast channel (R0/Axe round 2)', () => {
  it('keeps the single-tone architecture with a bounded darkened base mix', () => {
    expect(SKIN).toContain(
      'color-mix(in srgb, var(--ds-link-tone) 84%, var(--ds-color-neutral-900) 16%)'
    );
    expect(SKIN).toContain('--ds-link-color,');
    // The failing raw-tone base must not return.
    expect(SKIN).not.toContain('color: var(--ds-link-color, var(--ds-link-tone));');
    expect(SKIN).not.toContain('var(--ds-color-neutral-900, #171717)');
  });

  it('clears WCAG AA on base/hover/active for every variant and source', () => {
    // Measured after-values this guard protects (see skin comment):
    // secondary/tmm base 5.83 (was 4.44 raw), primary/bithire base 6.15
    // (no regression), ramp monotonic: base < hover < active in luminance.
    for (const { variant, source, tone, surface } of CASES) {
      const surf = hexLuminance(surface);
      const base = mixWithBlack(tone, 84);
      const hover = mixWithBlack(tone, 70);
      const active = mixWithBlack(tone, 58);
      const baseRatio = contrastRatio(base, surf);
      const hoverRatio = contrastRatio(hover, surf);
      const activeRatio = contrastRatio(active, surf);
      expect(
        baseRatio,
        `${variant}/${source} base ${tone} -16% on ${surface} = ${baseRatio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        hoverRatio,
        `${variant}/${source} hover = ${hoverRatio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        activeRatio,
        `${variant}/${source} active = ${activeRatio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
      // Ramp coherence: each state is visibly deeper than the last.
      expect(hoverRatio).toBeGreaterThan(baseRatio);
      expect(activeRatio).toBeGreaterThan(hoverRatio);
    }
  });

  it('keeps the visited pairing legible (mix of tone and text-secondary)', () => {
    // Visited is intentionally the muted state: TMM secondary visited =
    // mix(#8C6D46 76%, #5C4F3D 24%) = 5.00:1 on #FBF6EC.
    const visited = mixHex('#8C6D46', '#5C4F3D', 76);
    const ratio = contrastRatio(visited, hexLuminance('#FBF6EC'));
    expect(ratio, `visited tmm secondary = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });
});
