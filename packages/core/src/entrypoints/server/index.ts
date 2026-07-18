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

// Font-pack registry (W4-B1): manifest for SSR <link rel="preload"> emission of
// the opt-in @rottay/design-system/fonts/<id>.css packs a tenant envelope enables.
export {
  FONT_PACK_MANIFEST,
  FONT_PACK_IDS,
} from '../../foundation/tokens/css/foundation/typography/font-packs/manifest/index';
export type {
  FontPackEntry,
  FontPackFace,
  FontPackId,
  FontPackRole,
} from '../../foundation/tokens/css/foundation/typography/font-packs/manifest/index';

// Versioned DB tenant themes: pure schema/validation/SSR compilation.
export {
  TENANT_THEME_COMPILER_VERSION,
  TENANT_THEME_CONFIG_SCHEMA,
  TENANT_THEME_CONFIG_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_SCHEMA_DIGEST,
  TENANT_THEME_VERTICAL_ENVELOPES,
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
  tenantThemeAnatomyAttributes,
} from '../../infrastructure/compilers/composition/tenant-theme';
export type {
  CompileTenantThemeConfigOptions,
  HydrateTenantThemeConfigOptions,
} from '../../infrastructure/compilers/composition/tenant-theme';
export type {
  NormalizedTenantThemeAppearance,
  TenantThemeAdvancedAppearance,
  TenantThemeAdvancedConfig,
  TenantThemeAdvancedDocument,
  TenantThemeArtifactScopes,
  TenantThemeArtifact,
  TenantThemeCardAnatomy,
  TenantThemeChromeFamily,
  TenantThemeChrome,
  TenantThemeContrastAdjustment,
  TenantThemeLayoutAnatomy,
  TenantThemeSidebarAnatomy,
  TenantThemeTableAnatomy,
  TenantThemeConfigIdentity,
  TenantThemeConfig,
  TenantThemeDocumentValidationResult,
  TenantThemeDocument,
  TenantThemeFontPackId,
  TenantThemeSimpleConfig,
  TenantThemeSimpleDocument,
  TenantThemeRootAttributes,
  TenantThemeOverrideToken,
  TenantThemeValidationIssue,
  TenantThemeValidationIssueCode,
  TenantThemeValidationResult,
  TenantThemeVerticalEnvelope,
  TenantVisualFoundation,
} from '../../foundation/contracts/composition/tenants/themes/tenant-theme';
export {
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_OVERRIDE_TOKENS,
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_CHROME_FAMILIES,
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_ANATOMY_VARIANTS,
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
