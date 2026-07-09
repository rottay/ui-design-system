/**
 * @fileoverview Typography token mirrors -- font families, sizes, weights, and composite text styles.
 *
 * Includes both atomic primitives (fontSize, fontWeight, lineHeight, letterSpacing)
 * and pre-composed text styles (display1, heading1-6, bodyLg-Xs, caption, label, code)
 * that bundle size + weight + lineHeight into a single reference object.
 */

// Font Families
export const fontFamily = {
  base: 'var(--ds-font-family-base)',
  heading: 'var(--ds-font-family-heading)',
  mono: 'var(--ds-font-family-mono)',
  display: 'var(--ds-font-family-display)',
} as const;

// Font Sizes
export const fontSize = {
  xs: 'var(--ds-font-size-xs)',
  sm: 'var(--ds-font-size-sm)',
  base: 'var(--ds-font-size-base)',
  md: 'var(--ds-font-size-md)',
  lg: 'var(--ds-font-size-lg)',
  xl: 'var(--ds-font-size-xl)',
  '2xl': 'var(--ds-font-size-2xl)',
  '3xl': 'var(--ds-font-size-3xl)',
  '4xl': 'var(--ds-font-size-4xl)',
  '5xl': 'var(--ds-font-size-5xl)',
  '6xl': 'var(--ds-font-size-6xl)',
  '7xl': 'var(--ds-font-size-7xl)',
  '8xl': 'var(--ds-font-size-8xl)',
  '9xl': 'var(--ds-font-size-9xl)',
} as const;

// Heading Sizes
export const fontSizeHeading = {
  h1: 'var(--ds-font-size-h1)',
  h2: 'var(--ds-font-size-h2)',
  h3: 'var(--ds-font-size-h3)',
  h4: 'var(--ds-font-size-h4)',
  h5: 'var(--ds-font-size-h5)',
  h6: 'var(--ds-font-size-h6)',
} as const;

// Font Weights
export const fontWeight = {
  thin: 'var(--ds-font-weight-thin)',
  extralight: 'var(--ds-font-weight-extralight)',
  light: 'var(--ds-font-weight-light)',
  normal: 'var(--ds-font-weight-normal)',
  medium: 'var(--ds-font-weight-medium)',
  semibold: 'var(--ds-font-weight-semibold)',
  bold: 'var(--ds-font-weight-bold)',
  extrabold: 'var(--ds-font-weight-extrabold)',
  black: 'var(--ds-font-weight-black)',
  // Semantic
  body: 'var(--ds-font-weight-body)',
  heading: 'var(--ds-font-weight-heading)',
  display: 'var(--ds-font-weight-display)',
} as const;

// Line Heights
export const lineHeight = {
  none: 'var(--ds-line-height-none)',
  tight: 'var(--ds-line-height-tight)',
  snug: 'var(--ds-line-height-snug)',
  normal: 'var(--ds-line-height-normal)',
  relaxed: 'var(--ds-line-height-relaxed)',
  loose: 'var(--ds-line-height-loose)',
  // Contextual
  body: 'var(--ds-line-height-body)',
  heading: 'var(--ds-line-height-heading)',
  display: 'var(--ds-line-height-display)',
} as const;

// Letter Spacing
export const letterSpacing = {
  tighter: 'var(--ds-letter-spacing-tighter)',
  tight: 'var(--ds-letter-spacing-tight)',
  normal: 'var(--ds-letter-spacing-normal)',
  wide: 'var(--ds-letter-spacing-wide)',
  wider: 'var(--ds-letter-spacing-wider)',
  widest: 'var(--ds-letter-spacing-widest)',
} as const;

// Text Transform
export const textTransform = {
  none: 'var(--ds-text-transform-none)',
  uppercase: 'var(--ds-text-transform-uppercase)',
  lowercase: 'var(--ds-text-transform-lowercase)',
  capitalize: 'var(--ds-text-transform-capitalize)',
} as const;

// Text Decoration
export const textDecoration = {
  none: 'var(--ds-text-decoration-none)',
  underline: 'var(--ds-text-decoration-underline)',
  lineThrough: 'var(--ds-text-decoration-line-through)',
} as const;

