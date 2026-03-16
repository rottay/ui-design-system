/**
 * @fileoverview Border token mirrors -- widths, radii, styles, colors, dividers, and outlines.
 *
 * Includes both primitive values (borderWidth, radius) and semantic composites
 * (border.default, border.error) that map to shorthand CSS variable declarations.
 */

// Border Widths
export const borderWidth = {
  0: 'var(--ds-border-width-0)',
  1: 'var(--ds-border-width-1)',
  2: 'var(--ds-border-width-2)',
  4: 'var(--ds-border-width-4)',
  8: 'var(--ds-border-width-8)',
  // Semantic
  none: 'var(--ds-border-width-none)',
  thin: 'var(--ds-border-width-thin)',
  default: 'var(--ds-border-width-default)',
  medium: 'var(--ds-border-width-medium)',
  thick: 'var(--ds-border-width-thick)',
} as const;

// Border Radius
export const radius = {
  none: 'var(--ds-radius-none)',
  xs: 'var(--ds-radius-xs)',
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
  '2xl': 'var(--ds-radius-2xl)',
  '3xl': 'var(--ds-radius-3xl)',
  full: 'var(--ds-radius-full)',
  // Component-specific
  button: 'var(--ds-radius-button)',
  input: 'var(--ds-radius-input)',
  card: 'var(--ds-radius-card)',
  modal: 'var(--ds-radius-modal)',
  badge: 'var(--ds-radius-badge)',
  avatar: 'var(--ds-radius-avatar)',
} as const;

// Border Styles
export const borderStyle = {
  none: 'var(--ds-border-style-none)',
  solid: 'var(--ds-border-style-solid)',
  dashed: 'var(--ds-border-style-dashed)',
  dotted: 'var(--ds-border-style-dotted)',
  double: 'var(--ds-border-style-double)',
} as const;

// Border Colors
export const borderColor = {
  default: 'var(--ds-border-color-default)',
  muted: 'var(--ds-border-color-muted)',
  strong: 'var(--ds-border-color-strong)',
  // Interactive
  hover: 'var(--ds-border-color-hover)',
  focus: 'var(--ds-border-color-focus)',
  active: 'var(--ds-border-color-active)',
  // Semantic
  primary: 'var(--ds-border-color-primary)',
  secondary: 'var(--ds-border-color-secondary)',
  success: 'var(--ds-border-color-success)',
  warning: 'var(--ds-border-color-warning)',
  error: 'var(--ds-border-color-error)',
  info: 'var(--ds-border-color-info)',
  // Utility
  transparent: 'var(--ds-border-color-transparent)',
} as const;

// Divider
export const divider = {
  width: 'var(--ds-divider-width)',
  color: 'var(--ds-divider-color)',
  style: 'var(--ds-divider-style)',
  spacing: {
    sm: 'var(--ds-divider-spacing-sm)',
    md: 'var(--ds-divider-spacing-md)',
    lg: 'var(--ds-divider-spacing-lg)',
  },
} as const;

// Outline
export const outline = {
  width: 'var(--ds-outline-width)',
  offset: 'var(--ds-outline-offset)',
  style: 'var(--ds-outline-style)',
  color: {
    default: 'var(--ds-outline-color-default)',
    error: 'var(--ds-outline-color-error)',
  },
} as const;

// Composite Borders
export const border = {
  default: 'var(--ds-border-default)',
  muted: 'var(--ds-border-muted)',
  strong: 'var(--ds-border-strong)',
  hover: 'var(--ds-border-hover)',
  focus: 'var(--ds-border-focus)',
  // Semantic
  primary: 'var(--ds-border-primary)',
  secondary: 'var(--ds-border-secondary)',
  success: 'var(--ds-border-success)',
  warning: 'var(--ds-border-warning)',
  error: 'var(--ds-border-error)',
  info: 'var(--ds-border-info)',
  // Variants
  dashed: 'var(--ds-border-dashed)',
  dashedMuted: 'var(--ds-border-dashed-muted)',
  transparent: 'var(--ds-border-transparent)',
} as const;

// Combined borders export
export const borders = {
  width: borderWidth,
  radius,
  style: borderStyle,
  color: borderColor,
  divider,
  outline,
  composite: border,
} as const;

// Type exports
export type RadiusKey = keyof typeof radius;
export type BorderWidthKey = keyof typeof borderWidth;
export type BorderStyleKey = keyof typeof borderStyle;
export type BorderColorKey = keyof typeof borderColor;
