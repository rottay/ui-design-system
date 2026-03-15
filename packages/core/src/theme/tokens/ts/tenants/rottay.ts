/**
 * Rottay Tenant Tokens - TypeScript Mirror
 *
 * This file only mirrors tenant tokens that exist in the live DS runtime.
 * The previous version exposed a fantasy token API that did not match the
 * actual CSS shipped by the package.
 */

export const rottayBrand = {
  primary: 'var(--ds-color-primary)',
  primaryHover: 'var(--ds-color-primary-hover)',
  secondary: 'var(--ds-color-secondary)',
  accent: 'var(--ds-color-accent)',
  accentHover: 'var(--ds-color-accent-hover)',
} as const;

export const rottayBackground = {
  primary: 'var(--ds-color-bg-primary)',
  secondary: 'var(--ds-color-bg-secondary)',
  tertiary: 'var(--ds-color-bg-tertiary)',
  elevated: 'var(--ds-color-bg-elevated)',
  surface: 'var(--ds-color-bg-surface)',
  overlay: 'var(--ds-color-bg-overlay)',
} as const;

export const rottayText = {
  primary: 'var(--ds-color-text-primary)',
  secondary: 'var(--ds-color-text-secondary)',
  tertiary: 'var(--ds-color-text-tertiary)',
  muted: 'var(--ds-color-text-muted)',
  disabled: 'var(--ds-color-text-disabled)',
  onPrimary: 'var(--ds-color-text-on-primary)',
} as const;

export const rottayBorder = {
  default: 'var(--ds-color-border)',
  primary: 'var(--ds-color-border-primary)',
  secondary: 'var(--ds-color-border-secondary)',
  tertiary: 'var(--ds-color-border-tertiary)',
  focus: 'var(--ds-color-border-focus)',
} as const;

export const rottayStatus = {
  success: 'var(--ds-color-success)',
  successBg: 'var(--ds-color-success-bg)',
  successBorder: 'var(--ds-color-success-border)',
  warning: 'var(--ds-color-warning)',
  warningBg: 'var(--ds-color-warning-bg)',
  warningBorder: 'var(--ds-color-warning-border)',
  error: 'var(--ds-color-error)',
  errorBg: 'var(--ds-color-error-bg)',
  errorBorder: 'var(--ds-color-error-border)',
  info: 'var(--ds-color-info)',
  infoBg: 'var(--ds-color-info-bg)',
  infoBorder: 'var(--ds-color-info-border)',
} as const;

export const rottayLink = {
  default: 'var(--ds-color-link)',
  hover: 'var(--ds-color-link-hover)',
  visited: 'var(--ds-color-link-visited)',
} as const;

export const rottayTypography = {
  fontFamilyBase: 'var(--ds-font-family-base)',
  fontFamilyHeading: 'var(--ds-font-family-heading)',
  fontFamilyMono: 'var(--ds-font-family-mono)',
  fontFamilyDisplay: 'var(--ds-font-family-display)',
  letterSpacingDisplay: 'var(--ds-letter-spacing-display)',
  letterSpacingHeading: 'var(--ds-letter-spacing-heading)',
  letterSpacingBody: 'var(--ds-letter-spacing-body)',
  letterSpacingMono: 'var(--ds-letter-spacing-mono)',
  lineHeightDisplay: 'var(--ds-line-height-display)',
  lineHeightHeading: 'var(--ds-line-height-heading)',
  lineHeightBody: 'var(--ds-line-height-body)',
  lineHeightTight: 'var(--ds-line-height-tight)',
  lineHeightRelaxed: 'var(--ds-line-height-relaxed)',
} as const;

export const rottayRadius = {
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
  full: 'var(--ds-radius-full)',
} as const;

export const rottayShadows = {
  sm: 'var(--ds-shadow-sm)',
  md: 'var(--ds-shadow-md)',
  lg: 'var(--ds-shadow-lg)',
  xl: 'var(--ds-shadow-xl)',
} as const;

export const rottayTokens = {
  brand: rottayBrand,
  background: rottayBackground,
  text: rottayText,
  border: rottayBorder,
  status: rottayStatus,
  link: rottayLink,
  typography: rottayTypography,
  radius: rottayRadius,
  shadows: rottayShadows,
} as const;

export type RottayBrandKey = keyof typeof rottayBrand;
export type RottayBackgroundKey = keyof typeof rottayBackground;
export type RottayTextKey = keyof typeof rottayText;
export type RottayBorderKey = keyof typeof rottayBorder;
