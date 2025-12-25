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
// COMPONENTS
// ============================================

// Primitives
export * from './components/primitives';

// Custom Components
export * from './components/custom';

// ============================================
// CONVENIENCE RE-EXPORTS
// ============================================

// Main Provider (most commonly used)
export { DesignSystemProvider } from './system/providers/root';
export type { DesignSystemProviderProps } from './system/providers/root';

// Individual Providers (for standalone use)
export { ThemeProvider } from './system/providers/theme';
export type { ThemeProviderProps } from './system/providers/theme';

// Common Hooks - Provider Contexts
export { useEngineContext } from './system/providers/engine';
export { useThemeContext } from './system/providers/theme';
export { useTenantContext } from './system/providers/tenant';
export { useFeatureContext } from './system/providers/features';

// Common Hooks - Utilities
export { useTenant } from './system/hooks/tenant';
export { useTokens } from './system/hooks/tokens';
export { useTheme } from './system/hooks/theme';

// Engine utilities
export {
  getEngine,
  getAvailableEngines,
  getStableEngines,
  isValidEngine,
  getDefaultEngine,
  ENGINE_REGISTRY
} from './system/engines/registry';

// Tenant utilities
export {
  resolveTenant,
  getTenantConfig,
  configureTenantApi,
  configureDomainLookup,
  DEFAULT_TENANT_CONFIG,
  getDefaultTenantConfig,
} from './config/tenants';

// Theme utilities
export {
  getThemePreset,
  getAvailableThemes,
  extendTheme,
  foundationTheme,
} from './config/themes';
