import type {
  BrandChrome,
  BrandBadgeChrome,
  BrandPopoverChrome,
  BrandTooltipChrome,
  BrandAlertChrome,
  BrandAnchorChrome,
  BrandAvatarChrome,
  BrandBackTopChrome,
  BrandCalendarChrome,
  BrandCollapseChrome,
  BrandDescriptionsChrome,
  BrandDrawerChrome,
  BrandDropdownChrome,
  BrandEmptyChrome,
  BrandFloatButtonChrome,
  BrandLiveFeedChrome,
  BrandMenuChrome,
  BrandMessageChrome,
  BrandNotificationChrome,
  BrandPaginationChrome,
  BrandProgressChrome,
  BrandResultChrome,
  BrandSkeletonChrome,
  BrandSpinnerChrome,
  BrandStatisticChrome,
  BrandStatsGridChrome,
  BrandStepsChrome,
  BrandTagChrome,
  BrandTimelineChrome,
  BrandTreeChrome,
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

const ALERT_CHROME_VARIABLES = chromeVariableMap<BrandAlertChrome>(
  "--ds-alert-",
  [
    "errorBg",
    "errorBorder",
    "errorColor",
    "errorIcon",
    "infoBg",
    "infoBorder",
    "infoColor",
    "infoIcon",
    "successBg",
    "successBorder",
    "successColor",
    "successIcon",
    "warningBg",
    "warningBorder",
    "warningColor",
    "warningIcon",
  ] as const
);

const ANCHOR_CHROME_VARIABLES = chromeVariableMap<BrandAnchorChrome>(
  "--ds-anchor-",
  ["inkColor", "linkColor", "linkColorActive"] as const
);

const AVATAR_CHROME_VARIABLES = chromeVariableMap<BrandAvatarChrome>(
  "--ds-avatar-",
  [
    "borderColor",
    "defaultBg",
    "defaultColor",
    "errorBg",
    "errorColor",
    "gradientBg",
    "gradientColor",
    "groupBorder",
    "groupOverflowBg",
    "groupOverflowColor",
    "primaryBg",
    "primaryColor",
    "ringColor",
    "secondaryBg",
    "secondaryColor",
    "statusBorder",
    "successBg",
    "successColor",
    "warningBg",
    "warningColor",
  ] as const
);

const BACK_TOP_CHROME_VARIABLES = chromeVariableMap<BrandBackTopChrome>(
  "--ds-backtop-",
  ["bg", "color", "shadow"] as const
);

const CALENDAR_CHROME_VARIABLES = chromeVariableMap<BrandCalendarChrome>(
  "--ds-calendar-",
  ["bg", "border", "dayColorOther", "headerColor"] as const
);

const COLLAPSE_CHROME_VARIABLES = chromeVariableMap<BrandCollapseChrome>(
  "--ds-collapse-",
  [
    "bg",
    "contentBg",
    "headerBg",
    "headerBgHover",
    "headerColor",
  ] as const
);

const DESCRIPTIONS_CHROME_VARIABLES =
  chromeVariableMap<BrandDescriptionsChrome>("--ds-descriptions-", [
    "bg",
    "border",
    "contentColor",
    "labelColor",
  ] as const);

const DRAWER_CHROME_VARIABLES = chromeVariableMap<BrandDrawerChrome>(
  "--ds-drawer-",
  [
    "bg",
    "bodyColor",
    "footerBorder",
    "headerBorder",
    "shadow",
    "titleColor",
  ] as const
);

const DROPDOWN_CHROME_VARIABLES = chromeVariableMap<BrandDropdownChrome>(
  "--ds-dropdown-",
  [
    "bg",
    "itemBgActive",
    "itemBgHover",
    "itemColor",
    "itemColorActive",
    "itemColorHover",
    "shadow",
  ] as const
);

const EMPTY_CHROME_VARIABLES = chromeVariableMap<BrandEmptyChrome>(
  "--ds-empty-",
  ["descriptionColor", "iconColor"] as const
);

const FLOAT_BUTTON_CHROME_VARIABLES = chromeVariableMap<BrandFloatButtonChrome>(
  "--ds-floatbutton-",
  [
    "badgeBg",
    "badgeColor",
    "defaultBg",
    "defaultColor",
    "descriptionColor",
    "primaryBg",
    "primaryColor",
  ] as const
);

const LIVE_FEED_CHROME_VARIABLES = chromeVariableMap<BrandLiveFeedChrome>(
  "--ds-live-feed-",
  [
    "badgeBg",
    "badgeColor",
    "bg",
    "border",
    "emptyColor",
    "loadMoreColor",
    "newBg",
    "newBorder",
    "newColor",
    "refreshColor",
    "skeletonBg",
  ] as const
);

const MENU_CHROME_VARIABLES = chromeVariableMap<BrandMenuChrome>("--ds-menu-", [
  "bg",
  "darkBg",
  "darkItemColor",
  "dividerColor",
  "focusRingColor",
  "groupTitleColor",
  "itemBgActive",
  "itemBgHover",
  "itemColor",
  "itemColorActive",
  "itemColorHover",
  "itemDangerColor",
  "itemHoverBg",
  "itemSelectedBg",
  "itemSelectedColor",
  "submenuBg",
] as const);

const MESSAGE_CHROME_VARIABLES = chromeVariableMap<BrandMessageChrome>(
  "--ds-notifier-message-",
  ["bg", "closeColor", "closeColorHover", "shadow"] as const
);

const NOTIFICATION_CHROME_VARIABLES =
  chromeVariableMap<BrandNotificationChrome>("--ds-notifier-notification-", [
    "bg",
    "shadow",
    "titleColor",
  ] as const);

const PAGINATION_CHROME_VARIABLES = chromeVariableMap<BrandPaginationChrome>(
  "--ds-pagination-",
  [
    "activeBg",
    "activeColor",
    "itemBg",
    "itemBgActive",
    "itemBgHover",
    "itemBorder",
    "itemColor",
    "itemColorActive",
    "itemColorHover",
  ] as const
);

const PROGRESS_CHROME_VARIABLES = chromeVariableMap<BrandProgressChrome>(
  "--ds-progress-",
  ["bg", "fillError", "fillPrimary", "fillSuccess", "fillWarning"] as const
);

const RESULT_CHROME_VARIABLES = chromeVariableMap<BrandResultChrome>(
  "--ds-result-",
  ["iconColor", "subtitleColor", "titleColor"] as const
);

const SKELETON_CHROME_VARIABLES = chromeVariableMap<BrandSkeletonChrome>(
  "--ds-skeleton-",
  ["bg", "highlight", "waveGradient"] as const
);

const SPINNER_CHROME_VARIABLES = chromeVariableMap<BrandSpinnerChrome>(
  "--ds-spinner-",
  ["color", "track"] as const
);

const STATISTIC_CHROME_VARIABLES = chromeVariableMap<BrandStatisticChrome>(
  "--ds-statistic-",
  ["prefixColor", "suffixColor", "titleColor", "valueColor"] as const
);

const STATS_GRID_CHROME_VARIABLES = chromeVariableMap<BrandStatsGridChrome>(
  "--ds-stats-grid-",
  [
    "cardBg",
    "cardBorder",
    "cardFilledBg",
    "cardGlassBg",
    "cardGlassBorder",
    "descriptionColor",
    "labelColor",
    "skeletonBg",
    "skeletonWaveGradient",
    "trendNegative",
    "trendNeutral",
    "trendPositive",
    "valueColor",
  ] as const
);

const STEPS_CHROME_VARIABLES = chromeVariableMap<BrandStepsChrome>(
  "--ds-steps-",
  [
    "connectorColor",
    "connectorColorActive",
    "finishBg",
    "finishBorder",
    "itemBg",
    "itemBgActive",
    "itemColor",
    "itemColorActive",
    "processBg",
    "processBorder",
    "waitBg",
    "waitBorder",
  ] as const
);

const TAG_CHROME_VARIABLES = chromeVariableMap<BrandTagChrome>("--ds-tag-", [
  "border",
  "defaultBg",
  "defaultBorder",
  "defaultColor",
  "errorBg",
  "errorBorder",
  "errorColor",
  "primaryBg",
  "primaryBorder",
  "primaryColor",
  "secondaryBg",
  "secondaryBorder",
  "secondaryColor",
  "successBg",
  "successBorder",
  "successColor",
  "warningBg",
  "warningBorder",
  "warningColor",
] as const);

const TIMELINE_CHROME_VARIABLES = chromeVariableMap<BrandTimelineChrome>(
  "--ds-timeline-",
  ["contentColor", "dotBg", "dotBorder", "lineColor"] as const
);

const TREE_CHROME_VARIABLES = chromeVariableMap<BrandTreeChrome>("--ds-tree-", [
  "nodeBgHover",
  "nodeBgSelected",
  "nodeColor",
  "nodeColorSelected",
] as const);

/**
 * The flat component-chrome families: one closed contract slot, one
 * compiler-owned prefix map, one lowering. Both Theme transports reach this
 * table through the same `chromeToVariables` call, so a static FlatTheme
 * and a DB TenantThemeDocument that author the same field paint the same
 * declaration. Adding a family here is the only step a new one needs.
 */
export const FLAT_CHROME_FAMILY_VARIABLES = [
  ["alert", ALERT_CHROME_VARIABLES],
  ["anchor", ANCHOR_CHROME_VARIABLES],
  ["avatar", AVATAR_CHROME_VARIABLES],
  ["backTop", BACK_TOP_CHROME_VARIABLES],
  ["calendar", CALENDAR_CHROME_VARIABLES],
  ["collapse", COLLAPSE_CHROME_VARIABLES],
  ["descriptions", DESCRIPTIONS_CHROME_VARIABLES],
  ["drawer", DRAWER_CHROME_VARIABLES],
  ["dropdown", DROPDOWN_CHROME_VARIABLES],
  ["empty", EMPTY_CHROME_VARIABLES],
  ["floatButton", FLOAT_BUTTON_CHROME_VARIABLES],
  ["liveFeed", LIVE_FEED_CHROME_VARIABLES],
  ["menu", MENU_CHROME_VARIABLES],
  ["message", MESSAGE_CHROME_VARIABLES],
  ["notification", NOTIFICATION_CHROME_VARIABLES],
  ["pagination", PAGINATION_CHROME_VARIABLES],
  ["progress", PROGRESS_CHROME_VARIABLES],
  ["result", RESULT_CHROME_VARIABLES],
  ["skeleton", SKELETON_CHROME_VARIABLES],
  ["spinner", SPINNER_CHROME_VARIABLES],
  ["statistic", STATISTIC_CHROME_VARIABLES],
  ["statsGrid", STATS_GRID_CHROME_VARIABLES],
  ["steps", STEPS_CHROME_VARIABLES],
  ["tag", TAG_CHROME_VARIABLES],
  ["timeline", TIMELINE_CHROME_VARIABLES],
  ["tree", TREE_CHROME_VARIABLES],
] as const satisfies ReadonlyArray<
  readonly [keyof BrandChrome, Readonly<Record<string, string>>]
>;

export const TOOLTIP_CHROME_VARIABLES = chromeVariableMap<BrandTooltipChrome>(
  "--ds-tooltip-",
  [
    "bg",
    "color",
    "shadow",
    "defaultBg",
    "defaultColor",
    "primaryBg",
    "primaryColor",
    "secondaryBg",
    "secondaryColor",
    "successBg",
    "warningBg",
    "errorBg",
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

/**
 * The popover table has no per-recipe `*Highlight`, unlike the tooltip table
 * directly above it. The popover skin carries a single top-light — the
 * intensity-governed zenith keyline it declares as a literal — and the family
 * sheen a highlight channel used to feed was struck by OVL-PV-01. Emitting the
 * four names anyway published a dial with no reader: `*Texture` is the
 * per-recipe decoration axis a popover tenant actually owns.
 */
export const POPOVER_CHROME_VARIABLES = chromeVariableMap<BrandPopoverChrome>(
  "--ds-popover-",
  [
    "bg",
    "border",
    "contentColor",
    "shadow",
    "titleBorder",
    "borderedBackground",
    "borderedForeground",
    "borderedMutedForeground",
    "borderedBorder",
    "borderedBorderWidth",
    "borderedShadow",
    "borderedTexture",
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
    "inverseRadius",
    "richBackground",
    "richForeground",
    "richMutedForeground",
    "richBorder",
    "richShadow",
    "richTexture",
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

/**
 * Exhaustive DB/theme contract projection for the compact-label family.
 * Keeping this as a keyed map makes a new BrandBadgeChrome field fail type
 * review until it has a compiler-owned CSS destination.
 */
export const BADGE_CHROME_VARIABLES = {
  fontFamily: "--ds-badge-font-family",
  fontWeight: "--ds-badge-font-weight",
  lineHeight: "--ds-badge-line-height",
  letterSpacing: "--ds-badge-letter-spacing",
  gap: "--ds-badge-gap",
  height: "--ds-badge-height",
  paddingX: "--ds-badge-padding-x",
  defaultBg: "--ds-badge-default-bg",
  defaultColor: "--ds-badge-default-color",
  primaryBg: "--ds-badge-primary-bg",
  primaryColor: "--ds-badge-primary-color",
  secondaryBg: "--ds-badge-secondary-bg",
  secondaryColor: "--ds-badge-secondary-color",
  successBg: "--ds-badge-success-bg",
  successColor: "--ds-badge-success-color",
  warningBg: "--ds-badge-warning-bg",
  warningColor: "--ds-badge-warning-color",
  errorBg: "--ds-badge-error-bg",
  errorColor: "--ds-badge-error-color",
  infoBg: "--ds-badge-info-bg",
  infoColor: "--ds-badge-info-color",
  borderColor: "--ds-badge-border-color",
  textColor: "--ds-badge-text-color",
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
