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
} from '..';
import type {
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
} from '../../../contracts/themes';

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
});
