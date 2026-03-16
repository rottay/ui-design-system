/**
 * @fileoverview Tenancy system barrel export.
 * @description Single home for all tenant-related functionality including runtime
 * providers, configuration, slug resolution, storage, and CSS generation.
 *
 * Consumers should import from this module rather than reaching into subdirectories.
 *
 * The tenancy system is structured into five layers:
 * 1. **Runtime** -- React providers and hooks that supply tenant context to components.
 * 2. **Schema** -- Validation functions that ensure TenantConfig payloads are well-formed.
 * 3. **Defaults** -- Safety-net config used when no tenant source is available.
 * 4. **Resolver** -- Determines "which tenant am I?" from headers, subdomains, or domains.
 * 5. **Storage** -- Determines "what is this tenant's config?" via registry, static, or API.
 */

// ── Runtime (Provider, hooks, presets) ──
// React-layer API: TenantProvider wraps the app, useTenant/useTenantContext
// read the current tenant, and creation utilities help build new configs.
export { TenantProvider, useTenantContext, TenantContext } from './TenantProvider';
export type { TenantProviderProps } from './TenantProvider';
export { useTenant } from './useTenant';
export { resolvePersonalityPreset } from './personality-presets';
export type { PersonalityPreset } from './personality-presets';
export { createTenantConfig } from './create-tenant';
export type { TenantCreationConfig } from './create-tenant';
export { useCreateTenant } from './useCreateTenant';

// ── Schema & validation ──
// Pure functions for validating tenant payloads against the DS contract.
// Used by both the storage layer (to validate fetched configs) and the
// tenant creation flow (to validate user input).
export {
  isValidTenantConfig,
  isValidBranding,
  isValidPlan,
  isValidEngineName,
  createTenantConfig as createTenantSchemaConfig,
} from './schema';

// ── Defaults ──
// Baseline config for when no tenant source is available at all.
export { DEFAULT_TENANT_CONFIG, getDefaultTenantConfig } from './defaults';

// ── Resolver ──
// Slug resolution layer: figures out the tenant slug from the execution context
// (headers on server, subdomain/domain in browser) before the storage layer
// resolves the full config.
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
// Config resolution layer: given a slug, returns a full TenantConfig via a
// six-level fallback chain (cache -> localStorage -> registry -> static -> API -> default).
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
// First-party tenants (rottay, bithire, evnto) bundled with the DS for
// zero-latency resolution in dev, Storybook, and CI environments.
export {
  getKnownTenantConfig,
  isKnownTenant,
  getKnownTenantSlugs,
  getDefaultTenant,
  DEFAULT_TENANT_SLUG,
} from './registry';
