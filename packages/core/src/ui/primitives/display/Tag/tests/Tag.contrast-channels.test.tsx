import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tag.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1 for normal text; tag content at 13px is
 * normal text). Solid tag fills deepen each chromatic hue toward the
 * canonical darkest neutral until white ink clears the threshold on every
 * governed source.
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

function hexLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return luminanceOf(r, g, b);
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

/** Solid-fill darkening percentages owned by the skin (must match avatar.css). */
const SOLID_MIX: Record<string, number> = {
  primary: 0,
  secondary: 18,
  success: 38,
  warning: 45,
  error: 22,
};

describe('Tag modern skin: solid-content contrast channels (R0/Axe)', () => {
  it('paints every chromatic solid variant from a darkened-fill channel with a white-ink channel', () => {
    for (const variant of ['secondary', 'success', 'warning', 'error']) {
      const rule = SKIN.match(
        new RegExp(
          `\\[data-variant='${variant}'\\]:not\\(\\[data-outlined\\]\\)\\s*\\{[^}]*\\}`
        )
      );
      expect(rule, `missing ${variant} solid rule`).not.toBeNull();
      expect(rule![0]).toContain(`--ds-tag-${variant}-solid-bg`);
      expect(rule![0]).toContain(`--ds-tag-${variant}-ink`);
      expect(rule![0]).toContain(
        `color-mix(in srgb, var(--ds-color-${variant}) ${100 - SOLID_MIX[variant]}%, var(--ds-color-neutral-900, #171717) ${SOLID_MIX[variant]}%)`
      );
      // The caller's `color` prop hatch stays the first term of the background.
      expect(rule![0]).toMatch(/background:\s*var\(--ds-tag-custom-bg,/);
    }
  });

  it('clears WCAG AA (>= 4.5:1) for white content on every variant and governed source', () => {
    // Measured worst cases this guard protects (see skin header):
    // success/rottay 5.41, error/rottay 5.74, warning/rottay 6.20,
    // secondary/tmm 6.51, primary/bithire 5.15. These are the pairings behind
    // the Axe findings "Tag closable content" (success) and "Tag warning
    // content" (warning); closable anatomy adds no ink fork of its own.
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

  it('keeps the default solid pair dark-on-light and the outlined variants on darkened hue ink', () => {
    const solidDefault = SKIN.match(
      /\[data-part='root'\]\[data-part='root'\]:not\(\[data-outlined\]\) \{\s*background: var\(--ds-tag-custom-bg, var\(--ds-color-alpha-black-100\)\);\s*color: var\(--ds-color-text-primary\);/
    );
    expect(solidDefault).not.toBeNull();
    // Outlined frames stay raw hue (decorative, not axe-tested); the INK is a
    // darkened mix because on transparent fills the hue IS the text.
    const outlinedWarning = SKIN.match(
      /\[data-variant='warning'\]\[data-outlined='true'\] \{\s*border: 1px solid var\(--ds-color-warning\);\s*color: var\(--ds-tag-warning-outlined-ink, color-mix\(in srgb, var\(--ds-color-warning\) 55%, var\(--ds-color-neutral-900, #171717\) 45%\)\);\s*\}/
    );
    expect(outlinedWarning).not.toBeNull();
  });
});

describe('Tag modern skin: round-3 resolved-winner pins', () => {
  it('falls back to guaranteed white ink on every darkened solid variant (TMM text-on-primary is near-black)', () => {
    for (const variant of ['secondary', 'success', 'warning', 'error']) {
      const rule = SKIN.match(
        new RegExp(`\\[data-variant='${variant}'\\]:not\\(\\[data-outlined\\]\\)\\s*\\{[^}]*\\}`)
      );
      expect(rule).not.toBeNull();
      expect(rule![0]).toContain(
        `color: var(--ds-tag-${variant}-ink, var(--ds-color-white, #fff));`
      );
      // The near-black-collapsing chain must not return on darkened fills.
      expect(rule![0]).not.toContain(
        `--ds-tag-${variant}-ink, var(--ds-color-text-on-primary`
      );
    }
    // Primary alone keeps text-on-primary: its fill is unmixed and the token is
    // correct per source (bithire white on mid-blue, TMM dark on light gold).
    const primary = SKIN.match(/\[data-variant='primary'\]:not\(\[data-outlined\]\)\s*\{[^}]*\}/);
    expect(primary![0]).toContain('color: var(--ds-tag-primary-ink, var(--ds-color-text-on-primary, var(--ds-color-white, #fff)));');
  });

  it('carries darkened inks on every chromatic OUTLINED variant and adaptive ink on outlined default', () => {
    const outlinedDefault = SKIN.match(/\[data-outlined='true'\] \{\s*background: var\(--ds-tag-custom-bg, transparent\);[\s\S]*?color: [^}]*\}/);
    expect(outlinedDefault).not.toBeNull();
    expect(outlinedDefault![0]).toContain('color: var(--ds-tag-outlined-ink, var(--ds-color-text-primary));');
    expect(outlinedDefault![0]).not.toContain('color: var(--ds-color-alpha-black-100);');

    const mixes: Record<string, string> = {
      success: '60%, var(--ds-color-neutral-900, #171717) 40%',
      warning: '55%, var(--ds-color-neutral-900, #171717) 45%',
      error: '78%, var(--ds-color-neutral-900, #171717) 22%',
    };
    for (const [variant, mix] of Object.entries(mixes)) {
      expect(SKIN).toContain(
        `color: var(--ds-tag-${variant}-outlined-ink, color-mix(in srgb, var(--ds-color-${variant}) ${mix}));`
      );
    }
  });

  it('clears WCAG AA for the outlined inks on page surfaces of every source', () => {
    // Measured after-values: success 60% worst 5.6:1 (rottay #22C55E),
    // warning 55% worst 6.2:1 (rottay #F59E0B), error 78% worst 5.74:1
    // (rottay #EF4444); bithire success on #F4F8FB ~7.5:1.
    const surfaces: Record<string, string> = {
      bithire: '#F4F8FB',
      rottay: '#FFFFFF',
      tmm: '#FBF6EC',
    };
    const outlinedMix: Record<string, number> = { success: 40, warning: 45, error: 22 };
    for (const [variant, pct] of Object.entries(outlinedMix)) {
      for (const [source, palette] of Object.entries(SOURCES)) {
        const [r, g, b] = mixWithBlack(palette[variant], pct);
        const ratio = contrastRatio(luminanceOf(r, g, b), hexLuminance(surfaces[source]));
        expect(
          ratio,
          `outlined ${variant} on ${source}: ${palette[variant]} -${pct}% on ${surfaces[source]} = ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
