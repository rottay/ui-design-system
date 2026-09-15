/**
 * AUT-1 propagation contract, static path: every hex status tone a BrandTheme
 * authors emits its `--ds-color-on-<tone>` readable ink through the shared
 * `color-math/readable-ink` derivation, a mode overlay re-derives from its
 * own seeds, and a palette without a tone claims nothing (the DS root floor
 * decides). The negative drill plants a non-hex seed and expects silence —
 * an on-tone channel without measurable math would be a lie.
 */
import { describe, expect, it } from 'vitest';

import { firstPartyFixture, lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import {
  READABLE_INK_DARK,
  READABLE_INK_LIGHT,
  deriveReadableInk,
} from '@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink';

const bithireBrandTheme = firstPartyFixture('bithire');

const compile = (brandTheme: BrandTheme) =>
  lowerBrandThemeFixture({ brandTheme, tenantSlug: 'bithire' });

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
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // bithire's preset authors `contrastPosture: 'high'`, whose floor hardens
    // the dark ink from #171717 to pure black. The derivation is measured on a
    // posture-neutral copy so this stays a test of the ink, and the shipped
    // posture is asserted beside it so the floor cannot silently stop applying.
    const neutral = (warningColor: string) =>
      compile(withPalette({ warningColor, contrastPosture: undefined })).cssVariables[
        '--ds-color-on-warning'
      ];
    expect(neutral('#f59e0b')).toBe(READABLE_INK_DARK);
    expect(neutral('#78350f')).toBe(READABLE_INK_LIGHT);

    expect(bithireBrandTheme.palette!.contrastPosture).toBe('high');
    const light = compile(withPalette({ warningColor: '#f59e0b' })).cssVariables;
    expect(light['--ds-color-on-warning']).toBe('#000000');

    const dark = compile(withPalette({ warningColor: '#78350f' })).cssVariables;
    expect(dark['--ds-color-on-warning']).toBe(READABLE_INK_LIGHT);
  });

  it('re-derives inside a mode overlay from the overlay seeds', () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // no first-party preset seeds a per-mode palette any more, so the overlay
    // seed is planted here. Posture-neutral for the same reason as above: the
    // claim is that the OVERLAY's seed, not the base's, drives the dark ink.
    const DARK_SUCCESS = '#7BE8B0';
    const planted: BrandTheme = {
      ...bithireBrandTheme,
      palette: { ...bithireBrandTheme.palette!, contrastPosture: undefined } as BrandTheme['palette'],
      modes: {
        ...bithireBrandTheme.modes,
        dark: {
          ...bithireBrandTheme.modes?.dark,
          palette: {
            ...(bithireBrandTheme.modes?.dark?.palette ?? {}),
            successColor: DARK_SUCCESS,
          },
        },
      },
    };
    const compiled = compile(planted);
    const darkBlock = compiled.modeBlocks?.find((block) => block.mode === 'dark');
    expect(darkBlock).toBeDefined();
    // The mode block carries the channel only when it differs from the base;
    // either way the effective dark value must equal the dark-seed derivation.
    const effective =
      darkBlock!.cssVariables['--ds-color-on-success'] ??
      compiled.cssVariables['--ds-color-on-success'];
    expect(effective).toBe(deriveReadableInk(DARK_SUCCESS));
    // Not vacuous: the base seed derives the OTHER ink, so an overlay that
    // never re-derived would read as the base's value here.
    expect(effective).not.toBe(compiled.cssVariables['--ds-color-on-success']);
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
