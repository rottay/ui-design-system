export interface BrandTabsChrome {
  /** Shared root and destination colors. */
  border?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  bgHover?: string;
  borderActive?: string;
  /** Recipe trays. `listBg` remains the shared fallback. */
  listBg?: string;
  underlineListBg?: string;
  containedListBg?: string;
  segmentedListBg?: string;
  pillsListBg?: string;
  underlineHoverBg?: string;
  underlineActiveBg?: string;
  underlineItemRadius?: string;
  listBorder?: string;
  listRadius?: string;
  listPadding?: string;
  listWidth?: string;
  listMaxWidth?: string;
  underlineListWidth?: string;
  listShadow?: string;
  listBlur?: string;
  /** Optional, subtle material grain. Kept separate from list paint. */
  listTexture?: string;
  listTextureOpacity?: number;
  listTextureSize?: string;
  /** Optical highlight painted inside the tray without changing its border. */
  listHighlight?: string;
  gap?: string;
  /** Destination anatomy and typography. */
  itemGap?: string;
  itemRadius?: string;
  itemMaxWidth?: string;
  itemFontFamily?: string;
  itemLineHeight?: string;
  itemLetterSpacing?: string;
  itemFontWeight?: string | number;
  itemFontWeightActive?: string | number;
  activeBg?: string;
  activeShadow?: string;
  activeTransform?: string;
  /** One-shot selection clarity layer; never a looping decoration. */
  activeHighlight?: string;
  activeHighlightOpacity?: number;
  pressedTransform?: string;
  containedActiveBg?: string;
  containedActiveShadow?: string;
  segmentedActiveBg?: string;
  segmentedActiveShadow?: string;
  pillsActiveBg?: string;
  pillsActiveColor?: string;
  pillsActiveBorder?: string;
  pillsActiveShadow?: string;
  /** Disabled destinations remain legible while clearly unavailable. */
  disabledColor?: string;
  disabledBg?: string;
  disabledOpacity?: number;
  /** Icon container. */
  iconColor?: string;
  iconBg?: string;
  iconBgActive?: string;
  iconPadding?: string;
  iconRadius?: string;
  iconShadow?: string;
  iconShadowActive?: string;
  iconTransformActive?: string;
  /** Component-owned compact badge. */
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
  badgeRadius?: string;
  badgeHeight?: string;
  badgeMinWidth?: string;
  badgePadding?: string;
  badgeFontSize?: string;
  badgeFontWeight?: string | number;
  badgeBgActive?: string;
  badgeColorActive?: string;
  badgeBorderActive?: string;
  /** Active indicator. */
  indicatorHeight?: string;
  indicatorGradient?: string;
  indicatorRadius?: string;
  indicatorShadow?: string;
  /** Tab panel framing and focus. */
  panelPadding?: string;
  panelGap?: string;
  panelBg?: string;
  panelBorder?: string;
  panelRadius?: string;
  panelShadow?: string;
  panelFocusRing?: string;
  panelTexture?: string;
  panelHighlight?: string;
  panelMotionDistance?: string;
  /** Overflow affordances and edge fades. */
  overflowControlSize?: string;
  overflowControlBg?: string;
  overflowControlColor?: string;
  overflowControlBorder?: string;
  overflowControlShadow?: string;
  overflowControlBgHover?: string;
  overflowControlShadowHover?: string;
  overflowFadeWidth?: string;
  overflowFadeColor?: string;
  mobilePadding?: string;
  mobileGap?: string;
  mobileItemMaxWidth?: string;
  /** Intent motion, independently tenant-tunable and reduced-motion safe. */
  motionDuration?: string;
  motionEasing?: string;
  activeRevealDuration?: string;
  panelMotionDuration?: string;
  panelMotionEasing?: string;
  /** Per-size control geometry. */
  smHeight?: string;
  smPadding?: string;
  smFontSize?: string;
  smIconSize?: string;
  mdHeight?: string;
  mdPadding?: string;
  mdFontSize?: string;
  mdIconSize?: string;
  lgHeight?: string;
  lgPadding?: string;
  lgFontSize?: string;
  lgIconSize?: string;
}

