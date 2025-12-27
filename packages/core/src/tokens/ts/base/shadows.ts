/**
 * Shadow Tokens - TypeScript Mirror
 *
 * TypeScript representation of shadow CSS custom properties.
 * Use these for type-safe shadow references in JavaScript/TypeScript.
 */

// Box Shadows - Elevation Scale
export const shadow = {
  none: 'var(--shadow-none)',
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  '3xl': 'var(--shadow-3xl)',
  inner: 'var(--shadow-inner)',
} as const;

// Colored Shadows - Primary
export const shadowPrimary = {
  sm: 'var(--shadow-primary-sm)',
  md: 'var(--shadow-primary-md)',
  lg: 'var(--shadow-primary-lg)',
} as const;

// Colored Shadows - Secondary
export const shadowSecondary = {
  sm: 'var(--shadow-secondary-sm)',
  md: 'var(--shadow-secondary-md)',
} as const;

// Colored Shadows - Success
export const shadowSuccess = {
  sm: 'var(--shadow-success-sm)',
  md: 'var(--shadow-success-md)',
} as const;

// Colored Shadows - Warning
export const shadowWarning = {
  sm: 'var(--shadow-warning-sm)',
  md: 'var(--shadow-warning-md)',
} as const;

// Colored Shadows - Error
export const shadowError = {
  sm: 'var(--shadow-error-sm)',
  md: 'var(--shadow-error-md)',
} as const;

// Drop Shadows
export const dropShadow = {
  none: 'var(--drop-shadow-none)',
  xs: 'var(--drop-shadow-xs)',
  sm: 'var(--drop-shadow-sm)',
  md: 'var(--drop-shadow-md)',
  lg: 'var(--drop-shadow-lg)',
  xl: 'var(--drop-shadow-xl)',
  '2xl': 'var(--drop-shadow-2xl)',
} as const;

// Component Shadows
export const shadowCard = {
  rest: 'var(--shadow-card-rest)',
  hover: 'var(--shadow-card-hover)',
  active: 'var(--shadow-card-active)',
} as const;

export const shadowButton = {
  rest: 'var(--shadow-button-rest)',
  hover: 'var(--shadow-button-hover)',
  active: 'var(--shadow-button-active)',
} as const;

export const shadowOverlay = {
  modal: 'var(--shadow-modal)',
  dialog: 'var(--shadow-dialog)',
  dropdown: 'var(--shadow-dropdown)',
  menu: 'var(--shadow-menu)',
  popover: 'var(--shadow-popover)',
  tooltip: 'var(--shadow-tooltip)',
  drawer: 'var(--shadow-drawer)',
} as const;

export const shadowNavigation = {
  navbar: 'var(--shadow-navbar)',
  sidebar: 'var(--shadow-sidebar)',
} as const;

export const shadowInput = {
  rest: 'var(--shadow-input-rest)',
  focus: 'var(--shadow-input-focus)',
  error: 'var(--shadow-input-error)',
} as const;

// Focus Ring Shadows
export const shadowFocusRing = {
  default: 'var(--shadow-focus-ring)',
  error: 'var(--shadow-focus-ring-error)',
  success: 'var(--shadow-focus-ring-success)',
  warning: 'var(--shadow-focus-ring-warning)',
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
