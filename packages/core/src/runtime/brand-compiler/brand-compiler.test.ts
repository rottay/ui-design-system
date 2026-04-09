import { describe, it, expect } from 'vitest';
import type { BrandTheme } from '../../contracts/themes';
import {
  brandThemeToTokenOverrides,
  brandThemeToPersonality,
  brandThemeToBranding,
  deepMergeTokenOverrides,
  compileBrandTheme,
} from './index';
import { bithireBrandTheme } from '../../tokens/ts/brand-themes';

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

describe('deepMergeTokenOverrides', () => {
  it('deep-merges glass without losing base keys', () => {
    const base = {
      glass: { blur: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid white' },
      gradients: { primary: 'linear-gradient(red, blue)', surface: 'linear-gradient(white, gray)' },
    };
    const override = {
      glass: { blur: '20px' }, // only override blur
    };
    const result = deepMergeTokenOverrides(base, override);
    expect(result.glass?.blur).toBe('20px'); // override wins
    expect(result.glass?.background).toBe('rgba(0,0,0,0.5)'); // base preserved
    expect(result.glass?.border).toBe('1px solid white'); // base preserved
    expect(result.gradients?.primary).toBe('linear-gradient(red, blue)'); // untouched
  });

  it('deep-merges overlays without wiping namespace', () => {
    const base = {
      overlays: { light: 'rgba(255,255,255,0.1)', medium: 'rgba(255,255,255,0.3)', heavy: 'rgba(255,255,255,0.5)' },
    };
    const override = {
      overlays: { heavy: 'rgba(255,255,255,0.9)' },
    };
    const result = deepMergeTokenOverrides(base, override);
    expect(result.overlays?.light).toBe('rgba(255,255,255,0.1)'); // base preserved
    expect(result.overlays?.heavy).toBe('rgba(255,255,255,0.9)'); // override wins
  });

  it('returns base when override is undefined', () => {
    const base = { densityScale: 1.1, glass: { blur: '8px' } };
    const result = deepMergeTokenOverrides(base, undefined);
    expect(result).toBe(base); // identity — no allocation
  });

  it('override densityScale wins over base', () => {
    const base = { densityScale: 1.1 };
    const override = { densityScale: 0.9 };
    const result = deepMergeTokenOverrides(base, override);
    expect(result.densityScale).toBe(0.9);
  });
});

describe('integration: classic engine with brandTheme', () => {
  it('normalized config gives AntdConfigProvider effective colors', () => {
    // Simulate what DesignSystemProvider does: normalize config before
    // passing to TenantProvider. AntdConfigProvider reads config.branding
    // from TenantProvider context, so it must see brandTheme.palette colors.
    const tenantConfig = {
      slug: 'acme',
      name: 'Acme Corp',
      engine: 'classic' as const,
      theme: 'base',
      plan: 'enterprise' as const,
      features: [],
      branding: { companyName: 'Acme Corp', primaryColor: '#000000' },
      brandTheme: MOCK_BRAND_THEME,
      tokenOverrides: {
        glass: { blur: '20px' }, // partial override — should not wipe background/border
      },
    };

    // Step 1: Normalize branding (brandTheme palette wins)
    const btBranding = brandThemeToBranding(tenantConfig.brandTheme);
    const normalizedBranding = { ...tenantConfig.branding, ...btBranding };
    expect(normalizedBranding.primaryColor).toBe('#FF0000'); // brandTheme wins
    expect(normalizedBranding.companyName).toBe('Acme Corp'); // identity stays

    // Step 2: Deep-merge tokenOverrides (brandTheme + tenant partial)
    const btOverrides = brandThemeToTokenOverrides(tenantConfig.brandTheme);
    const normalizedOverrides = deepMergeTokenOverrides(btOverrides, tenantConfig.tokenOverrides);
    // brandTheme glass.blur is overridden by tenant, but other glass keys stay undefined
    // (brandTheme didn't set glass, so base is empty — tenant's blur is the only value)
    expect(normalizedOverrides.glass?.blur).toBe('20px');

    // brandTheme surfaces are preserved
    expect(normalizedOverrides.borderRadius?.sm).toBe('4px');
    expect(normalizedOverrides.densityScale).toBe(1.1);

    // This is what AntdConfigProvider would read from context:
    // config.branding.primaryColor === '#FF0000' (from brandTheme, not '#000000')
    expect(normalizedBranding.primaryColor).not.toBe('#000000');
  });
});

describe('compileBrandTheme', () => {
  it('produces personality from brandTheme motion/charts/chrome', () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: 'test',
    });
    expect(result.personality.animation?.intensity).toBe(0.8);
    expect(result.personality.animation?.entrance).toBe('spring');
    expect(result.personality.chart?.lineStyle).toBe('smooth');
    expect(result.personality.card?.defaultElevation).toBe('md');
  });

  it('produces tokenOverrides from brandTheme surfaces', () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: 'test',
    });
    expect(result.tokenOverrides.borderRadius?.sm).toBe('4px');
    expect(result.tokenOverrides.densityScale).toBe(1.1);
  });

  it('produces CSS variables from palette', () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: 'test',
    });
    expect(result.cssVariables['--ds-color-primary']).toBe('#FF0000');
    expect(result.cssVariables['--ds-color-secondary']).toBe('#00FF00');
    expect(result.cssVariables['--ds-color-accent']).toBe('#0000FF');
  });

  it('produces scoped CSS string', () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: 'acme',
    });
    expect(result.cssString).toContain("html[data-tenant='acme']");
    expect(result.cssString).toContain('--ds-color-primary: #FF0000');
  });

  it('merges vertical baseline before brandTheme', () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: 'test',
      verticalPersonality: {
        animation: { intensity: 0.5, entrance: 'fade' } as any,
      },
      verticalTokenOverrides: {
        densityScale: 0.9,
        borderRadius: { xl: '32px' },
      },
    });
    // brandTheme overrides vertical for keys it defines
    expect(result.personality.animation?.intensity).toBe(0.8); // brandTheme wins
    expect(result.personality.animation?.entrance).toBe('spring'); // brandTheme wins
    // vertical values preserved for keys brandTheme doesn't set
    expect(result.tokenOverrides.borderRadius?.xl).toBe('16px'); // brandTheme has xl: '16px'
    // brandTheme densityScale wins over vertical
    expect(result.tokenOverrides.densityScale).toBe(1.1);
  });

  it('passes through engineBridge', () => {
    const bt: BrandTheme = {
      ...MOCK_BRAND_THEME,
      engineBridge: { modern: { '--p': 'oklch(0.5 0.2 250)' } },
    };
    const result = compileBrandTheme({ brandTheme: bt, tenantSlug: 'test' });
    expect(result.engineBridge.modern).toEqual({ '--p': 'oklch(0.5 0.2 250)' });
  });
});

