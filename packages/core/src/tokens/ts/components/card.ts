/**
 * Card Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Card CSS custom properties.
 * Use these for type-safe Card token references.
 */

// Card Sizes
export const cardSize = {
  sm: { padding: 'var(--ds-card-sm-padding)' },
  md: { padding: 'var(--ds-card-md-padding)' },
  lg: { padding: 'var(--ds-card-lg-padding)' },
  xl: { padding: 'var(--ds-card-xl-padding)' },
} as const;

// Card Default Appearance
export const cardDefault = {
  bg: 'var(--ds-card-bg)',
  bgHover: 'var(--ds-card-bg-hover)',
  bgActive: 'var(--ds-card-bg-active)',
  bgDisabled: 'var(--ds-card-bg-disabled)',
  color: 'var(--ds-card-color)',
  colorMuted: 'var(--ds-card-color-muted)',
} as const;

// Card Borders
export const cardBorder = {
  width: 'var(--ds-card-border-width)',
  color: 'var(--ds-card-border-color)',
  colorHover: 'var(--ds-card-border-color-hover)',
  style: 'var(--ds-card-border-style)',
  radius: 'var(--ds-card-border-radius)',
  borderlessWidth: 'var(--ds-card-borderless-border-width)',
} as const;

// Card Shadows
export const cardShadow = {
  none: 'var(--ds-card-shadow-none)',
  sm: 'var(--ds-card-shadow-sm)',
  md: 'var(--ds-card-shadow-md)',
  lg: 'var(--ds-card-shadow-lg)',
  xl: 'var(--ds-card-shadow-xl)',
  hover: 'var(--ds-card-shadow-hover)',
  active: 'var(--ds-card-shadow-active)',
  default: 'var(--ds-card-shadow-default)',
} as const;

// Card Header
export const cardHeader = {
  padding: 'var(--ds-card-header-padding)',
  paddingBottom: 'var(--ds-card-header-padding-bottom)',
  borderWidth: 'var(--ds-card-header-border-width)',
  borderColor: 'var(--ds-card-header-border-color)',
  bg: 'var(--ds-card-header-bg)',
  actionsGap: 'var(--ds-card-header-actions-gap)',
} as const;

// Card Title
export const cardTitle = {
  fontSize: 'var(--ds-card-title-font-size)',
  fontWeight: 'var(--ds-card-title-font-weight)',
  lineHeight: 'var(--ds-card-title-line-height)',
  color: 'var(--ds-card-title-color)',
} as const;

// Card Subtitle
export const cardSubtitle = {
  fontSize: 'var(--ds-card-subtitle-font-size)',
  color: 'var(--ds-card-subtitle-color)',
  marginTop: 'var(--ds-card-subtitle-margin-top)',
} as const;

// Card Body
export const cardBody = {
  padding: 'var(--ds-card-body-padding)',
  color: 'var(--ds-card-body-color)',
  fontSize: 'var(--ds-card-body-font-size)',
  lineHeight: 'var(--ds-card-body-line-height)',
} as const;

// Card Footer
export const cardFooter = {
  padding: 'var(--ds-card-footer-padding)',
  paddingTop: 'var(--ds-card-footer-padding-top)',
  borderWidth: 'var(--ds-card-footer-border-width)',
  borderColor: 'var(--ds-card-footer-border-color)',
  bg: 'var(--ds-card-footer-bg)',
  color: 'var(--ds-card-footer-color)',
  actionsGap: 'var(--ds-card-footer-actions-gap)',
  actionsJustify: 'var(--ds-card-footer-actions-justify)',
} as const;

// Card Media
export const cardMedia = {
  borderRadiusTop: 'var(--ds-card-media-border-radius-top)',
  borderRadiusBottom: 'var(--ds-card-media-border-radius-bottom)',
  aspectRatio: 'var(--ds-card-media-aspect-ratio)',
  objectFit: 'var(--ds-card-media-object-fit)',
} as const;

// Card Cover
export const cardCover = {
  minHeight: 'var(--ds-card-cover-min-height)',
  overlayBg: 'var(--ds-card-cover-overlay-bg)',
  contentColor: 'var(--ds-card-cover-content-color)',
} as const;

