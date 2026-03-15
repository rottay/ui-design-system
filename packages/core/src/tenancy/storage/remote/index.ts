/**
 * Remote Tenant Storage
 * Fetches tenant config from API
 */

import type { TenantConfig } from '../../../contracts';
import { isValidTenantConfig } from '../../schema';

let apiEndpoint: string | null = null;

/**
 * Configure the tenant API endpoint
 */
export function configureTenantApi(endpoint: string): void {
  apiEndpoint = endpoint;
}

/**
 * Fetch tenant config from remote API
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

  if (!isValidTenantConfig(config)) {
    throw new Error(`Invalid tenant config received for: ${slug}`);
  }

  return config;
}
