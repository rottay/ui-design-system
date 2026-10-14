/**
 * Semantic surface paint shared by every component family that draws a raised
 * sheet: the generic `--ds-surface-*` channels, the card grid overlay, and the
 * floating-panel elevation.
 *
 * Distinct from top-level `BrandSurfaces`, which owns the STRUCTURAL posture
 * (radius scale, elevation posture, density, rhythm). This owns the painted
 * result those postures are expressed through.
 */
export interface BrandSurfaceChrome {
  /** Corner radius of the shared medium surface step. */
  radiusMd?: string;
  /** Resting elevation of a generic raised surface. */
  shadow?: string;
  /** Icon tile hosted on a surface. */
  iconBg?: string;
  iconBorder?: string;
  /** Inline chip/metadata pill hosted on a surface. */
  chipBg?: string;
  /** Soft wash of the card's leading side accent. */
  cardSideAccentSoft?: string;
  /**
   * Card grid overlay. `cardGridBg` composes the two hairline gradients built
   * from `cardGridLine` at `cardGridSize` spacing.
   */
  cardGridSize?: string;
  cardGridLine?: string;
  cardGridBg?: string;
  /**
   * Elevation shared by every floating panel. Lowered to the shadow-scale name
   * and to the date/time picker panels, which are the same decision under
   * component-shaped spellings.
   */
  popoverShadow?: string;
  /** Scrim gradient drawn over a card's cover image so its caption stays legible. */
  cardCoverOverlayBg?: string;
  /** The full-bleed environment gradient a dark-first page ground is painted with. */
  gradientDark?: string;
  /** Scrim over a standalone image (lightbox, preview, media tile). */
  imageOverlayBg?: string;
  /** Scrim drawn over the page behind a modal, drawer or command surface. */
  overlayBg?: string;
  /** Ink of a page-shell watermark: present, never competing with content. */
  watermarkColor?: string;
  /** Supporting ink under a page-shell title. */
  pageShellSubtitleColor?: string;
}

export interface BrandSidebarChrome {
  /** Bounded data-only anatomy selection; never emitted as CSS. */
  anatomy?: "default" | "rail" | "panel";
  /** Semantic sidebar posture. Explicit chrome fields below override its defaults. */
  tone?: "subtle" | "strong" | "inverse";
  bg?: string;
  border?: string;
  text?: string;
  textMuted?: string;
  width?: string;
  collapsedWidth?: string;
  headerHeight?: string;
  groupFontSize?: string;
  groupFontWeight?: string | number;
  groupColor?: string;
  groupLetterSpacing?: string;
  /** Space above a group label, separating it from the group before it. */
  groupMarginTop?: string;
  /** Space below a group label, before its first item. */
  groupMarginBottom?: string;
  /** Inner space above a group label. */
  groupPaddingTop?: string;
  itemFontSize?: string;
  itemFontWeight?: string | number;
  itemFontWeightActive?: string | number;
  itemColor?: string;
  itemColorActive?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemPadding?: string;
  /** Extra leading inset for nested items. */
  itemIndent?: string;
  iconSize?: string;
  footerBg?: string;
  /**
   * Optical geometry of the navigation column itself.
   *
   * `itemPadding` above is the shorthand every anatomy shares; these are the
   * axis-specific channels the rail and panel anatomies size independently,
   * which is why a single shorthand cannot express them.
   */
  shellPaddingInline?: string;
  shellPaddingCollapsed?: string;
  itemHeight?: string;
  itemChildHeight?: string;
  itemFontSizeChild?: string;
  itemPaddingInline?: string;
  iconColumnSize?: string;
  itemGap?: string;
  childPaddingInline?: string;
}

export interface BrandLayoutChrome {
  /** Bounded data-only anatomy selection; never emitted as CSS. */
  anatomy?: "default" | "flat" | "floating";
  bg?: string;
  headerBg?: string;
  headerHeight?: string;
  headerBackdrop?: string;
  headerBorder?: string;
  siderBg?: string;
  siderBorder?: string;
  /** Optional finish for the structural Container primitive. */
  containerBackground?: string;
  containerBorder?: string;
  containerRadius?: string;
  containerShadow?: string;
  containerMotionDuration?: string;
  containerMotionEasing?: string;
  /** Optional finish for responsive media frames. */
  aspectRatioBackground?: string;
  aspectRatioBorder?: string;
  aspectRatioRadius?: string;
  aspectRatioShadow?: string;
  aspectRatioOverflow?: string;
  aspectRatioMotionDuration?: string;
  aspectRatioMotionEasing?: string;
  /** Divider rhythm, line and localized label craft. */
  dividerColor?: string;
  /** Ink of a divider's inline label. Separate decision from the line itself. */
  dividerTextColor?: string;
  dividerThicknessThin?: string;
  dividerThicknessMedium?: string;
  dividerThicknessThick?: string;
  dividerContentGap?: string;
  dividerEdgeSegment?: string;
  dividerMinSegment?: string;
  dividerLabelMaxWidth?: string;
  dividerLabelFontSize?: string;
  dividerLabelFontWeight?: string;
  dividerLabelLineHeight?: string;
  dividerLabelTransform?: string;
  dividerLabelTracking?: string;
  dividerMotionDuration?: string;
  dividerMotionEasing?: string;
  /** Stack separators and Space transitions share the layout personality. */
  stackDividerSize?: string;
  stackDividerColor?: string;
  stackDividerOpacity?: string;
  spaceMotionDuration?: string;
  spaceMotionEasing?: string;
}

