/**
 * @fileoverview Shared chrome CSS variable emission.
 *
 * Canonical mapping from a chrome object (sidebar, layout, shell, toolbar,
 * filter pills, breadcrumb, search, controls, table, cards, modal, tabs) to
 * flat --ds-* CSS variable declarations. Used by both runtime/brand-theme
 * (BrandTheme.chrome) and runtime/appearance (TenantAppearanceAdvanced.chrome)
 * — the two shapes are structurally identical because every field on
 * BrandChrome and its nested Brand*Chrome interfaces is already optional, so
 * BrandChrome and TenantAppearanceAdvanced['chrome'] are the same type.
 * Previously duplicated in both locations.
 */

import type {
  BrandChrome,
  BrandButtonVariantChrome,
  BrandPremiumCardChrome,
  BrandListingGridChrome,
} from '@/foundation/contracts/composition/tenants/themes';

/** Map authored button chrome to the engine-consumed variable names. */
function setButtonVariantVars(
  vars: Record<string, string>,
  prefix: string,
  btn: Partial<BrandButtonVariantChrome> | undefined,
): void {
  if (!btn) return;

  if (btn.bg) vars[`--ds-button-${prefix}-bg`] = btn.bg;
  if (btn.bgHover) vars[`--ds-button-${prefix}-bg-hover`] = btn.bgHover;
  if (btn.bgActive) vars[`--ds-button-${prefix}-bg-active`] = btn.bgActive;
  const color = btn.color ?? btn.text;
  if (color) vars[`--ds-button-${prefix}-color`] = color;
  if (btn.border) vars[`--ds-button-${prefix}-border`] = btn.border;
  if (btn.borderHover) vars[`--ds-button-${prefix}-border-hover`] = btn.borderHover;
  if (btn.shadow) vars[`--ds-button-${prefix}-shadow`] = btn.shadow;
  if (btn.shadowHover) vars[`--ds-button-${prefix}-shadow-hover`] = btn.shadowHover;
}

/** Map shared premium card chrome to a namespaced --ds-* variable family. */
function setPremiumCardVars(
  vars: Record<string, string>,
  namespace: string,
  card: Partial<BrandPremiumCardChrome> | undefined,
): void {
  if (!card) return;

  if (card.bg) vars[`--ds-${namespace}-bg`] = card.bg;
  if (card.bgHover) vars[`--ds-${namespace}-bg-hover`] = card.bgHover;
  if (card.border) vars[`--ds-${namespace}-border`] = card.border;
  if (card.borderHover) vars[`--ds-${namespace}-border-hover`] = card.borderHover;
  if (card.selectedBorder) vars[`--ds-${namespace}-selected-border`] = card.selectedBorder;
  if (card.selectedRing) vars[`--ds-${namespace}-selected-ring`] = card.selectedRing;
  if (card.shadow) vars[`--ds-${namespace}-shadow`] = card.shadow;
  if (card.shadowHover) vars[`--ds-${namespace}-shadow-hover`] = card.shadowHover;
  if (card.radius) vars[`--ds-${namespace}-radius`] = card.radius;
  if (card.padding) vars[`--ds-${namespace}-padding`] = card.padding;
  if (card.gap) vars[`--ds-${namespace}-gap`] = card.gap;
  if (card.minHeight) vars[`--ds-${namespace}-min-height`] = card.minHeight;
  if (card.glassBg) vars[`--ds-${namespace}-glass-bg`] = card.glassBg;
  if (card.gridSize) vars[`--ds-${namespace}-grid-size`] = card.gridSize;
  if (card.gridLine) vars[`--ds-${namespace}-grid-line`] = card.gridLine;
  if (card.gridBg) vars[`--ds-${namespace}-grid-bg`] = card.gridBg;
  if (card.overlay) vars[`--ds-${namespace}-overlay`] = card.overlay;
  if (card.sheen) vars[`--ds-${namespace}-sheen`] = card.sheen;
  if (card.depth) vars[`--ds-${namespace}-depth`] = card.depth;
  if (card.hoverTransform) vars[`--ds-${namespace}-hover-transform`] = card.hoverTransform;
  if (card.transition) vars[`--ds-${namespace}-transition`] = card.transition;
  if (card.iconBg) vars[`--ds-${namespace}-icon-bg`] = card.iconBg;
  if (card.iconBorder) vars[`--ds-${namespace}-icon-border`] = card.iconBorder;
  if (card.iconColor) vars[`--ds-${namespace}-icon-color`] = card.iconColor;
  if (card.titleColor) vars[`--ds-${namespace}-title-color`] = card.titleColor;
  if (card.bodyColor) vars[`--ds-${namespace}-body-color`] = card.bodyColor;
  if (card.labelColor) vars[`--ds-${namespace}-label-color`] = card.labelColor;
  if (card.valueColor) vars[`--ds-${namespace}-value-color`] = card.valueColor;
  if (card.valueHoverColor) vars[`--ds-${namespace}-value-color-hover`] = card.valueHoverColor;
  if (card.footerBg) vars[`--ds-${namespace}-footer-bg`] = card.footerBg;
  if (card.footerBorder) vars[`--ds-${namespace}-footer-border`] = card.footerBorder;
  if (card.footerColor) vars[`--ds-${namespace}-footer-color`] = card.footerColor;
  if (card.statusBg) vars[`--ds-${namespace}-status-bg`] = card.statusBg;
  if (card.statusBorder) vars[`--ds-${namespace}-status-border`] = card.statusBorder;
  if (card.statusColor) vars[`--ds-${namespace}-status-color`] = card.statusColor;
  if (card.actionBg) vars[`--ds-${namespace}-action-bg`] = card.actionBg;
  if (card.actionBorder) vars[`--ds-${namespace}-action-border`] = card.actionBorder;
  if (card.actionColor) vars[`--ds-${namespace}-action-color`] = card.actionColor;
  if (card.meterTrack) vars[`--ds-${namespace}-meter-track`] = card.meterTrack;
  if (card.meterTrackBorder) vars[`--ds-${namespace}-meter-track-border`] = card.meterTrackBorder;
  if (card.meterFill) vars[`--ds-${namespace}-meter-fill`] = card.meterFill;
  if (card.numberMinWidth) vars[`--ds-${namespace}-number-min-width`] = card.numberMinWidth;
  if (card.numberFontVariant) vars[`--ds-${namespace}-number-font-variant`] = card.numberFontVariant;
}

