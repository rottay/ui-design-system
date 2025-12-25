import type { DesignTokens } from './types';

/**
 * Stripe Design Tokens
 * Based on Stripe's design system
 */
export const stripeTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#635BFF',
    info: '#635BFF',
    success: '#00D924',
    error: '#DF1B41',
    warning: '#F5A623',

    // Background colors
    background: '#FFFFFF',
    elevated: '#FFFFFF',
    layout: '#FAFAFA',

    // Text colors
    text: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    textQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Border colors
    border: '#D9D9D9',
    borderSecondary: '#F0F0F0',
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
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
    sm: 2,
    md: 6,
    lg: 8,
    xl: 12,
    full: 500,
  },

  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px 0 rgba(0, 0, 0, 0.15)',
    lg: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
    xl: '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
  },

  components: {
    button: {
      height: 40,
      borderRadius: 6,
      fontWeight: 600,
    },
    input: {
      height: 40,
      borderRadius: 6,
      fontSize: 14,
    },
    card: {
      borderRadius: 8,
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
  },
};
