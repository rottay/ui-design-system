/**
 * Design token types
 */

/**
 * Color scale with 10 levels (50-900)
 * Used for semantic color categories that need background, text, and border variants
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface GlassTokens {
  blur: string;
  blurSm: string;
  blurLg: string;
  blurXl: string;
  bg: string;
  bgLight: string;
  bgHeavy: string;
  border: string;
  borderLight: string;
  borderHeavy: string;
}

export interface GradientTokens {
  primary: string;
  primarySoft: string;
  surface: string;
  dark: string;
  mesh: string;
}

export interface TransitionTokens {
  fast: string;
  normal: string;
  slow: string;
  slower: string;
  spring: string;
}

/**
 * Surface tokens control how containers look per engine.
 * Classic = bordered/structured, Modern = glass/gradient, Rustic = minimal
 */
export interface SurfaceTokens {
  /** Border width for containers ('0' for borderless, '1px' for bordered) */
  borderWidth: string;
  /** Border style ('none', 'solid') */
  borderStyle: string;
  /** Whether this engine uses gradient backgrounds */
  useGradients: boolean;
  /** Whether this engine uses glassmorphism effects */
  useGlass: boolean;
}

/**
 * Motion tokens control animation and transition behavior per engine.
 */
export interface MotionTokens {
  /** Hover transition timing (e.g. '150ms ease', '200ms cubic-bezier(...)') */
  hover: string;
  /** Transform applied on hover (e.g. 'none', 'translateY(-1px)') */
  transform: string;
  /** Animation easing type ('ease', 'spring') */
  spring: string;
  /** Duration multiplier for entry animations */
  durationScale: number;
}

export interface OverlayTokens {
  /** Light dark overlay - modals, dropdowns (opacity ~0.3) */
  light: string;
  /** Medium dark overlay - modal backdrops (opacity ~0.5) */
  medium: string;
  /** Heavy dark overlay - image overlays, dark backdrops (opacity ~0.7) */
  heavy: string;
  /** Light white overlay - frosted panels (opacity ~0.9) */
  white: string;
  /** Medium white overlay (opacity ~0.5) */
  whiteMedium: string;
  /** Subtle white overlay (opacity ~0.2) */
  whiteLight: string;
}

export interface DesignTokens {
  colors: {
    /** Primary brand color (single value from tenant branding) */
    primary: string;
    /** Full primary color scale for backgrounds, borders, text variants */
    primaryScale: ColorScale;
    /** Secondary accent color (single value from tenant branding) */
    secondary: string;
    /** Full secondary color scale */
    secondaryScale: ColorScale;
    /** Neutral gray scale */
    neutral: ColorScale;
    /** Success color (single value, backwards compatible) */
    success: string;
    /** Full success color scale */
    successScale: ColorScale;
    /** Warning color (single value, backwards compatible) */
    warning: string;
    /** Full warning color scale */
    warningScale: ColorScale;
    /** Error color (single value, backwards compatible) */
    error: string;
    /** Full error color scale */
    errorScale: ColorScale;
    /** Info color (single value, backwards compatible) */
    info: string;
    /** Full info color scale */
    infoScale: ColorScale;
    /** Common colors */
    common: {
      white: string;
      black: string;
    };
  };
  spacing: number[];
  typography: {
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
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
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  /** Glassmorphism tokens for frosted glass effects */
  glass?: GlassTokens;
  /** Gradient presets */
  gradients?: GradientTokens;
  /** Transition timing presets */
  transitions?: TransitionTokens;
  /** Surface tokens - container appearance per engine */
  surface: SurfaceTokens;
  /** Motion tokens - animation behavior per engine */
  motion: MotionTokens;
  /** Overlay tokens for backdrops, modals, and translucent surfaces */
  overlay?: OverlayTokens;
}
