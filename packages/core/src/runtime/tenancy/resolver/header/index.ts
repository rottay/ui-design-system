/**
 * @fileoverview Server-side tenant resolver via `x-tenant-id` request header.
 * @description Most deterministic resolution strategy. Server code (middleware,
 * BFF, gateway) calls `setServerHeaders(headers)` before DS resolution runs,
 * and `clearServerHeaders()` after the request completes to prevent leaks.
 */

const TENANT_HEADER = 'x-tenant-id';

// Module-level variable holding request headers. This is request-scoped by
// convention: server code calls setServerHeaders() at the start of the request
// lifecycle and clearServerHeaders() at the end. Without clearing, concurrent
// requests in the same Node process could leak tenant context.
let serverHeaders: Headers | Record<string, string> | null = null;

/**
 * Stores the current request headers for DS-side tenant resolution.
 */
export function setServerHeaders(headers: Headers | Record<string, string>): void {
  serverHeaders = headers;
}

/**
 * Clears request-scoped header state after the request completes.
 */
export function clearServerHeaders(): void {
  serverHeaders = null;
}

/**
 * Returns the tenant slug from the explicit tenant header, if present.
 */
export function resolveFromHeader(): string | null {
  if (!serverHeaders) return null;

  if (serverHeaders instanceof Headers) {
    return serverHeaders.get(TENANT_HEADER);
  }

  // Check both lowercase and uppercase because plain-object headers from some
  // frameworks (e.g., raw Node.js http.IncomingMessage) may arrive in either
  // casing depending on the HTTP version and library.
  return serverHeaders[TENANT_HEADER] || serverHeaders[TENANT_HEADER.toUpperCase()] || null;
}
