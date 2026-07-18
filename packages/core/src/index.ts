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
