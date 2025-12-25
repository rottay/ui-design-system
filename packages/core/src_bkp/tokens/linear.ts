import type { DesignTokens } from './types';

/**
 * Linear Design Tokens
 * Based on Linear's design system
 */
export const linearTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#5E6AD2',
    info: '#5E6AD2',
    success: '#26B5CE',
    error: '#EE5A6F',
    warning: '#F2994A',

    // Background colors
    background: '#FFFFFF',
    elevated: '#FFFFFF',
    layout: '#F9FAFB',

    // Text colors
    text: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    textQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Border colors
    border: '#E5E7EB',
    borderSecondary: '#E5E7EB',
  },

  spacing: {
    xs: 3,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      xs: 11,
      sm: 12,
      md: 13,
      lg: 14,
      xl: 16,
      xxl: 20,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 500,
  },

  shadows: {
    none: 'none',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },

  components: {
    button: {
      height: 32,
      borderRadius: 6,
      fontWeight: 500,
    },
    input: {
      height: 32,
      borderRadius: 6,
      fontSize: 14,
    },
    card: {
      borderRadius: 8,
      shadow: 'none',
    },
  },
};
