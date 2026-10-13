export interface BrandTableChrome {
  anatomy?: "default" | "ruled" | "zebra" | "open";
  bg?: string;
  border?: string;
  radius?: string;
  /** Header */
  headerBg?: string;
  headerBgHover?: string;
  headerColor?: string;
  headerFontWeight?: string | number;
  headerFontSize?: string;
  headerLetterSpacing?: string;
  headerTextTransform?: string;
  headerBlockSize?: string;
  headerBorder?: string;
  headerShadow?: string;
  /** Rows */
  rowBg?: string;
  rowBgHover?: string;
  rowBgStriped?: string;
  rowBgSelected?: string;
  rowBgExpanded?: string;
  rowBorder?: string;
  rowHoverShadow?: string;
  /** Keyboard-focus treatment for a row, independent of hover. */
  rowFocusShadow?: string;
  /** Cells */
  cellPadding?: string;
  /** Density-specific cell padding. These win over the legacy global value. */
  cellPaddingCompact?: string;
  cellPaddingComfortable?: string;
  cellPaddingSpacious?: string;
  cellFontSize?: string;
  cellColor?: string;
  /** Filter/header utilities */
  filterRowBg?: string;
  filterFocusShadow?: string;
  /** Drag/resize/action affordances */
  resizeBg?: string;
  resizeBgHover?: string;
  reorderBg?: string;
  actionBg?: string;
  actionBorder?: string;
  sheen?: string;
  pageButtonHoverShadow?: string;
  /** Loading */
  loadingOverlayBg?: string;
}

export interface BrandCardChrome {
  anatomy?: "default" | "framed" | "underline" | "ghost";
  padding?: string;
  paddingSm?: string;
  paddingMd?: string;
  paddingLg?: string;
  paddingXl?: string;
  bg?: string;
  bgHover?: string;
  bgActive?: string;
  bgSelected?: string;
  bgDisabled?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  colorSelected?: string;
  colorDisabled?: string;
  colorMuted?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderHover?: string;
  borderColorHover?: string;
  borderActive?: string;
  borderSelected?: string;
  borderDisabled?: string;
  borderAccentHover?: string;
  radius?: string;
  radiusSm?: string;
  radiusLg?: string;
  radiusXl?: string;
  shadow?: string;
  shadowHover?: string;
  shadowActive?: string;
  shadowSelected?: string;
  shadowElevated?: string;
  focusRing?: string;
  focusRingColor?: string;
  focusRingWidth?: string;
  focusRingOffset?: string;
  selectedOutlineWidth?: string;
  hoverTransform?: string;
  activeTransform?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  disabledOpacity?: number;
  texture?: string;
  textureSize?: string;
  textureOpacity?: number;
  overlay?: string;
  surfaceGradient?: string;
  stateOverlay?: string;
  stateOverlayHoverOpacity?: number;
  stateOverlayActiveOpacity?: number;
  stateOverlaySelectedOpacity?: number;
  /** Per-material variant channels. */
  elevatedBg?: string;
  elevatedBorderWidth?: string;
  elevatedShadow?: string;
  elevatedShadowHover?: string;
  outlinedBg?: string;
  outlinedBorderWidth?: string;
  outlinedBorderColor?: string;
  outlinedShadow?: string;
  filledBg?: string;
  filledBorderWidth?: string;
  filledShadow?: string;
  ghostBg?: string;
  ghostBorderColor?: string;
  ghostShadow?: string;
  /** Header */
  headerBorder?: string;
  headerBorderColor?: string;
  headerBorderWidth?: string;
  headerBg?: string;
  headerColor?: string;
  headerPadding?: string;
  headerPaddingSm?: string;
  headerPaddingLg?: string;
  headerGap?: string;
  headerActionsGap?: string;
  headerMinHeight?: string;
  headerCopyMaxWidth?: string;
  headerEyebrowSize?: string;
  headerEyebrowTracking?: string;
  headerIconSize?: string;
  headerIconRadius?: string;
  headerIconBg?: string;
  headerIconBorder?: string;
  headerIconColor?: string;
  headerExtraBg?: string;
  headerExtraBorder?: string;
  headerExtraRadius?: string;
  headerExtraPadding?: string;
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string | number;
  titleLineHeight?: string;
  titleLetterSpacing?: string;
  subtitleColor?: string;
  subtitleFontSize?: string;
  subtitleMarginTop?: string;
  /** Body */
  bodyColor?: string;
  bodyPadding?: string;
  bodyPaddingSm?: string;
  bodyPaddingLg?: string;
  bodyFontSize?: string;
  bodyLineHeight?: string;
  /** Footer */
  footerBorder?: string;
  footerBorderColor?: string;
  footerBorderWidth?: string;
  footerBg?: string;
  footerColor?: string;
  footerPadding?: string;
  footerPaddingSm?: string;
  footerPaddingLg?: string;
  footerActionsGap?: string;
  actionsGap?: string;
  actionsMarginTop?: string;
  actionsPaddingTop?: string;
  /** Image */
  coverInlineSize?: string;
  coverInlineMinSize?: string;
  coverBlockMinSize?: string;
  coverAspectRatio?: string;
  coverObjectPosition?: string;
  coverObjectFit?: string;
  bodyInlineMinSize?: string;
  imagePlaceholderBg?: string;
  imagePlaceholderColor?: string;
  imageHeight?: string;
  imageLoadingTrack?: string;
  imageLoadingActive?: string;
  imageLoadingSize?: string;
  imageLoadingStroke?: string;
  imageLoadingDuration?: string;
  imageErrorIconSize?: string;
  spinnerSize?: string;
  spinnerStroke?: string;
  spinnerTrack?: string;
  spinnerColor?: string;
  spinnerDuration?: string;
  loadingOverlayBg?: string;
  loadingBackdropBlur?: string;
  loadingCoverOpacity?: number;
  loadingSkeletonOpacity?: number;
  skeletonBg?: string;
  skeletonHighlight?: string;
  skeletonRadius?: string;
  skeletonDuration?: string;
}