export interface BrandShellChrome {
  gridSize?: string;
  gridLine?: string;
  gridOpacity?: number;
  bg?: string;
  border?: string;
  overlay?: string;
  shadow?: string;
  activeBg?: string;
  activeGradient?: string;
  dropdownShadow?: string;
  shimmerFaint?: string;
  shimmerSoft?: string;
  shimmerMedium?: string;
  shimmerStrong?: string;
  commandFont?: string;
  commandLetterSpacing?: string;
  commandGridSize?: string;
  commandGridLineSoft?: string;
  commandGridLine?: string;
  commandGridLineStrong?: string;
  commandGridBg?: string;
  commandGridBgStrong?: string;
  commandGlow?: string;
  commandLine?: string;
  commandRailBg?: string;
  commandHomeMaxWidth?: string;
  commandHomeGap?: string;
  commandHomePanelGap?: string;
  commandHomeGridLine?: string;
  commandHomePanelBorder?: string;
  commandHomePanelBorderSoft?: string;
  commandHomePanelShadow?: string;
  commandHomePanelBg?: string;
  /**
   * @deprecated Admitted and inert: no DS or app part reads it and nothing emits it. Removal is
   * major-gated behind the stored-document migration (WO-RET-07); use `--ds-command-home-surface-bg`.
   */
  commandHomePanelBgStrong?: string;
  commandHomeCompactActionHeight?: string;
  commandHomeConsoleMinHeight?: string;
  commandHomeConsolePadding?: string;
  commandHomeConsoleBg?: string;
  commandHomeSurfaceBg?: string;
  commandHomeHeroBg?: string;
  commandHomeIconBg?: string;
  commandHomeIconBorder?: string;
  commandHomeControlBg?: string;
  commandHomeControlBorder?: string;
  commandHomeControlHoverBg?: string;
  commandHomeControlHoverBorder?: string;
  commandHomeMeterBg?: string;
  commandHomeMeterFill?: string;
}

export interface BrandToolbarChrome {
  bg?: string;
  border?: string;
  borderBottom?: string;
  color?: string;
  shadow?: string;
  radius?: string;
  padding?: string;
  gap?: string;
  controlBg?: string;
  controlBorder?: string;
  controlColor?: string;
  divider?: string;
}

export interface BrandFilterPillChrome {
  bg?: string;
  border?: string;
  color?: string;
  shadow?: string;
  frameBg?: string;
  frameBorder?: string;
  frameShadow?: string;
  hoverBg?: string;
  hoverBorder?: string;
  activeBg?: string;
  activeBorder?: string;
  activeColor?: string;
  activeShadow?: string;
  focusRing?: string;
  countBg?: string;
  countActiveBg?: string;
  countBorder?: string;
  countActiveBorder?: string;
  countRing?: string;
  countActiveRing?: string;
}

/**
 * Dedicated compact-label chrome for Badge, Chip and Pill.
 *
 * This family is intentionally independent from `filterPill`: a badge can be
 * passive, semantic, removable, identity-bearing or an anchored count. DB
 * tenants therefore need one bounded, compiler-owned channel that covers the
 * complete anatomy without product CSS or inline paint.
 */
