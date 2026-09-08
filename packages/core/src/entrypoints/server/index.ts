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
  compileTenantTheme,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  tenantThemeArtifactRootAttributes,
  tenantThemeAnatomyAttributes,
} from '../../infrastructure/compilers/composition/tenant-theme';
export type {
  CompileTenantThemeConfigOptions,
  HydrateTenantThemeConfigOptions,
  TenantThemeCompilation,
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
 * THE ONE COMPILE DOOR, and nothing beside it.
 *
 * A tenant's visual channels are produced exactly one way from outside this
 * package: name an intent with one of the three producers, hand it to
 * `compileThemeIntent`, and emit the result. The door runs the whole admission
 * -- tier, engine, envelope, contrast, limits -- for every origin.
 *
 * WHAT THIS ENTRY POINT NO LONGER PUBLISHES, and why (F-24). It used to also
 * export the raw lowering, the raw resolver, the authoring lift and the adapter
 * table, which together are a complete second route: hand-assemble a
 * `ThemeResolution` with the lift, pick an adapter out of the table, call the
 * lowering, and every one of those five stations is skipped. "One door" was
 * true only inside the package. The names are gone rather than deprecated,
 * because a deprecated bypass is a bypass (D-07: APIs break here).
 *
 * A consumer that mounted a first-party theme's CSS itself -- the showroom's
 * probe surfaces are the live case -- reaches the same compiler through
 * `staticThemeIntent` + `compileThemeIntent`, which is the same lowering with
 * the admission in front of it. Emission travels with the door because scope is
 * not compiled: one compile serves a document root, a DB artifact and a preview
 * container. `brandTenantSelector` travels with it because a consumer that
 * re-scopes the compiled output must not reconstruct the selector by hand.
 */
export {
  brandModeSelector,
  brandTenantSelector,
  themeModeSelector,
} from '../../infrastructure/compilers/kernel/foundation/css/tenant-selectors';
export {
  compileThemeIntent,
  containerScope,
  documentThemeIntent,
  draftPreviewThemeIntent,
  emitThemeCss,
  engineVisualOf,
  firstPartyEngineVisual,
  firstPartyScope,
  previewThemeIntent,
  resolveAdapter,
  staticThemeIntent,
  tenantArtifactScope,
  verticalEngine,
} from '../../infrastructure/compilers/runtime/theme';
export type {
  ControlId,
  EmissionScope,
  EngineAdapter,
  EngineControlDeclaration,
  EngineEvidence,
  EnginePosture,
  EngineProjection,
  EngineThemeCompilation,
  EngineVisualDeclaration,
  ThemeCompilation,
  ThemeCompilationModeBlock,
  ThemeCompilationRuntime,
  ThemeIntent,
  ThemeIntentCompilation,
  ThemeIntentOrigin,
  ThemeResolution,
} from '../../infrastructure/compilers/runtime/theme';
/**
 * THE ADMISSION HALF OF THE SAME DOOR, and the migration that reaches it.
 *
 * `documentThemeIntent` and `previewThemeIntent` above answer "what compiles";
 * these answer "what did the tenant's document actually move". A v2 document
 * may activate a decision whose fan-out has not landed, and the door records
 * that as `unlit` instead of refusing a decision the published catalog names.
 * A surface that must tell the tenant which of its decisions moved nothing has
 * exactly one place to read it; reconstructing it by diffing a patch would be a
 * second, weaker answer to a question the door already answered.
 *
 * `admitDocument` is the version-agnostic admission the two producers above run
 * internally, published for the caller that holds a document but no slug yet.
 * It is NOT a second compile route: it returns the same `ThemeLayerPatch` those
 * producers put in their `ThemeIntent`, and a compile still goes through
 * `compileThemeIntent`. The patch-level projections behind it
 * (`documentAnyThemePatch`, `projectDecisionsToV1`, `v1KeypathOf`) stay
 * unpublished on purpose: they are the projection onto the v1 authoring shape
 * that WO-DER-06 replaces with real derivation, and publishing them would open
 * a route around the intent.
 *
 * `ThemePatchMigrationError` is the migration's fail-closed refusal and is
 * exported with it: `migrateDocumentV1ToV2` is total in the sense that it is
 * defined on every v1 document -- each one either becomes a v2 document or is
 * refused BY THE NAME of the field that could not be carried -- so a caller
 * that cannot name the error cannot tell a refusal from a crash.
 */
export {
  ThemePatchMigrationError,
  admitDocument,
  documentThemeAdmission,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  previewThemeAdmission,
} from '../../infrastructure/compilers/runtime/theme';
export type {
  DecisionProjection,
  DocumentAdmission,
  DocumentThemeIntentInput,
  PreviewThemeIntentInput,
  UnlitReason,
} from '../../infrastructure/compilers/runtime/theme';
export type {
  Theme,
  ThemeLayerPatch,
  ThemePatchEnvelope,
  Governed,
} from '../../foundation/contracts/composition/tenants/themes/iso';
/**
 * `ThemePatch` is what a TENANT authors: a partial set of the catalog's
 * decisions plus the one sanctioned override group of D-03. It is not the
 * Theme-shaped layer the resolver merges -- that keeps its own name,
 * `ThemeLayerPatch`, above. Before WO-CAT-02 one name carried both meanings,
 * which is how a patch could reach 28 % of the Theme keypaths and name `id`.
 */
export { assertThemePatch, ThemePatchError } from '../../contracts/theme/runtime/patch';
export type { ThemePatch } from '../../contracts/theme/runtime/patch';
/**
 * The vertical vocabulary the intent producers above take.
 *
 * A `ThemeIntent` NAMES its baseline instead of carrying one, so a consumer
 * outside this package cannot build one without the closed set of names and a
 * guard to narrow an untrusted string into it. Publishing the compile door
 * without them would leave the only route back to a hand-assembled baseline.
 */
export {
  FIRST_PARTY_VERTICAL_SLUGS,
} from '../../foundation/contracts/kernel/verticals';
export type {
  FirstPartyVerticalId,
} from '../../foundation/contracts/kernel/verticals';
export { isFirstPartyVerticalId } from '../../foundation/tokens/ts/presentation/brand-themes';
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
/**
 * THE v2 DECISION DOCUMENT, beside the v1 transport it does not replace.
 *
 * `TenantThemeDocument` above stays the v1 name and ~45 modules narrow it on
 * `schemaVersion`/`mode`; `TenantThemeDocumentV2` is the shape a customer
 * writes from day one and `TenantThemeDocumentAny` is what the intent producers
 * accept. Only the INPUT position is widened, so no reader of the v1 name is
 * touched.
 *
 * The whole contract owner is published as one unit because that is what
 * authoring a document costs: a writer that can name the document but not the
 * closed domain of a decision it carries re-declares those domains on its side,
 * and a re-declared domain is a domain that drifts. `THEME_DECISION_IDS` and
 * `THEME_DECISION_TIER_BY_ID` are the kit's 29 rows in kit order,
 * `THEME_PLAN_TIERS` is what a plan entitles, and `assertTenantThemeDocumentV2`
 * is the same fail-closed validator the door runs -- an editor that wants to
 * refuse before it saves calls it rather than approximating it.
 *
 * `internal` is a PLAN, not a customer tier: it entitles standard and pro, and
 * `THEME_DECISION_TIERS` stays the two customer-visible tiers. Raw `--ds-*`
 * authorship has no name here at all; v2 refuses it structurally at every depth
 * (D-03), and `SanctionedOverrides` names `chrome.<family>.<channel>` instead.
 *
 * `TENANT_THEME_FONT_PACK_IDS` and `TenantThemeChrome` belong to this contract
 * too and are already exported above from the v1 owner they are shared with.
 */
export {
  CHROME_ANATOMY_FAMILIES,
  DENSITY_MODES,
  EXPRESSIVE_AXIS_KEYS,
  KEPT_THEME_DECISION_IDS,
  MOTION_CHARACTERS,
  MOTION_DIAL_KEYS,
  NAVIGATION_SIDEBAR_TONES,
  NEW_THEME_DECISION_IDS,
  PALETTE_CONTRAST_POSTURES,
  PALETTE_DARK_MODES,
  PALETTE_NEUTRAL_TEMPERATURES,
  PALETTE_SEED_ROLES,
  PALETTE_STATUS_SEED_ROLES,
  SHAPE_BUTTON_STYLES,
  SHAPE_CONTROL_HEIGHTS,
  SHAPE_NESTING_POSTURES,
  STATE_EMPHASIS_POSTURES,
  STATE_FOCUS_STYLES,
  SURFACE_BORDER_STYLES,
  SURFACE_ELEVATION_POSTURES,
  TENANT_THEME_DOCUMENT_VERSION_V2,
  THEME_DECISION_BOUNDS,
  THEME_DECISION_IDS,
  THEME_DECISION_TIERS,
  THEME_DECISION_TIER_BY_ID,
  THEME_PLANS,
  THEME_PLAN_TIERS,
  TYPOGRAPHY_FAMILY_ROLES,
  TYPOGRAPHY_NUMERIC_POSTURES,
  TYPOGRAPHY_PAIRINGS,
  TYPOGRAPHY_ROLE_WEIGHTS,
  TenantThemeDocumentV2Error,
  activatedDecisionIds,
  assertTenantThemeDocumentV2,
  isTenantThemeDocumentV2,
} from '../../contracts/theme/presentation/document';
export type {
  ChromeAnatomy,
  DensityMode,
  ExpressiveProfiles,
  MotionCharacter,
  MotionDial,
  NavigationSidebarTone,
  PaletteContrastPosture,
  PaletteDarkMode,
  PaletteNeutralTemperature,
  PaletteSeedRole,
  PaletteSeeds,
  PaletteStatusSeedRole,
  PaletteStatusSeeds,
  SanctionedOverrides,
  ShapeButtonStyle,
  ShapeControlHeight,
  ShapeNestingPosture,
  StateEmphasisPosture,
  StateFocusStyle,
  SurfaceBorderStyle,
  SurfaceElevationPosture,
  TenantThemeDocumentAny,
  TenantThemeDocumentV1,
  TenantThemeDocumentV2,
  ThemeDecisionId,
  ThemeDecisionTier,
  ThemeDecisions,
  ThemePlan,
  TypographyFamilies,
  TypographyFamilyRole,
  TypographyNumericPosture,
  TypographyPairing,
  TypographyRoleWeight,
} from '../../contracts/theme/presentation/document';
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
} from '../../infrastructure/runtime/foundation/icons/active-profile/runtime/provider';
export {
  resolveActiveIconExpressiveProfile,
} from '../../infrastructure/runtime/foundation/icons/active-profile/runtime/resolution';