export interface BrandPremiumCardChrome {
  bg?: string;
  bgHover?: string;
  border?: string;
  borderHover?: string;
  selectedBorder?: string;
  selectedRing?: string;
  shadow?: string;
  shadowHover?: string;
  radius?: string;
  padding?: string;
  gap?: string;
  minHeight?: string;
  glassBg?: string;
  gridSize?: string;
  gridLine?: string;
  gridBg?: string;
  overlay?: string;
  sheen?: string;
  depth?: string;
  hoverTransform?: string;
  transition?: string;
  iconBg?: string;
  iconBorder?: string;
  iconColor?: string;
  titleColor?: string;
  bodyColor?: string;
  labelColor?: string;
  valueColor?: string;
  valueHoverColor?: string;
  footerBg?: string;
  footerBorder?: string;
  footerColor?: string;
  statusBg?: string;
  statusBorder?: string;
  statusColor?: string;
  actionBg?: string;
  actionBorder?: string;
  actionColor?: string;
  meterTrack?: string;
  meterTrackBorder?: string;
  meterFill?: string;
  numberMinWidth?: string;
  numberFontVariant?: string;
  /**
   * Banded interior: the header strip and the alternating body sections a rich
   * card uses to separate its regions without drawing nested card frames.
   */
  headerBg?: string;
  sectionBg?: string;
  sectionAltBg?: string;
}

export interface BrandMetricCardChrome extends BrandPremiumCardChrome {
  trendColor?: string;
  trendColorWarning?: string;
  trendColorError?: string;
  trendErrorBg?: string;
  trendErrorBorder?: string;
  meterFillSuccess?: string;
  meterFillWarning?: string;
  meterFillError?: string;
  meterFillNeutral?: string;
  meterHeight?: string;
}

export interface BrandSignalCardChrome extends BrandPremiumCardChrome {
  accent?: string;
  soft?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeColor?: string;
  sectionBg?: string;
  sectionAltBg?: string;
  topLineDisplay?: string;
}

export interface BrandListingGridChrome {
  gap?: string;
  minCardWidth?: string;
  minCompactWidth?: string;
  minTallWidth?: string;
  columns?: string;
  cardGap?: string;
  cardBg?: string;
  cardBorder?: string;
  cardShadow?: string;
  selectedRing?: string;
  emptyBg?: string;
  emptyBorder?: string;
  skeletonBg?: string;
}

/**
 * Collection list shell and preview-rail chrome.
 *
 * The collection workspace renders one list shell and one preview rail; the
 * tenant tunes the rail's material, the gutter it opens against the list, the
 * choreography of its resize, and the band that separates the toolbar row from
 * the section above it. Anatomy inside the rail belongs to the caller's own
 * render slot, so nothing here names a lane, meter or quick-action part.
 */
