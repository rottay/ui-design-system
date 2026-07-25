import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/textarea.css'
  ),
  'utf8'
);

const FOUNDATION_DEFAULT = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/foundation/themes/default.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1). The counter ink deepens the resolved
 * muted channel 35% toward the source's own primary text ink; the state hues
 * follow the solid-fill contrast grammar (darkened toward black).
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
 * Muted counter inks per governed source (the values the
 * `--ds-textarea-count-color -> --ds-input-count-color -> text-muted` chain
 * resolves to), each mixed 65/35 toward that source's primary text ink.
 * bithire: artifact light `--ds-input-count-color: #71869A` (was 3.76:1 on
 * white). rottay-fallback: light muted #808088 (was 3.92:1). tmm: brand
 * textMutedColor #6B5B48 candidate (already passing; must not regress).
 */
const MUTED_CASES: Array<{ source: string; ink: string; primary: string; surface: string }> = [
  { source: 'bithire', ink: '#71869A', primary: '#14283B', surface: '#FFFFFF' },
  { source: 'rottay-fallback', ink: '#808088', primary: '#171717', surface: '#FFFFFF' },
  { source: 'tmm', ink: '#6B5B48', primary: '#2E261C', surface: '#FBF6EC' },
];

const STATE_CASES: Array<{ state: string; source: string; hue: string; pct: number }> = [
  { state: 'warning', source: 'bithire', hue: '#D6A04E', pct: 55 },
  { state: 'warning', source: 'rottay', hue: '#F59E0B', pct: 55 },
  { state: 'warning', source: 'tmm', hue: '#8A6B00', pct: 55 },
  { state: 'error', source: 'bithire', hue: '#C5504C', pct: 78 },
  { state: 'error', source: 'rottay', hue: '#EF4444', pct: 78 },
  { state: 'error', source: 'tmm', hue: '#C0392B', pct: 78 },
];

describe('Textarea modern skin: counter contrast channels (R0/Axe round 2)', () => {
  it('resolves the foundation hatch to an AA-safe default (the RESOLVED winner)', () => {
    // Ground truth (round 3): foundation/themes/default.css DEFINES
    // `--ds-textarea-count-color`, so the skin's first-term hatch always wins
    // and the mix second-term is only the unset-fallback. The pin therefore
    // asserts the foundation value itself: light :root #6B6B72 (was #a3a3a3 =
    // 2.8:1), dark section keeps #a3a3a3 (7.0:1 on dark surfaces).
    const darkSectionStart = FOUNDATION_DEFAULT.indexOf(":root[data-theme='dark']");
    expect(darkSectionStart).toBeGreaterThan(0);
    const lightRoot = FOUNDATION_DEFAULT.slice(0, darkSectionStart);
    expect(lightRoot).toContain('--ds-textarea-count-color: #6B6B72;');
    expect(lightRoot).not.toContain('--ds-textarea-count-color: #a3a3a3;');
    const darkRoot = FOUNDATION_DEFAULT.slice(darkSectionStart);
    expect(darkRoot).toContain('--ds-textarea-count-color: #a3a3a3;');

    // Measured pairings for the foundation default on governed surfaces.
    const light = hexLuminance('#6B6B72');
    for (const surface of ['#FFFFFF', '#F4F8FB', '#FBF6EC']) {
      const ratio = contrastRatio(light, hexLuminance(surface));
      expect(ratio, `#6B6B72 on ${surface} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
    const dark = hexLuminance('#A3A3A3');
    const darkRatio = contrastRatio(dark, hexLuminance('#171717'));
    expect(darkRatio, `#A3A3A3 on #171717 = ${darkRatio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  it('paints the counter from the muted-to-primary mix channel, not raw muted ink', () => {
    const countRule = SKIN.match(
      /\.ds-textarea-field\[data-part='field'\] > \[data-part='count'\] \{[^}]*\}/
    );
    expect(countRule).not.toBeNull();
    expect(countRule![0]).toContain('--ds-textarea-count-color,');
    expect(countRule![0]).toContain(
      'var(--ds-input-count-color, var(--ds-color-text-muted)) 65%,'
    );
    expect(countRule![0]).toContain('var(--ds-color-text-primary) 35%');
    // The failing raw chain must not return.
    expect(countRule![0]).not.toContain(
      'color: var(--ds-textarea-count-color, var(--ds-input-count-color, var(--ds-color-text-muted)));'
    );
  });

  it('clears WCAG AA for the counter ink on every governed source', () => {
    // Measured after-values: bithire 6.03:1 on white (5.52 on #F4F5F7),
    // rottay-fallback 6.72:1, tmm 8.79:1 -- all >= 4.5 with margin.
    for (const { source, ink, primary, surface } of MUTED_CASES) {
      const mixed = mixHex(ink, primary, 65);
      const ratio = contrastRatio(mixed, hexLuminance(surface));
      expect(
        ratio,
        `count ${source}: ${ink} +35% ${primary} on ${surface} = ${ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('paints warning/limit/error count states with darkened-hue channels', () => {
    for (const state of ['warning', 'limit', 'error']) {
      const rule = SKIN.match(
        new RegExp(`\\[data-count-state='${state}'\\] \\{[^}]*\\}`)
      );
      expect(rule, `missing count-state ${state} rule`).not.toBeNull();
      const hue = state === 'error' ? 'error' : 'warning';
      const pct = state === 'error' ? 22 : 45;
      expect(rule![0]).toContain(
        `color-mix(in srgb, var(--ds-color-${hue}) ${100 - pct}%, var(--ds-color-black, #000) ${pct}%)`
      );
    }
  });

  it('clears WCAG AA for every count state hue on every source', () => {
    // Measured after-values: warning worst 5.75:1 (rottay on cream-equivalent),
    // error worst 5.33:1 (rottay). The probe sets no maxLength, so Axe cannot
    // see these states yet -- this pin is the pre-registered proof.
    for (const { state, source, hue, pct } of STATE_CASES) {
      const mixed = mixHex(hue, '#000000', pct);
      const ratio = contrastRatio(mixed, hexLuminance('#FFFFFF'));
      expect(
        ratio,
        `count-state ${state} ${source}: ${hue} at ${pct}% on white = ${ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
