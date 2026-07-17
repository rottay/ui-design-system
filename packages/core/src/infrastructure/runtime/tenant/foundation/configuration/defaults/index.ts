/**
 * @fileoverview Default tenant configuration fallback.
 * @description Safety-net config used when apps render the DS without a real
 * tenant source. This is distinct from the first-party branded tenants in the
 * registry -- it exists only to ensure the DS always has a valid config.
 *
 * WHY this exists separately from the registry:
 * The registry holds first-party branded tenants (rottay, bithire, evnto) with
 * full personality tokens. This default has intentionally minimal styling so it
 * is obvious when a real tenant has not been resolved -- it signals a missing
 * or misconfigured tenant source rather than silently adopting a branded look.
 */

import type { TenantConfig } from '../../../../../../foundation/contracts';

/**
 * Baseline tenant configuration used as the ultimate fallback when no tenant
 * source is available. Intentionally uses generic branding (not Rottay-branded)
 * so that missing tenant resolution is visually apparent during development.
 *
 * - `features: ['*']` ensures no feature gates block rendering in fallback mode.
 * - `plan: 'starter'` is the lowest tier; callers can override via `getDefaultTenantConfig`.
 * - No `engine`: the fallback tenant holds no opinion, so the vertical (or
 *   `FALLBACK_ENGINE` in `runtime/engines/resolution.ts`) decides. A default
 *   tenant that claims an engine outranks the vertical that declares one.
 */
export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  slug: 'default',
  name: 'Default Tenant',
  theme: 'base',
  plan: 'starter',
  features: ['*'],  // All features enabled by default
  branding: {
    companyName: 'Rottay Design System',
    primaryColor: '#0066CC',
    accentColor: '#6366F1',
  },
};

/**
 * Returns a copy of the default tenant config with optional shallow overrides.
 *
 * Branding is merged one level deep so callers can override `primaryColor`
 * without losing `companyName`. Top-level fields are spread normally.
 *
 * @param overrides - Partial tenant config to merge on top of defaults.
 * @returns A complete TenantConfig with overrides applied.
 */
export function getDefaultTenantConfig(overrides?: Partial<TenantConfig>): TenantConfig {
  return {
    ...DEFAULT_TENANT_CONFIG,
    ...overrides,
    // Branding needs a dedicated nested merge because a top-level spread
    // would replace the entire branding object, losing defaults like companyName.
    branding: {
      ...DEFAULT_TENANT_CONFIG.branding,
      ...overrides?.branding,
    },
  };
}

/**
 * Creates a neutral, identity-preserving shell for a tenant whose published
 * config is temporarily unavailable. It intentionally carries no brand colors,
 * logo, features, or authored tenant theme, so it cannot impersonate another
 * tenant while the owning app decides whether to render or fail closed.
 */
export function getUnresolvedTenantConfig(slug: string): TenantConfig {
  const normalizedSlug = slug.trim().toLowerCase() || 'default';
  return {
    slug: normalizedSlug,
    name: normalizedSlug,
    theme: 'base',
    plan: 'starter',
    features: [],
    branding: { companyName: normalizedSlug },
  };
}