export interface BrandListChrome {
  /** Preview rail */
  previewRailGap?: string;
  previewPanelBg?: string;
  previewPanelBorder?: string;
  previewPanelShadow?: string;
  previewMotionDuration?: string;
  previewMotionEase?: string;
  /** List shell */
  shellSectionGap?: string;
  /**
   * Row and container paint.
   *
   * `bg`/`backgroundColor` and `itemBgHover`/`itemHoverBackgroundColor` are
   * two spellings of one decision that both ship as separate CSS names today.
   * They are declared as separate leaves because a theme that set only one of
   * them would silently leave the other on its DS floor; collapsing them is a
   * name-retirement ruling, not a contract shape.
   */
  bg?: string;
  backgroundColor?: string;
  borderColor?: string;
  itemBackgroundColor?: string;
  itemBgHover?: string;
  itemHoverBackgroundColor?: string;
  metaDescriptionColor?: string;
  secondaryTextColor?: string;
  skeletonBg?: string;
  splitColor?: string;
  textColor?: string;
}

/**
 * Detail record surface chrome.
 *
 * A detail page is a hero header over a set of section panels beside a rail.
 * The tenant owns the material of the two framed regions and the rail's resting
 * width; the caller's `sidebarWidth` prop still outranks the rail channel, and
 * the panel-level anatomy stays with the DetailPanel component.
 */
export interface BrandDetailChrome {
  /** Hero header */
  heroBg?: string;
  heroBorder?: string;
  heroShadow?: string;
  /** Accent spine drawn along the hero's leading edge. */
  heroSpine?: string;
  /** Section panels (tab panel + sidebar) */
  sectionBg?: string;
  sectionBorder?: string;
  sectionShadow?: string;
  /** Inline controls hosted by the detail hero and section headers. */
  controlBg?: string;
  controlBorder?: string;
  controlBorderHover?: string;
  /**
   * Continuous-record treatment: the hairline and surface used when hero and
   * sections read as one uninterrupted sheet rather than stacked cards.
   */
  continuousBoundary?: string;
  continuousSurface?: string;
  /** Rail */
  railWidth?: string;
}

export interface BrandModalChrome {
  bg?: string;
  color?: string;
  shadow?: string;
  /** Overlay */
  overlayBg?: string;
  overlayBackdrop?: string;
  /** Header */
  headerBg?: string;
  headerBorder?: string;
  titleColor?: string;
  subtitleColor?: string;
  /** Body */
  bodyColor?: string;
  /** Footer */
  footerBorder?: string;
  footerBg?: string;
  /** Close button */
  closeColor?: string;
  closeColorHover?: string;
  closeBgHover?: string;
}

/**
 * Tooltip visual contract shared by static vertical themes and DB appearance.
 * The component owns behavior and anatomy; tenants tune reviewed material,
 * density, geometry and motion channels only.
 */
export interface BrandTooltipChrome {
  /**
   * Tone paint, orthogonal to the recipe blocks below. A recipe
   * (`bordered`/`minimal`/`inverse`/`rich`) chooses the tooltip's material;
   * a tone chooses what it is saying. `bg`/`color` are the unqualified pair a
   * tooltip falls back to when neither axis is set.
   */
  bg?: string;
  color?: string;
  defaultBg?: string;
  defaultColor?: string;
  primaryBg?: string;
  primaryColor?: string;
  secondaryBg?: string;
  secondaryColor?: string;
  successBg?: string;
  warningBg?: string;
  errorBg?: string;
  /** Elevation shared by every tone, before a recipe overrides it. */
  shadow?: string;
  /**
   * Stacking order for the tooltip layer. Lowered to both the scale-shaped
   * name (`--ds-z-index-tooltip`) and the component-shaped one
   * (`--ds-tooltip-z-index`); they are two spellings of one decision, so the
   * contract carries a single field.
   */
  zIndex?: string | number;
  borderedBackground?: string;
  borderedForeground?: string;
  borderedBorder?: string;
  borderedBorderWidth?: string;
  borderedShadow?: string;
  borderedTexture?: string;
  borderedHighlight?: string;
  borderedRadius?: string;
  borderedMaxWidth?: string;
  borderedPaddingBlock?: string;
  borderedPaddingInline?: string;
  minimalBackground?: string;
  minimalForeground?: string;
  minimalBorder?: string;
  minimalBorderWidth?: string;
  minimalShadow?: string;
  minimalTexture?: string;
  minimalHighlight?: string;
  minimalRadius?: string;
  minimalMaxWidth?: string;
  minimalPaddingBlock?: string;
  minimalPaddingInline?: string;
  inverseBackground?: string;
  inverseForeground?: string;
  inverseBorder?: string;
  inverseBorderWidth?: string;
  inverseShadow?: string;
  inverseTexture?: string;
  inverseHighlight?: string;
  inverseRadius?: string;
  inverseMaxWidth?: string;
  inversePaddingBlock?: string;
  inversePaddingInline?: string;
  richBackground?: string;
  richForeground?: string;
  richBorder?: string;
  richBorderWidth?: string;
  richShadow?: string;
  richTexture?: string;
  richHighlight?: string;
  richRadius?: string;
  richMaxWidth?: string;
  richPaddingBlock?: string;
  richPaddingInline?: string;
  richType?: string;
  richLetterSpacing?: string;
  compactPaddingBlock?: string;
  compactPaddingInline?: string;
  compactType?: string;
  comfortablePaddingBlock?: string;
  comfortablePaddingInline?: string;
  spaciousPaddingBlock?: string;
  spaciousPaddingInline?: string;
  spaciousType?: string;
  arrowSize?: string;
  arrowHalfSize?: string;
  arrowOverlap?: string;
  viewportGap?: string;
  touchTarget?: string;
  shortcutGap?: string;
  shortcutChipGap?: string;
  shortcutKeyBackground?: string;
  shortcutKeyBorder?: string;
  shortcutKeyBorderWidth?: string;
  shortcutKeyRadius?: string;
  shortcutKeyShadow?: string;
  shortcutKeyType?: string;
  motionDistance?: string;
  motionScale?: string;
  enterDuration?: string;
  enterEasing?: string;
  exitDuration?: string;
  exitEasing?: string;
}

