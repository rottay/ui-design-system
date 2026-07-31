import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/avatar.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1 for normal text; avatar initials at md and
 * below are normal text). The solid-fill grammar deepens each chromatic hue
 * toward the canonical darkest neutral until white ink clears the threshold
 * on every governed source.
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

/** Reproduces `color-mix(in srgb, <hex> <100-pct>%, black <pct>%)`. */
function mixWithBlack(hex: string, pct: number): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const f = (100 - pct) / 100;
  return [r * f, g * f, b * f];
}

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = luminanceOf(255, 255, 255);

/**
 * Governed-source palette snapshot (light schemes; the probe forces light):
 * - `bithire`: facade/artifacts/bithire/index.css light section;
 * - `rottay`: facade/artifacts/rottay/index.css light semantic hues -- the
 *   fallback chain themanagement-db resolves when its DB appearance does not
 *   forward a semantic hue;
 * - `tmm`: The Management Miami brand palette (themanagementmiami fixtures),
 *   whose semantic hues are already dark.
 */
const SOURCES: Record<string, Record<string, string>> = {
  bithire: {
    primary: '#3A6FB0',
    secondary: '#315F86',
    success: '#327CA8',
    warning: '#D6A04E',
    error: '#C5504C',
  },
  rottay: {
    primary: '#171717',
    secondary: '#6B6B6B',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  tmm: {
    primary: '#0F766E',
    secondary: '#8C6D46',
    success: '#3F6F2A',
    warning: '#8A6B00',
    error: '#C0392B',
  },
};

/** Solid-fill darkening percentages owned by the skin (must match tag.css). */
const SOLID_MIX: Record<string, number> = {
  primary: 0,
  secondary: 18,
  success: 38,
  warning: 45,
  error: 22,
};

describe('Avatar modern skin: solid-fallback contrast channels (R0/Axe)', () => {
  it('paints every chromatic fallback variant from a darkened-fill channel with a white-ink channel', () => {
    for (const variant of ['secondary', 'success', 'warning', 'error']) {
      const rule = SKIN.match(
        new RegExp(
          `\\.rottay-avatar\\.rottay-avatar--modern\\[data-variant='${variant}'\\][^{]*\\{[^}]*\\}`
        )
      );
      expect(rule, `missing ${variant} fallback rule`).not.toBeNull();
      expect(rule![0]).toContain(`--ds-avatar-${variant}-solid-bg`);
      expect(rule![0]).toContain(`--ds-avatar-${variant}-ink`);
      expect(rule![0]).toContain(
        `color-mix(in srgb, var(--ds-color-${variant}) ${100 - SOLID_MIX[variant]}%, var(--ds-color-neutral-900, #171717) ${SOLID_MIX[variant]}%)`
      );
      // The caller's backgroundColor hatch stays the first term of the background.
      expect(rule![0]).toMatch(/background:\s*var\(--ds-avatar-custom-bg,/);
    }
    // Primary keeps its unmixed brand fill (already >= 5.15 with white ink).
    const primary = SKIN.match(
      /\.rottay-avatar\.rottay-avatar--modern\[data-variant='primary'\][^{]*\{[^}]*\}/
    );
    expect(primary![0]).toContain('var(--ds-color-primary)');
    expect(primary![0]).toContain('--ds-color-primary-foreground');
  });

  it('clears WCAG AA (>= 4.5:1) for white initials on every variant and governed source', () => {
    // Measured worst cases this guard protects (see skin header):
    // success/rottay 5.41, error/rottay 5.74, warning/rottay 6.20,
    // secondary/tmm 6.51, primary/bithire 5.15.
    for (const [variant, pct] of Object.entries(SOLID_MIX)) {
      for (const [source, palette] of Object.entries(SOURCES)) {
        const hue = palette[variant];
        const [r, g, b] = mixWithBlack(hue, pct);
        const ratio = contrastRatio(WHITE, luminanceOf(r, g, b));
        expect(
          ratio,
          `${variant} on ${source}: white on ${hue} -${pct}% = ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps the default variant on the canonical neutral pair (dark ink on light fill)', () => {
    const rule = SKIN.match(
      /\.rottay-avatar\.rottay-avatar--modern > \[data-part='mask'\] > \[data-part='fallback'\] \{[^}]*--ds-avatar-default-bg[^}]*\}/
    );
    expect(rule).not.toBeNull();
    expect(rule![0]).toContain('var(--ds-avatar-default-bg, var(--ds-color-neutral-100))');
    expect(rule![0]).toContain('var(--ds-avatar-default-color, var(--ds-color-neutral-600))');
    // The old failure mode must not return: inverse (light) ink on a light panel.
    expect(rule![0]).not.toContain('--ds-color-text-inverse');
  });

  it('falls back to guaranteed white ink on every darkened variant (TMM text-on-primary is near-black)', () => {
    for (const variant of ['secondary', 'success', 'warning', 'error']) {
      const rule = SKIN.match(
        new RegExp(
          `\\.rottay-avatar\\.rottay-avatar--modern\\[data-variant='${variant}'\\][^{]*\\{[^}]*\\}`
        )
      );
      expect(rule).not.toBeNull();
      expect(rule![0]).toContain(
        `color: var(--ds-avatar-${variant}-ink, var(--ds-color-white, #fff));`
      );
      // The near-black-collapsing chain must not return on darkened fills.
      expect(rule![0]).not.toContain(
        `--ds-avatar-${variant}-ink, var(--ds-color-text-on-primary`
      );
    }
    // Primary keeps the primary-foreground chain: its fill is unmixed.
    const primary = SKIN.match(
      /\.rottay-avatar\.rottay-avatar--modern\[data-variant='primary'\][^{]*\{[^}]*\}/
    );
    expect(primary![0]).toContain('var(--ds-color-primary-foreground');
  });
});
