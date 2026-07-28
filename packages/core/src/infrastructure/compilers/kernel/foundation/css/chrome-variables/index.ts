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
  BrandBadgeChrome,
  BrandButtonVariantChrome,
  BrandControlSizeChrome,
  BrandPremiumCardChrome,
  BrandListingGridChrome,
  BrandPopoverChrome,
  BrandTooltipChrome,
} from "@/foundation/contracts/composition/tenants/themes";

const chromeVariableMap = <T extends object>(
  prefix: string,
  fields: readonly (keyof T)[]
): Readonly<Record<keyof T, string>> =>
  Object.fromEntries(
    fields.map((field) => [
      field,
      `${prefix}${String(field).replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      )}`,
    ])
  ) as Readonly<Record<keyof T, string>>;

const TOOLTIP_CHROME_VARIABLES = chromeVariableMap<BrandTooltipChrome>(
  "--ds-tooltip-",
  [
    "borderedBackground",
    "borderedForeground",
    "borderedBorder",
    "borderedBorderWidth",
    "borderedShadow",
    "borderedTexture",
    "borderedHighlight",
    "borderedRadius",
    "borderedMaxWidth",
    "borderedPaddingBlock",
    "borderedPaddingInline",
    "minimalBackground",
    "minimalForeground",
    "minimalBorder",
    "minimalBorderWidth",
    "minimalShadow",
    "minimalTexture",
    "minimalHighlight",
    "minimalRadius",
    "minimalMaxWidth",
    "minimalPaddingBlock",
    "minimalPaddingInline",
    "inverseBackground",
    "inverseForeground",
    "inverseBorder",
    "inverseBorderWidth",
    "inverseShadow",
    "inverseTexture",
    "inverseHighlight",
    "inverseRadius",
    "inverseMaxWidth",
    "inversePaddingBlock",
    "inversePaddingInline",
    "richBackground",
    "richForeground",
    "richBorder",
    "richBorderWidth",
    "richShadow",
    "richTexture",
    "richHighlight",
    "richRadius",
    "richMaxWidth",
    "richPaddingBlock",
    "richPaddingInline",
    "richType",
    "richLetterSpacing",
    "compactPaddingBlock",
    "compactPaddingInline",
    "compactType",
    "comfortablePaddingBlock",
    "comfortablePaddingInline",
    "spaciousPaddingBlock",
    "spaciousPaddingInline",
    "spaciousType",
    "arrowSize",
    "arrowHalfSize",
    "arrowOverlap",
    "viewportGap",
    "touchTarget",
    "shortcutGap",
    "shortcutChipGap",
    "shortcutKeyBackground",
    "shortcutKeyBorder",
    "shortcutKeyBorderWidth",
    "shortcutKeyRadius",
    "shortcutKeyShadow",
    "shortcutKeyType",
    "motionDistance",
    "motionScale",
    "enterDuration",
    "enterEasing",
    "exitDuration",
    "exitEasing",
  ] as const
);

const POPOVER_CHROME_VARIABLES = chromeVariableMap<BrandPopoverChrome>(
  "--ds-popover-",
  [
    "borderedBackground",
    "borderedForeground",
    "borderedMutedForeground",
    "borderedBorder",
    "borderedBorderWidth",
    "borderedShadow",
    "borderedTexture",
    "borderedHighlight",
    "borderedRadius",
    "borderedMaxWidth",
    "borderedPaddingBlock",
    "borderedPaddingInline",
    "borderedTitleGap",
    "minimalBackground",
    "minimalForeground",
    "minimalMutedForeground",
    "minimalBorder",
    "minimalBorderWidth",
    "minimalShadow",
    "minimalTexture",
    "minimalHighlight",
    "minimalRadius",
    "minimalMaxWidth",
    "minimalPaddingBlock",
    "minimalPaddingInline",
    "inverseBackground",
    "inverseForeground",
    "inverseMutedForeground",
    "inverseBorder",
    "inverseShadow",
    "inverseTexture",
    "inverseHighlight",
    "inverseRadius",
    "richBackground",
    "richForeground",
    "richMutedForeground",
    "richBorder",
    "richShadow",
    "richTexture",
    "richHighlight",
    "richRadius",
    "richMaxWidth",
    "richPaddingBlock",
    "richPaddingInline",
    "compactPaddingBlock",
    "compactPaddingInline",
    "compactTitleGap",
    "compactMaxHeight",
    "comfortablePaddingBlock",
    "comfortablePaddingInline",
    "spaciousPaddingBlock",
    "spaciousPaddingInline",
    "spaciousTitleGap",
    "minWidth",
    "maxWidth",
    "maxHeight",
    "bodyMaxHeight",
    "viewportGap",
    "touchTarget",
    "arrowSize",
    "titleBackground",
    "titleColor",
    "titleDivider",
    "titleDividerWidth",
    "titlePaddingBlock",
    "titlePaddingInline",
    "titleGap",
    "titleType",
    "titleLetterSpacing",
    "bodyType",
    "motionDistance",
    "motionScale",
    "enterDuration",
    "enterEasing",
    "exitDuration",
    "exitEasing",
  ] as const
);

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
 * Exhaustive DB/theme contract projection for the compact-label family.
 * Keeping this as a keyed map makes a new BrandBadgeChrome field fail type
 * review until it has a compiler-owned CSS destination.
 */