/**
 * Popover visual contract. It deliberately excludes positioning, focus and
 * dismissal behavior: those remain engine-owned and consistent per tenant.
 *
 * It also excludes a per-recipe `*Highlight`, which the tooltip contract does
 * expose. A popover surface carries exactly one top-light — the
 * intensity-governed zenith keyline the skin declares as a literal — and
 * OVL-PV-01 struck the family sheen that a highlight channel used to feed,
 * because a second gradient on the same surface is the stacked-decoration
 * smell both tenant directions forbid. The per-recipe decoration axis a tenant
 * does own here is `*Texture`, which drives the motif slot on all four
 * recipes; a highlight would be a redundant second one. Retuning the top-light
 * is a change to the keyline, not a new channel.
 */
export interface BrandPopoverChrome {
  /**
   * Unqualified panel paint, before a recipe block below overrides it. A skin
   * that ships one popover material sets these four and stops; the recipe
   * vocabulary stays available for skins that ship several.
   */
  bg?: string;
  border?: string;
  contentColor?: string;
  shadow?: string;
  /** Separator under the title region. Pairs with the existing `titleColor`. */
  titleBorder?: string;
  borderedBackground?: string;
  borderedForeground?: string;
  borderedMutedForeground?: string;
  borderedBorder?: string;
  borderedBorderWidth?: string;
  borderedShadow?: string;
  borderedTexture?: string;
  borderedRadius?: string;
  borderedMaxWidth?: string;
  borderedPaddingBlock?: string;
  borderedPaddingInline?: string;
  borderedTitleGap?: string;
  minimalBackground?: string;
  minimalForeground?: string;
  minimalMutedForeground?: string;
  minimalBorder?: string;
  minimalBorderWidth?: string;
  minimalShadow?: string;
  minimalTexture?: string;
  minimalRadius?: string;
  minimalMaxWidth?: string;
  minimalPaddingBlock?: string;
  minimalPaddingInline?: string;
  inverseBackground?: string;
  inverseForeground?: string;
  inverseMutedForeground?: string;
  inverseBorder?: string;
  inverseShadow?: string;
  inverseTexture?: string;
  inverseRadius?: string;
  richBackground?: string;
  richForeground?: string;
  richMutedForeground?: string;
  richBorder?: string;
  richShadow?: string;
  richTexture?: string;
  richRadius?: string;
  richMaxWidth?: string;
  richPaddingBlock?: string;
  richPaddingInline?: string;
  compactPaddingBlock?: string;
  compactPaddingInline?: string;
  compactTitleGap?: string;
  compactMaxHeight?: string;
  comfortablePaddingBlock?: string;
  comfortablePaddingInline?: string;
  spaciousPaddingBlock?: string;
  spaciousPaddingInline?: string;
  spaciousTitleGap?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
  bodyMaxHeight?: string;
  viewportGap?: string;
  touchTarget?: string;
  arrowSize?: string;
  titleBackground?: string;
  titleColor?: string;
  titleDivider?: string;
  titleDividerWidth?: string;
  titlePaddingBlock?: string;
  titlePaddingInline?: string;
  titleGap?: string;
  titleType?: string;
  titleLetterSpacing?: string;
  bodyType?: string;
  motionDistance?: string;
  motionScale?: string;
  enterDuration?: string;
  enterEasing?: string;
  exitDuration?: string;
  exitEasing?: string;
}
