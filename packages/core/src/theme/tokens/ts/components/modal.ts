/**
 * Modal Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Modal CSS custom properties.
 * Use these for type-safe Modal token references.
 */

// Modal Sizes
export const modalSize = {
  xs: { width: 'var(--ds-modal-xs-width)', maxHeight: 'var(--ds-modal-xs-max-height)' },
  sm: { width: 'var(--ds-modal-sm-width)', maxHeight: 'var(--ds-modal-sm-max-height)' },
  md: { width: 'var(--ds-modal-md-width)', maxHeight: 'var(--ds-modal-md-max-height)' },
  lg: { width: 'var(--ds-modal-lg-width)', maxHeight: 'var(--ds-modal-lg-max-height)' },
  xl: { width: 'var(--ds-modal-xl-width)', maxHeight: 'var(--ds-modal-xl-max-height)' },
  '2xl': { width: 'var(--ds-modal-2xl-width)', maxHeight: 'var(--ds-modal-2xl-max-height)' },
  '3xl': { width: 'var(--ds-modal-3xl-width)', maxHeight: 'var(--ds-modal-3xl-max-height)' },
  '4xl': { width: 'var(--ds-modal-4xl-width)', maxHeight: 'var(--ds-modal-4xl-max-height)' },
  '5xl': { width: 'var(--ds-modal-5xl-width)', maxHeight: 'var(--ds-modal-5xl-max-height)' },
  full: { width: 'var(--ds-modal-full-width)', maxHeight: 'var(--ds-modal-full-max-height)' },
} as const;

// Modal Overlay
export const modalOverlay = {
  bg: 'var(--ds-modal-overlay-bg)',
  backdropFilter: 'var(--ds-modal-overlay-backdrop-filter)',
  zIndex: 'var(--ds-modal-overlay-z-index)',
} as const;

// Modal Container
export const modalContainer = {
  zIndex: 'var(--ds-modal-z-index)',
  margin: 'var(--ds-modal-margin)',
  marginMobile: 'var(--ds-modal-margin-mobile)',
} as const;

// Modal Content
export const modalContent = {
  bg: 'var(--ds-modal-bg)',
  color: 'var(--ds-modal-color)',
  borderRadius: 'var(--ds-modal-border-radius)',
  borderWidth: 'var(--ds-modal-border-width)',
  borderColor: 'var(--ds-modal-border-color)',
  shadow: 'var(--ds-modal-shadow)',
  padding: 'var(--ds-modal-padding)',
  paddingSm: 'var(--ds-modal-padding-sm)',
  paddingLg: 'var(--ds-modal-padding-lg)',
  maxHeight: 'var(--ds-modal-max-height)',
  fullHeight: 'var(--ds-modal-full-height)',
} as const;

// Modal Padding Variants
export const modalPadding = {
  none: 'var(--ds-modal-padding-none)',
  sm: 'var(--ds-modal-padding-sm)',
  md: 'var(--ds-modal-padding-md)',
  lg: 'var(--ds-modal-padding-lg)',
} as const;

// Modal Radius Variants
export const modalRadius = {
  none: 'var(--ds-modal-radius-none)',
  sm: 'var(--ds-modal-radius-sm)',
  md: 'var(--ds-modal-radius-md)',
  lg: 'var(--ds-modal-radius-lg)',
  xl: 'var(--ds-modal-radius-xl)',
} as const;

// Modal Header
export const modalHeader = {
  padding: 'var(--ds-modal-header-padding)',
  paddingBottom: 'var(--ds-modal-header-padding-bottom)',
  borderWidth: 'var(--ds-modal-header-border-width)',
  borderColor: 'var(--ds-modal-header-border-color)',
  bg: 'var(--ds-modal-header-bg)',
} as const;

// Modal Title
export const modalTitle = {
  fontSize: 'var(--ds-modal-title-font-size)',
  fontWeight: 'var(--ds-modal-title-font-weight)',
  lineHeight: 'var(--ds-modal-title-line-height)',
  color: 'var(--ds-modal-title-color)',
} as const;

