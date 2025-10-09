import type { DesignTokens } from './types';

/**
 * Notion Design Tokens
 * Based on Notion's design system
 */
export const notionTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#000000',
    info: '#0B6E99',
    success: '#0F7B6C',
    error: '#EB5757',
    warning: '#FFA344',

    // Background colors
    background: '#FFFFFF',
    elevated: '#FFFFFF',
    layout: '#FBFBFA',

    // Text colors
    text: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    textQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Border colors
    border: '#E3E2E0',
    borderSecondary: '#E3E2E0',
  },

  spacing: {
    xs: 3,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 32,
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
    fontSize: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
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
    sm: 3,
    md: 3,
    lg: 6,
    xl: 8,
    full: 500,
  },

  shadows: {
    none: 'none',
    sm: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px',
    md: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
    lg: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
    xl: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 5px 10px',
  },

  components: {
    button: {
      height: 32,
      borderRadius: 3,
      fontWeight: 500,
    },
    input: {
      height: 32,
      borderRadius: 3,
      fontSize: 14,
    },
    card: {
      borderRadius: 3,
      shadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px',
    },
  },
};
