/**
 * Typography Tokens - TypeScript Mirror
 *
 * TypeScript representation of typography CSS custom properties.
 * Use these for type-safe typography references in JavaScript/TypeScript.
 */

// Font Families
export const fontFamily = {
  base: 'var(--font-family-base)',
  heading: 'var(--font-family-heading)',
  mono: 'var(--font-family-mono)',
  display: 'var(--font-family-display)',
} as const;

// Font Sizes
export const fontSize = {
  xs: 'var(--font-size-xs)',
  sm: 'var(--font-size-sm)',
  base: 'var(--font-size-base)',
  md: 'var(--font-size-md)',
  lg: 'var(--font-size-lg)',
  xl: 'var(--font-size-xl)',
  '2xl': 'var(--font-size-2xl)',
  '3xl': 'var(--font-size-3xl)',
  '4xl': 'var(--font-size-4xl)',
  '5xl': 'var(--font-size-5xl)',
  '6xl': 'var(--font-size-6xl)',
  '7xl': 'var(--font-size-7xl)',
  '8xl': 'var(--font-size-8xl)',
  '9xl': 'var(--font-size-9xl)',
} as const;

// Heading Sizes
export const fontSizeHeading = {
  h1: 'var(--font-size-h1)',
  h2: 'var(--font-size-h2)',
  h3: 'var(--font-size-h3)',
  h4: 'var(--font-size-h4)',
  h5: 'var(--font-size-h5)',
  h6: 'var(--font-size-h6)',
} as const;

// Font Weights
export const fontWeight = {
  thin: 'var(--font-weight-thin)',
  extralight: 'var(--font-weight-extralight)',
  light: 'var(--font-weight-light)',
  normal: 'var(--font-weight-normal)',
  medium: 'var(--font-weight-medium)',
  semibold: 'var(--font-weight-semibold)',
  bold: 'var(--font-weight-bold)',
  extrabold: 'var(--font-weight-extrabold)',
  black: 'var(--font-weight-black)',
  // Semantic
  body: 'var(--font-weight-body)',
  heading: 'var(--font-weight-heading)',
  display: 'var(--font-weight-display)',
} as const;

// Line Heights
export const lineHeight = {
  none: 'var(--line-height-none)',
  tight: 'var(--line-height-tight)',
  snug: 'var(--line-height-snug)',
  normal: 'var(--line-height-normal)',
  relaxed: 'var(--line-height-relaxed)',
  loose: 'var(--line-height-loose)',
  // Contextual
  body: 'var(--line-height-body)',
  heading: 'var(--line-height-heading)',
  display: 'var(--line-height-display)',
} as const;

// Letter Spacing
export const letterSpacing = {
  tighter: 'var(--letter-spacing-tighter)',
  tight: 'var(--letter-spacing-tight)',
  normal: 'var(--letter-spacing-normal)',
  wide: 'var(--letter-spacing-wide)',
  wider: 'var(--letter-spacing-wider)',
  widest: 'var(--letter-spacing-widest)',
} as const;

// Text Transform
export const textTransform = {
  none: 'var(--text-transform-none)',
  uppercase: 'var(--text-transform-uppercase)',
  lowercase: 'var(--text-transform-lowercase)',
  capitalize: 'var(--text-transform-capitalize)',
} as const;

// Text Decoration
export const textDecoration = {
  none: 'var(--text-decoration-none)',
  underline: 'var(--text-decoration-underline)',
  lineThrough: 'var(--text-decoration-line-through)',
} as const;

// Composite Text Styles
export const textStyles = {
  display1: {
    size: 'var(--text-display-1-size)',
    weight: 'var(--text-display-1-weight)',
    lineHeight: 'var(--text-display-1-line-height)',
    letterSpacing: 'var(--text-display-1-letter-spacing)',
  },
  display2: {
    size: 'var(--text-display-2-size)',
    weight: 'var(--text-display-2-weight)',
    lineHeight: 'var(--text-display-2-line-height)',
    letterSpacing: 'var(--text-display-2-letter-spacing)',
  },
  heading1: {
    size: 'var(--text-heading-1-size)',
    weight: 'var(--text-heading-1-weight)',
    lineHeight: 'var(--text-heading-1-line-height)',
  },
  heading2: {
    size: 'var(--text-heading-2-size)',
    weight: 'var(--text-heading-2-weight)',
    lineHeight: 'var(--text-heading-2-line-height)',
  },
  heading3: {
    size: 'var(--text-heading-3-size)',
    weight: 'var(--text-heading-3-weight)',
    lineHeight: 'var(--text-heading-3-line-height)',
  },
  heading4: {
    size: 'var(--text-heading-4-size)',
    weight: 'var(--text-heading-4-weight)',
    lineHeight: 'var(--text-heading-4-line-height)',
  },
  heading5: {
    size: 'var(--text-heading-5-size)',
    weight: 'var(--text-heading-5-weight)',
    lineHeight: 'var(--text-heading-5-line-height)',
  },
  heading6: {
    size: 'var(--text-heading-6-size)',
    weight: 'var(--text-heading-6-weight)',
    lineHeight: 'var(--text-heading-6-line-height)',
  },
  bodyLg: {
    size: 'var(--text-body-lg-size)',
    weight: 'var(--text-body-lg-weight)',
    lineHeight: 'var(--text-body-lg-line-height)',
  },
  bodyMd: {
    size: 'var(--text-body-md-size)',
    weight: 'var(--text-body-md-weight)',
    lineHeight: 'var(--text-body-md-line-height)',
  },
  bodySm: {
    size: 'var(--text-body-sm-size)',
    weight: 'var(--text-body-sm-weight)',
    lineHeight: 'var(--text-body-sm-line-height)',
  },
  bodyXs: {
    size: 'var(--text-body-xs-size)',
    weight: 'var(--text-body-xs-weight)',
    lineHeight: 'var(--text-body-xs-line-height)',
  },
  caption: {
    size: 'var(--text-caption-size)',
    weight: 'var(--text-caption-weight)',
    lineHeight: 'var(--text-caption-line-height)',
    color: 'var(--text-caption-color)',
  },
  label: {
    size: 'var(--text-label-size)',
    weight: 'var(--text-label-weight)',
    lineHeight: 'var(--text-label-line-height)',
    letterSpacing: 'var(--text-label-letter-spacing)',
  },
  code: {
    size: 'var(--text-code-size)',
    weight: 'var(--text-code-weight)',
    lineHeight: 'var(--text-code-line-height)',
    family: 'var(--text-code-family)',
  },
} as const;

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
} as const;

// Type exports
export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
export type LineHeightKey = keyof typeof lineHeight;
export type LetterSpacingKey = keyof typeof letterSpacing;
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
