/**
 * Regression tests for TenantAppearance compilation.
 *
 * Proves that declared appearance fields produce real CSS variables that
 * the runtime can inject — no inert declarations.
 */

import { describe, it, expect } from 'vitest';
import {
  appearanceGeneralToVariables,
  appearanceAdvancedToVariables,
  appearanceToVariables,
  compileAppearanceVariables,
  deriveAppearanceColorRamps,
} from '..';
import { RAMP_STEPS } from '@/foundation/kernel/color/oklch/ramp';
import { TENANT_THEME_CONFIG_SCHEMA } from '../../../foundation/schemas/tenant-theme';
import type {
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
} from '@/foundation/contracts/composition/tenants/themes';

describe('appearanceGeneralToVariables', () => {
  it('palette.primary produces --ds-color-primary', () => {
    const vars = appearanceGeneralToVariables({ palette: { primary: '#FF5500' } });
    expect(vars['--ds-color-primary']).toBe('#FF5500');
  });

  it('palette.secondary + accent produce their respective vars', () => {
    const vars = appearanceGeneralToVariables({
      palette: { secondary: '#00AA00', accent: '#FFAA00' },
    });
    expect(vars['--ds-color-secondary']).toBe('#00AA00');
    expect(vars['--ds-color-accent']).toBe('#FFAA00');
  });

  it('derives a readable --ds-color-text-on-primary from a hex primary', () => {
    const vars = appearanceGeneralToVariables({
      palette: { primary: '#0F766E', background: '#FBF6EC' },
    });
    // APCA: white (≈5.5:1 WCAG) beats dark ink (≈3.1:1) on this teal.
    expect(vars['--ds-color-text-on-primary']).toBe('#ffffff');
  });

  it('picks the dark ink when it reads better on a light primary', () => {
    const vars = appearanceGeneralToVariables({ palette: { primary: '#4FB3AA' } });
    expect(vars['--ds-color-text-on-primary']).toBe('#171717');
  });

  it('derives the surface family from a light canvas instead of leaking the dark base', () => {
    const vars = appearanceGeneralToVariables({ palette: { background: '#FBF6EC' } });
    // Tenant-tinted near-white, not the dark :root fallbacks (#18181C/#0F0F12)
    // and not pure white either — the tenant canvas stays in the tint.
    expect(vars['--ds-color-bg-elevated']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(vars['--ds-color-bg-elevated']).not.toBe('#18181C');
    expect(vars['--ds-color-bg-elevated']).not.toBe('#ffffff');
    expect(vars['--ds-color-bg-input']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(vars['--ds-color-bg-input']).not.toBe('#0F0F12');
    // Sunken channels darken the canvas; raised channels lighten it.
    expect(vars['--ds-color-bg-secondary']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(vars['--ds-color-bg-secondary']).not.toBe('#0F0F12');
    expect(vars['--ds-color-bg-tertiary']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(vars['--ds-color-bg-tertiary']).not.toBe('#141417');
  });

  it('lifts a dark canvas toward white instead of flattening it', () => {
    const vars = appearanceGeneralToVariables({
      palette: { background: '#0C0C0E', backgroundMode: 'dark' },
    });
    expect(vars['--ds-color-bg-elevated']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(vars['--ds-color-bg-elevated']?.toLowerCase()).not.toBe('#0c0c0e');
  });

  it('emits light-dark() pairs for the derivations under auto with dark seeds', () => {
    const vars = appearanceGeneralToVariables({
      palette: {
        primary: '#0F766E',
        background: '#FBF6EC',
        backgroundMode: 'auto',
        dark: { primary: '#4FB3AA', background: '#0C0C0E' },
      },
    });
    expect(vars['--ds-color-text-on-primary']).toBe('light-dark(#ffffff, #171717)');
    expect(vars['--ds-color-bg-elevated']).toMatch(/^light-dark\(/);
    expect(vars['--ds-color-bg-input']).toMatch(/^light-dark\(/);
  });

  it('skips the derivations for non-hex palette values', () => {
    const vars = appearanceGeneralToVariables({
      palette: { primary: 'url(https://attacker.invalid)', background: 'red' },
    });
    expect(vars['--ds-color-text-on-primary']).toBeUndefined();
    expect(vars['--ds-color-bg-elevated']).toBeUndefined();
    expect(vars['--ds-color-bg-input']).toBeUndefined();
  });

  it('typography.fontFamilyBase produces --ds-font-family-base', () => {
    const vars = appearanceGeneralToVariables({
      typography: { fontFamilyBase: 'Inter, sans-serif' },
    });
    expect(vars['--ds-font-family-base']).toBe(
      'Inter, "Noto Sans Arabic", sans-serif'
    );
  });

  it.each([
    ['compact', '0.85'],
    ['normal', '1'],
    ['spacious', '1.15'],
  ] as const)('density %s emits the canonical semantic factor', (density, factor) => {
    const vars = appearanceGeneralToVariables({ density });
    expect(vars['--ds-density-mode-factor']).toBe(factor);
    expect(vars['--ds-density-scale']).toBeUndefined();
  });

  it('does not compile an invalid density mode from untrusted input', () => {
    const vars = appearanceGeneralToVariables({
      density: 'url(https://attacker.invalid)',
    } as unknown as TenantAppearanceGeneral);
    expect(vars['--ds-density-mode-factor']).toBeUndefined();
  });

  it('emits the bounded motion dial for CSS-only pre-hydration seams', () => {
    const vars = appearanceGeneralToVariables({
      motion: {
        intensity: 0.72,
        durationScale: 1.25,
        ambient: 'subtle',
      },
    });

    expect(vars).toMatchObject({
      '--ds-motion-intensity': '0.72',
      '--ds-motion-duration-scale': '1.25',
      '--ds-motion-ambient': 'subtle',
    });
  });

  it('clamps finite motion numbers to the public dial bounds', () => {
    const minimum = appearanceGeneralToVariables({
      motion: { intensity: -100, durationScale: -100 },
    });
    const maximum = appearanceGeneralToVariables({
      motion: { intensity: 100, durationScale: 100 },
    });

    expect(minimum['--ds-motion-intensity']).toBe('0');
    expect(minimum['--ds-motion-duration-scale']).toBe('0.5');
    expect(maximum['--ds-motion-intensity']).toBe('1');
    expect(maximum['--ds-motion-duration-scale']).toBe('1.5');
  });

  it('does not leak invalid or CSS-shaped motion input into variables', () => {
    const vars = appearanceGeneralToVariables({
      motion: {
        intensity: 'var(--attacker)',
        durationScale: Number.POSITIVE_INFINITY,
        ambient: 'url(https://attacker.invalid)',
      },
    } as unknown as TenantAppearanceGeneral);

    expect(vars['--ds-motion-intensity']).toBeUndefined();
    expect(vars['--ds-motion-duration-scale']).toBeUndefined();
    expect(vars['--ds-motion-ambient']).toBeUndefined();
    expect(Object.values(vars).join(' ')).not.toContain('attacker');
  });

  it('shape.buttonStyle pill produces --ds-radius-button 9999px', () => {
    const vars = appearanceGeneralToVariables({ shape: { buttonStyle: 'pill' } });
    expect(vars['--ds-radius-button']).toBe('9999px');
  });

  it('shape.buttonStyle sharp produces --ds-radius-button 2px', () => {
    const vars = appearanceGeneralToVariables({ shape: { buttonStyle: 'sharp' } });
    expect(vars['--ds-radius-button']).toBe('2px');
  });

  it('surfaces.elevation flat zeroes out elevation vars', () => {
    const vars = appearanceGeneralToVariables({ surfaces: { elevation: 'flat' } });
    expect(vars['--ds-elevation-1']).toBe('none');
    expect(vars['--ds-elevation-2']).toBe('none');
  });

  it('surfaces.elevation soft produces no overrides (uses DS defaults)', () => {
    const vars = appearanceGeneralToVariables({ surfaces: { elevation: 'soft' } });
    expect(vars['--ds-elevation-1']).toBeUndefined();
  });

  it('navigation.sidebarTone subtle produces sidebar vars with secondary bg', () => {
    const vars = appearanceGeneralToVariables({ navigation: { sidebarTone: 'subtle' } });
    expect(vars['--ds-sidebar-bg']).toBe('var(--ds-color-bg-secondary)');
    expect(vars['--ds-sidebar-text']).toBe('var(--ds-color-text-primary)');
    expect(vars['--ds-sidebar-item-color-active']).toBe('var(--ds-color-primary)');
  });

  it('navigation.sidebarTone strong produces sidebar vars with primary-900 bg', () => {
    const vars = appearanceGeneralToVariables({ navigation: { sidebarTone: 'strong' } });
    expect(vars['--ds-sidebar-bg']).toBe('var(--ds-color-primary-900)');
    expect(vars['--ds-sidebar-text']).toBe('var(--ds-color-white)');
  });

  it('navigation.sidebarTone inverse produces sidebar vars with neutral-900 bg', () => {
    const vars = appearanceGeneralToVariables({ navigation: { sidebarTone: 'inverse' } });
    expect(vars['--ds-sidebar-bg']).toBe('var(--ds-color-neutral-900)');
    expect(vars['--ds-sidebar-text']).toBe('var(--ds-color-neutral-100)');
  });

  it('returns empty for unset/default values', () => {
    const vars = appearanceGeneralToVariables({});
    expect(Object.keys(vars)).toHaveLength(0);
  });
});

describe('appearanceAdvancedToVariables', () => {
  it('chrome.sidebar.bg produces --ds-sidebar-bg', () => {
    const vars = appearanceAdvancedToVariables({ chrome: { sidebar: { bg: '#1a1a2e' } } });
    expect(vars['--ds-sidebar-bg']).toBe('#1a1a2e');
  });

  it('chrome.controls.buttonPrimary.bg produces --ds-button-primary-bg', () => {
    const vars = appearanceAdvancedToVariables({
      chrome: { controls: { buttonPrimary: { bg: '#0066FF' } } },
    });
    expect(vars['--ds-button-primary-bg']).toBe('#0066FF');
  });

  it('chrome.controls.button text alias emits canonical color var only', () => {
    const vars = appearanceAdvancedToVariables({
      chrome: { controls: { buttonPrimary: { text: '#111111' } } },
    });
    expect(vars['--ds-button-primary-color']).toBe('#111111');
    expect(vars['--ds-button-primary-text']).toBeUndefined();
  });

  it('chrome.controls.button color wins over text alias', () => {
    const vars = appearanceAdvancedToVariables({
      chrome: { controls: { buttonPrimary: { color: '#222222', text: '#111111' } } },
    });
    expect(vars['--ds-button-primary-color']).toBe('#222222');
  });

  it('chrome advanced covers BrandChrome parity categories', () => {
    const advanced: TenantAppearanceAdvanced = {
      chrome: {
        shell: {
          bg: '#fafafa',
          commandGridSize: '22px',
        },
        toolbar: {
          bg: '#ffffff',
          controlBorder: '#dddddd',
        },
        filterPill: {
          frameBorder: '#cccccc',
          countActiveRing: 'inset 0 0 0 1px #cccccc',
        },
        badge: {
          surface: '#fffdf7',
          frame: '#b7a98f',
          chipRadius: '4px',
          removeOpacity: 0.82,
          pulseScale: 1.2,
        },
        breadcrumb: {
          colorActive: '#111111',
          separatorColor: '#999999',
        },
        search: {
          iconColor: '#777777',
          clearColor: '#666666',
          resultTitleColor: '#222222',
        },
        table: {
          radius: '12px',
          rowBgExpanded: '#f4f4f4',
          resizeBg: '#dddddd',
        },
        cardComponent: {
          padding: '16px',
          borderColor: '#dddddd',
          radius: '8px',
        },
        metricCard: {
          selectedRing: '0 0 0 3px #eeeeee',
          meterFillSuccess: 'linear-gradient(#0a0, #080)',
          valueHoverColor: '#0055ff',
        },
        signalCard: {
          badgeColor: '#0055ff',
          sectionAltBg: '#f5f7ff',
        },
        workspaceCard: {
          bg: 'linear-gradient(#fff, #f7f9ff)',
          footerBg: '#f7f9ff',
        },
        compactCard: {
          padding: '10px',
        },
        tallCard: {
          minHeight: '280px',
        },
        collectionCard: {
          selectedBorder: '#0055ff',
        },
        listingGrid: {
          gap: '18px',
          minCardWidth: '300px',
        },
      },
    };

    const vars = appearanceAdvancedToVariables(advanced);
    expect(vars['--ds-workspace-shell-bg']).toBe('#fafafa');
    expect(vars['--ds-command-grid-size']).toBe('22px');
    expect(vars['--ds-toolbar-control-border']).toBe('#dddddd');
    expect(vars['--ds-filter-pill-count-active-ring']).toBe('inset 0 0 0 1px #cccccc');
    expect(vars['--ds-badge-surface']).toBe('#fffdf7');
    expect(vars['--ds-badge-frame']).toBe('#b7a98f');
    expect(vars['--ds-badge-chip-radius']).toBe('4px');
    expect(vars['--ds-badge-remove-opacity']).toBe('0.82');
    expect(vars['--ds-badge-pulse-scale']).toBe('1.2');
    expect(vars['--ds-breadcrumb-active-color']).toBe('#111111');
    expect(vars['--ds-input-search-icon-color']).toBe('#777777');
    expect(vars['--ds-table-row-bg-expanded']).toBe('#f4f4f4');
    expect(vars['--ds-card-border-radius']).toBe('8px');
    expect(vars['--ds-metric-card-meter-fill-success']).toBe('linear-gradient(#0a0, #080)');
    expect(vars['--ds-metric-card-value-color-hover']).toBe('#0055ff');
    expect(vars['--ds-signal-card-section-alt-bg']).toBe('#f5f7ff');
    expect(vars['--ds-workspace-card-footer-bg']).toBe('#f7f9ff');
    expect(vars['--ds-compact-card-padding']).toBe('10px');
    expect(vars['--ds-tall-card-min-height']).toBe('280px');
    expect(vars['--ds-collection-card-selected-border']).toBe('#0055ff');
    expect(vars['--ds-listing-grid-min-card-width']).toBe('300px');
  });

  it('tokenOverrides with --ds- prefix are passed through', () => {
    const vars = appearanceAdvancedToVariables({
      tokenOverrides: {
        '--ds-color-success': '#00FF00',
        '--ds-radius-md': '12px',
      },
    });
    expect(vars['--ds-color-success']).toBe('#00FF00');
    expect(vars['--ds-radius-md']).toBe('12px');
  });

  it.each([
    ['without chrome', undefined],
    ['with chrome', { sidebar: { bg: '#1a1a2e' } }],
  ])(
    'caps raw tokenOverrides at the schema limits authority %s',
    (_name, chrome) => {
      const cap = TENANT_THEME_CONFIG_SCHEMA.limits.maxTokenOverrides;
      expect(cap).toBe(200);
      const tokenOverrides: Record<string, string> = {};
      for (let index = 0; index < cap + 25; index++) {
        tokenOverrides[`--ds-example-${String(index).padStart(3, '0')}`] = '1px';
      }
      const vars = appearanceAdvancedToVariables({
        ...(chrome ? { chrome } : {}),
        tokenOverrides,
      });
      const emitted = Object.keys(vars).filter((key) =>
        key.startsWith('--ds-example-')
      );
      expect(emitted.length).toBe(cap);
    }
  );
});

describe('appearanceToVariables', () => {
  it('advanced overrides general when both set same var', () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: '#FF0000' } },
      advanced: { tokenOverrides: { '--ds-color-primary': '#0000FF' } },
    });
    expect(vars['--ds-color-primary']).toBe('#0000FF');
  });

  it('returns empty for undefined appearance tiers', () => {
    const vars = appearanceToVariables({});
    expect(Object.keys(vars)).toHaveLength(0);
  });

  it('keeps the Arabic-safe tail when Advanced replaces tenant font stacks', () => {
    const vars = appearanceToVariables({
      general: {
        typography: {
          fontFamilyBase: '"General Sans", sans-serif',
          fontFamilyHeading: '"General Display", sans-serif',
        },
      },
      advanced: {
        tokenOverrides: {
          '--ds-font-family-base': '"Tenant Sans", sans-serif',
          '--ds-font-family-heading': '"Tenant Heading", serif',
          '--ds-font-family-display': '"Tenant Display", sans-serif',
        },
      },
    });

    expect(vars['--ds-font-family-base']).toBe(
      '"Tenant Sans", "Noto Sans Arabic", sans-serif'
    );
    expect(vars['--ds-font-family-heading']).toBe(
      '"Tenant Heading", "Noto Sans Arabic", serif'
    );
    expect(vars['--ds-font-family-display']).toBe(
      '"Tenant Display", "Noto Sans Arabic", sans-serif'
    );
  });

  it('sidebarTone from general + chrome.sidebar from advanced merge correctly', () => {
    const vars = appearanceToVariables({
      general: { navigation: { sidebarTone: 'subtle' } },
      advanced: { chrome: { sidebar: { bg: '#custom' } } },
    });
    // Advanced wins for bg (both set it)
    expect(vars['--ds-sidebar-bg']).toBe('#custom');
    // General's other sidebar vars survive
    expect(vars['--ds-sidebar-text']).toBe('var(--ds-color-text-primary)');
  });

  it('derives complete compiler-owned OKLCH ramps for every final base color role', () => {
    const vars = appearanceToVariables({
      general: {
        palette: { primary: '#0F766E', secondary: '#8C6D46', accent: '#E2725B' },
      },
      advanced: {
        tokenOverrides: {
          '--ds-color-success': '#5B8A3A',
          '--ds-color-warning': '#C39E22',
          '--ds-color-error': '#C0392B',
          '--ds-color-info': '#5B6FA8',
        },
      },
    });

    for (const role of ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'] as const) {
      for (const step of RAMP_STEPS) {
        expect(vars[`--ds-color-${role}-${step}`]).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('keeps dark ramps surface-aware while auto is deterministic light-first', () => {
    const light = deriveAppearanceColorRamps({
      palette: { primary: '#0F766E', backgroundMode: 'light' },
    });
    const auto = deriveAppearanceColorRamps({
      palette: { primary: '#0F766E', backgroundMode: 'auto' },
    });
    const dark = deriveAppearanceColorRamps({
      palette: { primary: '#0F766E', backgroundMode: 'dark' },
    });

    expect(auto).toEqual(light);
    expect(dark['--ds-color-primary-50']).not.toBe(light['--ds-color-primary-50']);
    expect(dark['--ds-color-primary-900']).not.toBe(light['--ds-color-primary-900']);
  });

  it('keys concrete ramps to the final tenant surface with deterministic fallbacks', () => {
    const cream = deriveAppearanceColorRamps(
      { palette: { primary: '#0F766E', backgroundMode: 'light' } },
      { '--ds-color-primary': '#0F766E', '--ds-color-bg-primary': '#FBF6EC' },
    );
    const white = deriveAppearanceColorRamps(
      { palette: { primary: '#0F766E', backgroundMode: 'light' } },
      { '--ds-color-primary': '#0F766E' },
    );
    const warmDark = deriveAppearanceColorRamps(
      { palette: { primary: '#0F766E', backgroundMode: 'dark' } },
      { '--ds-color-primary': '#0F766E', '--ds-color-dark-bg': '#201B15' },
    );
    const defaultDark = deriveAppearanceColorRamps(
      { palette: { primary: '#0F766E', backgroundMode: 'dark' } },
      { '--ds-color-primary': '#0F766E' },
    );

    expect(cream['--ds-color-primary-50']).not.toBe(white['--ds-color-primary-50']);
    expect(warmDark['--ds-color-primary-50']).not.toBe(defaultDark['--ds-color-primary-50']);
  });

  it('preserves v1 functional colors through deterministic OKLCH formulas', () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: 'hsl(170 78% 26%)', backgroundMode: 'dark' } },
    });

    expect(vars['--ds-color-primary']).toBe('hsl(170 78% 26%)');
    expect(vars['--ds-color-primary-50']).toBe(
      'color-mix(in oklch, hsl(170 78% 26%) 8%, #0C0C0E)',
    );
    expect(vars['--ds-color-primary-500']).toBe('hsl(170 78% 26%)');
    expect(vars['--ds-color-primary-900']).toBe(
      'color-mix(in oklch, hsl(170 78% 26%) 28%, #FFFFFF)',
    );
  });

  it('reapplies derived ramps from the final Advanced seed and never accepts authored ramp values', () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: '#0F766E' } },
      advanced: {
        tokenOverrides: {
          '--ds-color-primary': '#2563EB',
          '--ds-color-primary-500': '#FF00FF',
        },
      },
    } as unknown as Parameters<typeof appearanceToVariables>[0]);

    expect(vars['--ds-color-primary-500']).toMatch(/^#[0-9A-F]{6}$/);
    expect(vars['--ds-color-primary-500']).not.toBe('#FF00FF');
    expect(vars['--ds-color-primary-500']).toBe(
      deriveAppearanceColorRamps({}, { '--ds-color-primary': '#2563EB' })['--ds-color-primary-500'],
    );
  });
});

