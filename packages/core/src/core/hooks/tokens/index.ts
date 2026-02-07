/**
 * @fileoverview useTokens Hook - Rottay Design System
 * @description React hook for accessing design tokens (colors, spacing,
 * typography) with automatic tenant-specific overrides and engine differentiation.
 *
 * @remarks
 * The useTokens hook provides:
 * - **Colors**: Primary, secondary, neutral, and semantic color scales
 * - **Spacing**: Consistent spacing scale (0-96px)
 * - **Typography**: Font sizes, weights, and line heights
 * - **Border radius**: Engine-differentiated (classic=sharp, modern=round, rustic=minimal)
 * - **Shadows**: Engine-differentiated (classic=corporate, modern=bold, rustic=whisper)
 * - **Surface**: Engine-differentiated container appearance
 * - **Motion**: Engine-differentiated animation behavior
 *
 * All color values use CSS custom properties (var(--color-*)) for
 * white-labeling support. Tenants override the CSS variables.
 *
 * @see {@link DesignTokens} - Token structure
 * @module System/Hooks/Tokens
 * @category System
 * @package @rottay/design-system
 */

import { useTenant } from '../tenant';
import { useEngineContext } from '../../providers/engine';
import { getEngineTokens } from './engine-tokens';
import type { DesignTokens, ColorScale, GlassTokens, GradientTokens, TransitionTokens } from '../../types';

export { getEngineTokens, ENGINE_TOKENS } from './engine-tokens';
export type { EngineTokenOverrides } from './engine-tokens';

/**
 * Creates a CSS variable-based color scale for a semantic color category.
 * These reference CSS custom properties that tenants can override.
 */
function createColorScale(prefix: string): ColorScale {
  return {
    50: `var(--color-${prefix}-50)`,
    100: `var(--color-${prefix}-100)`,
    200: `var(--color-${prefix}-200)`,
    300: `var(--color-${prefix}-300)`,
    400: `var(--color-${prefix}-400)`,
    500: `var(--color-${prefix}-500)`,
    600: `var(--color-${prefix}-600)`,
    700: `var(--color-${prefix}-700)`,
    800: `var(--color-${prefix}-800)`,
    900: `var(--color-${prefix}-900)`,
  };
}

// Pre-computed color scales (static, shared across all instances)
const PRIMARY_SCALE = createColorScale('primary');
const SECONDARY_SCALE = createColorScale('secondary');
const NEUTRAL_SCALE = createColorScale('neutral');
const SUCCESS_SCALE = createColorScale('success');
const WARNING_SCALE = createColorScale('warning');
const ERROR_SCALE = createColorScale('error');
const INFO_SCALE = createColorScale('info');

// Pre-computed glass tokens (static)
const GLASS_TOKENS: GlassTokens = {
  blur: 'var(--ds-glass-blur)',
  blurSm: 'var(--ds-glass-blur-sm)',
  blurLg: 'var(--ds-glass-blur-lg)',
  blurXl: 'var(--ds-glass-blur-xl)',
  bg: 'var(--ds-glass-bg)',
  bgLight: 'var(--ds-glass-bg-light)',
  bgHeavy: 'var(--ds-glass-bg-heavy)',
  border: 'var(--ds-glass-border)',
  borderLight: 'var(--ds-glass-border-light)',
  borderHeavy: 'var(--ds-glass-border-heavy)',
};

// Pre-computed gradient tokens (static)
const GRADIENT_TOKENS: GradientTokens = {
  primary: 'var(--ds-gradient-primary)',
  primarySoft: 'var(--ds-gradient-primary-soft)',
  surface: 'var(--ds-gradient-surface)',
  dark: 'var(--ds-gradient-dark)',
  mesh: 'var(--ds-gradient-mesh)',
};

// Pre-computed transition tokens (static)
const TRANSITION_TOKENS: TransitionTokens = {
  fast: 'var(--ds-transition-fast)',
  normal: 'var(--ds-transition-normal)',
  slow: 'var(--ds-transition-slow)',
  slower: 'var(--ds-transition-slower)',
  spring: 'var(--ds-transition-spring)',
};

/**
 * Hook to access design tokens with tenant-specific overrides and engine differentiation.
 *
 * Returns a complete set of design tokens where borderRadius, shadows, surface, and motion
 * are automatically differentiated based on the active engine (classic/modern/rustic).
 *
 * @example
 * ```tsx
 * import { useTokens } from '@rottay/design-system';
 *
 * function Card() {
 *   const tokens = useTokens();
 *   return (
 *     <div style={{
 *       borderRadius: tokens.borderRadius.lg,
 *       boxShadow: tokens.shadows.md,
 *       border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
 *       transition: tokens.motion.hover,
 *     }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {DesignTokens} Object containing all design tokens
 */
export function useTokens(): DesignTokens {
  const { config } = useTenant();
  const { engine } = useEngineContext();
  const engineOverrides = getEngineTokens(engine);

  const tokens: DesignTokens = {
    colors: {
      // Single values (backwards compatible, from tenant branding)
      primary: config.branding.primaryColor || 'var(--color-primary-500)',
      secondary: config.branding.accentColor || 'var(--color-secondary-500)',
      success: 'var(--color-success-500)',
      warning: 'var(--color-warning-500)',
      error: 'var(--color-error-500)',
      info: 'var(--color-info-500)',

      // Full color scales (CSS custom properties for white-labeling)
      primaryScale: PRIMARY_SCALE,
      secondaryScale: SECONDARY_SCALE,
      neutral: NEUTRAL_SCALE,
      successScale: SUCCESS_SCALE,
      warningScale: WARNING_SCALE,
      errorScale: ERROR_SCALE,
      infoScale: INFO_SCALE,

      // Common colors
      common: {
        white: 'var(--color-white)',
        black: 'var(--color-black)',
      },
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
    // Engine-differentiated tokens
    borderRadius: engineOverrides.borderRadius,
    shadows: engineOverrides.shadows,
    surface: engineOverrides.surface,
    motion: engineOverrides.motion,
    // Static tokens
    glass: GLASS_TOKENS,
    gradients: GRADIENT_TOKENS,
    transitions: TRANSITION_TOKENS,
  };

  return tokens;
}
