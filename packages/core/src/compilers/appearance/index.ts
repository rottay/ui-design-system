/**
 * @fileoverview Appearance compiler — bridges TenantAppearance into runtime shapes.
 *
 * Converts the DB-safe TenantAppearanceGeneral and TenantAppearanceAdvanced
 * contracts into the existing runtime primitives (branding, tokenOverrides,
 * chrome CSS variables) so the merge chain stays unified.
 *
 * Merge order in the runtime:
 *   DS base -> vertical -> BrandTheme -> Appearance General -> Appearance Advanced
 *
 * General produces safe, bounded overrides (palette colors, font families,
 * radius scale factor, density preset, etc.).
 * Advanced produces fine-grained overrides (chrome, raw token overrides).
 */

import type {
  TenantAppearance,
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
  BrandButtonVariantChrome,
} from '../../contracts/themes';

// ── General tier ──────────────────────────────────────────

// Density and type-scale are resolved inside useTokens() (hooks/tokens/index.ts)
// as numeric factors that multiply the spacing array and font sizes. They are NOT
// emitted as CSS variables because that would require every consumer to use calc(),
// which is a paradigm shift not justified by the current audience.

/** Button shape presets map to a --ds-radius-button value. */
const BUTTON_STYLE_RADIUS: Record<string, string> = {
  sharp: '2px',
  soft: 'var(--ds-radius-md, 8px)',
  pill: '9999px',
};

/** Elevation presets map to shadow scales. */
const ELEVATION_PRESET: Record<string, Record<string, string>> = {
  flat: {
    '--ds-elevation-1': 'none',
    '--ds-elevation-2': 'none',
    '--ds-elevation-3': '0 1px 2px rgba(0,0,0,0.05)',
  },
  soft: {}, // use DS defaults
  elevated: {
    '--ds-elevation-1': '0 2px 4px rgba(0,0,0,0.08)',
    '--ds-elevation-2': '0 4px 8px rgba(0,0,0,0.1)',
    '--ds-elevation-3': '0 8px 16px rgba(0,0,0,0.12)',
  },
};

/**
 * Convert TenantAppearanceGeneral into a flat Record of CSS custom property
 * overrides that can be merged into the runtime token chain.
 */
export function appearanceGeneralToVariables(
  general: TenantAppearanceGeneral
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Palette
  if (general.palette) {
    const p = general.palette;
    if (p.primary) vars['--ds-color-primary'] = p.primary;
    if (p.secondary) vars['--ds-color-secondary'] = p.secondary;
    if (p.accent) vars['--ds-color-accent'] = p.accent;
    // backgroundMode is consumed by ThemeProvider, not a CSS variable
  }

  // Typography — font families are real CSS vars consumed by engines
  if (general.typography) {
    const t = general.typography;
    if (t.fontFamilyBase) vars['--ds-font-family-base'] = t.fontFamilyBase;
    if (t.fontFamilyHeading) vars['--ds-font-family-heading'] = t.fontFamilyHeading;
  }

  // Shape — buttonStyle maps to a real CSS var consumed by engines
  if (general.shape?.buttonStyle) {
    const r = BUTTON_STYLE_RADIUS[general.shape.buttonStyle];
    if (r) vars['--ds-radius-button'] = r;
  }

  // Density is consumed by useTokens() as a JS factor, not a CSS variable.

  // Navigation — sidebarTone maps to real sidebar chrome variables
  if (general.navigation?.sidebarTone) {
    const tone = general.navigation.sidebarTone;
    switch (tone) {
      case 'subtle':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-bg-secondary)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-text-primary)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-text-muted)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-bg-hover)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-primary-100)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-primary)';
        break;
      case 'strong':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-primary-900)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-white)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-neutral-400)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-primary-800)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-primary-700)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-white)';
        break;
      case 'inverse':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-neutral-900)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-neutral-100)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-neutral-500)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-neutral-800)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-neutral-700)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-white)';
        break;
    }
  }

  // Surfaces / elevation
  if (general.surfaces?.elevation) {
    const preset = ELEVATION_PRESET[general.surfaces.elevation];
    if (preset) Object.assign(vars, preset);
  }

  // media (logo/logoMark/favicon) removed from contract — no CSS reader exists.
  // Re-add when sidebar/header components consume --ds-tenant-logo vars.

  return vars;
}

// ── Advanced tier ─────────────────────────────────────────

/**
 * Convert TenantAppearanceAdvanced into a flat Record of CSS custom property
 * overrides. Chrome values use the same variable namespace as brandThemeToChromeVariables.
 *
 * Full chrome parity with BrandTheme: ~140 CSS variables across all categories.
 */
