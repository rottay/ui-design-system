import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTenantBranding, type TenantBrandingSession } from '../index';

const TENANT_SLUG = 'themanagementmiami';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTenantBranding known-tenant baseline', () => {
  it('returns The Management Miami synchronously for a pre-auth render', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderHook(() =>
      useTenantBranding({
        tenantSlug: TENANT_SLUG,
        session: null,
        vertical: 'bithire',
      }),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.tenantConfig).toMatchObject({
      slug: TENANT_SLUG,
      name: 'The Management Miami',
      vertical: 'bithire',
      branding: { companyName: 'The Management Miami' },
      brandTheme: {
        id: TENANT_SLUG,
        palette: { primaryColor: '#0F766E' },
      },
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('applies the bounded DB overlay without replacing the known BrandTheme', async () => {
    const session: TenantBrandingSession = {
      user: {
        tenancy: {
          tenant: {
            slug: TENANT_SLUG,
            name: 'The Management Miami',
            plan: 'enterprise',
            features: ['white-label'],
            hasWhitelabeling: true,
            whitelabelBranding: {
              primaryColor: '#0F766E',
            },
          },
        },
      },
    };
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          branding: {
            companyName: 'The Management Miami DB',
            primaryColor: '#126B64',
            logo: '/tenant-assets/the-management-logo.svg',
          },
          theme: 'light',
          personality: {
            animation: { entrance: 'fade', entranceDuration: 180 },
          },
          tokenOverrides: {
            borderRadius: { md: '10px' },
          },
          appearance: {
            general: { density: 'comfortable' },
          },
          // This field is outside the public branding DTO and must not replace
          // the authored registry theme even if a hostile payload includes it.
          brandTheme: { id: 'untrusted-db-theme' },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderHook(() =>
      useTenantBranding({
        tenantSlug: TENANT_SLUG,
        session,
        vertical: 'bithire',
      }),
    );
    const authoredBrandTheme = result.current.tenantConfig?.brandTheme;

    expect(authoredBrandTheme?.id).toBe(TENANT_SLUG);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tenantConfig?.branding.companyName).toBe(
        'The Management Miami DB',
      );
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/public/tenant-branding/${TENANT_SLUG}`,
    );
    expect(result.current.tenantConfig?.brandTheme).toBe(authoredBrandTheme);
    expect(result.current.tenantConfig?.brandTheme?.id).toBe(TENANT_SLUG);
    expect(result.current.tenantConfig?.branding).toMatchObject({
      companyName: 'The Management Miami DB',
      primaryColor: '#126B64',
      logo: '/tenant-assets/the-management-logo.svg',
    });
    expect(result.current.tenantConfig?.personality).toMatchObject({
      animation: { entrance: 'fade', entranceDuration: 180 },
    });
    expect(result.current.tenantConfig?.tokenOverrides).toEqual({
      borderRadius: { md: '10px' },
    });
    expect(result.current.tenantConfig?.appearance).toEqual({
      general: { density: 'comfortable' },
    });
  });
});
