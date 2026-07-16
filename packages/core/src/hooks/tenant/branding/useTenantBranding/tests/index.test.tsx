import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTenantBranding, type TenantBrandingSession } from '../index';

const TENANT_SLUG = 'themanagementmiami';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useTenantBranding DB-owned tenant boundary', () => {
  it('preserves tenant identity while loading pre-auth branding from DB', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          slug: TENANT_SLUG,
          branding: { companyName: 'The Management Miami DB' },
          theme: 'light',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderHook(() =>
      useTenantBranding({
        tenantSlug: TENANT_SLUG,
        session: null,
        vertical: 'bithire',
      }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.tenantConfig).toMatchObject({
      slug: TENANT_SLUG,
      name: TENANT_SLUG,
      vertical: 'bithire',
      branding: { companyName: TENANT_SLUG },
    });
    expect(result.current.tenantConfig?.brandTheme).toBeUndefined();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tenantConfig?.branding.companyName).toBe(
        'The Management Miami DB',
      );
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/public/tenant-branding/${TENANT_SLUG}`,
    );
  });

  it('lets a superadmin load the bounded DB config without a static tenant theme', async () => {
    const session: TenantBrandingSession = {
      user: {
        permissions: { isSuperAdmin: true },
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
          slug: TENANT_SLUG,
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
    expect(result.current.tenantConfig?.brandTheme).toBeUndefined();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tenantConfig?.branding.companyName).toBe(
        'The Management Miami DB',
      );
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/public/tenant-branding/${TENANT_SLUG}`,
    );
    expect(result.current.tenantConfig?.brandTheme).toBeUndefined();
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

  it('uses the resolved tenant slug even when a stale session names another tenant', async () => {
    const session: TenantBrandingSession = {
      user: {
        tenancy: {
          tenant: {
            slug: 'stale-session-tenant',
            name: 'Stale Session Tenant',
            hasWhitelabeling: true,
            whitelabelBranding: { primaryColor: '#FF0000' },
          },
        },
      },
    };
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          slug: 'resolved-host-tenant',
          branding: { companyName: 'Resolved Host Tenant' },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderHook(() =>
      useTenantBranding({
        tenantSlug: 'resolved-host-tenant',
        session,
        vertical: 'bithire',
      }),
    );

    expect(result.current.tenantConfig).toMatchObject({
      slug: 'resolved-host-tenant',
      name: 'resolved-host-tenant',
      branding: { companyName: 'resolved-host-tenant' },
    });
    await waitFor(() => {
      expect(result.current.tenantConfig?.branding.companyName).toBe(
        'Resolved Host Tenant',
      );
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/public/tenant-branding/resolved-host-tenant',
    );
  });

  it('drops a memoized session overlay when session identity changes', () => {
    const sharedTenantFields = {
      name: 'Same Display Name',
      hasWhitelabeling: true,
      whitelabelBranding: { primaryColor: '#0F766E' },
    };
    const sessionA: TenantBrandingSession = {
      user: { tenancy: { tenant: { slug: 'tenant-a', ...sharedTenantFields } } },
    };
    const sessionB: TenantBrandingSession = {
      user: { tenancy: { tenant: { slug: 'tenant-b', ...sharedTenantFields } } },
    };
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));

    const { result, rerender } = renderHook(
      ({ session }) => useTenantBranding({
        tenantSlug: 'tenant-a',
        session,
        vertical: 'bithire',
      }),
      { initialProps: { session: sessionA } },
    );

    expect(result.current.tenantConfig).toMatchObject({
      slug: 'tenant-a',
      name: 'Same Display Name',
      branding: {
        companyName: 'Same Display Name',
        primaryColor: '#0F766E',
      },
    });

    rerender({ session: sessionB });
    expect(result.current.tenantConfig).toMatchObject({
      slug: 'tenant-a',
      name: 'tenant-a',
      branding: { companyName: 'tenant-a' },
    });
    expect(result.current.tenantConfig?.branding.primaryColor).toBeUndefined();
  });

  it('rejects a branding response belonging to another tenant', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          slug: 'tenant-b',
          branding: { companyName: 'Tenant B DB' },
        },
      }),
    }));

    const { result } = renderHook(() => useTenantBranding({
      tenantSlug: 'tenant-a',
      session: null,
      vertical: 'bithire',
    }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tenantConfig).toMatchObject({
      slug: 'tenant-a',
      branding: { companyName: 'tenant-a' },
    });
  });

  it('discards an older same-tenant refresh that resolves last', async () => {
    type BrandingResponse = {
      ok: boolean;
      json: () => Promise<unknown>;
    };
    const resolvers: Array<(value: BrandingResponse) => void> = [];
    vi.stubGlobal('fetch', vi.fn(() => new Promise<BrandingResponse>((resolve) => {
      resolvers.push(resolve);
    })));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    const { result } = renderHook(() => useTenantBranding({
      tenantSlug: 'tenant-a',
      session: null,
      vertical: 'bithire',
    }));

    await waitFor(() => expect(resolvers).toHaveLength(1));
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await waitFor(() => expect(resolvers).toHaveLength(2));

    await act(async () => {
      resolvers[1]?.({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            slug: 'tenant-a',
            branding: { companyName: 'Newest Tenant A DB' },
          },
        }),
      });
    });
    await waitFor(() => {
      expect(result.current.tenantConfig?.branding.companyName).toBe(
        'Newest Tenant A DB',
      );
    });

    await act(async () => {
      resolvers[0]?.({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            slug: 'tenant-a',
            branding: { companyName: 'Older Tenant A DB' },
          },
        }),
      });
    });
    expect(result.current.tenantConfig?.branding.companyName).toBe(
      'Newest Tenant A DB',
    );
  });

  it('discards a late response when the mounted consumer switches tenants', async () => {
    let resolveFirst!: (value: {
      ok: boolean;
      json: () => Promise<unknown>;
    }) => void;
    const firstResponse = new Promise<{
      ok: boolean;
      json: () => Promise<unknown>;
    }>((resolve) => {
      resolveFirst = resolve;
    });
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/tenant-a')) return firstResponse;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            slug: 'tenant-b',
            branding: { companyName: 'Tenant B DB' },
          },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { result, rerender } = renderHook(
      ({ tenantSlug }) => useTenantBranding({
        tenantSlug,
        session: null,
        vertical: 'bithire',
      }),
      { initialProps: { tenantSlug: 'tenant-a' } },
    );

    expect(result.current.tenantConfig?.slug).toBe('tenant-a');
    rerender({ tenantSlug: 'tenant-b' });
    expect(result.current.loading).toBe(true);
    expect(result.current.tenantConfig).toMatchObject({
      slug: 'tenant-b',
      branding: { companyName: 'tenant-b' },
    });

    await waitFor(() => {
      expect(result.current.tenantConfig?.branding.companyName).toBe('Tenant B DB');
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      resolveFirst({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            slug: 'tenant-a',
            branding: { companyName: 'Late Tenant A DB' },
          },
        }),
      });
      await firstResponse;
    });

    expect(result.current.tenantConfig).toMatchObject({
      slug: 'tenant-b',
      branding: { companyName: 'Tenant B DB' },
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/public/tenant-branding/tenant-a');
    expect(fetchSpy).toHaveBeenCalledWith('/api/public/tenant-branding/tenant-b');
  });
});
