/**
 * @fileoverview Pins the density.mode identity-factor law (F9, WO-CRA-23 R1):
 * `appearancePostureToVariables` must never declare `--ds-density-mode-factor`
 * for the identity posture (comfortable/normal), because the compiled
 * artifact selector outranks `:root[data-density]` in
 * `foundation/base/density/index.css` and a declared `1` would permanently clobber
 * that lower-specificity authority. A non-identity posture (compact/spacious)
 * is a real tenant choice and must still win, static or DB.
 */
import { describe, expect, it } from 'vitest';

import { DENSITY_MODE_FACTOR_VARIABLE } from '@/foundation/tokens/ts/foundation/base/density';

import { appearancePostureToVariables } from '../index';

describe('appearancePostureToVariables — density.mode identity law', () => {
  it('leaves --ds-density-mode-factor undeclared for the identity postures', () => {
    expect(
      appearancePostureToVariables({ density: 'comfortable' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBeUndefined();
    expect(
      appearancePostureToVariables({ density: 'normal' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBeUndefined();
  });

  it('declares --ds-density-mode-factor for a real non-identity posture', () => {
    expect(
      appearancePostureToVariables({ density: 'compact' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBe('0.85');
    expect(
      appearancePostureToVariables({ density: 'spacious' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBe('1.15');
  });

  it('leaves the channel absent entirely when no density posture is authored', () => {
    expect(
      Object.prototype.hasOwnProperty.call(
        appearancePostureToVariables({}),
        DENSITY_MODE_FACTOR_VARIABLE,
      ),
    ).toBe(false);
  });
});

import { writeFileSync } from 'node:fs';
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';
import { compileFlatThemeThroughDoor } from '@tests/support/theme-door';

const NON_IDENTITY = ['flat', 'elevated'] as const;
const POSTURES = ['flat', 'soft', 'elevated'] as const;
const MODES = ['light', 'dark'] as const;
const ROLES = [0, 1, 2, 3, 4, 5, 6] as const;
const elevationOnly = (variables: Record<string, string>) => Object.fromEntries(
  Object.entries(variables).filter(([channel]) => /^--ds-elevation-\d$/u.test(channel)),
);
const staticProbe = (elevation: 'flat' | 'soft' | 'elevated') => compileFlatThemeThroughDoor({
  flatTheme: {
    id: 'elevation-probe', name: 'Elevation probe',
    appearance: { defaultMode: 'light' },
    palette: { primaryColor: '#336699', backgroundColor: '#ffffff' },
    surfaces: { elevation },
    modes: { dark: { palette: { backgroundColor: '#101014' } } },
  } satisfies FlatTheme,
});
const effectiveProbe = (compiled: ReturnType<typeof staticProbe>, mode: 'light' | 'dark') => ({
  ...compiled.cssVariables,
  ...(mode === 'dark' ? compiled.modeBlocks?.find((block) => block.mode === mode)?.cssVariables : {}),
});
const observations = POSTURES.map((posture) => {
  const compiled = staticProbe(posture);
  return { posture, modes: MODES.map((mode) => ({ mode, ladder: elevationOnly(effectiveProbe(compiled, mode)) })) };
});
if (process.env.DS_ELEVATION_OBSERVATIONS) {
  writeFileSync(process.env.DS_ELEVATION_OBSERVATIONS, JSON.stringify(observations, null, 2) + '\n');
}

describe('DSA-TC-003 current-source discriminating reproduction', () => {
  it.each(NON_IDENTITY)('%s changes its ladder on dark ground', (posture) => {
    const compiled = staticProbe(posture);
    expect(elevationOnly(effectiveProbe(compiled, 'dark'))).not.toEqual(
      elevationOnly(effectiveProbe(compiled, 'light')),
    );
  });
  it.each(NON_IDENTITY)('%s dark shadow roles carry a visible top hairline', (posture) => {
    const dark = elevationOnly(effectiveProbe(staticProbe(posture), 'dark'));
    for (const [channel, value] of Object.entries(dark)) {
      if (value !== 'none') expect(value, channel).toMatch(/^inset 0 1px 0 rgba\(255, 255, 255, 0\.0\d\), /u);
    }
  });
  it.each(NON_IDENTITY)('%s keeps all seven roles', (posture) => {
    expect(Object.keys(appearancePostureToVariables({ elevation: posture })).sort()).toEqual(
      ROLES.map((role) => `--ds-elevation-${role}`),
    );
  });
  it('soft is identity and inherits the existing dark-ground ladder', () => {
    expect(appearancePostureToVariables({ elevation: 'soft' })).toEqual({});
    const dark = elevationOnly(effectiveProbe(staticProbe('soft'), 'dark'));
    expect(Object.keys(dark)).toHaveLength(7);
    const raised = Object.values(dark).filter((value) => value !== 'none');
    expect(raised).toHaveLength(6);
    raised.forEach((value) => expect(value).toMatch(/^inset 0 1px 0 rgba\(255, 255, 255, 0\.0\d\), /u));
  });
});

import { compileThemeIntent } from '@/infrastructure/compilers/runtime/theme';
import { documentThemeIntent } from '@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/document';
import { draftPreviewThemeIntent } from '@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/preview';

const VERTICALS = ['bithire', 'rottay'] as const;
const ELEVATION_CASES = VERTICALS.flatMap((vertical) => POSTURES.map((posture) => ({ vertical, posture })));
const transportPair = (vertical: 'bithire' | 'rottay', elevation: 'flat' | 'soft' | 'elevated') => {
  const fromStatic = compileThemeIntent(draftPreviewThemeIntent({
    vertical, slug: 'elevation-transport',
    draft: { id: 'elevation-transport', name: 'Elevation transport', surfaces: { elevation } },
  })).compiled;
  const fromDb = compileThemeIntent(documentThemeIntent({
    vertical, slug: 'elevation-transport',
    document: { version: 2, plan: 'standard', decisions: { 'surfaces.elevation-posture': elevation } },
  })).compiled;
  return { fromStatic, fromDb };
};
const transportEffective = (compiled: ReturnType<typeof transportPair>['fromStatic'], mode: 'light' | 'dark') => ({
  ...compiled.cssVariables,
  ...(mode !== compiled.colorScheme ? compiled.modeBlocks.find((block) => block.mode === mode)?.cssVariables : {}),
});
const transportObservations = ELEVATION_CASES.map(({ vertical, posture }) => {
  const { fromStatic, fromDb } = transportPair(vertical, posture);
  return { vertical, posture, modes: MODES.map((mode) => ({
    mode, fromStatic: elevationOnly(transportEffective(fromStatic, mode)),
    fromDb: elevationOnly(transportEffective(fromDb, mode)),
  })) };
});
if (process.env.DS_ELEVATION_OBSERVATIONS) {
  writeFileSync(process.env.DS_ELEVATION_OBSERVATIONS.replace('.json', '-transports.json'), JSON.stringify(transportObservations, null, 2) + '\n');
}
describe('DSA-TC-003 static and persisted transport preservation', () => {
  it.each(ELEVATION_CASES)('$vertical/$posture keeps static and DB output identical', ({ vertical, posture }) => {
    const { fromStatic, fromDb } = transportPair(vertical, posture);
    expect(fromStatic.cssVariables).toEqual(fromDb.cssVariables);
    expect(fromStatic.modeBlocks).toEqual(fromDb.modeBlocks);
    for (const mode of MODES) {
      const ladder = elevationOnly(transportEffective(fromStatic, mode));
      expect(Object.keys(ladder).sort()).toEqual(ROLES.map((role) => `--ds-elevation-${role}`));
    }
  });
  it.each(VERTICALS)('%s elevation leaves every other channel unchanged', (vertical) => {
    const flat = transportPair(vertical, 'flat').fromStatic;
    const elevated = transportPair(vertical, 'elevated').fromStatic;
    const unrelated = (variables: Record<string, string>) => Object.fromEntries(
      Object.entries(variables).filter(([channel]) => !/^--ds-elevation-\d$/u.test(channel)),
    );
    for (const mode of MODES) {
      expect(unrelated(transportEffective(flat, mode))).toEqual(unrelated(transportEffective(elevated, mode)));
    }
  });
});

import type { AppearancePostureFields } from '../index';
import { buildLoweringContext } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline';
import { tenantDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/tenant';

const LIGHT_PRESETS = {
  flat: {
    '--ds-elevation-0': 'none', '--ds-elevation-1': 'none', '--ds-elevation-2': 'none',
    '--ds-elevation-3': '0 1px 2px rgba(0,0,0,0.05)',
    '--ds-elevation-4': '0 1px 3px rgba(0,0,0,0.06)',
    '--ds-elevation-5': '0 2px 4px rgba(0,0,0,0.07)',
    '--ds-elevation-6': '0 2px 6px rgba(0,0,0,0.08)',
  },
  elevated: {
    '--ds-elevation-0': 'none', '--ds-elevation-1': '0 2px 4px rgba(0,0,0,0.08)',
    '--ds-elevation-2': '0 4px 8px rgba(0,0,0,0.1)',
    '--ds-elevation-3': '0 8px 16px rgba(0,0,0,0.12)',
    '--ds-elevation-4': '0 16px 32px rgba(0,0,0,0.14)',
    '--ds-elevation-5': '0 24px 48px rgba(0,0,0,0.16)',
    '--ds-elevation-6': '0 32px 64px rgba(0,0,0,0.18)',
  },
};
const withoutElevation = (variables: Record<string, string>) => Object.fromEntries(
  Object.entries(variables).filter(([channel]) => !/^--ds-elevation-\d$/u.test(channel)),
);

describe('mode-aware elevation preservation', () => {
  it('retains both literal light presets and the default light call', () => {
    expect(appearancePostureToVariables({ elevation: 'flat' }, 'light')).toEqual(LIGHT_PRESETS.flat);
    expect(appearancePostureToVariables({ elevation: 'elevated' }, 'light')).toEqual(LIGHT_PRESETS.elevated);
    expect(appearancePostureToVariables({ elevation: 'flat' })).toEqual(LIGHT_PRESETS.flat);
    expect(appearancePostureToVariables({ elevation: 'elevated' })).toEqual(LIGHT_PRESETS.elevated);
  });
  it.each(MODES)('%s soft states no ladder and no elevation is invented', (mode) => {
    expect(appearancePostureToVariables({ elevation: 'soft' }, mode)).toEqual({});
    expect(appearancePostureToVariables({}, mode)).toEqual({});
  });
  it('keeps the dark flat none roles and distinguishes every raised flat role from elevated', () => {
    const flat = new Map(Object.entries(appearancePostureToVariables({ elevation: 'flat' }, 'dark')));
    const elevated = new Map(Object.entries(appearancePostureToVariables({ elevation: 'elevated' }, 'dark')));
    expect(flat.size).toBe(7);
    expect(elevated.size).toBe(7);
    expect(flat.get('--ds-elevation-0')).toBe('none');
    expect(flat.get('--ds-elevation-1')).toBe('none');
    expect(flat.get('--ds-elevation-2')).toBe('none');
    expect(elevated.get('--ds-elevation-0')).toBe('none');
    ROLES.filter((role) => role > 0).forEach((role) => {
      expect(elevated.get(`--ds-elevation-${role}`)).not.toBe(flat.get(`--ds-elevation-${role}`));
    });
    NON_IDENTITY.forEach((posture) => {
      Object.values(appearancePostureToVariables({ elevation: posture }, 'dark')).filter((value) => value !== 'none').forEach((value) => {
        expect(value).toMatch(/^inset 0 1px 0 rgba\(255, 255, 255, 0\.0\d\), /u);
        expect(value.match(/rgba\(0, 0, 0, /gu)).toHaveLength(2);
      });
    });
  });
  it.each(POSTURES)('%s mode selection preserves every non-elevation posture output', (elevation) => {
    const posture: AppearancePostureFields = {
      elevation, typeScale: 1.1, radiusScale: 1.2, density: 'compact',
      motion: { intensity: 0.8, durationScale: 1.1 },
    };
    expect(withoutElevation(appearancePostureToVariables(posture, 'dark'))).toEqual(
      withoutElevation(appearancePostureToVariables(posture, 'light')),
    );
  });
  it.each(NON_IDENTITY)('%s tenant caller follows authored ground before declared surface', (elevation) => {
    const lower = (backgroundColor: string | undefined, surface: 'light' | 'dark') => {
      const context = buildLoweringContext({ theme: {
        id: 'ground-probe', name: 'Ground probe',
        ...(backgroundColor ? { palette: { primaryColor: '#336699', backgroundColor } } : {}),
      }, surface });
      return tenantDeriver.derive({ ...context, tenant: {
        posture: { elevation }, chosenButtonStyle: undefined, chosenButtonRadius: undefined,
        verticalRadiusBaseline: context.radiusBaseline, typography: undefined,
        authoredPaths: undefined, authoredLeaves: undefined, statusSeedAuthorship: undefined,
        seedIsTenantAuthored: false,
        toneSeedIsTenantAuthored: { success: false, warning: false, error: false, info: false },
      } }, {});
    };
    expect(elevationOnly(lower('#101014', 'light'))).toEqual(appearancePostureToVariables({ elevation }, 'dark'));
    expect(elevationOnly(lower('#ffffff', 'dark'))).toEqual(appearancePostureToVariables({ elevation }, 'light'));
    expect(elevationOnly(lower(undefined, 'dark'))).toEqual(appearancePostureToVariables({ elevation }, 'dark'));
    expect(elevationOnly(lower(undefined, 'light'))).toEqual(appearancePostureToVariables({ elevation }, 'light'));
  });
  it.each(ELEVATION_CASES)('$vertical/$posture serializes each mode identically through static and DB doors', ({ vertical, posture }) => {
    const { fromStatic, fromDb } = transportPair(vertical, posture);
    MODES.forEach((mode) => {
      expect(JSON.stringify(transportEffective(fromStatic, mode))).toBe(JSON.stringify(transportEffective(fromDb, mode)));
    });
  });
});
