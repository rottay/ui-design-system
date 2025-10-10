/**
 * Typography Tokens
 * Font families, sizes, weights, line heights, and letter spacing
 */

// ==================== Font Families ====================
export const fontFamily = {
  // System defaults
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: '"JetBrains Mono", Consolas, Monaco, "Courier New", monospace',

  // Theme-specific
  spotify: '"Circular Std", -apple-system, BlinkMacSystemFont, sans-serif',
  stripe: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  airbnb: '"Cereal", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  slack: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  notion: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  linear: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  vercel: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const;

// ==================== Font Sizes ====================
export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
} as const;

// ==================== Font Weights ====================
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ==================== Line Heights ====================
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
  // Specific values
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
} as const;

// ==================== Letter Spacing ====================
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// ==================== Text Styles (Presets) ====================
export const textStyles = {
  // Headings
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Body text
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },

  // Special
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  button: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.normal,
  },
  link: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    textDecoration: 'underline' as const,
  },
} as const;

// ==================== Responsive Typography Scale ====================
export const responsiveText = {
  display: {
    mobile: fontSize['4xl'],
    tablet: fontSize['5xl'],
    desktop: fontSize['6xl'],
  },
  heading: {
    mobile: fontSize['2xl'],
    tablet: fontSize['3xl'],
    desktop: fontSize['4xl'],
  },
  title: {
    mobile: fontSize.xl,
    tablet: fontSize['2xl'],
    desktop: fontSize['3xl'],
  },
  body: {
    mobile: fontSize.sm,
    tablet: fontSize.base,
    desktop: fontSize.base,
  },
} as const;

// ==================== Utility Functions ====================

/**
 * Get font family for a specific theme
 */
export function getThemeFontFamily(theme: keyof typeof fontFamily): string {
  return fontFamily[theme] || fontFamily.base;
}

/**
 * Create text style object
 */
export function createTextStyle(
  size: keyof typeof fontSize,
  weight: keyof typeof fontWeight,
  lineHeightValue?: keyof typeof lineHeight,
  letterSpacingValue?: keyof typeof letterSpacing
) {
  return {
    fontSize: fontSize[size],
    fontWeight: fontWeight[weight],
    lineHeight: lineHeightValue ? lineHeight[lineHeightValue] : lineHeight.normal,
    letterSpacing: letterSpacingValue ? letterSpacing[letterSpacingValue] : letterSpacing.normal,
  };
}

// ==================== Type Exports ====================
export type FontFamilyKey = keyof typeof fontFamily;
export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
export type LineHeightKey = keyof typeof lineHeight;
export type LetterSpacingKey = keyof typeof letterSpacing;
export type TextStyleKey = keyof typeof textStyles;
export type TextStyle = typeof textStyles[TextStyleKey];