/** Alert banner chrome: per-intent surface, border, text and icon paint. */
export interface BrandAlertChrome {
  errorBg?: string;
  errorBorder?: string;
  errorColor?: string;
  errorIcon?: string;
  infoBg?: string;
  infoBorder?: string;
  infoColor?: string;
  infoIcon?: string;
  successBg?: string;
  successBorder?: string;
  successColor?: string;
  successIcon?: string;
  warningBg?: string;
  warningBorder?: string;
  warningColor?: string;
  warningIcon?: string;
}

/** Anchor navigation chrome: ink rail and link states. */
export interface BrandAnchorChrome {
  inkColor?: string;
  linkColor?: string;
  linkColorActive?: string;
}

/** Avatar chrome: default/semantic fills, ring, group overflow paint. */
export interface BrandAvatarChrome {
  borderColor?: string;
  defaultBg?: string;
  defaultColor?: string;
  errorBg?: string;
  errorColor?: string;
  gradientBg?: string;
  gradientColor?: string;
  groupBorder?: string;
  groupOverflowBg?: string;
  groupOverflowColor?: string;
  primaryBg?: string;
  primaryColor?: string;
  ringColor?: string;
  secondaryBg?: string;
  secondaryColor?: string;
  statusBorder?: string;
  successBg?: string;
  successColor?: string;
  warningBg?: string;
  warningColor?: string;
}

/** Back-to-top affordance chrome. */
export interface BrandBackTopChrome {
  bg?: string;
  color?: string;
  shadow?: string;
}

/** Calendar chrome: surface, border, header and out-of-month days. */
export interface BrandCalendarChrome {
  bg?: string;
  border?: string;
  dayColorOther?: string;
  headerColor?: string;
}

/** Collapse/accordion chrome: panel, header and content paint. */
export interface BrandCollapseChrome {
  bg?: string;
  border?: string;
  contentBg?: string;
  headerBg?: string;
  headerBgHover?: string;
  headerColor?: string;
}

/** Descriptions list chrome: surface, border, label and content. */
export interface BrandDescriptionsChrome {
  bg?: string;
  border?: string;
  contentColor?: string;
  labelColor?: string;
}

/** Drawer chrome: surface, header/footer rules, title and elevation. */
export interface BrandDrawerChrome {
  bg?: string;
  bodyColor?: string;
  footerBorder?: string;
  headerBorder?: string;
  shadow?: string;
  titleColor?: string;
}

/** Dropdown menu chrome: surface, elevation and item states. */
export interface BrandDropdownChrome {
  bg?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemColor?: string;
  itemColorActive?: string;
  itemColorHover?: string;
  shadow?: string;
}

/** Empty-state chrome: illustration and description paint. */
export interface BrandEmptyChrome {
  descriptionColor?: string;
  iconColor?: string;
}

/** Float button chrome: default/primary fills and badge paint. */
export interface BrandFloatButtonChrome {
  badgeBg?: string;
  badgeColor?: string;
  defaultBg?: string;
  defaultColor?: string;
  descriptionColor?: string;
  primaryBg?: string;
  primaryColor?: string;
}

/** Live feed chrome: surface, new-item highlight and loading paint. */
export interface BrandLiveFeedChrome {
  badgeBg?: string;
  badgeColor?: string;
  bg?: string;
  border?: string;
  emptyColor?: string;
  loadMoreColor?: string;
  newBg?: string;
  newBorder?: string;
  newColor?: string;
  refreshColor?: string;
  skeletonBg?: string;
}

