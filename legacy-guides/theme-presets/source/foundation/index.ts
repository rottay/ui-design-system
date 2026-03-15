/**
 * Foundation Theme
 * Base theme configuration that all themes extend
 */

import type { ThemeConfig } from '../../../core/types';

export const foundationTheme: ThemeConfig = {
  name: 'foundation',
  variables: {
    // Colors
    'color-primary': '#0066CC',
    'color-primary-hover': '#0052A3',
    'color-accent': '#6366F1',
    'color-success': '#22C55E',
    'color-warning': '#F59E0B',
    'color-error': '#EF4444',
    'color-info': '#3B82F6',

    // Typography
    'font-family-base': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    'font-size-base': '1rem',

    // Effects
    'radius-base': '0.375rem',
    'shadow-base': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
};

/**
 * Get foundation CSS variable value
 */
export function getFoundationVariable(name: string): string | undefined {
  return foundationTheme.variables[name];
}
