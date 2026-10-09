import type {
  BrandChrome,
  BrandButtonVariantChrome,
  BrandControlSizeChrome,
  BrandPremiumCardChrome,
  BrandDetailChrome,
  BrandListChrome,
  BrandSurfaceChrome,
  BrandListingGridChrome,
} from "@/foundation/contracts/composition/tenants/themes";

function setMappedChromeVars<T extends object>(
  vars: Record<string, string>,
  chrome: T | undefined,
  mapping: Readonly<Record<keyof T, string>>
): void {
  if (!chrome) return;
  const mappedEntries = Object.entries(mapping) as Array<[string, string]>;
  for (const [field, value] of Object.entries(chrome)) {
    const declaration = mappedEntries.find(
      ([mappedField]) => mappedField === field
    )?.[1];
    if (declaration && value !== undefined && value !== null) {
      vars[declaration] = String(value);
    }
  }
}

/**
 * `danger` is the legacy spelling of the error variant and is what the rustic
 * skin reads. It has no contract field of its own -- one owner, `buttonError`,
 * reaches both vocabularies.
 *
 * Only the four names with real Core readers are aliased. The error variant's
 * remaining channels (`-bg-active`, `-color-hover`, `-border-hover`, the three
 * shadows, ...) keep their canonical `--ds-button-error-*` spelling only;
 * nothing reads them under the `danger` name.
 */
function setLegacyDangerButtonAlias(
  vars: Record<string, string>,
  btn: Partial<BrandButtonVariantChrome> | undefined
): void {
  if (!btn) return;
  if (btn.bg) vars["--ds-button-danger-bg"] = btn.bg;
  if (btn.bgHover) vars["--ds-button-danger-hover-bg"] = btn.bgHover;
  const color = btn.color ?? btn.text;
  if (color) vars["--ds-button-danger-color"] = color;
  if (btn.border) vars["--ds-button-danger-border"] = btn.border;
}

/**
 * `headerBg` / `sectionBg` / `sectionAltBg` paint the BANDED interior of a
 * card: a tinted header strip over alternating body sections. Only two of the
 * seven card namespaces draw that anatomy, so these three channels are
 * emitted per namespace instead of riding the shared fan-out above -- a metric
 * tile or a collection cell has no header strip and no section bands, and
 * emitting the names there would ship dead custom properties into every tenant
 * artifact.
 *
 * The signal card is the other one that draws bands; its two names are already
 * emitted by its own owner further down, so they are not repeated here.
 */
function setCardBandVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  const premium = chrome.premiumCard;
  if (!premium) return;
  if (premium.headerBg) vars["--ds-premium-card-header-bg"] = premium.headerBg;
  if (premium.sectionBg) vars["--ds-premium-card-section-bg"] = premium.sectionBg;
  if (premium.sectionAltBg)
    vars["--ds-premium-card-section-alt-bg"] = premium.sectionAltBg;
}

/** Map listing-grid chrome used by collection/card view renderers. */
function setListingGridVars(
  vars: Record<string, string>,
  grid: Partial<BrandListingGridChrome> | undefined
): void {
  if (!grid) return;

  if (grid.gap) vars["--ds-listing-grid-gap"] = grid.gap;
  if (grid.minCardWidth)
    vars["--ds-listing-grid-min-card-width"] = grid.minCardWidth;
  if (grid.minCompactWidth)
    vars["--ds-listing-grid-min-compact-width"] = grid.minCompactWidth;
  if (grid.minTallWidth)
    vars["--ds-listing-grid-min-tall-width"] = grid.minTallWidth;
  if (grid.columns) vars["--ds-listing-grid-columns"] = grid.columns;
  if (grid.cardGap) vars["--ds-listing-grid-card-gap"] = grid.cardGap;
  if (grid.cardBg) vars["--ds-listing-grid-card-bg"] = grid.cardBg;
  if (grid.cardBorder) vars["--ds-listing-grid-card-border"] = grid.cardBorder;
  if (grid.cardShadow) vars["--ds-listing-grid-card-shadow"] = grid.cardShadow;
  if (grid.selectedRing)
    vars["--ds-listing-grid-selected-ring"] = grid.selectedRing;
  if (grid.emptyBg) vars["--ds-listing-grid-empty-bg"] = grid.emptyBg;
  if (grid.emptyBorder)
    vars["--ds-listing-grid-empty-border"] = grid.emptyBorder;
  if (grid.skeletonBg) vars["--ds-listing-grid-skeleton-bg"] = grid.skeletonBg;
}

