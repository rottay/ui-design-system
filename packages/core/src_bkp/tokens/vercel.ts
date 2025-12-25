import type { DesignTokens } from './types';

/**
 * Vercel Design Tokens
 * Based on Vercel's design system
 */
export const vercelTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#000000',
    info: '#0070F3',
    success: '#0070F3',
    error: '#EE0000',
    warning: '#F5A623',

    // Background colors
    background: '#FAFAFA',
    elevated: '#FFFFFF',
    layout: '#FAFAFA',

    // Text colors
    text: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    textQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Border colors
    border: '#EAEAEA',
    borderSecondary: '#EAEAEA',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 26,
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
    sm: 3,
    md: 5,
    lg: 8,
    xl: 12,
    full: 50,
  },

  shadows: {
    none: 'none',
    sm: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.15)',
  },

  components: {
    button: {
      height: 40,
      borderRadius: 5,
      fontWeight: 500,
    },
    input: {
      height: 40,
      borderRadius: 5,
      fontSize: 14,
    },
    card: {
      borderRadius: 8,
      shadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    },
  },
};
