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
export * from './runtime/engines';
export { ThemeProvider, ThemeContext } from './runtime/theming';
export type { ThemeProviderProps, ThemeConfig, ThemeContextValue } from './runtime/theming';
export * from './runtime/features';
export * from './runtime/bootstrap';
export * from './contracts';

// ============================================
// ERROR HANDLING (public API, hosted in _internal for structural clarity)
// ============================================
export { ErrorHandler } from './_internal/errors';
export { useErrorHandler } from './_internal/errors';
export { ErrorCategory, ErrorSeverity } from './_internal/errors';
export type { DSError, DSErrorInput, ErrorSubscriber, UseErrorHandlerOptions, UseErrorHandlerReturn } from './_internal/errors';

// ============================================
// PROVIDERS (ResponsiveProvider, etc.)
// ============================================
export * from './runtime/responsive';

// ============================================
// NAVIGATION (framework-agnostic Link adapter)
// ============================================
export * from './runtime/adapters/navigation';

// ============================================
// FOCUS MODE (framework-agnostic focus-state adapter)
// ============================================
export * from './runtime/adapters/focus-mode';

// ============================================
// HOOKS (promoted from core/hooks/)
// ============================================
export * from './hooks';

// ============================================
// UTILS (public helpers, hosted in _internal for structural clarity)
// ============================================
export { createSubComponent, createCompoundComponent } from './_internal/utils';
export type { PolymorphicProps } from './_internal/utils';
export { warnInDev, warnOnceInDev, errorInDev } from './_internal/utils';
export { arePropsEqual, createPropsComparator } from './_internal/utils';

// ============================================
// ICONS
// ============================================
// Icons live behind a dedicated subpath so the root export does not pull
// the icon catalog into every consumer bundle.
//
// `@rottay/design-system/icons` exports the DS's own curated icon set:
// BaseIcon, UserIcon, ChevronDownIcon, SearchIcon, and a few more.
// The set is intentionally small.
//
// For the full Ant Design icon catalog, import directly from
// `@ant-design/icons` — it is a peer dependency of the DS and is always
// installed in consuming apps.
//
// Neither catalog is re-exported from this root barrel.

// ============================================
// TENANCY (schema, registry, resolver, storage, CSS generation)
// ============================================
export * from './runtime/tenant';

// ============================================
// PRODUCT PROFILES (registry, provider, hooks)
// ============================================
export * from './runtime/product-profiles';

// ============================================
// VERTICALS (presets, registry, types)
// ============================================
export * from './runtime/verticals';

// ============================================
// COMPILERS (brand-theme bridge, shared color math)
// ============================================
export * from './compilers';

// ============================================
// BRAND THEMES (first-party authored BrandTheme sources)
// ============================================
// Consumers (and the in-app artifact drift test) resolve the canonical vertical
// BrandTheme from here; the CSS artifact is a generated projection of these.
export { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } from './tokens/ts/brand-themes';

// ============================================
// I18N (locales, provider, hooks)
// ============================================
export * from './i18n';

// ============================================
// MOTION (animations, effects, hooks)
// ============================================
export * from './motion';

// ============================================
// COMPONENTS
// ============================================
export * from './components/primitives';
export * from './components/patterns';
export * from './components/structures';
export * from './components/surfaces';