// Card Variants
export const cardVariant = {
  default: {
    bg: 'var(--ds-card-default-bg)',
    borderColor: 'var(--ds-card-default-border-color)',
    shadow: 'var(--ds-card-default-shadow)',
  },
  bordered: {
    bg: 'var(--ds-card-bordered-bg)',
    borderWidth: 'var(--ds-card-bordered-border-width)',
    borderColor: 'var(--ds-card-bordered-border-color)',
    shadow: 'var(--ds-card-bordered-shadow)',
  },
  flat: {
    bg: 'var(--ds-card-flat-bg)',
    borderWidth: 'var(--ds-card-flat-border-width)',
    shadow: 'var(--ds-card-flat-shadow)',
  },
  elevated: {
    bg: 'var(--ds-card-elevated-bg)',
    borderWidth: 'var(--ds-card-elevated-border-width)',
    shadow: 'var(--ds-card-elevated-shadow)',
    shadowHover: 'var(--ds-card-elevated-shadow-hover)',
  },
  ghost: {
    bg: 'var(--ds-card-ghost-bg)',
    borderColor: 'var(--ds-card-ghost-border-color)',
    shadow: 'var(--ds-card-ghost-shadow)',
  },
} as const;

// Card Semantic Variants
export const cardSemanticVariant = {
  primary: {
    bg: 'var(--ds-card-primary-bg)',
    borderColor: 'var(--ds-card-primary-border-color)',
    titleColor: 'var(--ds-card-primary-title-color)',
  },
  success: {
    bg: 'var(--ds-card-success-bg)',
    borderColor: 'var(--ds-card-success-border-color)',
    titleColor: 'var(--ds-card-success-title-color)',
  },
  warning: {
    bg: 'var(--ds-card-warning-bg)',
    borderColor: 'var(--ds-card-warning-border-color)',
    titleColor: 'var(--ds-card-warning-title-color)',
  },
  error: {
    bg: 'var(--ds-card-error-bg)',
    borderColor: 'var(--ds-card-error-border-color)',
    titleColor: 'var(--ds-card-error-title-color)',
  },
  info: {
    bg: 'var(--ds-card-info-bg)',
    borderColor: 'var(--ds-card-info-border-color)',
    titleColor: 'var(--ds-card-info-title-color)',
  },
} as const;

// Card Interactive
export const cardInteractive = {
  cursor: 'var(--ds-card-interactive-cursor)',
  transformHover: 'var(--ds-card-interactive-transform-hover)',
  transition: 'var(--ds-card-interactive-transition)',
} as const;

// Card Grid
export const cardGrid = {
  gap: 'var(--ds-card-grid-gap)',
  gapSm: 'var(--ds-card-grid-gap-sm)',
  gapLg: 'var(--ds-card-grid-gap-lg)',
  columnsMobile: 'var(--ds-card-grid-columns-mobile)',
  columnsTablet: 'var(--ds-card-grid-columns-tablet)',
  columnsDesktop: 'var(--ds-card-grid-columns-desktop)',
  columnsWide: 'var(--ds-card-grid-columns-wide)',
} as const;

// Card Transition
export const cardTransition = {
  duration: 'var(--ds-card-transition-duration)',
  timing: 'var(--ds-card-transition-timing)',
  all: 'var(--ds-card-transition)',
} as const;

// Card Accessibility
export const cardAccessibility = {
  focusRing: 'var(--ds-card-focus-ring)',
  focusRingOffset: 'var(--ds-card-focus-ring-offset)',
  focusOutline: 'var(--ds-card-focus-outline)',
} as const;

// Card Disabled
export const cardDisabled = {
  opacity: 'var(--ds-card-disabled-opacity)',
  cursor: 'var(--ds-card-disabled-cursor)',
  bg: 'var(--ds-card-disabled-bg)',
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
  dividerWidth: 'var(--ds-card-divider-width)',
  dividerColor: 'var(--ds-card-divider-color)',
  dividerMarginY: 'var(--ds-card-divider-margin-y)',
  metaFontSize: 'var(--ds-card-meta-font-size)',
  metaColor: 'var(--ds-card-meta-color)',
  metaGap: 'var(--ds-card-meta-gap)',
} as const;

// Type exports
export type CardSize = keyof typeof cardSize;
export type CardVariant = keyof typeof cardVariant;
export type CardSemanticVariant = keyof typeof cardSemanticVariant;
