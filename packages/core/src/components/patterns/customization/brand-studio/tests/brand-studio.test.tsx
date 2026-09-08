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
  tryBuildSurfaceVariables,
  DEFAULT_DARK_GROUND,
  DEFAULT_LIGHT_GROUND,
} from '../index';
import {
  serializeBrandTheme,
  deserializeBrandTheme,
  brandThemeToTenantAppearanceAdvanced,
  brandThemeToTenantAppearance,
} from '../runtime/file-export';
import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import { FIRST_PARTY_THEMES } from '@/foundation/tokens/ts/presentation/brand-themes';
import { admitCssVariables } from '@/infrastructure/compilers/kernel/foundation/css/value-safety';
import {
  compileThemeIntent,
  draftPreviewThemeIntent,
  staticThemeIntent,
} from '@/infrastructure/compilers/runtime/theme';
import { readGovernedTheme } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake';
import { ThemeAdmissionError } from '@/infrastructure/compilers/runtime/theme';

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

/** Card chrome alone drives the text/surface pairs asserted against this one. */
const BARE_SURFACE: BrandStudioSurfaceConfig = {
  key: 'light',
  baseTheme: 'light',
  vertical: 'bithire',
  tenantSlug: 'brand-studio-test',
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
      { key: 'dark', baseTheme: 'dark', vertical: 'bithire', tenantSlug: 'd' },
      { key: 'light', baseTheme: 'light', vertical: 'bithire', tenantSlug: 'l' },
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
        <PatternBrandStudio vertical="bithire" value={HIGH_CONTRAST_THEME} title="Brand Studio Under Test" />
      </Harness>,
    );

    // Wait for the (lazy) engine components to resolve before asserting absence.
    await screen.findByText('Brand Studio Under Test');
    expect(screen.queryByText('text-on-surfaceCard')).toBeNull();

    rerender(
      <Harness>
        <PatternBrandStudio vertical="bithire" value={LOW_CONTRAST_THEME} title="Brand Studio Under Test" />
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
  vertical: 'bithire',
  tenantSlug: 'repaint-test-dark',
};
const LIGHT_SURFACE_UNDER_TEST: BrandStudioSurfaceConfig = {
  key: 'light',
  baseTheme: 'light',
  vertical: 'bithire',
  tenantSlug: 'repaint-test-light',
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
        <PatternBrandStudio vertical="bithire" value={initial} title="Repaint Probe" />
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
        <PatternBrandStudio vertical="bithire" value={edited} title="Repaint Probe" />
      </Harness>,
    );

    expect(styleText()).toContain('--ds-color-primary: #16a34a;');
    expect(styleText()).not.toContain('--ds-color-primary: #4f46e5;');
  });
});

