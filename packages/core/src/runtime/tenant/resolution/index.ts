/**
 * @fileoverview Central tenant slug resolver.
 * @description Determines "which tenant am I?" before the storage facade resolves
 * "what is this tenant's config?". Resolution order is environment-sensitive:
 * 1. Server: `x-tenant-id` header (most deterministic)
 * 2. Browser: subdomain extraction from Rottay-style hostnames
 * 3. Browser: custom domain lookup via application API
 * 4. Fallback slug (default: 'default')
 */

import { resolveFromSubdomain } from './subdomain';
import { resolveFromDomain } from './domain';
import { resolveFromHeader } from './header';

export { resolveFromSubdomain } from './subdomain';
export { resolveFromDomain, configureDomainLookup } from './domain';
export { resolveFromHeader, setServerHeaders, clearServerHeaders } from './header';

/**
 * Options to customize the tenant resolution strategy.
 *
 * WHY skip flags exist: some hosting environments do not use subdomains
 * (e.g., single-domain white-label deploys) or do not have a domain lookup
 * API wired up yet. Skip flags let the caller narrow the resolution chain
 * without forking the resolver.
 */
export interface ResolverOptions {
  /** Skip subdomain resolution (useful when hosting on a single domain). */
  skipSubdomain?: boolean;
  /** Skip custom domain lookup (useful when no domain-to-tenant API is configured). */
  skipDomain?: boolean;
  /** Skip header resolution (useful in pure client-side apps with no SSR). */
  skipHeader?: boolean;
  /** Default tenant slug if all resolution strategies fail. Defaults to `'default'`. */
  fallback?: string;
}

/**
 * Resolves the active tenant slug from the current execution context.
 *
 * Resolution order is environment-sensitive:
 * - **Server** (no `window`): header first, then fallback.
 * - **Browser**: subdomain extraction, then custom domain lookup, then fallback.
 *
 * WHY async: the custom domain lookup (step 3) may hit an application API.
 * Steps 1-2 are synchronous but the overall function is async to accommodate
 * the full chain without forcing callers to handle mixed sync/async returns.
 *
 * @param options - Controls which resolution strategies to use and the fallback slug.
 * @returns The resolved tenant slug, guaranteed to be a non-empty string.
 */
export async function resolveTenant(options: ResolverOptions = {}): Promise<string> {
  const { skipSubdomain, skipDomain, skipHeader, fallback = 'default' } = options;

  // 1. Server-side: trust explicit request headers before inferring from hostname.
  if (!skipHeader && typeof window === 'undefined') {
    const fromHeader = resolveFromHeader();
    if (fromHeader) return fromHeader;
  }

  // Get hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // 2. Subdomain handles first-party multi-tenant deployments like acme.app.rottay.com.
  if (!skipSubdomain && hostname) {
    const fromSubdomain = resolveFromSubdomain(hostname);
    if (fromSubdomain) return fromSubdomain;
  }

  // 3. Custom domains need an application-specific lookup because the hostname
  // alone is not enough to map back to a tenant slug.
  if (!skipDomain && hostname) {
    const fromDomain = await resolveFromDomain(hostname);
    if (fromDomain) return fromDomain;
  }

  // 4. Never leave the caller without a slug.
  return fallback;
}
