import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../../../foundation/contracts';
import type { EngineVisualDeclaration } from '../../../../../foundation/contracts/composition/tenants/themes/engine-adapter';
import { bithireBrandTheme } from '../../../../../foundation/tokens/ts/presentation/brand-themes';
import { brandThemeToPersonality } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality';
import { EngineVisualDeclarationProvider } from '@/infrastructure/runtime/foundation/engine-visual';
import { themanagementmiamiBrandTheme } from '@tests/fixtures/brand-themes/themanagementmiami';
import { ProductProfileProvider, getProductProfile } from '../../../product-profiles';
import { TenantProvider } from '../../../tenant';
import { getVerticalPreset } from '../../../verticals';
import { resolveChartPersonality } from '../../runtime/resolution/chart';
import { DEFAULT_PERSONALITY } from '../../foundation/defaults';
import { useResolvedChartPersonality } from '../../presentation/resolution/chart-personality';

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
  it('returns the neutral default standalone and composes a vertical without tenant or profile', () => {
    expect(resolveChartPersonality()).toEqual(DEFAULT_PERSONALITY.chart);
    expect(resolveChartPersonality({ vertical: bithireVertical })).toEqual({
      ...DEFAULT_PERSONALITY.chart,
      ...bithireVertical.personality.chart,
    });
  });

  it('keeps BitHire and The Management Miami visibly distinct through their compiled charts', () => {
    const bithire = resolveChartPersonality({
      compiled: brandThemeToPersonality(bithireBrandTheme),
      vertical: bithireVertical,
      productProfile: recruitingProfile,
    });
    const management = resolveChartPersonality({
      compiled: brandThemeToPersonality(themanagementmiamiBrandTheme),
      vertical: bithireVertical,
      productProfile: recruitingProfile,
    });

    expect(bithire).toMatchObject({
      lineStyle: 'smooth',
      mountDuration: 400,
      tooltipStyle: 'detailed',
      colorScheme: 'monochrome',
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
      vertical: bithireVertical,
      productProfile: legacyProfile,
    });
    // A compile that states no `chart` decides nothing on this dimension, so
    // the profile underneath it stands. Presence of a declaration is not a
    // decision -- that distinction is what keeps a library-seeding projection
    // from silently replacing the preset.
    const compiledWithoutChart = resolveChartPersonality({
      compiled: brandThemeToPersonality({ id: 'premium-empty', name: 'Premium Empty' }),
      vertical: bithireVertical,
      productProfile: legacyProfile,
    });
    const compiledWithChart = resolveChartPersonality({
      compiled: brandThemeToPersonality(bithireBrandTheme),
      vertical: bithireVertical,
      productProfile: legacyProfile,
    });

    expect(noCompile).toMatchObject({
      mountDuration: 913,
      lineStyle: 'step',
      tooltipStyle: 'minimal',
    });
    expect(compiledWithoutChart).toEqual(noCompile);
    // And a compile that DOES state one wins on every field it states.
    expect(compiledWithChart).toMatchObject(brandThemeToPersonality(bithireBrandTheme).chart!);
    expect(compiledWithChart.mountDuration).not.toBe(913);
  });

  it('applies a sparse compiled chart override last without erasing inherited fields', () => {
    const result = resolveChartPersonality({
      compiled: {
        chart: {
          ...brandThemeToPersonality(bithireBrandTheme).chart,
          mountDuration: 120,
          showDots: false,
        },
      },
      vertical: bithireVertical,
      productProfile: recruitingProfile,
    });

    expect(result).toMatchObject({
      mountDuration: 120,
      showDots: false,
      lineStyle: 'smooth',
      tooltipStyle: 'detailed',
      colorScheme: 'monochrome',
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

    expect(screen.getByTestId('bithire-chart')).toHaveTextContent('smooth:400:detailed');
    expect(screen.getByTestId('management-chart')).toHaveTextContent('smooth:500:glass');
  });
});
