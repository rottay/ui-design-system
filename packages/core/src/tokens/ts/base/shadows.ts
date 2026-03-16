/**
 * @fileoverview Shadow/elevation token mirrors -- box shadows, drop shadows, and focus rings.
 *
 * Organized by category: general elevation scale (xs-3xl), semantic colored
 * shadows, component-specific shadows (card, button, input, overlay, navigation),
 * and accessibility focus ring shadows.
 */

// Box Shadows - Elevation Scale
export const shadow = {
  none: 'var(--ds-shadow-none)',
  xs: 'var(--ds-shadow-xs)',
  sm: 'var(--ds-shadow-sm)',
  md: 'var(--ds-shadow-md)',
  lg: 'var(--ds-shadow-lg)',
  xl: 'var(--ds-shadow-xl)',
  '2xl': 'var(--ds-shadow-2xl)',
  '3xl': 'var(--ds-shadow-3xl)',
  inner: 'var(--ds-shadow-inner)',
} as const;

// Colored Shadows - Primary
export const shadowPrimary = {
  sm: 'var(--ds-shadow-primary-sm)',
  md: 'var(--ds-shadow-primary-md)',
  lg: 'var(--ds-shadow-primary-lg)',
} as const;

// Colored Shadows - Secondary
export const shadowSecondary = {
  sm: 'var(--ds-shadow-secondary-sm)',
  md: 'var(--ds-shadow-secondary-md)',
} as const;

// Colored Shadows - Success
export const shadowSuccess = {
  sm: 'var(--ds-shadow-success-sm)',
  md: 'var(--ds-shadow-success-md)',
} as const;

// Colored Shadows - Warning
export const shadowWarning = {
  sm: 'var(--ds-shadow-warning-sm)',
  md: 'var(--ds-shadow-warning-md)',
} as const;

// Colored Shadows - Error
export const shadowError = {
  sm: 'var(--ds-shadow-error-sm)',
  md: 'var(--ds-shadow-error-md)',
} as const;

// Drop Shadows
export const dropShadow = {
  none: 'var(--ds-drop-shadow-none)',
  xs: 'var(--ds-drop-shadow-xs)',
  sm: 'var(--ds-drop-shadow-sm)',
  md: 'var(--ds-drop-shadow-md)',
  lg: 'var(--ds-drop-shadow-lg)',
  xl: 'var(--ds-drop-shadow-xl)',
  '2xl': 'var(--ds-drop-shadow-2xl)',
} as const;

// Component Shadows
export const shadowCard = {
  rest: 'var(--ds-shadow-card-rest)',
  hover: 'var(--ds-shadow-card-hover)',
  active: 'var(--ds-shadow-card-active)',
} as const;

export const shadowButton = {
  rest: 'var(--ds-shadow-button-rest)',
  hover: 'var(--ds-shadow-button-hover)',
  active: 'var(--ds-shadow-button-active)',
} as const;

export const shadowOverlay = {
  modal: 'var(--ds-shadow-modal)',
  dialog: 'var(--ds-shadow-dialog)',
  dropdown: 'var(--ds-shadow-dropdown)',
  menu: 'var(--ds-shadow-menu)',
  popover: 'var(--ds-shadow-popover)',
  tooltip: 'var(--ds-shadow-tooltip)',
  drawer: 'var(--ds-shadow-drawer)',
} as const;

export const shadowNavigation = {
  navbar: 'var(--ds-shadow-navbar)',
  sidebar: 'var(--ds-shadow-sidebar)',
} as const;

export const shadowInput = {
  rest: 'var(--ds-shadow-input-rest)',
  focus: 'var(--ds-shadow-input-focus)',
  error: 'var(--ds-shadow-input-error)',
} as const;

// Focus Ring Shadows
export const shadowFocusRing = {
  default: 'var(--ds-shadow-focus-ring)',
  error: 'var(--ds-shadow-focus-ring-error)',
  success: 'var(--ds-shadow-focus-ring-success)',
  warning: 'var(--ds-shadow-focus-ring-warning)',
} as const;

// Combined shadows export
export const shadows = {
  box: shadow,
  primary: shadowPrimary,
  secondary: shadowSecondary,
  success: shadowSuccess,
  warning: shadowWarning,
  error: shadowError,
  drop: dropShadow,
  card: shadowCard,
  button: shadowButton,
  overlay: shadowOverlay,
  navigation: shadowNavigation,
  input: shadowInput,
  focusRing: shadowFocusRing,
} as const;

// Type exports
export type ShadowScale = keyof typeof shadow;
export type DropShadowScale = keyof typeof dropShadow;
