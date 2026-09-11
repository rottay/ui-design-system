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
import { useTenantContext as useTenant } from '../../../../tenant/foundation/context';
import { useProductProfileContext as useProductProfile } from '../../../../product-profiles';
import { useEngineContext } from '../../../../engines';
import { useEngineVisualDeclaration } from '../../../../foundation/engine-visual';
import { resolveAdapter } from '@/infrastructure/compilers/runtime/theme/presentation/adapters/facade/registry';
import { DEFAULT_PERSONALITY } from '../../../../personality/foundation/defaults';
import { resolveChartPersonality } from '../../../../personality/runtime/resolution/chart';
import { resolveEffectiveDensityScale } from '@/foundation/tokens/ts/foundation/base/density';
import type { DesignTokens, ColorScale, GlassTokens, GradientTokens, TransitionTokens, OverlayTokens, PersonalityTokens } from '@/foundation/contracts';

export { DEFAULT_PERSONALITY } from '../../../../personality/foundation/defaults';

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
// Color scales are built once as CSS variable references rather than resolved
// values. Actual color values live in the tenant CSS file so they can be swapped
// at runtime without re-rendering the React tree.
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

// Pre-computed once at module load. These are CSS variable strings (not actual
// colors), so they are safe to share across all tenants and engine combinations.
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
  const { config, vertical, appearance } = useTenant();
  const { profile } = useProductProfile();
  const { engine } = useEngineContext();
  // THE TENANT LAYER, from the compile that produced the mounted artifact.
  // `ThemeCompilation.runtime` is the non-CSS half of that one lowering, so the
  // numbers this hook returns and the variables the artifact paints are two
  // projections of the same answer. There is no second merge here: a tenant
  // that publishes no artifact contributes no tenant layer, which is the honest
  // reading of "nothing was compiled for this tenant".
  const compiled = useEngineVisualDeclaration()?.runtime;

  return useMemo(() => {
    // -- Token Resolution Pipeline --
    //
    //   engine -> vertical -> product profile -> compiled tenant layer
    //
    // The product profile is a UX PRESET; the compiled layer is the tenant's
    // own published decision, so it goes last. Layering rather than switching
    // is deliberate: the choice has to turn on whether a channel was DECIDED,
    // not on whether a declaration object exists, and a compile that states
    // nothing on a channel must leave the preset underneath it standing.

    // 1. Engine base tokens. `resolveAdapter` is the single door: an engine
    // with no adapter has no baseline and is refused rather than substituted.
    const engineOverrides = resolveAdapter(engine).tokenBaseline;

    // 2. Vertical structural overrides.
    const verticalTokenOverrides = vertical?.tokenOverrides;
    const verticalBorderRadius = verticalTokenOverrides?.borderRadius
      ? { ...engineOverrides.borderRadius, ...verticalTokenOverrides.borderRadius }
      : engineOverrides.borderRadius;
    const verticalShadows = verticalTokenOverrides?.shadows
      ? { ...engineOverrides.shadows, ...verticalTokenOverrides.shadows }
      : engineOverrides.shadows;
    const verticalSurface = verticalTokenOverrides?.surface
      ? { ...engineOverrides.surface, ...verticalTokenOverrides.surface }
      : engineOverrides.surface;
    const verticalMotion = verticalTokenOverrides?.motion
      ? { ...engineOverrides.motion, ...verticalTokenOverrides.motion }
      : engineOverrides.motion;
    const verticalDensityScale = verticalTokenOverrides?.densityScale ?? engineOverrides.densityScale;

    // 3. Product-profile preset, then the compiled tenant layer over it.
    const profileOverrides = profile.tokenOverrides;
    const compiledOverrides = compiled?.tokenOverrides;
    const borderRadius = {
      ...verticalBorderRadius,
      ...profileOverrides?.borderRadius,
      ...compiledOverrides?.borderRadius,
    };
    const shadows = {
      ...verticalShadows,
      ...profileOverrides?.shadows,
      ...compiledOverrides?.shadows,
    };
    const surface = {
      ...verticalSurface,
      ...profileOverrides?.surface,
      ...compiledOverrides?.surface,
    };
    const motion = {
      ...verticalMotion,
      ...profileOverrides?.motion,
      ...compiledOverrides?.motion,
    };
    // Appearance density is a semantic factor composed AFTER the structural
    // resolution. The canonical resolver is also the source for the CSS
    // mode-factor channel, preventing JS/CSS drift.
    const densityScale = resolveEffectiveDensityScale(
      compiledOverrides?.densityScale ?? profileOverrides?.densityScale ?? verticalDensityScale,
      appearance?.general?.density,
    );

    // 4. Personality, on the same order. Each sub-object is spread
    // independently so customizing one dimension does not wipe out another.
    const verticalPersonality = vertical?.personality;
    const profilePersonality = profile.personality;
    const compiledPersonality = compiled?.personality;
    const personality: PersonalityTokens = {
      animation: { ...DEFAULT_PERSONALITY.animation, ...verticalPersonality?.animation, ...profilePersonality?.animation, ...compiledPersonality?.animation },
      chart: resolveChartPersonality({
        compiled: compiledPersonality,
        vertical,
        productProfile: profile,
      }),
      typography: { ...DEFAULT_PERSONALITY.typography, ...verticalPersonality?.typography, ...profilePersonality?.typography, ...compiledPersonality?.typography },
      accent: { ...DEFAULT_PERSONALITY.accent, ...verticalPersonality?.accent, ...profilePersonality?.accent, ...compiledPersonality?.accent },
      card: { ...DEFAULT_PERSONALITY.card, ...verticalPersonality?.card, ...profilePersonality?.card, ...compiledPersonality?.card },
    };

    return {
      colors: {
        // Single-value color tokens remain for backward compatibility with older
        // consumers that read `tokens.colors.primary` directly. The canonical
        // source of truth is the CSS variable-backed scale objects below, which
        // the mounted artifact paints.
        primary: 'var(--ds-color-primary)',
        secondary: 'var(--ds-color-secondary)',
        success: 'var(--ds-color-success)',
        warning: 'var(--ds-color-warning)',
        error: 'var(--ds-color-error)',
        info: 'var(--ds-color-info)',

        // Full color scales are what enable tenant theming without rewriting
        // component code. They are consumed indirectly through CSS variables.
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
      // Spacing values are density-scaled at resolution time rather than via
      // CSS calc() because components consume them as numeric pixel values
      // for style objects and layout calculations.
      //
      // IMPORTANT: this array is provider-global (structural scale x tenant
      // appearance). It cannot observe a descendant `data-density` boundary.
      // Components that promise subtree-local density must consume the CSS
      // `--ds-spacing-*` ramp instead. A future DensityScope context is required
      // before numeric JS layout can claim the same local override semantics.
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
      // Engine-differentiated tokens (with the compiled tenant layer)
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
  // `config.slug` stands in for "the whole tenant changed"; the compiled
  // declaration and the appearance read-model are the only other inputs, and
  // the density scalar is tracked rather than the whole appearance object so a
  // stable object reference with a changed field cannot serve a stale memo.
  }, [
    engine,
    config.slug,
    compiled,
    appearance?.general?.density,
    profile,
    vertical,
  ]);
}

/**
 * Non-throwing variant of `useTokens`. Returns `null` instead of throwing
 * when called outside the required provider tree. Useful in shared
 * components that may render in both DS-wrapped and standalone contexts.
 *
 * @returns The resolved design tokens, or `null` if the provider is missing
 */
export function useOptionalTokens(): DesignTokens | null {
  // The try/catch approach is intentional here. React hooks cannot be called
  // conditionally, so we cannot check for the provider before calling useTokens.
  // The catch path handles the thrown "must be used within Provider" error.
  try {
    return useTokens();
  } catch {
    return null;
  }
}
