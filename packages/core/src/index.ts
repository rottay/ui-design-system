/**
 * Rottay Design System
 * Multi-tenant, multi-engine UI component library
 *
 * @packageDocumentation
 */

// ============================================
// TYPES
// ============================================
export * from './types';

// ============================================
// SYSTEM (Providers, Hooks, Engines)
// ============================================
export * from './system';

// ============================================
// CONFIGURATION (Tenants, Themes, Tokens)
// ============================================
export * from './config';

// ============================================
// ERRORS
// ============================================
export * from './errors';

// ============================================
// UTILITIES
// ============================================
export * from './utils';

// ============================================
// COMPONENTS
// ============================================

// Primitives
export * from './components/primitives';

// Custom Components
export * from './components/custom';

// ============================================
// CONVENIENCE RE-EXPORTS
// ============================================
// Note: Most exports are already available via `export * from './system'` and `export * from './config'`.
// The following are explicit re-exports for discoverability and backward compatibility.

// Main Provider (most commonly used) - already exported via ./system
// export { DesignSystemProvider } from './system/providers/root';
// export type { DesignSystemProviderProps } from './system/providers/root';

// Individual Providers (for standalone use) - already exported via ./system
// export { ThemeProvider } from './system/providers/theme';
// export type { ThemeProviderProps } from './system/providers/theme';

// Common Hooks - already exported via ./system/hooks
// useEngineContext, useThemeContext, useTenantContext, useFeatureContext
// useTenant, useTokens, useTheme

// Engine utilities - already exported via ./system/engines
// getEngine, getAvailableEngines, getStableEngines, isValidEngine, getDefaultEngine, ENGINE_REGISTRY

// Tenant utilities - already exported via ./config/tenants
// resolveTenant, getTenantConfig, configureTenantApi, configureDomainLookup, DEFAULT_TENANT_CONFIG, getDefaultTenantConfig

// Theme utilities - already exported via ./config/themes
// getThemePreset, getAvailableThemes, extendTheme, foundationTheme
