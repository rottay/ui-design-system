/**
 * Tenant configuration exports
 */

// Schema & validation
export {
  isValidTenantConfig,
  isValidBranding,
  isValidPlan,
  isValidEngineName,
  createTenantConfig
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
  fetchRemoteTenantConfig,
  configureTenantApi,
  clearTenantCache,
  preloadTenantConfig,
} from './storage';
