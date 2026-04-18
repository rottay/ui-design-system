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
 * Emits light-mode vars by default. Dark-mode vars are emitted with
 * a `--ds-dark-` prefix so ThemeProvider can apply them when dark mode
 * is active. For bundled tenants the CSS artifact handles light/dark
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

    // Dark-mode palette (consumed by ThemeProvider when data-theme='dark')
    if (bt.palette.darkPrimaryColor) vars['--ds-dark-color-primary'] = bt.palette.darkPrimaryColor;
    if (bt.palette.darkSecondaryColor) vars['--ds-dark-color-secondary'] = bt.palette.darkSecondaryColor;
    if (bt.palette.darkAccentColor) vars['--ds-dark-color-accent'] = bt.palette.darkAccentColor;
    if (bt.palette.darkBackgroundColor) vars['--ds-dark-color-background'] = bt.palette.darkBackgroundColor;
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
  return vars;
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
 * and table are NOT shoehorned into tokenOverrides or personality.
 */
export function brandThemeToChromeVariables(bt: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  const chrome = bt.chrome;
  if (!chrome) return vars;

  // Sidebar
  if (chrome.sidebar) {
    const s = chrome.sidebar;
    if (s.bg) vars['--ds-sidebar-bg'] = s.bg;
    if (s.border) vars['--ds-sidebar-border'] = s.border;
    if (s.text) vars['--ds-sidebar-text'] = s.text;
    if (s.textMuted) vars['--ds-sidebar-text-muted'] = s.textMuted;
    if (s.width) vars['--ds-sidebar-width'] = s.width;
    if (s.collapsedWidth) vars['--ds-sidebar-collapsed-width'] = s.collapsedWidth;
    if (s.headerHeight) vars['--ds-sidebar-header-height'] = s.headerHeight;
    if (s.groupFontSize) vars['--ds-sidebar-group-font-size'] = s.groupFontSize;
    if (s.groupFontWeight != null) vars['--ds-sidebar-group-font-weight'] = String(s.groupFontWeight);
    if (s.groupColor) vars['--ds-sidebar-group-color'] = s.groupColor;
    if (s.groupLetterSpacing) vars['--ds-sidebar-group-letter-spacing'] = s.groupLetterSpacing;
    if (s.itemFontSize) vars['--ds-sidebar-item-font-size'] = s.itemFontSize;
    if (s.itemFontWeight != null) vars['--ds-sidebar-item-font-weight'] = String(s.itemFontWeight);
    if (s.itemFontWeightActive != null) vars['--ds-sidebar-item-font-weight-active'] = String(s.itemFontWeightActive);
    if (s.itemColor) vars['--ds-sidebar-item-color'] = s.itemColor;
    if (s.itemColorActive) vars['--ds-sidebar-item-color-active'] = s.itemColorActive;
    if (s.itemBgActive) vars['--ds-sidebar-item-bg-active'] = s.itemBgActive;
    if (s.itemBgHover) vars['--ds-sidebar-item-bg-hover'] = s.itemBgHover;
    if (s.itemPadding) vars['--ds-sidebar-item-padding'] = s.itemPadding;
    if (s.iconSize) vars['--ds-sidebar-icon-size'] = s.iconSize;
    if (s.footerBg) vars['--ds-sidebar-footer-bg'] = s.footerBg;
  }

  // Layout
  if (chrome.layout) {
    const l = chrome.layout;
    if (l.bg) vars['--ds-layout-bg'] = l.bg;
    if (l.headerBg) vars['--ds-layout-header-bg'] = l.headerBg;
    if (l.headerBackdrop) vars['--ds-layout-header-backdrop'] = l.headerBackdrop;
    if (l.headerBorder) vars['--ds-layout-header-border'] = l.headerBorder;
    if (l.siderBg) vars['--ds-layout-sider-bg'] = l.siderBg;
    if (l.siderBorder) vars['--ds-layout-sider-border'] = l.siderBorder;
  }

  // Shell
  if (chrome.shell) {
    const sh = chrome.shell;
    if (sh.gridSize) vars['--ds-shell-grid-size'] = sh.gridSize;
    if (sh.gridLine) vars['--ds-shell-grid-line'] = sh.gridLine;
    // gridOpacity is intentionally NOT emitted as a separate CSS variable.
    // The opacity is baked into the gridLine color's alpha channel (e.g.
    // rgba(255,255,255,0.03)). A separate --ds-shell-grid-opacity var had
    // no real consumer — the page-shell background uses the grid line color
    // directly via repeating-linear-gradient.
  }

  // Controls — all button variants
  if (chrome.controls) {
    const c = chrome.controls;

    // Helper: map a button variant to CSS vars
    const mapBtn = (prefix: string, btn: typeof c.buttonPrimary) => {
      if (!btn) return;
      if (btn.bg) vars[`--ds-button-${prefix}-bg`] = btn.bg;
      if (btn.bgHover) vars[`--ds-button-${prefix}-bg-hover`] = btn.bgHover;
      if (btn.bgActive) vars[`--ds-button-${prefix}-bg-active`] = btn.bgActive;
      if (btn.color) vars[`--ds-button-${prefix}-color`] = btn.color;
      if (btn.text) vars[`--ds-button-${prefix}-text`] = btn.text;
      if (btn.border) vars[`--ds-button-${prefix}-border`] = btn.border;
      if (btn.borderHover) vars[`--ds-button-${prefix}-border-hover`] = btn.borderHover;
      if (btn.shadow) vars[`--ds-button-${prefix}-shadow`] = btn.shadow;
      if (btn.shadowHover) vars[`--ds-button-${prefix}-shadow-hover`] = btn.shadowHover;
    };

    mapBtn('primary', c.buttonPrimary);
    mapBtn('secondary', c.buttonSecondary);
    mapBtn('default', c.buttonDefault);
    mapBtn('ghost', c.buttonGhost);
    mapBtn('text', c.buttonText);
    mapBtn('success', c.buttonSuccess);
    mapBtn('warning', c.buttonWarning);
    mapBtn('error', c.buttonError);
    mapBtn('info', c.buttonInfo);

    if (c.buttonLink) {
      if (c.buttonLink.color) vars['--ds-button-link-color'] = c.buttonLink.color;
      if (c.buttonLink.colorHover) vars['--ds-button-link-color-hover'] = c.buttonLink.colorHover;
      if (c.buttonLink.colorActive) vars['--ds-button-link-color-active'] = c.buttonLink.colorActive;
    }

    if (c.focusRing) vars['--ds-button-focus-ring'] = c.focusRing;

    if (c.disabled) {
      if (c.disabled.opacity != null) vars['--ds-button-disabled-opacity'] = String(c.disabled.opacity);
      if (c.disabled.bg) vars['--ds-button-disabled-bg'] = c.disabled.bg;
      if (c.disabled.text) vars['--ds-button-disabled-color'] = c.disabled.text;
      if (c.disabled.border) vars['--ds-button-disabled-border'] = c.disabled.border;
      if (c.disabled.borderColor) vars['--ds-button-disabled-border-color'] = c.disabled.borderColor;
      // Input disabled mirrors
      if (c.disabled.bg) vars['--ds-input-bg-disabled'] = c.disabled.bg;
      if (c.disabled.text) vars['--ds-input-color-disabled'] = c.disabled.text;
      if (c.disabled.border) vars['--ds-input-border-disabled'] = c.disabled.border;
      if (c.disabled.borderColor) vars['--ds-input-border-color-disabled'] = c.disabled.borderColor;
      if (c.disabled.opacity != null) vars['--ds-input-disabled-opacity'] = String(c.disabled.opacity);
    }

    // Input chrome (full)
    if (c.input) {
      const i = c.input;
      if (i.bg) vars['--ds-input-bg'] = i.bg;
      if (i.bgHover) vars['--ds-input-bg-hover'] = i.bgHover;
      if (i.bgFocus) vars['--ds-input-bg-focus'] = i.bgFocus;
      if (i.bgDisabled) vars['--ds-input-bg-disabled'] = i.bgDisabled;
      if (i.color) vars['--ds-input-color'] = i.color;
      if (i.colorPlaceholder) vars['--ds-input-color-placeholder'] = i.colorPlaceholder;
      if (i.colorDisabled) vars['--ds-input-color-disabled'] = i.colorDisabled;
      if (i.border) vars['--ds-input-border'] = i.border;
      if (i.borderHover) vars['--ds-input-border-hover'] = i.borderHover;
      if (i.borderFocus) vars['--ds-input-border-focus'] = i.borderFocus;
      if (i.borderDisabled) vars['--ds-input-border-disabled'] = i.borderDisabled;
      if (i.disabledOpacity != null) vars['--ds-input-disabled-opacity'] = String(i.disabledOpacity);
      if (i.shadowFocus) vars['--ds-input-shadow-focus'] = i.shadowFocus;
      if (i.filled) {
        if (i.filled.bg) vars['--ds-input-filled-bg'] = i.filled.bg;
        if (i.filled.bgHover) vars['--ds-input-filled-bg-hover'] = i.filled.bgHover;
        if (i.filled.bgFocus) vars['--ds-input-filled-bg-focus'] = i.filled.bgFocus;
      }
      if (i.addon) {
        if (i.addon.bg) vars['--ds-input-addon-bg'] = i.addon.bg;
        if (i.addon.color) vars['--ds-input-addon-color'] = i.addon.color;
        if (i.addon.border) vars['--ds-input-addon-border'] = i.addon.border;
      }
      if (i.label?.color) vars['--ds-input-label-color'] = i.label.color;
      if (i.helper?.color) vars['--ds-input-helper-color'] = i.helper.color;
      if (i.clear) {
        if (i.clear.color) vars['--ds-input-clear-color'] = i.clear.color;
        if (i.clear.colorHover) vars['--ds-input-clear-color-hover'] = i.clear.colorHover;
      }
      if (i.successBorder) vars['--ds-input-success-border'] = i.successBorder;
      if (i.successShadowFocus) vars['--ds-input-success-shadow-focus'] = i.successShadowFocus;
      if (i.warningBorder) vars['--ds-input-warning-border'] = i.warningBorder;
      if (i.warningShadowFocus) vars['--ds-input-warning-shadow-focus'] = i.warningShadowFocus;
      if (i.errorBorder) vars['--ds-input-error-border'] = i.errorBorder;
      if (i.errorShadowFocus) vars['--ds-input-error-shadow-focus'] = i.errorShadowFocus;
      if (i.errorColor) vars['--ds-input-error-color'] = i.errorColor;
    }
  }

  // Table (full: header + row + cell)
  if (chrome.table) {
    const t = chrome.table;
    if (t.bg) vars['--ds-table-bg'] = t.bg;
    if (t.border) vars['--ds-table-border'] = t.border;
    if (t.headerBg) vars['--ds-table-header-bg'] = t.headerBg;
    if (t.headerColor) vars['--ds-table-header-color'] = t.headerColor;
    if (t.headerFontWeight != null) vars['--ds-table-header-font-weight'] = String(t.headerFontWeight);
    if (t.headerFontSize) vars['--ds-table-header-font-size'] = t.headerFontSize;
    if (t.headerBorder) vars['--ds-table-header-border'] = t.headerBorder;
    if (t.rowBg) vars['--ds-table-row-bg'] = t.rowBg;
    if (t.rowBgHover) vars['--ds-table-row-bg-hover'] = t.rowBgHover;
    if (t.rowBgStriped) vars['--ds-table-row-bg-striped'] = t.rowBgStriped;
    if (t.rowBgSelected) vars['--ds-table-row-bg-selected'] = t.rowBgSelected;
    if (t.rowBorder) vars['--ds-table-row-border'] = t.rowBorder;
    if (t.cellPadding) vars['--ds-table-cell-padding'] = t.cellPadding;
    if (t.cellFontSize) vars['--ds-table-cell-font-size'] = t.cellFontSize;
    if (t.cellColor) vars['--ds-table-cell-color'] = t.cellColor;
    if (t.loadingOverlayBg) vars['--ds-table-loading-overlay-bg'] = t.loadingOverlayBg;
  }

  // Card component chrome
  if (chrome.cardComponent) {
    const cc = chrome.cardComponent;
    if (cc.bg) vars['--ds-card-bg'] = cc.bg;
    if (cc.bgHover) vars['--ds-card-bg-hover'] = cc.bgHover;
    if (cc.color) vars['--ds-card-color'] = cc.color;
    if (cc.border) vars['--ds-card-border'] = cc.border;
    if (cc.borderHover) vars['--ds-card-border-hover'] = cc.borderHover;
    if (cc.borderAccentHover) vars['--ds-card-border-accent-hover'] = cc.borderAccentHover;
    if (cc.shadow) vars['--ds-card-shadow'] = cc.shadow;
    if (cc.shadowHover) vars['--ds-card-shadow-hover'] = cc.shadowHover;
    if (cc.shadowElevated) vars['--ds-card-shadow-elevated'] = cc.shadowElevated;
    if (cc.headerBorder) vars['--ds-card-header-border'] = cc.headerBorder;
    if (cc.headerColor) vars['--ds-card-header-color'] = cc.headerColor;
    if (cc.titleColor) vars['--ds-card-title-color'] = cc.titleColor;
    if (cc.subtitleColor) vars['--ds-card-subtitle-color'] = cc.subtitleColor;
    if (cc.bodyColor) vars['--ds-card-body-color'] = cc.bodyColor;
    if (cc.footerBorder) vars['--ds-card-footer-border'] = cc.footerBorder;
    if (cc.footerBg) vars['--ds-card-footer-bg'] = cc.footerBg;
    if (cc.imagePlaceholderBg) vars['--ds-card-image-placeholder-bg'] = cc.imagePlaceholderBg;
    if (cc.imagePlaceholderColor) vars['--ds-card-image-placeholder-color'] = cc.imagePlaceholderColor;
  }

  // Modal chrome
  if (chrome.modal) {
    const m = chrome.modal;
    if (m.bg) vars['--ds-modal-bg'] = m.bg;
    if (m.color) vars['--ds-modal-color'] = m.color;
    if (m.shadow) vars['--ds-modal-shadow'] = m.shadow;
    if (m.overlayBg) vars['--ds-modal-overlay-bg'] = m.overlayBg;
    if (m.overlayBackdrop) vars['--ds-modal-overlay-backdrop'] = m.overlayBackdrop;
    if (m.headerBg) vars['--ds-modal-header-bg'] = m.headerBg;
    if (m.headerBorder) vars['--ds-modal-header-border'] = m.headerBorder;
    if (m.titleColor) vars['--ds-modal-title-color'] = m.titleColor;
    if (m.subtitleColor) vars['--ds-modal-subtitle-color'] = m.subtitleColor;
    if (m.bodyColor) vars['--ds-modal-body-color'] = m.bodyColor;
    if (m.footerBorder) vars['--ds-modal-footer-border'] = m.footerBorder;
    if (m.footerBg) vars['--ds-modal-footer-bg'] = m.footerBg;
    if (m.closeColor) vars['--ds-modal-close-color'] = m.closeColor;
    if (m.closeColorHover) vars['--ds-modal-close-color-hover'] = m.closeColorHover;
    if (m.closeBgHover) vars['--ds-modal-close-bg-hover'] = m.closeBgHover;
  }

  // Tabs chrome
  if (chrome.tabs) {
    const tb = chrome.tabs;
    if (tb.border) vars['--ds-tabs-border'] = tb.border;
    if (tb.color) vars['--ds-tab-color'] = tb.color;
    if (tb.colorHover) vars['--ds-tab-color-hover'] = tb.colorHover;
    if (tb.colorActive) vars['--ds-tab-color-active'] = tb.colorActive;
    if (tb.bgHover) vars['--ds-tab-bg-hover'] = tb.bgHover;
    if (tb.borderActive) vars['--ds-tab-border-active'] = tb.borderActive;
  }

  return vars;
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

  // CSS variables from palette + typography + chrome
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
