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
  /** Optional sync lookup for custom domains (e.g. recruit.acme.com -> "acme") */
  customDomainLookup?: (hostname: string) => string | undefined;
  /** Optional async lookup for custom domains (used by resolveRequestTenantAsync) */
  customDomainLookupAsync?: (hostname: string) => Promise<string | undefined>;
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

/**
 * Async tenant resolution from hostname.
 * Same as resolveRequestTenant but supports async custom domain lookup.
 *
 * @example
 * ```ts
 * const slug = await resolveRequestTenantAsync(hostname, {
 *   baseDomains: ['bithire.com'],
 *   defaultTenant: 'bithire',
 *   customDomainLookupAsync: edgeLookup.async,
 * });
 * ```
 */
export async function resolveRequestTenantAsync(
  hostname: string,
  options: TenantResolutionOptions,
): Promise<string> {
  const host = hostname.split(':')[0].toLowerCase();
  const reserved = options.reservedSubdomains ?? DEFAULT_RESERVED;

  // 1. Subdomain (sync, fast path)
  for (const base of options.baseDomains) {
    const baseLower = base.toLowerCase();
    if (host.endsWith(`.${baseLower}`)) {
      const subdomain = host.slice(0, -(baseLower.length + 1));
      if (subdomain && !subdomain.includes('.') && !reserved.includes(subdomain)) {
        return subdomain;
      }
    }
    if (host === baseLower) {
      return options.defaultTenant;
    }
  }

  // 2. Sync custom domain lookup (from cache)
  if (options.customDomainLookup) {
    const resolved = options.customDomainLookup(host);
    if (resolved) return resolved;
  }

  // 3. Async custom domain lookup (refreshes cache)
  if (options.customDomainLookupAsync) {
    const resolved = await options.customDomainLookupAsync(host);
    if (resolved) return resolved;
  }

  // 4. Default
  return options.defaultTenant;
}

// ─── Edge Config Domain Loader ───────────────────────────────────────────────

export interface EdgeConfigDomainLookupOptions {
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTtlMs?: number;
  /** Edge Config key name (default: "custom-domains") */
  edgeConfigKey?: string;
}

/**
 * Creates a cached custom domain lookup backed by Vercel Edge Config.
 * Returns both sync (from cache) and async (refreshes cache) lookup functions.
 *
 * Edge Config expected shape: { "recruit.acme.com": "acme", "events.corp.io": "corp" }
 *
 * @example
 * ```ts
 * const domainLookup = createEdgeConfigDomainLookup();
 * const slug = await resolveRequestTenantAsync(hostname, {
 *   baseDomains: ['bithire.com'],
 *   defaultTenant: 'bithire',
 *   customDomainLookup: domainLookup.sync,
 *   customDomainLookupAsync: domainLookup.async,
 * });
 * ```
 */
export function createEdgeConfigDomainLookup(opts?: EdgeConfigDomainLookupOptions) {
  const cacheTtl = opts?.cacheTtlMs ?? 5 * 60 * 1000;
  const configKey = opts?.edgeConfigKey ?? 'custom-domains';

  let cache: Map<string, string> | null = null;
  let cacheExpiry = 0;

  async function loadFromEdgeConfig(): Promise<Map<string, string>> {
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    if (!edgeConfigUrl) return new Map();

    try {
      const url = `${edgeConfigUrl.split('?')[0]}/item/${configKey}?${edgeConfigUrl.split('?')[1] || ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return new Map();
      const data = await res.json();
      return new Map(Object.entries(data || {}));
    } catch {
      return new Map();
    }
  }

  function sync(hostname: string): string | undefined {
    if (cache && Date.now() < cacheExpiry) {
      return cache.get(hostname);
    }
    return undefined;
  }

  async function async_(hostname: string): Promise<string | undefined> {
    if (!cache || Date.now() >= cacheExpiry) {
      cache = await loadFromEdgeConfig();
      cacheExpiry = Date.now() + cacheTtl;
    }
    return cache.get(hostname);
  }

  return { sync, async: async_ };
}
