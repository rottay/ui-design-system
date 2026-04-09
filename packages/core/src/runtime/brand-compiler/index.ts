/**
 * @fileoverview Brand compiler — bridge utilities + compilation.
 *
 * Converts a BrandTheme into the shapes consumed by the runtime
 * (useTokens, ThemeProvider) and by static CSS generation.
 *
 * Bridge functions: brandThemeToTokenOverrides, brandThemeToPersonality,
 * brandThemeToBranding, deepMergeTokenOverrides.
 *
 * Compiler: compileBrandTheme — conforms to the CompileBrandTheme contract
 * from contracts/themes. Produces personality, tokenOverrides, CSS variables,
 * and a CSS string from a BrandTheme + vertical baseline.
 */

import type { BrandTheme, CompileBrandTheme, CompiledBrand, BrandCompilerInput } from '../../contracts/themes';
import type { EngineName } from '../../contracts/engine';
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

// ── Helpers for compileBrandTheme ──────────────────────────

/** Merge two partial PersonalityTokens (per-dimension spread). */
function mergePartialPersonality(
  base: Partial<PersonalityTokens> | undefined,
  override: Partial<PersonalityTokens>,
): Partial<PersonalityTokens> {
  if (!base) return override;
  return {
    animation: override.animation ? { ...base.animation, ...override.animation } : base.animation,
    chart: override.chart ? { ...base.chart, ...override.chart } : base.chart,
    typography: override.typography ? { ...base.typography, ...override.typography } : base.typography,
    accent: override.accent ? { ...base.accent, ...override.accent } : base.accent,
    card: override.card ? { ...base.card, ...override.card } : base.card,
  };
}

/** Convert BrandTheme palette to a flat CSS variable map. */
function brandThemeToCssVariables(bt: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  if (bt.palette) {
    if (bt.palette.primaryColor) vars['--ds-color-primary'] = bt.palette.primaryColor;
    if (bt.palette.secondaryColor) vars['--ds-color-secondary'] = bt.palette.secondaryColor;
    if (bt.palette.accentColor) vars['--ds-color-accent'] = bt.palette.accentColor;
    if (bt.palette.successColor) vars['--ds-color-success'] = bt.palette.successColor;
    if (bt.palette.warningColor) vars['--ds-color-warning'] = bt.palette.warningColor;
    if (bt.palette.errorColor) vars['--ds-color-error'] = bt.palette.errorColor;
    if (bt.palette.infoColor) vars['--ds-color-info'] = bt.palette.infoColor;
  }
  if (bt.typography) {
    if (bt.typography.fontFamilyBase) vars['--ds-font-family-base'] = bt.typography.fontFamilyBase;
    if (bt.typography.fontFamilyHeading) vars['--ds-font-family-heading'] = bt.typography.fontFamilyHeading;
    if (bt.typography.fontFamilyMono) vars['--ds-font-family-mono'] = bt.typography.fontFamilyMono;
    if (bt.typography.fontFamilyDisplay) vars['--ds-font-family-display'] = bt.typography.fontFamilyDisplay;
  }
  return vars;
}

/** Build a CSS string from variables with tenant selector scoping. */
function buildCssString(vars: Record<string, string>, tenantSlug: string): string {
  const entries = Object.entries(vars).filter(([, v]) => v != null);
  if (entries.length === 0) return '';
  const declarations = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `html[data-tenant='${tenantSlug}'] {\n${declarations}\n}`;
}

// ── Brand Compiler ──────────────────────────────────────

/**
 * Compile a BrandTheme into resolved outputs for runtime and static generation.
 *
 * Implements the CompileBrandTheme contract. The merge chain is:
 *   vertical baseline -> BrandTheme
 *
 * Tenant-level overrides (personality, tokenOverrides) are NOT applied here —
 * they are the highest-priority layer applied by useTokens and
 * DesignSystemProvider at runtime.
 */
export const compileBrandTheme: CompileBrandTheme = (input: BrandCompilerInput): CompiledBrand => {
  const { brandTheme, tenantSlug, verticalPersonality, verticalTokenOverrides } = input;

  // Merge personality: vertical baseline -> brandTheme
  const btPersonality = brandThemeToPersonality(brandTheme);
  const personality = mergePartialPersonality(verticalPersonality, btPersonality);

  // Merge structural: vertical baseline -> brandTheme
  const btOverrides = brandThemeToTokenOverrides(brandTheme);
  const tokenOverrides = deepMergeTokenOverrides(
    verticalTokenOverrides ?? {},
    btOverrides,
  );

  // CSS variables from palette + typography
  const cssVariables = brandThemeToCssVariables(brandTheme);

  // CSS string with tenant selectors
  const cssString = buildCssString(cssVariables, tenantSlug);

  // Engine bridge passthrough
  const engineBridge: Partial<Record<EngineName, Record<string, unknown>>> =
    brandTheme.engineBridge ?? {};

  return { cssVariables, cssString, personality, tokenOverrides, engineBridge };
};
