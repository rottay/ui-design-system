/**
 * @fileoverview Subdomain-based tenant resolver for Rottay-style hostnames.
 * @description Extracts the tenant slug from the first subdomain segment of
 * known Rottay domains (rottay.com, rottay.io, rottay.dev). System subdomains
 * like `www`, `app`, `api`, `admin`, `staging`, `dev` are ignored.
 *
 * Example: `acme.app.rottay.com` -> `acme`
 */

// WHY a fixed allowlist: subdomain extraction must only run on domains owned by
// the Rottay deployment model. Extracting from arbitrary hostnames (e.g.,
// `acme.somecdn.com`) would produce false positives.
const ROTTAY_DOMAINS = ['rottay.com', 'rottay.io', 'rottay.dev'];

// System subdomains map to platform infrastructure, not customer tenants.
// For example, `app.rottay.com` is the platform SPA, not a tenant named "app".
const IGNORED_SUBDOMAINS = ['www', 'app', 'api', 'admin', 'staging', 'dev'];

/**
 * Extracts a tenant slug from the leading subdomain of a Rottay-owned hostname.
 *
 * Only operates on hostnames ending with a known Rottay domain. System
 * subdomains (`www`, `app`, `api`, etc.) are filtered out to prevent
 * infrastructure hostnames from being misinterpreted as tenant slugs.
 *
 * @param hostname - The full hostname (e.g. `acme.app.rottay.com`).
 * @returns The tenant slug (e.g. `acme`), or `null` if no tenant can be inferred.
 *
 * @example
 * ```ts
 * resolveFromSubdomain('acme.app.rottay.com');  // 'acme'
 * resolveFromSubdomain('app.rottay.com');        // null (system subdomain)
 * resolveFromSubdomain('custom.example.com');    // null (non-Rottay domain)
 * ```
 */
export function resolveFromSubdomain(hostname: string): string | null {
  // We only infer subdomains for domains that belong to the Rottay deployment model.
  const isRottayDomain = ROTTAY_DOMAINS.some(domain => hostname.endsWith(domain));
  if (!isRottayDomain) return null;

  // Split hostname into parts
  const parts = hostname.split('.');

  // Need at least 3 parts: subdomain.app.rottay.com
  if (parts.length < 3) return null;

  // Get the first subdomain
  const subdomain = parts[0];

  // System subdomains route to platform infrastructure, not customer tenants.
  if (IGNORED_SUBDOMAINS.includes(subdomain)) return null;

  return subdomain;
}
