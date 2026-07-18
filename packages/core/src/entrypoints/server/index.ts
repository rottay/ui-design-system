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
} from '../../infrastructure/runtime/tenant/runtime/resolution/request';
export {
  isKnownTenant,
  isBundledTenant,
  getKnownTenantConfig,
  getKnownTenantSlugs,
  DEFAULT_TENANT_SLUG,
} from '../../infrastructure/runtime/tenant/foundation/configuration/registry';
export type {
  TenantResolutionOptions,
  EdgeConfigDomainLookupOptions,
} from '../../infrastructure/runtime/tenant/runtime/resolution/request';

export { toSupportedLocale } from '../../foundation/i18n/runtime/resolution/locale';

// Versioned DB tenant themes: pure schema/validation/SSR compilation.
export {
  TENANT_THEME_COMPILER_VERSION,
  TENANT_THEME_CONFIG_V1_SCHEMA,
  TENANT_THEME_CONFIG_V1_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_V1_SCHEMA_DIGEST,
  TENANT_THEME_VERTICAL_ENVELOPES_V1,
  TenantThemeValidationError,
  canonicalizeTenantThemeValue,
  sha256TenantThemeValue,
  validateTenantThemeDocument,
  parseTenantThemeDocument,
  validateTenantThemeConfig,
  validateTenantThemeAgainstVerticalEnvelope,
  parseTenantThemeConfig,
  hydrateTenantThemeConfig,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  tenantThemeArtifactRootAttributes,
} from '../../infrastructure/compilers/composition/tenant-theme';
export type {
  CompileTenantThemeConfigOptions,
  HydrateTenantThemeConfigOptions,
} from '../../infrastructure/compilers/composition/tenant-theme';
export type {
  NormalizedTenantThemeAppearanceV1,
  TenantThemeAdvancedAppearanceV1,
  TenantThemeAdvancedConfigV1,
  TenantThemeAdvancedDocumentV1,
  TenantThemeArtifact,
  TenantThemeArtifactScopes,
  TenantThemeArtifactV1,
  TenantThemeChromeFamilyV1,
  TenantThemeChromeV1,
  TenantThemeConfig,
  TenantThemeConfigIdentityV1,
  TenantThemeConfigV1,
  TenantThemeDocument,
  TenantThemeDocumentValidationResult,
  TenantThemeDocumentV1,
  TenantThemeFontPackIdV1,
  TenantThemeSimpleConfigV1,
  TenantThemeSimpleDocumentV1,
  TenantThemeRootAttributesV1,
  TenantThemeOverrideTokenV1,
  TenantThemeValidationIssue,
  TenantThemeValidationIssueCode,
  TenantThemeValidationResult,
  TenantThemeVerticalEnvelopeV1,
  TenantVisualFoundationV1,
} from '../../foundation/contracts/composition/tenants/themes/tenant-theme';
export {
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_OVERRIDE_TOKENS_V1,
  TENANT_THEME_REFERENCE_TOKENS_V1,
  TENANT_THEME_CHROME_FAMILIES_V1,
  TENANT_THEME_FONT_PACK_IDS_V1,
} from '../../foundation/contracts/composition/tenants/themes/tenant-theme';
// A11y: branding contrast validation (Wave 6.2 Accessibility Guardian)
export {
  validateBrandingContrast,
  contrastRatio as brandingContrastRatio,
} from '@/foundation/kernel/accessibility/branding-contrast';
export type {
  BrandingColors,
  ContrastViolation,
  ContrastSuggestion,
  ContrastValidationResult,
} from '@/foundation/kernel/accessibility/branding-contrast';
