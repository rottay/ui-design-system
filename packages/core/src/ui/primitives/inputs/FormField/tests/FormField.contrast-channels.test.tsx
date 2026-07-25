import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/form-field.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1). The helper ink deepens the resolved
 * helper channel 35% toward the source's own primary text ink -- no tenant
 * fork, and sources already passing only get darker (no regression).
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
 * Resolved helper inks per governed source. bithire defines
 * `--ds-input-helper-color: #71869A` (was 3.43:1 on #F4F5F7 -- the Axe
 * finding); TMM resolves text-secondary #5C4F3D (7.19:1, passes today and must
 * not regress below AA); rottay fallback helper #6B6B72.
 */
const HELPER_CASES: Array<{ source: string; ink: string; primary: string; surface: string; before: number }> = [
  { source: 'bithire', ink: '#71869A', primary: '#14283B', surface: '#F4F5F7', before: 3.43 },
  { source: 'rottay-fallback', ink: '#6B6B72', primary: '#171717', surface: '#FFFFFF', before: 5.29 },
  { source: 'tmm', ink: '#5C4F3D', primary: '#2E261C', surface: '#FBF6EC', before: 7.19 },
];

describe('FormField modern skin: help-text contrast channel (R0/Axe round 2)', () => {
  it('paints help text from the helper-to-primary mix channel, not the raw helper ink', () => {
    const helpRule = SKIN.match(/\[data-part='help-text'\] \{[^}]*\}/);
    expect(helpRule).not.toBeNull();
    expect(helpRule![0]).toContain('--ds-form-field-helper-color,');
    expect(helpRule![0]).toContain(
      'var(--ds-input-helper-color, var(--ds-color-text-secondary)) 65%,'
    );
    expect(helpRule![0]).toContain('var(--ds-color-text-primary) 35%');
    // The failing raw chain must not return.
    expect(helpRule![0]).not.toContain(
      'color: var(--ds-input-helper-color, var(--ds-color-text-secondary));'
    );
  });

  it('clears WCAG AA on every governed source without regressing passing sources', () => {
    // Measured after-values: bithire 5.52:1 on #F4F5F7 (was 3.43),
    // rottay-fallback 7.64:1, tmm 9.28:1 on #FBF6EC (was 7.19 -- darker, never
    // lighter: the mix converges toward the source's primary text pairing).
    for (const { source, ink, primary, surface, before } of HELPER_CASES) {
      const mixed = mixHex(ink, primary, 65);
      const surf = hexLuminance(surface);
      const ratio = contrastRatio(mixed, surf);
      expect(
        ratio,
        `help ${source}: ${ink} +35% ${primary} on ${surface} = ${ratio.toFixed(2)}:1 (was ${before}:1)`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        ratio,
        `help ${source} must not regress (was ${before}:1)`
      ).toBeGreaterThanOrEqual(before);
    }
  });
});