/** Map listing-grid chrome used by collection/card view renderers. */
function setListingGridVars(
  vars: Record<string, string>,
  grid: Partial<BrandListingGridChrome> | undefined,
): void {
  if (!grid) return;

  if (grid.gap) vars['--ds-listing-grid-gap'] = grid.gap;
  if (grid.minCardWidth) vars['--ds-listing-grid-min-card-width'] = grid.minCardWidth;
  if (grid.minCompactWidth) vars['--ds-listing-grid-min-compact-width'] = grid.minCompactWidth;
  if (grid.minTallWidth) vars['--ds-listing-grid-min-tall-width'] = grid.minTallWidth;
  if (grid.columns) vars['--ds-listing-grid-columns'] = grid.columns;
  if (grid.cardGap) vars['--ds-listing-grid-card-gap'] = grid.cardGap;
  if (grid.cardBg) vars['--ds-listing-grid-card-bg'] = grid.cardBg;
  if (grid.cardBorder) vars['--ds-listing-grid-card-border'] = grid.cardBorder;
  if (grid.cardShadow) vars['--ds-listing-grid-card-shadow'] = grid.cardShadow;
  if (grid.selectedRing) vars['--ds-listing-grid-selected-ring'] = grid.selectedRing;
  if (grid.emptyBg) vars['--ds-listing-grid-empty-bg'] = grid.emptyBg;
  if (grid.emptyBorder) vars['--ds-listing-grid-empty-border'] = grid.emptyBorder;
  if (grid.skeletonBg) vars['--ds-listing-grid-skeleton-bg'] = grid.skeletonBg;
}

/**
 * Map a chrome object (BrandTheme.chrome or TenantAppearanceAdvanced.chrome)
 * to flat CSS variable declarations.
 *
 * This is the explicit chrome channel — sidebar, layout, shell, controls,
 * and table are NOT shoehorned into tokenOverrides or personality.
 */
