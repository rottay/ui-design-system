import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../../../foundation/contracts';
import type { EngineVisualDeclaration } from '../../../../../foundation/contracts/composition/tenants/themes/engine-adapter';
import { brandThemeToPersonality } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality';
import { EngineVisualDeclarationProvider } from '@/infrastructure/runtime/foundation/engine-visual';
import { themanagementmiamiBrandTheme } from '@tests/fixtures/brand-themes/themanagementmiami';
import { ProductProfileProvider, getProductProfile } from '../../../product-profiles';
import { TenantProvider } from '../../../tenant';
import { getVerticalPreset } from '../../../verticals';
import { resolveChartPersonality } from '../../runtime/resolution/chart';
import { DEFAULT_PERSONALITY } from '../../foundation/defaults';
import { useResolvedChartPersonality } from '../../presentation/resolution/chart-personality';
import { firstPartyFixture } from "@tests/support/theme-lowering";

const bithireBrandTheme = firstPartyFixture('bithire');

const bithireVertical = getVerticalPreset('bithire');
const recruitingProfile = getProductProfile('recruiting.operator');

if (!bithireVertical) {
  throw new Error('The chart-personality contract requires the bundled bithire vertical');
}

function createTenant(slug: string): TenantConfig {
  return {
    slug,
    name: slug,
    theme: 'light',
    plan: 'enterprise',
    features: [],
    branding: { companyName: slug },
  };
}

/**
 * The compiled layer a mounted artifact publishes, for a theme.
 *
 * `brandThemeToPersonality` is the same function the lowering runs to fill
 * `ThemeCompilation.runtime.personality`, so this is the compile's own answer
 * rather than a fixture that restates it.
 */
function compiledFor(brandTheme: Parameters<typeof brandThemeToPersonality>[0]): EngineVisualDeclaration {
  return {
    engine: 'modern',
    projection: { seeds: {}, modes: [] },
    runtime: { personality: brandThemeToPersonality(brandTheme), tokenOverrides: {} },
  };
}

function ChartProbe({ testId }: { testId: string }): React.ReactElement {
  const chart = useResolvedChartPersonality();
  return <output data-testid={testId}>{`${chart.lineStyle}:${chart.mountDuration}:${chart.tooltipStyle}`}</output>;
}

