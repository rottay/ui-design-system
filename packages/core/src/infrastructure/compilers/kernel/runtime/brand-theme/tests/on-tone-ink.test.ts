/**
 * AUT-1 propagation contract, static path: every hex status tone a BrandTheme
 * authors emits its `--ds-color-on-<tone>` readable ink through the shared
 * `color-math/readable-ink` derivation, a mode overlay re-derives from its
 * own seeds, and a palette without a tone claims nothing (the DS root floor
 * decides). The negative drill plants a non-hex seed and expects silence —
 * an on-tone channel without measurable math would be a lie.
 */
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '..';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import {
  READABLE_INK_DARK,
  READABLE_INK_LIGHT,
  deriveReadableInk,
} from '@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink';

const compile = (brandTheme: BrandTheme) =>
  compileBrandTheme({ brandTheme, tenantSlug: 'bithire' });

const withPalette = (patch: Record<string, string | undefined>): BrandTheme => ({
  ...bithireBrandTheme,
  palette: { ...bithireBrandTheme.palette!, ...patch } as BrandTheme['palette'],
});

describe('brand-theme on-tone ink emission (AUT-1, static path)', () => {
  it('emits the shared derivation for every authored hex tone', () => {
    const vars = compile(bithireBrandTheme).cssVariables;
    for (const [role, seed] of [
      ['success', bithireBrandTheme.palette!.successColor!],
      ['warning', bithireBrandTheme.palette!.warningColor!],
      ['error', bithireBrandTheme.palette!.errorColor!],
      ['info', bithireBrandTheme.palette!.infoColor!],
    ] as const) {
      const ink = vars[`--ds-color-on-${role}`];
      expect(ink, role).toBe(deriveReadableInk(seed));
      expect([READABLE_INK_LIGHT, READABLE_INK_DARK], role).toContain(ink);
    }
  });

  it('moves the ink when only the seed moves (propagation, both directions)', () => {
    const light = compile(withPalette({ warningColor: '#f59e0b' })).cssVariables;
    expect(light['--ds-color-on-warning']).toBe(READABLE_INK_DARK);

    const dark = compile(withPalette({ warningColor: '#78350f' })).cssVariables;
    expect(dark['--ds-color-on-warning']).toBe(READABLE_INK_LIGHT);
  });

  it('re-derives inside a mode overlay from the overlay seeds', () => {
    const compiled = compile(bithireBrandTheme);
    const darkBlock = compiled.modeBlocks?.find((block) => block.mode === 'dark');
    expect(darkBlock).toBeDefined();
    const darkSuccess = bithireBrandTheme.modes!.dark!.palette!.successColor!;
    // The mode block carries the channel only when it differs from the base;
    // either way the effective dark value must equal the dark-seed derivation.
    const effective =
      darkBlock!.cssVariables['--ds-color-on-success'] ??
      compiled.cssVariables['--ds-color-on-success'];
    expect(effective).toBe(deriveReadableInk(darkSuccess));
  });

  it('drill: a palette without a tone, or with an unmeasurable one, claims nothing', () => {
    const absent = compile(
      withPalette({
        successColor: undefined,
        warningColor: undefined,
        errorColor: undefined,
        infoColor: undefined,
      })
    ).cssVariables;
    for (const role of ['success', 'warning', 'error', 'info']) {
      expect(absent[`--ds-color-on-${role}`], role).toBeUndefined();
    }

    const unmeasurable = compile(
      withPalette({ warningColor: 'var(--brand-warning)' })
    ).cssVariables;
    expect(unmeasurable['--ds-color-on-warning']).toBeUndefined();
  });
});
