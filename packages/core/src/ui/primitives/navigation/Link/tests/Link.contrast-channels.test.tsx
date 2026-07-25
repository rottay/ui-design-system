import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/link.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1 for body-size text). The link's base ink is
 * a bounded 16%-darkened mix of the variant tone; the state ramp darkens
 * monotonically (16 -> 30 -> 42), preserving hue while clearing AA everywhere.
 */
function channelLuminance(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminanceOf(r: number, g: number, b: number): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
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

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
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
      'color-mix(in srgb, var(--ds-link-tone) 84%, var(--ds-color-black, #000) 16%)'
    );
    expect(SKIN).toContain('--ds-link-color,');
    // The failing raw-tone base must not return.
    expect(SKIN).not.toContain('color: var(--ds-link-color, var(--ds-link-tone));');
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
