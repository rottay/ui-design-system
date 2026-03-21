/**
 * @fileoverview Custom domain tenant resolver via application-owned API.
 * @description Resolves tenant slugs from custom (non-Rottay) hostnames by
 * querying a platform-configured lookup endpoint. The DS does not hardcode
 * domain-to-tenant mappings; the platform owns that relationship.
 *
 * Call `configureDomainLookup(endpoint)` before using `resolveFromDomain()`.
 */

import { errorInDev, warnOnceInDev } from '../../../../_internal/utils/runtime-logger';

export interface DomainLookupResult {
  slug: string;
  found: boolean;
}

// Module-level endpoint avoids passing the URL through the entire resolution
// chain. Apps call configureDomainLookup() once at bootstrap rather than
// threading the endpoint through every component that might trigger resolution.
let domainLookupEndpoint: string | null = null;

/**
 * Configures the endpoint used to map custom domains back to tenant slugs.
 */
export function configureDomainLookup(endpoint: string): void {
  domainLookupEndpoint = endpoint;
}

/**
 * Resolves a tenant slug from a custom hostname.
 *
 * Returns `null` when lookup is unavailable or no mapping exists so callers can
 * continue down the resolver chain.
 */
export async function resolveFromDomain(hostname: string): Promise<string | null> {
  if (!domainLookupEndpoint) {
    warnOnceInDev(
      'tenant-domain-resolver:not-configured',
      'Domain lookup endpoint not configured'
    );
    return null;
  }

  try {
    const response = await fetch(`${domainLookupEndpoint}?domain=${encodeURIComponent(hostname)}`);

    // Non-200 responses are treated as "no mapping found" rather than errors.
    // The platform API may legitimately return 404 for unmapped custom domains.
    if (!response.ok) return null;

    const data: DomainLookupResult = await response.json();

    return data.found ? data.slug : null;
  } catch (error) {
    // Network failures are swallowed so the resolver chain can continue to the
    // fallback slug. The tenant will still render -- just with default branding.
    errorInDev('Domain lookup failed:', error);
    return null;
  }
}
