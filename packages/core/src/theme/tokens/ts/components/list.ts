/**
 * List Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of List CSS custom properties.
 * Use these for type-safe List token references.
 */

// List sizes
export const listSize = {
  small: {
    padding: 'var(--list-sm-padding-vertical) var(--list-sm-padding-horizontal)',
    paddingVertical: 'var(--list-sm-padding-vertical)',
    paddingHorizontal: 'var(--list-sm-padding-horizontal)',
    fontSize: 'var(--list-sm-font-size)',
  },
  default: {
    padding: 'var(--list-default-padding-vertical) var(--list-default-padding-horizontal)',
    paddingVertical: 'var(--list-default-padding-vertical)',
    paddingHorizontal: 'var(--list-default-padding-horizontal)',
    fontSize: 'var(--list-default-font-size)',
  },
  large: {
    padding: 'var(--list-lg-padding-vertical) var(--list-lg-padding-horizontal)',
    paddingVertical: 'var(--list-lg-padding-vertical)',
    paddingHorizontal: 'var(--list-lg-padding-horizontal)',
    fontSize: 'var(--list-lg-font-size)',
  },
} as const;

// List borders
export const listBorder = {
  color: 'var(--list-border-color)',
  width: 'var(--list-border-width)',
  radius: 'var(--list-border-radius)',
  splitColor: 'var(--list-split-color)',
  splitWidth: 'var(--list-split-width)',
} as const;

// List colors
export const listColor = {
  background: 'var(--list-background-color)',
  itemBackground: 'var(--list-item-background-color)',
  itemHoverBackground: 'var(--list-item-hover-background-color)',
  text: 'var(--list-text-color)',
  secondaryText: 'var(--list-secondary-text-color)',
} as const;

// List header
export const listHeader = {
  paddingVertical: 'var(--list-header-padding-vertical)',
  paddingHorizontal: 'var(--list-header-padding-horizontal)',
  fontSize: 'var(--list-header-font-size)',
  fontWeight: 'var(--list-header-font-weight)',
  backgroundColor: 'var(--list-header-background-color)',
} as const;

// List footer
export const listFooter = {
  paddingVertical: 'var(--list-footer-padding-vertical)',
  paddingHorizontal: 'var(--list-footer-padding-horizontal)',
  fontSize: 'var(--list-footer-font-size)',
  backgroundColor: 'var(--list-footer-background-color)',
} as const;

// List item meta
export const listMeta = {
  avatarMarginRight: 'var(--list-meta-avatar-margin-right)',
  titleFontSize: 'var(--list-meta-title-font-size)',
  titleFontWeight: 'var(--list-meta-title-font-weight)',
  titleColor: 'var(--list-meta-title-color)',
  descriptionFontSize: 'var(--list-meta-description-font-size)',
  descriptionColor: 'var(--list-meta-description-color)',
  descriptionMarginTop: 'var(--list-meta-description-margin-top)',
} as const;

// List item actions
export const listActions = {
  gap: 'var(--list-actions-gap)',
  color: 'var(--list-actions-color)',
  hoverColor: 'var(--list-actions-hover-color)',
} as const;

// List extra content
export const listExtra = {
  marginLeft: 'var(--list-extra-margin-left)',
} as const;

// List empty state
export const listEmpty = {
  padding: 'var(--list-empty-padding)',
  textColor: 'var(--list-empty-text-color)',
  fontSize: 'var(--list-empty-font-size)',
} as const;

// List loading state
export const listLoading = {
  opacity: 'var(--list-loading-opacity)',
  spinnerSize: 'var(--list-loading-spinner-size)',
  spinnerColor: 'var(--list-loading-spinner-color)',
} as const;

// List grid layout
export const listGrid = {
  gutter: 'var(--list-grid-gutter)',
} as const;

// List transitions
export const listTransition = {
  duration: 'var(--list-transition-duration)',
  timing: 'var(--list-transition-timing)',
} as const;

// Combined list tokens
export const listTokens = {
  size: listSize,
  border: listBorder,
  color: listColor,
  header: listHeader,
  footer: listFooter,
  meta: listMeta,
  actions: listActions,
  extra: listExtra,
  empty: listEmpty,
  loading: listLoading,
  grid: listGrid,
  transition: listTransition,
} as const;

// Type exports
export type ListSize = keyof typeof listSize;
