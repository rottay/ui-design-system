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

/**
 * The MOUNT half of the compiled-artifact contract.
 *
 * `resolveVisualAuthority` admits a compiled artifact only against proof: on
 * the client, exactly one `<style>` carrying the three
 * `data-ds-tenant-theme-*` attributes and byte-identical CSS; on the server,
 * where there is no DOM to observe, a receipt this package minted for those
 * exact bytes. Both halves are produced by `emitTenantThemeArtifactForSsr`.
 *
 * Exported because the alternative is what the callers actually did: hand-write
 * the attribute names. A consumer that guesses `data-tenant` / `data-digest`
 * mounts an artifact the resolver cannot see, and the provider blocks a surface
 * whose CSS is sitting correctly in the document. The proof attributes are a
 * wire contract, so the code that writes them and the code that reads them must
 * come from the same place.
 */
export {
  emitTenantThemeArtifactForSsr,
  tenantThemeArtifactElementId,
  tenantThemeArtifactCssIntegrity,
  TENANT_THEME_ARTIFACT_ELEMENT_ID_PREFIX,
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '../../infrastructure/runtime/theming/foundation/visual-authority';
export type {
  TenantThemeArtifactSsrEmission,
  TenantThemeArtifactSsrEmissionReceipt,
  TenantThemeArtifactExpectation,
} from '../../infrastructure/runtime/theming/foundation/visual-authority';

/**
 * The READER half of the same contract.
 *
 * `censusRuntimeVisualPayload` is the exact reader the provider runs over the
 * config it was handed, and the code-owned pair is the projection it runs
 * FIRST: a registered vertical's `brandTheme` is stripped before the census, so
 * static CSS stays the sole visual emitter. Both together are how a surface
 * predicts — or explains — a refusal, which is otherwise indistinguishable
 * from a slow load.
 *
 * `isCodeOwnedTenantConfig` is identity-bound on purpose. A hand-authored
 * literal carrying a reserved slug and a `brandTheme` is an ordinary tenant
 * with uncompiled visual payload, and it is refused as one.
 */
export {
  censusRuntimeVisualPayload,
  resolveVisualAuthority,
} from '../../infrastructure/runtime/theming/foundation/visual-authority';
export type {
  RuntimeVisualPayloadCensus,
  VisualAuthorityResolution,
  VisualAuthorityOrigin,
} from '../../infrastructure/runtime/theming/foundation/visual-authority';
export {
  isCodeOwnedTenantConfig,
  getCodeOwnedRuntimeConfig,
} from '../../infrastructure/runtime/tenant/foundation/configuration/registry';

/**
 * The FIRST-PARTY STATIC ingress path, beside the tenant/DB one above.
 *
 * These are the two — and only two — ways a tenant's visual channels are
 * produced: a code-owned vertical compiles a `BrandTheme` here, and a customer
 * publishes a `TenantThemeDocument` compiled by `compileTenantThemeConfig`.
 * Both terminate in CSS the application mounts; no provider compiles anything.
 *
 * Exported because a consumer outside this package that mounts a first-party
 * theme's CSS itself — the showroom's probe surfaces are the live case — must
 * be able to reach the SAME compiler the committed artifacts are built from.
 * Without a public seam the alternative is a second, hand-rolled projection of
 * a BrandTheme, which is precisely the shape this checkpoint removed.
 * `brandTenantSelector` travels with it because a consumer that re-scopes the
 * compiled output must not reconstruct the selector by hand.
 */
export {
  brandModeSelector,
  brandTenantSelector,
  compileBrandTheme,
  compileTheme,
} from '../../infrastructure/compilers/kernel/runtime/brand-theme';
export type {
  Theme,
  ThemePatch,
  ThemePatchEnvelope,
  Governed,
} from '../../foundation/contracts/composition/tenants/themes/iso';
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
  TenantVisualChannel,
  TenantVisualFoundation,
} from '../../foundation/contracts/composition/tenants/themes/tenant-theme';
export {
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_OVERRIDE_TOKENS,
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_CHROME_FAMILIES,
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_ANATOMY_VARIANTS,
  TENANT_THEME_V1_COVERAGE,
  TENANT_VISUAL_CHANNELS,
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

/**
 * The canonical SSR projection of every governed root attribute, plus the
 * pre-paint script that refines `auto`. Applications spread the projection onto
 * their root element and add nothing of their own; see
 * `infrastructure/runtime/foundation/root-attributes/ssr`.
 */
export {
  resolveDocumentRootAttributes,
  buildThemePrepaintScript,
  type DocumentRootAttributes,
  type DocumentRootAttributesInput,
  type ResolvedTheme,
  type TenantThemeMode,
} from '@/infrastructure/runtime/foundation/root-attributes/ssr';

/**
 * C2b: server half of the RSC-safe icon posture seam. Call once per request
 * where the tenant artifact reaches SSR (the same integration point that
 * mounts the compiled CSS); the per-request React.cache box cannot leak
 * between concurrent tenants. The client half is owned by
 * DesignSystemProvider and needs no application wiring.
 */
export {
  provideServerIconExpressiveProfile,
  resolveActiveIconExpressiveProfile,
} from '../../infrastructure/runtime/foundation/icons/active-profile';
