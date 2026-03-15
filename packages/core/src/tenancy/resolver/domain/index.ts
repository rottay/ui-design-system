/**
 * Domain Resolver
 * Resolves tenant from custom domain via API lookup
 */

import { errorInDev, warnOnceInDev } from '../../../core/utils/runtime-logger';

export interface DomainLookupResult {
  slug: string;
  found: boolean;
}

let domainLookupEndpoint: string | null = null;

/**
 * Configure the domain lookup API endpoint
 */
export function configureDomainLookup(endpoint: string): void {
  domainLookupEndpoint = endpoint;
}

/**
 * Resolve tenant slug from custom domain
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

    if (!response.ok) return null;

    const data: DomainLookupResult = await response.json();

    return data.found ? data.slug : null;
  } catch (error) {
    errorInDev('Domain lookup failed:', error);
    return null;
  }
}
