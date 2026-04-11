'use client';

/**
 * Shared 2-step tenant branding hook.
 *
 * Step 1 (instant): Builds a TenantConfig from session data for first paint.
 * Step 2 (async): Fetches full config (personality, tokenOverrides) from
 *   the public branding endpoint after mount.
 *
 * This eliminates ~200 lines of copypaste per app.
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
import type { TenantConfig } from '../../../../contracts';
import type { VerticalKey } from '../../../../runtime/verticals/types';

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

/**
 * Builds a quick TenantConfig from session data (9 fields, instant).
 * Returns undefined when the DS should use vertical defaults.
 */
function buildConfigFromSession(
  session: TenantBrandingSession | null,
  tenantSlug: string,
  vertical: VerticalKey,
): TenantConfig | undefined {
  const tenant = session?.user?.tenancy?.tenant;
  if (!tenant) return undefined;

  const isSuperAdmin = session?.user?.permissions?.isSuperAdmin ?? false;
  const branding = tenant.whitelabelBranding;

  // Super admin or no whitelabeling -> let DS resolve from vertical registry
  if (isSuperAdmin || !tenant.hasWhitelabeling || !branding) {
    return undefined;
  }

  return {
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
  return {
    slug: tenantSlug,
    name: (data.branding as Record<string, unknown> | undefined)?.companyName as string || tenantSlug,
    engine: (data.engine as TenantConfig['engine']) || undefined,
    theme: (data.theme as string) || 'base',
    plan: (session?.user?.tenancy?.tenant?.plan as TenantConfig['plan']) || 'starter',
    features: session?.user?.tenancy?.tenant?.features || [],
    vertical,
    branding: (data.branding as TenantConfig['branding']) || {},
    personality: (data.personality as TenantConfig['personality']) || undefined,
    tokenOverrides: (data.tokenOverrides as TenantConfig['tokenOverrides']) || undefined,
  };
}

export function useTenantBranding(
  options: UseTenantBrandingOptions,
): UseTenantBrandingReturn {
  const { tenantSlug, session, vertical, brandingEndpoint = '/api/public/tenant-branding' } = options;

  // Extract stable primitives for useMemo deps
  const isSuperAdmin = session?.user?.permissions?.isSuperAdmin ?? false;
  const hasWhitelabeling = session?.user?.tenancy?.tenant?.hasWhitelabeling ?? false;
  const tenantName = session?.user?.tenancy?.tenant?.name;
  const brandingPrimary = session?.user?.tenancy?.tenant?.whitelabelBranding?.primaryColor;

  // Step 1: Quick config from session (instant, for first paint)
  const sessionConfig = useMemo(
    () => buildConfigFromSession(session, tenantSlug, vertical),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuperAdmin, hasWhitelabeling, tenantName, brandingPrimary, tenantSlug, vertical],
  );

  // Step 2: Full config from DB (async, loads after mount)
  const [fullConfig, setFullConfig] = useState<TenantConfig | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const slug = session?.user?.tenancy?.tenant?.slug;

  // Shared refetch function for interval and visibility refresh
  const refetch = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`${brandingEndpoint}/${slug}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!json?.success || !json?.data) return;
      const newConfig = buildConfigFromResponse(json.data, tenantSlug, vertical, session);
      setFullConfig((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newConfig)) return prev;
        return newConfig;
      });
    } catch {
      /* Non-critical: keep current config */
    }
  }, [slug, brandingEndpoint, tenantSlug, vertical, session]);

  // Initial fetch (guarded by fetchedRef)
  useEffect(() => {
    if (isSuperAdmin || !hasWhitelabeling || fetchedRef.current) return;
    if (!slug) return;

    fetchedRef.current = true;
    setLoading(true);

    refetch().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, hasWhitelabeling, slug, refetch]);

  // Periodic refresh (every 5 minutes) + visibility-based refresh
  useEffect(() => {
    if (isSuperAdmin || !hasWhitelabeling || !slug) return;

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
  }, [isSuperAdmin, hasWhitelabeling, slug, refetch]);

  // Final config: full (80+ fields) > session (9 fields) > undefined (vertical defaults)
  const tenantConfig = fullConfig ?? sessionConfig;

  return { tenantConfig, loading };
}
