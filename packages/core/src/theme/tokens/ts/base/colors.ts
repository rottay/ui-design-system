/**
 * Color Tokens - TypeScript Mirror
 *
 * TypeScript representation of color CSS custom properties.
 * Use these for type-safe color references in JavaScript/TypeScript.
 */

// Primary - Rottay Brand Blue
export const colorPrimary = {
  50: 'var(--color-primary-50)',
  100: 'var(--color-primary-100)',
  200: 'var(--color-primary-200)',
  300: 'var(--color-primary-300)',
  400: 'var(--color-primary-400)',
  500: 'var(--color-primary-500)',
  600: 'var(--color-primary-600)',
  700: 'var(--color-primary-700)',
  800: 'var(--color-primary-800)',
  900: 'var(--color-primary-900)',
} as const;

// Secondary - Rottay Accent Purple
export const colorSecondary = {
  50: 'var(--color-secondary-50)',
  100: 'var(--color-secondary-100)',
  200: 'var(--color-secondary-200)',
  300: 'var(--color-secondary-300)',
  400: 'var(--color-secondary-400)',
  500: 'var(--color-secondary-500)',
  600: 'var(--color-secondary-600)',
  700: 'var(--color-secondary-700)',
  800: 'var(--color-secondary-800)',
  900: 'var(--color-secondary-900)',
} as const;

// Neutral - Gray Scale
export const colorNeutral = {
  50: 'var(--color-neutral-50)',
  100: 'var(--color-neutral-100)',
  200: 'var(--color-neutral-200)',
  300: 'var(--color-neutral-300)',
  400: 'var(--color-neutral-400)',
  500: 'var(--color-neutral-500)',
  600: 'var(--color-neutral-600)',
  700: 'var(--color-neutral-700)',
  800: 'var(--color-neutral-800)',
  900: 'var(--color-neutral-900)',
} as const;

// Success - Green
export const colorSuccess = {
  50: 'var(--color-success-50)',
  100: 'var(--color-success-100)',
  200: 'var(--color-success-200)',
  300: 'var(--color-success-300)',
  400: 'var(--color-success-400)',
  500: 'var(--color-success-500)',
  600: 'var(--color-success-600)',
  700: 'var(--color-success-700)',
  800: 'var(--color-success-800)',
  900: 'var(--color-success-900)',
} as const;

// Warning - Amber
export const colorWarning = {
  50: 'var(--color-warning-50)',
  100: 'var(--color-warning-100)',
  200: 'var(--color-warning-200)',
  300: 'var(--color-warning-300)',
  400: 'var(--color-warning-400)',
  500: 'var(--color-warning-500)',
  600: 'var(--color-warning-600)',
  700: 'var(--color-warning-700)',
  800: 'var(--color-warning-800)',
  900: 'var(--color-warning-900)',
} as const;

// Error - Red
export const colorError = {
  50: 'var(--color-error-50)',
  100: 'var(--color-error-100)',
  200: 'var(--color-error-200)',
  300: 'var(--color-error-300)',
  400: 'var(--color-error-400)',
  500: 'var(--color-error-500)',
  600: 'var(--color-error-600)',
  700: 'var(--color-error-700)',
  800: 'var(--color-error-800)',
  900: 'var(--color-error-900)',
} as const;

// Info - Blue
export const colorInfo = {
  50: 'var(--color-info-50)',
  100: 'var(--color-info-100)',
  200: 'var(--color-info-200)',
  300: 'var(--color-info-300)',
  400: 'var(--color-info-400)',
  500: 'var(--color-info-500)',
  600: 'var(--color-info-600)',
  700: 'var(--color-info-700)',
  800: 'var(--color-info-800)',
  900: 'var(--color-info-900)',
} as const;

// Common Colors
export const colorCommon = {
  white: 'var(--color-white)',
  black: 'var(--color-black)',
} as const;

// Alpha Colors - Black
export const colorAlphaBlack = {
  10: 'var(--color-alpha-black-10)',
  20: 'var(--color-alpha-black-20)',
  30: 'var(--color-alpha-black-30)',
  40: 'var(--color-alpha-black-40)',
  50: 'var(--color-alpha-black-50)',
  60: 'var(--color-alpha-black-60)',
  70: 'var(--color-alpha-black-70)',
  80: 'var(--color-alpha-black-80)',
  90: 'var(--color-alpha-black-90)',
} as const;

// Alpha Colors - White
export const colorAlphaWhite = {
  10: 'var(--color-alpha-white-10)',
  20: 'var(--color-alpha-white-20)',
  30: 'var(--color-alpha-white-30)',
  40: 'var(--color-alpha-white-40)',
  50: 'var(--color-alpha-white-50)',
  60: 'var(--color-alpha-white-60)',
  70: 'var(--color-alpha-white-70)',
  80: 'var(--color-alpha-white-80)',
  90: 'var(--color-alpha-white-90)',
} as const;

// Combined colors export
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