/** Map collection list shell + preview-rail chrome. */
function setListVars(
  vars: Record<string, string>,
  list: Partial<BrandListChrome> | undefined
): void {
  if (!list) return;

  if (list.previewRailGap)
    vars["--ds-list-preview-rail-gap"] = list.previewRailGap;
  if (list.previewPanelBg)
    vars["--ds-list-preview-panel-bg"] = list.previewPanelBg;
  if (list.previewPanelBorder)
    vars["--ds-list-preview-panel-border"] = list.previewPanelBorder;
  if (list.previewPanelShadow)
    vars["--ds-list-preview-panel-shadow"] = list.previewPanelShadow;
  if (list.previewMotionDuration)
    vars["--ds-list-preview-motion-duration"] = list.previewMotionDuration;
  if (list.previewMotionEase)
    vars["--ds-list-preview-motion-ease"] = list.previewMotionEase;
  if (list.shellSectionGap)
    vars["--ds-list-shell-section-gap"] = list.shellSectionGap;
  if (list.bg) vars["--ds-list-bg"] = list.bg;
  if (list.backgroundColor)
    vars["--ds-list-background-color"] = list.backgroundColor;
  if (list.borderColor) vars["--ds-list-border-color"] = list.borderColor;
  if (list.itemBackgroundColor)
    vars["--ds-list-item-background-color"] = list.itemBackgroundColor;
  if (list.itemBgHover) vars["--ds-list-item-bg-hover"] = list.itemBgHover;
  if (list.itemHoverBackgroundColor)
    vars["--ds-list-item-hover-background-color"] =
      list.itemHoverBackgroundColor;
  if (list.metaDescriptionColor)
    vars["--ds-list-meta-description-color"] = list.metaDescriptionColor;
  if (list.secondaryTextColor)
    vars["--ds-list-secondary-text-color"] = list.secondaryTextColor;
  if (list.skeletonBg) vars["--ds-list-skeleton-bg"] = list.skeletonBg;
  if (list.splitColor) vars["--ds-list-split-color"] = list.splitColor;
  if (list.textColor) vars["--ds-list-text-color"] = list.textColor;
}

/** Map detail record surface chrome (hero header, section panels, rail). */
function setDetailVars(
  vars: Record<string, string>,
  detail: Partial<BrandDetailChrome> | undefined
): void {
  if (!detail) return;

  if (detail.heroBg) vars["--ds-detail-hero-bg"] = detail.heroBg;
  if (detail.heroBorder) vars["--ds-detail-hero-border"] = detail.heroBorder;
  if (detail.heroShadow) vars["--ds-detail-hero-shadow"] = detail.heroShadow;
  if (detail.sectionBg) vars["--ds-detail-section-bg"] = detail.sectionBg;
  if (detail.sectionBorder)
    vars["--ds-detail-section-border"] = detail.sectionBorder;
  if (detail.sectionShadow)
    vars["--ds-detail-section-shadow"] = detail.sectionShadow;
  if (detail.heroSpine) vars["--ds-detail-hero-spine"] = detail.heroSpine;
  if (detail.controlBg) vars["--ds-detail-control-bg"] = detail.controlBg;
  if (detail.controlBorder)
    vars["--ds-detail-control-border"] = detail.controlBorder;
  if (detail.controlBorderHover)
    vars["--ds-detail-control-border-hover"] = detail.controlBorderHover;
  if (detail.continuousBoundary)
    vars["--ds-detail-continuous-boundary"] = detail.continuousBoundary;
  if (detail.continuousSurface)
    vars["--ds-detail-continuous-surface"] = detail.continuousSurface;
  if (detail.railWidth) vars["--ds-detail-rail-width"] = detail.railWidth;
}

/** Shared semantic surface paint, card grid overlay, and panel elevation. */
function setSurfaceChromeVars(
  vars: Record<string, string>,
  surface: Partial<BrandSurfaceChrome> | undefined
): void {
  if (!surface) return;

  if (surface.radiusMd) vars["--ds-surface-radius-md"] = surface.radiusMd;
  if (surface.shadow) vars["--ds-surface-shadow"] = surface.shadow;
  if (surface.iconBg) vars["--ds-surface-icon-bg"] = surface.iconBg;
  if (surface.iconBorder)
    vars["--ds-surface-icon-border"] = surface.iconBorder;
  if (surface.chipBg) vars["--ds-surface-chip-bg"] = surface.chipBg;
  if (surface.cardSideAccentSoft)
    vars["--ds-card-side-accent-soft"] = surface.cardSideAccentSoft;
  if (surface.cardGridSize)
    vars["--ds-surface-card-grid-size"] = surface.cardGridSize;
  if (surface.cardGridLine)
    vars["--ds-surface-card-grid-line"] = surface.cardGridLine;
  if (surface.cardGridBg)
    vars["--ds-surface-card-grid-bg"] = surface.cardGridBg;
  if (surface.popoverShadow) {
    // One authored elevation, spelled by the shadow scale and the picker panels.
    vars["--ds-shadow-popover"] = surface.popoverShadow;
    vars["--ds-date-picker-panel-shadow"] = surface.popoverShadow;
    vars["--ds-time-picker-panel-shadow"] = surface.popoverShadow;
  }
  if (surface.cardCoverOverlayBg)
    vars["--ds-card-cover-overlay-bg"] = surface.cardCoverOverlayBg;
  if (surface.gradientDark)
    vars["--ds-gradient-dark"] = surface.gradientDark;
  if (surface.imageOverlayBg)
    vars["--ds-image-overlay-bg"] = surface.imageOverlayBg;
  if (surface.overlayBg) vars["--ds-overlay-bg"] = surface.overlayBg;
  if (surface.watermarkColor)
    vars["--ds-watermark-color"] = surface.watermarkColor;
  if (surface.pageShellSubtitleColor)
    vars["--ds-page-shell-subtitle-color"] = surface.pageShellSubtitleColor;
}