export interface BrandBadgeChrome {
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  gap?: string;
  /** Overall pill geometry, independent of the tone/variant paint below. */
  height?: string;
  paddingX?: string;
  /**
   * Semantic tone paint. This is the status vocabulary (`default`/`primary`/
   * `secondary`/`success`/`warning`/`error`/`info`) and is orthogonal to the
   * `solid`/`soft`/`ghost`/`outline` EMPHASIS vocabulary further down: a badge
   * picks one tone and one emphasis.
   */
  defaultBg?: string;
  defaultColor?: string;
  primaryBg?: string;
  primaryColor?: string;
  secondaryBg?: string;
  secondaryColor?: string;
  successBg?: string;
  successColor?: string;
  warningBg?: string;
  warningColor?: string;
  errorBg?: string;
  errorColor?: string;
  infoBg?: string;
  infoColor?: string;
  /**
   * Tone-independent frame and ink. A skin that draws every badge on one
   * hairline and one reading ink sets these once instead of restating the
   * same pair across all seven tones.
   */
  borderColor?: string;
  textColor?: string;
  maxInlineSize?: string;
  chipMaxInlineSize?: string;
  pillMaxInlineSize?: string;
  frameWidth?: string;
  radius?: string;
  chipRadius?: string;
  pillRadius?: string;
  surface?: string;
  ink?: string;
  frame?: string;
  highlight?: string;
  shadow?: string;
  solidBg?: string;
  solidColor?: string;
  solidBorder?: string;
  softBg?: string;
  softColor?: string;
  softBorder?: string;
  ghostBg?: string;
  ghostColor?: string;
  ghostBorder?: string;
  ghostShadow?: string;
  outlineBg?: string;
  outlineColor?: string;
  outlineBorder?: string;
  outlineShadow?: string;
  surfaceHover?: string;
  inkHover?: string;
  frameHover?: string;
  highlightHover?: string;
  shadowHover?: string;
  hoverTransform?: string;
  surfacePressed?: string;
  inkPressed?: string;
  framePressed?: string;
  shadowPressed?: string;
  pressTransform?: string;
  focusRing?: string;
  selectedSurface?: string;
  selectedInk?: string;
  selectedFrame?: string;
  selectedShadow?: string;
  borderedRing?: string;
  iconSize?: string;
  iconColor?: string;
  iconBg?: string;
  iconBorder?: string;
  iconBorderWidth?: string;
  iconRadius?: string;
  iconShadow?: string;
  avatarSize?: string;
  avatarBleed?: string;
  avatarBg?: string;
  avatarBorder?: string;
  avatarBorderWidth?: string;
  avatarRadius?: string;
  avatarShadow?: string;
  dotSize?: string;
  dotBg?: string;
  dotBorder?: string;
  dotBorderWidth?: string;
  dotShadow?: string;
  countMinSize?: string;
  countSize?: string;
  countPaddingInline?: string;
  countBg?: string;
  countColor?: string;
  countBorder?: string;
  countBorderWidth?: string;
  countRadius?: string;
  countRing?: string;
  countFontFamily?: string;
  countFontSize?: string;
  countFontWeight?: string | number;
  countSelectedBg?: string;
  countSelectedBorder?: string;
  countSelectedRing?: string;
  removeSize?: string;
  removeTouchSize?: string;
  removeBleed?: string;
  removeBg?: string;
  removeColor?: string;
  removeBorder?: string;
  removeBorderWidth?: string;
  removeRadius?: string;
  removeOpacity?: number;
  removeHoverBg?: string;
  removeHoverTransform?: string;
  removeFocusRing?: string;
  disabledOpacity?: number;
  disabledFilter?: string;
  loadingOpacity?: number;
  motionDuration?: string;
  motionEasing?: string;
  pulseDuration?: string;
  pulseTiming?: string;
  pulseScale?: number;
  spinnerDuration?: string;
  touchTarget?: string;
  containerPaddingInline?: string;
  indicatorMaxInlineSize?: string;
  indicatorRadius?: string;
}

export interface BrandBreadcrumbChrome {
  bg?: string;
  border?: string;
  color?: string;
  linkColor?: string;
  itemColor?: string;
  colorHover?: string;
  colorActive?: string;
  separatorColor?: string;
  fontSize?: string;
  fontWeight?: string | number;
  padding?: string;
}

export interface BrandSearchChrome {
  bg?: string;
  border?: string;
  color?: string;
  shadow?: string;
  radius?: string;
  inputBg?: string;
  inputBorder?: string;
  inputColor?: string;
  placeholderColor?: string;
  iconColor?: string;
  clearColor?: string;
  clearColorHover?: string;
  resultBg?: string;
  resultBgHover?: string;
  resultBorder?: string;
  resultShadow?: string;
  resultTitleColor?: string;
  resultMetaColor?: string;
  categoryColor?: string;
  emptyBg?: string;
  /**
   * The modal spelling of the same capability. A command palette is search
   * lifted off the page onto its own scrim, so it belongs to this family and
   * not to a parallel top-level owner.
   */
  commandPalette?: BrandCommandPaletteChrome;
}

/** Command-palette chrome: the scrim, the floating panel, and its row states. */
export interface BrandCommandPaletteChrome {
  backdrop?: string;
  bg?: string;
  border?: string;
  emptyColor?: string;
  groupColor?: string;
  itemHoverBg?: string;
  shortcutBorder?: string;
}
