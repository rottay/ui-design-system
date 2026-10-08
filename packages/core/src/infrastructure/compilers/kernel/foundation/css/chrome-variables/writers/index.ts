import type {
  BrandChrome,
  BrandButtonVariantChrome,
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

export {
  setMappedChromeVars,
  setLegacyDangerButtonAlias,
  setCardBandVars,
  setListingGridVars,
  setListVars,
  setDetailVars,
  setSurfaceChromeVars,
};