/** Map authored button chrome to the engine-consumed variable names. */
function setButtonVariantVars(
  vars: Record<string, string>,
  prefix: string,
  btn: Partial<BrandButtonVariantChrome> | undefined
): void {
  if (!btn) return;

  if (btn.bg) vars[`--ds-button-${prefix}-bg`] = btn.bg;
  if (btn.bgHover) vars[`--ds-button-${prefix}-bg-hover`] = btn.bgHover;
  if (btn.bgActive) vars[`--ds-button-${prefix}-bg-active`] = btn.bgActive;
  const color = btn.color ?? btn.text;
  if (color) vars[`--ds-button-${prefix}-color`] = color;
  if (btn.colorHover)
    vars[`--ds-button-${prefix}-color-hover`] = btn.colorHover;
  if (btn.colorActive)
    vars[`--ds-button-${prefix}-color-active`] = btn.colorActive;
  if (btn.border) vars[`--ds-button-${prefix}-border`] = btn.border;
  if (btn.borderHover)
    vars[`--ds-button-${prefix}-border-hover`] = btn.borderHover;
  if (btn.borderActive)
    vars[`--ds-button-${prefix}-border-active`] = btn.borderActive;
  if (btn.shadow) vars[`--ds-button-${prefix}-shadow`] = btn.shadow;
  if (btn.shadowHover)
    vars[`--ds-button-${prefix}-shadow-hover`] = btn.shadowHover;
  if (btn.shadowActive)
    vars[`--ds-button-${prefix}-shadow-active`] = btn.shadowActive;
}

/**
 * Reversed-order spelling of `bgHover`. The rustic skin reads `-hover-bg` as
 * its PRIMARY name (not as a fallback), so one authored field has to reach
 * both vocabularies or that engine silently drops to its hard-coded literal.
 * Same shape as the sidebar width pair further down.
 *
 * This is an alias vocabulary, not a channel family: it is emitted only for
 * the variants a Core engine actually reads under that name. Adding a variant
 * here without a real `var(--ds-button-<variant>-hover-bg)` reader would ship
 * a dead custom property into every tenant artifact.
 */
function setLegacyButtonHoverBgAlias(
  vars: Record<string, string>,
  prefix: string,
  btn: Partial<BrandButtonVariantChrome> | undefined
): void {
  if (btn?.bgHover) vars[`--ds-button-${prefix}-hover-bg`] = btn.bgHover;
}

/** Map one authored control size onto an existing component token family. */
function setControlSizeVars(
  vars: Record<string, string>,
  family: "button" | "input",
  size: "xs" | "sm" | "md" | "lg" | "xl",
  value: BrandControlSizeChrome | undefined
): void {
  if (!value) return;
  const prefix = `--ds-${family}-${size}`;
  if (value.height) vars[`${prefix}-height`] = value.height;
  if (value.paddingX) vars[`${prefix}-padding-x`] = value.paddingX;
  if (value.paddingY) vars[`${prefix}-padding-y`] = value.paddingY;
  if (value.fontSize) vars[`${prefix}-font-size`] = value.fontSize;
  if (value.lineHeight) vars[`${prefix}-line-height`] = value.lineHeight;
  if (value.iconSize) vars[`${prefix}-icon-size`] = value.iconSize;
  if (value.gap) vars[`${prefix}-gap`] = value.gap;
  if (value.radius) vars[`${prefix}-radius`] = value.radius;
}

/**
 * Segmented sizes emit only the channels the segmented skin consumes. The
 * control exposes sm/md/lg (no xs/xl posture) and derives vertical rhythm from
 * height, so paddingY has no destination here by design.
 */
