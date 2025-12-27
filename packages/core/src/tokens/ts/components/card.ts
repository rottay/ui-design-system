/**
 * Card Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Card CSS custom properties.
 * Use these for type-safe Card token references.
 */

// Card Sizes
export const cardSize = {
  sm: { padding: 'var(--card-sm-padding)' },
  md: { padding: 'var(--card-md-padding)' },
  lg: { padding: 'var(--card-lg-padding)' },
  xl: { padding: 'var(--card-xl-padding)' },
} as const;

// Card Default Appearance
export const cardDefault = {
  bg: 'var(--card-bg)',
  bgHover: 'var(--card-bg-hover)',
  bgActive: 'var(--card-bg-active)',
  bgDisabled: 'var(--card-bg-disabled)',
  color: 'var(--card-color)',
  colorMuted: 'var(--card-color-muted)',
} as const;

// Card Borders
export const cardBorder = {
  width: 'var(--card-border-width)',
  color: 'var(--card-border-color)',
  colorHover: 'var(--card-border-color-hover)',
  style: 'var(--card-border-style)',
  radius: 'var(--card-border-radius)',
  borderlessWidth: 'var(--card-borderless-border-width)',
} as const;

// Card Shadows
export const cardShadow = {
  none: 'var(--card-shadow-none)',
  sm: 'var(--card-shadow-sm)',
  md: 'var(--card-shadow-md)',
  lg: 'var(--card-shadow-lg)',
  xl: 'var(--card-shadow-xl)',
  hover: 'var(--card-shadow-hover)',
  active: 'var(--card-shadow-active)',
  default: 'var(--card-shadow-default)',
} as const;

// Card Header
export const cardHeader = {
  padding: 'var(--card-header-padding)',
  paddingBottom: 'var(--card-header-padding-bottom)',
  borderWidth: 'var(--card-header-border-width)',
  borderColor: 'var(--card-header-border-color)',
  bg: 'var(--card-header-bg)',
  actionsGap: 'var(--card-header-actions-gap)',
} as const;

// Card Title
export const cardTitle = {
  fontSize: 'var(--card-title-font-size)',
  fontWeight: 'var(--card-title-font-weight)',
  lineHeight: 'var(--card-title-line-height)',
  color: 'var(--card-title-color)',
} as const;

// Card Subtitle
export const cardSubtitle = {
  fontSize: 'var(--card-subtitle-font-size)',
  color: 'var(--card-subtitle-color)',
  marginTop: 'var(--card-subtitle-margin-top)',
} as const;

// Card Body
export const cardBody = {
  padding: 'var(--card-body-padding)',
  color: 'var(--card-body-color)',
  fontSize: 'var(--card-body-font-size)',
  lineHeight: 'var(--card-body-line-height)',
} as const;

// Card Footer
export const cardFooter = {
  padding: 'var(--card-footer-padding)',
  paddingTop: 'var(--card-footer-padding-top)',
  borderWidth: 'var(--card-footer-border-width)',
  borderColor: 'var(--card-footer-border-color)',
  bg: 'var(--card-footer-bg)',
  color: 'var(--card-footer-color)',
  actionsGap: 'var(--card-footer-actions-gap)',
  actionsJustify: 'var(--card-footer-actions-justify)',
} as const;

// Card Media
export const cardMedia = {
  borderRadiusTop: 'var(--card-media-border-radius-top)',
  borderRadiusBottom: 'var(--card-media-border-radius-bottom)',
  aspectRatio: 'var(--card-media-aspect-ratio)',
  objectFit: 'var(--card-media-object-fit)',
} as const;

// Card Cover
export const cardCover = {
  minHeight: 'var(--card-cover-min-height)',
  overlayBg: 'var(--card-cover-overlay-bg)',
  contentColor: 'var(--card-cover-content-color)',
} as const;