const BADGE_CHROME_VARIABLES = {
  fontFamily: "--ds-badge-font-family",
  fontWeight: "--ds-badge-font-weight",
  lineHeight: "--ds-badge-line-height",
  letterSpacing: "--ds-badge-letter-spacing",
  gap: "--ds-badge-gap",
  maxInlineSize: "--ds-badge-max-inline-size",
  chipMaxInlineSize: "--ds-badge-chip-max-inline-size",
  pillMaxInlineSize: "--ds-badge-pill-max-inline-size",
  frameWidth: "--ds-badge-frame-width",
  radius: "--ds-badge-radius",
  chipRadius: "--ds-badge-chip-radius",
  pillRadius: "--ds-badge-pill-radius",
  surface: "--ds-badge-surface",
  ink: "--ds-badge-ink",
  frame: "--ds-badge-frame",
  highlight: "--ds-badge-highlight",
  shadow: "--ds-badge-shadow",
  solidBg: "--ds-badge-solid-bg",
  solidColor: "--ds-badge-solid-color",
  solidBorder: "--ds-badge-solid-border",
  softBg: "--ds-badge-soft-bg",
  softColor: "--ds-badge-soft-color",
  softBorder: "--ds-badge-soft-border",
  ghostBg: "--ds-badge-ghost-bg",
  ghostColor: "--ds-badge-ghost-color",
  ghostBorder: "--ds-badge-ghost-border",
  ghostShadow: "--ds-badge-ghost-shadow",
  outlineBg: "--ds-badge-outline-bg",
  outlineColor: "--ds-badge-outline-color",
  outlineBorder: "--ds-badge-outline-border",
  outlineShadow: "--ds-badge-outline-shadow",
  surfaceHover: "--ds-badge-surface-hover",
  inkHover: "--ds-badge-ink-hover",
  frameHover: "--ds-badge-frame-hover",
  highlightHover: "--ds-badge-highlight-hover",
  shadowHover: "--ds-badge-shadow-hover",
  hoverTransform: "--ds-badge-hover-transform",
  surfacePressed: "--ds-badge-surface-pressed",
  inkPressed: "--ds-badge-ink-pressed",
  framePressed: "--ds-badge-frame-pressed",
  shadowPressed: "--ds-badge-shadow-pressed",
  pressTransform: "--ds-badge-press-transform",
  focusRing: "--ds-badge-focus-ring",
  selectedSurface: "--ds-badge-selected-surface",
  selectedInk: "--ds-badge-selected-ink",
  selectedFrame: "--ds-badge-selected-frame",
  selectedShadow: "--ds-badge-selected-shadow",
  borderedRing: "--ds-badge-bordered-ring",
  iconSize: "--ds-badge-icon-size",
  iconColor: "--ds-badge-icon-color",
  iconBg: "--ds-badge-icon-bg",
  iconBorder: "--ds-badge-icon-border",
  iconBorderWidth: "--ds-badge-icon-border-width",
  iconRadius: "--ds-badge-icon-radius",
  iconShadow: "--ds-badge-icon-shadow",
  avatarSize: "--ds-badge-avatar-size",
  avatarBleed: "--ds-badge-avatar-bleed",
  avatarBg: "--ds-badge-avatar-bg",
  avatarBorder: "--ds-badge-avatar-border",
  avatarBorderWidth: "--ds-badge-avatar-border-width",
  avatarRadius: "--ds-badge-avatar-radius",
  avatarShadow: "--ds-badge-avatar-shadow",
  dotSize: "--ds-badge-dot-size",
  dotBg: "--ds-badge-dot-bg",
  dotBorder: "--ds-badge-dot-border",
  dotBorderWidth: "--ds-badge-dot-border-width",
  dotShadow: "--ds-badge-dot-shadow",
  countMinSize: "--ds-badge-count-min-size",
  countSize: "--ds-badge-count-size",
  countPaddingInline: "--ds-badge-count-padding-inline",
  countBg: "--ds-badge-count-bg",
  countColor: "--ds-badge-count-color",
  countBorder: "--ds-badge-count-border",
  countBorderWidth: "--ds-badge-count-border-width",
  countRadius: "--ds-badge-count-radius",
  countRing: "--ds-badge-count-ring",
  countFontFamily: "--ds-badge-count-font-family",
  countFontSize: "--ds-badge-count-font-size",
  countFontWeight: "--ds-badge-count-font-weight",
  countSelectedBg: "--ds-badge-count-selected-bg",
  countSelectedBorder: "--ds-badge-count-selected-border",
  countSelectedRing: "--ds-badge-count-selected-ring",
  removeSize: "--ds-badge-remove-size",
  removeTouchSize: "--ds-badge-remove-touch-size",
  removeBleed: "--ds-badge-remove-bleed",
  removeBg: "--ds-badge-remove-bg",
  removeColor: "--ds-badge-remove-color",
  removeBorder: "--ds-badge-remove-border",
  removeBorderWidth: "--ds-badge-remove-border-width",
  removeRadius: "--ds-badge-remove-radius",
  removeOpacity: "--ds-badge-remove-opacity",
  removeHoverBg: "--ds-badge-remove-hover-bg",
  removeHoverTransform: "--ds-badge-remove-hover-transform",
  removeFocusRing: "--ds-badge-remove-focus-ring",
  disabledOpacity: "--ds-badge-disabled-opacity",
  disabledFilter: "--ds-badge-disabled-filter",
  loadingOpacity: "--ds-badge-loading-opacity",
  motionDuration: "--ds-badge-motion-duration",
  motionEasing: "--ds-badge-motion-easing",
  pulseDuration: "--ds-badge-pulse-duration",
  pulseTiming: "--ds-badge-pulse-timing",
  pulseScale: "--ds-badge-pulse-scale",
  spinnerDuration: "--ds-badge-spinner-duration",
  touchTarget: "--ds-badge-touch-target",
  containerPaddingInline: "--ds-badge-container-padding-inline",
  indicatorMaxInlineSize: "--ds-badge-indicator-max-inline-size",
  indicatorRadius: "--ds-badge-indicator-radius",
} as const satisfies Readonly<Record<keyof BrandBadgeChrome, string>>;