export function chromeToVariables(chrome: BrandChrome | undefined): Record<string, string> {
  const vars: Record<string, string> = {};
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
    if (sh.bg) vars['--ds-workspace-shell-bg'] = sh.bg;
    if (sh.border) vars['--ds-workspace-shell-border'] = sh.border;
    if (sh.overlay) vars['--ds-workspace-shell-overlay'] = sh.overlay;
    if (sh.shadow) vars['--ds-workspace-shell-shadow'] = sh.shadow;
    if (sh.activeBg) vars['--ds-shell-active-bg'] = sh.activeBg;
    if (sh.activeGradient) vars['--ds-shell-active-gradient'] = sh.activeGradient;
    if (sh.dropdownShadow) vars['--ds-shell-dropdown-shadow'] = sh.dropdownShadow;
    if (sh.shimmerFaint) vars['--ds-shell-shimmer-faint'] = sh.shimmerFaint;
    if (sh.shimmerSoft) vars['--ds-shell-shimmer-soft'] = sh.shimmerSoft;
    if (sh.shimmerMedium) vars['--ds-shell-shimmer-medium'] = sh.shimmerMedium;
    if (sh.shimmerStrong) vars['--ds-shell-shimmer-strong'] = sh.shimmerStrong;
    if (sh.commandFont) vars['--ds-command-font'] = sh.commandFont;
    if (sh.commandLetterSpacing) vars['--ds-command-letter-spacing'] = sh.commandLetterSpacing;
    if (sh.commandGridSize) vars['--ds-command-grid-size'] = sh.commandGridSize;
    if (sh.commandGridLineSoft) vars['--ds-command-grid-line-soft'] = sh.commandGridLineSoft;
    if (sh.commandGridLine) vars['--ds-command-grid-line'] = sh.commandGridLine;
    if (sh.commandGridLineStrong) vars['--ds-command-grid-line-strong'] = sh.commandGridLineStrong;
    if (sh.commandGridBg) vars['--ds-command-grid-bg'] = sh.commandGridBg;
    if (sh.commandGridBgStrong) vars['--ds-command-grid-bg-strong'] = sh.commandGridBgStrong;
    if (sh.commandGlow) vars['--ds-command-glow'] = sh.commandGlow;
    if (sh.commandLine) vars['--ds-command-line'] = sh.commandLine;
    if (sh.commandRailBg) vars['--ds-command-rail-bg'] = sh.commandRailBg;
    if (sh.commandHomeMaxWidth) vars['--ds-command-home-max-width'] = sh.commandHomeMaxWidth;
    if (sh.commandHomeGap) vars['--ds-command-home-gap'] = sh.commandHomeGap;
    if (sh.commandHomePanelGap) vars['--ds-command-home-panel-gap'] = sh.commandHomePanelGap;
    if (sh.commandHomeGridLine) vars['--ds-command-home-grid-line'] = sh.commandHomeGridLine;
    if (sh.commandHomePanelBorder) vars['--ds-command-home-panel-border'] = sh.commandHomePanelBorder;
    if (sh.commandHomePanelBorderSoft) vars['--ds-command-home-panel-border-soft'] = sh.commandHomePanelBorderSoft;
    if (sh.commandHomePanelShadow) vars['--ds-command-home-panel-shadow'] = sh.commandHomePanelShadow;
    if (sh.commandHomePanelBg) vars['--ds-command-home-panel-bg'] = sh.commandHomePanelBg;
    if (sh.commandHomePanelBgStrong) vars['--ds-command-home-panel-bg-strong'] = sh.commandHomePanelBgStrong;
    if (sh.commandHomeCompactActionHeight) vars['--ds-command-home-compact-action-height'] = sh.commandHomeCompactActionHeight;
    if (sh.commandHomeConsoleMinHeight) vars['--ds-command-home-console-min-height'] = sh.commandHomeConsoleMinHeight;
    if (sh.commandHomeConsolePadding) vars['--ds-command-home-console-padding'] = sh.commandHomeConsolePadding;
    if (sh.commandHomeConsoleBg) vars['--ds-command-home-console-bg'] = sh.commandHomeConsoleBg;
    if (sh.commandHomeSurfaceBg) vars['--ds-command-home-surface-bg'] = sh.commandHomeSurfaceBg;
    if (sh.commandHomeHeroBg) vars['--ds-command-home-hero-bg'] = sh.commandHomeHeroBg;
    if (sh.commandHomeIconBg) vars['--ds-command-home-icon-bg'] = sh.commandHomeIconBg;
    if (sh.commandHomeIconBorder) vars['--ds-command-home-icon-border'] = sh.commandHomeIconBorder;
    if (sh.commandHomeControlBg) vars['--ds-command-home-control-bg'] = sh.commandHomeControlBg;
    if (sh.commandHomeControlBorder) vars['--ds-command-home-control-border'] = sh.commandHomeControlBorder;
    if (sh.commandHomeControlHoverBg) vars['--ds-command-home-control-hover-bg'] = sh.commandHomeControlHoverBg;
    if (sh.commandHomeControlHoverBorder) vars['--ds-command-home-control-hover-border'] = sh.commandHomeControlHoverBorder;
    if (sh.commandHomeMeterBg) vars['--ds-command-home-meter-bg'] = sh.commandHomeMeterBg;
    if (sh.commandHomeMeterFill) vars['--ds-command-home-meter-fill'] = sh.commandHomeMeterFill;
    // gridOpacity is intentionally NOT emitted as a separate CSS variable.
    // The opacity is baked into the gridLine color's alpha channel (e.g.
    // rgba(255,255,255,0.03)). A separate --ds-shell-grid-opacity var had
    // no real consumer — the page-shell background uses the grid line color
    // directly via repeating-linear-gradient.
  }

  // Toolbar
  if (chrome.toolbar) {
    const tb = chrome.toolbar;
    if (tb.bg) vars['--ds-toolbar-bg'] = tb.bg;
    if (tb.border) vars['--ds-toolbar-border'] = tb.border;
    if (tb.borderBottom) vars['--ds-toolbar-border-bottom'] = tb.borderBottom;
    if (tb.color) vars['--ds-toolbar-color'] = tb.color;
    if (tb.shadow) vars['--ds-toolbar-shadow'] = tb.shadow;
    if (tb.radius) vars['--ds-toolbar-radius'] = tb.radius;
    if (tb.padding) vars['--ds-toolbar-padding'] = tb.padding;
    if (tb.gap) vars['--ds-toolbar-gap'] = tb.gap;
    if (tb.controlBg) vars['--ds-toolbar-control-bg'] = tb.controlBg;
    if (tb.controlBorder) vars['--ds-toolbar-control-border'] = tb.controlBorder;
    if (tb.controlColor) vars['--ds-toolbar-control-color'] = tb.controlColor;
    if (tb.divider) vars['--ds-toolbar-divider'] = tb.divider;
  }

  // Filter pills
  if (chrome.filterPill) {
    const fp = chrome.filterPill;
    if (fp.bg) vars['--ds-filter-pill-bg'] = fp.bg;
    if (fp.border) vars['--ds-filter-pill-border'] = fp.border;
    if (fp.color) vars['--ds-filter-pill-color'] = fp.color;
    if (fp.shadow) vars['--ds-filter-pill-shadow'] = fp.shadow;
    if (fp.frameBg) vars['--ds-filter-pill-frame-bg'] = fp.frameBg;
    if (fp.frameBorder) vars['--ds-filter-pill-frame-border'] = fp.frameBorder;
    if (fp.frameShadow) vars['--ds-filter-pill-frame-shadow'] = fp.frameShadow;
    if (fp.hoverBg) vars['--ds-filter-pill-hover-bg'] = fp.hoverBg;
    if (fp.hoverBorder) vars['--ds-filter-pill-hover-border'] = fp.hoverBorder;
    if (fp.activeBg) vars['--ds-filter-pill-active-bg'] = fp.activeBg;
    if (fp.activeBorder) vars['--ds-filter-pill-active-border'] = fp.activeBorder;
    if (fp.activeColor) vars['--ds-filter-pill-active-color'] = fp.activeColor;
    if (fp.activeShadow) vars['--ds-filter-pill-active-shadow'] = fp.activeShadow;
    if (fp.focusRing) vars['--ds-filter-pill-focus-ring'] = fp.focusRing;
    if (fp.countBg) vars['--ds-filter-pill-count-bg'] = fp.countBg;
    if (fp.countActiveBg) vars['--ds-filter-pill-count-active-bg'] = fp.countActiveBg;
    if (fp.countBorder) vars['--ds-filter-pill-count-border'] = fp.countBorder;
    if (fp.countActiveBorder) vars['--ds-filter-pill-count-active-border'] = fp.countActiveBorder;
    if (fp.countRing) vars['--ds-filter-pill-count-ring'] = fp.countRing;
    if (fp.countActiveRing) vars['--ds-filter-pill-count-active-ring'] = fp.countActiveRing;
  }

  // Breadcrumb
  if (chrome.breadcrumb) {
    const bc = chrome.breadcrumb;
    if (bc.bg) vars['--ds-breadcrumb-bg'] = bc.bg;
    if (bc.border) vars['--ds-breadcrumb-border'] = bc.border;
    if (bc.color) vars['--ds-breadcrumb-color'] = bc.color;
    if (bc.linkColor) vars['--ds-breadcrumb-link-color'] = bc.linkColor;
    if (bc.itemColor) vars['--ds-breadcrumb-item-color'] = bc.itemColor;
    if (bc.colorHover) vars['--ds-breadcrumb-color-hover'] = bc.colorHover;
    if (bc.colorActive) {
      vars['--ds-breadcrumb-color-active'] = bc.colorActive;
      vars['--ds-breadcrumb-active-color'] = bc.colorActive;
    }
    if (bc.separatorColor) vars['--ds-breadcrumb-separator-color'] = bc.separatorColor;
    if (bc.fontSize) vars['--ds-breadcrumb-font-size'] = bc.fontSize;
    if (bc.fontWeight != null) vars['--ds-breadcrumb-font-weight'] = String(bc.fontWeight);
    if (bc.padding) vars['--ds-breadcrumb-padding'] = bc.padding;
  }

  // Search
  if (chrome.search) {
    const se = chrome.search;
    if (se.bg) vars['--ds-search-bg'] = se.bg;
    if (se.border) vars['--ds-search-border'] = se.border;
    if (se.color) vars['--ds-search-color'] = se.color;
    if (se.shadow) vars['--ds-search-shadow'] = se.shadow;
    if (se.radius) vars['--ds-search-radius'] = se.radius;
    if (se.inputBg) vars['--ds-search-input-bg'] = se.inputBg;
    if (se.inputBorder) vars['--ds-search-input-border'] = se.inputBorder;
    if (se.inputColor) vars['--ds-search-input-color'] = se.inputColor;
    if (se.placeholderColor) vars['--ds-search-placeholder-color'] = se.placeholderColor;
    if (se.iconColor) {
      vars['--ds-search-icon-color'] = se.iconColor;
      vars['--ds-input-search-icon-color'] = se.iconColor;
    }
    if (se.clearColor) {
      vars['--ds-search-clear-color'] = se.clearColor;
      vars['--ds-input-search-clear-color'] = se.clearColor;
    }
    if (se.clearColorHover) vars['--ds-search-clear-color-hover'] = se.clearColorHover;
    if (se.resultBg) vars['--ds-search-result-bg'] = se.resultBg;
    if (se.resultBgHover) vars['--ds-search-result-bg-hover'] = se.resultBgHover;
    if (se.resultBorder) vars['--ds-search-result-border'] = se.resultBorder;
    if (se.resultShadow) vars['--ds-search-result-shadow'] = se.resultShadow;
    if (se.resultTitleColor) vars['--ds-search-result-title-color'] = se.resultTitleColor;
    if (se.resultMetaColor) vars['--ds-search-result-meta-color'] = se.resultMetaColor;
    if (se.categoryColor) vars['--ds-search-category-color'] = se.categoryColor;
    if (se.emptyBg) vars['--ds-search-empty-bg'] = se.emptyBg;
  }

  // Controls — all button variants
  if (chrome.controls) {
    const c = chrome.controls;

    setButtonVariantVars(vars, 'primary', c.buttonPrimary);
    setButtonVariantVars(vars, 'secondary', c.buttonSecondary);
    setButtonVariantVars(vars, 'default', c.buttonDefault);
    setButtonVariantVars(vars, 'ghost', c.buttonGhost);
    setButtonVariantVars(vars, 'text', c.buttonText);
    setButtonVariantVars(vars, 'success', c.buttonSuccess);
    setButtonVariantVars(vars, 'warning', c.buttonWarning);
    setButtonVariantVars(vars, 'error', c.buttonError);
    setButtonVariantVars(vars, 'info', c.buttonInfo);

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
    if (t.radius) vars['--ds-table-radius'] = t.radius;
    if (t.headerBg) vars['--ds-table-header-bg'] = t.headerBg;
    if (t.headerBgHover) vars['--ds-table-header-bg-hover'] = t.headerBgHover;
    if (t.headerColor) vars['--ds-table-header-color'] = t.headerColor;
    if (t.headerFontWeight != null) vars['--ds-table-header-font-weight'] = String(t.headerFontWeight);
    if (t.headerFontSize) vars['--ds-table-header-font-size'] = t.headerFontSize;
    if (t.headerBorder) vars['--ds-table-header-border'] = t.headerBorder;
    if (t.headerShadow) vars['--ds-table-header-shadow'] = t.headerShadow;
    if (t.rowBg) vars['--ds-table-row-bg'] = t.rowBg;
    // One name per channel. Components consume the `-bg-hover` / `-bg-striped`
    // spelling; a second alias for the same value has no consumer anywhere in
    // the design system or the three consuming apps.
    if (t.rowBgHover) vars['--ds-table-row-bg-hover'] = t.rowBgHover;
    if (t.rowBgStriped) vars['--ds-table-row-bg-striped'] = t.rowBgStriped;
    if (t.rowBgSelected) vars['--ds-table-row-bg-selected'] = t.rowBgSelected;
    if (t.rowBgExpanded) vars['--ds-table-row-bg-expanded'] = t.rowBgExpanded;
    if (t.rowBorder) vars['--ds-table-row-border'] = t.rowBorder;
    if (t.rowHoverShadow) vars['--ds-table-row-hover-shadow'] = t.rowHoverShadow;
    if (t.cellPadding) vars['--ds-table-cell-padding'] = t.cellPadding;
    if (t.cellFontSize) vars['--ds-table-cell-font-size'] = t.cellFontSize;
    if (t.cellColor) vars['--ds-table-cell-color'] = t.cellColor;
    if (t.filterRowBg) vars['--ds-table-filter-row-bg'] = t.filterRowBg;
    if (t.filterFocusShadow) vars['--ds-table-filter-focus-shadow'] = t.filterFocusShadow;
    if (t.resizeBg) vars['--ds-table-resize-bg'] = t.resizeBg;
    if (t.resizeBgHover) vars['--ds-table-resize-bg-hover'] = t.resizeBgHover;
    if (t.reorderBg) vars['--ds-table-reorder-bg'] = t.reorderBg;
    if (t.actionBg) vars['--ds-table-action-bg'] = t.actionBg;
    if (t.actionBorder) vars['--ds-table-action-border'] = t.actionBorder;
    if (t.sheen) vars['--ds-table-sheen'] = t.sheen;
    if (t.pageButtonHoverShadow) vars['--ds-table-page-button-hover-shadow'] = t.pageButtonHoverShadow;
    if (t.loadingOverlayBg) vars['--ds-table-loading-overlay-bg'] = t.loadingOverlayBg;
  }

  // Card component chrome
  if (chrome.cardComponent) {
    const cc = chrome.cardComponent;
    if (cc.padding) vars['--ds-card-padding'] = cc.padding;
    if (cc.paddingSm) vars['--ds-card-padding-sm'] = cc.paddingSm;
    if (cc.paddingMd) vars['--ds-card-padding-md'] = cc.paddingMd;
    if (cc.paddingLg) vars['--ds-card-padding-lg'] = cc.paddingLg;
    if (cc.paddingXl) vars['--ds-card-padding-xl'] = cc.paddingXl;
    if (cc.bg) vars['--ds-card-bg'] = cc.bg;
    if (cc.bgHover) vars['--ds-card-bg-hover'] = cc.bgHover;
    if (cc.color) vars['--ds-card-color'] = cc.color;
    if (cc.colorMuted) vars['--ds-card-color-muted'] = cc.colorMuted;
    if (cc.border) vars['--ds-card-border'] = cc.border;
    if (cc.border) vars['--ds-card-border-color'] = cc.border;
    if (cc.borderColor) vars['--ds-card-border-color'] = cc.borderColor;
    if (cc.borderHover) vars['--ds-card-border-hover'] = cc.borderHover;
    if (cc.borderHover) vars['--ds-card-border-color-hover'] = cc.borderHover;
    if (cc.borderColorHover) vars['--ds-card-border-color-hover'] = cc.borderColorHover;
    if (cc.borderAccentHover) vars['--ds-card-border-accent-hover'] = cc.borderAccentHover;
    if (cc.radius) {
      vars['--ds-card-radius'] = cc.radius;
      vars['--ds-card-border-radius'] = cc.radius;
    }
    if (cc.shadow) vars['--ds-card-shadow'] = cc.shadow;
    if (cc.shadowHover) vars['--ds-card-shadow-hover'] = cc.shadowHover;
    if (cc.shadowElevated) vars['--ds-card-shadow-elevated'] = cc.shadowElevated;
    if (cc.focusRing) vars['--ds-card-focus-ring'] = cc.focusRing;
    if (cc.hoverTransform) vars['--ds-card-hover-transform'] = cc.hoverTransform;
    if (cc.headerBorder) vars['--ds-card-header-border'] = cc.headerBorder;
    if (cc.headerBorder) vars['--ds-card-header-border-color'] = cc.headerBorder;
    if (cc.headerBorderColor) vars['--ds-card-header-border-color'] = cc.headerBorderColor;
    if (cc.headerBg) vars['--ds-card-header-bg'] = cc.headerBg;
    if (cc.headerColor) vars['--ds-card-header-color'] = cc.headerColor;
    if (cc.headerPadding) vars['--ds-card-header-padding'] = cc.headerPadding;
    if (cc.titleColor) vars['--ds-card-title-color'] = cc.titleColor;
    if (cc.titleFontSize) vars['--ds-card-title-font-size'] = cc.titleFontSize;
    if (cc.titleFontWeight != null) vars['--ds-card-title-font-weight'] = String(cc.titleFontWeight);
    if (cc.subtitleColor) vars['--ds-card-subtitle-color'] = cc.subtitleColor;
    if (cc.bodyColor) vars['--ds-card-body-color'] = cc.bodyColor;
    if (cc.bodyPadding) vars['--ds-card-body-padding'] = cc.bodyPadding;
    if (cc.footerBorder) vars['--ds-card-footer-border'] = cc.footerBorder;
    if (cc.footerBorder) vars['--ds-card-footer-border-color'] = cc.footerBorder;
    if (cc.footerBorderColor) vars['--ds-card-footer-border-color'] = cc.footerBorderColor;
    if (cc.footerBg) vars['--ds-card-footer-bg'] = cc.footerBg;
    if (cc.footerColor) vars['--ds-card-footer-color'] = cc.footerColor;
    if (cc.footerPadding) vars['--ds-card-footer-padding'] = cc.footerPadding;
    if (cc.imagePlaceholderBg) vars['--ds-card-image-placeholder-bg'] = cc.imagePlaceholderBg;
    if (cc.imagePlaceholderColor) vars['--ds-card-image-placeholder-color'] = cc.imagePlaceholderColor;
  }

  // Metric/stat card chrome
  if (chrome.metricCard) {
    const mc = chrome.metricCard;
    setPremiumCardVars(vars, 'metric-card', mc);
    if (mc.bg) vars['--ds-metric-card-bg'] = mc.bg;
    if (mc.border) vars['--ds-metric-card-border'] = mc.border;
    if (mc.borderHover) vars['--ds-metric-card-border-hover'] = mc.borderHover;
    if (mc.selectedBorder) vars['--ds-metric-card-selected-border'] = mc.selectedBorder;
    if (mc.selectedRing) vars['--ds-metric-card-selected-ring'] = mc.selectedRing;
    if (mc.shadow) vars['--ds-metric-card-shadow'] = mc.shadow;
    if (mc.shadowHover) vars['--ds-metric-card-shadow-hover'] = mc.shadowHover;
    if (mc.sheen) vars['--ds-metric-card-sheen'] = mc.sheen;
    if (mc.iconBg) vars['--ds-metric-card-icon-bg'] = mc.iconBg;
    if (mc.iconBorder) vars['--ds-metric-card-icon-border'] = mc.iconBorder;
    if (mc.iconColor) vars['--ds-metric-card-icon-color'] = mc.iconColor;
    if (mc.labelColor) vars['--ds-metric-card-label-color'] = mc.labelColor;
    if (mc.valueColor) vars['--ds-metric-card-value-color'] = mc.valueColor;
    if (mc.valueHoverColor) vars['--ds-metric-card-value-color-hover'] = mc.valueHoverColor;
    if (mc.trendColor) vars['--ds-metric-card-trend-color'] = mc.trendColor;
    if (mc.trendColorWarning) vars['--ds-metric-card-trend-color-warning'] = mc.trendColorWarning;
    if (mc.trendColorError) vars['--ds-metric-card-trend-color-error'] = mc.trendColorError;
    if (mc.trendErrorBg) vars['--ds-metric-card-trend-error-bg'] = mc.trendErrorBg;
    if (mc.trendErrorBorder) vars['--ds-metric-card-trend-error-border'] = mc.trendErrorBorder;
    if (mc.meterTrack) vars['--ds-metric-card-meter-track'] = mc.meterTrack;
    if (mc.meterTrackBorder) vars['--ds-metric-card-meter-track-border'] = mc.meterTrackBorder;
    if (mc.meterFill) vars['--ds-metric-card-meter-fill'] = mc.meterFill;
    if (mc.meterFillSuccess) vars['--ds-metric-card-meter-fill-success'] = mc.meterFillSuccess;
    if (mc.meterFillWarning) vars['--ds-metric-card-meter-fill-warning'] = mc.meterFillWarning;
    if (mc.meterFillError) vars['--ds-metric-card-meter-fill-error'] = mc.meterFillError;
    if (mc.meterFillNeutral) vars['--ds-metric-card-meter-fill-neutral'] = mc.meterFillNeutral;
    if (mc.meterHeight) vars['--ds-metric-card-meter-height'] = mc.meterHeight;
  }

  // Signal/status card chrome
  if (chrome.signalCard) {
    const sc = chrome.signalCard;
    setPremiumCardVars(vars, 'signal-card', sc);
    if (sc.accent) vars['--ds-signal-card-accent'] = sc.accent;
    if (sc.soft) vars['--ds-signal-card-soft'] = sc.soft;
    if (sc.bg) vars['--ds-signal-card-bg'] = sc.bg;
    if (sc.border) vars['--ds-signal-card-border'] = sc.border;
    if (sc.borderHover) vars['--ds-signal-card-border-hover'] = sc.borderHover;
    if (sc.shadow) vars['--ds-signal-card-shadow'] = sc.shadow;
    if (sc.shadowHover) vars['--ds-signal-card-shadow-hover'] = sc.shadowHover;
    if (sc.iconBg) vars['--ds-signal-card-icon-bg'] = sc.iconBg;
    if (sc.iconBorder) vars['--ds-signal-card-icon-border'] = sc.iconBorder;
    if (sc.titleColor) vars['--ds-signal-card-title-color'] = sc.titleColor;
    if (sc.bodyColor) vars['--ds-signal-card-body-color'] = sc.bodyColor;
    if (sc.badgeBg) vars['--ds-signal-card-badge-bg'] = sc.badgeBg;
    if (sc.badgeBorder) vars['--ds-signal-card-badge-border'] = sc.badgeBorder;
    if (sc.badgeColor) vars['--ds-signal-card-badge-color'] = sc.badgeColor;
    if (sc.sectionBg) vars['--ds-signal-card-section-bg'] = sc.sectionBg;
    if (sc.sectionAltBg) vars['--ds-signal-card-section-alt-bg'] = sc.sectionAltBg;
    if (sc.meterTrack) vars['--ds-signal-card-meter-track'] = sc.meterTrack;
    if (sc.meterTrackBorder) vars['--ds-signal-card-meter-track-border'] = sc.meterTrackBorder;
    if (sc.meterFill) vars['--ds-signal-card-meter-fill'] = sc.meterFill;
    if (sc.topLineDisplay) vars['--ds-signal-card-top-line-display'] = sc.topLineDisplay;
  }

  setPremiumCardVars(vars, 'workspace-card', chrome.workspaceCard);
  setPremiumCardVars(vars, 'compact-card', chrome.compactCard);
  setPremiumCardVars(vars, 'tall-card', chrome.tallCard);
  setPremiumCardVars(vars, 'collection-card', chrome.collectionCard);
  setListingGridVars(vars, chrome.listingGrid);

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
