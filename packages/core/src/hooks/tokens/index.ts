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
 * All color values use CSS custom properties (var(--ds-color-*)) for
 * white-labeling support. Tenants override the CSS variables the runtime
 * system actually consumes.
 *
 * @see {@link DesignTokens} - Token structure
 * @module System/Hooks/Tokens
 * @category System
 * @package @rottay/design-system
 */

import { useMemo } from 'react';
import { useTenant } from '../tenant';
import { useProductProfile } from '../product-profile';
import { useEngineContext } from '../../engines';
import { getEngineTokens } from './engine-tokens';
import { DEFAULT_PERSONALITY } from './personality-defaults';
import type { DesignTokens, ColorScale, GlassTokens, GradientTokens, TransitionTokens, OverlayTokens, PersonalityTokens } from '../../contracts';

export { getEngineTokens, ENGINE_TOKENS } from './engine-tokens';
export type { EngineTokenOverrides } from './engine-tokens';
export { DEFAULT_PERSONALITY } from './personality-defaults';

// Granular sub-hooks for subscribing to specific token slices
export {
  useColorTokens,
  useSpacingTokens,
  useMotionTokens,
  useTypographyTokens,
  useCardTokens,
  useAccentTokens,
} from './sub-hooks';
export type {
  ColorTokens,
  SpacingTokens,
  MotionTokenSlice,
  TypographyTokenSlice,
  CardTokens,
  AccentTokens,
} from './sub-hooks';

/**
 * Creates a CSS variable-based color scale for a semantic color category.
 * These reference CSS custom properties that tenants can override.
 */
function createColorScale(prefix: string): ColorScale {
  return {
    50: `var(--ds-color-${prefix}-50)`,
    100: `var(--ds-color-${prefix}-100)`,
    200: `var(--ds-color-${prefix}-200)`,
    300: `var(--ds-color-${prefix}-300)`,
    400: `var(--ds-color-${prefix}-400)`,
    500: `var(--ds-color-${prefix}-500)`,
    600: `var(--ds-color-${prefix}-600)`,
    700: `var(--ds-color-${prefix}-700)`,
    800: `var(--ds-color-${prefix}-800)`,
    900: `var(--ds-color-${prefix}-900)`,
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

// Pre-computed overlay tokens (static)
const OVERLAY_TOKENS: OverlayTokens = {
  light: 'var(--ds-overlay-light)',
  medium: 'var(--ds-overlay-medium)',
  heavy: 'var(--ds-overlay-heavy)',
  white: 'var(--ds-overlay-white)',
  whiteMedium: 'var(--ds-overlay-white-medium)',
  whiteLight: 'var(--ds-overlay-white-light)',
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
  const { profile } = useProductProfile();
  const { engine } = useEngineContext();

  return useMemo(() => {
    // 1. Engine base tokens
    const engineOverrides = getEngineTokens(engine);

    // 2. Product profile token overrides on top of engine
    const productProfileTokenOverrides = profile.tokenOverrides;
    const productProfileBorderRadius = productProfileTokenOverrides?.borderRadius
      ? { ...engineOverrides.borderRadius, ...productProfileTokenOverrides.borderRadius }
      : engineOverrides.borderRadius;
    const productProfileShadows = productProfileTokenOverrides?.shadows
      ? { ...engineOverrides.shadows, ...productProfileTokenOverrides.shadows }
      : engineOverrides.shadows;
    const productProfileSurface = productProfileTokenOverrides?.surface
      ? { ...engineOverrides.surface, ...productProfileTokenOverrides.surface }
      : engineOverrides.surface;
    const productProfileMotion = productProfileTokenOverrides?.motion
      ? { ...engineOverrides.motion, ...productProfileTokenOverrides.motion }
      : engineOverrides.motion;
    const productProfileDensityScale = productProfileTokenOverrides?.densityScale ?? engineOverrides.densityScale;

    // 3. Tenant token overrides on top of the product profile.
    const tenantTokenOverrides = config.tokenOverrides;
    const borderRadius = tenantTokenOverrides?.borderRadius
      ? { ...productProfileBorderRadius, ...tenantTokenOverrides.borderRadius }
      : productProfileBorderRadius;
    const shadows = tenantTokenOverrides?.shadows
      ? { ...productProfileShadows, ...tenantTokenOverrides.shadows }
      : productProfileShadows;
    const surface = tenantTokenOverrides?.surface
      ? { ...productProfileSurface, ...tenantTokenOverrides.surface }
      : productProfileSurface;
    const motion = tenantTokenOverrides?.motion
      ? { ...productProfileMotion, ...tenantTokenOverrides.motion }
      : productProfileMotion;
    const densityScale = tenantTokenOverrides?.densityScale ?? productProfileDensityScale;

    // 4. Personality: defaults + product profile + tenant overrides.
    const productPersonality = profile.personality;
    const tenantPersonality = config.personality;
    const personality: PersonalityTokens = {
      animation: {
        ...DEFAULT_PERSONALITY.animation,
        ...productPersonality?.animation,
        ...tenantPersonality?.animation,
      },
      chart: {
        ...DEFAULT_PERSONALITY.chart,
        ...productPersonality?.chart,
        ...tenantPersonality?.chart,
      },
      typography: {
        ...DEFAULT_PERSONALITY.typography,
        ...productPersonality?.typography,
        ...tenantPersonality?.typography,
      },
      accent: {
        ...DEFAULT_PERSONALITY.accent,
        ...productPersonality?.accent,
        ...tenantPersonality?.accent,
      },
      card: {
        ...DEFAULT_PERSONALITY.card,
        ...productPersonality?.card,
        ...tenantPersonality?.card,
      },
    };

    return {
      colors: {
        // Single values (backwards compatible, from tenant branding)
        primary: config.branding.primaryColor || 'var(--ds-color-primary)',
        secondary:
          config.branding.secondaryColor ||
          config.branding.accentColor ||
          'var(--ds-color-secondary)',
        success: 'var(--ds-color-success)',
        warning: 'var(--ds-color-warning)',
        error: 'var(--ds-color-error)',
        info: 'var(--ds-color-info)',

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
          white: 'var(--ds-color-white)',
          black: 'var(--ds-color-black)',
        },
      },
      spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map(
        v => Math.round(v * densityScale)
      ),
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
      // Engine-differentiated tokens (with tenant overrides)
      borderRadius,
      shadows,
      surface,
      motion,
      // Static tokens
      glass: GLASS_TOKENS,
      gradients: GRADIENT_TOKENS,
      transitions: TRANSITION_TOKENS,
      overlay: OVERLAY_TOKENS,
      // Personality tokens
      personality,
    };
  }, [
    engine,
    config.slug,
    config.tokenOverrides,
    config.personality,
    config.branding.primaryColor,
    config.branding.secondaryColor,
    config.branding.accentColor,
    profile,
  ]);
}

export function useOptionalTokens(): DesignTokens | null {
  try {
    return useTokens();
  } catch {
    return null;
  }
}
