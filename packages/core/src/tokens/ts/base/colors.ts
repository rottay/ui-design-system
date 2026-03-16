/**
 * @fileoverview Color token mirrors -- type-safe references to `--ds-color-*` CSS variables.
 *
 * Defines 10-step scales (50-900) for semantic palettes (primary, secondary,
 * success, warning, error, info), a neutral gray scale, common colors
 * (black/white), and alpha transparency overlays.
 */

// Primary - Rottay Brand Blue
export const colorPrimary = {
  50: 'var(--ds-color-primary-50)',
  100: 'var(--ds-color-primary-100)',
  200: 'var(--ds-color-primary-200)',
  300: 'var(--ds-color-primary-300)',
  400: 'var(--ds-color-primary-400)',
  500: 'var(--ds-color-primary-500)',
  600: 'var(--ds-color-primary-600)',
  700: 'var(--ds-color-primary-700)',
  800: 'var(--ds-color-primary-800)',
  900: 'var(--ds-color-primary-900)',
} as const;

// Secondary - Rottay Accent Purple
export const colorSecondary = {
  50: 'var(--ds-color-secondary-50)',
  100: 'var(--ds-color-secondary-100)',
  200: 'var(--ds-color-secondary-200)',
  300: 'var(--ds-color-secondary-300)',
  400: 'var(--ds-color-secondary-400)',
  500: 'var(--ds-color-secondary-500)',
  600: 'var(--ds-color-secondary-600)',
  700: 'var(--ds-color-secondary-700)',
  800: 'var(--ds-color-secondary-800)',
  900: 'var(--ds-color-secondary-900)',
} as const;

// Neutral - Gray Scale
export const colorNeutral = {
  50: 'var(--ds-color-neutral-50)',
  100: 'var(--ds-color-neutral-100)',
  200: 'var(--ds-color-neutral-200)',
  300: 'var(--ds-color-neutral-300)',
  400: 'var(--ds-color-neutral-400)',
  500: 'var(--ds-color-neutral-500)',
  600: 'var(--ds-color-neutral-600)',
  700: 'var(--ds-color-neutral-700)',
  800: 'var(--ds-color-neutral-800)',
  900: 'var(--ds-color-neutral-900)',
} as const;

// Success - Green
export const colorSuccess = {
  50: 'var(--ds-color-success-50)',
  100: 'var(--ds-color-success-100)',
  200: 'var(--ds-color-success-200)',
  300: 'var(--ds-color-success-300)',
  400: 'var(--ds-color-success-400)',
  500: 'var(--ds-color-success-500)',
  600: 'var(--ds-color-success-600)',
  700: 'var(--ds-color-success-700)',
  800: 'var(--ds-color-success-800)',
  900: 'var(--ds-color-success-900)',
} as const;

// Warning - Amber
export const colorWarning = {
  50: 'var(--ds-color-warning-50)',
  100: 'var(--ds-color-warning-100)',
  200: 'var(--ds-color-warning-200)',
  300: 'var(--ds-color-warning-300)',
  400: 'var(--ds-color-warning-400)',
  500: 'var(--ds-color-warning-500)',
  600: 'var(--ds-color-warning-600)',
  700: 'var(--ds-color-warning-700)',
  800: 'var(--ds-color-warning-800)',
  900: 'var(--ds-color-warning-900)',
} as const;

// Error - Red
export const colorError = {
  50: 'var(--ds-color-error-50)',
  100: 'var(--ds-color-error-100)',
  200: 'var(--ds-color-error-200)',
  300: 'var(--ds-color-error-300)',
  400: 'var(--ds-color-error-400)',
  500: 'var(--ds-color-error-500)',
  600: 'var(--ds-color-error-600)',
  700: 'var(--ds-color-error-700)',
  800: 'var(--ds-color-error-800)',
  900: 'var(--ds-color-error-900)',
} as const;

// Info - Blue
export const colorInfo = {
  50: 'var(--ds-color-info-50)',
  100: 'var(--ds-color-info-100)',
  200: 'var(--ds-color-info-200)',
  300: 'var(--ds-color-info-300)',
  400: 'var(--ds-color-info-400)',
  500: 'var(--ds-color-info-500)',
  600: 'var(--ds-color-info-600)',
  700: 'var(--ds-color-info-700)',
  800: 'var(--ds-color-info-800)',
  900: 'var(--ds-color-info-900)',
} as const;

// Common Colors
export const colorCommon = {
  white: 'var(--ds-color-white)',
  black: 'var(--ds-color-black)',
} as const;

// Alpha Colors - Black
export const colorAlphaBlack = {
  10: 'var(--ds-color-alpha-black-10)',
  20: 'var(--ds-color-alpha-black-20)',
  30: 'var(--ds-color-alpha-black-30)',
  40: 'var(--ds-color-alpha-black-40)',
  50: 'var(--ds-color-alpha-black-50)',
  60: 'var(--ds-color-alpha-black-60)',
  70: 'var(--ds-color-alpha-black-70)',
  80: 'var(--ds-color-alpha-black-80)',
  90: 'var(--ds-color-alpha-black-90)',
} as const;

// Alpha Colors - White
export const colorAlphaWhite = {
  10: 'var(--ds-color-alpha-white-10)',
  20: 'var(--ds-color-alpha-white-20)',
  30: 'var(--ds-color-alpha-white-30)',
  40: 'var(--ds-color-alpha-white-40)',
  50: 'var(--ds-color-alpha-white-50)',
  60: 'var(--ds-color-alpha-white-60)',
  70: 'var(--ds-color-alpha-white-70)',
  80: 'var(--ds-color-alpha-white-80)',
  90: 'var(--ds-color-alpha-white-90)',
} as const;

/** Aggregated color token namespace for discovery and runtime introspection. */
export const colors = {
  primary: colorPrimary,
  secondary: colorSecondary,
  neutral: colorNeutral,
  success: colorSuccess,
  warning: colorWarning,
  error: colorError,
  info: colorInfo,
  common: colorCommon,
  alphaBlack: colorAlphaBlack,
  alphaWhite: colorAlphaWhite,
} as const;

// Type exports
export type ColorPrimaryScale = keyof typeof colorPrimary;
export type ColorSecondaryScale = keyof typeof colorSecondary;
export type ColorNeutralScale = keyof typeof colorNeutral;
export type ColorSuccessScale = keyof typeof colorSuccess;
export type ColorWarningScale = keyof typeof colorWarning;
export type ColorErrorScale = keyof typeof colorError;
export type ColorInfoScale = keyof typeof colorInfo;
export type ColorAlphaScale = keyof typeof colorAlphaBlack;

export type SemanticColor = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
