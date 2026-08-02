'use client';

/**
 * Rottay Design System
 * Multi-tenant, multi-engine UI component library
 *
 * @packageDocumentation
 */

// ============================================
// CORE (Engines, Providers, Types, Errors)
// ============================================
export * from './infrastructure/runtime/engines';
export { ThemeProvider, ThemeContext } from './infrastructure/runtime/theming';
export type { ThemeProviderProps, VisualAuthority, ThemeConfig, ThemeContextValue } from './infrastructure/runtime/theming';
export {
  resolveVisualAuthority,
  reportVisualAuthorityConflict,
  resetVisualAuthorityDiagnostics,
  appearanceMatchesArtifact,
} from './infrastructure/runtime/theming';
export type {
  CompiledArtifactDeclaration,
  ProviderDeclaration,
  RuntimeVisualPayloadCensus,
  VisualAuthorityDeclaration,
  VisualAuthorityInput,
  VisualAuthorityOrigin,
  VisualAuthorityResolution,
} from './infrastructure/runtime/theming';
export * from './infrastructure/runtime/features';
export * from './infrastructure/runtime/bootstrap';
export * from './foundation/contracts';

// ============================================
// ERROR HANDLING
// ============================================
export { ErrorHandler } from './infrastructure/runtime/error-handling/runtime/handler';
export { useErrorHandler } from './infrastructure/runtime/error-handling/composition/react/use-error-handler';
export { ErrorCategory, ErrorSeverity } from './foundation/contracts/runtime/errors';
export type { DSError, DSErrorInput, ErrorSubscriber } from './foundation/contracts/runtime/errors';
export type {
  UseErrorHandlerOptions,
  UseErrorHandlerReturn,
} from './infrastructure/runtime/error-handling/composition/react/use-error-handler';

// ============================================
// PROVIDERS (ResponsiveProvider, etc.)
// ============================================
export * from './infrastructure/runtime/responsive';
export { MotionProvider } from './infrastructure/runtime/motion';
export type { MotionProviderProps } from './infrastructure/runtime/motion';

// ============================================
// RECIPE PROFILES (public white-label contract)
// ============================================
export {
  RecipeProfileProvider,
  useRecipeProfile,
  useRecipeProfileDefaults,
  RECIPE_PROFILES,
  RECIPE_PROFILE_SCHEMA_VERSION,
  resolveRecipeProfile,
  validateRecipeProfileSelection,
} from './infrastructure/runtime/foundation/recipes/profiles';
export type {
  RecipeProfileDefinition,
  RecipeProfileFamily,
  RecipeProfileFamilyDefaults,
  RecipeProfileId,
  RecipeProfileProviderProps,
  RecipeProfileValidation,
} from './infrastructure/runtime/foundation/recipes/profiles';
export {
  buildRecipeManifest,
} from './infrastructure/runtime/foundation/recipes/manifest';
export type {
  RecipeManifest,
  RecipeManifestFamily,
} from './infrastructure/runtime/foundation/recipes/manifest';

// ============================================
// EXPRESSIVE PROFILES (C1b white-label contract)
// ============================================
// Selection surface only: the expansion lowering stays compiler-internal.
export {
  EXPERIENCE_PROFILES,
  EXPRESSIVE_EDGE_PROFILES,
  EXPRESSIVE_ELEVATION_PROFILES,
  EXPRESSIVE_GEOMETRY_PROFILES,
  EXPRESSIVE_ICON_PROFILES,
  EXPRESSIVE_MATERIAL_PROFILES,
  EXPRESSIVE_MOTIF_PROFILES,
  EXPRESSIVE_PROFILE_SCHEMA_VERSION,
  EXPRESSIVE_TYPE_PROFILES,
  resolveExperienceProfile,
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
  validateExperienceProfileSelection,
} from './foundation/tokens/ts/presentation/expressive-profiles';
export type {
  ExperienceProfileDefinition,
  ExperienceProfileId,
  ExperienceProfileValidation,
  ExpressiveAxes,
  ExpressiveEdgeProfile,
  ExpressiveElevationProfile,
  ExpressiveGeometryProfile,
  ExpressiveIconProfile,
  ExpressiveMaterialProfile,
  ExpressiveMotifProfile,
  ExpressiveProfileOverrides,
  ExpressiveProfileEnvelope,
  ExpressiveTypeProfile,
} from './foundation/tokens/ts/presentation/expressive-profiles';
export {
  clampDensityIntoExpressiveEnvelope,
  clampIntoExpressiveEnvelope,
  EXPERIENCE_PROFILE_ENVELOPES,
  EXPRESSIVE_A11Y_FLOORS,
} from './foundation/tokens/ts/presentation/expressive-profiles';

