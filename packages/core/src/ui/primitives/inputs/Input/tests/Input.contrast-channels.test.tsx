import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/input.css'
  ),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math, mirroring the ratios Axe enforces
 * (SERIOUS color-contrast: >= 4.5:1). Same channel pattern as the Textarea
 * counter: muted ink deepened 35% toward primary text ink; state hues deepened
 * toward black per the solid-fill contrast grammar.
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

describe('Input modern skin: counter contrast channels (R0/Axe round 2)', () => {
  it('paints the counter from the muted-to-primary mix channel, not raw muted ink', () => {
    const countRule = SKIN.match(
      /\.rottay-input-field\[data-part='field'\] > \[data-part='count'\] \{[^}]*\}/
    );
    expect(countRule).not.toBeNull();
    expect(countRule![0]).toContain(
      'var(--ds-input-count-color, var(--ds-color-text-muted)) 65%,'
    );
    expect(countRule![0]).toContain('var(--ds-color-text-primary) 35%');
    expect(countRule![0]).not.toContain(
      'color: var(--ds-input-count-color, var(--ds-color-text-muted));'
    );
  });

  it('clears WCAG AA for the counter ink on every governed source', () => {
    for (const { source, ink, primary, surface } of MUTED_CASES) {
      const mixed = mixHex(ink, primary, 65);
      const ratio = contrastRatio(mixed, hexLuminance(surface));
      expect(
        ratio,
        `count ${source}: ${ink} +35% ${primary} on ${surface} = ${ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('paints invalid/warning/limit count states with darkened-hue channels', () => {
    const invalid = SKIN.match(/\[data-part='count'\]\[data-invalid='true'\] \{[^}]*\}/);
    expect(invalid).not.toBeNull();
    expect(invalid![0]).toContain(
      'color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-neutral-900) 22%)'
    );
    // The explicit error channels keep precedence over the mix fallback.
    expect(invalid![0]).toContain('--ds-input-count-color-error,');
    expect(invalid![0]).toContain('--ds-input-error-color,');

    for (const state of ['warning', 'limit']) {
      const rule = SKIN.match(
        new RegExp(
          `[^{}]*\\[data-count-state='${state}'\\][^{}]*\\{[^}]*\\}`,
        ),
      );
      expect(rule, `missing count-state ${state} rule`).not.toBeNull();
      expect(rule![0]).toContain(
        'color-mix(in srgb, var(--ds-color-warning) 55%, var(--ds-color-neutral-900) 45%)'
      );
    }
    expect(SKIN).not.toContain('var(--ds-color-neutral-900, #171717)');
  });

  it('clears WCAG AA for every count state hue on every source', () => {
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
