/**
 * Theme hook - Access and control the current theme
 */
import { useContext } from 'react';
import { ThemeContext } from '../../providers/theme';
import type { ThemeContextValue } from '../../../types';

/**
 * Hook to access the current theme context
 * @throws Error if used outside ThemeProvider
 * @returns { theme: string, setTheme: (theme) => void, config: ThemeConfig | null }
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