function setBadgeChromeVars(
  vars: Record<string, string>,
  badge: BrandBadgeChrome | undefined
): void {
  if (!badge) return;
  for (const key of Object.keys(BADGE_CHROME_VARIABLES) as Array<
    keyof BrandBadgeChrome
  >) {
    const value = badge[key];
    if (value !== undefined && value !== null) {
      vars[BADGE_CHROME_VARIABLES[key]] = String(value);
    }
  }
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

/**
 * Map a chrome object (BrandTheme.chrome or TenantAppearanceAdvanced.chrome)
 * to flat CSS variable declarations.
 *
 * This is the explicit chrome channel — sidebar, layout, shell, controls,
 * and table are NOT shoehorned into tokenOverrides or personality.
 */
export function chromeToVariables(
  chrome: BrandChrome | undefined
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!chrome) return vars;

  // Sidebar
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
    if (s.iconSize) vars["--ds-sidebar-icon-size"] = s.iconSize;
    if (s.footerBg) vars["--ds-sidebar-footer-bg"] = s.footerBg;
  }

  // Layout
  if (chrome.layout) {
    const l = chrome.layout;
    if (l.bg) vars["--ds-layout-bg"] = l.bg;
    if (l.headerBg) vars["--ds-layout-header-bg"] = l.headerBg;
    if (l.headerHeight) {
      vars["--ds-layout-header-height"] = l.headerHeight;
      vars["--ds-shell-header-block-size"] = l.headerHeight;
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

  // Badge / Chip / Pill — dedicated microchannel, independent from filters.
  setBadgeChromeVars(vars, chrome.badge);

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

  // Search
  if (chrome.search) {
    const se = chrome.search;
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

  // Controls — all button variants
  if (chrome.controls) {
    const c = chrome.controls;

    if (c.buttonGeometry) {
      const geometry = c.buttonGeometry;
      if (geometry.fontFamily)
        vars["--ds-button-font-family"] = geometry.fontFamily;
      if (geometry.fontWeight != null)
        vars["--ds-button-font-weight"] = String(geometry.fontWeight);
      if (geometry.letterSpacing)
        vars["--ds-button-letter-spacing"] = geometry.letterSpacing;
      if (geometry.textTransform)
        vars["--ds-button-text-transform"] = geometry.textTransform;
      if (geometry.gap) {
        vars["--ds-button-gap"] = geometry.gap;
        for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
          vars[`--ds-button-${size}-gap`] = geometry.gap;
        }
      }
      if (geometry.radius) {
        vars["--ds-radius-button"] = geometry.radius;
        for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
          vars[`--ds-button-${size}-radius`] = geometry.radius;
        }
      }
      if (geometry.borderWidth)
        vars["--ds-button-border-width"] = geometry.borderWidth;
      if (geometry.touchTargetMin)
        vars["--ds-button-touch-target-min"] = geometry.touchTargetMin;
      if (geometry.groupGap) vars["--ds-button-group-gap"] = geometry.groupGap;
      if (geometry.groupMobileDirection)
        vars["--ds-button-group-mobile-direction"] =
          geometry.groupMobileDirection;
      if (geometry.groupMobileGap)
        vars["--ds-button-group-mobile-gap"] = geometry.groupMobileGap;
      if (geometry.groupMobileWidth)
        vars["--ds-button-group-mobile-width"] = geometry.groupMobileWidth;
      if (geometry.hoverTransform)
        vars["--ds-button-hover-transform"] = geometry.hoverTransform;
      if (geometry.activeTransform)
        vars["--ds-button-active-transform"] = geometry.activeTransform;
      if (geometry.iconHoverTransform)
        vars["--ds-button-icon-hover-transform"] = geometry.iconHoverTransform;
      if (geometry.iconActiveTransform)
        vars["--ds-button-icon-active-transform"] =
          geometry.iconActiveTransform;
      if (geometry.labelOffsetY)
        vars["--ds-button-label-offset-y"] = geometry.labelOffsetY;
      if (geometry.hoverFilter)
        vars["--ds-button-hover-filter"] = geometry.hoverFilter;
      if (geometry.activeFilter)
        vars["--ds-button-active-filter"] = geometry.activeFilter;
      if (geometry.focusRingOffset)
        vars["--ds-button-focus-ring-offset"] = geometry.focusRingOffset;
      if (geometry.spinnerDuration)
        vars["--ds-button-spinner-duration"] = geometry.spinnerDuration;
      if (geometry.surfaceHighlight)
        vars["--ds-button-surface-highlight"] = geometry.surfaceHighlight;
      if (geometry.surfaceHighlightOpacity)
        vars["--ds-button-surface-highlight-opacity"] =
          geometry.surfaceHighlightOpacity;
      if (geometry.surfaceHighlightHoverOpacity)
        vars["--ds-button-surface-highlight-hover-opacity"] =
          geometry.surfaceHighlightHoverOpacity;
      if (geometry.surfaceHighlightActiveOpacity)
        vars["--ds-button-surface-highlight-active-opacity"] =
          geometry.surfaceHighlightActiveOpacity;
      if (geometry.gradient) vars["--ds-button-gradient"] = geometry.gradient;
      if (geometry.aiTexture)
        vars["--ds-button-ai-texture"] = geometry.aiTexture;
      if (geometry.transitionDuration)
        vars["--ds-button-transition-duration"] = geometry.transitionDuration;
      if (geometry.transitionTiming)
        vars["--ds-button-transition-timing"] = geometry.transitionTiming;
      setControlSizeVars(vars, "button", "xs", geometry.xs);
      setControlSizeVars(vars, "button", "sm", geometry.sm);
      setControlSizeVars(vars, "button", "md", geometry.md);
      setControlSizeVars(vars, "button", "lg", geometry.lg);
      setControlSizeVars(vars, "button", "xl", geometry.xl);
    }

    if (c.fieldGeometry) {
      const geometry = c.fieldGeometry;
      if (geometry.gap) vars["--ds-input-gap"] = geometry.gap;
      if (geometry.radius) vars["--ds-radius-input"] = geometry.radius;
      if (geometry.fontFamily)
        vars["--ds-input-font-family"] = geometry.fontFamily;
      if (geometry.fontWeight != null)
        vars["--ds-input-font-weight"] = String(geometry.fontWeight);
      if (geometry.letterSpacing)
        vars["--ds-input-letter-spacing"] = geometry.letterSpacing;
      if (geometry.borderWidth)
        vars["--ds-input-border-width"] = geometry.borderWidth;
      if (geometry.borderStyle)
        vars["--ds-input-border-style"] = geometry.borderStyle;
      if (geometry.messageGap)
        vars["--ds-input-message-gap"] = geometry.messageGap;
      if (geometry.groupGap) vars["--ds-input-group-gap"] = geometry.groupGap;
      if (geometry.groupGapSeparated)
        vars["--ds-input-group-gap-separated"] = geometry.groupGapSeparated;
      if (geometry.groupOverlap)
        vars["--ds-input-group-overlap"] = geometry.groupOverlap;
      if (geometry.groupMinItemWidth)
        vars["--ds-input-group-min-item-width"] = geometry.groupMinItemWidth;
      if (geometry.formFieldGap)
        vars["--ds-form-field-gap"] = geometry.formFieldGap;
      if (geometry.horizontalGap)
        vars["--ds-form-field-horizontal-gap"] = geometry.horizontalGap;
      if (geometry.labelOffsetY)
        vars["--ds-form-field-label-offset-y"] = geometry.labelOffsetY;
      if (geometry.requiredGap)
        vars["--ds-form-field-required-gap"] = geometry.requiredGap;
      if (geometry.formFieldDisabledOpacity != null)
        vars["--ds-form-field-disabled-opacity"] = String(
          geometry.formFieldDisabledOpacity
        );
      if (geometry.labelFontSize)
        vars["--ds-input-label-font-size"] = geometry.labelFontSize;
      if (geometry.labelFontWeight != null)
        vars["--ds-input-label-font-weight"] = String(geometry.labelFontWeight);
      if (geometry.labelFontFamily)
        vars["--ds-input-label-font-family"] = geometry.labelFontFamily;
      if (geometry.labelLetterSpacing)
        vars["--ds-input-label-letter-spacing"] = geometry.labelLetterSpacing;
      if (geometry.labelLineHeight)
        vars["--ds-input-label-line-height"] = geometry.labelLineHeight;
      if (geometry.helperFontSize)
        vars["--ds-input-helper-font-size"] = geometry.helperFontSize;
      if (geometry.helperLineHeight)
        vars["--ds-input-helper-line-height"] = geometry.helperLineHeight;
      if (geometry.affixSize)
        vars["--ds-input-affix-size"] = geometry.affixSize;
      if (geometry.affixSizeCompact)
        vars["--ds-input-affix-size-compact"] = geometry.affixSizeCompact;
      if (geometry.affixRadius)
        vars["--ds-input-affix-radius"] = geometry.affixRadius;
      if (geometry.actionSize)
        vars["--ds-input-action-size"] = geometry.actionSize;
      if (geometry.actionRadius)
        vars["--ds-input-action-radius"] = geometry.actionRadius;
      if (geometry.touchTargetMin)
        vars["--ds-input-touch-target-min"] = geometry.touchTargetMin;
      if (geometry.loadingSize)
        vars["--ds-input-loading-size"] = geometry.loadingSize;
      if (geometry.loadingStroke)
        vars["--ds-input-loading-stroke"] = geometry.loadingStroke;
      if (geometry.loadingDuration)
        vars["--ds-input-loading-duration"] = geometry.loadingDuration;
      if (geometry.textareaMinHeight)
        vars["--ds-textarea-min-height"] = geometry.textareaMinHeight;
      if (geometry.textareaMaxHeight)
        vars["--ds-textarea-max-height"] = geometry.textareaMaxHeight;
      if (geometry.textareaPaddingX)
        vars["--ds-textarea-padding-x"] = geometry.textareaPaddingX;
      if (geometry.textareaPaddingY)
        vars["--ds-textarea-padding-y"] = geometry.textareaPaddingY;
      if (geometry.textareaRadius)
        vars["--ds-textarea-radius"] = geometry.textareaRadius;
      if (geometry.textareaResize)
        vars["--ds-textarea-resize"] = geometry.textareaResize;
      if (geometry.transitionDuration)
        vars["--ds-input-transition-duration"] = geometry.transitionDuration;
      if (geometry.transitionTiming)
        vars["--ds-input-transition-timing"] = geometry.transitionTiming;
      setControlSizeVars(vars, "input", "xs", geometry.xs);
      setControlSizeVars(vars, "input", "sm", geometry.sm);
      setControlSizeVars(vars, "input", "md", geometry.md);
      setControlSizeVars(vars, "input", "lg", geometry.lg);
      setControlSizeVars(vars, "input", "xl", geometry.xl);
    }

    if (c.segmented) {
      const segmented = c.segmented;
      if (segmented.bg) vars["--ds-segmented-bg"] = segmented.bg;
      if (segmented.border) vars["--ds-segmented-border"] = segmented.border;
      if (segmented.radius) vars["--ds-segmented-radius"] = segmented.radius;
      if (segmented.padding) vars["--ds-segmented-padding"] = segmented.padding;
      if (segmented.gap) vars["--ds-segmented-gap"] = segmented.gap;
      if (segmented.shadow) vars["--ds-segmented-shadow"] = segmented.shadow;
      if (segmented.itemBg) vars["--ds-segmented-item-bg"] = segmented.itemBg;
      if (segmented.itemBgHover)
        vars["--ds-segmented-item-bg-hover"] = segmented.itemBgHover;
      if (segmented.itemBgSelected)
        vars["--ds-segmented-item-bg-selected"] = segmented.itemBgSelected;
      if (segmented.itemColor)
        vars["--ds-segmented-item-color"] = segmented.itemColor;
      if (segmented.itemColorHover)
        vars["--ds-segmented-item-color-hover"] = segmented.itemColorHover;
      if (segmented.itemColorSelected)
        vars["--ds-segmented-item-color-selected"] =
          segmented.itemColorSelected;
      if (segmented.itemRadius)
        vars["--ds-segmented-item-radius"] = segmented.itemRadius;
      if (segmented.itemShadowSelected)
        vars["--ds-segmented-item-shadow-selected"] =
          segmented.itemShadowSelected;
      if (segmented.itemFontWeight != null)
        vars["--ds-segmented-item-font-weight"] = String(
          segmented.itemFontWeight
        );
      if (segmented.itemFontWeightSelected != null)
        vars["--ds-segmented-item-font-weight-selected"] = String(
          segmented.itemFontWeightSelected
        );
      if (segmented.focusRing)
        vars["--ds-segmented-focus-ring"] = segmented.focusRing;
      setSegmentedSizeVars(vars, "sm", segmented.sm);
      setSegmentedSizeVars(vars, "md", segmented.md);
      setSegmentedSizeVars(vars, "lg", segmented.lg);
    }

    setButtonVariantVars(vars, "primary", c.buttonPrimary);
    setButtonVariantVars(vars, "secondary", c.buttonSecondary);
    setButtonVariantVars(vars, "default", c.buttonDefault);
    setButtonVariantVars(vars, "ghost", c.buttonGhost);
    setButtonVariantVars(vars, "text", c.buttonText);
    setButtonVariantVars(vars, "dashed", c.buttonDashed);
    setButtonVariantVars(vars, "link", c.buttonLink);
    setButtonVariantVars(vars, "success", c.buttonSuccess);
    setButtonVariantVars(vars, "warning", c.buttonWarning);
    setButtonVariantVars(vars, "error", c.buttonError);
    setButtonVariantVars(vars, "info", c.buttonInfo);
    setButtonVariantVars(vars, "ai", c.buttonAI);

    if (c.focusRing) vars["--ds-button-focus-ring"] = c.focusRing;

    if (c.disabled) {
      if (c.disabled.opacity != null)
        vars["--ds-button-disabled-opacity"] = String(c.disabled.opacity);
      if (c.disabled.bg) vars["--ds-button-disabled-bg"] = c.disabled.bg;
      if (c.disabled.text) vars["--ds-button-disabled-color"] = c.disabled.text;
      if (c.disabled.border)
        vars["--ds-button-disabled-border"] = c.disabled.border;
      if (c.disabled.borderColor)
        vars["--ds-button-disabled-border-color"] = c.disabled.borderColor;
      // Input disabled mirrors
      if (c.disabled.bg) vars["--ds-input-bg-disabled"] = c.disabled.bg;
      if (c.disabled.text) vars["--ds-input-color-disabled"] = c.disabled.text;
      if (c.disabled.border)
        vars["--ds-input-border-disabled"] = c.disabled.border;
      if (c.disabled.borderColor)
        vars["--ds-input-border-color-disabled"] = c.disabled.borderColor;
      if (c.disabled.opacity != null)
        vars["--ds-input-disabled-opacity"] = String(c.disabled.opacity);
    }

    // Input chrome (full)
    if (c.input) {
      const i = c.input;
      if (i.bg) vars["--ds-input-bg"] = i.bg;
      if (i.bgHover) vars["--ds-input-bg-hover"] = i.bgHover;
      if (i.bgFocus) vars["--ds-input-bg-focus"] = i.bgFocus;
      if (i.bgDisabled) vars["--ds-input-bg-disabled"] = i.bgDisabled;
      if (i.color) vars["--ds-input-color"] = i.color;
      if (i.colorPlaceholder)
        vars["--ds-input-color-placeholder"] = i.colorPlaceholder;
      if (i.colorDisabled) vars["--ds-input-color-disabled"] = i.colorDisabled;
      if (i.border) vars["--ds-input-border"] = i.border;
      if (i.borderHover) vars["--ds-input-border-hover"] = i.borderHover;
      if (i.borderFocus) vars["--ds-input-border-focus"] = i.borderFocus;
      if (i.borderDisabled)
        vars["--ds-input-border-disabled"] = i.borderDisabled;
      if (i.disabledOpacity != null)
        vars["--ds-input-disabled-opacity"] = String(i.disabledOpacity);
      if (i.shadowRest) vars["--ds-input-shadow-rest"] = i.shadowRest;
      if (i.shadowHover) vars["--ds-input-shadow-hover"] = i.shadowHover;
      if (i.shadowFocus) vars["--ds-input-shadow-focus"] = i.shadowFocus;
      if (i.insetShadow) vars["--ds-input-inset-shadow"] = i.insetShadow;
      if (i.caretColor) vars["--ds-input-caret-color"] = i.caretColor;
      if (i.selectionBg) vars["--ds-input-selection-bg"] = i.selectionBg;
      if (i.selectionColor)
        vars["--ds-input-selection-color"] = i.selectionColor;
      if (i.placeholderOpacity != null)
        vars["--ds-input-placeholder-opacity"] = String(i.placeholderOpacity);
      if (i.filled) {
        if (i.filled.bg) vars["--ds-input-filled-bg"] = i.filled.bg;
        if (i.filled.bgHover)
          vars["--ds-input-filled-bg-hover"] = i.filled.bgHover;
        if (i.filled.bgFocus)
          vars["--ds-input-filled-bg-focus"] = i.filled.bgFocus;
        if (i.filled.border) vars["--ds-input-filled-border"] = i.filled.border;
      }
      if (i.addon) {
        if (i.addon.bg) vars["--ds-input-addon-bg"] = i.addon.bg;
        if (i.addon.color) vars["--ds-input-addon-color"] = i.addon.color;
        if (i.addon.border) vars["--ds-input-addon-border"] = i.addon.border;
        if (i.addon.radius) vars["--ds-input-addon-radius"] = i.addon.radius;
        if (i.addon.fontWeight != null)
          vars["--ds-input-addon-font-weight"] = String(i.addon.fontWeight);
      }
      if (i.affix) {
        if (i.affix.bg) vars["--ds-input-affix-bg"] = i.affix.bg;
        if (i.affix.color) vars["--ds-input-affix-color"] = i.affix.color;
        if (i.affix.border) vars["--ds-input-affix-border"] = i.affix.border;
        if (i.affix.paddingX)
          vars["--ds-input-affix-padding-x"] = i.affix.paddingX;
      }
      if (i.label?.color) vars["--ds-input-label-color"] = i.label.color;
      if (i.label?.requiredColor)
        vars["--ds-input-label-required-color"] = i.label.requiredColor;
      if (i.label?.disabledColor)
        vars["--ds-input-label-color-disabled"] = i.label.disabledColor;
      if (i.helper?.color) vars["--ds-input-helper-color"] = i.helper.color;
      if (i.helper?.errorColor)
        vars["--ds-input-error-message-color"] = i.helper.errorColor;
      if (i.helper?.errorFontWeight != null)
        vars["--ds-input-error-message-font-weight"] = String(
          i.helper.errorFontWeight
        );
      if (i.clear) {
        if (i.clear.color) vars["--ds-input-clear-color"] = i.clear.color;
        if (i.clear.colorHover)
          vars["--ds-input-clear-color-hover"] = i.clear.colorHover;
        if (i.clear.bg) vars["--ds-input-clear-bg"] = i.clear.bg;
        if (i.clear.bgHover)
          vars["--ds-input-clear-bg-hover"] = i.clear.bgHover;
        if (i.clear.border) vars["--ds-input-clear-border"] = i.clear.border;
        if (i.clear.borderHover)
          vars["--ds-input-clear-border-hover"] = i.clear.borderHover;
        if (i.clear.shadowHover)
          vars["--ds-input-action-shadow-hover"] = i.clear.shadowHover;
        if (i.clear.focusRing)
          vars["--ds-input-action-focus-ring"] = i.clear.focusRing;
        if (i.clear.activeTransform)
          vars["--ds-input-action-active-transform"] = i.clear.activeTransform;
      }
      if (i.readOnly) {
        if (i.readOnly.bg) vars["--ds-input-readonly-bg"] = i.readOnly.bg;
        if (i.readOnly.color)
          vars["--ds-input-readonly-color"] = i.readOnly.color;
        if (i.readOnly.border)
          vars["--ds-input-readonly-border"] = i.readOnly.border;
        if (i.readOnly.borderStyle)
          vars["--ds-input-readonly-border-style"] = i.readOnly.borderStyle;
        if (i.readOnly.cursor)
          vars["--ds-input-readonly-cursor"] = i.readOnly.cursor;
      }
      if (i.loadingColor) vars["--ds-input-loading-color"] = i.loadingColor;
      if (i.autofill) {
        if (i.autofill.bg) vars["--ds-input-autofill-bg"] = i.autofill.bg;
        if (i.autofill.color)
          vars["--ds-input-autofill-color"] = i.autofill.color;
        if (i.autofill.caret)
          vars["--ds-input-autofill-caret"] = i.autofill.caret;
      }
      if (i.count) {
        if (i.count.color) vars["--ds-input-count-color"] = i.count.color;
        if (i.count.colorWarning)
          vars["--ds-input-count-color-warning"] = i.count.colorWarning;
        if (i.count.colorError)
          vars["--ds-input-count-color-error"] = i.count.colorError;
      }
      if (i.successBorder) vars["--ds-input-success-border"] = i.successBorder;
      if (i.successBg) vars["--ds-input-success-bg"] = i.successBg;
      if (i.successShadowFocus)
        vars["--ds-input-success-shadow-focus"] = i.successShadowFocus;
      if (i.warningBorder) vars["--ds-input-warning-border"] = i.warningBorder;
      if (i.warningBg) vars["--ds-input-warning-bg"] = i.warningBg;
      if (i.warningShadowFocus)
        vars["--ds-input-warning-shadow-focus"] = i.warningShadowFocus;
      if (i.errorBorder) vars["--ds-input-error-border"] = i.errorBorder;
      if (i.errorBg) vars["--ds-input-error-bg"] = i.errorBg;
      if (i.errorShadowFocus)
        vars["--ds-input-error-shadow-focus"] = i.errorShadowFocus;
      if (i.errorColor) vars["--ds-input-error-color"] = i.errorColor;
    }
  }

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
    if (cc.shadowElevated) {
      vars["--ds-card-shadow-elevated"] = cc.shadowElevated;
      vars["--ds-card-elevated-shadow"] = cc.shadowElevated;
    }
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

  // Metric/stat card chrome
  if (chrome.metricCard) {
    const mc = chrome.metricCard;
    setPremiumCardVars(vars, "metric-card", mc);
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

  // Signal/status card chrome
  if (chrome.signalCard) {
    const sc = chrome.signalCard;
    setPremiumCardVars(vars, "signal-card", sc);
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

  setPremiumCardVars(vars, "workspace-card", chrome.workspaceCard);
  setPremiumCardVars(vars, "compact-card", chrome.compactCard);
  setPremiumCardVars(vars, "tall-card", chrome.tallCard);
  setPremiumCardVars(vars, "collection-card", chrome.collectionCard);
  setListingGridVars(vars, chrome.listingGrid);

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

  setMappedChromeVars(vars, chrome.tooltip, TOOLTIP_CHROME_VARIABLES);
  setMappedChromeVars(vars, chrome.popover, POPOVER_CHROME_VARIABLES);

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

  return vars;
}