describe('compileAppearanceVariables', () => {
  it('applies the shared APCA pass for runtime Appearance consumers', () => {
    const compiled = compileAppearanceVariables({
      general: {
        palette: {
          background: '#FFFFFF',
          foreground: {
            primary: '#B8B8B8',
          },
        },
      },
    });

    expect(compiled.variables['--ds-color-text-primary']).not.toBe('#B8B8B8');
    expect(compiled.adjustments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          token: '--ds-color-text-primary',
          pairedWith: '--ds-color-bg-primary',
          from: '#B8B8B8',
        }),
      ]),
    );
  });

  it('preserves a passing foreground without manufacturing adjustments', () => {
    const compiled = compileAppearanceVariables({
      general: {
        palette: {
          background: '#FFFFFF',
          foreground: {
            primary: '#111113',
          },
        },
      },
    });

    expect(compiled.variables['--ds-color-text-primary']).toBe('#111113');
    expect(compiled.adjustments).toHaveLength(0);
  });

  it('snaps an authored on-primary below the floor instead of publishing it', () => {
    // Codex K2/K3 verdict (TMM 3.57:1): no tenant combination below the
    // normal-text floor may survive compilation.
    const compiled = compileAppearanceVariables({
      general: { palette: { primary: '#0F766E' } },
      advanced: { tokenOverrides: { '--ds-color-text-on-primary': '#0C0C0E' } },
    });

    expect(compiled.variables['--ds-color-text-on-primary']).not.toBe('#0C0C0E');
    expect(compiled.adjustments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          token: '--ds-color-text-on-primary',
          pairedWith: '--ds-color-primary',
          from: '#0C0C0E',
        }),
      ]),
    );
  });

  it('keeps the derived on-primary when it already clears the floor', () => {
    const compiled = compileAppearanceVariables({
      general: { palette: { primary: '#0F766E' } },
    });

    expect(compiled.variables['--ds-color-text-on-primary']).toBe('#ffffff');
    expect(
      compiled.adjustments.filter((a) => a.token === '--ds-color-text-on-primary'),
    ).toHaveLength(0);
  });
});