// ============================================
// RESPONSIVE POSTURES (E2 governed container-ladder registry)
// ============================================
export {
  DEFAULT_RESPONSIVE_POSTURE,
  DEFAULT_RESPONSIVE_POSTURE_ID,
  RESPONSIVE_POSTURE_PROFILES,
  RESPONSIVE_POSTURE_SCHEMA_VERSION,
  resolveResponsivePosture,
  validateResponsivePostureSelection,
} from './foundation/tokens/ts/presentation/responsive-postures';
export type {
  ResponsivePostureDefinition,
  ResponsivePostureId,
  ResponsivePostureValidation,
} from './foundation/tokens/ts/presentation/responsive-postures';

// ============================================
// FAMILY EMPHASIS (C2 app-tier "family + intensity" API)
// ============================================
export {
  EMPHASIS_FAMILIES,
  quantizeEmphasis,
  resolveFamilyEmphasis,
} from './foundation/tokens/ts/presentation/expressive-profiles/emphasis';
export type {
  EmphasisFamily,
  EmphasisStep,
} from './foundation/tokens/ts/presentation/expressive-profiles/emphasis';
export { useExpressiveEmphasis } from './infrastructure/runtime/foundation/recipes/emphasis';
export type { ExpressiveEmphasisResult } from './infrastructure/runtime/foundation/recipes/emphasis';

// ============================================
// ADAPTIVE SOLVER (C2 — the ONE layout engine)
// ============================================
export {
  LEGACY_SIZE_SPANS,
  resolveAdaptiveLayout,
  resolveContainerPosture,
} from './ui/patterns/data/widget-board/runtime/solver';
export {
  heightPxToRows,
  placementsToGridStyles,
  widgetItemsToAdaptiveInputs,
} from './ui/patterns/data/widget-board/runtime/solver/policy';
export {
  normalizeLayoutRevision,
  resolveActiveResponsivePosture,
  useActiveResponsivePosture,
} from './ui/patterns/data/widget-board/runtime/solver/react';
export type {
  AdaptiveContentMode,
  AdaptiveItemContract,
  AdaptiveLayoutEnv,
  AdaptiveLayoutResult,
  ContainerPosture,
  GridSpan,
  LayoutIntent,
  LayoutProfileRevision,
  PlacementReason,
  ResizePolicy,
  ResolvedPlacement,
  ResponsivePostureProfile,
} from './ui/patterns/data/widget-board/runtime/solver';

// ============================================
// DENSITY (public scoped visual-density contract)
// ============================================
export {
  DENSITY_POSTURES,
  DensityScope,
  useDensity,
} from './infrastructure/runtime/foundation/density';
export type {
  DensityPosture,
  DensityScopeProps,
  DensityScopeValue,
} from './infrastructure/runtime/foundation/density';

