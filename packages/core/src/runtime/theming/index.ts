/**
 * @fileoverview Theming - Rottay Design System
 * @description Public barrel for runtime theming. Exports the `ThemeProvider`,
 * `ThemeContext`, `useTheme`, and `useThemeContext` so consumers can discover
 * the full theming API from a single import path.
 *
 * @module System/Theming
 * @category System
 * @package @rottay/design-system
 */
export {
  ThemeProvider,
  ThemeContext,
  useThemeContext,
} from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export type { ThemeConfig, ThemeContextValue } from './ThemeProvider';

export { useTheme, useThemeContext as useThemeContextAlias } from './useTheme';

export { hexToOklch, buildDaisyUiColorOverrides } from './hex-to-oklch';
