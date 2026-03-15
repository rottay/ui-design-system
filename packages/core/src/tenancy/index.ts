/**
 * Tenancy System
 *
 * Single home for all tenant-related functionality:
 * - Runtime: Provider, hooks, presets, tenant creation
 * - Configuration: Schema, validation, registry, defaults
 * - Resolution: Subdomain, domain, header resolvers
 * - Storage: Memory cache, localStorage, static files, remote API
 * - CSS Generation: Tenant CSS variable generation
 */

// ── Runtime (Provider, hooks, presets) ──
export { TenantProvider, useTenantContext, TenantContext } from './TenantProvider';
export type { TenantProviderProps } from './TenantProvider';
export { useTenant } from './useTenant';
export { resolvePersonalityPreset } from './personality-presets';
export type { PersonalityPreset } from './personality-presets';
export { createTenantConfig } from './create-tenant';
export type { TenantCreationConfig } from './create-tenant';
export { useCreateTenant } from './useCreateTenant';

// ── Schema & validation ──
export {
  isValidTenantConfig,
  isValidBranding,
  isValidPlan,
  isValidEngineName,
  createTenantConfig as createTenantSchemaConfig,
} from './schema';

// ── Defaults ──
export { DEFAULT_TENANT_CONFIG, getDefaultTenantConfig } from './defaults';

// ── Resolver ──
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

// ── Storage ──
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

// ── Registry (known tenants) ──
export {
  getKnownTenantConfig,
  isKnownTenant,
  getKnownTenantSlugs,
  getDefaultTenant,
  DEFAULT_TENANT_SLUG,
} from './registry';
