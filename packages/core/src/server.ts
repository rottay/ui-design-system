/**
 * Server-safe exports from @rottay/design-system.
 *
 * This entry point contains ONLY utilities that can run in Node.js,
 * Edge Runtime, or middleware -- no React components, no 'use client'.
 *
 * Import as: import { resolveRequestTenant } from '@rottay/design-system/server';
 */

export {
  resolveRequestTenant,
  resolveRequestTenantAsync,
  createEdgeConfigDomainLookup,
} from './runtime/tenant/resolution/resolve-request-tenant';
export {
  isKnownTenant,
  isBundledTenant,
  getKnownTenantConfig,
  getKnownTenantSlugs,
  DEFAULT_TENANT_SLUG,
} from './runtime/tenant/registry';
export type {
  TenantResolutionOptions,
  EdgeConfigDomainLookupOptions,
} from './runtime/tenant/resolution/resolve-request-tenant';

export { toSupportedLocale } from './i18n/toSupportedLocale';

// A11y: branding contrast validation (Wave 6.2 Accessibility Guardian)
export {
  validateBrandingContrast,
  contrastRatio as brandingContrastRatio,
} from './_internal/a11y/contrast';
export type {
  BrandingColors,
  ContrastViolation,
  ContrastSuggestion,
  ContrastValidationResult,
} from './_internal/a11y/contrast';
