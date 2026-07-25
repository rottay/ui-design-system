import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/badge.css'
  ),
  'utf8'
);

describe('Badge modern skin resilience', () => {
  it('never paints a transparent hover: interaction channels carry treatment-faithful fallbacks', () => {
    // Before this contract the hover rule read `--ds-badge-surface-hover` with no
    // fallback, so any tenant without a configured `chrome.badge` block lost the
    // badge's fill and ink on hover (unpaintable var() => transparent).
    const hoverRule = SKIN.match(
      /\.rottay-badge\.rottay-badge--modern\[data-state~='hovered'\]\s*\{[^}]*\}/
    );
    expect(hoverRule).not.toBeNull();
    expect(hoverRule![0]).toContain(
      'background: var(--ds-badge-surface-hover, var(--ds-badge-hover-bg-fallback));'
    );
    expect(hoverRule![0]).toContain(
      'color: var(--ds-badge-ink-hover, var(--ds-badge-hover-ink-fallback));'
    );

    // Every treatment defines both fallbacks from its own resolved tone tokens.
    for (const treatment of ['solid', 'soft', 'outline', 'ghost']) {
      expect(SKIN).toContain(`[data-badge-style='${treatment}']`);
    }
    expect(SKIN).toContain('--ds-badge-hover-bg-fallback: color-mix(in srgb, var(--ds-badge-tone-solid-bg) 90%');
    expect(SKIN).toContain('--ds-badge-hover-ink-fallback: var(--ds-badge-tone-solid-color);');
    expect(SKIN).toContain('--ds-badge-hover-ink-fallback: var(--ds-badge-tone-soft-color);');
  });

  it('meets the 44px coarse-pointer floor without inflating the remove control visually', () => {
    const coarse = SKIN.match(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/);
    expect(coarse).not.toBeNull();
    // Interactive roots grow to the touch target...
    expect(coarse![0]).toContain('min-block-size: var(--ds-badge-touch-target, 2.75rem);');
    // ...while the remove control keeps its compact visual size and gains an
    // invisible centered hit area instead of a physically larger button that
    // would overflow the badge's height.
    expect(coarse![0]).toContain("[data-part='close']::after");
    expect(coarse![0]).toContain('2.75rem');
    expect(coarse![0]).not.toMatch(/\[data-part='close'\]\s*\{[^}]*inline-size/);
  });
});

/**
 * WCAG 2.x contrast for the accessory count chip (R0/Axe finding: the numeric
 * count failed when its ink was `currentColor` over a 7% `currentColor` tint --
 * on solid chromatic badges that pairing collapses toward 1:1). The channel
 * now pairs the variant's dark soft tone with a light raised chip.
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

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  return luminanceOf(
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  );
}

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Dark soft-tone inks (`--ds-badge-tone-soft-color` per variant) on the light
 * count chip, per governed source. bithire ramp values come from the light
 * section of facade/artifacts/bithire/index.css; rottay ramp values are the
 * fallback chain themanagement-db resolves; tmm entries use the brand text
 * hues where the tone map falls back to them.
 */
const COUNT_INKS: Record<string, Record<string, string>> = {
  bithire: {
    default: '#516980', // text-secondary
    primary: '#3A6FB0', // primary
    secondary: '#2A5477', // secondary-600
    success: '#003D5B', // success-700
    warning: '#4D3200', // warning-700
    error: '#691215', // error-700
  },
  rottay: {
    default: '#525252', // text-secondary (neutral-600)
    primary: '#171717', // primary (neutral-900 ramp root)
    secondary: '#525252', // secondary-600 (neutral)
    success: '#15803D', // success-700
    warning: '#B45309', // warning-700
    error: '#B91C1C', // error-700
  },
  tmm: {
    default: '#5C4F3D', // textSecondaryColor
    primary: '#0F766E', // primaryColor
    secondary: '#8C6D46', // secondaryColor
    success: '#3F6F2A', // successColor
    warning: '#8A6B00', // warningColor
    error: '#C0392B', // errorColor
  },
};

const COUNT_CHIP_SURFACES = {
  bithire: '#FFFFFF', // --ds-filter-pill-count-bg (light)
  rottay: '#FFFFFF', // raised-surface fallback
  tmm: '#FFFEFB', // --ds-material-raised-background / surface override
} as const;

describe('Badge modern skin: accessory-count contrast channel (R0/Axe)', () => {
  it('pairs dark tone ink with a light raised chip at the channel level', () => {
    const countRule = SKIN.match(/\[data-part='count'\] \{[^}]*\}/);
    expect(countRule).not.toBeNull();
    expect(countRule![0]).toContain(
      'background: var(--ds-badge-count-bg, var(--ds-filter-pill-count-bg, var(--ds-surface-raised, var(--ds-color-bg-elevated, #fff))));'
    );
    expect(countRule![0]).toContain(
      'color: var(--ds-badge-count-color, var(--ds-badge-tone-soft-color, currentColor));'
    );
    // The failing pairing must not return.
    expect(countRule![0]).not.toContain('color: var(--ds-badge-count-color, currentColor);');
    expect(countRule![0]).not.toContain('color-mix(in srgb, currentColor 7%, transparent)');
  });

  it('clears WCAG AA (>= 4.5:1) for every tone ink on its source chip', () => {
    // Measured worst cases this guard protects: bithire default 5.53 on
    // #FFFFFF, rottay warning-700 5.03 on #FFFFFF, tmm warning 4.78 on #FFFEFB.
    for (const [source, inks] of Object.entries(COUNT_INKS)) {
      const chip = hexLuminance(COUNT_CHIP_SURFACES[source as keyof typeof COUNT_CHIP_SURFACES]);
      for (const [variant, ink] of Object.entries(inks)) {
        const ratio = contrastRatio(hexLuminance(ink), chip);
        expect(
          ratio,
          `count ${variant} on ${source}: ${ink} on ${COUNT_CHIP_SURFACES[source as keyof typeof COUNT_CHIP_SURFACES]} = ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
