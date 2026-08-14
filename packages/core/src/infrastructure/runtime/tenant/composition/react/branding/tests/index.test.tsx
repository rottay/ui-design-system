import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  censusRuntimeVisualPayload,
  emitTenantThemeArtifactForSsr,
  resolveVisualAuthority,
} from '@/infrastructure/runtime/theming/foundation/visual-authority';
import { useTenantBranding, type TenantBrandingSession } from '../index';

const TENANT_SLUG = 'themanagementmiami';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useTenantBranding DB-owned tenant boundary', () => {
  it.each(['Bit-Hire', 'Acme', 'acme_works'])(
    'rejects an invalid request identity before branding I/O: %j',
    (tenantSlug) => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      expect(() => renderHook(() => useTenantBranding({
        tenantSlug,
        session: null,
        vertical: 'bithire',
      }))).toThrow();
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

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

  it.each([
    ['normalized slug', { slug: 'TENANT-A ', branding: { companyName: 'Tenant A' } }],
    ['reserved display identity', { slug: 'tenant-a', branding: { companyName: 'Bit Hire' } }],
    ['invalid engine', { slug: 'tenant-a', engine: 'unknown', branding: { companyName: 'Tenant A' } }],
  ])('keeps the identity-only fallback for an invalid %s response', async (_label, data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data }),
    }));

    const { result } = renderHook(() => useTenantBranding({
      tenantSlug: 'tenant-a',
      session: null,
      vertical: 'bithire',
    }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tenantConfig).toMatchObject({
      slug: 'tenant-a',
      name: 'tenant-a',
      branding: { companyName: 'tenant-a' },
    });
    expect(result.current.tenantConfig?.engine).toBeUndefined();
  });

  it('rejects a reserved session display identity before branding I/O', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const session: TenantBrandingSession = {
      user: {
        tenancy: {
          tenant: {
            slug: 'tenant-a',
            name: 'Bit Hire',
            hasWhitelabeling: true,
            whitelabelBranding: { primaryColor: '#2563EB' },
          },
        },
      },
    };

    expect(() => renderHook(() => useTenantBranding({
      tenantSlug: 'tenant-a',
      session,
      vertical: 'bithire',
    }))).toThrow(/reserved/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps an exact first-party config static even when session branding tries to overlay it', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const session: TenantBrandingSession = {
      user: {
        tenancy: {
          tenant: {
            slug: 'bithire',
            name: 'BitHire',
            hasWhitelabeling: true,
            whitelabelBranding: { primaryColor: '#FF0000' },
          },
        },
      },
    };

    const { result } = renderHook(() => useTenantBranding({
      tenantSlug: 'bithire',
      session,
      vertical: 'bithire',
    }));

    expect(result.current.loading).toBe(false);
    expect(result.current.tenantConfig?.slug).toBe('bithire');
    expect(result.current.tenantConfig?.branding.primaryColor).not.toBe('#FF0000');
    expect(fetchSpy).not.toHaveBeenCalled();
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

/**
 * THE SEAM: what the provider does with what this hook returns.
 *
 * Every case above audits the hook in isolation -- the request guard, the
 * response-slug check, the identity assertions, the session/fallback guard.
 * All four hold. None of them asks the question that decides whether the hook
 * still works: `DesignSystemProvider` does not consume `tenantConfig` directly.
 * It censuses the config's visual channels and resolves visual authority from
 * that census (`provider/index.tsx:644-651`), and any conflict renders
 * `<LoadingScreen />` -- an empty tree -- instead of the app
 * (`provider/index.tsx:711-713`).
 *
 * So these cases run the hook's REAL output through that exact pair of
 * functions. They are pinning current behavior, not asserting a desired
 * design: the hook's documented Step 2 ("fetches full config -- personality,
 * tokenOverrides") produces precisely the payload shape the authority barrier
 * refuses, and it refuses it on BOTH branches. The identity-only case is what
 * keeps that from being a vacuous "everything blocks" result.
 *
 * Whether the DB branding channel should be restored (by compiling it into an
 * artifact) or retired (by narrowing what this hook returns) is a visual-policy
 * decision with app-side blast radius. It is not settled here. What is settled
 * here is that the current answer is "it renders nothing", stated in an
 * executable form so it cannot be rediscovered by an app at runtime.
 */
describe('useTenantBranding at the visual-authority seam', () => {
  const VERTICAL = 'bithire';

  /** A real compiled artifact for this tenant -- the admitting path's input. */
  function customerArtifact(): TenantThemeArtifact {
    return compileTenantThemeConfig(
      hydrateTenantThemeConfig(
        {
          schemaVersion: 1,
          mode: 'simple',
          appearance: { palette: { primary: '#126B64' } },
        },
        {
          tenantId: 'tenant_themanagementmiami',
          slug: TENANT_SLUG,
          verticalKey: VERTICAL,
          rowVersion: 1,
        },
      ),
      { verticalEnvelope: getTenantThemeVerticalEnvelope(VERTICAL) },
    );
  }

  function stubFullBrandingResponse(): void {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            slug: TENANT_SLUG,
            branding: {
              companyName: 'The Management Miami DB',
              primaryColor: '#126B64',
            },
            personality: { animation: { entrance: 'fade' } },
            tokenOverrides: { borderRadius: { md: '10px' } },
          },
        }),
      }),
    );
  }

  function renderBranding() {
    return renderHook(() =>
      useTenantBranding({
        tenantSlug: TENANT_SLUG,
        session: null,
        vertical: VERTICAL,
      }),
    );
  }

  it('returns a renderable identity-only config, until the DB answers', async () => {
    stubFullBrandingResponse();
    const { result } = renderBranding();

    // Before the response: the identity fallback. `companyName` is an identity
    // field, not one of the censused visual channels, so the barrier passes it.
    const identityOnly = result.current.tenantConfig;
    expect(identityOnly?.branding).toEqual({ companyName: TENANT_SLUG });
    const beforeResponse = resolveVisualAuthority({
      slug: TENANT_SLUG,
      verticalKey: VERTICAL,
      payload: censusRuntimeVisualPayload(identityOnly),
    });
    expect(beforeResponse.conflict).toBeNull();
    expect(beforeResponse.origin).toBe('no-visual-payload');
    expect(beforeResponse.authority).toBe('provider');

    await waitFor(() => expect(result.current.loading).toBe(false));

    // After the response: the same seam, the same tenant, one new input.
    const withDbBranding = result.current.tenantConfig;
    expect(withDbBranding?.branding.primaryColor).toBe('#126B64');
    const afterResponse = resolveVisualAuthority({
      slug: TENANT_SLUG,
      verticalKey: VERTICAL,
      payload: censusRuntimeVisualPayload(withDbBranding),
    });
    expect(afterResponse.origin).toBe('uncompiled-visual-payload');
    expect(afterResponse.conflict).toMatch(
      /carries runtime visual payload but no verified mounted artifact/,
    );
    expect(afterResponse.artifact).toBeNull();
  });

  it('is not rescued by a genuinely admitted compiled artifact', async () => {
    stubFullBrandingResponse();
    const { result } = renderBranding();
    await waitFor(() => expect(result.current.loading).toBe(false));

    const artifact = customerArtifact();
    const { receipt } = emitTenantThemeArtifactForSsr(artifact, {
      slug: TENANT_SLUG,
      verticalKey: VERTICAL,
    });
    const declaration = {
      authority: 'compiled-artifact',
      artifact,
      ssrReceipt: receipt,
    } as const;

    // Load-bearing guard. Without it the rejection below would also be
    // satisfied by an artifact that never admits anything, and this case would
    // prove nothing about the hook's payload.
    const admitted = resolveVisualAuthority({
      declaration,
      slug: TENANT_SLUG,
      verticalKey: VERTICAL,
      payload: censusRuntimeVisualPayload(undefined),
      documentRoot: null,
    });
    expect(admitted.conflict).toBeNull();
    expect(admitted.origin).toBe('ssr-emission-receipt');
    expect(admitted.artifact?.slug).toBe(TENANT_SLUG);

    // Same admitted artifact, plus the config this hook returns.
    const mixed = resolveVisualAuthority({
      declaration,
      slug: TENANT_SLUG,
      verticalKey: VERTICAL,
      payload: censusRuntimeVisualPayload(result.current.tenantConfig),
      documentRoot: null,
    });
    expect(mixed.conflict).toMatch(
      /mixes a compiled artifact with raw visual branding, raw tokenOverrides, raw tenant personality/,
    );
    expect(mixed.artifact).toBeNull();
  });
});
