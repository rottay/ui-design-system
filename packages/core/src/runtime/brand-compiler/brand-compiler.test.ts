import { describe, it, expect } from 'vitest';
import type { BrandTheme } from '../../contracts/themes';
import {
  brandThemeToTokenOverrides,
  brandThemeToPersonality,
  brandThemeToBranding,
} from './index';

const MOCK_BRAND_THEME: BrandTheme = {
  id: 'test-brand',
  name: 'Test Brand',
  palette: {
    primaryColor: '#FF0000',
    secondaryColor: '#00FF00',
    accentColor: '#0000FF',
    darkPrimaryColor: '#CC0000',
    darkAccentColor: '#0000CC',
    successColor: '#22C55E',
  },
  typography: {
    fontFamilyBase: 'Inter',
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.02em',
    labelStyle: 'uppercase',
  },
  surfaces: {
    densityScale: 1.1,
    borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
    shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)' },
  },
  motion: {
    intensity: 0.8,
    entrance: 'spring',
    hoverLift: 3,
    useSpring: true,
    springTension: 200,
    staggerDelay: 40,
  },
  charts: {
    lineStyle: 'smooth',
    tooltipStyle: 'glass',
    useGradientFill: true,
  },
  chrome: {
    card: {
      defaultElevation: 'md',
      hoverElevation: 'lift-two',
      showBorder: false,
    },
    accent: {
      barPosition: 'top',
      barThickness: 3,
      barStyle: 'gradient',
    },
  },
};

describe('brandThemeToTokenOverrides', () => {
  it('maps surfaces to TenantTokenOverrides shape', () => {
    const result = brandThemeToTokenOverrides(MOCK_BRAND_THEME);
    expect(result.densityScale).toBe(1.1);
    expect(result.borderRadius).toEqual({ sm: '4px', md: '8px', lg: '12px', xl: '16px' });
    expect(result.shadows).toEqual({ sm: '0 1px 2px rgba(0,0,0,0.1)' });
  });

  it('returns empty object when no surfaces', () => {
    const result = brandThemeToTokenOverrides({ id: 'bare', name: 'Bare' });
    expect(result).toEqual({});
  });
});

describe('brandThemeToPersonality', () => {
  it('maps motion to animation personality', () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.animation?.intensity).toBe(0.8);
    expect(result.animation?.entrance).toBe('spring');
    expect(result.animation?.hoverLift).toBe(3);
    expect(result.animation?.useSpring).toBe(true);
    expect(result.animation?.springTension).toBe(200);
  });

  it('maps charts to chart personality', () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.chart?.lineStyle).toBe('smooth');
    expect(result.chart?.tooltipStyle).toBe('glass');
    expect(result.chart?.useGradientFill).toBe(true);
  });

  it('maps typography to typography personality', () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.typography?.headingWeightBias).toBe('heavier');
    expect(result.typography?.labelStyle).toBe('uppercase');
  });

  it('maps chrome.card and chrome.accent', () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.card?.defaultElevation).toBe('md');
    expect(result.accent?.barStyle).toBe('gradient');
  });

  it('returns empty object when no visual categories', () => {
    const result = brandThemeToPersonality({ id: 'bare', name: 'Bare' });
    expect(result).toEqual({});
  });
});

describe('brandThemeToBranding', () => {
  it('maps palette to TenantBranding color fields', () => {
    const result = brandThemeToBranding(MOCK_BRAND_THEME);
    expect(result.primaryColor).toBe('#FF0000');
    expect(result.secondaryColor).toBe('#00FF00');
    expect(result.accentColor).toBe('#0000FF');
    expect(result.darkPrimaryColor).toBe('#CC0000');
    expect(result.darkAccentColor).toBe('#0000CC');
    expect(result.successColor).toBe('#22C55E');
  });

  it('maps typography font families', () => {
    const result = brandThemeToBranding(MOCK_BRAND_THEME);
    expect(result.fontFamilyBase).toBe('Inter');
  });

  it('returns empty object when no palette or typography', () => {
    const result = brandThemeToBranding({ id: 'bare', name: 'Bare' });
    expect(result).toEqual({});
  });
});

describe('brandTheme precedence', () => {
  it('tenant tokenOverrides can override brandTheme surfaces', () => {
    // This test validates the design: brandTheme is not the final word.
    // Tenant-specific overrides must be able to layer on top.
    const btOverrides = brandThemeToTokenOverrides(MOCK_BRAND_THEME);
    const tenantOverrides = { borderRadius: { sm: '2px' } };

    // Simulate the merge chain: brandTheme -> tenant
    const merged = {
      ...btOverrides.borderRadius,
      ...tenantOverrides.borderRadius,
    };
    expect(merged.sm).toBe('2px'); // tenant wins
    expect(merged.md).toBe('8px'); // brandTheme preserved
  });

  it('effective branding uses brandTheme palette over config.branding', () => {
    const configBranding = { companyName: 'Acme', primaryColor: '#000000' };
    const btBranding = brandThemeToBranding(MOCK_BRAND_THEME);

    // Simulate: { ...configBranding, ...btBranding }
    const effective = { ...configBranding, ...btBranding };
    expect(effective.primaryColor).toBe('#FF0000'); // brandTheme wins
    expect(effective.companyName).toBe('Acme'); // identity preserved
  });
});
