import type { DesignTokens } from './types';

/**
 * Spotify Design Tokens
 * Based on Spotify's design system
 */
export const spotifyTokens: DesignTokens = {
  colors: {
    // Primary colors
    primary: '#1DB954',
    info: '#509BF5',
    success: '#1DB954',
    error: '#E22134',
    warning: '#FFA500',

    // Background colors
    background: '#121212',
    elevated: '#181818',
    layout: '#000000',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#6A6A6A',
    textQuaternary: '#535353',

    // Border colors
    border: '#282828',
    borderSecondary: '#404040',
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
    fontFamily: 'Circular Std, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
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
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 500,
  },

  shadows: {
    none: 'none',
    sm: '0 2px 8px rgba(0, 0, 0, 0.5)',
    md: '0 4px 16px rgba(0, 0, 0, 0.6)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.7)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.8)',
  },

  components: {
    button: {
      height: 48,
      borderRadius: 500,
      fontWeight: 700,
    },
    input: {
      height: 40,
      borderRadius: 4,
      fontSize: 14,
    },
    card: {
      borderRadius: 8,
      shadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    },
  },
};
