import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";

function setSidebarLeafVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.sidebar) {
    const s = chrome.sidebar;
    if (s.bg) vars["--ds-sidebar-bg"] = s.bg;
    if (s.border) vars["--ds-sidebar-border"] = s.border;
    if (s.text) vars["--ds-sidebar-text"] = s.text;
    if (s.textMuted) vars["--ds-sidebar-text-muted"] = s.textMuted;
    if (s.width) {
      vars["--ds-sidebar-width"] = s.width;
      vars["--ds-shell-sidebar-width"] = s.width;
    }
    if (s.collapsedWidth) {
      vars["--ds-sidebar-collapsed-width"] = s.collapsedWidth;
      vars["--ds-shell-sidebar-collapsed-width"] = s.collapsedWidth;
    }
    if (s.headerHeight) {
      vars["--ds-sidebar-header-height"] = s.headerHeight;
      vars["--ds-shell-sidebar-header-block-size"] = s.headerHeight;
    }
    // The group, item and icon geometry below is read by the menu deriver,
    // which chains its --ds-menu-* channels off these --ds-sidebar-* roots.
    if (s.iconSize) vars["--ds-sidebar-icon-size"] = s.iconSize;
    if (s.iconColumnSize)
      vars["--ds-sidebar-icon-column-size"] = s.iconColumnSize;
    if (s.itemHeight) vars["--ds-sidebar-item-height"] = s.itemHeight;
    if (s.childPaddingInline)
      vars["--ds-sidebar-child-padding-inline"] = s.childPaddingInline;
    if (s.groupFontSize) vars["--ds-sidebar-group-font-size"] = s.groupFontSize;
    if (s.groupFontWeight != null)
      vars["--ds-sidebar-group-font-weight"] = String(s.groupFontWeight);
    if (s.groupColor) vars["--ds-sidebar-group-color"] = s.groupColor;
    if (s.groupLetterSpacing)
      vars["--ds-sidebar-group-letter-spacing"] = s.groupLetterSpacing;
    if (s.groupMarginTop)
      vars["--ds-sidebar-group-margin-top"] = s.groupMarginTop;
    if (s.groupMarginBottom)
      vars["--ds-sidebar-group-margin-bottom"] = s.groupMarginBottom;
    if (s.groupPaddingTop)
      vars["--ds-sidebar-group-padding-top"] = s.groupPaddingTop;
    if (s.itemIndent) vars["--ds-sidebar-item-indent"] = s.itemIndent;
    // Axis-specific navigation geometry. `initial` is a legal authored value
    // here: it is how a mode states "this column has no value at the tenant
    // root", which is not the same statement as omitting the field.
    if (s.shellPaddingInline)
      vars["--ds-sidebar-shell-padding-inline"] = s.shellPaddingInline;
    if (s.shellPaddingCollapsed)
      vars["--ds-sidebar-shell-padding-collapsed"] = s.shellPaddingCollapsed;
    if (s.itemChildHeight)
      vars["--ds-sidebar-item-child-height"] = s.itemChildHeight;
    if (s.itemFontSizeChild)
      vars["--ds-sidebar-item-font-size-child"] = s.itemFontSizeChild;
    if (s.itemPaddingInline)
      vars["--ds-sidebar-item-padding-inline"] = s.itemPaddingInline;
    if (s.itemGap) vars["--ds-sidebar-item-gap"] = s.itemGap;
    if (s.itemFontSize) vars["--ds-sidebar-item-font-size"] = s.itemFontSize;
    if (s.itemFontWeight != null)
      vars["--ds-sidebar-item-font-weight"] = String(s.itemFontWeight);
    if (s.itemFontWeightActive != null)
      vars["--ds-sidebar-item-font-weight-active"] = String(
        s.itemFontWeightActive
      );
    if (s.itemColor) vars["--ds-sidebar-item-color"] = s.itemColor;
    if (s.itemColorActive)
      vars["--ds-sidebar-item-color-active"] = s.itemColorActive;
    if (s.itemBgActive) vars["--ds-sidebar-item-bg-active"] = s.itemBgActive;
    if (s.itemBgHover) vars["--ds-sidebar-item-bg-hover"] = s.itemBgHover;
    if (s.itemPadding) vars["--ds-sidebar-item-padding"] = s.itemPadding;
    if (s.footerBg) vars["--ds-sidebar-footer-bg"] = s.footerBg;
  }
}

function setLayoutVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Layout
  if (chrome.layout) {
    const l = chrome.layout;
    if (l.bg) vars["--ds-layout-bg"] = l.bg;
    if (l.headerBg) vars["--ds-layout-header-bg"] = l.headerBg;
    if (l.headerHeight) {
      vars["--ds-layout-header-height"] = l.headerHeight;
      vars["--ds-shell-header-block-size"] = l.headerHeight;
      // AppShell resolves the header through
      // `var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, …))`,
      // so the legacy fallback spelling stays reachable from the same field.
      vars["--ds-shell-topbar-height"] = l.headerHeight;
    }
    if (l.headerBackdrop)
      vars["--ds-layout-header-backdrop"] = l.headerBackdrop;
    if (l.headerBorder) vars["--ds-layout-header-border"] = l.headerBorder;
    if (l.siderBg) vars["--ds-layout-sider-bg"] = l.siderBg;
    if (l.siderBorder) vars["--ds-layout-sider-border"] = l.siderBorder;
    if (l.containerBackground)
      vars["--ds-container-background"] = l.containerBackground;
    if (l.containerBorder) vars["--ds-container-border"] = l.containerBorder;
    if (l.containerRadius) vars["--ds-container-radius"] = l.containerRadius;
    if (l.containerShadow) vars["--ds-container-shadow"] = l.containerShadow;
    if (l.containerMotionDuration)
      vars["--ds-container-motion-duration"] = l.containerMotionDuration;
    if (l.containerMotionEasing)
      vars["--ds-container-motion-easing"] = l.containerMotionEasing;
    if (l.aspectRatioBackground)
      vars["--ds-aspect-ratio-background"] = l.aspectRatioBackground;
    if (l.aspectRatioBorder)
      vars["--ds-aspect-ratio-border"] = l.aspectRatioBorder;
    if (l.aspectRatioRadius)
      vars["--ds-aspect-ratio-radius"] = l.aspectRatioRadius;
    if (l.aspectRatioShadow)
      vars["--ds-aspect-ratio-shadow"] = l.aspectRatioShadow;
    if (l.aspectRatioOverflow)
      vars["--ds-aspect-ratio-overflow"] = l.aspectRatioOverflow;
    if (l.aspectRatioMotionDuration)
      vars["--ds-aspect-ratio-motion-duration"] = l.aspectRatioMotionDuration;
    if (l.aspectRatioMotionEasing)
      vars["--ds-aspect-ratio-motion-easing"] = l.aspectRatioMotionEasing;
    if (l.dividerColor) vars["--ds-divider-color"] = l.dividerColor;
    if (l.dividerTextColor)
      vars["--ds-divider-text-color"] = l.dividerTextColor;
    if (l.dividerThicknessThin)
      vars["--ds-divider-thickness-thin"] = l.dividerThicknessThin;
    if (l.dividerThicknessMedium)
      vars["--ds-divider-thickness-medium"] = l.dividerThicknessMedium;
    if (l.dividerThicknessThick)
      vars["--ds-divider-thickness-thick"] = l.dividerThicknessThick;
    if (l.dividerContentGap)
      vars["--ds-divider-content-gap"] = l.dividerContentGap;
    if (l.dividerEdgeSegment)
      vars["--ds-divider-edge-segment"] = l.dividerEdgeSegment;
    if (l.dividerMinSegment)
      vars["--ds-divider-min-segment"] = l.dividerMinSegment;
    if (l.dividerLabelMaxWidth)
      vars["--ds-divider-label-max-width"] = l.dividerLabelMaxWidth;
    if (l.dividerLabelFontSize)
      vars["--ds-divider-label-font-size"] = l.dividerLabelFontSize;
    if (l.dividerLabelFontWeight != null)
      vars["--ds-divider-label-font-weight"] = String(l.dividerLabelFontWeight);
    if (l.dividerLabelLineHeight)
      vars["--ds-divider-label-line-height"] = l.dividerLabelLineHeight;
    if (l.dividerLabelTransform)
      vars["--ds-divider-label-transform"] = l.dividerLabelTransform;
    if (l.dividerLabelTracking)
      vars["--ds-divider-label-tracking"] = l.dividerLabelTracking;
    if (l.dividerMotionDuration)
      vars["--ds-divider-motion-duration"] = l.dividerMotionDuration;
    if (l.dividerMotionEasing)
      vars["--ds-divider-motion-easing"] = l.dividerMotionEasing;
    if (l.stackDividerSize)
      vars["--ds-stack-divider-size"] = l.stackDividerSize;
    if (l.stackDividerColor)
      vars["--ds-stack-divider-color"] = l.stackDividerColor;
    if (l.stackDividerOpacity != null)
      vars["--ds-stack-divider-opacity"] = String(l.stackDividerOpacity);
    if (l.spaceMotionDuration)
      vars["--ds-space-motion-duration"] = l.spaceMotionDuration;
    if (l.spaceMotionEasing)
      vars["--ds-space-motion-easing"] = l.spaceMotionEasing;
  }
}

function setShellVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Shell
  if (chrome.shell) {
    const sh = chrome.shell;
    if (sh.gridSize) vars["--ds-shell-grid-size"] = sh.gridSize;
    if (sh.gridLine) vars["--ds-shell-grid-line"] = sh.gridLine;
    if (sh.bg) vars["--ds-workspace-shell-bg"] = sh.bg;
    if (sh.border) vars["--ds-workspace-shell-border"] = sh.border;
    if (sh.overlay) vars["--ds-workspace-shell-overlay"] = sh.overlay;
    if (sh.shadow) vars["--ds-workspace-shell-shadow"] = sh.shadow;
    if (sh.activeBg) vars["--ds-shell-active-bg"] = sh.activeBg;
    if (sh.activeGradient)
      vars["--ds-shell-active-gradient"] = sh.activeGradient;
    if (sh.dropdownShadow)
      vars["--ds-shell-dropdown-shadow"] = sh.dropdownShadow;
    if (sh.shimmerFaint) vars["--ds-shell-shimmer-faint"] = sh.shimmerFaint;
    if (sh.shimmerSoft) vars["--ds-shell-shimmer-soft"] = sh.shimmerSoft;
    if (sh.shimmerMedium) vars["--ds-shell-shimmer-medium"] = sh.shimmerMedium;
    if (sh.shimmerStrong) vars["--ds-shell-shimmer-strong"] = sh.shimmerStrong;
    if (sh.commandFont) vars["--ds-command-font"] = sh.commandFont;
    if (sh.commandLetterSpacing)
      vars["--ds-command-letter-spacing"] = sh.commandLetterSpacing;
    if (sh.commandGridSize) vars["--ds-command-grid-size"] = sh.commandGridSize;
    if (sh.commandGridLineSoft)
      vars["--ds-command-grid-line-soft"] = sh.commandGridLineSoft;
    if (sh.commandGridLine) vars["--ds-command-grid-line"] = sh.commandGridLine;
    if (sh.commandGridLineStrong)
      vars["--ds-command-grid-line-strong"] = sh.commandGridLineStrong;
    if (sh.commandGridBg) vars["--ds-command-grid-bg"] = sh.commandGridBg;
    if (sh.commandGridBgStrong)
      vars["--ds-command-grid-bg-strong"] = sh.commandGridBgStrong;
    if (sh.commandGlow) vars["--ds-command-glow"] = sh.commandGlow;
    if (sh.commandLine) vars["--ds-command-line"] = sh.commandLine;
    if (sh.commandRailBg) vars["--ds-command-rail-bg"] = sh.commandRailBg;
    if (sh.commandHomeMaxWidth)
      vars["--ds-command-home-max-width"] = sh.commandHomeMaxWidth;
    if (sh.commandHomeGap) vars["--ds-command-home-gap"] = sh.commandHomeGap;
    if (sh.commandHomePanelGap)
      vars["--ds-command-home-panel-gap"] = sh.commandHomePanelGap;
    if (sh.commandHomeGridLine)
      vars["--ds-command-home-grid-line"] = sh.commandHomeGridLine;
    if (sh.commandHomePanelBorder)
      vars["--ds-command-home-panel-border"] = sh.commandHomePanelBorder;
    if (sh.commandHomePanelBorderSoft)
      vars["--ds-command-home-panel-border-soft"] =
        sh.commandHomePanelBorderSoft;
    if (sh.commandHomePanelShadow)
      vars["--ds-command-home-panel-shadow"] = sh.commandHomePanelShadow;
    if (sh.commandHomePanelBg)
      vars["--ds-command-home-panel-bg"] = sh.commandHomePanelBg;
    if (sh.commandHomePanelBgStrong)
      vars["--ds-command-home-panel-bg-strong"] = sh.commandHomePanelBgStrong;
    if (sh.commandHomeCompactActionHeight)
      vars["--ds-command-home-compact-action-height"] =
        sh.commandHomeCompactActionHeight;
    if (sh.commandHomeConsoleMinHeight)
      vars["--ds-command-home-console-min-height"] =
        sh.commandHomeConsoleMinHeight;
    if (sh.commandHomeConsolePadding)
      vars["--ds-command-home-console-padding"] = sh.commandHomeConsolePadding;
    if (sh.commandHomeConsoleBg)
      vars["--ds-command-home-console-bg"] = sh.commandHomeConsoleBg;
    if (sh.commandHomeSurfaceBg)
      vars["--ds-command-home-surface-bg"] = sh.commandHomeSurfaceBg;
    if (sh.commandHomeHeroBg)
      vars["--ds-command-home-hero-bg"] = sh.commandHomeHeroBg;
    if (sh.commandHomeIconBg)
      vars["--ds-command-home-icon-bg"] = sh.commandHomeIconBg;
    if (sh.commandHomeIconBorder)
      vars["--ds-command-home-icon-border"] = sh.commandHomeIconBorder;
    if (sh.commandHomeControlBg)
      vars["--ds-command-home-control-bg"] = sh.commandHomeControlBg;
    if (sh.commandHomeControlBorder)
      vars["--ds-command-home-control-border"] = sh.commandHomeControlBorder;
    if (sh.commandHomeControlHoverBg)
      vars["--ds-command-home-control-hover-bg"] = sh.commandHomeControlHoverBg;
    if (sh.commandHomeControlHoverBorder)
      vars["--ds-command-home-control-hover-border"] =
        sh.commandHomeControlHoverBorder;
    if (sh.commandHomeMeterBg)
      vars["--ds-command-home-meter-bg"] = sh.commandHomeMeterBg;
    if (sh.commandHomeMeterFill)
      vars["--ds-command-home-meter-fill"] = sh.commandHomeMeterFill;
    // gridOpacity is intentionally NOT emitted as a separate CSS variable.
    // The opacity is baked into the gridLine color's alpha channel (e.g.
    // rgba(255,255,255,0.03)). A separate --ds-shell-grid-opacity var had
    // no real consumer — the page-shell background uses the grid line color
    // directly via repeating-linear-gradient.
  }
}

function setToolbarVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Toolbar
  if (chrome.toolbar) {
    const tb = chrome.toolbar;
    if (tb.bg) vars["--ds-toolbar-bg"] = tb.bg;
    if (tb.border) vars["--ds-toolbar-border"] = tb.border;
    if (tb.borderBottom) vars["--ds-toolbar-border-bottom"] = tb.borderBottom;
    if (tb.color) vars["--ds-toolbar-color"] = tb.color;
    if (tb.shadow) vars["--ds-toolbar-shadow"] = tb.shadow;
    if (tb.radius) vars["--ds-toolbar-radius"] = tb.radius;
    if (tb.padding) vars["--ds-toolbar-padding"] = tb.padding;
    if (tb.gap) vars["--ds-toolbar-gap"] = tb.gap;
    if (tb.controlBg) vars["--ds-toolbar-control-bg"] = tb.controlBg;
    if (tb.controlBorder)
      vars["--ds-toolbar-control-border"] = tb.controlBorder;
    if (tb.controlColor) vars["--ds-toolbar-control-color"] = tb.controlColor;
    if (tb.divider) vars["--ds-toolbar-divider"] = tb.divider;
  }
}

function setFilterPillVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Filter pills
  if (chrome.filterPill) {
    const fp = chrome.filterPill;
    if (fp.bg) vars["--ds-filter-pill-bg"] = fp.bg;
    if (fp.border) vars["--ds-filter-pill-border"] = fp.border;
    if (fp.color) vars["--ds-filter-pill-color"] = fp.color;
    if (fp.shadow) vars["--ds-filter-pill-shadow"] = fp.shadow;
    if (fp.frameBg) vars["--ds-filter-pill-frame-bg"] = fp.frameBg;
    if (fp.frameBorder) vars["--ds-filter-pill-frame-border"] = fp.frameBorder;
    if (fp.frameShadow) vars["--ds-filter-pill-frame-shadow"] = fp.frameShadow;
    if (fp.hoverBg) vars["--ds-filter-pill-hover-bg"] = fp.hoverBg;
    if (fp.hoverBorder) vars["--ds-filter-pill-hover-border"] = fp.hoverBorder;
    if (fp.activeBg) vars["--ds-filter-pill-active-bg"] = fp.activeBg;
    if (fp.activeBorder)
      vars["--ds-filter-pill-active-border"] = fp.activeBorder;
    if (fp.activeColor) vars["--ds-filter-pill-active-color"] = fp.activeColor;
    if (fp.activeShadow)
      vars["--ds-filter-pill-active-shadow"] = fp.activeShadow;
    if (fp.focusRing) vars["--ds-filter-pill-focus-ring"] = fp.focusRing;
    if (fp.countBg) vars["--ds-filter-pill-count-bg"] = fp.countBg;
    if (fp.countActiveBg)
      vars["--ds-filter-pill-count-active-bg"] = fp.countActiveBg;
    if (fp.countBorder) vars["--ds-filter-pill-count-border"] = fp.countBorder;
    if (fp.countActiveBorder)
      vars["--ds-filter-pill-count-active-border"] = fp.countActiveBorder;
    if (fp.countRing) vars["--ds-filter-pill-count-ring"] = fp.countRing;
    if (fp.countActiveRing)
      vars["--ds-filter-pill-count-active-ring"] = fp.countActiveRing;
  }
}

function setBreadcrumbVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Breadcrumb
  if (chrome.breadcrumb) {
    const bc = chrome.breadcrumb;
    if (bc.bg) vars["--ds-breadcrumb-bg"] = bc.bg;
    if (bc.border) vars["--ds-breadcrumb-border"] = bc.border;
    if (bc.color) vars["--ds-breadcrumb-color"] = bc.color;
    if (bc.linkColor) vars["--ds-breadcrumb-link-color"] = bc.linkColor;
    if (bc.itemColor) vars["--ds-breadcrumb-item-color"] = bc.itemColor;
    if (bc.colorHover) vars["--ds-breadcrumb-color-hover"] = bc.colorHover;
    if (bc.colorActive) {
      vars["--ds-breadcrumb-color-active"] = bc.colorActive;
      vars["--ds-breadcrumb-active-color"] = bc.colorActive;
    }
    if (bc.separatorColor)
      vars["--ds-breadcrumb-separator-color"] = bc.separatorColor;
    if (bc.fontSize) vars["--ds-breadcrumb-font-size"] = bc.fontSize;
    if (bc.fontWeight != null)
      vars["--ds-breadcrumb-font-weight"] = String(bc.fontWeight);
    if (bc.padding) vars["--ds-breadcrumb-padding"] = bc.padding;
  }
}

function setSearchVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Search
  if (chrome.search) {
    const se = chrome.search;
    const cp = se.commandPalette;
    if (cp) {
      if (cp.backdrop) vars["--ds-command-palette-backdrop"] = cp.backdrop;
      if (cp.bg) vars["--ds-command-palette-bg"] = cp.bg;
      if (cp.border) vars["--ds-command-palette-border"] = cp.border;
      if (cp.emptyColor)
        vars["--ds-command-palette-empty-color"] = cp.emptyColor;
      if (cp.groupColor)
        vars["--ds-command-palette-group-color"] = cp.groupColor;
      if (cp.itemHoverBg)
        vars["--ds-command-palette-item-hover-bg"] = cp.itemHoverBg;
      if (cp.shortcutBorder)
        vars["--ds-command-palette-shortcut-border"] = cp.shortcutBorder;
    }
    if (se.bg) vars["--ds-search-bg"] = se.bg;
    if (se.border) vars["--ds-search-border"] = se.border;
    if (se.color) vars["--ds-search-color"] = se.color;
    if (se.shadow) vars["--ds-search-shadow"] = se.shadow;
    if (se.radius) vars["--ds-search-radius"] = se.radius;
    if (se.inputBg) vars["--ds-search-input-bg"] = se.inputBg;
    if (se.inputBorder) vars["--ds-search-input-border"] = se.inputBorder;
    if (se.inputColor) vars["--ds-search-input-color"] = se.inputColor;
    if (se.placeholderColor)
      vars["--ds-search-placeholder-color"] = se.placeholderColor;
    if (se.iconColor) {
      vars["--ds-search-icon-color"] = se.iconColor;
      vars["--ds-input-search-icon-color"] = se.iconColor;
    }
    if (se.clearColor) {
      vars["--ds-search-clear-color"] = se.clearColor;
      vars["--ds-input-search-clear-color"] = se.clearColor;
    }
    if (se.clearColorHover)
      vars["--ds-search-clear-color-hover"] = se.clearColorHover;
    if (se.resultBg) vars["--ds-search-result-bg"] = se.resultBg;
    if (se.resultBgHover)
      vars["--ds-search-result-bg-hover"] = se.resultBgHover;
    if (se.resultBorder) vars["--ds-search-result-border"] = se.resultBorder;
    if (se.resultShadow) vars["--ds-search-result-shadow"] = se.resultShadow;
    if (se.resultTitleColor)
      vars["--ds-search-result-title-color"] = se.resultTitleColor;
    if (se.resultMetaColor)
      vars["--ds-search-result-meta-color"] = se.resultMetaColor;
    if (se.categoryColor) vars["--ds-search-category-color"] = se.categoryColor;
    if (se.emptyBg) vars["--ds-search-empty-bg"] = se.emptyBg;
  }
}

export {
  setSidebarLeafVars,
  setLayoutVars,
  setShellVars,
  setToolbarVars,
  setFilterPillVars,
  setBreadcrumbVars,
  setSearchVars,
};