describe('resolveChartPersonality', () => {
  it('returns the neutral default standalone; a vertical carries no chart layer of its own', () => {
    expect(resolveChartPersonality()).toEqual(DEFAULT_PERSONALITY.chart);
    expect(resolveChartPersonality({ productProfile: null })).toEqual(DEFAULT_PERSONALITY.chart);
  });

  it('present-with-undefined keys decide nothing: the eight of them never erase the profile', () => {
    // The law the type roles already obey (semantic-typography T3): a
    // materialized key with no value falls through instead of deleting the
    // layer underneath, while a key that carries a value still wins.
    const EIGHT_KEYS = [
      'animateOnMount',
      'mountDuration',
      'lineStyle',
      'showDots',
      'useGradientFill',
      'tooltipStyle',
      'colorScheme',
      'categoryColors',
    ] as const;
    const skeleton = Object.fromEntries(
      EIGHT_KEYS.map((key) => [key, undefined])
    ) as Partial<typeof DEFAULT_PERSONALITY.chart>;

    const absent = resolveChartPersonality({ productProfile: recruitingProfile });
    const present = resolveChartPersonality({
      compiled: { chart: skeleton },
      productProfile: recruitingProfile,
    });
    expect(Object.keys(skeleton)).toEqual([...EIGHT_KEYS]);
    expect(present).toEqual(absent);
    expect(present.tooltipStyle).toBe('detailed');
    expect(present.colorScheme).toBe(DEFAULT_PERSONALITY.chart.colorScheme);

    // A profile key with no value does not delete the default either.
    expect(
      resolveChartPersonality({ productProfile: { personality: { chart: skeleton } } })
    ).toEqual(DEFAULT_PERSONALITY.chart);

    // ...and one decided key still wins, from either layer.
    expect(
      resolveChartPersonality({
        compiled: { chart: { ...skeleton, lineStyle: 'step' } },
        productProfile: recruitingProfile,
      }).lineStyle
    ).toBe('step');
  });

  it('every first-party compile decides nothing about charts, on all three verticals', () => {
    for (const vertical of ['rottay', 'bithire', 'evnto'] as const) {
      const compiled = brandThemeToPersonality(firstPartyFixture(vertical));
      expect(
        resolveChartPersonality({ compiled, productProfile: recruitingProfile })
      ).toEqual(resolveChartPersonality({ productProfile: recruitingProfile }));
    }
  });

  it('keeps BitHire and The Management Miami visibly distinct through their compiled charts', () => {
    const bithire = resolveChartPersonality({
      compiled: brandThemeToPersonality(bithireBrandTheme),
      productProfile: recruitingProfile,
    });
    const management = resolveChartPersonality({
      compiled: brandThemeToPersonality(themanagementmiamiBrandTheme),
      productProfile: recruitingProfile,
    });

    // No first-party preset authors a `charts` layer, and a neutral + preset
    // compile emits `chart` with every key PRESENT and undefined rather than
    // omitting the family. Those keys decided nothing, so the profile beneath
    // them stands (adjudication #2, 2026-09-15).
    const compiledChart = brandThemeToPersonality(bithireBrandTheme).chart;
    expect(compiledChart).toBeDefined();
    expect(Object.values(compiledChart!).every((value) => value === undefined)).toBe(true);
    expect(bithire).toMatchObject({
      lineStyle: 'sharp',
      mountDuration: 600,
      tooltipStyle: 'detailed',
    });
    expect(management).toMatchObject({
      lineStyle: 'smooth',
      mountDuration: 500,
      tooltipStyle: 'glass',
      useGradientFill: true,
    });
    expect(management).not.toEqual(bithire);
  });

  it('lets the compiled layer override the profile field by field, and no further', () => {
    const legacyProfile = {
      personality: {
        chart: {
          mountDuration: 913,
          lineStyle: 'step',
          tooltipStyle: 'minimal',
        },
      },
    } as const;

    const noCompile = resolveChartPersonality({
      productProfile: legacyProfile,
    });
    // A compile that states no `chart` decides nothing on this dimension, so
    // the profile underneath it stands. Presence of a declaration is not a
    // decision -- that distinction is what keeps a library-seeding projection
    // from silently replacing the preset.
    const compiledWithoutChart = resolveChartPersonality({
      compiled: brandThemeToPersonality({ id: 'premium-empty', name: 'Premium Empty' }),
      productProfile: legacyProfile,
    });
    // The Management Miami is the arm that DOES decide: since D6-2c-ii no
    // first-party preset authors a `charts` layer, so bithire's compile states
    // eight keys and decides none of them.
    const compiledWithChart = resolveChartPersonality({
      compiled: brandThemeToPersonality(themanagementmiamiBrandTheme),
      productProfile: legacyProfile,
    });

    expect(noCompile).toMatchObject({
      mountDuration: 913,
      lineStyle: 'step',
      tooltipStyle: 'minimal',
    });
    expect(compiledWithoutChart).toEqual(noCompile);
    expect(
      resolveChartPersonality({
        compiled: brandThemeToPersonality(bithireBrandTheme),
        productProfile: legacyProfile,
      })
    ).toEqual(noCompile);
    // And a compile that DOES state one wins on every field it states.
    expect(compiledWithChart).toMatchObject(
      brandThemeToPersonality(themanagementmiamiBrandTheme).chart!
    );
    expect(compiledWithChart.mountDuration).not.toBe(913);
  });

  it('applies a sparse compiled chart override last without erasing inherited fields', () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the override used to be spread over bithire's authored chart, which is
    // now empty. Stating the two fields directly makes the override genuinely
    // sparse and leaves the rest to the profile, which is what this asserts.
    const result = resolveChartPersonality({
      compiled: {
        chart: {
          mountDuration: 120,
          showDots: false,
        },
      },
      productProfile: recruitingProfile,
    });

    expect(result).toMatchObject({
      mountDuration: 120,
      showDots: false,
      lineStyle: 'sharp',
      tooltipStyle: 'detailed',
    });
  });

  it('returns a fresh result and never mutates frozen input layers', () => {
    const verticalChart = Object.freeze({ ...DEFAULT_PERSONALITY.chart, mountDuration: 610 });
    const profileChart = Object.freeze({ ...DEFAULT_PERSONALITY.chart, lineStyle: 'step' as const });
    const tenantChart = Object.freeze({ mountDuration: 75 });
    const input = Object.freeze({
      compiled: Object.freeze({ chart: tenantChart }),
      vertical: Object.freeze({
        personality: Object.freeze({ ...DEFAULT_PERSONALITY, chart: verticalChart }),
      }),
      productProfile: Object.freeze({
        personality: Object.freeze({ chart: profileChart }),
      }),
    });

    const first = resolveChartPersonality(input);
    const second = resolveChartPersonality(input);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first).not.toBe(verticalChart);
    expect(first).not.toBe(profileChart);
    // The compiled layer goes last and states only `mountDuration`, so the
    // profile's `lineStyle` underneath it stands.
    expect(first).toMatchObject({ mountDuration: 75, lineStyle: 'step' });
    expect(verticalChart.mountDuration).toBe(610);
    expect(profileChart.lineStyle).toBe('step');
    expect(tenantChart.mountDuration).toBe(75);
  });
});

describe('useResolvedChartPersonality', () => {
  it('is standalone-safe when no provider is mounted', () => {
    render(<ChartProbe testId="standalone-chart" />);

    // ProductProfileContext intentionally supplies generic.default when its
    // provider is absent, so standalone charts get the established legacy
    // profile posture rather than an undefined context branch.
    expect(screen.getByTestId('standalone-chart')).toHaveTextContent('sharp:700:detailed');
  });

  it('isolates sibling provider scopes', () => {
    render(
      <>
        <TenantProvider config={createTenant('bithire-scope')} vertical={bithireVertical}>
          <EngineVisualDeclarationProvider declaration={compiledFor(bithireBrandTheme)}>
            <ProductProfileProvider profile="recruiting.operator">
              <ChartProbe testId="bithire-chart" />
            </ProductProfileProvider>
          </EngineVisualDeclarationProvider>
        </TenantProvider>
        <TenantProvider config={createTenant('management-scope')} vertical={bithireVertical}>
          <EngineVisualDeclarationProvider declaration={compiledFor(themanagementmiamiBrandTheme)}>
            <ProductProfileProvider profile="recruiting.operator">
              <ChartProbe testId="management-chart" />
            </ProductProfileProvider>
          </EngineVisualDeclarationProvider>
        </TenantProvider>
      </>,
    );

    // bithire's compiled `chart` carries every key present and undefined, so
    // it decides nothing and the recruiting profile beneath it stands.
    expect(screen.getByTestId('bithire-chart')).toHaveTextContent('sharp:600:detailed');
    expect(screen.getByTestId('management-chart')).toHaveTextContent('smooth:500:glass');
  });
});