// Modal Subtitle
export const modalSubtitle = {
  fontSize: 'var(--ds-modal-subtitle-font-size)',
  color: 'var(--ds-modal-subtitle-color)',
  marginTop: 'var(--ds-modal-subtitle-margin-top)',
} as const;

// Modal Body
export const modalBody = {
  padding: 'var(--ds-modal-body-padding)',
  paddingY: 'var(--ds-modal-body-padding-y)',
  color: 'var(--ds-modal-body-color)',
  fontSize: 'var(--ds-modal-body-font-size)',
  lineHeight: 'var(--ds-modal-body-line-height)',
  maxHeight: 'var(--ds-modal-body-max-height)',
} as const;

// Modal Footer
export const modalFooter = {
  padding: 'var(--ds-modal-footer-padding)',
  paddingTop: 'var(--ds-modal-footer-padding-top)',
  borderWidth: 'var(--ds-modal-footer-border-width)',
  borderColor: 'var(--ds-modal-footer-border-color)',
  bg: 'var(--ds-modal-footer-bg)',
  justify: 'var(--ds-modal-footer-justify)',
  gap: 'var(--ds-modal-footer-gap)',
} as const;

// Modal Close Button
export const modalClose = {
  size: 'var(--ds-modal-close-size)',
  iconSize: 'var(--ds-modal-close-icon-size)',
  color: 'var(--ds-modal-close-color)',
  colorHover: 'var(--ds-modal-close-color-hover)',
  bgHover: 'var(--ds-modal-close-bg-hover)',
  borderRadius: 'var(--ds-modal-close-border-radius)',
  positionTop: 'var(--ds-modal-close-position-top)',
  positionRight: 'var(--ds-modal-close-position-right)',
} as const;

// Modal Animations
export const modalAnimation = {
  fade: {
    duration: 'var(--ds-modal-fade-duration)',
    timing: 'var(--ds-modal-fade-timing)',
  },
  scale: {
    from: 'var(--ds-modal-scale-from)',
    to: 'var(--ds-modal-scale-to)',
    duration: 'var(--ds-modal-scale-duration)',
    timing: 'var(--ds-modal-scale-timing)',
  },
  slideTop: {
    from: 'var(--ds-modal-slide-top-from)',
    to: 'var(--ds-modal-slide-top-to)',
    duration: 'var(--ds-modal-slide-duration)',
    timing: 'var(--ds-modal-slide-timing)',
  },
  slideBottom: {
    from: 'var(--ds-modal-slide-bottom-from)',
    to: 'var(--ds-modal-slide-bottom-to)',
  },
  transition: 'var(--ds-modal-transition)',
} as const;

// Modal Position Variants
export const modalPosition = {
  centered: {
    align: 'var(--ds-modal-centered-align)',
    justify: 'var(--ds-modal-centered-justify)',
  },
  top: {
    align: 'var(--ds-modal-top-align)',
    justify: 'var(--ds-modal-top-justify)',
    marginTop: 'var(--ds-modal-top-margin-top)',
  },
} as const;

// Modal Drawer Variant
export const modalDrawer = {
  width: 'var(--ds-modal-drawer-width)',
  maxWidth: 'var(--ds-modal-drawer-max-width)',
  height: 'var(--ds-modal-drawer-height)',
  borderRadius: 'var(--ds-modal-drawer-border-radius)',
} as const;

// Modal Bottom Sheet Variant
export const modalBottomSheet = {
  width: 'var(--ds-modal-bottom-sheet-width)',
  maxHeight: 'var(--ds-modal-bottom-sheet-max-height)',
  borderRadiusTop: 'var(--ds-modal-bottom-sheet-border-radius-top)',
  borderRadiusBottom: 'var(--ds-modal-bottom-sheet-border-radius-bottom)',
} as const;

