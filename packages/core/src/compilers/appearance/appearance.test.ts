/**
 * M7 regression test — proves TenantAppearance compilation produces real CSS variables.
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
  it('maps palette.primary to --ds-color-primary', () => {
    const general: TenantAppearanceGeneral = {
      palette: { primary: '#FF5500' },
    };
    const vars = appearanceGeneralToVariables(general);
    expect(vars['--ds-color-primary']).toBe('#FF5500');
  });

  it('maps typography.fontFamilyBase to --ds-font-family-base', () => {
    const general: TenantAppearanceGeneral = {
      typography: { fontFamilyBase: 'Inter, sans-serif' },
    };
    const vars = appearanceGeneralToVariables(general);
    expect(vars['--ds-font-family-base']).toBe('Inter, sans-serif');
  });

  it('maps density compact to a scale factor < 1', () => {
    const general: TenantAppearanceGeneral = { density: 'compact' };
    const vars = appearanceGeneralToVariables(general);
    expect(vars['--ds-density-scale']).toBe('0.85');
  });

  it('maps shape.buttonStyle pill to 9999px radius', () => {
    const general: TenantAppearanceGeneral = {
      shape: { buttonStyle: 'pill' },
    };
    const vars = appearanceGeneralToVariables(general);
    expect(vars['--ds-radius-button']).toBe('9999px');
  });

  it('maps surfaces.elevation flat to zero shadows', () => {
    const general: TenantAppearanceGeneral = {
      surfaces: { elevation: 'flat' },
    };
    const vars = appearanceGeneralToVariables(general);
    expect(vars['--ds-elevation-1']).toBe('none');
    expect(vars['--ds-elevation-2']).toBe('none');
  });

  it('returns empty for default/unset values', () => {
    const general: TenantAppearanceGeneral = { density: 'normal' };
    const vars = appearanceGeneralToVariables(general);
    expect(vars['--ds-density-scale']).toBeUndefined();
  });
});

describe('appearanceAdvancedToVariables', () => {
  it('maps chrome.sidebar.bg to --ds-sidebar-bg', () => {
    const advanced: TenantAppearanceAdvanced = {
      chrome: { sidebar: { bg: '#1a1a2e' } },
    };
    const vars = appearanceAdvancedToVariables(advanced);
    expect(vars['--ds-sidebar-bg']).toBe('#1a1a2e');
  });

  it('maps raw tokenOverrides with --ds- prefix', () => {
    const advanced: TenantAppearanceAdvanced = {
      tokenOverrides: {
        '--ds-color-success': '#00FF00',
        '--ds-radius-md': '12px',
      },
    };
    const vars = appearanceAdvancedToVariables(advanced);
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
    // Advanced wins (applied second)
    expect(vars['--ds-color-primary']).toBe('#0000FF');
  });

  it('returns empty for undefined appearance tiers', () => {
    const vars = appearanceToVariables({});
    expect(Object.keys(vars)).toHaveLength(0);
  });
});
