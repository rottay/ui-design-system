/**
 * Provider-level behavioral test for TenantAppearance.
 *
 * Proves that config.appearance fields propagate through
 * DesignSystemProvider -> ThemeProvider -> DOM.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { DesignSystemProvider } from '../../../runtime/bootstrap/DesignSystemProvider';
import { useTenantContext } from '../../../runtime/tenant/context/TenantProvider';
import type { TenantConfig } from '../../../contracts';

function makeConfig(overrides: Partial<TenantConfig>): TenantConfig {
  return {
    slug: 'test-appearance',
    name: 'Test Appearance',
    engine: 'classic',
    theme: 'base', // default — backgroundMode should be able to win
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Test' },
    ...overrides,
  } as TenantConfig;
}

function TenantConfigProbe() {
  const { config } = useTenantContext();
  return (
    <div
      data-testid="tenant-config-probe"
      data-company={config.branding.companyName}
      data-primary={config.branding.primaryColor}
    />
  );
}

afterEach(() => {
  // Clean up DOM attributes set by providers
  const root = document.documentElement;
  root.removeAttribute('data-tenant');
  root.removeAttribute('data-theme');
  root.removeAttribute('data-engine');
  root.classList.remove('dark');
  root.style.cssText = '';
});

describe('TenantAppearance via DesignSystemProvider', () => {
  it('appearance.general.palette.primary injects --ds-color-primary on root', async () => {
    await act(async () => {
      render(
        <DesignSystemProvider
          tenantConfig={makeConfig({
            appearance: {
              general: { palette: { primary: '#FF5500' } },
            },
          })}
        >
          <div data-testid="child">hello</div>
        </DesignSystemProvider>
      );
    });

    const root = document.documentElement;
    // The appearance compiler should have produced --ds-color-primary
    // and ThemeProvider should have injected it as an inline style
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#FF5500');
  });

  it('appearance.general.palette.backgroundMode=dark sets data-theme=dark when tenant.theme is base', async () => {
    await act(async () => {
      render(
        <DesignSystemProvider
          tenantConfig={makeConfig({
            theme: 'base', // default, should NOT block backgroundMode
            appearance: {
              general: { palette: { backgroundMode: 'dark' } },
            },
          })}
        >
          <div>hello</div>
        </DesignSystemProvider>
      );
    });

    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('explicit tenant.theme=light wins over appearance.backgroundMode=dark', async () => {
    await act(async () => {
      render(
        <DesignSystemProvider
          tenantConfig={makeConfig({
            theme: 'light', // explicit — should win
            appearance: {
              general: { palette: { backgroundMode: 'dark' } },
            },
          })}
        >
          <div>hello</div>
        </DesignSystemProvider>
      );
    });

    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('appearance.general.shape.buttonStyle=pill injects --ds-radius-button', async () => {
    await act(async () => {
      render(
        <DesignSystemProvider
          tenantConfig={makeConfig({
            appearance: {
              general: { shape: { buttonStyle: 'pill' } },
            },
          })}
        >
          <div>hello</div>
        </DesignSystemProvider>
      );
    });

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ds-radius-button')).toBe('9999px');
  });

  it('appearance.general.navigation.sidebarTone=inverse injects sidebar vars', async () => {
    await act(async () => {
      render(
        <DesignSystemProvider
          tenantConfig={makeConfig({
            appearance: {
              general: { navigation: { sidebarTone: 'inverse' } },
            },
          })}
        >
          <div>hello</div>
        </DesignSystemProvider>
      );
    });

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ds-sidebar-bg')).toBe('var(--ds-color-neutral-900)');
  });

  it('appearance.advanced.tokenOverrides pass through to DOM', async () => {
    await act(async () => {
      render(
        <DesignSystemProvider
          tenantConfig={makeConfig({
            appearance: {
              advanced: {
                tokenOverrides: { '--ds-color-success': '#00FF00' },
              },
            },
          })}
        >
          <div>hello</div>
        </DesignSystemProvider>
      );
    });

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ds-color-success')).toBe('#00FF00');
  });

  it('compiled-artifact keeps tenant context complete without re-emitting visual variables', async () => {
    let view: ReturnType<typeof render> | undefined;

    await act(async () => {
      view = render(
        <DesignSystemProvider
          visualAuthority="compiled-artifact"
          tenantConfig={makeConfig({
            branding: {
              companyName: 'Artifact-owned Tenant',
              primaryColor: '#FF5500',
            },
            tokenOverrides: { glass: { blur: '18px' } },
            appearance: {
              general: { palette: { primary: '#00AA88' } },
              advanced: {
                tokenOverrides: { '--ds-runtime-appearance-probe': 'must-not-exist' },
              },
            },
          })}
        >
          <TenantConfigProbe />
        </DesignSystemProvider>
      );
    });

    const probe = view?.getByTestId('tenant-config-probe');
    expect(probe).toHaveAttribute('data-company', 'Artifact-owned Tenant');
    expect(probe).toHaveAttribute('data-primary', '#FF5500');

    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue('--ds-color-primary')).toBe('');
    expect(rootStyle.getPropertyValue('--ds-glass-blur')).toBe('');
    expect(rootStyle.getPropertyValue('--ds-runtime-appearance-probe')).toBe('');
    expect(document.getElementById('ds-personality-tokens')).toBeNull();
  });
});