// Modal Semantic Variants
export const modalSemanticVariant = {
  confirm: {
    iconColor: 'var(--ds-modal-confirm-icon-color)',
    iconBg: 'var(--ds-modal-confirm-icon-bg)',
  },
  success: {
    iconColor: 'var(--ds-modal-success-icon-color)',
    iconBg: 'var(--ds-modal-success-icon-bg)',
  },
  warning: {
    iconColor: 'var(--ds-modal-warning-icon-color)',
    iconBg: 'var(--ds-modal-warning-icon-bg)',
  },
  error: {
    iconColor: 'var(--ds-modal-error-icon-color)',
    iconBg: 'var(--ds-modal-error-icon-bg)',
  },
  info: {
    iconColor: 'var(--ds-modal-info-icon-color)',
    iconBg: 'var(--ds-modal-info-icon-bg)',
  },
} as const;

// Modal Icon
export const modalIcon = {
  size: 'var(--ds-modal-icon-size)',
  sizeSm: 'var(--ds-modal-icon-size-sm)',
  sizeLg: 'var(--ds-modal-icon-size-lg)',
  marginBottom: 'var(--ds-modal-icon-margin-bottom)',
} as const;

// Modal Scroll
export const modalScroll = {
  padding: 'var(--ds-modal-scroll-padding)',
  shadowTop: 'var(--ds-modal-scroll-shadow-top)',
  shadowBottom: 'var(--ds-modal-scroll-shadow-bottom)',
} as const;

// Modal Loading
export const modalLoading = {
  overlayBg: 'var(--ds-modal-loading-overlay-bg)',
  spinnerColor: 'var(--ds-modal-loading-spinner-color)',
  spinnerSize: 'var(--ds-modal-loading-spinner-size)',
} as const;

// Modal Nested
export const modalNested = {
  zIndexOffset: 'var(--ds-modal-nested-z-index-offset)',
  overlayBg: 'var(--ds-modal-nested-overlay-bg)',
} as const;

// Modal Accessibility
export const modalAccessibility = {
  focusRing: 'var(--ds-modal-focus-ring)',
  focusRingOffset: 'var(--ds-modal-focus-ring-offset)',
  focusOutline: 'var(--ds-modal-focus-outline)',
} as const;

// Modal Responsive
export const modalResponsive = {
  width: 'var(--ds-modal-mobile-width)',
  maxHeight: 'var(--ds-modal-mobile-max-height)',
  padding: 'var(--ds-modal-mobile-padding)',
  borderRadius: 'var(--ds-modal-mobile-border-radius)',
} as const;

// Modal Glass Effect
export const modalGlass = {
  bg: 'var(--ds-modal-glass-bg)',
  backdropFilter: 'var(--ds-modal-glass-backdrop-filter)',
  border: 'var(--ds-modal-glass-border)',
} as const;

// Combined modal tokens
export const modalTokens = {
  size: modalSize,
  padding: modalPadding,
  radius: modalRadius,
  overlay: modalOverlay,
  container: modalContainer,
  content: modalContent,
  header: modalHeader,
  title: modalTitle,
  subtitle: modalSubtitle,
  body: modalBody,
  footer: modalFooter,
  close: modalClose,
  animation: modalAnimation,
  position: modalPosition,
  drawer: modalDrawer,
  bottomSheet: modalBottomSheet,
  semanticVariant: modalSemanticVariant,
  icon: modalIcon,
  scroll: modalScroll,
  loading: modalLoading,
  nested: modalNested,
  accessibility: modalAccessibility,
  responsive: modalResponsive,
  glass: modalGlass,
  dividerWidth: 'var(--ds-modal-divider-width)',
  dividerColor: 'var(--ds-modal-divider-color)',
  dividerMarginY: 'var(--ds-modal-divider-margin-y)',
} as const;

// Type exports
export type ModalSize = keyof typeof modalSize;
export type ModalPadding = keyof typeof modalPadding;
export type ModalRadius = keyof typeof modalRadius;
export type ModalSemanticVariant = keyof typeof modalSemanticVariant;
