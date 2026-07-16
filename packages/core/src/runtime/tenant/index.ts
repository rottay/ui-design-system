/**
 * @fileoverview Tenancy system barrel export.
 * @description Single home for all tenant-related functionality including
 * runtime providers, authoring tools, personality presets, slug resolution,
 * config storage, schema validation, and CSS generation.
 *
 * Consumers should import from this module rather than reaching into
 * subdirectories.
 *
 * The tenancy system is organized into eight focused areas (each mapping
 * to a subfolder or a root-level file under `runtime/tenant/`):
 *
 * 1. **Provider** (`context/`) — React context and hooks that supply
 *    tenant state to components (`TenantProvider`, `useTenant`).
 * 2. **Authoring** (`authoring/`) — Utilities for creating new tenant
 *    configs at runtime (`createTenantConfig`, `useCreateTenant`).
 * 3. **Presets** (`presets/`) — Maps known verticals to
 *    their personality token baseline (`resolvePersonalityPreset`).
 * 4. **Schema** (`schema/`) — Pure validation functions that ensure
 *    `TenantConfig` payloads are well-formed.
 * 5. **Defaults** (`defaults/`) — Safety-net config used when no tenant
 *    source is available at all.
 * 6. **Resolution** (`resolution/`) — Slug resolution: determines
 *    "which tenant am I?" from headers, subdomains, or custom domains.
 * 7. **Storage** (`storage/`) — Config resolution: given a slug, returns
 *    a full `TenantConfig` via a six-level fallback chain.
 * 8. **Registry** (`registry/`) — First-party tenant configs (rottay,
 *    bithire, evnto) bundled for zero-latency dev/CI resolution.
 */

// ── Provider (React-layer API) ──
export { TenantProvider, useTenantContext, TenantContext } from './context/TenantProvider';
export type { TenantProviderProps } from './context/TenantProvider';
export { useTenant } from './context/useTenant';

// ── Authoring (tenant creation utilities) ──
export { createTenantConfig } from './authoring/create-tenant';
export type { TenantCreationConfig } from './authoring/create-tenant';
export { useCreateTenant } from './authoring/useCreateTenant';

// ── Presets (personality resolution) ──
export { resolvePersonalityPreset } from './presets';
export type { PersonalityPreset } from './presets';

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

// ── Resolution ──
// Slug resolution layer: figures out the tenant slug from the execution
// context (headers on server, subdomain/domain in browser) before the
// storage layer resolves the full config.
export {
  resolveTenant,
  resolveFromSubdomain,
  resolveFromDomain,
  resolveFromHeader,
  configureDomainLookup,
  setServerHeaders,
  clearServerHeaders,
} from './resolution';
export type { ResolverOptions } from './resolution';

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
  renderVerticalArtifact,
  GENERATED_ARTIFACT_BANNER,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  FIRST_PARTY_ARTIFACT_SPECS,
} from './storage';
export type { GenerateTenantCssOptions, RenderVerticalArtifactInput, FirstPartyArtifactSpec } from './storage';

// ── Registry (known tenants) ──
// First-party tenants (rottay, bithire, evnto) bundled with the DS for
// zero-latency resolution in dev, Storybook, and CI environments.
export {
  getKnownTenantConfig,
  isKnownTenant,
  isBundledTenant,
  getKnownTenantSlugs,
  getDefaultTenant,
  DEFAULT_TENANT_SLUG,
} from './registry';

// Middleware tenant resolution utility (lives alongside the client resolver
// inside resolution/ since both answer "which tenant am I?")
export {
  resolveRequestTenant,
  resolveRequestTenantAsync,
  createEdgeConfigDomainLookup,
} from './resolution/resolve-request-tenant';
export type {
  TenantResolutionOptions,
  EdgeConfigDomainLookupOptions,
} from './resolution/resolve-request-tenant';
