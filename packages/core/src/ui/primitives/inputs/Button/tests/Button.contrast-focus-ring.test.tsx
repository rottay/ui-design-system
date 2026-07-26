import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/button.css'
  ),
  'utf8'
);

const PRESENTATION = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/button.css'
  ),
  'utf8'
);

const DEFAULT_THEME = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/foundation/themes/default.css'),
  'utf8'
);

/**
 * WCAG 2.x relative-luminance contrast math (same formulas as the Input /
 * Textarea contrast-channel suites). WCAG 1.4.11 (non-text contrast) and
 * 2.4.11 (focus appearance) require the focus indicator to reach >= 3:1
 * against the adjacent surface.
 */
function channelLuminance(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrastRatio(a: string, b: string): number {
  const l1 = hexLuminance(a);
  const l2 = hexLuminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Ring color vs page ground per first-party family (W8). The ring color is
 * each family's `--ds-focus-ring-color` resolved against its own default
 * surface; the ground is `--ds-color-bg-primary`. rottay light is outside
 * the supported axis (one palette per tenant) but pinned anyway so the
 * block cannot silently regress.
 */
const FAMILY_CASES: Array<{ family: string; ring: string; ground: string }> = [
  { family: 'default (tenant-less dark)', ring: '#ECECEC', ground: '#0A0A0C' },
  { family: 'rottay dark', ring: '#FFFFFF', ground: '#0A0A0C' },
  { family: 'rottay light', ring: '#0A0A0A', ground: '#FAFAF9' },
  { family: 'bithire light', ring: '#3A6FB0', ground: '#FFFFFF' },
  { family: 'evnto light', ring: '#171717', ground: '#FFFFFF' },
];

describe('Button modern: focus ring contrast (W8)', () => {
  it('paints :focus-visible from the --ds-button-focus-ring token', () => {
    expect(SKIN).toContain('box-shadow: var(--ds-button-focus-ring);');
  });

  it('resolves --ds-button-focus-ring to the canonical --ds-focus-ring double ring', () => {
    expect(PRESENTATION).toContain('--ds-button-focus-ring: var(--ds-focus-ring);');
    expect(DEFAULT_THEME).toContain('--ds-button-focus-ring: var(--ds-focus-ring);');
  });

  it('double-ring structure: page-ground gap separates the ring from saturated fills', () => {
    // First layer is the page ground (the gap that keeps the ring off the
    // button's own fill — this is what makes the indicator survive saturated
    // fills cross-family); second layer is the ring color, offset + width.
    const focusRing = DEFAULT_THEME.match(/--ds-focus-ring:\s*([^;]+);/);
    expect(focusRing).not.toBeNull();
    expect(focusRing![1]).toContain(
      '0 0 0 var(--ds-focus-ring-offset) var(--ds-color-bg-primary)'
    );
    expect(focusRing![1]).toContain('var(--ds-focus-ring-color)');
  });

  it('ring color clears WCAG 3:1 on every first-party family ground', () => {
    for (const { family, ring, ground } of FAMILY_CASES) {
      const ratio = contrastRatio(ring, ground);
      expect(
        ratio,
        `${family}: ring ${ring} on ${ground} = ${ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('old low-alpha single rings are gone from the token chain', () => {
    expect(PRESENTATION).not.toContain('--ds-button-focus-ring: var(--ds-shadow-focus-ring);');
    expect(DEFAULT_THEME).not.toContain('--ds-button-focus-ring: var(--ds-shadow-focus-ring);');
  });
});
