/**
 * One-blue tint-scale emission gate (WO-DES-03).
 *
 * The brand compiler must emit the closed tint scale --ds-tint-{4,8,12,16,24}
 * for the primary role (unsuffixed) and each status tone (success/warning/error/
 * info), each as `color-mix(in oklch, <role> N%, var(--ds-color-bg-primary))`.
 * This is what lets `bithire.ts` drop the retired second blue (#0A66C2 =
 * rgba(10, 102, 194, …)) and re-derive every interaction tint from the single
 * primary (#3A6FB0). See design-language.md §2.5.
 */
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../../compilers/brand-theme';
import { bithireBrandTheme } from '../ts/brand-themes/bithire/bithire';

const STEPS = [4, 8, 12, 16, 24] as const;
const TONE_ROLES = [
  { suffix: 'success', colorVar: '--ds-color-success' },
  { suffix: 'warning', colorVar: '--ds-color-warning' },
  { suffix: 'error', colorVar: '--ds-color-error' },
  { suffix: 'info', colorVar: '--ds-color-info' },
] as const;

describe('bithire brand compiler emits the one-blue tint scale', () => {
  const { cssVariables } = compileBrandTheme({
    brandTheme: bithireBrandTheme,
    tenantSlug: 'bithire',
  });

  it('emits --ds-tint-{4,8,12,16,24} for the primary role (unsuffixed)', () => {
    for (const step of STEPS) {
      expect(cssVariables[`--ds-tint-${step}`]).toBe(
        `color-mix(in oklch, var(--ds-color-primary) ${step}%, var(--ds-color-bg-primary))`,
      );
    }
  });

  it('emits --ds-tint-<tone>-{4,8,12,16,24} for success/warning/error/info', () => {
    for (const { suffix, colorVar } of TONE_ROLES) {
      for (const step of STEPS) {
        expect(cssVariables[`--ds-tint-${suffix}-${step}`]).toBe(
          `color-mix(in oklch, var(${colorVar}) ${step}%, var(--ds-color-bg-primary))`,
        );
      }
    }
  });

  it('emits exactly 25 tint variables (5 steps x [primary + 4 tones])', () => {
    const tintVars = Object.keys(cssVariables).filter((key) => key.startsWith('--ds-tint-'));
    expect(tintVars).toHaveLength(25);
  });

  it('re-derives every tint from a palette role, never the retired second blue', () => {
    for (const [key, value] of Object.entries(cssVariables)) {
      if (!key.startsWith('--ds-tint-')) continue;
      expect(value).not.toContain('10, 102, 194');
      expect(value.toUpperCase()).not.toContain('#0A66C2');
    }
  });
});
