/**
 * @fileoverview System Hooks - Rottay Design System
 * @description Central exports for all React hooks that provide access to the
 * design system's state, configuration, and responsive utilities.
 *
 * @remarks
 * The Rottay Design System provides several categories of hooks:
 *
 * **Engine Hooks:**
 * - `useEngine` / `useEngineContext` - Access current UI rendering engine
 *
 * **Theme Hooks:**
 * - `useTheme` / `useThemeContext` - Access and control theme variants
 *
 * **Tenant Hooks:**
 * - `useTenant` / `useTenantContext` - Access tenant configuration
 *
 * **Feature Hooks:**
 * - `useFeatures` - Get all enabled features
 * - `useHasFeature` - Check if specific feature is enabled
 * - `useFeatureContext` - Full feature context access
 *
 * **Token Hooks:**
 * - `useTokens` - Access design tokens (colors, spacing, etc.)
 *
 * **Responsive Hooks:**
 * - `useMediaQuery` - Subscribe to CSS media queries
 * - `useBreakpoints` - Check current breakpoint (mobile, tablet, desktop)
 * - `useResponsiveValue` - Get responsive values based on breakpoint
 *
 * @example Engine selection
 * ```tsx
 * const { engine, setEngine } = useEngine();
 * setEngine('modern'); // Switch to DaisyUI engine
 * ```
 *
 * @example Theme control
 * ```tsx
 * const { theme, setTheme } = useTheme();
 * setTheme(theme === 'light' ? 'dark' : 'light');
 * ```
 *
 * @example Feature gating
 * ```tsx
 * const hasExport = useHasFeature('export-pdf');
 * if (hasExport) return <ExportButton />;
 * ```
 *
 * @example Responsive design
 * ```tsx
 * const { isMobile, isTablet, isDesktop } = useBreakpoints();
 * const columns = useResponsiveValue({ base: 1, md: 2, lg: 4 });
 * ```
 *
 * @see {@link useEngine} - Engine hook
 * @see {@link useTheme} - Theme hook
 * @see {@link useBreakpoints} - Responsive hook
 * @module System/Hooks
 * @category System
 * @package @rottay/design-system
 */

// Engine hooks
export { useEngine, useEngineContext } from './engine';

// Theme hooks
export { useTheme, useThemeContext } from './theme';

// Tenant hooks
export { useTenant } from './tenant';
// Re-export useTenantContext from provider (single source of truth)
export { useTenantContext } from '../providers/tenant';

// Token hooks
export { useTokens } from './tokens';

// Feature hooks
export { useFeatures, useHasFeature, useFeatureContext } from './features';

// Responsive hooks
export {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from './responsive';
export type {
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from './responsive';

// Component token hooks
export { useCollapseTokens } from './components';
export type {
  UseCollapseTokensOptions,
  UseCollapseTokensResult,
} from './components';
