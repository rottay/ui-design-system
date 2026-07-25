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
import { useTenantContext as useTenant } from '../../../../tenant';
import { useProductProfileContext as useProductProfile } from '../../../../product-profiles';
import { useEngineContext } from '../../../../engines';
import { getEngineTokens } from '../../../foundation/engine-tokens';
import { DEFAULT_PERSONALITY } from '../../../../personality/foundation/defaults';
import { resolveChartPersonality } from '../../../../personality/runtime/resolution/chart';
import {
  brandThemeToPersonality,
  brandThemeToTokenOverrides,
} from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { resolveEffectiveDensityScale } from '@/foundation/tokens/ts/foundation/base/density';
import type { DesignTokens, ColorScale, GlassTokens, GradientTokens, TransitionTokens, OverlayTokens, PersonalityTokens } from '@/foundation/contracts';

export { getEngineTokens, ENGINE_TOKENS } from '../../../foundation/engine-tokens';
export type { EngineTokenOverrides } from '../../../foundation/engine-tokens';
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
  const { config, vertical } = useTenant();
  const { profile } = useProductProfile();
  const { engine } = useEngineContext();

  return useMemo(() => {
    // -- Token Resolution Pipeline --
    //
    // Two paths depending on whether the tenant has a BrandTheme:
    //
    // BrandTheme path (target model):
    //   Structural: engine -> vertical.tokenOverrides -> brandTheme.surfaces
    //   Personality: DEFAULT -> vertical.personality -> brandTheme (motion/charts/chrome)
    //   Product profile contributes only surfaceDefaults (UX posture), not visual tokens.
    //
    // Legacy path (backward compatible):
    //   Structural: engine -> vertical.tokenOverrides -> profile.tokenOverrides -> tenant.tokenOverrides
    //   Personality: DEFAULT -> vertical.personality -> profile.personality -> tenant.personality

    const brandTheme = config.brandTheme;
    const hasBrandTheme = !!brandTheme;

    // 1. Engine base tokens -- the visual foundation for classic/modern/rustic
    const engineOverrides = getEngineTokens(engine);

    // 2. Vertical structural overrides (new — previously only personality participated).
    // This closes the asymmetry where vertical influenced personality but not structural tokens.
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

    // 3. Final structural layer — BrandTheme -> Appearance -> tenant overrides
    let borderRadius: typeof verticalBorderRadius;
    let shadows: typeof verticalShadows;
    let surface: typeof verticalSurface;
    let motion: typeof verticalMotion;
    let densityScale: number;

    // Appearance density is a semantic factor composed AFTER the structural
    // BrandTheme/legacy resolution. The canonical resolver is also the source
    // for the CSS mode-factor channel, preventing JS/CSS drift.
    const appearance = config.appearance;

    if (hasBrandTheme) {
      // BrandTheme path: engine -> vertical -> brandTheme -> appearance -> tenant overrides.
      const btOverrides = brandThemeToTokenOverrides(brandTheme);
      const tenantTokenOverrides = config.tokenOverrides;

      const btBorderRadius = btOverrides.borderRadius
        ? { ...verticalBorderRadius, ...btOverrides.borderRadius }
        : verticalBorderRadius;
      const btShadows = btOverrides.shadows
        ? { ...verticalShadows, ...btOverrides.shadows }
        : verticalShadows;
      const btSurface = btOverrides.surface
        ? { ...verticalSurface, ...btOverrides.surface }
        : verticalSurface;
      const btMotion = btOverrides.motion
        ? { ...verticalMotion, ...btOverrides.motion }
        : verticalMotion;
      const btDensityScale = btOverrides.densityScale ?? verticalDensityScale;

      // Tenant overrides are still last-write-wins on top of brandTheme
      borderRadius = tenantTokenOverrides?.borderRadius
        ? { ...btBorderRadius, ...tenantTokenOverrides.borderRadius }
        : btBorderRadius;
      shadows = tenantTokenOverrides?.shadows
        ? { ...btShadows, ...tenantTokenOverrides.shadows }
        : btShadows;
      surface = tenantTokenOverrides?.surface
        ? { ...btSurface, ...tenantTokenOverrides.surface }
        : btSurface;
      motion = tenantTokenOverrides?.motion
        ? { ...btMotion, ...tenantTokenOverrides.motion }
        : btMotion;
      densityScale = resolveEffectiveDensityScale(
        tenantTokenOverrides?.densityScale ?? btDensityScale,
        appearance?.general?.density,
      );
    } else {
      // Legacy path: profile -> tenant on top of vertical
      const productProfileTokenOverrides = profile.tokenOverrides;
      const ppBorderRadius = productProfileTokenOverrides?.borderRadius
        ? { ...verticalBorderRadius, ...productProfileTokenOverrides.borderRadius }
        : verticalBorderRadius;
      const ppShadows = productProfileTokenOverrides?.shadows
        ? { ...verticalShadows, ...productProfileTokenOverrides.shadows }
        : verticalShadows;
      const ppSurface = productProfileTokenOverrides?.surface
        ? { ...verticalSurface, ...productProfileTokenOverrides.surface }
        : verticalSurface;
      const ppMotion = productProfileTokenOverrides?.motion
        ? { ...verticalMotion, ...productProfileTokenOverrides.motion }
        : verticalMotion;
      const ppDensityScale = productProfileTokenOverrides?.densityScale ?? verticalDensityScale;

      const tenantTokenOverrides = config.tokenOverrides;
      borderRadius = tenantTokenOverrides?.borderRadius
        ? { ...ppBorderRadius, ...tenantTokenOverrides.borderRadius }
        : ppBorderRadius;
      shadows = tenantTokenOverrides?.shadows
        ? { ...ppShadows, ...tenantTokenOverrides.shadows }
        : ppShadows;
      surface = tenantTokenOverrides?.surface
        ? { ...ppSurface, ...tenantTokenOverrides.surface }
        : ppSurface;
      motion = tenantTokenOverrides?.motion
        ? { ...ppMotion, ...tenantTokenOverrides.motion }
        : ppMotion;
      densityScale = resolveEffectiveDensityScale(
        tenantTokenOverrides?.densityScale ?? ppDensityScale,
        appearance?.general?.density,
      );
    }

    // 4. Personality tokens — BrandTheme or legacy merge.
    // Each sub-object is spread independently so customizing one dimension
    // does not wipe out another.
    const verticalPersonality = vertical?.personality;
    const chartPersonality = resolveChartPersonality({
      tenantConfig: config,
      vertical,
      productProfile: profile,
    });
    let personality: PersonalityTokens;

    if (hasBrandTheme) {
      // BrandTheme path: DEFAULT -> vertical -> brandTheme -> tenant.personality
      // Product profile personality is skipped, but tenant personality remains
      // the highest-priority layer for per-tenant overrides.
      const btPersonality = brandThemeToPersonality(brandTheme);
      const tenantPersonality = config.personality;
      personality = {
        animation: { ...DEFAULT_PERSONALITY.animation, ...verticalPersonality?.animation, ...btPersonality.animation, ...tenantPersonality?.animation },
        chart: chartPersonality,
        typography: { ...DEFAULT_PERSONALITY.typography, ...verticalPersonality?.typography, ...btPersonality.typography, ...tenantPersonality?.typography },
        accent: { ...DEFAULT_PERSONALITY.accent, ...verticalPersonality?.accent, ...btPersonality.accent, ...tenantPersonality?.accent },
        card: { ...DEFAULT_PERSONALITY.card, ...verticalPersonality?.card, ...btPersonality.card, ...tenantPersonality?.card },
      };
    } else {
      // Legacy path: DEFAULT -> vertical -> profile -> tenant
      const productPersonality = profile.personality;
      const tenantPersonality = config.personality;
      personality = {
        animation: { ...DEFAULT_PERSONALITY.animation, ...verticalPersonality?.animation, ...productPersonality?.animation, ...tenantPersonality?.animation },
        chart: chartPersonality,
        typography: { ...DEFAULT_PERSONALITY.typography, ...verticalPersonality?.typography, ...productPersonality?.typography, ...tenantPersonality?.typography },
        accent: { ...DEFAULT_PERSONALITY.accent, ...verticalPersonality?.accent, ...productPersonality?.accent, ...tenantPersonality?.accent },
        card: { ...DEFAULT_PERSONALITY.card, ...verticalPersonality?.card, ...productPersonality?.card, ...tenantPersonality?.card },
      };
    }

    // Effective branding: brandTheme.palette wins over config.branding for colors.
    // This ensures useTokens reads the same colors that ThemeProvider renders.
    const effectivePrimary = brandTheme?.palette?.primaryColor || config.branding.primaryColor;
    const effectiveSecondary = brandTheme?.palette?.secondaryColor || config.branding.secondaryColor;
    const effectiveAccent = brandTheme?.palette?.accentColor || config.branding.accentColor;

    return {
      colors: {
        // Single-value color tokens remain for backward compatibility with older
        // consumers that read `tokens.colors.primary` directly. The canonical
        // source of truth is now the CSS variable-backed scale objects below.
        primary: effectivePrimary || 'var(--ds-color-primary)',
        // Secondary falls back to accent then CSS var so tenants that only set
        // an accent color still get a secondary-slot value in component code.
        secondary: effectiveSecondary || effectiveAccent || 'var(--ds-color-secondary)',
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
      // IMPORTANT: this array is provider-global (structural scale × tenant
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
  // Memo deps use config.slug as a proxy for "the whole tenant changed" plus
  // the specific sub-objects that participate in the resolution pipeline. This
  // avoids re-resolving on every render while still reacting to tenant switches,
  // engine changes, and profile swaps.
  //
  // appearance dep: useTokens only reads appearance.general.density (for the
  // multiplicative density factor), so we track that scalar instead of the
  // whole appearance object to avoid stale memos when the object ref stays
  // the same but the density field changes.
  }, [
    engine,
    config.slug,
    config.tokenOverrides,
    config.personality,
    config.brandTheme,
    config.branding.primaryColor,
    config.branding.secondaryColor,
    config.branding.accentColor,
    config.appearance?.general?.density,
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