describe('PatternBrandStudio dark-mode overlay (BrandTheme.modes) controls', () => {
  it('drives --ds-color-primary from modes.dark.palette.primaryColor on the dark surface only', () => {
    const theme: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5' },
      modes: { dark: { palette: { primaryColor: '#747EB0' } } },
    };

    const dark = buildSurfaceVariables(theme, DARK_SURFACE_UNDER_TEST).vars;
    const light = buildSurfaceVariables(theme, LIGHT_SURFACE_UNDER_TEST).vars;

    expect(dark['--ds-color-primary']).toBe('#747EB0');
    expect(light['--ds-color-primary']).toBe('#4f46e5');
  });

  it('leaves --ds-color-primary at the base value on the dark surface when modes.dark is unset', () => {
    const theme: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const dark = buildSurfaceVariables(theme, DARK_SURFACE_UNDER_TEST).vars;
    expect(dark['--ds-color-primary']).toBe('#4f46e5');
  });

  it('drives --ds-color-bg-primary from modes.dark.palette.backgroundColor on the dark surface only', () => {
    const theme: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5' },
      modes: { dark: { palette: { backgroundColor: '#050507' } } },
    };

    const dark = buildSurfaceVariables(theme, DARK_SURFACE_UNDER_TEST).vars;
    const light = buildSurfaceVariables(theme, LIGHT_SURFACE_UNDER_TEST).vars;

    expect(dark['--ds-color-bg-primary']).toBe('#050507');
    expect(light['--ds-color-bg-primary']).toBe(DEFAULT_LIGHT_GROUND['--ds-color-bg-primary']);
  });

  it('resolves the OTHER direction too: a dark-default theme drives --ds-color-primary from modes.light.palette on the light surface only', () => {
    // rottay's real shape: appearance.defaultMode 'dark', with a `modes.light`
    // overlay carrying the light variant. The base palette IS the dark
    // surface's value; only the light surface pulls from the overlay.
    //
    // Previewed over ROTTAY, and it has to be: a draft is a patch, so a
    // dark-default draft over a light-default vertical would leave the merged
    // theme claiming `dark` while still carrying the vertical's own
    // `modes.dark` overlay -- which the overlay law refuses by name.
    const darkVerticalSurfaces = {
      dark: { ...DARK_SURFACE_UNDER_TEST, vertical: 'rottay' } as BrandStudioSurfaceConfig,
      light: { ...LIGHT_SURFACE_UNDER_TEST, vertical: 'rottay' } as BrandStudioSurfaceConfig,
    };
    const theme: BrandTheme = {
      id: 'p',
      name: 'P',
      appearance: { defaultMode: 'dark' },
      // Admissible on both surfaces: the compile door holds a draft to the same
      // governed floor a publish holds it to (WO-CAT-03), and rottay's dark
      // canvas admits the light end of a hue while its light overlay admits the
      // dark end. The property under test is which OVERLAY drives the channel,
      // not which hue does.
      palette: { primaryColor: '#93BAFA' },
      modes: { light: { palette: { primaryColor: '#1B4A6E' } } },
    };

    const dark = buildSurfaceVariables(theme, darkVerticalSurfaces.dark).vars;
    const light = buildSurfaceVariables(theme, darkVerticalSurfaces.light).vars;

    expect(dark['--ds-color-primary']).toBe('#93BAFA');
    expect(light['--ds-color-primary']).toBe('#1B4A6E');
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
    // Graded on the ground that IS the vertical's own default mode, so no mode
    // overlay of the vertical's sits above the draft's base chrome. On the
    // other ground the vertical's overlay legitimately wins -- which is what
    // the tenant would see, and therefore what the studio must show.
    const report = evaluateBrandThemeContrast(declared, {
      ...DARK_SURFACE_UNDER_TEST,
      vertical: 'rottay',
    });

    expect(report.colors.surfaceCard).toBe('#111111');
    expect(report.colors.text).toBe('#f2f2f2');
    expect(report.colors.textMuted).toBe('#bbbbbb');
  });
});


// ---------------------------------------------------------------------------
// The preview ground is design-system-owned: no raw post-compile CSS seam
// ---------------------------------------------------------------------------

