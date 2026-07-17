/**
 * @fileoverview Tenancy system barrel export.
 * @description Single home for all tenant-related functionality including
 * runtime providers, authoring tools, personality presets, slug resolution,
 * config storage, schema validation, and the tenant CSS compiler bridge.
 *
 * Consumers should import from this module rather than reaching into
 * subdirectories.
 *
 * The tenancy system is organized by dependency direction:
 *
 * 1. **Foundation** — defaults, first-party registry, personality presets,
 *    and payload validation. These are pure dependencies of runtime flows.
 * 2. **Runtime** — tenant authoring, identity resolution, and config storage.
 * 3. **React** — provider, context, and hooks that present resolved state.
 *
 * Cross-domain tenant visual generation and authoring live in the composition
 * tier; static first-party artifact rendering remains in `infrastructure/compilers/runtime/tenant-css`.
 * This barrel preserves the established public tenant API.
 */

// ── Provider (React-layer API) ──
export {
  TenantProvider,
  useTenant,
  useTenantContext,
  TenantContext,
} from '../composition/react/provider';
export type { TenantProviderProps } from '../composition/react/provider';

// Runtime branding resolution: synchronous vertical/identity baseline plus
// bounded DB-owned tenant configuration.
export { useTenantBranding } from '../composition/react/branding';
export type {
  UseTenantBrandingOptions,
  UseTenantBrandingReturn,
  TenantBrandingSession,
} from '../composition/react/branding';

// ── Authoring (tenant creation utilities) ──
export { createTenantConfig } from '../runtime/authoring/configuration';
export type { TenantCreationConfig } from '../runtime/authoring/configuration';
export { useCreateTenant } from '../composition/react/authoring/use-create-tenant';

// ── Presets (personality resolution) ──
export { resolvePersonalityPreset } from '../foundation/personality/presets';
export type { PersonalityPreset } from '../foundation/personality/presets';

// ── Schema & validation ──
// Pure functions for validating tenant payloads against the DS contract.
// Used by both the storage layer (to validate fetched configs) and the
// tenant creation flow (to validate user input).
export {
  isValidTenantConfig,
  isValidBranding,
  isValidPlan,
  isValidEngineName,
} from '../foundation/validation';

// ── Defaults ──
// Baseline config for when no tenant source is available at all.
export {
  DEFAULT_TENANT_CONFIG,
  getDefaultTenantConfig,
  getUnresolvedTenantConfig,
} from '../foundation/configuration/defaults';

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
} from '../runtime/resolution';
export type { ResolverOptions } from '../runtime/resolution';

// ── Storage ──
// Config resolution layer: given a slug, returns a full TenantConfig via a
// six-level fallback chain (cache -> localStorage -> registry -> static -> API -> default).
export {
  getTenantConfig,
  loadStaticTenantConfig,
  fetchRemoteTenantConfig,
  configureTenantApi,
  clearTenantCache,
  preloadTenantConfig,
} from '../runtime/store';
export {
  generateTenantCss,
  generateTenantCssFile,
  buildTenantSelector,
} from '../../../compilers/runtime/tenant-css/visual-config';
export {
  renderVerticalArtifact,
  GENERATED_ARTIFACT_BANNER,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  FIRST_PARTY_ARTIFACT_SPECS,
} from '../../../compilers/runtime/tenant-css';
export type {
  GenerateTenantCssOptions,
} from '../../../compilers/runtime/tenant-css/visual-config';
export type {
  RenderVerticalArtifactInput,
  FirstPartyArtifactSpec,
} from '../../../compilers/runtime/tenant-css';

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
} from '../foundation/configuration/registry';

// Middleware tenant resolution utility (lives alongside the client resolver
// inside resolution/ since both answer "which tenant am I?")
export {
  resolveRequestTenant,
  resolveRequestTenantAsync,
  createEdgeConfigDomainLookup,
} from '../runtime/resolution/request';
export type {
  TenantResolutionOptions,
  EdgeConfigDomainLookupOptions,
} from '../runtime/resolution/request';
