import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../../../foundation/contracts';
import { bithireBrandTheme, themanagementmiamiBrandTheme } from '../../../../../foundation/tokens/ts/presentation/brand-themes';
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

function createTenant(
  slug: string,
  options: Pick<TenantConfig, 'brandTheme' | 'personality'> = {},
): TenantConfig {
  return {
    slug,
    name: slug,
    theme: 'light',
    plan: 'enterprise',
    features: [],
    branding: { companyName: slug },
    ...options,
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

  it('keeps BitHire and The Management Miami visibly distinct through BrandTheme charts', () => {
    const bithire = resolveChartPersonality({
      tenantConfig: { brandTheme: bithireBrandTheme },
      vertical: bithireVertical,
      productProfile: recruitingProfile,
    });
    const management = resolveChartPersonality({
      tenantConfig: { brandTheme: themanagementmiamiBrandTheme },
      vertical: bithireVertical,
      productProfile: recruitingProfile,
    });

    expect(bithire).toMatchObject({
      lineStyle: 'sharp',
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

  it('uses ProductProfile chart values only on the legacy path', () => {
    const legacyProfile = {
      personality: {
        chart: {
          mountDuration: 913,
          lineStyle: 'step',
          tooltipStyle: 'minimal',
        },
      },
    };

    const legacy = resolveChartPersonality({
      tenantConfig: {},
      vertical: bithireVertical,
      productProfile: legacyProfile,
    });
    const premiumWithoutChartOverrides = resolveChartPersonality({
      tenantConfig: { brandTheme: { id: 'premium-empty', name: 'Premium Empty' } },
      vertical: bithireVertical,
      productProfile: legacyProfile,
    });

    expect(legacy).toMatchObject({
      mountDuration: 913,
      lineStyle: 'step',
      tooltipStyle: 'minimal',
    });
    expect(premiumWithoutChartOverrides).toMatchObject(bithireVertical.personality.chart);
    expect(premiumWithoutChartOverrides.mountDuration).not.toBe(913);
  });

  it('applies a sparse tenant chart override last without erasing inherited fields', () => {
    const result = resolveChartPersonality({
      tenantConfig: {
        brandTheme: bithireBrandTheme,
        personality: {
          chart: {
            mountDuration: 120,
            showDots: false,
          },
        },
      },
      vertical: bithireVertical,
      productProfile: recruitingProfile,
    });

    expect(result).toMatchObject({
      mountDuration: 120,
      showDots: false,
      lineStyle: 'sharp',
      tooltipStyle: 'detailed',
      colorScheme: 'monochrome',
    });
  });

  it('returns a fresh result and never mutates frozen input layers', () => {
    const verticalChart = Object.freeze({ ...DEFAULT_PERSONALITY.chart, mountDuration: 610 });
    const profileChart = Object.freeze({ ...DEFAULT_PERSONALITY.chart, lineStyle: 'step' as const });
    const tenantChart = Object.freeze({ mountDuration: 75 });
    const input = Object.freeze({
      tenantConfig: Object.freeze({ personality: Object.freeze({ chart: tenantChart }) }),
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
        <TenantProvider
          config={createTenant('bithire-scope', { brandTheme: bithireBrandTheme })}
          vertical={bithireVertical}
        >
          <ProductProfileProvider profile="recruiting.operator">
            <ChartProbe testId="bithire-chart" />
          </ProductProfileProvider>
        </TenantProvider>
        <TenantProvider
          config={createTenant('management-scope', { brandTheme: themanagementmiamiBrandTheme })}
          vertical={bithireVertical}
        >
          <ProductProfileProvider profile="recruiting.operator">
            <ChartProbe testId="management-chart" />
          </ProductProfileProvider>
        </TenantProvider>
      </>,
    );

    expect(screen.getByTestId('bithire-chart')).toHaveTextContent('sharp:400:detailed');
    expect(screen.getByTestId('management-chart')).toHaveTextContent('smooth:500:glass');
  });
});
