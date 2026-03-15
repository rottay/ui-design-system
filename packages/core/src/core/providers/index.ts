/**
 * @fileoverview System Providers - Rottay Design System
 * @description Central exports for all React context providers that power the
 * multi-engine, multi-tenant, and feature-flagged architecture.
 *
 * @remarks
 * The Rottay Design System uses a layered provider architecture:
 *
 * - **DesignSystemProvider**: Root provider that composes all others
 * - **EngineProvider**: Manages UI rendering engine (Classic, Modern, Rustic)
 * - **ThemeProvider**: Handles theme variants and CSS token injection
 * - **TenantProvider**: Multi-tenant configuration and branding
 * - **FeatureProvider**: Feature flags for progressive rollout
 *
 * Context hooks are exported from ./hooks to avoid duplicate exports.
 *
 * @example Complete provider setup
 * ```tsx
 * import { DesignSystemProvider } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <DesignSystemProvider
 *       engine="classic"
 *       tenant="rottay"
 *       theme="light"
 *     >
 *       <YourApplication />
 *     </DesignSystemProvider>
 *   );
 * }
 * ```
 *
 * @example Individual providers
 * ```tsx
 * import { ThemeProvider, EngineProvider } from '@rottay/design-system';
 *
 * <EngineProvider defaultEngine="modern">
 *   <ThemeProvider tenant="acme" theme="dark">
 *     <App />
 *   </ThemeProvider>
 * </EngineProvider>
 * ```
 *
 * @see {@link DesignSystemProvider} - Root provider
 * @see {@link EngineProvider} - Engine context
 * @see {@link ThemeProvider} - Theme context
 * @module System/Providers
 * @category System
 * @package @rottay/design-system
 */

export { EngineProvider, EngineContext } from '../../engines/EngineProvider';
export type { EngineProviderProps } from '../../engines/EngineProvider';

export { ThemeProvider, ThemeContext } from '../../theming';
export type { ThemeProviderProps } from '../../theming';

// TenantProvider -- exported from src/tenancy/, not re-exported here
// ProductProfileProvider -- exported from src/product-profiles/, not re-exported here

export { FeatureProvider, FeatureContext } from '../../features';
export type { FeatureProviderProps } from '../../features';

export { DesignSystemProvider } from './root';
export type { DesignSystemProviderProps } from './root';
