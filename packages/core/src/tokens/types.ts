/**
 * Design Tokens Types
 * Type definitions for all design tokens
 */

export interface DesignTokens {
  colors: {
    // Primary colors
    primary: string;
    info: string;
    success: string;
    error: string;
    warning: string;

    // Background colors
    background: string;
    elevated: string;
    layout: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textQuaternary: string;

    // Border colors
    border: string;
    borderSecondary: string;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };

  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  components: {
    button: {
      height: number;
      borderRadius: number;
      fontWeight: number;
    };
    input: {
      height: number;
      borderRadius: number;
      fontSize: number;
    };
    card: {
      borderRadius: number;
      shadow: string;
    };
  };
}

export type TokenCategory = keyof DesignTokens;
