'use client';

/**
 * Shared registry + two-step tenant branding hook.
 *
 * Step 0 (synchronous): Resolves a vertical baseline or a tenant-identity
 *   fallback that can never collapse to another tenant.
 * Step 1 (instant): Overlays session branding.
 * Step 2 (async): Fetches full config (personality, tokenOverrides) from
 *   the public branding endpoint after mount.
 *
 * This eliminates ~200 lines of copypaste per app.
 *
 * WHAT STEPS 1 AND 2 NO LONGER DO: paint.
 *
 * `DesignSystemProvider` does not consume this config directly. It censuses
 * the config's visual channels -- `branding` colors/fonts, `tokenOverrides`,
 * `personality`, `brandTheme`, `appearance` -- and resolves visual authority
 * from that census; a conflict renders an empty tree rather than the app.
 * Raw visual payload has no compiled provenance, so the barrier refuses it
 * BOTH with no artifact declared ("uncompiled-visual-payload") and alongside
 * a genuinely admitted artifact ("mixes a compiled artifact with ..."). The
 * session overlay in step 1 carries `primaryColor`/`secondaryColor`/
 * `accentColor`, so it is refused on the same terms as step 2.
 *
 * Step 0's identity fallback is therefore the only output of this hook that
 * currently renders: `companyName`/`logo` are identity, not censused visual
 * channels. Both halves are pinned in `tests/index.test.tsx` under
 * "useTenantBranding at the visual-authority seam" -- the passing case
 * included, so the failing ones cannot be read as "the barrier blocks
 * everything".
 *
 * This is the compatibility path. The governing model is that customer
 * styling is compiled on the server and hydrated as an artifact, and that
 * browser components do not query the DB for visuals. Restoring the DB
 * branding channel means compiling it into an artifact, not widening the
 * barrier; retiring it means narrowing what this hook returns. Either is a
 * visual-policy decision with app-side blast radius and is not made here.
 *
 * @example
 * ```tsx
 * const { tenantConfig, loading } = useTenantBranding({
 *   tenantSlug: 'acme',
 *   session: typedSession,
 *   vertical: 'evnto',
 * });
 *
 * <DesignSystemProvider tenantConfig={tenantConfig} vertical="evnto" ... />
 * ```
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TenantConfig } from '@/foundation/contracts';
import type { VerticalKey } from '@/foundation/contracts/kernel/verticals';
import { assertTenantIdentityAllowed } from '@/foundation/tokens/ts/presentation/brand-themes';
import { getKnownTenantConfig } from '../../../foundation/configuration/registry';
import {
  assertLowerKebabTenantSlug,
  isValidTenantConfig,
} from '../../../foundation/validation';

/** Minimal session shape needed by the hook. Apps cast their session to this. */
export interface TenantBrandingSession {
  user?: {
    tenancy?: {
      tenant?: {
        slug?: string;
        name?: string;
        plan?: string;
        features?: string[];
        hasWhitelabeling?: boolean;
        whitelabelBranding?: {
          primaryColor?: string | null;
          secondaryColor?: string | null;
          accentColor?: string | null;
          logo?: string | null;
          engine?: string;
        };
      };
    };
    permissions?: {
      isSuperAdmin?: boolean;
    };
    locale?: string;
  };
}

export interface UseTenantBrandingOptions {
  /** Resolved tenant slug (from middleware/header/session) */
  tenantSlug: string;
  /** Typed session with tenant + permissions data */
  session: TenantBrandingSession | null;
  /** Vertical key for fallback defaults */
  vertical: VerticalKey;
  /** Base URL for the branding endpoint (default: '/api/public/tenant-branding') */
  brandingEndpoint?: string;
}

export interface UseTenantBrandingReturn {
  /** Resolved tenant config (full or session-based) */
  tenantConfig: TenantConfig | undefined;
  /** Whether the full config is still loading */
  loading: boolean;
}

function matchingSessionTenant(
  session: TenantBrandingSession | null,
  tenantSlug: string,
) {
  const tenant = session?.user?.tenancy?.tenant;
  if (!tenant?.slug) return undefined;
  return tenant.slug === tenantSlug
    ? tenant
    : undefined;
}

function assertCustomerTenantConfig(config: unknown): asserts config is TenantConfig {
  const candidate = config as Partial<TenantConfig> | null;
  assertTenantIdentityAllowed({
    slug: candidate?.slug,
    name: candidate?.name,
    companyName: candidate?.branding?.companyName,
    verticalKey: candidate?.vertical,
  });
  assertLowerKebabTenantSlug(candidate?.slug);
  if (!isValidTenantConfig(config)) {
    throw new TypeError('[design-system] Tenant branding produced an invalid tenant config.');
  }
}

