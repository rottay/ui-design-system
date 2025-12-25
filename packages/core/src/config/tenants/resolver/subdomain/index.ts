/**
 * Subdomain Resolver
 * Resolves tenant from subdomain: acme.app.rottay.com → "acme"
 */

const ROTTAY_DOMAINS = ['rottay.com', 'rottay.io', 'rottay.dev'];
const IGNORED_SUBDOMAINS = ['www', 'app', 'api', 'admin', 'staging', 'dev'];

export function resolveFromSubdomain(hostname: string): string | null {
  // Check if this is a Rottay domain
  const isRottayDomain = ROTTAY_DOMAINS.some(domain => hostname.endsWith(domain));
  if (!isRottayDomain) return null;

  // Split hostname into parts
  const parts = hostname.split('.');

  // Need at least 3 parts: subdomain.app.rottay.com
  if (parts.length < 3) return null;

  // Get the first subdomain
  const subdomain = parts[0];

  // Skip system subdomains
  if (IGNORED_SUBDOMAINS.includes(subdomain)) return null;

  return subdomain;
}
