import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { BrandTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
import type { BrandStudioSurfaceConfig } from '../contracts';
import {
  PatternBrandStudio,
  deriveBrandingColors,
  evaluateBrandThemeContrast,
  applyHostileBrandTheme,
  buildSurfaceVariables,
  DEFAULT_DARK_GROUND,
  DEFAULT_LIGHT_GROUND,
} from '../index';
import {
  serializeBrandTheme,
  deserializeBrandTheme,
  brandThemeToTenantAppearanceAdvanced,
  brandThemeToTenantAppearance,
} from '../runtime/file-export';

const TEST_TENANT: TenantConfig = {
  slug: 'brand-studio-test',
  name: 'Brand Studio Test',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Brand Studio Test' },
};

function Harness({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
      {children}
    </DesignSystemProvider>
  );
}

/** A ground-independent surface: card chrome alone drives text/surface pairs. */
const BARE_SURFACE: BrandStudioSurfaceConfig = {
  key: 'light',
  baseTheme: 'light',
  tenantSlug: 'brand-studio-test',
  groundVars: {},
};

/** Card body text nearly identical to card background — fails AA badly. */
const LOW_CONTRAST_THEME: BrandTheme = {
  id: 'low-contrast',
  name: 'Low Contrast',
  palette: { primaryColor: '#e5e7eb' },
  chrome: {
    cardComponent: { bg: '#ffffff', color: '#f2f2f2', colorMuted: '#f4f4f4' },
  },
};

const HIGH_CONTRAST_THEME: BrandTheme = {
  id: 'high-contrast',
  name: 'High Contrast',
  palette: { primaryColor: '#3b82f6' },
  chrome: {
    cardComponent: { bg: '#ffffff', color: '#111111', colorMuted: '#555555' },
  },
};

const RICH_THEME: BrandTheme = {
  id: 'rich',
  name: 'Rich Theme',
  palette: {
    primaryColor: '#1a56db',
    secondaryColor: '#7c3aed',
    accentColor: '#0ea5e9',
    textPrimaryColor: '#172033',
    textSecondaryColor: '#46536b',
    textMutedColor: '#68758d',
    textDisabledColor: '#8b95a8',
    borderPrimaryColor: '#cbd5e1',
    borderSecondaryColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    successColor: '#16a34a',
    warningColor: '#d97706',
    errorColor: '#dc2626',
    infoColor: '#2563eb',
  },
  typography: {
    fontFamilyBase: 'Inter, sans-serif',
    fontFamilyHeading: 'Inter, sans-serif',
    headingWeightBias: 'heavier',
    labelStyle: 'sentence',
    letterSpacing: { heading: '-0.02em' },
    lineHeight: { body: 1.6 },
  },
  surfaces: {
    borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
    effectIntensity: 1,
  },
  motion: {
    entrance: 'fade',
    entranceDuration: 200,
    hoverLift: 2,
  },
  chrome: {
    // Personality tokens with no Advanced --ds-* home; must be dropped by the projection.
    card: {},
    accent: {},
    controls: {
      buttonPrimary: { bg: '#1a56db', color: '#ffffff' },
      input: { bg: '#ffffff', border: '#e2e8f0' },
    },
    cardComponent: { bg: '#ffffff', color: '#0f172a', border: '#e2e8f0' },
    table: { headerBg: '#f8fafc', rowBgHover: '#f1f5f9' },
    modal: { bg: '#ffffff', overlayBg: 'rgba(0,0,0,0.4)' },
    tabs: { colorActive: '#1a56db', border: '#e2e8f0' },
  },
};

describe('PatternBrandStudio contrast validation', () => {
  it('flags a known low-contrast theme with a specific failing pair and ratio', () => {
    const report = evaluateBrandThemeContrast(LOW_CONTRAST_THEME, BARE_SURFACE);

    // Derivation must have produced hex card colors for the validator to score.
    expect(report.colors.surfaceCard).toBe('#ffffff');
    expect(report.colors.text).toBe('#f2f2f2');

    expect(report.valid).toBe(false);
    const violation = report.violations.find((entry) => entry.pair === 'text-on-surfaceCard');
    expect(violation).toBeDefined();
    expect(violation!.required).toBe(4.5);
    expect(violation!.ratio).toBeLessThan(4.5);
    // Near-identical whites collapse toward a 1:1 ratio.
    expect(violation!.ratio).toBeLessThan(1.5);

    // A remediation suggestion is emitted for the failing pair.
    const suggestion = report.suggestions.find((entry) => entry.pair === 'text-on-surfaceCard');
    expect(suggestion).toBeDefined();
    expect(suggestion!.newRatio).toBeGreaterThanOrEqual(4.5);
  });

  it('passes a high-contrast card pairing', () => {
    const report = evaluateBrandThemeContrast(HIGH_CONTRAST_THEME, BARE_SURFACE);
    const cardViolation = report.violations.find((entry) =>
      entry.pair.endsWith('-on-surfaceCard') && entry.pair.startsWith('text'),
    );
    expect(cardViolation).toBeUndefined();
  });

  it('derives only hex values and skips color-mix / var tokens', () => {
    const colors = deriveBrandingColors(
      {
        '--ds-color-primary': '#1a56db',
        '--ds-card-bg': '#ffffff',
        '--ds-card-color': 'color-mix(in srgb, #000 50%, #fff)',
        '--ds-color-text': '#0f172a',
      },
      'light',
    );
    expect(colors.primary).toBe('#1a56db');
    expect(colors.surfaceCard).toBe('#ffffff');
    // The card color is a non-hex color-mix; derivation falls through to --ds-color-text.
    expect(colors.text).toBe('#0f172a');
  });

  it('reports failing color pairs for hostile input on both grounds', () => {
    const surfaces: BrandStudioSurfaceConfig[] = [
      { key: 'dark', baseTheme: 'dark', tenantSlug: 'd', groundVars: {} },
      { key: 'light', baseTheme: 'light', tenantSlug: 'l', groundVars: {} },
    ];
    for (const surface of surfaces) {
      const report = evaluateBrandThemeContrast(applyHostileBrandTheme(RICH_THEME), surface);
      expect(report.valid).toBe(false);
      expect(report.violations.length).toBeGreaterThan(0);
      // Every reported failure is a color pair (the validator has no font/radius notion).
      for (const violation of report.violations) {
        expect(violation.foreground.startsWith('#')).toBe(true);
        expect(violation.background.startsWith('#')).toBe(true);
      }
    }
  });
});

describe('PatternBrandStudio export paths', () => {
  it('round-trips a BrandTheme through JSON without loss', () => {
    const restored = deserializeBrandTheme(serializeBrandTheme(RICH_THEME));
    expect(restored).toEqual(RICH_THEME);
  });

  it('projects to a bounded TenantAppearanceAdvanced', () => {
    const advanced = brandThemeToTenantAppearanceAdvanced(RICH_THEME);

    // Chrome maps directly.
    expect(advanced.chrome?.controls).toEqual(RICH_THEME.chrome!.controls);
    expect(advanced.chrome?.cardComponent).toEqual(RICH_THEME.chrome!.cardComponent);
    expect(advanced.chrome?.modal).toEqual(RICH_THEME.chrome!.modal);

    // Personality tokens with no Advanced home are dropped.
    expect('card' in (advanced.chrome ?? {})).toBe(false);
    expect('accent' in (advanced.chrome ?? {})).toBe(false);

    // Palette/typography/motion funnel through bounded token overrides.
    const overrides = advanced.tokenOverrides ?? {};
    expect(overrides['--ds-color-primary']).toBe('#1a56db');
    expect(overrides['--ds-color-bg-primary']).toBe('#f8fafc');
    expect(overrides['--ds-color-text-primary']).toBe('#172033');
    expect(overrides['--ds-color-text-secondary']).toBe('#46536b');
    expect(overrides['--ds-color-text-muted']).toBe('#68758d');
    expect(overrides['--ds-color-text-disabled']).toBe('#8b95a8');
    expect(overrides['--ds-color-border-primary']).toBe('#cbd5e1');
    expect(overrides['--ds-color-border-secondary']).toBe('#e2e8f0');
    expect(overrides['--ds-font-family-base']).toBe('Inter, sans-serif');
    expect(overrides['--ds-motion-calm']).toBe('200ms');

    // No unbounded overrides: every key is a --ds-* token and the count is small.
    const keys = Object.keys(overrides);
    expect(keys.every((key) => key.startsWith('--ds-'))).toBe(true);
    expect(keys.length).toBeLessThan(30);
  });

  it('projects global palette foundations into General for DB-owned tenants', () => {
    const appearance = brandThemeToTenantAppearance(RICH_THEME);

    expect(appearance.general?.palette).toMatchObject({
      primary: '#1a56db',
      background: '#f8fafc',
      foreground: {
        primary: '#172033',
        secondary: '#46536b',
        muted: '#68758d',
        disabled: '#8b95a8',
      },
      border: { primary: '#cbd5e1', secondary: '#e2e8f0' },
      backgroundMode: 'light',
    });
    expect(appearance.general?.typography?.fontFamilyBase).toBe('Inter, sans-serif');
    expect(appearance.general?.surfaces?.effectIntensity).toBe(1);
    expect(appearance.advanced?.chrome?.controls).toEqual(RICH_THEME.chrome?.controls);
  });
});

describe('PatternBrandStudio invokes contrast validation on edit', () => {
  it('surfaces the text-on-surfaceCard failure only after the value degrades', async () => {
    const { rerender } = render(
      <Harness>
        <PatternBrandStudio value={HIGH_CONTRAST_THEME} title="Brand Studio Under Test" />
      </Harness>,
    );

    // Wait for the (lazy) engine components to resolve before asserting absence.
    await screen.findByText('Brand Studio Under Test');
    expect(screen.queryByText('text-on-surfaceCard')).toBeNull();

    rerender(
      <Harness>
        <PatternBrandStudio value={LOW_CONTRAST_THEME} title="Brand Studio Under Test" />
      </Harness>,
    );

    // The failing pair is now surfaced inline (both preview grounds report it).
    const surfaced = await screen.findAllByText('text-on-surfaceCard');
    expect(surfaced.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// WO-CRA-05: live preview repaint, dark-primary control, contrast scaffold gap
// ---------------------------------------------------------------------------

/** The real default surfaces PatternBrandStudio uses when no override is passed. */
const DARK_SURFACE_UNDER_TEST: BrandStudioSurfaceConfig = {
  key: 'dark',
  baseTheme: 'dark',
  tenantSlug: 'repaint-test-dark',
  groundVars: DEFAULT_DARK_GROUND,
};
const LIGHT_SURFACE_UNDER_TEST: BrandStudioSurfaceConfig = {
  key: 'light',
  baseTheme: 'light',
  tenantSlug: 'repaint-test-light',
  groundVars: DEFAULT_LIGHT_GROUND,
};

describe('PatternBrandStudio live preview repaint', () => {
  it('changes --ds-color-primary in the injected variable map when only the Palette primary color changes', () => {
    const indigo: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const green: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#16a34a' } };

    const before = buildSurfaceVariables(indigo, DARK_SURFACE_UNDER_TEST).vars;
    const after = buildSurfaceVariables(green, DARK_SURFACE_UNDER_TEST).vars;

    expect(before['--ds-color-primary']).toBe('#4f46e5');
    expect(after['--ds-color-primary']).toBe('#16a34a');
  });

  it('reopens the flagship Button/Tabs primary fallback on the real default ground when the theme leaves chrome unset', () => {
    const paletteOnly: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const { vars } = buildSurfaceVariables(paletteOnly, DARK_SURFACE_UNDER_TEST);

    // Neither the theme nor the default ground pins a literal here -- both alias
    // back to --ds-color-primary, which is what lets the flagship Button/Tabs
    // repaint from a Palette-only edit instead of showing whatever chrome the
    // ambient host tenant happens to pin (see PRIMARY_CHROME_FALLBACK).
    expect(vars['--ds-button-primary-bg']).toBe('var(--ds-color-primary)');
    expect(vars['--ds-button-primary-border']).toBe('var(--ds-color-primary)');
    expect(vars['--ds-tab-border-active']).toBe('var(--ds-color-primary)');
    expect(vars['--ds-color-primary']).toBe('#4f46e5');
  });

  it('lets an explicit chrome.controls.buttonPrimary.bg win over the ground alias', () => {
    const explicit: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5' },
      chrome: { controls: { buttonPrimary: { bg: '#111111' } } },
    };
    const { vars } = buildSurfaceVariables(explicit, DARK_SURFACE_UNDER_TEST);
    expect(vars['--ds-button-primary-bg']).toBe('#111111');
  });

  it('proves the repaint in the rendered DOM: the injected <style> text changes with the value prop', async () => {
    const initial: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const edited: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#16a34a' } };

    const { rerender } = render(
      <Harness>
        <PatternBrandStudio value={initial} title="Repaint Probe" />
      </Harness>,
    );
    await screen.findByText('Repaint Probe');

    const styleText = () =>
      Array.from(document.querySelectorAll('style'))
        .map((el) => el.textContent ?? '')
        .join('\n');

    expect(styleText()).toContain('--ds-color-primary: #4f46e5;');
    expect(styleText()).toContain('--ds-button-primary-bg: var(--ds-color-primary);');

    rerender(
      <Harness>
        <PatternBrandStudio value={edited} title="Repaint Probe" />
      </Harness>,
    );

    expect(styleText()).toContain('--ds-color-primary: #16a34a;');
    expect(styleText()).not.toContain('--ds-color-primary: #4f46e5;');
  });
});

describe('PatternBrandStudio dark-primary/dark-background controls', () => {
  it('drives --ds-color-primary from darkPrimaryColor on the dark surface only', () => {
    const theme: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5', darkPrimaryColor: '#a5b4fc' },
    };

    const dark = buildSurfaceVariables(theme, DARK_SURFACE_UNDER_TEST).vars;
    const light = buildSurfaceVariables(theme, LIGHT_SURFACE_UNDER_TEST).vars;

    expect(dark['--ds-color-primary']).toBe('#a5b4fc');
    expect(light['--ds-color-primary']).toBe('#4f46e5');
  });

  it('leaves --ds-color-primary at the base value on the dark surface when darkPrimaryColor is unset', () => {
    const theme: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const dark = buildSurfaceVariables(theme, DARK_SURFACE_UNDER_TEST).vars;
    expect(dark['--ds-color-primary']).toBe('#4f46e5');
  });

  it('drives --ds-color-bg-primary from darkBackgroundColor on the dark surface only', () => {
    const theme: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5', darkBackgroundColor: '#050507' },
    };

    const dark = buildSurfaceVariables(theme, DARK_SURFACE_UNDER_TEST).vars;
    const light = buildSurfaceVariables(theme, LIGHT_SURFACE_UNDER_TEST).vars;

    expect(dark['--ds-color-bg-primary']).toBe('#050507');
    expect(light['--ds-color-bg-primary']).toBe(DEFAULT_LIGHT_GROUND['--ds-color-bg-primary']);
  });
});

describe('PatternBrandStudio contrast check grades the theme, not the scaffold', () => {
  it('reports text/textMuted/surfaceCard as not-declared on the real default ground when the theme leaves chrome unset', () => {
    const paletteOnly: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const report = evaluateBrandThemeContrast(paletteOnly, DARK_SURFACE_UNDER_TEST);

    // The scaffold itself does carry hex values for these roles (the studio's own
    // chrome needs to be readable) -- the point is that an undeclared theme color
    // must not be silently graded as if the theme itself had specified it.
    expect(DEFAULT_DARK_GROUND['--ds-color-text']).toBeDefined();
    expect(report.colors.text).toBeUndefined();
    expect(report.colors.textMuted).toBeUndefined();
    expect(report.colors.surfaceCard).toBeUndefined();
  });

  it('grades the theme own text/surface pairing once chrome.cardComponent declares it', () => {
    const declared: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5' },
      chrome: { cardComponent: { bg: '#111111', color: '#f2f2f2', colorMuted: '#bbbbbb' } },
    };
    const report = evaluateBrandThemeContrast(declared, DARK_SURFACE_UNDER_TEST);

    expect(report.colors.surfaceCard).toBe('#111111');
    expect(report.colors.text).toBe('#f2f2f2');
    expect(report.colors.textMuted).toBe('#bbbbbb');
  });
});
