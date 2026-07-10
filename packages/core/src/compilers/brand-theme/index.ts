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

import type {
  BrandTheme,
  CompileBrandTheme,
  CompiledBrand,
  BrandCompilerInput,
} from '../../contracts/themes';
import type { EngineName } from '../../contracts/engine';
import type { TenantBranding, TenantTokenOverrides } from '../../contracts/tenants';
import type { PersonalityTokens } from '../../contracts/tokens/personality';
import { chromeToVariables } from '../_shared/chrome-variables';

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
export function mergePartialPersonality(
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

/**
 * Convert BrandTheme palette to a flat CSS variable map.
 * Emits light-mode vars by default. Dark-mode palette aliases use the
 * `--ds-color-dark-*` names consumed by ThemeProvider. For bundled tenants
 * the CSS artifact handles light/dark
 * splitting directly; these dark vars are consumed by DB-driven tenants
 * where runtime switching is needed.
 */
function brandThemeToCssVariables(bt: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  if (bt.palette) {
    // Light-mode palette (default)
    if (bt.palette.primaryColor) vars['--ds-color-primary'] = bt.palette.primaryColor;
    if (bt.palette.secondaryColor) vars['--ds-color-secondary'] = bt.palette.secondaryColor;
    if (bt.palette.accentColor) vars['--ds-color-accent'] = bt.palette.accentColor;
    if (bt.palette.successColor) vars['--ds-color-success'] = bt.palette.successColor;
    if (bt.palette.warningColor) vars['--ds-color-warning'] = bt.palette.warningColor;
    if (bt.palette.errorColor) vars['--ds-color-error'] = bt.palette.errorColor;
    if (bt.palette.infoColor) vars['--ds-color-info'] = bt.palette.infoColor;

    // Dark-mode palette aliases consumed by ThemeProvider.
    if (bt.palette.darkPrimaryColor) vars['--ds-color-dark-primary'] = bt.palette.darkPrimaryColor;
    if (bt.palette.darkSecondaryColor) vars['--ds-color-dark-secondary'] = bt.palette.darkSecondaryColor;
    if (bt.palette.darkAccentColor) vars['--ds-color-dark-accent'] = bt.palette.darkAccentColor;
    if (bt.palette.darkBackgroundColor) vars['--ds-color-dark-bg'] = bt.palette.darkBackgroundColor;
  }
  if (bt.typography) {
    const ty = bt.typography;
    if (ty.fontFamilyBase) vars['--ds-font-family-base'] = ty.fontFamilyBase;
    if (ty.fontFamilyHeading) vars['--ds-font-family-heading'] = ty.fontFamilyHeading;
    if (ty.fontFamilyMono) vars['--ds-font-family-mono'] = ty.fontFamilyMono;
    if (ty.fontFamilyDisplay) vars['--ds-font-family-display'] = ty.fontFamilyDisplay;
    if (ty.letterSpacing) {
      if (ty.letterSpacing.display) vars['--ds-letter-spacing-display'] = ty.letterSpacing.display;
      if (ty.letterSpacing.heading) vars['--ds-letter-spacing-heading'] = ty.letterSpacing.heading;
      if (ty.letterSpacing.body) vars['--ds-letter-spacing-body'] = ty.letterSpacing.body;
      if (ty.letterSpacing.mono) vars['--ds-letter-spacing-mono'] = ty.letterSpacing.mono;
    }
    if (ty.lineHeight) {
      if (ty.lineHeight.display != null) vars['--ds-line-height-display'] = String(ty.lineHeight.display);
      if (ty.lineHeight.heading != null) vars['--ds-line-height-heading'] = String(ty.lineHeight.heading);
      if (ty.lineHeight.body != null) vars['--ds-line-height-body'] = String(ty.lineHeight.body);
      if (ty.lineHeight.tight != null) vars['--ds-line-height-tight'] = String(ty.lineHeight.tight);
      if (ty.lineHeight.relaxed != null) vars['--ds-line-height-relaxed'] = String(ty.lineHeight.relaxed);
    }
  }
  if (bt.surfaces) {
    const su = bt.surfaces;
    if (su.borderRadius) {
      if (su.borderRadius.sm) vars['--ds-radius-sm'] = su.borderRadius.sm;
      if (su.borderRadius.md) vars['--ds-radius-md'] = su.borderRadius.md;
      if (su.borderRadius.lg) vars['--ds-radius-lg'] = su.borderRadius.lg;
      if (su.borderRadius.xl) vars['--ds-radius-xl'] = su.borderRadius.xl;
    }
    if (su.shadows) {
      if (su.shadows.sm) vars['--ds-shadow-sm'] = su.shadows.sm;
      if (su.shadows.md) vars['--ds-shadow-md'] = su.shadows.md;
      if (su.shadows.lg) vars['--ds-shadow-lg'] = su.shadows.lg;
      if (su.shadows.xl) vars['--ds-shadow-xl'] = su.shadows.xl;
    }
    if (su.glass) {
      // 'none' is legacy zero-decoration suppression. The premium.css defaults + the
      // --ds-effect-intensity dial now own collapse, so a 'none' override must NOT be
      // emitted: doing so clobbered premium.css at runtime for every non-zero-intensity
      // tenant (including rottay, killing its surface tint). A tenant stays flat via
      // --ds-effect-intensity: 0 (bithire), not by nulling the role token. Only a real
      // (non-'none') value is emitted.
      if (su.glass.background && su.glass.background !== 'none') vars['--ds-glass-bg'] = su.glass.background;
      if (su.glass.border && su.glass.border !== 'none') vars['--ds-glass-border'] = su.glass.border;
      if (su.glass.blur && su.glass.blur !== 'none') vars['--ds-glass-blur'] = su.glass.blur;
    }
    if (su.gradients) {
      if (su.gradients.primary && su.gradients.primary !== 'none') vars['--ds-gradient-primary'] = su.gradients.primary;
      if (su.gradients.surface && su.gradients.surface !== 'none') vars['--ds-gradient-surface'] = su.gradients.surface;
      if (su.gradients.mesh && su.gradients.mesh !== 'none') vars['--ds-gradient-mesh'] = su.gradients.mesh;
    }
    if (su.overlays) {
      if (su.overlays.light) vars['--ds-overlay-light'] = su.overlays.light;
      if (su.overlays.medium) vars['--ds-overlay-medium'] = su.overlays.medium;
      if (su.overlays.heavy) vars['--ds-overlay-heavy'] = su.overlays.heavy;
    }
    // Premium effect-intensity dial (engines/modern spec section 5). Multiplies the
    // gradient/glass/glow layer via --ds-effect-intensity; 0 collapses it to flat.
    // Defaults to 1 (full Quiet Premium) when the theme does not set it.
    vars['--ds-effect-intensity'] = String(su.effectIntensity ?? 1);
  }
  setTintScaleVariables(vars, bt);
  setTypeRampVariables(vars);
  setMotionVariables(vars, bt);
  return vars;
}

/**
 * The closed motion vocabulary (design-language §2.6): three durations and two
 * easing families, expressed as tokens. `instant` (hover/focus/toggle/pill),
 * `calm` (page/tab transitions, entrance fades, tooltips), and `deliberate`
 * (panel open/resize, sheets, modals) are the ONLY sanctioned durations —
 * app-side raw ms literals are gate-banned in favor of these. The `standard`
 * ease drives everything; `exit` drives dismissals. The three steps are a fixed
 * closed set (120/200/320ms), except that `calm` tracks the theme's own
 * `entranceDuration` so the transition speed a BrandTheme authors for its
 * entrances is the same value tabs and tooltips animate at (design-language §2.6
 * notes calm "matches BITHIRE_PROFILE.transitionSpeed: '200ms'").
 */
function setMotionVariables(vars: Record<string, string>, bt: BrandTheme): void {
  const calmMs = bt.motion?.entranceDuration ?? 200;
  vars['--ds-motion-instant'] = '120ms';
  vars['--ds-motion-calm'] = `${calmMs}ms`;
  vars['--ds-motion-deliberate'] = '320ms';
  vars['--ds-ease-standard'] = 'cubic-bezier(0.2, 0, 0, 1)';
  vars['--ds-ease-exit'] = 'cubic-bezier(0.4, 0, 1, 1)';
}

/** The five closed tint steps of the one-blue scale (design-language §2.5). */
const TINT_STEPS = [4, 8, 12, 16, 24] as const;

/**
 * The closed composite type ramp (design-language §2.1): five sizes, three
 * weights, one editorial uppercase variant. Each entry's size aligns to a step
 * of the DS scalar font ramp (0.75rem=xs, 0.875rem=sm, 1rem, 1.25rem, 2rem) but
 * pairs it with a fixed rem line-height and tracking so a consumer binds one
 * named ramp entry instead of hand-picking a size/weight/tracking triple. The
 * weight set is 400/600/700 only; 500 and the 620–860 band are banned.
 */
const TYPE_RAMP = [
  { name: 'detail', size: '0.75rem', lineHeight: '1rem', weight: 400, tracking: '0' },
  { name: 'body', size: '0.875rem', lineHeight: '1.25rem', weight: 400, tracking: '0' },
  { name: 'emphasis', size: '1rem', lineHeight: '1.5rem', weight: 600, tracking: '0' },
  { name: 'title', size: '1.25rem', lineHeight: '1.75rem', weight: 600, tracking: '-0.01em' },
  { name: 'display', size: '2rem', lineHeight: '2.25rem', weight: 700, tracking: '-0.02em' },
] as const;

/**
 * Emit the composite type ramp --ds-text-{detail,body,emphasis,title,display}
 * plus the --ds-text-eyebrow variant (design-language §2.1).
 *
 * Each ramp entry is emitted as a bare `font`-shorthand token (`--ds-text-<name>`
 * = `<weight> <size>/<line-height> <family>`, the headline composite the §2.1
 * table names) AND as the four addressable facets
 * `--ds-text-<name>-{size,weight,line-height,letter-spacing}` (tracking cannot
 * ride the `font` shorthand, so it is a separate facet; the facet names match the
 * existing foundation composite-text convention in
 * tokens/css/foundation/base/typography.css). The eyebrow reuses the detail size
 * at weight 600 with +0.08em tracking and is the sole uppercase in the product
 * (S1) — it carries a `-transform: uppercase` facet; every other ramp entry is
 * sentence case. The ramp is a fixed, tenant-independent closed set, so it is
 * emitted for every compiled BrandTheme.
 */
function setTypeRampVariables(vars: Record<string, string>): void {
  const family = 'var(--ds-font-family-base)';

  for (const { name, size, lineHeight, weight, tracking } of TYPE_RAMP) {
    vars[`--ds-text-${name}`] = `${weight} ${size}/${lineHeight} ${family}`;
    vars[`--ds-text-${name}-size`] = size;
    vars[`--ds-text-${name}-weight`] = String(weight);
    vars[`--ds-text-${name}-line-height`] = lineHeight;
    vars[`--ds-text-${name}-letter-spacing`] = tracking;
  }

  // Eyebrow — detail size, weight 600, +0.08em tracking, uppercase (the sole
  // uppercase per BITHIRE_PROFILE.labelStyle: 'sentence').
  vars['--ds-text-eyebrow'] = `600 0.75rem/1rem ${family}`;
  vars['--ds-text-eyebrow-size'] = '0.75rem';
  vars['--ds-text-eyebrow-weight'] = '600';
  vars['--ds-text-eyebrow-line-height'] = '1rem';
  vars['--ds-text-eyebrow-letter-spacing'] = '0.08em';
  vars['--ds-text-eyebrow-transform'] = 'uppercase';
}

/**
 * Emit the closed tint scale --ds-tint-{4,8,12,16,24} per palette role.
 *
 * Each step is `color-mix(in srgb, <role> N%, var(--ds-color-bg-primary))`, so a
 * single role color (mixed over the page background) generates every interaction
 * tint instead of hand-picked rgba() values. This is what lets a vertical drop a
 * foreign second blue and re-derive hover/active/selected/focus states from its
 * primary alone (one-blue law). The primary role is emitted UNSUFFIXED (the
 * canonical interaction scale — hover=tint-4, active/selected=tint-8, selected
 * row=tint-12, focus ring=tint-24); each status tone (success/warning/error/info)
 * carries a role suffix so a tinted pill reads bg = tint-8 of the tone and
 * border = tint-24 of the tone. A role is skipped when its palette color is
 * absent, so themes that omit a tone simply omit that tone's tints.
 */
function setTintScaleVariables(vars: Record<string, string>, bt: BrandTheme): void {
  const palette = bt.palette;
  if (!palette) return;

  const roles: Array<{ suffix: string; color: string | undefined; colorVar: string }> = [
    { suffix: '', color: palette.primaryColor, colorVar: '--ds-color-primary' },
    { suffix: 'success', color: palette.successColor, colorVar: '--ds-color-success' },
    { suffix: 'warning', color: palette.warningColor, colorVar: '--ds-color-warning' },
    { suffix: 'error', color: palette.errorColor, colorVar: '--ds-color-error' },
    { suffix: 'info', color: palette.infoColor, colorVar: '--ds-color-info' },
  ];

  for (const { suffix, color, colorVar } of roles) {
    if (!color) continue;
    for (const step of TINT_STEPS) {
      const name = suffix ? `--ds-tint-${suffix}-${step}` : `--ds-tint-${step}`;
      vars[name] = `color-mix(in srgb, var(${colorVar}) ${step}%, var(--ds-color-bg-primary))`;
    }
  }
}

/** Build a CSS string from variables with tenant selector scoping. */
function buildCssString(vars: Record<string, string>, tenantSlug: string): string {
  const entries = Object.entries(vars).filter(([, v]) => v != null);
  if (entries.length === 0) return '';
  const declarations = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `html[data-tenant='${tenantSlug}'] {\n${declarations}\n}`;
}

// ── Chrome Variables ────────────────────────────────────

/**
 * Map BrandTheme.chrome sub-interfaces to flat CSS variable declarations.
 *
 * This is the explicit chrome channel — sidebar, layout, shell, controls,
 * and table are NOT shoehorned into tokenOverrides or personality. The
 * mapping is shared with compilers/appearance via compilers/_shared/chrome-variables,
 * since TenantAppearanceAdvanced.chrome is the same shape as BrandTheme.chrome.
 */
export function brandThemeToChromeVariables(bt: BrandTheme): Record<string, string> {
  return chromeToVariables(bt.chrome);
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

  // CSS variables from palette + typography + surfaces + chrome
  const paletteVars = brandThemeToCssVariables(brandTheme);
  const chromeVars = brandThemeToChromeVariables(brandTheme);
  const cssVariables = { ...paletteVars, ...chromeVars };

  // CSS string with tenant selectors
  const cssString = buildCssString(cssVariables, tenantSlug);

  // Engine bridge passthrough
  const engineBridge: Partial<Record<EngineName, Record<string, unknown>>> =
    brandTheme.engineBridge ?? {};

  return { cssVariables, cssString, personality, tokenOverrides, engineBridge };
};
