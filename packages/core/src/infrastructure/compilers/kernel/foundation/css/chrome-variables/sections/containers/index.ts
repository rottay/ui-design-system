import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";

function setTableVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Table (full: header + row + cell)
  if (chrome.table) {
    const t = chrome.table;
    if (t.bg) vars["--ds-table-bg"] = t.bg;
    if (t.border) vars["--ds-table-border"] = t.border;
    if (t.radius) vars["--ds-table-radius"] = t.radius;
    if (t.headerBg) vars["--ds-table-header-bg"] = t.headerBg;
    if (t.headerBgHover) vars["--ds-table-header-bg-hover"] = t.headerBgHover;
    if (t.headerColor) vars["--ds-table-header-color"] = t.headerColor;
    if (t.headerFontWeight != null)
      vars["--ds-table-header-font-weight"] = String(t.headerFontWeight);
    if (t.headerFontSize)
      vars["--ds-table-header-font-size"] = t.headerFontSize;
    if (t.headerLetterSpacing)
      vars["--ds-table-header-letter-spacing"] = t.headerLetterSpacing;
    if (t.headerTextTransform)
      vars["--ds-table-header-text-transform"] = t.headerTextTransform;
    if (t.headerBlockSize)
      vars["--ds-table-header-block-size"] = t.headerBlockSize;
    if (t.headerBorder) vars["--ds-table-header-border"] = t.headerBorder;
    if (t.headerShadow) vars["--ds-table-header-shadow"] = t.headerShadow;
    if (t.rowBg) vars["--ds-table-row-bg"] = t.rowBg;
    // One name per channel. Components consume the `-bg-hover` / `-bg-striped`
    // spelling; a second alias for the same value has no consumer anywhere in
    // the design system or the three consuming apps.
    if (t.rowBgHover) vars["--ds-table-row-bg-hover"] = t.rowBgHover;
    if (t.rowBgStriped) vars["--ds-table-row-bg-striped"] = t.rowBgStriped;
    if (t.rowBgSelected) vars["--ds-table-row-bg-selected"] = t.rowBgSelected;
    if (t.rowBgExpanded) vars["--ds-table-row-bg-expanded"] = t.rowBgExpanded;
    if (t.rowBorder) vars["--ds-table-row-border"] = t.rowBorder;
    if (t.rowHoverShadow)
      vars["--ds-table-row-hover-shadow"] = t.rowHoverShadow;
    if (t.rowFocusShadow)
      vars["--ds-table-row-focus-shadow"] = t.rowFocusShadow;
    if (t.cellPadding) vars["--ds-table-cell-padding"] = t.cellPadding;
    if (t.cellPaddingCompact)
      vars["--ds-table-padding-compact"] = t.cellPaddingCompact;
    if (t.cellPaddingComfortable)
      vars["--ds-table-padding-comfortable"] = t.cellPaddingComfortable;
    if (t.cellPaddingSpacious)
      vars["--ds-table-padding-spacious"] = t.cellPaddingSpacious;
    if (t.cellFontSize) vars["--ds-table-cell-font-size"] = t.cellFontSize;
    if (t.cellColor) vars["--ds-table-cell-color"] = t.cellColor;
    if (t.filterRowBg) vars["--ds-table-filter-row-bg"] = t.filterRowBg;
    if (t.filterFocusShadow)
      vars["--ds-table-filter-focus-shadow"] = t.filterFocusShadow;
    if (t.resizeBg) vars["--ds-table-resize-bg"] = t.resizeBg;
    if (t.resizeBgHover) vars["--ds-table-resize-bg-hover"] = t.resizeBgHover;
    if (t.reorderBg) vars["--ds-table-reorder-bg"] = t.reorderBg;
    if (t.actionBg) vars["--ds-table-action-bg"] = t.actionBg;
    if (t.actionBorder) vars["--ds-table-action-border"] = t.actionBorder;
    if (t.sheen) vars["--ds-table-sheen"] = t.sheen;
    if (t.pageButtonHoverShadow)
      vars["--ds-table-page-button-hover-shadow"] = t.pageButtonHoverShadow;
    if (t.loadingOverlayBg)
      vars["--ds-table-loading-overlay-bg"] = t.loadingOverlayBg;
  }
}

function setCardComponentVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Card component chrome
  if (chrome.cardComponent) {
    const cc = chrome.cardComponent;
    if (cc.padding) vars["--ds-card-padding"] = cc.padding;
    if (cc.paddingSm) {
      vars["--ds-card-padding-sm"] = cc.paddingSm;
      vars["--ds-card-sm-padding"] = cc.paddingSm;
    }
    if (cc.paddingMd) {
      vars["--ds-card-padding-md"] = cc.paddingMd;
      vars["--ds-card-md-padding"] = cc.paddingMd;
    }
    if (cc.paddingLg) {
      vars["--ds-card-padding-lg"] = cc.paddingLg;
      vars["--ds-card-lg-padding"] = cc.paddingLg;
    }
    if (cc.paddingXl) {
      vars["--ds-card-padding-xl"] = cc.paddingXl;
      vars["--ds-card-xl-padding"] = cc.paddingXl;
    }
    if (cc.bg) vars["--ds-card-bg"] = cc.bg;
    if (cc.bgHover) vars["--ds-card-bg-hover"] = cc.bgHover;
    if (cc.bgActive) vars["--ds-card-bg-active"] = cc.bgActive;
    if (cc.bgSelected) vars["--ds-card-bg-selected"] = cc.bgSelected;
    if (cc.bgDisabled) vars["--ds-card-bg-disabled"] = cc.bgDisabled;
    if (cc.color) vars["--ds-card-color"] = cc.color;
    if (cc.colorHover) vars["--ds-card-color-hover"] = cc.colorHover;
    if (cc.colorActive) vars["--ds-card-color-active"] = cc.colorActive;
    if (cc.colorSelected) vars["--ds-card-color-selected"] = cc.colorSelected;
    if (cc.colorDisabled) vars["--ds-card-color-disabled"] = cc.colorDisabled;
    if (cc.colorMuted) vars["--ds-card-color-muted"] = cc.colorMuted;
    if (cc.border) vars["--ds-card-border"] = cc.border;
    if (cc.border) vars["--ds-card-border-color"] = cc.border;
    if (cc.borderColor) vars["--ds-card-border-color"] = cc.borderColor;
    if (cc.borderWidth) vars["--ds-card-border-width"] = cc.borderWidth;
    if (cc.borderStyle) vars["--ds-card-border-style"] = cc.borderStyle;
    if (cc.borderHover) vars["--ds-card-border-hover"] = cc.borderHover;
    if (cc.borderHover) vars["--ds-card-border-color-hover"] = cc.borderHover;
    if (cc.borderColorHover)
      vars["--ds-card-border-color-hover"] = cc.borderColorHover;
    if (cc.borderActive) vars["--ds-card-border-active"] = cc.borderActive;
    if (cc.borderSelected)
      vars["--ds-card-border-selected"] = cc.borderSelected;
    if (cc.borderDisabled)
      vars["--ds-card-border-disabled"] = cc.borderDisabled;
    if (cc.borderAccentHover)
      vars["--ds-card-border-accent-hover"] = cc.borderAccentHover;
    if (cc.radius) {
      vars["--ds-card-radius"] = cc.radius;
      vars["--ds-card-border-radius"] = cc.radius;
    }
    if (cc.radiusSm) vars["--ds-card-radius-sm"] = cc.radiusSm;
    if (cc.radiusLg) vars["--ds-card-radius-lg"] = cc.radiusLg;
    if (cc.radiusXl) vars["--ds-card-radius-xl"] = cc.radiusXl;
    if (cc.shadow) vars["--ds-card-shadow"] = cc.shadow;
    if (cc.shadowHover) vars["--ds-card-shadow-hover"] = cc.shadowHover;
    if (cc.shadowActive) vars["--ds-card-shadow-active"] = cc.shadowActive;
    if (cc.shadowSelected)
      vars["--ds-card-shadow-selected"] = cc.shadowSelected;
    if (cc.shadowElevated) vars["--ds-card-elevated-shadow"] = cc.shadowElevated;
    if (cc.focusRing) vars["--ds-card-focus-ring"] = cc.focusRing;
    if (cc.focusRingColor)
      vars["--ds-card-focus-ring-color"] = cc.focusRingColor;
    if (cc.focusRingWidth)
      vars["--ds-card-focus-ring-width"] = cc.focusRingWidth;
    if (cc.focusRingOffset)
      vars["--ds-card-focus-ring-offset"] = cc.focusRingOffset;
    if (cc.selectedOutlineWidth)
      vars["--ds-card-selected-outline-width"] = cc.selectedOutlineWidth;
    if (cc.hoverTransform) {
      vars["--ds-card-hover-transform"] = cc.hoverTransform;
      vars["--ds-card-interactive-transform-hover"] = cc.hoverTransform;
    }
    if (cc.activeTransform)
      vars["--ds-card-active-transform"] = cc.activeTransform;
    if (cc.transitionDuration)
      vars["--ds-card-transition-duration"] = cc.transitionDuration;
    if (cc.transitionTiming)
      vars["--ds-card-transition-timing"] = cc.transitionTiming;
    if (cc.disabledOpacity != null)
      vars["--ds-card-disabled-opacity"] = String(cc.disabledOpacity);
    if (cc.texture) vars["--ds-card-texture"] = cc.texture;
    if (cc.textureSize) vars["--ds-card-texture-size"] = cc.textureSize;
    if (cc.textureOpacity != null)
      vars["--ds-card-texture-opacity"] = String(cc.textureOpacity);
    if (cc.overlay) vars["--ds-card-overlay"] = cc.overlay;
    if (cc.surfaceGradient)
      vars["--ds-card-surface-gradient"] = cc.surfaceGradient;
    if (cc.stateOverlay) vars["--ds-card-state-overlay"] = cc.stateOverlay;
    if (cc.stateOverlayHoverOpacity != null)
      vars["--ds-card-state-overlay-hover-opacity"] = String(
        cc.stateOverlayHoverOpacity
      );
    if (cc.stateOverlayActiveOpacity != null)
      vars["--ds-card-state-overlay-active-opacity"] = String(
        cc.stateOverlayActiveOpacity
      );
    if (cc.stateOverlaySelectedOpacity != null)
      vars["--ds-card-state-overlay-selected-opacity"] = String(
        cc.stateOverlaySelectedOpacity
      );
    if (cc.elevatedBg) vars["--ds-card-elevated-bg"] = cc.elevatedBg;
    if (cc.elevatedBorderWidth)
      vars["--ds-card-elevated-border-width"] = cc.elevatedBorderWidth;
    if (cc.elevatedShadow)
      vars["--ds-card-elevated-shadow"] = cc.elevatedShadow;
    if (cc.elevatedShadowHover)
      vars["--ds-card-elevated-shadow-hover"] = cc.elevatedShadowHover;
    if (cc.outlinedBg) vars["--ds-card-bordered-bg"] = cc.outlinedBg;
    if (cc.outlinedBorderWidth)
      vars["--ds-card-bordered-border-width"] = cc.outlinedBorderWidth;
    if (cc.outlinedBorderColor)
      vars["--ds-card-bordered-border-color"] = cc.outlinedBorderColor;
    if (cc.outlinedShadow)
      vars["--ds-card-bordered-shadow"] = cc.outlinedShadow;
    if (cc.filledBg) vars["--ds-card-flat-bg"] = cc.filledBg;
    if (cc.filledBorderWidth)
      vars["--ds-card-flat-border-width"] = cc.filledBorderWidth;
    if (cc.filledShadow) vars["--ds-card-flat-shadow"] = cc.filledShadow;
    if (cc.ghostBg) vars["--ds-card-ghost-bg"] = cc.ghostBg;
    if (cc.ghostBorderColor)
      vars["--ds-card-ghost-border-color"] = cc.ghostBorderColor;
    if (cc.ghostShadow) vars["--ds-card-ghost-shadow"] = cc.ghostShadow;
    if (cc.headerBorder) vars["--ds-card-header-border"] = cc.headerBorder;
    if (cc.headerBorder)
      vars["--ds-card-header-border-color"] = cc.headerBorder;
    if (cc.headerBorderColor)
      vars["--ds-card-header-border-color"] = cc.headerBorderColor;
    if (cc.headerBorderWidth)
      vars["--ds-card-header-border-width"] = cc.headerBorderWidth;
    if (cc.headerBg) vars["--ds-card-header-bg"] = cc.headerBg;
    if (cc.headerColor) vars["--ds-card-header-color"] = cc.headerColor;
    if (cc.headerPadding) vars["--ds-card-header-padding"] = cc.headerPadding;
    if (cc.headerPaddingSm)
      vars["--ds-card-header-padding-sm"] = cc.headerPaddingSm;
    if (cc.headerPaddingLg)
      vars["--ds-card-header-padding-lg"] = cc.headerPaddingLg;
    if (cc.headerGap) vars["--ds-card-header-gap"] = cc.headerGap;
    if (cc.headerActionsGap)
      vars["--ds-card-header-actions-gap"] = cc.headerActionsGap;
    if (cc.headerMinHeight)
      vars["--ds-card-header-min-height"] = cc.headerMinHeight;
    if (cc.headerCopyMaxWidth)
      vars["--ds-card-header-copy-max-width"] = cc.headerCopyMaxWidth;
    if (cc.headerEyebrowSize)
      vars["--ds-card-header-eyebrow-size"] = cc.headerEyebrowSize;
    if (cc.headerEyebrowTracking)
      vars["--ds-card-header-eyebrow-tracking"] = cc.headerEyebrowTracking;
    if (cc.headerIconSize)
      vars["--ds-card-header-icon-size"] = cc.headerIconSize;
    if (cc.headerIconRadius)
      vars["--ds-card-header-icon-radius"] = cc.headerIconRadius;
    if (cc.headerIconBg) vars["--ds-card-header-icon-bg"] = cc.headerIconBg;
    if (cc.headerIconBorder)
      vars["--ds-card-header-icon-border"] = cc.headerIconBorder;
    if (cc.headerIconColor)
      vars["--ds-card-header-icon-color"] = cc.headerIconColor;
    if (cc.headerExtraBg) vars["--ds-card-header-extra-bg"] = cc.headerExtraBg;
    if (cc.headerExtraBorder)
      vars["--ds-card-header-extra-border"] = cc.headerExtraBorder;
    if (cc.headerExtraRadius)
      vars["--ds-card-header-extra-radius"] = cc.headerExtraRadius;
    if (cc.headerExtraPadding)
      vars["--ds-card-header-extra-padding"] = cc.headerExtraPadding;
    if (cc.titleColor) vars["--ds-card-title-color"] = cc.titleColor;
    if (cc.titleFontSize) vars["--ds-card-title-font-size"] = cc.titleFontSize;
    if (cc.titleFontWeight != null)
      vars["--ds-card-title-font-weight"] = String(cc.titleFontWeight);
    if (cc.titleLineHeight)
      vars["--ds-card-title-line-height"] = cc.titleLineHeight;
    if (cc.titleLetterSpacing)
      vars["--ds-card-title-letter-spacing"] = cc.titleLetterSpacing;
    if (cc.subtitleColor) vars["--ds-card-subtitle-color"] = cc.subtitleColor;
    if (cc.subtitleFontSize)
      vars["--ds-card-subtitle-font-size"] = cc.subtitleFontSize;
    if (cc.subtitleMarginTop)
      vars["--ds-card-subtitle-margin-top"] = cc.subtitleMarginTop;
    if (cc.bodyColor) vars["--ds-card-body-color"] = cc.bodyColor;
    if (cc.bodyPadding) vars["--ds-card-body-padding"] = cc.bodyPadding;
    if (cc.bodyPaddingSm) vars["--ds-card-body-padding-sm"] = cc.bodyPaddingSm;
    if (cc.bodyPaddingLg) vars["--ds-card-body-padding-lg"] = cc.bodyPaddingLg;
    if (cc.bodyFontSize) vars["--ds-card-body-font-size"] = cc.bodyFontSize;
    if (cc.bodyLineHeight)
      vars["--ds-card-body-line-height"] = cc.bodyLineHeight;
    if (cc.footerBorder) vars["--ds-card-footer-border"] = cc.footerBorder;
    if (cc.footerBorder)
      vars["--ds-card-footer-border-color"] = cc.footerBorder;
    if (cc.footerBorderColor)
      vars["--ds-card-footer-border-color"] = cc.footerBorderColor;
    if (cc.footerBorderWidth)
      vars["--ds-card-footer-border-width"] = cc.footerBorderWidth;
    if (cc.footerBg) vars["--ds-card-footer-bg"] = cc.footerBg;
    if (cc.footerColor) vars["--ds-card-footer-color"] = cc.footerColor;
    if (cc.footerPadding) vars["--ds-card-footer-padding"] = cc.footerPadding;
    if (cc.footerPaddingSm)
      vars["--ds-card-footer-padding-sm"] = cc.footerPaddingSm;
    if (cc.footerPaddingLg)
      vars["--ds-card-footer-padding-lg"] = cc.footerPaddingLg;
    if (cc.footerActionsGap)
      vars["--ds-card-footer-actions-gap"] = cc.footerActionsGap;
    if (cc.actionsGap) vars["--ds-card-actions-gap"] = cc.actionsGap;
    if (cc.actionsMarginTop)
      vars["--ds-card-actions-margin-top"] = cc.actionsMarginTop;
    if (cc.actionsPaddingTop)
      vars["--ds-card-actions-padding-top"] = cc.actionsPaddingTop;
    if (cc.coverInlineSize)
      vars["--ds-card-cover-inline-size"] = cc.coverInlineSize;
    if (cc.coverInlineMinSize)
      vars["--ds-card-cover-inline-min-size"] = cc.coverInlineMinSize;
    if (cc.coverBlockMinSize)
      vars["--ds-card-cover-block-min-size"] = cc.coverBlockMinSize;
    if (cc.coverAspectRatio)
      vars["--ds-card-cover-aspect-ratio"] = cc.coverAspectRatio;
    if (cc.coverObjectPosition)
      vars["--ds-card-cover-object-position"] = cc.coverObjectPosition;
    if (cc.coverObjectFit) {
      vars["--ds-card-cover-object-fit"] = cc.coverObjectFit;
      vars["--ds-card-media-object-fit"] = cc.coverObjectFit;
    }
    if (cc.bodyInlineMinSize)
      vars["--ds-card-body-inline-min-size"] = cc.bodyInlineMinSize;
    if (cc.imagePlaceholderBg)
      vars["--ds-card-image-placeholder-bg"] = cc.imagePlaceholderBg;
    if (cc.imagePlaceholderColor)
      vars["--ds-card-image-placeholder-color"] = cc.imagePlaceholderColor;
    if (cc.imageHeight) vars["--ds-card-image-height"] = cc.imageHeight;
    if (cc.imageLoadingTrack)
      vars["--ds-card-image-loading-track"] = cc.imageLoadingTrack;
    if (cc.imageLoadingActive)
      vars["--ds-card-image-loading-active"] = cc.imageLoadingActive;
    if (cc.imageLoadingSize)
      vars["--ds-card-image-loading-size"] = cc.imageLoadingSize;
    if (cc.imageLoadingStroke)
      vars["--ds-card-image-loading-stroke"] = cc.imageLoadingStroke;
    if (cc.imageLoadingDuration)
      vars["--ds-card-image-loading-duration"] = cc.imageLoadingDuration;
    if (cc.imageErrorIconSize)
      vars["--ds-card-image-error-icon-size"] = cc.imageErrorIconSize;
    if (cc.spinnerSize) vars["--ds-card-spinner-size"] = cc.spinnerSize;
    if (cc.spinnerStroke) vars["--ds-card-spinner-stroke"] = cc.spinnerStroke;
    if (cc.spinnerTrack) vars["--ds-card-spinner-track"] = cc.spinnerTrack;
    if (cc.spinnerColor) vars["--ds-card-spinner-color"] = cc.spinnerColor;
    if (cc.spinnerDuration)
      vars["--ds-card-spinner-duration"] = cc.spinnerDuration;
    if (cc.loadingOverlayBg)
      vars["--ds-card-loading-overlay-bg"] = cc.loadingOverlayBg;
    if (cc.loadingBackdropBlur)
      vars["--ds-card-loading-backdrop-blur"] = cc.loadingBackdropBlur;
    if (cc.loadingCoverOpacity != null)
      vars["--ds-card-loading-cover-opacity"] = String(cc.loadingCoverOpacity);
    if (cc.loadingSkeletonOpacity != null)
      vars["--ds-card-loading-skeleton-opacity"] = String(
        cc.loadingSkeletonOpacity
      );
    if (cc.skeletonBg) vars["--ds-card-skeleton-bg"] = cc.skeletonBg;
    if (cc.skeletonHighlight)
      vars["--ds-card-skeleton-highlight"] = cc.skeletonHighlight;
    if (cc.skeletonRadius)
      vars["--ds-card-skeleton-radius"] = cc.skeletonRadius;
    if (cc.skeletonDuration)
      vars["--ds-card-skeleton-duration"] = cc.skeletonDuration;
  }
}

function setMetricCardVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.metricCard) {
    const mc = chrome.metricCard;
    if (mc.bg) vars["--ds-metric-card-bg"] = mc.bg;
    if (mc.border) vars["--ds-metric-card-border"] = mc.border;
    if (mc.borderHover) vars["--ds-metric-card-border-hover"] = mc.borderHover;
    if (mc.selectedBorder)
      vars["--ds-metric-card-selected-border"] = mc.selectedBorder;
    if (mc.selectedRing)
      vars["--ds-metric-card-selected-ring"] = mc.selectedRing;
    if (mc.shadow) vars["--ds-metric-card-shadow"] = mc.shadow;
    if (mc.shadowHover) vars["--ds-metric-card-shadow-hover"] = mc.shadowHover;
    if (mc.sheen) vars["--ds-metric-card-sheen"] = mc.sheen;
    if (mc.iconBg) vars["--ds-metric-card-icon-bg"] = mc.iconBg;
    if (mc.iconBorder) vars["--ds-metric-card-icon-border"] = mc.iconBorder;
    if (mc.iconColor) vars["--ds-metric-card-icon-color"] = mc.iconColor;
    if (mc.labelColor) vars["--ds-metric-card-label-color"] = mc.labelColor;
    if (mc.valueColor) vars["--ds-metric-card-value-color"] = mc.valueColor;
    if (mc.valueHoverColor)
      vars["--ds-metric-card-value-color-hover"] = mc.valueHoverColor;
    if (mc.trendColor) vars["--ds-metric-card-trend-color"] = mc.trendColor;
    if (mc.trendColorWarning)
      vars["--ds-metric-card-trend-color-warning"] = mc.trendColorWarning;
    if (mc.trendColorError)
      vars["--ds-metric-card-trend-color-error"] = mc.trendColorError;
    if (mc.trendErrorBg)
      vars["--ds-metric-card-trend-error-bg"] = mc.trendErrorBg;
    if (mc.trendErrorBorder)
      vars["--ds-metric-card-trend-error-border"] = mc.trendErrorBorder;
    if (mc.meterTrack) vars["--ds-metric-card-meter-track"] = mc.meterTrack;
    if (mc.meterTrackBorder)
      vars["--ds-metric-card-meter-track-border"] = mc.meterTrackBorder;
    if (mc.meterFill) vars["--ds-metric-card-meter-fill"] = mc.meterFill;
    if (mc.meterFillSuccess)
      vars["--ds-metric-card-meter-fill-success"] = mc.meterFillSuccess;
    if (mc.meterFillWarning)
      vars["--ds-metric-card-meter-fill-warning"] = mc.meterFillWarning;
    if (mc.meterFillError)
      vars["--ds-metric-card-meter-fill-error"] = mc.meterFillError;
    if (mc.meterFillNeutral)
      vars["--ds-metric-card-meter-fill-neutral"] = mc.meterFillNeutral;
    if (mc.meterHeight) vars["--ds-metric-card-meter-height"] = mc.meterHeight;
  }
}

function setSignalCardVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.signalCard) {
    const sc = chrome.signalCard;
    if (sc.accent) vars["--ds-signal-card-accent"] = sc.accent;
    if (sc.soft) vars["--ds-signal-card-soft"] = sc.soft;
    if (sc.bg) vars["--ds-signal-card-bg"] = sc.bg;
    if (sc.border) vars["--ds-signal-card-border"] = sc.border;
    if (sc.borderHover) vars["--ds-signal-card-border-hover"] = sc.borderHover;
    if (sc.shadow) vars["--ds-signal-card-shadow"] = sc.shadow;
    if (sc.shadowHover) vars["--ds-signal-card-shadow-hover"] = sc.shadowHover;
    if (sc.iconBg) vars["--ds-signal-card-icon-bg"] = sc.iconBg;
    if (sc.iconBorder) vars["--ds-signal-card-icon-border"] = sc.iconBorder;
    if (sc.titleColor) vars["--ds-signal-card-title-color"] = sc.titleColor;
    if (sc.bodyColor) vars["--ds-signal-card-body-color"] = sc.bodyColor;
    if (sc.badgeBg) vars["--ds-signal-card-badge-bg"] = sc.badgeBg;
    if (sc.badgeBorder) vars["--ds-signal-card-badge-border"] = sc.badgeBorder;
    if (sc.badgeColor) vars["--ds-signal-card-badge-color"] = sc.badgeColor;
    if (sc.sectionBg) vars["--ds-signal-card-section-bg"] = sc.sectionBg;
    if (sc.sectionAltBg)
      vars["--ds-signal-card-section-alt-bg"] = sc.sectionAltBg;
    if (sc.meterTrack) vars["--ds-signal-card-meter-track"] = sc.meterTrack;
    if (sc.meterTrackBorder)
      vars["--ds-signal-card-meter-track-border"] = sc.meterTrackBorder;
    if (sc.meterFill) vars["--ds-signal-card-meter-fill"] = sc.meterFill;
    if (sc.topLineDisplay)
      vars["--ds-signal-card-top-line-display"] = sc.topLineDisplay;
  }
}

function setModalVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Modal chrome
  if (chrome.modal) {
    const m = chrome.modal;
    if (m.bg) vars["--ds-modal-bg"] = m.bg;
    if (m.color) vars["--ds-modal-color"] = m.color;
    if (m.shadow) vars["--ds-modal-shadow"] = m.shadow;
    if (m.overlayBg) vars["--ds-modal-overlay-bg"] = m.overlayBg;
    if (m.overlayBackdrop)
      vars["--ds-modal-overlay-backdrop"] = m.overlayBackdrop;
    if (m.headerBg) vars["--ds-modal-header-bg"] = m.headerBg;
    if (m.headerBorder) vars["--ds-modal-header-border"] = m.headerBorder;
    if (m.titleColor) vars["--ds-modal-title-color"] = m.titleColor;
    if (m.subtitleColor) vars["--ds-modal-subtitle-color"] = m.subtitleColor;
    if (m.bodyColor) vars["--ds-modal-body-color"] = m.bodyColor;
    if (m.footerBorder) vars["--ds-modal-footer-border"] = m.footerBorder;
    if (m.footerBg) vars["--ds-modal-footer-bg"] = m.footerBg;
    if (m.closeColor) vars["--ds-modal-close-color"] = m.closeColor;
    if (m.closeColorHover)
      vars["--ds-modal-close-color-hover"] = m.closeColorHover;
    if (m.closeBgHover) vars["--ds-modal-close-bg-hover"] = m.closeBgHover;
  }
}

function setTabsVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // Tabs chrome
  if (chrome.tabs) {
    const tb = chrome.tabs;
    if (tb.border) vars["--ds-tabs-border"] = tb.border;
    if (tb.color) vars["--ds-tab-color"] = tb.color;
    if (tb.colorHover) vars["--ds-tab-color-hover"] = tb.colorHover;
    if (tb.colorActive) vars["--ds-tab-color-active"] = tb.colorActive;
    if (tb.bgHover) vars["--ds-tab-bg-hover"] = tb.bgHover;
    if (tb.borderActive) vars["--ds-tab-border-active"] = tb.borderActive;
    if (tb.listBg) vars["--ds-tabs-list-bg"] = tb.listBg;
    if (tb.underlineListBg)
      vars["--ds-tabs-underline-list-bg"] = tb.underlineListBg;
    if (tb.containedListBg)
      vars["--ds-tabs-contained-list-bg"] = tb.containedListBg;
    if (tb.segmentedListBg)
      vars["--ds-tabs-segmented-list-bg"] = tb.segmentedListBg;
    if (tb.pillsListBg) vars["--ds-tabs-pills-list-bg"] = tb.pillsListBg;
    if (tb.underlineHoverBg)
      vars["--ds-tabs-line-hover-bg"] = tb.underlineHoverBg;
    if (tb.underlineActiveBg)
      vars["--ds-tabs-line-active-bg"] = tb.underlineActiveBg;
    if (tb.underlineItemRadius)
      vars["--ds-tabs-line-item-radius"] = tb.underlineItemRadius;
    if (tb.listBorder) vars["--ds-tabs-list-border"] = tb.listBorder;
    if (tb.listRadius) vars["--ds-tabs-list-radius"] = tb.listRadius;
    if (tb.listPadding) vars["--ds-tabs-list-padding"] = tb.listPadding;
    if (tb.listWidth) vars["--ds-tabs-list-width"] = tb.listWidth;
    if (tb.listMaxWidth) vars["--ds-tabs-list-max-width"] = tb.listMaxWidth;
    if (tb.underlineListWidth)
      vars["--ds-tabs-underline-list-width"] = tb.underlineListWidth;
    if (tb.listShadow) vars["--ds-tabs-list-shadow"] = tb.listShadow;
    if (tb.listBlur) vars["--ds-tabs-list-blur"] = tb.listBlur;
    if (tb.listTexture) vars["--ds-tabs-list-texture"] = tb.listTexture;
    if (tb.listTextureOpacity != null)
      vars["--ds-tabs-list-texture-opacity"] = String(tb.listTextureOpacity);
    if (tb.listTextureSize)
      vars["--ds-tabs-list-texture-size"] = tb.listTextureSize;
    if (tb.listHighlight) vars["--ds-tabs-list-highlight"] = tb.listHighlight;
    if (tb.gap) vars["--ds-tabs-gap"] = tb.gap;
    if (tb.itemGap) vars["--ds-tabs-item-gap"] = tb.itemGap;
    if (tb.itemRadius) vars["--ds-tabs-item-radius"] = tb.itemRadius;
    if (tb.itemMaxWidth) vars["--ds-tabs-item-max-width"] = tb.itemMaxWidth;
    if (tb.itemFontFamily)
      vars["--ds-tabs-item-font-family"] = tb.itemFontFamily;
    if (tb.itemLineHeight)
      vars["--ds-tabs-item-line-height"] = tb.itemLineHeight;
    if (tb.itemLetterSpacing)
      vars["--ds-tabs-item-letter-spacing"] = tb.itemLetterSpacing;
    if (tb.itemFontWeight != null)
      vars["--ds-tabs-item-font-weight"] = String(tb.itemFontWeight);
    if (tb.itemFontWeightActive != null)
      vars["--ds-tabs-item-font-weight-active"] = String(
        tb.itemFontWeightActive
      );
    if (tb.activeBg) vars["--ds-tabs-active-bg"] = tb.activeBg;
    if (tb.activeShadow) vars["--ds-tabs-active-shadow"] = tb.activeShadow;
    if (tb.activeTransform)
      vars["--ds-tabs-active-transform"] = tb.activeTransform;
    if (tb.activeHighlight)
      vars["--ds-tabs-active-highlight"] = tb.activeHighlight;
    if (tb.activeHighlightOpacity != null)
      vars["--ds-tabs-active-highlight-opacity"] = String(
        tb.activeHighlightOpacity
      );
    if (tb.pressedTransform)
      vars["--ds-tabs-pressed-transform"] = tb.pressedTransform;
    if (tb.containedActiveBg)
      vars["--ds-tabs-contained-active-bg"] = tb.containedActiveBg;
    if (tb.containedActiveShadow)
      vars["--ds-tabs-contained-active-shadow"] = tb.containedActiveShadow;
    if (tb.segmentedActiveBg)
      vars["--ds-tabs-segmented-active-bg"] = tb.segmentedActiveBg;
    if (tb.segmentedActiveShadow)
      vars["--ds-tabs-segmented-active-shadow"] = tb.segmentedActiveShadow;
    if (tb.pillsActiveBg) vars["--ds-tabs-pills-active-bg"] = tb.pillsActiveBg;
    if (tb.pillsActiveColor)
      vars["--ds-tabs-pills-active-color"] = tb.pillsActiveColor;
    if (tb.pillsActiveBorder)
      vars["--ds-tabs-pills-active-border"] = tb.pillsActiveBorder;
    if (tb.pillsActiveShadow)
      vars["--ds-tabs-pills-active-shadow"] = tb.pillsActiveShadow;
    if (tb.disabledColor) vars["--ds-tabs-disabled-color"] = tb.disabledColor;
    if (tb.disabledBg) vars["--ds-tabs-disabled-bg"] = tb.disabledBg;
    if (tb.disabledOpacity != null)
      vars["--ds-tabs-disabled-opacity"] = String(tb.disabledOpacity);
    if (tb.iconColor) vars["--ds-tabs-icon-color"] = tb.iconColor;
    if (tb.iconBg) vars["--ds-tabs-icon-bg"] = tb.iconBg;
    if (tb.iconBgActive) vars["--ds-tabs-icon-bg-active"] = tb.iconBgActive;
    if (tb.iconPadding) vars["--ds-tabs-icon-padding"] = tb.iconPadding;
    if (tb.iconRadius) vars["--ds-tabs-icon-radius"] = tb.iconRadius;
    if (tb.iconShadow) vars["--ds-tabs-icon-shadow"] = tb.iconShadow;
    if (tb.iconShadowActive)
      vars["--ds-tabs-icon-shadow-active"] = tb.iconShadowActive;
    if (tb.iconTransformActive)
      vars["--ds-tabs-icon-transform-active"] = tb.iconTransformActive;
    if (tb.badgeBg) vars["--ds-tabs-badge-bg"] = tb.badgeBg;
    if (tb.badgeColor) vars["--ds-tabs-badge-color"] = tb.badgeColor;
    if (tb.badgeBorder) vars["--ds-tabs-badge-border"] = tb.badgeBorder;
    if (tb.badgeRadius) vars["--ds-tabs-badge-radius"] = tb.badgeRadius;
    if (tb.badgeHeight) vars["--ds-tabs-badge-height"] = tb.badgeHeight;
    if (tb.badgeMinWidth) vars["--ds-tabs-badge-min-width"] = tb.badgeMinWidth;
    if (tb.badgePadding) vars["--ds-tabs-badge-padding"] = tb.badgePadding;
    if (tb.badgeFontSize) vars["--ds-tabs-badge-font-size"] = tb.badgeFontSize;
    if (tb.badgeFontWeight != null)
      vars["--ds-tabs-badge-font-weight"] = String(tb.badgeFontWeight);
    if (tb.badgeBgActive) vars["--ds-tabs-badge-bg-active"] = tb.badgeBgActive;
    if (tb.badgeColorActive)
      vars["--ds-tabs-badge-color-active"] = tb.badgeColorActive;
    if (tb.badgeBorderActive)
      vars["--ds-tabs-badge-border-active"] = tb.badgeBorderActive;
    if (tb.indicatorHeight)
      vars["--ds-tabs-indicator-height"] = tb.indicatorHeight;
    if (tb.indicatorGradient)
      vars["--ds-tabs-indicator-gradient"] = tb.indicatorGradient;
    if (tb.indicatorRadius)
      vars["--ds-tabs-indicator-radius"] = tb.indicatorRadius;
    if (tb.indicatorShadow)
      vars["--ds-tabs-indicator-shadow"] = tb.indicatorShadow;
    if (tb.panelPadding) vars["--ds-tabs-panel-padding"] = tb.panelPadding;
    if (tb.panelGap) vars["--ds-tabs-panel-gap"] = tb.panelGap;
    if (tb.panelBg) vars["--ds-tabs-panel-bg"] = tb.panelBg;
    if (tb.panelBorder) vars["--ds-tabs-panel-border"] = tb.panelBorder;
    if (tb.panelRadius) vars["--ds-tabs-panel-radius"] = tb.panelRadius;
    if (tb.panelShadow) vars["--ds-tabs-panel-shadow"] = tb.panelShadow;
    if (tb.panelFocusRing)
      vars["--ds-tabs-panel-focus-ring"] = tb.panelFocusRing;
    if (tb.panelTexture) vars["--ds-tabs-panel-texture"] = tb.panelTexture;
    if (tb.panelHighlight)
      vars["--ds-tabs-panel-highlight"] = tb.panelHighlight;
    if (tb.panelMotionDistance)
      vars["--ds-tabs-panel-motion-distance"] = tb.panelMotionDistance;
    if (tb.overflowControlSize)
      vars["--ds-tabs-overflow-control-size"] = tb.overflowControlSize;
    if (tb.overflowControlBg)
      vars["--ds-tabs-overflow-control-bg"] = tb.overflowControlBg;
    if (tb.overflowControlColor)
      vars["--ds-tabs-overflow-control-color"] = tb.overflowControlColor;
    if (tb.overflowControlBorder)
      vars["--ds-tabs-overflow-control-border"] = tb.overflowControlBorder;
    if (tb.overflowControlShadow)
      vars["--ds-tabs-overflow-control-shadow"] = tb.overflowControlShadow;
    if (tb.overflowControlBgHover)
      vars["--ds-tabs-overflow-control-bg-hover"] = tb.overflowControlBgHover;
    if (tb.overflowControlShadowHover)
      vars["--ds-tabs-overflow-control-shadow-hover"] =
        tb.overflowControlShadowHover;
    if (tb.overflowFadeWidth)
      vars["--ds-tabs-overflow-fade-width"] = tb.overflowFadeWidth;
    if (tb.overflowFadeColor)
      vars["--ds-tabs-overflow-fade-color"] = tb.overflowFadeColor;
    if (tb.mobilePadding) vars["--ds-tabs-mobile-padding"] = tb.mobilePadding;
    if (tb.mobileGap) vars["--ds-tabs-mobile-gap"] = tb.mobileGap;
    if (tb.mobileItemMaxWidth)
      vars["--ds-tabs-mobile-item-max-width"] = tb.mobileItemMaxWidth;
    if (tb.motionDuration)
      vars["--ds-tabs-motion-duration"] = tb.motionDuration;
    if (tb.motionEasing) vars["--ds-tabs-motion-easing"] = tb.motionEasing;
    if (tb.activeRevealDuration)
      vars["--ds-tabs-active-reveal-duration"] = tb.activeRevealDuration;
    if (tb.panelMotionDuration)
      vars["--ds-tabs-panel-motion-duration"] = tb.panelMotionDuration;
    if (tb.panelMotionEasing)
      vars["--ds-tabs-panel-motion-easing"] = tb.panelMotionEasing;
    if (tb.smHeight) vars["--ds-tabs-sm-height"] = tb.smHeight;
    if (tb.smPadding) vars["--ds-tabs-sm-padding"] = tb.smPadding;
    if (tb.smFontSize) vars["--ds-tabs-sm-font-size"] = tb.smFontSize;
    if (tb.smIconSize) vars["--ds-tabs-sm-icon-size"] = tb.smIconSize;
    if (tb.mdHeight) vars["--ds-tabs-md-height"] = tb.mdHeight;
    if (tb.mdPadding) vars["--ds-tabs-md-padding"] = tb.mdPadding;
    if (tb.mdFontSize) vars["--ds-tabs-md-font-size"] = tb.mdFontSize;
    if (tb.mdIconSize) vars["--ds-tabs-md-icon-size"] = tb.mdIconSize;
    if (tb.lgHeight) vars["--ds-tabs-lg-height"] = tb.lgHeight;
    if (tb.lgPadding) vars["--ds-tabs-lg-padding"] = tb.lgPadding;
    if (tb.lgFontSize) vars["--ds-tabs-lg-font-size"] = tb.lgFontSize;
    if (tb.lgIconSize) vars["--ds-tabs-lg-icon-size"] = tb.lgIconSize;
  }
}

function setCollapseVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  // `collapse.border` is a colour, not a border shorthand: it lowers to the
  // name every engine reads as the colour operand of the panel border, which
  // is not the key-derived `--ds-collapse-border` the family map would spell.
  if (chrome.collapse) {
    const collapse = chrome.collapse;
    if (collapse.border) vars["--ds-collapse-border-color"] = collapse.border;
  }
}

export {
  setTableVars,
  setCardComponentVars,
  setMetricCardVars,
  setSignalCardVars,
  setModalVars,
  setTabsVars,
  setCollapseVars,
};
