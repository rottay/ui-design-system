import type { DesignTokens } from './types';

/**
 * Airbnb Design Tokens
 * Based on Airbnb's design system
 */
export const airbnbTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#FF5A5F',
    info: '#008489',
    success: '#00A699',
    error: '#FF5A5F',
    warning: '#F5A623',

    // Background colors
    background: '#FFFFFF',
    elevated: '#FFFFFF',
    layout: '#FFFFFF',

    // Text colors
    text: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    textQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Border colors
    border: '#D9D9D9',
    borderSecondary: '#DDDDDD',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 28,
    xl: 32,
    xxl: 48,
  },

  typography: {
    fontFamily: 'Circular, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    fontSize: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 28,
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
    md: 8,
    lg: 12,
    xl: 16,
    full: 50,
  },

  shadows: {
    none: 'none',
    sm: '0 2px 4px rgba(0, 0, 0, 0.18)',
    md: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    lg: '0 6px 16px 0 rgba(0, 0, 0, 0.18)',
    xl: '0 12px 32px 0 rgba(0, 0, 0, 0.2)',
  },

  components: {
    button: {
      height: 48,
      borderRadius: 8,
      fontWeight: 600,
    },
    input: {
      height: 48,
      borderRadius: 8,
      fontSize: 16,
    },
    card: {
      borderRadius: 12,
      shadow: '0 2px 4px rgba(0, 0, 0, 0.18)',
    },
  },
};
