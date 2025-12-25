/**
 * Static Tenant Loader
 * Loads tenant config from static JSON files
 */

import type { TenantConfig } from '../../../../../types';
import { isValidTenantConfig } from '../../../schema';

const STATIC_PATH = '/.designsystem/tenants';

/**
 * Load tenant config from static files
 */
export async function loadStaticTenantConfig(slug: string): Promise<TenantConfig> {
  const url = `${STATIC_PATH}/${slug}/config.json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Static config not found for tenant: ${slug}`);
  }

  const config = await response.json();

  if (!isValidTenantConfig(config)) {
    throw new Error(`Invalid tenant config for: ${slug}`);
  }

  return config;
}