describe('PatternBrandStudio preview ground admits no caller CSS', () => {
  const HOSTILE_GROUND = {
    '--ds-color-bg-primary': 'red; } body { display: none; } .x {',
    '--evil': 'purple',
    '} body { background: red; } .y {': 'blue',
  };

  /** A JS caller can still hand the old key over; nothing may read it. */
  const withHostileGround = (
    surface: BrandStudioSurfaceConfig,
  ): BrandStudioSurfaceConfig =>
    ({ ...surface, groundVars: HOSTILE_GROUND }) as unknown as BrandStudioSurfaceConfig;

  it('drops a hostile ground map instead of compiling it into the panel variables', () => {
    const theme: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const { vars } = buildSurfaceVariables(theme, withHostileGround(LIGHT_SURFACE_UNDER_TEST));

    expect(vars['--evil']).toBeUndefined();
    expect(Object.keys(vars).some((name) => name.includes('}'))).toBe(false);
    expect(Object.values(vars).some((value) => value.includes('}'))).toBe(false);
    // The DS ground is what actually grounds the panel.
    expect(vars['--ds-color-bg-primary']).toBe(DEFAULT_LIGHT_GROUND['--ds-color-bg-primary']);
  });

  it('cannot create a body rule in the injected <style> block', async () => {
    const theme: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    render(
      <Harness>
        <PatternBrandStudio
          vertical="bithire"
          value={theme}
          title="Ground Probe"
          lightSurface={{ groundVars: HOSTILE_GROUND } as unknown as Partial<BrandStudioSurfaceConfig>}
          darkSurface={{ groundVars: HOSTILE_GROUND } as unknown as Partial<BrandStudioSurfaceConfig>}
        />
      </Harness>,
    );
    await screen.findByText('Ground Probe');

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((el) => el.textContent ?? '')
      .join('\n');

    // `body` occurs legitimately inside channel NAMES (--ds-type-body-*), so the
    // claim is about rule selectors: the hostile value must not have closed the
    // panel's rule and opened one of its own.
    expect(styleText).not.toMatch(/\}\s*body\s*\{/u);
    expect(styleText).not.toContain('display: none');
    expect(styleText).not.toContain('--evil');
    // Every rule the studio injects is anchored to its own panel scope.
    for (const selector of styleText.matchAll(/(^|\})\s*([^{}]+)\{/gu)) {
      expect(selector[2]!.trim().startsWith('.brand-studio-')).toBe(true);
    }
  });

  it('still grounds each panel, and a theme value still wins over the ground', () => {
    // The positive control: removing the seam did not remove the ground, and
    // the intended visual setting continues to arrive through compileTheme.
    const paletteOnly: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const dark = buildSurfaceVariables(paletteOnly, DARK_SURFACE_UNDER_TEST).vars;
    const light = buildSurfaceVariables(paletteOnly, LIGHT_SURFACE_UNDER_TEST).vars;

    expect(dark['--ds-color-bg-primary']).toBe(DEFAULT_DARK_GROUND['--ds-color-bg-primary']);
    expect(light['--ds-color-bg-primary']).toBe(DEFAULT_LIGHT_GROUND['--ds-color-bg-primary']);

    // A near-black ground used to be the fixture here. On a LIGHT-default
    // vertical it leaves the product's own reading ink at APCA Lc 0, which the
    // compile door now refuses on this path exactly as it refuses it at publish
    // -- correctly: a tenant that repaints the canvas and not the ink ships
    // unreadable text. The property under test is that an AUTHORED ground wins
    // over the studio's scaffold ground, which any distinguishable value states.
    const authored: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5', backgroundColor: '#FAFAFF' },
    };
    const compiled = buildSurfaceVariables(authored, LIGHT_SURFACE_UNDER_TEST);
    expect(compiled.vars['--ds-color-bg-primary']).toBe('#FAFAFF');
    expect(compiled.declaredKeys.has('--ds-color-bg-primary')).toBe(true);
  });

  it('selects the ground from baseTheme, the one presentation prop that names it', () => {
    const theme: BrandTheme = { id: 'p', name: 'P', palette: { primaryColor: '#4f46e5' } };
    const asLight = buildSurfaceVariables(theme, {
      key: 'dark',
      baseTheme: 'light',
      vertical: 'bithire',
      tenantSlug: 'ground-select',
    }).vars;
    expect(asLight['--ds-color-bg-primary']).toBe(DEFAULT_LIGHT_GROUND['--ds-color-bg-primary']);
  });
});


// ---------------------------------------------------------------------------
// A theme string cannot escape the preview rule
//
// `Theme` declares `palette.primaryColor` and `typography.fontFamilyBase` as
// OPEN strings, so the option domains correctly refuse nothing there. The
// guarantee is the emission grammar's, and these assert it end to end: through
// the rendered component, not only through the predicate.
// ---------------------------------------------------------------------------

