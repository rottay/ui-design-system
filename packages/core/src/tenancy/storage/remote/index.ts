/**
 * @fileoverview Remote tenant config fetcher via application-owned API.
 * @description Recommended integration for platform-managed tenants stored in a
 * database. Call `configureTenantApi(endpoint)` at app startup, then the storage
 * facade will use `fetchRemoteTenantConfig(slug)` to pull and validate configs.
 */

import type { TenantConfig } from '../../../contracts';
import { isValidTenantConfig } from '../../schema';

// Module-level state: the API endpoint is set once at app startup via
// `configureTenantApi()`. This avoids threading an endpoint through every
// component that might trigger tenant resolution.
let apiEndpoint: string | null = null;

/**
 * Configures the base URL used to fetch tenant configs by slug.
 *
 * Must be called once at application bootstrap (e.g., in `_app.tsx` or a
 * root layout) before any component triggers tenant resolution through the
 * storage facade. The URL is appended with `/<slug>` at fetch time.
 *
 * @param endpoint - Base URL (e.g. `'https://api.rottay.com/tenants'`).
 *
 * @example
 * ```ts
 * // In app bootstrap
 * configureTenantApi('https://api.rottay.com/v1/tenants');
 * // Later: fetches https://api.rottay.com/v1/tenants/acme
 * ```
 */
export function configureTenantApi(endpoint: string): void {
  apiEndpoint = endpoint;
}

/**
 * Fetches a tenant config from the configured remote source and validates it
 * against the tenant schema before returning.
 *
 * WHY validation: the API response is untrusted JSON. Running it through
 * `isValidTenantConfig()` catches schema drift between the platform API and
 * the DS contract, preventing partial/malformed configs from reaching components.
 *
 * @param slug - Tenant identifier to fetch.
 * @returns A validated TenantConfig.
 * @throws If the API endpoint is not configured, the fetch fails, or validation fails.
 */
export async function fetchRemoteTenantConfig(slug: string): Promise<TenantConfig> {
  if (!apiEndpoint) {
    throw new Error('Tenant API endpoint not configured. Call configureTenantApi() first.');
  }

  const response = await fetch(`${apiEndpoint}/${slug}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tenant config: ${response.statusText}`);
  }

  const config = await response.json();

  // Validate the shape before trusting it -- a malformed config could crash
  // downstream token resolution or theme injection.
  if (!isValidTenantConfig(config)) {
    throw new Error(`Invalid tenant config received for: ${slug}`);
  }

  return config;
}
