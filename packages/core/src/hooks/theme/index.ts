'use client';

/**
 * @fileoverview useTheme Hook - Rottay Design System
 * @description React hook for accessing and controlling the current theme variant,
 * supporting light/dark modes and custom tenant themes.
 *
 * @remarks
 * The useTheme hook provides:
 * - **Theme access**: Get current theme name (light, dark, custom)
 * - **Theme switching**: Change theme at runtime
 * - **Full config**: Access complete theme configuration
 * - **Tenant awareness**: Respects tenant-specific theme settings
 *
 * @example Basic theme toggle
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, setTheme } = useTheme();
 *   return (
 *     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Current: {theme}
 *     </button>
 *   );
 * }
 * ```
 *
 * @see {@link ThemeProvider} - Provider component
 * @see {@link ThemeContextValue} - Context value type
 * @module System/Hooks/Theme
 * @category System
 * @package @rottay/design-system
 */
import { useContext } from 'react';
import { ThemeContext } from '../../core/providers/theme';
import type { ThemeContextValue } from '../../core/types';

/**
 * Hook to access and control the current theme.
 *
 * Provides access to the current theme name, a function to change the theme,
 * and the full theme configuration object. Supports both light and dark modes
 * as well as custom themes defined by the tenant.
 *
 * @example
 * ```tsx
 * import { useTheme } from '@rottay/design-system';
 *
 * function ThemeToggle() {
 *   const { theme, setTheme, config } = useTheme();
 *
 *   const toggleTheme = () => {
 *     setTheme(theme === 'light' ? 'dark' : 'light');
 *   };
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 *
 * @returns Object containing theme state and controls
 * @returns {string} returns.theme - The current theme name (e.g., 'light', 'dark')
 * @returns {Function} returns.setTheme - Function to change the current theme
 * @returns {ThemeConfig | null} returns.config - The full theme configuration object
 *
 * @throws {Error} Throws an error if used outside of a ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Re-export for backwards compatibility
export { useTheme as useThemeContext };
