/**
 * Shared tenant resolution from hostname.
 *
 * Used by app middleware to determine which tenant owns the current request
 * based on subdomain or custom domain lookup.
 *
 * @example
 * ```ts
 * // In middleware.ts
 * import { resolveRequestTenant } from '@rottay/design-system';
 * const hostname = req.headers.get('host') ?? 'localhost';
 * const tenantSlug = resolveRequestTenant(hostname, {
 *   baseDomains: ['bithire.com', 'bithire.dev'],
 *   defaultTenant: 'bithire',
 *   reservedSubdomains: ['www', 'api', 'app', 'admin'],
 * });
 * ```
 */

export interface TenantResolutionOptions {
  /** Base domains that support subdomain-based tenanting (e.g. ['bithire.com', 'bithire.dev']) */
  baseDomains: string[];
  /** Default tenant slug when no subdomain or custom domain matches */
  defaultTenant: string;
  /** Subdomains that are NOT tenant slugs (e.g. 'www', 'api', 'app') */
  reservedSubdomains?: string[];
  /** Optional async lookup for custom domains (e.g. recruit.acme.com -> "acme") */
  customDomainLookup?: (hostname: string) => string | undefined;
}

const DEFAULT_RESERVED = ['www', 'api', 'app', 'admin', 'mail', 'cdn', 'static'];

/**
 * Synchronous tenant resolution from hostname.
 * Resolution order:
 * 1. Subdomain of a configured base domain
 * 2. Custom domain lookup (if provided)
 * 3. Default tenant
 */
export function resolveRequestTenant(
  hostname: string,
  options: TenantResolutionOptions,
): string {
  // Strip port (localhost:3000 -> localhost)
  const host = hostname.split(':')[0].toLowerCase();
  const reserved = options.reservedSubdomains ?? DEFAULT_RESERVED;

  // 1. Check subdomain of any base domain
  for (const base of options.baseDomains) {
    const baseLower = base.toLowerCase();
    if (host.endsWith(`.${baseLower}`)) {
      const subdomain = host.slice(0, -(baseLower.length + 1));
      if (subdomain && !subdomain.includes('.') && !reserved.includes(subdomain)) {
        return subdomain;
      }
    }
    // Exact match of base domain (no subdomain) -> default tenant
    if (host === baseLower) {
      return options.defaultTenant;
    }
  }

  // 2. Custom domain lookup
  if (options.customDomainLookup) {
    const resolved = options.customDomainLookup(host);
    if (resolved) return resolved;
  }

  // 3. Default
  return options.defaultTenant;
}
