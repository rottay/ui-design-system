/**
 * Tenant Resolver
 * Main resolver that tries multiple strategies
 */

import { resolveFromSubdomain } from './subdomain';
import { resolveFromDomain } from './domain';
import { resolveFromHeader } from './header';

export { resolveFromSubdomain } from './subdomain';
export { resolveFromDomain, configureDomainLookup } from './domain';
export { resolveFromHeader, setServerHeaders, clearServerHeaders } from './header';

export interface ResolverOptions {
  /** Skip subdomain resolution */
  skipSubdomain?: boolean;
  /** Skip domain lookup */
  skipDomain?: boolean;
  /** Skip header resolution */
  skipHeader?: boolean;
  /** Default tenant slug if all resolution fails */
  fallback?: string;
}

/**
 * Resolve tenant slug from current context
 * Tries: header → subdomain → domain → fallback
 */
export async function resolveTenant(options: ResolverOptions = {}): Promise<string> {
  const { skipSubdomain, skipDomain, skipHeader, fallback = 'default' } = options;

  // 1. Server-side: check headers first
  if (!skipHeader && typeof window === 'undefined') {
    const fromHeader = resolveFromHeader();
    if (fromHeader) return fromHeader;
  }

  // Get hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // 2. Try subdomain: acme.app.rottay.com
  if (!skipSubdomain && hostname) {
    const fromSubdomain = resolveFromSubdomain(hostname);
    if (fromSubdomain) return fromSubdomain;
  }

  // 3. Try custom domain lookup
  if (!skipDomain && hostname) {
    const fromDomain = await resolveFromDomain(hostname);
    if (fromDomain) return fromDomain;
  }

  // 4. Fallback to default
  return fallback;
}