/**
 * Builds a quick TenantConfig from session data (9 fields, instant).
 * Returns undefined when the DS should use vertical defaults.
 */
function buildConfigFromSession(
  session: TenantBrandingSession | null,
  tenantSlug: string,
  vertical: VerticalKey,
): TenantConfig | undefined {
  const tenant = matchingSessionTenant(session, tenantSlug);
  if (!tenant) return undefined;

  const isSuperAdmin = session?.user?.permissions?.isSuperAdmin ?? false;
  const branding = tenant.whitelabelBranding;

  // Super admin or no whitelabeling -> let DS resolve from vertical registry
  if (isSuperAdmin || !tenant.hasWhitelabeling || !branding) {
    return undefined;
  }

  const config: TenantConfig = {
    slug: tenantSlug,
    name: tenant.name || tenantSlug,
    engine: (branding.engine as TenantConfig['engine']) || undefined,
    theme: 'base',
    plan: (tenant.plan as TenantConfig['plan']) || 'starter',
    features: tenant.features || [],
    vertical,
    branding: {
      companyName: tenant.name || tenantSlug,
      primaryColor: branding.primaryColor || undefined,
      secondaryColor: branding.secondaryColor || undefined,
      accentColor: branding.accentColor || undefined,
      logo: branding.logo || undefined,
    },
  };
  assertCustomerTenantConfig(config);
  return config;
}

/**
 * Preserve an unknown/customer tenant's identity while its DB artifact loads.
 * Supplying this config keeps DesignSystemProvider on its synchronous path, so
 * a failed or delayed request can never enter the generic Rottay fallback.
 */
function buildTenantIdentityFallback(
  session: TenantBrandingSession | null,
  tenantSlug: string,
  vertical: VerticalKey,
): TenantConfig {
  const tenant = matchingSessionTenant(session, tenantSlug);
  const config: TenantConfig = {
    slug: tenantSlug,
    name: tenant?.name || tenantSlug,
    theme: 'base',
    plan: (tenant?.plan as TenantConfig['plan']) || 'starter',
    features: tenant?.features || [],
    vertical,
    branding: {
      companyName: tenant?.name || tenantSlug,
    },
  };
  assertCustomerTenantConfig(config);
  return config;
}

/**
 * Builds a full TenantConfig from the branding API response payload.
 * Shared by the initial fetch and periodic/visibility-based refreshes.
 */
function buildConfigFromResponse(
  data: Record<string, unknown>,
  tenantSlug: string,
  vertical: VerticalKey,
  session: TenantBrandingSession | null,
): TenantConfig {
  const tenant = matchingSessionTenant(session, tenantSlug);
  const config: TenantConfig = {
    slug: tenantSlug,
    name: (data.branding as Record<string, unknown> | undefined)?.companyName as string || tenantSlug,
    engine: (data.engine as TenantConfig['engine']) || undefined,
    theme: (data.theme as string) || 'base',
    plan: (tenant?.plan as TenantConfig['plan']) || 'starter',
    features: tenant?.features || [],
    vertical,
    branding: (data.branding as TenantConfig['branding']) || {},
    personality: (data.personality as TenantConfig['personality']) || undefined,
    tokenOverrides: (data.tokenOverrides as TenantConfig['tokenOverrides']) || undefined,
    appearance: (data.appearance as TenantConfig['appearance']) || undefined,
  };
  assertCustomerTenantConfig(config);
  return config;
}

/**
 * Layer a bounded session/API config over an authored vertical baseline.
 *
 * Registry entries are file-owned vertical baselines only. Customer tenants
 * never enter the registry; their API payload is the visual authority. Session
 * and public-branding payloads remain unable to replace a baseline BrandTheme.
 * Their allowed branding/config fields still win through the normal
 * TenantConfig merge path.
 */
function overlayKnownTenantConfig(
  knownConfig: TenantConfig | undefined,
  overrideConfig: TenantConfig | undefined,
): TenantConfig | undefined {
  if (!knownConfig) return overrideConfig;
  if (!overrideConfig) return knownConfig;

  return {
    ...knownConfig,
    ...overrideConfig,
    branding: {
      ...knownConfig.branding,
      ...overrideConfig.branding,
    },
    brandTheme: knownConfig.brandTheme ?? overrideConfig.brandTheme,
  };
}

