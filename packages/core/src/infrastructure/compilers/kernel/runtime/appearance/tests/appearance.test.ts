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

  it('typography.fontFamilyBase produces --ds-font-family-base', () => {
    const vars = appearanceGeneralToVariables({
      typography: { fontFamilyBase: 'Inter, sans-serif' },
    });
    expect(vars['--ds-font-family-base']).toBe('Inter, sans-serif');
  });

  it('density does NOT emit a CSS var (handled by useTokens JS factor)', () => {
    const vars = appearanceGeneralToVariables({ density: 'compact' });
    expect(vars['--ds-density-scale']).toBeUndefined();
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
    const vars = appearanceGeneralToVariables({ density: 'normal' });
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
