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
} from '.';
import type {
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
} from '../../contracts/themes';

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
