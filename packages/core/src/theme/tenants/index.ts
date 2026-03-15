/**
 * Tenant configuration exports
 */

// Schema & validation
export {
  isValidTenantConfig,
  isValidBranding,
  isValidPlan,
  isValidEngineName,
  createTenantConfig as createTenantSchemaConfig,
} from './schema';

// Defaults
export { DEFAULT_TENANT_CONFIG, getDefaultTenantConfig } from './defaults';

// Resolver
export {
  resolveTenant,
  resolveFromSubdomain,
  resolveFromDomain,
  resolveFromHeader,
  configureDomainLookup,
  setServerHeaders,
  clearServerHeaders,
} from './resolver';
export type { ResolverOptions } from './resolver';

// Storage
export {
  getTenantConfig,
  loadStaticTenantConfig,
  generateTenantCss,
  generateTenantCssFile,
  buildTenantSelector,
  fetchRemoteTenantConfig,
  configureTenantApi,
  clearTenantCache,
  preloadTenantConfig,
} from './storage';
export type { GenerateTenantCssOptions } from './storage';

// Registry (known tenants)
export {
  getKnownTenantConfig,
  isKnownTenant,
  getKnownTenantSlugs,
  getDefaultTenant,
  DEFAULT_TENANT_SLUG,
} from './registry';
