/**
 * Modal Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Modal CSS custom properties.
 * Use these for type-safe Modal token references.
 */

// Modal Sizes
export const modalSize = {
  xs: { width: 'var(--modal-xs-width)', maxHeight: 'var(--modal-xs-max-height)' },
  sm: { width: 'var(--modal-sm-width)', maxHeight: 'var(--modal-sm-max-height)' },
  md: { width: 'var(--modal-md-width)', maxHeight: 'var(--modal-md-max-height)' },
  lg: { width: 'var(--modal-lg-width)', maxHeight: 'var(--modal-lg-max-height)' },
  xl: { width: 'var(--modal-xl-width)', maxHeight: 'var(--modal-xl-max-height)' },
  '2xl': { width: 'var(--modal-2xl-width)', maxHeight: 'var(--modal-2xl-max-height)' },
  '3xl': { width: 'var(--modal-3xl-width)', maxHeight: 'var(--modal-3xl-max-height)' },
  '4xl': { width: 'var(--modal-4xl-width)', maxHeight: 'var(--modal-4xl-max-height)' },
  '5xl': { width: 'var(--modal-5xl-width)', maxHeight: 'var(--modal-5xl-max-height)' },
  full: { width: 'var(--modal-full-width)', maxHeight: 'var(--modal-full-max-height)' },
} as const;

// Modal Overlay
export const modalOverlay = {
  bg: 'var(--modal-overlay-bg)',
  backdropFilter: 'var(--modal-overlay-backdrop-filter)',
  zIndex: 'var(--modal-overlay-z-index)',
} as const;

// Modal Container
export const modalContainer = {
  zIndex: 'var(--modal-z-index)',
  margin: 'var(--modal-margin)',
  marginMobile: 'var(--modal-margin-mobile)',
} as const;

// Modal Content
export const modalContent = {
  bg: 'var(--modal-bg)',
  color: 'var(--modal-color)',
  borderRadius: 'var(--modal-border-radius)',
  borderWidth: 'var(--modal-border-width)',
  borderColor: 'var(--modal-border-color)',
  shadow: 'var(--modal-shadow)',
  padding: 'var(--modal-padding)',
  paddingSm: 'var(--modal-padding-sm)',
  paddingLg: 'var(--modal-padding-lg)',
  maxHeight: 'var(--modal-max-height)',
  fullHeight: 'var(--modal-full-height)',
} as const;

// Modal Padding Variants
export const modalPadding = {
  none: 'var(--modal-padding-none)',
  sm: 'var(--modal-padding-sm)',
  md: 'var(--modal-padding-md)',
  lg: 'var(--modal-padding-lg)',
} as const;

// Modal Radius Variants
export const modalRadius = {
  none: 'var(--modal-radius-none)',
  sm: 'var(--modal-radius-sm)',
  md: 'var(--modal-radius-md)',
  lg: 'var(--modal-radius-lg)',
  xl: 'var(--modal-radius-xl)',
} as const;

// Modal Header
export const modalHeader = {
  padding: 'var(--modal-header-padding)',
  paddingBottom: 'var(--modal-header-padding-bottom)',
  borderWidth: 'var(--modal-header-border-width)',
  borderColor: 'var(--modal-header-border-color)',
  bg: 'var(--modal-header-bg)',
} as const;

// Modal Title
export const modalTitle = {
  fontSize: 'var(--modal-title-font-size)',
  fontWeight: 'var(--modal-title-font-weight)',
  lineHeight: 'var(--modal-title-line-height)',
  color: 'var(--modal-title-color)',
} as const;

// Modal Subtitle
export const modalSubtitle = {
  fontSize: 'var(--modal-subtitle-font-size)',
  color: 'var(--modal-subtitle-color)',
  marginTop: 'var(--modal-subtitle-margin-top)',
} as const;

// Modal Body
export const modalBody = {
  padding: 'var(--modal-body-padding)',
  paddingY: 'var(--modal-body-padding-y)',
  color: 'var(--modal-body-color)',
  fontSize: 'var(--modal-body-font-size)',
  lineHeight: 'var(--modal-body-line-height)',
  maxHeight: 'var(--modal-body-max-height)',
} as const;

// Modal Footer
export const modalFooter = {
  padding: 'var(--modal-footer-padding)',
  paddingTop: 'var(--modal-footer-padding-top)',
  borderWidth: 'var(--modal-footer-border-width)',
  borderColor: 'var(--modal-footer-border-color)',
  bg: 'var(--modal-footer-bg)',
  justify: 'var(--modal-footer-justify)',
  gap: 'var(--modal-footer-gap)',
} as const;

// Modal Close Button
export const modalClose = {
  size: 'var(--modal-close-size)',
  iconSize: 'var(--modal-close-icon-size)',
  color: 'var(--modal-close-color)',
  colorHover: 'var(--modal-close-color-hover)',
  bgHover: 'var(--modal-close-bg-hover)',
  borderRadius: 'var(--modal-close-border-radius)',
  positionTop: 'var(--modal-close-position-top)',
  positionRight: 'var(--modal-close-position-right)',
} as const;