// ============================================
// ROOT ATTRIBUTE CLAIMS (the one governed writer for `<html>`)
// ============================================
// `<html>` is written by the SSR projection, then the pre-paint script, then
// client effects. An effect that cleans up with `removeAttribute`/`classList
// .remove` deletes a value it never created -- the server's. These claims are
// how a runtime owner takes a channel and hands back exactly what it found,
// and they track overlapping claims by identity so a StrictMode double-mount
// or a remount at the same value cannot roll back over a live owner.
//
// Applications need them for the channels the design system does not govern
// (a vertical's own tenant-scope attributes); without a public export an app
// has no choice but to reimplement the stack, which is a second authority by
// construction.
//
// `claimRootAttributeSet` is the same contract for a channel whose KEY SET is
// data rather than fixed (`data-anatomy-*`, one attribute per chrome family the
// tenant artifact declares). Reconciling that by hand forces the owner to keep
// its own record of which keys it stamped, and a key dropped from the set then
// comes back ABSENT instead of coming back to what the server rendered.
export {
  claimRootAttribute,
  claimRootAttributeSet,
  claimRootClass,
  claimRootStyleProperty,
  composeRootAttributeReleases,
} from './infrastructure/runtime/foundation/root-attributes';
export type {
  ReleaseRootAttribute,
  RootAttributeSetClaim,
} from './infrastructure/runtime/foundation/root-attributes';

// ============================================
// NAVIGATION (framework-agnostic Link adapter)
// ============================================
export * from './infrastructure/runtime/adapters/presentation/react/navigation';

// ============================================
// FOCUS MODE (framework-agnostic focus-state adapter)
// ============================================
export * from './infrastructure/runtime/adapters/presentation/react/focus-mode';

// ============================================
// REACT HOOKS (stable runtime facade)
// ============================================
export * from './infrastructure/runtime/facade';

// ============================================
// UTILS
// ============================================
export {
  createSubComponent,
  createCompoundComponent,
} from './infrastructure/runtime/adapters/presentation/react/compound-components';
export type { PolymorphicProps } from './infrastructure/runtime/adapters/presentation/react/compound-components';
export { warnInDev, warnOnceInDev, errorInDev } from './infrastructure/runtime/foundation/diagnostics/development-logging';
export {
  arePropsEqual,
  createPropsComparator,
} from './foundation/kernel/performance';

// ============================================
// ICONS
// ============================================
// Icons live behind a dedicated subpath so the root export does not pull
// the icon catalog into every consumer bundle.
//
// `@rottay/design-system/icons` exports the supplier-independent semantic
// Icon facade plus the temporary named-icon compatibility catalog.
// Product code should use semantic names; suppliers stay behind adapters.
//
// Neither catalog is re-exported from this root barrel.

// Brand/provider marks are a distinct asset class under
// `@rottay/design-system/marks`. They are also intentionally absent here so
// root consumers cannot load the pinned mark renderer by accident.

// ============================================
// TENANCY (schema, registry, resolver, storage, CSS generation)
// ============================================
export * from './infrastructure/runtime/tenant';

// ============================================
// PRODUCT PROFILES (registry, provider, hooks)
// ============================================
export * from './infrastructure/runtime/product-profiles';

// ============================================
// VERTICALS (presets, registry, types)
// ============================================
export * from './infrastructure/runtime/verticals';

// ============================================
// COMPILERS (brand-theme bridge, shared color math)
// ============================================
export * from './infrastructure/compilers';

// Client-safe artifact->DOM projections: the browser hydration path restamps
// these attributes on artifact refresh, so they ship from the main entrypoint,
// not only from ./server with the compile/parse family.
export {
  tenantThemeArtifactRootAttributes,
  tenantThemeAnatomyAttributes,
} from './infrastructure/compilers/composition/tenant-theme';

// ============================================
// BRAND THEMES (first-party authored BrandTheme sources)
// ============================================
// Consumers (and the in-app artifact drift test) resolve the canonical vertical
// BrandTheme from here; the CSS artifact is a generated projection of these.
export { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } from './foundation/tokens/ts/presentation/brand-themes';

// ============================================
// I18N (locales, provider, hooks)
// ============================================
export * from './infrastructure/runtime/i18n';

// ============================================
// MOTION (animations, effects, hooks)
// ============================================
// Keep the root's legacy primitives/effects barrel explicit. The focused
// package entry also emits `dist/motion.d.ts`; a bare `./motion` declaration
// re-export would resolve to that file after packing and shadow the
// `dist/motion/index.d.ts` directory barrel.
export * from './graphics/motion';

// ============================================
// COMPONENTS
// ============================================
export * from './ui';