export function appearanceAdvancedToVariables(
  advanced: TenantAppearanceAdvanced
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (!advanced.chrome) {
    // Only raw token overrides
    if (advanced.tokenOverrides) {
      for (const [key, value] of Object.entries(advanced.tokenOverrides)) {
        if (key.startsWith('--ds-') && value != null) {
          vars[key] = String(value);
        }
      }
    }
    return vars;
  }

  const c = advanced.chrome;

  // ── Sidebar (full 17 fields) ──
  if (c.sidebar) {
    const s = c.sidebar;
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

  // ── Layout ──
  if (c.layout) {
    const l = c.layout;
    if (l.bg) vars['--ds-layout-bg'] = l.bg;
    if (l.headerBg) vars['--ds-layout-header-bg'] = l.headerBg;
    if (l.headerBackdrop) vars['--ds-layout-header-backdrop'] = l.headerBackdrop;
    if (l.headerBorder) vars['--ds-layout-header-border'] = l.headerBorder;
    if (l.siderBg) vars['--ds-layout-sider-bg'] = l.siderBg;
    if (l.siderBorder) vars['--ds-layout-sider-border'] = l.siderBorder;
  }

  // ── Shell ──
  if (c.shell) {
    const sh = c.shell;
    if (sh.gridSize) vars['--ds-shell-grid-size'] = sh.gridSize;
    if (sh.gridLine) vars['--ds-shell-grid-line'] = sh.gridLine;
  }

  // ── Controls (all button variants + input + disabled + focus) ──
  if (c.controls) {
    const ct = c.controls;

    // Helper: map a button variant to CSS vars
    const mapBtn = (prefix: string, btn: Partial<BrandButtonVariantChrome> | undefined) => {
      if (!btn) return;
      const b = btn;
      if (b.bg) vars[`--ds-button-${prefix}-bg`] = b.bg;
      if (b.bgHover) vars[`--ds-button-${prefix}-bg-hover`] = b.bgHover;
      if (b.bgActive) vars[`--ds-button-${prefix}-bg-active`] = b.bgActive;
      if (b.color) vars[`--ds-button-${prefix}-color`] = b.color;
      if (b.text) vars[`--ds-button-${prefix}-text`] = b.text;
      if (b.border) vars[`--ds-button-${prefix}-border`] = b.border;
      if (b.borderHover) vars[`--ds-button-${prefix}-border-hover`] = b.borderHover;
      if (b.shadow) vars[`--ds-button-${prefix}-shadow`] = b.shadow;
      if (b.shadowHover) vars[`--ds-button-${prefix}-shadow-hover`] = b.shadowHover;
    };

    mapBtn('primary', ct.buttonPrimary);
    mapBtn('secondary', ct.buttonSecondary);
    mapBtn('default', ct.buttonDefault);
    mapBtn('ghost', ct.buttonGhost);
    mapBtn('text', ct.buttonText);
    mapBtn('success', ct.buttonSuccess);
    mapBtn('warning', ct.buttonWarning);
    mapBtn('error', ct.buttonError);
    mapBtn('info', ct.buttonInfo);

    if (ct.buttonLink) {
      if (ct.buttonLink.color) vars['--ds-button-link-color'] = ct.buttonLink.color;
      if (ct.buttonLink.colorHover) vars['--ds-button-link-color-hover'] = ct.buttonLink.colorHover;
      if (ct.buttonLink.colorActive) vars['--ds-button-link-color-active'] = ct.buttonLink.colorActive;
    }

    if (ct.focusRing) vars['--ds-button-focus-ring'] = ct.focusRing;

    if (ct.disabled) {
      if (ct.disabled.opacity != null) vars['--ds-button-disabled-opacity'] = String(ct.disabled.opacity);
      if (ct.disabled.bg) vars['--ds-button-disabled-bg'] = ct.disabled.bg;
      if (ct.disabled.text) vars['--ds-button-disabled-color'] = ct.disabled.text;
      if (ct.disabled.border) vars['--ds-button-disabled-border'] = ct.disabled.border;
      if (ct.disabled.borderColor) vars['--ds-button-disabled-border-color'] = ct.disabled.borderColor;
    }

    // Input chrome (full)
    if (ct.input) {
      const i = ct.input;
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

  // ── Table (full: header + row + cell) ──
  if (c.table) {
    const t = c.table;
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

  // ── Card component ──
  if (c.cardComponent) {
    const cc = c.cardComponent;
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

  // ── Modal ──
  if (c.modal) {
    const m = c.modal;
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

  // ── Tabs ──
  if (c.tabs) {
    const tb = c.tabs;
    if (tb.border) vars['--ds-tabs-border'] = tb.border;
    if (tb.color) vars['--ds-tab-color'] = tb.color;
    if (tb.colorHover) vars['--ds-tab-color-hover'] = tb.colorHover;
    if (tb.colorActive) vars['--ds-tab-color-active'] = tb.colorActive;
    if (tb.bgHover) vars['--ds-tab-bg-hover'] = tb.bgHover;
    if (tb.borderActive) vars['--ds-tab-border-active'] = tb.borderActive;
  }

  // ── Raw token overrides (allowlisted, max 200) ──
  if (advanced.tokenOverrides) {
    let count = 0;
    for (const [key, value] of Object.entries(advanced.tokenOverrides)) {
      if (count >= 200) break;
      if (key.startsWith('--ds-') && value != null) {
        vars[key] = String(value);
        count++;
      }
    }
  }

  return vars;
}

// ── Combined ──────────────────────────────────────────────

/**
 * Convert the full TenantAppearance into CSS custom property overrides.
 * General is applied first, then Advanced layers on top.
 */
export function appearanceToVariables(
  appearance: TenantAppearance
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (appearance.general) {
    Object.assign(vars, appearanceGeneralToVariables(appearance.general));
  }

  if (appearance.advanced) {
    Object.assign(vars, appearanceAdvancedToVariables(appearance.advanced));
  }

  return vars;
}