// Composite Text Styles
export const textStyles = {
  display1: {
    size: 'var(--ds-text-display-1-size)',
    weight: 'var(--ds-text-display-1-weight)',
    lineHeight: 'var(--ds-text-display-1-line-height)',
    letterSpacing: 'var(--ds-text-display-1-letter-spacing)',
  },
  display2: {
    size: 'var(--ds-text-display-2-size)',
    weight: 'var(--ds-text-display-2-weight)',
    lineHeight: 'var(--ds-text-display-2-line-height)',
    letterSpacing: 'var(--ds-text-display-2-letter-spacing)',
  },
  heading1: {
    size: 'var(--ds-text-heading-1-size)',
    weight: 'var(--ds-text-heading-1-weight)',
    lineHeight: 'var(--ds-text-heading-1-line-height)',
  },
  heading2: {
    size: 'var(--ds-text-heading-2-size)',
    weight: 'var(--ds-text-heading-2-weight)',
    lineHeight: 'var(--ds-text-heading-2-line-height)',
  },
  heading3: {
    size: 'var(--ds-text-heading-3-size)',
    weight: 'var(--ds-text-heading-3-weight)',
    lineHeight: 'var(--ds-text-heading-3-line-height)',
  },
  heading4: {
    size: 'var(--ds-text-heading-4-size)',
    weight: 'var(--ds-text-heading-4-weight)',
    lineHeight: 'var(--ds-text-heading-4-line-height)',
  },
  heading5: {
    size: 'var(--ds-text-heading-5-size)',
    weight: 'var(--ds-text-heading-5-weight)',
    lineHeight: 'var(--ds-text-heading-5-line-height)',
  },
  heading6: {
    size: 'var(--ds-text-heading-6-size)',
    weight: 'var(--ds-text-heading-6-weight)',
    lineHeight: 'var(--ds-text-heading-6-line-height)',
  },
  bodyLg: {
    size: 'var(--ds-text-body-lg-size)',
    weight: 'var(--ds-text-body-lg-weight)',
    lineHeight: 'var(--ds-text-body-lg-line-height)',
  },
  bodyMd: {
    size: 'var(--ds-text-body-md-size)',
    weight: 'var(--ds-text-body-md-weight)',
    lineHeight: 'var(--ds-text-body-md-line-height)',
  },
  bodySm: {
    size: 'var(--ds-text-body-sm-size)',
    weight: 'var(--ds-text-body-sm-weight)',
    lineHeight: 'var(--ds-text-body-sm-line-height)',
  },
  bodyXs: {
    size: 'var(--ds-text-body-xs-size)',
    weight: 'var(--ds-text-body-xs-weight)',
    lineHeight: 'var(--ds-text-body-xs-line-height)',
  },
  caption: {
    size: 'var(--ds-text-caption-size)',
    weight: 'var(--ds-text-caption-weight)',
    lineHeight: 'var(--ds-text-caption-line-height)',
    color: 'var(--ds-text-caption-color)',
  },
  label: {
    size: 'var(--ds-text-label-size)',
    weight: 'var(--ds-text-label-weight)',
    lineHeight: 'var(--ds-text-label-line-height)',
    letterSpacing: 'var(--ds-text-label-letter-spacing)',
  },
  code: {
    size: 'var(--ds-text-code-size)',
    weight: 'var(--ds-text-code-weight)',
    lineHeight: 'var(--ds-text-code-line-height)',
    family: 'var(--ds-text-code-family)',
  },
} as const;

// Micro-typography (WO-CRA-01) -- numeric figures and line wrapping.
// Consumers reference these tokens instead of inlining string literals.
export const numeric = {
  tabular: 'var(--ds-numeric-tabular)',
  proportional: 'var(--ds-numeric-proportional)',
} as const;

export const textWrap = {
  balance: 'var(--ds-text-wrap-balance)',
  pretty: 'var(--ds-text-wrap-pretty)',
} as const;

// Atomic references (named for direct consumption; see WO-CRA-01).
export const numericTabular = numeric.tabular;
export const numericProportional = numeric.proportional;
export const textWrapBalance = textWrap.balance;
export const textWrapPretty = textWrap.pretty;
export const hyphensAuto = 'var(--ds-hyphens-auto)';

/** Opt-in utility class that applies tabular figures (defined in typography.css). */
export const NUMS_TABULAR_CLASS = 'ds-nums-tabular';

// Combined typography export
export const typography = {
  fontFamily,
  fontSize,
  fontSizeHeading,
  fontWeight,
  lineHeight,
  letterSpacing,
  textTransform,
  textDecoration,
  textStyles,
  numeric,
  textWrap,
} as const;

// Type exports
export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
export type LineHeightKey = keyof typeof lineHeight;
export type LetterSpacingKey = keyof typeof letterSpacing;
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
/** Figure style for the Text primitive's `numeric` prop (WO-CRA-01). */
export type NumericFigures = 'tabular' | 'proportional';
