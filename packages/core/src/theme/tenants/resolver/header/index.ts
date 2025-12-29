/**
 * Header Resolver
 * Resolves tenant from X-Tenant-ID header (server-side)
 */

const TENANT_HEADER = 'x-tenant-id';

// Server-side headers storage
let serverHeaders: Headers | Record<string, string> | null = null;

/**
 * Set server headers for tenant resolution
 * Call this in your server middleware/handler
 */
export function setServerHeaders(headers: Headers | Record<string, string>): void {
  serverHeaders = headers;
}

/**
 * Clear server headers (call after request is complete)
 */
export function clearServerHeaders(): void {
  serverHeaders = null;
}

/**
 * Resolve tenant from request headers
 */
export function resolveFromHeader(): string | null {
  if (!serverHeaders) return null;

  if (serverHeaders instanceof Headers) {
    return serverHeaders.get(TENANT_HEADER);
  }

  return serverHeaders[TENANT_HEADER] || serverHeaders[TENANT_HEADER.toUpperCase()] || null;
}