const THEME_ESCAPE = '#000; } body { display: none; } .fable-escape {';

describe('PatternBrandStudio refuses a theme string that would escape the rule', () => {
  const styleText = (): string =>
    Array.from(document.querySelectorAll('style'))
      .map((el) => el.textContent ?? '')
      .join('\n');

  const selectorsOf = (css: string): string[] =>
    [...css.matchAll(/(^|\})\s*([^{}]+)\{/gu)].map((match) => match[2]!.trim());

  const hostile: readonly [string, BrandTheme][] = [
    [
      'palette.primaryColor',
      { id: 'h', name: 'H', palette: { primaryColor: THEME_ESCAPE } },
    ],
    [
      'typography.fontFamilyBase',
      {
        id: 'h',
        name: 'H',
        palette: { primaryColor: '#4f46e5' },
        typography: { fontFamilyBase: THEME_ESCAPE },
      },
    ],
    [
      'a mode overlay',
      {
        id: 'h',
        name: 'H',
        palette: { primaryColor: '#4f46e5' },
        modes: { dark: { palette: { backgroundColor: THEME_ESCAPE } } },
      },
    ],
    [
      'a chrome leaf',
      {
        id: 'h',
        name: 'H',
        palette: { primaryColor: '#4f46e5' },
        chrome: { cardComponent: { bg: THEME_ESCAPE } },
      },
    ],
  ];

  for (const [label, theme] of hostile) {
    it(`opens no foreign rule from ${label}`, async () => {
      render(
        <Harness>
          <PatternBrandStudio vertical="bithire" value={theme} title={`Escape ${label}`} />
        </Harness>,
      );
      await screen.findByText(`Escape ${label}`);

      const css = styleText();
      expect(css).not.toMatch(/\}\s*body\s*\{/u);
      expect(css).not.toContain('display: none');
      expect(css).not.toContain('fable-escape');
      for (const selector of selectorsOf(css)) {
        expect(selector.startsWith('.brand-studio-'), selector).toBe(true);
      }
    });

    it(`refuses the hostile value from ${label} BY NAME, publishing nothing`, () => {
      // The defence moved one step earlier. `buildSurfaceVariables` reaches the
      // one compile door, and since WO-CAT-03 that door refuses the draft
      // outright instead of compiling it and leaving the value to be dropped
      // downstream (F-13, F-61): a colour that is not a colour is named at the
      // keypath its author wrote, and a value that could close the block is
      // named at the channel it would have been emitted on.
      //
      // The property the studio still owes is asserted with it: the panel
      // publishes NO variables for a refused draft, so there is nothing for the
      // hostile value to survive in.
      for (const baseTheme of ['light', 'dark'] as const) {
        const surface = {
          key: baseTheme,
          baseTheme,
          vertical: 'bithire',
          tenantSlug: 'escape-probe',
        } as const;
        expect(() => buildSurfaceVariables(theme, surface)).toThrow(ThemeAdmissionError);
        // The studio keeps rendering, and the hostile value still never reaches
        // the injected map: an INTENT-stage refusal has no compile to project
        // (the door refused before a channel was written), and an EMISSION-stage
        // one projects a compile whose hostile channel the emission grammar has
        // already dropped. Either way the author sees the refusal, not the value.
        const { vars, declaredKeys, refusal } = tryBuildSurfaceVariables(theme, surface);
        expect(refusal).toBeDefined();
        expect(Object.values(vars)).not.toContain(THEME_ESCAPE);
        for (const value of Object.values(vars)) expect(value).not.toContain('} body {');
        for (const name of declaredKeys) expect(vars[name]).not.toContain('} body {');
      }
    });
  }

  it('positive control: a normal theme still paints and is still grounded', async () => {
    const normal: BrandTheme = {
      id: 'p',
      name: 'P',
      palette: { primaryColor: '#4f46e5' },
      typography: { fontFamilyBase: "Inter, 'Segoe UI', sans-serif" },
    };
    const { vars } = buildSurfaceVariables(normal, LIGHT_SURFACE_UNDER_TEST);
    expect(vars['--ds-color-primary']).toBe('#4f46e5');
    expect(vars['--ds-color-bg-primary']).toBe(DEFAULT_LIGHT_GROUND['--ds-color-bg-primary']);

    render(
      <Harness>
        <PatternBrandStudio vertical="bithire" value={normal} title="Normal Paint" />
      </Harness>,
    );
    await screen.findByText('Normal Paint');
    const css = styleText();
    expect(css).toContain('--ds-color-primary: #4f46e5;');
    // The compiler appends the mandatory script fallback, so the authored faces
    // are asserted as a prefix rather than as the whole value.
    expect(css).toContain("--ds-font-family-base: Inter, 'Segoe UI',");
  });

  it('both DS grounds survive the grammar in full', () => {
    for (const ground of [DEFAULT_DARK_GROUND, DEFAULT_LIGHT_GROUND]) {
      const admitted = admitCssVariables(ground);
      expect(Object.keys(admitted)).toEqual(Object.keys(ground));
    }
  });

  it('exactness: the studio publishes every channel the draft actually moves', () => {
    // Every first-party corpus, edited the way the studio edits: the vertical's
    // own theme with a handful of leaves moved. Cross-vertical drafting is not
    // the fixture here because a draft is a PATCH -- a dark-default draft over
    // a light-default vertical leaves the merged theme carrying that vertical's
    // `modes.dark` overlay against its own declared default, which the overlay
    // law refuses. The property under test is exactness of publication, and a
    // same-vertical edit states it without that confound.
    // The moved leaves are ADMISSIBLE ones, and per vertical, because the door
    // holds this draft to the same law a publish is held to (WO-CAT-03). The
    // dials sit inside every vertical's envelope (typeScale 0.92..1.08,
    // radiusScale 0.8..1.2), and the seeds sit where the governed floor admits
    // them: the LIGHT end of a hue on rottay's dark canvas, the DARK end on the
    // two light-default verticals. The property under test is exactness of
    // publication -- which channels move -- not which hue moves them.
    const seeds = {
      rottay: { primaryColor: '#93BAFA', accentColor: '#B7F0DC' },
      bithire: { primaryColor: '#2F6B9A', accentColor: '#1F7A5A' },
      evnto: { primaryColor: '#2F6B9A', accentColor: '#1F7A5A' },
    } as const;
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const authored = readGovernedTheme(FIRST_PARTY_THEMES[vertical]);
      const brand: BrandTheme = {
        ...authored,
        palette: { ...authored.palette, ...seeds[vertical] },
        typography: { ...authored.typography, scale: 1.05 },
        surfaces: { ...authored.surfaces, radiusScale: 1.15 },
      };
      const baseTheme = authored.appearance?.defaultMode ?? 'light';
      const tenantSlug = `exactness-${vertical}`;
      const surface: BrandStudioSurfaceConfig = {
        key: baseTheme,
        baseTheme,
        vertical,
        tenantSlug,
      };
      const { declaredKeys } = buildSurfaceVariables(brand, surface);

      // Recomputed independently from the same door: the studio's published
      // key set must be exactly the channels the draft moves off the baseline.
      const proposed = compileThemeIntent(
        draftPreviewThemeIntent({ vertical, slug: tenantSlug, draft: brand }),
      ).compiled;
      const untouched = compileThemeIntent(
        staticThemeIntent(vertical, tenantSlug),
      ).compiled;
      const moved = Object.entries(proposed.cssVariables)
        .filter(([name, value]) => untouched.cssVariables[name] !== value)
        .map(([name]) => name);

      expect(moved.length, vertical).toBeGreaterThan(0);
      expect([...declaredKeys].sort(), vertical).toEqual(moved.sort());
    }
  });
});
