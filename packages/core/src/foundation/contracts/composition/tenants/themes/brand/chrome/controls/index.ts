export interface BrandButtonVariantChrome {
  bg?: string;
  bgHover?: string;
  bgActive?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  text?: string;
  border?: string;
  borderHover?: string;
  borderActive?: string;
  shadow?: string;
  shadowHover?: string;
  shadowActive?: string;
}

/**
 * Optical geometry for one control size. Unlike palette chrome, these values
 * tune the actual rhythm of a product: control height, horizontal economy and
 * the type/icon relationship. Keeping them in FlatTheme makes a vertical's
 * density authored instead of being frozen inside an engine implementation.
 */
export interface BrandControlSizeChrome {
  height?: string;
  paddingX?: string;
  paddingY?: string;
  fontSize?: string;
  lineHeight?: string;
  iconSize?: string;
  gap?: string;
  radius?: string;
}

/** Shared geometry for Button across its five public sizes. */
export interface BrandButtonGeometryChrome {
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  textTransform?: string;
  gap?: string;
  radius?: string;
  borderWidth?: string;
  touchTargetMin?: string;
  groupGap?: string;
  groupMobileDirection?: "row" | "column";
  groupMobileGap?: string;
  groupMobileWidth?: string;
  hoverTransform?: string;
  activeTransform?: string;
  iconHoverTransform?: string;
  iconActiveTransform?: string;
  labelOffsetY?: string;
  hoverFilter?: string;
  activeFilter?: string;
  focusRingOffset?: string;
  spinnerDuration?: string;
  surfaceHighlight?: string;
  surfaceHighlightOpacity?: string;
  surfaceHighlightHoverOpacity?: string;
  surfaceHighlightActiveOpacity?: string;
  gradient?: string;
  aiTexture?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  xs?: BrandControlSizeChrome;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
  xl?: BrandControlSizeChrome;
}

/** Shared geometry for field-like controls across their public sizes. */
export interface BrandFieldGeometryChrome {
  gap?: string;
  radius?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  borderWidth?: string;
  borderStyle?: string;
  messageGap?: string;
  groupGap?: string;
  groupGapSeparated?: string;
  groupOverlap?: string;
  groupMinItemWidth?: string;
  formFieldGap?: string;
  horizontalGap?: string;
  labelOffsetY?: string;
  requiredGap?: string;
  formFieldDisabledOpacity?: number;
  labelFontSize?: string;
  labelFontWeight?: string | number;
  labelFontFamily?: string;
  labelLetterSpacing?: string;
  labelLineHeight?: string;
  helperFontSize?: string;
  helperLineHeight?: string;
  affixSize?: string;
  affixSizeCompact?: string;
  affixRadius?: string;
  actionSize?: string;
  actionRadius?: string;
  touchTargetMin?: string;
  loadingSize?: string;
  loadingStroke?: string;
  loadingDuration?: string;
  textareaMinHeight?: string;
  textareaMaxHeight?: string;
  textareaPaddingX?: string;
  textareaPaddingY?: string;
  textareaRadius?: string;
  textareaResize?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  xs?: BrandControlSizeChrome;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
  xl?: BrandControlSizeChrome;
}

/**
 * Canonical semantic algebra shared by every control family.
 *
 * These are public `--ds-*` channels, not product aliases. Static first-party
 * themes and DB Theme patches author the same keypaths and the common chrome
 * lowering emits the same CSS variables for both transports.
 */
export interface BrandSemanticControlChrome {
  ink?: string;
  onBrand?: string;
  surface?: string;
  brandTint?: string;
  brandBorder?: string;
  iconTileBorder?: string;
}

/**
 * Select/combobox chrome. Distinct from `BrandInputChrome` because a select
 * owns a floating dropdown panel and an option list that a text field has no
 * equivalent of; folding them together would give inputs dead keypaths.
 */
/** Multi-line text field chrome. */
export interface BrandTextareaChrome {
  bg?: string;
  bgDisabled?: string;
  filledBg?: string;
  border?: string;
  borderHover?: string;
  borderFocus?: string;
  shadowFocus?: string;
  successBorder?: string;
  warningBorder?: string;
  errorBorder?: string;
  color?: string;
  colorPlaceholder?: string;
  /** Ink of the character counter under a length-bounded textarea. */
  countColor?: string;
}

/** Form row chrome: the ink around a field, not the field itself. */
export interface BrandFormChrome {
  labelColor?: string;
  labelFontWeight?: string | number;
  helpColor?: string;
  /** Ink of the secondary note a field may carry alongside its help text. */
  extraColor?: string;
  requiredColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}
