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

import { useState, useEffect, useRef, useMemo } from 'react';
import type { TenantConfig } from '../../../contracts';
import type { VerticalKey } from '../../../runtime/verticals/types';

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

  useEffect(() => {
    if (isSuperAdmin || !hasWhitelabeling || fetchedRef.current) return;

    const slug = session?.user?.tenancy?.tenant?.slug;
    if (!slug) return;

    fetchedRef.current = true;
    setLoading(true);

    fetch(`${brandingEndpoint}/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.success || !json?.data) return;
        const d = json.data;
        setFullConfig({
          slug: tenantSlug,
          name: d.branding?.companyName || tenantSlug,
          engine: (d.engine as TenantConfig['engine']) || undefined,
          theme: d.theme || 'base',
          plan: (session?.user?.tenancy?.tenant?.plan as TenantConfig['plan']) || 'starter',
          features: session?.user?.tenancy?.tenant?.features || [],
          vertical,
          branding: d.branding || {},
          personality: d.personality || undefined,
          tokenOverrides: d.tokenOverrides || undefined,
        });
      })
      .catch(() => {
        /* Non-critical: fall back to session config */
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, hasWhitelabeling, brandingEndpoint]);

  // Final config: full (80+ fields) > session (9 fields) > undefined (vertical defaults)
  const tenantConfig = fullConfig ?? sessionConfig;

  return { tenantConfig, loading };
}
