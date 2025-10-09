import type { DesignTokens } from './types';

/**
 * Slack Design Tokens
 * Based on Slack's design system
 */
export const slackTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#4A154B',
    info: '#1264A3',
    success: '#007A5A',
    error: '#E01E5A',
    warning: '#E8912D',

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
    xs: 3,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32,
    xxl: 48,
  },

  typography: {
    fontFamily: 'Lato, sans-serif',
    fontSize: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 15,
      xl: 18,
      xxl: 22,
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
    md: 4,
    lg: 8,
    xl: 12,
    full: 500,
  },

  shadows: {
    none: 'none',
    sm: '0 1px 0 rgba(0, 0, 0, 0.1)',
    md: '0 1px 4px rgba(0, 0, 0, 0.15)',
    lg: '0 2px 8px rgba(0, 0, 0, 0.15)',
    xl: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },

  components: {
    button: {
      height: 36,
      borderRadius: 4,
      fontWeight: 700,
    },
    input: {
      height: 36,
      borderRadius: 4,
      fontSize: 15,
    },
    card: {
      borderRadius: 8,
      shadow: '0 1px 0 rgba(0, 0, 0, 0.1)',
    },
  },
};
