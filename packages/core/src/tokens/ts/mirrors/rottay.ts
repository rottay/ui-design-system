/**
 * @fileoverview Rottay (default tenant) token reference mirror.
 *
 * This is a REFERENCE MIRROR — typed `var(--ds-*)` catalog for discovery
 * and component code. It is NOT the canonical authored premium source.
 * The authored source is `tokens/ts/brand-themes/rottay.ts`.
 *
 * Mirrors only the CSS custom properties that actually exist in the shipped
 * stylesheets. Organized by semantic role: brand colors, backgrounds, text,
 * borders, status indicators, links, typography, border radius, and shadows.
 */

/** Primary and accent brand color references for the Rottay tenant. */
export const rottayBrand = {
  primary: 'var(--ds-color-primary)',
  primaryHover: 'var(--ds-color-primary-hover)',
  secondary: 'var(--ds-color-secondary)',
  accent: 'var(--ds-color-accent)',
  accentHover: 'var(--ds-color-accent-hover)',
} as const;

/** Surface and background color tokens for layered UI elevation. */
export const rottayBackground = {
  primary: 'var(--ds-color-bg-primary)',
  secondary: 'var(--ds-color-bg-secondary)',
  tertiary: 'var(--ds-color-bg-tertiary)',
  elevated: 'var(--ds-color-bg-elevated)',
  surface: 'var(--ds-color-bg-surface)',
  overlay: 'var(--ds-color-bg-overlay)',
} as const;

/** Text color tokens ranging from primary to disabled, plus on-primary contrast. */
export const rottayText = {
  primary: 'var(--ds-color-text-primary)',
  secondary: 'var(--ds-color-text-secondary)',
  tertiary: 'var(--ds-color-text-tertiary)',
  muted: 'var(--ds-color-text-muted)',
  disabled: 'var(--ds-color-text-disabled)',
  onPrimary: 'var(--ds-color-text-on-primary)',
} as const;

/** Border color tokens for default, semantic, and focus states. */
export const rottayBorder = {
  default: 'var(--ds-color-border)',
  primary: 'var(--ds-color-border-primary)',
  secondary: 'var(--ds-color-border-secondary)',
  tertiary: 'var(--ds-color-border-tertiary)',
  focus: 'var(--ds-color-border-focus)',
} as const;

/** Success/warning/error/info status tokens with foreground, background, and border variants. */
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

/** Hyperlink color tokens for default, hover, and visited states. */
export const rottayLink = {
  default: 'var(--ds-color-link)',
  hover: 'var(--ds-color-link-hover)',
  visited: 'var(--ds-color-link-visited)',
} as const;

/** Font family, letter spacing, and line height tokens for the Rottay tenant. */
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

/** Border radius scale tokens. */
export const rottayRadius = {
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
  full: 'var(--ds-radius-full)',
} as const;

/** Box shadow elevation scale tokens. */
export const rottayShadows = {
  sm: 'var(--ds-shadow-sm)',
  md: 'var(--ds-shadow-md)',
  lg: 'var(--ds-shadow-lg)',
  xl: 'var(--ds-shadow-xl)',
} as const;

/** Combined aggregate of all Rottay tenant token categories. */
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
