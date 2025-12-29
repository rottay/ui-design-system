/**
 * Border Tokens - TypeScript Mirror
 *
 * TypeScript representation of border CSS custom properties.
 * Use these for type-safe border references in JavaScript/TypeScript.
 */

// Border Widths
export const borderWidth = {
  0: 'var(--border-width-0)',
  1: 'var(--border-width-1)',
  2: 'var(--border-width-2)',
  4: 'var(--border-width-4)',
  8: 'var(--border-width-8)',
  // Semantic
  none: 'var(--border-width-none)',
  thin: 'var(--border-width-thin)',
  default: 'var(--border-width-default)',
  medium: 'var(--border-width-medium)',
  thick: 'var(--border-width-thick)',
} as const;

// Border Radius
export const radius = {
  none: 'var(--radius-none)',
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  '3xl': 'var(--radius-3xl)',
  full: 'var(--radius-full)',
  // Component-specific
  button: 'var(--radius-button)',
  input: 'var(--radius-input)',
  card: 'var(--radius-card)',
  modal: 'var(--radius-modal)',
  badge: 'var(--radius-badge)',
  avatar: 'var(--radius-avatar)',
} as const;

// Border Styles
export const borderStyle = {
  none: 'var(--border-style-none)',
  solid: 'var(--border-style-solid)',
  dashed: 'var(--border-style-dashed)',
  dotted: 'var(--border-style-dotted)',
  double: 'var(--border-style-double)',
} as const;

// Border Colors
export const borderColor = {
  default: 'var(--border-color-default)',
  muted: 'var(--border-color-muted)',
  strong: 'var(--border-color-strong)',
  // Interactive
  hover: 'var(--border-color-hover)',
  focus: 'var(--border-color-focus)',
  active: 'var(--border-color-active)',
  // Semantic
  primary: 'var(--border-color-primary)',
  secondary: 'var(--border-color-secondary)',
  success: 'var(--border-color-success)',
  warning: 'var(--border-color-warning)',
  error: 'var(--border-color-error)',
  info: 'var(--border-color-info)',
  // Utility
  transparent: 'var(--border-color-transparent)',
} as const;

// Divider
export const divider = {
  width: 'var(--divider-width)',
  color: 'var(--divider-color)',
  style: 'var(--divider-style)',
  spacing: {
    sm: 'var(--divider-spacing-sm)',
    md: 'var(--divider-spacing-md)',
    lg: 'var(--divider-spacing-lg)',
  },
} as const;

// Outline
export const outline = {
  width: 'var(--outline-width)',
  offset: 'var(--outline-offset)',
  style: 'var(--outline-style)',
  color: {
    default: 'var(--outline-color-default)',
    error: 'var(--outline-color-error)',
  },
} as const;

// Composite Borders
export const border = {
  default: 'var(--border-default)',
  muted: 'var(--border-muted)',
  strong: 'var(--border-strong)',
  hover: 'var(--border-hover)',
  focus: 'var(--border-focus)',
  // Semantic
  primary: 'var(--border-primary)',
  secondary: 'var(--border-secondary)',
  success: 'var(--border-success)',
  warning: 'var(--border-warning)',
  error: 'var(--border-error)',
  info: 'var(--border-info)',
  // Variants
  dashed: 'var(--border-dashed)',
  dashedMuted: 'var(--border-dashed-muted)',
  transparent: 'var(--border-transparent)',
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