function setSegmentedSizeVars(
  vars: Record<string, string>,
  size: "sm" | "md" | "lg",
  value: BrandControlSizeChrome | undefined
): void {
  if (!value) return;
  const prefix = `--ds-segmented-${size}`;
  if (value.height) vars[`${prefix}-height`] = value.height;
  if (value.paddingX) vars[`${prefix}-padding-x`] = value.paddingX;
  if (value.fontSize) vars[`${prefix}-font-size`] = value.fontSize;
  if (value.lineHeight) vars[`${prefix}-line-height`] = value.lineHeight;
  if (value.iconSize) vars[`${prefix}-icon-size`] = value.iconSize;
  if (value.gap) vars[`${prefix}-gap`] = value.gap;
  if (value.radius) vars[`${prefix}-radius`] = value.radius;
}

/** Map shared premium card chrome to a namespaced --ds-* variable family. */
function setPremiumCardVars(
  vars: Record<string, string>,
  namespace: string,
  card: Partial<BrandPremiumCardChrome> | undefined
): void {
  if (!card) return;

  if (card.bg) vars[`--ds-${namespace}-bg`] = card.bg;
  if (card.bgHover) vars[`--ds-${namespace}-bg-hover`] = card.bgHover;
  if (card.border) vars[`--ds-${namespace}-border`] = card.border;
  if (card.borderHover)
    vars[`--ds-${namespace}-border-hover`] = card.borderHover;
  if (card.selectedBorder)
    vars[`--ds-${namespace}-selected-border`] = card.selectedBorder;
  if (card.selectedRing)
    vars[`--ds-${namespace}-selected-ring`] = card.selectedRing;
  if (card.shadow) vars[`--ds-${namespace}-shadow`] = card.shadow;
  if (card.shadowHover)
    vars[`--ds-${namespace}-shadow-hover`] = card.shadowHover;
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
  if (card.hoverTransform)
    vars[`--ds-${namespace}-hover-transform`] = card.hoverTransform;
  if (card.transition) vars[`--ds-${namespace}-transition`] = card.transition;
  if (card.iconBg) vars[`--ds-${namespace}-icon-bg`] = card.iconBg;
  if (card.iconBorder) vars[`--ds-${namespace}-icon-border`] = card.iconBorder;
  if (card.iconColor) vars[`--ds-${namespace}-icon-color`] = card.iconColor;
  if (card.titleColor) vars[`--ds-${namespace}-title-color`] = card.titleColor;
  if (card.bodyColor) vars[`--ds-${namespace}-body-color`] = card.bodyColor;
  if (card.labelColor) vars[`--ds-${namespace}-label-color`] = card.labelColor;
  if (card.valueColor) vars[`--ds-${namespace}-value-color`] = card.valueColor;
  if (card.valueHoverColor)
    vars[`--ds-${namespace}-value-color-hover`] = card.valueHoverColor;
  if (card.footerBg) vars[`--ds-${namespace}-footer-bg`] = card.footerBg;
  if (card.footerBorder)
    vars[`--ds-${namespace}-footer-border`] = card.footerBorder;
  if (card.footerColor)
    vars[`--ds-${namespace}-footer-color`] = card.footerColor;
  if (card.statusBg) vars[`--ds-${namespace}-status-bg`] = card.statusBg;
  if (card.statusBorder)
    vars[`--ds-${namespace}-status-border`] = card.statusBorder;
  if (card.statusColor)
    vars[`--ds-${namespace}-status-color`] = card.statusColor;
  if (card.actionBg) vars[`--ds-${namespace}-action-bg`] = card.actionBg;
  if (card.actionBorder)
    vars[`--ds-${namespace}-action-border`] = card.actionBorder;
  if (card.actionColor)
    vars[`--ds-${namespace}-action-color`] = card.actionColor;
  if (card.meterTrack) vars[`--ds-${namespace}-meter-track`] = card.meterTrack;
  if (card.meterTrackBorder)
    vars[`--ds-${namespace}-meter-track-border`] = card.meterTrackBorder;
  if (card.meterFill) vars[`--ds-${namespace}-meter-fill`] = card.meterFill;
  if (card.numberMinWidth)
    vars[`--ds-${namespace}-number-min-width`] = card.numberMinWidth;
  if (card.numberFontVariant)
    vars[`--ds-${namespace}-number-font-variant`] = card.numberFontVariant;
}

export {
  setMappedChromeVars,
  setLegacyDangerButtonAlias,
  setCardBandVars,
  setListingGridVars,
  setListVars,
  setDetailVars,
  setSurfaceChromeVars,
  setButtonVariantVars,
  setLegacyButtonHoverBgAlias,
  setControlSizeVars,
  setSegmentedSizeVars,
  setPremiumCardVars,
};
