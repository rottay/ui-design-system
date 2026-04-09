/**
 * @fileoverview Brand compiler bridge utilities.
 *
 * Converts a BrandTheme into the legacy shapes that the existing runtime
 * code (useTokens, ThemeProvider) already consumes. This is the first
 * piece of the brand compiler defined in contracts/themes.
 *
 * Full CSS generation (CompileBrandTheme) will be added in Wave E when
 * runtime and static generation need to share one compilation path.
 */

import type { BrandTheme } from '../../contracts/themes';
import type { TenantBranding, TenantTokenOverrides } from '../../contracts/tenants';
import type { PersonalityTokens } from '../../contracts/tokens/personality';

/**
 * Extract structural token overrides from a BrandTheme.
 *
 * Maps BrandTheme.surfaces to TenantTokenOverrides so the existing
 * structural merge chain can consume it without changes.
 */
export function brandThemeToTokenOverrides(bt: BrandTheme): Partial<TenantTokenOverrides> {
  if (!bt.surfaces) return {};
  return {
    surface: bt.surfaces.surface,
    borderRadius: bt.surfaces.borderRadius,
    shadows: bt.surfaces.shadows,
    glass: bt.surfaces.glass,
    gradients: bt.surfaces.gradients,
    overlays: bt.surfaces.overlays,
    densityScale: bt.surfaces.densityScale,
  };
}

/**
 * Extract personality tokens from a BrandTheme.
 *
 * Maps BrandTheme.motion/charts/chrome/typography to the PersonalityTokens
 * shape that the existing personality merge chain consumes.
 */
export function brandThemeToPersonality(bt: BrandTheme): Partial<PersonalityTokens> {
  const result: Partial<PersonalityTokens> = {};

  if (bt.motion) {
    result.animation = {
      intensity: bt.motion.intensity,
      entrance: bt.motion.entrance,
      entranceDuration: bt.motion.entranceDuration,
      hoverLift: bt.motion.hoverLift,
      hoverScale: bt.motion.hoverScale,
      useSpring: bt.motion.useSpring,
      springTension: bt.motion.springTension,
      springFriction: bt.motion.springFriction,
      pulseSpeed: bt.motion.pulseSpeed,
      skeletonStyle: bt.motion.skeletonStyle,
      staggerDelay: bt.motion.staggerDelay,
      staggerMax: bt.motion.staggerMax,
      countUpEnabled: bt.motion.countUpEnabled,
    } as PersonalityTokens['animation'];
  }

  if (bt.charts) {
    result.chart = bt.charts as PersonalityTokens['chart'];
  }

  if (bt.typography) {
    result.typography = {
      headingWeightBias: bt.typography.headingWeightBias,
      headingLetterSpacing: bt.typography.headingLetterSpacing,
      labelStyle: bt.typography.labelStyle,
    } as PersonalityTokens['typography'];
  }

  if (bt.chrome?.accent) {
    result.accent = bt.chrome.accent as PersonalityTokens['accent'];
  }

  if (bt.chrome?.card) {
    result.card = bt.chrome.card as PersonalityTokens['card'];
  }

  return result;
}

/**
 * Extract legacy-compatible branding from a BrandTheme.
 *
 * Maps BrandTheme.palette + typography font families to TenantBranding
 * so ThemeProvider's branding injection works without modification.
 */
export function brandThemeToBranding(bt: BrandTheme): Partial<TenantBranding> {
  const result: Partial<TenantBranding> = {};

  if (bt.palette) {
    result.primaryColor = bt.palette.primaryColor;
    result.secondaryColor = bt.palette.secondaryColor;
    result.accentColor = bt.palette.accentColor;
    result.darkPrimaryColor = bt.palette.darkPrimaryColor;
    result.darkSecondaryColor = bt.palette.darkSecondaryColor;
    result.darkAccentColor = bt.palette.darkAccentColor;
    result.darkBackgroundColor = bt.palette.darkBackgroundColor;
    result.successColor = bt.palette.successColor;
    result.warningColor = bt.palette.warningColor;
    result.errorColor = bt.palette.errorColor;
    result.infoColor = bt.palette.infoColor;
  }

  if (bt.typography) {
    result.fontFamilyBase = bt.typography.fontFamilyBase;
    result.fontFamilyHeading = bt.typography.fontFamilyHeading;
    result.fontFamilyMono = bt.typography.fontFamilyMono;
    result.fontFamilyDisplay = bt.typography.fontFamilyDisplay;
  }

  return result;
}

/**
 * Deep-merge two TenantTokenOverrides objects.
 *
 * Nested objects (glass, gradients, overlays, surface, motion, borderRadius,
 * shadows) are merged per-key so a tenant override for one glass property
 * does not wipe out the entire glass namespace from brandTheme.
 */
export function deepMergeTokenOverrides(
  base: Partial<TenantTokenOverrides>,
  override: Partial<TenantTokenOverrides> | undefined,
): Partial<TenantTokenOverrides> {
  if (!override) return base;
  return {
    surface: override.surface ? { ...base.surface, ...override.surface } : base.surface,
    motion: override.motion ? { ...base.motion, ...override.motion } : base.motion,
    borderRadius: override.borderRadius ? { ...base.borderRadius, ...override.borderRadius } : base.borderRadius,
    shadows: override.shadows ? { ...base.shadows, ...override.shadows } : base.shadows,
    densityScale: override.densityScale ?? base.densityScale,
    glass: override.glass ? { ...base.glass, ...override.glass } : base.glass,
    gradients: override.gradients ? { ...base.gradients, ...override.gradients } : base.gradients,
    overlays: override.overlays ? { ...base.overlays, ...override.overlays } : base.overlays,
  };
}