export function useTenantBranding(
  options: UseTenantBrandingOptions,
): UseTenantBrandingReturn {
  const { tenantSlug, session, vertical, brandingEndpoint = '/api/public/tenant-branding' } = options;
  const knownTenantConfig = getKnownTenantConfig(tenantSlug);
  if (!knownTenantConfig) {
    assertTenantIdentityAllowed({ slug: tenantSlug });
    assertLowerKebabTenantSlug(tenantSlug);
  }

  // Step 0: Known tenants are available during SSR and the first client render.
  // This avoids handing an undefined config to DesignSystemProvider while its
  // async storage path waits for an effect.
  // Step 1: Quick session overlay (instant, for first paint). The known
  // config is authoritative and never receives a DB/session overlay.
  const sessionConfig = useMemo(
    () => knownTenantConfig ?? buildConfigFromSession(session, tenantSlug, vertical),
    [session, tenantSlug, vertical, knownTenantConfig],
  );

  // Step 2: Full config from DB (async, loads after mount)
  const shouldFetchCustomerConfig = !knownTenantConfig;
  // The request identity comes from the host/middleware-resolved slug. Session
  // data is only an optional matching overlay and can never redirect a fetch.
  const slug = tenantSlug;
  const requestKey = shouldFetchCustomerConfig
    ? JSON.stringify([brandingEndpoint, slug, vertical])
    : null;
  const activeRequestKeyRef = useRef(requestKey);
  activeRequestKeyRef.current = requestKey;
  const requestSequenceRef = useRef(0);
  const fetchedKeyRef = useRef<string | null>(null);
  const [requestState, setRequestState] = useState<{
    key: string | null;
    config: TenantConfig | undefined;
    loading: boolean;
  }>(() => ({
    key: requestKey,
    config: undefined,
    loading: requestKey !== null,
  }));

  const fullConfig = requestKey !== null && requestState.key === requestKey
    ? requestState.config
    : undefined;
  const loading = requestKey !== null && (
    requestState.key !== requestKey || requestState.loading
  );

  const safeSessionConfig = useMemo(
    () => sessionConfig ?? (
      shouldFetchCustomerConfig
        ? buildTenantIdentityFallback(session, tenantSlug, vertical)
        : undefined
    ),
    [sessionConfig, shouldFetchCustomerConfig, session, tenantSlug, vertical],
  );

  // Shared refetch function for interval and visibility refresh
  const refetch = useCallback(async () => {
    if (!slug || !requestKey) return;
    const requestSequence = ++requestSequenceRef.current;
    let newConfig: TenantConfig | undefined;
    try {
      const res = await fetch(`${brandingEndpoint}/${slug}`);
      if (res.ok) {
        const json = await res.json();
        const responseSlug = typeof json?.data?.slug === 'string'
          ? json.data.slug
          : null;
        if (json?.success && json?.data && responseSlug === slug) {
          newConfig = overlayKnownTenantConfig(
            knownTenantConfig,
            buildConfigFromResponse(json.data, tenantSlug, vertical, session),
          );
        }
      }
    } catch {
      /* Non-critical: keep current config */
    }

    // A slow response for tenant A must never win after the mounted consumer
    // has switched to tenant B.
    if (
      activeRequestKeyRef.current !== requestKey
      || requestSequenceRef.current !== requestSequence
    ) return;
    setRequestState((previous) => {
      const previousConfig = previous.key === requestKey
        ? previous.config
        : undefined;
      const nextConfig = newConfig ?? previousConfig;
      if (
        previous.key === requestKey
        && !previous.loading
        && JSON.stringify(previousConfig) === JSON.stringify(nextConfig)
      ) {
        return previous;
      }
      return { key: requestKey, config: nextConfig, loading: false };
    });
  }, [slug, requestKey, brandingEndpoint, tenantSlug, vertical, session, knownTenantConfig]);

  // Initial fetch (guarded by fetchedRef)
  useEffect(() => {
    if (!requestKey) {
      fetchedKeyRef.current = null;
      return;
    }
    if (fetchedKeyRef.current === requestKey) return;

    fetchedKeyRef.current = requestKey;
    setRequestState({ key: requestKey, config: undefined, loading: true });
    void refetch();
  }, [requestKey, refetch]);

  // Periodic refresh (every 5 minutes) + visibility-based refresh
  useEffect(() => {
    if (!requestKey || !slug) return;

    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const interval = setInterval(refetch, REFRESH_INTERVAL);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [requestKey, slug, refetch]);

  // Final config: DB artifact > session/identity-safe config > vertical baseline.
  // An unknown customer never receives undefined, which would let the provider
  // enter its generic cross-tenant fallback chain.
  const tenantConfig = fullConfig ?? safeSessionConfig;

  return { tenantConfig, loading };
}