/** Menu chrome: surface, item states, dividers and the inverse variant. */
export interface BrandMenuChrome {
  bg?: string;
  /** The INVERSE menu variant (`--ds-menu-dark-*`), not the dark mode. Both modes author it. */
  darkBg?: string;
  darkItemColor?: string;
  dividerColor?: string;
  focusRingColor?: string;
  groupTitleColor?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemColor?: string;
  itemColorActive?: string;
  itemColorHover?: string;
  itemDangerColor?: string;
  itemHoverBg?: string;
  itemSelectedBg?: string;
  itemSelectedColor?: string;
  submenuBg?: string;
}

/** Transient message chrome: surface, elevation and close affordance. Lowers to `--ds-notifier-message-*`. */
export interface BrandMessageChrome {
  bg?: string;
  closeColor?: string;
  closeColorHover?: string;
  shadow?: string;
}

/** Notification chrome: surface, elevation and title paint. Lowers to `--ds-notifier-notification-*`. */
export interface BrandNotificationChrome {
  bg?: string;
  shadow?: string;
  titleColor?: string;
}

/** Pagination chrome: item states and the active page treatment. */
export interface BrandPaginationChrome {
  activeBg?: string;
  activeColor?: string;
  itemBg?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemBorder?: string;
  itemColor?: string;
  itemColorActive?: string;
  itemColorHover?: string;
}

/** Progress chrome: track and per-intent fill paint. */
export interface BrandProgressChrome {
  bg?: string;
  fillError?: string;
  fillPrimary?: string;
  fillSuccess?: string;
  fillWarning?: string;
}

/** Result page chrome: icon, title and subtitle paint. */
export interface BrandResultChrome {
  iconColor?: string;
  subtitleColor?: string;
  titleColor?: string;
}

/** Skeleton chrome: base fill, highlight and wave gradient. */
export interface BrandSkeletonChrome {
  bg?: string;
  highlight?: string;
  waveGradient?: string;
}

/** Spinner chrome: indicator and track paint. */
export interface BrandSpinnerChrome {
  color?: string;
  track?: string;
}

/** Statistic chrome: title, value and affix paint. */
export interface BrandStatisticChrome {
  prefixColor?: string;
  suffixColor?: string;
  titleColor?: string;
  valueColor?: string;
}

/** Stats grid chrome: card variants, trend paint and skeletons. */
export interface BrandStatsGridChrome {
  cardBg?: string;
  cardBorder?: string;
  cardFilledBg?: string;
  cardGlassBg?: string;
  cardGlassBorder?: string;
  descriptionColor?: string;
  labelColor?: string;
  skeletonBg?: string;
  skeletonWaveGradient?: string;
  trendNegative?: string;
  trendNeutral?: string;
  trendPositive?: string;
  valueColor?: string;
}

/** Steps chrome: connector, and the wait/process/finish item states. */
export interface BrandStepsChrome {
  connectorColor?: string;
  connectorColorActive?: string;
  finishBg?: string;
  finishBorder?: string;
  itemBg?: string;
  itemBgActive?: string;
  itemColor?: string;
  itemColorActive?: string;
  processBg?: string;
  processBorder?: string;
  waitBg?: string;
  waitBorder?: string;
}

/** Tag chrome: default and per-intent surface, border and text paint. */
export interface BrandTagChrome {
  border?: string;
  defaultBg?: string;
  defaultBorder?: string;
  defaultColor?: string;
  errorBg?: string;
  errorBorder?: string;
  errorColor?: string;
  primaryBg?: string;
  primaryBorder?: string;
  primaryColor?: string;
  secondaryBg?: string;
  secondaryBorder?: string;
  secondaryColor?: string;
  successBg?: string;
  successBorder?: string;
  successColor?: string;
  warningBg?: string;
  warningBorder?: string;
  warningColor?: string;
}

/** Timeline chrome: rail, dot and content paint. */
export interface BrandTimelineChrome {
  contentColor?: string;
  dotBg?: string;
  dotBorder?: string;
  lineColor?: string;
}

/** Tree chrome: node states for hover and selection. */
export interface BrandTreeChrome {
  nodeBgHover?: string;
  nodeBgSelected?: string;
  nodeColor?: string;
  nodeColorSelected?: string;
}
