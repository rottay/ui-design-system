/**
 * @fileoverview useTokens Hook - Rottay Design System
 * @description React hook for accessing design tokens (colors, spacing,
 * typography) with automatic tenant-specific overrides.
 *
 * @remarks
 * The useTokens hook provides:
 * - **Colors**: Primary, secondary, neutral, and semantic colors
 * - **Spacing**: Consistent spacing scale (0-96px)
 * - **Typography**: Font sizes, weights, and line heights
 * - **Border radius**: From none to full (pill)
 * - **Shadows**: Elevation levels (sm, md, lg, xl)
 *
 * Tokens are automatically merged with tenant branding overrides.
 *
 * @example Custom styled component
 * ```tsx
 * function Card() {
 *   const tokens = useTokens();
 *   return (
 *     <div style={{
 *       padding: tokens.spacing[4],
 *       borderRadius: tokens.borderRadius.lg,
 *       boxShadow: tokens.shadows.md,
 *     }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link DesignTokens} - Token structure
 * @module System/Hooks/Tokens
 * @category System
 * @package @rottay/design-system
 */

import { useTenant } from '../tenant';
import type { DesignTokens } from '../../../types';

/**
 * Hook to access design tokens with tenant-specific overrides.
 *
 * Returns a complete set of design tokens (colors, spacing, typography, etc.)
 * that are merged with any tenant-specific overrides. This ensures consistent
 * styling while allowing tenant customization.
 *
 * @example
 * ```tsx
 * import { useTokens } from '@rottay/design-system';
 *
 * function CustomCard() {
 *   const tokens = useTokens();
 *
 *   return (
 *     <div style={{
 *       backgroundColor: tokens.colors.neutral[100],
 *       padding: tokens.spacing[4],
 *       borderRadius: tokens.borderRadius.lg,
 *       boxShadow: tokens.shadows.md,
 *       fontSize: tokens.typography.fontSize.md,
 *     }}>
 *       Custom styled content
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {DesignTokens} Object containing all design tokens
 * @returns {Object} returns.colors - Color palette including primary, secondary, neutral, and semantic colors
 * @returns {number[]} returns.spacing - Spacing scale array (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)
 * @returns {Object} returns.typography - Typography settings (fontSize, fontWeight, lineHeight)
 * @returns {Object} returns.borderRadius - Border radius values (none, sm, md, lg, xl, full)
 * @returns {Object} returns.shadows - Box shadow values (sm, md, lg, xl)
 */
export function useTokens(): DesignTokens {
  const { config } = useTenant();

  // Return design tokens with tenant overrides
  const tokens: DesignTokens = {
    colors: {
      primary: config.branding.primaryColor || '#1890ff',
      secondary: config.branding.accentColor || '#6366f1',
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      },
      // Semantic colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
    typography: {
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
  };

  return tokens;
}
