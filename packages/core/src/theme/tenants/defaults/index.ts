/**
 * Tenant Defaults
 * Default tenant configuration for standalone mode
 */

import type { TenantConfig } from '../../../contracts';

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  slug: 'default',
  name: 'Default Tenant',
  engine: 'classic',
  theme: 'base',
  plan: 'starter',
  features: ['*'],  // All features enabled by default
  branding: {
    companyName: 'Rottay Design System',
    primaryColor: '#0066CC',
    accentColor: '#6366F1',
  },
};

/**
 * Get default tenant config with optional overrides
 */
export function getDefaultTenantConfig(overrides?: Partial<TenantConfig>): TenantConfig {
  return {
    ...DEFAULT_TENANT_CONFIG,
    ...overrides,
    branding: {
      ...DEFAULT_TENANT_CONFIG.branding,
      ...overrides?.branding,
    },
  };
}