/**
 * THE MOUNT, as one call.
 *
 * `mountTenantTheme` is the whole server-side theme integration an application
 * performs: it returns the root attributes to stamp, the style elements to
 * emit, the artifact's digest and the proof of the bytes it is authoritative
 * for. It replaces the three files each app wrote around the pieces above
 * (`runtime-tenant-theme/{ssr,contracts,artifact-resolution}`); the codemod
 * `scripts/maintain/codemods/mount-tenant-theme` performs the replacement.
 *
 * DATED EXCEPTION, AND WHAT IT COVERS. The BODY is a thin adapter over the
 * pipeline exported above and emits no byte that pipeline does not already
 * emit; WO-EMI-02 replaces that body with the real mount and deletes the
 * adapter. The SIGNATURE is not part of the exception and does not change:
 * `(intent, options?)`, the whole of `MountTenantThemeOptions` — `themeMode`,
 * `autoFallback`, `locale` and `artifact` — and the return shape all survive
 * that landing, so an application that calls it today is not touched by it.
 * `artifact` in particular stays accepted, and the real mount verifies the
 * supplied artifact against its own compile rather than ignoring it. Any input
 * here is retired only by a versioned breaking change with a codemod (the 3.0
 * changeset of WO-RET-01 under the WO-CON-05 protocol).
 */
export { mountTenantTheme } from '../../infrastructure/runtime/theming/composition/mount';
export type {
  MountTenantThemeOptions,
  MountedTenantTheme,
  MountedThemeHydrationProof,
  MountedThemeStyleElement,
} from '../../infrastructure/runtime/theming/composition/mount';
