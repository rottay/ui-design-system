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
export * from './runtime/providers';

// ============================================
// NAVIGATION (framework-agnostic Link adapter)
// ============================================
export * from './runtime/navigation';

// ============================================
// FOCUS MODE (framework-agnostic focus-state adapter)
// ============================================
export * from './runtime/focus-mode';

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
// the icon catalog into every consumer bundle (and to avoid `export *`
// across the client boundary).
//
// Two real entry points exist for icons:
//
// - `@rottay/design-system/icons` — the DS's own curated icon set
//   (BaseIcon plus a small set of branded helpers like UserIcon,
//   ChevronDownIcon, SearchIcon, ...). Use this when you want the icons
//   the DS itself uses; the set is intentionally small.
//
// - `@ant-design/icons` — the full Ant Design icon catalog. This is a
//   peer dependency of the DS (the Classic engine consumes it directly),
//   so it is always installed in every consuming app and is safe to
//   import directly when the curated DS set does not have what you need.
//
// There is no `import { Icon } from '@rottay/design-system'` — neither
// catalog is re-exported from the root barrel.

// ============================================
// TENANCY (schema, registry, resolver, storage, CSS generation)
// ============================================
export * from './runtime/tenancy';

// ============================================
// PRODUCT PROFILES (registry, provider, hooks)
// ============================================
export * from './runtime/product-profiles';

// ============================================
// VERTICALS (presets, registry, types)
// ============================================
export * from './runtime/verticals';

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
export * from './components/chrome';
export * from './components/surfaces';