// Modal Animations
export const modalAnimation = {
  fade: {
    duration: 'var(--modal-fade-duration)',
    timing: 'var(--modal-fade-timing)',
  },
  scale: {
    from: 'var(--modal-scale-from)',
    to: 'var(--modal-scale-to)',
    duration: 'var(--modal-scale-duration)',
    timing: 'var(--modal-scale-timing)',
  },
  slideTop: {
    from: 'var(--modal-slide-top-from)',
    to: 'var(--modal-slide-top-to)',
    duration: 'var(--modal-slide-duration)',
    timing: 'var(--modal-slide-timing)',
  },
  slideBottom: {
    from: 'var(--modal-slide-bottom-from)',
    to: 'var(--modal-slide-bottom-to)',
  },
  transition: 'var(--modal-transition)',
} as const;

// Modal Position Variants
export const modalPosition = {
  centered: {
    align: 'var(--modal-centered-align)',
    justify: 'var(--modal-centered-justify)',
  },
  top: {
    align: 'var(--modal-top-align)',
    justify: 'var(--modal-top-justify)',
    marginTop: 'var(--modal-top-margin-top)',
  },
} as const;

// Modal Drawer Variant
export const modalDrawer = {
  width: 'var(--modal-drawer-width)',
  maxWidth: 'var(--modal-drawer-max-width)',
  height: 'var(--modal-drawer-height)',
  borderRadius: 'var(--modal-drawer-border-radius)',
} as const;

// Modal Bottom Sheet Variant
export const modalBottomSheet = {
  width: 'var(--modal-bottom-sheet-width)',
  maxHeight: 'var(--modal-bottom-sheet-max-height)',
  borderRadiusTop: 'var(--modal-bottom-sheet-border-radius-top)',
  borderRadiusBottom: 'var(--modal-bottom-sheet-border-radius-bottom)',
} as const;

// Modal Semantic Variants
export const modalSemanticVariant = {
  confirm: {
    iconColor: 'var(--modal-confirm-icon-color)',
    iconBg: 'var(--modal-confirm-icon-bg)',
  },
  success: {
    iconColor: 'var(--modal-success-icon-color)',
    iconBg: 'var(--modal-success-icon-bg)',
  },
  warning: {
    iconColor: 'var(--modal-warning-icon-color)',
    iconBg: 'var(--modal-warning-icon-bg)',
  },
  error: {
    iconColor: 'var(--modal-error-icon-color)',
    iconBg: 'var(--modal-error-icon-bg)',
  },
  info: {
    iconColor: 'var(--modal-info-icon-color)',
    iconBg: 'var(--modal-info-icon-bg)',
  },
} as const;

// Modal Icon
export const modalIcon = {
  size: 'var(--modal-icon-size)',
  sizeSm: 'var(--modal-icon-size-sm)',
  sizeLg: 'var(--modal-icon-size-lg)',
  marginBottom: 'var(--modal-icon-margin-bottom)',
} as const;

// Modal Scroll
export const modalScroll = {
  padding: 'var(--modal-scroll-padding)',
  shadowTop: 'var(--modal-scroll-shadow-top)',
  shadowBottom: 'var(--modal-scroll-shadow-bottom)',
} as const;

// Modal Loading
export const modalLoading = {
  overlayBg: 'var(--modal-loading-overlay-bg)',
  spinnerColor: 'var(--modal-loading-spinner-color)',
  spinnerSize: 'var(--modal-loading-spinner-size)',
} as const;

// Modal Nested
export const modalNested = {
  zIndexOffset: 'var(--modal-nested-z-index-offset)',
  overlayBg: 'var(--modal-nested-overlay-bg)',
} as const;

// Modal Accessibility
export const modalAccessibility = {
  focusRing: 'var(--modal-focus-ring)',
  focusRingOffset: 'var(--modal-focus-ring-offset)',
  focusOutline: 'var(--modal-focus-outline)',
} as const;

// Modal Responsive
export const modalResponsive = {
  width: 'var(--modal-mobile-width)',
  maxHeight: 'var(--modal-mobile-max-height)',
  padding: 'var(--modal-mobile-padding)',
  borderRadius: 'var(--modal-mobile-border-radius)',
} as const;

// Modal Glass Effect
export const modalGlass = {
  bg: 'var(--modal-glass-bg)',
  backdropFilter: 'var(--modal-glass-backdrop-filter)',
  border: 'var(--modal-glass-border)',
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
  dividerWidth: 'var(--modal-divider-width)',
  dividerColor: 'var(--modal-divider-color)',
  dividerMarginY: 'var(--modal-divider-margin-y)',
} as const;

// Type exports
export type ModalSize = keyof typeof modalSize;
export type ModalPadding = keyof typeof modalPadding;
export type ModalRadius = keyof typeof modalRadius;
export type ModalSemanticVariant = keyof typeof modalSemanticVariant;
