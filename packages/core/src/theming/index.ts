/**
 * Theming System
 * ThemeProvider, useTheme hook, and context.
 */
export {
  ThemeProvider,
  ThemeContext,
  useThemeContext,
} from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export type { ThemeConfig, ThemeContextValue } from './ThemeProvider';

export { useTheme, useThemeContext as useThemeContextAlias } from './useTheme';