// Card Variants
export const cardVariant = {
  default: {
    bg: 'var(--card-default-bg)',
    borderColor: 'var(--card-default-border-color)',
    shadow: 'var(--card-default-shadow)',
  },
  bordered: {
    bg: 'var(--card-bordered-bg)',
    borderWidth: 'var(--card-bordered-border-width)',
    borderColor: 'var(--card-bordered-border-color)',
    shadow: 'var(--card-bordered-shadow)',
  },
  flat: {
    bg: 'var(--card-flat-bg)',
    borderWidth: 'var(--card-flat-border-width)',
    shadow: 'var(--card-flat-shadow)',
  },
  elevated: {
    bg: 'var(--card-elevated-bg)',
    borderWidth: 'var(--card-elevated-border-width)',
    shadow: 'var(--card-elevated-shadow)',
    shadowHover: 'var(--card-elevated-shadow-hover)',
  },
  ghost: {
    bg: 'var(--card-ghost-bg)',
    borderColor: 'var(--card-ghost-border-color)',
    shadow: 'var(--card-ghost-shadow)',
  },
} as const;

// Card Semantic Variants
export const cardSemanticVariant = {
  primary: {
    bg: 'var(--card-primary-bg)',
    borderColor: 'var(--card-primary-border-color)',
    titleColor: 'var(--card-primary-title-color)',
  },
  success: {
    bg: 'var(--card-success-bg)',
    borderColor: 'var(--card-success-border-color)',
    titleColor: 'var(--card-success-title-color)',
  },
  warning: {
    bg: 'var(--card-warning-bg)',
    borderColor: 'var(--card-warning-border-color)',
    titleColor: 'var(--card-warning-title-color)',
  },
  error: {
    bg: 'var(--card-error-bg)',
    borderColor: 'var(--card-error-border-color)',
    titleColor: 'var(--card-error-title-color)',
  },
  info: {
    bg: 'var(--card-info-bg)',
    borderColor: 'var(--card-info-border-color)',
    titleColor: 'var(--card-info-title-color)',
  },
} as const;

// Card Interactive
export const cardInteractive = {
  cursor: 'var(--card-interactive-cursor)',
  transformHover: 'var(--card-interactive-transform-hover)',
  transition: 'var(--card-interactive-transition)',
} as const;

// Card Grid
export const cardGrid = {
  gap: 'var(--card-grid-gap)',
  gapSm: 'var(--card-grid-gap-sm)',
  gapLg: 'var(--card-grid-gap-lg)',
  columnsMobile: 'var(--card-grid-columns-mobile)',
  columnsTablet: 'var(--card-grid-columns-tablet)',
  columnsDesktop: 'var(--card-grid-columns-desktop)',
  columnsWide: 'var(--card-grid-columns-wide)',
} as const;

// Card Transition
export const cardTransition = {
  duration: 'var(--card-transition-duration)',
  timing: 'var(--card-transition-timing)',
  all: 'var(--card-transition)',
} as const;

// Card Accessibility
export const cardAccessibility = {
  focusRing: 'var(--card-focus-ring)',
  focusRingOffset: 'var(--card-focus-ring-offset)',
  focusOutline: 'var(--card-focus-outline)',
} as const;

// Card Disabled
export const cardDisabled = {
  opacity: 'var(--card-disabled-opacity)',
  cursor: 'var(--card-disabled-cursor)',
  bg: 'var(--card-disabled-bg)',
} as const;

// Combined card tokens
export const cardTokens = {
  size: cardSize,
  default: cardDefault,
  border: cardBorder,
  shadow: cardShadow,
  header: cardHeader,
  title: cardTitle,
  subtitle: cardSubtitle,
  body: cardBody,
  footer: cardFooter,
  media: cardMedia,
  cover: cardCover,
  variant: cardVariant,
  semanticVariant: cardSemanticVariant,
  interactive: cardInteractive,
  grid: cardGrid,
  transition: cardTransition,
  accessibility: cardAccessibility,
  disabled: cardDisabled,
  dividerWidth: 'var(--card-divider-width)',
  dividerColor: 'var(--card-divider-color)',
  dividerMarginY: 'var(--card-divider-margin-y)',
  metaFontSize: 'var(--card-meta-font-size)',
  metaColor: 'var(--card-meta-color)',
  metaGap: 'var(--card-meta-gap)',
} as const;

// Type exports
export type CardSize = keyof typeof cardSize;
export type CardVariant = keyof typeof cardVariant;
export type CardSemanticVariant = keyof typeof cardSemanticVariant;
