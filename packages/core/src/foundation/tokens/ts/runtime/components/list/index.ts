/**
 * @fileoverview List component token mirrors.
 *
 * Covers 3 size tiers (small/default/large), border/split styling, color
 * scheme, header/footer sections, item meta (avatar/title/description),
 * action links, extra content, empty/loading states, grid layout gutter,
 * and transition tokens.
 */

// List sizes
export const listSize = {
  small: {
    padding: 'var(--ds-list-sm-padding-vertical) var(--ds-list-sm-padding-horizontal)',
    paddingVertical: 'var(--ds-list-sm-padding-vertical)',
    paddingHorizontal: 'var(--ds-list-sm-padding-horizontal)',
    fontSize: 'var(--ds-list-sm-font-size)',
  },
  default: {
    padding: 'var(--ds-list-default-padding-vertical) var(--ds-list-default-padding-horizontal)',
    paddingVertical: 'var(--ds-list-default-padding-vertical)',
    paddingHorizontal: 'var(--ds-list-default-padding-horizontal)',
    fontSize: 'var(--ds-list-default-font-size)',
  },
  large: {
    padding: 'var(--ds-list-lg-padding-vertical) var(--ds-list-lg-padding-horizontal)',
    paddingVertical: 'var(--ds-list-lg-padding-vertical)',
    paddingHorizontal: 'var(--ds-list-lg-padding-horizontal)',
    fontSize: 'var(--ds-list-lg-font-size)',
  },
} as const;

// List borders
export const listBorder = {
  color: 'var(--ds-list-border-color)',
  width: 'var(--ds-list-border-width)',
  radius: 'var(--ds-list-border-radius)',
  splitColor: 'var(--ds-list-split-color)',
  splitWidth: 'var(--ds-list-split-width)',
} as const;

// List colors
export const listColor = {
  background: 'var(--ds-list-background-color)',
  itemBackground: 'var(--ds-list-item-background-color)',
  itemHoverBackground: 'var(--ds-list-item-hover-background-color)',
  text: 'var(--ds-list-text-color)',
  secondaryText: 'var(--ds-list-secondary-text-color)',
} as const;

// List header
export const listHeader = {
  paddingVertical: 'var(--ds-list-header-padding-vertical)',
  paddingHorizontal: 'var(--ds-list-header-padding-horizontal)',
  fontSize: 'var(--ds-list-header-font-size)',
  fontWeight: 'var(--ds-list-header-font-weight)',
  backgroundColor: 'var(--ds-list-header-background-color)',
} as const;

// List footer
export const listFooter = {
  paddingVertical: 'var(--ds-list-footer-padding-vertical)',
  paddingHorizontal: 'var(--ds-list-footer-padding-horizontal)',
  fontSize: 'var(--ds-list-footer-font-size)',
  backgroundColor: 'var(--ds-list-footer-background-color)',
} as const;

// List item meta
export const listMeta = {
  avatarMarginRight: 'var(--ds-list-meta-avatar-margin-right)',
  titleFontSize: 'var(--ds-list-meta-title-font-size)',
  titleFontWeight: 'var(--ds-list-meta-title-font-weight)',
  titleColor: 'var(--ds-list-meta-title-color)',
  descriptionFontSize: 'var(--ds-list-meta-description-font-size)',
  descriptionColor: 'var(--ds-list-meta-description-color)',
  descriptionMarginTop: 'var(--ds-list-meta-description-margin-top)',
} as const;

// List item actions
export const listActions = {
  gap: 'var(--ds-list-actions-gap)',
  color: 'var(--ds-list-actions-color)',
  hoverColor: 'var(--ds-list-actions-hover-color)',
} as const;

// List extra content
export const listExtra = {
  marginLeft: 'var(--ds-list-extra-margin-left)',
} as const;

// List empty state
export const listEmpty = {
  padding: 'var(--ds-list-empty-padding)',
  textColor: 'var(--ds-list-empty-text-color)',
  fontSize: 'var(--ds-list-empty-font-size)',
} as const;

// List loading state
export const listLoading = {
  opacity: 'var(--ds-list-loading-opacity)',
  spinnerSize: 'var(--ds-list-loading-spinner-size)',
  spinnerColor: 'var(--ds-list-loading-spinner-color)',
} as const;

// List grid layout
export const listGrid = {
  gutter: 'var(--ds-list-grid-gutter)',
} as const;

// List transitions
export const listTransition = {
  duration: 'var(--ds-list-transition-duration)',
  timing: 'var(--ds-list-transition-timing)',
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