describe('parity: first-party brand pipeline', () => {
  it('bithire BrandTheme produces same palette as registry branding', () => {
    // Demonstrates that the same BrandTheme works for both first-party
    // (via registry) and DB-backed tenants (via compileBrandTheme).
    // bithireBrandTheme imported at top of file
    const branding = brandThemeToBranding(bithireBrandTheme);
    expect(branding.primaryColor).toBe('#0A66C2');
    expect(branding.secondaryColor).toBe('#004182');
    expect(branding.accentColor).toBe('#7FC15E');
  });

  it('DB-backed tenant uses same pipeline as first-party', () => {
    // Hypothetical DB tenant with the same BrandTheme as bithire
    // bithireBrandTheme imported at top of file
    const dbTenantResult = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: 'db-customer',
    });
    const firstPartyResult = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: 'bithire',
    });
    // Same personality
    expect(dbTenantResult.personality).toEqual(firstPartyResult.personality);
    // Same token overrides
    expect(dbTenantResult.tokenOverrides).toEqual(firstPartyResult.tokenOverrides);
    // Same CSS variables (different slug in selector)
    expect(dbTenantResult.cssVariables).toEqual(firstPartyResult.cssVariables);
    // Different CSS string (different tenant slug)
    expect(dbTenantResult.cssString).toContain("html[data-tenant='db-customer']");
    expect(firstPartyResult.cssString).toContain("html[data-tenant='bithire']");
  });
});
